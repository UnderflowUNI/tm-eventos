import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me-now"
);

// ─── Rate limiter em memória ──────────────────────────────────────────────────
// Para múltiplas instâncias (scale-out), migrar para Redis/Upstash.
// No Render free tier (single instance) funciona perfeitamente.
const rl = new Map<string, { n: number; reset: number }>();

function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const e = rl.get(key);
  if (!e || now > e.reset) {
    rl.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (e.n >= max) return false;
  e.n++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rl) if (now > v.reset) rl.delete(k);
}, 5 * 60 * 1000);

// ─── Headers de segurança ─────────────────────────────────────────────────────
const SEC_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

// ─── Limite de tamanho de corpo ───────────────────────────────────────────────
const BODY_SIZE_LIMITS: Record<string, number> = {
  "/api/auth/login": 1_024,        // 1 KB
  "/api/booking": 16_384,          // 16 KB
  "/api/painel/calendar": 32_768,   // 32 KB
  "/api/painel/bookings": 4_096,    // 4 KB
};

// ─── Middleware principal ─────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // ── Bloqueia Content-Type suspeito em POST/PATCH ──────────────────────────
  if (["POST", "PATCH", "PUT"].includes(req.method)) {
    const ct = req.headers.get("content-type") ?? "";
    if (pathname.startsWith("/api/") && !ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type inválido" }, { status: 415 });
    }
  }

  // ── Verifica tamanho do corpo ─────────────────────────────────────────────
  const limit = BODY_SIZE_LIMITS[pathname];
  if (limit) {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > limit) {
      return NextResponse.json(
        { error: "Corpo da requisição muito grande" },
        { status: 413 }
      );
    }
  }

  // ── Rate limiting: login (10 req/min por IP) ──────────────────────────────
  if (pathname === "/api/auth/login" && req.method === "POST") {
    if (!allow(`login:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Muitas tentativas de login. Aguarde 1 minuto." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // ── Rate limiting: agendamento público (5 req/5 min por IP) ──────────────
  if (pathname === "/api/booking" && req.method === "POST") {
    if (!allow(`booking:${ip}`, 5, 5 * 60_000)) {
      return NextResponse.json(
        { error: "Muitas solicitações. Aguarde alguns minutos." },
        { status: 429, headers: { "Retry-After": "300" } }
      );
    }
  }

  // ── Rate limiting: API pública do calendário (60 req/min por IP) ─────────
  if (pathname === "/api/calendar") {
    if (!allow(`cal:${ip}`, 60, 60_000)) {
      return NextResponse.json({ error: "Rate limit excedido." }, { status: 429 });
    }
  }

  // ── Proteção de rotas admin (páginas) ─────────────────────────────────────
  if (pathname.startsWith("/painel") && pathname !== "/painel/login") {
    const token = req.cookies.get("tm_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/painel/login", req.url));
    }
    try {
      await jwtVerify(token, SECRET);
    } catch {
      const redir = NextResponse.redirect(new URL("/painel/login", req.url));
      redir.cookies.delete("tm_session");
      return redir;
    }
  }

  // ── Proteção de rotas admin (API) ─────────────────────────────────────────
  if (pathname.startsWith("/api/painel")) {
    const token = req.cookies.get("tm_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    try {
      await jwtVerify(token, SECRET);
    } catch {
      const r = NextResponse.json({ error: "Sessão expirada" }, { status: 401 });
      r.cookies.delete("tm_session");
      return r;
    }
    // Rate limiting adicional na API admin (100 req/min por IP)
    if (!allow(`painel-api:${ip}`, 100, 60_000)) {
      return NextResponse.json({ error: "Rate limit excedido." }, { status: 429 });
    }
  }

  // ── Aplica security headers em todas as respostas ─────────────────────────
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(SEC_HEADERS)) res.headers.set(k, v);
  return res;
}

export const config = {
  matcher: [
    "/painel/:path*",
    "/api/painel/:path*",
    "/api/auth/login",
    "/api/booking",
    "/api/calendar",
  ],
};
