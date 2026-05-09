from .matcher import calculate_similarity_batch
from .scorer import compute_ats_score

def recommend_jobs(resume_text: str, job_database: list[dict], top_n: int = 5) -> list[dict]:
    """
    Recommends the top N jobs from a database for a given candidate resume.
    
    Args:
        resume_text: Parsed resume string
        job_database: List of dictionaries containing "id", "title", "description"
        top_n: Number of jobs to return
        
    Returns:
        List of recommended jobs with scores.
    """
    if not job_database:
        return []
        
    job_descriptions = [job["description"] for job in job_database]
    
    # Calculate base semantic similarities
    similarities = calculate_similarity_batch(resume_text, job_descriptions)
    
    # Calculate detailed ATS scores for each
    results = []
    for i, job in enumerate(job_database):
        # We can use the pre-calculated similarity for performance, 
        # or use compute_ats_score for full keyword intersection.
        # Since compute_ats_score does more, we'll use it for the final ranking.
        score_details = compute_ats_score(resume_text, job["description"])
        
        job_result = {
            "job_id": job.get("id", str(i)),
            "job_title": job.get("title", f"Job {i}"),
            "match_score": score_details["ats_score"],
            "score_details": score_details
        }
        results.append(job_result)
        
    # Sort by match_score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)
    
    return results[:top_n]

def rank_candidates(job_description: str, candidates: list[dict]) -> list[dict]:
    """
    Ranks multiple candidates for a single job description.
    
    Args:
        job_description: JD string
        candidates: List of dictionaries containing "id", "name", "resume_text"
        
    Returns:
        List of candidates ranked by ATS score.
    """
    results = []
    for candidate in candidates:
        score_details = compute_ats_score(candidate["resume_text"], job_description)
        
        cand_result = {
            "candidate_id": candidate.get("id"),
            "candidate_name": candidate.get("name"),
            "ats_score": score_details["ats_score"],
            "score_details": score_details
        }
        results.append(cand_result)
        
    results.sort(key=lambda x: x["ats_score"], reverse=True)
    return results
