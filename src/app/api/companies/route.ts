import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { advertisements: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, companies });
  } catch (error) {
    console.error("Fetch companies error:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, contactPerson, email, phone, shopAddress, status } = await req.json();

    if (!name || !contactPerson || !email || !phone || !shopAddress) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        contactPerson,
        email,
        phone,
        shopAddress,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Create company error:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, contactPerson, email, phone, shopAddress, status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(contactPerson && { contactPerson }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(shopAddress && { shopAddress }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Update company error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
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
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    await prisma.company.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Company deleted" });
  } catch (error) {
    console.error("Delete company error:", error);
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
