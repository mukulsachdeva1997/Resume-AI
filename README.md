# ResuMatch AI

ResuMatch AI is a local-first resume and cover-letter tailoring app. It takes a structured baseline profile, a target job description, and a free Groq API key, then generates a tailored resume, cover letter, ATS match analysis, and LaTeX/PDF exports.

## Features

- Paste any job description, including German JDs, and generate English application documents.
- Select the projects that should appear in the tailored resume.
- Rewrite resume bullets with impact-first, evidence-based wording.
- Generate a one-page cover letter from the same JD.
- Score ATS match against supported resume evidence instead of unsupported keyword stuffing.
- Export a locked LaTeX resume layout and browser-generated PDFs.
- Replace the baseline profile JSON so another candidate can use the same app with their own resume data.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```txt
http://localhost:3000
```

Add your own free Groq key in `.env.local`:

```bash
GROQ_API_KEY="your-key"
GROQ_MODEL="llama-3.3-70b-versatile"
```

You can also paste a Groq key directly in the app. Do not commit `.env.local`.

## Friend/Candidate Setup

Another candidate can use the app by replacing the profile JSON in the UI.

1. Clone the repo.
2. Run `npm install`.
3. Add their own Groq key.
4. Open the profile JSON editor in the app.
5. Paste their generated baseline profile JSON.
6. Verify names, dates, links, skills, projects, languages, and bullets are truthful.
7. Save the profile locally.
8. Paste a JD, select projects, and optimize documents.

The baseline profile is the source of truth. The app should rewrite and reposition real evidence, not invent experience.

## Project Layout

```txt
app/
  api/optimize-resume/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  cover-letter-preview.tsx
  resume-optimizer.tsx
  resume-preview.tsx
  ui/
lib/
  resume/
    ats.ts
    baseline.ts
    latex.ts
    normalize.ts
    prompt.ts
    types.ts
    validators.ts
  utils.ts
public/
types/
.env.example
next.config.ts
package.json
package-lock.json
postcss.config.js
tailwind.config.js
tsconfig.json
```

## Development Notes

- `.env.local`, `node_modules`, `.next`, generated PDF previews, and TypeScript build info are ignored.
- Keep each candidate's private Groq key local.
- Keep the LaTeX layout stable unless intentionally changing the visual resume format.
