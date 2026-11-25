# SEO Roast Roadmap: digigrantha.com (2026-11-25)

Verdict: Search bots could reach the site, but hidden homepage FAQ schema, conflicting win-rate numbers, and duplicated page titles worked against trust and CTR.

| # | Tier | Issue | Revenue impact | Fix | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | FATAL | `FaqJsonLd` lived on `/` with no visible FAQ while `/about` rendered FAQs without schema | Risks structured data manual penalty on primary money landing page | Moved `FaqJsonLd` to `/about` alongside `FaqSection`, passed all 6 merged projects to `PortfolioJsonLd` | agent | shipped |
| 2 | FATAL | Contradictory TradeSage metrics across `/work`, `/about`, JSON, SVG, and static `llms.txt` (60.5% vs 70.5% vs 78.0%) | Breaks trust with buyers, Google, and AI engines quoting studio receipts | Created single source of truth (`src/lib/studio-facts.ts`, `src/lib/work-projects.ts`) and replaced static `public/llms*.txt` with dynamic route handlers | agent | shipped |
| 3 | REVENUE | Page titles duplicated `"DigiGrantha"` twice (`/about`, `/career`, portals) and truncated `/work` at 67 chars | Cuts organic SERP CTR for product studio and web engineering searches | Rewrote titles keyword-first within 40-52 chars matching `%s | DigiGrantha` template | agent | shipped |
| 4 | REVENUE | Budget/pricing bands hidden inside button chips without plain-text SSR context or `PriceSpecification` schema | AI assistants omit DigiGrantha when buyers ask for Next.js/web studio pricing tiers | Added SSR pricing tier prose in `/#brief`, `Offer.priceSpecification` in JSON-LD, pricing FAQ, and dynamic `llms.txt` | agent | shipped |
| 5 | REVENUE | Skipped heading levels (`h2 -> h4` on `/`, missing `h2` on `/work` and `/about`) & orphan body links to `/about`, `/career`, `/work` | Weakens topical crawl signals between money pages and studio proof | Fixed semantic headings (`h1 -> h2 -> h3`) preserving styles and added contextual body links across `/`, `/work`, `/about`, `/career` | agent | shipped |
| 6 | REVENUE | `robots.ts` omitted `Claude-SearchBot` and `Claude-User` from AI search retrieval allow rules | Reduces citation readiness in Claude web search | Added `Claude-SearchBot` and `Claude-User` alongside `OAI-SearchBot`, `PerplexityBot`, `Bingbot`, and `ChatGPT-User` | agent | shipped |
| 7 | COMPOUNDING | Publish dedicated `/vs/*` and `/use-cases/*` buyer landing pages (`vs-and-alternatives` skill) | Captures high-intent "best Next.js studio" & agency alternative traffic | Create targeted service/comparison routes with verified proof | founder | next |
| 8 | COMPOUNDING | Build editorial backlinks from client launches and software directories (`directory-submissions`, `honest-link-outreach`) | Raises clean referring domains so money queries rank page 1 | Submit product manifest & add subtle studio attribution links on client launches | founder | next |

## Fluff (handled alongside or low priority)
- Cleaned AI copy tells (em dashes, filler phrases, broken `"Companies , We have worked with !"` punctuation in `data/content.json`, `"Frequently Answered Questions"` typo in `FaqSection.tsx`, `"Have an idea lets make it Real."` in `work/page.tsx`).
- `public/robots.txt` cache headers vs Next.js `robots.ts` dynamic headers are served cleanly.

