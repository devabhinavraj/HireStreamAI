const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ResumeProfile {
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience_years: number;
  education: string[];
  [key: string]: any;
}

export interface AnalyzeResult {
  candidate_name: string;
  email?: string;
  extracted_skills: string[];
  experience_years: number;
  education: string[];
  ats_score: number;
  ats_grade: string;
  match_percentage: number;
  component_scores: Record<string, any>;
  matched_skills: string[];
  missing_skills: string[];
  skill_gap_report: Record<string, any>;
}

export const api = {
  async uploadResume(file: File): Promise<ResumeProfile> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload resume');
    }

    const data = await response.json();
    return data.candidate;
  },

  async analyzeResume(resumeText: string, jobDescription: string): Promise<AnalyzeResult> {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to analyze resume');
    }

    return await response.json();
  },
};
