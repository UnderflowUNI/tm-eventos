"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthGrid, MES_NOMES, DIA_SEMANA_CURTO, ymd, isSameDay } from "@/lib/calendar-utils";

type BlockedDate = { date: string; status: "OCCUPIED" | "PENDING" };

interface Props {
  selectedStart?: string;   // YYYY-MM-DD
  selectedEnd?: string;     // YYYY-MM-DD
  onDayClick?: (date: string) => void;
}

export function PublicCalendar({ selectedStart = "", selectedEnd = "", onDayClick }: Props = {}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [blocked, setBlocked] = useState<Map<string, "OCCUPIED" | "PENDING">>(new Map());
  const [loading, setLoading] = useState(true);
  const [hoverDate, setHoverDate] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data: BlockedDate[]) => {
        const m = new Map<string, "OCCUPIED" | "PENDING">();
        data.forEach((b) => m.set(b.date.split("T")[0], b.status));
        setBlocked(m);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  const grid = monthGrid(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next = () => { month === 11 ? (setMonth(0), setYear(year + 1)) : setMonth(month + 1); };
  const prev = () => { month === 0  ? (setMonth(11), setYear(year - 1)) : setMonth(month - 1); };

  // Determina o intervalo a exibir (com hover preview)
  const tentativeEnd = selectedStart && !selectedEnd ? hoverDate : "";
  const a = selectedStart;
  const b = selectedEnd || tentativeEnd;
  const [rStart, rEnd] = a && b ? (a <= b ? [a, b] : [b, a]) : [a, ""];

  const isRangeStart = (s: string) => !!rStart && s === rStart;
  const isRangeEnd   = (s: string) => !!rEnd   && s === rEnd && rEnd !== rStart;
  const isInRange    = (s: string) => !!rStart && !!rEnd && s > rStart && s < rEnd;

  const handleClick = (d: Date, dateStr: string) => {
    if (!onDayClick) return;
    if (d.getMonth() !== month) return;
    if (d < today) return;
    if (blocked.get(dateStr) === "OCCUPIED") return;
    onDayClick(dateStr);
  };

  const canHover = (d: Date, dateStr: string) =>
    !!onDayClick && selectedStart && !selectedEnd &&
    d.getMonth() === month && d >= today && blocked.get(dateStr) !== "OCCUPIED";

  return (
    <div className="bg-ink-800/60 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6 lg:p-8">
      {/* Navegação de mês */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <button onClick={prev} className="w-9 h-9 sm:w-10 sm:h-10 grid place-items-center border border-white/10 hover:border-accent hover:text-accent rounded-md transition" aria-label="Mês anterior">
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <div className="font-display text-xl sm:text-2xl">{MES_NOMES[month]}</div>
          <div className="text-[10px] text-white/40 tracking-[0.3em] uppercase mt-0.5">{year}</div>
        </div>
        <button onClick={next} className="w-9 h-9 sm:w-10 sm:h-10 grid place-items-center border border-white/10 hover:border-accent hover:text-accent rounded-md transition" aria-label="Próximo mês">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-0 mb-1 sm:mb-2">
        {DIA_SEMANA_CURTO.map((d, i) => (
          <div key={i} className="text-center text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-white/40 py-1.5 sm:py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className={`grid grid-cols-7 gap-0 ${loading ? "opacity-50" : ""}`}>
        {grid.map((d, i) => {
          const inMonth  = d.getMonth() === month;
          const isPast   = d < today;
          const dateStr  = ymd(d);
          const status   = blocked.get(dateStr);
          const isToday  = isSameDay(d, today);
          const start    = isRangeStart(dateStr);
          const end      = isRangeEnd(dateStr);
          const inRng    = inMonth && isInRange(dateStr);
          const occupied = status === "OCCUPIED";
          const pending  = status === "PENDING";
          const clickable = onDayClick && inMonth && !isPast && !occupied;

          // Classes base da célula
          let cls = "relative aspect-square grid place-items-center text-xs sm:text-sm transition-all select-none ";

          if (!inMonth) {
            cls += "text-white/10 ";
          } else if (start || end) {
            cls += "z-10 ";
          } else if (inRng) {
            cls += "bg-accent/15 text-accent/90 ";
          } else if (isPast) {
            cls += "text-white/20 line-through ";
          } else if (occupied) {
            cls += "text-red-300 cursor-not-allowed ";
          } else if (pending) {
            cls += "text-amber-300 ";
          } else {
            cls += "text-white/80 ";
          }

          if (clickable && !start && !end && !inRng) cls += "cursor-pointer ";
          if (clickable && inRng) cls += "cursor-pointer hover:bg-accent/25 ";

          return (
            <div key={i} className={cls}
              onClick={() => handleClick(d, dateStr)}
              onMouseEnter={() => canHover(d, dateStr) && setHoverDate(dateStr)}
              onMouseLeave={() => setHoverDate("")}
            >
              {/* Fundo de range contínuo (sem gaps) */}
              {inRng && (
                <span className="absolute inset-0 bg-accent/15 pointer-events-none" />
              )}

              {/* Círculo do dia selecionado (início/fim) */}
              {(start || end) && inMonth && (
                <span className="absolute inset-[2px] rounded-full bg-accent pointer-events-none" />
              )}

              {/* Metade de fundo para conectar o range ao círculo */}
              {start && rEnd && rEnd !== rStart && inMonth && (
                <span className="absolute top-0 bottom-0 right-0 w-1/2 bg-accent/15 pointer-events-none" />
              )}
              {end && rStart && rEnd !== rStart && inMonth && (
                <span className="absolute top-0 bottom-0 left-0 w-1/2 bg-accent/15 pointer-events-none" />
              )}

              {/* Indicador de hoje */}
              {isToday && !start && !end && inMonth && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent pointer-events-none" />
              )}

              {/* Indicador de ocupado */}
              {occupied && inMonth && (
                <span className="absolute inset-[3px] rounded-sm bg-red-500/15 border border-red-500/40 pointer-events-none" />
              )}

              {/* Indicador de pendente */}
              {pending && inMonth && (
                <span className="absolute inset-[3px] rounded-sm bg-amber-500/15 border border-amber-500/40 pointer-events-none" />
              )}

              {/* Hover highlight */}
              {clickable && !start && !end && !occupied && !pending && inMonth && !isPast && (
                <span className="absolute inset-[2px] rounded-full bg-accent/0 hover:bg-accent/15 transition-colors pointer-events-none" />
              )}

              <span className="relative z-10 font-medium" style={{ color: (start || end) ? "#0f1a19" : undefined }}>
                {inMonth ? d.getDate() : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dica de seleção de período */}
      {onDayClick && selectedStart && !selectedEnd && (
        <div className="mt-3 sm:mt-4 text-[11px] text-accent/70 text-center animate-pulse">
          Clique em outra data para definir o período
        </div>
      )}

      {/* Legenda */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10 flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs">
        <Legend color="bg-accent/30 border-accent" label="Disponível" />
        <Legend color="bg-amber-500/30 border-amber-500" label="Em análise" />
        <Legend color="bg-red-500/30 border-red-500" label="Ocupado" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-white/60">
      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border ${color}`} />
      <span>{label}</span>
    </div>
  );
}
