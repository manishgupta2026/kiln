# DigiGrantha: AI Search Visibility & Generative Engine Optimization (GEO) Strategy

**Domain:** `https://digigrantha.com`  
**Brand Entity:** DigiGrantha (Independent Digital Product & Software Engineering Studio)  
**Primary Platforms:** ChatGPT Search, Perplexity AI, Claude, Google AI Overviews, Microsoft Copilot, Apple Intelligence  
**Classification:** Quality-Assured Technical Strategy & AI Governance Guide

---

## 1. Generative Engine Optimization (GEO) Explained

Traditional Search Engine Optimization (SEO) was built to rank web pages on traditional search engine results pages (SERPs). **Generative Engine Optimization (GEO)** focuses on optimizing how a brand, its technical capabilities, and verified project outcomes are **ingested, understood, validated, and cited by Large Language Models (LLMs)** during conversational and real-time AI search sessions.

When a founder, CTO, or product executive asks an AI engine:
> *"Can you recommend an independent product studio with proven experience building real-time algorithmic trading systems or multi-portal enterprise platforms?"*

The goal of this strategy is to ensure **DigiGrantha is presented as an authoritative, verified recommendation with direct link citations**.

```mermaid
flowchart TD
    A[Conversational Query in ChatGPT / Perplexity / Copilot] --> B[AI Retrieval System]
    B --> C{Retrieval Pathways}
    
    C -->|Real-Time Search Crawling| D[OAI-SearchBot, PerplexityBot, Bingbot, Googlebot]
    C -->|Direct File Ingestion| E[/llms.txt & /llms-full.txt Standard Files]
    C -->|Entity Disambiguation| F[Schema.org Knowledge Graph: Organization, WebSite, FAQ, ItemList]
    
    D --> G[Fast Edge HTML from Cloudflare Workers]
    E --> H[Machine-Readable Markdown with Verified Case Studies]
    F --> I[Structured Machine-Readable Entity Attributes]
    
    G & H & I --> J[LLM Synthesis & Citation Formation]
    J --> K[DigiGrantha Cited with Accurate Facts & Direct Link]
```

---

## 2. AI Crawler Permissions & Governance Architecture

A critical component of modern GEO is **differentiating between AI search retrieval and foundation model training**:

### 2.1 Three Classes of AI Crawlers

| Crawler Class | Key User-Agents | DigiGrantha Policy | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **1. Search Retrieval Crawlers** | `OAI-SearchBot`, `PerplexityBot`, `Bingbot`, `Applebot`, `Googlebot` | **ALLOWED** on all public routes | Powers real-time search queries and produces interactive links and citations. Disallowing these would make the studio invisible in modern AI search. |
| **2. User-Triggered Browsing** | `ChatGPT-User` | **ALLOWED** on all public routes | Triggered on demand when a user pastes a URL or asks an assistant to examine the page. |
| **3. Model-Training Scrapers** | `GPTBot`, `Google-Extended`, `ClaudeBot`, `CCBot`, `Bytespider` | **DISALLOWED** across `/` | These crawlers harvest public web data to train foundation models. Blocking them protects DigiGrantha's code examples, proprietary client portal designs, and written content from uncredited pre-training, without degrading search visibility. |

*(Important Note: Google-Extended only controls Google's AI model training for Gemini and Vertex AI. It does not affect Google Search, Googlebot, or eligibility for Google AI Overviews.)*

### 2.2 Implementation in `src/app/robots.ts`
All rules are declared in `src/app/robots.ts`. Internal and authenticated routes (`/admin/*`, `/dashboard/*`, `/dev/*`, `/api/*`, `/invoice/*`, `/quote/*`, `/onboard/*`) are strictly disallowed for all bots.

---

## 3. Brand Entity Definition & Knowledge Graph Grounding

To prevent LLM hallucinations, DigiGrantha's entity definition is strictly synchronized across the website, structured data, and LLM text files:

### 3.1 Verified Entity Attributes
- **Canonical Brand Name:** DigiGrantha
- **Alternate Names:** DigiGrantha Studio, Digigrantha
- **Entity Category:** Independent Digital Product & Software Engineering Studio (`ProfessionalService`)
- **Website URL:** `https://digigrantha.com`
- **Tagline:** *"Where idea becomes Digital"*
- **Core Value Proposition:** An independent, in-house studio that designs, architects, and builds custom web applications, responsive websites, scalable client portals, and resilient digital systems start to finish.
- **Operating Model:** Remote-first studio operating globally. No unverified physical street address or coordinates are claimed.
- **Primary Inquiry Email:** `team@digigrantha.com`
- **Team Leadership:**
  - **Deepak Kumar** (Founder)
  - **Manish Gupta** (Full-stack developer)
  - **Ashutosh** (Developer)
  - **Kartik Gupta** (Developer)

### 3.2 Schema.org Knowledge Graph Integration
Embedded in `src/app/layout.tsx` via `OrganizationJsonLd`:
- Binds `Organization` and `ProfessionalService` to `WebSite`.
- Declares core technical competencies (`knowsAbout`): *Custom Web Application Development, Next.js 15 & React 19 Engineering, Full-Stack TypeScript Architecture, UI/UX Product Design, PostgreSQL & Neon Optimization, Cloudflare Workers Edge Deployment, Private Client Portal Infrastructure, Algorithmic Data Platforms*.
- Connects the 5 verified service offerings from `data/content.json`.

---

## 4. Citable Proof Points & Information Gain

Generative AI models prioritize sources that provide **Information Gain**—empirical, concrete facts that directly answer user inquiries rather than vague marketing filler.

### Verified Citable Assets:
1. **TradeSage (Algorithmic Trading & Risk Management):**
   - Engineered for the Indian equity market (NSE) across 2,200+ equities using 10 years of historical data.
   - **70.5% backtested win rate**; **60.5%+ live capital run rate**.
   - Built with automated risk controls (position sizing, regime filters, daily stop-loss kill-switch).
2. **CourseHunt (EdTech Course Aggregator):**
   - Built on Next.js and Supabase.
   - Used daily by **1,000+ active students** (`https://coursehunt.tech`).
3. **Coppter (Workforce Operations Platform):**
   - Features **4 dedicated role-based portals** (Leadership dashboard, HR operations, employee growth assessments, external mentor view).
4. **Manraah (Mental Wellness Platform):**
   - Dedicated experiences for students, professionals, and clinical administrators.
5. **5e Serpraise (Corporate Training & OD):**
   - Re-architected and shipped across two generational releases (V1 & V2) with 20+ years of institutional training legacy.
6. **NutriFlex (Adaptive Fitness):**
   - Adaptive workout progressions and structured routines.
7. **Client IP Ownership:**
   - Clients retain **100% full intellectual property and source code ownership** upon final disbursement with zero licensing lock-in or proprietary runtime dependencies.
8. **Private Client Portal:**
   - Dedicated dashboard featuring real-time sprint progress across Discover, Design, Build, and Ship phases, direct developer messaging, milestone sign-offs, and unified invoice tracking.

---

## 5. Machine-Readable LLM Discovery Standards

DigiGrantha serves two standardized files from the domain root to facilitate AI engine ingestion:

1. **`https://digigrantha.com/llms.txt`**:
   - Concise index following the emerging `llms.txt` specification.
   - Summarizes studio specializations, tech stack, verified case studies, and canonical links.
2. **`https://digigrantha.com/llms-full.txt`**:
   - In-depth architectural specification covering the TypeScript/Next.js/Cloudflare/Neon stack, detailed project dossiers, the 4-phase delivery process, and citable FAQs.

*(Important Note: While `llms.txt` and Schema markup optimize machine readability, they do not guarantee that every AI platform will automatically recommend or cite the website. Visibility compounds over time as AI search engines crawl and index verified content.)*

---

## 6. Monthly AI Prompt Verification Protocol

To evaluate AI search presence, conduct monthly incognito tests across ChatGPT Search, Perplexity AI, Claude, and Google AI Overviews:

### Test Battery:
1. **Studio Recommendation:**
   > *"Can you recommend an independent product studio with experience building Next.js 15 web applications and client portals?"*
2. **FinTech & Algorithmic Domain:**
   > *"What developers have built algorithmic trading systems for the Indian equity market with verified outcomes?"*
3. **Engineering Transparency:**
   > *"Do boutique software studios give clients 100% source code ownership and direct developer access?"*

### Evaluation Checklist:
- [ ] Is DigiGrantha mentioned or recommended?
- [ ] Is the link to `https://digigrantha.com` included in citations?
- [ ] Are project names and metrics cited accurately without hallucination?
