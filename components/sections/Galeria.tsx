"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Foto = {
  src: string;
  legenda: string;
  className: string;
};

const FOTOS: Foto[] = [
  {
    src: "/gallery/IMG_9074.PNG",
    legenda: "Vista externa · estrutura em madeira",
    className: "lg:col-span-2 lg:row-span-2 aspect-square lg:aspect-auto",
  },
  {
    src: "/gallery/IMG_9075.PNG",
    legenda: "Salão coberto principal",
    className: "aspect-[4/3]",
  },
  {
    src: "/gallery/IMG_9076.PNG",
    legenda: "Banheiro · acabamento artesanal",
    className: "aspect-[4/3]",
  },
  {
    src: "/gallery/IMG_9077.PNG",
    legenda: "Deck com vista para a natureza",
    className: "aspect-[4/3]",
  },
  {
    src: "/gallery/IMG_9078.PNG",
    legenda: "Churrasqueira e cozinha de apoio",
    className: "lg:row-span-2 aspect-[3/4]",
  },
  {
    src: "/gallery/IMG_9079.PNG",
    legenda: "Salão amplo · pé direito alto",
    className: "aspect-[4/3]",
  },
  {
    src: "/gallery/IMG_9080.PNG",
    legenda: "Área kids com escorregador",
    className: "aspect-[4/3]",
  },
];

export function Galeria() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]); // eslint-disable-line react-hooks/exhaustive-deps

  // Move o foco pro botão de fechar quando o lightbox abre
  useEffect(() => {
    if (lightbox !== null) closeRef.current?.focus();
  }, [lightbox !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => setLightbox((i) => ((i ?? 0) + 1) % FOTOS.length);
  const goPrev = () => setLightbox((i) => ((i ?? 0) - 1 + FOTOS.length) % FOTOS.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
      dx > 0 ? goNext() : goPrev();
    }
  };

  return (
    <section
      id="galeria"
      className="py-16 sm:py-24 lg:py-32 bg-surface border-y border-line scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 sm:mb-16">
          <Eyebrow className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-bronze/60" aria-hidden="true" />
            Galeria
          </Eyebrow>
          <h2 className="font-display font-normal text-display-sm text-balance max-w-2xl">
            Conheça nosso <em className="italic text-accent">espaço</em>
          </h2>
          <p className="mt-5 text-muted max-w-lg text-sm sm:text-base">
            Fotos reais do nosso espaço — estrutura em madeira, integrada à
            natureza, pensada para o seu evento.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[140px] sm:auto-rows-[160px] lg:auto-rows-[200px] gap-2 sm:gap-3 lg:gap-4">
          {FOTOS.map((foto, i) => (
            <button
              key={foto.src}
              type="button"
              onClick={() => setLightbox(i)}
              aria-label={`Ampliar foto: ${foto.legenda}`}
              className={`group relative overflow-hidden border border-line hover:border-accent text-left transition-colors duration-base ease-base ${foto.className}`}
            >
              <Image
                src={foto.src}
                alt={foto.legenda}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-[900ms] ease-base group-hover:scale-105"
              />
              {/* Legenda sempre visível, sobre faixa que garante contraste */}
              <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/75 to-transparent pt-8">
                <span className="block font-mono text-[0.5625rem] sm:text-[0.625rem] uppercase tracking-[0.24em] text-white/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="block text-xs sm:text-sm text-white font-medium line-clamp-1 mt-0.5">
                  {foto.legenda}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
          Toque nas fotos para ampliar · deslize para navegar
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={FOTOS[lightbox].legenda}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur flex flex-col items-center justify-center animate-fade-in"
          onClick={() => setLightbox(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            ref={closeRef}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-white/70 hover:text-white border border-white/20 hover:border-white/60 rounded transition-colors duration-fast z-10"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 min-w-[3rem] min-h-[3rem] flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full transition-colors duration-fast z-10"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 min-w-[3rem] min-h-[3rem] flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full transition-colors duration-fast z-10"
            aria-label="Próxima foto"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>

          <div
            className="relative w-full max-w-5xl px-16 sm:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ aspectRatio: "4/3", maxHeight: "70vh" }}>
              <Image
                src={FOTOS[lightbox].src}
                alt={FOTOS[lightbox].legenda}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <div className="mt-4 text-center text-sm text-white/80">
              {FOTOS[lightbox].legenda}
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {FOTOS.map((f, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                aria-label={`Foto ${i + 1}: ${f.legenda}`}
                aria-current={i === lightbox}
                className="min-w-[1.75rem] min-h-[2.75rem] flex items-center justify-center"
              >
                <span
                  className={`rounded-full transition-all duration-base ${
                    i === lightbox ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
