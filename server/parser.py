"""
HireStreamAI — Resume Parser
=============================
Extracts structured information from resume text using spaCy NLP and regex patterns.

Extracted fields:
  - name, email, phone
  - skills, education, experience
  - projects, certifications
"""

import re
import spacy
from typing import Optional
from loguru import logger

from config import settings
from preprocessor import TextPreprocessor


# ── Skill Taxonomy ────────────────────────────────────────────────────────────
SKILL_KEYWORDS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "scala", "kotlin", "swift", "r", "matlab", "julia", "php", "ruby",
    # ML / AI
    "machine learning", "deep learning", "nlp", "computer vision", "reinforcement learning",
    "tensorflow", "pytorch", "keras", "scikit-learn", "xgboost", "lightgbm",
    "hugging face", "transformers", "bert", "gpt", "llm", "rag", "langchain",
    # Data
    "pandas", "numpy", "sql", "postgresql", "mysql", "mongodb", "redis",
    "spark", "hadoop", "kafka", "airflow", "dbt", "snowflake", "bigquery",
    # Cloud / DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd",
    "mlflow", "kubeflow", "sagemaker", "vertex ai",
    # Web
    "react", "vue", "angular", "node.js", "fastapi", "django", "flask",
    "rest api", "graphql", "html", "css",
    # Tools
    "git", "github", "linux", "bash", "tableau", "power bi", "excel",
    "jira", "confluence", "figma",
}

EDUCATION_KEYWORDS = [
    "bachelor", "master", "phd", "doctorate", "b.tech", "m.tech", "b.e",
    "m.e", "b.sc", "m.sc", "mba", "bca", "mca", "diploma", "degree",
    "university", "college", "institute", "iit", "nit", "bits",
]

EXPERIENCE_PATTERNS = [
    r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)",
    r"(?:experience|exp)[:\s]+(\d+)\+?\s*(?:years?|yrs?)",
]

SECTION_HEADERS = {
    "skills": ["skills", "technical skills", "core competencies", "technologies"],
    "education": ["education", "academic background", "qualifications"],
    "experience": ["experience", "work experience", "employment", "professional experience"],
    "projects": ["projects", "personal projects", "key projects"],
    "certifications": ["certifications", "certificates", "courses", "achievements"],
}


class ResumeParser:
    """
    Parses resume text into structured candidate profile.
    Uses spaCy for NER (name detection) and regex for pattern matching.
    """

    def __init__(self):
        logger.info(f"Loading spaCy model: {settings.SPACY_MODEL}")
        try:
            self.nlp = spacy.load(settings.SPACY_MODEL)
        except OSError:
            logger.warning("spaCy model not found. Run: python -m spacy download en_core_web_sm")
            self.nlp = None
        self.preprocessor = TextPreprocessor()

    # ── Public API ────────────────────────────────────────────────────────────

    def parse(self, text: str) -> dict:
        """
        Main entry point. Returns full candidate profile dict.

        Args:
            text: Raw resume text (from PDF/DOCX extraction)

        Returns:
            dict with keys: name, email, phone, skills, education,
                            experience_years, projects, certifications, raw_text
        """
        logger.info("Parsing resume...")
        clean = self._clean_text(text)

        profile = {
            "name":             self._extract_name(clean),
            "email":            self._extract_email(clean),
            "phone":            self._extract_phone(clean),
            "skills":           self._extract_skills(clean),
            "education":        self._extract_education(clean),
            "experience_years": self._extract_experience_years(clean),
            "projects":         self._extract_section(clean, "projects"),
            "certifications":   self._extract_section(clean, "certifications"),
            "raw_text":         clean,
        }
        logger.info(f"Parsed profile for: {profile['name']} | Skills: {len(profile['skills'])}")
        return profile

    # ── Extraction Methods ────────────────────────────────────────────────────

    def _extract_name(self, text: str) -> str:
        """Use spaCy NER to find PERSON entity at the start of the resume."""
        if self.nlp:
            doc = self.nlp(text[:500])  # Check first 500 chars
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    return ent.text.strip()

        # Fallback: first non-empty line that looks like a name
        for line in text.split("\n"):
            line = line.strip()
            if 2 <= len(line.split()) <= 4 and line.replace(" ", "").isalpha():
                return line
        return "Unknown"

    def _extract_email(self, text: str) -> Optional[str]:
        pattern = r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
        match = re.search(pattern, text)
        return match.group(0) if match else None

    def _extract_phone(self, text: str) -> Optional[str]:
        pattern = r"(?:\+91[\-\s]?)?[6-9]\d{9}|(?:\+\d{1,3}[\-\s]?)?\(?\d{3}\)?[\-\s]?\d{3}[\-\s]?\d{4}"
        match = re.search(pattern, text)
        return match.group(0) if match else None

    def _extract_skills(self, text: str) -> list[str]:
        """Match skills from taxonomy against resume text (case-insensitive)."""
        text_lower = text.lower()
        found = []
        for skill in SKILL_KEYWORDS:
            # Use word boundary matching to avoid partial matches
            pattern = r"\b" + re.escape(skill) + r"\b"
            if re.search(pattern, text_lower):
                found.append(skill.title() if " " not in skill else skill)
        return sorted(set(found))

    def _extract_education(self, text: str) -> list[str]:
        """Extract education-related lines from the resume."""
        lines = text.lower().split("\n")
        education_lines = []
        in_section = False

        for line in lines:
            line_stripped = line.strip()
            # Detect education section header
            if any(kw in line_stripped for kw in SECTION_HEADERS["education"]):
                in_section = True
                continue
            # Detect next section start
            if in_section and any(
                any(kw in line_stripped for kw in kws)
                for sec, kws in SECTION_HEADERS.items() if sec != "education"
            ):
                in_section = False

            if in_section and line_stripped:
                education_lines.append(line_stripped)
            elif any(kw in line_stripped for kw in EDUCATION_KEYWORDS):
                education_lines.append(line_stripped)

        return list(dict.fromkeys(education_lines))[:5]  # deduplicate, top 5

    def _extract_experience_years(self, text: str) -> int:
        """Extract total years of experience mentioned in resume."""
        text_lower = text.lower()
        for pattern in EXPERIENCE_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                return int(match.group(1))
        return 0

    def _extract_section(self, text: str, section: str) -> list[str]:
        """Generic section extractor for projects / certifications."""
        keywords = SECTION_HEADERS.get(section, [])
        lines = text.split("\n")
        results = []
        in_section = False
        other_headers = [
            kw for sec, kws in SECTION_HEADERS.items()
            if sec != section for kw in kws
        ]

        for line in lines:
            line_lower = line.lower().strip()
            if any(kw in line_lower for kw in keywords):
                in_section = True
                continue
            if in_section and any(kw in line_lower for kw in other_headers):
                in_section = False
            if in_section and len(line.strip()) > 5:
                results.append(line.strip())

        return results[:10]

    def _clean_text(self, text: str) -> str:
        """Basic cleanup: remove excessive whitespace, control characters."""
        text = re.sub(r"\r\n|\r", "\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()
