import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";

// GET /api/calendar?year=2026&month=4
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") || new Date().getFullYear());
  const month = Number(searchParams.get("month") || new Date().getMonth());

  // Pega do mês anterior até o mês seguinte (cobre a grade de 42 dias)
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month + 2, 0);

  try {
    const rows = await withRetry(() =>
      prisma.blockedDate.findMany({
        where: { date: { gte: start, lte: end } },
        select: { date: true, status: true },
      })
    );
    return NextResponse.json(rows);
  } catch (e) {
    console.error("[calendar] GET error:", e);
    return NextResponse.json([]);
  }
}
