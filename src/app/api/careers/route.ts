import { NextResponse } from "next/server";
import { z } from "zod";
import { createCareerApplication } from "@/lib/careers-db";

export const dynamic = "force-dynamic";

const careerSchema = z.object({
  type: z.enum(["JOB", "INTERNSHIP", "FREELANCING"]),
  name: z.string().min(1, "Full name is required").max(120),
  email: z.string().email("A valid email address is required").max(150),
  phone: z.string().min(5, "Phone number is required").max(40),
  location: z.string().max(120).optional().nullable(),
  role: z.string().min(1, "Target role or area of interest is required").max(100),
  experience: z.string().max(100).optional().nullable(),
  portfolioUrl: z.string().max(300).optional().nullable(),
  githubUrl: z.string().max(300).optional().nullable(),
  linkedinUrl: z.string().max(300).optional().nullable(),
  resumeUrl: z.string().min(1, "Resume link or document URL is required").max(500),
  rateOrSalary: z.string().max(100).optional().nullable(),
  availability: z.string().max(100).optional().nullable(),
  skills: z.array(z.string()).optional(),
  coverNote: z.string().min(10, "Please share a short note about yourself or your work").max(5000),
  metadata: z.record(z.any()).optional().nullable(),
  website: z.string().optional(), // Honeypot field
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot spam check: if the hidden input has content, silently accept
    if (body.website && body.website.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Application received" });
    }

    const validated = careerSchema.parse(body);

    const record = await createCareerApplication({
      type: validated.type,
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      location: validated.location || null,
      role: validated.role,
      experience: validated.experience || null,
      portfolioUrl: validated.portfolioUrl || null,
      githubUrl: validated.githubUrl || null,
      linkedinUrl: validated.linkedinUrl || null,
      resumeUrl: validated.resumeUrl,
      rateOrSalary: validated.rateOrSalary || null,
      availability: validated.availability || null,
      skills: validated.skills || [],
      coverNote: validated.coverNote,
      metadata: validated.metadata || {},
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        data: { id: record.id },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    console.error("Error creating career application:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit application. Please check all fields and try again.",
      },
      { status: 500 }
    );
  }
}
