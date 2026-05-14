from .matcher import calculate_similarity
from .preprocessing import preprocess_text
from .parser import COMMON_SKILLS
import re

def extract_skills_from_text(text: str) -> list[str]:
    text_lower = text.lower()
    words = set(re.findall(r'\b[a-z0-9+#-]+\b', text_lower))
    return list(COMMON_SKILLS.intersection(words))

def compute_ats_score(resume_text: str, jd_text: str) -> dict:
    """
    Computes a composite ATS score based on Semantic Similarity and Keyword Matching.
    """
    # 1. Semantic Similarity (Weight: 60%)
    processed_resume = preprocess_text(resume_text)
    processed_jd = preprocess_text(jd_text)
    
    semantic_score = calculate_similarity(processed_resume, processed_jd)
    
    # 2. Skill/Keyword Matching (Weight: 40%)
    resume_skills = set(extract_skills_from_text(resume_text))
    jd_skills = set(extract_skills_from_text(jd_text))
    
    if len(jd_skills) > 0:
        matching_skills = resume_skills.intersection(jd_skills)
        skill_score = len(matching_skills) / len(jd_skills)
    else:
        skill_score = 0.0 # If JD has no recognized skills, fallback to 0 for this portion
        
    # Combine scores
    final_score = (semantic_score * 0.6) + (skill_score * 0.4)
    
    # Convert to percentage
    ats_percentage = round(final_score * 100, 2)
    
    return {
        "ats_score": ats_percentage,
        "semantic_similarity": round(semantic_score * 100, 2),
        "skill_match_percentage": round(skill_score * 100, 2),
        "matched_skills": list(resume_skills.intersection(jd_skills))
    }
