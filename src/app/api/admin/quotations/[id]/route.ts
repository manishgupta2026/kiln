import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getQuotationById, updateQuotation, deleteQuotation } from "@/lib/quotations-db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getQuotationById(id);
  if (!quote) {
    return NextResponse.json({ success: false, error: "Quotation not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: quote });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const updated = await updateQuotation(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Quotation not found or could not be updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating quotation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update quotation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const success = await deleteQuotation(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Quotation could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Quotation deleted" });
  } catch (error: any) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete quotation" },
      { status: 500 }
    );
  }
}
