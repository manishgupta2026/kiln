import { BUDGET_TIERS, STUDIO_FACTS } from "@/lib/studio-facts";
import { WORK_PROJECTS } from "@/lib/work-projects";

export const revalidate = 3600;

export async function GET() {
  const projectLines = WORK_PROJECTS.map((p) => {
    const liveSuffix = p.liveUrl ? ` Live at ${p.liveUrl}.` : "";
    return `- **${p.name}** (${p.category}): ${p.oneLiner} Verified result: ${p.resultStat || "In production"}.${liveSuffix}`;
  }).join("\n");

  const budgetLines = BUDGET_TIERS.map(
    (t) => `- **${t.label}**: ${t.scope} (${t.timeline})`
  ).join("\n");

  const body = `# ${STUDIO_FACTS.brandName}

> ${STUDIO_FACTS.tagline}. An independent digital product and software engineering studio that designs, architects, and builds custom web applications, responsive websites, scalable client portals, and resilient digital systems start to finish.

## Core Identity & Overview
- **Studio Name**: ${STUDIO_FACTS.brandName} (DigiGrantha Studio)
- **Official Website**: ${STUDIO_FACTS.siteUrl}
- **Business Model**: High-agency product design and software engineering studio working directly with founders and teams, with no intermediary account managers or junior outsourcing.
- **Contact & Brief Response SLA**: ${STUDIO_FACTS.contactEmail} (replies within ${STUDIO_FACTS.replySla})
- **Client Portal**: ${STUDIO_FACTS.siteUrl}/login (private milestone-tracked portal for active projects)

## Transparent Project Budget Tiers
${budgetLines}

## Primary Specializations & Services
1. **Full-Stack Web Applications**: End-to-end engineering of SaaS platforms, internal tools, customer dashboards, and high-throughput systems.
2. **Websites That Explain Themselves**: High-conversion landing pages, marketing sites, and corporate web platforms engineered for speed and clarity.
3. **Data-Intensive & Algorithmic Platforms**: Quantitative market analytics, SSE/WebSocket live scanners, and enterprise intelligence systems.
4. **Private Client Portal Infrastructure**: Dedicated collaboration portals with 4-stage phase tracking, direct developer chat, milestone sign-offs, and transparent invoicing.
5. **Post-Launch Maintenance**: Edge hosting on Cloudflare Workers, Neon PostgreSQL scaling, uptime monitoring, and security patching.

## Technology Stack
- **Stack**: ${STUDIO_FACTS.architectureStack.join(", ")}
- **Authentication & Security**: Custom JWT, HTTP-only secure cookies, role-based access control (RBAC), bcrypt hashing.

## Shipped Work & Case Studies (${WORK_PROJECTS.length} Featured Projects)
${projectLines}

## Key Canonical URLs
- Home: ${STUDIO_FACTS.siteUrl}
- Work & Case Studies (${WORK_PROJECTS.length} projects): ${STUDIO_FACTS.siteUrl}/work
- About Studio, Team & FAQ: ${STUDIO_FACTS.siteUrl}/about
- Careers & Open Opportunities: ${STUDIO_FACTS.siteUrl}/career
- Project Brief Submission: ${STUDIO_FACTS.siteUrl}/#brief
- Client Portal Login: ${STUDIO_FACTS.siteUrl}/login

## Technical Documentation
- [Full LLM Context](${STUDIO_FACTS.siteUrl}/llms-full.txt)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

