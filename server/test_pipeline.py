"""
HireStreamAI — Unit Tests
===========================
Tests for core ML pipeline modules.

Run with:
    pytest tests/ -v
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from preprocessor import TextPreprocessor
from parser import ResumeParser
from scorer import ATSScorer
from skill_gap import SkillGapAnalyzer
from ranker import CandidateRanker


SAMPLE_RESUME = """
Arjun Sharma
arjun@email.com | +91-9876543210

EXPERIENCE
ML Engineer — TechCorp (2021-Present)  3 years
Built NLP pipelines using Python, TensorFlow, and spaCy.

SKILLS
Python, Machine Learning, TensorFlow, PyTorch, SQL, Docker, AWS, NLP, scikit-learn

EDUCATION
M.Tech Computer Science — IIT Bangalore (2019)
"""

SAMPLE_JD = """
We need a Machine Learning Engineer with Python, TensorFlow, Docker, Kubernetes, 
and 3+ years experience. NLP knowledge preferred. Master's degree required.
"""


# ── Preprocessor Tests ────────────────────────────────────────────────────────
class TestPreprocessor:
    def setup_method(self):
        self.p = TextPreprocessor()

    def test_preprocess_lowercases(self):
        result = self.p.preprocess("Hello World PYTHON")
        assert result == result.lower()

    def test_preprocess_removes_special_chars(self):
        result = self.p.preprocess("hello!!! world???")
        assert "!" not in result and "?" not in result

    def test_extract_keywords_returns_list(self):
        keywords = self.p.extract_keywords("Python machine learning data science TensorFlow")
        assert isinstance(keywords, list)
        assert len(keywords) > 0

    def test_get_tokens(self):
        tokens = self.p.get_tokens("Python is great for machine learning")
        assert isinstance(tokens, list)
        assert "python" in tokens


# ── Parser Tests ──────────────────────────────────────────────────────────────
class TestResumeParser:
    def setup_method(self):
        self.parser = ResumeParser()

    def test_parse_returns_dict(self):
        result = self.parser.parse(SAMPLE_RESUME)
        assert isinstance(result, dict)

    def test_parse_extracts_email(self):
        result = self.parser.parse(SAMPLE_RESUME)
        assert result["email"] == "arjun@email.com"

    def test_parse_extracts_skills(self):
        result = self.parser.parse(SAMPLE_RESUME)
        skills_lower = [s.lower() for s in result["skills"]]
        assert "python" in skills_lower

    def test_parse_extracts_experience_years(self):
        result = self.parser.parse(SAMPLE_RESUME)
        assert result["experience_years"] == 3

    def test_parse_has_required_keys(self):
        result = self.parser.parse(SAMPLE_RESUME)
        required_keys = ["name", "email", "phone", "skills", "education",
                         "experience_years", "projects", "certifications", "raw_text"]
        for key in required_keys:
            assert key in result, f"Missing key: {key}"


# ── Scorer Tests ──────────────────────────────────────────────────────────────
class TestATSScorer:
    def setup_method(self):
        self.parser = ResumeParser()
        self.scorer = ATSScorer()
        self.profile = self.parser.parse(SAMPLE_RESUME)

    def test_score_returns_dict(self):
        result = self.scorer.score(self.profile, SAMPLE_JD)
        assert isinstance(result, dict)

    def test_score_range(self):
        result = self.scorer.score(self.profile, SAMPLE_JD)
        assert 0 <= result["ats_score"] <= 100

    def test_score_has_components(self):
        result = self.scorer.score(self.profile, SAMPLE_JD)
        assert "component_scores" in result
        components = result["component_scores"]
        expected = ["skill_match", "semantic_sim", "experience", "education", "keyword_density"]
        for key in expected:
            assert key in components

    def test_ats_grade_assigned(self):
        result = self.scorer.score(self.profile, SAMPLE_JD)
        assert result["ats_grade"] in [
            "Excellent ✅", "Good 👍", "Average ⚠️", "Below Average 📉", "Poor ❌"
        ]


# ── Skill Gap Tests ───────────────────────────────────────────────────────────
class TestSkillGapAnalyzer:
    def setup_method(self):
        self.analyzer = SkillGapAnalyzer()

    def test_full_match(self):
        result = self.analyzer.analyze(
            candidate_skills=["Python", "SQL", "Docker"],
            required_skills=["Python", "SQL", "Docker"],
        )
        assert result["skill_coverage_percentage"] == 100.0
        assert result["missing_required_skills"] == []

    def test_partial_match(self):
        result = self.analyzer.analyze(
            candidate_skills=["Python"],
            required_skills=["Python", "SQL", "Docker", "Kubernetes"],
        )
        assert result["skill_coverage_percentage"] == 25.0
        assert len(result["missing_required_skills"]) == 3

    def test_suggestions_returned(self):
        result = self.analyzer.analyze(
            candidate_skills=["Python"],
            required_skills=["Machine Learning", "Docker", "Kubernetes"],
        )
        assert len(result["learning_suggestions"]) > 0
        assert "url" in result["learning_suggestions"][0]

    def test_empty_candidate_skills(self):
        result = self.analyzer.analyze(
            candidate_skills=[],
            required_skills=["Python", "SQL"],
        )
        assert result["skill_coverage_percentage"] == 0.0


# ── Ranker Tests ──────────────────────────────────────────────────────────────
class TestCandidateRanker:
    def setup_method(self):
        self.parser = ResumeParser()
        self.ranker = CandidateRanker()

    def test_ranker_sorts_by_score(self):
        resume1 = SAMPLE_RESUME  # Strong candidate
        resume2 = "John Doe\njohn@email.com\nSKILLS: Excel, Word\nEDUCATION: High School"
        profiles = [self.parser.parse(r) for r in [resume1, resume2]]
        ranked = self.ranker.rank(profiles, SAMPLE_JD)
        # First rank should have higher or equal ATS score
        assert ranked[0]["ats_score"] >= ranked[1]["ats_score"]

    def test_ranker_assigns_ranks(self):
        profiles = [self.parser.parse(SAMPLE_RESUME)]
        ranked = self.ranker.rank(profiles, SAMPLE_JD)
        assert ranked[0]["rank"] == 1

    def test_leaderboard_is_string(self):
        profiles = [self.parser.parse(SAMPLE_RESUME)]
        ranked = self.ranker.rank(profiles, SAMPLE_JD)
        lb = self.ranker.generate_leaderboard(ranked)
        assert isinstance(lb, str)
        assert "RANK" in lb
