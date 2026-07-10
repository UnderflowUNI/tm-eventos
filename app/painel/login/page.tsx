"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { LogIn, AlertCircle, Eye, EyeOff, Clock } from "lucide-react";
import { PrefsControls } from "@/components/site/PrefsControls";

const INPUT_CLS =
  "w-full min-h-[2.75rem] bg-bg border border-line rounded px-4 py-3.5 sm:py-4 text-base sm:text-lg text-ink focus:border-accent focus:outline-none transition-colors duration-fast";

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
    <main id="conteudo" className="min-h-screen grid place-items-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image
              src="/brand/logo-tm.png"
              alt="TM"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <h1 className="font-display text-3xl">Painel Administrativo</h1>
          <p className="text-muted text-sm mt-2">
            Acesso restrito à proprietária
          </p>
        </div>

        {timedOut && (
          <div className="flex items-center gap-3 text-warn text-sm bg-warn/10 border border-warn/40 rounded p-4 mb-5">
            <Clock size={16} className="shrink-0" />
            Sessão encerrada por inatividade. Faça login novamente.
          </div>
        )}

        <form
          onSubmit={submit}
          className="bg-surface border border-line rounded p-6 sm:p-8 space-y-5"
          noValidate
        >
          <div>
            <label htmlFor="login-email" className="block text-sm sm:text-base mb-2 text-ink/85">
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label htmlFor="login-senha" className="block text-sm sm:text-base mb-2 text-ink/85">
              Senha
            </label>
            <div className="relative">
              <input
                id="login-senha"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={`${INPUT_CLS} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[2.75rem] min-h-[2.75rem] grid place-items-center text-muted hover:text-accent transition-colors duration-fast"
                aria-label={showPass ? "Ocultar senha" : "Ver senha"}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 border border-danger/40 rounded p-3" role="alert">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 min-h-[3rem] bg-accent text-accent-contrast font-bold text-base sm:text-lg rounded hover:opacity-90 disabled:opacity-50 transition-opacity duration-fast"
          >
            <LogIn size={18} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <PrefsControls />
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
