import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

const META = [
  "Canaã — MG",
  "Buffet próprio",
  "Pesque-pague",
  "CNPJ 60.307.144/0001-17",
];

export function Hero() {
  return (
    <section className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] items-stretch lg:min-h-[min(calc(100svh-11rem),44rem)]">
          {/* Texto */}
          <div className="flex flex-col justify-center py-14 sm:py-20 lg:py-16 lg:pr-12">
            <Eyebrow className="flex items-center gap-3 mb-7">
              <span className="w-10 h-px bg-bronze/60" aria-hidden="true" />
              Canaã — MG · desde 2018
            </Eyebrow>

            <h1 className="font-display font-normal text-display text-balance">
              Seu evento <em className="italic text-accent">começa</em> aqui.
            </h1>

            <p className="mt-7 max-w-md text-base sm:text-lg text-muted leading-relaxed">
              Estrutura completa para casamentos, formaturas, aniversários e
              eventos especiais. Salão coberto, buffet próprio e churrasco
              preparado na hora.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-3">
              <ButtonLink href="/agendamento" size="lg">
                <Calendar size={17} />
                Agendar visita
                <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink href="/#galeria" variant="outline" size="lg">
                Conhecer o espaço
              </ButtonLink>
            </div>
          </div>

          {/* Foto — a telha recorta a borda superior */}
          <div className="relative min-h-[16rem] aspect-[4/3] lg:aspect-auto lg:min-h-0">
            <Image
              src="/gallery/IMG_9074.PNG"
              alt="Pavilhões de madeira do TM Salão de Eventos sob céu azul"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="telha-edge" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Faixa de metadados */}
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-x-8 gap-y-2">
          {META.map((m) => (
            <span
              key={m}
              className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-bronze"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
