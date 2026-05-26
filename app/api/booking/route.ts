import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularOrcamento } from "@/lib/cardapio";
import {
  buildWhatsappLink,
  formatBookingMessage,
  sendWhatsAppAuto,
} from "@/lib/whatsapp";

function parseDate(ymd: string) {
  return new Date(ymd + "T12:00:00");
}

function datesBetween(startYmd: string, endYmd: string): string[] {
  const out: string[] = [];
  const s = parseDate(startYmd);
  const e = parseDate(endYmd);
  const cur = new Date(s);
  while (cur <= e) {
    out.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientName,
      whatsapp,
      email,
      bookingType: rawType,
      eventDate,
      eventEndDate,
      guests,
      eventType,
      selections,
      message,
    } = body;

    const bookingType: "VENUE" | "TABLE" =
      rawType === "TABLE" ? "TABLE" : "VENUE";

    if (!clientName || !whatsapp || !eventDate || !guests) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }
    if (bookingType === "VENUE" && !eventType) {
      return NextResponse.json(
        { error: "Tipo de evento obrigatório para aluguel do espaço" },
        { status: 400 }
      );
    }

    const startDate = parseDate(eventDate);
    const endDate =
      bookingType === "VENUE" && eventEndDate
        ? parseDate(eventEndDate)
        : startDate;

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "Data final não pode ser antes da inicial" },
        { status: 400 }
      );
    }

    const orc =
      bookingType === "VENUE"
        ? calcularOrcamento(selections || [], guests)
        : { total: 0, porPessoa: 0, obs: "" };

    const booking = await prisma.booking.create({
      data: {
        clientName,
        whatsapp,
        email: email || null,
        bookingType,
        eventDate: startDate,
        eventEndDate: bookingType === "VENUE" ? endDate : null,
        guests,
        eventType: bookingType === "VENUE" ? eventType : null,
        selections: bookingType === "VENUE" ? selections || [] : [],
        totalEstimate: orc.total,
        message: message || null,
      },
    });

    // Bloqueia todas as datas no calendário público (PENDING)
    const dateList =
      bookingType === "VENUE"
        ? datesBetween(eventDate, eventEndDate || eventDate)
        : [eventDate];

    const noteBase =
      bookingType === "TABLE"
        ? `Reserva pesque-pague — ${guests} pessoa(s)`
        : `Solicitação automática — ${guests} convidados`;

    for (const d of dateList) {
      const dt = parseDate(d);
      await prisma.blockedDate.upsert({
        where: { date: dt },
        update: {
          status: "PENDING",
          clientName,
          eventType: bookingType === "VENUE" ? eventType : "Reserva de mesa",
          label:
            bookingType === "TABLE" ? `Mesa · ${clientName}` : clientName,
        },
        create: {
          date: dt,
          status: "PENDING",
          clientName,
          eventType: bookingType === "VENUE" ? eventType : "Reserva de mesa",
          label:
            bookingType === "TABLE" ? `Mesa · ${clientName}` : clientName,
          note: noteBase,
        },
      });
    }

    const text = formatBookingMessage({
      ...booking,
      eventDate: startDate,
      eventEndDate: bookingType === "VENUE" ? endDate : null,
      bookingType,
      selections: bookingType === "VENUE" ? selections || [] : [],
    });

    const ownerPhone = process.env.OWNER_WHATSAPP || "5531984672190";
    const whatsappLink = buildWhatsappLink(ownerPhone, text);

    sendWhatsAppAuto(text).catch(() => {});

    return NextResponse.json({ ok: true, bookingId: booking.id, whatsappLink });
  } catch (e) {
    console.error("[booking] POST error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
