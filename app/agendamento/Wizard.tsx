"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Users,
  MessageCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Send,
  Sparkles,
  Fish,
  PartyPopper,
  X,
} from "lucide-react";
import {
  CARDAPIO,
  calcularOrcamento,
  RECURSOS_HUMANOS,
  MATERIAL_INCLUSO,
} from "@/lib/cardapio";
import { PublicCalendar } from "@/components/PublicCalendar";
import { Button, ButtonLink, buttonCls } from "@/components/ui/Button";

type BookingType = "VENUE" | "TABLE" | "";

const EVENTOS = [
  { id: "ALMOCO_CHURRASCO", label: "Almoço com churrasco", icon: "🥩" },
  { id: "JANTAR_CHURRASCO", label: "Jantar com churrasco", icon: "🌙" },
  { id: "ALMOCO", label: "Almoço (sem churrasco)", icon: "🍽" },
  { id: "JANTAR", label: "Jantar (sem churrasco)", icon: "✨" },
  { id: "OUTRO", label: "Outro evento", icon: "🎉" },
];

const TODAY = new Date().toISOString().split("T")[0];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Rótulo padrão dos campos do formulário — metadado, então mono/bronze
const LABEL_CLS =
  "block font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-bronze mb-2.5";
const INPUT_CLS =
  "w-full min-h-[2.75rem] bg-surface border border-line rounded px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none transition-colors duration-fast";

function validatePhone(v: string): string {
  const d = v.replace(/\D/g, "");
  if (!v.trim()) return "WhatsApp é obrigatório";
  if (d.length < 10) return "Número incompleto — informe DDD + número";
  if (d.length > 13) return "Número inválido — verifique os dígitos";
  return "";
}

function validateEmail(v: string): string {
  if (!v.trim()) return "";
  if (!EMAIL_RE.test(v)) return "E-mail inválido — verifique o formato";
  if (v.length > 254) return "E-mail muito longo";
  return "";
}

export function Wizard() {
  const [step, setStep] = useState(1);

  const [bookingType, setBookingType] = useState<BookingType>("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [guests, setGuests] = useState<number | "">("");
  const [selections, setSelections] = useState<Set<string>>(new Set());

  const [clientName, setClientName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ link: string } | null>(null);

  // Validação em tempo real
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const phoneError = phoneTouched ? validatePhone(whatsapp) : "";
  const emailError = emailTouched ? validateEmail(email) : "";
  const phoneOk = phoneTouched && !validatePhone(whatsapp);
  const emailOk = emailTouched && !!email.trim() && !validateEmail(email);

  // Modal de erro
  const [errModal, setErrModal] = useState("");
  const errCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!errModal) return;
    errCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setErrModal("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [errModal]);

  const isVenue = bookingType === "VENUE";
  const isTable = bookingType === "TABLE";

  const orcamento = useMemo(
    () =>
      calcularOrcamento(
        Array.from(selections),
        typeof guests === "number" ? guests : 0
      ),
    [selections, guests]
  );

  const diasRange = useMemo(() => {
    if (!isVenue || !eventDate) return 1;
    const end = eventEndDate || eventDate;
    const s = new Date(eventDate + "T12:00");
    const e = new Date(end + "T12:00");
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }, [isVenue, eventDate, eventEndDate]);

  const toggle = (id: string) => {
    const n = new Set(selections);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelections(n);
  };

  // Clique no calendário — seleciona período (VENUE) ou dia único (TABLE)
  const handleVenueCalendarClick = (dateStr: string) => {
    if (!eventDate || (eventDate && eventEndDate)) {
      setEventDate(dateStr);
      setEventEndDate("");
    } else if (dateStr >= eventDate) {
      setEventEndDate(dateStr);
    } else {
      setEventEndDate(eventDate);
      setEventDate(dateStr);
    }
  };

  const handleTableCalendarClick = (dateStr: string) => {
    setEventDate(dateStr);
  };

  const canNext = () => {
    if (step === 1) {
      if (!bookingType) return false;
      if (isVenue)
        return (
          !!eventType &&
          !!eventDate &&
          typeof guests === "number" &&
          guests > 0 &&
          (!eventEndDate || eventEndDate >= eventDate)
        );
      if (isTable)
        return !!eventDate && typeof guests === "number" && guests > 0;
    }
    if (step === 2) return selections.size > 0;
    if (step === 3)
      return (
        !!clientName.trim() &&
        !validatePhone(whatsapp) &&
        !validateEmail(email)
      );
    return true;
  };

  const goNext = () => {
    if (step === 1 && isTable) setStep(3);
    else setStep(step + 1);
  };
  const goPrev = () => {
    if (step === 3 && isTable) setStep(1);
    else setStep(step - 1);
  };

  const submit = async () => {
    setPhoneTouched(true);
    setEmailTouched(true);
    if (validatePhone(whatsapp) || validateEmail(email)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType,
          clientName,
          whatsapp,
          email: email || null,
          eventDate,
          eventEndDate: isVenue ? eventEndDate || eventDate : null,
          guests,
          eventType: isVenue ? eventType : null,
          selections: isVenue ? Array.from(selections) : [],
          message: message || null,
        }),
      });
      const data = await res.json();
      if (data.whatsappLink) {
        setDone({ link: data.whatsappLink });
      } else {
        setErrModal(data.error || "Erro ao enviar. Tente novamente.");
      }
    } catch {
      setErrModal("Sem conexão. Verifique sua internet e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Tela de sucesso ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="grid place-items-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center">
              <Check size={36} className="text-accent" />
            </div>
            <h1 className="font-display text-4xl mb-3">Quase lá!</h1>
            <p className="text-muted text-sm leading-relaxed">
              Solicitação registrada com sucesso. Clique no botão abaixo para
              abrir o WhatsApp com a mensagem já pronta — a proprietária
              receberá tudo organizado e entrará em contato em breve.
            </p>
          </div>

          <div className="bg-surface border border-line rounded p-5 mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-success shrink-0" />
              <span className="text-sm text-ink/85">Solicitação registrada no sistema</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-success shrink-0" />
              <span className="text-sm text-ink/85">Data bloqueada no calendário</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-success shrink-0" />
              <span className="text-sm text-ink/85">Mensagem WhatsApp pronta para envio</span>
            </div>
          </div>

          <ButtonLink href={done.link} size="lg" className="w-full mb-4">
            <MessageCircle size={20} />
            Enviar pelo WhatsApp
            <ChevronRight size={18} />
          </ButtonLink>

          <Link
            href="/"
            className="block text-center text-sm text-muted hover:text-ink transition-colors duration-fast"
          >
            ← Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  const totalSteps = isTable ? 2 : 3;
  const currentVisualStep = step === 3 && isTable ? 2 : step;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* ── Modal de erro ──────────────────────────────────────────────────── */}
      {errModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Erro ao enviar"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setErrModal("")}
        >
          <div
            className="bg-surface border border-danger/40 rounded p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-danger/10 border border-danger/40 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-danger" />
                </div>
                <h2 className="font-display text-xl">Algo deu errado</h2>
              </div>
              <button
                onClick={() => setErrModal("")}
                className="text-muted hover:text-ink transition-colors duration-fast min-w-[2.75rem] min-h-[2.75rem] grid place-items-center -mr-3 -mt-3"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-muted text-sm mb-6 leading-relaxed">{errModal}</p>
            <button
              ref={errCloseRef}
              onClick={() => setErrModal("")}
              className={`${buttonCls("primary")} w-full`}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 sm:mb-14" aria-label={`Passo ${currentVisualStep} de ${totalSteps}`}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-2 sm:gap-4">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 grid place-items-center rounded-full font-mono text-xs sm:text-sm font-medium transition-colors duration-fast ${
                currentVisualStep >= s
                  ? "bg-accent text-accent-contrast"
                  : "bg-surface text-muted border border-line"
              }`}
              aria-current={currentVisualStep === s ? "step" : undefined}
            >
              {currentVisualStep > s ? <Check size={14} /> : s}
            </div>
            {s < totalSteps && (
              <div
                className={`w-10 sm:w-24 h-px ${
                  currentVisualStep > s ? "bg-accent" : "bg-line"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div>
          <h1 className="font-display text-display-sm mb-3 text-balance">
            O que você quer <em className="italic text-accent">reservar</em>?
          </h1>
          <p className="text-muted mb-8 sm:mb-10 max-w-xl text-sm sm:text-base">
            Temos duas opções: alugue o espaço completo para seu evento, ou
            reserve uma mesa no pesque-pague.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-10 sm:mb-12">
            <button
              onClick={() => setBookingType("VENUE")}
              aria-pressed={bookingType === "VENUE"}
              className={`text-left p-6 border rounded transition-colors duration-fast ${
                bookingType === "VENUE"
                  ? "border-accent bg-accent/10"
                  : "border-line hover:border-accent/60 bg-surface"
              }`}
            >
              <PartyPopper className="text-accent mb-3" size={28} />
              <div className="font-display text-xl mb-1">Aluguel do espaço</div>
              <div className="text-sm text-muted">
                Casamentos, formaturas, aniversários e eventos especiais.
                Pode reservar por <strong className="text-ink">vários dias</strong>.
              </div>
            </button>
            <button
              onClick={() => setBookingType("TABLE")}
              aria-pressed={bookingType === "TABLE"}
              className={`text-left p-6 border rounded transition-colors duration-fast ${
                bookingType === "TABLE"
                  ? "border-accent bg-accent/10"
                  : "border-line hover:border-accent/60 bg-surface"
              }`}
            >
              <Fish className="text-accent mb-3" size={28} />
              <div className="font-display text-xl mb-1">Reserva de mesa (Pesque-Pague)</div>
              <div className="text-sm text-muted">
                Garanta sua mesa pra um dia específico de pescaria e almoço.
                <strong className="text-ink"> 1 dia só</strong>.
              </div>
            </button>
          </div>

          {/* Detalhes VENUE */}
          {isVenue && (
            <div>
              <h2 className="font-display text-2xl mb-6">
                Sobre seu <em className="italic text-accent">evento</em>
              </h2>
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
                <div className="space-y-6 sm:space-y-8">
                  <fieldset>
                    <legend className={LABEL_CLS}>Tipo de evento</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {EVENTOS.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setEventType(e.id)}
                          aria-pressed={eventType === e.id}
                          className={`text-left p-4 border rounded transition-colors duration-fast min-h-[2.75rem] ${
                            eventType === e.id
                              ? "border-accent bg-accent/10"
                              : "border-line hover:border-accent/60 bg-surface"
                          }`}
                        >
                          <div className="text-2xl mb-1" aria-hidden="true">{e.icon}</div>
                          <div className="text-sm font-medium">{e.label}</div>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="data-de" className={LABEL_CLS}>
                        <Calendar size={13} className="inline mr-1 -mt-0.5" /> De
                      </label>
                      <input
                        id="data-de"
                        type="date"
                        value={eventDate}
                        min={TODAY}
                        onChange={(e) => {
                          setEventDate(e.target.value);
                          if (eventEndDate && eventEndDate < e.target.value)
                            setEventEndDate(e.target.value);
                        }}
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
                      <label htmlFor="data-ate" className={LABEL_CLS}>
                        <Calendar size={13} className="inline mr-1 -mt-0.5" /> Até{" "}
                        <span className="text-muted normal-case tracking-normal font-sans">
                          (mesmo dia se vazio)
                        </span>
                      </label>
                      <input
                        id="data-ate"
                        type="date"
                        value={eventEndDate}
                        min={eventDate || TODAY}
                        onChange={(e) => setEventEndDate(e.target.value)}
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>

                  {eventDate && (
                    <div className="text-xs text-accent flex items-center gap-2">
                      <Sparkles size={12} />
                      {diasRange === 1 ? "1 dia de aluguel" : `${diasRange} dias de aluguel`}
                    </div>
                  )}

                  <div>
                    <label htmlFor="convidados" className={LABEL_CLS}>
                      <Users size={13} className="inline mr-1 -mt-0.5" /> Número de convidados
                    </label>
                    <input
                      id="convidados"
                      type="number"
                      value={guests}
                      onChange={(e) =>
                        setGuests(e.target.value ? Number(e.target.value) : "")
                      }
                      min={1}
                      placeholder="ex: 80"
                      className={INPUT_CLS}
                    />
                    {typeof guests === "number" && guests > 250 && (
                      <div className="mt-2 text-xs text-warn flex items-center gap-2">
                        <Sparkles size={12} /> Eventos com mais de 250 pessoas incluem
                        banheirista e manobrista.
                      </div>
                    )}
                  </div>
                </div>

                <PublicCalendar
                  selectedStart={eventDate}
                  selectedEnd={eventEndDate}
                  onDayClick={handleVenueCalendarClick}
                />
              </div>
            </div>
          )}

          {/* Detalhes TABLE */}
          {isTable && (
            <div>
              <h2 className="font-display text-2xl mb-6">
                Detalhes da <em className="italic text-accent">mesa</em>
              </h2>
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <label htmlFor="dia-reserva" className={LABEL_CLS}>
                      <Calendar size={13} className="inline mr-1 -mt-0.5" /> Dia da reserva
                    </label>
                    <input
                      id="dia-reserva"
                      type="date"
                      value={eventDate}
                      min={TODAY}
                      onChange={(e) => setEventDate(e.target.value)}
                      className={INPUT_CLS}
                    />
                    <div className="text-xs text-muted mt-2">Reserva é para o dia inteiro</div>
                  </div>
                  <div>
                    <label htmlFor="pessoas-mesa" className={LABEL_CLS}>
                      <Users size={13} className="inline mr-1 -mt-0.5" /> Quantas pessoas na mesa?
                    </label>
                    <input
                      id="pessoas-mesa"
                      type="number"
                      value={guests}
                      onChange={(e) =>
                        setGuests(e.target.value ? Number(e.target.value) : "")
                      }
                      min={1}
                      max={20}
                      placeholder="ex: 6"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="p-5 bg-accent/5 border border-accent/25 rounded text-sm text-muted leading-relaxed">
                    <div className="text-accent font-semibold mb-1">Como funciona</div>
                    Você reserva o dia, vem pescar e almoçar. O pagamento da
                    pescaria e do consumo é feito direto no local com a equipe do TM.
                  </div>
                </div>

                <PublicCalendar
                  selectedStart={eventDate}
                  onDayClick={handleTableCalendarClick}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2 — Cardápio (só VENUE) ── */}
      {step === 2 && (
        <div>
          <h1 className="font-display text-display-sm mb-3 text-balance">
            Monte seu <em className="italic text-accent">cardápio</em>
          </h1>
          <p className="text-muted mb-8 sm:mb-10 max-w-xl text-sm sm:text-base">
            Marque os itens que você quer no seu evento. O valor é calculado
            automaticamente conforme você seleciona.
          </p>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6 sm:gap-8">
            <div className="space-y-8">
              {CARDAPIO.map((cat) => (
                <div
                  key={cat.id}
                  className="border border-line rounded p-5 bg-surface"
                >
                  <div className="mb-4">
                    <h3 className="font-display text-2xl">{cat.titulo}</h3>
                    <p className="text-xs text-muted mt-1">{cat.descricao}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {cat.itens.map((item) => {
                      const checked = selections.has(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggle(item.id)}
                          aria-pressed={checked}
                          className={`flex items-center gap-3 p-3 border rounded text-left transition-colors duration-fast min-h-[2.75rem] ${
                            checked
                              ? "border-accent bg-accent/10"
                              : "border-line hover:border-accent/60"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 grid place-items-center rounded-sm border transition-colors duration-fast shrink-0 ${
                              checked ? "bg-accent border-accent" : "border-muted/50"
                            }`}
                          >
                            {checked && <Check size={12} className="text-accent-contrast" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{item.nome}</div>
                            {item.descricao && (
                              <div className="text-xs text-muted mt-0.5">{item.descricao}</div>
                            )}
                          </div>
                          <div className="text-xs text-accent font-mono">
                            R$ {item.precoPorPessoa}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-28 h-fit">
              <div className="border border-accent/40 rounded p-6 bg-surface">
                <div className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.3em] text-bronze mb-3">
                  Estimativa
                </div>
                <div className="font-display text-4xl mb-2 tabular-nums">
                  R$ {orcamento.total.toFixed(2).replace(".", ",")}
                </div>
                <div className="text-xs text-muted tabular-nums">
                  R$ {orcamento.porPessoa.toFixed(2)} por pessoa ×{" "}
                  {typeof guests === "number" ? guests : 0} convidados
                </div>

                <div className="mt-6 pt-6 border-t border-line">
                  <div className="text-xs text-muted mb-3">
                    <strong className="text-ink">{selections.size}</strong>{" "}
                    {selections.size === 1 ? "item selecionado" : "itens selecionados"}
                  </div>
                  <div className="text-[0.6875rem] text-muted leading-relaxed">{orcamento.obs}</div>
                </div>

                <details className="mt-6">
                  <summary className="cursor-pointer text-xs text-accent hover:underline">
                    Ver o que está incluso →
                  </summary>
                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[0.6875rem] text-muted">
                    {MATERIAL_INCLUSO.map((m) => (
                      <div key={m}>• {m}</div>
                    ))}
                  </div>
                  <div className="mt-3 text-[0.6875rem] text-muted">
                    <div className="text-bronze mb-1">Equipe:</div>
                    <div>{RECURSOS_HUMANOS.join(", ")}.</div>
                  </div>
                </details>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Contato ── */}
      {step === 3 && (
        <div className="max-w-2xl">
          <h1 className="font-display text-display-sm mb-3 text-balance">
            Seus <em className="italic text-accent">dados</em>
          </h1>
          <p className="text-muted mb-8 sm:mb-10 text-sm sm:text-base">
            Falta pouco! Preencha seus dados para enviarmos sua solicitação.
          </p>

          <div className="space-y-6">
            <div>
              <label htmlFor="nome" className={LABEL_CLS}>
                Nome completo *
              </label>
              <input
                id="nome"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Como podemos te chamar?"
                className={INPUT_CLS}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* WhatsApp com validação em tempo real */}
              <div>
                <label htmlFor="whatsapp" className={LABEL_CLS}>
                  WhatsApp *
                </label>
                <div className="relative">
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    onBlur={() => setPhoneTouched(true)}
                    placeholder="(32) 9 9999-9999"
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "whatsapp-erro" : undefined}
                    className={`${INPUT_CLS} pr-10 ${
                      phoneError
                        ? "!border-danger"
                        : phoneOk
                        ? "!border-success"
                        : ""
                    }`}
                  />
                  {phoneOk && (
                    <Check
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-success"
                    />
                  )}
                  {phoneError && (
                    <AlertCircle
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-danger"
                    />
                  )}
                </div>
                {phoneError && (
                  <p id="whatsapp-erro" className="mt-1.5 text-xs text-danger flex items-center gap-1.5">
                    <AlertCircle size={11} /> {phoneError}
                  </p>
                )}
              </div>

              {/* E-mail com validação em tempo real */}
              <div>
                <label htmlFor="email" className={LABEL_CLS}>
                  E-mail
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="seu@email.com"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-erro" : undefined}
                    className={`${INPUT_CLS} pr-10 ${
                      emailError
                        ? "!border-danger"
                        : emailOk
                        ? "!border-success"
                        : ""
                    }`}
                  />
                  {emailOk && (
                    <Check
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-success"
                    />
                  )}
                  {emailError && (
                    <AlertCircle
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-danger"
                    />
                  )}
                </div>
                {emailError && (
                  <p id="email-erro" className="mt-1.5 text-xs text-danger flex items-center gap-1.5">
                    <AlertCircle size={11} /> {emailError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="obs" className={LABEL_CLS}>
                Observações
              </label>
              <textarea
                id="obs"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={
                  isTable
                    ? "Tem alguma preferência? Alguma criança vai?"
                    : "Algo a mais que devemos saber? (decoração, restrições alimentares, etc.)"
                }
                className={`${INPUT_CLS} resize-none`}
              />
            </div>

            {/* Resumo */}
            <div className="mt-8 p-6 border border-line rounded bg-surface">
              <div className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.3em] text-bronze mb-4">
                Resumo do pedido
              </div>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <strong className="text-ink">Tipo:</strong>{" "}
                  {isTable ? "🎣 Reserva de mesa (Pesque-Pague)" : "🎉 Aluguel do espaço"}
                </li>
                {isVenue && (
                  <li>
                    <strong className="text-ink">Evento:</strong>{" "}
                    {EVENTOS.find((e) => e.id === eventType)?.label}
                  </li>
                )}
                <li>
                  <strong className="text-ink">Data:</strong>{" "}
                  {eventDate
                    ? new Date(eventDate + "T12:00").toLocaleDateString("pt-BR")
                    : "—"}
                  {isVenue && eventEndDate && eventEndDate !== eventDate && (
                    <>
                      {" "}até{" "}
                      {new Date(eventEndDate + "T12:00").toLocaleDateString("pt-BR")}{" "}
                      <span className="text-accent">({diasRange} dias)</span>
                    </>
                  )}
                </li>
                <li>
                  <strong className="text-ink">
                    {isTable ? "Pessoas na mesa:" : "Convidados:"}
                  </strong>{" "}
                  {guests}
                </li>
                {isVenue && (
                  <>
                    <li>
                      <strong className="text-ink">Itens:</strong> {selections.size}
                    </li>
                    <li className="pt-2 border-t border-line text-accent font-bold tabular-nums">
                      Total estimado: R${" "}
                      {orcamento.total.toFixed(2).replace(".", ",")}
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navegação */}
      <div className="mt-10 sm:mt-12 flex justify-between gap-3 sm:gap-4">
        {step > 1 ? (
          <Button variant="outline" onClick={goPrev}>
            ← Voltar
          </Button>
        ) : (
          <div />
        )}
        {step < 3 ? (
          <Button onClick={goNext} disabled={!canNext()}>
            Continuar <ChevronRight size={16} />
          </Button>
        ) : (
          <Button onClick={submit} disabled={!canNext() || submitting}>
            {submitting ? (
              "Enviando..."
            ) : (
              <>
                <Send size={15} /> Enviar pedido
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
