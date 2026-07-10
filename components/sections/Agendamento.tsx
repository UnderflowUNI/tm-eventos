import { Calendar, CheckCircle2, Sparkles, MessageCircle } from "lucide-react";
import { PublicCalendar } from "../PublicCalendar";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Agendamento() {
  return (
    <section id="agendamento" className="py-16 sm:py-24 lg:py-32 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div>
          <Eyebrow className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-bronze/60" aria-hidden="true" />
            Agendamento
          </Eyebrow>
          <h2 className="font-display font-normal text-display-sm text-balance">
            Agende seu <em className="italic text-accent">evento.</em>
          </h2>
          <p className="mt-6 text-muted leading-relaxed max-w-lg text-sm sm:text-base">
            Veja as datas disponíveis no calendário ao lado. Escolha o tipo de
            evento, monte seu cardápio e receba uma estimativa instantânea —
            depois é só enviar para nós via WhatsApp.
          </p>

          <ul className="mt-9 space-y-4">
            <Feature
              icon={<Calendar size={18} />}
              text="Calendário sempre atualizado pela proprietária"
            />
            <Feature
              icon={<CheckCircle2 size={18} />}
              text="Monte seu cardápio e veja o valor estimado na hora"
            />
            <Feature
              icon={<MessageCircle size={18} />}
              text="Envio direto pelo WhatsApp com toda a lista pronta"
            />
            <Feature
              icon={<Sparkles size={18} />}
              text="Sem pegadinhas — orçamento válido por 30 dias"
            />
          </ul>

          <ButtonLink href="/agendamento" size="lg" className="mt-10">
            <Calendar size={17} />
            Solicitar orçamento agora
          </ButtonLink>
        </div>

        <PublicCalendar />
      </div>
    </section>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 text-accent">{icon}</span>
      <span className="text-ink/85">{text}</span>
    </li>
  );
}
