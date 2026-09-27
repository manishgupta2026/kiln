import { NextRequest, NextResponse } from "next/server";
import { getQuotationByToken, updateQuotation } from "@/lib/quotations-db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const quote = await getQuotationByToken(token);
  if (!quote) {
    return NextResponse.json({ success: false, error: "Quotation not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: quote });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const quote = await getQuotationByToken(token);
  if (!quote) {
    return NextResponse.json({ success: false, error: "Quotation not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const action = body.action; // "ACCEPT" | "DECLINE"

    if (action === "ACCEPT") {
      const updated = await updateQuotation(quote.id, {
        status: "ACCEPTED",
      });
      return NextResponse.json({
        success: true,
        message: "Quotation accepted! Kiln will reach out with onboarding instructions.",
        data: updated,
      });
    } else if (action === "DECLINE") {
      const updated = await updateQuotation(quote.id, {
        status: "DECLINED",
      });
      return NextResponse.json({
        success: true,
        message: "Quotation status updated.",
        data: updated,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
