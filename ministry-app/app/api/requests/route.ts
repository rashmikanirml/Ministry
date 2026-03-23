import { RequestStatus, RequestType, RepairPriority } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { includeRequestDetails, normalizeRequestType } from "@/lib/request-mappers";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const division = searchParams.get("division");
  const search = searchParams.get("search");
  const historyOnly = searchParams.get("historyOnly") === "true";

  const normalizedType = type ? normalizeRequestType(type) : null;
  const normalizedStatus = status?.toUpperCase();
  const validStatus =
    normalizedStatus === RequestStatus.PENDING ||
    normalizedStatus === RequestStatus.APPROVED ||
    normalizedStatus === RequestStatus.REJECTED
      ? normalizedStatus
      : null;

  const requests = await prisma.request.findMany({
    where: {
      ...(session.role === "USER" ? { userId: session.userId } : {}),
      ...(normalizedType ? { requestType: normalizedType } : {}),
      ...(validStatus ? { status: validStatus } : {}),
      ...(division ? { division: { contains: division, mode: "insensitive" } } : {}),
      ...(historyOnly ? { status: { not: RequestStatus.PENDING } } : {}),
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: "insensitive" } },
              { user: { name: { contains: search, mode: "insensitive" } } },
              { user: { username: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: includeRequestDetails,
    orderBy: { dateSubmitted: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Only staff users can create requests." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const requestType = normalizeRequestType(String(body.requestType || ""));
    const description = String(body.description || "").trim();

    if (!requestType || !description) {
      return NextResponse.json({ error: "Request type and description are required." }, { status: 400 });
    }

    const baseData = {
      userId: session.userId,
      division: session.division,
      requestType,
      description,
      status: RequestStatus.PENDING,
    };

    let created;

    if (requestType === RequestType.TONER) {
      const printerSerial = String(body.printerSerial || "").trim();
      const printerModel = String(body.printerModel || "").trim();
      if (!printerSerial || !printerModel) {
        return NextResponse.json(
          { error: "Printer serial code and model are required for toner requests." },
          { status: 400 }
        );
      }

      created = await prisma.request.create({
        data: {
          ...baseData,
          toner: {
            create: {
              printerSerial,
              printerModel,
            },
          },
        },
        include: includeRequestDetails,
      });
    } else if (requestType === RequestType.MULTIMEDIA) {
      const equipmentType = String(body.equipmentType || "").trim();
      const dateTime = String(body.dateTime || "").trim();
      const meetingDetails = String(body.meetingDetails || "").trim();

      if (!equipmentType || !dateTime || !meetingDetails) {
        return NextResponse.json(
          { error: "Equipment type, date/time, and meeting details are required." },
          { status: 400 }
        );
      }

      created = await prisma.request.create({
        data: {
          ...baseData,
          multimedia: {
            create: {
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
          { error: "Computer serial, issue description, and priority are required." },
          { status: 400 }
        );
      }

      created = await prisma.request.create({
        data: {
          ...baseData,
          repair: {
            create: {
              computerSerial,
              issue,
              priority,
            },
          },
        },
        include: includeRequestDetails,
      });
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Failed to create request." }, { status: 500 });
  }
}
