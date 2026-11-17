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
  HeartHandshake,
  LogOut,
  Menu,
  X,
  Phone,
  Mail,
} from "lucide-react";
import { logoutAction } from "@/app/actions/erp-actions";
import {
  AntapharmaLogo,
  FranjaTestigo,
  PuntoTestigoPill,
} from "@/components/brand/antapharma-brand";
import { BRAND_CONTACT } from "@/lib/catalogo-2027-data";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    shortLabel: "Inicio",
    label: "Inicio & Catálogo",
    subtitle: "Resumen, parámetros y envío",
    icon: LayoutGrid,
  },
  {
    href: "/productos",
    shortLabel: "Stock/Lista",
    label: "Inventario & Precios",
    subtitle: "154 insumos, costos y listas",
    icon: Package,
  },
  {
    href: "/entidades",
    shortLabel: "Clientes",
    label: "Clientes & Markups",
    subtitle: "Markups por línea y directorio",
    icon: Building2,
  },
  {
    href: "/finanzas",
    shortLabel: "Finanzas",
    label: "Flujo Financiero",
    subtitle: "Caja, ingresos y compras",
    icon: Wallet,
  },
  {
    href: "/reportes",
    shortLabel: "Reportes",
    label: "Reportes & Planilla",
    subtitle: "Catálogo PDF, Lista y Excel",
    icon: FileBarChart2,
  },
  {
    href: "/pami",
    shortLabel: "PAMI",
    label: "PAMI",
    subtitle: "Convenios y prestaciones",
    icon: HeartHandshake,
    isPami: true,
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
    <div className="min-h-screen flex bg-[#091E22] text-[#F6F3EE]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-40 border-r border-[#DCEBE8]/15 bg-[#0F3A40] shadow-2xl">
        {/* Franja Testigo superior */}
        <FranjaTestigo variant="cobre-petroleo" className="h-2 w-full" />

        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCEBE8]/12">
          <Link href="/dashboard">
            <AntapharmaLogo
              variant="negative"
              size="md"
              showDescriptor={true}
            />
          </Link>
        </div>

        {/* Tarjeta institucional Dirección Comercial */}
        <div className="px-4 py-3.5">
          <div className="rounded-xl border border-[#DCEBE8]/15 bg-[#1D2527]/50 p-3.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]">
                <span className="h-2 w-2 rounded-full bg-[#B9673A]" />
                El Testigo · v1.1
              </span>
              <span className="font-mono text-[10px] text-[#DCEBE8]/70">
                SDE · AR
              </span>
            </div>
            <p className="mt-1.5 text-xs font-bold text-white">
              {BRAND_CONTACT.responsable}
            </p>
            <p className="font-mono text-[10px] text-[#DCEBE8]/75 truncate">
              {BRAND_CONTACT.email}
            </p>
            <p className="font-mono text-[10px] text-[#DCEBE8]/65">
              {BRAND_CONTACT.telefono}
            </p>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 space-y-1 px-3 py-1 overflow-y-auto custom-scroll">
          {NAV_ITEMS.map((item) => {
            const IconComp = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-150 ${
                  active
                    ? "bg-[#1E7F7A]/30 text-white border border-[#B9673A]/60 shadow-md"
                    : "text-[#DCEBE8]/75 hover:bg-white/[0.05] hover:text-white border border-transparent"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    active
                      ? "border-[#B9673A] bg-[#B9673A] text-white"
                      : item.isPami
                      ? "border-[#1E7F7A]/50 bg-[#1E7F7A]/20 text-[#DCEBE8]"
                      : "border-[#DCEBE8]/15 bg-[#1D2527]/40 text-[#DCEBE8]/80 group-hover:text-white"
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold tracking-wide truncate">
                      {item.label}
                    </p>
                    {item.isPami && (
                      <span className="rounded bg-[#1E7F7A] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-white">
                        NUEVO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#DCEBE8]/55 truncate">
                    {item.subtitle}
                  </p>
                </div>
                {item.href === "/productos" && criticalCount > 0 && (
                  <span className="rounded-full bg-[#B9673A] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    {criticalCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pie Sidebar */}
        <div className="p-4 border-t border-[#DCEBE8]/12 space-y-3">
          <div className="rounded-xl border border-[#DCEBE8]/12 bg-[#1D2527]/40 p-3">
            <p className="font-display text-xs font-bold text-[#B9673A]">
              “{BRAND_CONTACT.claim}”
            </p>
            <p className="mt-0.5 text-[11px] text-[#DCEBE8]/65">
              {BRAND_CONTACT.direccion} · Santiago del Estero
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#DCEBE8]/15 bg-[#1D2527]/50 px-4 py-2.5 text-xs font-semibold text-[#DCEBE8] transition-all hover:border-[#8C3B4A] hover:bg-[#8C3B4A]/30 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-[#DCEBE8]/15 bg-[#0F3A40]/95 backdrop-blur-xl">
          <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden rounded-lg border border-[#DCEBE8]/20 bg-white/5 p-2 text-[#F6F3EE] hover:bg-white/10"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-base sm:text-xl font-bold tracking-tight text-white truncate">
                  {title}
                </h1>
                <p className="text-[11px] sm:text-xs text-[#DCEBE8]/70 truncate">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {criticalCount > 0 && (
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 rounded-full border border-[#B9673A]/60 bg-[#B9673A]/20 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-white transition-colors hover:bg-[#B9673A]/35"
                >
                  <span className="h-2 w-2 rounded-full bg-[#B9673A]" />
                  <span>{criticalCount} Stock Crítico</span>
                </Link>
              )}

              <div className="hidden xl:flex items-center gap-2">
                <PuntoTestigoPill
                  label="Stock disponible"
                  sublabel="CATÁLOGO 2027"
                  tone="dark"
                />
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
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: -290 }}
                animate={{ x: 0 }}
                exit={{ x: -290 }}
                transition={{ duration: 0.22 }}
                className="h-full w-76 max-w-[85vw] border-r border-[#DCEBE8]/20 bg-[#0F3A40] flex flex-col justify-between overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <FranjaTestigo
                    variant="cobre-petroleo"
                    className="h-2 w-full"
                  />
                  <div className="flex items-center justify-between p-4 border-b border-[#DCEBE8]/15">
                    <AntapharmaLogo
                      variant="negative"
                      size="sm"
                      showDescriptor={true}
                    />
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg p-1.5 text-[#DCEBE8]/70 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <nav className="p-3 space-y-1.5">
                    {NAV_ITEMS.map((item) => {
                      const IconComp = item.icon;
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold ${
                            active
                              ? "bg-[#B9673A] text-white shadow"
                              : "text-[#DCEBE8]/85 hover:bg-white/10"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <IconComp className="h-4 w-4" />
                            <span>{item.label}</span>
                          </span>
                          {item.isPami && (
                            <span className="rounded bg-[#1E7F7A] px-1.5 py-0.5 font-mono text-[9px] uppercase text-white">
                              PAMI
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-4 border-t border-[#DCEBE8]/15 space-y-3">
                  <div className="rounded-xl bg-[#1D2527]/50 p-3 text-xs text-[#DCEBE8]/80 space-y-1">
                    <p className="font-bold text-white">
                      {BRAND_CONTACT.responsable}
                    </p>
                    <p className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="h-3 w-3 text-[#B9673A]" />
                      {BRAND_CONTACT.telefono}
                    </p>
                    <p className="flex items-center gap-1.5 font-mono text-[11px] truncate">
                      <Mail className="h-3 w-3 text-[#B9673A]" />
                      {BRAND_CONTACT.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#8C3B4A] bg-[#8C3B4A]/30 px-4 py-2.5 text-xs font-bold text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Container */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-3.5 py-5 sm:px-6 sm:py-7 lg:px-8">
          {children}
        </main>

        {/* Bottom Navigation Bar para Teléfono Móvil (100% Responsive) */}
        <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-[#DCEBE8]/15 bg-[#0F3A40]/95 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-6 h-16">
            {NAV_ITEMS.map((item) => {
              const IconComp = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    active
                      ? "text-[#B9673A] font-bold"
                      : "text-[#DCEBE8]/70 hover:text-white"
                  }`}
                >
                  <div className="relative">
                    <IconComp className="h-4 w-4" />
                    {item.href === "/productos" && criticalCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 h-3.5 min-w-3.5 rounded-full bg-[#B9673A] px-1 text-[8px] font-bold text-white flex items-center justify-center">
                        {criticalCount}
                      </span>
                    )}
                  </div>
                  <span className="truncate max-w-[54px]">
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
