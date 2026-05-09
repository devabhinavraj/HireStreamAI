"""
HireStreamAI — ATS Score Engine
=================================
Computes a composite ATS score (0–100) for a resume against a job description.

Scoring formula (configurable weights in config.py):
  ATS = (skill_match × 0.35)
      + (semantic_sim × 0.30)
      + (experience × 0.20)
      + (education × 0.10)
      + (keyword_density × 0.05)
  × 100
"""

import re
from typing import Optional
from loguru import logger

from config import settings
from embedder import SemanticEmbedder
from preprocessor import TextPreprocessor


# ── Experience & Education scoring tables ─────────────────────────────────────
EXPERIENCE_SCORE_TABLE = {
    # (min_years, max_years): score
    (0, 1):  0.40,
    (1, 2):  0.55,
    (2, 4):  0.70,
    (4, 6):  0.85,
    (6, 99): 1.00,
}

EDUCATION_SCORE_MAP = {
    "phd":      1.00,
    "doctorate":1.00,
    "master":   0.85,
    "m.tech":   0.85,
    "m.sc":     0.85,
    "mba":      0.80,
    "bachelor": 0.70,
    "b.tech":   0.70,
    "b.e":      0.70,
    "b.sc":     0.65,
    "diploma":  0.50,
}


class ATSScorer:
    """
    Weighted multi-factor ATS scoring engine.
    """

    def __init__(self):
        self.embedder = SemanticEmbedder()
        self.preprocessor = TextPreprocessor()

    # ── Public API ────────────────────────────────────────────────────────────

    def score(
        self,
        candidate_profile: dict,
        job_description: str,
        required_skills: Optional[list[str]] = None,
        required_experience_years: int = 0,
        required_education_level: str = "bachelor",
    ) -> dict:
        """
        Compute full ATS analysis.

        Args:
            candidate_profile:        Output from ResumeParser.parse()
            job_description:          Raw JD text
            required_skills:          List of required skills (auto-extracted if None)
            required_experience_years: Minimum years required
            required_education_level: Minimum education (e.g. "bachelor")

        Returns:
            dict with ats_score, component_scores, match_percentage, and details
        """
        # Auto-extract required skills from JD if not provided
        if required_skills is None:
            required_skills = self._extract_skills_from_jd(job_description)

        candidate_skills = [s.lower() for s in candidate_profile.get("skills", [])]
        resume_text = candidate_profile.get("raw_text", "")

        # ── Component Scores ──────────────────────────────────────────────
        skill_score   = self._skill_match_score(candidate_skills, required_skills)
        semantic_score = self.embedder.similarity(resume_text, job_description)
        exp_score     = self._experience_score(
            candidate_profile.get("experience_years", 0),
            required_experience_years,
        )
        edu_score     = self._education_score(
            candidate_profile.get("education", []),
            required_education_level,
        )
        keyword_score = self._keyword_density_score(resume_text, job_description)

        # ── Weighted Composite ────────────────────────────────────────────
        w = settings
        raw_score = (
            skill_score   * w.WEIGHT_SKILL_MATCH
            + semantic_score * w.WEIGHT_SEMANTIC_SIM
            + exp_score    * w.WEIGHT_EXPERIENCE
            + edu_score    * w.WEIGHT_EDUCATION
            + keyword_score * w.WEIGHT_KEYWORDS
        )
        ats_score = round(raw_score * 100, 2)

        matched_skills  = [s for s in candidate_skills if s in [r.lower() for r in required_skills]]
        missing_skills  = [s for s in required_skills if s.lower() not in candidate_skills]

        result = {
            "ats_score":        ats_score,
            "match_percentage": round(semantic_score * 100, 2),
            "component_scores": {
                "skill_match":     round(skill_score * 100, 2),
                "semantic_sim":    round(semantic_score * 100, 2),
                "experience":      round(exp_score * 100, 2),
                "education":       round(edu_score * 100, 2),
                "keyword_density": round(keyword_score * 100, 2),
            },
            "matched_skills":  matched_skills,
            "missing_skills":  missing_skills,
            "required_skills": required_skills,
            "ats_grade":       self._ats_grade(ats_score),
        }
        logger.info(f"ATS Score: {ats_score} | Grade: {result['ats_grade']}")
        return result

    # ── Component Scorers ─────────────────────────────────────────────────────

    def _skill_match_score(
        self, candidate_skills: list[str], required_skills: list[str]
    ) -> float:
        if not required_skills:
            return 0.5  # Neutral if JD has no identifiable skills
        req_lower = [s.lower() for s in required_skills]
        matches = sum(1 for s in candidate_skills if s in req_lower)
        return min(matches / len(required_skills), 1.0)

    def _experience_score(self, candidate_years: int, required_years: int) -> float:
        if required_years == 0:
            return 1.0
        ratio = candidate_years / required_years
        if ratio >= 1.0:
            return 1.0
        elif ratio >= 0.75:
            return 0.80
        elif ratio >= 0.5:
            return 0.60
        else:
            return 0.30

    def _education_score(self, education_lines: list[str], required_level: str) -> float:
        text = " ".join(education_lines).lower()
        best_score = 0.0
        for level, score in EDUCATION_SCORE_MAP.items():
            if level in text:
                best_score = max(best_score, score)
        if best_score == 0.0:
            return 0.40  # Some education assumed even if undetected
        required_score = EDUCATION_SCORE_MAP.get(required_level.lower(), 0.70)
        # Full score if meets requirement, partial if below
        return best_score if best_score >= required_score else best_score * 0.7

    def _keyword_density_score(self, resume_text: str, jd_text: str) -> float:
        """Score based on how many JD keywords appear in the resume."""
        jd_keywords = self.preprocessor.extract_keywords(jd_text, top_n=30)
        resume_lower = resume_text.lower()
        hits = sum(1 for kw in jd_keywords if kw.lower() in resume_lower)
        return min(hits / max(len(jd_keywords), 1), 1.0)

    def _extract_skills_from_jd(self, jd_text: str) -> list[str]:
        """Extract required skills from JD using the same skill taxonomy."""
        from parser import SKILL_KEYWORDS
        text_lower = jd_text.lower()
        found = []
        for skill in SKILL_KEYWORDS:
            pattern = r"\b" + re.escape(skill) + r"\b"
            if re.search(pattern, text_lower):
                found.append(skill.title() if " " not in skill else skill)
        return sorted(set(found))

    def _ats_grade(self, score: float) -> str:
        if score >= 85:  return "Excellent ✅"
        elif score >= 70: return "Good 👍"
        elif score >= 55: return "Average ⚠️"
        elif score >= 40: return "Below Average 📉"
        else:             return "Poor ❌"
