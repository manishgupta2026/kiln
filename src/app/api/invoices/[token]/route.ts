import { NextRequest, NextResponse } from "next/server";
import { getInvoiceByToken, updateInvoice } from "@/lib/invoices-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invoice = await getInvoiceByToken(token);
  if (!invoice) {
    return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: invoice });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Invoices may only be updated by authenticated administrators." },
      { status: 401 }
    );
  }

  const { token } = await params;
  const invoice = await getInvoiceByToken(token);
  if (!invoice) {
    return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    if (body.action === "MARK_PAID") {
      const updated = await updateInvoice(invoice.id, {
        status: "PAID",
        paidAt: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        message: "Invoice marked as paid.",
        data: updated,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update invoice status" },
      { status: 500 }
    );
  }
}
