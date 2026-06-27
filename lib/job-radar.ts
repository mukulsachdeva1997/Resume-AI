import type { BaselineResume } from "@/lib/resume/types";

export type JobRadarFit = "Strong fit" | "Medium fit" | "Reach" | "Skip";

export type JobRadarJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  source: string;
  postedAt: string;
  description: string;
  score: number;
  fit: JobRadarFit;
  recommendation: string;
  applyReason: string;
  strongSignals: string[];
  gaps: string[];
  matchedKeywords: string[];
};

type RawArbeitnowJob = {
  slug?: string;
  company_name?: string;
  title?: string;
  description?: string;
  remote?: boolean;
  url?: string;
  tags?: string[];
  job_types?: string[];
  location?: string;
  created_at?: number;
};

type KeywordRule = {
  label: string;
  matchers: RegExp[];
  evidence: RegExp[];
  weight: number;
  strength: string;
  gap: string;
};

const supportedRules: KeywordRule[] = [
  {
    label: "React",
    matchers: [/\breact(?:\.js)?\b/i],
    evidence: [/\breact(?:\.js)?\b/i],
    weight: 9,
    strength: "React is directly supported by professional and project work.",
    gap: "React is requested but not evidenced."
  },
  {
    label: "Angular",
    matchers: [/\bangular\b/i],
    evidence: [/\bangular\b/i],
    weight: 8,
    strength: "Angular is directly supported.",
    gap: "Angular is requested but not evidenced."
  },
  {
    label: "TypeScript",
    matchers: [/\btypescript\b|\bts\b/i],
    evidence: [/\btypescript\b/i],
    weight: 8,
    strength: "TypeScript is directly supported.",
    gap: "TypeScript is requested but not evidenced."
  },
  {
    label: "JavaScript",
    matchers: [/\bjavascript\b|\bjs\b/i],
    evidence: [/\bjavascript\b|\btypescript\b|\breact\b|\bangular\b/i],
    weight: 6,
    strength: "JavaScript/frontend fundamentals are supported through React, Angular, and TypeScript.",
    gap: "JavaScript is requested but not evidenced."
  },
  {
    label: "C# .NET",
    matchers: [/\bc#\b|\b\.net\b|\bdotnet\b/i],
    evidence: [/\bc#\b|\b\.net\b|\bdotnet\b/i],
    weight: 9,
    strength: "C# .NET backend experience is directly supported.",
    gap: "C# .NET is requested but not evidenced."
  },
  {
    label: "Python",
    matchers: [/\bpython\b|\bflask\b|\bfastapi\b/i],
    evidence: [/\bpython\b|\bflask\b|\bfastapi\b/i],
    weight: 7,
    strength: "Python/Flask experience is supported.",
    gap: "Python is requested but not evidenced."
  },
  {
    label: "REST APIs",
    matchers: [/\brest\b|\bapi\b|\bapis\b|\bendpoints?\b/i],
    evidence: [/\brest\b|\bapi\b|\bapis\b|\bendpoints?\b/i],
    weight: 8,
    strength: "REST API and endpoint work is directly supported.",
    gap: "API work is requested but not evidenced."
  },
  {
    label: "SQL",
    matchers: [/\bsql\b|\bmysql\b|\bpostgres(?:ql)?\b|\bdatabase\b/i],
    evidence: [/\bsql\b|\bmysql\b|\bpostgres(?:ql)?\b|\bdatabase\b/i],
    weight: 7,
    strength: "SQL/database work is supported.",
    gap: "SQL/database work is requested but not evidenced."
  },
  {
    label: "DevOps",
    matchers: [/\bdocker\b|\baws\b|\bci\/cd\b|\bgithub actions\b|\bdeployment\b|\bdevops\b/i],
    evidence: [/\bdocker\b|\baws\b|\bci\/cd\b|\bgithub actions\b|\bdeployment\b|\bdevops\b/i],
    weight: 6,
    strength: "Docker, AWS, GitHub Actions, and deployment workflows are supported.",
    gap: "DevOps/cloud deployment is requested but only lightly evidenced."
  },
  {
    label: "AI / NLP",
    matchers: [/\bai\b|\bmachine learning\b|\bml\b|\bnlp\b|\bollama\b|\bllm\b/i],
    evidence: [/\bai\b|\bmachine learning\b|\bml\b|\bnlp\b|\bollama\b|\bllm\b/i],
    weight: 6,
    strength: "AI/NLP-adjacent project evidence is supported.",
    gap: "AI/ML is requested but not evidenced."
  }
];

const blockerRules: KeywordRule[] = [
  {
    label: "Strong German",
    matchers: [/\bsehr gute deutsch/i, /\bfluent german\b/i, /\bc1\b.*\bgerman\b/i, /\bc2\b.*\bgerman\b/i, /\bverhandlungssicher(?:e|es|er|en)? deutsch/i],
    evidence: [/"language":"german","level":"(?:c1|c2|fluent|verhandlungssicher)/i],
    weight: 18,
    strength: "Strong German is supported.",
    gap: "JD asks for strong German, while the profile lists German at B1."
  },
  {
    label: "Java / Spring",
    matchers: [/\bjava\b|\bspring\b|\bspring boot\b/i],
    evidence: [/\bjava\b|\bspring\b|\bspring boot\b/i],
    weight: 12,
    strength: "Java/Spring is supported.",
    gap: "Java/Spring is requested but not supported by the baseline."
  },
  {
    label: "Testing",
    matchers: [/\bunit tests?\b|\bintegration tests?\b|\bjest\b|\bvitest\b|\bcypress\b|\bplaywright\b|\be2e\b/i],
    evidence: [/\bunit tests?\b|\bintegration tests?\b|\bjest\b|\bvitest\b|\bcypress\b|\bplaywright\b|\be2e\b/i],
    weight: 10,
    strength: "Software testing is supported.",
    gap: "Modern software testing is requested but not directly evidenced."
  },
  {
    label: "Azure / Blazor",
    matchers: [/\bazure\b|\bazure devops\b|\bblazor\b/i],
    evidence: [/\bazure\b|\bazure devops\b|\bblazor\b/i],
    weight: 10,
    strength: "Azure or Blazor is supported.",
    gap: "Azure or Blazor is requested but not directly evidenced."
  },
  {
    label: "Senior level",
    matchers: [/\bsenior\b|\blead\b|\bprincipal\b|\b5\+?\s*years\b|\b4\+?\s*years\b|\bmehrjährige\b/i],
    evidence: [/\bsenior\b|\blead\b|\bprincipal\b|\b5\+?\s*years\b|\b4\+?\s*years\b/i],
    weight: 14,
    strength: "Senior-level experience is supported.",
    gap: "Role appears senior or multi-year heavy compared with the baseline."
  }
];

function profileCorpus(profile: BaselineResume) {
  return JSON.stringify(profile).toLowerCase();
}

function textFromHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&uuml;/g, "ü")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&szlig;/g, "ß")
    .replace(/\s+/g, " ")
    .trim();
}

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function unique(items: string[], max: number) {
  return Array.from(new Set(items.filter(Boolean))).slice(0, max);
}

function fitFromScore(score: number): JobRadarFit {
  if (score >= 82) return "Strong fit";
  if (score >= 70) return "Medium fit";
  if (score >= 58) return "Reach";
  return "Skip";
}

function recommendationFromFit(fit: JobRadarFit) {
  if (fit === "Strong fit") return "Apply today with tailored documents.";
  if (fit === "Medium fit") return "Apply if the role looks interesting.";
  if (fit === "Reach") return "Apply only with a referral or strong message.";
  return "Skip unless you have new evidence for the gaps.";
}

export function scoreJobForProfile({
  job,
  profile
}: {
  job: Omit<JobRadarJob, "score" | "fit" | "recommendation" | "applyReason" | "strongSignals" | "gaps" | "matchedKeywords">;
  profile: BaselineResume;
}): JobRadarJob {
  const corpus = profileCorpus(profile);
  const jd = `${job.title} ${job.company} ${job.location} ${job.description}`.toLowerCase();
  const matched = supportedRules.filter(
    (rule) =>
      rule.matchers.some((matcher) => matcher.test(jd)) &&
      rule.evidence.some((matcher) => matcher.test(corpus))
  );
  const missing = [...supportedRules, ...blockerRules].filter(
    (rule) =>
      rule.matchers.some((matcher) => matcher.test(jd)) &&
      !rule.evidence.some((matcher) => matcher.test(corpus))
  );
  const supportedWeight = matched.reduce((sum, rule) => sum + rule.weight, 0);
  const missingWeight = missing.reduce((sum, rule) => sum + rule.weight, 0);
  const juniorBoost = /\bjunior\b|\bgraduate\b|\btrainee\b|\bintern\b|\bentry[- ]level\b|\bworking student\b/i.test(jd)
    ? 8
    : 0;
  const englishBoost = /\benglish\b/i.test(jd) && /"language":"english","level":"c1/i.test(corpus)
    ? 5
    : 0;
  const fullStackBoost = /\bfull[- ]?stack\b|\bfrontend\b|\bbackend\b|\bweb development\b/i.test(jd)
    ? 6
    : 0;
  const score = clampScore(
    52 + supportedWeight * 2.2 + juniorBoost + englishBoost + fullStackBoost - missingWeight * 1.55
  );
  const fit = fitFromScore(score);
  const strongSignals = unique(matched.map((rule) => rule.strength), 4);
  const gaps = unique(missing.map((rule) => rule.gap), 4);

  return {
    ...job,
    score,
    fit,
    recommendation: recommendationFromFit(fit),
    applyReason: strongSignals.length
      ? strongSignals[0]
      : "The role has some overlap, but the strongest evidence is limited.",
    strongSignals,
    gaps,
    matchedKeywords: unique(matched.map((rule) => rule.label), 8)
  };
}

export function normalizeArbeitnowJob(rawJob: RawArbeitnowJob): Omit<JobRadarJob, "score" | "fit" | "recommendation" | "applyReason" | "strongSignals" | "gaps" | "matchedKeywords"> | null {
  const title = rawJob.title?.trim();
  const company = rawJob.company_name?.trim();
  const url = rawJob.url?.trim();
  const description = textFromHtml(rawJob.description ?? "");

  if (!title || !company || !url || !description) {
    return null;
  }

  return {
    id: rawJob.slug || `${company}-${title}-${url}`,
    title,
    company,
    location: rawJob.location?.trim() || "Germany",
    remote: Boolean(rawJob.remote),
    url,
    source: "Arbeitnow",
    postedAt: rawJob.created_at
      ? new Date(rawJob.created_at * 1000).toISOString()
      : "",
    description
  };
}

export function filterJobs({
  jobs,
  query,
  location,
  minimumScore
}: {
  jobs: JobRadarJob[];
  query: string;
  location: string;
  minimumScore: number;
}) {
  const queryTerms = query
    .toLowerCase()
    .split(/[,\s]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3);
  const locationTerm = location.trim().toLowerCase();

  return jobs
    .filter((job) => {
      const haystack = `${job.title} ${job.company} ${job.location} ${job.description}`.toLowerCase();
      const queryMatch =
        !queryTerms.length || queryTerms.some((term) => haystack.includes(term));
      const locationMatch =
        !locationTerm ||
        locationTerm === "germany" ||
        job.location.toLowerCase().includes(locationTerm) ||
        (locationTerm === "remote" && job.remote);

      return queryMatch && locationMatch && job.score >= minimumScore;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}
