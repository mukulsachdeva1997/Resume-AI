import { NextResponse } from "next/server";
import { z } from "zod";
import {
  filterJobs,
  normalizeArbeitnowJob,
  scoreJobForProfile
} from "@/lib/job-radar";
import { baselineResume } from "@/lib/resume/baseline";
import type { BaselineResume } from "@/lib/resume/types";

type NormalizedJob = NonNullable<ReturnType<typeof normalizeArbeitnowJob>>;

const jobRadarRequestSchema = z.object({
  query: z.string().max(160).default("frontend fullstack react angular .net"),
  location: z.string().max(80).default("Germany"),
  minimumScore: z.number().min(0).max(100).default(58),
  candidateProfile: z.custom<BaselineResume>().optional()
});

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

async function fetchArbeitnowJobs() {
  const pages = [1, 2, 3];
  const responses = await Promise.allSettled(
    pages.map((page) =>
      fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`, {
        headers: {
          Accept: "application/json"
        },
        next: {
          revalidate: 1800
        }
      })
    )
  );
  const payloads = await Promise.all(
    responses.flatMap((result) => {
      if (result.status !== "fulfilled" || !result.value.ok) {
        return [];
      }

      return [result.value.json()];
    })
  );

  return payloads.flatMap((payload) =>
    Array.isArray(payload?.data) ? payload.data : []
  );
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsedInput = jobRadarRequestSchema.safeParse(json);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          error: "Invalid job radar request.",
          details: parsedInput.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const candidateProfile = isBaselineProfile(parsedInput.data.candidateProfile)
      ? parsedInput.data.candidateProfile
      : baselineResume;
    const rawJobs = await fetchArbeitnowJobs();
    const seenUrls = new Set<string>();
    const jobs = rawJobs
      .map(normalizeArbeitnowJob)
      .filter((job): job is NormalizedJob => Boolean(job))
      .filter((job) => {
        if (seenUrls.has(job.url)) {
          return false;
        }

        seenUrls.add(job.url);
        return true;
      })
      .map((job) => scoreJobForProfile({ job, profile: candidateProfile }));
    const rankedJobs = filterJobs({
      jobs,
      query: parsedInput.data.query,
      location: parsedInput.data.location,
      minimumScore: parsedInput.data.minimumScore
    });

    return NextResponse.json({
      jobs: rankedJobs,
      source: "Arbeitnow",
      scanned: jobs.length
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Job radar failed to fetch jobs.";

    return NextResponse.json(
      {
        error:
          "Could not fetch real job links right now. Try again later or check your network.",
        details: message
      },
      { status: 502 }
    );
  }
}
