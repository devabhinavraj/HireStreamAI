from fastapi import APIRouter, UploadFile, File
from .schemas import (
    MatchRequest, ATSResponse, SkillGapResponse, 
    RecommendRequest, JobMatchResult, RankRequest, CandidateRankResult
)
from ml_pipeline.parser import parse_resume
from ml_pipeline.scorer import compute_ats_score
from ml_pipeline.skill_gap import analyze_skill_gap
from ml_pipeline.recommender import recommend_jobs, rank_candidates

router = APIRouter()

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Parses a PDF or DOCX resume and returns extracted text and entities.
    """
    content = await file.read()
    parsed_data = parse_resume(content, file.filename)
    return {"filename": file.filename, "extracted_data": parsed_data}

@router.post("/analyze", response_model=ATSResponse)
def analyze_resume_vs_jd(request: MatchRequest):
    """
    Calculates ATS score for a candidate resume against a single Job Description.
    """
    score = compute_ats_score(request.resume_text, request.job_description)
    return score

@router.post("/skill-gap", response_model=SkillGapResponse)
def get_skill_gap(request: MatchRequest):
    """
    Identifies missing skills required by the Job Description.
    """
    gap = analyze_skill_gap(request.resume_text, request.job_description)
    return gap

@router.post("/match-job", response_model=list[JobMatchResult])
def match_jobs(request: RecommendRequest):
    """
    Recommends top jobs from a list of jobs based on the candidate's resume.
    """
    jobs_dict = [{"id": j.id, "title": j.title, "description": j.description} for j in request.jobs]
    matches = recommend_jobs(request.resume_text, jobs_dict, request.top_n)
    return matches

@router.post("/rank-candidates", response_model=list[CandidateRankResult])
def get_ranked_candidates(request: RankRequest):
    """
    Ranks multiple candidates against a single Job Description.
    """
    candidates_dict = [{"id": c.id, "name": c.name, "resume_text": c.resume_text} for c in request.candidates]
    ranked = rank_candidates(request.job_description, candidates_dict)
    return ranked
