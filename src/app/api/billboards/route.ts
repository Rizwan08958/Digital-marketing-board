import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const billboards = await prisma.billboard.findMany({
      include: {
        _count: {
          select: { advertisements: true },
        },
      },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ success: true, billboards });
  } catch (error) {
    console.error("Fetch billboards error:", error);
    return NextResponse.json({ error: "Failed to fetch billboards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, name, location, description, status } = await req.json();

    if (!code || !name || !location) {
      return NextResponse.json({ error: "Code, Name, and Location are required" }, { status: 400 });
    }

    const existing = await prisma.billboard.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "Billboard code already exists" }, { status: 400 });
    }

    const billboard = await prisma.billboard.create({
      data: {
        code: code.trim().toUpperCase(),
        name,
        location,
        description,
        status: status || "ONLINE",
      },
    });

    return NextResponse.json({ success: true, billboard });
  } catch (error) {
    console.error("Create billboard error:", error);
    return NextResponse.json({ error: "Failed to create billboard" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, code, name, location, description, status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Billboard ID required" }, { status: 400 });
    }

    const billboard = await prisma.billboard.update({
      where: { id },
      data: {
        ...(code && { code: code.trim().toUpperCase() }),
        ...(name && { name }),
        ...(location && { location }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, billboard });
  } catch (error) {
    console.error("Update billboard error:", error);
    return NextResponse.json({ error: "Failed to update billboard" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Billboard ID required" }, { status: 400 });
    }

    await prisma.billboard.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Billboard deleted" });
  } catch (error) {
    console.error("Delete billboard error:", error);
    return NextResponse.json({ error: "Failed to delete billboard" }, { status: 500 });
  }
}
