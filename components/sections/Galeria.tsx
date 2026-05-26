"use client";

import { useEffect, useRef, useState } from "react";

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
  const [visible, setVisible] = useState<Set<number>>(new Set());
  const [lightbox, setLightbox] = useState<number | null>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number(e.target.getAttribute("data-idx"));
            setVisible((v) => new Set(v).add(idx));
          }
        });
      },
      { threshold: 0.15 }
    );
    refs.current.forEach((r) => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (lightbox === null) return;
      if (e.key === "ArrowRight")
        setLightbox((i) => ((i ?? 0) + 1) % FOTOS.length);
      if (e.key === "ArrowLeft")
        setLightbox((i) => ((i ?? 0) - 1 + FOTOS.length) % FOTOS.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <section id="galeria" className="relative py-20 sm:py-28 lg:py-32 bg-ink-900 overflow-hidden">
      {/* Glow ambiente teal de fundo */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(94,234,212,0.06), transparent 50%), radial-gradient(circle at 80% 70%, rgba(184,133,79,0.05), transparent 50%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10 sm:mb-16 lg:mb-20">
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.35em] text-accent/80 mb-5 sm:mb-6 inline-flex items-center gap-3">
            <span className="w-8 sm:w-12 h-px bg-accent/60" />
            Galeria
            <span className="w-8 sm:w-12 h-px bg-accent/60" />
          </div>
          <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
            Conheça nosso <span className="italic text-accent-glow">espaço</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-white/60 max-w-lg mx-auto text-sm sm:text-base px-4 sm:px-0">
            Fotos reais do nosso espaço — estrutura em madeira, integrada à
            natureza, pensada para o seu evento.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[140px] sm:auto-rows-[160px] lg:auto-rows-[200px] gap-2 sm:gap-3 lg:gap-4">
          {FOTOS.map((foto, i) => (
            <div
              key={foto.src}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-idx={i}
              onClick={() => setLightbox(i)}
              className={`relative overflow-hidden group cursor-pointer ring-1 ring-white/5 hover:ring-accent/40 transition-all duration-500 ${
                foto.className
              } ${
                visible.has(i)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionProperty: "opacity, transform, box-shadow",
                transitionDuration: "700ms",
                transitionDelay: `${i * 90}ms`,
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                style={{
                  backgroundImage: `url(${foto.src})`,
                  filter: "saturate(0.95) contrast(1.02)",
                }}
              />

              {/* Overlay base que se dissolve no hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent transition-opacity duration-500 group-hover:opacity-30" />

              {/* Tinta teal no hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(94,234,212,0.35), transparent 70%)",
                }}
              />

              {/* Legenda */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 lg:p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-accent/90 mb-0.5 sm:mb-1">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-xs sm:text-sm text-white/90 font-medium opacity-80 group-hover:opacity-100 transition line-clamp-1">
                  {foto.legenda}
                </div>
              </div>

              {/* Borda animada no hover */}
              <div className="absolute inset-0 ring-0 group-hover:ring-1 group-hover:ring-accent/30 ring-inset transition-all duration-500 pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-12 text-center text-xs text-white/40 italic">
          Toque nas fotos para ampliar — use ← → para navegar
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[60] bg-ink-900/97 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-2 sm:px-4 text-white/60 hover:text-accent text-xs uppercase tracking-[0.3em] border border-white/10 hover:border-accent rounded-md transition"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) => ((i ?? 0) - 1 + FOTOS.length) % FOTOS.length);
            }}
            className="absolute left-2 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 grid place-items-center bg-ink-800/80 hover:bg-accent/20 border border-white/10 hover:border-accent text-white/70 hover:text-accent rounded-full text-2xl transition"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) => ((i ?? 0) + 1) % FOTOS.length);
            }}
            className="absolute right-2 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 grid place-items-center bg-ink-800/80 hover:bg-accent/20 border border-white/10 hover:border-accent text-white/70 hover:text-accent rounded-full text-2xl transition"
          >
            ›
          </button>
          <div
            className="relative max-w-5xl max-h-[80vh] w-full aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute inset-0 bg-contain bg-no-repeat bg-center"
              style={{ backgroundImage: `url(${FOTOS[lightbox].src})` }}
            />
            <div className="absolute -bottom-8 sm:-bottom-10 left-0 right-0 text-center text-xs sm:text-sm text-white/70">
              {FOTOS[lightbox].legenda}
            </div>
          </div>
          {/* Contador */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {FOTOS.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                className={`h-px transition-all duration-300 ${
                  i === lightbox ? "w-8 bg-accent" : "w-4 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
