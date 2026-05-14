from pydantic import BaseModel
from typing import List, Optional, Any

class ResumeParseRequest(BaseModel):
    filename: str
    content: str

class MatchRequest(BaseModel):
    resume_text: str
    job_description: str

class Job(BaseModel):
    id: str
    title: str
    description: str

class RecommendRequest(BaseModel):
    resume_text: str
    jobs: List[Job]
    top_n: Optional[int] = 5

class Candidate(BaseModel):
    id: str
    name: str
    resume_text: str

class RankRequest(BaseModel):
    job_description: str
    candidates: List[Candidate]

class ATSResponse(BaseModel):
    ats_score: float
    semantic_similarity: float
    skill_match_percentage: float
    matched_skills: List[str]

class SkillGapResponse(BaseModel):
    required_skills: List[str]
    candidate_skills: List[str]
    missing_skills: List[str]
    additional_skills: List[str]

class JobMatchResult(BaseModel):
    job_id: str
    job_title: str
    match_score: float
    score_details: ATSResponse

class CandidateRankResult(BaseModel):
    candidate_id: str
    candidate_name: str
    ats_score: float
    score_details: ATSResponse
