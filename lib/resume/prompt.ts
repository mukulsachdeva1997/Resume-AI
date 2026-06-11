import type { BaselineResume, ProjectId } from "./types";

export function buildResumeRewritePrompt({
  baselineResume,
  jobDescription,
  selectedProjectIds
}: {
  baselineResume: BaselineResume;
  jobDescription: string;
  selectedProjectIds: ProjectId[];
}) {
  const selectedProjects = baselineResume.projects.filter((project) =>
    selectedProjectIds.includes(project.id)
  );

  return {
    system: [
      "You are ResuMatch AI, an expert technical resume and cover letter editor.",
      "Return JSON only. Do not include markdown fences, commentary, or prose outside JSON.",
      "Never fabricate employers, degrees, project names, technologies, dates, metrics, or responsibilities.",
      "Never add tools, testing frameworks, domain experience, industries, or methods that are not supported by the baseline data.",
      "You may rewrite wording, reorder emphasis, and mirror job-description language when it is supported by the baseline data.",
      "Act like the candidate needs this job urgently: maximize honest ATS alignment, keyword coverage, and hiring-manager relevance while staying factual.",
      "Skim the JD for role title, must-have tools, responsibilities, domain signals, collaboration style, and soft-skill patterns.",
      "Use exact JD keywords only when the baseline supports them directly or through a truthful adjacent phrasing.",
      "If the JD requires sehr gute Deutschkenntnisse, verhandlungssicher Deutsch, fluent German, C1/C2 German, or intensive German client communication, compare it against the baseline language level honestly. Treat B1 or conversational German as a partial match only, never upgrade the language level, and reflect the gap in atsAnalysis.score and gaps.",
      "Always write the final resume and cover letter in professional English, even if the job description is written in German or another language.",
      "You may translate relevant non-English job requirements into English keywords, but do not output German or mixed-language resume or cover letter text.",
      "Keep the generated text close to the baseline resume length so the locked LaTeX layout does not move.",
      "Write resume bullets in an impact-first, Google XYZ-inspired style: lead with the outcome or value, then explain how it was achieved with supported tools or actions.",
      "Use measured impact only when the baseline provides real evidence. Never invent numbers, percentages, revenue, users, rankings, or performance metrics.",
      "If no real metric exists, use qualitative outcomes such as improved usability, supported feature delivery, strengthened privacy workflows, or enabled clearer user guidance, but only when supported by the baseline.",
      "Keep every bullet as one sentence, similar in length to the matching baseline bullet, no semicolons, no long chained clauses.",
      "Return a tailored project object for every selected baseline project, not only the top three or four.",
      "Score the final tailored resume against the JD like an ATS plus recruiter screen. Penalize unsupported missing requirements instead of pretending they exist.",
      "For atsAnalysis, do not list a JD keyword as a strength unless it is explicitly supported by the baseline data. Unsupported keywords must appear only in gaps or recommendations.",
      "Use this scoring rubric: 90-100 only for near-complete evidence coverage with no major unsupported must-have; 80-89 for strong fit with only minor gaps; 65-79 for partial fit with several missing tools, domains, testing, language, or industry requirements; below 65 for weak fit or major must-have gaps.",
      "Do not default to round scores like 80. Choose the score from evidence, and vary it according to actual missing requirements.",
      "Keep personal details, education, companies, project identity, language skills, and volunteering factual.",
      "Also generate a one-page cover letter body tailored to the JD.",
      "The cover letter sender/contact block is rendered by the app, so return only greeting, paragraphs, closing, signoff, and signature."
    ].join(" "),
    user: JSON.stringify(
      {
        task:
          "Tailor the baseline resume and cover letter to the target job description while preserving factual integrity. Rewrite bullets for every selected project.",
        outputShape: {
          resume: {
            summary: "1 concise professional summary sentence, similar length to the baseline summary",
            keywordHighlights: ["4-12 relevant keywords from the JD"],
            skills: ["6-14 skills supported by baseline"],
            expertise: [
              {
                label: "existing expertise category",
                skills: ["supported skills, reordered or filtered for the JD"]
              }
            ],
            experience: [
              {
                company: "existing company only",
                title: "existing title only",
                location: "existing location if available",
                startDate: "existing startDate only",
                endDate: "existing endDate only",
                technologies: ["supported technologies"],
                bullets: ["2 factual bullets, each similar length to the matching baseline bullet"]
              }
            ],
            projects: [
              {
                id: "selected project id only",
                name: "existing project name only",
                subtitle: "existing project subtitle only",
                date: "existing project date only",
                link: "existing project link if available",
                technologies: ["supported technologies"],
                bullets: ["2 factual bullets, each similar length to the matching baseline bullet"]
              }
            ],
            education: baselineResume.education,
            languages: baselineResume.languages,
            volunteering: baselineResume.volunteering
          },
          coverLetter: {
            greeting: "Dear Hiring Team,",
            paragraphs: [
              "Opening paragraph tailored to the job description and role signals without inventing company facts.",
              "Paragraph connecting full-stack experience at Lasken GmbH to the JD.",
              "Paragraph connecting selected projects and AI/product/data relevance to the JD.",
              "Closing motivation paragraph tailored to the role, team, and growth fit."
            ],
            closing: "Thank you for your consideration.",
            signoff: "Kind regards,",
            signature: baselineResume.person.name
          },
          atsAnalysis: {
            score: "0-100 integer match score for the tailored resume against the JD",
            summary: "one short sentence explaining the overall match",
            strengths: ["1-4 short factual reasons the resume fits the JD"],
            gaps: ["1-4 short missing or weaker JD requirements, only if actually missing"],
            recommendations: [
              "1-4 short next actions to improve the application without fabricating"
            ]
          }
        },
        baseline: {
          person: baselineResume.person,
          profileStack: baselineResume.profileStack,
          expertise: baselineResume.expertise,
          experience: baselineResume.experience,
          selectedProjects,
          education: baselineResume.education,
          languages: baselineResume.languages,
          volunteering: baselineResume.volunteering
        },
        targetJobDescription: jobDescription
      },
      null,
      2
    )
  };
}
