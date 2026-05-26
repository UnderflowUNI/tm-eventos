"use client";

import Link from "next/link";
import { Calendar, Play, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const HERO_SLIDES = [
  "/gallery/IMG_9074.PNG",
  "/gallery/IMG_9075.PNG",
  "/gallery/IMG_9079.PNG",
];

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden grain wood-pattern">
      {/* Slideshow com ken-burns + parallax */}
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        {HERO_SLIDES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-out ${
              active === i ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${src})`,
              transform: active === i ? "scale(1.08)" : "scale(1)",
              transition:
                "opacity 2s ease-out, transform 8s ease-out",
              filter: "brightness(0.72) contrast(1.05) saturate(0.9)",
            }}
          />
        ))}

        {/* Vinheta teal/escuro para fundir com o tema */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-ink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-ink-900/60" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 70% 50%, rgba(94,234,212,0.10), transparent 55%)",
          }}
        />
        {/* Vinheta lateral para profundidade */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 220px 60px rgba(0,0,0,0.85)",
          }}
        />
      </div>

      {/* Linhas decorativas */}
      <div className="absolute top-1/3 left-0 right-0 hairline" />
      <div className="absolute bottom-1/4 left-0 right-0 hairline opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 sm:pt-36 lg:pt-44 pb-20 sm:pb-28 lg:pb-32 min-h-screen flex flex-col justify-center">
        <div
          className="inline-flex items-center gap-3 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.35em] text-accent/80 mb-6 sm:mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="w-8 sm:w-12 h-px bg-accent/60" />
          Canaã — MG · Desde sempre
        </div>

        <h1
          className="font-display font-light text-5xl sm:text-7xl lg:text-[8.5rem] leading-[0.95] tracking-tight max-w-4xl opacity-0 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          Seu evento
          <br />
          <span className="italic font-normal">começa</span>{" "}
          <span className="text-accent-glow">aqui</span>
          <span className="text-accent">.</span>
        </h1>

        <p
          className="mt-6 sm:mt-10 max-w-xl text-base sm:text-lg text-white/70 leading-relaxed opacity-0 animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          Estrutura completa para casamentos, formaturas, aniversários e eventos
          especiais. Salão coberto, buffet próprio e churrasco preparado na hora.
        </p>

        <div
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.8s" }}
        >
          <Link
            href="/agendamento"
            className="btn-shine inline-flex items-center justify-center gap-3 px-6 sm:px-7 py-3.5 sm:py-4 bg-accent text-ink-900 font-semibold rounded-md hover:bg-accent-glow transition group text-sm sm:text-base"
          >
            <Calendar size={17} />
            Agendar visita
            <ArrowRight
              size={17}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <a
            href="#galeria"
            className="inline-flex items-center justify-center gap-3 px-6 sm:px-7 py-3.5 sm:py-4 border border-white/15 hover:border-white/40 rounded-md transition backdrop-blur-sm bg-ink-900/20 text-sm sm:text-base"
          >
            <Play size={15} className="text-accent" />
            Conhecer o espaço
          </a>
        </div>

        {/* Indicador de slide ativo */}
        <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-px transition-all duration-500 ${
                active === i
                  ? "w-10 sm:w-12 bg-accent"
                  : "w-5 sm:w-6 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 sm:bottom-10 left-4 sm:left-6 lg:left-10 hidden md:flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/40 animate-float">
          <span className="w-px h-12 bg-white/30" />
          <span>Role para descobrir</span>
        </div>

        {/* Ornamento canto direito */}
        <div className="absolute bottom-8 sm:bottom-10 right-4 sm:right-6 lg:right-10 hidden md:block text-right text-[10px] uppercase tracking-[0.3em] text-white/30">
          <div className="font-display text-3xl text-accent/80 mb-1 normal-case tracking-normal italic">
            est. 2018
          </div>
          <div>CNPJ 60.307.144/0001-17</div>
        </div>
      </div>
    </section>
  );
}
