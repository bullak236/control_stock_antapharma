"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
import {
  registrarTransaccionFinancieraAction,
  deleteTransaccionFinancieraAction,
  type ErpSnapshot,
} from "@/app/actions/erp-actions";
import type { TipoTransaccion } from "@/lib/supabase";
import { formatARS, formatDateTimeAR } from "@/lib/utils";

export function FinanzasClient({ initialData }: { initialData: ErpSnapshot }) {
  const router = useRouter();

  const [tipoFiltro, setTipoFiltro] = useState<"ALL" | "INGRESO" | "EGRESO">(
    "ALL"
  );
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [tipo, setTipo] = useState<TipoTransaccion>("INGRESO");
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [comprobante, setComprobante] = useState("");
  const [entidadId, setEntidadId] = useState("");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );

  const criticalCount = initialData.productos.filter(
    (p) => p.stockActual <= p.stockMinimo
  ).length;

  const totalIngresos = initialData.transacciones
    .filter((t) => t.tipo === "INGRESO")
    .reduce((acc, t) => acc + Number(t.monto || 0), 0);

  const totalEgresos = initialData.transacciones
    .filter((t) => t.tipo === "EGRESO")
    .reduce((acc, t) => acc + Number(t.monto || 0), 0);

  const balanceNeto = totalIngresos - totalEgresos;

  const filteredTx = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialData.transacciones.filter((t) => {
      const matchTipo = tipoFiltro === "ALL" || t.tipo === tipoFiltro;
      const matchSearch =
        !q ||
        t.concepto.toLowerCase().includes(q) ||
        (t.comprobante || "").toLowerCase().includes(q) ||
        (t.entidad?.nombre || "").toLowerCase().includes(q);
      return matchTipo && matchSearch;
    });
  }, [initialData.transacciones, tipoFiltro, search]);

  async function handleSaveTx(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = await registrarTransaccionFinancieraAction({
      tipo,
      monto: Number(monto),
      concepto,
      comprobante,
      entidadId: entidadId || null,
    });

    setLoading(false);
    if (!res.ok) {
      setBanner({ type: "err", msg: res.error || "Error al asentar operación." });
      return;
    }

    setModalOpen(false);
    setMonto("");
    setConcepto("");
    setComprobante("");
    setEntidadId("");
    setBanner({
      type: "ok",
      msg: `Asiento de ${tipo} registrado correctamente en el libro de caja.`,
    });
    router.refresh();
  }

  async function handleDeleteTx(id: string, conceptoStr: string) {
    if (!confirm(`¿Anular asiento financiero "${conceptoStr}"?`)) return;
    setLoading(true);
    const res = await deleteTransaccionFinancieraAction(id);
    setLoading(false);
    if (res.ok) {
      setBanner({ type: "ok", msg: "Asiento eliminado del libro de caja." });
      router.refresh();
    } else {
      setBanner({ type: "err", msg: res.error || "No se pudo eliminar." });
    }
  }

  return (
    <ErpShell
      title="Flujo Financiero & Tesorería"
      subtitle="Asientos de ingresos por licitaciones/ventas y egresos por compras de insumos médicos"
      criticalCount={criticalCount}
    >
      {banner && (
        <div
          className={`mb-5 flex items-center justify-between rounded-2xl border px-4 py-3 text-xs ${
            banner.type === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/10 text-rose-200"
          }`}
        >
          <span className="flex items-center gap-2 font-medium">
            {banner.type === "ok" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            )}
            {banner.msg}
          </span>
          <button onClick={() => setBanner(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tarjetas de Caja */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-6">
        <BentoCard glowColor="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">
              Total Ingresos por Ventas
            </span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-white">
            {formatARS(totalIngresos)}
          </p>
          <p className="mt-1 text-xs text-white/50">
            Cobros acreditados de hospitales y clínicas
          </p>
        </BentoCard>

        <BentoCard glowColor="rose">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">
              Total Egresos por Mercadería
            </span>
            <TrendingDown className="h-5 w-5 text-rose-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-white">
            {formatARS(totalEgresos)}
          </p>
          <p className="mt-1 text-xs text-white/50">
            Pagos a laboratorios e importadores
          </p>
        </BentoCard>

        <BentoCard glowColor="cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300">
              Disponibilidad Neta de Caja
            </span>
            <Wallet className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-white">
            {formatARS(balanceNeto)}
          </p>
          <p className="mt-1 text-xs text-white/50">
            Superávit líquido del período activo
          </p>
        </BentoCard>
      </div>

      {/* Barra de Filtro y Botones de Asiento */}
      <BentoCard className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "INGRESO", "EGRESO"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTipoFiltro(tf)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  tipoFiltro === tf
                    ? "bg-white text-slate-950"
                    : "border border-white/10 bg-white/[0.03] text-white/65 hover:text-white"
                }`}
              >
                {tf === "ALL"
                  ? "Todos los Movimientos"
                  : tf === "INGRESO"
                  ? "Ingresos (Ventas)"
                  : "Egresos (Compras)"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar factura, hospital, concepto..."
                className="rounded-xl border border-white/12 bg-white/[0.04] pl-9 pr-3.5 py-2 text-xs text-white placeholder-white/35 outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setTipo("INGRESO");
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
            >
              <Plus className="h-4 w-4" />
              Asentar Venta
            </button>

            <button
              type="button"
              onClick={() => {
                setTipo("EGRESO");
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3.5 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25"
            >
              <Plus className="h-4 w-4" />
              Asentar Compra
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Tabla Libro Diario de Caja */}
      <BentoCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-semibold uppercase tracking-wider text-white/55">
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Comprobante</th>
                <th className="py-3.5 px-4">Concepto / Detalle</th>
                <th className="py-3.5 px-4">Entidad Comercial</th>
                <th className="py-3.5 px-4 text-right">Monto (ARS)</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 text-xs sm:text-sm">
              {filteredTx.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition-colors hover:bg-white/[0.025]"
                >
                  <td className="py-3.5 px-4 text-xs text-white/60 whitespace-nowrap">
                    {formatDateTimeAR(tx.fecha)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        tx.tipo === "INGRESO"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/35"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/35"
                      }`}
                    >
                      {tx.tipo === "INGRESO" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {tx.tipo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-cyan-300">
                    {tx.comprobante || "S/C"}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white">
                    {tx.concepto}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-white/70">
                    {tx.entidad?.nombre || "Operación directa"}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono text-sm font-bold whitespace-nowrap ${
                      tx.tipo === "INGRESO"
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {tx.tipo === "INGRESO" ? "+" : "-"}
                    {formatARS(tx.monto)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteTx(tx.id, tx.concepto)}
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/50 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-200"
                      title="Anular asiento"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BentoCard>

      {/* Modal Nuevo Asiento Financiero */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-lg rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl animate-dialog-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Registrar Asiento en Flujo de Caja
                </h2>
                <p className="text-xs text-white/50">
                  Impacta inmediatamente en los indicadores del Dashboard
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["INGRESO", "EGRESO"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                      tipo === t
                        ? t === "INGRESO"
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                          : "border-rose-400 bg-rose-500/20 text-rose-200"
                        : "border-white/10 bg-white/5 text-white/55"
                    }`}
                  >
                    {t === "INGRESO"
                      ? "+ INGRESO POR VENTA"
                      : "- EGRESO POR COMPRA"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Monto Total (ARS $)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="Ej. 485000"
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    N° Factura / Orden de Pago
                  </label>
                  <input
                    type="text"
                    value={comprobante}
                    onChange={(e) => setComprobante(e.target.value)}
                    placeholder="FA-0004-00012915"
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Cliente o Proveedor Vinculado
                </label>
                <select
                  value={entidadId}
                  onChange={(e) => setEntidadId(e.target.value)}
                  className="w-full rounded-xl border border-white/12 bg-[#0d1017] px-3.5 py-2.5 text-sm text-white outline-none"
                >
                  <option value="">— Seleccionar entidad comercial —</option>
                  {initialData.entidades.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{e.tipo}] {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Concepto / Detalle de Mercadería
                </label>
                <input
                  type="text"
                  required
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  placeholder="Ej. Provisión Pouches ETO y Detergente Trienzimático"
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/12 px-4 py-2.5 text-xs text-white/70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-950"
                >
                  {loading ? "Registrando..." : "Confirmar Asiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpShell>
  );
}
