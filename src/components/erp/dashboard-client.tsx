"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  PackageCheck,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  PlusCircle,
  Boxes,
  Building2,
  FileBarChart2,
  CheckCircle2,
  History,
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
import {
  registrarMovimientoStockAction,
  type ErpSnapshot,
} from "@/app/actions/erp-actions";
import { formatARS, formatDateTimeAR } from "@/lib/utils";

const FALLBACK_CRITICAL_ALERTS = [
  {
    id: "mock-1",
    codigo: "ANT-POU-001",
    nombre: "Pouch con testigo para óxido de etileno",
    medida: "15 cm x 200 m",
    presentacion: "Rollo Tubular x 200 m",
    stockActual: 4,
    stockMinimo: 15,
    categoriaNombre: "Papel Grado Médico y Pouches",
  },
  {
    id: "mock-2",
    codigo: "ANT-DES-002",
    nombre: "Descartadores de Cortopunzantes",
    medida: "2.4 Litros",
    presentacion: "Caja x 24 unidades",
    stockActual: 6,
    stockMinimo: 20,
    categoriaNombre: "Descartadores y Bioseguridad",
  },
];

export function DashboardClient({ initialData }: { initialData: ErpSnapshot }) {
  const router = useRouter();
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const ingresos = initialData.transacciones
    .filter((t) => t.tipo === "INGRESO")
    .reduce((acc, t) => acc + Number(t.monto || 0), 0);

  const egresos = initialData.transacciones
    .filter((t) => t.tipo === "EGRESO")
    .reduce((acc, t) => acc + Number(t.monto || 0), 0);

  const gananciaNeta = ingresos - egresos;
  const margenFinanciero =
    ingresos > 0 ? Math.round((gananciaNeta / ingresos) * 100) : 0;

  const valorCostoInventario = initialData.productos.reduce(
    (acc, p) => acc + p.stockActual * p.precioCosto,
    0
  );
  const valorVentaInventario = initialData.productos.reduce(
    (acc, p) => acc + p.stockActual * p.precioVenta,
    0
  );

  const dbCriticos = initialData.productos
    .filter((p) => p.stockActual <= p.stockMinimo)
    .map((p) => ({
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      medida: p.medida,
      presentacion: p.presentacion,
      stockActual: p.stockActual,
      stockMinimo: p.stockMinimo,
      categoriaNombre: p.categoria?.nombre || "Insumos de Esterilización",
    }));

  const alertasCriticas =
    dbCriticos.length > 0 ? dbCriticos : FALLBACK_CRITICAL_ALERTS;

  async function handleQuickRestock(id: string, nombre: string, faltante: number) {
    if (id.startsWith("mock-")) return;
    setRestockingId(id);
    setFeedback(null);
    const cantidad = Math.max(10, faltante);
    const res = await registrarMovimientoStockAction({
      productoId: id,
      tipo: "ENTRADA",
      cantidad,
      motivo: "Reposición rápida desde Alerta de Stock Crítico (Dashboard)",
    });
    setRestockingId(null);
    if (res.ok) {
      setFeedback(`Se ingresaron +${cantidad} u. de "${nombre}" al stock.`);
      router.refresh();
    }
  }

  return (
    <ErpShell
      title="Panel de Control Ejecutivo"
      subtitle="Visión integral de inventario de esterilización médica, flujo de caja y trazabilidad"
      criticalCount={alertasCriticas.length}
    >
      {feedback && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {feedback}
          </span>
          <button
            onClick={() => setFeedback(null)}
            className="text-white/50 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* BENTO GRID ROW 1: Tarjetas Numéricas Financieras */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <BentoCard glowColor="emerald" delay={0.02}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Ingresos Acumulados
              </span>
              <p className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
                {formatARS(ingresos)}
              </p>
              <p className="mt-1.5 text-xs text-white/55">
                Facturación a hospitales, clínicas y centros quirúrgicos
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between text-xs">
            <span className="text-white/50">Comprobantes de venta</span>
            <Link
              href="/finanzas"
              className="font-semibold text-emerald-300 hover:underline"
            >
              Ver libro de ingresos →
            </Link>
          </div>
        </BentoCard>

        <BentoCard glowColor="rose" delay={0.06}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
                <ArrowDownRight className="h-3.5 w-3.5" />
                Egresos por Compras
              </span>
              <p className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
                {formatARS(egresos)}
              </p>
              <p className="mt-1.5 text-xs text-white/55">
                Reposición de lotes, indicadores, pouches y detergentes
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/15 text-rose-300">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between text-xs">
            <span className="text-white/50">Órdenes a proveedores</span>
            <Link
              href="/finanzas"
              className="font-semibold text-rose-300 hover:underline"
            >
              Asentar compra →
            </Link>
          </div>
        </BentoCard>

        <BentoCard glowColor="cyan" delay={0.1}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                <DollarSign className="h-3.5 w-3.5" />
                Ganancia Neta Operativa
              </span>
              <p className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
                {formatARS(gananciaNeta)}
              </p>
              <p className="mt-1.5 text-xs text-white/55">
                Rentabilidad neta de caja ({margenFinanciero}% sobre ventas)
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between text-xs">
            <span className="text-white/50">
              Stock valorizado: {formatARS(valorVentaInventario)}
            </span>
            <Link
              href="/reportes"
              className="font-semibold text-cyan-300 hover:underline"
            >
              Exportar balance →
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* BENTO GRID ROW 2: Alertas de Stock Crítico (2 cols) + Valorización & Accesos (1 col) */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard
          glowColor="amber"
          delay={0.14}
          className="lg:col-span-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      Alertas de Stock Crítico
                    </h2>
                    <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                      {alertasCriticas.length} insumos en umbral
                    </span>
                  </div>
                  <p className="text-xs text-white/55">
                    Insumos de esterilización por debajo del punto de pedido
                    mínimo establecido
                  </p>
                </div>
              </div>

              <Link
                href="/productos"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10"
              >
                <Boxes className="h-3.5 w-3.5 text-cyan-300" />
                Gestionar Inventario
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {alertasCriticas.map((item) => {
                const ratio = Math.min(
                  100,
                  Math.round((item.stockActual / Math.max(1, item.stockMinimo)) * 100)
                );
                const faltante = Math.max(10, item.stockMinimo * 2 - item.stockActual);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-rose-500/25 bg-gradient-to-r from-rose-500/[0.08] via-white/[0.02] to-transparent p-4 transition-all hover:border-rose-500/40"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan-300">
                            {item.codigo}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {item.nombre}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/65">
                            {item.medida} • {item.presentacion}
                          </span>
                        </div>
                        <p className="text-xs text-white/50">
                          Categoría: {item.categoriaNombre}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <div className="text-right">
                          <div className="text-xs font-bold text-rose-300">
                            Disponible: {item.stockActual} u.
                          </div>
                          <div className="text-[11px] text-white/45">
                            Mínimo requerido: {item.stockMinimo} u.
                          </div>
                        </div>

                        {!item.id.startsWith("mock-") && (
                          <button
                            onClick={() =>
                              handleQuickRestock(item.id, item.nombre, faltante)
                            }
                            disabled={restockingId === item.id}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 transition-all hover:bg-emerald-500/25 disabled:opacity-50"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            {restockingId === item.id
                              ? "Ingresando..."
                              : `Reponer +${faltante}`}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-500"
                        style={{ width: `${Math.max(10, ratio)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/8 flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
            <span>
              Monitoreo automático sobre {initialData.productos.length} referencias
              activas en depósito
            </span>
            <span className="text-amber-300 font-medium">
              Prioridad: Óxido de Etileno (ETO) y Cortopunzantes
            </span>
          </div>
        </BentoCard>

        {/* Columna Derecha: Patrimonio de Mercadería & Acciones Rápidas */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <BentoCard glowColor="indigo" delay={0.18}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Valorización de Stock
              </span>
              <PackageCheck className="h-5 w-5 text-indigo-300" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                <p className="text-[11px] text-white/50">
                  Valor de Venta Estimado (PVP)
                </p>
                <p className="mt-0.5 text-xl font-black text-white">
                  {formatARS(valorVentaInventario)}
                </p>
              </div>

              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                <p className="text-[11px] text-white/50">
                  Capital Inmovilizado (Costo)
                </p>
                <p className="mt-0.5 text-lg font-bold text-white/85">
                  {formatARS(valorCostoInventario)}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3.5">
                <p className="text-[11px] text-cyan-200/80">
                  Margen Potencial en Depósito
                </p>
                <p className="mt-0.5 text-lg font-bold text-cyan-300">
                  {formatARS(valorVentaInventario - valorCostoInventario)}
                </p>
              </div>
            </div>
          </BentoCard>

          <BentoCard glowColor="none" delay={0.22}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Accesos Directos de Gestión
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-2.5">
              <Link
                href="/productos"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-white hover:border-cyan-400/40 hover:bg-white/[0.06]"
              >
                <span className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-cyan-400" />
                  Ajustar Precios y Stock
                </span>
                <span>→</span>
              </Link>
              <Link
                href="/entidades"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-white hover:border-cyan-400/40 hover:bg-white/[0.06]"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  Directorio Hospitales y Proveedores
                </span>
                <span>→</span>
              </Link>
              <Link
                href="/reportes"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-white hover:border-cyan-400/40 hover:bg-white/[0.06]"
              >
                <span className="flex items-center gap-2">
                  <FileBarChart2 className="h-4 w-4 text-amber-400" />
                  Emitir Catálogo PDF / Excel
                </span>
                <span>→</span>
              </Link>
            </div>
          </BentoCard>
        </div>
      </div>

      {/* BENTO GRID ROW 3: Últimos Movimientos de Stock & Log de Auditoría */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard className="lg:col-span-7" delay={0.25}>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <History className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Trazabilidad Reciente de Stock
              </h3>
            </div>
            <Link
              href="/productos"
              className="text-xs text-cyan-300 hover:underline"
            >
              Ver kardex completo
            </Link>
          </div>

          <div className="mt-3 divide-y divide-white/8">
            {initialData.movimientos.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-3 text-xs"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        m.tipo === "ENTRADA"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {m.tipo}
                    </span>
                    <span className="font-semibold text-white truncate">
                      {m.producto?.nombre || "Insumo médico"}
                    </span>
                  </div>
                  <p className="mt-1 text-white/50 truncate">
                    {m.motivo}
                    {m.entidad ? ` • ${m.entidad.nombre}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`font-bold ${
                      m.tipo === "ENTRADA"
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }`}
                  >
                    {m.tipo === "ENTRADA" ? "+" : "-"}
                    {m.cantidad} u.
                  </p>
                  <p className="text-[10px] text-white/40">
                    {formatDateTimeAR(m.fecha)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard className="lg:col-span-5" delay={0.28}>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Bitácora de Auditoría (Seguridad)
              </h3>
            </div>
            <span className="text-[11px] text-white/45">Tiempo real</span>
          </div>

          <div className="mt-3 space-y-2.5">
            {initialData.logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-cyan-300">
                    {log.accion}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {formatDateTimeAR(log.fecha)}
                  </span>
                </div>
                <p className="mt-1 text-white/70 text-[11px] leading-relaxed">
                  {log.detalle}
                </p>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>
    </ErpShell>
  );
}
