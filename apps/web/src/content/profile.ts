// Everything on the page that isn't loaded from the API.

// TODO: replace with Sarah's Calendly link
export const CALENDLY_URL = "https://calendly.com/";

export const RESUME_URL = "/v1/images/sarah-adewale-resume.pdf";

export const intro = {
  name: "Hi, I’m Sarah",
  role: "Full-stack engineer & SDET, leading QA @ Cede Technologies",
  bio: [
    "I build and test software end to end: APIs, databases and deployment pipelines on the back end, React and Next.js interfaces on the front, and the automated tests that keep both honest.",
    "I write code like someone who will have to break it, and test like someone who knows how it was built. Off the clock, you’ll find me in the terminal or reading a novel.",
  ],
};

export const socials = {
  linkedin: "https://www.linkedin.com/in/sarah-adewale/",
  devto: "https://dev.to/sarahadewale",
  github: "https://github.com/sarah-adewale",
};

export const KENE_URL = "https://hellokene.com/";

export interface CareerEntry {
  dates: string;
  role: string;
  company: string;
  summary: string;
}

// Rvysion and 100devs are from the resume; the Cede dates still need filling in.
export const career: CareerEntry[] = [
  {
    dates: "Present",
    role: "Lead QA Engineer",
    company: "Cede Technologies ltd.",
    summary: "Assured quality on features that serviced over 3,000+ customers and over N2 billion in transaction volume",
  },
  {
    dates: "Oct 2024 - Present",
    role: "Lead Backend Engineer",
    company: "Rvysion Studios",
    summary: "Led Idara’s migration from Laravel to NestJS, improving performance by 40%, and cut response times by 60% with query optimisation and caching",
  },
  {
    dates: "Oct 2021 - 2024",
    role: "Software Engineer",
    company: "100devs",
    summary: "Built REST APIs and server-side apps with Node.js, Express, Laravel and MongoDB, test-driven with Jest and Supertest",
  },
];

// `icon` is a file in public/icons/stack (without .svg)
export const stack: { dir: string; items: { name: string; icon?: string }[] }[] = [
  {
    dir: "frontend",
    items: [
      { name: "React", icon: "React" },
      { name: "Next.js", icon: "Nextjs" },
      { name: "CSS3", icon: "CSS3" },
      { name: "jQuery", icon: "jQuery" },
    ],
  },
  {
    dir: "backend",
    items: [
      { name: "Node.js", icon: "Node.js" },
      { name: "Postman", icon: "Postman" },
      { name: "GraphQL", icon: "GraphQL" },
      { name: "cURL", icon: "cURL" },
    ],
  },
  {
    dir: "database",
    items: [
      { name: "MongoDB", icon: "MongoDB" },
      { name: "PostgreSQL", icon: "PostgreSQL" },
      { name: "Redis", icon: "Redis" },
      { name: "MySQL", icon: "MySQL" },
    ],
  },
  {
    dir: "devops-and-qa",
    items: [
      { name: "AWS", icon: "AWS" },
      { name: "Heroku", icon: "Heroku" },
      { name: "GitHub", icon: "GitHub" },
      { name: "Jest", icon: "Jest" },
      { name: "Cypress", icon: "Cypress" },
    ],
  },
];
