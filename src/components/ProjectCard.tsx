"use client";

import React from "react";
import { CaseStudyRecord } from "@/lib/case-studies-db";

export interface ProjectCardProps {
  study: {
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
  };
  onOpenCaseStudy: (study: any) => void;
  onOpenPhotos?: (study: any) => void;
}

export const WORK_PROJECTS = [
  {
    id: "study-5e-serpraise",
    idx: "01",
    name: "5e Serpraise",
    category: "Corporate Training · OD Consulting",
    status: "live" as const,
    statusLabel: "Live in production",
    oneLiner: "Corporate training and organizational development platform built across two major generational releases.",
    resultStat: "20+ years legacy · 2 versions",
    metrics: [
      { icon: "⭐", val: "20+", label: "Years legacy" },
      { icon: "🚀", val: "2", label: "Versions shipped" },
      { icon: "🌏", val: "2", label: "Global markets" },
    ],
    tags: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
    liveUrl: "https://5eserpraise.com",
    version1Url: "https://5eserpraise.com",
    version2Url: "https://5e-serpraise.vercel.app/",
    secondaryLabel: "Read case study",
    briefDescription:
      "A human resources, corporate training, and organization development initiative operating since 2003 across India and Australia. We architected and delivered both generations of their digital experience: Version 1 on production and Version 2 with a modernized, editorial design system and interactive module architecture.",
  },
  {
    id: "cmtzk3on50003i240peo85zlm",
    idx: "02",
    name: "Manraah",
    category: "HealthTech · Mental Wellness",
    status: "in-progress" as const,
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
      "A mental wellness platform with entirely separate experiences for students, professionals, and admins — each with its own permissions, flows, and interface, not one dashboard trying to serve three audiences at once.",
  },
  {
    id: "study-nutriflex",
    idx: "03",
    name: "NutriFlex",
    category: "HealthTech · Fitness",
    status: "live" as const,
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
    status: "live" as const,
    statusLabel: "Live in production",
    oneLiner: "A workforce management system with four dedicated portals for different job roles.",
    resultStat: "4 portals shipped",
    metrics: [
      { icon: "⚏", val: "4", label: "Portals shipped" },
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
      "A workforce intelligence platform built around four distinct roles — a leadership dashboard for strategic analytics, HR operations tools, personalized growth assessments for employees, and a mentor-facing view for career guidance. Four different logins, because four different people need four different tools, not one dashboard wearing four hats.",
  },
  {
    id: "cmtzk3nlb0001i2408g0a3usm",
    idx: "05",
    name: "CourseHunt",
    category: "EdTech · Learning Platform",
    status: "live" as const,
    statusLabel: "Live in production",
    oneLiner: "A course discovery platform that helps students find the right learning opportunities.",
    resultStat: "1,000+ daily users",
    metrics: [
      { icon: "👥", val: "1,000+", label: "Daily users" },
      { icon: "📖", val: "10K+", label: "Courses listed" },
      { icon: "↗", val: "2×", label: "Repeat usage" },
    ],
    tags: ["Next.js", "Supabase", "Vercel"],
    liveUrl: "https://www.coursehunt.tech/",
    secondaryLabel: "Read case study",
    briefDescription:
      "A fast course aggregator built on Next.js and Supabase. Students were losing hours hunting for course links scattered across the internet — CourseHunt automates discovery and validation so listings are already there, and already working, when they arrive.",
  },
  {
    id: "cmtzk3myp0000i2408jebuygu",
    idx: "06",
    name: "TradeSage",
    category: "FinTech · Algorithmic Trading",
    status: "live" as const,
    statusLabel: "Live in production",
    oneLiner: "An algorithmic trading platform that analyzes market patterns and executes data-driven trades.",
    resultStat: "70.5% win rate",
    metrics: [
      { icon: "↗", val: "70.5%", label: "Win rate" },
      { icon: "⛁", val: "5+", label: "Trading models" },
      { icon: "→", val: "Real-time", label: "Market execution" },
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
      "An algorithmic trading system for the Indian equity market. We trained a model on ten years of NSE data across 2,200+ stocks, then wrapped it in automated risk controls — position sizing, regime filters, and a daily loss kill-switch — so the model can't outrun its own discipline.",
  },
];

export interface ShowcaseMeta {
  webp: string;
  png: string;
  domain: string;
  siteName: string;
  isDark: boolean;
  alt: string;
}

export function getProjectShowcase(name: string): ShowcaseMeta | null {
  const n = (name || "").toLowerCase();
  if (n.includes("5e") || n.includes("serpraise")) {
    return {
      webp: "/photos/showcase/5e.webp",
      png: "/photos/showcase/5e.png",
      domain: "5eserpraise.com",
      siteName: "5e Serpraise",
      isDark: false,
      alt: "5e Serpraise corporate HR and organizational development live website",
    };
  }
  if (n.includes("manraah")) {
    return {
      webp: "/photos/showcase/manraah.webp",
      png: "/photos/showcase/manraah.png",
      domain: "manraah.vercel.app",
      siteName: "Manraah",
      isDark: true,
      alt: "Manraah mental wellness platform live website",
    };
  }
  if (n.includes("nutri")) {
    return {
      webp: "/photos/showcase/nutriflex.webp",
      png: "/photos/showcase/nutriflex.png",
      domain: "nutri-flexs.vercel.app",
      siteName: "NutriFlex",
      isDark: false,
      alt: "NutriFlex real food nutrition and gym-adjacent fuel live website",
    };
  }
  if (n.includes("coppter") || n.includes("copter")) {
    return {
      webp: "/photos/showcase/coppter.webp",
      png: "/photos/showcase/coppter.png",
      domain: "coppter-frontend.onrender.com",
      siteName: "Coppter",
      isDark: false,
      alt: "Coppter workforce growth intelligence platform live website",
    };
  }
  if (n.includes("coursehunt")) {
    return {
      webp: "/photos/showcase/coursehunt.webp",
      png: "/photos/showcase/coursehunt.png",
      domain: "coursehunt.tech",
      siteName: "CourseHunt",
      isDark: false,
      alt: "CourseHunt course discovery and aggregation platform live website",
    };
  }
  if (n.includes("tradesage") || n.includes("tradesaga")) {
    return {
      webp: "/photos/showcase/tradesage.webp",
      png: "/photos/showcase/tradesage.png",
      domain: "tradesagaai.duckdns.org",
      siteName: "TradeSage",
      isDark: true,
      alt: "TradeSage algorithmic trading quantitative terminal dashboard",
    };
  }
  return null;
}

export function TradeSageMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" fill="#090D14" />
      {/* Top Header Bar */}
      <rect width="320" height="24" fill="#0D1420" stroke="#162234" strokeWidth="0.8" />
      <g transform="translate(10, 5)">
        <circle cx="7" cy="7" r="6" fill="#8B5CF6" />
        <circle cx="7" cy="7" r="3" fill="#C4B5FD" />
        <text x="18" y="10" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="800">TradeSage</text>
      </g>
      <g transform="translate(110, 8)">
        <circle cx="4" cy="4" r="2.5" fill="#10B981" />
        <text x="10" y="6.5" fill="#10B981" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">MARKET OPEN</text>
        <text x="75" y="6.5" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="6">Last Scan: 12:18:44</text>
      </g>
      <rect x="260" y="4" width="50" height="15" rx="7.5" fill="#8B5CF6" />
      <text x="285" y="14" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="800">SCAN NOW</text>
      {/* 4 Metric Top KPI Cards */}
      <g transform="translate(10, 30)">
        <rect x="0" y="0" width="70" height="42" rx="5" fill="#0D1524" stroke="#192842" strokeWidth="0.8" />
        <text x="6" y="12" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="700">TOTAL SIGNALS</text>
        <text x="6" y="28" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="900">24</text>
        <text x="6" y="37" fill="#10B981" fontFamily="system-ui, sans-serif" fontSize="5">● 100% verified</text>

        <rect x="76" y="0" width="70" height="42" rx="5" fill="#0D1524" stroke="#192842" strokeWidth="0.8" />
        <text x="82" y="12" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="700">HIGH CONFIDENCE</text>
        <text x="82" y="28" fill="#A78BFA" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="900">24</text>
        <text x="82" y="37" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5">prob ≥ 0.75</text>

        <rect x="152" y="0" width="70" height="42" rx="5" fill="#0D1524" stroke="#192842" strokeWidth="0.8" />
        <text x="158" y="12" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="700">ACTIVE TRADES</text>
        <text x="158" y="28" fill="#60A5FA" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="900">5</text>
        <text x="158" y="37" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5">Risk bounded</text>

        <rect x="228" y="0" width="82" height="42" rx="5" fill="#0D1524" stroke="#192842" strokeWidth="0.8" />
        <text x="234" y="12" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="700">WIN RATE %</text>
        <text x="234" y="28" fill="#FACC15" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="900">78.0%</text>
        <text x="234" y="37" fill="#10B981" fontFamily="system-ui, sans-serif" fontSize="5">model predicted</text>
      </g>
      {/* Probabilistic Signal Feed Table */}
      <g transform="translate(10, 80)">
        <text x="0" y="8" fill="#94A3B8" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="800" letterSpacing="0.05em">PROBABILISTIC SIGNAL FEED</text>
        {/* Table Header */}
        <rect y="12" width="300" height="13" rx="3" fill="#0F1B2E" />
        <text x="8" y="21" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="700">SYMBOL</text>
        <text x="75" y="21" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="700">PROBABILITY</text>
        <text x="150" y="21" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="700">SIGNAL</text>
        <text x="195" y="21" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="700">TARGET</text>
        <text x="250" y="21" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="700">STOP LOSS</text>
        {/* Row 1 */}
        <g transform="translate(0, 27)">
          <rect width="300" height="18" fill="#0A101A" />
          <text x="8" y="12" fill="#F8FAFC" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">RELIANCE</text>
          <text x="75" y="12" fill="#10B981" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">94.3%</text>
          <rect x="105" y="7" width="35" height="5" rx="2.5" fill="#1E293B" />
          <rect x="105" y="7" width="32" height="5" rx="2.5" fill="#10B981" />
          <rect x="150" y="4" width="26" height="11" rx="3" fill="#064E3B" />
          <text x="163" y="12" textAnchor="middle" fill="#34D399" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="800">BUY</text>
          <text x="195" y="12" fill="#F8FAFC" fontFamily="system-ui, sans-serif" fontSize="6">₹3,040</text>
          <text x="250" y="12" fill="#EF4444" fontFamily="system-ui, sans-serif" fontSize="6">₹2,910</text>
        </g>
        {/* Row 2 */}
        <g transform="translate(0, 47)">
          <rect width="300" height="18" fill="#0D1420" />
          <text x="8" y="12" fill="#F8FAFC" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">TCS</text>
          <text x="75" y="12" fill="#10B981" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">94.4%</text>
          <rect x="105" y="7" width="35" height="5" rx="2.5" fill="#1E293B" />
          <rect x="105" y="7" width="33" height="5" rx="2.5" fill="#10B981" />
          <rect x="150" y="4" width="26" height="11" rx="3" fill="#064E3B" />
          <text x="163" y="12" textAnchor="middle" fill="#34D399" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="800">BUY</text>
          <text x="195" y="12" fill="#F8FAFC" fontFamily="system-ui, sans-serif" fontSize="6">₹4,250</text>
          <text x="250" y="12" fill="#EF4444" fontFamily="system-ui, sans-serif" fontSize="6">₹4,080</text>
        </g>
        {/* Row 3 */}
        <g transform="translate(0, 67)">
          <rect width="300" height="18" fill="#0A101A" />
          <text x="8" y="12" fill="#F8FAFC" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">INFY</text>
          <text x="75" y="12" fill="#10B981" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">92.1%</text>
          <rect x="105" y="7" width="35" height="5" rx="2.5" fill="#1E293B" />
          <rect x="105" y="7" width="30" height="5" rx="2.5" fill="#10B981" />
          <rect x="150" y="4" width="26" height="11" rx="3" fill="#064E3B" />
          <text x="163" y="12" textAnchor="middle" fill="#34D399" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="800">BUY</text>
          <text x="195" y="12" fill="#F8FAFC" fontFamily="system-ui, sans-serif" fontSize="6">₹1,940</text>
          <text x="250" y="12" fill="#EF4444" fontFamily="system-ui, sans-serif" fontSize="6">₹1,850</text>
        </g>
        {/* Row 4 */}
        <g transform="translate(0, 87)">
          <rect width="300" height="18" fill="#0D1420" />
          <text x="8" y="12" fill="#F8FAFC" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">HDFCBANK</text>
          <text x="75" y="12" fill="#10B981" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">88.5%</text>
          <rect x="105" y="7" width="35" height="5" rx="2.5" fill="#1E293B" />
          <rect x="105" y="7" width="28" height="5" rx="2.5" fill="#10B981" />
          <rect x="150" y="4" width="26" height="11" rx="3" fill="#064E3B" />
          <text x="163" y="12" textAnchor="middle" fill="#34D399" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="800">BUY</text>
          <text x="195" y="12" fill="#F8FAFC" fontFamily="system-ui, sans-serif" fontSize="6">₹1,720</text>
          <text x="250" y="12" fill="#EF4444" fontFamily="system-ui, sans-serif" fontSize="6">₹1,640</text>
        </g>
      </g>
      {/* Bottom Live System Strip */}
      <g transform="translate(10, 202)">
        <text x="0" y="9" fill="#10B981" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">● SSE Scanner Active</text>
        <text x="110" y="9" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="6">Kill-Switch: Armed</text>
        <text x="210" y="9" fill="#A78BFA" fontFamily="system-ui, sans-serif" fontSize="6">Model: XGBoost v2.4</text>
      </g>
    </svg>
  );
}

export function CourseHuntMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" fill="#FFFFFF" />
      {/* Top Navbar */}
      <rect width="320" height="26" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
      <g transform="translate(10, 5)">
        <polygon points="8,1 15,5 8,9 1,5" fill="#2563EB" />
        <polygon points="1,6 8,10 8,14 1,10" fill="#F97316" />
        <polygon points="15,6 8,10 8,14 15,10" fill="#2563EB" />
        <text x="20" y="11" fill="#0F172A" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="800">CourseHunt</text>
      </g>
      {/* Search Input Bar */}
      <g transform="translate(110, 5)">
        <rect x="0" y="0" width="140" height="16" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
        <circle cx="10" cy="8" r="3" stroke="#64748B" strokeWidth="1" fill="none" />
        <line x1="12" y1="10" x2="14" y2="12" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
        <text x="20" y="11" fill="#94A3B8" fontFamily="system-ui, sans-serif" fontSize="6">Search courses, skills...</text>
      </g>
      <rect x="258" y="5" width="52" height="16" rx="8" fill="#2563EB" />
      <text x="284" y="15.5" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">Sign Up</text>
      {/* Blue Alert Banner */}
      <rect y="26" width="320" height="14" fill="#2563EB" />
      <text x="160" y="35.5" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="600">⚡ Sign up or login to access Premium Courses &amp; Coupons</text>
      {/* Hero Left Content */}
      <g transform="translate(14, 48)">
        <rect x="0" y="0" width="105" height="13" rx="6.5" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="0.8" />
        <text x="6" y="9" fill="#2563EB" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="700">Free Online Courses &amp; Coupons</text>
        <text x="0" y="34" fill="#0F172A" fontFamily="system-ui, sans-serif" fontSize="16" fontWeight="900">Let the Hunt</text>
        <text x="0" y="52" fill="#0F172A" fontFamily="system-ui, sans-serif" fontSize="16" fontWeight="900">Begin.</text>
        <text x="0" y="66" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="6.5">Discover 10,000+ free courses curated from</text>
        <text x="0" y="74" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="6.5">top universities &amp; platforms worldwide.</text>
        {/* Buttons */}
        <rect x="0" y="82" width="76" height="18" rx="5" fill="#2563EB" />
        <text x="38" y="94" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">Explore Courses</text>
        <rect x="82" y="82" width="68" height="18" rx="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1" />
        <text x="116" y="94" textAnchor="middle" fill="#2563EB" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">🤖 AI Tools</text>
      </g>
      {/* Hero Right Visual - Floating Student with Laptop */}
      <g transform="translate(195, 48)">
        <circle cx="60" cy="50" r="45" fill="#EFF6FF" />
        {/* Student illustration elements */}
        <circle cx="60" cy="32" r="10" fill="#FDBA74" />
        <path d="M52 28 C52 22 68 22 68 28 Z" fill="#0F172A" />
        <rect x="50" y="44" width="20" height="26" rx="4" fill="#2563EB" />
        {/* Laptop */}
        <rect x="42" y="54" width="36" height="18" rx="2" fill="#1E293B" />
        <rect x="44" y="56" width="32" height="14" fill="#60A5FA" />
        {/* Floating knowledge badges */}
        <circle cx="25" cy="25" r="7" fill="#FCD34D" />
        <text x="25" y="27" textAnchor="middle" fill="#78350F" fontSize="7">💡</text>
        <circle cx="95" cy="35" r="7" fill="#93C5FD" />
        <text x="95" y="37" textAnchor="middle" fill="#1E3A8A" fontSize="7">🧠</text>
        <circle cx="90" cy="75" r="6" fill="#F472B6" />
        <text x="90" y="77" textAnchor="middle" fill="#831843" fontSize="6">🎯</text>
      </g>
      {/* Bottom 4 Blue Stat Cards */}
      <g transform="translate(0, 166)">
        <rect width="320" height="54" fill="#2563EB" />
        <text x="40" y="20" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="900">100%</text>
        <text x="40" y="30" textAnchor="middle" fill="#BFDBFE" fontFamily="system-ui, sans-serif" fontSize="5.5">Free Courses</text>

        <text x="120" y="20" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="900">Daily</text>
        <text x="120" y="30" textAnchor="middle" fill="#BFDBFE" fontFamily="system-ui, sans-serif" fontSize="5.5">New Updates</text>

        <text x="200" y="20" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="900">Verified</text>
        <text x="200" y="30" textAnchor="middle" fill="#BFDBFE" fontFamily="system-ui, sans-serif" fontSize="5.5">Active Coupons</text>

        <text x="280" y="20" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="900">Instant</text>
        <text x="280" y="30" textAnchor="middle" fill="#BFDBFE" fontFamily="system-ui, sans-serif" fontSize="5.5">Access 24/7</text>
      </g>
    </svg>
  );
}

export function CoppterMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Warm Ivory Background */}
      <rect width="320" height="220" fill="#FAF8F2" />
      {/* Top Navbar */}
      <rect width="320" height="26" fill="#FAF8F2" />
      <text x="14" y="17" fill="#1C1917" fontFamily="Georgia, serif" fontSize="12" fontWeight="800" letterSpacing="0.08em">COPPTER</text>
      <text x="80" y="16" fill="#78716C" fontFamily="system-ui, sans-serif" fontSize="6.5">Human-first Workforce</text>
      <g transform="translate(240, 7)">
        <text x="0" y="8" fill="#57534E" fontFamily="system-ui, sans-serif" fontSize="6.5">About</text>
        <text x="26" y="8" fill="#57534E" fontFamily="system-ui, sans-serif" fontSize="6.5">Contact</text>
      </g>
      {/* Hero Badge */}
      <g transform="translate(85, 34)">
        <rect x="0" y="0" width="150" height="15" rx="7.5" fill="#FFFFFF" stroke="#E7E5E4" strokeWidth="0.8" />
        <text x="75" y="10.5" textAnchor="middle" fill="#78716C" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="600">✨ Growth • Insights • Team Success</text>
      </g>
      {/* Hero Headline */}
      <text x="160" y="66" textAnchor="middle" fill="#1C1917" fontFamily="Georgia, serif" fontSize="16" fontWeight="700">Helping People Grow</text>
      <text x="160" y="84" textAnchor="middle" fill="#B45309" fontFamily="Georgia, serif" fontSize="16" fontWeight="700">Beyond Expectations</text>
      {/* Golden loop accent under 'Grow' */}
      <path d="M110 88 C135 92, 185 92, 210 88" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <text x="160" y="99" textAnchor="middle" fill="#78716C" fontFamily="system-ui, sans-serif" fontSize="6.5">COPPTER creates meaningful workplace journeys through 4 dedicated role portals.</text>
      {/* 3D Keyboard Keys Spelled [C][O][P][P][T][E][R] */}
      <g transform="translate(18, 114)">
        <text x="142" y="-4" textAnchor="middle" fill="#A8A29E" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="700" letterSpacing="0.1em">THE MEANING BEHIND COPPTER</text>
        {[
          { l: "C", x: 0 },
          { l: "O", x: 41 },
          { l: "P", x: 82 },
          { l: "P", x: 123 },
          { l: "T", x: 164 },
          { l: "E", x: 205 },
          { l: "R", x: 246 },
        ].map((k, idx) => (
          <g key={idx} transform={`translate(${k.x}, 4)`}>
            {/* Key Shadow */}
            <rect x="0" y="4" width="38" height="38" rx="8" fill="#D6D3CD" />
            {/* Key Base */}
            <rect x="0" y="0" width="38" height="38" rx="8" fill="#FFFFFF" stroke="#E7E5E4" strokeWidth="1" />
            {/* Key Top Surface */}
            <rect x="3" y="2" width="32" height="30" rx="5" fill="#FAF8F5" />
            <text x="19" y="22" textAnchor="middle" fill="#B45309" fontFamily="Georgia, serif" fontSize="14" fontWeight="800">{k.l}</text>
          </g>
        ))}
      </g>
      {/* Bottom 4 Portals Bar */}
      <g transform="translate(18, 172)">
        <rect x="0" y="0" width="66" height="36" rx="6" fill="#FFFFFF" stroke="#E7E5E4" strokeWidth="0.8" />
        <text x="33" y="15" textAnchor="middle" fill="#1C1917" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">Leadership</text>
        <text x="33" y="25" textAnchor="middle" fill="#B45309" fontFamily="system-ui, sans-serif" fontSize="5.5">C-Suite Portal</text>

        <rect x="73" y="0" width="66" height="36" rx="6" fill="#FFFFFF" stroke="#E7E5E4" strokeWidth="0.8" />
        <text x="106" y="15" textAnchor="middle" fill="#1C1917" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">HR Operations</text>
        <text x="106" y="25" textAnchor="middle" fill="#78716C" fontFamily="system-ui, sans-serif" fontSize="5.5">Pilot Hub</text>

        <rect x="146" y="0" width="66" height="36" rx="6" fill="#FFFFFF" stroke="#E7E5E4" strokeWidth="0.8" />
        <text x="179" y="15" textAnchor="middle" fill="#1C1917" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">Employee</text>
        <text x="179" y="25" textAnchor="middle" fill="#78716C" fontFamily="system-ui, sans-serif" fontSize="5.5">Growth Engine</text>

        <rect x="219" y="0" width="66" height="36" rx="6" fill="#FFFFFF" stroke="#E7E5E4" strokeWidth="0.8" />
        <text x="252" y="15" textAnchor="middle" fill="#1C1917" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">Mentorship</text>
        <text x="252" y="25" textAnchor="middle" fill="#78716C" fontFamily="system-ui, sans-serif" fontSize="5.5">External Experts</text>
      </g>
    </svg>
  );
}

export function ManraahMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dark atmospheric background */}
      <rect width="320" height="220" fill="#0D1F18" />
      {/* Radial soft glow */}
      <circle cx="80" cy="70" r="120" fill="#16382B" fillOpacity="0.4" />
      {/* Top Navbar */}
      <rect width="320" height="26" fill="#091812" />
      <g transform="translate(12, 6)">
        <rect x="0" y="0" width="10" height="1" fill="#F97316" />
        <text x="0" y="11" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="800" letterSpacing="0.1em">[ MANRAAH ]</text>
      </g>
      <g transform="translate(120, 9)">
        <text x="0" y="4" fill="#A7D7C5" fontFamily="system-ui, sans-serif" fontSize="6.5">How it Works</text>
        <text x="45" y="4" fill="#A7D7C5" fontFamily="system-ui, sans-serif" fontSize="6.5">Solutions</text>
        <text x="80" y="4" fill="#A7D7C5" fontFamily="system-ui, sans-serif" fontSize="6.5">Stories</text>
        <rect x="125" y="-5" width="45" height="14" rx="7" fill="#10B981" />
        <text x="147.5" y="4" textAnchor="middle" fill="#0A1F16" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="800">Get Started</text>
      </g>
      {/* Hero Headline Section */}
      <g transform="translate(14, 40)">
        <rect x="0" y="0" width="28" height="2.5" fill="#F97316" rx="1" />
        <text x="0" y="18" fill="#FFFFFF" fontFamily="Georgia, serif" fontSize="14" fontWeight="800">Myth: Something</text>
        <text x="0" y="34" fill="#FFFFFF" fontFamily="Georgia, serif" fontSize="14" fontWeight="800">bad must have happened</text>
        <text x="0" y="48" fill="#A7D7C5" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="400">Depression can arrive when life looks fine on paper.</text>
        <text x="0" y="58" fill="#A7D7C5" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="400">It is for clarity, self-discovery, and steady growth.</text>
      </g>
      {/* Right Atmospheric Room / Lamp Art */}
      <g transform="translate(200, 36)">
        <rect x="0" y="0" width="108" height="74" rx="6" fill="#11271F" stroke="#1D4335" strokeWidth="1" />
        {/* Window with foliage */}
        <rect x="10" y="8" width="40" height="42" rx="3" fill="#0B1A14" />
        <circle cx="30" cy="29" r="14" fill="#16382B" />
        {/* Lamp glow */}
        <circle cx="80" cy="22" r="10" fill="#F59E0B" fillOpacity="0.25" />
        <circle cx="80" cy="22" r="4" fill="#FDE68A" />
        <line x1="80" y1="26" x2="80" y2="46" stroke="#475569" strokeWidth="1.5" />
        <line x1="72" y1="46" x2="88" y2="46" stroke="#475569" strokeWidth="1.5" />
        {/* Soft bed / calm space */}
        <rect x="10" y="52" width="88" height="16" rx="2" fill="#1A3B2F" />
      </g>
      {/* Bottom 3 User Roles (Student, Professional, Admin) */}
      <g transform="translate(14, 122)">
        <rect x="0" y="0" width="92" height="88" rx="8" fill="#132B21" stroke="#1D4335" strokeWidth="1" />
        <rect x="10" y="10" width="22" height="22" rx="5" fill="#1E4334" />
        <circle cx="21" cy="18" r="4" fill="#52B788" />
        <path d="M15 28c0-3.5 12-3.5 12 0" fill="#52B788" />
        <text x="10" y="44" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="700">Student Portal</text>
        <text x="10" y="55" fill="#95D5B2" fontFamily="system-ui, sans-serif" fontSize="6.5">Confidential care</text>
        <rect x="10" y="65" width="72" height="4" rx="2" fill="#1B382C" />
        <rect x="10" y="73" width="50" height="4" rx="2" fill="#52B788" />

        <rect x="100" y="0" width="92" height="88" rx="8" fill="#132B21" stroke="#1D4335" strokeWidth="1" />
        <rect x="110" y="10" width="22" height="22" rx="5" fill="#1E4334" />
        <path d="M117 21h8M121 17v8" stroke="#F4B63F" strokeWidth="1.6" strokeLinecap="round" />
        <text x="110" y="44" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="700">Professionals</text>
        <text x="110" y="55" fill="#95D5B2" fontFamily="system-ui, sans-serif" fontSize="6.5">Burnout &amp; balance</text>
        <rect x="110" y="65" width="72" height="4" rx="2" fill="#1B382C" />
        <rect x="110" y="73" width="55" height="4" rx="2" fill="#F4B63F" />

        <rect x="200" y="0" width="92" height="88" rx="8" fill="#132B21" stroke="#1D4335" strokeWidth="1" />
        <rect x="210" y="10" width="22" height="22" rx="5" fill="#1E4334" />
        <circle cx="221" cy="21" r="5" stroke="#10B981" strokeWidth="1.5" fill="none" />
        <polyline points="219,21 221,23 224,19" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" />
        <text x="210" y="44" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="700">Admin Platform</text>
        <text x="210" y="55" fill="#95D5B2" fontFamily="system-ui, sans-serif" fontSize="6.5">Triaged workflows</text>
        <rect x="210" y="65" width="72" height="4" rx="2" fill="#1B382C" />
        <rect x="210" y="73" width="60" height="4" rx="2" fill="#10B981" />
      </g>
    </svg>
  );
}

export function SerpraiseMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" fill="#FFFFFF" />
      {/* Top corporate navbar */}
      <rect width="320" height="28" fill="#0A192F" />
      <g transform="translate(10, 5)">
        <polygon points="9,0 18,5 18,15 9,20 0,15 0,5" fill="#D62839" />
        <text x="9" y="13" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="900">5e</text>
        <text x="23" y="11" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="800" letterSpacing="0.04em">SERPRAISE</text>
        <text x="23" y="17" fill="#E5B25D" fontFamily="Georgia, serif" fontStyle="italic" fontSize="5.5">Enriching Everyone</text>
      </g>
      <g transform="translate(205, 7)">
        <rect x="0" y="0" width="48" height="14" rx="7" fill="#153E90" />
        <circle cx="6" cy="7" r="2" fill="#10B981" />
        <text x="12" y="9.5" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">v2.0 Live</text>
        <rect x="52" y="0" width="48" height="14" rx="7" fill="#D62839" />
        <text x="76" y="9.5" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">Book CTA</text>
      </g>
      {/* Hero Content */}
      <g transform="translate(12, 36)">
        <rect x="0" y="0" width="160" height="98" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <text x="8" y="15" fill="#0A192F" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="800">Comprehensive Human</text>
        <text x="8" y="27" fill="#0A192F" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="800">Resources Initiative</text>
        <text x="8" y="38" fill="#475569" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="500">Strategy &amp; Training Organization</text>
        <circle cx="10" cy="48" r="1.5" fill="#D62839" />
        <text x="15" y="50" fill="#334155" fontFamily="system-ui, sans-serif" fontSize="5.5">Fortune 500 clients since 2003</text>
        <circle cx="10" cy="58" r="1.5" fill="#D62839" />
        <text x="15" y="60" fill="#334155" fontFamily="system-ui, sans-serif" fontSize="5.5">Offices in Australia &amp; India</text>
        <rect x="8" y="70" width="76" height="18" rx="9" fill="#D62839" />
        <text x="46" y="82" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">Book Consultation →</text>
        <rect x="88" y="70" width="64" height="18" rx="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
        <text x="120" y="82" textAnchor="middle" fill="#334155" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="600">Explore</text>
      </g>
      {/* Hero Workshop Image Card on Right */}
      <g transform="translate(180, 36)">
        <rect x="0" y="0" width="128" height="98" rx="6" fill="#0A192F" stroke="#1E293B" strokeWidth="1" />
        <rect x="0" y="0" width="128" height="68" rx="6" fill="#1E293B" />
        {/* Abstract workshop cohort figures */}
        <circle cx="30" cy="28" r="6" fill="#64748B" />
        <rect x="22" y="36" width="16" height="16" rx="3" fill="#475569" />
        <circle cx="50" cy="24" r="7" fill="#94A3B8" />
        <rect x="41" y="33" width="18" height="19" rx="3" fill="#334155" />
        <circle cx="70" cy="26" r="6" fill="#64748B" />
        <rect x="62" y="34" width="16" height="18" rx="3" fill="#475569" />
        <circle cx="90" cy="25" r="6" fill="#94A3B8" />
        <rect x="82" y="33" width="16" height="19" rx="3" fill="#334155" />
        <rect x="6" y="72" width="116" height="10" fill="transparent" />
        <text x="6" y="80" fill="#F8FAFC" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="700">Cohort Workshop 2024</text>
        <text x="6" y="90" fill="#94A3B8" fontFamily="system-ui, sans-serif" fontSize="5.5">Leadership &amp; Engineering</text>
      </g>
      {/* Bottom 3 Capability Cards */}
      <g transform="translate(12, 142)">
        <rect x="0" y="0" width="94" height="68" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="8" y="8" width="16" height="16" rx="4" fill="#0A192F" />
        <path d="M12 16l3-5 5 8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        <text x="28" y="18" fill="#0A192F" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="800">Training (E1)</text>
        <rect x="8" y="30" width="78" height="4" rx="2" fill="#CBD5E1" />
        <rect x="8" y="38" width="60" height="4" rx="2" fill="#E2E8F0" />
        <rect x="8" y="46" width="70" height="4" rx="2" fill="#E2E8F0" />
        <rect x="8" y="54" width="45" height="4" rx="2" fill="#D62839" fillOpacity="0.4" />

        <rect x="101" y="0" width="94" height="68" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="109" y="8" width="16" height="16" rx="4" fill="#D62839" />
        <circle cx="117" cy="16" r="4" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <text x="129" y="18" fill="#0A192F" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="800">Coaching</text>
        <rect x="109" y="30" width="78" height="4" rx="2" fill="#CBD5E1" />
        <rect x="109" y="38" width="60" height="4" rx="2" fill="#E2E8F0" />
        <rect x="109" y="46" width="70" height="4" rx="2" fill="#E2E8F0" />
        <rect x="109" y="54" width="45" height="4" rx="2" fill="#0A192F" fillOpacity="0.4" />

        <rect x="202" y="0" width="94" height="68" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="210" y="8" width="16" height="16" rx="4" fill="#153E90" />
        <rect x="214" y="12" width="8" height="8" rx="1.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <text x="230" y="18" fill="#0A192F" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="800">OD Advisory</text>
        <rect x="210" y="30" width="78" height="4" rx="2" fill="#CBD5E1" />
        <rect x="210" y="38" width="60" height="4" rx="2" fill="#E2E8F0" />
        <rect x="210" y="46" width="70" height="4" rx="2" fill="#E2E8F0" />
        <rect x="210" y="54" width="45" height="4" rx="2" fill="#10B981" fillOpacity="0.4" />
      </g>
    </svg>
  );
}

export function NutriFlexMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Clean White Fresh Background */}
      <rect width="320" height="220" fill="#FFFFFF" />
      {/* Top Navbar */}
      <rect width="320" height="26" fill="#F8FAF8" stroke="#E5E7EB" strokeWidth="0.8" />
      <g transform="translate(10, 5)">
        <circle cx="8" cy="8" r="8" fill="#10B981" />
        <path d="M8 5 C6 5 4.5 6.5 4.5 8 C4.5 10.5 8 12.5 8 12.5 C8 12.5 11.5 10.5 11.5 8 C11.5 6.5 10 5 8 5 Z" fill="#FFFFFF" />
        <text x="20" y="11" fill="#065F46" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="900" letterSpacing="0.04em">NUTRIFLEXS</text>
      </g>
      <g transform="translate(170, 7)">
        <text x="0" y="8" fill="#4B5563" fontFamily="system-ui, sans-serif" fontSize="6.5">Menu</text>
        <text x="25" y="8" fill="#4B5563" fontFamily="system-ui, sans-serif" fontSize="6.5">Gyms</text>
        <text x="50" y="8" fill="#4B5563" fontFamily="system-ui, sans-serif" fontSize="6.5">About</text>
        <rect x="75" y="0" width="46" height="14" rx="7" fill="#10B981" />
        <text x="98" y="9.5" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">Order Fresh</text>
      </g>
      {/* Hero Left Content */}
      <g transform="translate(12, 34)">
        {/* Pill */}
        <rect x="0" y="0" width="145" height="13" rx="6.5" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="0.8" />
        <text x="6" y="9" fill="#059669" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="700">⚡ FAST • FRESH • TRANSPARENT • GYM-ADJACENT</text>
        {/* Headline */}
        <text x="0" y="32" fill="#0F172A" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="900">REAL FOOD.</text>
        <text x="0" y="48" fill="#10B981" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="900">REAL FUEL.</text>
        <text x="0" y="60" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="6.5">Fresh chef-crafted meals delivered in 5 mins</text>
        <text x="0" y="68" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="6.5">at express kiosks right outside your gym.</text>
        {/* Buttons */}
        <rect x="0" y="76" width="76" height="18" rx="9" fill="#10B981" />
        <text x="38" y="88" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="800">EXPLORE MENU →</text>
        <rect x="80" y="76" width="60" height="18" rx="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
        <text x="110" y="88" textAnchor="middle" fill="#334155" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="600">Find Gym</text>
      </g>
      {/* Right Hero Food Bowl Visual */}
      <g transform="translate(175, 34)">
        <rect x="0" y="0" width="135" height="108" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        {/* Large Energy Bowl */}
        <circle cx="67" cy="48" r="38" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        <circle cx="67" cy="48" r="34" fill="#FEF3C7" />
        {/* Grilled chicken strips */}
        <rect x="52" y="36" width="22" height="7" rx="2" fill="#B45309" transform="rotate(-15 52 36)" />
        <rect x="56" y="44" width="20" height="7" rx="2" fill="#D97706" transform="rotate(-10 56 44)" />
        {/* Avocado slices */}
        <circle cx="48" cy="56" r="6" fill="#84CC16" />
        <circle cx="44" cy="50" r="5" fill="#65A30D" />
        {/* Cherry tomatoes */}
        <circle cx="82" cy="38" r="4" fill="#EF4444" />
        <circle cx="86" cy="46" r="4.5" fill="#DC2626" />
        {/* Edamame greens */}
        <circle cx="74" cy="62" r="3" fill="#10B981" />
        <circle cx="80" cy="59" r="3" fill="#10B981" />
        <circle cx="68" cy="65" r="3" fill="#10B981" />
        {/* Floating ready pill */}
        <rect x="8" y="88" width="119" height="14" rx="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
        <text x="14" y="98" fill="#0F172A" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700">Quinoa Bowl</text>
        <rect x="68" y="90" width="55" height="10" rx="5" fill="#10B981" />
        <text x="95" y="97.5" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="800">READY IN ~5 MIN</text>
      </g>
      {/* Bottom 3 Features */}
      <g transform="translate(12, 150)">
        <rect x="0" y="0" width="94" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <text x="10" y="15" fill="#059669" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="800">⚡ 5 Min Pickup</text>
        <text x="10" y="26" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="6">Express lockers</text>
        <rect x="10" y="36" width="74" height="4" rx="2" fill="#E2E8F0" />
        <rect x="10" y="44" width="55" height="4" rx="2" fill="#10B981" />

        <rect x="101" y="0" width="94" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <text x="111" y="15" fill="#059669" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="800">🌱 100% Organic</text>
        <text x="111" y="26" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="6">No seed oils or junk</text>
        <rect x="111" y="36" width="74" height="4" rx="2" fill="#E2E8F0" />
        <rect x="111" y="44" width="60" height="4" rx="2" fill="#059669" />

        <rect x="202" y="0" width="94" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <text x="212" y="15" fill="#059669" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="800">📊 Exact Macros</text>
        <text x="212" y="26" fill="#64748B" fontFamily="system-ui, sans-serif" fontSize="6">38g Protein · 520 kcal</text>
        <rect x="212" y="36" width="74" height="4" rx="2" fill="#E2E8F0" />
        <rect x="212" y="44" width="48" height="4" rx="2" fill="#10B981" />
      </g>
    </svg>
  );
}

export function ProjectBrowserMockup({
  study,
  onOpenCaseStudy,
}: {
  study: ProjectCardProps["study"];
  onOpenPhotos?: (study: any) => void;
  onOpenCaseStudy: (study: any) => void;
}) {
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const showcase = React.useMemo(() => getProjectShowcase(study.name), [study.name]);

  const renderFallbackSvg = () => {
    const n = (study.name || "").toLowerCase();
    if (n.includes("5e") || n.includes("serpraise")) return <SerpraiseMockup />;
    if (n.includes("manraah")) return <ManraahMockup />;
    if (n.includes("nutri")) return <NutriFlexMockup />;
    if (n.includes("coppter") || n.includes("copter")) return <CoppterMockup />;
    if (n.includes("coursehunt")) return <CourseHuntMockup />;
    if (n.includes("tradesage") || n.includes("tradesaga")) return <TradeSageMockup />;
    return <SerpraiseMockup />;
  };

  const isDark = showcase?.isDark ?? true;

  const handleMockupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenCaseStudy(study);
  };

  return (
    <div
      className={`project-browser-frame ${isDark ? "is-dark" : "is-light"}`}
      onClick={handleMockupClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleMockupClick(e as any);
        }
      }}
      title={`Click to read ${study.name} case study`}
      aria-label={`Preview of ${study.name}`}
    >
      {/* Browser Title Bar: Clean classic dots with no text or links */}
      <div className="project-browser-bar">
        <div className="project-browser-dots" aria-hidden="true">
          <span className="project-browser-dot dot-red" />
          <span className="project-browser-dot dot-yellow" />
          <span className="project-browser-dot dot-green" />
        </div>
      </div>

      {/* Browser Viewport */}
      <div className="project-browser-viewport">
        {/* Render fallback SVG as base or if image errored */}
        {!showcase || hasError ? (
          <div className="project-browser-svg-wrap">
            {renderFallbackSvg()}
          </div>
        ) : (
          <>
            {!isLoaded && (
              <div className="project-browser-svg-placeholder" aria-hidden="true">
                {renderFallbackSvg()}
              </div>
            )}
            <picture className="project-browser-picture">
              <source srcSet={showcase.webp} type="image/webp" />
              <img
                src={showcase.png}
                alt={showcase.alt}
                loading="lazy"
                decoding="async"
                className={`project-browser-img ${isLoaded ? "is-loaded" : ""}`}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
              />
            </picture>
          </>
        )}
      </div>
    </div>
  );
}

function ProjectCardInner({ study, onOpenCaseStudy, onOpenPhotos }: ProjectCardProps) {
  const isCoppter =
    study.name.toLowerCase().includes("coppter") ||
    study.name.toLowerCase().includes("copter");

  return (
    <div
      className="project-card reveal"
      id={`project-${study.idx}`}
      onClick={() => onOpenCaseStudy(study)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenCaseStudy(study);
        }
      }}
      aria-label={`View ${study.name} case study`}
    >
      {/* Corner sparkle rays */}
      <svg
        className="project-card-sparkles"
        width="32"
        height="26"
        viewBox="0 0 32 26"
        fill="none"
        stroke="#10B981"
        strokeWidth="2.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <line x1="8" y1="20" x2="3" y2="8" />
        <line x1="16" y1="21" x2="16" y2="5" />
        <line x1="24" y1="20" x2="29" y2="8" />
      </svg>

      <div className="project-card-layout">
        {/* Left Column: Details */}
        <div className="project-card-left">
          <div>
            {/* Top Badge Group */}
            <div className="project-card-badges">
              <span className="project-card-idx">{study.idx}</span>
              <span className="project-card-cat">{study.category}</span>
            </div>

            {/* Title */}
            <h3 className="project-card-title">{study.name}</h3>

            {/* One-Liner Description */}
            <p className="project-card-desc">{study.oneLiner}</p>

            {/* 3 Metric Highlight Boxes */}
            <div className="project-card-metrics">
              {study.metrics.map((m, mIdx) => (
                <div
                  key={mIdx}
                  className="project-card-metric-box"
                  style={
                    isCoppter && mIdx === 0
                      ? { background: "#CEF2DE" }
                      : undefined
                  }
                >
                  <div className="project-card-metric-val">
                    <span style={{ fontSize: "12px", opacity: 0.9 }}>{m.icon}</span>
                    <span>{m.val}</span>
                  </div>
                  <div className="project-card-metric-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="project-card-actions">
            {study.liveUrl || study.version1Url ? (
              <a
                href={study.liveUrl || study.version1Url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card-btn-primary"
                onClick={(e) => e.stopPropagation()}
              >
                View project ↗
              </a>
            ) : (
              <button
                type="button"
                className="project-card-btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (study.photos && study.photos.length > 0 && onOpenPhotos) {
                    onOpenPhotos(study);
                  } else {
                    onOpenCaseStudy(study);
                  }
                }}
              >
                View project ↗
              </button>
            )}
            <button
              type="button"
              className="project-card-btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCaseStudy(study);
              }}
            >
              {study.secondaryLabel || "Read case study"}
            </button>
          </div>
        </div>

        {/* Right Column: Browser Mockup with Authentic Live Website Showcase */}
        <div className="project-card-right">
          <div className="project-card-mockup-wrap">
            <ProjectBrowserMockup
              study={study}
              onOpenPhotos={onOpenPhotos}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const ProjectCard = React.memo(ProjectCardInner);
export default ProjectCard;
