import { PrismaClient, CompanyStatus, BillboardStatus, AdStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for iSquare Bill Boards...");

  // 1. Create Default Admin
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@isquare.com" },
    update: {},
    create: {
      email: "admin@isquare.com",
      passwordHash: adminPasswordHash,
      name: "Super Admin",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin ready: ${admin.email} (Password: admin123)`);

  // 2. Create Billboards
  const board1 = await prisma.billboard.upsert({
    where: { code: "BOARD-01" },
    update: {},
    create: {
      code: "BOARD-01",
      name: "Board 01 - Nagercoil Junction",
      location: "Nagercoil Junction, Main Road",
      description: "High traffic digital billboard facing east intersection",
      status: BillboardStatus.ONLINE,
    },
  });

  const board2 = await prisma.billboard.upsert({
    where: { code: "BOARD-02" },
    update: {},
    create: {
      code: "BOARD-02",
      name: "Board 02 - Marthandam Hub",
      location: "Marthandam Bus Terminal Front",
      description: "Prime retail facing billboard",
      status: BillboardStatus.ONLINE,
    },
  });

  const board3 = await prisma.billboard.upsert({
    where: { code: "BOARD-03" },
    update: {},
    create: {
      code: "BOARD-03",
      name: "Board 03 - Kanyakumari Beach Road",
      location: "Kanyakumari Sunset View point",
      description: "Tourist hotspot display",
      status: BillboardStatus.OFFLINE,
    },
  });
  console.log(`✅ Billboards seeded: ${board1.code}, ${board2.code}, ${board3.code}`);

  // 3. Create Companies
  const company1 = await prisma.company.upsert({
    where: { id: "comp-abc-restaurant" },
    update: {},
    create: {
      id: "comp-abc-restaurant",
      name: "ABC Restaurant",
      contactPerson: "Rajesh Kumar",
      email: "rajesh@abcrestaurant.com",
      phone: "+91 9876543210",
      shopAddress: "12, Tower Road, Nagercoil",
      status: CompanyStatus.ACTIVE,
    },
  });

  const company2 = await prisma.company.upsert({
    where: { id: "comp-xyz-clothing" },
    update: {},
    create: {
      id: "comp-xyz-clothing",
      name: "XYZ Clothing",
      contactPerson: "Anita Sharma",
      email: "contact@xyzclothing.com",
      phone: "+91 9845123456",
      shopAddress: "45, Fashion Street, Marthandam",
      status: CompanyStatus.ACTIVE,
    },
  });

  const company3 = await prisma.company.upsert({
    where: { id: "comp-city-hotel" },
    update: {},
    create: {
      id: "comp-city-hotel",
      name: "City Hotel & Spa",
      contactPerson: "Michael Fernandez",
      email: "info@cityhotel.com",
      phone: "+91 9123456789",
      shopAddress: "88, Grand Avenue, Kanyakumari",
      status: CompanyStatus.ACTIVE,
    },
  });
  console.log(`✅ Companies seeded: ${company1.name}, ${company2.name}, ${company3.name}`);

  // 4. Create Sample Advertisement & Unique Campaign QR
  const ad1 = await prisma.advertisement.upsert({
    where: { id: "ad-abc-summer-offer" },
    update: {},
    create: {
      id: "ad-abc-summer-offer",
      name: "ABC Restaurant Summer Special Feast",
      offerTitle: "20% OFF on Total Bill",
      discountDescription: "Get flat 20% discount on dine-in meals above ₹500.",
      couponLimit: 1000,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-12-31"),
      status: AdStatus.ACTIVE,
      companyId: company1.id,
      billboardId: board1.id,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const campaign1 = await prisma.campaign.upsert({
    where: { campaignCode: "CAMP-001" },
    update: {},
    create: {
      campaignCode: "CAMP-001",
      advertisementId: ad1.id,
      qrUrl: `${appUrl}/c/CAMP-001`,
    },
  });

  console.log(`✅ Campaign seeded: ${campaign1.campaignCode} -> QR URL: ${campaign1.qrUrl}`);
  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
