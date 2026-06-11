import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { baselineResume } from "@/lib/resume/baseline";
import { calibrateAtsAnalysis } from "@/lib/resume/ats";
import { normalizeGroqOutput } from "@/lib/resume/normalize";
import { buildResumeRewritePrompt } from "@/lib/resume/prompt";
import type { BaselineResume } from "@/lib/resume/types";
import {
  atsAnalysisSchema,
  optimizeResumeInputSchema,
  tailoredCoverLetterSchema,
  tailoredResumeSchema
} from "@/lib/resume/validators";

export const runtime = "nodejs";

function extractJson(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("The model did not return JSON.");
    }

    return JSON.parse(match[0]);
  }
}

function isBaselineResume(value: unknown): value is BaselineResume {
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = optimizeResumeInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      {
        error: "Invalid resume optimization request.",
        details: parsedInput.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const groqApiKey =
    parsedInput.data.groqApiKey?.trim() || process.env.GROQ_API_KEY;
  const candidateProfile = isBaselineResume(parsedInput.data.candidateProfile)
    ? parsedInput.data.candidateProfile
    : baselineResume;

  if (!groqApiKey) {
    return NextResponse.json(
      {
        error:
          "Missing Groq API key. Enter one in the app or add GROQ_API_KEY to .env.local."
      },
      { status: 500 }
    );
  }

  const prompt = buildResumeRewritePrompt({
    baselineResume: candidateProfile,
    ...parsedInput.data
  });

  try {
    const groq = new Groq({
      apiKey: groqApiKey
    });

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.25,
      max_tokens: 2600,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: prompt.system
        },
        {
          role: "user",
          content: prompt.user
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Groq returned an empty response." },
        { status: 502 }
      );
    }

    const normalizedOutput = normalizeGroqOutput({
      raw: extractJson(content),
      baselineResume: candidateProfile,
      selectedProjectIds: parsedInput.data.selectedProjectIds
    });
    const calibratedAtsAnalysis = calibrateAtsAnalysis({
      modelAnalysis: normalizedOutput.atsAnalysis,
      baselineResume: candidateProfile,
      jobDescription: parsedInput.data.jobDescription
    });

    const parsedResume = tailoredResumeSchema.safeParse(
      normalizedOutput.resume
    );
    const parsedCoverLetter = tailoredCoverLetterSchema.safeParse(
      normalizedOutput.coverLetter
    );
    const parsedAtsAnalysis = atsAnalysisSchema.safeParse(
      calibratedAtsAnalysis
    );

    if (
      !parsedResume.success ||
      !parsedCoverLetter.success ||
      !parsedAtsAnalysis.success
    ) {
      return NextResponse.json(
        {
          error: "The AI response could not be normalized into a valid document.",
          details: {
            resume: parsedResume.success
              ? []
              : parsedResume.error.issues.map((issue) => ({
                  path: issue.path.join("."),
                  message: issue.message
                })),
            coverLetter: parsedCoverLetter.success
              ? []
              : parsedCoverLetter.error.issues.map((issue) => ({
                  path: issue.path.join("."),
                  message: issue.message
                })),
            atsAnalysis: parsedAtsAnalysis.success
              ? []
              : parsedAtsAnalysis.error.issues.map((issue) => ({
                  path: issue.path.join("."),
                  message: issue.message
                }))
          }
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      person: candidateProfile.person,
      resume: parsedResume.data,
      coverLetter: parsedCoverLetter.data,
      atsAnalysis: parsedAtsAnalysis.data
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while optimizing the resume.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
