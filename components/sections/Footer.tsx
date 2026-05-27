import Image from "next/image";
import { Phone, Mail, Instagram, MapPin, Clock } from "lucide-react";

// Formata número internacional (ex: 5532984969955) → (32) 9 8496-9955
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^55/, ""); // remove código BR
  if (digits.length === 11) {
    // celular: DDD + 9 + 8 dígitos
    return `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    // fixo: DDD + 8 dígitos
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

export function Footer() {
  const whatsappRaw = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "";
  const phone1 = process.env.OWNER_PHONE_DISPLAY || formatPhone(whatsappRaw);
  const phone2 = process.env.OWNER_PHONE_2_DISPLAY || "";
  const email = process.env.OWNER_EMAIL || "teixeiramachado43@gmail.com";
  const instagram = process.env.OWNER_INSTAGRAM || "teixeiramachado_";
  const ownerName = process.env.OWNER_NAME || "Sra. Teixeira Machado";

  return (
    <footer
      id="contato"
      className="relative bg-ink-900 border-t border-white/5 overflow-hidden"
    >
      <div className="absolute inset-0 wood-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-12">
          {/* Logo + Tagline */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                <Image
                  src="/brand/logo-tm.png"
                  alt="TM Salão de Eventos"
                  fill
                  className="object-contain drop-shadow-[0_0_14px_rgba(94,234,212,0.3)]"
                />
              </div>
              <div>
                <div className="font-display text-base sm:text-lg leading-none">
                  TM <span className="italic text-accent/80 font-normal">Eventos</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">
                  Teixeira Machado
                </div>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Seu evento começa aqui. Estrutura completa para momentos únicos em
              Canaã — MG.
            </p>
            <a
              href="/agendamento"
              className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 border border-white/15 hover:border-accent hover:text-accent rounded-md transition text-sm"
            >
              Agendar visita →
            </a>
          </div>

          {/* Contato */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-accent/80 mb-4">
              Contato
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={14} className="mt-1 text-accent shrink-0" />
                <div>
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP || ""}`}
                    className="hover:text-accent transition"
                  >
                    {phone1}
                  </a>
                  {phone2 && (
                    <div className="text-white/50">{phone2}</div>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={14} className="mt-1 text-accent shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-accent transition break-all"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={14} className="mt-1 text-accent shrink-0" />
                <span>Canaã — MG</span>
              </li>
            </ul>
          </div>

          {/* Funcionamento */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-accent/80 mb-4">
              Horário de funcionamento
            </div>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-3">
                <Clock size={14} className="text-accent shrink-0" />
                Atendimento por agendamento
              </li>
              <li>Seg — Dom · 8h às 20h</li>
              <li className="text-white/40 text-xs mt-3">
                Visitas técnicas mediante agendamento prévio
              </li>
            </ul>
          </div>

          {/* Redes */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-accent/80 mb-4">
              Siga-nos
            </div>
            <a
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-4 py-3 border border-white/15 hover:border-accent hover:text-accent rounded-md transition text-sm"
            >
              <Instagram size={16} />@{instagram}
            </a>
            <div className="mt-6 sm:mt-8 text-xs text-white/40 leading-relaxed">
              <div className="font-mono">CNPJ 60.307.144/0001-17</div>
              <div className="mt-1 italic">{ownerName}</div>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 text-xs text-white/40">
          <div>
            © {new Date().getFullYear()} Espaço Teixeira Machado. Todos os
            direitos reservados.
          </div>
          <div className="italic font-display">
            "Seu evento começa aqui."
          </div>
        </div>
      </div>
    </footer>
  );
}
