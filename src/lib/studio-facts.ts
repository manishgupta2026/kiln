export interface BudgetTier {
  id: string;
  label: string;
  value: string;
  scope: string;
  timeline: string;
}

export const BUDGET_TIERS: BudgetTier[] = [
  {
    id: "under-50k",
    label: "Under ₹50k",
    value: "Under ₹50k",
    scope: "Focused landing pages, UI audits, or single-feature builds",
    timeline: "1-2 weeks",
  },
  {
    id: "50k-2l",
    label: "₹50k - ₹2L",
    value: "₹50k - ₹2L",
    scope: "Full marketing websites, design systems, and lean web applications",
    timeline: "2-5 weeks",
  },
  {
    id: "2l-plus",
    label: "₹2L+",
    value: "₹2L+",
    scope: "Multi-role SaaS products, client portals, and data-heavy platforms",
    timeline: "6-12+ weeks",
  },
  {
    id: "custom",
    label: "Let's talk",
    value: "Let's talk",
    scope: "Custom product suites and ongoing dedicated engineering retainers",
    timeline: "Scoped after brief",
  },
];

export const STUDIO_FACTS = {
  brandName: "DigiGrantha",
  tagline: "Where ideas become digital",
  siteUrl: "https://digigrantha.com",
  contactEmail: "team@digigrantha.com",
  replySla: "1-2 business days",
  architectureStack: [
    "Next.js 15 (App Router)",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
    "PostgreSQL (Neon)",
    "Prisma ORM",
    "Cloudflare Workers (OpenNext)",
  ],
  metrics: {
    serpraise: {
      legacyYears: "20+",
      versionsShipped: "2",
      markets: "India & Australia",
      summary: "20+ years corporate training legacy across V1 and V2 releases",
    },
    coursehunt: {
      dailyUsers: "1,000+",
      coursesListed: "10,000+",
      summary: "1,000+ daily active students across 10,000+ verified courses",
    },
    coppter: {
      portalsShipped: "4",
      summary: "4 dedicated role-based portals (Leadership, HR Pilots, Employees, Mentors)",
    },
    tradesage: {
      liveWinRate: "60.5%",
      backtestWinRate: "70.5%",
      trainingYears: "10 years",
      equitiesCovered: "2,200+ NSE stocks",
      summary: "60.5% live capital win rate (70.5% backtested across 10 years of NSE data)",
    },
  },
} as const;

