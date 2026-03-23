import { RequestStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { includeRequestDetails } from "@/lib/request-mappers";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid request id." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const action = String(body.action || "").toUpperCase();
    const adminComments = String(body.adminComments || "").trim();

    const status =
      action === "APPROVE"
        ? RequestStatus.APPROVED
        : action === "REJECT"
          ? RequestStatus.REJECTED
          : null;

    if (!status) {
      return NextResponse.json({ error: "Action must be APPROVE or REJECT." }, { status: 400 });
    }

    const updated = await prisma.request.update({
      where: { id },
      data: {
        status,
        adminComments: adminComments || null,
      },
      include: includeRequestDetails,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update request status error:", error);
    return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
  }
}
