import type {
  ResumeEducation,
  ResumePerson,
  TailoredCoverLetter,
  TailoredResume,
  VolunteeringEntry
} from "./types";

function escapeLatex(value: string) {
  return value
    .replace(/[–—]/g, "--")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function href(url: string, label: string) {
  return `\\href{${url}}{${escapeLatex(label)}}`;
}

function preamble(kind: "resume" | "letter", includePhoto = false) {
  const geometry =
    kind === "resume"
      ? "top=0.75cm,bottom=0.95cm,left=1.25cm,right=1.25cm"
      : "top=2.25cm,bottom=1.8cm,left=2.65cm,right=2.65cm";

  return String.raw`\documentclass[10pt,a4paper]{article}
\usepackage[${geometry}]{geometry}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[scaled]{helvet}
\renewcommand{\familydefault}{\sfdefault}
\usepackage{graphicx}
\usepackage{tikz}
\usepackage{enumitem}
\usepackage{fontawesome5}
\usepackage[hidelinks]{hyperref}
\usepackage{parskip}
\usepackage{microtype}
\usepackage{xcolor}
\pagenumbering{gobble}
\urlstyle{same}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\emergencystretch=1.2em
\newcommand{\cvsection}[1]{%
  \vspace{0.86em}
  {\large\bfseries\MakeUppercase{#1}}\par
  \vspace{-0.88em}\rule{\textwidth}{1.15pt}\vspace{0.86em}
}
\newcommand{\cvphoto}{%
  ${includePhoto ? String.raw`\IfFileExists{profile-photo.jpg}{%
    \begin{tikzpicture}
      \clip (0,0) circle (0.92cm);
      \node at (0,0) {\includegraphics[width=1.84cm,height=1.84cm]{profile-photo.jpg}};
    \end{tikzpicture}\\[0.12em]%
  }{}%` : ""}
}
\setlist[itemize]{label=-,leftmargin=1.05em,rightmargin=0pt,topsep=2pt,itemsep=1.5pt,parsep=0pt,partopsep=0pt}
`;
}

function section(title: string) {
  return `\\cvsection{${escapeLatex(title)}}`;
}

function itemize(items: string[]) {
  if (!items.length) {
    return "";
  }

  return [
    "\\begin{itemize}",
    ...items.map((item) => `  \\item ${escapeLatex(item)}`),
    "\\end{itemize}"
  ].join("\n");
}

function bulletColumn(items: string[]) {
  if (!items.length) {
    return "";
  }

  return [
    "\\par\\vspace{0.02em}",
    "\\begin{minipage}[t]{0.77\\textwidth}",
    "\\raggedright",
    itemize(items),
    "\\end{minipage}\\par"
  ].join("\n");
}

function datedEntry({
  title,
  subtitle,
  date,
  location,
  link,
  subtitleBottomSpace,
  bullets
}: {
  title: string;
  subtitle?: string;
  date: string;
  location?: string;
  link?: string;
  subtitleBottomSpace?: boolean;
  bullets: string[];
}) {
  return [
    "\\noindent\\begin{minipage}[t]{0.77\\textwidth}",
    `\\raggedright\\textbf{${escapeLatex(title)}}${
      link ? `\\hspace{0.28em}\\href{${link}}{\\scriptsize\\faLink}` : ""
    }`,
    subtitle
      ? `\\\\[0.06em]${escapeLatex(subtitle)}${
          subtitleBottomSpace ? "\n\\vspace{0.42em}" : ""
        }`
      : "",
    "\\end{minipage}%",
    "\\hfill",
    "\\begin{minipage}[t]{0.2\\textwidth}",
    `\\raggedleft ${escapeLatex(date)}`,
    location ? `\\\\[0.25em]${escapeLatex(location)}` : "",
    "\\end{minipage}\\par",
    bulletColumn(bullets),
    "\\vspace{0.18em}"
  ]
    .filter(Boolean)
    .join("\n");
}

function educationEntry(item: ResumeEducation) {
  return datedEntry({
    title: item.degree,
    subtitle: item.institution,
    date: [item.startDate, item.endDate].filter(Boolean).join(" -- "),
    location: item.location,
    bullets: item.details ?? []
  });
}

function volunteeringEntry(item: VolunteeringEntry) {
  return datedEntry({
    title: item.title,
    date: `${item.startDate} -- ${item.endDate}`,
    location: item.location,
    bullets: item.bullets
  });
}

function languageColumns(languages: TailoredResume["languages"]) {
  return languages
    .map(
      (item) =>
        [
          "\\begin{minipage}[t]{0.3\\textwidth}",
          `\\raggedright\\textbf{${escapeLatex(item.language.toUpperCase())}}\\\\[0.14em]`,
          escapeLatex(item.level),
          "\\end{minipage}"
        ].join("\n")
    )
    .join("\\hfill\n");
}

export function buildResumeLatex({
  person,
  resume
}: {
  person: ResumePerson;
  resume: TailoredResume;
}) {
  const linkedIn = person.links.find((link) => link.label.includes("linkedin"));
  const portfolio = person.links.find((link) => !link.label.includes("linkedin"));

  return `${preamble("resume", Boolean(person.photoUrl))}
\\begin{document}

\\begin{center}
${person.photoUrl ? "% Upload profile-photo.jpg beside this .tex file in Overleaf to show the circular profile photo." : ""}
\\cvphoto
\\vspace{0.56em}
{\\huge\\bfseries ${escapeLatex(person.name)}}\\\\[0.12em]
\\vspace{0.56em}
{\\large\\itshape ${escapeLatex(person.role)}}\\\\[0.68em]
\\small
\\faEnvelope\\hspace{0.35em} ${escapeLatex(person.email ?? "")} \\hspace{1.26em} \\quad \\faPhone\\hspace{0.35em} ${escapeLatex(person.phone ?? "")} \\hspace{1.26em} \\quad \\faMapMarker*\\hspace{0.35em} ${escapeLatex(person.location ?? "")}\\\\[0.52em]
${portfolio ? `\\faLink\\hspace{0.35em} ${href(portfolio.url, portfolio.label)}` : ""} \\hspace{1.26em} \\quad ${linkedIn ? `\\faLinkedin\\hspace{0.35em} ${href(linkedIn.url, linkedIn.label)}` : ""}
\\end{center}
\\vspace{0.2em}

\\small
${section("Professional Summary")}
${escapeLatex(resume.summary)}

${section("Areas of Expertise")}
${resume.expertise
  .map(
    (group) =>
      `\\textbf{${escapeLatex(group.label)}:}\\enspace ${group.skills
        .map(escapeLatex)
        .join(" | ")}`
  )
  .join("\\\\[-0.05em]\n")}

${section("Projects")}
${resume.projects
  .map((project) =>
    datedEntry({
      title: `${project.name} -- ${project.subtitle}`,
      date: project.date,
      link: project.link,
      bullets: project.bullets
    })
  )
  .join("\n\\vspace{0.72em}\n")}

${section("Experience")}
${resume.experience
  .map((item) =>
    datedEntry({
      title: `${item.title} | ${item.technologies.join(", ")}`,
      subtitle: item.company,
      date: `${item.startDate} -- ${item.endDate}`,
      location: item.location,
      subtitleBottomSpace: true,
      bullets: item.bullets
    })
  )
  .join("\n\\vspace{0.5em}\n")}

\\newpage

${section("Education")}
${resume.education.map(educationEntry).join("\n\\vspace{0.5em}\n")}

${section("Language Skills")}
\\noindent
${languageColumns(resume.languages)}

${section("Volunteering")}
${resume.volunteering.map(volunteeringEntry).join("\n\\vspace{0.5em}\n")}

\\end{document}
`;
}

export function buildCoverLetterLatex({
  person,
  coverLetter
}: {
  person: ResumePerson;
  coverLetter: TailoredCoverLetter;
}) {
  const linkedIn = person.links.find((link) => link.label.includes("linkedin"));
  const portfolio = person.links.find((link) => !link.label.includes("linkedin"));

  return `${preamble("letter")}
\\begin{document}

${escapeLatex(person.name)}\\\\
${escapeLatex(person.location?.replace("33100, ", "") ?? "")}\\\\
${escapeLatex(person.email ?? "")} \\; | \\; ${escapeLatex(
    person.phone?.replace("(+49)", "+49") ?? ""
  )}\\\\
LinkedIn : ${linkedIn ? href(linkedIn.url, linkedIn.label) : ""}\\\\
Portfolio : ${portfolio ? href(portfolio.url, portfolio.url) : ""}

\\vspace{1.35em}

${escapeLatex(coverLetter.greeting)}

\\vspace{1.05em}

${coverLetter.paragraphs.map((paragraph) => escapeLatex(paragraph)).join("\n\n")}

\\vspace{1.05em}

${escapeLatex(coverLetter.closing)}

\\vspace{1.05em}

${escapeLatex(coverLetter.signoff)}\\\\
${escapeLatex(coverLetter.signature)}

\\end{document}
`;
}
