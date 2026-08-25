import { NextResponse } from "next/server";
import { z } from "zod";
import { createBrief } from "@/lib/briefs-db";

export const dynamic = "force-dynamic";

const briefSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("A valid email is required").max(150),
  phone: z.string().nullable().optional(),
  projectType: z.string().min(1, "Project type is required").max(50),
  budget: z.string().nullable().optional(),
  description: z.string().min(1, "Description is required").max(5000),
  website: z.string().optional(), // Honeypot field
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot spam check: if the hidden website input has any text, silently reject
    if (body.website && body.website.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Brief received" });
    }

    const validatedData = briefSchema.parse(body);

    const newBrief = await createBrief({
      name: validatedData.name.trim(),
      email: validatedData.email.trim(),
      phone: validatedData.phone ? validatedData.phone.trim() : null,
      projectType: validatedData.projectType,
      budget: validatedData.budget ? validatedData.budget.trim() : null,
      description: validatedData.description.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        data: { id: newBrief.id },
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

    console.error("Error creating brief:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit brief. Please try again.",
      },
      { status: 500 }
    );
  }
}
