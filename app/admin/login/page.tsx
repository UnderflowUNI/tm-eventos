"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao entrar");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 grid place-items-center px-6 wood-pattern">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 border border-accent/60 rounded-md grid place-items-center font-display text-accent text-3xl">
            TM
          </div>
          <h1 className="font-display text-3xl">Painel Administrativo</h1>
          <p className="text-white/50 text-sm mt-2">
            Acesso restrito à proprietária
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-ink-800/60 border border-white/10 rounded-lg p-8 space-y-5"
        >
          <div>
            <label className="block text-base mb-2 text-white/80">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-ink-900 border border-white/10 rounded-md px-4 py-4 text-lg focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-base mb-2 text-white/80">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-ink-900 border border-white/10 rounded-md px-4 py-4 text-lg focus:border-accent focus:outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-md p-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-shine w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-accent text-ink-900 font-bold text-lg rounded-md hover:bg-accent-glow disabled:opacity-50 transition"
          >
            <LogIn size={18} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
