"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { PrefsControls } from "./PrefsControls";
import { ButtonLink } from "@/components/ui/Button";

// Âncoras com "/" na frente para funcionarem a partir de qualquer rota.
const NAV_LINKS = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#galeria", label: "Galeria" },
  { href: "/#agendamento", label: "Agendamento" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 inset-x-0 z-50 bg-bg/95 backdrop-blur transition-shadow duration-base ${
        scrolled || menuOpen ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="font-display text-lg sm:text-xl font-semibold tracking-tight shrink-0"
        >
          TM{" "}
          <em className="italic font-normal text-muted">Salão de Eventos</em>
        </Link>

        {/* Navegação desktop */}
        <ul className="hidden lg:flex items-center gap-7 text-sm">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-muted hover:text-ink transition-colors duration-fast py-2"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <PrefsControls className="hidden md:flex" />
          <ButtonLink href="/agendamento" className="hidden sm:inline-flex">
            Agendar visita
          </ButtonLink>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden min-w-[2.75rem] min-h-[2.75rem] grid place-items-center rounded border border-line text-muted hover:text-ink transition-colors duration-fast"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden bg-bg border-t border-line px-4 sm:px-6 py-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center min-h-[2.75rem] px-3 py-2.5 rounded text-ink/85 hover:text-ink hover:bg-surface-2 transition-colors duration-fast text-base font-medium"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-5 pt-5 border-t border-line flex flex-col gap-3">
            <ButtonLink
              href="/agendamento"
              size="lg"
              onClick={() => setMenuOpen(false)}
            >
              Agendar visita →
            </ButtonLink>
            <ButtonLink
              href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "5532984969955"}`}
              variant="outline"
              size="lg"
            >
              <MessageCircle size={17} />
              Falar no WhatsApp
            </ButtonLink>
            <div className="flex justify-center pt-2">
              <PrefsControls />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
