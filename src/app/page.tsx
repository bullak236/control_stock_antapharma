"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound, Activity } from "lucide-react";
import { loginAction } from "@/app/actions/erp-actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("david@antapharma.com");
  const [password, setPassword] = useState("Antapharma2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);

    const res = await loginAction(formData);
    if (!res.ok) {
      setError(res.error || "Credenciales inválidas.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient OpenHero Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-cyan-500/12 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bento-glass rounded-3xl p-8 sm:p-10 border border-white/12 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-white/10 to-white/[0.02] p-3 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
              <img
                src="/logo-antapharma.png"
                alt="Antapharma Distribuidora"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-cyan-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Acceso Privado Exclusivo
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-white">
              ANTAPHARMA{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                ERP
              </span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-white/55">
              Consola de Control de Stock, Flujo de Caja e Insumos de
              Esterilización Médica — Dirección General (David)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/75">
                Correo Electrónico Corporativo
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@antapharma.com"
                  className="w-full rounded-xl border border-white/12 bg-white/[0.04] pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-cyan-400/60 focus:bg-white/[0.07]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/75">
                Clave Maestra de Seguridad
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/12 bg-white/[0.04] pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-cyan-400/60 focus:bg-white/[0.07]"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all hover:bg-cyan-50 disabled:opacity-50"
            >
              <span>
                {loading
                  ? "Verificando credenciales..."
                  : "Ingresar a Consola ERP"}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Quick Demo Fill for David */}
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.025] p-3.5">
            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span className="flex items-center gap-1.5 font-medium text-cyan-300">
                <KeyRound className="h-3.5 w-3.5" />
                Credenciales de Dirección precargadas
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail("david@antapharma.com");
                  setPassword("Antapharma2026!");
                }}
                className="underline decoration-white/30 hover:text-white"
              >
                Restaurar
              </button>
            </div>
            <p className="mt-1 text-[11px] text-white/45 font-mono">
              Usuario: david@antapharma.com • Clave: Antapharma2026!
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-white/40">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-emerald-400" />
              Supabase PostgreSQL
            </span>
            <span>•</span>
            <span>Cloudflare Edge PWA</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
