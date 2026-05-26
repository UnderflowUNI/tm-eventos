// Helpers para WhatsApp. Dois modos suportados:
//  1) Link wa.me — sempre funciona, abre o WhatsApp do cliente já com texto pronto.
//     A dona recebe a mensagem normalmente, sem custos, sem API.
//  2) Envio automático via Evolution API ou Z-API — opcional, requer setup.

import { findItem } from "./cardapio";

type Booking = {
  clientName: string;
  whatsapp: string;
  email?: string | null;
  bookingType?: "VENUE" | "TABLE";
  eventDate: Date;
  eventEndDate?: Date | null;
  guests: number;
  eventType?: string | null;
  selections: string[];
  totalEstimate: number;
  message?: string | null;
};

const eventTypeLabel: Record<string, string> = {
  ALMOCO_CHURRASCO: "Almoço com churrasco",
  JANTAR_CHURRASCO: "Jantar com churrasco",
  ALMOCO: "Almoço",
  JANTAR: "Jantar",
  OUTRO: "Outro evento",
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatBookingMessage(b: Booking): string {
  const isTable = b.bookingType === "TABLE";
  const dataLinha =
    b.eventEndDate && b.eventEndDate.getTime() !== b.eventDate.getTime()
      ? `${fmtDate(b.eventDate)} até ${fmtDate(b.eventEndDate)}`
      : fmtDate(b.eventDate);

  const itensTexto = b.selections
    .map((id) => findItem(id))
    .filter(Boolean)
    .map((i) => `  • ${i!.nome} — R$ ${i!.precoPorPessoa.toFixed(2)}/pessoa`)
    .join("\n");

  const total = b.totalEstimate.toFixed(2).replace(".", ",");

  const linhas: (string | null)[] = [
    isTable
      ? `🎣 *Nova reserva de MESA — Pesque-Pague TM*`
      : `🎉 *Nova solicitação de orçamento — Salão TM*`,
    ``,
    `👤 *Cliente:* ${b.clientName}`,
    `📱 *WhatsApp:* ${b.whatsapp}`,
    b.email ? `📧 *E-mail:* ${b.email}` : null,
    ``,
    `📅 *Data:* ${dataLinha}`,
    isTable
      ? `👥 *Pessoas na mesa:* ${b.guests}`
      : `🎊 *Evento:* ${b.eventType ? eventTypeLabel[b.eventType] || b.eventType : "—"}`,
    isTable ? null : `👥 *Convidados:* ${b.guests} pessoas`,
  ];

  if (!isTable) {
    linhas.push(
      ``,
      `🍽 *Itens selecionados:*`,
      itensTexto || "  (nenhum item marcado)",
      ``,
      `💰 *Estimativa total:* R$ ${total}`,
      `   _(crianças até 7 anos não pagam, 8-12 pagam meia)_`
    );
  }

  linhas.push(
    ``,
    b.message ? `💬 *Observações do cliente:*\n${b.message}` : null,
    ``,
    `_Mensagem gerada automaticamente pelo site Espaço TM_`
  );

  return linhas.filter(Boolean).join("\n");
}

export function buildWhatsappLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${clean}?text=${encoded}`;
}

export async function sendWhatsAppAuto(message: string): Promise<boolean> {
  const url = process.env.WHATSAPP_API_URL;
  const key = process.env.WHATSAPP_API_KEY;
  const instance = process.env.WHATSAPP_INSTANCE;
  const owner = process.env.OWNER_WHATSAPP;

  if (!url || !key || !instance || !owner) {
    console.log("[whatsapp] credenciais não configuradas — pulando envio auto");
    return false;
  }

  try {
    const res = await fetch(`${url}/message/sendText/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({
        number: owner,
        text: message,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[whatsapp] falha no envio:", e);
    return false;
  }
}
