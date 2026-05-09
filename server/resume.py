"""
HireStreamAI — Resume API Routes
==================================
Endpoints:
  POST /upload-resume   — Upload & parse a resume file
  POST /analyze         — Full ATS analysis of resume vs JD
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import Optional
from loguru import logger

from parser import ResumeParser
from scorer import ATSScorer
from skill_gap import SkillGapAnalyzer
from helpers import extract_text_from_bytes
from config import settings

router = APIRouter()

# ── Shared ML instances (loaded once at startup) ──────────────────────────────
_parser    = ResumeParser()
_scorer    = ATSScorer()
_skill_gap = SkillGapAnalyzer()


# ── Request / Response Models ─────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    resume_text:               str
    job_description:           str
    required_skills:           Optional[list[str]] = None
    required_experience_years: int = 0
    required_education_level:  str = "bachelor"

class AnalyzeResponse(BaseModel):
    candidate_name:    str
    email:             Optional[str]
    extracted_skills:  list[str]
    experience_years:  int
    education:         list[str]
    ats_score:         float
    ats_grade:         str
    match_percentage:  float
    component_scores:  dict
    matched_skills:    list[str]
    missing_skills:    list[str]
    skill_gap_report:  dict


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/upload-resume", summary="Upload and parse a resume file")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a resume (PDF / DOCX / TXT) and receive a structured candidate profile.

    Returns extracted: name, email, phone, skills, education, experience, projects, certifications.
    """
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large.")

    try:
        text = extract_text_from_bytes(contents, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract text: {e}")

    if not text.strip():
        raise HTTPException(status_code=422, detail="Resume appears empty or unreadable.")

    profile = _parser.parse(text)
    logger.info(f"Parsed resume: {profile['name']}")

    return {
        "status":         "success",
        "filename":       file.filename,
        "candidate":      profile,
    }


@router.post("/analyze", response_model=AnalyzeResponse, summary="Full ATS analysis")
async def analyze(request: AnalyzeRequest):
    """
    Parse resume text, compute ATS score against a job description,
    and generate a skill gap report — all in one call.

    Body:
      - resume_text: Raw resume text
      - job_description: Job description text
      - required_skills: (optional) explicit required skills
      - required_experience_years: (optional) minimum experience
      - required_education_level: (optional) "bachelor", "master", etc.
    """
    # Parse
    profile = _parser.parse(request.resume_text)

    # Score
    ats_result = _scorer.score(
        candidate_profile=profile,
        job_description=request.job_description,
        required_skills=request.required_skills,
        required_experience_years=request.required_experience_years,
        required_education_level=request.required_education_level,
    )

    # Skill gap
    gap_report = _skill_gap.analyze(
        candidate_skills=profile["skills"],
        required_skills=ats_result["required_skills"],
    )

    return AnalyzeResponse(
        candidate_name=   profile["name"],
        email=            profile.get("email"),
        extracted_skills= profile["skills"],
        experience_years= profile["experience_years"],
        education=        profile["education"],
        ats_score=        ats_result["ats_score"],
        ats_grade=        ats_result["ats_grade"],
        match_percentage= ats_result["match_percentage"],
        component_scores= ats_result["component_scores"],
        matched_skills=   ats_result["matched_skills"],
        missing_skills=   ats_result["missing_skills"],
        skill_gap_report= gap_report,
    )
