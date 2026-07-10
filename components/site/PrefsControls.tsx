"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";
type FontScale = "" | "1" | "2";

const SCALES: { value: FontScale; label: string; title: string }[] = [
  { value: "", label: "A", title: "Tamanho de fonte padrão" },
  { value: "1", label: "A+", title: "Fonte grande" },
  { value: "2", label: "A++", title: "Fonte extra grande" },
];

// Toggle de tema + controle A/A+/A++. Lê o estado que o script inline do
// layout já aplicou em <html> e persiste as escolhas em localStorage.
export function PrefsControls({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [scale, setScale] = useState<FontScale>("");

  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    const f = root.dataset.fontScale;
    setScale(f === "1" || f === "2" ? f : "");
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("tm-theme", next);
    } catch {}
    setTheme(next);
  };

  const applyScale = (next: FontScale) => {
    const root = document.documentElement;
    if (next) root.dataset.fontScale = next;
    else delete root.dataset.fontScale;
    try {
      localStorage.setItem("tm-font-scale", next);
    } catch {}
    setScale(next);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="group"
        aria-label="Tamanho da fonte"
        className="flex items-center border border-line rounded overflow-hidden"
      >
        {SCALES.map((s) => (
          <button
            key={s.label}
            type="button"
            title={s.title}
            aria-pressed={scale === s.value}
            onClick={() => applyScale(s.value)}
            className={`min-w-[2.75rem] min-h-[2.75rem] px-2 font-mono text-xs font-medium transition-colors duration-fast ${
              scale === s.value
                ? "bg-accent text-accent-contrast"
                : "text-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
        title={theme === "dark" ? "Tema claro" : "Tema escuro"}
        className="min-w-[2.75rem] min-h-[2.75rem] grid place-items-center border border-line rounded text-muted hover:text-ink hover:bg-surface-2 transition-colors duration-fast"
      >
        {/* Antes da hidratação o tema é desconhecido — mostra o ícone neutro */}
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </div>
  );
}
