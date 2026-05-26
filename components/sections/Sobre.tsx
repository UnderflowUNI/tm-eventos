import { Users, Trees, Sparkles, ArrowRight } from "lucide-react";

export function Sobre() {
  return (
    <section id="sobre" className="relative py-32 bg-ink-800 overflow-hidden">
      {/* Fundo com imagem do espaço */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "url(/gallery/IMG_9077.PNG)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(60%) brightness(0.6)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-800 via-ink-800/95 to-ink-800/40" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 30%, rgba(94,234,212,0.08), transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.35em] text-accent/80 mb-6 flex items-center gap-3">
            <span className="w-12 h-px bg-accent/60" />
            Sobre o espaço
          </div>

          <h2 className="font-display font-light text-5xl lg:text-6xl leading-[1.05] tracking-tight">
            Estrutura completa
            <br />
            para momentos
            <br />
            <span className="italic text-accent-glow">únicos.</span>
          </h2>

          <p className="mt-8 text-white/70 leading-relaxed max-w-lg">
            Ambiente amplo, integrado à natureza e com toda a infraestrutura para
            seu evento merecer. Buffet próprio, equipe experiente, cozinha
            preparada e o melhor churrasco da região servido na hora.
          </p>

          <a
            href="#galeria"
            className="mt-10 inline-flex items-center gap-3 px-6 py-3 border border-white/20 hover:border-accent hover:text-accent rounded-md transition group"
          >
            Conhecer o espaço
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>

          <div className="mt-16 grid sm:grid-cols-3 gap-6">
            <Stat
              icon={<Users size={20} />}
              titulo="Capacidade"
              texto="para grandes eventos"
            />
            <Stat
              icon={<Trees size={20} />}
              titulo="Ambiente"
              texto="amplo e coberto"
            />
            <Stat
              icon={<Sparkles size={20} />}
              titulo="Integrado"
              texto="à natureza"
            />
          </div>
        </div>

        <div className="relative aspect-[4/5] hidden lg:block group">
          <div
            className="absolute inset-0 rounded-sm overflow-hidden transition-transform duration-700 group-hover:scale-[1.02]"
            style={{
              backgroundImage: "url(/gallery/IMG_9075.PNG)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "contrast(1.05) saturate(0.95)",
            }}
          />
          {/* Overlay teal sutil para fundir com o tema */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
            style={{
              background:
                "linear-gradient(135deg, rgba(94,234,212,0.25), transparent 60%)",
            }}
          />
          <div className="absolute inset-0 ring-1 ring-white/10 rounded-sm pointer-events-none" />
          <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-accent/40" />
          <div className="absolute -top-6 -left-6 px-6 py-3 bg-ink-900 border border-white/10 font-display italic text-accent text-sm">
            "natureza & festa"
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  titulo,
  texto,
}: {
  icon: React.ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="border-l border-white/10 pl-4">
      <div className="text-accent mb-2">{icon}</div>
      <div className="text-sm font-semibold">{titulo}</div>
      <div className="text-xs text-white/50 mt-1">{texto}</div>
    </div>
  );
}
