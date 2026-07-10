"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const IDLE_MS = 30 * 60 * 1000; // 30 minutos sem ação → logout
const WARN_MS = 5 * 60 * 1000;  // avisa 5 minutos antes

const EVENTS = [
  "mousedown", "mousemove", "keydown",
  "scroll", "touchstart", "click", "wheel",
] as const;

export function InactivityGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const warnTimer = useRef<ReturnType<typeof setTimeout>>();
  const countdownRef = useRef<ReturnType<typeof setInterval>>();
  const [showWarning, setShowWarning] = useState(false);
  const [seconds, setSeconds] = useState(WARN_MS / 1000);

  const doLogout = useCallback(async () => {
    clearTimeout(idleTimer.current);
    clearTimeout(warnTimer.current);
    clearInterval(countdownRef.current);
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/painel/login?motivo=inatividade");
  }, [router]);

  const reset = useCallback(() => {
    if (showWarning) return; // não interrompe se aviso já apareceu
    clearTimeout(idleTimer.current);
    clearTimeout(warnTimer.current);

    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
      setSeconds(WARN_MS / 1000);
      clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }, IDLE_MS - WARN_MS);

    idleTimer.current = setTimeout(doLogout, IDLE_MS);
  }, [doLogout, showWarning]);

  const stayIn = useCallback(() => {
    setShowWarning(false);
    clearInterval(countdownRef.current);
    reset();
  }, [reset]);

  useEffect(() => {
    EVENTS.forEach((e) => document.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      EVENTS.forEach((e) => document.removeEventListener(e, reset));
      clearTimeout(idleTimer.current);
      clearTimeout(warnTimer.current);
      clearInterval(countdownRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const countdown = mins > 0
    ? `${mins}m ${String(secs).padStart(2, "0")}s`
    : `${seconds}s`;

  return (
    <>
      {children}

      {showWarning && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Sessão prestes a expirar"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-surface border border-line rounded p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-warn/10 border border-warn/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7 text-warn" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="font-display text-xl mb-2">Sessão prestes a expirar</h2>
            <p className="text-muted text-sm mb-1">
              Você ficou inativo por 25 minutos.
            </p>
            <p className="text-muted text-sm mb-6">
              Saindo automaticamente em{" "}
              <span className="text-warn font-bold tabular-nums">{countdown}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={doLogout}
                className="flex-1 py-2.5 min-h-[2.75rem] border border-line rounded text-sm hover:border-accent hover:text-accent transition-colors duration-fast"
              >
                Sair agora
              </button>
              <button
                onClick={stayIn}
                className="flex-1 py-2.5 min-h-[2.75rem] bg-accent text-accent-contrast font-bold rounded text-sm hover:opacity-90 transition-opacity duration-fast"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
