import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authCookieMaxAgeSeconds,
  authCookieName,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = createSessionToken({
      userId: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      division: user.division,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        division: user.division,
      },
    });

    response.cookies.set({
      name: authCookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: authCookieMaxAgeSeconds,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Unable to login." }, { status: 500 });
  }
}
