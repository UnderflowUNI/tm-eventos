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
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCalendar = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/calendar?year=${year}&month=${month}`);
    if (res.ok) setBlocked(await res.json());
    setLoading(false);
  };

  const loadBookings = async () => {
    const res = await fetch("/api/admin/bookings");
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
    router.push("/admin/login");
  };

  const blockedMap = new Map(blocked.map((b) => [b.date.split("T")[0], b]));

  const toggleDate = (d: Date) => {
    const key = ymd(d);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const applyBlock = async (
    status: "OCCUPIED" | "PENDING",
    label: string
  ) => {
    setLoading(true);
    const dates = Array.from(selected).sort();
    await fetch("/api/admin/calendar", {
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
    await fetch(`/api/admin/calendar?dates=${dates.join(",")}`, {
      method: "DELETE",
    });
    setModalOpen(false);
    clearSelection();
    await loadCalendar();
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await fetch("/api/admin/bookings", {
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
    <div className="min-h-screen bg-ink-900 text-white">
      <header className="border-b border-white/10 bg-ink-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border border-accent/60 rounded-md grid place-items-center font-display text-accent text-lg sm:text-xl">
              TM
            </div>
            <div>
              <div className="font-display text-lg sm:text-xl">Painel da Dona</div>
              <div className="text-xs sm:text-sm text-white/50">Olá, {userName}!</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border border-white/15 hover:border-white/40 rounded-md text-sm sm:text-base"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={() => setTab("calendar")}
            className={`flex items-center justify-center gap-2 sm:gap-3 py-3.5 sm:py-5 rounded-lg text-sm sm:text-lg font-bold transition ${
              tab === "calendar"
                ? "bg-accent text-ink-900"
                : "bg-ink-800 text-white/70 hover:text-white border border-white/10"
            }`}
          >
            <Calendar size={18} /> Calendário
          </button>
          <button
            onClick={() => setTab("bookings")}
            className={`flex items-center justify-center gap-2 sm:gap-3 py-3.5 sm:py-5 rounded-lg text-sm sm:text-lg font-bold transition relative ${
              tab === "bookings"
                ? "bg-accent text-ink-900"
                : "bg-ink-800 text-white/70 hover:text-white border border-white/10"
            }`}
          >
            <Inbox size={18} /> Pedidos
            {bookings.filter((b) => b.status === "NEW").length > 0 && (
              <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                {bookings.filter((b) => b.status === "NEW").length}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
        {tab === "calendar" && (
          <div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 sm:p-5 mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed">
              <strong className="text-accent">Como usar:</strong> Toque nos dias
              pra <strong>selecionar</strong> (pode selecionar vários!). Depois
              aperte <strong>"Marcar"</strong> abaixo e escolha o status.
            </div>

            <div className="flex items-center justify-between mb-4 sm:mb-6 bg-ink-800 border border-white/10 rounded-lg p-3 sm:p-4">
              <button
                onClick={() => {
                  if (month === 0) { setMonth(11); setYear(year - 1); }
                  else setMonth(month - 1);
                }}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 hover:bg-ink-700 rounded-md text-sm sm:text-base"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Mês anterior</span>
              </button>
              <div className="text-center">
                <div className="font-display text-xl sm:text-3xl">{MES_NOMES[month]}</div>
                <div className="text-xs sm:text-base text-white/50">{year}</div>
              </div>
              <button
                onClick={() => {
                  if (month === 11) { setMonth(0); setYear(year + 1); }
                  else setMonth(month + 1);
                }}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 hover:bg-ink-700 rounded-md text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Próximo mês</span>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="bg-ink-800 border border-white/10 rounded-lg p-2 sm:p-4">
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
                {DIA_SEMANA_LONGO.map((d, i) => (
                  <div
                    key={d}
                    className="text-center font-bold text-white/60 py-1.5 sm:py-2"
                  >
                    <span className="hidden sm:inline text-sm">{d}</span>
                    <span className="sm:hidden text-[10px]">{["D","S","T","Q","Q","S","S"][i]}</span>
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

                  let cls =
                    "relative aspect-square min-h-[36px] sm:min-h-[52px] lg:min-h-[64px] flex flex-col items-center justify-center text-sm sm:text-base lg:text-xl font-medium rounded-md transition cursor-pointer p-0.5 sm:p-1 ";
                  if (!inMonth) cls += "text-white/15 cursor-default ";
                  else if (isPast) cls += "text-white/25 cursor-default ";
                  else if (status === "OCCUPIED")
                    cls += "bg-red-500/25 text-red-200 border-2 border-red-500 hover:bg-red-500/40 ";
                  else if (status === "PENDING")
                    cls += "bg-amber-500/25 text-amber-200 border-2 border-amber-500 hover:bg-amber-500/40 ";
                  else
                    cls += "bg-ink-700 text-white hover:bg-accent/30 hover:text-accent border-2 border-transparent ";

                  if (isToday) cls += "ring-2 ring-accent ring-offset-1 sm:ring-offset-2 ring-offset-ink-800 ";
                  if (isSelected) cls += "outline outline-2 sm:outline-3 outline-accent scale-[0.96] ";

                  return (
                    <button
                      key={i}
                      onClick={() => inMonth && !isPast && toggleDate(d)}
                      disabled={!inMonth || isPast}
                      className={cls}
                      title={row?.label || ""}
                    >
                      <span>{d.getDate()}</span>
                      {row?.label && (
                        <span className="hidden sm:block text-[8px] sm:text-[9px] leading-tight font-normal opacity-80 line-clamp-1 max-w-full px-0.5 sm:px-1">
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

              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-base">
                <Legend color="bg-ink-700 border-white/20" label="Livre" />
                <Legend color="bg-amber-500/40 border-amber-500" label="Em análise" />
                <Legend color="bg-red-500/40 border-red-500" label="Ocupado" />
                <Legend color="bg-ink-700 border-accent outline outline-2 outline-accent" label="Selecionado" />
              </div>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 && (
              <div className="text-center py-20 text-white/40">
                <Inbox size={48} className="mx-auto mb-4 opacity-30" />
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
        <div className="fixed bottom-0 inset-x-0 bg-ink-800 border-t-2 border-accent z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent text-ink-900 rounded-md grid place-items-center font-bold text-lg sm:text-xl">
                {selected.size}
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg">
                  {selected.size === 1 ? "dia selecionado" : "dias selecionados"}
                </div>
                <div className="text-xs sm:text-sm text-white/60">
                  {summarizeSelection(Array.from(selected).sort())}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={clearSelection}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-white/20 hover:border-white/40 rounded-md text-sm sm:text-base"
              >
                <X size={16} /> Limpar
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-accent text-ink-900 font-bold rounded-md hover:bg-accent-glow text-sm sm:text-base"
              >
                <Tag size={16} /> Marcar
              </button>
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
      <div className={`w-5 h-5 rounded border-2 ${color}`} />
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 grid place-items-center z-50 p-4 sm:p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-ink-800 border border-white/15 rounded-xl p-5 sm:p-8 max-w-md w-full"
      >
        <div className="text-sm text-accent uppercase tracking-[0.2em] mb-2">
          Marcar datas
        </div>
        <h2 className="font-display text-2xl mb-1">
          {count} {count === 1 ? "dia" : "dias"}
        </h2>
        <div className="text-base text-white/60 mb-6">{summary}</div>

        <label className="block text-sm font-bold mb-2 text-white/80">
          Nome do evento (opcional)
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Casamento João e Maria"
          autoFocus
          className="w-full px-4 py-3 mb-6 bg-ink-900 border border-white/10 focus:border-accent rounded-md text-base outline-none"
        />

        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={() => onBlock("OCCUPIED", label)}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-red-200 rounded-lg text-base sm:text-lg font-bold transition"
          >
            <XCircle size={20} /> Marcar como Ocupado
          </button>
          <button
            onClick={() => onBlock("PENDING", label)}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-500 text-amber-200 rounded-lg text-base sm:text-lg font-bold transition"
          >
            <Clock size={20} /> Marcar como Em Análise
          </button>
          {someBlocked && (
            <button
              onClick={onUnblock}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-accent/20 hover:bg-accent/30 border-2 border-accent text-accent rounded-lg text-base sm:text-lg font-bold transition"
            >
              <CheckCircle2 size={20} /> Liberar todas
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 text-white/50 hover:text-white text-sm sm:text-base"
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
      NEW: "bg-accent/20 border-accent text-accent",
      CONTACTED: "bg-blue-500/20 border-blue-500 text-blue-300",
      CONFIRMED: "bg-green-500/20 border-green-500 text-green-300",
      REJECTED: "bg-red-500/20 border-red-500 text-red-300",
    }[booking.status] || "";

  const statusLabel =
    {
      NEW: "Novo",
      CONTACTED: "Já entrei em contato",
      CONFIRMED: "Confirmado",
      REJECTED: "Recusado",
    }[booking.status] || booking.status;

  return (
    <div className="bg-ink-800 border border-white/10 rounded-lg p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                isTable
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "bg-accent/20 text-accent border border-accent/40"
              }`}
            >
              {isTable ? "🎣 Mesa" : "🎉 Salão"}
            </span>
          </div>
          <div className="font-display text-xl sm:text-2xl">{booking.clientName}</div>
          <div className="text-xs sm:text-sm text-white/50 mt-1">
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
          className={`px-2 sm:px-3 py-1 border rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${statusBadge}`}
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
        <div className="mb-4 p-4 bg-ink-900 rounded-md">
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2">
            Evento e itens
          </div>
          <div className="text-base mb-2">{booking.eventType}</div>
          <div className="text-sm text-white/70">
            {booking.selections.length} itens — Total estimado:{" "}
            <span className="text-accent font-bold">
              R$ {booking.totalEstimate.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      )}
      {booking.message && (
        <div className="mb-4 p-4 bg-ink-900 rounded-md text-sm text-white/70 italic">
          "{booking.message}"
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://wa.me/${booking.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-accent text-ink-900 font-bold rounded-md hover:bg-accent-glow text-sm sm:text-base"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
        {booking.status === "NEW" && (
          <button
            onClick={() => onUpdate("CONTACTED")}
            className="px-3 sm:px-5 py-2.5 sm:py-3 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-md text-sm sm:text-base font-bold hover:bg-blue-500/30"
          >
            Contatado
          </button>
        )}
        {booking.status !== "CONFIRMED" && (
          <button
            onClick={() => onUpdate("CONFIRMED")}
            className="px-3 sm:px-5 py-2.5 sm:py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-md text-sm sm:text-base font-bold hover:bg-green-500/30"
          >
            Confirmar
          </button>
        )}
        {booking.status !== "REJECTED" && (
          <button
            onClick={() => onUpdate("REJECTED")}
            className="px-3 sm:px-5 py-2.5 sm:py-3 bg-red-500/20 border border-red-500 text-red-300 rounded-md text-sm sm:text-base font-bold hover:bg-red-500/30"
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
        <div className="text-xs text-white/50 uppercase tracking-wider">{label}</div>
        <div className="text-base">{value}</div>
      </div>
    </div>
  );
}
