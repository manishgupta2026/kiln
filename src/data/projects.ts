export type ProjectCategory = "product" | "trading" | "in-progress" | string;

export type ProjectPreview = {
  label: string;
  svg: string;
};

export type Project = {
  id: string;
  slug: string;
  idx: string;
  name: string;
  category: ProjectCategory;
  oneLiner: string;
  homepageOneLiner?: string;
  result: string;
  tags: string[];
  status?: "in-progress";
  mobilePreview: string;
  preview: ProjectPreview;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "tradesage",
    slug: "tradesage",
    idx: "01",
    name: "TradeSage",
    category: "trading",
    oneLiner: "An algorithmic trading system for the Indian equity market — ten years of NSE data, automated risk controls, live on real capital.",
    homepageOneLiner: "Taught a model to trade the Indian market so we didn't have to guess twice.",
    result: "60.5% win rate",
    tags: ["Python", "XGBoost", "GitHub Actions", "SmartAPI"],
    mobilePreview: "60.5% live win rate · trained on 10yrs of NSE data across 2,200+ stocks",
    preview: {
      label: "60.5% win rate · 2,200+ stocks tracked",
      svg: `<svg viewBox="0 0 200 100"><polyline points="0,80 40,70 80,75 120,45 160,55 200,20" fill="none" stroke="#75801F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    featured: true,
  },
  {
    id: "coursehunt",
    slug: "coursehunt",
    idx: "02",
    name: "CourseHunt",
    category: "product",
    oneLiner: "A fast course aggregator built on Next.js and Supabase — the shortcut 1,000+ students take every day.",
    homepageOneLiner: "Built the shortcut 1,000+ students take every day instead of hunting for links.",
    result: "1,000+ daily users",
    tags: ["Next.js", "Supabase", "Vercel"],
    mobilePreview: "1,000+ daily active users · Next.js + Supabase",
    preview: {
      label: "1,000+ daily active users",
      svg: `<svg viewBox="0 0 200 100"><rect x="10" y="60" width="180" height="10" rx="5" fill="#75801F" opacity="0.3"/><rect x="10" y="60" width="130" height="10" rx="5" fill="#75801F"/><rect x="10" y="40" width="180" height="10" rx="5" fill="#75801F" opacity="0.3"/><rect x="10" y="40" width="90" height="10" rx="5" fill="#75801F"/></svg>`,
    },
    featured: true,
  },
  {
    id: "coppter",
    slug: "coppter",
    idx: "03",
    name: "Coppter",
    category: "product",
    oneLiner: "Four different logins, four completely different jobs to be done.",
    homepageOneLiner: "Four different logins, four completely different jobs to be done.",
    result: "4 role-based portals shipped",
    tags: ["Next.js", "TypeScript", "Tailwind", "Neon"],
    mobilePreview: "4 role-based portals shipped · Leadership, HR, Employee & Mentor",
    preview: {
      label: "4 role-based portals shipped",
      svg: `<svg viewBox="0 0 200 100"><rect x="20" y="20" width="160" height="60" rx="8" fill="#75801F" opacity="0.25"/><text x="100" y="55" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" fill="#75801F">Coppter</text></svg>`,
    },
    featured: true,
  },
  {
    id: "manraah",
    slug: "manraah",
    idx: "04",
    name: "Manraah",
    category: "in-progress",
    status: "in-progress",
    oneLiner: "A mental wellness platform with dedicated student, professional, and admin experiences.",
    homepageOneLiner: "A mental wellness platform with dedicated student, professional, and admin experiences.",
    result: "Shipping soon",
    tags: ["Next.js", "TypeScript", "Tailwind", "Neon"],
    mobilePreview: "Student, professional & admin dashboards",
    preview: {
      label: "Student, professional & admin dashboards",
      svg: `<svg viewBox="0 0 200 100"><rect x="10" y="15" width="80" height="70" rx="6" fill="#75801F" opacity="0.18"/><rect x="100" y="15" width="90" height="32" rx="6" fill="#75801F" opacity="0.3"/><rect x="100" y="53" width="90" height="32" rx="6" fill="#75801F" opacity="0.18"/></svg>`,
    },
    featured: false,
  },
];
