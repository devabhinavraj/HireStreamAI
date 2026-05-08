'use server';
/**
 * @fileOverview This file provides an AI-powered skill gap analysis and improvement suggestion flow.
 *
 * - analyzeSkillGaps - A function that analyzes a resume for skill gaps and suggests improvements/courses.
 * - AiSkillGapAnalysisInput - The input type for the analyzeSkillGaps function.
 * - AiSkillGapAnalysisOutput - The return type for the analyzeSkillGaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSkillGapAnalysisInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The candidate's resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  desiredCareerPath: z
    .string()
    .describe(
      'The specific career path the candidate is aspiring to (e.g., "Software Engineer", "Data Scientist").'
    ),
});
export type AiSkillGapAnalysisInput = z.infer<
  typeof AiSkillGapAnalysisInputSchema
>;

const AiSkillGapAnalysisOutputSchema = z.object({
  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe(
            'The specific skill identified as a gap for the desired career path.'
          ),
        description: z
          .string()
          .describe(
            'A brief explanation of why this skill is a gap and its importance for the desired career path.'
          ),
      })
    )
    .describe(
      "A list of skills that are missing or weak on the resume relative to the desired career path."
    ),
  recommendedCourses: z
    .array(
      z.object({
        courseName: z
          .string()
          .describe('The name of a recommended online course or learning resource.'),
        platform: z
          .string()
          .describe('The platform where the course is available (e.g., Coursera, Udemy, edX).'),
        reason: z
          .string()
          .describe(
            'A short justification for why this course is recommended to bridge a specific skill gap.'
          ),
      })
    )
    .describe(
      "A list of recommended courses or learning resources to address identified skill gaps."
    ),
  improvementSuggestions: z
    .array(
      z
        .string()
        .describe('A general suggestion for resume improvement or career development.')
    )
    .describe(
      "General advice and actionable suggestions to enhance the candidate's profile and increase hiring chances."
    ),
});
export type AiSkillGapAnalysisOutput = z.infer<
  typeof AiSkillGapAnalysisOutputSchema
>;

const skillGapAnalysisPrompt = ai.definePrompt({
  name: 'skillGapAnalysisPrompt',
  input: {schema: AiSkillGapAnalysisInputSchema},
  output: {schema: AiSkillGapAnalysisOutputSchema},
  prompt: `You are an AI career counselor and skill analyst. Your task is to review a candidate's resume and their desired career path, identify any skill gaps, and provide actionable recommendations for improvement, including specific courses.

Analyze the provided resume content and the candidate's desired career path carefully.

Desired Career Path: {{{desiredCareerPath}}}

Resume: {{media url=resumeDataUri}}

Identify skills present in the resume. Then, compare these skills against the typical requirements for the '{{{desiredCareerPath}}}'.
List any significant skill gaps that would hinder the candidate's success in this path. For each gap, explain its importance.
Based on the identified skill gaps, suggest specific online courses or learning resources that would help the candidate acquire or strengthen those skills. For each course, mention the platform and the reason for the recommendation.
Finally, provide general actionable suggestions to improve the candidate's resume and overall profile for their desired career.

Format your output as a JSON object matching the following schema:
{{json_schema AiSkillGapAnalysisOutputSchema}}`,
});

const aiSkillGapAnalysisFlow = ai.defineFlow(
  {
    name: 'aiSkillGapAnalysisFlow',
    inputSchema: AiSkillGapAnalysisInputSchema,
    outputSchema: AiSkillGapAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await skillGapAnalysisPrompt(input);
    return output!;
  }
);

export async function analyzeSkillGaps(
  input: AiSkillGapAnalysisInput
): Promise<AiSkillGapAnalysisOutput> {
  return aiSkillGapAnalysisFlow(input);
}
