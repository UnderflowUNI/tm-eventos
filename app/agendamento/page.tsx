"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
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

export default function AgendamentoPage() {
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
      <div className="min-h-screen bg-ink-900 text-white grid place-items-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/15 border-2 border-accent flex items-center justify-center">
              <Check size={36} className="text-accent" />
            </div>
            <h1 className="font-display text-4xl mb-3">Quase lá!</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Solicitação registrada com sucesso. Clique no botão abaixo para
              abrir o WhatsApp com a mensagem já pronta — a proprietária
              receberá tudo organizado e entrará em contato em breve.
            </p>
          </div>

          <div className="bg-ink-800/50 border border-accent/20 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              <span className="text-sm text-white/80">Solicitação registrada no sistema</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              <span className="text-sm text-white/80">Data bloqueada no calendário</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              <span className="text-sm text-white/80">Mensagem WhatsApp pronta para envio</span>
            </div>
          </div>

          <a
            href={done.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine w-full flex items-center justify-center gap-3 px-8 py-4 bg-accent text-ink-900 font-bold rounded-xl hover:bg-accent-glow transition text-base mb-4"
          >
            <MessageCircle size={20} />
            Enviar pelo WhatsApp
            <ChevronRight size={18} />
          </a>

          <Link
            href="/"
            className="block text-center text-sm text-white/40 hover:text-white transition"
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
    <div className="min-h-screen bg-ink-900 text-white wood-pattern">
      {/* ── Modal de erro ──────────────────────────────────────────────────── */}
      {errModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-ink-800 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <h3 className="font-display text-xl">Algo deu errado</h3>
              </div>
              <button
                onClick={() => setErrModal("")}
                className="text-white/30 hover:text-white/80 transition p-1"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">{errModal}</p>
            <button
              onClick={() => setErrModal("")}
              className="btn-shine w-full py-3 bg-accent text-ink-900 font-bold rounded-lg transition"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-white/5 bg-ink-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 text-white/70 hover:text-white text-sm sm:text-base"
          >
            <ArrowLeft size={16} /> Voltar
          </Link>
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <Image
              src="/brand/logo-tm.png"
              alt="TM"
              fill
              className="object-contain drop-shadow-[0_0_10px_rgba(94,234,212,0.3)]"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center gap-2 sm:gap-4">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 grid place-items-center rounded-full text-xs sm:text-sm font-bold transition ${
                  currentVisualStep >= s
                    ? "bg-accent text-ink-900"
                    : "bg-ink-700 text-white/40 border border-white/10"
                }`}
              >
                {currentVisualStep > s ? <Check size={14} /> : s}
              </div>
              {s < totalSteps && (
                <div
                  className={`w-10 sm:w-24 h-px ${
                    currentVisualStep > s ? "bg-accent" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-3">
              O que você quer{" "}
              <span className="italic text-accent-glow">reservar</span>?
            </h1>
            <p className="text-white/60 mb-8 sm:mb-10 max-w-xl text-sm sm:text-base">
              Temos duas opções: alugue o espaço completo para seu evento, ou
              reserve uma mesa no pesque-pague.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-10 sm:mb-12">
              <button
                onClick={() => setBookingType("VENUE")}
                className={`text-left p-6 border-2 rounded-lg transition ${
                  bookingType === "VENUE"
                    ? "border-accent bg-accent/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <PartyPopper className="text-accent mb-3" size={28} />
                <div className="font-display text-xl mb-1">Aluguel do espaço</div>
                <div className="text-sm text-white/60">
                  Casamentos, formaturas, aniversários e eventos especiais.
                  Pode reservar por <strong>vários dias</strong>.
                </div>
              </button>
              <button
                onClick={() => setBookingType("TABLE")}
                className={`text-left p-6 border-2 rounded-lg transition ${
                  bookingType === "TABLE"
                    ? "border-accent bg-accent/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <Fish className="text-accent mb-3" size={28} />
                <div className="font-display text-xl mb-1">Reserva de mesa (Pesque-Pague)</div>
                <div className="text-sm text-white/60">
                  Garanta sua mesa pra um dia específico de pescaria e almoço.
                  <strong> 1 dia só</strong>.
                </div>
              </button>
            </div>

            {/* Detalhes VENUE */}
            {isVenue && (
              <div className="animate-fade-up">
                <h2 className="font-display text-2xl mb-6">
                  Sobre seu <span className="italic text-accent">evento</span>
                </h2>
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-3">
                        Tipo de evento
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {EVENTOS.map((e) => (
                          <button
                            key={e.id}
                            onClick={() => setEventType(e.id)}
                            className={`text-left p-4 border rounded-md transition ${
                              eventType === e.id
                                ? "border-accent bg-accent/10"
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            <div className="text-2xl mb-1">{e.icon}</div>
                            <div className="text-sm font-medium">{e.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-3">
                          <Calendar size={14} className="inline mr-1" /> De
                        </label>
                        <input
                          type="date"
                          value={eventDate}
                          min={TODAY}
                          onChange={(e) => {
                            setEventDate(e.target.value);
                            if (eventEndDate && eventEndDate < e.target.value)
                              setEventEndDate(e.target.value);
                          }}
                          className="w-full bg-ink-800 border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-3">
                          <Calendar size={14} className="inline mr-1" /> Até{" "}
                          <span className="text-white/40 normal-case tracking-normal">
                            (mesmo dia se vazio)
                          </span>
                        </label>
                        <input
                          type="date"
                          value={eventEndDate}
                          min={eventDate || TODAY}
                          onChange={(e) => setEventEndDate(e.target.value)}
                          className="w-full bg-ink-800 border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>

                    {eventDate && (
                      <div className="text-xs text-accent/80 flex items-center gap-2">
                        <Sparkles size={12} />
                        {diasRange === 1 ? "1 dia de aluguel" : `${diasRange} dias de aluguel`}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-3">
                        <Users size={14} className="inline mr-1" /> Número de convidados
                      </label>
                      <input
                        type="number"
                        value={guests}
                        onChange={(e) =>
                          setGuests(e.target.value ? Number(e.target.value) : "")
                        }
                        min={1}
                        placeholder="ex: 80"
                        className="w-full bg-ink-800 border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent focus:outline-none"
                      />
                      {typeof guests === "number" && guests > 250 && (
                        <div className="mt-2 text-xs text-amber-400 flex items-center gap-2">
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
              <div className="animate-fade-up">
                <h2 className="font-display text-2xl mb-6">
                  Detalhes da <span className="italic text-accent">mesa</span>
                </h2>
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-3">
                        <Calendar size={14} className="inline mr-1" /> Dia da reserva
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        min={TODAY}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-ink-800 border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent focus:outline-none"
                      />
                      <div className="text-xs text-white/40 mt-2">Reserva é para o dia inteiro</div>
                    </div>
                    <div>
                      <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-3">
                        <Users size={14} className="inline mr-1" /> Quantas pessoas na mesa?
                      </label>
                      <input
                        type="number"
                        value={guests}
                        onChange={(e) =>
                          setGuests(e.target.value ? Number(e.target.value) : "")
                        }
                        min={1}
                        max={20}
                        placeholder="ex: 6"
                        className="w-full bg-ink-800 border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div className="p-5 bg-accent/5 border border-accent/20 rounded-md text-sm text-white/70 leading-relaxed">
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
          <div className="animate-fade-up">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-3">
              Monte seu <span className="italic text-accent-glow">cardápio</span>
            </h1>
            <p className="text-white/60 mb-8 sm:mb-10 max-w-xl text-sm sm:text-base">
              Marque os itens que você quer no seu evento. O valor é calculado
              automaticamente conforme você seleciona.
            </p>

            <div className="grid lg:grid-cols-[1fr_360px] gap-6 sm:gap-8">
              <div className="space-y-8">
                {CARDAPIO.map((cat) => (
                  <div
                    key={cat.id}
                    className="border border-white/10 rounded-lg p-5 bg-ink-800/30"
                  >
                    <div className="mb-4">
                      <h3 className="font-display text-2xl">{cat.titulo}</h3>
                      <p className="text-xs text-white/50 mt-1">{cat.descricao}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {cat.itens.map((item) => {
                        const checked = selections.has(item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggle(item.id)}
                            className={`group flex items-center gap-3 p-3 border rounded-md text-left transition ${
                              checked
                                ? "border-accent bg-accent/10"
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 grid place-items-center rounded border transition ${
                                checked ? "bg-accent border-accent" : "border-white/30"
                              }`}
                            >
                              {checked && <Check size={12} className="text-ink-900" />}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{item.nome}</div>
                              {item.descricao && (
                                <div className="text-xs text-white/40 mt-0.5">{item.descricao}</div>
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
                <div className="border border-accent/30 rounded-lg p-6 bg-gradient-to-br from-ink-800 to-ink-900">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
                    Estimativa
                  </div>
                  <div className="font-display text-4xl mb-2">
                    R$ {orcamento.total.toFixed(2).replace(".", ",")}
                  </div>
                  <div className="text-xs text-white/50">
                    R$ {orcamento.porPessoa.toFixed(2)} por pessoa ×{" "}
                    {typeof guests === "number" ? guests : 0} convidados
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="text-xs text-white/60 mb-3">
                      <strong className="text-white/80">{selections.size}</strong>{" "}
                      {selections.size === 1 ? "item selecionado" : "itens selecionados"}
                    </div>
                    <div className="text-[11px] text-white/40 leading-relaxed">{orcamento.obs}</div>
                  </div>

                  <details className="mt-6">
                    <summary className="cursor-pointer text-xs text-accent hover:underline">
                      Ver o que está incluso →
                    </summary>
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-white/50">
                      {MATERIAL_INCLUSO.map((m) => (
                        <div key={m}>• {m}</div>
                      ))}
                    </div>
                    <div className="mt-3 text-[11px] text-white/50">
                      <div className="text-accent/80 mb-1">Equipe:</div>
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
          <div className="animate-fade-up max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-3">
              Seus <span className="italic text-accent-glow">dados</span>
            </h1>
            <p className="text-white/60 mb-8 sm:mb-10 text-sm sm:text-base">
              Falta pouco! Preencha seus dados para enviarmos sua solicitação.
            </p>

            <div className="space-y-6">
              <Field
                label="Nome completo *"
                value={clientName}
                onChange={setClientName}
                placeholder="Como podemos te chamar?"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                {/* WhatsApp com validação em tempo real */}
                <div>
                  <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-2">
                    WhatsApp *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => {
                        setWhatsapp(e.target.value);
                        if (phoneTouched) setPhoneTouched(true);
                      }}
                      onBlur={() => setPhoneTouched(true)}
                      placeholder="(32) 9 9999-9999"
                      className={`w-full bg-ink-800 border rounded-md px-4 py-3 pr-10 text-white focus:outline-none transition ${
                        phoneError
                          ? "border-red-500/70 focus:border-red-500"
                          : phoneOk
                          ? "border-green-500/50 focus:border-green-400"
                          : "border-white/10 focus:border-accent"
                      }`}
                    />
                    {phoneOk && (
                      <Check
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
                      />
                    )}
                    {phoneError && (
                      <AlertCircle
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400"
                      />
                    )}
                  </div>
                  {phoneError && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
                      <AlertCircle size={11} /> {phoneError}
                    </p>
                  )}
                </div>

                {/* E-mail com validação em tempo real */}
                <div>
                  <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailTouched) setEmailTouched(true);
                      }}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="seu@email.com"
                      className={`w-full bg-ink-800 border rounded-md px-4 py-3 pr-10 text-white focus:outline-none transition ${
                        emailError
                          ? "border-red-500/70 focus:border-red-500"
                          : emailOk
                          ? "border-green-500/50 focus:border-green-400"
                          : "border-white/10 focus:border-accent"
                      }`}
                    />
                    {emailOk && (
                      <Check
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
                      />
                    )}
                    {emailError && (
                      <AlertCircle
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400"
                      />
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
                      <AlertCircle size={11} /> {emailError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-2">
                  Observações
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={
                    isTable
                      ? "Tem alguma preferência? Alguma criança vai?"
                      : "Algo a mais que devemos saber? (decoração, restrições alimentares, etc.)"
                  }
                  className="w-full bg-ink-800 border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent focus:outline-none resize-none"
                />
              </div>

              {/* Resumo */}
              <div className="mt-8 p-6 border border-white/10 rounded-lg bg-ink-800/40">
                <div className="text-xs uppercase tracking-[0.3em] text-accent/80 mb-4">
                  Resumo do pedido
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>
                    <strong className="text-white">Tipo:</strong>{" "}
                    {isTable ? "🎣 Reserva de mesa (Pesque-Pague)" : "🎉 Aluguel do espaço"}
                  </li>
                  {isVenue && (
                    <li>
                      <strong className="text-white">Evento:</strong>{" "}
                      {EVENTOS.find((e) => e.id === eventType)?.label}
                    </li>
                  )}
                  <li>
                    <strong className="text-white">Data:</strong>{" "}
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
                    <strong className="text-white">
                      {isTable ? "Pessoas na mesa:" : "Convidados:"}
                    </strong>{" "}
                    {guests}
                  </li>
                  {isVenue && (
                    <>
                      <li>
                        <strong className="text-white">Itens:</strong> {selections.size}
                      </li>
                      <li className="pt-2 border-t border-white/10 text-accent font-bold">
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
            <button
              onClick={goPrev}
              className="px-4 sm:px-6 py-3 border border-white/15 rounded-md hover:border-white/40 transition text-sm sm:text-base"
            >
              ← Voltar
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={goNext}
              disabled={!canNext()}
              className="btn-shine inline-flex items-center gap-2 px-5 sm:px-7 py-3 bg-accent text-ink-900 font-bold rounded-md hover:bg-accent-glow disabled:opacity-30 disabled:cursor-not-allowed transition text-sm sm:text-base"
            >
              Continuar <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!canNext() || submitting}
              className="btn-shine inline-flex items-center gap-2 px-5 sm:px-7 py-3 bg-accent text-ink-900 font-bold rounded-md hover:bg-accent-glow disabled:opacity-30 disabled:cursor-not-allowed transition text-sm sm:text-base"
            >
              {submitting ? (
                "Enviando..."
              ) : (
                <>
                  <Send size={15} /> Enviar pedido
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-accent uppercase tracking-[0.2em] mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-ink-800 border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent focus:outline-none"
      />
    </div>
  );
}
