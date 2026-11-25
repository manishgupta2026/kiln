import { BUDGET_TIERS, STUDIO_FACTS } from "@/lib/studio-facts";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const budgetSummary = BUDGET_TIERS.slice(0, 3)
  .map((t) => `${t.label} (${t.scope})`)
  .join("; ");

export const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What happens after I send the project brief?",
    answer: `We read every brief ourselves, with no intermediary sales reps or account managers. We reply within ${STUDIO_FACTS.replySla} with an honest scope assessment, architecture plan, and clear next steps.`,
  },
  {
    id: "faq-2",
    question: "How much does a custom website or web application cost?",
    answer: `Project budgets start across three transparent tiers based on scope: ${budgetSummary}. Submit a brief on the homepage intake form for a fixed scope estimate within ${STUDIO_FACTS.replySla}.`,
  },
  {
    id: "faq-3",
    question: "Why choose DigiGrantha over traditional software agencies or freelancers?",
    answer:
      "Traditional agencies trap you in layers of non-technical project managers, inflated billable hours, and junior outsourcing. Freelancers often lack end-to-end design and DevOps continuity. DigiGrantha works directly: experienced engineers design, code, and deploy your product in-house, backed by live milestone tracking in your private client portal.",
  },
  {
    id: "faq-4",
    question: "What technology stack and architecture do you build with?",
    answer:
      "We engineer production software using Next.js 15, React 19, TypeScript, PostgreSQL (Neon), Prisma ORM, Tailwind CSS, and Cloudflare Workers edge deployment. This stack delivers fast page loads, strict type safety, and reliable scaling under real traffic.",
  },
  {
    id: "faq-5",
    question: "Who owns the code, design assets, and intellectual property?",
    answer:
      "You do, 100%. All source code, Git repositories, design files, and intellectual property belong exclusively to you. We deliver clean, documented code with zero proprietary lock-in or licensing fees.",
  },
  {
    id: "faq-6",
    question: "How does the private client portal work during development?",
    answer:
      "From day one, you get dedicated access to the DigiGrantha Client Portal. You can track real-time sprint progress across Discover, Design, Build, and Ship phases, message your engineers directly, review and approve milestone deliverables, and manage quotations and invoices in one place.",
  },
  {
    id: "faq-7",
    question: "Do you provide ongoing maintenance, hosting, and DevOps support after launch?",
    answer:
      "Yes. Launch day is the start of our relationship, not the end. We handle edge hosting on Cloudflare, SSL certificates, uptime monitoring, security patching, and ongoing performance optimization after launch.",
  },
];
