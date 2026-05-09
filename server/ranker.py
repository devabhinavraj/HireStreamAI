"""
HireStreamAI — Candidate Ranker
=================================
Ranks multiple candidates against a single job description.
Supports batch upload and produces a sorted leaderboard.
"""

from typing import Optional
from loguru import logger

from scorer import ATSScorer


class CandidateRanker:
    """
    Ranks a pool of parsed candidate profiles against a job description.
    """

    def __init__(self):
        self.scorer = ATSScorer()

    def rank(
        self,
        candidates: list[dict],
        job_description: str,
        required_skills: Optional[list[str]] = None,
        required_experience_years: int = 0,
        required_education_level: str = "bachelor",
    ) -> list[dict]:
        """
        Score and rank all candidates for a given job.

        Args:
            candidates: List of parsed candidate profiles (from ResumeParser.parse())
            job_description: Job description text
            required_skills: Optional explicit skill list
            required_experience_years: Minimum years required
            required_education_level: Minimum education

        Returns:
            List of candidate result dicts sorted by ATS score (highest first),
            each including 'rank' and 'ats_result' keys.
        """
        logger.info(f"Ranking {len(candidates)} candidates...")
        results = []

        for i, candidate in enumerate(candidates):
            ats_result = self.scorer.score(
                candidate_profile=candidate,
                job_description=job_description,
                required_skills=required_skills,
                required_experience_years=required_experience_years,
                required_education_level=required_education_level,
            )
            results.append({
                "candidate_name":    candidate.get("name", f"Candidate {i+1}"),
                "email":             candidate.get("email"),
                "experience_years":  candidate.get("experience_years", 0),
                "skills":            candidate.get("skills", []),
                "ats_score":         ats_result["ats_score"],
                "match_percentage":  ats_result["match_percentage"],
                "component_scores":  ats_result["component_scores"],
                "matched_skills":    ats_result["matched_skills"],
                "missing_skills":    ats_result["missing_skills"],
                "ats_grade":         ats_result["ats_grade"],
            })

        # Sort by ATS score descending
        results.sort(key=lambda x: x["ats_score"], reverse=True)

        # Assign ranks
        for rank_idx, result in enumerate(results, start=1):
            result["rank"] = rank_idx

        logger.info(f"Top candidate: {results[0]['candidate_name']} ({results[0]['ats_score']})")
        return results

    def get_top_n(
        self,
        candidates: list[dict],
        job_description: str,
        top_n: int = 5,
        **kwargs,
    ) -> list[dict]:
        """Convenience method: rank and return only top N candidates."""
        ranked = self.rank(candidates, job_description, **kwargs)
        return ranked[:top_n]

    def generate_leaderboard(self, ranked_candidates: list[dict]) -> str:
        """
        Generate a formatted text leaderboard from ranked candidates.

        Returns:
            Multi-line string table
        """
        lines = [
            "=" * 65,
            f"{'RANK':<6} {'CANDIDATE':<25} {'ATS SCORE':<12} {'GRADE':<20}",
            "=" * 65,
        ]
        for c in ranked_candidates:
            lines.append(
                f"#{c['rank']:<5} {c['candidate_name']:<25} "
                f"{c['ats_score']:<12.1f} {c['ats_grade']}"
            )
        lines.append("=" * 65)
        return "\n".join(lines)
