import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  pushEventToGoogle,
  deleteEventFromGoogle,
} from "@/lib/google-calendar";

async function requireAuth() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

function parseDate(ymd: string) {
  return new Date(ymd + "T12:00:00");
}

function sortYmd(arr: string[]) {
  return [...new Set(arr)].sort();
}

function isConsecutive(sorted: string[]) {
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseDate(sorted[i - 1]);
    const cur = parseDate(sorted[i]);
    const diff = (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) !== 1) return false;
  }
  return true;
}

// GET — lista datas bloqueadas no mês
export async function GET(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") || new Date().getFullYear());
  const month = Number(searchParams.get("month") || new Date().getMonth());
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month + 2, 0);

  const rows = await prisma.blockedDate.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(rows);
}

// POST — aceita { date } ou { dates: [...] }, com label opcional
export async function POST(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { status, label, eventType, clientName, note } = body;

  // Normaliza pra array
  let dates: string[] = [];
  if (Array.isArray(body.dates)) dates = body.dates;
  else if (body.date) dates = [body.date];

  if (dates.length === 0)
    return NextResponse.json({ error: "Nenhuma data informada" }, { status: 400 });

  const sorted = sortYmd(dates);
  const finalStatus = status || "OCCUPIED";
  const displayTitle =
    label ||
    (finalStatus === "PENDING" ? "Em análise" : "Ocupado");

  // === Google Calendar ===
  // Se as datas forem consecutivas: cria UM evento all-day do início ao fim
  // Senão: cria um evento por data
  let gcalIdsByDate: Map<string, string | null> = new Map();

  if (sorted.length > 1 && isConsecutive(sorted)) {
    const id = await pushEventToGoogle({
      title: displayTitle,
      date: parseDate(sorted[0]),
      endDate: parseDate(sorted[sorted.length - 1]),
      description: note || undefined,
    });
    // Mesmo evento gcal pra todas as datas (assim conseguimos deletar quando liberar)
    sorted.forEach((d) => gcalIdsByDate.set(d, id));
  } else {
    for (const d of sorted) {
      const id = await pushEventToGoogle({
        title: displayTitle,
        date: parseDate(d),
        description: note || undefined,
      });
      gcalIdsByDate.set(d, id);
    }
  }

  // === Banco — upsert cada data ===
  // Antes de inserir, lida com gcal IDs antigos que possam estar sendo trocados.
  // Se o ID antigo era compartilhado com datas que NÃO estão na atualização,
  // recria um evento gcal pras "órfãs" pra não deixar referências quebradas.
  const existing = await prisma.blockedDate.findMany({
    where: { date: { in: sorted.map(parseDate) } },
  });
  const updatingYmd = new Set(sorted);
  const oldGcalIds = [
    ...new Set(existing.map((e) => e.gcalEventId).filter(Boolean) as string[]),
  ];

  for (const oldId of oldGcalIds) {
    const allRefs = await prisma.blockedDate.findMany({
      where: { gcalEventId: oldId },
    });
    const orphans = allRefs.filter(
      (r) => !updatingYmd.has(r.date.toISOString().split("T")[0])
    );

    await deleteEventFromGoogle(oldId).catch(() => {});

    if (orphans.length > 0) {
      const sortedOrphans = orphans
        .map((r) => r.date)
        .sort((a, b) => a.getTime() - b.getTime());
      const ref = orphans[0];
      const refTitle =
        ref.label || (ref.status === "PENDING" ? "Em análise" : "Ocupado");

      const isOrphanConsecutive = (() => {
        for (let i = 1; i < sortedOrphans.length; i++) {
          const diff =
            (sortedOrphans[i].getTime() - sortedOrphans[i - 1].getTime()) /
            (1000 * 60 * 60 * 24);
          if (Math.round(diff) !== 1) return false;
        }
        return true;
      })();

      if (isOrphanConsecutive && sortedOrphans.length > 1) {
        const newId = await pushEventToGoogle({
          title: refTitle,
          date: sortedOrphans[0],
          endDate: sortedOrphans[sortedOrphans.length - 1],
          description: ref.note || undefined,
        });
        await prisma.blockedDate.updateMany({
          where: { id: { in: orphans.map((o) => o.id) } },
          data: { gcalEventId: newId },
        });
      } else {
        for (const o of orphans) {
          const newId = await pushEventToGoogle({
            title:
              o.label || (o.status === "PENDING" ? "Em análise" : "Ocupado"),
            date: o.date,
            description: o.note || undefined,
          });
          await prisma.blockedDate.update({
            where: { id: o.id },
            data: { gcalEventId: newId },
          });
        }
      }
    }
  }

  const rows = await Promise.all(
    sorted.map((d) => {
      const dt = parseDate(d);
      return prisma.blockedDate.upsert({
        where: { date: dt },
        update: {
          status: finalStatus,
          label: label || null,
          eventType: eventType || null,
          clientName: clientName || null,
          note: note || null,
          gcalEventId: gcalIdsByDate.get(d) || null,
        },
        create: {
          date: dt,
          status: finalStatus,
          label: label || null,
          eventType: eventType || null,
          clientName: clientName || null,
          note: note || null,
          gcalEventId: gcalIdsByDate.get(d) || null,
        },
      });
    })
  );

  return NextResponse.json({ count: rows.length, rows });
}

// DELETE — libera uma data (?date=YYYY-MM-DD) ou várias (?dates=a,b,c)
export async function DELETE(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const single = searchParams.get("date");
  const many = searchParams.get("dates");

  const list: string[] = many
    ? many.split(",").filter(Boolean)
    : single
      ? [single]
      : [];
  if (list.length === 0)
    return NextResponse.json({ error: "Data faltando" }, { status: 400 });

  const dts = list.map(parseDate);
  const toDeleteYmd = new Set(list);

  // Pega todos os registros que serão removidos
  const removing = await prisma.blockedDate.findMany({
    where: { date: { in: dts } },
  });

  // IDs gcal afetados (únicos)
  const affectedGcalIds = [
    ...new Set(
      removing.map((e) => e.gcalEventId).filter(Boolean) as string[]
    ),
  ];

  // Pra cada evento gcal: checa se ele é compartilhado com datas que NÃO estão sendo removidas
  for (const gcalId of affectedGcalIds) {
    const allWithThisGcal = await prisma.blockedDate.findMany({
      where: { gcalEventId: gcalId },
    });
    const remaining = allWithThisGcal.filter(
      (r) => !toDeleteYmd.has(r.date.toISOString().split("T")[0])
    );

    // Em qualquer caso apaga o evento gcal antigo
    await deleteEventFromGoogle(gcalId).catch(() => {});

    // Se sobraram datas, recria um novo evento gcal pras remanescentes e atualiza o banco
    if (remaining.length > 0) {
      const sortedDates = remaining
        .map((r) => r.date)
        .sort((a, b) => a.getTime() - b.getTime());
      const titleRef = remaining[0];
      const titleStr =
        titleRef.label ||
        (titleRef.status === "PENDING" ? "Em análise" : "Ocupado");

      const consecutive = (() => {
        for (let i = 1; i < sortedDates.length; i++) {
          const diff =
            (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) /
            (1000 * 60 * 60 * 24);
          if (Math.round(diff) !== 1) return false;
        }
        return true;
      })();

      if (consecutive) {
        const newId = await pushEventToGoogle({
          title: titleStr,
          date: sortedDates[0],
          endDate: sortedDates[sortedDates.length - 1],
          description: titleRef.note || undefined,
        });
        await prisma.blockedDate.updateMany({
          where: { id: { in: remaining.map((r) => r.id) } },
          data: { gcalEventId: newId },
        });
      } else {
        // Datas salteadas → 1 evento por dia
        for (const r of remaining) {
          const newId = await pushEventToGoogle({
            title: r.label || (r.status === "PENDING" ? "Em análise" : "Ocupado"),
            date: r.date,
            description: r.note || undefined,
          });
          await prisma.blockedDate.update({
            where: { id: r.id },
            data: { gcalEventId: newId },
          });
        }
      }
    }
  }

  await prisma.blockedDate.deleteMany({ where: { date: { in: dts } } });
  return NextResponse.json({ ok: true, count: removing.length });
}
