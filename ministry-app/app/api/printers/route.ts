import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const division = searchParams.get("division")?.trim();
  const serial = searchParams.get("serial")?.trim();

  const printers = await prisma.printer.findMany({
    where: {
      ...(division ? { division: { contains: division, mode: "insensitive" } } : {}),
      ...(serial ? { serialCode: { contains: serial, mode: "insensitive" } } : {}),
    },
    orderBy: { division: "asc" },
    take: 50,
  });

  return NextResponse.json(printers);
}
