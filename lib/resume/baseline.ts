import type { BaselineResume } from "./types";

export const baselineResume: BaselineResume = {
  person: {
    name: "Mukul Sachdeva",
    role: "Full-Stack Developer",
    location: "33100, Paderborn, Germany",
    email: "mukulsachdeva1997@gmail.com",
    phone: "(+49) 017682407998",
    photoUrl: "/profile-photo.jpg",
    links: [
      {
        label: "mukulsachdeva1997.github.io/MukulPortfolio-1/",
        url: "https://mukulsachdeva1997.github.io/MukulPortfolio-1/"
      },
      {
        label: "linkedin.com/in/mukul-sachdeva1997",
        url: "https://linkedin.com/in/mukul-sachdeva1997"
      }
    ]
  },
  profileStack: [
    "React",
    "Next.js",
    "TypeScript",
    "Angular",
    "Tailwind CSS",
    "Python Flask",
    "C# .NET",
    "REST APIs",
    "SQL"
  ],
  expertise: [
    {
      label: "Frontend Development",
      skills: ["React.js", "Next.js", "TypeScript", "JavaScript", "Angular", "Tailwind CSS", "shadcn/ui"]
    },
    {
      label: "Backend Development",
      skills: ["Python Flask", "FastAPI", "C# .NET", "REST APIs", "API Integration", "Authentication", "Server-Side Logic"]
    },
    {
      label: "AI & Product Automation",
      skills: ["Python", "Local AI", "Ollama", "NLP", "Keras", "CNN", "Word2Vec", "AI-assisted workflows"]
    },
    {
      label: "Cloud & DevOps",
      skills: ["Git", "GitHub", "GitHub Actions", "Docker", "AWS", "Vercel", "GitHub Pages", "CI/CD"]
    },
    {
      label: "Database Management",
      skills: ["MySQL", "PostgreSQL", "SQLite", "Redis", "Data Modeling", "SQL Queries"]
    },
    {
      label: "UI/UX & Product",
      skills: ["Accessibility", "Figma", "User Flows", "Performance Optimization", "Privacy-by-Design"]
    }
  ],
  projects: [
    {
      id: "tidy-team",
      name: "Tidy Team",
      subtitle: "Gamified Roommate Chore Management Platform",
      summary: "A mobile-first full-stack chore management platform for roommate households.",
      date: "Present",
      link: "https://tidy-team-c729a.web.app/",
      technologies: ["React", "TypeScript", "Firebase Auth", "Firestore", "PWA"],
      baselineBullets: [
        "Built a mobile-first full stack chore management platform with Firebase Auth, Firestore real-time sync, multi-household support, rotating assignments, scoring, snoozing, and leaderboard tracking.",
        "Implemented secure role-based data access, PWA support, automated reminders, monthly reports, light/dark UI, and self-hosting support for real-world household use cases."
      ]
    },
    {
      id: "know-your-rights",
      name: "KnowYourRights",
      subtitle: "AI-Powered Legal Rights Guidebook",
      summary: "An AI-powered legal rights platform for international students in Germany.",
      date: "Aug 2025 - Sep 2025",
      link: "https://mukulsachdeva1997.github.io/KnowYourRights/",
      technologies: ["React", "TypeScript", "Ollama", "GitHub Actions"],
      baselineBullets: [
        "Built an AI-powered legal rights platform with React and TypeScript to help international students in Germany navigate visa, housing, work, police, health, education, and consumer-rights scenarios.",
        "Integrated a privacy-first Ollama document helper, searchable knowledge flows, bookmarks, issue reporting, and GitHub Actions automation to support scalable, source-backed user guidance."
      ]
    },
    {
      id: "iqvia-custom-feature-development",
      name: "IQVIA Custom Feature Development Project",
      subtitle: "C# .NET and React Dashboard Endpoints",
      summary: "Enterprise custom feature development involving backend endpoints and React dashboard integration.",
      date: "Dec 2024 - May 2025",
      technologies: ["C# .NET", "React", "REST APIs", "SQL"],
      baselineBullets: [
        "Developed and maintained custom REST API endpoints using C# and .NET to support new features in IQVIA's data-driven platform.",
        "Improved React-based analytics dashboards and frontend-backend communication to support feature delivery, better usability, and faster response times."
      ]
    },
    {
      id: "prioss",
      name: "PriOSS",
      subtitle: "Privacy One Stop Shop",
      summary: "A privacy platform for visualizing, managing, and controlling personal data from online services.",
      date: "Oct 2022 - Sep 2023",
      link: "https://prioss.cs.uni-paderborn.de/",
      technologies: ["Angular", "TypeScript", "Python", "Figma", "Bootstrap", "JSON", "jQuery"],
      baselineBullets: [
        "Developed PriOSS, a privacy platform for visualizing, managing, and controlling personal data from online services.",
        "Implemented GDPR-focused, privacy-by-design workflows with local-device processing using Angular, TypeScript, Python, Figma, HTML, CSS, Bootstrap, JSON, and jQuery."
      ]
    },
    {
      id: "masters-thesis",
      name: "Master's Thesis",
      subtitle: "Inter-Firm Collaboration (Coopetition) Analysis in Open-Source Ecosystems",
      summary: "A research project analyzing inter-firm collaboration in open-source ecosystems.",
      date: "Oct 2025 - Mar 2026",
      technologies: ["Python", "Data Analysis", "Open Source Mining", "SQL"],
      baselineBullets: [
        "Built an end-to-end analytics workflow to convert PyTorch Git activity into firm-level collaboration networks.",
        "Developed reproducible contributor attribution logic and applied network metrics to analyze collaboration intensity, structural roles, and competitor interaction."
      ]
    },
    {
      id: "architectural-post-classifier",
      name: "Architectural Post Classifier",
      subtitle: "Data Science for Software Engineering",
      summary: "A Python NLP pipeline for classifying software architecture posts.",
      date: "Apr 2024 - Sep 2024",
      technologies: ["Python", "NLP", "Keras", "CNN", "SQL", "NLTK"],
      baselineBullets: [
        "Built a Python NLP pipeline using Keras and a CNN text classifier to classify roughly 2.4k Stack Overflow posts into architectural vs. programming questions.",
        "Preprocessed Stack Overflow data with SQL, NLTK, and BeautifulSoup, then evaluated pretrained Word2Vec models using Keras Tuner, 10-fold cross-validation, precision, recall, F1-score, and confusion matrices."
      ]
    }
  ],
  experience: [
    {
      company: "Lasken GmbH",
      title: "Full Stack Developer",
      location: "Paderborn",
      startDate: "Dec 2024",
      endDate: "May 2025",
      technologies: ["React", "Angular", "Python Flask", "C# .NET", "MySQL", "Docker", "AWS"],
      baselineBullets: [
        "Developed responsive React and Angular web applications, improving cross-device usability, frontend performance, and user experience for production features.",
        "Built and maintained REST API endpoints using Python Flask and C# .NET, integrated MySQL databases, and supported deployment workflows with GitHub, Docker, and AWS."
      ]
    },
    {
      company: "ANSH InfoTech",
      title: "Software Engineer Intern",
      location: "Ludhiana, Punjab, India",
      startDate: "Jun 2020",
      endDate: "Dec 2021",
      technologies: ["HTML", "CSS", "JavaScript", "Bootstrap", "PHP", "MySQL", "Python", "Machine Learning", "SQL"],
      baselineBullets: [
        "Completed industrial training in Web Development and Data Science, focused on building practical software solutions and machine learning prototypes.",
        "Developed a user-friendly restaurant website with online ordering functionality using HTML, CSS, JavaScript, Bootstrap, PHP, and MySQL.",
        "Built a predictive disease diagnosis model using Python and machine learning algorithms to support symptom-based early disease identification.",
        "Worked across frontend, backend, database, and ML components, strengthening practical skills in full-stack development and applied data science."
      ]
    }
  ],
  education: [
    {
      institution: "Guru Nanak Dev Engineering College",
      degree: "Bachelor of Technology (B.Tech) - Computer Science",
      location: "Ludhiana, India",
      startDate: "Aug 2016",
      endDate: "Apr 2020",
      details: ["Major Project: Profanity Spotting", "Minor Project: Disease Prediction System, Restaurant Management System"]
    },
    {
      institution: "Universität Paderborn",
      degree: "Master of Science (MSc.) in Computer Science",
      location: "Paderborn, Germany",
      startDate: "Apr 2022",
      endDate: "Jun 2026",
      details: [
        "Seminar Work:",
        "Noval Approaches of Requirements Elicitation, Reuse and Evolution",
        "Advancements in Parallelising Static Program Analyses: A Comprehensive Overview"
      ]
    }
  ],
  languages: [
    { language: "Hindi", level: "Mother tongue" },
    { language: "English", level: "C1 (fluent)" },
    { language: "German", level: "B1 (proficient)" }
  ],
  volunteering: [
    {
      title: "Team Leader",
      location: "Ludhiana",
      startDate: "Jun 2017",
      endDate: "Mar 2022",
      bullets: [
        "Organized various blood donation camps as team leader.",
        "Organized sanitary workshops for children."
      ]
    }
  ]
};

export const projectOptions = baselineResume.projects.map((project) => ({
  id: project.id,
  name: project.name,
  subtitle: project.subtitle,
  technologies: project.technologies
}));
