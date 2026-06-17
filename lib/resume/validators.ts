import { z } from "zod";

export const projectIdSchema = z.string().trim().min(1);

export const optimizeResumeInputSchema = z.object({
  jobDescription: z.string().trim().min(120),
  selectedProjectIds: z.array(projectIdSchema).min(1).max(12),
  groqApiKey: z.string().trim().min(20).optional(),
  candidateProfile: z.unknown().optional()
});

const expertiseGroupSchema = z.object({
  label: z.string(),
  skills: z.array(z.string()).min(1)
});

const tailoredExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  technologies: z.array(z.string()),
  bullets: z.array(z.string()).min(2).max(4)
});

const tailoredProjectSchema = z.object({
  id: projectIdSchema,
  name: z.string(),
  subtitle: z.string(),
  date: z.string(),
  link: z.string().optional(),
  technologies: z.array(z.string()),
  bullets: z.array(z.string()).min(2).max(4)
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  details: z.array(z.string()).optional()
});

const languageSchema = z.object({
  language: z.string(),
  level: z.string()
});

const volunteeringSchema = z.object({
  title: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()).min(1)
});

export const tailoredResumeSchema = z.object({
  summary: z.string().min(40).max(520),
  keywordHighlights: z.array(z.string()).min(4).max(12),
  skills: z.array(z.string()).min(6).max(14),
  expertise: z.array(expertiseGroupSchema).min(3).max(6),
  experience: z.array(tailoredExperienceSchema).min(1).max(3),
  projects: z.array(tailoredProjectSchema).min(1).max(12),
  education: z.array(educationSchema).min(1).max(3),
  languages: z.array(languageSchema).min(1),
  volunteering: z.array(volunteeringSchema).min(0)
});

export const tailoredCoverLetterSchema = z.object({
  greeting: z.literal("Dear Hiring Team,"),
  paragraphs: z.array(z.string().min(80).max(620)).min(4).max(5),
  closing: z.literal("Thank you for your consideration."),
  signoff: z.literal("Kind regards,"),
  signature: z.string().min(2).max(120)
});

const keywordGapSchema = z.object({
  keyword: z.string().min(2).max(80),
  present: z.boolean(),
  evidence: z.string().min(2).max(180),
  action: z.string().min(2).max(180)
});

export const atsAnalysisSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string().min(20).max(260),
  strengths: z.array(z.string().min(5).max(160)).min(1).max(4),
  gaps: z.array(z.string().min(5).max(160)).min(1).max(4),
  recommendations: z.array(z.string().min(5).max(180)).min(1).max(4),
  keywordGaps: z.array(keywordGapSchema).min(1).max(10),
  reviewNotes: z.array(z.string().min(5).max(180)).min(1).max(5)
});

export const groqJsonResponseSchema = z.object({
  resume: tailoredResumeSchema,
  coverLetter: tailoredCoverLetterSchema,
  atsAnalysis: atsAnalysisSchema.optional()
});
