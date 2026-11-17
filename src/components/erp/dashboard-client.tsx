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
  CheckCircle2,
  History,
  Settings2,
  Calculator,
  BookOpen,
  Save,
  HeartHandshake,
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
import { CatalogoShareHub } from "@/components/erp/catalogo-share-modal";
import {
  BrandFamilyIcon,
  PuntoTestigoPill,
} from "@/components/brand/antapharma-brand";
import { LINEAS_OFICIALES } from "@/lib/catalogo-2027-data";
import {
  registrarMovimientoStockAction,
  updateParametrosErpAction,
  type ErpSnapshot,
} from "@/app/actions/erp-actions";
import { formatARS, formatDateTimeAR } from "@/lib/utils";

export function DashboardClient({ initialData }: { initialData: ErpSnapshot }) {
  const router = useRouter();
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Estado editable para PARÁMETROS (Hoja Inicio del Excel)
  const [ivaPct, setIvaPct] = useState(
    String(Math.round((initialData.parametros.ivaGeneral ?? 0.21) * 10000) / 100)
  );
  const [gastosPct, setGastosPct] = useState(
    String(
      Math.round((initialData.parametros.gastosGenerales ?? 0) * 10000) / 100
    )
  );
  const [redondeo, setRedondeo] = useState(
    String(initialData.parametros.redondeoMultiplo ?? 10)
  );
  const [vigencia, setVigencia] = useState(
    initialData.parametros.vigenciaDesde || "2026-11-10"
  );
  const [condiciones, setCondiciones] = useState(
    initialData.parametros.condiciones ||
      "Precios en pesos argentinos. Sujetos a modificación sin previo aviso."
  );
  const [contacto, setContacto] = useState(
    initialData.parametros.contacto ||
      "antapharma@gmail.com · 385 420-9044 · San Ramón Nonato 5947, Santiago del Estero"
  );
  const [notasCatalogo, setNotasCatalogo] = useState(
    initialData.parametros.notasCatalogo || ""
  );
  const [savingParams, setSavingParams] = useState(false);

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

  const alertasCriticas = initialData.productos
    .filter((p) => p.stockActual <= p.stockMinimo)
    .map((p) => ({
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      familia: p.familia || p.medida,
      presentacion: p.presentacion,
      stockActual: p.stockActual,
      stockMinimo: p.stockMinimo,
      categoriaNombre: p.categoria?.nombre || "Descartables",
    }));

  async function handleQuickRestock(
    id: string,
    nombre: string,
    faltante: number
  ) {
    setRestockingId(id);
    setFeedback(null);
    const cantidad = Math.max(10, faltante);
    const res = await registrarMovimientoStockAction({
      productoId: id,
      tipo: "ENTRADA",
      cantidad,
      motivo: "Reposición rápida desde Alerta de Stock Crítico (Inicio)",
    });
    setRestockingId(null);
    if (res.ok) {
      setFeedback(`Se ingresaron +${cantidad} u. de "${nombre}" al stock.`);
      router.refresh();
    }
  }

  async function handleSaveParametros(e: React.FormEvent) {
    e.preventDefault();
    setSavingParams(true);
    setFeedback(null);
    const res = await updateParametrosErpAction({
      ivaGeneral: (Number(ivaPct) || 21) / 100,
      gastosGenerales: (Number(gastosPct) || 0) / 100,
      redondeoMultiplo: Number(redondeo) || 10,
      vigenciaDesde: vigencia,
      condiciones,
      contacto,
      notasCatalogo,
    });
    setSavingParams(false);
    if (res.ok) {
      setFeedback(
        "Parámetros globales de precios (IVA, Gastos, Redondeo y Vigencia) actualizados en todo el ERP."
      );
      router.refresh();
    }
  }

  return (
    <ErpShell
      title="Inicio · Antapharma ERP"
      subtitle="Catálogo 2027, parámetros de precios, control de stock crítico y flujo operativo"
      criticalCount={alertasCriticas.length}
    >
      {feedback && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[#1E7F7A] bg-[#1E7F7A]/20 px-4 py-3 text-xs text-[#F6F3EE]">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-[#B9673A]" />
            {feedback}
          </span>
          <button
            onClick={() => setFeedback(null)}
            className="text-[#DCEBE8]/70 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* BLOQUE 1: CATÁLOGO DEFINITIVO 2027 + ENVÍO POR WHATSAPP Y MAIL (antapharma@gmail.com) */}
      <div className="mb-6">
        <CatalogoShareHub
          productos={initialData.productos}
          entidades={initialData.entidades}
          parametros={initialData.parametros}
        />
      </div>

      {/* BLOQUE 2: ARQUITECTURA DE LAS 6 LÍNEAS OFICIALES (Los Descartables primero - Pág. 05 y 13) */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {LINEAS_OFICIALES.map((linea) => {
          const prodsLinea = initialData.productos.filter(
            (p) =>
              p.categoriaId === linea.id ||
              p.categoria?.numeroLinea === linea.numero
          );
          const stockUnidades = prodsLinea.reduce(
            (acc, p) => acc + p.stockActual,
            0
          );
          return (
            <Link
              key={linea.id}
              href={`/productos?linea=${linea.id}`}
              className="group rounded-xl border border-[#DCEBE8]/15 bg-[#0F3A40]/90 p-3.5 transition-all hover:border-[#B9673A]/60 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{ backgroundColor: linea.colorHex }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
                >
                  <BrandFamilyIcon
                    familia={linea.nombre}
                    className="h-4 w-4 text-white"
                  />
                </span>
                <span className="font-mono text-[10px] font-bold text-[#DCEBE8]/70">
                  LÍNEA {linea.codigoLinea}
                </span>
              </div>
              <p className="mt-2.5 font-display text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
                {linea.nombre}
              </p>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-[#DCEBE8]/75">
                <span>{prodsLinea.length} cód.</span>
                <span>{stockUnidades} u.</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* BLOQUE 3: KPIs FINANCIEROS Y DE INVENTARIO */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BentoCard glowColor="quirofano" delay={0.02}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1E7F7A] bg-[#1E7F7A]/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-[#DCEBE8]">
                <ArrowUpRight className="h-3.5 w-3.5 text-[#B9673A]" />
                Ingresos Acumulados
              </span>
              <p className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {formatARS(ingresos)}
              </p>
              <p className="mt-1 text-xs text-[#DCEBE8]/70">
                Centrales de esterilización, clínicas y licitaciones
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#1E7F7A] bg-[#1E7F7A]/25 text-[#DCEBE8]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DCEBE8]/12 flex items-center justify-between text-xs">
            <span className="text-[#DCEBE8]/60">Comprobantes de venta</span>
            <Link
              href="/finanzas"
              className="font-bold text-[#B9673A] hover:underline"
            >
              Ver libro de ingresos →
            </Link>
          </div>
        </BentoCard>

        <BentoCard glowColor="rose" delay={0.05}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8C3B4A] bg-[#8C3B4A]/25 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-[#DCEBE8]">
                <ArrowDownRight className="h-3.5 w-3.5" />
                Egresos por Compras
              </span>
              <p className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {formatARS(egresos)}
              </p>
              <p className="mt-1 text-xs text-[#DCEBE8]/70">
                Reposición de descartables, pouches, OE y enzimáticos
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8C3B4A] bg-[#8C3B4A]/25 text-[#F6F3EE]">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DCEBE8]/12 flex items-center justify-between text-xs">
            <span className="text-[#DCEBE8]/60">Órdenes a proveedores</span>
            <Link
              href="/finanzas"
              className="font-bold text-[#DCEBE8] hover:underline"
            >
              Asentar compra →
            </Link>
          </div>
        </BentoCard>

        <BentoCard glowColor="cobre" delay={0.08}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B9673A] bg-[#B9673A]/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                <DollarSign className="h-3.5 w-3.5 text-[#B9673A]" />
                Ganancia Neta Operativa
              </span>
              <p className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {formatARS(gananciaNeta)}
              </p>
              <p className="mt-1 text-xs text-[#DCEBE8]/70">
                Rentabilidad de caja ({margenFinanciero}% sobre facturación)
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#B9673A] bg-[#B9673A]/25 text-white">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DCEBE8]/12 flex items-center justify-between text-xs">
            <span className="text-[#DCEBE8]/60">
              Stock s/IVA: {formatARS(valorVentaInventario)}
            </span>
            <Link
              href="/reportes"
              className="font-bold text-[#B9673A] hover:underline"
            >
              Exportar planilla →
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* BLOQUE 4: PARÁMETROS, FÓRMULAS Y NOTAS DEL EXCEL INTERNO (Hoja 1 "Inicio") */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Formulario de Parámetros Globales del Excel */}
        <BentoCard glowColor="quirofano" className="lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCEBE8]/15 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E7F7A] text-white">
                <Settings2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  Parámetros de Lista de Precios (Planilla Interna)
                </h2>
                <p className="text-xs text-[#DCEBE8]/70">
                  Se aplican automáticamente a los 154 productos y listas por
                  cliente
                </p>
              </div>
            </div>
            <PuntoTestigoPill
              label={`Vigencia: ${vigencia}`}
              tone="dark"
              className="text-[11px]"
            />
          </div>

          <form onSubmit={handleSaveParametros} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/80">
                  IVA General (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={ivaPct}
                  onChange={(e) => setIvaPct(e.target.value)}
                  className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm font-bold outline-none"
                />
                <span className="text-[10px] text-[#DCEBE8]/55">
                  Supuesto: 21 %
                </span>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/80">
                  Gastos s/ costo (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={gastosPct}
                  onChange={(e) => setGastosPct(e.target.value)}
                  className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm font-bold outline-none"
                />
                <span className="text-[10px] text-[#DCEBE8]/55">
                  Flete / comisiones
                </span>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/80">
                  Redondeo ($ múltiplo)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={redondeo}
                  onChange={(e) => setRedondeo(e.target.value)}
                  className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm font-bold outline-none"
                />
                <span className="text-[10px] text-[#DCEBE8]/55">
                  Ej: $10 (0.01 sin red.)
                </span>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/80">
                  Vigencia desde
                </label>
                <input
                  type="date"
                  value={vigencia}
                  onChange={(e) => setVigencia(e.target.value)}
                  className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-xs font-bold outline-none"
                />
                <span className="text-[10px] text-[#DCEBE8]/55">
                  Se imprime en el PDF
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/80">
                  Condiciones al pie de la lista
                </label>
                <input
                  type="text"
                  value={condiciones}
                  onChange={(e) => setCondiciones(e.target.value)}
                  className="input-gasa w-full rounded-lg px-3 py-2 text-xs outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/80">
                  Contacto impreso al pie
                </label>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/80">
                Notas sobre el catálogo cargado (Uso interno)
              </label>
              <textarea
                rows={3}
                value={notasCatalogo}
                onChange={(e) => setNotasCatalogo(e.target.value)}
                className="input-gasa w-full rounded-lg px-3 py-2 text-xs leading-relaxed outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#DCEBE8]/12">
              <div className="flex items-center gap-3 text-[11px] text-[#DCEBE8]/75">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[#F6F3EE]/20 border border-[#B9673A]" />
                  Campos editables
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[#1E7F7A]/40" />
                  Cálculo automático en Lista
                </span>
              </div>

              <button
                type="submit"
                disabled={savingParams}
                className="inline-flex items-center gap-2 rounded-lg bg-[#B9673A] px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-[#B9673A]/90 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {savingParams
                  ? "Guardando parámetros..."
                  : "Guardar Parámetros"}
              </button>
            </div>
          </form>
        </BentoCard>

        {/* FÓRMULA, CÓMO SE USA Y REGLAS DEL EXCEL (Pág. 21 Manual + Hoja Inicio Excel) */}
        <BentoCard glowColor="cobre" className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCEBE8]/15 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B9673A] text-white">
                  <Calculator className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-white">
                    Fórmula y Circuito de Precios
                  </h2>
                  <p className="text-xs text-[#DCEBE8]/70">
                    Una planilla interna, una lista prolija para cada cliente
                  </p>
                </div>
              </div>
            </div>

            {/* Caja de Fórmula Oficial (Pág. 21 Manual) */}
            <div className="rounded-xl border border-[#1E7F7A]/50 bg-[#0F3A40] p-4 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B9673A] font-bold">
                FÓRMULA OFICIAL ANTAPHARMA
              </span>
              <p className="font-mono text-xs sm:text-sm font-bold text-white leading-relaxed">
                Precio sin IVA = Costo × (1 + gastos) × (1 + markup del
                cliente)
              </p>
              <p className="font-mono text-xs text-[#DCEBE8]/90">
                Precio final = Precio sin IVA × (1 + IVA)
              </p>
              <p className="text-[11px] text-[#DCEBE8]/75 pt-1 border-t border-white/10">
                El markup se aplica sobre el costo:{" "}
                <strong className="text-white">40% de markup</strong> equivale a{" "}
                <strong className="text-[#B9673A]">
                  28,6% de margen sobre el precio de venta
                </strong>
                .
              </p>
            </div>

            {/* Cómo se usa (Los 5 pasos de la Hoja Inicio del Excel) */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/75">
                <BookOpen className="h-3.5 w-3.5 text-[#B9673A]" />
                CÓMO FUNCIONA EL CIRCUITO
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  {
                    n: "1 · Productos",
                    d: "Cargar costo unitario sin IVA. Los productos sin costo no salen en la lista.",
                  },
                  {
                    n: "2 · Clientes",
                    d: "Definir markup general de cada cliente y, si hace falta, uno distinto por línea.",
                  },
                  {
                    n: "3 · Lista de precios",
                    d: "Elegir el cliente: calcula precio sin IVA (redondeado), IVA y precio final.",
                  },
                  {
                    n: "4 · Compartir PDF",
                    d: "Se exporta y envía solo el PDF de la lista. Los costos nunca salen del ERP.",
                  },
                  {
                    n: "5 · Análisis interno",
                    d: "Muestra costo final, markup aplicado, ganancia en $ y margen s/ precio.",
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="rounded-lg border border-[#DCEBE8]/12 bg-[#1D2527]/40 px-3 py-2"
                  >
                    <span className="font-bold text-[#B9673A]">{step.n}: </span>
                    <span className="text-[#DCEBE8]/85">{step.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCEBE8]/12 flex items-center justify-between text-xs">
            <Link
              href="/productos"
              className="font-bold text-[#DCEBE8] hover:text-white hover:underline"
            >
              Ir a Costos y Lista por Cliente →
            </Link>
            <Link
              href="/entidades"
              className="font-bold text-[#B9673A] hover:underline"
            >
              Configurar Markups →
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* BLOQUE 5: ALERTAS DE STOCK CRÍTICO + VALORIZACIÓN DE STOCK Y PAMI */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard
          glowColor="cobre"
          className="lg:col-span-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCEBE8]/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B9673A]/25 border border-[#B9673A] text-[#B9673A]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-white">
                      Alertas de Stock Crítico en Depósito
                    </h2>
                    <span className="rounded-full bg-[#B9673A] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                      {alertasCriticas.length} en umbral
                    </span>
                  </div>
                  <p className="text-xs text-[#DCEBE8]/70">
                    Que en el área crítica nada falte ni falle — reposición en 1
                    clic
                  </p>
                </div>
              </div>

              <Link
                href="/productos?filtro=critico"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEBE8]/20 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10"
              >
                <Boxes className="h-3.5 w-3.5 text-[#B9673A]" />
                Gestionar Stock
              </Link>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scroll">
              {alertasCriticas.length === 0 ? (
                <div className="rounded-xl border border-[#1E7F7A]/40 bg-[#1E7F7A]/15 p-6 text-center text-xs text-[#DCEBE8]">
                  Todos los 154 insumos superan el umbral de stock mínimo.
                </div>
              ) : (
                alertasCriticas.map((item) => {
                  const ratio = Math.min(
                    100,
                    Math.round(
                      (item.stockActual / Math.max(1, item.stockMinimo)) * 100
                    )
                  );
                  const faltante = Math.max(
                    10,
                    item.stockMinimo * 2 - item.stockActual
                  );

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#B9673A]/40 bg-[#1D2527]/55 p-3.5 transition-all hover:border-[#B9673A]"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-[#B9673A]/25 border border-[#B9673A]/50 px-2 py-0.5 font-mono text-[11px] font-bold text-[#F6F3EE]">
                              {item.codigo}
                            </span>
                            <span className="text-sm font-bold text-white">
                              {item.nombre}
                            </span>
                            <span className="rounded-full border border-[#DCEBE8]/15 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[#DCEBE8]/80">
                              {item.presentacion}
                            </span>
                          </div>
                          <p className="text-xs text-[#DCEBE8]/65">
                            Línea: {item.categoriaNombre} · Familia:{" "}
                            {item.familia}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-left sm:text-right">
                            <div className="font-mono text-xs font-bold text-[#B9673A]">
                              Stock: {item.stockActual} u.
                            </div>
                            <div className="font-mono text-[10px] text-[#DCEBE8]/55">
                              Mínimo: {item.stockMinimo} u.
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleQuickRestock(item.id, item.nombre, faltante)
                            }
                            disabled={restockingId === item.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E7F7A] px-3 py-2 text-xs font-bold text-white transition-all hover:bg-[#1E7F7A]/85 disabled:opacity-50"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            {restockingId === item.id
                              ? "Ingresando..."
                              : `Reponer +${faltante}`}
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#8C3B4A] to-[#B9673A]"
                          style={{ width: `${Math.max(10, ratio)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCEBE8]/12 flex flex-wrap items-center justify-between gap-2 text-xs text-[#DCEBE8]/65">
            <span>
              Monitoreo activo sobre {initialData.productos.length}{" "}
              presentaciones oficiales en 6 líneas
            </span>
            <span className="font-mono text-[11px] text-[#B9673A]">
              ANTAPHARMA · SANTIAGO DEL ESTERO
            </span>
          </div>
        </BentoCard>

        {/* Columna Derecha: Valorización de Stock + Acceso PAMI */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <BentoCard glowColor="quirofano">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#DCEBE8]">
                Valorización de Mercadería
              </span>
              <PackageCheck className="h-5 w-5 text-[#B9673A]" />
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="rounded-xl border border-[#DCEBE8]/12 bg-[#1D2527]/50 p-3.5">
                <p className="text-[11px] text-[#DCEBE8]/65">
                  Valor de Venta Lista Base (sin IVA)
                </p>
                <p className="mt-0.5 font-mono text-xl font-bold text-white">
                  {formatARS(valorVentaInventario)}
                </p>
              </div>

              <div className="rounded-xl border border-[#DCEBE8]/12 bg-[#1D2527]/50 p-3.5">
                <p className="text-[11px] text-[#DCEBE8]/65">
                  Capital Inmovilizado (Costo sin IVA)
                </p>
                <p className="mt-0.5 font-mono text-lg font-bold text-[#DCEBE8]">
                  {formatARS(valorCostoInventario)}
                </p>
              </div>

              <div className="rounded-xl border border-[#B9673A]/40 bg-[#B9673A]/15 p-3.5">
                <p className="text-[11px] text-[#F6F3EE]">
                  Ganancia Potencial en Depósito
                </p>
                <p className="mt-0.5 font-mono text-lg font-bold text-white">
                  {formatARS(valorVentaInventario - valorCostoInventario)}
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Tarjeta Acceso Directo Módulo PAMI */}
          <BentoCard glowColor="cobre">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-[#B9673A]" />
                <h3 className="font-display text-sm font-bold text-white">
                  Apartado Especial PAMI
                </h3>
              </div>
              <span className="rounded bg-[#1E7F7A] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                MÓDULO ACTIVO
              </span>
            </div>
            <p className="mt-2 text-xs text-[#DCEBE8]/80 leading-relaxed">
              Espacio dedicado para gestión de convenios, licitaciones, órdenes
              de prestación e insumos asignados a PAMI.
            </p>
            <Link
              href="/pami"
              className="mt-3.5 flex w-full items-center justify-between rounded-lg bg-[#B9673A] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#B9673A]/90"
            >
              <span>Abrir Sección PAMI</span>
              <span>→</span>
            </Link>
          </BentoCard>
        </div>
      </div>

      {/* BLOQUE 6: ÚLTIMOS MOVIMIENTOS DE STOCK Y AUDITORÍA */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <BentoCard className="lg:col-span-7">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#DCEBE8]/15">
            <div className="flex items-center gap-2.5">
              <History className="h-4 w-4 text-[#B9673A]" />
              <h3 className="font-display text-sm font-bold text-white">
                Trazabilidad Reciente de Stock
              </h3>
            </div>
            <Link
              href="/reportes"
              className="text-xs font-bold text-[#B9673A] hover:underline"
            >
              Ver kardex completo →
            </Link>
          </div>

          <div className="mt-3 divide-y divide-[#DCEBE8]/10">
            {initialData.movimientos.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                        m.tipo === "ENTRADA"
                          ? "bg-[#1E7F7A]/30 text-[#DCEBE8] border border-[#1E7F7A]"
                          : "bg-[#B9673A]/30 text-white border border-[#B9673A]"
                      }`}
                    >
                      {m.tipo}
                    </span>
                    <span className="font-semibold text-white truncate">
                      {m.producto?.codigo ? `${m.producto.codigo} · ` : ""}
                      {m.producto?.nombre || "Insumo de esterilización"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[#DCEBE8]/65 truncate">
                    {m.motivo}
                    {m.entidad ? ` • ${m.entidad.nombre}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-white">
                    {m.tipo === "ENTRADA" ? "+" : "-"}
                    {m.cantidad} u.
                  </p>
                  <p className="font-mono text-[10px] text-[#DCEBE8]/55">
                    {formatDateTimeAR(m.fecha)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard className="lg:col-span-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#DCEBE8]/15">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-[#1E7F7A]" />
              <h3 className="font-display text-sm font-bold text-white">
                Bitácora de Auditoría
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[#DCEBE8]/60">
              TIEMPO REAL
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {initialData.logs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-[#DCEBE8]/12 bg-[#1D2527]/45 p-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#B9673A]">
                    {log.accion}
                  </span>
                  <span className="font-mono text-[10px] text-[#DCEBE8]/50">
                    {formatDateTimeAR(log.fecha)}
                  </span>
                </div>
                <p className="mt-1 text-[#DCEBE8]/85 text-[11px] leading-relaxed">
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
