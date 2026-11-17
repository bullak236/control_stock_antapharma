"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, KeyRound } from "lucide-react";
import { loginAction } from "@/app/actions/erp-actions";
import {
  AntapharmaLogo,
  FranjaTestigo,
  PuntoTestigoPill,
} from "@/components/brand/antapharma-brand";
import { BRAND_CONTACT } from "@/lib/catalogo-2027-data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("antapharma@gmail.com");
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
    <div className="relative min-h-screen flex flex-col justify-between bg-[#0F3A40] text-white overflow-hidden">
      {/* Franja Testigo oficial en el borde derecho (como la Tapa del Manual v1.1 Pág. 01) */}
      <FranjaTestigo
        variant="cobre-petroleo"
        className="fixed right-0 top-0 bottom-0 w-4 sm:w-8 z-20"
      />

      {/* Cabecera Superior */}
      <header className="w-full max-w-6xl mx-auto px-5 sm:px-10 pt-6 sm:pt-8 pr-8 sm:pr-16 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 font-mono text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#DCEBE8]/80">
          <span>SISTEMA INTERNO ERP</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">CATÁLOGO 2027</span>
          <span>·</span>
          <span>V1.1 — 11.2026</span>
        </div>

        <PuntoTestigoPill
          label="VERSIÓN 1.1 — LOGO DEFINIDO: EL TESTIGO"
          tone="outline"
          className="text-[10px]"
        />
      </header>

      {/* Cuerpo Central */}
      <main className="w-full max-w-6xl mx-auto px-5 sm:px-10 py-8 pr-8 sm:pr-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Columna Izquierda: Identidad de Marca Antapharma */}
        <div className="lg:col-span-7 space-y-6">
          <AntapharmaLogo variant="negative" size="lg" showDescriptor={true} />

          <p className="font-display text-2xl sm:text-3xl text-[#B9673A] font-normal tracking-tight">
            {BRAND_CONTACT.claim}
          </p>

          <p className="text-sm sm:text-base text-[#DCEBE8]/85 max-w-xl leading-relaxed">
            La distribuidora santiagueña de{" "}
            <strong className="text-white">
              descartables e insumos de esterilización
            </strong>{" "}
            que responde rápido, asesora con criterio técnico y entrega lo que
            promete. Que en el área crítica nada falte ni falle.
          </p>

          {/* Las 6 Líneas Oficiales */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl">
            {[
              { num: "01", name: "Descartables", color: "#B9673A" },
              { num: "02", name: "Empaque esterilización", color: "#1E7F7A" },
              { num: "03", name: "Control esterilización", color: "#C8952B" },
              { num: "04", name: "Óxido de etileno", color: "#8C3B4A" },
              { num: "05", name: "Limpieza y desinfección", color: "#2E6E9E" },
              { num: "06", name: "Equipamiento y seguridad", color: "#55656A" },
            ].map((l) => (
              <div
                key={l.num}
                className="flex items-center gap-2 rounded-lg border border-[#DCEBE8]/15 bg-[#1D2527]/40 px-3 py-2 text-xs"
              >
                <span
                  style={{ backgroundColor: l.color }}
                  className="h-2.5 w-4 shrink-0 rounded-full"
                />
                <span className="font-mono text-[10px] text-[#DCEBE8]/70">
                  {l.num}
                </span>
                <span className="truncate font-medium text-white">
                  {l.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Acceso sobre Gasa / Petróleo */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:col-span-5"
        >
          <div className="rounded-xl border border-[#DCEBE8]/20 bg-[#F6F3EE] p-6 sm:p-8 text-[#1D2527] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#6B7A7D]/25 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#B9673A] font-bold">
                  ACCESO DIRECCIÓN COMERCIAL
                </span>
                <h2 className="mt-1 font-display text-xl font-bold text-[#0F3A40]">
                  Consola de Gestión Antapharma
                </h2>
              </div>
              <span className="h-3 w-6 rounded-full bg-[#B9673A]" />
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0F3A40]">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7A7D]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="antapharma@gmail.com"
                    className="w-full rounded-lg border border-[#6B7A7D]/40 bg-white pl-10 pr-4 py-2.5 text-sm text-[#1D2527] outline-none transition-colors focus:border-[#0F3A40]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0F3A40]">
                  Clave de acceso
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7A7D]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-[#6B7A7D]/40 bg-white pl-10 pr-4 py-2.5 text-sm text-[#1D2527] outline-none transition-colors focus:border-[#0F3A40]"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-[#8C3B4A] bg-[#8C3B4A]/10 px-3.5 py-2.5 text-xs font-medium text-[#8C3B4A]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F3A40] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#1E7F7A] disabled:opacity-50"
              >
                <span>
                  {loading
                    ? "Verificando acceso..."
                    : "Ingresar al Sistema Antapharma"}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-5 rounded-lg border border-[#6B7A7D]/25 bg-[#DCEBE8]/60 p-3">
              <div className="flex items-center justify-between text-[11px] text-[#0F3A40]">
                <span className="flex items-center gap-1.5 font-bold">
                  <KeyRound className="h-3.5 w-3.5 text-[#B9673A]" />
                  Acceso directo precargado
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("antapharma@gmail.com");
                    setPassword("Antapharma2026!");
                  }}
                  className="underline font-semibold hover:text-[#B9673A]"
                >
                  Restaurar
                </button>
              </div>
              <p className="mt-1 font-mono text-[11px] text-[#1D2527]/80">
                {BRAND_CONTACT.email} · Clave: Antapharma2026!
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Pie de Tapa (Igual al Manual Pág. 01) */}
      <footer className="w-full max-w-6xl mx-auto px-5 sm:px-10 pb-6 pr-8 sm:pr-16 flex flex-wrap items-center justify-between gap-4 text-xs text-[#DCEBE8]/80">
        <div>
          <p className="font-bold text-white">
            Descartables e insumos de esterilización
          </p>
          <p>
            {BRAND_CONTACT.direccion} · {BRAND_CONTACT.ciudad}
          </p>
        </div>
        <div className="font-mono text-[11px]">
          {BRAND_CONTACT.telefono} · {BRAND_CONTACT.email}
        </div>
      </footer>
    </div>
  );
}
