import type {
  AtsAnalysis,
  BaselineResume,
  ProjectId,
  TailoredCoverLetter,
  TailoredResume
} from "./types";

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
  ],
  keywordGaps: [
    {
      keyword: "Target JD",
      present: false,
      evidence: "No target job description has been analyzed yet.",
      action: "Not applied yet: paste a JD and optimize to build the keyword gap table."
    }
  ],
  reviewNotes: [
    "Run optimization to review weak bullets, keyword coverage, and factual gaps."
  ]
};

function createDefaultSummary(profile: BaselineResume) {
  return `${profile.person.role} experienced with ${profile.profileStack
    .slice(0, 8)
    .join(", ")} across ${profile.experience.length ? "professional and project" : "project"} work.`;
}

function createDefaultCoverLetter(profile: BaselineResume): TailoredCoverLetter {
  const primaryExperience = profile.experience[0];
  const primaryProject = profile.projects[0];
  const primaryStack = profile.profileStack.slice(0, 6).join(", ");

  return {
    greeting: "Dear Hiring Team,",
    paragraphs: [
      `I am excited to apply for this role because it connects closely with my background in ${primaryStack || "software development"} and user-focused digital product work.`,
      primaryExperience
        ? `My experience as ${primaryExperience.title} at ${primaryExperience.company} involved ${primaryExperience.technologies.slice(0, 6).join(", ")} across implementation and delivery work.`
        : "My experience includes hands-on implementation work across software projects, collaboration, and delivery.",
      primaryProject
        ? `I have also built projects such as ${primaryProject.name}, which reflect my ability to turn technical requirements into practical software.`
        : "I have also built project work that reflects my ability to turn technical requirements into practical software.",
      "I would be excited to bring my technical foundation, learning mindset, and motivation to contribute meaningfully to your team."
    ],
    closing: "Thank you for your consideration.",
    signoff: "Kind regards,",
    signature: profile.person.name
  };
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resumeSummary(value: unknown, fallback: string) {
  return stringValue(value, fallback)
    .replace(/^highly motivated\s+/i, "")
    .replace(
      /,?\s+(?:seeking|looking for|applying for|interested in)\b[\s\S]*$/i,
      ""
    )
    .replace(/\s+/g, " ")
    .replace(/\s+\.$/, ".")
    .trim()
    .slice(0, 520);
}

function coverLetterParagraph(value: string) {
  return value
    .replace(/\bcurrent role at Lasken GmbH\b/gi, "previous role at Lasken GmbH")
    .replace(/\bcurrent role at Lasken\b/gi, "previous role at Lasken")
    .replace(/\bWebprogrammierer(?:in)?\b/gi, "Web Developer")
    .replace(/\bSoftwareentwickler(?:in)?\b/gi, "Software Developer")
    .replace(/\bSingle-Page-Applikationen\b/gi, "single-page applications")
    .replace(/\bProgressive Web Apps\b/g, "progressive web apps")
    .replace(/\babwechslungsreiche(?:n|r|s)? Projekte\b/gi, "varied projects")
    .replace(/\bmotivierte(?:n|s|r)? Team\b/gi, "motivated team")
    .replace(/\bflexible Arbeitszeiten\b/gi, "flexible working hours")
    .replace(/\bhohe(?:n|r|s)? Homeoffice-Anteil\b/gi, "strong remote-work flexibility")
    .replace(/\bHomeoffice-Anteil\b/gi, "remote-work flexibility")
    .replace(/\bArbeitszeiten\b/gi, "working hours")
    .replace(/\bApplikationen\b/gi, "applications")
    .replace(/\bAnforderungen\b/gi, "requirements")
    .replace(/\bDeutschkenntnisse\b/gi, "German language skills")
    .replace(/\bKenntnisse\b/gi, "skills")
    .replace(/\bKunden\b/gi, "customers")
    .replace(/\bmitarbeiter(?:in|innen)?\b/gi, "team members")
    .replace(/\bBlazor\b/gi, "React and Angular")
    .replace(/\bAzure DevOps\b/gi, "GitHub, Docker, and AWS deployment workflows")
    .replace(/\bunit ?tests?\b|\bunittests?\b/gi, "implementation quality practices")
    .replace(/\bclean code\b/gi, "implementation quality")
    .replace(/\s+/g, " ")
    .trim();
}

function isCoverLetterClosingParagraph(value: string) {
  return /^thank you\b/i.test(value) || /^i look forward to\b/i.test(value);
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

function keywordGapArray(value: unknown, fallback: AtsAnalysis["keywordGaps"]) {
  const cleaned = recordArray(value)
    .map((item) => ({
      keyword: stringValue(item.keyword).slice(0, 80),
      present: typeof item.present === "boolean" ? item.present : false,
      evidence: stringValue(item.evidence, "No evidence found.").slice(0, 180),
      action: stringValue(
        item.action,
        "Kept as an honest gap unless profile evidence exists."
      ).slice(0, 180)
    }))
    .filter((item) => item.keyword)
    .slice(0, 10);

  return cleaned.length ? cleaned : fallback;
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
  const defaultCoverLetter = createDefaultCoverLetter(baselineResume);

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
    defaultCoverLetter.paragraphs,
    4,
    5
  )
    .map(coverLetterParagraph)
    .filter((paragraph) => paragraph && !isCoverLetterClosingParagraph(paragraph));
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
    ),
    keywordGaps: keywordGapArray(
      rawAtsAnalysis.keywordGaps,
      DEFAULT_ATS_ANALYSIS.keywordGaps
    ),
    reviewNotes: stringArray(
      rawAtsAnalysis.reviewNotes,
      DEFAULT_ATS_ANALYSIS.reviewNotes,
      1,
      5
    )
  };

  return {
    resume: {
      summary: resumeSummary(
        rawResume.summary,
        createDefaultSummary(baselineResume)
      ),
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
