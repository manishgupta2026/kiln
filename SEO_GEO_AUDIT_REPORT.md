# DigiGrantha: Technical SEO, GEO & AI Search Audit & Implementation Report

**Domain:** `https://digigrantha.com`  
**Brand Identity:** DigiGrantha (Independent Digital Product & Software Engineering Studio)  
**Architecture:** Next.js 15.5 App Router, React 19, TypeScript, PostgreSQL (Neon), Cloudflare Workers via OpenNext  
**Audit & QA Review Date:** November 2026  
**Status:** **VERIFIED, HARDENED & COMPILED FOR PRODUCTION**

---

## 1. Executive Summary & Quality Assurance

DigiGrantha is an independent digital product and software engineering studio that designs, architects, and builds custom web applications, responsive websites, private client portals, and resilient digital platforms start to finish.

During initial development, the platform had clean visual craftsmanship and edge compilation capabilities, but lacked foundational technical SEO infrastructure: missing robots directives, ungenerated sitemaps, absence of web app manifests, missing Open Graph preview assets, unindexed metadata, and zero structured data.

In this QA audit and production implementation:
1. **Factual Verification Completed:** All claims across the codebase and documentation have been strictly verified against source files (`data/case-studies.json`, `data/team.json`, `src/app/about/page.tsx`, and `src/app/page.tsx`). All fabricated claims (such as non-existent case studies, unverified geographical headquarters, and speculative turnaround guarantees) were purged.
2. **AI Crawler Permissions Calibrated:** Crawlers are separated into search retrieval crawlers (`OAI-SearchBot`, `PerplexityBot`, `Bingbot`, `Applebot`, `Googlebot`), user-triggered fetchers (`ChatGPT-User`), and model-training scrapers (`GPTBot`, `Google-Extended`, `ClaudeBot`, `CCBot`). Training bots are restricted, protecting IP without sacrificing search visibility.
3. **Private Route Protection Hardened:** Server-side JWT authentication protects internal routes (`/dashboard`, `/dev`, `/admin`). High-entropy tokens protect client invoice and quotation views. Robots directives allow crawl access to `/login` so search engines can read the `noindex, nofollow` meta tag, preventing ghost SERP indexation.
4. **Structured Data Grounded:** Schema graphs (`Organization`, `WebSite`, `BreadcrumbList`, `FAQPage`, `ItemList`) match visible on-page content with zero unsupported claims.

---

## 2. Initial Audit Findings vs Resolved Actions

| Vector | Initial Finding / Risk | QA Resolution & Production Implementation | Severity |
| :--- | :--- | :--- | :--- |
| **Robots Directive** | Missing `robots.txt`. Crawlers had no traversal rules. | Implemented dynamic Next.js `robots.ts` serving `/robots.txt`. Grants access to public routes; disallows private APIs and admin sections. Separates AI search retrieval from foundation training crawlers. | **Critical** |
| **Sitemap Discovery** | Missing `/sitemap.xml`. | Implemented dynamic `sitemap.ts` listing all 4 public canonical routes (`/`, `/work`, `/about`, `/career`) with priorities and timestamps. Private/token routes strictly excluded. | **High** |
| **Web App Manifest** | Missing `/manifest.webmanifest`. | Implemented `manifest.ts` delivering brand colors (`#0F5C52`, `#FAF7EE`), SVG app icon, and standalone PWA display mode. | **Medium** |
| **Route Duplication** | `/careers` and `/career` co-existed as separate pages. | Added permanent 301 redirect in `next.config.ts` from `/careers` $\rightarrow$ `/career`. Added `noindex, follow` on `/careers` page component as secondary guard. | **High** |
| **Private Route Exposure** | Sensitive portals (`/admin`, `/dashboard`, `/dev`, `/invoice/[token]`, `/quote/[token]`, `/onboard/[token]`) lacked explicit `noindex` headers. | Added `robots: { index: false, follow: false, nocache: true }` in layout wrappers across all 9 private and token route groups. | **Critical** |
| **Open Graph Asset** | Missing high-resolution social preview image. | Generated brand-aligned 1200x630 `public/og-image.png` with official typography, gold accents, and verified studio tags. | **Medium** |
| **Structured Data** | Zero Schema.org JSON-LD scripts. | Implemented `src/components/JsonLd.tsx` rendering valid Schema.org `Organization`, `WebSite`, `BreadcrumbList`, `FAQPage`, and `ItemList` graphs. | **High** |
| **LLM Machine Discovery** | No machine-readable index for modern AI search engines. | Created standardized `public/llms.txt` and comprehensive `public/llms-full.txt` outlining verified studio capabilities and real project metrics. | **High** |

---

## 3. Verified Business & Project Information

To guarantee absolute factual accuracy, all business information was audited directly against the database and site configuration:

### 3.1 Studio Identity
- **Studio Name:** DigiGrantha
- **Tagline:** *"Where idea becomes Digital"*
- **Homepage Headline:** *"We build Websites / Web Apps / Online Stores / Brands for Ambitious Brands"*
- **Business Model:** Independent in-house digital product and software engineering studio.
- **Operating Model:** Remote-first engineering studio working directly with founders and teams globally. No unverified physical street address or coordinates are claimed.
- **Primary Inquiry Email:** `team@digigrantha.com`
- **Client Portal:** Dedicated private portal with real-time milestone tracking across Discover, Design, Build, and Ship phases.

### 3.2 Engineering Team & Leadership (`data/team.json`)
- **Deepak Kumar**: Founder (Milestone coordination, scope alignment, client communication).
- **Manish Gupta**: Full-stack developer (End-to-end architecture; shipped CourseHunt and TradeSage).
- **Ashutosh**: Developer (Modern frontend architecture, responsive web applications).
- **Kartik Gupta**: Developer (Core systems, database engineering, scalable backend services).

*(Note: Hallucinated founder names from initial drafts were completely purged.)*

### 3.3 Verified Shipped Work & Case Studies (`data/case-studies.json` & `src/app/about/page.tsx`)
1. **TradeSage**:
   - Algorithmic trading and risk management platform for the Indian equity market (NSE).
   - Trained on 10 years of NSE data across 2,200+ equities.
   - **70.5% backtested win rate**; **60.5%+ live capital run rate**.
   - Built with Python, XGBoost, GitHub Actions, and SmartAPI.
2. **CourseHunt**:
   - EdTech course aggregation and link verification platform.
   - Live in production at `https://coursehunt.tech`.
   - Used by **1,000+ daily active students**.
   - Built with Next.js, Supabase, and Vercel.
3. **Coppter**:
   - Workforce intelligence and organizational operations platform.
   - **4 dedicated role-based portals shipped** (Leadership, HR operations, employee assessments, external mentors).
   - Built with Next.js, TypeScript, Tailwind CSS, and Neon PostgreSQL.
4. **Manraah**:
   - Mental wellness platform featuring dedicated experiences for students, professionals, and administrators.
   - Built with Next.js, TypeScript, Tailwind CSS, and Neon PostgreSQL.
5. **5e Serpraise**:
   - Corporate training and organizational development platform built across two major generational releases (V1 & V2).
   - Preserves 20+ years of institutional training legacy across India and Australia.
6. **NutriFlex**:
   - Adaptive fitness platform delivering dynamic workout progressions and structured health routines.

*(Note: All references to fabricated projects like "NutriLex" or unverified metrics like "99.4% OCR precision" have been removed.)*

---

## 4. Technical SEO Architecture

### 4.1 Dynamic Robots Configuration (`src/app/robots.ts`)
The robots configuration segregates crawlers into three distinct operational groups:
1. **Search Retrieval Crawlers (`*`, `OAI-SearchBot`, `PerplexityBot`, `Bingbot`, `Applebot`):**
   - Allowed access to public marketing routes (`/`, `/work`, `/about`, `/career`, `/photos/*`, `/llms.txt`, `/llms-full.txt`).
   - Disallowed access to internal application routes (`/admin/*`, `/dashboard/*`, `/dev/*`, `/api/*`, `/invoice/*`, `/quote/*`, `/onboard/*`).
2. **User-Triggered Fetchers (`ChatGPT-User`):**
   - Permitted on public routes when a user requests browsing.
3. **Model-Training Scrapers (`GPTBot`, `Google-Extended`, `ClaudeBot`, `CCBot`, `Bytespider`):**
   - Disallowed across `/` to prevent uncredited bulk ingestion for foundation model training while keeping search discovery fully active.
4. **Crawlable `noindex` Strategy:**
   - `/login`, `/forgot-password`, and `/reset-password` are kept crawlable in `robots.txt` so search engine spiders can fetch the page and read the `<meta name="robots" content="noindex, nofollow" />` tag, ensuring clean removal from search indexes without "indexed without snippet" warnings.

### 4.2 Dynamic XML Sitemap (`src/app/sitemap.ts`)
- Serves standard XML at `https://digigrantha.com/sitemap.xml`.
- Strictly includes only canonical indexable URLs:
  - `https://digigrantha.com/` (Priority `1.0`)
  - `https://digigrantha.com/work` (Priority `0.9`)
  - `https://digigrantha.com/about` (Priority `0.8`)
  - `https://digigrantha.com/career` (Priority `0.7`)
- Dynamic ISO timestamps generated on request.

### 4.3 HTTP Headers & Permanent Redirects (`next.config.ts`)
- **301 Permanent Redirect:** `/careers` $\rightarrow$ `/career` (`permanent: true`).
- **Security Headers:**
  - `X-Content-Type-Options: nosniff` (mitigates MIME-sniffing exploits).
  - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking).
  - `Referrer-Policy: strict-origin-when-cross-origin` (protects referrer integrity).
- **Static Caching:** 1-year immutable cache rules for `/og-image.png`, `/llms.txt`, and `/llms-full.txt`.

---

## 5. Structured Data & Schema Validation

Structured data is rendered at runtime using Next.js Server Components without client-side hydration overhead:
- **`OrganizationJsonLd`**: Valid Schema.org `["Organization", "ProfessionalService"]` with verified name, email (`team@digigrantha.com`), logo, and offer catalog reflecting the studio's 5 core services from `data/content.json`.
- **`WebSite`**: Declares canonical domain and publisher binding.
- **`BreadcrumbJsonLd`**: Reusable hierarchical breadcrumbs for `/work`, `/about`, and `/career`.
- **`FaqJsonLd`**: Valid Schema.org `FAQPage` consuming the 6 real studio FAQs from `@/lib/faqs`.
- **`PortfolioJsonLd`**: Valid Schema.org `ItemList` with `CreativeWork` schemas populated dynamically from `data/case-studies.json`.

---

## 6. Build & Production Verification

```
Environment: Cloudflare Workers via @opennextjs/cloudflare
TypeScript Compiler (npx tsc --noEmit): Exit Code 0 (Zero errors)
OpenNext Cloudflare Builder (npm run build:worker): Exit Code 0 (Success)
Worker Bundle: Saved in .open-next/worker.js
Total Routes Verified: 35 routes compiled (all static metadata routes verified: /robots.txt, /sitemap.xml, /manifest.webmanifest)
```
