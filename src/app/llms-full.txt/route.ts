import { BUDGET_TIERS, STUDIO_FACTS } from "@/lib/studio-facts";
import { WORK_PROJECTS } from "@/lib/work-projects";
import { FAQS } from "@/lib/faqs";

export const revalidate = 3600;

export async function GET() {
  const caseStudyBlocks = WORK_PROJECTS.map((p) => {
    const statusText = p.liveUrl ? `${p.statusLabel} (${p.liveUrl})` : p.statusLabel;
    return `### Case Study ${p.idx}: ${p.name}
- **Category**: ${p.category}
- **Status**: ${statusText}
- **Stack**: ${p.tags.join(", ")}
- **Scope**: ${p.briefDescription || p.oneLiner}
- **Verified Outcome**: ${p.resultStat || "Live deployment"}`;
  }).join("\n\n");

  const budgetBlocks = BUDGET_TIERS.map(
    (t) => `- **${t.label}** (${t.timeline}): ${t.scope}`
  ).join("\n");

  const faqBlocks = FAQS.map(
    (f) => `- **Q: ${f.question}**\n  - A: ${f.answer}`
  ).join("\n");

  const body = `# ${STUDIO_FACTS.brandName}: Architectural, Project & Pricing Reference

## 1. Executive Summary
${STUDIO_FACTS.brandName} is an independent software engineering and digital product studio at ${STUDIO_FACTS.siteUrl}. We build websites, web applications, and private client portals in-house from first brief to post-launch support without account manager layers or contractor handoffs. Briefs are reviewed directly by engineers with replies within ${STUDIO_FACTS.replySla}.

## 2. Technical Architecture
- **Core Stack**: ${STUDIO_FACTS.architectureStack.join(", ")}
- **Design System**: Editorial typography (self-hosted Fraunces display, Inter body, Caveat accents via \`next/font\`) with tactile canvas styling.
- **Edge Runtime**: Deployed via \`@opennextjs/cloudflare\` to Cloudflare Workers for global edge delivery.
- **Persistence**: Neon PostgreSQL with serverless connection pooling and Prisma ORM.

## 3. Engagement Budget Tiers & Pricing Transparency
${budgetBlocks}

## 4. Detailed Case Studies (${WORK_PROJECTS.length} Featured Projects)

${caseStudyBlocks}

## 5. The 4-Phase Delivery Process
1. **Discover**: Joint review of product idea, target users, and constraints. Delivery of scope and architecture plan.
2. **Design**: Interactive screens and flows reviewed early with explicit client sign-off before engineering begins.
3. **Build**: Transparent engineering phases tracked in a private client portal with async chat and ticket queues.
4. **Launch & Look After**: Cloudflare Workers deployment, SSL setup, monitoring, and ongoing maintenance.

## 6. Frequently Asked Questions
${faqBlocks}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
