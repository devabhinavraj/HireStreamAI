"""
HireStreamAI — Matching & Ranking API Routes
==============================================
Endpoints:
  POST /match-job         — Match a single resume to a JD
  POST /rank-candidates   — Rank multiple resumes for one JD
  POST /skill-gap         — Standalone skill gap analysis
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from loguru import logger

from parser import ResumeParser
from ranker import CandidateRanker
from scorer import ATSScorer
from skill_gap import SkillGapAnalyzer

router = APIRouter()

_parser    = ResumeParser()
_ranker    = CandidateRanker()
_scorer    = ATSScorer()
_skill_gap = SkillGapAnalyzer()


# ── Models ────────────────────────────────────────────────────────────────────

class MatchJobRequest(BaseModel):
    resume_text:               str
    job_description:           str
    required_experience_years: int = 0
    required_education_level:  str = "bachelor"

class RankRequest(BaseModel):
    resumes: list[str]             # List of raw resume texts
    job_description: str
    required_skills:           Optional[list[str]] = None
    required_experience_years: int = 0
    required_education_level:  str = "bachelor"
    top_n:                     int = 10

class SkillGapRequest(BaseModel):
    candidate_skills:    list[str]
    required_skills:     list[str]
    nice_to_have_skills: Optional[list[str]] = None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/match-job", summary="Match resume to a job description")
async def match_job(request: MatchJobRequest):
    """
    Compute ATS score and semantic match percentage between
    a resume and a job description.
    """
    profile = _parser.parse(request.resume_text)
    ats = _scorer.score(
        candidate_profile=profile,
        job_description=request.job_description,
        required_experience_years=request.required_experience_years,
        required_education_level=request.required_education_level,
    )
    return {
        "candidate":        profile["name"],
        "ats_score":        ats["ats_score"],
        "ats_grade":        ats["ats_grade"],
        "match_percentage": ats["match_percentage"],
        "component_scores": ats["component_scores"],
        "matched_skills":   ats["matched_skills"],
        "missing_skills":   ats["missing_skills"],
    }


@router.post("/rank-candidates", summary="Rank multiple candidates for a job")
async def rank_candidates(request: RankRequest):
    """
    Upload multiple resume texts and rank all candidates for a single job.

    Body:
      - resumes: list of raw resume text strings (max 50)
      - job_description: job description text
      - top_n: how many top candidates to return

    Returns ranked leaderboard with ATS scores.
    """
    if len(request.resumes) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 resumes per batch.")

    # Parse all resumes
    profiles = [_parser.parse(text) for text in request.resumes]

    # Rank
    ranked = _ranker.rank(
        candidates=profiles,
        job_description=request.job_description,
        required_skills=request.required_skills,
        required_experience_years=request.required_experience_years,
        required_education_level=request.required_education_level,
    )

    leaderboard_text = _ranker.generate_leaderboard(ranked[:request.top_n])
    logger.info(f"Ranked {len(profiles)} candidates. Top: {ranked[0]['candidate_name']}")

    return {
        "total_candidates": len(profiles),
        "top_n_shown":      min(request.top_n, len(ranked)),
        "ranked_candidates": ranked[:request.top_n],
        "leaderboard_text":  leaderboard_text,
    }


@router.post("/skill-gap", summary="Skill gap analysis")
async def skill_gap(request: SkillGapRequest):
    """
    Compare candidate skills vs required skills and return:
      - Missing required skills
      - Skill coverage %
      - Prioritised gaps
      - Learning resource suggestions
    """
    if not request.candidate_skills:
        raise HTTPException(status_code=400, detail="candidate_skills cannot be empty.")
    if not request.required_skills:
        raise HTTPException(status_code=400, detail="required_skills cannot be empty.")

    report = _skill_gap.analyze(
        candidate_skills=request.candidate_skills,
        required_skills=request.required_skills,
        nice_to_have_skills=request.nice_to_have_skills,
    )
    return report
