"""
HireStreamAI — Skill Gap Analyzer
====================================
Compares candidate skills vs job requirements and produces:
  - Missing skills
  - Skill match percentage
  - Personalised learning suggestions (with real course links)
"""

from loguru import logger

# ── Learning Resource Database ────────────────────────────────────────────────
LEARNING_RESOURCES = {
    "python":           {"platform": "freeCodeCamp",   "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/"},
    "machine learning": {"platform": "Coursera (Andrew Ng)", "url": "https://www.coursera.org/specializations/machine-learning-introduction"},
    "deep learning":    {"platform": "fast.ai",         "url": "https://course.fast.ai"},
    "tensorflow":       {"platform": "TensorFlow Docs", "url": "https://www.tensorflow.org/tutorials"},
    "pytorch":          {"platform": "PyTorch Tutorials","url": "https://pytorch.org/tutorials/"},
    "kubernetes":       {"platform": "KodeKloud",       "url": "https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners/"},
    "docker":           {"platform": "Docker Docs",     "url": "https://docs.docker.com/get-started/"},
    "aws":              {"platform": "AWS Skill Builder","url": "https://explore.skillbuilder.aws"},
    "gcp":              {"platform": "Google Cloud Skills Boost","url": "https://cloudskillsboost.google"},
    "azure":            {"platform": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/azure/"},
    "mlflow":           {"platform": "MLflow Docs",     "url": "https://mlflow.org/docs/latest/index.html"},
    "spark":            {"platform": "Databricks Academy","url": "https://academy.databricks.com"},
    "sql":              {"platform": "Mode SQL Tutorial","url": "https://mode.com/sql-tutorial/"},
    "react":            {"platform": "React Docs",      "url": "https://react.dev/learn"},
    "fastapi":          {"platform": "FastAPI Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/"},
    "nlp":              {"platform": "Hugging Face Course","url": "https://huggingface.co/learn/nlp-course/"},
    "xgboost":          {"platform": "XGBoost Docs",    "url": "https://xgboost.readthedocs.io/en/stable/tutorials/"},
    "git":              {"platform": "Pro Git Book",    "url": "https://git-scm.com/book/en/v2"},
    "linux":            {"platform": "Linux Foundation", "url": "https://training.linuxfoundation.org/training/introduction-to-linux/"},
    "tableau":          {"platform": "Tableau Training", "url": "https://www.tableau.com/learn/training"},
    "power bi":         {"platform": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/power-bi/"},
}

# ── Skill importance levels ───────────────────────────────────────────────────
SKILL_IMPORTANCE = {
    "python": "critical", "machine learning": "critical", "sql": "critical",
    "deep learning": "high", "tensorflow": "high", "pytorch": "high",
    "aws": "high", "docker": "high", "kubernetes": "medium",
    "mlflow": "medium", "spark": "medium", "tableau": "low",
}


class SkillGapAnalyzer:
    """
    Identifies gaps between candidate skills and job requirements,
    and produces actionable learning recommendations.
    """

    def analyze(
        self,
        candidate_skills: list[str],
        required_skills: list[str],
        nice_to_have_skills: list[str] = None,
    ) -> dict:
        """
        Full skill gap analysis.

        Args:
            candidate_skills:   Skills extracted from resume
            required_skills:    Must-have skills from JD
            nice_to_have_skills: Optional/preferred skills from JD

        Returns:
            Comprehensive skill gap report dict
        """
        candidate_lower  = {s.lower() for s in candidate_skills}
        required_lower   = [s.lower() for s in required_skills]
        nice_lower       = [s.lower() for s in (nice_to_have_skills or [])]

        # Classify skills
        present_required = [s for s in required_lower if s in candidate_lower]
        missing_required = [s for s in required_lower if s not in candidate_lower]
        present_optional = [s for s in nice_lower if s in candidate_lower]
        missing_optional = [s for s in nice_lower if s not in candidate_lower]
        extra_skills     = [s for s in candidate_lower if s not in required_lower + nice_lower]

        # Coverage percentage
        total_required = len(required_lower)
        coverage_pct = (len(present_required) / total_required * 100) if total_required else 100.0

        # Prioritised missing skills
        prioritised_gaps = self._prioritise_gaps(missing_required)

        # Learning suggestions
        suggestions = self._generate_suggestions(missing_required + missing_optional[:3])

        report = {
            "skill_coverage_percentage": round(coverage_pct, 1),
            "present_required_skills":   present_required,
            "missing_required_skills":   missing_required,
            "present_optional_skills":   present_optional,
            "missing_optional_skills":   missing_optional[:5],
            "extra_skills":              list(extra_skills)[:10],
            "prioritised_gaps":          prioritised_gaps,
            "learning_suggestions":      suggestions,
            "summary":                   self._generate_summary(coverage_pct, missing_required),
        }
        logger.info(f"Skill gap: {len(missing_required)} missing required skills ({coverage_pct:.1f}% coverage)")
        return report

    # ── Private Helpers ───────────────────────────────────────────────────────

    def _prioritise_gaps(self, missing: list[str]) -> list[dict]:
        """Return missing skills with importance level attached."""
        result = []
        for skill in missing:
            importance = SKILL_IMPORTANCE.get(skill, "medium")
            result.append({"skill": skill, "importance": importance})
        # Sort: critical → high → medium → low
        order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        result.sort(key=lambda x: order.get(x["importance"], 2))
        return result

    def _generate_suggestions(self, missing_skills: list[str]) -> list[dict]:
        """Map missing skills to learning resources."""
        suggestions = []
        for skill in missing_skills[:8]:  # Limit to 8 suggestions
            resource = LEARNING_RESOURCES.get(skill)
            if resource:
                suggestions.append({
                    "skill":    skill,
                    "platform": resource["platform"],
                    "url":      resource["url"],
                    "action":   f"Learn {skill.title()} on {resource['platform']}",
                })
            else:
                suggestions.append({
                    "skill":    skill,
                    "platform": "Coursera / Udemy",
                    "url":      f"https://www.coursera.org/search?query={skill.replace(' ', '+')}",
                    "action":   f"Search '{skill}' courses on Coursera",
                })
        return suggestions

    def _generate_summary(self, coverage_pct: float, missing: list[str]) -> str:
        if coverage_pct >= 90:
            return "Excellent skill match! Minor gaps that can be addressed quickly."
        elif coverage_pct >= 70:
            return f"Good match. Focus on: {', '.join(missing[:3])} to strengthen your profile."
        elif coverage_pct >= 50:
            return f"Moderate match. Key gaps: {', '.join(missing[:4])}. Consider upskilling."
        else:
            top = ", ".join(missing[:5])
            return f"Significant skill gaps detected. Priority learning areas: {top}."
