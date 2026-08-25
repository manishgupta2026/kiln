import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Seeding Neon PostgreSQL Database ===");

  // 1. Seed Site Setting (Trust Section Config)
  let trustConfig = {
    enabled: false,
    eyebrow: "Who we've worked with",
    heading: "Nobody yet — and we're not going to fake it.",
    description:
      "We're a young studio. No client logo wall, no invented quotes to look bigger than we are. What we do have is real, shipped work — you've just scrolled past it. If you work with us, your name goes in one of these.",
    slots: [
      {
        id: "slot-1",
        label: "Your logo\ncould go here",
        isHighlighted: true,
      },
      {
        id: "slot-2",
        label: "—",
        isHighlighted: false,
      },
      {
        id: "slot-3",
        label: "—",
        isHighlighted: false,
      },
      {
        id: "slot-4",
        label: "—",
        isHighlighted: false,
      },
    ],
  };

  const contentFile = path.join(process.cwd(), "data", "content.json");
  if (fs.existsSync(contentFile)) {
    try {
      const content = JSON.parse(fs.readFileSync(contentFile, "utf-8"));
      if (content.trust) trustConfig = content.trust;
    } catch {}
  }

  await prisma.siteSetting.upsert({
    where: { key: "trust" },
    update: { value: trustConfig },
    create: { key: "trust", value: trustConfig },
  });
  console.log("✓ Seeded Trust section configuration to SiteSetting table");

  // 2. Seed Showcase Projects
  const showcaseProjects = [
    {
      slug: "tradesage",
      idx: "01",
      name: "TradeSage",
      category: "trading",
      oneLiner:
        "An algorithmic trading system for the Indian equity market — ten years of NSE data, automated risk controls, live on real capital.",
      homepageOneLiner:
        "Taught a model to trade the Indian market so we didn't have to guess twice.",
      result: "60.5% win rate",
      tags: ["Python", "XGBoost", "GitHub Actions", "SmartAPI"],
      mobilePreview:
        "60.5% live win rate · trained on 10yrs of NSE data across 2,200+ stocks",
      previewLabel: "60.5% win rate · 2,200+ stocks tracked",
      previewSvg: `<svg viewBox="0 0 200 100"><polyline points="0,80 40,70 80,75 120,45 160,55 200,20" fill="none" stroke="#75801F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      featured: true,
    },
    {
      slug: "coursehunt",
      idx: "02",
      name: "CourseHunt",
      category: "product",
      oneLiner:
        "A fast course aggregator built on Next.js and Supabase — the shortcut 1,000+ students take every day.",
      homepageOneLiner:
        "Built the shortcut 1,000+ students take every day instead of hunting for links.",
      result: "1,000+ daily users",
      tags: ["Next.js", "Supabase", "Vercel"],
      mobilePreview: "1,000+ daily active users · Next.js + Supabase",
      previewLabel: "1,000+ daily active users",
      previewSvg: `<svg viewBox="0 0 200 100"><rect x="10" y="60" width="180" height="10" rx="5" fill="#75801F" opacity="0.3"/><rect x="10" y="60" width="130" height="10" rx="5" fill="#75801F"/><rect x="10" y="40" width="180" height="10" rx="5" fill="#75801F" opacity="0.3"/><rect x="10" y="40" width="90" height="10" rx="5" fill="#75801F"/></svg>`,
      featured: true,
    },
    {
      slug: "zafby",
      idx: "03",
      name: "Zafby",
      category: "insurtech",
      oneLiner:
        "Parametric insurance for gig workers — pays out automatically against a trigger event, no claims process required.",
      homepageOneLiner:
        "Insurance for gig workers that pays out before you'd finish a claim form.",
      result: "Top 60 nationally",
      tags: ["Product design", "Insurtech", "Full-stack"],
      mobilePreview: "Top 60 nationally · Guidewire DevTrails, 1st place ITER SOA",
      previewLabel: "Top 60 nationally · Guidewire DevTrails",
      previewSvg: `<svg viewBox="0 0 200 100"><circle cx="60" cy="50" r="34" fill="none" stroke="#75801F" stroke-width="4"/><text x="60" y="58" text-anchor="middle" font-family="IBM Plex Mono" font-size="16" fill="#75801F">#1</text><circle cx="150" cy="50" r="34" fill="#75801F" opacity="0.15"/></svg>`,
      featured: true,
    },
    {
      slug: "manraah",
      idx: "04",
      name: "Manraah",
      category: "in-progress",
      status: "in-progress",
      oneLiner:
        "A mental wellness platform with dedicated student, professional, and admin experiences — currently in build.",
      homepageOneLiner:
        "A mental wellness platform with dedicated student, professional, and admin experiences — currently in build.",
      result: "Shipping soon",
      tags: ["Next.js", "TypeScript", "Tailwind", "Neon"],
      mobilePreview: "Student, professional & admin dashboards",
      previewLabel: "Student, professional & admin dashboards",
      previewSvg: `<svg viewBox="0 0 200 100"><rect x="10" y="15" width="80" height="70" rx="6" fill="#75801F" opacity="0.18"/><rect x="100" y="15" width="90" height="32" rx="6" fill="#75801F" opacity="0.3"/><rect x="100" y="53" width="90" height="32" rx="6" fill="#75801F" opacity="0.18"/></svg>`,
      featured: false,
    },
  ];

  for (const p of showcaseProjects) {
    await prisma.showcaseProject.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`✓ Seeded ${showcaseProjects.length} showcase projects to ShowcaseProject table`);

  // 3. Seed Users (Admin & Developer)
  const defaultPasswordHash = await bcrypt.hash("kiln2026", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kiln.design" },
    update: { role: "ADMIN", name: "Manish Gupta" },
    create: {
      email: "admin@kiln.design",
      name: "Manish Gupta",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`✓ Seeded Admin user: ${admin.email} (Password: kiln2026)`);

  const dev = await prisma.user.upsert({
    where: { email: "dev@kiln.design" },
    update: { role: "DEVELOPER", name: "Lead Developer" },
    create: {
      email: "dev@kiln.design",
      name: "Lead Developer",
      passwordHash: defaultPasswordHash,
      role: "DEVELOPER",
    },
  });
  console.log(`✓ Seeded Developer user: ${dev.email} (Password: kiln2026)`);

  // 4. Seed Existing Briefs
  const briefsFile = path.join(process.cwd(), "data", "briefs.json");
  if (fs.existsSync(briefsFile)) {
    try {
      const briefs = JSON.parse(fs.readFileSync(briefsFile, "utf-8"));
      for (const b of briefs) {
        const existing = await prisma.brief.findFirst({ where: { email: b.email } });
        if (!existing) {
          await prisma.brief.create({
            data: {
              name: b.name,
              email: b.email,
              projectType: b.projectType,
              budget: b.budget || null,
              description: b.description,
              status: b.status || "new",
              createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
            },
          });
        }
      }
      console.log(`✓ Synced client briefs to Brief table`);
    } catch {}
  }

  console.log("=== Seeding completed successfully! ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
