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
  const [banner, setBanner] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

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
      setBanner({
        type: "err",
        msg: res.error || "Error al asentar operación.",
      });
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
      subtitle="Asientos de ingresos por ventas/licitaciones y egresos por compras de insumos"
      criticalCount={criticalCount}
    >
      {banner && (
        <div
          className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-xs ${
            banner.type === "ok"
              ? "border-[#1E7F7A] bg-[#1E7F7A]/20 text-white"
              : "border-[#8C3B4A] bg-[#8C3B4A]/25 text-white"
          }`}
        >
          <span className="flex items-center gap-2 font-semibold">
            {banner.type === "ok" ? (
              <CheckCircle2 className="h-4 w-4 text-[#B9673A]" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-[#B9673A]" />
            )}
            {banner.msg}
          </span>
          <button onClick={() => setBanner(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tarjetas de Caja */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <BentoCard glowColor="quirofano">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-[#DCEBE8]">
              Total Ingresos por Ventas
            </span>
            <TrendingUp className="h-5 w-5 text-[#1E7F7A]" />
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white">
            {formatARS(totalIngresos)}
          </p>
          <p className="mt-1 text-xs text-[#DCEBE8]/70">
            Cobros acreditados de hospitales, sanatorios y clínicas
          </p>
        </BentoCard>

        <BentoCard glowColor="rose">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-[#DCEBE8]">
              Total Egresos por Mercadería
            </span>
            <TrendingDown className="h-5 w-5 text-[#8C3B4A]" />
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white">
            {formatARS(totalEgresos)}
          </p>
          <p className="mt-1 text-xs text-[#DCEBE8]/70">
            Pagos a fabricantes, distribuidores y fletes
          </p>
        </BentoCard>

        <BentoCard glowColor="cobre">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-[#B9673A]">
              Disponibilidad Neta de Caja
            </span>
            <Wallet className="h-5 w-5 text-[#B9673A]" />
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white">
            {formatARS(balanceNeto)}
          </p>
          <p className="mt-1 text-xs text-[#DCEBE8]/70">
            Resultado neto operativo del período activo
          </p>
        </BentoCard>
      </div>

      {/* Barra de Filtro y Botones de Asiento */}
      <BentoCard className="mb-6">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "INGRESO", "EGRESO"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTipoFiltro(tf)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                  tipoFiltro === tf
                    ? "bg-[#B9673A] text-white shadow"
                    : "border border-[#DCEBE8]/15 bg-[#1D2527]/50 text-[#DCEBE8]/75 hover:text-white"
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DCEBE8]/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar factura, remito, cliente..."
                className="input-gasa w-full rounded-lg pl-9 pr-3.5 py-2 text-xs outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setTipo("INGRESO");
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E7F7A] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1E7F7A]/90"
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#8C3B4A] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#8C3B4A]/90"
            >
              <Plus className="h-4 w-4" />
              Asentar Compra
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Tabla Libro Diario de Caja (Desktop) + Tarjetas (Móvil) */}
      <BentoCard className="p-0 overflow-hidden">
        <div className="hidden md:block overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DCEBE8]/15 bg-[#1D2527]/50 font-mono text-[10px] font-bold uppercase tracking-wider text-[#DCEBE8]/75">
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Comprobante</th>
                <th className="py-3.5 px-4">Concepto / Detalle</th>
                <th className="py-3.5 px-4">Entidad Comercial</th>
                <th className="py-3.5 px-4 text-right">Monto (ARS)</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCEBE8]/12 text-xs">
              {filteredTx.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#DCEBE8]/70 whitespace-nowrap">
                    {formatDateTimeAR(tx.fecha)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                        tx.tipo === "INGRESO"
                          ? "bg-[#1E7F7A]/30 text-[#DCEBE8] border border-[#1E7F7A]"
                          : "bg-[#8C3B4A]/35 text-white border border-[#8C3B4A]"
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
                  <td className="py-3.5 px-4 font-mono text-xs text-[#B9673A]">
                    {tx.comprobante || "S/C"}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {tx.concepto}
                  </td>
                  <td className="py-3.5 px-4 text-[#DCEBE8]/80">
                    {tx.entidad?.nombre || "Operación directa"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-white whitespace-nowrap">
                    {tx.tipo === "INGRESO" ? "+" : "-"}
                    {formatARS(tx.monto)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteTx(tx.id, tx.concepto)}
                      className="rounded-lg border border-[#DCEBE8]/15 bg-white/5 p-1.5 text-[#DCEBE8]/70 hover:border-[#8C3B4A] hover:bg-[#8C3B4A]/30 hover:text-white"
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

        {/* Vista Móvil */}
        <div className="md:hidden divide-y divide-[#DCEBE8]/15">
          {filteredTx.map((tx) => (
            <div key={tx.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                    tx.tipo === "INGRESO"
                      ? "bg-[#1E7F7A] text-white"
                      : "bg-[#8C3B4A] text-white"
                  }`}
                >
                  {tx.tipo} · {tx.comprobante || "S/C"}
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {tx.tipo === "INGRESO" ? "+" : "-"}
                  {formatARS(tx.monto)}
                </span>
              </div>
              <p className="text-xs font-bold text-white">{tx.concepto}</p>
              <div className="flex items-center justify-between text-[11px] text-[#DCEBE8]/70">
                <span>{tx.entidad?.nombre || "Operación directa"}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{formatDateTimeAR(tx.fecha)}</span>
                  <button
                    onClick={() => handleDeleteTx(tx.id, tx.concepto)}
                    className="text-[#B9673A]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* Modal Nuevo Asiento Financiero */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-lg rounded-2xl border border-[#DCEBE8]/20 p-6 shadow-2xl animate-dialog-in">
            <div className="flex items-center justify-between border-b border-[#DCEBE8]/15 pb-3.5">
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  Registrar Asiento en Flujo de Caja
                </h2>
                <p className="text-xs text-[#DCEBE8]/70">
                  Impacta inmediatamente en los indicadores del Inicio
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#DCEBE8]/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["INGRESO", "EGRESO"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`rounded-lg border py-2.5 text-xs font-bold transition-all ${
                      tipo === t
                        ? t === "INGRESO"
                          ? "border-[#1E7F7A] bg-[#1E7F7A] text-white"
                          : "border-[#8C3B4A] bg-[#8C3B4A] text-white"
                        : "border-[#DCEBE8]/15 bg-[#1D2527]/50 text-[#DCEBE8]/70"
                    }`}
                  >
                    {t === "INGRESO"
                      ? "+ INGRESO POR VENTA"
                      : "- EGRESO POR COMPRA"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
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
                    className="input-gasa w-full rounded-lg px-3.5 py-2.5 font-mono text-sm font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    N° Remito / Factura
                  </label>
                  <input
                    type="text"
                    value={comprobante}
                    onChange={(e) => setComprobante(e.target.value)}
                    placeholder="0001-00000125"
                    className="input-gasa w-full rounded-lg px-3.5 py-2.5 font-mono text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                  Cliente o Proveedor Vinculado
                </label>
                <select
                  value={entidadId}
                  onChange={(e) => setEntidadId(e.target.value)}
                  className="w-full rounded-lg border border-[#DCEBE8]/25 bg-[#1D2527] px-3.5 py-2.5 text-sm text-white outline-none"
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
                <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                  Concepto / Detalle de Mercadería
                </label>
                <input
                  type="text"
                  required
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  placeholder="Ej. Provisión PT-150 × 6 y GN-M × 10"
                  className="input-gasa w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DCEBE8]/15">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-[#DCEBE8]/20 px-4 py-2 text-xs text-[#DCEBE8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#B9673A] px-5 py-2 text-xs font-bold text-white"
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
