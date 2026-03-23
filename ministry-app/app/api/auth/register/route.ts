import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();
    const division = String(body.division || "").trim();

    if (!name || !username || !password || !division) {
      return NextResponse.json({ error: "Name, username, password, and division are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        division,
        role: Role.USER,
      },
      select: {
        id: true,
        name: true,
        username: true,
        division: true,
        role: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Unable to register user." }, { status: 500 });
  }
}
