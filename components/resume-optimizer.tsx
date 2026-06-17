"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { baselineResume } from "@/lib/resume/baseline";
import {
  buildCoverLetterLatex,
  buildResumeLatex
} from "@/lib/resume/latex";
import type {
  AtsAnalysis,
  BaselineResume,
  ProjectId,
  TailoredCoverLetter,
  TailoredResume
} from "@/lib/resume/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview } from "@/components/resume-preview";
import { CoverLetterPreview } from "@/components/cover-letter-preview";

const resumePreviewId = "resume-preview";
const coverLetterPreviewId = "cover-letter-preview";
const a4CanvasWidth = 794;
const a4CanvasHeight = 1123;
const storageKeys = {
  groqApiKey: "resumatch-ai:v2:groqApiKey",
  profile: "resumatch-ai:v2:profile",
  applications: "resumatch-ai:v2:applications"
};

type ApplicationStatus =
  | "Saved"
  | "Tailored"
  | "Applied"
  | "Interview"
  | "Rejected"
  | "Follow-up";

type JobApplication = {
  id: string;
  title: string;
  company: string;
  url: string;
  status: ApplicationStatus;
  score: number;
  followUpDate: string;
  savedAt: string;
  jobDescription: string;
};

type ApiErrorPayload = {
  error?: string;
  details?: unknown;
};

function formatApiErrorDetails(details: unknown) {
  if (!details || typeof details !== "object") {
    return "";
  }

  const fieldMessages = Object.entries(details as Record<string, unknown>)
    .flatMap(([field, value]) => {
      if (!Array.isArray(value)) {
        return [];
      }

      return value.map((message) => `${field}: ${String(message)}`);
    })
    .join(" ");

  return fieldMessages ? `Details: ${fieldMessages}` : "";
}

function createBaselinePreview(
  selectedProjectIds: ProjectId[],
  profile: BaselineResume = baselineResume
): TailoredResume {
  const selectedProjects = profile.projects
    .filter((project) => selectedProjectIds.includes(project.id))
    .map((project) => ({
      id: project.id,
      name: project.name,
      subtitle: project.subtitle,
      date: project.date,
      link: project.link,
      technologies: project.technologies,
      bullets: project.baselineBullets.slice(0, 2)
    }));

  return {
    summary: `${profile.person.role} experienced with ${profile.profileStack
      .slice(0, 8)
      .join(", ")} across ${profile.experience.length ? "professional and project" : "project"} work.`,
    keywordHighlights: profile.profileStack.slice(0, 8),
    skills: profile.profileStack,
    expertise: profile.expertise,
    experience: profile.experience.map((item) => ({
      company: item.company,
      title: item.title,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      technologies: item.technologies,
      bullets: item.baselineBullets.slice(0, 2)
    })),
    projects: selectedProjects,
    education: profile.education,
    languages: profile.languages,
    volunteering: profile.volunteering
  };
}

function createBaselineCoverLetter(profile: BaselineResume = baselineResume): TailoredCoverLetter {
  const primaryExperience = profile.experience[0];
  const primaryProject = profile.projects[0];
  const primaryStack = profile.profileStack.slice(0, 6).join(", ");

  return {
    greeting: "Dear Hiring Team,",
    paragraphs: [
      `I am excited to apply for this role. The opportunity to contribute to modern web applications, user-focused digital products, and practical engineering work is especially appealing to me because it connects closely with my background in ${primaryStack}.`,
      primaryExperience
        ? `My recent background includes ${primaryExperience.title} experience at ${primaryExperience.company}, where I worked with ${primaryExperience.technologies.slice(0, 6).join(", ")} across product and implementation work.`
        : "My background includes hands-on software development experience across product, implementation, and collaborative delivery work.",
      primaryProject
        ? `I have also built projects such as ${primaryProject.name}, which reflects my ability to turn technical requirements into practical, usable software.`
        : "I have also built project work that reflects my ability to turn technical requirements into practical, usable software.",
      "What attracts me most to this role is the chance to contribute in a structured team environment while continuing to grow technically. I would be excited to bring my development experience, strong learning mindset, and motivation to your team."
    ],
    closing: "Thank you for your consideration.",
    signoff: "Kind regards,",
    signature: profile.person.name
  };
}

function createBaselineAtsAnalysis(): AtsAnalysis {
  return {
    score: 70,
    summary:
      "Baseline resume is ready; paste a JD and optimize to calculate a tailored match score.",
    strengths: [
      "Frontend and full-stack experience is available for tailoring.",
      "Projects can be selected to match the target role."
    ],
    gaps: ["No target job description has been analyzed yet."],
    recommendations: [
      "Paste the JD, select relevant projects, then optimize."
    ],
    keywordGaps: [
      {
        keyword: "Target JD",
        present: false,
        evidence: "No JD has been analyzed yet.",
        action: "Not applied yet: paste a JD and optimize to generate the keyword gap table."
      }
    ],
    reviewNotes: [
      "The 5-pass ATS workflow runs after optimization."
    ]
  };
}

function getDefaultProjectIds(profile: BaselineResume) {
  return profile.projects.slice(0, 3).map((project) => project.id);
}

function slugifyName(name: string) {
  return name
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "Candidate";
}

function isBaselineProfile(value: unknown): value is BaselineResume {
  const profile = value as Partial<BaselineResume> | null;

  return Boolean(
    profile &&
      typeof profile === "object" &&
      profile.person &&
      Array.isArray(profile.profileStack) &&
      Array.isArray(profile.expertise) &&
      Array.isArray(profile.projects) &&
      Array.isArray(profile.experience) &&
      Array.isArray(profile.education) &&
      Array.isArray(profile.languages) &&
      Array.isArray(profile.volunteering)
  );
}

export function ResumeOptimizer() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [activeProfile, setActiveProfile] =
    useState<BaselineResume>(baselineResume);
  const [profileJson, setProfileJson] = useState(() =>
    JSON.stringify(baselineResume, null, 2)
  );
  const [activePreview, setActivePreview] = useState<"resume" | "coverLetter">(
    "resume"
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<ProjectId[]>([
    "iqvia-custom-feature-development",
    "prioss",
    "tidy-team"
  ]);
  const [resume, setResume] = useState<TailoredResume>(() =>
    createBaselinePreview([
      "iqvia-custom-feature-development",
      "prioss",
      "tidy-team"
    ])
  );
  const [coverLetter, setCoverLetter] = useState<TailoredCoverLetter>(() =>
    createBaselineCoverLetter()
  );
  const [atsAnalysis, setAtsAnalysis] = useState<AtsAnalysis>(() =>
    createBaselineAtsAnalysis()
  );
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [exportingDocument, setExportingDocument] = useState<
    "resume" | "coverLetter" | null
  >(null);
  const [status, setStatus] = useState<string>("");
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const projectOptions = useMemo(
    () =>
      activeProfile.projects.map((project) => ({
        id: project.id,
        name: project.name,
        subtitle: project.subtitle,
        technologies: project.technologies
      })),
    [activeProfile.projects]
  );
  const selectedCount = selectedProjectIds.length;
  const canOptimize = jobDescription.trim().length >= 120 && selectedCount > 0;

  const keywordLine = useMemo(
    () => resume.keywordHighlights.slice(0, 8).join(" | "),
    [resume.keywordHighlights]
  );

  useEffect(() => {
    const savedKey = window.localStorage.getItem(storageKeys.groqApiKey);
    const savedProfile = window.localStorage.getItem(storageKeys.profile);
    const savedApplications = window.localStorage.getItem(
      storageKeys.applications
    );

    if (savedKey) {
      setGroqApiKey(savedKey);
    }

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile) as BaselineResume;

        if (isBaselineProfile(parsedProfile)) {
          const defaultIds = getDefaultProjectIds(parsedProfile);

          setActiveProfile(parsedProfile);
          setProfileJson(JSON.stringify(parsedProfile, null, 2));
          setSelectedProjectIds(defaultIds);
          setResume(createBaselinePreview(defaultIds, parsedProfile));
          setCoverLetter(createBaselineCoverLetter(parsedProfile));
        }
      } catch {
        window.localStorage.removeItem(storageKeys.profile);
      }
    }

    if (savedApplications) {
      try {
        const parsedApplications = JSON.parse(savedApplications);

        if (Array.isArray(parsedApplications)) {
          setApplications(parsedApplications);
        }
      } catch {
        window.localStorage.removeItem(storageKeys.applications);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.groqApiKey, groqApiKey);
  }, [groqApiKey]);

  useEffect(() => {
    window.localStorage.setItem(
      storageKeys.applications,
      JSON.stringify(applications)
    );
  }, [applications]);

  function toggleProject(projectId: ProjectId) {
    setSelectedProjectIds((current) => {
      if (current.includes(projectId)) {
        const next = current.filter((id) => id !== projectId);
        setResume(createBaselinePreview(next.length ? next : current, activeProfile));
        return next;
      }

      const next = [...current, projectId];
      setResume(createBaselinePreview(next, activeProfile));
      setStatus("");
      return next;
    });
  }

  async function optimizeResume() {
    setIsOptimizing(true);
    setStatus("");
    const trimmedGroqApiKey = groqApiKey.trim();

    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jobDescription,
          selectedProjectIds,
          ...(trimmedGroqApiKey ? { groqApiKey: trimmedGroqApiKey } : {}),
          candidateProfile: activeProfile
        })
      });

      const responseText = await response.text();
      let payload: ApiErrorPayload & {
        resume?: TailoredResume;
        coverLetter?: TailoredCoverLetter;
        atsAnalysis?: AtsAnalysis;
      } = {};

      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        const plainText = responseText
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 260);

        throw new Error(
          `The API returned HTML instead of JSON (${response.status}). ${
            plainText || "Check the terminal for the Next.js server error."
          }`
        );
      }

      if (!response.ok) {
        const detailText = formatApiErrorDetails(payload.details);
        throw new Error(
          [payload.error ?? "Resume optimization failed.", detailText]
            .filter(Boolean)
            .join(" ")
        );
      }

      if (!payload.resume || !payload.coverLetter || !payload.atsAnalysis) {
        throw new Error("The API response was missing optimized documents.");
      }

      setResume(payload.resume);
      setCoverLetter(payload.coverLetter);
      setAtsAnalysis(payload.atsAnalysis);
      setStatus("Resume and cover letter optimized.");
      setActivePreview("resume");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Resume optimization failed.";
      setStatus(message);
    } finally {
      setIsOptimizing(false);
    }
  }

  async function exportPdf(documentType: "resume" | "coverLetter") {
    const element = document.getElementById(
      documentType === "resume" ? resumePreviewId : coverLetterPreviewId
    );

    if (!element) {
      setStatus("The selected document preview is not ready yet.");
      return;
    }

    setExportingDocument(documentType);
    setStatus("");

    let exportWrapper: HTMLDivElement | null = null;

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf")
      ]);
      const exportTarget = element.cloneNode(true) as HTMLElement;

      exportTarget.removeAttribute("id");
      exportTarget.style.width = `${a4CanvasWidth}px`;
      exportTarget.style.maxWidth = `${a4CanvasWidth}px`;
      exportTarget.style.minHeight = `${a4CanvasHeight}px`;
      exportTarget.style.boxSizing = "border-box";
      exportTarget.style.boxShadow = "none";

      exportWrapper = document.createElement("div");
      exportWrapper.style.position = "fixed";
      exportWrapper.style.left = "-10000px";
      exportWrapper.style.top = "0";
      exportWrapper.style.width = `${a4CanvasWidth}px`;
      exportWrapper.style.minHeight = `${a4CanvasHeight}px`;
      exportWrapper.style.background = "#ffffff";
      exportWrapper.appendChild(exportTarget);
      document.body.appendChild(exportWrapper);

      await waitForImages(exportTarget);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const canvas = await html2canvas(exportTarget, {
        backgroundColor: "#ffffff",
        scale: 2,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        windowHeight: Math.max(a4CanvasHeight, exportTarget.scrollHeight),
        windowWidth: a4CanvasWidth
      });
      const pdf = new jsPDF({
        unit: "pt",
        format: "a4",
        orientation: "portrait"
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      const imageData = canvas.toDataURL("image/png", 1);
      const overflowTolerance = 8;
      let remainingHeight = imageHeight;
      let yPosition = 0;

      pdf.addImage(imageData, "PNG", 0, yPosition, pageWidth, imageHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > overflowTolerance) {
        yPosition = remainingHeight - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, yPosition, pageWidth, imageHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save(
        documentType === "resume"
          ? `${slugifyName(activeProfile.person.name)}-Resume.pdf`
          : `${slugifyName(activeProfile.person.name)}-Cover-Letter.pdf`
      );

      setStatus(
        documentType === "resume"
          ? "Resume PDF exported."
          : "Cover letter PDF exported."
      );
    } catch {
      setStatus("PDF export failed in this browser session.");
    } finally {
      exportWrapper?.remove();
      setExportingDocument(null);
    }
  }

  function downloadTextFile({
    content,
    filename,
    mimeType
  }: {
    content: string;
    filename: string;
    mimeType: string;
  }) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function exportLatex(documentType: "resume" | "coverLetter") {
    const content =
      documentType === "resume"
        ? buildResumeLatex({
            person: activeProfile.person,
            resume
          })
        : buildCoverLetterLatex({
            person: activeProfile.person,
            coverLetter
          });

    downloadTextFile({
      content,
      filename:
        documentType === "resume"
          ? `${slugifyName(activeProfile.person.name)}-Resume.tex`
          : `${slugifyName(activeProfile.person.name)}-Cover-Letter.tex`,
      mimeType: "application/x-tex;charset=utf-8"
    });

    setStatus(
      documentType === "resume"
        ? "Resume LaTeX exported."
        : "Cover letter LaTeX exported."
    );
  }

  function applyProfileJson() {
    try {
      const parsedProfile = JSON.parse(profileJson) as BaselineResume;

      if (!isBaselineProfile(parsedProfile)) {
        setStatus("Profile JSON is missing required resume sections.");
        return;
      }

      const defaultIds = getDefaultProjectIds(parsedProfile);

      setActiveProfile(parsedProfile);
      setSelectedProjectIds(defaultIds);
      setResume(createBaselinePreview(defaultIds, parsedProfile));
      setCoverLetter(createBaselineCoverLetter(parsedProfile));
      window.localStorage.setItem(
        storageKeys.profile,
        JSON.stringify(parsedProfile)
      );
      setStatus("Candidate profile loaded.");
    } catch {
      setStatus("Profile JSON is not valid JSON.");
    }
  }

  function exportProfileJson() {
    downloadTextFile({
      content: JSON.stringify(activeProfile, null, 2),
      filename: `${activeProfile.person.name.replace(/\s+/g, "-")}-profile.json`,
      mimeType: "application/json;charset=utf-8"
    });
    setStatus("Candidate profile JSON exported.");
  }

  function resetProfile() {
    const defaultIds = getDefaultProjectIds(baselineResume);

    setActiveProfile(baselineResume);
    setProfileJson(JSON.stringify(baselineResume, null, 2));
    setSelectedProjectIds(defaultIds);
    setResume(createBaselinePreview(defaultIds, baselineResume));
    setCoverLetter(createBaselineCoverLetter(baselineResume));
    window.localStorage.removeItem(storageKeys.profile);
    setStatus("Profile reset to bundled sample profile.");
  }

  function saveCurrentJob() {
    const title = jobTitle.trim() || "Untitled role";
    const company = jobCompany.trim() || "Unknown company";
    const now = new Date();
    const followUpDate = new Date(now);

    followUpDate.setDate(now.getDate() + 7);

    setApplications((current) => [
      {
        id: `${Date.now()}`,
        title,
        company,
        url: jobUrl.trim(),
        status: atsAnalysis.score === 70 ? "Saved" : "Tailored",
        score: atsAnalysis.score,
        followUpDate: followUpDate.toISOString().slice(0, 10),
        savedAt: now.toISOString(),
        jobDescription
      },
      ...current
    ]);
    setStatus("Job saved to application tracker.");
  }

  function updateApplicationStatus(
    id: string,
    nextStatus: ApplicationStatus
  ) {
    setApplications((current) =>
      current.map((application) =>
        application.id === id
          ? { ...application, status: nextStatus }
          : application
      )
    );
  }

  function deleteApplication(id: string) {
    setApplications((current) =>
      current.filter((application) => application.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1480px] gap-5">
        <header className="grid gap-4 border-b border-slate-200 pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              ResuMatch AI
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">
              Resume and cover letter optimizer
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Load the candidate profile, paste the JD, select projects, then
              export the tailored documents.
            </p>
          </div>
          <div className="grid gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm lg:min-w-[360px]">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-950">
                {activeProfile.person.name}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {atsAnalysis.score}/100
              </span>
            </div>
            <p className="truncate text-slate-500">
              {keywordLine || "Baseline preview"}
            </p>
          </div>
        </header>

        <section className="grid items-start gap-5 xl:grid-cols-[minmax(390px,0.48fr)_minmax(720px,0.52fr)]">
          <div className="grid content-start gap-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>1. Candidate setup</CardTitle>
                <CardDescription>
                  Add the API key and confirm whose profile is active.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="groq-api-key">Groq API key</Label>
                  <input
                    id="groq-api-key"
                    value={groqApiKey}
                    onChange={(event) => setGroqApiKey(event.target.value)}
                    placeholder="gsk_..."
                    type="password"
                    className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <p className="text-xs leading-5 text-slate-500">
                    Stored only in this browser. The server uses it for the
                    current request and does not save it.
                  </p>
                </div>

                <div className="grid gap-3 rounded-md border bg-white p-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Active profile: {activeProfile.person.name}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {activeProfile.person.role} ·{" "}
                      {activeProfile.projects.length} projects
                    </p>
                  </div>
                  <Button variant="outline" onClick={exportProfileJson}>
                    Export profile
                  </Button>
                </div>

                <details className="rounded-md border bg-white">
                  <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-800">
                    Edit or import profile JSON
                  </summary>
                  <div className="space-y-3 border-t p-3">
                    <Textarea
                      value={profileJson}
                      onChange={(event) => setProfileJson(event.target.value)}
                      className="min-h-[170px] resize-y font-mono text-xs"
                      placeholder="Paste a BaselineResume JSON profile here..."
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={applyProfileJson}>
                        Load profile
                      </Button>
                      <Button variant="outline" onClick={resetProfile}>
                        Reset sample
                      </Button>
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>2. Target role</CardTitle>
                <CardDescription>
                  Paste the JD. The optimize button turns on after 120
                  characters and at least one selected project.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the job description here..."
                  className="min-h-[260px] resize-y"
                />
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <p className="text-sm font-medium text-slate-500">
                    {jobDescription.trim().length} characters · {selectedCount}{" "}
                    projects selected
                  </p>
                  <Button
                    onClick={optimizeResume}
                    disabled={!canOptimize || isOptimizing}
                    className="sm:min-w-[190px]"
                  >
                    {isOptimizing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Optimize Documents
                  </Button>
                </div>
                {status ? (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
                    {status}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>3. Projects to include</CardTitle>
                <CardDescription>
                  {selectedCount}/{projectOptions.length} selected. Every
                  selected project is optimized against the JD.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {projectOptions.map((project) => {
                  const checked = selectedProjectIds.includes(project.id);

                  return (
                    <Label
                      key={project.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border bg-white p-3 transition-colors hover:bg-slate-50"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleProject(project.id)}
                        className="mt-0.5"
                      />
                      <span className="grid gap-1">
                        <span className="font-semibold leading-5">
                          {project.name}
                        </span>
                        <span className="text-sm font-normal leading-5 text-slate-500">
                          {project.subtitle}
                        </span>
                        <span className="text-xs font-medium leading-5 text-slate-400">
                          {project.technologies.join(" | ")}
                        </span>
                      </span>
                    </Label>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>ATS match</CardTitle>
                <CardDescription>
                  Honest score from the JD against supported resume evidence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-[110px_1fr] sm:items-start">
                  <div className="rounded-md border bg-white px-4 py-3">
                    <span className="block text-4xl font-semibold tracking-normal text-slate-950">
                      {atsAnalysis.score}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      /100
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {atsAnalysis.summary}
                  </p>
                </div>
                <div className="grid gap-3 text-sm">
                  <AnalysisList
                    title="Strong signals"
                    items={atsAnalysis.strengths}
                  />
                  <AnalysisList title="Gaps" items={atsAnalysis.gaps} />
                  <AnalysisList
                    title="Next improvements"
                    items={atsAnalysis.recommendations}
                  />
                </div>
                <KeywordGapTable gaps={atsAnalysis.keywordGaps} />
                <AnalysisList
                  title="5-pass self-review"
                  items={atsAnalysis.reviewNotes}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Application tracker</CardTitle>
                <CardDescription>
                  Save roles locally. Keep final submission manual.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    placeholder="Role title"
                    className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <input
                    value={jobCompany}
                    onChange={(event) => setJobCompany(event.target.value)}
                    placeholder="Company"
                    className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <input
                  value={jobUrl}
                  onChange={(event) => setJobUrl(event.target.value)}
                  placeholder="Application URL"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={saveCurrentJob}>
                    Save job
                  </Button>
                  {jobUrl ? (
                    <Button asChild variant="outline">
                      <a href={jobUrl} rel="noreferrer" target="_blank">
                        Open apply page
                      </a>
                    </Button>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  {applications.length ? (
                    applications.slice(0, 6).map((application) => (
                      <div
                        className="rounded-md border bg-white p-3 text-sm"
                        key={application.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {application.title}
                            </p>
                            <p className="text-slate-500">
                              {application.company} · {application.score}/100
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Follow up: {application.followUpDate}
                            </p>
                          </div>
                          <button
                            className="text-xs font-semibold text-slate-400 hover:text-slate-700"
                            onClick={() => deleteApplication(application.id)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <select
                            className="h-9 rounded-md border bg-white px-2 text-xs font-medium"
                            value={application.status}
                            onChange={(event) =>
                              updateApplicationStatus(
                                application.id,
                                event.target.value as ApplicationStatus
                              )
                            }
                          >
                            {[
                              "Saved",
                              "Tailored",
                              "Applied",
                              "Interview",
                              "Rejected",
                              "Follow-up"
                            ].map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {application.url ? (
                            <a
                              className="text-xs font-semibold text-slate-600 underline"
                              href={application.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Open
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                      No tracked jobs yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 xl:sticky xl:top-5">
            <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Document preview
                    </p>
                    <h2 className="text-lg font-semibold text-slate-950">
                      {activePreview === "resume" ? "Resume" : "Cover letter"}
                    </h2>
                  </div>
                </div>
                <div className="inline-flex rounded-md border bg-white p-1">
                  <Button
                    size="sm"
                    variant={activePreview === "resume" ? "default" : "ghost"}
                    onClick={() => setActivePreview("resume")}
                  >
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      activePreview === "coverLetter" ? "default" : "ghost"
                    }
                    onClick={() => setActivePreview("coverLetter")}
                  >
                    Cover Letter
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 lg:justify-end">
                <Button
                  variant="outline"
                  onClick={() => exportLatex(activePreview)}
                >
                  <Download className="h-4 w-4" />
                  Export .tex
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportPdf(activePreview)}
                  disabled={exportingDocument !== null}
                >
                  <Download className="h-4 w-4" />
                  Export {activePreview === "resume" ? "Resume" : "Letter"} PDF
                </Button>
              </div>
            </div>
            {activePreview === "resume" ? (
              <ResumePreview
                person={activeProfile.person}
                resume={resume}
                previewId={resumePreviewId}
              />
            ) : (
              <CoverLetterPreview
                person={activeProfile.person}
                coverLetter={coverLetter}
                previewId={coverLetterPreviewId}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AnalysisList({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <p className="font-semibold text-slate-800">{title}</p>
      <ul className="mt-1 grid gap-1 text-slate-600">
        {items.map((item) => (
          <li className="leading-5" key={item}>
            - {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeywordGapTable({ gaps }: { gaps: AtsAnalysis["keywordGaps"] }) {
  return (
    <div className="overflow-hidden rounded-md border bg-white text-sm">
      <div className="border-b bg-slate-50 px-3 py-2">
        <p className="font-semibold text-slate-800">Keyword gap chain</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Shows how the optimizer handled each JD keyword. Present items are
          woven into the documents; gaps are kept honest or positioned through
          adjacent evidence.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead className="bg-white text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="border-b px-3 py-2">Keyword</th>
              <th className="border-b px-3 py-2">Status</th>
              <th className="border-b px-3 py-2">Evidence</th>
              <th className="border-b px-3 py-2">How the app handles it</th>
            </tr>
          </thead>
          <tbody>
            {gaps.map((gap) => (
              <tr key={`${gap.keyword}-${gap.evidence}`}>
                <td className="border-b px-3 py-2 font-semibold text-slate-900">
                  {gap.keyword}
                </td>
                <td className="border-b px-3 py-2">
                  <span
                    className={
                      gap.present
                        ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                        : "rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
                    }
                  >
                    {gap.present ? "Present" : "Gap"}
                  </span>
                </td>
                <td className="border-b px-3 py-2 text-slate-600">
                  {gap.evidence}
                </td>
                <td className="border-b px-3 py-2 text-slate-600">
                  {gap.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );
}
