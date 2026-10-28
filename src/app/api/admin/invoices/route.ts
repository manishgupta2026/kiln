import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAllInvoices, createInvoice } from "@/lib/invoices-db";
import { sendInvoiceEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoices = await getAllInvoices();
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
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
        { success: false, error: "Client name, client email, and project title are required" },
        { status: 400 }
      );
    }

    const newInvoice = await createInvoice({
      invoiceNumber: body.invoiceNumber,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      clientCompany: body.clientCompany,
      clientAddress: body.clientAddress,
      clientGstin: body.clientGstin,
      projectTitle: body.projectTitle,
      overview: body.overview,
      currency: body.currency || "INR",
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      taxRate: Number(body.taxRate) || 0,
      taxAmount: Number(body.taxAmount) || 0,
      totalAmount: Number(body.totalAmount) || 0,
      issueDate: body.issueDate || new Date().toISOString(),
      dueDate: body.dueDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      lineItems: body.lineItems || [],
      paymentTerms: body.paymentTerms,
      bankDetails: body.bankDetails,
      notes: body.notes,
      status: body.sendImmediately ? "SENT" : (body.status || "DRAFT"),
      sentAt: body.sendImmediately ? new Date().toISOString() : null,
    });

    if (body.sendImmediately) {
      try {
        const origin = request.nextUrl.origin;
        await sendInvoiceEmail(newInvoice, {
          customNote: body.emailCustomNote,
          baseUrl: origin,
        });
      } catch (mailErr) {
        console.warn("Could not dispatch invoice email immediately:", mailErr);
      }
    }

    return NextResponse.json({ success: true, data: newInvoice }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
