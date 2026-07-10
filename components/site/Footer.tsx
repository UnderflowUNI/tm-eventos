import Image from "next/image";
import { Phone, Mail, Instagram, MapPin, Clock } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Formata número internacional (ex: 5532984969955) → (32) 9 8496-9955
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
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
    <footer id="contato" className="bg-surface border-t border-line">
      <div className="telha-divider" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-12">
          {/* Marca */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-5">
              <Image
                src="/brand/logo-tm.png"
                alt="TM Salão de Eventos"
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Seu evento começa aqui. Estrutura completa para momentos únicos
              em Canaã — MG.
            </p>
            <ButtonLink href="/agendamento" variant="outline" className="mt-6">
              Agendar visita →
            </ButtonLink>
          </div>

          {/* Contato */}
          <div>
            <Eyebrow className="mb-4">Contato</Eyebrow>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={14} className="mt-1 text-accent shrink-0" />
                <div>
                  <a
                    href={`https://wa.me/${whatsappRaw}`}
                    className="hover:text-accent transition-colors duration-fast"
                  >
                    {phone1}
                  </a>
                  {phone2 && <div className="text-muted">{phone2}</div>}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={14} className="mt-1 text-accent shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-accent transition-colors duration-fast break-all"
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
            <Eyebrow className="mb-4">Horário de funcionamento</Eyebrow>
            <ul className="space-y-2 text-sm text-ink/80">
              <li className="flex items-center gap-3">
                <Clock size={14} className="text-accent shrink-0" />
                Atendimento por agendamento
              </li>
              <li>Seg — Dom · 8h às 20h</li>
              <li className="text-muted text-xs mt-3">
                Visitas técnicas mediante agendamento prévio
              </li>
            </ul>
          </div>

          {/* Redes */}
          <div>
            <Eyebrow className="mb-4">Siga-nos</Eyebrow>
            <ButtonLink
              href={`https://instagram.com/${instagram}`}
              variant="outline"
            >
              <Instagram size={16} />@{instagram}
            </ButtonLink>
            <div className="mt-6 sm:mt-8 text-xs text-muted leading-relaxed">
              <div className="font-mono">CNPJ 60.307.144/0001-17</div>
              <div className="mt-1 italic">{ownerName}</div>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 text-xs text-muted">
          <div>
            © {new Date().getFullYear()} Espaço Teixeira Machado. Todos os
            direitos reservados.
          </div>
          <div className="italic font-display text-sm">
            &ldquo;Seu evento começa aqui.&rdquo;
          </div>
        </div>
      </div>
    </footer>
  );
}
