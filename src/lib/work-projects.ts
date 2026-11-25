import { STUDIO_FACTS } from "@/lib/studio-facts";

export interface WorkProjectItem {
  id: string;
  idx: string;
  name: string;
  category: string;
  status: "live" | "in-progress";
  statusLabel: string;
  oneLiner: string;
  resultStat?: string;
  metrics: { icon: string; val: string; label: string }[];
  tags: string[];
  liveUrl: string | null;
  version1Url?: string;
  version2Url?: string;
  secondaryLabel: string;
  briefDescription?: string;
  photos?: string[];
}

export const WORK_PROJECTS: WorkProjectItem[] = [
  {
    id: "study-5e-serpraise",
    idx: "01",
    name: "5e Serpraise",
    category: "Corporate Training · OD Consulting",
    status: "live",
    statusLabel: "Live in production",
    oneLiner: "Corporate training and organizational development platform built across two major generational releases.",
    resultStat: `${STUDIO_FACTS.metrics.serpraise.legacyYears} years legacy · 2 versions`,
    metrics: [
      { icon: "⭐", val: STUDIO_FACTS.metrics.serpraise.legacyYears, label: "Years legacy" },
      { icon: "🚀", val: STUDIO_FACTS.metrics.serpraise.versionsShipped, label: "Versions shipped" },
      { icon: "🌏", val: "2", label: "Global markets" },
    ],
    tags: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
    liveUrl: "https://5eserpraise.com",
    version1Url: "https://5eserpraise.com",
    version2Url: "https://5e-serpraise.vercel.app/",
    secondaryLabel: "Read case study",
    briefDescription:
      "A human resources, corporate training, and organization development initiative operating since 2003 across India and Australia. We architected and delivered both generations of their digital experience: Version 1 on production and Version 2 with an editorial design system and interactive module architecture.",
  },
  {
    id: "cmtzk3on50003i240peo85zlm",
    idx: "02",
    name: "Manraah",
    category: "HealthTech · Mental Wellness",
    status: "in-progress",
    statusLabel: "In progress",
    oneLiner: "A mental wellness platform with dedicated student, professional, and admin experiences.",
    resultStat: "3 user groups",
    metrics: [
      { icon: "👥", val: "3", label: "User groups" },
      { icon: "❤️", val: "Wellness", label: "First approach" },
      { icon: "⛁", val: "Scalable", label: "& secure" },
    ],
    tags: ["Next.js", "TypeScript", "Tailwind", "Neon"],
    liveUrl: null,
    photos: [
      "/photos/manraah/manraah-11.jpeg",
      "/photos/manraah/manraah-7.jpeg",
      "/photos/manraah/manraah-8.jpeg",
      "/photos/manraah/manraah-9.jpeg",
      "/photos/manraah/manraah-1.jpeg",
      "/photos/manraah/manraah-10.jpeg",
      "/photos/manraah/manraah-2.jpeg",
      "/photos/manraah/manraah-3.jpeg",
      "/photos/manraah/manraah-12.jpeg",
      "/photos/manraah/manraah-5.jpeg",
      "/photos/manraah/manraah-4.jpeg",
      "/photos/manraah/manraah-6.jpeg",
    ],
    secondaryLabel: "Read case study",
    briefDescription:
      "A mental wellness platform with separate experiences for students, professionals, and admins. Each role gets its own permissions, flows, and interface instead of one dashboard trying to serve three audiences at once.",
  },
  {
    id: "study-nutriflex",
    idx: "03",
    name: "NutriFlex",
    category: "HealthTech · Fitness",
    status: "live",
    statusLabel: "Live in production",
    oneLiner: "Personal fitness platform delivering dynamic workout progressions and structured health routines.",
    resultStat: "100% personalized",
    metrics: [
      { icon: "→", val: "Dynamic", label: "Task engine" },
      { icon: "·", val: "100%", label: "Personalized" },
      { icon: "✓", val: "Full", label: "Fitness suite" },
    ],
    tags: ["Next.js", "React", "TypeScript", "Bootstrap"],
    liveUrl: null,
    photos: [
      "/photos/nutriflex/nutriflex-1.jpeg",
      "/photos/nutriflex/nutriflex-2.jpeg",
      "/photos/nutriflex/nutriflex-4.jpeg",
      "/photos/nutriflex/nutriflex-5.jpeg",
      "/photos/nutriflex/nutriflex-3.jpeg",
    ],
    secondaryLabel: "Read case study",
    briefDescription:
      "An adaptive fitness and nutrition platform built to eliminate generic routines. NutriFlex generates customized weekly workout schedules, dynamic exercise progressions, and structured goal tracking tailored to individual athletes.",
  },
  {
    id: "cmtzk3o4d0002i240zv5grujz",
    idx: "04",
    name: "Coppter",
    category: "Workforce · Enterprise",
    status: "live",
    statusLabel: "Live in production",
    oneLiner: "A workforce management system with four dedicated portals for different job roles.",
    resultStat: `${STUDIO_FACTS.metrics.coppter.portalsShipped} portals shipped`,
    metrics: [
      { icon: "⚏", val: STUDIO_FACTS.metrics.coppter.portalsShipped, label: "Portals shipped" },
      { icon: "👥", val: "Multiple", label: "User roles" },
      { icon: "🛡️", val: "Unified", label: "Operations" },
    ],
    tags: ["Next.js", "TypeScript", "Tailwind", "Neon"],
    liveUrl: null,
    photos: [
      "/photos/coppter/coppter-1.jpeg",
      "/photos/coppter/coppter-2.jpeg",
      "/photos/coppter/coppter-3.jpeg",
      "/photos/coppter/coppter-4.jpeg",
      "/photos/coppter/coppter-6.jpeg",
      "/photos/coppter/coppter-5.jpeg",
    ],
    secondaryLabel: "Read case study",
    briefDescription:
      "A workforce intelligence platform built around four distinct roles: a leadership dashboard for strategic analytics, HR operations tools, personalized growth assessments for employees, and a mentor-facing view for career guidance. Four separate logins inside one shared data model.",
  },
  {
    id: "cmtzk3nlb0001i2408g0a3usm",
    idx: "05",
    name: "CourseHunt",
    category: "EdTech · Learning Platform",
    status: "live",
    statusLabel: "Live in production",
    oneLiner: "A course discovery platform that helps students find the right learning opportunities.",
    resultStat: `${STUDIO_FACTS.metrics.coursehunt.dailyUsers} daily users`,
    metrics: [
      { icon: "👥", val: STUDIO_FACTS.metrics.coursehunt.dailyUsers, label: "Daily users" },
      { icon: "📖", val: STUDIO_FACTS.metrics.coursehunt.coursesListed, label: "Courses listed" },
      { icon: "↗", val: "2×", label: "Repeat usage" },
    ],
    tags: ["Next.js", "Supabase", "Vercel"],
    liveUrl: "https://www.coursehunt.tech/",
    secondaryLabel: "Read case study",
    briefDescription:
      "A fast course aggregator built on Next.js and Supabase. Students were losing hours hunting for course links scattered across the internet. CourseHunt automates discovery and link verification so valid listings appear directly when students arrive.",
  },
  {
    id: "cmtzk3myp0000i2408jebuygu",
    idx: "06",
    name: "TradeSage",
    category: "FinTech · Algorithmic Trading",
    status: "live",
    statusLabel: "Live in production",
    oneLiner: "An algorithmic trading platform that analyzes market patterns and executes data-driven trades.",
    resultStat: `${STUDIO_FACTS.metrics.tradesage.liveWinRate} live win rate (${STUDIO_FACTS.metrics.tradesage.backtestWinRate} backtested)`,
    metrics: [
      { icon: "↗", val: STUDIO_FACTS.metrics.tradesage.liveWinRate, label: "Live win rate" },
      { icon: "⛁", val: STUDIO_FACTS.metrics.tradesage.backtestWinRate, label: "Backtested rate" },
      { icon: "→", val: "2,200+", label: "NSE stocks" },
    ],
    tags: ["Python", "XGBoost", "GitHub Actions", "SmartAPI"],
    liveUrl: null,
    photos: [
      "/photos/tradesaga/tradesaga-1.png",
      "/photos/tradesaga/tradesaga-2.png",
      "/photos/tradesaga/tradesaga-3.png",
      "/photos/tradesaga/tradesaga-4.png",
    ],
    secondaryLabel: "Read case study",
    briefDescription:
      "An algorithmic trading system for the Indian equity market (NSE). We trained XGBoost predictive models on ten years of NSE data across 2,200+ stocks, wrapped in automated risk controls with position sizing, regime filters, and a daily loss kill-switch.",
  },
];

