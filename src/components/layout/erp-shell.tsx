"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Package,
  Building2,
  Wallet,
  FileBarChart2,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Activity,
  Sparkles,
} from "lucide-react";
import { logoutAction } from "@/app/actions/erp-actions";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard Bento",
    subtitle: "Resumen ejecutivo y alertas",
    icon: LayoutGrid,
  },
  {
    href: "/productos",
    label: "Inventario & Precios",
    subtitle: "Insumos, stock y movimientos",
    icon: Package,
  },
  {
    href: "/entidades",
    label: "Clientes & Proveedores",
    subtitle: "Hospitales y laboratorios",
    icon: Building2,
  },
  {
    href: "/finanzas",
    label: "Flujo Financiero",
    subtitle: "Caja, ingresos y compras",
    icon: Wallet,
  },
  {
    href: "/reportes",
    label: "Reportes & Exportación",
    subtitle: "Catálogo PDF, XLSX y CSV",
    icon: FileBarChart2,
  },
];

interface ErpShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  criticalCount?: number;
}

export function ErpShell({
  children,
  title,
  subtitle,
  criticalCount = 0,
}: ErpShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-[#05060a] text-white">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-40 border-r border-white/10 bg-[#07090f]/90 backdrop-blur-2xl">
        <div className="flex items-center gap-3.5 px-6 h-20 border-b border-white/8">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-emerald-500/20 shadow-[0_0_25px_rgba(34,211,238,0.2)]">
            <img
              src="/logo-antapharma.png"
              alt="Antapharma"
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-wider text-white truncate">
                ANTAPHARMA
              </span>
              <span className="rounded-md bg-cyan-500/15 border border-cyan-400/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-300">
                ERP
              </span>
            </div>
            <p className="text-[11px] text-white/50 truncate">
              Esterilización Médica • Privado
            </p>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Cloudflare Edge + Supabase
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <p className="mt-1 text-xs font-semibold text-white">
              David — Dirección General
            </p>
            <p className="text-[11px] text-white/45">david@antapharma.com</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto custom-scroll">
          {NAV_ITEMS.map((item) => {
            const IconComp = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-cyan-500/15 via-white/[0.06] to-transparent text-white border border-cyan-400/30 shadow-[0_4px_20px_rgba(34,211,238,0.1)]"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white border border-transparent"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    active
                      ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-300"
                      : "border-white/10 bg-white/[0.03] text-white/60 group-hover:text-white"
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold tracking-wide truncate">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-white/40 truncate">
                    {item.subtitle}
                  </p>
                </div>
                {item.href === "/productos" && criticalCount > 0 && (
                  <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                    {criticalCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="rounded-xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.07] to-transparent p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PWA Instalable Activa</span>
            </div>
            <p className="mt-1 text-[11px] text-white/50 leading-relaxed">
              Acceso directo encriptado para control de stock y tesorería.
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white/75 transition-all hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            {loggingOut ? "Cerrando sesión..." : "Cerrar Sesión Segura"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05060a]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/80 hover:text-white"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                  {title}
                </h1>
                <p className="text-xs text-white/50 truncate">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {criticalCount > 0 && (
                <Link
                  href="/productos?filtro=critico"
                  className="hidden sm:inline-flex items-center gap-2 rounded-full border border-rose-500/35 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
                >
                  <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                  <span>{criticalCount} Stock Crítico</span>
                </Link>
              )}

              <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/75">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                <span>PostgreSQL Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.25 }}
                className="h-full w-72 border-r border-white/10 bg-[#080a10] p-5 flex flex-col justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/logo-antapharma.png"
                        alt="Antapharma"
                        className="h-8 w-8 object-contain"
                      />
                      <span className="font-bold text-sm tracking-wide">
                        ANTAPHARMA ERP
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg p-1.5 text-white/60 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <nav className="mt-5 space-y-1.5">
                    {NAV_ITEMS.map((item) => {
                      const IconComp = item.icon;
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold ${
                            active
                              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30"
                              : "text-white/70 hover:bg-white/5"
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-200"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Container */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
