from .scorer import extract_skills_from_text

def analyze_skill_gap(resume_text: str, jd_text: str) -> dict:
    """
    Analyzes the gap between candidate's skills and the required job skills.
    """
    resume_skills = set(extract_skills_from_text(resume_text))
    jd_skills = set(extract_skills_from_text(jd_text))
    
    missing_skills = jd_skills - resume_skills
    additional_skills = resume_skills - jd_skills
    
    return {
        "required_skills": list(jd_skills),
        "candidate_skills": list(resume_skills),
        "missing_skills": list(missing_skills),
        "additional_skills": list(additional_skills) # Skills candidate has that are not in JD
    }
