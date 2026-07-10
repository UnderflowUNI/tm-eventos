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

  const canHover = (d: Date, dateStr: string) =>
    !!onDayClick && selectedStart && !selectedEnd &&
    d.getMonth() === month && d >= today && blocked.get(dateStr) !== "OCCUPIED";

  return (
    <div className="bg-surface border border-line rounded p-4 sm:p-6 lg:p-8">
      {/* Navegação de mês */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <button
          onClick={prev}
          className="min-w-[2.75rem] min-h-[2.75rem] grid place-items-center border border-line hover:border-accent hover:text-accent rounded transition-colors duration-fast"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-center" aria-live="polite">
          <div className="font-display text-xl sm:text-2xl">{MES_NOMES[month]}</div>
          <div className="font-mono text-[0.625rem] text-muted tracking-[0.3em] uppercase mt-0.5">{year}</div>
        </div>
        <button
          onClick={next}
          className="min-w-[2.75rem] min-h-[2.75rem] grid place-items-center border border-line hover:border-accent hover:text-accent rounded transition-colors duration-fast"
          aria-label="Próximo mês"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-1 sm:mb-2">
        {DIA_SEMANA_CURTO.map((d, i) => (
          <div key={i} className="text-center font-mono text-[0.5625rem] sm:text-[0.625rem] uppercase tracking-[0.15em] text-muted py-1.5 sm:py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className={`grid grid-cols-7 ${loading ? "opacity-50" : ""}`}>
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
          const clickable = !!onDayClick && inMonth && !isPast && !occupied;

          let cls = "relative aspect-square grid place-items-center text-xs sm:text-sm transition-colors duration-fast select-none ";

          if (!inMonth) {
            cls += "text-ink/15 ";
          } else if (start || end) {
            cls += "z-10 ";
          } else if (inRng) {
            cls += "text-accent ";
          } else if (isPast) {
            cls += "text-ink/25 line-through ";
          } else if (occupied) {
            cls += "text-danger cursor-not-allowed ";
          } else if (pending) {
            cls += "text-warn ";
          } else {
            cls += "text-ink/85 ";
          }

          if (!inMonth) {
            return <div key={i} aria-hidden="true" className={cls} />;
          }

          const label = `${d.getDate()} de ${MES_NOMES[month]}${occupied ? " — ocupado" : pending ? " — em análise" : ""}`;

          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={!clickable && !!onDayClick}
              tabIndex={onDayClick ? undefined : -1}
              aria-label={label}
              aria-pressed={onDayClick ? start || end || inRng : undefined}
              onClick={() => clickable && onDayClick?.(dateStr)}
              onMouseEnter={() => canHover(d, dateStr) && setHoverDate(dateStr)}
              onMouseLeave={() => setHoverDate("")}
            >
              {/* Fundo de range contínuo (sem gaps) */}
              {inRng && (
                <span className="absolute inset-0 bg-accent/15 pointer-events-none" />
              )}

              {/* Círculo do dia selecionado (início/fim) */}
              {(start || end) && (
                <span className="absolute inset-[2px] rounded-full bg-accent pointer-events-none" />
              )}

              {/* Metade de fundo para conectar o range ao círculo */}
              {start && rEnd && rEnd !== rStart && (
                <span className="absolute top-0 bottom-0 right-0 w-1/2 bg-accent/15 pointer-events-none" />
              )}
              {end && rStart && rEnd !== rStart && (
                <span className="absolute top-0 bottom-0 left-0 w-1/2 bg-accent/15 pointer-events-none" />
              )}

              {/* Indicador de hoje */}
              {isToday && !start && !end && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent pointer-events-none" />
              )}

              {/* Indicador de ocupado */}
              {occupied && (
                <span className="absolute inset-[3px] rounded-sm bg-danger/10 border border-danger/50 pointer-events-none" />
              )}

              {/* Indicador de pendente */}
              {pending && (
                <span className="absolute inset-[3px] rounded-sm bg-warn/10 border border-warn/50 pointer-events-none" />
              )}

              {/* Hover highlight */}
              {clickable && !start && !end && !occupied && !pending && (
                <span className="absolute inset-[2px] rounded-full hover:bg-accent/10 transition-colors duration-fast" />
              )}

              <span
                className={`relative z-10 font-medium pointer-events-none ${
                  start || end ? "text-accent-contrast" : ""
                }`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dica de seleção de período */}
      {onDayClick && selectedStart && !selectedEnd && (
        <div className="mt-3 sm:mt-4 text-[0.6875rem] text-accent text-center" aria-live="polite">
          Clique em outra data para definir o período
        </div>
      )}

      {/* Legenda */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-line flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs">
        <Legend chip="bg-accent/25 border-accent" label="Disponível" />
        <Legend chip="bg-warn/20 border-warn" label="Em análise" />
        <Legend chip="bg-danger/20 border-danger" label="Ocupado" />
      </div>
    </div>
  );
}

function Legend({ chip, label }: { chip: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted">
      <span className={`w-3 h-3 rounded-sm border ${chip}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
