"use client";

import { Download, Printer } from "lucide-react";
import type {
  ResumePerson,
  TailoredCoverLetter
} from "@/lib/resume/types";
import { Button } from "@/components/ui/button";

type CoverLetterPreviewProps = {
  person: ResumePerson;
  coverLetter: TailoredCoverLetter;
  previewId?: string;
  onExport?: () => void;
  isExporting?: boolean;
};

export function CoverLetterPreview({
  person,
  coverLetter,
  previewId = "cover-letter-preview",
  onExport,
  isExporting = false
}: CoverLetterPreviewProps) {
  const linkedIn = person.links.find((link) => link.label.includes("linkedin"));
  const portfolio = person.links.find((link) => !link.label.includes("linkedin"));

  return (
    <section className="relative">
      {onExport ? (
        <Button
          className="fixed bottom-6 right-6 z-20 shadow-lg print:hidden"
          onClick={onExport}
          disabled={isExporting}
          aria-label="Download cover letter PDF"
          title="Download cover letter PDF"
        >
          {isExporting ? (
            <Printer className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? "Preparing" : "PDF"}
        </Button>
      ) : null}

      <div
        id={previewId}
        className="mx-auto min-h-[1123px] w-full max-w-[794px] bg-white px-[78px] py-[78px] font-sans text-[14px] leading-[1.3] text-black shadow-sm ring-1 ring-slate-200 print:max-w-none print:shadow-none print:ring-0"
      >
        <header className="leading-[1.3]">
          <p>{person.name}</p>
          {person.location ? <p>{person.location}</p> : null}
          <p>
            {person.email ? (
              <a
                className="text-black no-underline"
                href={`mailto:${person.email}`}
              >
                {person.email}
              </a>
            ) : null}
            {person.email && person.phone ? " | " : ""}
            {person.phone ? (
              <a
                className="text-black no-underline"
                href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}
              >
                {person.phone.replace("(+49)", "+49")}
              </a>
            ) : null}
          </p>
          {linkedIn ? (
            <p>
              LinkedIn :{" "}
              <a
                className="text-black no-underline"
                href={linkedIn.url}
                rel="noreferrer"
                target="_blank"
              >
                {linkedIn.label}
              </a>
            </p>
          ) : null}
          {portfolio ? (
            <p>
              Portfolio :{" "}
              <a
                className="text-black no-underline"
                href={portfolio.url}
                rel="noreferrer"
                target="_blank"
              >
                {portfolio.url}
              </a>
            </p>
          ) : null}
        </header>

        <main className="mt-5">
          <p>{coverLetter.greeting}</p>

          <div className="mt-4 space-y-4">
            {coverLetter.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            <p>{coverLetter.closing}</p>
            <div>
              <p>{coverLetter.signoff}</p>
              <p>{coverLetter.signature}</p>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
