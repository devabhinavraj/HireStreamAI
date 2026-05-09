'use server';
/**
 * @fileOverview An AI agent for parsing resumes, calculating ATS scores, and identifying skill gaps.
 *
 * - aiResumeParsingAndAtsScoring - A function that handles the AI resume parsing and ATS scoring process.
 * - AiResumeParsingAndAtsScoringInput - The input type for the aiResumeParsingAndAtsScoring function.
 * - AiResumeParsingAndAtsScoringOutput - The return type for the aiResumeParsingAndAtsScoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiResumeParsingAndAtsScoringInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume in PDF/DOCX format, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z
    .string()
    .optional()
    .describe('An optional job description to compare the resume against.'),
});
export type AiResumeParsingAndAtsScoringInput = z.infer<
  typeof AiResumeParsingAndAtsScoringInputSchema
>;

const AiResumeParsingAndAtsScoringOutputSchema = z.object({
  name: z.string().describe("The candidate's full name."),
  email: z.string().email().optional().describe("The candidate's email address."),
  phone: z.string().optional().describe("The candidate's phone number."),
  linkedin: z.string().url().optional().describe("The candidate's LinkedIn profile URL."),
  skills: z.array(z.string()).describe('A list of skills extracted from the resume.'),
  education: z
    .array(
      z.object({
        institution: z.string().describe('The name of the educational institution.'),
        degree: z.string().describe('The degree obtained (e.g., B.S. in Computer Science).'),
        dates: z.string().describe('The start and end dates of attendance (e.g., 2018 - 2022).'),
      })
    )
    .describe('A list of educational achievements.'),
  experience: z
    .array(
      z.object({
        title: z.string().describe('The job title.'),
        company: z.string().describe('The company name.'),
        dates: z.string().describe('The start and end dates of employment (e.g., 2022 - Present).'),
        description: z
          .string()
          .describe('A brief description of responsibilities and achievements.'),
      })
    )
    .describe('A list of work experiences.'),
  projects: z
    .array(
      z.object({
        name: z.string().describe('The project name.'),
        description: z.string().describe('A brief description of the project.'),
        technologies: z.array(z.string()).describe('Technologies used in the project.'),
      })
    )
    .optional()
    .describe('A list of personal or professional projects.'),
  atsScore: z
    .number()
    .min(0)
    .max(100)
    .describe('An Applicant Tracking System (ATS) compatibility score out of 100.'),
  strengths: z
    .array(z.string())
    .describe('Key strengths identified in the resume.'),
  missingSkills: z
    .array(z.string())
    .describe(
      'A list of skills that are missing based on general job market demand or the provided job description.'
    ),
});
export type AiResumeParsingAndAtsScoringOutput = z.infer<
  typeof AiResumeParsingAndAtsScoringOutputSchema
>;

export async function aiResumeParsingAndAtsScoring(
  input: AiResumeParsingAndAtsScoringInput
): Promise<AiResumeParsingAndAtsScoringOutput> {
  return aiResumeParsingAndAtsScoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeParsingAndAtsScoringPrompt',
  input: {schema: AiResumeParsingAndAtsScoringInputSchema},
  output: {schema: AiResumeParsingAndAtsScoringOutputSchema},
  prompt: `You are an expert resume parser and ATS (Applicant Tracking System) analyst.
Your task is to analyze the provided resume and, optionally, a job description.

Extract all key information from the resume including:
- Full Name
- Email
- Phone
- LinkedIn Profile URL
- Skills
- Education (Institution, Degree, Dates)
- Experience (Title, Company, Dates, Description)
- Projects (Name, Description, Technologies)

Based on the extracted information, calculate an ATS compatibility score between 0 and 100. This score should reflect how well the resume is optimized for automated screening systems, considering factors like keyword density, formatting, and completeness.

Identify the main strengths of the resume.

If a job description is provided, identify any skills mentioned in the job description that are NOT present in the resume. If no job description is provided, identify general in-demand skills for the current job market that are missing from the resume.

Provide all extracted data and analysis in a structured JSON format according to the output schema. Ensure all fields are populated correctly.

Resume: {{media url=resumeDataUri}}

{{#if jobDescription}}
Job Description: {{{jobDescription}}}
{{/if}}
`,
});

const aiResumeParsingAndAtsScoringFlow = ai.defineFlow(
  {
    name: 'aiResumeParsingAndAtsScoringFlow',
    inputSchema: AiResumeParsingAndAtsScoringInputSchema,
    outputSchema: AiResumeParsingAndAtsScoringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
