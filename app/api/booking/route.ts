import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { calcularOrcamento } from "@/lib/cardapio";
import { validateBooking, sanitizeStr } from "@/lib/validation";
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
  const cur = new Date(startYmd + "T12:00:00");
  const end = new Date(endYmd + "T12:00:00");
  while (cur <= end) {
    out.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const check = validateBooking(body);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const {
      clientName: rawName,
      whatsapp: rawPhone,
      email: rawEmail,
      bookingType: rawType,
      eventDate,
      eventEndDate,
      guests,
      eventType,
      selections,
      message: rawMessage,
    } = body;

    // Sanitiza strings antes de gravar
    const clientName = sanitizeStr(rawName, 120);
    const whatsapp = sanitizeStr(rawPhone, 20);
    const email = rawEmail ? sanitizeStr(rawEmail, 254) : null;
    const message = rawMessage ? sanitizeStr(rawMessage, 2000) : null;

    const bookingType: "VENUE" | "TABLE" = rawType === "TABLE" ? "TABLE" : "VENUE";

    const startDate = parseDate(eventDate);
    const endDate =
      bookingType === "VENUE" && eventEndDate
        ? parseDate(eventEndDate)
        : startDate;

    const orc =
      bookingType === "VENUE"
        ? calcularOrcamento(selections || [], guests)
        : { total: 0, porPessoa: 0, obs: "" };

    const booking = await withRetry(() =>
      prisma.booking.create({
        data: {
          clientName,
          whatsapp,
          email,
          bookingType,
          eventDate: startDate,
          eventEndDate: bookingType === "VENUE" ? endDate : null,
          guests: Number(guests),
          eventType: bookingType === "VENUE" ? eventType : null,
          selections: bookingType === "VENUE" ? (selections || []) : [],
          totalEstimate: orc.total,
          message,
        },
      })
    );

    const dateList =
      bookingType === "VENUE"
        ? datesBetween(eventDate, eventEndDate || eventDate)
        : [eventDate];

    for (const d of dateList) {
      const dt = parseDate(d);
      await withRetry(() =>
        prisma.blockedDate.upsert({
          where: { date: dt },
          update: {
            status: "PENDING",
            clientName,
            eventType: bookingType === "VENUE" ? eventType : "Reserva de mesa",
            label: bookingType === "TABLE" ? `Mesa · ${clientName}` : clientName,
          },
          create: {
            date: dt,
            status: "PENDING",
            clientName,
            eventType: bookingType === "VENUE" ? eventType : "Reserva de mesa",
            label: bookingType === "TABLE" ? `Mesa · ${clientName}` : clientName,
            note:
              bookingType === "TABLE"
                ? `Reserva pesque-pague — ${guests} pessoa(s)`
                : `Solicitação automática — ${guests} convidados`,
          },
        })
      );
    }

    const text = formatBookingMessage({
      ...booking,
      eventDate: startDate,
      eventEndDate: bookingType === "VENUE" ? endDate : null,
      bookingType,
      selections: bookingType === "VENUE" ? (selections || []) : [],
    });

    const ownerPhone = process.env.OWNER_WHATSAPP || "5532984969955";
    const whatsappLink = buildWhatsappLink(ownerPhone, text);

    sendWhatsAppAuto(text).catch(() => {});

    return NextResponse.json({ ok: true, bookingId: booking.id, whatsappLink });
  } catch (e) {
    console.error("[booking] POST error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
