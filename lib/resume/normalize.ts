import type {
  AtsAnalysis,
  BaselineResume,
  ProjectId,
  TailoredCoverLetter,
  TailoredResume
} from "./types";

const DEFAULT_SUMMARY =
  "Full-Stack Developer with a strong frontend focus, building modern web applications and product features with React, Next.js, TypeScript, Python, C#/.NET, REST APIs, SQL, and cloud deployment tools.";

const DEFAULT_COVER_LETTER: TailoredCoverLetter = {
  greeting: "Dear Hiring Team,",
  paragraphs: [
    "I am excited to apply for this role. The opportunity to contribute to modern web applications, AI-oriented workflows, and user-focused digital products is especially appealing to me because it combines practical product development with technologies I have been actively building with.",
    "My background is in full stack development with a strong frontend focus and hands-on experience building modern web applications, backend APIs, and user-focused digital products. In my recent role at Lasken GmbH, I developed responsive React and Angular applications, built and maintained REST APIs using Python Flask and C#/.NET, and worked with MySQL, Docker, AWS, and GitHub in a collaborative development environment.",
    "I have also worked on projects that connect software development with AI-oriented workflows. In KnowYourRights, I built an AI-powered legal rights platform and integrated a privacy-first Ollama document helper to support scalable, source-backed user guidance.",
    "What attracts me most to this role is the chance to contribute in a structured team environment while continuing to grow technically. I would be excited to bring my development experience, strong learning mindset, and motivation to your team."
  ],
  closing: "Thank you for your consideration.",
  signoff: "Kind regards,",
  signature: "Mukul Sachdeva"
};

const DEFAULT_ATS_ANALYSIS: AtsAnalysis = {
  score: 70,
  summary:
    "Solid baseline match based on supported full-stack and frontend experience, with room to sharpen keywords for the target role.",
  strengths: [
    "Supported frontend stack and responsive web application experience.",
    "Relevant REST API integration and product implementation background."
  ],
  gaps: [
    "Some job-description requirements are not explicitly supported by the baseline resume."
  ],
  recommendations: [
    "Keep only factual keywords and emphasize the closest supported frontend, UX, and API experience."
  ]
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringArray(value: unknown, fallback: string[], min = 0, max = 99) {
  if (!Array.isArray(value)) {
    return fallback.slice(0, max);
  }

  const cleaned = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);

  return cleaned.length >= min ? cleaned : fallback.slice(0, max);
}

function recordArray(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : fallback;
}

export function normalizeGroqOutput({
  raw,
  baselineResume,
  selectedProjectIds
}: {
  raw: unknown;
  baselineResume: BaselineResume;
  selectedProjectIds: ProjectId[];
}): {
  resume: TailoredResume;
  coverLetter: TailoredCoverLetter;
  atsAnalysis: AtsAnalysis;
} {
  const root = isRecord(raw) ? raw : {};
  const rawResume = isRecord(root.resume) ? root.resume : root;
  const rawCoverLetter = isRecord(root.coverLetter) ? root.coverLetter : {};
  const rawAtsAnalysis = isRecord(root.atsAnalysis) ? root.atsAnalysis : {};

  const rawProjects = recordArray(rawResume.projects);
  const rawExperience = recordArray(rawResume.experience);
  const selectedIdSet = new Set<ProjectId>(selectedProjectIds);

  const projects = baselineResume.projects
    .filter((project) => selectedIdSet.has(project.id))
    .map((project) => {
      const draft = rawProjects.find((item) => item.id === project.id);

      return {
        id: project.id,
        name: project.name,
        subtitle: project.subtitle,
        date: project.date,
        link: project.link,
        technologies: project.technologies,
        bullets: stringArray(
          draft?.bullets,
          project.baselineBullets,
          2,
          2
        )
      };
    });

  const experience = baselineResume.experience.map((item) => {
    const draft = rawExperience.find(
      (entry) => entry.company === item.company && entry.title === item.title
    );

    return {
      company: item.company,
      title: item.title,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      technologies: item.technologies,
      bullets: stringArray(draft?.bullets, item.baselineBullets, 2, 2)
    };
  });

  const rawExpertise = recordArray(rawResume.expertise);
  const expertise = baselineResume.expertise.map((group) => {
    const draft = rawExpertise.find((entry) => entry.label === group.label);

    return {
      label: group.label,
      skills: stringArray(draft?.skills, group.skills, 1, group.skills.length)
    };
  });

  const coverParagraphs = stringArray(
    rawCoverLetter.paragraphs,
    DEFAULT_COVER_LETTER.paragraphs,
    4,
    5
  );
  const atsAnalysis: AtsAnalysis = {
    score: Math.min(
      100,
      Math.max(0, numberValue(rawAtsAnalysis.score, DEFAULT_ATS_ANALYSIS.score))
    ),
    summary: stringValue(
      rawAtsAnalysis.summary,
      DEFAULT_ATS_ANALYSIS.summary
    ).slice(0, 260),
    strengths: stringArray(
      rawAtsAnalysis.strengths,
      DEFAULT_ATS_ANALYSIS.strengths,
      1,
      4
    ),
    gaps: stringArray(
      rawAtsAnalysis.gaps,
      DEFAULT_ATS_ANALYSIS.gaps,
      1,
      4
    ),
    recommendations: stringArray(
      rawAtsAnalysis.recommendations,
      DEFAULT_ATS_ANALYSIS.recommendations,
      1,
      4
    )
  };

  return {
    resume: {
      summary: stringValue(rawResume.summary, DEFAULT_SUMMARY).slice(0, 520),
      keywordHighlights: stringArray(
        rawResume.keywordHighlights,
        baselineResume.profileStack,
        4,
        12
      ),
      skills: stringArray(rawResume.skills, baselineResume.profileStack, 6, 14),
      expertise,
      experience,
      projects,
      education: baselineResume.education,
      languages: baselineResume.languages,
      volunteering: baselineResume.volunteering
    },
    coverLetter: {
      greeting: "Dear Hiring Team,",
      paragraphs: coverParagraphs,
      closing: "Thank you for your consideration.",
      signoff: "Kind regards,",
      signature: baselineResume.person.name
    },
    atsAnalysis
  };
}
