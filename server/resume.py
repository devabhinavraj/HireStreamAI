from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Query
from typing import Optional, List
from loguru import logger
from datetime import datetime
import os
import shutil

from parser import ResumeParser
from scorer import ATSScorer
from skill_gap import SkillGapAnalyzer
from helpers import extract_text_from_bytes
from config import settings
from database import db
from models import Resume, UserInDB, PyObjectId
from auth import get_current_user, log_activity

router = APIRouter(prefix="/resumes", tags=["Resumes"])

# ── Shared ML instances ───────────────────────────────────────────────────────
_parser    = ResumeParser()
_scorer    = ATSScorer()
_skill_gap = SkillGapAnalyzer()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload", response_model=Resume)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {settings.ALLOWED_EXTENSIONS}")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large.")

    try:
        text = extract_text_from_bytes(contents, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract text: {e}")

    # Save file locally
    timestamp = int(datetime.utcnow().timestamp())
    filename = f"{current_user.id}_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Parse and Score
    profile = _parser.parse(text)
    
    # We use a default JD for initial scoring or just save the extracted skills
    ats_result = _scorer.score(
        candidate_profile=profile,
        job_description="Sample Job Description for initial scoring", # Placeholder or could be passed
    )

    new_resume = {
        "userId": str(current_user.id),
        "fileName": file.filename,
        "fileUrl": file_path,
        "fileType": ext,
        "atsScore": ats_result["ats_score"],
        "parsedText": text,
        "skills": profile["skills"],
        "recommendations": ats_result.get("recommendations", []),
        "createdAt": datetime.utcnow()
    }

    result = await db.db.resumes.insert_one(new_resume)
    new_resume["_id"] = result.inserted_id

    # Update user stats
    user_resumes = await db.db.resumes.find({"userId": str(current_user.id)}).to_list(None)
    total_score = sum(r["atsScore"] for r in user_resumes)
    avg_score = total_score / len(user_resumes) if user_resumes else 0

    await db.db.users.update_one(
        {"_id": current_user.id},
        {
            "$inc": {"resumeCount": 1},
            "$set": {"atsAverageScore": avg_score, "updatedAt": datetime.utcnow()}
        }
    )

    await log_activity(current_user.id, "upload", f"Uploaded resume: {file.filename}")

    return Resume(**new_resume)

@router.get("/history", response_model=List[Resume])
async def get_resume_history(
    current_user: UserInDB = Depends(get_current_user),
    limit: int = Query(10, ge=1)
):
    resumes = await db.db.resumes.find({"userId": str(current_user.id)}).sort("createdAt", -1).to_list(limit)
    return resumes

@router.get("/{resume_id}", response_model=Resume)
async def get_resume_details(
    resume_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    resume = await db.db.resumes.find_one({"_id": PyObjectId(resume_id), "userId": str(current_user.id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return Resume(**resume)

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    resume = await db.db.resumes.find_one({"_id": PyObjectId(resume_id), "userId": str(current_user.id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete file
    if os.path.exists(resume["fileUrl"]):
        os.remove(resume["fileUrl"])
    
    await db.db.resumes.delete_one({"_id": PyObjectId(resume_id)})
    
    # Update count
    await db.db.users.update_one(
        {"_id": current_user.id},
        {"$inc": {"resumeCount": -1}}
    )
    
    await log_activity(current_user.id, "delete", f"Deleted resume: {resume['fileName']}")
    
    return {"message": "Resume deleted successfully"}
