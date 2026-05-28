"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { LogIn, AlertCircle, Eye, EyeOff, Clock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const timedOut = params.get("motivo") === "inatividade";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao entrar");
      } else {
        router.push("/painel");
        router.refresh();
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 grid place-items-center px-4 sm:px-6 wood-pattern">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image
              src="/brand/logo-tm.png"
              alt="TM"
              fill
              className="object-contain drop-shadow-[0_0_18px_rgba(94,234,212,0.4)]"
            />
          </div>
          <h1 className="font-display text-3xl">Painel Administrativo</h1>
          <p className="text-white/50 text-sm mt-2">
            Acesso restrito à proprietária
          </p>
        </div>

        {timedOut && (
          <div className="flex items-center gap-3 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 rounded-md p-4 mb-5">
            <Clock size={16} className="shrink-0" />
            Sessão encerrada por inatividade. Faça login novamente.
          </div>
        )}

        <form
          onSubmit={submit}
          className="bg-ink-800/60 border border-white/10 rounded-lg p-6 sm:p-8 space-y-5"
          noValidate
        >
          <div>
            <label className="block text-sm sm:text-base mb-2 text-white/80">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              className="w-full bg-ink-900 border border-white/10 rounded-md px-4 py-3.5 sm:py-4 text-base sm:text-lg focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base mb-2 text-white/80">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-ink-900 border border-white/10 rounded-md px-4 py-3.5 sm:py-4 pr-12 text-base sm:text-lg focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-accent transition p-1"
                aria-label={showPass ? "Ocultar senha" : "Ver senha"}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-md p-3">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-shine w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-accent text-ink-900 font-bold text-base sm:text-lg rounded-md hover:bg-accent-glow disabled:opacity-50 transition"
          >
            <LogIn size={18} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
