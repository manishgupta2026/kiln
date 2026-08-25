import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { scheduleBriefCall, updateBriefStatus, getBriefById } from "@/lib/briefs-db";
import { prisma } from "@/lib/prisma";
import { sendCallScheduledEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const brief = await getBriefById(id);

    if (!brief) {
      return NextResponse.json({ success: false, error: "Brief not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: brief });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, callScheduledAt, callMeetingUrl, callNotes, notifyClient } = body;

    // Check if this is a call scheduling / update action
    if (callScheduledAt !== undefined) {
      const updatedBrief = await scheduleBriefCall(id, {
        callScheduledAt,
        callMeetingUrl,
        callNotes,
        status: status || "call_scheduled",
      });

      if (!updatedBrief) {
        return NextResponse.json({ success: false, error: "Brief not found" }, { status: 404 });
      }

      // Optionally dispatch transactional email to client
      if (notifyClient && callScheduledAt) {
        try {
          await sendCallScheduledEmail(
            updatedBrief.email,
            updatedBrief.name,
            callScheduledAt,
            callMeetingUrl,
            callNotes
          );
        } catch (emailErr) {
          console.error("Failed to send call schedule email:", emailErr);
        }
      }

      return NextResponse.json({ success: true, data: updatedBrief });
    }

    if (status) {
      const validStatuses = ["new", "read", "call_scheduled", "call_completed", "converted", "archived"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status value" },
          { status: 400 }
        );
      }

      const updatedBrief = await updateBriefStatus(id, status as any);
      if (!updatedBrief) {
        return NextResponse.json(
          { success: false, error: "Brief not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: updatedBrief });
    }

    return NextResponse.json({ success: false, error: "No update parameters provided" }, { status: 400 });
  } catch (error) {
    console.error("Error updating brief:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update brief" },
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

  try {
    const { id } = await params;
    await prisma.brief.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brief:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brief" },
      { status: 500 }
    );
  }
}
