"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ink-900/85 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 transition-transform duration-500 group-hover:scale-105">
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
        </Link>

        <ul className="hidden md:flex items-center gap-8 text-sm">
          <li>
            <a href="#sobre" className="text-white/70 hover:text-white transition">
              Sobre
            </a>
          </li>
          <li>
            <a href="#galeria" className="text-white/70 hover:text-white transition">
              Galeria
            </a>
          </li>
          <li>
            <a href="#agendamento" className="text-white/70 hover:text-white transition">
              Agendamento
            </a>
          </li>
          <li>
            <a href="#contato" className="text-white/70 hover:text-white transition">
              Contato
            </a>
          </li>
        </ul>

        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "5531984672190"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-shine flex items-center gap-2 px-4 py-2.5 bg-accent text-ink-900 font-semibold text-sm rounded-md hover:bg-accent-glow transition"
        >
          <MessageCircle size={16} />
          <span>WhatsApp</span>
        </a>
      </nav>
    </header>
  );
}
