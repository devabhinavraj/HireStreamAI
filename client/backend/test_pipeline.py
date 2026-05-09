import sys
import os

# Add backend directory to sys.path to allow imports without running uvicorn
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from ml_pipeline.parser import parse_resume
from ml_pipeline.scorer import compute_ats_score
from ml_pipeline.recommender import recommend_jobs, rank_candidates

def test_pipeline():
    print("Testing Pipeline...")
    
    # 1. Test Parser
    dummy_resume = b"John Doe. Experienced Python developer with a passion for Machine Learning, deep learning, NLP. Email: john@example.com Phone: 123-456-7890."
    parsed = parse_resume(dummy_resume, "resume.txt")
    print(f"Parsed Resume: {parsed}\n")
    
    # 2. Test Scorer & Semantic Similarity
    jd = "We are looking for a Python developer with experience in Machine Learning and NLP to build scalable applications."
    ats_score = compute_ats_score(parsed["raw_text"], jd)
    print(f"ATS Score vs JD: {ats_score}\n")
    
    # 3. Test Recommender
    jobs = [
        {"id": "1", "title": "Frontend Engineer", "description": "React and TypeScript engineer needed for a fast-paced startup."},
        {"id": "2", "title": "AI Engineer", "description": "Looking for a Python dev with Machine Learning and NLP background."},
        {"id": "3", "title": "Backend Dev", "description": "Django and Node.js developer to build REST APIs."}
    ]
    recommendations = recommend_jobs(parsed["raw_text"], jobs)
    print("Job Recommendations:")
    for r in recommendations:
        print(f" - {r['job_title']}: {r['match_score']}%")

if __name__ == "__main__":
    test_pipeline()
