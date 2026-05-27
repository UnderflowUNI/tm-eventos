// Validação e sanitização de entradas.
// Prisma usa queries parametrizadas → SQL injection já protegido pela ORM.
// Aqui prevenimos: XSS armazenado, prototype pollution, type confusion,
// payloads gigantes, datas inválidas, enums inválidos.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_DIGITS_RE = /\D/g;

// Padrões de ataque a rejeitar em qualquer string de entrada
const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>/i,
  /javascript\s*:/i,
  /on\w+\s*=/i,        // onerror=, onclick=, etc.
  /data\s*:\s*text/i,
  /vbscript\s*:/i,
  /<\s*iframe/i,
  /<\s*object/i,
  /<\s*embed/i,
  /<\s*svg[\s>]/i,
  /\beval\s*\(/i,
  /\bexec\s*\(/i,
  /union\s+select/i,   // SQL injection patterns
  /;\s*drop\s+/i,
  /--\s*$/,
  /\/\*[\s\S]*?\*\//,
  /\x00/,              // null byte
];

const VALID_BOOKING_TYPES = ["VENUE", "TABLE"] as const;
const VALID_EVENT_TYPES = [
  "ALMOCO_CHURRASCO",
  "JANTAR_CHURRASCO",
  "ALMOCO",
  "JANTAR",
  "OUTRO",
] as const;
const VALID_BOOKING_STATUSES = ["NEW", "CONTACTED", "CONFIRMED", "REJECTED"] as const;
const VALID_BLOCK_STATUSES = ["OCCUPIED", "PENDING"] as const;

// ─── Sanitização ──────────────────────────────────────────────────────────────

/** Remove tags HTML, entidades perigosas e limita tamanho. */
export function sanitizeStr(s: unknown, maxLen = 500): string {
  if (typeof s !== "string") return "";
  return s
    .trim()
    .slice(0, maxLen)
    .replace(/<[^>]*>/g, "")          // strip HTML tags
    .replace(/&lt;/gi, "")
    .replace(/&gt;/gi, "")
    .replace(/&amp;/gi, "&")
    .replace(/&#\d+;/g, "")          // strip numeric entities
    .replace(/&#x[\da-f]+;/gi, "")   // strip hex entities
    .trim();
}

function hasDangerousPattern(s: string): boolean {
  return DANGEROUS_PATTERNS.some((re) => re.test(s));
}

function isValidDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(s + "T12:00:00");
  return !isNaN(d.getTime());
}

// Guard contra prototype pollution (ex: __proto__, constructor, prototype)
function isSafeKey(key: string): boolean {
  return !["__proto__", "constructor", "prototype"].includes(key);
}

function assertPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.keys(v as object).every(isSafeKey)
  );
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateLogin(body: unknown): ValidationResult {
  if (!assertPlainObject(body)) return err("Dados inválidos");
  const { email, password } = body;

  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email))
    return err("E-mail inválido");
  if (typeof password !== "string" || password.length < 1 || password.length > 200)
    return err("Senha inválida");
  if (hasDangerousPattern(email))
    return err("E-mail inválido");

  return ok();
}

export function validateBooking(body: unknown): ValidationResult {
  if (!assertPlainObject(body)) return err("Dados inválidos");

  const {
    clientName, whatsapp, email, bookingType, eventDate, eventEndDate,
    guests, eventType, selections, message,
  } = body;

  // Nome
  if (typeof clientName !== "string" || clientName.trim().length < 2 || clientName.length > 120)
    return err("Nome deve ter entre 2 e 120 caracteres");
  if (hasDangerousPattern(clientName))
    return err("Nome contém caracteres inválidos");

  // WhatsApp
  if (typeof whatsapp !== "string") return err("WhatsApp inválido");
  const digits = whatsapp.replace(PHONE_DIGITS_RE, "");
  if (digits.length < 10 || digits.length > 13)
    return err("WhatsApp inválido — informe DDD + número (ex: (32) 9 8496-9955)");

  // E-mail (opcional)
  if (email !== null && email !== undefined && email !== "") {
    if (typeof email !== "string" || !EMAIL_RE.test(email) || email.length > 254)
      return err("E-mail inválido");
    if (hasDangerousPattern(email)) return err("E-mail inválido");
  }

  // Tipo de reserva
  if (!VALID_BOOKING_TYPES.includes(bookingType as never))
    return err("Tipo de reserva inválido");

  // Data
  if (typeof eventDate !== "string" || !isValidDate(eventDate))
    return err("Data inválida");
  const today = new Date().toISOString().split("T")[0];
  if (eventDate < today) return err("A data não pode ser no passado");

  // Data final
  if (eventEndDate !== null && eventEndDate !== undefined && eventEndDate !== "") {
    if (typeof eventEndDate !== "string" || !isValidDate(eventEndDate))
      return err("Data final inválida");
    if (eventEndDate < eventDate) return err("Data final não pode ser antes da inicial");
    // Limite de 365 dias para o período
    const start = new Date(eventDate + "T12:00:00");
    const end = new Date(eventEndDate + "T12:00:00");
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 365) return err("Período máximo: 365 dias");
  }

  // Convidados
  if (typeof guests !== "number" || !Number.isInteger(guests) || guests < 1 || guests > 2000)
    return err("Número de convidados deve ser entre 1 e 2000");

  // Tipo de evento (venue)
  if (bookingType === "VENUE") {
    if (!VALID_EVENT_TYPES.includes(eventType as never))
      return err("Tipo de evento inválido");
  }

  // Seleções do cardápio
  if (selections !== undefined && selections !== null) {
    if (!Array.isArray(selections) || selections.length > 100)
      return err("Seleções inválidas");
    if (selections.some((s) => typeof s !== "string" || s.length > 80 || hasDangerousPattern(s)))
      return err("Item do cardápio inválido");
  }

  // Mensagem opcional
  if (message !== undefined && message !== null && message !== "") {
    if (typeof message !== "string" || message.length > 2000)
      return err("Observação muito longa (máximo 2000 caracteres)");
    if (hasDangerousPattern(message)) return err("Observação contém caracteres inválidos");
  }

  return ok();
}

export function validateBookingStatusPatch(body: unknown): ValidationResult {
  if (!assertPlainObject(body)) return err("Dados inválidos");
  const { id, status } = body;

  if (typeof id !== "string" || id.length < 1 || id.length > 60)
    return err("ID inválido");
  if (!VALID_BOOKING_STATUSES.includes(status as never))
    return err("Status inválido");

  return ok();
}

export function validateCalendarBlock(body: unknown): ValidationResult {
  if (!assertPlainObject(body)) return err("Dados inválidos");

  const dates: string[] = Array.isArray(body.dates)
    ? body.dates
    : body.date
      ? [body.date as string]
      : [];

  if (dates.length === 0) return err("Nenhuma data informada");
  if (dates.length > 90) return err("Máximo de 90 datas por operação");

  for (const d of dates) {
    if (typeof d !== "string" || !isValidDate(d))
      return err(`Data inválida: ${String(d).slice(0, 20)}`);
  }

  if (body.status !== undefined && !VALID_BLOCK_STATUSES.includes(body.status as never))
    return err("Status inválido");

  if (body.label !== undefined && body.label !== null) {
    if (typeof body.label !== "string" || body.label.length > 120)
      return err("Rótulo muito longo");
    if (hasDangerousPattern(body.label)) return err("Rótulo contém caracteres inválidos");
  }

  return ok();
}

export function validateCalendarDelete(dates: string[]): ValidationResult {
  if (!dates || dates.length === 0) return err("Nenhuma data informada");
  if (dates.length > 90) return err("Máximo de 90 datas por operação");
  for (const d of dates) {
    if (typeof d !== "string" || !DATE_RE.test(d))
      return err(`Data inválida: ${String(d).slice(0, 20)}`);
  }
  return ok();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ok(): ValidationResult { return { ok: true }; }
function err(error: string): ValidationResult { return { ok: false, error }; }
