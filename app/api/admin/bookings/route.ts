import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(bookings);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !status)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(updated);
}
