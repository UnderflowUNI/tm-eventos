import Link from "next/link";
import { Calendar, CheckCircle2, Sparkles, MessageCircle } from "lucide-react";
import { PublicCalendar } from "../PublicCalendar";

export function Agendamento() {
  return (
    <section
      id="agendamento"
      className="relative py-32 bg-ink-800 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=2000&q=80)",
          backgroundSize: "cover",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-900/70" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <div className="text-[11px] uppercase tracking-[0.35em] text-accent/80 mb-6 flex items-center gap-3">
            <span className="w-12 h-px bg-accent/60" />
            Agendamento
          </div>
          <h2 className="font-display font-light text-5xl lg:text-6xl leading-[1.05] tracking-tight">
            Agende seu{" "}
            <span className="italic text-accent-glow">evento.</span>
          </h2>
          <p className="mt-6 text-white/70 leading-relaxed max-w-lg">
            Veja as datas disponíveis no calendário ao lado. Escolha o tipo de
            evento, monte seu cardápio e receba uma estimativa instantânea —
            depois é só enviar para nós via WhatsApp.
          </p>

          <ul className="mt-10 space-y-4">
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

          <Link
            href="/agendamento"
            className="btn-shine mt-10 inline-flex items-center gap-3 px-7 py-4 bg-accent text-ink-900 font-semibold rounded-md hover:bg-accent-glow transition"
          >
            <Calendar size={18} />
            Solicitar orçamento agora
          </Link>
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
      <span className="text-white/80">{text}</span>
    </li>
  );
}
