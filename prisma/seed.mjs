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

  // 2. Seed Case Studies (Kiln's Public Portfolio)
  // Remove any legacy Zafby records completely
  try {
    await prisma.caseStudy.deleteMany({
      where: { name: { in: ["Zafby", "GigShield"], mode: "insensitive" } },
    });
    await prisma.showcaseProject.deleteMany({
      where: { slug: "zafby" },
    });
  } catch (e) {
    // Ignore if table/rows don't exist yet
  }

  const caseStudies = [
    {
      name: "TradeSage",
      category: "Trading & fintech",
      oneLiner: "Taught a model to trade so we didn't have to guess twice.",
      resultStat: "60.5% win rate",
      briefDescription:
        "An algorithmic trading system for the Indian equity market. We trained a model on ten years of NSE data across 2,200+ stocks, then wrapped it in automated risk controls — position sizing, regime filters, and a daily loss kill-switch — so the model can't outrun its own discipline.",
      tags: ["Python", "XGBoost", "GitHub Actions", "SmartAPI"],
      liveUrl: null,
      status: "live",
      featured: true,
      displayOrder: 1,
    },
    {
      name: "CourseHunt",
      category: "Product",
      oneLiner: "Built the shortcut 1,000+ students take every day.",
      resultStat: "1,000+ daily users",
      briefDescription:
        "A fast course aggregator built on Next.js and Supabase. Students were losing hours hunting for course links scattered across the internet — CourseHunt automates discovery and validation so listings are already there, and already working, when they arrive.",
      tags: ["Next.js", "Supabase", "Vercel"],
      liveUrl: "https://coursehunt.tech",
      status: "live",
      featured: true,
      displayOrder: 2,
    },
    {
      name: "Coppter",
      category: "Product",
      oneLiner: "Four different logins, four completely different jobs to be done.",
      resultStat: "4 role-based portals shipped",
      briefDescription:
        "A workforce intelligence platform built around four distinct roles — a leadership dashboard for strategic analytics, HR operations tools, personalized growth assessments for employees, and a mentor-facing view for career guidance. Four different logins, because four different people need four different tools, not one dashboard wearing four hats.",
      tags: ["Next.js", "TypeScript", "Tailwind", "Neon"],
      liveUrl: "https://coppter-frontend.onrender.com/",
      status: "live",
      featured: true,
      displayOrder: 3,
    },
    {
      name: "Manraah",
      category: "In progress",
      oneLiner:
        "A mental wellness platform with dedicated student, professional, and admin experiences.",
      resultStat: "Shipping soon",
      briefDescription:
        "A mental wellness platform with entirely separate experiences for students, professionals, and admins — each with its own permissions, flows, and interface, not one dashboard trying to serve three audiences at once.",
      tags: ["Next.js", "TypeScript", "Tailwind", "Neon"],
      liveUrl: null,
      status: "in-progress",
      featured: false,
      displayOrder: 4,
    },
  ];

  for (const cs of caseStudies) {
    const existing = await prisma.caseStudy.findFirst({
      where: { name: cs.name },
    });
    if (existing) {
      await prisma.caseStudy.update({
        where: { id: existing.id },
        data: cs,
      });
    } else {
      await prisma.caseStudy.create({
        data: cs,
      });
    }
  }
  console.log(`✓ Seeded ${caseStudies.length} case studies to CaseStudy table`);

  // 2.5. Seed Team Members (About Page Studio Roster)
  const teamMembers = [
    {
      name: "Manish Gupta",
      role: "Founder — Full-stack developer",
      avatar: "M",
      bio: "Manish builds products end to end — frontend, backend, and the infrastructure that keeps them running. He shipped CourseHunt, now used by 1,000+ people daily, and built TradeSage, an algorithmic trading system live on real capital.",
      displayOrder: 1,
    },
    {
      name: "Deepak Kumar",
      role: "Project Manager",
      avatar: "D",
      bio: "Deepak keeps Kiln's builds on schedule and razor-focused on client objectives. He coordinates sprint milestones, unblocks engineering decisions, and ensures every deliverable ships on time.",
      displayOrder: 2,
    },
    {
      name: "Ashutosh",
      role: "Developer",
      avatar: "A",
      bio: "Ashutosh builds resilient web applications and responsive interfaces. He focuses on modern frontend architectures, clean state management, and seamless integrations.",
      displayOrder: 3,
    },
    {
      name: "Kartik",
      role: "Developer",
      avatar: "K",
      bio: "Kartik specializes in core systems, database engineering, and reliable backend services. He ensures Kiln's platforms are fast, secure, and built to scale under production traffic.",
      displayOrder: 4,
    },
  ];

  for (const m of teamMembers) {
    const existing = await prisma.teamMember.findFirst({
      where: { name: m.name },
    });
    if (existing) {
      await prisma.teamMember.update({
        where: { id: existing.id },
        data: m,
      });
    } else {
      await prisma.teamMember.create({
        data: m,
      });
    }
  }
  console.log(`✓ Seeded ${teamMembers.length} team members to TeamMember table`);

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
