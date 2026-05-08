'use server';
/**
 * @fileOverview An AI agent for matching candidates with job opportunities.
 *
 * - aiJobMatchingAndRecommendations - A function that handles the job matching process.
 * - JobMatchingInput - The input type for the aiJobMatchingAndRecommendations function.
 * - JobMatchingOutput - The return type for the aiJobMatchingAndRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CandidateProfileSchema = z.object({
  name: z.string().describe('The name of the candidate.'),
  skills: z.array(z.string()).describe('A list of skills the candidate possesses.'),
  education: z.array(z.string()).describe('A list of the candidate\'s educational background.'),
  experience: z.array(z.string()).describe('A list of the candidate\'s work experience.'),
  projects: z.array(z.string()).optional().describe('A list of projects the candidate has worked on.'),
});

const JobPostingSchema = z.object({
  id: z.string().describe('Unique identifier for the job posting.'),
  companyName: z.string().describe('The name of the company offering the job.'),
  role: z.string().describe('The job role or title.'),
  requiredSkills: z.array(z.string()).describe('A list of skills required for the job.'),
  description: z.string().describe('A detailed description of the job.'),
  salaryRange: z.string().optional().describe('The salary range for the position.'),
});

const JobMatchingInputSchema = z.object({
  candidateProfile: CandidateProfileSchema.describe('The parsed profile of the candidate.'),
  jobPostings: z.array(JobPostingSchema).describe('A list of available job postings.'),
});
export type JobMatchingInput = z.infer<typeof JobMatchingInputSchema>;

const RecommendedJobSchema = JobPostingSchema.extend({
  matchScore: z.number().describe('The percentage match score between the candidate and the job.'),
});

const JobMatchingOutputSchema = z.object({
  recommendedJobs: z.array(RecommendedJobSchema).describe('A list of job postings with their calculated match scores.'),
});
export type JobMatchingOutput = z.infer<typeof JobMatchingOutputSchema>;

export async function aiJobMatchingAndRecommendations(input: JobMatchingInput): Promise<JobMatchingOutput> {
  return aiJobMatchingAndRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiJobMatchingAndRecommendationsPrompt',
  input: { schema: JobMatchingInputSchema },
  output: { schema: JobMatchingOutputSchema },
  prompt: `You are an expert HR recruiter and job matching AI. Your task is to analyze a candidate's profile and match them with suitable job opportunities from a provided list. For each job, calculate a match score (0-100) based on how well the candidate's skills, education, and experience align with the job's requirements.

Candidate Profile:
Name: {{{candidateProfile.name}}}
Skills: {{#each candidateProfile.skills}}- {{{this}}}{{/each}}
Education: {{#each candidateProfile.education}}- {{{this}}}{{/each}}
Experience: {{#each candidateProfile.experience}}- {{{this}}}{{/each}}
{{#if candidateProfile.projects}}Projects: {{#each candidateProfile.projects}}- {{{this}}}{{/each}}{{/if}}

Job Postings to evaluate:
{{#each jobPostings}}
--- Job ID: {{{id}}} ---
Company: {{{companyName}}}
Role: {{{role}}}
Required Skills: {{#each requiredSkills}}- {{{this}}}{{/each}}
Description: {{{description}}}
{{#if salaryRange}}Salary Range: {{{salaryRange}}}{{/if}}

After analyzing each job, provide a match score. Focus on a strong match between candidate's abilities and job requirements.
{{/each}}

Provide the output in the specified JSON format, ensuring each recommended job includes its match score.`,
});

const aiJobMatchingAndRecommendationsFlow = ai.defineFlow(
  {
    name: 'aiJobMatchingAndRecommendationsFlow',
    inputSchema: JobMatchingInputSchema,
    outputSchema: JobMatchingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
