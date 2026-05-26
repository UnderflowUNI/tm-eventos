"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthGrid, MES_NOMES, DIA_SEMANA_CURTO, ymd, isSameDay } from "@/lib/calendar-utils";

type BlockedDate = {
  date: string;
  status: "OCCUPIED" | "PENDING";
};

export function PublicCalendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [blocked, setBlocked] = useState<Map<string, "OCCUPIED" | "PENDING">>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data: BlockedDate[]) => {
        const map = new Map<string, "OCCUPIED" | "PENDING">();
        data.forEach((b) => map.set(b.date.split("T")[0], b.status));
        setBlocked(map);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  const grid = monthGrid(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };
  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };

  return (
    <div className="bg-ink-800/60 backdrop-blur-sm border border-white/10 rounded-lg p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prev}
          className="w-10 h-10 grid place-items-center border border-white/10 hover:border-accent hover:text-accent rounded-md transition"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-display text-2xl">{MES_NOMES[month]}</div>
          <div className="text-xs text-white/40 tracking-[0.3em] uppercase mt-1">{year}</div>
        </div>
        <button
          onClick={next}
          className="w-10 h-10 grid place-items-center border border-white/10 hover:border-accent hover:text-accent rounded-md transition"
          aria-label="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIA_SEMANA_CURTO.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] uppercase tracking-[0.2em] text-white/40 py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1 ${loading ? "opacity-50" : ""}`}>
        {grid.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const isPast = d < today;
          const status = blocked.get(ymd(d));
          const isToday = isSameDay(d, today);

          let cls =
            "cal-cell aspect-square grid place-items-center text-sm rounded-md transition relative ";
          if (!inMonth) cls += "text-white/15 ";
          else if (isPast) cls += "text-white/20 line-through ";
          else if (status === "OCCUPIED")
            cls +=
              "bg-red-500/15 text-red-300 border border-red-500/40 cursor-not-allowed ";
          else if (status === "PENDING")
            cls +=
              "bg-amber-500/15 text-amber-300 border border-amber-500/40 ";
          else cls += "text-white/80 hover:bg-accent/10 hover:text-accent ";

          if (isToday) cls += "ring-1 ring-accent ";

          return (
            <div key={i} className={cls} aria-label={d.toLocaleDateString("pt-BR")}>
              {d.getDate()}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        <Legend color="bg-accent/30 border-accent" label="Disponível" />
        <Legend color="bg-amber-500/30 border-amber-500" label="Em análise" />
        <Legend color="bg-red-500/30 border-red-500" label="Ocupado" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-white/60">
      <div className={`w-3 h-3 rounded-sm border ${color}`} />
      <span>{label}</span>
    </div>
  );
}
