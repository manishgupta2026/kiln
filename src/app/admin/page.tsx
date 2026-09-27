"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Project, ProjectCategory } from "@/data/projects";
import { TrustSectionConfig, TrustSlot } from "@/lib/content-db";
import { TeamMemberRecord } from "@/lib/team-db";
import { CareerApplicationRecord } from "@/lib/careers-db";
import { ProjectQuotationRecord, QuotationLineItem } from "@/lib/quotations-db";
import ProjectEstimator, { EstimationResult } from "@/components/ProjectEstimator";
import AdminNavbar from "@/components/AdminNavbar";

interface BriefItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  projectType: string;
  budget: string | null;
  description: string;
  status: "new" | "read" | "call_scheduled" | "call_completed" | "converted" | "archived";
  callScheduledAt?: string | null;
  callMeetingUrl?: string | null;
  callNotes?: string | null;
  createdAt: string;
  project?: { id: string; name: string; phase: string; status: string } | null;
}

interface ClientPortalProject {
  id: string;
  name: string;
  phase: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; email: string };
  developers: { developer: { id: string; name: string; email: string } }[];
  _count: { tickets: number; messages: number; updates: number };
}

interface DeveloperItem {
  id: string;
  name: string;
  email: string;
  hasPassword: boolean;
  activeProjects: { id: string; name: string; phase: string }[];
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"briefs" | "portalProjects" | "developers" | "trust" | "projects" | "team" | "careers" | "quotations">("briefs");

  // Briefs State
  const [briefs, setBriefs] = useState<BriefItem[]>([]);
  const [loadingBriefs, setLoadingBriefs] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Portal Projects State
  const [portalProjects, setPortalProjects] = useState<ClientPortalProject[]>([]);
  const [loadingPortalProjects, setLoadingPortalProjects] = useState(true);

  // Developers State
  const [developers, setDevelopers] = useState<DeveloperItem[]>([]);
  const [loadingDevs, setLoadingDevs] = useState(true);
  const [showInviteDevModal, setShowInviteDevModal] = useState(false);
  const [devName, setDevName] = useState("");
  const [devEmail, setDevEmail] = useState("");
  const [invitingDev, setInvitingDev] = useState(false);
  const [devInviteResult, setDevInviteResult] = useState<string | null>(null);

  // Trust Section State
  const [trustConfig, setTrustConfig] = useState<TrustSectionConfig | null>(null);
  const [loadingTrust, setLoadingTrust] = useState(true);
  const [savingTrust, setSavingTrust] = useState(false);
  const [trustSuccessMsg, setTrustSuccessMsg] = useState<string | null>(null);

  // Showcase Projects State
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    name: "",
    category: "product",
    oneLiner: "",
    homepageOneLiner: "",
    result: "",
    tags: [],
    status: undefined,
    featured: true,
    mobilePreview: "",
  });
  const [tagsInput, setTagsInput] = useState("");

  // Studio Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMemberRecord[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMemberRecord | null>(null);
  const [savingTeamMember, setSavingTeamMember] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamSuccessMsg, setTeamSuccessMsg] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    role: "",
    avatar: "",
    bio: "",
    displayOrder: 1,
  });

  // Careers State
  const [careerApps, setCareerApps] = useState<CareerApplicationRecord[]>([]);
  const [loadingCareerApps, setLoadingCareerApps] = useState(true);
  const [careerFilterType, setCareerFilterType] = useState<"ALL" | "JOB" | "INTERNSHIP" | "FREELANCING">("ALL");
  const [careerFilterStatus, setCareerFilterStatus] = useState<string>("ALL");
  const [careerSearch, setCareerSearch] = useState("");
  const [expandedCareerId, setExpandedCareerId] = useState<string | null>(null);
  const [careerNotes, setCareerNotes] = useState<{ [id: string]: string }>({});
  const [savingCareerNoteId, setSavingCareerNoteId] = useState<string | null>(null);
  const [careerSuccessMsg, setCareerSuccessMsg] = useState<string | null>(null);

  // Quotations & Price Estimator State
  const [quotationsList, setQuotationsList] = useState<ProjectQuotationRecord[]>([]);
  const [loadingQuotations, setLoadingQuotations] = useState(true);
  const [quoteSubTab, setQuoteSubTab] = useState<"estimator" | "hub">("estimator");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteFilterStatus, setQuoteFilterStatus] = useState("ALL");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);
  const [sendingQuoteEmail, setSendingQuoteEmail] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);
  const [resendingQuoteId, setResendingQuoteId] = useState<string | null>(null);

  // Quotation Form State
  const [quoteFormId, setQuoteFormId] = useState<string | null>(null);
  const [qQuotationNumber, setQQuotationNumber] = useState("");
  const [qClientName, setQClientName] = useState("");
  const [qClientEmail, setQClientEmail] = useState("");
  const [qClientPhone, setQClientPhone] = useState("");
  const [qClientCompany, setQClientCompany] = useState("");
  const [qProjectTitle, setQProjectTitle] = useState("");
  const [qOverview, setQOverview] = useState("");
  const [qCurrency, setQCurrency] = useState<"INR" | "USD">("INR");
  const [qDiscount, setQDiscount] = useState<number>(0);
  const [qTaxRate, setQTaxRate] = useState<number>(0);
  const [qTimeline, setQTimeline] = useState("4 – 6 Weeks");
  const [qPaymentSchedule, setQPaymentSchedule] = useState("40% Advance, 40% Staging Approval, 20% Production Handover");
  const [qValidUntil, setQValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [qLineItems, setQLineItems] = useState<QuotationLineItem[]>([
    {
      id: "item_1",
      title: "Core Platform Architecture & UI Implementation",
      description: "Next.js 15, TypeScript, Tailwind CSS, responsive components, and database schema.",
      hours: 80,
      amount: 150000,
    },
  ]);
  const [qTechStack, setQTechStack] = useState("Next.js, TypeScript, PostgreSQL, Tailwind CSS, Figma");
  const [qTerms, setQTerms] = useState(
    "1. Includes 30 days of post-deployment monitoring and bug fixing.\n2. Full intellectual property and source code ownership transfer upon final disbursement.\n3. Hosting and third-party API subscriptions (e.g. AWS, OpenAI, Razorpay) are billed directly to client accounts."
  );
  const [qCustomEmailNote, setQCustomEmailNote] = useState("");

  const [, startTransition] = useTransition();
  const router = useRouter();

  // Load Briefs
  const fetchBriefs = async () => {
    try {
      const res = await fetch("/api/admin/briefs");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (json.success) {
        setBriefs(json.data);
      }
    } catch (err) {
      console.error("Failed to load briefs:", err);
    } finally {
      setLoadingBriefs(false);
    }
  };

  // Load Portal Projects
  const fetchPortalProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (json.success) {
        setPortalProjects(json.projects);
      }
    } catch (err) {
      console.error("Failed to load portal projects:", err);
    } finally {
      setLoadingPortalProjects(false);
    }
  };

  // Load Developers
  const fetchDevelopers = async () => {
    try {
      const res = await fetch("/api/admin/developers");
      const json = await res.json();
      if (json.success) {
        setDevelopers(json.developers);
      }
    } catch (err) {
      console.error("Failed to load developers:", err);
    } finally {
      setLoadingDevs(false);
    }
  };

  // Load Trust Config & Showcase Projects
  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      const json = await res.json();
      if (json.success) {
        setTrustConfig(json.data.trust);
        setProjectsList(json.data.projects);
      }
    } catch (err) {
      console.error("Failed to load site content:", err);
    } finally {
      setLoadingTrust(false);
      setLoadingProjects(false);
    }
  };

  // Load Studio Team Members
  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/admin/team");
      const json = await res.json();
      if (json.success) {
        setTeamMembers(json.data);
      }
    } catch (err) {
      console.error("Failed to load studio team:", err);
    } finally {
      setLoadingTeam(false);
    }
  };

  // Load Career Applications
  const fetchCareers = async () => {
    try {
      const res = await fetch("/api/admin/careers");
      const json = await res.json();
      if (json.success) {
        setCareerApps(json.data);
      }
    } catch (err) {
      console.error("Failed to load career applications:", err);
    } finally {
      setLoadingCareerApps(false);
    }
  };

  // Load Quotations
  const fetchQuotations = async () => {
    try {
      const res = await fetch("/api/admin/quotations");
      const json = await res.json();
      if (json.success) {
        setQuotationsList(json.data);
      }
    } catch (err) {
      console.error("Failed to load quotations:", err);
    } finally {
      setLoadingQuotations(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab");
      if (
        p &&
        ["briefs", "portalProjects", "developers", "trust", "projects", "team", "careers", "quotations"].includes(p)
      ) {
        setActiveTab(p as any);
      }
    }
    fetchBriefs();
    fetchPortalProjects();
    fetchDevelopers();
    fetchContent();
    fetchTeamMembers();
    fetchCareers();
    fetchQuotations();
  }, []);

  const handleConvertEstimateToQuote = (est: EstimationResult) => {
    const isRupee = est.currency === "INR";
    setQCurrency(est.currency);
    setQProjectTitle(`${est.archetype.name} — Full Build`);
    setQOverview(
      `Bespoke engineering and design scope for ${est.archetype.name}.\n` +
      `Includes full design fidelity (${est.designTier.name}), core functional modules, and production deployment on modern cloud architecture.`
    );
    setQTimeline(est.timelineWeeks);
    setQPaymentSchedule("40% Advance Deposit upon contract signing, 40% upon Staging Feature-Complete, 20% on Final Production Handover.");
    setQTechStack(est.archetype.defaultStack.join(", "));

    const items: QuotationLineItem[] = [
      {
        id: "base_arch",
        title: `${est.archetype.name} — Core Architecture`,
        description: est.archetype.description,
        hours: est.archetype.baseHours,
        amount: isRupee ? est.archetype.baseInr : est.archetype.baseUsd,
      },
    ];

    if (est.designTier.inr > 0 || est.designTier.usd > 0) {
      items.push({
        id: "design_system",
        title: `Design System: ${est.designTier.name}`,
        description: est.designTier.description,
        hours: 20,
        amount: isRupee ? est.designTier.inr : est.designTier.usd,
      });
    }

    est.selectedFeatures.forEach((feat) => {
      items.push({
        id: `feat_${feat.id}`,
        title: feat.name,
        description: feat.description,
        hours: feat.hours,
        amount: isRupee ? feat.inr : feat.usd,
      });
    });

    if (est.maintenancePrice > 0) {
      items.push({
        id: "maintenance",
        title: est.maintenanceOption.name,
        description: est.maintenanceOption.description,
        amount: est.maintenancePrice,
      });
    }

    setQLineItems(items);
    setQDiscount(0);
    setQTaxRate(0);
    setQuoteFormId(null);
    setQQuotationNumber("");
    setShowQuoteModal(true);
  };

  const handleCreateQuotationForBrief = (brief: BriefItem) => {
    setActiveTab("quotations");
    setQuoteSubTab("hub");
    setQClientName(brief.name);
    setQClientEmail(brief.email);
    setQClientPhone(brief.phone || "");
    setQClientCompany("");
    setQProjectTitle(`${brief.projectType} — Bespoke Build`);
    setQOverview(`Scope requested in client brief:\n${brief.description}`);
    setQCurrency("INR");
    setQDiscount(0);
    setQTaxRate(0);
    setQTimeline("4 – 6 Weeks");
    setQPaymentSchedule("40% Advance Deposit, 40% Staging Approval, 20% Production Handover");
    setQLineItems([
      {
        id: "brief_item_1",
        title: `${brief.projectType} Implementation`,
        description: brief.description.slice(0, 150),
        hours: 60,
        amount: 120000,
      },
    ]);
    setQuoteFormId(null);
    setQQuotationNumber("");
    setShowQuoteModal(true);
  };

  const handleSaveOrSendQuotation = async (sendImmediately: boolean) => {
    if (!qClientName.trim() || !qClientEmail.trim() || !qProjectTitle.trim()) {
      alert("Please provide client name, email, and project title.");
      return;
    }

    const sub = qLineItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
    const taxAmt = Math.round((sub - qDiscount) * (qTaxRate / 100));
    const tot = Math.max(0, sub - qDiscount + taxAmt);

    const payload = {
      clientName: qClientName.trim(),
      clientEmail: qClientEmail.trim(),
      clientPhone: qClientPhone.trim() || null,
      clientCompany: qClientCompany.trim() || null,
      projectTitle: qProjectTitle.trim(),
      overview: qOverview.trim(),
      currency: qCurrency,
      subtotal: sub,
      discount: qDiscount,
      taxRate: qTaxRate,
      taxAmount: taxAmt,
      totalAmount: tot,
      timeline: qTimeline,
      paymentSchedule: qPaymentSchedule,
      validUntil: qValidUntil,
      lineItems: qLineItems,
      techStack: qTechStack.split(",").map((s) => s.trim()).filter(Boolean),
      termsAndNotes: qTerms,
      sendImmediately,
      emailCustomNote: qCustomEmailNote,
    };

    if (sendImmediately) setSendingQuoteEmail(true);
    else setSavingQuote(true);

    try {
      let res;
      if (quoteFormId) {
        res = await fetch(`/api/admin/quotations/${quoteFormId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/quotations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save quotation");

      setQuoteSuccessMsg(
        sendImmediately
          ? `✓ Quotation sent directly to ${qClientEmail}!`
          : `✓ Quotation saved as draft.`
      );
      setTimeout(() => setQuoteSuccessMsg(null), 4000);
      setShowQuoteModal(false);
      setQuoteSubTab("hub");
      await fetchQuotations();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSavingQuote(false);
      setSendingQuoteEmail(false);
    }
  };

  const handleResendQuoteEmail = async (q: ProjectQuotationRecord) => {
    if (!confirm(`Dispatch quotation [${q.quotationNumber}] to ${q.clientEmail}?`)) return;
    setResendingQuoteId(q.id);
    try {
      const res = await fetch(`/api/admin/quotations/${q.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setQuoteSuccessMsg(`✓ Quotation sent to ${q.clientEmail}!`);
      setTimeout(() => setQuoteSuccessMsg(null), 4000);
      await fetchQuotations();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setResendingQuoteId(null);
    }
  };

  const handleDeleteQuoteItem = async (id: string, num: string) => {
    if (!confirm(`Delete quotation ${num}?`)) return;
    try {
      const res = await fetch(`/api/admin/quotations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setQuoteSuccessMsg(`✓ Deleted quotation ${num}.`);
      setTimeout(() => setQuoteSuccessMsg(null), 3000);
      await fetchQuotations();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditQuotation = (q: ProjectQuotationRecord) => {
    setQuoteFormId(q.id);
    setQQuotationNumber(q.quotationNumber);
    setQClientName(q.clientName);
    setQClientEmail(q.clientEmail);
    setQClientPhone(q.clientPhone || "");
    setQClientCompany(q.clientCompany || "");
    setQProjectTitle(q.projectTitle);
    setQOverview(q.overview || "");
    setQCurrency(q.currency as "INR" | "USD");
    setQDiscount(q.discount || 0);
    setQTaxRate(q.taxRate || 0);
    setQTimeline(q.timeline || "4 – 6 Weeks");
    setQPaymentSchedule(q.paymentSchedule || "40% Advance, 40% Staging Approval, 20% Production Handover");
    setQValidUntil(q.validUntil ? new Date(q.validUntil).toISOString().split("T")[0] : "");
    setQLineItems(Array.isArray(q.lineItems) && q.lineItems.length > 0 ? q.lineItems : [
      { id: "item_1", title: "Project Implementation", description: "", hours: 40, amount: 80000 }
    ]);
    setQTechStack(Array.isArray(q.techStack) ? q.techStack.join(", ") : "");
    setQTerms(q.termsAndNotes || "");
    setQCustomEmailNote("");
    setShowQuoteModal(true);
  };

  const handleAddNewQuotation = () => {
    setQuoteFormId(null);
    setQQuotationNumber("");
    setQClientName("");
    setQClientEmail("");
    setQClientPhone("");
    setQClientCompany("");
    setQProjectTitle("");
    setQOverview("");
    setQCurrency("INR");
    setQDiscount(0);
    setQTaxRate(0);
    setQTimeline("4 – 6 Weeks");
    setQPaymentSchedule("40% Advance Deposit, 40% Staging Approval, 20% Production Handover");
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setQValidUntil(d.toISOString().split("T")[0]);
    setQLineItems([
      {
        id: `item_${Date.now()}`,
        title: "Core Platform Architecture & UI Implementation",
        description: "Next.js 15, TypeScript, Tailwind CSS, responsive components, and database schema.",
        hours: 80,
        amount: 150000,
      },
    ]);
    setQTechStack("Next.js, TypeScript, PostgreSQL, Tailwind CSS, Figma");
    setQTerms(
      "1. Includes 30 days of post-deployment monitoring and bug fixing.\n2. Full intellectual property and source code ownership transfer upon final disbursement.\n3. Hosting and third-party API subscriptions (e.g. AWS, OpenAI, Razorpay) are billed directly to client accounts."
    );
    setQCustomEmailNote("");
    setShowQuoteModal(true);
  };

  const handleAddQLineItem = () => {
    setQLineItems([
      ...qLineItems,
      {
        id: `item_${Date.now()}`,
        title: "Additional Scope Module",
        description: "",
        hours: 20,
        amount: qCurrency === "INR" ? 35000 : 450,
      },
    ]);
  };

  const handleRemoveQLineItem = (id: string) => {
    if (qLineItems.length <= 1) return;
    setQLineItems(qLineItems.filter((it) => it.id !== id));
  };

  const handleUpdateQLineItem = (id: string, field: keyof QuotationLineItem, val: any) => {
    setQLineItems(qLineItems.map((it) => (it.id === id ? { ...it, [field]: val } : it)));
  };

  const handleCareerStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      setCareerApps((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus as any } : app))
      );
      setCareerSuccessMsg(`Status updated to "${newStatus}".`);
      setTimeout(() => setCareerSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleSaveCareerNote = async (id: string) => {
    const note = careerNotes[id];
    setSavingCareerNoteId(id);
    try {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: note }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save note");
      }
      setCareerApps((prev) =>
        prev.map((app) => (app.id === id ? { ...app, adminNotes: note } : app))
      );
      setCareerSuccessMsg("Internal note saved.");
      setTimeout(() => setCareerSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(`Error saving note: ${err.message}`);
    } finally {
      setSavingCareerNoteId(null);
    }
  };

  const handleDeleteCareerApp = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the application for "${name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete application");
      }
      setCareerApps((prev) => prev.filter((app) => app.id !== id));
      setCareerSuccessMsg(`Application for "${name}" deleted.`);
      setTimeout(() => setCareerSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(`Error deleting application: ${err.message}`);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "new" | "read" | "archived") => {
    setBriefs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );

    try {
      await fetch(`/api/admin/briefs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchBriefs();
    }
  };

  const handleToggleTrustVisibility = async (enabled: boolean) => {
    if (!trustConfig) return;
    const updated = { ...trustConfig, enabled };
    setTrustConfig(updated);
    setTrustSuccessMsg(
      enabled
        ? "✓ Auto-saved: Section is now ENABLED and visible on homepage."
        : "✓ Auto-saved: Section is now DISABLED and removed from homepage."
    );

    try {
      const res = await fetch("/api/admin/content/trust", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setTrustConfig(data.data);
      }
    } catch (err) {
      console.error("Failed to toggle trust visibility:", err);
    }
  };

  const handleSaveTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trustConfig) return;
    setSavingTrust(true);
    setTrustSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/content/trust", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trustConfig),
      });
      const data = await res.json();
      if (data.success) {
        setTrustConfig(data.data);
        setTrustSuccessMsg("✓ All Trust section settings saved successfully! Live on website.");
        setTimeout(() => setTrustSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error("Failed to save trust config:", err);
    } finally {
      setSavingTrust(false);
    }
  };

  const handleAddSlot = () => {
    if (!trustConfig) return;
    const newSlot: TrustSlot = {
      id: `slot_${Date.now()}`,
      label: "New Company",
      isHighlighted: false,
    };
    setTrustConfig({
      ...trustConfig,
      slots: [...trustConfig.slots, newSlot],
    });
  };

  const handleRemoveSlot = (id: string) => {
    if (!trustConfig) return;
    setTrustConfig({
      ...trustConfig,
      slots: trustConfig.slots.filter((s) => s.id !== id),
    });
  };

  const handleSlotLabelChange = (id: string, label: string) => {
    if (!trustConfig) return;
    setTrustConfig({
      ...trustConfig,
      slots: trustConfig.slots.map((s) => (s.id === id ? { ...s, label } : s)),
    });
  };

  const handleSlotHighlightToggle = (id: string) => {
    if (!trustConfig) return;
    setTrustConfig({
      ...trustConfig,
      slots: trustConfig.slots.map((s) =>
        s.id === id ? { ...s, isHighlighted: !s.isHighlighted } : s
      ),
    });
  };

  const handleInviteDev = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvitingDev(true);
    try {
      const res = await fetch("/api/admin/developers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: devName, email: devEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setDevInviteResult(data.inviteUrl);
        setDevName("");
        setDevEmail("");
        fetchDevelopers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInvitingDev(false);
    }
  };

  // Showcase Project Management
  const openNewProjectModal = () => {
    setProjectForm({
      name: "",
      category: "product",
      oneLiner: "",
      homepageOneLiner: "",
      result: "",
      tags: [],
      status: undefined,
      featured: true,
      mobilePreview: "",
    });
    setTagsInput("");
    setIsCreatingProject(true);
    setEditingProject(null);
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setProjectForm({ ...project });
    setTagsInput(project.tags.join(", "));
    setIsCreatingProject(false);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = { ...projectForm, tags };

    try {
      if (isCreatingProject) {
        const res = await fetch("/api/admin/content/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProjectsList((prev) => [...prev, data.data]);
          setIsCreatingProject(false);
        }
      } else if (editingProject) {
        const res = await fetch(`/api/admin/content/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProjectsList((prev) =>
            prev.map((p) => (p.id === editingProject.id ? data.data : p))
          );
          setEditingProject(null);
        }
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/content/projects/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProjectsList((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    const newFeatured = !project.featured;
    setProjectsList((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, featured: newFeatured } : p))
    );

    try {
      await fetch(`/api/admin/content/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeatured }),
      });
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  // Studio Team Handlers
  const handleOpenCreateTeamMember = () => {
    setEditingTeamMember(null);
    setTeamForm({
      name: "",
      role: "Developer",
      avatar: "",
      bio: "",
      displayOrder: (teamMembers.length || 0) + 1,
    });
    setTeamError(null);
    setShowTeamModal(true);
  };

  const handleOpenEditTeamMember = (member: TeamMemberRecord) => {
    setEditingTeamMember(member);
    setTeamForm({
      name: member.name,
      role: member.role,
      avatar: member.avatar,
      bio: member.bio,
      displayOrder: member.displayOrder,
    });
    setTeamError(null);
    setShowTeamModal(true);
  };

  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTeamMember(true);
    setTeamError(null);
    setTeamSuccessMsg(null);

    try {
      const url = editingTeamMember
        ? `/api/admin/team/${editingTeamMember.id}`
        : "/api/admin/team";
      const method = editingTeamMember ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamForm.name,
          role: teamForm.role,
          avatar: teamForm.avatar || teamForm.name.charAt(0).toUpperCase(),
          bio: teamForm.bio,
          displayOrder: Number(teamForm.displayOrder),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save team member");
      }

      setShowTeamModal(false);
      setTeamSuccessMsg(
        editingTeamMember
          ? `✓ Updated ${teamForm.name}. Changes are live on /about.`
          : `✓ Added ${teamForm.name}. Changes are live on /about.`
      );
      setTimeout(() => setTeamSuccessMsg(null), 5000);
      await fetchTeamMembers();
    } catch (err: any) {
      setTeamError(err.message || "An error occurred");
    } finally {
      setSavingTeamMember(false);
    }
  };

  const handleDeleteTeamMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the public team roster?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete team member");
      }
      setTeamSuccessMsg(`✓ Removed ${name} from team roster.`);
      setTimeout(() => setTeamSuccessMsg(null), 5000);
      await fetchTeamMembers();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  };

  const totalBriefs = briefs.length;
  const newBriefs = briefs.filter((b) => b.status === "new").length;
  const readBriefs = briefs.filter((b) => b.status === "read").length;
  const convertedBriefs = briefs.filter((b) => b.status === "converted").length;

  const totalCareers = careerApps.length;
  const newCareers = careerApps.filter((a) => a.status === "new").length;

  return (
    <>
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        badgeCounts={{
          newBriefs,
          totalBriefs,
          newCareers,
          totalCareers,
          totalQuotes: quotationsList.length,
        }}
      />

      <div className="admin-wrap">
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1 className="admin-title" style={{ margin: 0 }}>
              Kiln <span>Admin Studio</span>
            </h1>
            <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              Client Portal Hub, Engineering Roster &amp; Live Site CMS
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Link
              href="/"
              target="_blank"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11.5px",
                color: "var(--muted)",
                padding: "6px 12px",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                background: "var(--card)",
                textDecoration: "none",
              }}
            >
              Public Site ↗
            </Link>
          </div>
        </div>

        {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px", borderBottom: "1px solid var(--line)", paddingBottom: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setActiveTab("briefs")}
          className={`chip ${activeTab === "briefs" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>📥 Inbound Briefs</span>
          {newBriefs > 0 && (
            <span style={{ background: "#c93b2b", color: "#fff", padding: "1px 7px", borderRadius: "999px", fontSize: "10px" }}>
              {newBriefs}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("portalProjects")}
          className={`chip ${activeTab === "portalProjects" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>🚀 Active Client Builds</span>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ({portalProjects.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("developers")}
          className={`chip ${activeTab === "developers" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>👥 Engineering Team</span>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ({developers.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("trust")}
          className={`chip ${activeTab === "trust" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>🏢 Trust CMS</span>
          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: trustConfig?.enabled ? "var(--accent-soft)" : "#eae7dd", color: trustConfig?.enabled ? "var(--accent)" : "var(--muted)" }}>
            {trustConfig?.enabled ? "LIVE" : "OFF"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`chip ${activeTab === "team" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>👥 Studio Team (About)</span>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ({teamMembers.length})
          </span>
        </button>

        <Link
          href="/admin/case-studies"
          className="chip"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
        >
          <span>🎨 Case Studies</span>
          <span style={{ fontSize: "11px", color: "var(--accent)" }}>
            ↗
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setActiveTab("careers")}
          className={`chip ${activeTab === "careers" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>💼 Careers & Talent</span>
          {newCareers > 0 ? (
            <span style={{ background: "#c93b2b", color: "#fff", padding: "1px 7px", borderRadius: "999px", fontSize: "10px" }}>
              {newCareers}
            </span>
          ) : (
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
              ({careerApps.length})
            </span>
          )}
        </button>

        <Link
          href="/admin/team"
          className="chip"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
          title="Open Dedicated Team CMS Page"
        >
          <span>Team Studio Page</span>
          <span style={{ fontSize: "11px", color: "var(--accent)" }}>
            ↗
          </span>
        </Link>

        <Link
          href="/admin/careers"
          className="chip"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
          title="Open Dedicated Careers Management Page"
        >
          <span>Careers Studio</span>
          <span style={{ fontSize: "11px", color: "var(--accent)" }}>
            ↗
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setActiveTab("quotations")}
          className={`chip ${activeTab === "quotations" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>🧮 Quotes &amp; Estimator</span>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ({quotationsList.length})
          </span>
        </button>

        <Link
          href="/admin/quotations"
          className="chip"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
          title="Open Dedicated Quotations & Indian Market Price Estimator"
        >
          <span>Quotations Studio</span>
          <span style={{ fontSize: "11px", color: "var(--accent)" }}>
            ↗
          </span>
        </Link>
      </div>

      {/* ================= TAB 1: INBOUND BRIEFS ================= */}
      {activeTab === "briefs" && (
        <div>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total Submissions</div>
              <div className="admin-stat-val">{totalBriefs}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">New / Unreviewed</div>
              <div className="admin-stat-val" style={{ color: "#c93b2b" }}>
                {newBriefs}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Converted to Builds</div>
              <div className="admin-stat-val" style={{ color: "var(--accent)" }}>
                {convertedBriefs}
              </div>
            </div>
          </div>

          {loadingBriefs ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading briefs...
            </div>
          ) : briefs.length === 0 ? (
            <div
              style={{
                background: "var(--card)",
                padding: "48px 24px",
                textAlign: "center",
                borderRadius: "14px",
                border: "1px solid var(--line)",
              }}
            >
              <p style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)" }}>
                No briefs submitted yet.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Budget</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {briefs.map((brief) => {
                    const isExpanded = expandedId === brief.id;
                    const formattedDate = new Date(brief.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={brief.id}>
                        <td>
                          <span
                            className={`admin-status-badge ${brief.status}`}
                            style={{
                              background:
                                brief.status === "converted"
                                  ? "var(--accent-soft)"
                                  : brief.status === "call_scheduled"
                                  ? "#e0e7ff"
                                  : brief.status === "call_completed"
                                  ? "#fef3c7"
                                  : brief.status === "new"
                                  ? "#fde8e4"
                                  : "#eae7dd",
                              color:
                                brief.status === "converted"
                                  ? "var(--accent)"
                                  : brief.status === "call_scheduled"
                                  ? "#3730a3"
                                  : brief.status === "call_completed"
                                  ? "#92400e"
                                  : brief.status === "new"
                                  ? "#c93b2b"
                                  : "var(--muted)",
                            }}
                          >
                            {brief.status.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {formattedDate}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                          {brief.name}
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <a
                              href={`mailto:${brief.email}?subject=Re:%20Kiln%20Project%20Brief`}
                              style={{ color: "var(--accent)", textDecoration: "underline", fontSize: "13px" }}
                            >
                              {brief.email}
                            </a>
                            {brief.phone && (
                              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                                📞 {brief.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                            {brief.projectType}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                            {brief.budget || "—"}
                          </span>
                        </td>
                        <td style={{ maxWidth: "260px" }}>
                          <div
                            onClick={() => setExpandedId(isExpanded ? null : brief.id)}
                            style={{ cursor: "pointer", color: "var(--ink)", lineHeight: 1.5 }}
                          >
                            {isExpanded ? (
                              <div style={{ whiteSpace: "pre-wrap", background: "var(--bg)", padding: "10px", borderRadius: "6px", border: "1px solid var(--line)" }}>
                                {brief.description}
                              </div>
                            ) : (
                              <div>
                                {brief.description.length > 60
                                  ? `${brief.description.slice(0, 60)}...`
                                  : brief.description}
                                <span style={{ marginLeft: "4px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)" }}>
                                  [expand]
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <Link
                              href={`/admin/briefs/${brief.id}`}
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "11px",
                                padding: "4px 10px",
                                border: brief.status === "converted" ? "1px solid var(--line)" : "1px solid var(--accent)",
                                background: brief.status === "converted" ? "none" : "var(--accent-soft)",
                                color: brief.status === "converted" ? "var(--ink)" : "var(--accent)",
                                borderRadius: "4px",
                                textDecoration: "none",
                                fontWeight: 500,
                              }}
                            >
                              {brief.status === "converted"
                                ? "View Project →"
                                : brief.status === "call_scheduled"
                                ? "📅 Call Booked"
                                : "Review & Meet →"}
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleCreateQuotationForBrief(brief)}
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "11px",
                                padding: "4px 8px",
                                border: "1px solid var(--line)",
                                background: "#fff",
                                color: "var(--ink)",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                              title="Draft formal quotation for this client"
                            >
                              📜 Quote
                            </button>

                            {brief.status === "new" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(brief.id, "read")}
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "11px",
                                  padding: "4px 8px",
                                  border: "1px solid var(--line)",
                                  background: "none",
                                  color: "var(--muted)",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: ACTIVE CLIENT BUILDS ================= */}
      {activeTab === "portalProjects" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)" }}>
                Active Client Builds ({portalProjects.length})
              </h2>
              <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
                Live project portals accessed by clients and assigned engineering teams.
              </p>
            </div>
          </div>

          {loadingPortalProjects ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading active builds…
            </div>
          ) : portalProjects.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Current Phase</th>
                    <th>Status</th>
                    <th>Assigned Devs</th>
                    <th>Tickets</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portalProjects.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {p.name}
                      </td>
                      <td>
                        <div style={{ fontSize: "13px" }}>{p.client.name}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>{p.client.email}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "10.5px",
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            fontWeight: 600,
                          }}
                        >
                          {p.phase}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11px" }}>
                          ● {p.status}
                        </span>
                      </td>
                      <td>
                        {p.developers.length > 0 ? (
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {p.developers.map((d) => (
                              <span key={d.developer.id} style={{ fontFamily: "var(--mono)", fontSize: "11px", background: "rgba(23, 21, 15, 0.04)", padding: "2px 6px", borderRadius: "4px" }}>
                                {d.developer.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#c93b2b", fontSize: "11px", fontFamily: "var(--mono)" }}>No devs assigned</span>
                        )}
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                        {p._count.tickets} tickets
                      </td>
                      <td>
                        <Link
                          href={`/admin/projects/${p.id}`}
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            padding: "4px 10px",
                            border: "1px solid var(--line)",
                            borderRadius: "4px",
                            textDecoration: "none",
                            color: "var(--ink)",
                          }}
                        >
                          Manage Build →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ background: "var(--card)", padding: "40px", textAlign: "center", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <p style={{ color: "var(--muted)" }}>No active client builds yet. Convert an inbound brief above to create one.</p>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: DEVELOPERS ROSTER ================= */}
      {activeTab === "developers" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)" }}>
                Engineering Team ({developers.length})
              </h2>
              <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
                Developers assigned to client builds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowInviteDevModal(true);
                setDevInviteResult(null);
              }}
              className="btn-primary"
              style={{ fontSize: "12px" }}
            >
              + Invite Developer
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Active Builds</th>
                </tr>
              </thead>
              <tbody>
                {developers.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600, color: "var(--ink)" }}>{d.name}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>{d.email}</td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10.5px",
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: d.hasPassword ? "var(--accent-soft)" : "#fef3c7",
                          color: d.hasPassword ? "var(--accent)" : "#92400e",
                        }}
                      >
                        {d.hasPassword ? "Active" : "Invite Pending"}
                      </span>
                    </td>
                    <td>
                      {d.activeProjects.length > 0 ? (
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {d.activeProjects.map((p) => (
                            <Link
                              key={p.id}
                              href={`/admin/projects/${p.id}`}
                              style={{ fontFamily: "var(--mono)", fontSize: "11px", background: "rgba(23, 21, 15, 0.04)", padding: "2px 6px", borderRadius: "4px", textDecoration: "none", color: "var(--ink)" }}
                            >
                              {p.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: "11px" }}>None assigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Dev Invite Modal */}
          {showInviteDevModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(23, 21, 15, 0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 200,
                padding: "20px",
              }}
            >
              <div
                style={{
                  background: "var(--card)",
                  borderRadius: "18px",
                  padding: "32px",
                  width: "100%",
                  maxWidth: "480px",
                  boxShadow: "var(--shadow)",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)" }}>
                    Invite Developer
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowInviteDevModal(false)}
                    style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--muted)" }}
                  >
                    ✕
                  </button>
                </div>

                {devInviteResult ? (
                  <div>
                    <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
                      <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: "4px" }}>
                        ✓ Developer Invited!
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.4 }}>
                        Single-use onboarding link generated:
                      </p>
                      <div style={{ marginTop: "8px" }}>
                        <a href={devInviteResult} style={{ fontSize: "12px", color: "var(--accent)", wordBreak: "break-all" }}>
                          {devInviteResult}
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowInviteDevModal(false)}
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInviteDev}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Developer Name"
                        value={devName}
                        onChange={(e) => setDevName(e.target.value)}
                        style={{ width: "100%", border: "none", borderBottom: "1px solid var(--line)", background: "none", padding: "8px 0", outline: "none" }}
                      />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="dev@kiln.design"
                        value={devEmail}
                        onChange={(e) => setDevEmail(e.target.value)}
                        style={{ width: "100%", border: "none", borderBottom: "1px solid var(--line)", background: "none", padding: "8px 0", outline: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => setShowInviteDevModal(false)}
                        style={{ fontFamily: "var(--mono)", fontSize: "12px", padding: "8px 16px", border: "1px solid var(--line)", background: "none", borderRadius: "999px" }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary" disabled={invitingDev} style={{ fontSize: "12px" }}>
                        {invitingDev ? "Sending…" : "Send Invite →"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: TRUST / COMPANY SECTION ================= */}
      {activeTab === "trust" && (
        <div style={{ background: "var(--card)", padding: "32px", borderRadius: "16px", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          {loadingTrust || !trustConfig ? (
            <div style={{ padding: "30px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading trust section settings...
            </div>
          ) : (
            <form onSubmit={handleSaveTrust}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "24px", borderBottom: "1px solid var(--line)", marginBottom: "28px" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)" }}>
                    &quot;Who we&apos;ve worked with&quot; Section Visibility
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
                    Toggle this OFF to completely remove the trust &amp; company logo section from the homepage.
                  </p>
                </div>

                <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", gap: "12px", background: trustConfig.enabled ? "var(--accent-soft)" : "#eae7dd", padding: "10px 18px", borderRadius: "999px", border: `1px solid ${trustConfig.enabled ? "var(--accent)" : "var(--line)"}` }}>
                  <input
                    type="checkbox"
                    checked={trustConfig.enabled}
                    onChange={(e) => handleToggleTrustVisibility(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: "var(--accent)", cursor: "pointer" }}
                  />
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: "13px", color: trustConfig.enabled ? "var(--accent)" : "var(--muted)" }}>
                    {trustConfig.enabled ? "VISIBLE ON HOMEPAGE" : "DISABLED (HIDDEN)"}
                  </span>
                </label>
              </div>

              <div style={{ display: "grid", gap: "20px", marginBottom: "32px" }}>
                <div className="field">
                  <label>Section Eyebrow Label</label>
                  <input
                    type="text"
                    value={trustConfig.eyebrow}
                    onChange={(e) =>
                      setTrustConfig({ ...trustConfig, eyebrow: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>Main Headline</label>
                  <input
                    type="text"
                    value={trustConfig.heading}
                    onChange={(e) =>
                      setTrustConfig({ ...trustConfig, heading: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>Description Paragraph</label>
                  <textarea
                    rows={3}
                    value={trustConfig.description}
                    onChange={(e) =>
                      setTrustConfig({ ...trustConfig, description: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--display)", fontSize: "20px" }}>
                      Company &amp; Client Slots ({trustConfig.slots.length})
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                      Add client names, partners, or placeholder slots. Use line breaks for multiple lines.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "12px",
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent)",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Slot
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                  {trustConfig.slots.map((slot, index) => (
                    <div
                      key={slot.id}
                      style={{
                        background: slot.isHighlighted ? "var(--accent-soft)" : "var(--bg)",
                        border: `1.5px ${slot.isHighlighted ? "solid var(--accent)" : "dashed var(--line)"}`,
                        borderRadius: "12px",
                        padding: "16px",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                          Slot #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slot.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#c93b2b",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          ✕ Delete
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={slot.label}
                        onChange={(e) => handleSlotLabelChange(slot.id, e.target.value)}
                        placeholder="Company name or '—'"
                        style={{
                          width: "100%",
                          fontSize: "13px",
                          fontFamily: "var(--mono)",
                          textAlign: "center",
                          padding: "8px",
                          border: "1px solid var(--line)",
                          borderRadius: "6px",
                          background: "var(--card)",
                        }}
                      />

                      <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={!!slot.isHighlighted}
                          onChange={() => handleSlotHighlightToggle(slot.id)}
                          style={{ accentColor: "var(--accent)" }}
                        />
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--ink)" }}>
                          Accent Highlight Border
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {trustSuccessMsg && (
                <div style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--accent)", marginBottom: "16px", background: "var(--accent-soft)", padding: "10px 14px", borderRadius: "6px" }}>
                  ✓ {trustSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={savingTrust}
              >
                {savingTrust ? "Saving Changes..." : "Save Trust Section Changes →"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ================= TAB 5: SHOWCASE PROJECTS CMS ================= */}
      {activeTab === "projects" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", color: "var(--ink)" }}>
                Showcase Portfolio Archive
              </h2>
              <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "2px" }}>
                Manage public case studies shown on the homepage and `/work` page.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewProjectModal}
              className="btn-primary"
            >
              + Add Showcase Project
            </button>
          </div>

          {loadingProjects ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading showcase projects...
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Idx</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Metric / Result</th>
                    <th>Tags</th>
                    <th>Homepage</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projectsList.map((project) => (
                    <tr key={project.id}>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>
                        {project.idx}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {project.name}
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11.5px", textTransform: "uppercase", color: "var(--accent)" }}>
                          {project.category}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "12.5px", color: "var(--accent)" }}>
                        {project.result}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "220px" }}>
                          {project.tags.map((t) => (
                            <span key={t} className="tag" style={{ fontSize: "10px", padding: "2px 6px" }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(project)}
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            border: `1px solid ${project.featured ? "var(--accent)" : "var(--line)"}`,
                            background: project.featured ? "var(--accent-soft)" : "none",
                            color: project.featured ? "var(--accent)" : "var(--muted)",
                            cursor: "pointer",
                          }}
                        >
                          {project.featured ? "★ Featured" : "☆ Archive Only"}
                        </button>
                      </td>
                      <td>
                        {project.status === "in-progress" ? (
                          <span className="status-pill">In Progress</span>
                        ) : (
                          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                            Shipped
                          </span>
                        )}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => openEditProjectModal(project)}
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "11px",
                              padding: "4px 8px",
                              border: "1px solid var(--line)",
                              borderRadius: "4px",
                              background: "none",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id, project.name)}
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "11px",
                              padding: "4px 8px",
                              border: "1px solid #c93b2b",
                              borderRadius: "4px",
                              background: "none",
                              color: "#c93b2b",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Project Form Modal */}
          {(isCreatingProject || editingProject) && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(23, 21, 15, 0.6)",
                zIndex: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  background: "var(--card)",
                  width: "100%",
                  maxWidth: "600px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  padding: "32px",
                  borderRadius: "18px",
                  boxShadow: "var(--shadow)",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: "24px" }}>
                    {isCreatingProject ? "Add New Project" : `Edit ${editingProject?.name}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingProject(false);
                      setEditingProject(null);
                    }}
                    style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveProject} style={{ display: "grid", gap: "16px" }}>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="field">
                      <label>Project Name</label>
                      <input
                        type="text"
                        value={projectForm.name || ""}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, name: e.target.value })
                        }
                        placeholder="e.g. TradeSage"
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Category</label>
                      <select
                        value={projectForm.category || "product"}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            category: e.target.value as ProjectCategory,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px 0",
                          border: "none",
                          borderBottom: "1px solid var(--line)",
                          background: "none",
                          fontFamily: "var(--body)",
                          fontSize: "15px",
                        }}
                      >
                        <option value="product">Product</option>
                        <option value="trading">Trading &amp; fintech</option>
                        <option value="insurtech">Insurtech</option>
                        <option value="in-progress">In progress</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="field">
                      <label>Result / Metric Pill</label>
                      <input
                        type="text"
                        value={projectForm.result || ""}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, result: e.target.value })
                        }
                        placeholder="e.g. 60.5% win rate, Top 60 nationally"
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Tags (Comma separated)</label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Next.js, Python, Supabase"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Full Archive One-Liner</label>
                    <textarea
                      rows={2}
                      value={projectForm.oneLiner || ""}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, oneLiner: e.target.value })
                      }
                      placeholder="An algorithmic trading system for the Indian equity market..."
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Homepage Punchy One-Liner (Optional)</label>
                    <input
                      type="text"
                      value={projectForm.homepageOneLiner || ""}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, homepageOneLiner: e.target.value })
                      }
                      placeholder="Taught a model to trade the Indian market..."
                    />
                  </div>

                  <div className="field">
                    <label>Mobile Tap Preview Note</label>
                    <input
                      type="text"
                      value={projectForm.mobilePreview || ""}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, mobilePreview: e.target.value })
                      }
                      placeholder="1,000+ daily active users · Next.js + Supabase"
                    />
                  </div>

                  <div style={{ display: "flex", gap: "20px", margin: "6px 0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!projectForm.featured}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, featured: e.target.checked })
                        }
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                        Feature on Homepage (Top 3)
                      </span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={projectForm.status === "in-progress"}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            status: e.target.checked ? "in-progress" : undefined,
                          })
                        }
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                        &quot;In Progress&quot; Badge
                      </span>
                    </label>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingProject(false);
                        setEditingProject(null);
                      }}
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "12px",
                        padding: "10px 18px",
                        border: "1px solid var(--line)",
                        background: "none",
                        borderRadius: "999px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {isCreatingProject ? "Create Project →" : "Save Project Changes →"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: STUDIO TEAM CMS ================= */}
      {activeTab === "team" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--display)",
                  fontSize: "26px",
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                Studio Team Roster ({teamMembers.length})
              </h2>
              <p style={{ fontSize: "13.5px", color: "var(--muted)", marginTop: "4px" }}>
                Add, edit, and remove team members shown in &quot;Who&apos;s building this&quot; on the public{" "}
                <Link href="/about" target="_blank" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                  /about
                </Link>{" "}
                page.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Link
                href="/admin/team"
                className="chip"
                style={{ fontSize: "12px", textDecoration: "none" }}
              >
                Open Full Studio View ↗
              </Link>
              <button
                type="button"
                onClick={handleOpenCreateTeamMember}
                className="btn-primary"
                style={{ fontSize: "12px" }}
              >
                + Add Team Member
              </button>
            </div>
          </div>

          {teamSuccessMsg && (
            <div
              style={{
                background: "#edf7ed",
                color: "#2e7d32",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "13px",
                fontFamily: "var(--mono)",
              }}
            >
              {teamSuccessMsg}
            </div>
          )}

          {teamError && (
            <div
              style={{
                background: "#fde8e8",
                color: "#c93b2b",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "13px",
                fontFamily: "var(--mono)",
              }}
            >
              {teamError}
            </div>
          )}

          {loadingTeam ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)" }}>
              Loading team roster…
            </div>
          ) : teamMembers.length === 0 ? (
            <div
              style={{
                background: "var(--card)",
                padding: "48px 24px",
                textAlign: "center",
                borderRadius: "14px",
                border: "1px solid var(--line)",
              }}
            >
              <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
                No studio team members currently configured.
              </p>
              <button type="button" onClick={handleOpenCreateTeamMember} className="btn-primary">
                + Add Your First Team Member
              </button>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>Order</th>
                    <th style={{ width: "60px" }}>Avatar</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Bio</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id}>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
                        #{member.displayOrder}
                      </td>
                      <td>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--display)",
                            fontSize: "16px",
                            fontWeight: 600,
                          }}
                        >
                          {member.avatar}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: "15px" }}>
                          {member.name}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--mono)",
                            background: "var(--line)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            color: "var(--ink)",
                          }}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td>
                        <p
                          style={{
                            fontSize: "12.5px",
                            color: "var(--muted)",
                            maxWidth: "420px",
                            lineHeight: 1.4,
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {member.bio}
                        </p>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditTeamMember(member)}
                            className="chip"
                            style={{ fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeamMember(member.id, member.name)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#c93b2b",
                              cursor: "pointer",
                              fontSize: "11px",
                              padding: "4px 8px",
                              fontFamily: "var(--mono)",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add / Edit Team Member Modal */}
          {showTeamModal && (
            <div
              className="case-study-backdrop"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowTeamModal(false);
              }}
            >
              <div className="case-study-modal" style={{ maxWidth: "560px" }}>
                <button
                  type="button"
                  className="case-study-close-btn"
                  onClick={() => setShowTeamModal(false)}
                >
                  ✕
                </button>

                <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", marginBottom: "6px" }}>
                  {editingTeamMember ? `Edit ${editingTeamMember.name}` : "Add New Team Member"}
                </h2>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
                  Profile appears immediately on the <code>/about</code> page under &quot;Who&apos;s building this&quot;.
                </p>

                <form onSubmit={handleSaveTeamMember}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Deepak Kumar"
                        value={teamForm.name}
                        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                        Avatar Initial
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="Auto"
                        value={teamForm.avatar}
                        onChange={(e) => setTeamForm({ ...teamForm, avatar: e.target.value.toUpperCase() })}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", textAlign: "center" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                        Role / Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Project Manager, Developer"
                        value={teamForm.role}
                        onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={teamForm.displayOrder}
                        onChange={(e) => setTeamForm({ ...teamForm, displayOrder: parseInt(e.target.value, 10) || 1 })}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "11.5px", fontFamily: "var(--mono)", color: "var(--muted)", marginBottom: "4px" }}>
                      Short Bio / Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe background, focus areas, and role at Kiln..."
                      value={teamForm.bio}
                      onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--card)", fontSize: "14px", resize: "vertical", lineHeight: 1.5 }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setShowTeamModal(false)}
                      className="chip"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingTeamMember}
                      className="btn-primary"
                    >
                      {savingTeamMember ? "Saving…" : editingTeamMember ? "Update Member" : "Add Member"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 7: CAREERS & TALENT PIPELINE ================= */}
      {activeTab === "careers" && (
        <div>
          {careerSuccessMsg && (
            <div
              style={{
                padding: "10px 16px",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                borderRadius: "8px",
                fontFamily: "var(--mono)",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              ✓ {careerSuccessMsg}
            </div>
          )}

          {/* Stats Bar */}
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total Applications</div>
              <div className="admin-stat-val">{careerApps.length}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">New / Unreviewed</div>
              <div className="admin-stat-val" style={{ color: "#c93b2b" }}>
                {careerApps.filter((a) => a.status === "new").length}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Full-time Jobs</div>
              <div className="admin-stat-val" style={{ color: "var(--ink)" }}>
                {careerApps.filter((a) => a.type === "JOB").length}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Internships</div>
              <div className="admin-stat-val" style={{ color: "var(--accent)" }}>
                {careerApps.filter((a) => a.type === "INTERNSHIP").length}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Freelancers</div>
              <div className="admin-stat-val" style={{ color: "var(--muted)" }}>
                {careerApps.filter((a) => a.type === "FREELANCING").length}
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: "1 1 280px", minWidth: "260px" }}>
                <input
                  type="text"
                  placeholder="Search by name, email, role, skills, or location..."
                  value={careerSearch}
                  onChange={(e) => setCareerSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--bg)",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              {/* Type Filter Chips */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`chip ${careerFilterType === "ALL" ? "active" : ""}`}
                  onClick={() => setCareerFilterType("ALL")}
                >
                  All Types ({careerApps.length})
                </button>
                <button
                  type="button"
                  className={`chip ${careerFilterType === "JOB" ? "active" : ""}`}
                  onClick={() => setCareerFilterType("JOB")}
                >
                  💼 Jobs ({careerApps.filter((a) => a.type === "JOB").length})
                </button>
                <button
                  type="button"
                  className={`chip ${careerFilterType === "INTERNSHIP" ? "active" : ""}`}
                  onClick={() => setCareerFilterType("INTERNSHIP")}
                >
                  🎓 Internships ({careerApps.filter((a) => a.type === "INTERNSHIP").length})
                </button>
                <button
                  type="button"
                  className={`chip ${careerFilterType === "FREELANCING" ? "active" : ""}`}
                  onClick={() => setCareerFilterType("FREELANCING")}
                >
                  ⚡ Freelancers ({careerApps.filter((a) => a.type === "FREELANCING").length})
                </button>
              </div>
            </div>

            {/* Status Filter Chips */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginRight: "6px" }}>
                Filter Status:
              </span>
              {["ALL", "new", "reviewing", "shortlisted", "interviewed", "hired", "rejected", "archived"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`chip ${careerFilterStatus === st ? "active" : ""}`}
                  style={{ fontSize: "11px", padding: "4px 10px" }}
                  onClick={() => setCareerFilterStatus(st)}
                >
                  {st === "ALL" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)} (
                  {st === "ALL" ? careerApps.length : careerApps.filter((a) => a.status === st).length})
                </button>
              ))}
            </div>
          </div>

          {/* Applications Content */}
          {loadingCareerApps ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
              Loading applications...
            </div>
          ) : (
            (() => {
              const filtered = careerApps.filter((app) => {
                if (careerFilterType !== "ALL" && app.type !== careerFilterType) return false;
                if (careerFilterStatus !== "ALL" && app.status !== careerFilterStatus) return false;
                if (careerSearch.trim()) {
                  const q = careerSearch.toLowerCase();
                  const matchName = app.name.toLowerCase().includes(q);
                  const matchEmail = app.email.toLowerCase().includes(q);
                  const matchRole = app.role.toLowerCase().includes(q);
                  const matchSkills = (app.skills || []).some((s) => s.toLowerCase().includes(q));
                  const matchLocation = (app.location || "").toLowerCase().includes(q);
                  if (!matchName && !matchEmail && !matchRole && !matchSkills && !matchLocation) {
                    return false;
                  }
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div
                    style={{
                      background: "var(--card)",
                      padding: "48px 24px",
                      textAlign: "center",
                      borderRadius: "14px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <p style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)", marginBottom: "8px" }}>
                      No applications found.
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                      {careerApps.length === 0
                        ? "No candidates have submitted an application yet."
                        : "Try clearing your search query or filters."}
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {filtered.map((app) => {
                    const isExpanded = expandedCareerId === app.id;
                    const dateStr = new Date(app.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={app.id}
                        style={{
                          background: "var(--card)",
                          border: isExpanded ? "1px solid var(--accent)" : "1px solid var(--line)",
                          borderRadius: "14px",
                          padding: "20px 24px",
                          transition: "all .2s ease",
                          boxShadow: isExpanded ? "var(--shadow-sm)" : "none",
                        }}
                      >
                        {/* Header Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                            <div
                              style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "10px",
                                background:
                                  app.type === "JOB"
                                    ? "#e0e7ff"
                                    : app.type === "INTERNSHIP"
                                    ? "var(--accent-soft)"
                                    : "#fef3c7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                                flexShrink: 0,
                              }}
                            >
                              {app.type === "JOB" ? "💼" : app.type === "INTERNSHIP" ? "🎓" : "⚡"}
                            </div>

                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 500, color: "var(--ink)", margin: 0 }}>
                                  {app.name}
                                </h3>
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "10px",
                                    textTransform: "uppercase",
                                    letterSpacing: ".04em",
                                    padding: "2px 8px",
                                    borderRadius: "999px",
                                    background:
                                      app.type === "JOB"
                                        ? "#e0e7ff"
                                        : app.type === "INTERNSHIP"
                                        ? "var(--accent-soft)"
                                        : "#fef3c7",
                                    color:
                                      app.type === "JOB"
                                        ? "#3730a3"
                                        : app.type === "INTERNSHIP"
                                        ? "var(--accent)"
                                        : "#92400e",
                                    fontWeight: 600,
                                  }}
                                >
                                  {app.type === "JOB" ? "Job" : app.type === "INTERNSHIP" ? "Internship" : "Freelance"}
                                </span>
                                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>
                                  — {app.role}
                                </span>
                              </div>

                              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "6px", fontSize: "12.5px", color: "var(--muted)", fontFamily: "var(--mono)" }}>
                                <a href={`mailto:${app.email}`} style={{ color: "var(--accent)", textDecoration: "underline" }}>
                                  ✉ {app.email}
                                </a>
                                {app.phone && (
                                  <a href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
                                    📞 {app.phone}
                                  </a>
                                )}
                                {app.location && <span>📍 {app.location}</span>}
                                <span>🕒 {dateStr}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status and Expand */}
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <select
                              value={app.status}
                              onChange={(e) => handleCareerStatusChange(app.id, e.target.value)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--line)",
                                background:
                                  app.status === "new"
                                    ? "#fde8e4"
                                    : app.status === "shortlisted" || app.status === "hired"
                                    ? "var(--accent-soft)"
                                    : "#eae7dd",
                                color:
                                  app.status === "new"
                                    ? "#c93b2b"
                                    : app.status === "shortlisted" || app.status === "hired"
                                    ? "var(--accent)"
                                    : "var(--muted)",
                                fontFamily: "var(--mono)",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <option value="new">New</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interviewed">Interviewed</option>
                              <option value="hired">Hired</option>
                              <option value="rejected">Rejected</option>
                              <option value="archived">Archived</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => setExpandedCareerId(isExpanded ? null : app.id)}
                              className="chip"
                              style={{ fontSize: "11px", padding: "6px 12px" }}
                            >
                              {isExpanded ? "Collapse ▲" : "View Details ▼"}
                            </button>
                          </div>
                        </div>

                        {/* Quick Spec & Links Strip */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                            marginTop: "14px",
                            paddingTop: "12px",
                            borderTop: "1px solid var(--line)",
                          }}
                        >
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12.5px" }}>
                            {app.experience && (
                              <div>
                                <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "11px" }}>Exp: </span>
                                <strong>{app.experience}</strong>
                              </div>
                            )}
                            {app.rateOrSalary && (
                              <div>
                                <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "11px" }}>Comp: </span>
                                <strong>{app.rateOrSalary}</strong>
                              </div>
                            )}
                            {app.availability && (
                              <div>
                                <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "11px" }}>Availability: </span>
                                <strong>{app.availability}</strong>
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                            {app.resumeUrl && (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-primary"
                                style={{
                                  fontSize: "11.5px",
                                  padding: "6px 14px",
                                  background: "var(--accent)",
                                  color: "#fff",
                                }}
                              >
                                📄 Open Resume ↗
                              </a>
                            )}
                            {app.portfolioUrl && (
                              <a
                                href={app.portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="chip"
                                style={{ fontSize: "11px", padding: "5px 10px" }}
                              >
                                Portfolio ↗
                              </a>
                            )}
                            {app.githubUrl && (
                              <a
                                href={app.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="chip"
                                style={{ fontSize: "11px", padding: "5px 10px" }}
                              >
                                GitHub ↗
                              </a>
                            )}
                            {app.linkedinUrl && (
                              <a
                                href={app.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="chip"
                                style={{ fontSize: "11px", padding: "5px 10px" }}
                              >
                                LinkedIn ↗
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Expanded View */}
                        {isExpanded && (
                          <div
                            style={{
                              marginTop: "18px",
                              paddingTop: "18px",
                              borderTop: "1px dashed var(--line)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "18px",
                            }}
                          >
                            {app.skills && app.skills.length > 0 && (
                              <div>
                                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                                  Skills &amp; Technologies
                                </div>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                  {app.skills.map((skill, sIdx) => (
                                    <span
                                      key={sIdx}
                                      style={{
                                        fontFamily: "var(--mono)",
                                        fontSize: "11px",
                                        background: "var(--accent-soft)",
                                        color: "var(--accent)",
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {app.metadata && Object.keys(app.metadata).length > 0 && (
                              <div
                                style={{
                                  background: "var(--bg)",
                                  padding: "14px 18px",
                                  borderRadius: "10px",
                                  border: "1px solid var(--line)",
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                  gap: "12px",
                                }}
                              >
                                {app.metadata.collegeName && (
                                  <div>
                                    <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>University / College</div>
                                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.collegeName}</div>
                                  </div>
                                )}
                                {app.metadata.degreeMajor && (
                                  <div>
                                    <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Degree &amp; Major</div>
                                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.degreeMajor}</div>
                                  </div>
                                )}
                                {app.metadata.currentCompany && (
                                  <div>
                                    <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Current Employer</div>
                                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.currentCompany}</div>
                                  </div>
                                )}
                                {app.metadata.expectedCtc && (
                                  <div>
                                    <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Expected CTC</div>
                                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.expectedCtc}</div>
                                  </div>
                                )}
                                {app.metadata.noticePeriod && (
                                  <div>
                                    <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Notice Period</div>
                                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.noticePeriod}</div>
                                  </div>
                                )}
                                {app.metadata.hourlyRate && (
                                  <div>
                                    <div style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--muted)" }}>Freelance Rate</div>
                                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{app.metadata.hourlyRate}</div>
                                  </div>
                                )}
                              </div>
                            )}

                            <div>
                              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                                Application Pitch &amp; Detailed Responses
                              </div>
                              <div
                                style={{
                                  background: "var(--bg)",
                                  padding: "14px 18px",
                                  borderRadius: "10px",
                                  border: "1px solid var(--line)",
                                  fontSize: "13.5px",
                                  lineHeight: 1.6,
                                  color: "var(--ink)",
                                  whiteSpace: "pre-line",
                                }}
                              >
                                {app.coverNote}
                              </div>
                            </div>

                            {/* Internal Notes */}
                            <div>
                              <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                                Internal Evaluation Notes
                              </div>
                              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                <textarea
                                  rows={2}
                                  placeholder="Add evaluation remarks, interview impressions, or next steps..."
                                  value={careerNotes[app.id] !== undefined ? careerNotes[app.id] : app.adminNotes || ""}
                                  onChange={(e) =>
                                    setCareerNotes({ ...careerNotes, [app.id]: e.target.value })
                                  }
                                  style={{
                                    flex: 1,
                                    padding: "10px 12px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--line)",
                                    background: "var(--card)",
                                    fontSize: "13px",
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn-primary"
                                  disabled={savingCareerNoteId === app.id}
                                  onClick={() => handleSaveCareerNote(app.id)}
                                  style={{ fontSize: "12px", padding: "10px 16px" }}
                                >
                                  {savingCareerNoteId === app.id ? "Saving..." : "Save Note"}
                                </button>
                              </div>
                            </div>

                            {/* Delete */}
                            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10px", borderTop: "1px solid var(--line)" }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteCareerApp(app.id, app.name)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#c93b2b",
                                  fontSize: "12px",
                                  fontFamily: "var(--mono)",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                              >
                                🗑 Permanently Delete Application
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ================= TAB: QUOTATIONS & PRICE ESTIMATOR ================= */}
      {activeTab === "quotations" && (
        <div>
          {/* Sub-tab Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              paddingBottom: "14px",
              borderBottom: "1px solid var(--line)",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className={`chip ${quoteSubTab === "estimator" ? "active" : ""}`}
                onClick={() => setQuoteSubTab("estimator")}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>🧮 Project Price Estimator</span>
                <span
                  style={{
                    fontSize: "10.5px",
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                  }}
                >
                  India Market Formula
                </span>
              </button>

              <button
                type="button"
                className={`chip ${quoteSubTab === "hub" ? "active" : ""}`}
                onClick={() => setQuoteSubTab("hub")}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>📜 Quotations &amp; Mail Dispatch</span>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  ({quotationsList.length})
                </span>
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                href="/admin/quotations"
                className="chip"
                style={{ textDecoration: "none", fontSize: "12px" }}
                title="Open dedicated full-screen quotations hub"
              >
                Open Studio Page ↗
              </Link>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddNewQuotation}
                style={{ fontSize: "13px", padding: "8px 16px" }}
              >
                + Draft New Quotation
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {quoteSuccessMsg && (
            <div
              style={{
                padding: "10px 16px",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                borderRadius: "8px",
                fontFamily: "var(--mono)",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {quoteSuccessMsg}
            </div>
          )}

          {/* VIEW A: ESTIMATOR */}
          {quoteSubTab === "estimator" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)", marginBottom: "4px" }}>
                  Indian Market Project Price Estimator
                </h2>
                <p style={{ fontSize: "13.5px", color: "var(--muted)" }}>
                  Research-backed estimation matrix based on senior Indian engineering rates (₹1,800 – ₹3,200/hr) and studio delivery benchmarks.
                  Configure the scope, review the real-time breakdown, and convert directly into a formal client quotation with one click.
                </p>
              </div>

              <ProjectEstimator onConvertToQuotation={handleConvertEstimateToQuote} />
            </div>
          )}

          {/* VIEW B: QUOTATIONS HUB */}
          {quoteSubTab === "hub" && (
            <div>
              {/* Summary Metrics */}
              <div className="admin-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "20px" }}>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Total Quotes Issued</div>
                  <div className="admin-stat-val">{quotationsList.length}</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Quoted Pipeline (INR)</div>
                  <div className="admin-stat-val" style={{ color: "var(--accent)", fontSize: "22px" }}>
                    ₹
                    {quotationsList
                      .filter((q) => q.currency === "INR")
                      .reduce((sum, q) => sum + (q.totalAmount || 0), 0)
                      .toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Sent / Awaiting Client</div>
                  <div className="admin-stat-val" style={{ color: "#3730a3" }}>
                    {quotationsList.filter((q) => q.status === "SENT").length}
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Accepted &amp; Won</div>
                  <div className="admin-stat-val" style={{ color: "#166534" }}>
                    {quotationsList.filter((q) => q.status === "ACCEPTED").length}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  marginBottom: "20px",
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>
                    Status:
                  </span>
                  {["ALL", "DRAFT", "SENT", "ACCEPTED", "DECLINED"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setQuoteFilterStatus(st)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "11.5px",
                        fontFamily: "var(--mono)",
                        border: "1px solid var(--line)",
                        background: quoteFilterStatus === st ? "var(--ink)" : "none",
                        color: quoteFilterStatus === st ? "#fff" : "var(--muted)",
                        cursor: "pointer",
                      }}
                    >
                      {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Search client, email, quote #..."
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--line)",
                    fontSize: "12.5px",
                    width: "240px",
                    background: "var(--bg)",
                  }}
                />
              </div>

              {/* Quotations List */}
              {loadingQuotations ? (
                <div style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--mono)", color: "var(--muted)" }}>
                  Loading quotations…
                </div>
              ) : quotationsList.length === 0 ? (
                <div
                  style={{
                    background: "var(--card)",
                    padding: "48px 24px",
                    textAlign: "center",
                    borderRadius: "14px",
                    border: "1px solid var(--line)",
                  }}
                >
                  <p style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)", marginBottom: "8px" }}>
                    No quotations generated yet.
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
                    Use the Indian Market Estimator tab or click below to draft a branded proposal.
                  </p>
                  <button type="button" className="btn-primary" onClick={handleAddNewQuotation}>
                    + Draft First Quotation
                  </button>
                </div>
              ) : (
                (() => {
                  const filtered = quotationsList.filter((q) => {
                    if (quoteFilterStatus !== "ALL" && q.status !== quoteFilterStatus) return false;
                    if (quoteSearch.trim()) {
                      const s = quoteSearch.toLowerCase();
                      const matchClient = q.clientName.toLowerCase().includes(s);
                      const matchEmail = q.clientEmail.toLowerCase().includes(s);
                      const matchTitle = q.projectTitle.toLowerCase().includes(s);
                      const matchNum = q.quotationNumber.toLowerCase().includes(s);
                      if (!matchClient && !matchEmail && !matchTitle && !matchNum) return false;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div style={{ padding: "32px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "13px" }}>
                        No quotations match your filters.
                      </div>
                    );
                  }

                  return (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Quote #</th>
                            <th>Status</th>
                            <th>Client &amp; Company</th>
                            <th>Project Scope</th>
                            <th>Total Amount</th>
                            <th>Timeline</th>
                            <th>Valid Until</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((quote) => {
                            const isINR = quote.currency === "INR";
                            const formattedTotal = isINR
                              ? `₹${quote.totalAmount.toLocaleString("en-IN")}`
                              : `$${quote.totalAmount.toLocaleString("en-US")}`;

                            const badgeColors = {
                              DRAFT: { bg: "#eae7dd", color: "var(--muted)" },
                              SENT: { bg: "#e0e7ff", color: "#3730a3" },
                              ACCEPTED: { bg: "#dcfce7", color: "#166534" },
                              DECLINED: { bg: "#fee2e2", color: "#991b1b" },
                              EXPIRED: { bg: "#fef3c7", color: "#92400e" },
                            }[quote.status] || { bg: "#eee", color: "#666" };

                            return (
                              <tr key={quote.id}>
                                <td>
                                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 600 }}>
                                    {quote.quotationNumber}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      fontFamily: "var(--mono)",
                                      fontSize: "11px",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      background: badgeColors.bg,
                                      color: badgeColors.color,
                                      fontWeight: 500,
                                      display: "inline-block",
                                    }}
                                  >
                                    {quote.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 500, fontSize: "13.5px" }}>{quote.clientName}</div>
                                  <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>
                                    {quote.clientEmail}
                                  </div>
                                  {quote.clientCompany && (
                                    <div style={{ fontSize: "11px", color: "var(--ink)", opacity: 0.8 }}>
                                      {quote.clientCompany}
                                    </div>
                                  )}
                                </td>
                                <td style={{ maxWidth: "240px" }}>
                                  <div style={{ fontWeight: 500, fontSize: "13px" }}>{quote.projectTitle}</div>
                                  <div style={{ fontSize: "11px", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {quote.overview}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontFamily: "var(--mono)", fontSize: "13.5px", fontWeight: 700, color: "var(--ink)" }}>
                                    {formattedTotal}
                                  </div>
                                  {quote.taxRate > 0 && (
                                    <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--muted)" }}>
                                      Incl. {quote.taxRate}% GST
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--muted)" }}>
                                    {quote.timeline || "—"}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--muted)" }}>
                                    {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("en-IN") : "—"}
                                  </div>
                                </td>
                                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                                    {/* Direct Mail Dispatch */}
                                    <button
                                      type="button"
                                      onClick={() => handleResendQuoteEmail(quote)}
                                      disabled={resendingQuoteId === quote.id}
                                      style={{
                                        fontFamily: "var(--mono)",
                                        fontSize: "11px",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: "1px solid var(--accent)",
                                        background: "var(--accent-soft)",
                                        color: "var(--accent)",
                                        cursor: "pointer",
                                        fontWeight: 500,
                                      }}
                                      title={`Send email directly to ${quote.clientEmail}`}
                                    >
                                      {resendingQuoteId === quote.id
                                        ? "Sending..."
                                        : quote.status === "DRAFT"
                                        ? "✉ Send Mail"
                                        : "↻ Resend"}
                                    </button>

                                    {/* Online Proposal Link */}
                                    <Link
                                      href={`/quote/${quote.viewToken}`}
                                      target="_blank"
                                      style={{
                                        fontFamily: "var(--mono)",
                                        fontSize: "11px",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: "1px solid var(--line)",
                                        background: "none",
                                        color: "var(--ink)",
                                        textDecoration: "none",
                                      }}
                                      title="Open Client Interactive Web Proposal"
                                    >
                                      Preview ↗
                                    </Link>

                                    {/* Edit */}
                                    <button
                                      type="button"
                                      onClick={() => handleEditQuotation(quote)}
                                      style={{
                                        fontFamily: "var(--mono)",
                                        fontSize: "11px",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: "1px solid var(--line)",
                                        background: "none",
                                        color: "var(--ink)",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Edit
                                    </button>

                                    {/* Delete */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuoteItem(quote.id, quote.quotationNumber)}
                                      style={{
                                        fontFamily: "var(--mono)",
                                        fontSize: "11px",
                                        padding: "4px 6px",
                                        borderRadius: "4px",
                                        border: "none",
                                        background: "none",
                                        color: "#c93b2b",
                                        cursor: "pointer",
                                      }}
                                      title="Delete quotation"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= QUOTATION COMPOSER / EMAIL MODAL ================= */}
      {showQuoteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "var(--bg)",
              width: "100%",
              maxWidth: "880px",
              maxHeight: "92vh",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--line)",
                background: "var(--card)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "var(--ink)", margin: 0 }}>
                  {quoteFormId ? `Edit Quotation [${qQuotationNumber}]` : "Draft Quotation & Send Email"}
                </h3>
                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                  Direct client email delivery with branded proposal &amp; line-item breakdown
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  color: "var(--muted)",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Section 1: Client & Scope Info */}
              <div
                style={{
                  background: "var(--card)",
                  padding: "18px",
                  borderRadius: "10px",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "14px", letterSpacing: "0.05em" }}>
                  1. Client &amp; Engagement Scope
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={qClientName}
                      onChange={(e) => setQClientName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                      Client Email (For direct delivery) *
                    </label>
                    <input
                      type="email"
                      value={qClientEmail}
                      onChange={(e) => setQClientEmail(e.target.value)}
                      placeholder="rahul@company.com"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={qClientPhone}
                      onChange={(e) => setQClientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      value={qClientCompany}
                      onChange={(e) => setQClientCompany(e.target.value)}
                      placeholder="Acme Innovations Pvt Ltd"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={qProjectTitle}
                    onChange={(e) => setQProjectTitle(e.target.value)}
                    placeholder="e.g. Custom Multi-Tenant Logistics Portal — Full Build"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                    Executive Scope Overview
                  </label>
                  <textarea
                    rows={3}
                    value={qOverview}
                    onChange={(e) => setQOverview(e.target.value)}
                    placeholder="High-level engineering scope, objectives, and deliverables..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Section 2: Line Items & Pricing */}
              <div
                style={{
                  background: "var(--card)",
                  padding: "18px",
                  borderRadius: "10px",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.05em" }}>
                    2. Deliverable Line Items &amp; Pricing
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)" }}>Currency:</span>
                    <button
                      type="button"
                      onClick={() => setQCurrency("INR")}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontFamily: "var(--mono)",
                        border: "1px solid var(--line)",
                        background: qCurrency === "INR" ? "var(--ink)" : "none",
                        color: qCurrency === "INR" ? "#fff" : "var(--muted)",
                        cursor: "pointer",
                      }}
                    >
                      INR (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQCurrency("USD")}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontFamily: "var(--mono)",
                        border: "1px solid var(--line)",
                        background: qCurrency === "USD" ? "var(--ink)" : "none",
                        color: qCurrency === "USD" ? "#fff" : "var(--muted)",
                        cursor: "pointer",
                      }}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                  {qLineItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.8fr 70px 110px 32px",
                        gap: "8px",
                        alignItems: "center",
                        background: "var(--bg)",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateQLineItem(item.id, "title", e.target.value)}
                          placeholder="Module / Feature title"
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "12.5px", fontWeight: 500, marginBottom: "4px" }}
                        />
                        <input
                          type="text"
                          value={item.description || ""}
                          onChange={(e) => handleUpdateQLineItem(item.id, "description", e.target.value)}
                          placeholder="Short description of deliverables in this module..."
                          style={{ width: "100%", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "11.5px", color: "var(--muted)" }}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={item.hours || 0}
                          onChange={(e) => handleUpdateQLineItem(item.id, "hours", Number(e.target.value) || 0)}
                          placeholder="Hrs"
                          title="Estimated Hours"
                          style={{ width: "100%", padding: "6px 4px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "12px", textAlign: "center" }}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={item.amount || 0}
                          onChange={(e) => handleUpdateQLineItem(item.id, "amount", Number(e.target.value) || 0)}
                          placeholder="Amount"
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "12.5px", fontFamily: "var(--mono)", fontWeight: 600, textAlign: "right" }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQLineItem(item.id)}
                        disabled={qLineItems.length <= 1}
                        style={{
                          background: "none",
                          border: "none",
                          color: qLineItems.length <= 1 ? "var(--line)" : "#c93b2b",
                          fontSize: "14px",
                          cursor: qLineItems.length <= 1 ? "not-allowed" : "pointer",
                          textAlign: "center",
                        }}
                        title="Remove Line Item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={handleAddQLineItem}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "11.5px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px dashed var(--line)",
                      background: "none",
                      color: "var(--accent)",
                      cursor: "pointer",
                    }}
                  >
                    + Add Line Item
                  </button>

                  {/* Totals Breakdown */}
                  {(() => {
                    const sub = qLineItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
                    const taxAmt = Math.round((sub - qDiscount) * (qTaxRate / 100));
                    const grand = Math.max(0, sub - qDiscount + taxAmt);
                    const curSymbol = qCurrency === "INR" ? "₹" : "$";

                    return (
                      <div style={{ minWidth: "220px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)" }}>
                          <span>Subtotal:</span>
                          <span style={{ fontFamily: "var(--mono)" }}>{curSymbol}{sub.toLocaleString("en-IN")}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--muted)" }}>
                          <span>Discount:</span>
                          <input
                            type="number"
                            value={qDiscount}
                            onChange={(e) => setQDiscount(Number(e.target.value) || 0)}
                            style={{ width: "80px", padding: "2px 6px", fontSize: "11px", textAlign: "right", borderRadius: "4px", border: "1px solid var(--line)" }}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--muted)" }}>
                          <span>GST / Tax:</span>
                          <select
                            value={qTaxRate}
                            onChange={(e) => setQTaxRate(Number(e.target.value) || 0)}
                            style={{ width: "95px", padding: "2px 6px", fontSize: "11px", borderRadius: "4px", border: "1px solid var(--line)" }}
                          >
                            <option value={0}>0% None</option>
                            <option value={18}>18% GST (India)</option>
                          </select>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 700, color: "var(--ink)", borderTop: "1px solid var(--line)", paddingTop: "6px" }}>
                          <span>Grand Total:</span>
                          <span style={{ fontFamily: "var(--mono)", color: "var(--accent)" }}>{curSymbol}{grand.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Section 3: Engagement Terms & Payment Schedule */}
              <div
                style={{
                  background: "var(--card)",
                  padding: "18px",
                  borderRadius: "10px",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "14px", letterSpacing: "0.05em" }}>
                  3. Delivery Timeline, Milestones &amp; Stack
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                      Estimated Timeline
                    </label>
                    <input
                      type="text"
                      value={qTimeline}
                      onChange={(e) => setQTimeline(e.target.value)}
                      placeholder="e.g. 5 – 7 Weeks"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                      Proposal Valid Until
                    </label>
                    <input
                      type="date"
                      value={qValidUntil}
                      onChange={(e) => setQValidUntil(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                    Payment Milestone Schedule
                  </label>
                  <input
                    type="text"
                    value={qPaymentSchedule}
                    onChange={(e) => setQPaymentSchedule(e.target.value)}
                    placeholder="40% Advance, 40% Staging Approval, 20% Production Handover"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                    Technology Stack (comma-separated tags)
                  </label>
                  <input
                    type="text"
                    value={qTechStack}
                    onChange={(e) => setQTechStack(e.target.value)}
                    placeholder="Next.js 15, TypeScript, PostgreSQL, Tailwind CSS, Docker"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                    Engagement Terms &amp; Launch Warranty
                  </label>
                  <textarea
                    rows={3}
                    value={qTerms}
                    onChange={(e) => setQTerms(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "12px", lineHeight: 1.5 }}
                  />
                </div>
              </div>

              {/* Section 4: Email Dispatch Note */}
              <div
                style={{
                  background: "var(--card)",
                  padding: "18px",
                  borderRadius: "10px",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ fontFamily: "var(--mono)", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "6px", letterSpacing: "0.05em" }}>
                  4. Direct Email Note to Client (Included in Mail Body)
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "10px" }}>
                  Add a personal note or executive greeting that will appear directly at the top of the client&apos;s quotation email.
                </p>
                <textarea
                  rows={2}
                  value={qCustomEmailNote}
                  onChange={(e) => setQCustomEmailNote(e.target.value)}
                  placeholder="e.g. Hi Rahul, pleasure discussing your vision earlier today! Here is our formal scope proposal and itemized cost breakdown for your review."
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--line)",
                background: "var(--card)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)",
                  background: "none",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => handleSaveOrSendQuotation(false)}
                  disabled={savingQuote || sendingQuoteEmail}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid var(--line)",
                    background: "none",
                    color: "var(--ink)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {savingQuote ? "Saving Draft..." : "Save Draft"}
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleSaveOrSendQuotation(true)}
                  disabled={savingQuote || sendingQuoteEmail}
                  style={{ fontSize: "13px", padding: "8px 20px" }}
                >
                  {sendingQuoteEmail ? "Sending Mail..." : "🚀 Send Quotation Email Directly"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
