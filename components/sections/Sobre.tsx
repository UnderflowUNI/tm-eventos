import Image from "next/image";
import { Users, Trees, Sparkles, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Sobre() {
  return (
    <section id="sobre" className="py-16 sm:py-24 lg:py-32 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <Eyebrow className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-bronze/60" aria-hidden="true" />
            Sobre o espaço
          </Eyebrow>

          <h2 className="font-display font-normal text-display-sm text-balance">
            Estrutura completa para momentos{" "}
            <em className="italic text-accent">únicos.</em>
          </h2>

          <p className="mt-7 text-muted leading-relaxed max-w-lg text-sm sm:text-base">
            Ambiente amplo, integrado à natureza e com toda a infraestrutura
            para seu evento merecer. Buffet próprio, equipe experiente, cozinha
            preparada e o melhor churrasco da região servido na hora.
          </p>

          <ButtonLink href="/#galeria" variant="outline" className="mt-9">
            Conhecer o espaço
            <ArrowRight size={15} />
          </ButtonLink>

          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-6">
            <Stat icon={<Users size={18} />} titulo="Capacidade" texto="para grandes eventos" />
            <Stat icon={<Trees size={18} />} titulo="Ambiente" texto="amplo e coberto" />
            <Stat icon={<Sparkles size={18} />} titulo="Integrado" texto="à natureza" />
          </div>
        </div>

        {/* Foto com o recorte de telha e a moldura terracota deslocada */}
        <div className="relative aspect-[4/5] hidden md:block">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/gallery/IMG_9075.PNG"
              alt="Salão coberto principal com estrutura de madeira"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="telha-edge" aria-hidden="true" />
          </div>
          <div
            className="absolute -bottom-6 -right-6 w-28 lg:w-36 h-28 lg:h-36 border border-terra/60"
            aria-hidden="true"
          />
        </div>

        {/* Versão mobile da foto */}
        <div className="relative aspect-[4/3] md:hidden overflow-hidden">
          <Image
            src="/gallery/IMG_9075.PNG"
            alt="Salão coberto principal com estrutura de madeira"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="telha-edge" aria-hidden="true" />
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
    <div className="border-l border-line pl-3 sm:pl-4">
      <div className="text-accent mb-2">{icon}</div>
      <div className="text-xs sm:text-sm font-bold">{titulo}</div>
      <div className="text-[0.6875rem] sm:text-xs text-muted mt-0.5">{texto}</div>
    </div>
  );
}
