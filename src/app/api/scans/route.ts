import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { campaignCode } = await req.json();

    if (!campaignCode) {
      return NextResponse.json({ error: "Campaign code is required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { campaignCode },
      include: {
        advertisement: {
          include: {
            company: true,
            billboard: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // IP Hash for privacy & rate abuse tracking
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
    const userAgent = req.headers.get("user-agent")?.substring(0, 255) || "unknown";

    // Record anonymous scan
    await prisma.qRScan.create({
      data: {
        campaignId: campaign.id,
        ipHash,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        campaignCode: campaign.campaignCode,
        advertisement: {
          id: campaign.advertisement.id,
          name: campaign.advertisement.name,
          offerTitle: campaign.advertisement.offerTitle,
          discountDescription: campaign.advertisement.discountDescription,
          startDate: campaign.advertisement.startDate,
          endDate: campaign.advertisement.endDate,
          status: campaign.advertisement.status,
          companyName: campaign.advertisement.company.name,
          shopAddress: campaign.advertisement.company.shopAddress,
          billboardName: campaign.advertisement.billboard.name,
          billboardLocation: campaign.advertisement.billboard.location,
        },
      },
    });
  } catch (error) {
    console.error("Scan logging error:", error);
    return NextResponse.json({ error: "Failed to record scan" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const scans = await prisma.qRScan.findMany({
      include: {
        campaign: {
          include: {
            advertisement: {
              include: {
                company: true,
                billboard: true,
              },
            },
          },
        },
      },
      orderBy: { scannedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, scans });
  } catch (error) {
    console.error("Fetch scans error:", error);
    return NextResponse.json({ error: "Failed to fetch scans" }, { status: 500 });
  }
}
