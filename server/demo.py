"""
HireStreamAI — Demo Script
============================
Runs the complete ML pipeline end-to-end with synthetic sample data.
No API server needed — demonstrates all modules directly.

Usage:
    python scripts/demo.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from parser import ResumeParser
from scorer import ATSScorer
from ranker import CandidateRanker
from skill_gap import SkillGapAnalyzer
from recommender import JobRecommender


# ── Sample Resumes ────────────────────────────────────────────────────────────
SAMPLE_RESUMES = [
    {
        "name": "Arjun Sharma",
        "text": """
Arjun Sharma
arjun.sharma@email.com | +91-9876543210 | Bangalore, India

EXPERIENCE
Senior Machine Learning Engineer — TechVision AI (2021–Present)  3 years
- Built NLP pipelines for resume classification using BERT and spaCy
- Deployed ML models on AWS SageMaker with Docker and Kubernetes
- Improved recommendation system accuracy by 22% using collaborative filtering

Machine Learning Engineer — DataSpark (2019–2021)
- Developed XGBoost models for customer churn prediction (AUC 0.91)
- Built ETL pipelines with Airflow and Spark

SKILLS
Python, Machine Learning, Deep Learning, TensorFlow, PyTorch, NLP, scikit-learn,
XGBoost, Docker, Kubernetes, AWS, Spark, SQL, MLflow, FastAPI, Git

EDUCATION
M.Tech in Computer Science — IIT Bangalore (2017–2019)

CERTIFICATIONS
AWS Certified Machine Learning Specialty
Google Professional ML Engineer
"""
    },
    {
        "name": "Priya Nair",
        "text": """
Priya Nair
priya.nair@email.com | Mumbai, India

EXPERIENCE
Data Scientist — AnalyticsHub (2022–Present)  2 years
- Created dashboards in Tableau and Power BI for executive reporting
- Built predictive models for sales forecasting using Python and pandas
- Performed A/B testing and statistical analysis

Junior Data Analyst — InfoMetrics (2020–2022)
- SQL-based reporting and data cleaning

SKILLS
Python, SQL, Pandas, NumPy, Tableau, Power BI, Statistics, scikit-learn, Excel, Git

EDUCATION
B.Tech in Information Technology — Mumbai University (2016–2020)
"""
    },
    {
        "name": "Ravi Kumar",
        "text": """
Ravi Kumar
ravi.kumar@email.com | Hyderabad

EXPERIENCE
DevOps Engineer — CloudSystems (2020–Present)  4 years
- Managed Kubernetes clusters and CI/CD pipelines on AWS
- Automated infrastructure with Terraform and Docker
- Implemented MLflow for ML experiment tracking

SKILLS
Kubernetes, Docker, AWS, Terraform, CI/CD, Linux, Bash, Python, MLflow, Git, Jenkins

EDUCATION
B.E. in Computer Engineering — JNTU Hyderabad (2016–2020)
"""
    },
]

# ── Sample Job Description ─────────────────────────────────────────────────────
SAMPLE_JD = """
Machine Learning Engineer — TechCorp AI (Bangalore)

We are looking for an experienced ML Engineer to join our AI team.

Requirements:
- 3+ years of experience in machine learning and AI
- Strong Python programming skills
- Experience with TensorFlow, PyTorch, or similar frameworks
- Familiarity with NLP techniques and transformer models
- Experience with Docker and Kubernetes for deployment
- Cloud platform experience (AWS or GCP)
- MLflow or similar experiment tracking tools
- SQL proficiency

Preferred:
- Experience with Spark for large-scale data processing
- MLOps background
- Master's degree in Computer Science, AI, or related field

Responsibilities:
- Design and train ML models for production systems
- Build and maintain ML pipelines
- Deploy and monitor models in cloud environments
- Collaborate with data engineers and product teams
"""


def run_demo():
    print("\n" + "=" * 70)
    print("  🚀 HireStreamAI — Complete ML Pipeline Demo")
    print("=" * 70)

    parser    = ResumeParser()
    scorer    = ATSScorer()
    ranker    = CandidateRanker()
    gap_analyzer = SkillGapAnalyzer()
    recommender  = JobRecommender()

    # ── 1. Parse all resumes ──────────────────────────────────────────────
    print("\n📄 STEP 1: Resume Parsing")
    print("-" * 40)
    profiles = []
    for resume in SAMPLE_RESUMES:
        profile = parser.parse(resume["text"])
        profiles.append(profile)
        print(f"  ✅ {profile['name']}")
        print(f"     Skills: {', '.join(profile['skills'][:6])}...")
        print(f"     Experience: {profile['experience_years']} years")
        print(f"     Education: {profile['education'][:1]}")
        print()

    # ── 2. ATS Scoring (first candidate) ─────────────────────────────────
    print("\n🧠 STEP 2: ATS Score Analysis — Arjun Sharma")
    print("-" * 40)
    ats = scorer.score(
        candidate_profile=profiles[0],
        job_description=SAMPLE_JD,
        required_experience_years=3,
        required_education_level="master",
    )
    print(f"  ATS Score:        {ats['ats_score']}/100  {ats['ats_grade']}")
    print(f"  Match Percentage: {ats['match_percentage']}%")
    print(f"  Component Scores:")
    for k, v in ats["component_scores"].items():
        bar = "█" * int(v / 10)
        print(f"    {k:<20} {v:>6.1f}%  {bar}")
    print(f"  Matched Skills: {', '.join(ats['matched_skills'][:5])}")
    print(f"  Missing Skills: {', '.join(ats['missing_skills'][:5])}")

    # ── 3. Candidate Ranking ──────────────────────────────────────────────
    print("\n🏆 STEP 3: Candidate Ranking")
    print("-" * 40)
    ranked = ranker.rank(
        candidates=profiles,
        job_description=SAMPLE_JD,
        required_experience_years=3,
    )
    print(ranker.generate_leaderboard(ranked))

    # ── 4. Skill Gap Analysis ─────────────────────────────────────────────
    print("\n🔍 STEP 4: Skill Gap Analysis — Arjun Sharma")
    print("-" * 40)
    required_skills = scorer._extract_skills_from_jd(SAMPLE_JD)
    gap = gap_analyzer.analyze(
        candidate_skills=profiles[0]["skills"],
        required_skills=required_skills,
    )
    print(f"  Skill Coverage:   {gap['skill_coverage_percentage']}%")
    print(f"  Present Skills:   {', '.join(gap['present_required_skills'][:5])}")
    print(f"  Missing Skills:   {', '.join(gap['missing_required_skills'][:5])}")
    print(f"  Summary: {gap['summary']}")
    print("\n  📚 Learning Suggestions:")
    for s in gap["learning_suggestions"][:4]:
        print(f"    → {s['action']}")
        print(f"       {s['url']}")

    # ── 5. Job Recommendations ────────────────────────────────────────────
    print("\n💼 STEP 5: Job Recommendations — Priya Nair")
    print("-" * 40)
    recs = recommender.recommend(candidate_profile=profiles[1], top_n=4)
    for r in recs:
        print(f"  [{r['match_percentage']}%] {r['title']} @ {r['company']} ({r['location']})")
        if r.get("matched_skills"):
            print(f"          Matching skills: {', '.join(list(r['matched_skills'])[:4])}")

    print("\n" + "=" * 70)
    print("  ✅ Demo Complete! All pipeline stages executed successfully.")
    print("=" * 70)
    print("\n  🌐 Start the API server:")
    print("     uvicorn app.main:app --reload --port 8000")
    print("  📖 Swagger UI: http://localhost:8000/docs\n")


if __name__ == "__main__":
    run_demo()
