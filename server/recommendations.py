"""
HireStreamAI — Job Recommendations API Routes
===============================================
Endpoints:
  POST /recommend-jobs    — Get personalised job recommendations for a candidate
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from parser import ResumeParser
from recommender import JobRecommender

router = APIRouter()

_parser      = ResumeParser()
_recommender = JobRecommender()


class RecommendRequest(BaseModel):
    resume_text: str
    top_n:       int = 5
    job_pool:    Optional[list[dict]] = None  # Custom jobs; uses default pool if None


@router.post("/recommend-jobs", summary="Get AI job recommendations for a candidate")
async def recommend_jobs(request: RecommendRequest):
    """
    Given a resume, return the top-N best-fit jobs with match percentage.

    Body:
      - resume_text: raw resume text
      - top_n: number of recommendations to return (default 5)
      - job_pool: (optional) custom list of job dicts to match against

    Returns list of jobs sorted by match percentage.

    Example job dict in job_pool:
    ```json
    {
      "id": "j001",
      "title": "ML Engineer",
      "company": "TechCorp",
      "description": "...",
      "required_skills": ["python", "tensorflow"],
      "location": "Bangalore"
    }
    ```
    """
    profile = _parser.parse(request.resume_text)
    recommendations = _recommender.recommend(
        candidate_profile=profile,
        job_pool=request.job_pool,
        top_n=request.top_n,
    )

    return {
        "candidate":        profile["name"],
        "total_jobs_found": len(recommendations),
        "recommendations":  recommendations,
    }
