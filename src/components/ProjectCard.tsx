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
      "/photos/manraah/manraah-1.jpeg",
      "/photos/manraah/manraah-2.jpeg",
      "/photos/manraah/manraah-3.jpeg",
      "/photos/manraah/manraah-4.jpeg",
      "/photos/manraah/manraah-5.jpeg",
      "/photos/manraah/manraah-6.jpeg",
      "/photos/manraah/manraah-7.jpeg",
      "/photos/manraah/manraah-8.jpeg",
      "/photos/manraah/manraah-9.jpeg",
      "/photos/manraah/manraah-10.jpeg",
      "/photos/manraah/manraah-11.jpeg",
      "/photos/manraah/manraah-12.jpeg",
    ],
    secondaryLabel: "Read case study",
    briefDescription:
      "A mental wellness platform with entirely separate experiences for students, professionals, and admins — each with its own permissions, flows, and interface, not one dashboard trying to serve three audiences at once.",
  },
  {
    id: "study-nutriflex",
    idx: "03",
    name: "NutriFlex",
    category: "HealthTech · AI Fitness",
    status: "live" as const,
    statusLabel: "Live in production",
    oneLiner: "Your personal AI fitness assistant delivering dynamic workout plans and weekly health tasks.",
    resultStat: "100% personalized",
    metrics: [
      { icon: "⚡", val: "AI", label: "Task generator" },
      { icon: "🎯", val: "100%", label: "Personalized" },
      { icon: "💪", val: "Full", label: "Fitness suite" },
    ],
    tags: ["Next.js", "React", "OpenAI", "Bootstrap"],
    liveUrl: null,
    photos: [
      "/photos/nutriflex/nutriflex-1.jpeg",
      "/photos/nutriflex/nutriflex-2.jpeg",
      "/photos/nutriflex/nutriflex-3.jpeg",
      "/photos/nutriflex/nutriflex-4.jpeg",
      "/photos/nutriflex/nutriflex-5.jpeg",
    ],
    secondaryLabel: "Read case study",
    briefDescription:
      "An intelligent fitness and nutrition platform built to eliminate generic routines. NutriFlex generates customized weekly workout schedules, dynamic exercise progressions, and AI-driven motivational encouragement tailored to individual goals.",
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
      "/photos/coppter/coppter-5.jpeg",
      "/photos/coppter/coppter-6.jpeg",
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
    liveUrl: "https://coursehunt.tech",
    secondaryLabel: "Read case study",
    briefDescription:
      "A fast course aggregator built on Next.js and Supabase. Students were losing hours hunting for course links scattered across the internet — CourseHunt automates discovery and validation so listings are already there, and already working, when they arrive.",
  },
  {
    id: "cmtzk3myp0000i2408jebuygu",
    idx: "06",
    name: "TradeSage",
    category: "FinTech · AI Trading",
    status: "live" as const,
    statusLabel: "Live in production",
    oneLiner: "An AI-powered trading platform that analyzes market patterns and executes data-driven trades.",
    resultStat: "70.5% win rate",
    metrics: [
      { icon: "↗", val: "70.5%", label: "Win rate" },
      { icon: "⛁", val: "5+", label: "Trading models" },
      { icon: "⚡", val: "Real-time", label: "Market execution" },
    ],
    tags: ["Python", "XGBoost", "GitHub Actions", "SmartAPI"],
    liveUrl: "https://tradesagaai.duckdns.org/",
    secondaryLabel: "Read case study",
    briefDescription:
      "An algorithmic trading system for the Indian equity market. We trained a model on ten years of NSE data across 2,200+ stocks, then wrapped it in automated risk controls — position sizing, regime filters, and a daily loss kill-switch — so the model can't outrun its own discipline.",
  },
];

export function TradeSageMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="14" fill="#0A1612" stroke="#17201E" strokeWidth="2" />
      <rect width="320" height="26" rx="14" fill="#0E201B" />
      <rect y="16" width="320" height="10" fill="#0E201B" />
      <line x1="0" y1="26" x2="320" y2="26" stroke="#1A332B" strokeWidth="1" />
      <circle cx="14" cy="13" r="3.5" fill="#EF4444" />
      <circle cx="25" cy="13" r="3.5" fill="#F59E0B" />
      <circle cx="36" cy="13" r="3.5" fill="#10B981" />

      {/* Mini sidebar */}
      <rect x="0" y="27" width="28" height="191" fill="#0B1A14" stroke="#1A332B" strokeWidth="0.5" />
      <path d="M11 40h6M11 43h6M11 46h4" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="11" y="58" width="6" height="6" rx="1.5" fill="#2D6A4F" />
      <circle cx="14" cy="78" r="3" stroke="#2D6A4F" strokeWidth="1.2" />
      <path d="M12 95l4 4M16 95l-4 4" stroke="#2D6A4F" strokeWidth="1.2" />
      <circle cx="14" cy="115" r="2.5" fill="#2D6A4F" />

      {/* Brand header inside */}
      <g transform="translate(36, 34)">
        <rect x="0" y="2" width="12" height="12" rx="3" fill="#10B981" />
        <path d="M3 10l2-2 2 1.5 2.5-3.5" stroke="#0A1612" strokeWidth="1.2" strokeLinecap="round" />
        <text x="17" y="12" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">TradeSage</text>
      </g>

      {/* Top right widgets */}
      <g transform="translate(225, 34)">
        <rect x="0" y="0" width="82" height="38" rx="6" fill="#0E241E" stroke="#1A3F34" strokeWidth="1" />
        <text x="8" y="14" fill="#95D5B2" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600">Win Rate</text>
        <text x="8" y="29" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="800">70.5%</text>
        <circle cx="64" cy="19" r="11" stroke="#1B4332" strokeWidth="3" fill="none" />
        <circle cx="64" cy="19" r="11" stroke="#10B981" strokeWidth="3" strokeDasharray="69" strokeDashoffset="20" fill="none" strokeLinecap="round" />
      </g>

      <g transform="translate(225, 78)">
        <rect x="0" y="0" width="82" height="28" rx="6" fill="#0E241E" stroke="#1A3F34" strokeWidth="1" />
        <text x="8" y="12" fill="#95D5B2" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="600">P&amp;L (36d)</text>
        <text x="8" y="23" fill="#52B788" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="800">+12.8%</text>
      </g>

      {/* Candlestick chart */}
      <g transform="translate(36, 56)">
        <line x1="0" y1="15" x2="180" y2="15" stroke="#132E25" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="0" y1="35" x2="180" y2="35" stroke="#132E25" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="0" y1="55" x2="180" y2="55" stroke="#132E25" strokeWidth="1" strokeDasharray="2 3" />

        <line x1="14" y1="38" x2="14" y2="52" stroke="#10B981" strokeWidth="1" />
        <rect x="11" y="42" width="6" height="8" rx="1" fill="#10B981" />

        <line x1="28" y1="40" x2="28" y2="56" stroke="#EF4444" strokeWidth="1" />
        <rect x="25" y="44" width="6" height="7" rx="1" fill="#EF4444" />

        <line x1="42" y1="32" x2="42" y2="48" stroke="#10B981" strokeWidth="1" />
        <rect x="39" y="35" width="6" height="9" rx="1" fill="#10B981" />

        <line x1="56" y1="24" x2="56" y2="42" stroke="#10B981" strokeWidth="1" />
        <rect x="53" y="27" width="6" height="11" rx="1" fill="#10B981" />

        <line x1="70" y1="28" x2="70" y2="45" stroke="#EF4444" strokeWidth="1" />
        <rect x="67" y="32" width="6" height="8" rx="1" fill="#EF4444" />

        <line x1="84" y1="20" x2="84" y2="38" stroke="#10B981" strokeWidth="1" />
        <rect x="81" y="23" width="6" height="10" rx="1" fill="#10B981" />

        <line x1="98" y1="12" x2="98" y2="30" stroke="#10B981" strokeWidth="1" />
        <rect x="95" y="15" width="6" height="12" rx="1" fill="#10B981" />

        <line x1="112" y1="8" x2="112" y2="26" stroke="#10B981" strokeWidth="1" />
        <rect x="109" y="11" width="6" height="11" rx="1" fill="#10B981" />

        <line x1="126" y1="14" x2="126" y2="32" stroke="#EF4444" strokeWidth="1" />
        <rect x="123" y="18" width="6" height="9" rx="1" fill="#EF4444" />

        <line x1="140" y1="8" x2="140" y2="25" stroke="#10B981" strokeWidth="1" />
        <rect x="137" y="12" width="6" height="10" rx="1" fill="#10B981" />

        <path d="M14 46 L28 47 L42 40 L56 32 L70 36 L84 28 L98 21 L112 16 L126 22 L140 17 L160 10" stroke="#52B788" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Model Performance bottom area */}
      <g transform="translate(36, 128)">
        <rect x="0" y="0" width="271" height="80" rx="8" fill="#0C1D17" stroke="#16382C" strokeWidth="1" />
        <text x="12" y="16" fill="#95D5B2" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700">Model Performance</text>
        
        <rect x="12" y="24" width="70" height="5" rx="2.5" fill="#1B4332" />
        <rect x="12" y="24" width="52" height="5" rx="2.5" fill="#10B981" />

        <rect x="12" y="33" width="70" height="5" rx="2.5" fill="#1B4332" />
        <rect x="12" y="33" width="60" height="5" rx="2.5" fill="#52B788" />

        <rect x="12" y="42" width="70" height="5" rx="2.5" fill="#1B4332" />
        <rect x="12" y="42" width="40" height="5" rx="2.5" fill="#F59E0B" />

        <path d="M100 68 C125 65, 140 50, 165 42 C190 34, 210 45, 235 24 C245 15, 255 18, 265 10 L265 74 L100 74 Z" fill="url(#tsGrad)" opacity="0.6" />
        <path d="M100 68 C125 65, 140 50, 165 42 C190 34, 210 45, 235 24 C245 15, 255 18, 265 10" stroke="#10B981" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>

      <defs>
        <linearGradient id="tsGrad" x1="180" y1="10" x2="180" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" stopOpacity="0.7" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CourseHuntMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Browser Shell */}
      <rect width="320" height="220" rx="14" fill="#FAF9F6" stroke="#17201E" strokeWidth="2" />
      
      {/* Window Controls Bar */}
      <rect width="320" height="22" rx="14" fill="#EAE5D8" />
      <rect y="12" width="320" height="10" fill="#EAE5D8" />
      <line x1="0" y1="22" x2="320" y2="22" stroke="#D3CCBD" strokeWidth="1" />
      <circle cx="14" cy="11" r="3.5" fill="#EF4444" />
      <circle cx="25" cy="11" r="3.5" fill="#F59E0B" />
      <circle cx="36" cy="11" r="3.5" fill="#10B981" />

      {/* Dark App Header */}
      <rect y="23" width="320" height="42" fill="#102B22" />
      
      {/* Brand */}
      <g transform="translate(14, 30)">
        <rect x="0" y="0" width="14" height="14" rx="4" fill="#10B981" />
        <path d="M3 7l3 3 5-5" stroke="#102B22" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <text x="20" y="11" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">CourseHunt</text>
      </g>

      {/* Search Input Bar */}
      <g transform="translate(14, 48)">
        <rect x="0" y="0" width="292" height="18" rx="9" fill="#FFFFFF" />
        <circle cx="10" cy="9" r="3" stroke="#4A5568" strokeWidth="1.2" fill="none" />
        <line x1="12" y1="11" x2="14.5" y2="13.5" stroke="#4A5568" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="22" y="7" width="70" height="4" rx="2" fill="#E2E8F0" />
        <circle cx="282" cy="9" r="4.5" fill="#102B22" />
        <path d="M280.5 9l1.2 1.2 2-2" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" />
      </g>

      {/* Main Content Area: Large Video Player Card */}
      <g transform="translate(14, 76)">
        <rect x="0" y="0" width="160" height="60" rx="8" fill="#D2F2E3" stroke="#B4E3CD" strokeWidth="1" />
        <circle cx="80" cy="30" r="14" fill="#10B981" />
        <path d="M76 24l11 6-11 6z" fill="#FFFFFF" />

        {/* Content right lines */}
        <g transform="translate(172, 6)">
          <rect x="0" y="0" width="120" height="7" rx="3.5" fill="#CBD5E1" />
          <rect x="0" y="13" width="95" height="5" rx="2.5" fill="#E2E8F0" />
          <rect x="0" y="23" width="110" height="5" rx="2.5" fill="#E2E8F0" />
          <rect x="0" y="34" width="75" height="4" rx="2" fill="#E2E8F0" />
        </g>
      </g>

      {/* Bottom 3 Category Cards */}
      <g transform="translate(14, 146)">
        {/* Card 1 - Mint */}
        <rect x="0" y="0" width="90" height="58" rx="8" fill="#E6F7F0" stroke="#C4ECD8" strokeWidth="1" />
        <circle cx="22" cy="20" r="9" fill="#10B981" fillOpacity="0.2" />
        <path d="M20 16l6 4-6 4z" fill="#10B981" />
        <rect x="10" y="38" width="55" height="5" rx="2.5" fill="#CBD5E1" />
        <rect x="10" y="46" width="35" height="4" rx="2" fill="#E2E8F0" />

        {/* Card 2 - Yellow */}
        <rect x="101" y="0" width="90" height="58" rx="8" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
        <circle cx="123" cy="20" r="9" fill="#F59E0B" fillOpacity="0.2" />
        <rect x="119" y="16" width="8" height="8" rx="1.5" fill="#F59E0B" />
        <rect x="111" y="38" width="55" height="5" rx="2.5" fill="#CBD5E1" />
        <rect x="111" y="46" width="35" height="4" rx="2" fill="#E2E8F0" />

        {/* Card 3 - Purple */}
        <rect x="202" y="0" width="90" height="58" rx="8" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="1" />
        <circle cx="224" cy="20" r="9" fill="#8B5CF6" fillOpacity="0.2" />
        <path d="M222 16l6 4-6 4z" fill="#8B5CF6" />
        <rect x="212" y="38" width="55" height="5" rx="2.5" fill="#CBD5E1" />
        <rect x="212" y="46" width="35" height="4" rx="2" fill="#E2E8F0" />
      </g>
    </svg>
  );
}

export function CoppterMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="14" fill="#0A1612" stroke="#17201E" strokeWidth="2" />
      <rect width="320" height="26" rx="14" fill="#0E201B" />
      <rect y="16" width="320" height="10" fill="#0E201B" />
      <line x1="0" y1="26" x2="320" y2="26" stroke="#1A332B" strokeWidth="1" />
      <circle cx="14" cy="13" r="3.5" fill="#EF4444" />
      <circle cx="25" cy="13" r="3.5" fill="#F59E0B" />
      <circle cx="36" cy="13" r="3.5" fill="#10B981" />

      {/* Sidebar */}
      <rect x="0" y="27" width="28" height="191" fill="#0A1813" stroke="#163227" strokeWidth="0.5" />
      <circle cx="14" cy="42" r="4.5" fill="#2D6A4F" />
      <path d="M11 60h6v6h-6z" stroke="#2D6A4F" strokeWidth="1.2" />
      <path d="M14 78l3 3-3 3-3-3z" stroke="#2D6A4F" strokeWidth="1.2" />
      <circle cx="14" cy="98" r="3" stroke="#2D6A4F" strokeWidth="1.2" />

      {/* Header */}
      <g transform="translate(36, 34)">
        <rect x="0" y="1" width="12" height="12" rx="3" fill="#2D6A4F" />
        <text x="17" y="11" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">Coppter</text>
      </g>

      {/* Top 3 Portal Cards */}
      <g transform="translate(36, 52)">
        <rect x="0" y="0" width="86" height="34" rx="6" fill="#122A21" stroke="#1D4536" strokeWidth="1" />
        <rect x="8" y="8" width="16" height="8" rx="2" fill="#52B788" />
        <rect x="28" y="10" width="48" height="4" rx="2" fill="#BFE3D6" fillOpacity="0.8" />
        <rect x="8" y="20" width="56" height="5" rx="2.5" fill="#2D6A4F" />

        <rect x="92" y="0" width="86" height="34" rx="6" fill="#122A21" stroke="#1D4536" strokeWidth="1" />
        <rect x="100" y="8" width="16" height="8" rx="2" fill="#F4B63F" />
        <rect x="120" y="10" width="48" height="4" rx="2" fill="#BFE3D6" fillOpacity="0.8" />
        <rect x="100" y="20" width="56" height="5" rx="2.5" fill="#2D6A4F" />

        <rect x="184" y="0" width="86" height="34" rx="6" fill="#122A21" stroke="#1D4536" strokeWidth="1" />
        <rect x="192" y="8" width="16" height="8" rx="2" fill="#F4B63F" />
        <rect x="212" y="10" width="48" height="4" rx="2" fill="#BFE3D6" fillOpacity="0.8" />
        <rect x="192" y="20" width="56" height="5" rx="2.5" fill="#2D6A4F" />
      </g>

      {/* Curve chart */}
      <g transform="translate(36, 94)">
        <rect x="0" y="0" width="270" height="74" rx="8" fill="#0E231B" stroke="#183D2F" strokeWidth="1" />
        <path d="M10 58 C45 52, 70 38, 110 42 C150 46, 180 20, 215 28 C235 32, 245 16, 260 12 L260 68 L10 68 Z" fill="url(#copterGrad)" opacity="0.6" />
        <path d="M10 58 C45 52, 70 38, 110 42 C150 46, 180 20, 215 28 C235 32, 245 16, 260 12" stroke="#52B788" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>

      {/* Activity bars */}
      <g transform="translate(36, 176)">
        <rect x="0" y="0" width="130" height="34" rx="6" fill="#10251D" stroke="#183B2E" strokeWidth="1" />
        <rect x="10" y="10" width="45" height="4" rx="2" fill="#52B788" />
        <rect x="10" y="18" width="90" height="4" rx="2" fill="#24513E" />
        <rect x="10" y="25" width="70" height="3" rx="1.5" fill="#24513E" />

        <rect x="140" y="0" width="130" height="34" rx="6" fill="#10251D" stroke="#183B2E" strokeWidth="1" />
        <rect x="150" y="9" width="100" height="4" rx="2" fill="#1D4737" />
        <rect x="150" y="9" width="70" height="4" rx="2" fill="#52B788" />
        <rect x="150" y="17" width="100" height="4" rx="2" fill="#1D4737" />
        <rect x="150" y="17" width="85" height="4" rx="2" fill="#10B981" />
        <rect x="150" y="24" width="100" height="4" rx="2" fill="#1D4737" />
        <rect x="150" y="24" width="40" height="4" rx="2" fill="#F4B63F" />
      </g>

      <defs>
        <linearGradient id="copterGrad" x1="135" y1="12" x2="135" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#52B788" stopOpacity="0.8" />
          <stop offset="1" stopColor="#52B788" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ManraahMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="14" fill="#F8F6F0" stroke="#17201E" strokeWidth="2" />
      <rect width="320" height="26" rx="14" fill="#EAE5D8" />
      <rect y="16" width="320" height="10" fill="#EAE5D8" />
      <line x1="0" y1="26" x2="320" y2="26" stroke="#D3CCBD" strokeWidth="1" />
      <circle cx="14" cy="13" r="3.5" fill="#EF4444" />
      <circle cx="25" cy="13" r="3.5" fill="#F59E0B" />
      <circle cx="36" cy="13" r="3.5" fill="#10B981" />

      {/* Header */}
      <g transform="translate(18, 34)">
        <path d="M6 14 C6 8, 12 3, 12 3 C12 3, 18 8, 18 14 C18 17, 15 19, 12 19 C9 19, 6 17, 6 14 Z" fill="#0F5C52" />
        <path d="M12 9 C10 12, 5 13, 2 15 C5 18, 10 18, 12 19" fill="#2A8B7B" />
        <path d="M12 9 C14 12, 19 13, 22 15 C19 18, 14 18, 12 19" fill="#2A8B7B" />
        <text x="28" y="14" fill="#0F5C52" fontFamily="Georgia, serif" fontSize="13" fontWeight="800">Manraah</text>
      </g>

      <text x="18" y="74" fill="#17201E" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700">How are you feeling today?</text>

      {/* Mood faces */}
      <g transform="translate(18, 86)">
        <circle cx="11" cy="11" r="11" fill="#A7D7C5" />
        <circle cx="8" cy="9" r="1.2" fill="#0F3830" />
        <circle cx="14" cy="9" r="1.2" fill="#0F3830" />
        <path d="M8 15 C9 13.5, 13 13.5, 14 15" stroke="#0F3830" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        <circle cx="39" cy="11" r="11" fill="#FDE68A" />
        <circle cx="36" cy="9" r="1.2" fill="#78350F" />
        <circle cx="42" cy="9" r="1.2" fill="#78350F" />
        <line x1="36" y1="14" x2="42" y2="14" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />

        <circle cx="67" cy="11" r="11" fill="#FCD34D" />
        <circle cx="64" cy="9" r="1.2" fill="#78350F" />
        <circle cx="70" cy="9" r="1.2" fill="#78350F" />
        <path d="M64 13 C65.5 15, 68.5 15, 70 13" stroke="#78350F" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        <circle cx="95" cy="11" r="11" fill="#FDBA74" />
        <circle cx="92" cy="8.5" r="1.2" fill="#7C2D12" />
        <circle cx="98" cy="8.5" r="1.2" fill="#7C2D12" />
        <path d="M91.5 12.5 C93 15.5, 97 15.5, 98.5 12.5" stroke="#7C2D12" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        <circle cx="123" cy="11" r="11" fill="#FCA5A5" />
        <path d="M120 9l1.5-1.5 1.5 1.5" stroke="#881337" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M126 9l1.5-1.5 1.5 1.5" stroke="#881337" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M120.5 12.5 C122 15.5, 127 15.5, 128.5 12.5" stroke="#881337" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>

      {/* 3 cards */}
      <g transform="translate(18, 126)">
        <rect x="0" y="0" width="56" height="74" rx="8" fill="#EDE9FE" stroke="#DDD6FE" strokeWidth="1" />
        <circle cx="28" cy="24" r="5" fill="#8B5CF6" />
        <path d="M22 36 C22 31, 34 31, 34 36 Z" fill="#8B5CF6" />
        <path d="M18 38 C22 35, 34 35, 38 38 Z" fill="#A78BFA" />
        <rect x="10" y="48" width="36" height="5" rx="2.5" fill="#8B5CF6" fillOpacity="0.6" />
        <rect x="14" y="57" width="28" height="4" rx="2" fill="#C4B5FD" />

        <rect x="66" y="0" width="56" height="74" rx="8" fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1" />
        <rect x="84" y="18" width="20" height="18" rx="3" fill="#10B981" />
        <line x1="89" y1="15" x2="89" y2="18" stroke="#065F46" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="99" y1="15" x2="99" y2="18" stroke="#065F46" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="89" cy="26" r="1.5" fill="#D1FAE5" />
        <circle cx="94" cy="26" r="1.5" fill="#D1FAE5" />
        <circle cx="99" cy="26" r="1.5" fill="#D1FAE5"/>
        <rect x="76" y="48" width="36" height="5" rx="2.5" fill="#10B981" fillOpacity="0.6" />
        <rect x="80" y="57" width="28" height="4" rx="2" fill="#6EE7B7" />

        <rect x="132" y="0" width="56" height="74" rx="8" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="1" />
        <path d="M142 34 L148 24 L154 30 L160 20 L166 26" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="142" y="48" width="36" height="5" rx="2.5" fill="#0284C7" fillOpacity="0.6" />
        <rect x="146" y="57" width="28" height="4" rx="2" fill="#7DD3FC" />
      </g>

      {/* Potted Plant */}
      <g transform="translate(245, 122)">
        <path d="M12 56 L38 56 L34 82 L16 82 Z" fill="#D97706" stroke="#17201E" strokeWidth="1.5" />
        <rect x="9" y="52" width="32" height="6" rx="2" fill="#F59E0B" stroke="#17201E" strokeWidth="1.5" />
        <ellipse cx="25" cy="53" rx="13" ry="2" fill="#78350F" />
        
        <path d="M25 52 Q25 30 25 10" stroke="#0F5C52" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M25 10 Q28 0 25 -4 Q22 0 25 10 Z" fill="#34D399" stroke="#0F5C52" strokeWidth="1.5" />
        <path d="M25 24 Q12 18 6 12 Q14 8 25 24 Z" fill="#10B981" stroke="#0F5C52" strokeWidth="1.5" />
        <path d="M25 20 Q38 14 44 8 Q36 4 25 20 Z" fill="#34D399" stroke="#0F5C52" strokeWidth="1.5" />
        <path d="M25 38 Q10 32 4 26 Q12 22 25 38 Z" fill="#059669" stroke="#0F5C52" strokeWidth="1.5" />
        <path d="M25 35 Q40 30 46 25 Q38 20 25 35 Z" fill="#10B981" stroke="#0F5C52" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function SerpraiseMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Shell */}
      <rect width="320" height="220" rx="14" fill="#FBF8F1" stroke="#17201E" strokeWidth="2" />
      
      {/* Window Controls Bar */}
      <rect width="320" height="22" rx="14" fill="#E8DFD0" />
      <rect y="12" width="320" height="10" fill="#E8DFD0" />
      <line x1="0" y1="22" x2="320" y2="22" stroke="#D3C7B5" strokeWidth="1" />
      <circle cx="14" cy="11" r="3.5" fill="#EF4444" />
      <circle cx="25" cy="11" r="3.5" fill="#F59E0B" />
      <circle cx="36" cy="11" r="3.5" fill="#10B981" />

      {/* Top Navbar */}
      <rect y="23" width="320" height="34" fill="#0B2A6B" />
      
      {/* Brand logo & title */}
      <g transform="translate(14, 29)">
        <rect x="0" y="2" width="18" height="18" rx="4" fill="#D62839" />
        <text x="4.5" y="15" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10.5" fontWeight="800">5e</text>
        <text x="23" y="14" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800" letterSpacing="0.05em">SERPRAISE</text>
        <text x="23" y="21" fill="#E5B25D" fontFamily="Georgia, serif" fontStyle="italic" fontSize="7">Enriching Everyone</text>
      </g>

      {/* Version Badges Top Right */}
      <g transform="translate(202, 31)">
        <rect x="0" y="2" width="50" height="18" rx="9" fill="#153E90" stroke="#E5B25D" strokeWidth="1" />
        <circle cx="8" cy="11" r="2.5" fill="#10B981" />
        <text x="14" y="13.5" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="700">v2.0 Live</text>

        <rect x="54" y="2" width="50" height="18" rx="9" fill="#10254C" stroke="#4B6584" strokeWidth="1" />
        <circle cx="62" cy="11" r="2.5" fill="#F59E0B" />
        <text x="68" y="13.5" fill="#D1D8E0" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="700">v1.0 Live</text>
      </g>

      {/* Hero Headline Box with Double Brass Border */}
      <g transform="translate(14, 65)">
        <rect x="0" y="0" width="292" height="74" rx="8" fill="#F7F1E5" stroke="#A67C37" strokeWidth="1" />
        <rect x="3" y="3" width="286" height="68" rx="6" fill="#F7F1E5" stroke="#A67C37" strokeWidth="0.8" strokeDasharray="3 3" />
        
        <text x="12" y="18" fill="#A67C37" fontFamily="Georgia, serif" fontStyle="italic" fontSize="8" fontWeight="600">ESTABLISHED 2003 · INDIA &amp; AUSTRALIA</text>
        <text x="12" y="34" fill="#0B2A6B" fontFamily="Georgia, serif" fontSize="13" fontWeight="800">Enriching People.</text>
        <text x="12" y="49" fill="#0B2A6B" fontFamily="Georgia, serif" fontSize="13" fontWeight="800">Strengthening Organizations.</text>
        
        {/* Crimson consultation button */}
        <rect x="180" y="28" width="98" height="24" rx="12" fill="#D62839" />
        <text x="229" y="43" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="700">Explore Programs →</text>
      </g>

      {/* 3 Pillars / Modules */}
      <g transform="translate(14, 146)">
        {/* Module 1 */}
        <rect x="0" y="0" width="92" height="62" rx="8" fill="#FFFFFF" stroke="#D3C7B5" strokeWidth="1" />
        <rect x="8" y="8" width="20" height="20" rx="4" fill="#0B2A6B" />
        <path d="M14 18l3-5 5 8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        <text x="34" y="17" fill="#0B2A6B" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="800">Training</text>
        <text x="34" y="25" fill="#D62839" fontFamily="Georgia, serif" fontStyle="italic" fontSize="7">E1 Modules</text>
        <rect x="8" y="34" width="76" height="4" rx="2" fill="#CBD5E1" />
        <rect x="8" y="42" width="54" height="4" rx="2" fill="#E2E8F0" />
        <rect x="8" y="50" width="64" height="4" rx="2" fill="#E2E8F0" />

        {/* Module 2 */}
        <rect x="100" y="0" width="92" height="62" rx="8" fill="#FFFFFF" stroke="#D3C7B5" strokeWidth="1" />
        <rect x="108" y="8" width="20" height="20" rx="4" fill="#D62839" />
        <circle cx="118" cy="18" r="5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <text x="134" y="17" fill="#0B2A6B" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="800">Coaching</text>
        <text x="134" y="25" fill="#A67C37" fontFamily="Georgia, serif" fontStyle="italic" fontSize="7">Executive</text>
        <rect x="108" y="34" width="76" height="4" rx="2" fill="#CBD5E1" />
        <rect x="108" y="42" width="54" height="4" rx="2" fill="#E2E8F0" />
        <rect x="108" y="50" width="64" height="4" rx="2" fill="#E2E8F0" />

        {/* Module 3 */}
        <rect x="200" y="0" width="92" height="62" rx="8" fill="#FFFFFF" stroke="#D3C7B5" strokeWidth="1" />
        <rect x="208" y="8" width="20" height="20" rx="4" fill="#153E90" />
        <rect x="214" y="14" width="8" height="8" rx="1.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <text x="234" y="17" fill="#0B2A6B" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="800">OD Advisory</text>
        <text x="234" y="25" fill="#10B981" fontFamily="Georgia, serif" fontStyle="italic" fontSize="7">Consulting</text>
        <rect x="208" y="34" width="76" height="4" rx="2" fill="#CBD5E1" />
        <rect x="208" y="42" width="54" height="4" rx="2" fill="#E2E8F0" />
        <rect x="208" y="50" width="64" height="4" rx="2" fill="#E2E8F0" />
      </g>
    </svg>
  );
}

export function NutriFlexMockup() {
  return (
    <svg viewBox="0 0 320 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Shell */}
      <rect width="320" height="220" rx="14" fill="#111827" stroke="#17201E" strokeWidth="2" />

      {/* Window Controls Bar */}
      <rect width="320" height="22" rx="14" fill="#1F2937" />
      <rect y="12" width="320" height="10" fill="#1F2937" />
      <line x1="0" y1="22" x2="320" y2="22" stroke="#374151" strokeWidth="1" />
      <circle cx="14" cy="11" r="3.5" fill="#EF4444" />
      <circle cx="25" cy="11" r="3.5" fill="#F59E0B" />
      <circle cx="36" cy="11" r="3.5" fill="#10B981" />

      {/* App Header */}
      <g transform="translate(14, 28)">
        <rect x="0" y="2" width="16" height="16" rx="4" fill="#525CEB" />
        <path d="M4 10h8M6 7v6M10 7v6" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
        <text x="22" y="14" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="800">NutriFlex</text>
        <text x="76" y="14" fill="#818CF8" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600">· AI Assistant</text>

        {/* Status Pill */}
        <rect x="210" y="1" width="82" height="18" rx="9" fill="#1E1B4B" stroke="#6366F1" strokeWidth="1" />
        <circle cx="219" cy="10" r="2.5" fill="#10B981" />
        <text x="226" y="13" fill="#C7D2FE" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="700">AI Active</text>
      </g>

      {/* Hero Workout Generator Card */}
      <g transform="translate(14, 56)">
        <rect x="0" y="0" width="292" height="78" rx="8" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <text x="14" y="20" fill="#F9FAFB" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="800">Dynamic Workout Generator</text>
        <text x="14" y="34" fill="#9CA3AF" fontFamily="system-ui, sans-serif" fontSize="8.5">AI-powered weekly fitness task progression</text>

        {/* Progress Rings */}
        <g transform="translate(195, 12)">
          <circle cx="26" cy="26" r="22" stroke="#374151" strokeWidth="4" fill="none" />
          <circle cx="26" cy="26" r="22" stroke="#525CEB" strokeWidth="4" strokeDasharray="138" strokeDashoffset="35" fill="none" strokeLinecap="round" />
          <text x="26" y="29" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="800">82%</text>
          <text x="26" y="38" textAnchor="middle" fill="#9CA3AF" fontFamily="system-ui, sans-serif" fontSize="5.5">GOAL</text>
        </g>

        {/* Generate Button */}
        <rect x="14" y="44" width="105" height="24" rx="12" fill="#525CEB" />
        <text x="66" y="59" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="700">Generate Plan →</text>
      </g>

      {/* Bottom 3 Feature Widgets */}
      <g transform="translate(14, 142)">
        {/* Widget 1 */}
        <rect x="0" y="0" width="92" height="66" rx="8" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <rect x="8" y="8" width="18" height="18" rx="4" fill="#312E81" />
        <path d="M12 17l3 3 6-6" stroke="#818CF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="32" y="16" fill="#F9FAFB" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="700">Custom Plans</text>
        <text x="32" y="24" fill="#9CA3AF" fontFamily="system-ui, sans-serif" fontSize="6.5">Tailored splits</text>
        <rect x="8" y="34" width="76" height="4" rx="2" fill="#374151" />
        <rect x="8" y="42" width="60" height="4" rx="2" fill="#374151" />
        <rect x="8" y="50" width="45" height="4" rx="2" fill="#525CEB" />

        {/* Widget 2 */}
        <rect x="100" y="0" width="92" height="66" rx="8" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <rect x="108" y="8" width="18" height="18" rx="4" fill="#064E3B" />
        <circle cx="117" cy="17" r="4.5" stroke="#34D399" strokeWidth="1.2" fill="none" />
        <path d="M117 15v2.5l1.5 1" stroke="#34D399" strokeWidth="1" strokeLinecap="round" />
        <text x="132" y="16" fill="#F9FAFB" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="700">Weekly Tasks</text>
        <text x="132" y="24" fill="#9CA3AF" fontFamily="system-ui, sans-serif" fontSize="6.5">Automated</text>
        <rect x="108" y="34" width="76" height="4" rx="2" fill="#374151" />
        <rect x="108" y="42" width="60" height="4" rx="2" fill="#374151" />
        <rect x="108" y="50" width="52" height="4" rx="2" fill="#10B981" />

        {/* Widget 3 */}
        <rect x="200" y="0" width="92" height="66" rx="8" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <rect x="208" y="8" width="18" height="18" rx="4" fill="#701A75" />
        <path d="M217 14 C215 12, 212 14, 212 16 C212 19, 217 22, 217 22 C217 22, 222 19, 222 16 C222 14, 219 12, 217 14 Z" fill="#F472B6" />
        <text x="232" y="16" fill="#F9FAFB" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="700">AI Coach</text>
        <text x="232" y="24" fill="#9CA3AF" fontFamily="system-ui, sans-serif" fontSize="6.5">Motivational</text>
        <rect x="208" y="34" width="76" height="4" rx="2" fill="#374151" />
        <rect x="208" y="42" width="60" height="4" rx="2" fill="#374151" />
        <rect x="208" y="50" width="58" height="4" rx="2" fill="#F472B6" />
      </g>
    </svg>
  );
}

export default function ProjectCard({ study, onOpenCaseStudy, onOpenPhotos }: ProjectCardProps) {
  const is5e =
    study.name.toLowerCase().includes("5e") ||
    study.name.toLowerCase().includes("serpraise");
  const isManraah = study.name.toLowerCase().includes("manraah");
  const isCoppter =
    study.name.toLowerCase().includes("coppter") ||
    study.name.toLowerCase().includes("copter");
  const isNutriFlex = study.name.toLowerCase().includes("nutri");
  const isCourseHunt = study.name.toLowerCase().includes("coursehunt");
  const isTradeSage = study.name.toLowerCase().includes("tradesage");

  const renderMockup = () => {
    if (is5e) return <SerpraiseMockup />;
    if (isManraah) return <ManraahMockup />;
    if (isCoppter) return <CoppterMockup />;
    if (isNutriFlex) return <NutriFlexMockup />;
    if (isCourseHunt) return <CourseHuntMockup />;
    if (isTradeSage) return <TradeSageMockup />;
    return <SerpraiseMockup />;
  };

  const isLive = study.status === "live";

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
              <span
                className="project-card-status"
                style={{
                  background: isLive ? "#F7CE46" : "#F59E0B",
                }}
              >
                <span
                  className="project-card-status-dot"
                  style={{ background: isLive ? "#16A34A" : "#B45309" }}
                />
                {study.statusLabel}
              </span>
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
            {study.photos && study.photos.length > 0 ? (
              <button
                type="button"
                className="project-card-btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenPhotos) {
                    onOpenPhotos(study);
                  } else {
                    onOpenCaseStudy(study);
                  }
                }}
              >
                View project ↗
              </button>
            ) : study.liveUrl || study.version1Url ? (
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
                  onOpenCaseStudy(study);
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

        {/* Right Column: Browser Mockup */}
        <div className="project-card-right">
          <div className="project-card-mockup-wrap">
            {renderMockup()}
          </div>
        </div>
      </div>
    </div>
  );
}
