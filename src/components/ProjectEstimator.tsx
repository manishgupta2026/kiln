"use client";

import { useState, useMemo } from "react";

export interface ArchetypeConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseInr: number;
  baseUsd: number;
  baseHours: number;
  defaultWeeks: string;
  defaultStack: string[];
}

export const PROJECT_ARCHETYPES: ArchetypeConfig[] = [
  {
    id: "marketing_site",
    name: "Studio / Showcase Website",
    icon: "🌐",
    description: "High-craft marketing site with bespoke typography, fast loading, responsive layouts, and CMS.",
    baseInr: 65000,
    baseUsd: 800,
    baseHours: 40,
    defaultWeeks: "2 – 3 Weeks",
    defaultStack: ["Next.js 15", "TypeScript", "Tailwind CSS", "Figma"],
  },
  {
    id: "ecommerce_d2c",
    name: "D2C / E-Commerce Store",
    icon: "🛍️",
    description: "Modern commerce storefront, cart, Razorpay/Stripe, inventory sync, and order tracking.",
    baseInr: 185000,
    baseUsd: 2200,
    baseHours: 90,
    defaultWeeks: "4 – 6 Weeks",
    defaultStack: ["Next.js", "React", "PostgreSQL", "Razorpay / Stripe", "Tailwind"],
  },
  {
    id: "custom_portal",
    name: "Custom Web App / Internal Tool",
    icon: "⚡",
    description: "Role-based portals, client management, workflow automation, and custom dashboard reporting.",
    baseInr: 320000,
    baseUsd: 3800,
    baseHours: 140,
    defaultWeeks: "5 – 7 Weeks",
    defaultStack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
  },
  {
    id: "saas_mvp",
    name: "Lean SaaS MVP",
    icon: "🚀",
    description: "Production-ready software with multi-tenant auth, subscription billing, core product loop, and admin console.",
    baseInr: 450000,
    baseUsd: 5400,
    baseHours: 180,
    defaultWeeks: "6 – 8 Weeks",
    defaultStack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Prisma", "Stripe / LemonSqueezy"],
  },
  {
    id: "mobile_app",
    name: "Cross-Platform Mobile App",
    icon: "📱",
    description: "Native iOS & Android mobile application with offline support, push notifications, and App Store readiness.",
    baseInr: 420000,
    baseUsd: 5000,
    baseHours: 170,
    defaultWeeks: "6 – 9 Weeks",
    defaultStack: ["React Native", "Expo", "TypeScript", "Node.js API", "PostgreSQL"],
  },
  {
    id: "full_suite",
    name: "Full Product Suite (Web + Mobile)",
    icon: "👑",
    description: "Unified web platform, cross-platform mobile apps, customer portal, and super-admin command center.",
    baseInr: 950000,
    baseUsd: 11500,
    baseHours: 350,
    defaultWeeks: "10 – 14 Weeks",
    defaultStack: ["Next.js", "React Native", "TypeScript", "PostgreSQL", "Docker", "AWS / Supabase"],
  },
];

export interface FeatureOption {
  id: string;
  name: string;
  description: string;
  inr: number;
  usd: number;
  hours: number;
  category: "auth" | "payments" | "ai" | "realtime" | "integrations" | "infra";
}

export const FEATURE_ADDONS: FeatureOption[] = [
  {
    id: "auth_rbac",
    name: "Auth & Multi-Role Permissions (RBAC)",
    description: "Google/GitHub SSO, magic links, user roles (Admin, Member, Client), and granular gates.",
    inr: 25000,
    usd: 300,
    hours: 15,
    category: "auth",
  },
  {
    id: "payment_domestic",
    name: "Indian Payment Gateway (Razorpay/UPI)",
    description: "Seamless UPI, Credit/Debit cards, Net Banking, and automatic invoice webhooks.",
    inr: 25000,
    usd: 300,
    hours: 14,
    category: "payments",
  },
  {
    id: "payment_global",
    name: "Global Multi-Currency Billing (Stripe)",
    description: "International cards, recurring subscriptions, prorated upgrades, and localized checkout.",
    inr: 35000,
    usd: 420,
    hours: 18,
    category: "payments",
  },
  {
    id: "ai_llm_integration",
    name: "AI / LLM Integration (OpenAI/Claude)",
    description: "Structured JSON completions, custom prompts, smart assistants, or automated report generation.",
    inr: 55000,
    usd: 650,
    hours: 24,
    category: "ai",
  },
  {
    id: "ai_rag_vectors",
    name: "Vector Search & Custom RAG Knowledge",
    description: "Semantic search, document embeddings, and AI answering from proprietary business files.",
    inr: 85000,
    usd: 1000,
    hours: 35,
    category: "ai",
  },
  {
    id: "realtime_websockets",
    name: "Real-time Live Chat & Notifications",
    description: "WebSocket channels, live presence indicators, typing status, and instant in-app alerts.",
    inr: 45000,
    usd: 540,
    hours: 20,
    category: "realtime",
  },
  {
    id: "whatsapp_api",
    name: "WhatsApp Business & SMS Automated Alerts",
    description: "Automated OTPs, booking confirmations, and order updates delivered directly to WhatsApp.",
    inr: 30000,
    usd: 360,
    hours: 14,
    category: "integrations",
  },
  {
    id: "third_party_sync",
    name: "Third-Party ERP / CRM / Logistics Sync",
    description: "HubSpot, Salesforce, Shiprocket, Google Sheets, or custom webhook integrations.",
    inr: 35000,
    usd: 420,
    hours: 16,
    category: "integrations",
  },
  {
    id: "admin_analytics_bi",
    name: "Executive Analytics & Custom Reporting",
    description: "Interactive visual charts, exportable CSV/PDF summaries, user activity logs, and KPIs.",
    inr: 40000,
    usd: 480,
    hours: 18,
    category: "infra",
  },
  {
    id: "i18n_multilingual",
    name: "Multi-Language & Regional Support (i18n)",
    description: "Localization strings, RTL support, and multi-region currency switching.",
    inr: 25000,
    usd: 300,
    hours: 12,
    category: "infra",
  },
];

export interface DesignTier {
  id: string;
  name: string;
  inr: number;
  usd: number;
  description: string;
}

export const DESIGN_TIERS: DesignTier[] = [
  {
    id: "standard",
    name: "Clean Standard UI System",
    inr: 0,
    usd: 0,
    description: "Accessible, responsive component system using Kiln core design tokens.",
  },
  {
    id: "bespoke_figma",
    name: "Bespoke Figma Design System (+₹45k / $550)",
    inr: 45000,
    usd: 550,
    description: "Custom wireframes, full UI mockups in Figma, interactive prototypes, and typography styling.",
  },
  {
    id: "studio_craft",
    name: "Signature Craft Polish (+₹95k / $1,150)",
    inr: 95000,
    usd: 1150,
    description: "Micro-animations, smooth physics transitions, dark mode, custom iconography, and high-conversion UX.",
  },
];

export interface SpeedOption {
  id: string;
  name: string;
  multiplier: number;
  description: string;
}

export const SPEED_OPTIONS: SpeedOption[] = [
  { id: "standard", name: "Standard Pace (6 – 10 wks)", multiplier: 1.0, description: "Normal studio sprint cycle." },
  { id: "accelerated", name: "Accelerated Sprint (4 – 6 wks)", multiplier: 1.25, description: "Dedicated 2-developer pod (+25% rush staffing)." },
  { id: "rush", name: "High-Velocity Blitz (2 – 3 wks)", multiplier: 1.5, description: "Full engineering focus & rapid daily deployment (+50% rush)." },
];

export interface MaintenanceOption {
  id: string;
  name: string;
  percent: number;
  description: string;
}

export const MAINTENANCE_OPTIONS: MaintenanceOption[] = [
  { id: "warranty_30d", name: "30-Day Launch Warranty", percent: 0, description: "Included free: post-deployment bugfixes & launch monitoring." },
  { id: "quarterly_sla", name: "6-Month SLA & Maintenance (+12%)", percent: 0.12, description: "Priority bug triage, framework upgrades, dependency security patches." },
  { id: "annual_amc", name: "1-Year Dedicated Retainer (+20%)", percent: 0.20, description: "Comprehensive SLA, monthly feature improvements (15 hrs/mo), continuous uptime." },
];

export interface EstimationResult {
  currency: "INR" | "USD";
  basePrice: number;
  designPrice: number;
  featuresPrice: number;
  speedMultiplier: number;
  subtotal: number;
  maintenancePrice: number;
  totalPrice: number;
  lowRange: number;
  highRange: number;
  totalHours: number;
  timelineWeeks: string;
  archetype: ArchetypeConfig;
  selectedFeatures: FeatureOption[];
  designTier: DesignTier;
  speedOption: SpeedOption;
  maintenanceOption: MaintenanceOption;
}

interface ProjectEstimatorProps {
  onConvertToQuotation?: (result: EstimationResult) => void;
}

export default function ProjectEstimator({ onConvertToQuotation }: ProjectEstimatorProps) {
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>("saas_mvp");
  const [selectedDesignTierId, setSelectedDesignTierId] = useState<string>("bespoke_figma");
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([
    "auth_rbac",
    "payment_domestic",
    "admin_analytics_bi",
  ]);
  const [selectedSpeedId, setSelectedSpeedId] = useState<string>("standard");
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string>("warranty_30d");

  const toggleFeature = (id: string) => {
    setSelectedFeatureIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const archetype = useMemo(
    () => PROJECT_ARCHETYPES.find((a) => a.id === selectedArchetypeId) || PROJECT_ARCHETYPES[0],
    [selectedArchetypeId]
  );

  const designTier = useMemo(
    () => DESIGN_TIERS.find((d) => d.id === selectedDesignTierId) || DESIGN_TIERS[0],
    [selectedDesignTierId]
  );

  const speedOption = useMemo(
    () => SPEED_OPTIONS.find((s) => s.id === selectedSpeedId) || SPEED_OPTIONS[0],
    [selectedSpeedId]
  );

  const maintenanceOption = useMemo(
    () => MAINTENANCE_OPTIONS.find((m) => m.id === selectedMaintenanceId) || MAINTENANCE_OPTIONS[0],
    [selectedMaintenanceId]
  );

  const selectedFeatures = useMemo(
    () => FEATURE_ADDONS.filter((f) => selectedFeatureIds.includes(f.id)),
    [selectedFeatureIds]
  );

  // Calculations based on Indian Software Market formula
  const calculation: EstimationResult = useMemo(() => {
    const isInr = currency === "INR";
    const basePrice = isInr ? archetype.baseInr : archetype.baseUsd;
    const designPrice = isInr ? designTier.inr : designTier.usd;
    const featuresPrice = selectedFeatures.reduce(
      (sum, f) => sum + (isInr ? f.inr : f.usd),
      0
    );

    const totalHours =
      archetype.baseHours + selectedFeatures.reduce((sum, f) => sum + f.hours, 0) + (designTier.id === "studio_craft" ? 20 : designTier.id === "bespoke_figma" ? 12 : 0);

    const rawSubtotal = (basePrice + designPrice + featuresPrice) * speedOption.multiplier;
    const maintenancePrice = rawSubtotal * maintenanceOption.percent;
    const totalPrice = Math.round(rawSubtotal + maintenancePrice);

    // Realistic market range (-10% to +15% buffer)
    const lowRange = Math.round(totalPrice * 0.9);
    const highRange = Math.round(totalPrice * 1.15);

    let timelineWeeks = archetype.defaultWeeks;
    if (speedOption.id === "accelerated") {
      timelineWeeks = "3 – 5 Weeks";
    } else if (speedOption.id === "rush") {
      timelineWeeks = "2 – 3 Weeks";
    }

    return {
      currency,
      basePrice,
      designPrice,
      featuresPrice,
      speedMultiplier: speedOption.multiplier,
      subtotal: Math.round(rawSubtotal),
      maintenancePrice: Math.round(maintenancePrice),
      totalPrice,
      lowRange,
      highRange,
      totalHours,
      timelineWeeks,
      archetype,
      selectedFeatures,
      designTier,
      speedOption,
      maintenanceOption,
    };
  }, [
    currency,
    archetype,
    designTier,
    selectedFeatures,
    speedOption,
    maintenanceOption,
  ]);

  const formatPrice = (val: number) => {
    if (currency === "INR") {
      return `₹${val.toLocaleString("en-IN")}`;
    }
    return `$${val.toLocaleString("en-US")}`;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
      {/* LEFT COLUMN: BUILD CALCULATOR CONFIGURATOR */}
      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        
        {/* Step 1: Project Archetype */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.05em" }}>
                Step 01
              </div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 500, color: "var(--ink)", margin: 0 }}>
                Select Project Archetype
              </h3>
            </div>

            {/* Currency Switcher */}
            <div style={{ display: "flex", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "999px", padding: "3px" }}>
              <button
                type="button"
                onClick={() => setCurrency("INR")}
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  border: "none",
                  background: currency === "INR" ? "var(--ink)" : "transparent",
                  color: currency === "INR" ? "#fff" : "var(--muted)",
                  fontFamily: "var(--mono)",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                🇮🇳 INR (₹)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  border: "none",
                  background: currency === "USD" ? "var(--ink)" : "transparent",
                  color: currency === "USD" ? "#fff" : "var(--muted)",
                  fontFamily: "var(--mono)",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                🌐 USD ($)
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {PROJECT_ARCHETYPES.map((arch) => {
              const isSelected = arch.id === selectedArchetypeId;
              const cost = currency === "INR" ? arch.baseInr : arch.baseUsd;

              return (
                <div
                  key={arch.id}
                  onClick={() => setSelectedArchetypeId(arch.id)}
                  style={{
                    border: isSelected ? "2px solid var(--accent)" : "1px solid var(--line)",
                    background: isSelected ? "var(--accent-soft)" : "var(--bg)",
                    borderRadius: "12px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all .2s ease",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{arch.icon}</div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)", marginBottom: "4px" }}>
                    {arch.name}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: 1.45, marginBottom: "10px" }}>
                    {arch.description}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "8px" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>Base:</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "13.5px", fontWeight: "bold", color: "var(--accent)" }}>
                      {formatPrice(cost)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Design Fidelity & UX */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.05em", marginBottom: "2px" }}>
            Step 02
          </div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 500, color: "var(--ink)", marginBottom: "14px" }}>
            Design Fidelity &amp; Prototyping Tier
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {DESIGN_TIERS.map((tier) => {
              const isSelected = tier.id === selectedDesignTierId;
              const cost = currency === "INR" ? tier.inr : tier.usd;

              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedDesignTierId(tier.id)}
                  style={{
                    border: isSelected ? "2px solid var(--accent)" : "1px solid var(--line)",
                    background: isSelected ? "var(--accent-soft)" : "var(--bg)",
                    borderRadius: "10px",
                    padding: "14px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)", marginBottom: "4px" }}>
                    {tier.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.4 }}>
                    {tier.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Feature Add-ons & Functional Modules */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.05em" }}>
                Step 03
              </div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 500, color: "var(--ink)", margin: 0 }}>
                Features, Integrations &amp; Infrastructure
              </h3>
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>
              {selectedFeatureIds.length} modules selected
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
            {FEATURE_ADDONS.map((feat) => {
              const isSelected = selectedFeatureIds.includes(feat.id);
              const cost = currency === "INR" ? feat.inr : feat.usd;

              return (
                <div
                  key={feat.id}
                  onClick={() => toggleFeature(feat.id)}
                  style={{
                    border: isSelected ? "1.5px solid var(--accent)" : "1px solid var(--line)",
                    background: isSelected ? "#fff" : "var(--bg)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    cursor: "pointer",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    style={{ marginTop: "3px", accentColor: "var(--accent)", cursor: "pointer" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--ink)" }}>{feat.name}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>
                        +{formatPrice(cost)}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px", lineHeight: 1.35 }}>
                      {feat.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Speed & Maintenance */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Speed */}
          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.05em", marginBottom: "2px" }}>
              Step 04: Delivery Pace
            </div>
            <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Delivery Velocity</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {SPEED_OPTIONS.map((sp) => (
                <div
                  key={sp.id}
                  onClick={() => setSelectedSpeedId(sp.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: selectedSpeedId === sp.id ? "1.5px solid var(--accent)" : "1px solid var(--line)",
                    background: selectedSpeedId === sp.id ? "var(--accent-soft)" : "var(--bg)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{sp.name}</div>
                  <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>{sp.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance */}
          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.05em", marginBottom: "2px" }}>
              Step 05: SLA &amp; Support
            </div>
            <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Ongoing Maintenance</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {MAINTENANCE_OPTIONS.map((mnt) => (
                <div
                  key={mnt.id}
                  onClick={() => setSelectedMaintenanceId(mnt.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: selectedMaintenanceId === mnt.id ? "1.5px solid var(--accent)" : "1px solid var(--line)",
                    background: selectedMaintenanceId === mnt.id ? "var(--accent-soft)" : "var(--bg)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{mnt.name}</div>
                  <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>{mnt.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: LIVE ESTIMATE SCOREBOARD & QUOTATION CONVERTER */}
      <div style={{ position: "sticky", top: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Main Price Card */}
        <div style={{ background: "var(--card)", border: "2px solid var(--ink)", borderRadius: "18px", padding: "26px", boxShadow: "var(--shadow)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.06em", marginBottom: "6px" }}>
            Estimated Studio Quote
          </div>

          <div style={{ fontFamily: "var(--display)", fontSize: "40px", fontWeight: "bold", color: "var(--accent)", lineHeight: 1.1 }}>
            {formatPrice(calculation.totalPrice)}
          </div>

          <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "6px" }}>
            Realistic Market Range: <strong>{formatPrice(calculation.lowRange)} – {formatPrice(calculation.highRange)}</strong>
          </div>

          <div style={{ margin: "18px 0", borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--muted)", marginBottom: "6px" }}>
              <span>Base Platform:</span>
              <span>{formatPrice(calculation.basePrice)}</span>
            </div>
            {calculation.designPrice > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--muted)", marginBottom: "6px" }}>
                <span>Design System:</span>
                <span>+{formatPrice(calculation.designPrice)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--muted)", marginBottom: "6px" }}>
              <span>Features ({selectedFeatures.length}):</span>
              <span>+{formatPrice(calculation.featuresPrice)}</span>
            </div>
            {calculation.speedMultiplier > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#c93b2b", marginBottom: "6px" }}>
                <span>Rush Velocity (+{Math.round((calculation.speedMultiplier - 1) * 100)}%):</span>
                <span>Included</span>
              </div>
            )}
            {calculation.maintenancePrice > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--accent)", marginBottom: "6px" }}>
                <span>SLA Maintenance:</span>
                <span>+{formatPrice(calculation.maintenancePrice)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14.5px", fontWeight: "bold", color: "var(--ink)", borderTop: "1px solid var(--line)", paddingTop: "8px", marginTop: "8px" }}>
              <span>Calculated Total:</span>
              <span>{formatPrice(calculation.totalPrice)}</span>
            </div>
          </div>

          {/* Timeline & Effort Specs */}
          <div style={{ background: "var(--bg)", padding: "14px 16px", borderRadius: "10px", fontSize: "12.5px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "var(--muted)" }}>Estimated Effort:</span>
              <strong>~{calculation.totalHours} billable hrs</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "var(--muted)" }}>Timeline:</span>
              <strong>{calculation.timelineWeeks}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Recommended Milestones:</span>
              <strong>40% / 40% / 20%</strong>
            </div>
          </div>

          {/* Convert to Quotation Action */}
          <button
            type="button"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: "14px" }}
            onClick={() => onConvertToQuotation?.(calculation)}
          >
            Create Formal Quotation from Estimate →
          </button>
        </div>

        {/* Indian Market Context Card */}
        <div style={{ background: "var(--accent-soft)", border: "1px solid rgba(117, 128, 31, 0.25)", borderRadius: "14px", padding: "16px 18px", fontSize: "12.5px", color: "var(--ink)", lineHeight: 1.5 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: "bold", color: "var(--accent)", textTransform: "uppercase", marginBottom: "4px" }}>
            🇮🇳 Indian Market Pricing Intelligence
          </div>
          Boutique product studios in India typically quote between <strong>₹1,800 – ₹3,200/hr</strong> for senior full-stack engineering &amp; product design.
          This calculator uses realistic work-breakdown structures (WBS) to prevent underquoting while remaining highly competitive against legacy service agencies.
        </div>

      </div>
    </div>
  );
}
