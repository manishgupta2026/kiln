import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getInvoiceById, updateInvoice } from "@/lib/invoices-db";
import { sendInvoiceEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const origin = request.nextUrl.origin;

    const emailResult = await sendInvoiceEmail(invoice, {
      customSubject: body.customSubject,
      customNote: body.customNote,
      baseUrl: origin,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || "Failed to deliver email" },
        { status: 500 }
      );
    }

    const updated = await updateInvoice(id, {
      status: invoice.status === "PAID" ? "PAID" : "SENT",
      sentAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Invoice dispatched to ${invoice.clientEmail} successfully`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Error dispatching invoice email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
