import type { AtsAnalysis, BaselineResume, KeywordGap } from "./types";

type Requirement = {
  label: string;
  matchers: RegExp[];
  evidence: RegExp[];
  weight: number;
  gap: string;
  strength: string;
  recommendation: string;
  evidenceLabel?: string;
};

type RequirementResult = Requirement & {
  required: boolean;
  supported: boolean;
};

const requirementCatalog: Requirement[] = [
  {
    label: "React",
    matchers: [/\breact(?:\.js)?\b/i],
    evidence: [/\breact(?:\.js)?\b/i],
    weight: 8,
    gap: "React is requested but not strongly evidenced.",
    strength: "React experience is directly supported.",
    recommendation: "Keep React examples visible in the selected projects and experience.",
    evidenceLabel: "React appears in profile stack, projects, and experience."
  },
  {
    label: "Single-page applications",
    matchers: [/\bsingle[- ]page\b|\bspa\b|\bsingle-page-applikationen\b/i],
    evidence: [/\bsingle[- ]page\b|\bspa\b|\breact\b|\bnext\.js\b|\bangular\b|\bdashboard\b/i],
    weight: 7,
    gap: "Single-page application experience is requested but not strongly evidenced.",
    strength: "Single-page application work is supported through React, Angular, and dashboard experience.",
    recommendation: "Highlight React, Angular, and dashboard work as SPA-adjacent evidence.",
    evidenceLabel: "React, Angular, and dashboard work support SPA-style application development."
  },
  {
    label: "Progressive Web Apps",
    matchers: [/\bprogressive web apps?\b|\bpwa\b/i],
    evidence: [/\bpwa\b|\bprogressive web apps?\b|\bmobile-first\b|\boffline\b|\bself-hosting\b/i],
    weight: 7,
    gap: "Progressive Web App experience is requested but not strongly evidenced.",
    strength: "PWA experience is directly supported by the Tidy Team project.",
    recommendation: "Use Tidy Team to highlight PWA support, mobile-first UI, and real-world product behavior.",
    evidenceLabel: "Tidy Team includes PWA support, mobile-first UI, and self-hosting support."
  },
  {
    label: "Java",
    matchers: [/\bjava\b/i],
    evidence: [/\bjava\b/i],
    weight: 8,
    gap: "Java is requested, but the profile supports C# .NET and Python Flask rather than Java.",
    strength: "Java experience is directly supported.",
    recommendation: "Do not claim Java experience; position C# .NET and Python Flask as adjacent backend experience.",
    evidenceLabel: "No Java evidence found; closest backend evidence is C# .NET and Python Flask."
  },
  {
    label: "Angular",
    matchers: [/\bangular\b/i],
    evidence: [/\bangular\b/i],
    weight: 6,
    gap: "Angular is requested but not strongly evidenced.",
    strength: "Angular experience is directly supported.",
    recommendation: "Mention Angular only where it is already supported by experience."
  },
  {
    label: "Blazor",
    matchers: [/\bblazor\b/i],
    evidence: [/\bblazor\b/i],
    weight: 8,
    gap: "No direct Blazor experience is evidenced.",
    strength: "Blazor experience is directly supported.",
    recommendation: "Do not claim Blazor; position React, Angular, and C# .NET as adjacent UI/backend experience."
  },
  {
    label: "Vue",
    matchers: [/\bvue(?:\.js)?\b/i],
    evidence: [/\bvue(?:\.js)?\b/i],
    weight: 5,
    gap: "No direct Vue experience is evidenced.",
    strength: "Vue experience is directly supported.",
    recommendation: "Position React and Angular as transferable framework experience."
  },
  {
    label: "TypeScript",
    matchers: [/\btypescript\b/i],
    evidence: [/\btypescript\b/i],
    weight: 8,
    gap: "TypeScript is requested but not strongly evidenced.",
    strength: "TypeScript experience is directly supported.",
    recommendation: "Keep TypeScript in the summary, skills, and relevant projects."
  },
  {
    label: "JavaScript",
    matchers: [/\bjavascript\b|\bjs\b/i],
    evidence: [/\bjavascript\b|\btypescript\b|\breact\b|\bangular\b/i],
    weight: 6,
    gap: "JavaScript frontend work is requested but not strongly evidenced.",
    strength: "JavaScript frontend work is supported through React, Angular, and TypeScript.",
    recommendation: "Use JavaScript/TypeScript phrasing where the JD asks for frontend fundamentals."
  },
  {
    label: "HTML/CSS",
    matchers: [/\bhtml5?\b|\bcss3?\b/i],
    evidence: [/\bhtml\b|\bcss\b|\btailwind\b|\bbootstrap\b/i],
    weight: 5,
    gap: "HTML/CSS fundamentals are requested but not strongly evidenced.",
    strength: "HTML/CSS experience is supported through Tailwind and Bootstrap work.",
    recommendation: "Keep HTML, CSS, Tailwind, or Bootstrap in the expertise section."
  },
  {
    label: "Tailwind or shadcn/ui",
    matchers: [/\btailwind\b|\bshadcn\b/i],
    evidence: [/\btailwind\b|\bshadcn\b/i],
    weight: 5,
    gap: "Tailwind or shadcn/ui is requested but not strongly evidenced.",
    strength: "Tailwind/shadcn UI experience is supported.",
    recommendation: "Keep Tailwind or shadcn/ui in the frontend skills when relevant."
  },
  {
    label: "Responsive design",
    matchers: [/\bresponsive\b|\bmobile[- ]?first\b/i],
    evidence: [/\bresponsive\b|\bmobile[- ]?first\b|\bcross-device\b/i],
    weight: 7,
    gap: "Responsive design is requested but only lightly evidenced.",
    strength: "Responsive and mobile-first UI work is supported.",
    recommendation: "Mention responsive or mobile-first UI only in supported project/experience bullets."
  },
  {
    label: "Accessibility",
    matchers: [/\baccessibility\b|\bbarrierefrei/i],
    evidence: [/\baccessibility\b/i],
    weight: 6,
    gap: "Accessibility is requested but only lightly evidenced.",
    strength: "Accessibility appears in the supported UI/UX skill set.",
    recommendation: "Keep accessibility as a skill, but avoid claiming deep accessibility ownership."
  },
  {
    label: "Performance optimization",
    matchers: [/\bperformance\b|\boptimierung\b|\boptimization\b/i],
    evidence: [/\bperformance\b|\bfaster response\b|\boptimization\b/i],
    weight: 6,
    gap: "Performance optimization is requested but only partially evidenced.",
    strength: "Frontend performance and response-time improvements are supported.",
    recommendation: "Use performance wording in bullets tied to Lasken or IQVIA work."
  },
  {
    label: "UX/UI and design integration",
    matchers: [/\bux\b|\bui\b|\bdesign(?:prinzipien| principles)?\b|\bfigma\b/i],
    evidence: [/\bux\b|\bui\b|\bfigma\b|\buser flows\b|\busability\b/i],
    weight: 7,
    gap: "UX/UI or design integration is requested but only partially evidenced.",
    strength: "UX/UI, Figma, user flows, and usability are supported.",
    recommendation: "Frame UX/UI as practical implementation experience, not formal design ownership."
  },
  {
    label: "REST APIs",
    matchers: [/\brest\b|\bapi\b|\bapis\b/i],
    evidence: [/\brest\b|\bapi\b|\bapis\b|\bendpoints\b/i],
    weight: 8,
    gap: "API integration is requested but not strongly evidenced.",
    strength: "REST API and endpoint experience is directly supported.",
    recommendation: "Keep REST API work prominent in experience and IQVIA bullets."
  },
  {
    label: "GraphQL",
    matchers: [/\bgraphql\b/i],
    evidence: [/\bgraphql\b/i],
    weight: 6,
    gap: "No direct GraphQL experience is evidenced.",
    strength: "GraphQL experience is directly supported.",
    recommendation: "Do not add GraphQL unless it is genuinely part of the candidate profile."
  },
  {
    label: "Testing",
    matchers: [/\btesting\b|\bunit tests?\b|\bintegration tests?\b|\bjest\b|\bvitest\b|\brtl\b|\bcypress\b|\bplaywright\b|\be2e\b/i],
    evidence: [/\btesting\b|\bunit tests?\b|\bintegration tests?\b|\bjest\b|\bvitest\b|\brtl\b|\bcypress\b|\bplaywright\b|\be2e\b/i],
    weight: 8,
    gap: "Modern software testing or unit-test experience is not directly evidenced.",
    strength: "Software testing experience is directly supported.",
    recommendation: "Keep testing as an honest gap unless real unit, integration, or E2E testing evidence is added."
  },
  {
    label: "Clean code",
    matchers: [/\bclean code\b|\bclean-code\b/i],
    evidence: [/\bclean code\b|\bclean-code\b/i],
    weight: 4,
    gap: "Clean-code practice is requested but not explicitly evidenced.",
    strength: "Clean-code practice is directly supported.",
    recommendation: "Use implementation quality wording without claiming formal clean-code ownership."
  },
  {
    label: "CMS or WordPress",
    matchers: [/\bcms\b|\bwordpress\b|\bcontent management\b/i],
    evidence: [/\bcms\b|\bwordpress\b|\bcontent management\b/i],
    weight: 8,
    gap: "No direct CMS or WordPress experience is evidenced.",
    strength: "CMS or WordPress experience is directly supported.",
    recommendation: "Use general web development wording instead of claiming CMS or WordPress."
  },
  {
    label: "SEO",
    matchers: [/\bseo\b|\bsearch engine/i],
    evidence: [/\bseo\b|\bsearch engine/i],
    weight: 5,
    gap: "No direct SEO experience is evidenced.",
    strength: "SEO experience is directly supported.",
    recommendation: "Avoid claiming SEO ownership unless the profile is expanded with real evidence."
  },
  {
    label: "DevOps",
    matchers: [/\bdevops\b|\bci\/cd\b|\bdocker\b|\baws\b|\bdeployment\b/i],
    evidence: [/\bdevops\b|\bci\/cd\b|\bdocker\b|\baws\b|\bdeployment\b|\bgithub actions\b/i],
    weight: 6,
    gap: "DevOps or deployment culture is requested but only lightly evidenced.",
    strength: "Docker, AWS, GitHub Actions, and deployment workflow experience are supported.",
    recommendation: "Keep DevOps phrasing tied to Docker, AWS, GitHub Actions, or deployment workflows."
  },
  {
    label: "Azure DevOps",
    matchers: [/\bazure devops\b|\bazure\b/i],
    evidence: [/\bazure devops\b|\bazure\b/i],
    weight: 7,
    gap: "No direct Azure DevOps experience is evidenced.",
    strength: "Azure DevOps experience is directly supported.",
    recommendation: "Do not claim Azure DevOps; use GitHub, Docker, AWS, and deployment workflows as adjacent evidence."
  },
  {
    label: "Agile collaboration",
    matchers: [/\bagile\b|\bscrum\b|\bcross-functional\b|\binterdisciplinary\b|\bcode review\b|\bknowledge sharing\b|\bteam\b/i],
    evidence: [/\bcollaborative\b|\bteam\b|\bgithub\b|\bcode review\b|\bteam leader\b/i],
    weight: 5,
    gap: "Agile collaboration is requested but only lightly evidenced.",
    strength: "Collaborative team experience is supported.",
    recommendation: "Use team and collaboration wording without inventing formal Scrum ownership."
  },
  {
    label: "Agentic coding",
    matchers: [/\bagentic[- ]coding\b|\bclaude code\b|\bcodex\b|\bcursor\b/i],
    evidence: [/\bagentic[- ]coding\b|\bclaude code\b|\bcodex\b|\bcursor\b|\bai-assisted workflows\b|\blocal ai\b|\bollama\b/i],
    weight: 5,
    gap: "Specific agentic coding tools are not directly evidenced.",
    strength: "AI-assisted workflow experience is supported.",
    recommendation: "Use AI-assisted workflows as the truthful adjacent phrasing."
  },
  {
    label: "Public sector",
    matchers: [/\bpublic sector\b|\böffentliche(?:n|r|s)?\b|\bverwaltung\b|\bgovernment\b/i],
    evidence: [/\bpublic sector\b|\bgovernment\b|\blegal rights\b|\bconsumer-rights\b/i],
    weight: 5,
    gap: "Direct public-sector project experience is not evidenced.",
    strength: "Public-sector adjacent legal-rights product work is supported.",
    recommendation: "Position KnowYourRights as civic/legal-rights adjacent rather than public-sector employment."
  },
  {
    label: "Energy domain",
    matchers: [/\benergy\b|\benergie\b/i],
    evidence: [/\benergy\b|\benergie\b/i],
    weight: 4,
    gap: "No direct energy-domain experience is evidenced.",
    strength: "Energy-domain experience is directly supported.",
    recommendation: "Do not claim energy-domain experience unless the profile is expanded truthfully."
  },
  {
    label: "Logistics domain",
    matchers: [/\blogistics\b|\blogistik\b/i],
    evidence: [/\blogistics\b|\blogistik\b/i],
    weight: 5,
    gap: "No direct logistics-domain experience is evidenced.",
    strength: "Logistics-domain experience is directly supported.",
    recommendation: "Do not claim logistics-domain experience; focus on transferable web, API, and process-oriented software work."
  },
  {
    label: "English fluency",
    matchers: [/\bbusiness[- ]level fluency in english\b|\bfluent english\b|\benglish fluency\b/i],
    evidence: [/"language":"english","level":"(?:c1|c2|fluent)/i],
    weight: 8,
    gap: "Business-level English is requested but not evidenced.",
    strength: "Business-level English is supported by English C1.",
    recommendation: "Keep English C1 visible in the language section."
  },
  {
    label: "German fluency",
    matchers: [/\bsehr gute deutsch/i, /\bfluent german\b/i, /\bc1\b.*\bgerman\b/i, /\bc2\b.*\bgerman\b/i, /\bverhandlungssicher(?:e|es|er|en)? deutsch/i],
    evidence: [/"language":"german","level":"(?:c1|c2|fluent|verhandlungssicher)/i],
    weight: 10,
    gap: "The JD asks for strong German, while the profile lists German at B1.",
    strength: "German language ability is supported.",
    recommendation: "Keep German at B1 and let the score reflect the language gap honestly."
  }
];

function corpusFromProfile(profile: BaselineResume) {
  return JSON.stringify(profile).toLowerCase();
}

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function unique(items: string[], max: number) {
  return Array.from(new Set(items.filter(Boolean))).slice(0, max);
}

function removeContradictoryModelItems({
  items,
  matchedLabels,
  missingLabels
}: {
  items: string[];
  matchedLabels: string[];
  missingLabels: string[];
}) {
  const matched = matchedLabels.join(" ").toLowerCase();
  const missing = missingLabels.join(" ").toLowerCase();

  return items.filter((item) => {
    const text = item.toLowerCase();

    if (matched.includes("progressive web apps") && /\bpwa\b|progressive web apps?/i.test(text)) {
      return false;
    }

    if (matched.includes("single-page applications") && /\bspa\b|single[- ]page/i.test(text)) {
      return false;
    }

    if (missing.includes("java") && /\bjava\b/i.test(text)) {
      return false;
    }

    return true;
  });
}

function analyzeRequirements(jobDescription: string, profile: BaselineResume) {
  const jd = jobDescription.toLowerCase();
  const corpus = corpusFromProfile(profile);

  return requirementCatalog
    .map((requirement) => ({
      ...requirement,
      required: requirement.matchers.some((matcher) => matcher.test(jd)),
      supported: requirement.evidence.some((matcher) => matcher.test(corpus))
    }))
    .filter((result) => result.required);
}

function scoreFromRequirements(requirements: RequirementResult[]) {
  if (!requirements.length) {
    return 68;
  }

  const totalWeight = requirements.reduce((sum, item) => sum + item.weight, 0);
  const supportedWeight = requirements
    .filter((item) => item.supported)
    .reduce((sum, item) => sum + item.weight, 0);
  const unsupportedMustHaves = requirements.filter(
    (item) => !item.supported && item.weight >= 8
  ).length;
  const coverage = supportedWeight / totalWeight;

  return clampScore(45 + coverage * 50 - unsupportedMustHaves * 4);
}

function buildKeywordGaps(requirements: RequirementResult[]): KeywordGap[] {
  const rows = requirements.slice(0, 10).map((item) => ({
    keyword: item.label,
    present: item.supported,
    evidence: item.supported
      ? item.evidenceLabel ?? item.strength
      : item.evidenceLabel ?? item.gap,
    action: item.supported
      ? `Used in tailoring: ${item.recommendation}`
      : `Kept as an honest gap: ${item.recommendation}`
  }));

  return rows.length
    ? rows
    : [
        {
          keyword: "Target JD",
          present: false,
          evidence: "No known ATS keyword group was detected.",
          action: "Not applied yet: paste a detailed JD or add more requirement patterns to the ATS catalog."
        }
      ];
}

function buildReviewNotes({
  score,
  matched,
  missing
}: {
  score: number;
  matched: RequirementResult[];
  missing: RequirementResult[];
}) {
  const notes = [
    "RISE pass completed: role, instructions, steps, expectations, and constraints were applied before rewriting.",
    "XYZ/CAR pass completed: bullets are pushed toward action-result wording without invented metrics.",
    missing.length
      ? `Keyword gap pass found unsupported requirements: ${missing
          .map((item) => item.label)
          .slice(0, 3)
          .join(", ")}.`
      : "Keyword gap pass found no major unsupported detected requirements.",
    matched.length
      ? `Evidence pass matched strongest signals: ${matched
          .map((item) => item.label)
          .slice(0, 3)
          .join(", ")}.`
      : "Evidence pass did not find strong detected keyword matches.",
    score >= 75
      ? "Recruiter self-review: score is above the target threshold; keep factual gaps transparent."
      : "Recruiter self-review: score is below the target threshold; strengthen supported keywords before applying."
  ];

  return notes.slice(0, 5);
}

export function calibrateAtsAnalysis({
  modelAnalysis,
  baselineResume,
  jobDescription
}: {
  modelAnalysis: AtsAnalysis;
  baselineResume: BaselineResume;
  jobDescription: string;
}): AtsAnalysis {
  const requirements = analyzeRequirements(jobDescription, baselineResume);
  const evidenceScore = scoreFromRequirements(requirements);
  const matched = requirements.filter((item) => item.supported);
  const missing = requirements.filter((item) => !item.supported);
  const calibratedScore = clampScore(modelAnalysis.score * 0.35 + evidenceScore * 0.65);
  const matchedLabels = matched.map((item) => item.label).slice(0, 5);
  const missingLabels = missing.map((item) => item.label).slice(0, 5);
  const modelStrengths = removeContradictoryModelItems({
    items: modelAnalysis.strengths,
    matchedLabels,
    missingLabels
  });
  const modelGaps = removeContradictoryModelItems({
    items: modelAnalysis.gaps,
    matchedLabels,
    missingLabels
  });
  const modelRecommendations = removeContradictoryModelItems({
    items: modelAnalysis.recommendations,
    matchedLabels,
    missingLabels
  });
  const keywordGaps = buildKeywordGaps(requirements);
  const reviewNotes = buildReviewNotes({
    score: calibratedScore,
    matched,
    missing
  });

  return {
    score: calibratedScore,
    summary:
      missingLabels.length > 0
        ? `Evidence-based match: strong on ${matchedLabels.join(", ") || "core web skills"}, weaker on ${missingLabels.join(", ")}.`
        : `Evidence-based match: strong coverage across ${matchedLabels.join(", ") || "the detected JD requirements"}.`,
    strengths: unique(
      [
        ...matched.map((item) => item.strength),
        ...modelStrengths
      ],
      4
    ),
    gaps: unique(
      [
        ...missing.map((item) => item.gap),
        ...modelGaps
      ],
      4
    ),
    recommendations: unique(
      [
        ...missing.map((item) => item.recommendation),
        ...modelRecommendations
      ],
      4
    ),
    keywordGaps,
    reviewNotes
  };
}
