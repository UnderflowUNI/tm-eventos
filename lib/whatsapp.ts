import { findItem, CARDAPIO } from "./cardapio";

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
  ALMOCO:  "Almoço",
  JANTAR:  "Jantar",
  OUTRO:   "Outro evento",
};

const SEP  = "━━━━━━━━━━━━━━━━━━━━━━";
const THIN = "──────────────────────";

function fmtDate(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
  });
}

function fmtBRL(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

export function formatBookingMessage(b: Booking): string {
  const isTable = b.bookingType === "TABLE";

  // Agrupa itens selecionados por categoria
  const grupos: Record<string, Array<{ nome: string; preco: number }>> = {};
  for (const id of b.selections) {
    const item = findItem(id);
    if (!item) continue;
    const cat = CARDAPIO.find((c) => c.id === item.categoria);
    const titulo = cat?.titulo ?? "Outros";
    (grupos[titulo] ??= []).push({ nome: item.nome, preco: item.precoPorPessoa });
  }

  const dataInicio = fmtDate(b.eventDate);
  const dataFim =
    b.eventEndDate && b.eventEndDate.getTime() !== b.eventDate.getTime()
      ? fmtDate(b.eventEndDate)
      : null;

  const L: string[] = [];

  // ── Cabeçalho ───────────────────────────────────────────────────────────────
  L.push(SEP);
  if (isTable) {
    L.push("🎣 *ESPAÇO TEIXEIRA MACHADO*");
    L.push("📋 *Nova Reserva — Pesque-Pague*");
  } else {
    L.push("🏠 *ESPAÇO TEIXEIRA MACHADO*");
    L.push("📋 *Nova Solicitação de Orçamento*");
  }
  L.push(SEP);
  L.push("");

  // ── Dados do cliente ────────────────────────────────────────────────────────
  L.push("👤 *DADOS DO CLIENTE*");
  L.push(`  • Nome: ${b.clientName}`);
  L.push(`  • WhatsApp: ${b.whatsapp}`);
  if (b.email) L.push(`  • E-mail: ${b.email}`);
  L.push("");

  // ── Detalhes do evento/reserva ──────────────────────────────────────────────
  L.push(SEP);
  L.push(isTable ? "🎣 *DETALHES DA RESERVA*" : "📅 *DETALHES DO EVENTO*");
  if (!isTable && b.eventType) {
    L.push(`  • Tipo: ${eventTypeLabel[b.eventType] || b.eventType}`);
  }
  if (dataFim) {
    const dias =
      Math.round(
        (b.eventEndDate!.getTime() - b.eventDate.getTime()) / 86_400_000
      ) + 1;
    L.push(`  • Data: ${dataInicio} até ${dataFim} *(${dias} dias)*`);
  } else {
    L.push(`  • Data: ${dataInicio}`);
  }
  L.push(`  • ${isTable ? "Pessoas na mesa" : "Convidados"}: ${b.guests} pessoas`);
  L.push("");

  // ── Cardápio selecionado (só VENUE) ─────────────────────────────────────────
  if (!isTable && Object.keys(grupos).length > 0) {
    L.push(SEP);
    L.push("🍽 *CARDÁPIO SELECIONADO*");
    L.push("");
    for (const [titulo, itens] of Object.entries(grupos)) {
      L.push(`*${titulo}:*`);
      for (const { nome, preco } of itens) {
        L.push(`  ▸ ${nome} — ${fmtBRL(preco)}/pax`);
      }
      L.push("");
    }
  }

  // ── Estimativa financeira (só VENUE) ────────────────────────────────────────
  if (!isTable) {
    const total = b.totalEstimate;
    const porPessoa = b.guests > 0 ? total / b.guests : 0;
    L.push(SEP);
    L.push("💰 *ESTIMATIVA FINANCEIRA*");
    L.push(`  ${fmtBRL(porPessoa)}/pax × ${b.guests} pessoas`);
    L.push(THIN);
    L.push(`  *TOTAL ESTIMADO: ${fmtBRL(total)}*`);
    L.push("");
    L.push("  _Crianças até 7 anos: gratuito_");
    L.push("  _8 a 12 anos: meia_");
    L.push("");
  }

  // ── Observações (opcional) ──────────────────────────────────────────────────
  if (b.message) {
    L.push(SEP);
    L.push("💬 *OBSERVAÇÕES DO CLIENTE*");
    L.push(b.message);
    L.push("");
  }

  // ── Rodapé ──────────────────────────────────────────────────────────────────
  L.push(SEP);
  L.push("_Mensagem gerada automaticamente pelo site Espaço TM_");

  return L.join("\n");
}

export function buildWhatsappLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export async function sendWhatsAppAuto(message: string): Promise<boolean> {
  const url      = process.env.WHATSAPP_API_URL;
  const key      = process.env.WHATSAPP_API_KEY;
  const instance = process.env.WHATSAPP_INSTANCE;
  const owner    = process.env.OWNER_WHATSAPP;

  if (!url || !key || !instance || !owner) {
    console.log("[whatsapp] credenciais não configuradas — pulando envio auto");
    return false;
  }

  try {
    const res = await fetch(`${url}/message/sendText/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ number: owner, text: message }),
    });
    return res.ok;
  } catch (e) {
    console.error("[whatsapp] falha no envio:", e);
    return false;
  }
}
