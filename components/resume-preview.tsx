"use client";

import type React from "react";
import {
  BriefcaseBusiness,
  Code2,
  Download,
  Folder,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Printer,
  UserRound,
  UsersRound
} from "lucide-react";
import type {
  ResumeEducation,
  ResumePerson,
  TailoredResume,
  VolunteeringEntry
} from "@/lib/resume/types";
import { Button } from "@/components/ui/button";

type ResumePreviewProps = {
  person: ResumePerson;
  resume: TailoredResume;
  previewId?: string;
  onExport?: () => void;
  isExporting?: boolean;
};

export function ResumePreview({
  person,
  resume,
  previewId = "resume-preview",
  onExport,
  isExporting = false
}: ResumePreviewProps) {
  return (
    <section className="relative">
      {onExport ? (
        <Button
          className="fixed bottom-6 right-6 z-20 shadow-lg print:hidden"
          onClick={onExport}
          disabled={isExporting}
          aria-label="Download PDF"
          title="Download PDF"
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
        className="mx-auto w-full max-w-[794px] bg-white px-[46px] py-[32px] font-sans text-black shadow-sm ring-1 ring-slate-200 print:max-w-none print:shadow-none print:ring-0"
      >
        <ResumeHeader person={person} />

        <CvSection icon={<UserRound />} title="Professional Summary">
          <p className="text-[12px] leading-[1.22]">{resume.summary}</p>
        </CvSection>

        <CvSection icon={<Code2 />} title="Areas of Expertise">
          <div className="space-y-[2px] text-[11px] leading-[1.16]">
            {resume.expertise.map((group) => (
              <p key={group.label}>
                <strong>{group.label}:</strong> {group.skills.join(" | ")}
              </p>
            ))}
          </div>
        </CvSection>

        <CvSection icon={<Folder />} title="Projects">
          <div className="space-y-[7px]">
            {resume.projects.map((project) => (
              <DatedEntry
                key={project.id}
                title={`${project.name} - ${project.subtitle}`}
                date={project.date}
                link={project.link}
                bullets={project.bullets}
              />
            ))}
          </div>
        </CvSection>

        <CvSection icon={<BriefcaseBusiness />} title="Experience">
          <div className="space-y-[8px]">
            {resume.experience.map((item) => (
              <DatedEntry
                key={`${item.company}-${item.title}`}
                title={`${item.title} | ${item.technologies.join(", ")}`}
                subtitle={item.company}
                location={item.location}
                date={`${item.startDate} - ${item.endDate}`}
                bullets={item.bullets}
              />
            ))}
          </div>
        </CvSection>

        <CvSection icon={<GraduationCap />} title="Education">
          <div className="space-y-[8px]">
            {resume.education.map((item) => (
              <EducationEntry item={item} key={`${item.degree}-${item.institution}`} />
            ))}
          </div>
        </CvSection>

        <CvSection icon={<Languages />} title="Language Skills">
          <div className="grid grid-cols-3 gap-5 text-[11px] leading-[1.2]">
            {resume.languages.map((item) => (
              <div key={item.language}>
                <p className="font-bold uppercase">{item.language}</p>
                <p>{item.level}</p>
              </div>
            ))}
          </div>
        </CvSection>

        <CvSection icon={<UsersRound />} title="Volunteering">
          <div className="space-y-[8px]">
            {resume.volunteering.map((item) => (
              <VolunteeringItem item={item} key={`${item.title}-${item.startDate}`} />
            ))}
          </div>
        </CvSection>
      </div>
    </section>
  );
}

function ResumeHeader({ person }: { person: ResumePerson }) {
  return (
    <header className="text-center">
      <img
        src="/profile-photo.jpg"
        alt="Mukul Sachdeva"
        className="mx-auto h-[102px] w-[102px] rounded-full object-cover"
      />
      <h2 className="mt-2 text-[28px] font-extrabold leading-none tracking-normal">
        {person.name}
      </h2>
      <p className="mt-1 text-[18px] italic leading-none">{person.role}</p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] leading-none">
        {person.email ? (
          <ContactItem icon={<Mail />} text={person.email} href={`mailto:${person.email}`} />
        ) : null}
        {person.phone ? (
          <ContactItem
            icon={<Phone />}
            text={person.phone}
            href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}
          />
        ) : null}
        {person.location ? (
          <ContactItem icon={<MapPin />} text={person.location} />
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] leading-none">
        {person.links.map((link) => (
          <ContactItem
            key={link.url}
            icon={link.label.includes("linkedin") ? <Linkedin /> : <Code2 />}
            text={link.label}
            href={link.url}
          />
        ))}
      </div>
    </header>
  );
}

function ContactItem({
  icon,
  text,
  href
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="[&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:stroke-[3]">
        {icon}
      </span>
      {text}
    </>
  );

  if (href) {
    return (
      <a
        className="inline-flex items-center gap-2 text-black no-underline"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      {content}
    </span>
  );
}

function CvSection({
  icon,
  title,
  children
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-[17px]">
      <div className="mb-[8px] flex items-center gap-2 border-b-[2px] border-black pb-[3px]">
        <span className="[&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:fill-black [&_svg]:stroke-[2.7]">
          {icon}
        </span>
        <h3 className="text-[17px] font-extrabold uppercase leading-none tracking-normal">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function DatedEntry({
  title,
  subtitle,
  location,
  date,
  link,
  bullets
}: {
  title: string;
  subtitle?: string;
  location?: string;
  date: string;
  link?: string;
  bullets: string[];
}) {
  return (
    <article className="break-inside-avoid">
      <div className="grid grid-cols-[minmax(0,1fr)_150px] gap-4">
        <div className="min-w-0">
          <h4 className="text-[12px] font-extrabold leading-[1.18]">
            {title}{" "}
            {link ? (
              <a
                aria-label={`Open ${title}`}
                className="inline-block align-[-1px] text-black no-underline"
                href={link}
                rel="noreferrer"
                target="_blank"
              >
                <Code2 className="h-[10px] w-[10px] stroke-[2.5]" />
              </a>
            ) : null}
          </h4>
          {subtitle ? (
            <p className="mt-[2px] text-[12px] leading-[1.15]">{subtitle}</p>
          ) : null}
        </div>
        <div className="text-right text-[11px] leading-[1.2]">
          <p>{date}</p>
          {location ? <p className="mt-[6px]">{location}</p> : null}
        </div>
      </div>
      <ul className="mt-[1px] max-w-[560px] space-y-[1px] text-[11px] leading-[1.18]">
        {bullets.map((bullet) => (
          <li className="grid grid-cols-[10px_1fr]" key={bullet}>
            <span>-</span>
            <span className="min-w-0 break-words">{bullet}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function EducationEntry({ item }: { item: ResumeEducation }) {
  return (
    <article className="break-inside-avoid">
      <div className="grid grid-cols-[minmax(0,1fr)_150px] gap-4">
        <div className="min-w-0">
          <h4 className="text-[12px] font-extrabold uppercase leading-[1.18]">
            {item.degree}
          </h4>
          <p className="mt-[2px] text-[12px] leading-[1.15]">
            {item.institution}
          </p>
        </div>
        <div className="text-right text-[11px] leading-[1.2]">
          <p>{[item.startDate, item.endDate].filter(Boolean).join(" - ")}</p>
          {item.location ? <p className="mt-[6px]">{item.location}</p> : null}
        </div>
      </div>
      {item.details?.length ? (
        <ul className="mt-[2px] max-w-[560px] space-y-[1px] text-[11px] leading-[1.18]">
          {item.details.map((detail) => (
            <li className="grid grid-cols-[10px_1fr]" key={detail}>
              {detail.endsWith(":") ? <span /> : <span>-</span>}
              <span className="min-w-0 break-words">{detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function VolunteeringItem({ item }: { item: VolunteeringEntry }) {
  return (
    <DatedEntry
      title={item.title}
      location={item.location}
      date={`${item.startDate} - ${item.endDate}`}
      bullets={item.bullets}
    />
  );
}
