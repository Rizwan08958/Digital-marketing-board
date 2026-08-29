import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const inputUser = username.trim();
    const inputPass = password;

    const envUser = process.env.ADMIN_USERNAME?.trim();
    const envPass = process.env.ADMIN_PASSWORD;

    let isAuthenticated = false;
    let adminPayload = {
      adminId: "env-admin",
      email: envUser || inputUser,
      name: "Admin",
      role: "ADMIN",
    };

    // 1. First check environment variables if defined
    if (envUser && envPass) {
      if (inputUser.toLowerCase() === envUser.toLowerCase() && inputPass === envPass) {
        isAuthenticated = true;
      }
    }

    // 2. Otherwise check database admin table
    if (!isAuthenticated) {
      const admin = await prisma.admin.findFirst({
        where: {
          email: { equals: inputUser, mode: "insensitive" },
        },
      });

      if (admin) {
        const isValid = await verifyPassword(inputPass, admin.passwordHash);
        if (isValid) {
          isAuthenticated = true;
          adminPayload = {
            adminId: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          };
        }
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = signAdminToken(adminPayload);

    const response = NextResponse.json({
      success: true,
      admin: adminPayload,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error during login" }, { status: 500 });
  }
}

