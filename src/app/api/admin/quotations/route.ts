import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAllQuotations, createQuotation } from "@/lib/quotations-db";
import { sendQuotationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotes = await getAllQuotations();
    return NextResponse.json({ success: true, data: quotes });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.clientName || !body.clientEmail || !body.projectTitle) {
      return NextResponse.json(
        { success: false, error: "Client name, email, and project title are required" },
        { status: 400 }
      );
    }

    const newQuote = await createQuotation({
      quotationNumber: body.quotationNumber,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      clientCompany: body.clientCompany,
      projectTitle: body.projectTitle,
      overview: body.overview || "Custom software design & development scope.",
      currency: body.currency || "INR",
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      taxRate: Number(body.taxRate) || 0,
      taxAmount: Number(body.taxAmount) || 0,
      totalAmount: Number(body.totalAmount) || 0,
      timeline: body.timeline || "4 – 6 Weeks",
      paymentSchedule: body.paymentSchedule || "40% Advance, 40% Staging Approval, 20% Final Sign-off",
      validUntil: body.validUntil || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      lineItems: body.lineItems || [],
      techStack: body.techStack || ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
      termsAndNotes: body.termsAndNotes,
      status: body.sendImmediately ? "SENT" : "DRAFT",
      sentAt: body.sendImmediately ? new Date().toISOString() : null,
    });

    // If send immediately requested
    if (body.sendImmediately) {
      try {
        const origin = request.nextUrl.origin;
        await sendQuotationEmail(newQuote, {
          customNote: body.emailCustomNote,
          baseUrl: origin,
        });
      } catch (mailErr) {
        console.warn("Could not dispatch email immediately:", mailErr);
      }
    }

    return NextResponse.json({ success: true, data: newQuote }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create quotation" },
      { status: 500 }
    );
  }
}
