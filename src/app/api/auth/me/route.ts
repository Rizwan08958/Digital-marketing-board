import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // If session is from .env credentials
  if (session.adminId === "env-admin") {
    return NextResponse.json({
      authenticated: true,
      admin: {
        id: "env-admin",
        email: session.email,
        name: session.name || "Admin",
        role: session.role || "ADMIN",
      },
    });
  }

  // Otherwise check database
  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  if (!admin) {
    // If not found in DB but has valid JWT session payload
    return NextResponse.json({
      authenticated: true,
      admin: {
        id: session.adminId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  }

  return NextResponse.json({ authenticated: true, admin });
}

