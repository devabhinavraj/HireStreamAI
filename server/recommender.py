"""
HireStreamAI — AI Job Recommender
====================================
Recommends best-fit jobs from a job pool for a given candidate profile.

Algorithm:
  1. Encode all job descriptions using Sentence Transformers
  2. Compute cosine similarity with candidate resume embedding
  3. Boost score with skill overlap factor
  4. Return top-N jobs with match percentage
"""

import json
from pathlib import Path
from typing import Optional
from loguru import logger

from config import settings
from embedder import SemanticEmbedder
from scorer import ATSScorer


class JobRecommender:
    """
    Content-based job recommendation using semantic similarity + skill matching.
    """

    def __init__(self):
        self.embedder = SemanticEmbedder()
        self.scorer = ATSScorer()
        self._job_pool: list[dict] = []
        self._load_default_jobs()

    # ── Public API ────────────────────────────────────────────────────────────

    def recommend(
        self,
        candidate_profile: dict,
        job_pool: Optional[list[dict]] = None,
        top_n: int = None,
    ) -> list[dict]:
        """
        Recommend top-N jobs for a candidate.

        Args:
            candidate_profile: Parsed resume dict from ResumeParser
            job_pool: Optional custom job list (uses default pool if None)
                      Each job: {"title", "company", "description", "required_skills", "location"}
            top_n: Number of recommendations (defaults to settings.TOP_N_JOBS)

        Returns:
            List of job dicts with 'match_percentage' and 'skill_overlap' added
        """
        top_n = top_n or settings.TOP_N_JOBS
        jobs = job_pool or self._job_pool
        if not jobs:
            logger.warning("Job pool is empty. Cannot recommend.")
            return []

        resume_text = candidate_profile.get("raw_text", "")
        candidate_skills = {s.lower() for s in candidate_profile.get("skills", [])}

        # Build JD corpus
        jd_texts = [j.get("description", "") for j in jobs]

        # Semantic similarity scores
        semantic_scores = self.embedder.batch_similarity(resume_text, jd_texts)

        # Compute skill overlap boost for each job
        recommendations = []
        for i, job in enumerate(jobs):
            req_skills = {s.lower() for s in job.get("required_skills", [])}
            overlap = len(candidate_skills & req_skills) / max(len(req_skills), 1) if req_skills else 0

            # Combined score: 70% semantic + 30% skill overlap
            combined = semantic_scores[i] * 0.70 + overlap * 0.30
            match_pct = round(combined * 100, 1)

            if match_pct >= settings.SIMILARITY_THRESHOLD * 100:
                recommendations.append({
                    **job,
                    "match_percentage":  match_pct,
                    "semantic_score":    round(semantic_scores[i] * 100, 1),
                    "skill_overlap_pct": round(overlap * 100, 1),
                    "matched_skills":    sorted(candidate_skills & req_skills),
                })

        # Sort by match percentage descending
        recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
        logger.info(f"Found {len(recommendations)} job recommendations for {candidate_profile.get('name')}")
        return recommendations[:top_n]

    def add_jobs(self, jobs: list[dict]) -> None:
        """Add jobs to the internal pool."""
        self._job_pool.extend(jobs)
        logger.info(f"Job pool size: {len(self._job_pool)}")

    def load_jobs_from_file(self, path: str) -> None:
        """Load jobs from a JSON file."""
        with open(path, "r") as f:
            jobs = json.load(f)
        self.add_jobs(jobs)

    # ── Default Job Pool ──────────────────────────────────────────────────────

    def _load_default_jobs(self) -> None:
        """Load synthetic job dataset."""
        default_path = Path(settings.DATA_DIR) / "sample_jobs" / "jobs.json"
        if default_path.exists():
            self.load_jobs_from_file(str(default_path))
        else:
            # Use built-in synthetic jobs
            self._job_pool = SYNTHETIC_JOB_POOL
            logger.info(f"Loaded {len(self._job_pool)} synthetic jobs")


# ── Synthetic Job Pool (fallback when no dataset is present) ──────────────────
SYNTHETIC_JOB_POOL = [
    {
        "id": "j001",
        "title": "Machine Learning Engineer",
        "company": "TechCorp AI",
        "location": "Bangalore, India",
        "experience_required": 3,
        "required_skills": ["python", "machine learning", "tensorflow", "scikit-learn", "sql", "docker"],
        "description": (
            "We are looking for an ML Engineer to design and implement machine learning models "
            "at scale. Responsibilities include building production ML pipelines, model training "
            "and evaluation, feature engineering, and deploying models to cloud infrastructure. "
            "Strong Python skills required along with experience in TensorFlow, scikit-learn, "
            "and SQL. Docker and cloud deployment (AWS/GCP) experience preferred."
        ),
    },
    {
        "id": "j002",
        "title": "Data Scientist",
        "company": "DataVision Analytics",
        "location": "Mumbai, India",
        "experience_required": 2,
        "required_skills": ["python", "statistics", "pandas", "numpy", "sql", "machine learning", "tableau"],
        "description": (
            "DataVision is hiring a Data Scientist to extract actionable insights from large datasets. "
            "You will build predictive models, conduct A/B testing, create dashboards in Tableau, "
            "and collaborate with product teams. Proficiency in Python (pandas, numpy), SQL, "
            "and basic ML algorithms required. Communication skills are key."
        ),
    },
    {
        "id": "j003",
        "title": "NLP Research Engineer",
        "company": "LanguageAI Labs",
        "location": "Remote",
        "experience_required": 4,
        "required_skills": ["python", "nlp", "pytorch", "transformers", "hugging face", "bert", "deep learning"],
        "description": (
            "Join our NLP research team to advance state-of-the-art language models. "
            "You will fine-tune LLMs (BERT, GPT, LLaMA), build RAG pipelines, implement "
            "NER and text classification systems, and publish research results. "
            "Deep expertise in PyTorch and Hugging Face Transformers required."
        ),
    },
    {
        "id": "j004",
        "title": "MLOps Engineer",
        "company": "CloudScale Systems",
        "location": "Pune, India",
        "experience_required": 3,
        "required_skills": ["python", "mlflow", "kubernetes", "docker", "aws", "ci/cd", "tensorflow"],
        "description": (
            "CloudScale is seeking an MLOps Engineer to operationalise ML systems at scale. "
            "Responsibilities include building CI/CD pipelines for model deployment, "
            "maintaining Kubernetes clusters, integrating MLflow for experiment tracking, "
            "and ensuring model monitoring in production. AWS or GCP certification a plus."
        ),
    },
    {
        "id": "j005",
        "title": "AI Product Manager",
        "company": "InnovateTech",
        "location": "Delhi, India",
        "experience_required": 5,
        "required_skills": ["machine learning", "sql", "python", "product management", "tableau", "agile"],
        "description": (
            "Lead AI product strategy and roadmap for our core ML-powered products. "
            "Work closely with data scientists, engineers, and stakeholders to define "
            "requirements, prioritise features, and ship AI features. Experience with "
            "SQL, basic Python, and understanding of ML concepts required."
        ),
    },
    {
        "id": "j006",
        "title": "Backend Engineer (Python)",
        "company": "FastStack",
        "location": "Hyderabad, India",
        "experience_required": 2,
        "required_skills": ["python", "fastapi", "postgresql", "docker", "rest api", "sql", "git"],
        "description": (
            "Build scalable backend services using Python and FastAPI. You will design "
            "REST APIs, optimise database queries in PostgreSQL, containerise applications "
            "with Docker, and maintain high code quality. Strong Python and SQL skills required."
        ),
    },
    {
        "id": "j007",
        "title": "Computer Vision Engineer",
        "company": "VisioAI",
        "location": "Bangalore, India",
        "experience_required": 3,
        "required_skills": ["python", "computer vision", "pytorch", "tensorflow", "opencv", "deep learning", "aws"],
        "description": (
            "Design and deploy computer vision models for real-time object detection "
            "and image segmentation. Experience with PyTorch, TensorFlow, and OpenCV required. "
            "Prior work on YOLO, ResNet, or similar architectures preferred."
        ),
    },
    {
        "id": "j008",
        "title": "Data Engineer",
        "company": "BigDataCo",
        "location": "Chennai, India",
        "experience_required": 3,
        "required_skills": ["python", "spark", "sql", "airflow", "kafka", "aws", "dbt", "postgresql"],
        "description": (
            "Build and maintain robust data pipelines at scale. Use Apache Spark, Airflow, "
            "and Kafka to process millions of events daily. Strong SQL and Python skills, "
            "experience with cloud data warehouses (Snowflake/BigQuery/Redshift) preferred."
        ),
    },
    {
        "id": "j009",
        "title": "Full Stack AI Developer",
        "company": "AIStartup",
        "location": "Remote",
        "experience_required": 2,
        "required_skills": ["python", "react", "fastapi", "machine learning", "sql", "docker", "javascript"],
        "description": (
            "Build AI-powered web applications end-to-end. Backend in Python/FastAPI, "
            "frontend in React. Integrate ML models, build REST APIs, and ship features "
            "fast. Passion for AI products and strong full-stack skills required."
        ),
    },
    {
        "id": "j010",
        "title": "Quantitative Analyst (ML)",
        "company": "FinAlgo Capital",
        "location": "Mumbai, India",
        "experience_required": 4,
        "required_skills": ["python", "machine learning", "statistics", "sql", "numpy", "pandas", "r"],
        "description": (
            "Apply ML to financial modelling, risk analysis, and algorithmic trading strategies. "
            "Strong quantitative background required along with Python, R, and deep understanding "
            "of statistical models, time-series analysis, and backtesting frameworks."
        ),
    },
]
