export type ProjectId = string;

export type ResumeLink = {
  label: string;
  url: string;
};

export type ResumePerson = {
  name: string;
  role: string;
  location?: string;
  email?: string;
  phone?: string;
  links: ResumeLink[];
};

export type ExpertiseGroup = {
  label: string;
  skills: string[];
};

export type ResumeProject = {
  id: ProjectId;
  name: string;
  subtitle: string;
  summary: string;
  date: string;
  link?: string;
  technologies: string[];
  baselineBullets: string[];
};

export type ResumeExperience = {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  baselineBullets: string[];
  technologies: string[];
};

export type ResumeEducation = {
  institution: string;
  degree: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  details?: string[];
};

export type LanguageSkill = {
  language: string;
  level: string;
};

export type VolunteeringEntry = {
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type BaselineResume = {
  person: ResumePerson;
  profileStack: string[];
  expertise: ExpertiseGroup[];
  projects: ResumeProject[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  languages: LanguageSkill[];
  volunteering: VolunteeringEntry[];
};

export type TailoredResumeProject = Pick<
  ResumeProject,
  "id" | "name" | "subtitle" | "date" | "link" | "technologies"
> & {
  bullets: string[];
};

export type TailoredResumeExperience = Pick<
  ResumeExperience,
  "company" | "title" | "location" | "startDate" | "endDate" | "technologies"
> & {
  bullets: string[];
};

export type TailoredResume = {
  summary: string;
  keywordHighlights: string[];
  skills: string[];
  expertise: ExpertiseGroup[];
  experience: TailoredResumeExperience[];
  projects: TailoredResumeProject[];
  education: ResumeEducation[];
  languages: LanguageSkill[];
  volunteering: VolunteeringEntry[];
};

export type TailoredCoverLetter = {
  greeting: "Dear Hiring Team,";
  paragraphs: string[];
  closing: "Thank you for your consideration.";
  signoff: "Kind regards,";
  signature: string;
};

export type AtsAnalysis = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
};
