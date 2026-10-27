# Digigrantha Studio — Editorial Digital Product Studio

> **Digigrantha** is a full-stack digital product and web development studio website built with Next.js 15 (App Router), TypeScript, Prisma ORM, and Neon PostgreSQL. Designed with an editorial, typography-first aesthetic (Instrument Serif + IBM Plex Mono) and backed by a private admin CMS for managing client briefs, project archives, and site settings.

---

## ✨ Features

- **Editorial Aesthetic & Motion Design:**
  - Custom typography pairing (*Instrument Serif* + *IBM Plex Mono* + *Inter*).
  - Canvas background with subtle noise grain texture and warm editorial palette (`#F7F4EE`, `#1E1E1C`, `#75801F`).
  - Interactive desktop cursor preview card & mobile tap preview drawer for projects.
  - Floating sticky action CTA that respects mobile drawer states.
  - Bespoke custom 404 error page with quick-navigation cards.

- **Fast Global Performance (Sub-10ms TTFB):**
  - Incremental Static Regeneration (ISR) with edge CDN caching.
  - In-memory hot caching for database queries (`0ms` repeat query latency).
  - On-demand cache invalidation (`revalidatePath`) whenever CMS content is updated.

- **Client Brief Intake System:**
  - 60-second interactive project intake form with budget selectors, scope chips, and timelines.
  - Anti-spam honeypot verification and Zod schema validation.
  - Direct persistence into Neon PostgreSQL with real-time admin status tracking.

- **Private Admin Studio (`/admin`):**
  - Protected with secure JWT session cookies (`jose`) and Next.js middleware.
  - **Inbound Briefs Manager:** View, filter, and toggle client brief statuses (`New`, `Read`, `Archived`).
  - **Company / Trust Section CMS:** Live toggle switch to enable/disable the social proof section, edit copy, and manage company slots.
  - **Projects Manager:** Create, update, delete, and toggle featured homepage status for studio case studies.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Neon PostgreSQL](https://neon.tech/) (Serverless Postgres with Connection Pooling)
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Authentication:** Edge-compatible JWT via `jose`
- **Validation:** [Zod](https://zod.dev/)
- **Styling:** Vanilla CSS with custom design tokens, fluid clamp typography, and micro-animations

---

## 📁 Project Structure

```
kiln/
├── prisma/
│   ├── schema.prisma       # Database schema (Brief, Project, SiteSetting)
│   └── seed.mjs            # Initial seed script for database
├── src/
│   ├── app/
│   │   ├── about/          # Studio manifesto and milestones (/about)
│   │   ├── admin/          # Private studio CMS & login (/admin)
│   │   ├── api/            # API endpoints (Briefs, Admin auth, CMS content)
│   │   ├── work/           # Full archive of shipped products (/work)
│   │   ├── globals.css     # Design tokens, typography & layout styles
│   │   ├── layout.tsx      # Root layout with fonts & metadata
│   │   ├── not-found.tsx   # Custom editorial 404 page
│   │   └── page.tsx        # Studio homepage with live CMS data
│   ├── components/         # Modular UI components (Header, Footer, BriefForm, etc.)
│   ├── data/               # Default static project definitions
│   ├── lib/                # Database clients, auth helpers, and caching logic
│   └── middleware.ts       # Edge route protection for /admin
├── .env.example            # Environment variables template
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/manishgupta2026/kiln.git
cd kiln
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# PostgreSQL connection pooler (for runtime queries)
DATABASE_URL="postgresql://user:password@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Direct connection (used by Prisma CLI for migrations & push)
DIRECT_URL="postgresql://user:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Admin dashboard credentials
ADMIN_PASSWORD="your_secure_admin_password"
ADMIN_JWT_SECRET="your_random_jwt_secret_key"
```

### 4. Push Database Schema & Seed Data

```bash
# Push Prisma schema to Neon PostgreSQL
npx prisma db push

# (Optional) Seed the database with initial studio projects & settings
node prisma/seed.mjs
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Access

To access the private studio admin dashboard:
1. Navigate to `/admin` (or `/admin/login`).
2. Enter the `ADMIN_PASSWORD` defined in your environment variables.
3. Manage inbound briefs, configure the Trust section toggle, and manage live project case studies.

---

## 🚢 Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the environment variables (`DATABASE_URL`, `DIRECT_URL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`) in the Vercel Project Settings.
4. Deploy! Next.js and Prisma will build and optimize pages with edge caching automatically.

---

## 📄 License

MIT © Digigrantha Studio
