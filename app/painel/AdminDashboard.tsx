"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  MessageCircle,
  Users,
  Inbox,
  X,
  Tag,
} from "lucide-react";
import { monthGrid, MES_NOMES, DIA_SEMANA_LONGO, ymd, isSameDay } from "@/lib/calendar-utils";
import { PrefsControls } from "@/components/site/PrefsControls";
import { Button } from "@/components/ui/Button";

type BlockedDate = {
  id: string;
  date: string;
  status: "OCCUPIED" | "PENDING" | "UNAVAILABLE";
  label?: string | null;
  eventType?: string | null;
  clientName?: string | null;
  note?: string | null;
};

type Booking = {
  id: string;
  clientName: string;
  whatsapp: string;
  email?: string | null;
  bookingType?: "VENUE" | "TABLE";
  eventDate: string;
  eventEndDate?: string | null;
  guests: number;
  eventType?: string | null;
  selections: string[];
  totalEstimate: number;
  message?: string | null;
  status: string;
  createdAt: string;
};

export default function AdminDashboard({ userName }: { userName: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"calendar" | "bookings">("calendar");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCalendar = async () => {
    setLoading(true);
    const res = await fetch(`/api/painel/calendar?year=${year}&month=${month}`);
    if (res.ok) setBlocked(await res.json());
    setLoading(false);
  };

  const loadBookings = async () => {
    const res = await fetch("/api/painel/bookings");
    if (res.ok) setBookings(await res.json());
  };

  useEffect(() => {
    loadCalendar();
    // eslint-disable-next-line
  }, [year, month]);

  useEffect(() => {
    loadBookings();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/painel/login");
  };

  const blockedMap = new Map(blocked.map((b) => [b.date.split("T")[0], b]));

  const handleDayClick = (d: Date) => {
    const key = ymd(d);
    if (!rangeAnchor) {
      setRangeAnchor(key);
      setSelected(new Set([key]));
    } else {
      const start = rangeAnchor < key ? rangeAnchor : key;
      const end = rangeAnchor < key ? key : rangeAnchor;
      const dates = new Set<string>();
      const cur = new Date(start + "T12:00:00");
      const endDate = new Date(end + "T12:00:00");
      while (cur <= endDate) {
        dates.add(ymd(cur));
        cur.setDate(cur.getDate() + 1);
      }
      setSelected(dates);
      setRangeAnchor(null);
      setHoverDate(null);
    }
  };

  const clearSelection = () => {
    setSelected(new Set());
    setRangeAnchor(null);
    setHoverDate(null);
  };

  const applyBlock = async (
    status: "OCCUPIED" | "PENDING",
    label: string
  ) => {
    setLoading(true);
    const dates = Array.from(selected).sort();
    await fetch("/api/painel/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates, status, label: label || undefined }),
    });
    setModalOpen(false);
    clearSelection();
    await loadCalendar();
  };

  const applyUnblock = async () => {
    setLoading(true);
    const dates = Array.from(selected).sort();
    await fetch(`/api/painel/calendar?dates=${dates.join(",")}`, {
      method: "DELETE",
    });
    setModalOpen(false);
    clearSelection();
    await loadCalendar();
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await fetch("/api/painel/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await loadBookings();
  };

  const grid = monthGrid(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Detecta se a seleção tem alguma data já bloqueada (pra mostrar botão "Liberar")
  const someSelectedAreBlocked = Array.from(selected).some((k) =>
    blockedMap.has(k)
  );
  // Pega label e status comuns (se houver) pra pré-preencher
  const selectedRows = Array.from(selected)
    .map((k) => blockedMap.get(k))
    .filter(Boolean) as BlockedDate[];
  const commonLabel =
    selectedRows.length > 0 && selectedRows.every((r) => r.label === selectedRows[0].label)
      ? selectedRows[0].label || ""
      : "";

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div>
            <div className="font-display text-lg sm:text-xl">
              TM <em className="italic font-normal text-muted">Painel da Dona</em>
            </div>
            <div className="text-xs sm:text-sm text-muted">Olá, {userName}!</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <PrefsControls className="hidden sm:flex" />
            <Button variant="outline" onClick={logout}>
              <LogOut size={16} /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="grid grid-cols-2 gap-2 sm:gap-3" role="tablist" aria-label="Seções do painel">
          <button
            role="tab"
            aria-selected={tab === "calendar"}
            onClick={() => setTab("calendar")}
            className={`flex items-center justify-center gap-2 sm:gap-3 py-3.5 sm:py-5 rounded text-sm sm:text-lg font-bold transition-colors duration-fast ${
              tab === "calendar"
                ? "bg-accent text-accent-contrast"
                : "bg-surface text-muted hover:text-ink border border-line"
            }`}
          >
            <Calendar size={18} /> Calendário
          </button>
          <button
            role="tab"
            aria-selected={tab === "bookings"}
            onClick={() => setTab("bookings")}
            className={`flex items-center justify-center gap-2 sm:gap-3 py-3.5 sm:py-5 rounded text-sm sm:text-lg font-bold transition-colors duration-fast relative ${
              tab === "bookings"
                ? "bg-accent text-accent-contrast"
                : "bg-surface text-muted hover:text-ink border border-line"
            }`}
          >
            <Inbox size={18} /> Pedidos
            {bookings.filter((b) => b.status === "NEW").length > 0 && (
              <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-danger text-bg text-xs font-mono px-1.5 sm:px-2 py-0.5 rounded-full">
                {bookings.filter((b) => b.status === "NEW").length}
              </span>
            )}
          </button>
        </div>
      </div>

      <main id="conteudo" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
        {tab === "calendar" && (
          <div>
            <div className="bg-accent/10 border border-accent/30 rounded p-4 sm:p-5 mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed">
              <strong className="text-accent">Como usar:</strong> Toque no{" "}
              <strong>1º dia</strong> do período e depois no{" "}
              <strong>último dia</strong> para selecionar o intervalo. Depois
              aperte <strong>&ldquo;Marcar&rdquo;</strong> abaixo.
            </div>

            <div className="flex items-center justify-between mb-4 sm:mb-6 bg-surface border border-line rounded p-3 sm:p-4">
              <button
                onClick={() => {
                  if (month === 0) { setMonth(11); setYear(year - 1); }
                  else setMonth(month - 1);
                }}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 min-h-[2.75rem] hover:bg-surface-2 rounded text-sm sm:text-base transition-colors duration-fast"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Mês anterior</span>
              </button>
              <div className="text-center" aria-live="polite">
                <div className="font-display text-xl sm:text-3xl">{MES_NOMES[month]}</div>
                <div className="font-mono text-xs sm:text-sm text-muted">{year}</div>
              </div>
              <button
                onClick={() => {
                  if (month === 11) { setMonth(0); setYear(year + 1); }
                  else setMonth(month + 1);
                }}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 min-h-[2.75rem] hover:bg-surface-2 rounded text-sm sm:text-base transition-colors duration-fast"
              >
                <span className="hidden sm:inline">Próximo mês</span>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="bg-surface border border-line rounded p-2 sm:p-4">
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
                {DIA_SEMANA_LONGO.map((d, i) => (
                  <div
                    key={d}
                    className="text-center font-bold text-muted py-1.5 sm:py-2"
                  >
                    <span className="hidden sm:inline text-sm">{d}</span>
                    <span className="sm:hidden text-[0.625rem]">{["D","S","T","Q","Q","S","S"][i]}</span>
                  </div>
                ))}
              </div>
              <div className={`grid grid-cols-7 gap-1 sm:gap-2 ${loading ? "opacity-50" : ""}`}>
                {grid.map((d, i) => {
                  const inMonth = d.getMonth() === month;
                  const isPast = d < today;
                  const key = ymd(d);
                  const row = blockedMap.get(key);
                  const status = row?.status;
                  const isToday = isSameDay(d, today);
                  const isSelected = selected.has(key);
                  const isAnchor = key === rangeAnchor;

                  // Preview range between anchor and hovered date
                  const pStart = rangeAnchor && hoverDate
                    ? (rangeAnchor < hoverDate ? rangeAnchor : hoverDate)
                    : null;
                  const pEnd = rangeAnchor && hoverDate
                    ? (rangeAnchor < hoverDate ? hoverDate : rangeAnchor)
                    : null;
                  const isInPreview = !!(pStart && pEnd && key >= pStart && key <= pEnd && inMonth && !isPast);

                  let cls =
                    "relative aspect-square min-h-[36px] sm:min-h-[52px] lg:min-h-[64px] flex flex-col items-center justify-center text-sm sm:text-base lg:text-xl font-medium rounded transition-colors duration-fast cursor-pointer p-0.5 sm:p-1 ";
                  if (!inMonth) cls += "text-ink/15 cursor-default ";
                  else if (isPast) cls += "text-ink/25 cursor-default ";
                  else if (status === "OCCUPIED")
                    cls += "bg-danger/15 text-danger border-2 border-danger hover:bg-danger/25 ";
                  else if (status === "PENDING")
                    cls += "bg-warn/15 text-warn border-2 border-warn hover:bg-warn/25 ";
                  else
                    cls += "bg-surface-2 text-ink hover:bg-accent/20 border-2 border-transparent ";

                  if (isInPreview && !isSelected) cls += "bg-accent/15 text-accent border-2 border-accent/40 ";
                  if (isToday) cls += "ring-2 ring-accent ring-offset-1 sm:ring-offset-2 ring-offset-surface ";
                  if (isSelected) cls += "outline outline-2 outline-accent scale-[0.96] ";
                  if (isAnchor) cls += "bg-accent/25 ";

                  return (
                    <button
                      key={i}
                      onClick={() => inMonth && !isPast && handleDayClick(d)}
                      onMouseEnter={() => { if (rangeAnchor && inMonth && !isPast) setHoverDate(key); }}
                      onMouseLeave={() => setHoverDate(null)}
                      disabled={!inMonth || isPast}
                      className={cls}
                      title={row?.label || ""}
                    >
                      <span>{inMonth ? d.getDate() : ""}</span>
                      {row?.label && (
                        <span className="hidden sm:block text-[0.5rem] sm:text-[0.5625rem] leading-tight font-normal opacity-80 line-clamp-1 max-w-full px-0.5 sm:px-1">
                          {row.label}
                        </span>
                      )}
                      {isSelected && (
                        <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {rangeAnchor && (
                <div className="mt-3 text-sm text-center text-accent" aria-live="polite">
                  Agora clique no último dia do período
                </div>
              )}

              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-line flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-base">
                <Legend color="bg-surface-2 border-line" label="Livre" />
                <Legend color="bg-warn/30 border-warn" label="Em análise" />
                <Legend color="bg-danger/30 border-danger" label="Ocupado" />
                <Legend color="bg-surface-2 border-accent outline outline-2 outline-accent" label="Selecionado" />
              </div>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 && (
              <div className="text-center py-20 text-muted">
                <Inbox size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-lg">Nenhum pedido recebido ainda.</p>
              </div>
            )}
            {bookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onUpdate={(status) => updateBookingStatus(b.id, status)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Barra de ação fixa quando há datas selecionadas */}
      {tab === "calendar" && selected.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-surface border-t-2 border-accent z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent text-accent-contrast rounded grid place-items-center font-bold text-lg sm:text-xl tabular-nums">
                {selected.size}
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg">
                  {selected.size === 1 ? "dia selecionado" : "dias selecionados"}
                </div>
                <div className="text-xs sm:text-sm text-muted font-mono">
                  {summarizeSelection(Array.from(selected).sort())}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={clearSelection}>
                <X size={16} /> Limpar
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Tag size={16} /> Marcar
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <BulkBlockModal
          count={selected.size}
          summary={summarizeSelection(Array.from(selected).sort())}
          someBlocked={someSelectedAreBlocked}
          initialLabel={commonLabel}
          onClose={() => setModalOpen(false)}
          onBlock={applyBlock}
          onUnblock={applyUnblock}
        />
      )}
    </div>
  );
}

function summarizeSelection(sorted: string[]): string {
  if (sorted.length === 0) return "";
  if (sorted.length === 1) return formatDayBR(sorted[0]);
  return `${formatDayBR(sorted[0])} → ${formatDayBR(sorted[sorted.length - 1])}`;
}

function formatDayBR(yyyymmdd: string) {
  const [y, m, d] = yyyymmdd.split("-");
  return `${d}/${m}`;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded border-2 ${color}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function BulkBlockModal({
  count,
  summary,
  someBlocked,
  initialLabel,
  onClose,
  onBlock,
  onUnblock,
}: {
  count: number;
  summary: string;
  someBlocked: boolean;
  initialLabel: string;
  onClose: () => void;
  onBlock: (status: "OCCUPIED" | "PENDING", label: string) => void;
  onUnblock: () => void;
}) {
  const [label, setLabel] = useState(initialLabel);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Marcar datas"
      className="fixed inset-0 bg-black/60 grid place-items-center z-50 p-4 sm:p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-line rounded p-5 sm:p-8 max-w-md w-full"
      >
        <div className="font-mono text-[0.6875rem] font-medium text-bronze uppercase tracking-[0.2em] mb-2">
          Marcar datas
        </div>
        <h2 className="font-display text-2xl mb-1">
          {count} {count === 1 ? "dia" : "dias"}
        </h2>
        <div className="text-base text-muted mb-6 font-mono">{summary}</div>

        <label htmlFor="nome-evento" className="block text-sm font-bold mb-2 text-ink/85">
          Nome do evento (opcional)
        </label>
        <input
          id="nome-evento"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Casamento João e Maria"
          autoFocus
          className="w-full min-h-[2.75rem] px-4 py-3 mb-6 bg-bg border border-line focus:border-accent rounded text-base outline-none transition-colors duration-fast"
        />

        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={() => onBlock("OCCUPIED", label)}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 min-h-[2.75rem] bg-danger/10 hover:bg-danger/20 border-2 border-danger text-danger rounded text-base sm:text-lg font-bold transition-colors duration-fast"
          >
            <XCircle size={20} /> Marcar como Ocupado
          </button>
          <button
            onClick={() => onBlock("PENDING", label)}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 min-h-[2.75rem] bg-warn/10 hover:bg-warn/20 border-2 border-warn text-warn rounded text-base sm:text-lg font-bold transition-colors duration-fast"
          >
            <Clock size={20} /> Marcar como Em Análise
          </button>
          {someBlocked && (
            <button
              onClick={onUnblock}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 min-h-[2.75rem] bg-accent/10 hover:bg-accent/20 border-2 border-accent text-accent rounded text-base sm:text-lg font-bold transition-colors duration-fast"
            >
              <CheckCircle2 size={20} /> Liberar todas
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 min-h-[2.75rem] text-muted hover:text-ink text-sm sm:text-base transition-colors duration-fast"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onUpdate,
}: {
  booking: Booking;
  onUpdate: (status: string) => void;
}) {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  const isTable = booking.bookingType === "TABLE";
  const date =
    booking.eventEndDate && booking.eventEndDate !== booking.eventDate
      ? `${fmt(booking.eventDate)} → ${fmt(booking.eventEndDate)}`
      : fmt(booking.eventDate);

  const statusBadge =
    {
      NEW: "bg-accent/15 border-accent text-accent",
      CONTACTED: "bg-terra/15 border-terra text-terra",
      CONFIRMED: "bg-success/15 border-success text-success",
      REJECTED: "bg-danger/15 border-danger text-danger",
    }[booking.status] || "";

  const statusLabel =
    {
      NEW: "Novo",
      CONTACTED: "Já entrei em contato",
      CONFIRMED: "Confirmado",
      REJECTED: "Recusado",
    }[booking.status] || booking.status;

  return (
    <div className="bg-surface border border-line rounded p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 font-mono text-[0.625rem] font-medium uppercase tracking-wider rounded border ${
                isTable
                  ? "bg-terra/10 text-terra border-terra/40"
                  : "bg-accent/10 text-accent border-accent/40"
              }`}
            >
              {isTable ? "🎣 Mesa" : "🎉 Salão"}
            </span>
          </div>
          <div className="font-display text-xl sm:text-2xl">{booking.clientName}</div>
          <div className="text-xs sm:text-sm text-muted mt-1">
            Recebido em{" "}
            {new Date(booking.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div
          className={`px-2 sm:px-3 py-1 border rounded-full font-mono text-[0.625rem] sm:text-xs font-medium uppercase tracking-wider ${statusBadge}`}
        >
          {statusLabel}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 text-sm sm:text-base">
        <Info icon={<Calendar size={16} />} label="Data do evento" value={date} />
        <Info icon={<Users size={16} />} label="Convidados" value={`${booking.guests} pessoas`} />
        <Info icon={<Phone size={16} />} label="WhatsApp" value={booking.whatsapp} />
        {booking.email && (
          <Info icon={<Mail size={16} />} label="E-mail" value={booking.email} />
        )}
      </div>

      {!isTable && (
        <div className="mb-4 p-4 bg-bg border border-line rounded">
          <div className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.2em] text-bronze mb-2">
            Evento e itens
          </div>
          <div className="text-base mb-2">{booking.eventType}</div>
          <div className="text-sm text-muted">
            {booking.selections.length} itens — Total estimado:{" "}
            <span className="text-accent font-bold tabular-nums">
              R$ {booking.totalEstimate.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      )}
      {booking.message && (
        <div className="mb-4 p-4 bg-bg border border-line rounded text-sm text-muted italic">
          &ldquo;{booking.message}&rdquo;
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://wa.me/${booking.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 min-h-[2.75rem] bg-accent text-accent-contrast font-bold rounded hover:opacity-90 text-sm sm:text-base transition-opacity duration-fast"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
        {booking.status === "NEW" && (
          <button
            onClick={() => onUpdate("CONTACTED")}
            className="px-3 sm:px-5 py-2.5 sm:py-3 min-h-[2.75rem] bg-terra/10 border border-terra text-terra rounded text-sm sm:text-base font-bold hover:bg-terra/20 transition-colors duration-fast"
          >
            Contatado
          </button>
        )}
        {booking.status !== "CONFIRMED" && (
          <button
            onClick={() => onUpdate("CONFIRMED")}
            className="px-3 sm:px-5 py-2.5 sm:py-3 min-h-[2.75rem] bg-success/10 border border-success text-success rounded text-sm sm:text-base font-bold hover:bg-success/20 transition-colors duration-fast"
          >
            Confirmar
          </button>
        )}
        {booking.status !== "REJECTED" && (
          <button
            onClick={() => onUpdate("REJECTED")}
            className="px-3 sm:px-5 py-2.5 sm:py-3 min-h-[2.75rem] bg-danger/10 border border-danger text-danger rounded text-sm sm:text-base font-bold hover:bg-danger/20 transition-colors duration-fast"
          >
            Recusar
          </button>
        )}
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-accent mt-0.5">{icon}</span>
      <div>
        <div className="font-mono text-[0.625rem] text-muted uppercase tracking-wider">{label}</div>
        <div className="text-base">{value}</div>
      </div>
    </div>
  );
}
