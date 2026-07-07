import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota temporária de bootstrap — cria as tabelas no banco novo do Railway.
// Remover depois de usar uma vez.
const BOOTSTRAP_SECRET = "tmp-bootstrap-2026-07-07-x9k2";

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "BlockedDate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OCCUPIED',
    "label" TEXT,
    "eventType" TEXT,
    "clientName" TEXT,
    "note" TEXT,
    "gcalEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "bookingType" TEXT NOT NULL DEFAULT 'VENUE',
    "eventDate" DATE NOT NULL,
    "eventEndDate" DATE,
    "guests" INTEGER NOT NULL,
    "eventType" TEXT,
    "selections" JSONB NOT NULL,
    "totalEstimate" DOUBLE PRECISION NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "BlockedDate_date_key" ON "BlockedDate"("date")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email")`,
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-bootstrap-secret");
  if (secret !== BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = [];
  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
    results.push(sql.split("\n")[0]);
  }

  return NextResponse.json({ ok: true, ran: results });
}
