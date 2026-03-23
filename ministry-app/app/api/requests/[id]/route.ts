import { RepairPriority, RequestStatus } from "@prisma/client";
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(request);
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid request id." }, { status: 400 });
  }

  try {
    const existing = await prisma.request.findUnique({
      where: { id },
      include: includeRequestDetails,
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    if (existing.status !== RequestStatus.PENDING) {
      return NextResponse.json({ error: "Only pending requests can be edited." }, { status: 400 });
    }

    const body = await request.json();
    const description = String(body.description || "").trim();
    if (!description) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 });
    }

    let updated;

    if (existing.requestType === "TONER") {
      const printerSerial = String(body.printerSerial || "").trim();
      const printerModel = String(body.printerModel || "").trim();
      if (!printerSerial || !printerModel) {
        return NextResponse.json({ error: "Printer serial and model are required." }, { status: 400 });
      }

      updated = await prisma.request.update({
        where: { id },
        data: {
          description,
          toner: {
            update: {
              printerSerial,
              printerModel,
            },
          },
        },
        include: includeRequestDetails,
      });
    } else if (existing.requestType === "MULTIMEDIA") {
      const equipmentType = String(body.equipmentType || "").trim();
      const dateTime = String(body.dateTime || "").trim();
      const meetingDetails = String(body.meetingDetails || "").trim();
      if (!equipmentType || !dateTime || !meetingDetails) {
        return NextResponse.json(
          { error: "Equipment type, date/time, and meeting details are required." },
          { status: 400 }
        );
      }

      updated = await prisma.request.update({
        where: { id },
        data: {
          description,
          multimedia: {
            update: {
              equipmentType,
              dateTime: new Date(dateTime),
              meetingDetails,
            },
          },
        },
        include: includeRequestDetails,
      });
    } else {
      const computerSerial = String(body.computerSerial || "").trim();
      const issue = String(body.issue || "").trim();
      const priorityRaw = String(body.priority || "").toUpperCase();
      const priority =
        priorityRaw === RepairPriority.LOW ||
        priorityRaw === RepairPriority.MEDIUM ||
        priorityRaw === RepairPriority.HIGH ||
        priorityRaw === RepairPriority.CRITICAL
          ? priorityRaw
          : null;

      if (!computerSerial || !issue || !priority) {
        return NextResponse.json(
          { error: "Computer serial, issue description, and valid priority are required." },
          { status: 400 }
        );
      }

      updated = await prisma.request.update({
        where: { id },
        data: {
          description,
          repair: {
            update: {
              computerSerial,
              issue,
              priority,
            },
          },
        },
        include: includeRequestDetails,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("User update request error:", error);
    return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(request);
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid request id." }, { status: 400 });
  }

  try {
    const existing = await prisma.request.findUnique({ where: { id } });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    if (existing.status !== RequestStatus.PENDING) {
      return NextResponse.json({ error: "Only pending requests can be deleted." }, { status: 400 });
    }

    await prisma.request.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("User delete request error:", error);
    return NextResponse.json({ error: "Failed to delete request." }, { status: 500 });
  }
}
