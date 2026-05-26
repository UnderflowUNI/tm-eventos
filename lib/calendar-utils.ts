export type DayStatus = "AVAILABLE" | "OCCUPIED" | "PENDING" | "PAST";

export function monthGrid(year: number, month: number): Date[] {
  // Retorna 42 dias (6 semanas) começando no domingo
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const start = new Date(year, month, 1 - startWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export const MES_NOMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const DIA_SEMANA_CURTO = ["D", "S", "T", "Q", "Q", "S", "S"];
export const DIA_SEMANA_LONGO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
