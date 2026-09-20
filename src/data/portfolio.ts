/**
 * Single source of truth for all portfolio content.
 * Extracted from Abdul Ghani Khan's CV — do not invent additional facts here.
 */

export type SectionId =
  | "home"
  | "education"
  | "experience"
  | "projects"
  | "fyp"
  | "research"
  | "skills"
  | "achievements"
  | "contact";

export interface EducationItem {
  institution: string;
  credential: string;
  period: string;
  detail?: string;
}

export interface ExperienceItem {
  role: string;
  organization: string;
  period: string;
  points: string[];
}

export interface ProjectItem {
  name: string;
  summary: string;
  highlights: string[];
  technologies: string[];
  featured?: boolean;
}

export interface ResearchItem {
  title: string;
  lab: string;
  supervisor: string;
  period: string;
  points: string[];
}

export const portfolio = {
  personal: {
    name: "Abdul Ghani Khan",
    title: "Computer Science Graduate · Full Stack & ML Engineer",
    location: "Islamabad, Pakistan",
    email: "aghani0348@gmail.com",
    phone: "+92 348 9656043",
    linkedin: "https://linkedin.com/in/abdul-ghani-khan",
    cv: "/Abdul_Ghani_Khan_CV.pdf",
    summary:
      "CS graduate from FAST University (CGPA 3.84/4.00) who enjoys building things — from training deep learning models on raw audio to wiring up full-stack web apps. Comfortable on the backend (.NET, MySQL, FastAPI) and on the ML side (Python, scikit-learn). Seven-time Dean's List honoree and six-time Gold Medalist.",
  },

  education: [
    {
      institution: "National University of Computer and Emerging Sciences (FAST), Peshawar",
      credential: "BS in Computer Science",
      period: "Aug 2022 – May 2026",
      detail: "CGPA 3.84 / 4.00",
    },
    {
      institution: "Bahria College E-8 Naval Complex, Islamabad",
      credential: "Higher Secondary School Certification",
      period: "2019 – 2021",
    },
    {
      institution: "Army Public School Westridge 3, Rawalpindi",
      credential: "Secondary School Certification",
      period: "2017 – 2019",
    },
  ] satisfies EducationItem[],

  experience: [
    {
      role: "Technology Intern",
      organization: "Foundation for Civic Tech (Code for Pakistan)",
      period: "May 2026 – Jul 2026",
      points: [
        "Contributing to the backend of FT-AAFAT, a centralized flood disaster management platform for government agencies, built with FastAPI, PostgreSQL (Supabase) and SQLAlchemy.",
        "Designed core data models (Agencies, Users, Roles, Incidents, Resources, Volunteers, Notifications) and integrated Supabase Auth for role-based access control.",
        "Also contributing to Rehbar, a citizen-facing platform simplifying public access to government services and information.",
      ],
    },
    {
      role: "AI/ML Intern",
      organization: "Central Asian Cellular Forum (CACF)",
      period: "Jul 2025 – Aug 2025",
      points: [
        "Completed an AI Engineer Bootcamp covering AI and ML fundamentals.",
        "Developed a Multi-Agentic Wellness Assistant integrating LLMs and vision models.",
        "Built agents for mental health, diet analysis and exercise planning with database logging.",
        "Developed a Streamlit dashboard with chat interface, meal image analysis and exercise tracking.",
        "Integrated Together.ai APIs (LLaMA 3.1 & 3.2) for text and vision tasks.",
      ],
    },
    {
      role: "Full Stack Development Intern",
      organization: "Synergy IT",
      period: "Jul 2025 – Aug 2025",
      points: [
        "Developed backend services using .NET Core with database integration.",
        "Migrated legacy frameworks to .NET Core, improving maintainability and performance.",
        "Contributed to development and integration tasks using Umbraco CMS.",
      ],
    },
    {
      role: "Full Stack Development Intern",
      organization: "Synergy IT",
      period: "Jul 2024 – Aug 2024",
      points: [
        "Integrated .NET APIs with an Angular frontend for blog platform functionality.",
        "Implemented full CRUD operations and backend validation.",
        "Managed MySQL database interactions and mailing features.",
      ],
    },
    {
      role: "Teaching Assistant – Data Structures",
      organization: "FAST Peshawar (Asst. Prof. Fazl-e-Basit)",
      period: "2025",
      points: [
        "Assisted in lab sessions, grading assignments and mentoring students in Data Structures.",
      ],
    },
    {
      role: "Teaching Assistant – Data Structures",
      organization: "FAST Peshawar (Lecturer Samin Ahmed)",
      period: "2025",
      points: [
        "Supported coursework delivery, evaluation and student guidance in Data Structures.",
      ],
    },
    {
      role: "Teaching Assistant – Digital Logic Design & Physics",
      organization: "FAST Peshawar (Asst. Prof. Muhammad Asif Khan)",
      period: "Spring & Fall 2024",
      points: ["Assisted in coursework delivery, grading, lab activities and student mentoring."],
    },
  ] satisfies ExperienceItem[],

  finalYearProject: {
    name: "Content-Based Music Recommendation System",
    summary:
      "Final Year Project — a deep learning music recommendation system that recommends tracks from the audio itself rather than from listening history.",
    highlights: [
      "Uses PANNs (Pretrained Audio Neural Networks) for audio feature extraction.",
      "Generates audio embeddings from raw music files and ranks tracks by cosine similarity.",
      "Preprocessing pipeline covering sampling, spectrograms and feature normalization.",
    ],
    technologies: ["Python", "PANNs", "Deep Learning", "NumPy", "Signal Processing"],
    featured: true,
  } satisfies ProjectItem,

  projects: [
    {
      name: "Multi-Agentic Wellness Assistant",
      summary:
        "A multi-agent AI system combining LLMs and vision models across mental health, diet tracking and exercise planning.",
      highlights: [
        "Designed separate agents for mental health, diet tracking and exercise planning.",
        "Implemented vision-based meal analysis and an adaptive exercise planner.",
        "Built a unified dashboard with text and audio input support.",
      ],
      technologies: ["Python", "Streamlit", "Together.ai", "LLaMA 3.1 & 3.2"],
    },
    {
      name: "Personal Blog Platform",
      summary:
        "Full-stack blogging application with authoring, comments, a mailing system and an admin dashboard.",
      highlights: [
        "Blog creation, comments and admin dashboard.",
        "Mailing system integrated with backend validation.",
        "Full CRUD against a MySQL database.",
      ],
      technologies: ["Angular", ".NET 8", "MySQL"],
    },
    {
      name: "Machine Learning Projects",
      summary:
        "A set of classical machine learning and data analysis studies built with Python and scikit-learn.",
      highlights: [
        "Customer segmentation using K-Means on the Mall Customers dataset.",
        "Phishing email classification using KNN.",
        "Data analysis and visualization with Pandas and Matplotlib.",
      ],
      technologies: ["Python", "scikit-learn", "Pandas", "Matplotlib"],
    },
    {
      name: "Power BI Dashboard – See Sight Tours",
      summary:
        "Interactive business intelligence dashboards visualizing revenue trends and key business KPIs.",
      highlights: [
        "Built interactive dashboards using DAX.",
        "Visualized revenue trends and business KPIs.",
      ],
      technologies: ["Power BI", "DAX"],
    },
  ] satisfies ProjectItem[],

  research: [
    {
      title: "Noise-resilient quantum data provenance for synchrophasor networks",
      lab: "Quantum Information Lab, FAST University, Peshawar",
      supervisor: "Dr. Maqsood Khan",
      period: "Jan 2026 – Jun 2026",
      points: [
        "Implementing quantum protocols using IBM Qiskit and analyzing noise in NISQ devices.",
        "Applying quantum error correction techniques (e.g. the Steane code) to improve system reliability.",
        "Conducting simulations and evaluating system performance under realistic conditions.",
        "Developing a simulation tool with interactive visualization for protocol analysis.",
      ],
    },
  ] satisfies ResearchItem[],

  skills: {
    Languages: ["C++", "Python", "C#", "JavaScript", "TypeScript", "SQL"],
    "Frameworks & Libraries": [
      "Angular",
      "React",
      "Flutter",
      ".NET",
      "FastAPI",
      "SQLAlchemy",
      "Umbraco CMS",
      "Streamlit",
    ],
    "Data & ML": ["Scikit-learn", "Pandas", "Matplotlib", "Machine Learning"],
    Databases: ["MySQL", "PostgreSQL", "Supabase"],
    Tools: ["Cisco Packet Tracer", "LEX/YACC", "Power BI"],
    "Core Areas": [
      "Data Processing",
      "Web APIs",
      "Full Stack Development",
      "OOP",
      "Problem Solving",
    ],
  } as Record<string, string[]>,

  achievements: [
    { title: "7× Dean's List Honoree", detail: "FAST University, Peshawar" },
    { title: "6× Gold Medalist", detail: "Highest SGPA per semester" },
  ],

  leadership: [
    {
      role: "Campus Director",
      organization: "Zindigi Prize",
      period: "2024 – 2025",
      detail:
        "Led the campus team organizing entrepreneurship and innovation events; managed event planning and industry engagement.",
    },
    {
      role: "Vice President",
      organization: "FAST Trekking Society",
      period: "2024 – 2025",
      detail: "Organized trekking events and coordinated logistics and sponsorships.",
    },
    {
      role: "Member",
      organization: "Google Developer Student Club (GDSC FAST)",
      period: "2023 – 2024",
      detail: "Participated in workshops on Android development and cloud technologies.",
    },
    {
      role: "Participant",
      organization: "Young Leaders Connect 1.0",
      period: "April 2025",
      detail: "Represented FAST Peshawar in a national leadership and innovation bootcamp.",
    },
    {
      role: "Host",
      organization: "FAST Peshawar Graduation Ceremony",
      period: "2024",
      detail: "Hosted the official graduation ceremony.",
    },
  ],
};

export const sectionLabels: Record<SectionId, string> = {
  home: "Home",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  fyp: "Final Year Project",
  research: "Research Lab",
  skills: "Skills",
  achievements: "Achievements",
  contact: "Contact",
};
