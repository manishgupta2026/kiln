import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getCareerApplicationById,
  updateCareerApplication,
  deleteCareerApplication,
  CareerApplicationRecord,
} from "@/lib/careers-db";

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
  const application = await getCareerApplicationById(id);
  if (!application) {
    return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: application });
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
    const updated = await updateCareerApplication(id, {
      status: body.status as CareerApplicationRecord["status"] | undefined,
      adminNotes: body.adminNotes !== undefined ? body.adminNotes : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Application not found or could not be updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating career application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update application" },
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
    const success = await deleteCareerApplication(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Application could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting career application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
