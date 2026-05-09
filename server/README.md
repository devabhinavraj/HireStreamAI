# 🚀 HireStreamAI — AI-Powered Resume Screening & Smart Job Matching

A production-level ML + NLP pipeline for intelligent recruitment automation.

## Features
- **Resume Parsing** — Extracts name, skills, education, experience using spaCy + Regex
- **ATS Score Prediction** — Scores resumes 0–100 based on ML-powered analysis
- **Semantic Matching** — Sentence Transformers cosine similarity (all-MiniLM-L6-v2)
- **Candidate Ranking** — Auto-ranks multiple applicants by ATS score
- **Skill Gap Analysis** — Identifies missing skills with learning suggestions
- **Job Recommendation** — Recommends best-fit roles from job pool
- **FastAPI REST API** — Production-ready endpoints

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Run API server
uvicorn app.main:app --reload --port 8000

# Or run demo
python scripts/demo.py
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-resume` | Upload & parse a resume |
| POST | `/analyze` | Full ATS analysis |
| POST | `/match-job` | Match resume to job description |
| POST | `/rank-candidates` | Rank multiple resumes |
| POST | `/skill-gap` | Identify skill gaps |
| GET  | `/recommend-jobs/{candidate_id}` | Get job recommendations |

## Architecture

```
HireStreamAI/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── api/                 # Route handlers
│   │   ├── resume.py
│   │   ├── matching.py
│   │   └── recommendations.py
│   ├── core/                # Config & shared utilities
│   │   └── config.py
│   ├── ml/                  # ML pipeline modules
│   │   ├── parser.py        # Resume parsing
│   │   ├── preprocessor.py  # Text preprocessing
│   │   ├── embedder.py      # Sentence embeddings
│   │   ├── scorer.py        # ATS scoring
│   │   ├── ranker.py        # Candidate ranking
│   │   ├── skill_gap.py     # Skill gap analysis
│   │   └── recommender.py   # Job recommender
│   └── utils/
│       └── helpers.py
├── data/                    # Sample datasets
├── models/                  # Saved ML models
├── scripts/                 # Training & demo scripts
│   ├── train.py
│   └── demo.py
├── tests/                   # Unit tests
└── requirements.txt
```

## Sample API Response

```json
{
  "candidate_name": "Arjun Sharma",
  "ats_score": 82.4,
  "match_percentage": 78.6,
  "extracted_skills": ["Python", "Machine Learning", "TensorFlow", "SQL"],
  "missing_skills": ["Kubernetes", "MLflow", "Spark"],
  "candidate_rank": 1,
  "recommended_jobs": [
    {"title": "ML Engineer", "company": "TechCorp", "match": 88.2},
    {"title": "Data Scientist", "company": "AIStartup", "match": 81.5}
  ],
  "skill_gap_report": {
    "present": ["Python", "ML", "TensorFlow"],
    "missing": ["Kubernetes", "MLflow"],
    "suggestions": ["Kubernetes on Coursera", "MLflow Docs"]
  }
}
```
