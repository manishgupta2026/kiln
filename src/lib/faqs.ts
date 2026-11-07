export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What happens after I send the project brief?",
    answer:
      "We read every brief ourselves — with no intermediary sales reps or account managers. We reply within 1–2 business days with an honest scope assessment, architecture plan, and clear next steps.",
  },
  {
    id: "faq-2",
    question: "Why choose DigiGrantha over traditional software agencies or freelancers?",
    answer:
      "Traditional agencies trap you in layers of non-technical project managers, inflated billable hours, and junior outsourcing. Freelancers often lack end-to-end design and DevOps continuity. DigiGrantha gives you high agency: experienced engineers who design, code, and deploy your entire product in-house, backed by transparent milestone tracking in your private client portal.",
  },
  {
    id: "faq-3",
    question: "What technology stack and architecture do you build with?",
    answer:
      "We engineer modern, production-grade products using Next.js 15, React 19, TypeScript, PostgreSQL (Neon), Prisma ORM, Tailwind CSS, and Cloudflare Workers edge deployment. This architecture delivers instantaneous page loads, zero cold starts, enterprise security, and rock-solid scalability.",
  },
  {
    id: "faq-4",
    question: "Who owns the code, design assets, and intellectual property?",
    answer:
      "You do — 100%. All source code, Git repositories, Figma design files, and intellectual property belong exclusively to you. We deliver clean, documented code with no proprietary lock-in or licensing fees.",
  },
  {
    id: "faq-5",
    question: "How does the private client portal work during development?",
    answer:
      "From day one, you get dedicated access to the DigiGrantha Client Portal. You can track real-time sprint progress across Discover, Design, Build, and Ship phases, message your engineers directly, review and approve milestone deliverables, and manage quotations and invoices in one secure place.",
  },
  {
    id: "faq-6",
    question: "Do you provide ongoing maintenance, hosting, and DevOps support after launch?",
    answer:
      "Yes. Launch day is the start of our relationship, not the end. We handle edge hosting on Cloudflare, SSL certificates, 24/7 uptime monitoring, security patching, and ongoing performance tuning so you can focus entirely on growing your business.",
  },
];

