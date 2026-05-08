# **App Name**: HireStream AI

## Core Features:

- AI-Powered Resume Processing & ATS Scoring: Utilize AI tools for advanced resume parsing to extract detailed candidate information (skills, education, experience, projects) from PDF/DOCX files. Automatically generate and display ATS compatibility scores, strengths, and identify missing skills.
- Intelligent Job Matching & Recommendations: Analyze parsed resume data to intelligently match candidates with relevant job opportunities using AI models. Display match scores, salary ranges, required skills, and provide options to filter, search, and sort job listings.
- Comprehensive Recruiter Dashboard: Provide a dedicated dashboard for recruiters to upload multiple resumes, automatically rank candidates, perform side-by-side comparisons, shortlist applicants, and generate downloadable reports.
- Interactive Analytics & Skill Gap Analysis: Offer modern, animated charts and graphs (via Recharts) for insights into candidate score distribution, top skills, and hiring trends. Use AI tools to identify individual skill gaps, recommend courses, and suggest learning roadmaps.
- Secure Authentication & Role-Based Access: Implement robust user authentication (Clerk/Auth.js) with distinct login and signup flows, ensuring secure access and role-based permissions for both candidate and recruiter profiles.
- Premium UI with Dark/Light Mode: Deliver a production-quality, responsive user interface featuring a modern SaaS aesthetic with glassmorphism, gradients, smooth Framer Motion animations, and full support for both dark and light modes using Next.js, TailwindCSS, and shadcn/ui.
- Streamlined Resume Upload Interface: Offer an intuitive drag-and-drop interface for uploading PDF/DOCX resumes, complete with animated loading states, AI processing effects, and upload progress bars.

## Style Guidelines:

- Main color theme combines a deep purple and vibrant cyan. Primary elements and interactive components will leverage Primary Purple (#9B99FE) for a soft lavender effect and Primary Cyan Aqua Mint (#2BC8B7) as an accent, especially for gradients and highlights. Text and borders will follow the provided neutral palette.
- Background for Dark Mode is Zinc Black (#09090B), complemented by slightly lighter zinc shades for cards (rgba(9,9,11,0.5)) and borders (rgba(255,255,255,0.1)). Light Mode utilizes a White background (#FFFFFF) with Light Zinc (#FAFAFA) card backgrounds.
- Typography in Dark Mode is set to White (#FFFFFF) with Muted Text in A1A1AA. In Light Mode, primary text is a near black (#18181B) and secondary text is Gray Zinc (#71717A).
- Body and headline font: 'Inter', a modern sans-serif that offers excellent readability and a neutral, objective aesthetic, aligning perfectly with a clean AI SaaS dashboard. This font is suitable for both large headlines and detailed body text across the application.
- Utilize 'Lucide React' icons for a consistent, crisp, and modern vector icon set, integrating seamlessly into the minimalist UI design with premium gradients.
- Embrace a fully responsive, mobile-first design philosophy. UI components feature generous rounded corners (rounded-3xl), soft shadows, and transparent overlays, applying a glassmorphism effect to card elements, particularly on darker backgrounds to enhance depth and modernity.
- Incorporate smooth Framer Motion animations for transitions, hovers, loading states, and dynamic elements across the dashboard. Loading skeletons will provide a fluid user experience during data fetching.