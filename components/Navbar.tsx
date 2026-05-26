"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#galeria", label: "Galeria" },
  { href: "#agendamento", label: "Agendamento" },
  { href: "#contato", label: "Contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? "bg-ink-900/95 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 group"
          onClick={() => setMenuOpen(false)}
        >
          <div className="relative w-9 h-9 sm:w-12 sm:h-12 transition-transform duration-500 group-hover:scale-105">
            <Image
              src="/brand/logo-tm.png"
              alt="TM Salão de Eventos"
              fill
              priority
              className="object-contain drop-shadow-[0_0_12px_rgba(94,234,212,0.35)]"
            />
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-sm leading-none tracking-wide">
              TM <span className="text-accent/80 italic font-normal">Salão de Eventos</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">
              Teixeira Machado · Canaã/MG
            </div>
          </div>
          <div className="sm:hidden font-display text-sm">
            TM <span className="text-accent/80 italic font-normal">Eventos</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-white/70 hover:text-white transition">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "5531984672190"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-accent text-ink-900 font-semibold text-xs sm:text-sm rounded-md hover:bg-accent-glow transition"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 grid place-items-center rounded-md border border-white/10 hover:border-white/30 transition"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ink-900/98 backdrop-blur-xl border-t border-white/5 px-4 py-6">
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-md text-white/80 hover:text-white hover:bg-white/5 transition text-base font-medium"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-white/10">
            <Link
              href="/agendamento"
              onClick={() => setMenuOpen(false)}
              className="btn-shine flex items-center justify-center gap-2 w-full py-3.5 bg-accent text-ink-900 font-bold rounded-md text-sm"
            >
              Agendar visita →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
