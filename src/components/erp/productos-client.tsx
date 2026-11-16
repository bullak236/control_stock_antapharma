"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ArrowUpDown,
  Percent,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
  FolderPlus,
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
import {
  upsertProductoAction,
  deleteProductoAction,
  ajustarPrecioMasivoAction,
  registrarMovimientoStockAction,
  crearCategoriaAction,
  type ErpSnapshot,
} from "@/app/actions/erp-actions";
import type { ProductoDTO, TipoMovimiento } from "@/lib/supabase";
import { formatARS } from "@/lib/utils";

const ITEMS_PER_PAGE = 6;

export function ProductosClient({ initialData }: { initialData: ErpSnapshot }) {
  const router = useRouter();

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "CRITICO" | "OK">("ALL");
  const [page, setPage] = useState(1);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<ProductoDTO | null>(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [movModalProd, setMovModalProd] = useState<ProductoDTO | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);

  // Form states for Create/Edit Product
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [medida, setMedida] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [stockActual, setStockActual] = useState("0");
  const [stockMinimo, setStockMinimo] = useState("10");
  const [precioCosto, setPrecioCosto] = useState("0");
  const [precioVenta, setPrecioVenta] = useState("0");
  const [categoriaId, setCategoriaId] = useState(
    initialData.categorias[0]?.id || ""
  );

  // Bulk Price Adjust states
  const [porcentajeAjuste, setPorcentajeAjuste] = useState("15");
  const [catAjuste, setCatAjuste] = useState("ALL");

  // Stock Movement states
  const [tipoMov, setTipoMov] = useState<TipoMovimiento>("ENTRADA");
  const [cantidadMov, setCantidadMov] = useState("10");
  const [motivoMov, setMotivoMov] = useState("");
  const [entidadMov, setEntidadMov] = useState("");

  // New Category states
  const [nuevaCatNombre, setNuevaCatNombre] = useState("");
  const [nuevaCatDesc, setNuevaCatDesc] = useState("");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );

  const criticalCount = useMemo(
    () =>
      initialData.productos.filter((p) => p.stockActual <= p.stockMinimo).length,
    [initialData.productos]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialData.productos.filter((p) => {
      const matchesSearch =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.medida.toLowerCase().includes(q) ||
        p.presentacion.toLowerCase().includes(q);

      const matchesCat = catFilter === "ALL" || p.categoriaId === catFilter;
      const isCrit = p.stockActual <= p.stockMinimo;
      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "CRITICO" && isCrit) ||
        (stockFilter === "OK" && !isCrit);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [initialData.productos, search, catFilter, stockFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function openNewProductModal() {
    setEditingProd(null);
    setCodigo(`ANT-INS-${String(initialData.productos.length + 1).padStart(3, "0")}`);
    setNombre("");
    setMedida("");
    setPresentacion("");
    setStockActual("20");
    setStockMinimo("10");
    setPrecioCosto("15000");
    setPrecioVenta("24500");
    setCategoriaId(initialData.categorias[0]?.id || "");
    setModalOpen(true);
  }

  function openEditProductModal(p: ProductoDTO) {
    setEditingProd(p);
    setCodigo(p.codigo);
    setNombre(p.nombre);
    setMedida(p.medida);
    setPresentacion(p.presentacion);
    setStockActual(String(p.stockActual));
    setStockMinimo(String(p.stockMinimo));
    setPrecioCosto(String(p.precioCosto));
    setPrecioVenta(String(p.precioVenta));
    setCategoriaId(p.categoriaId);
    setModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = await upsertProductoAction({
      id: editingProd?.id,
      codigo,
      nombre,
      medida,
      presentacion,
      stockActual: Number(stockActual),
      stockMinimo: Number(stockMinimo),
      precioCosto: Number(precioCosto),
      precioVenta: Number(precioVenta),
      categoriaId,
    });

    setLoading(false);
    if (!res.ok) {
      setBanner({ type: "err", msg: res.error || "Error al guardar." });
      return;
    }

    setModalOpen(false);
    setBanner({
      type: "ok",
      msg: editingProd
        ? `Insumo ${codigo} actualizado correctamente.`
        : `Insumo ${codigo} registrado en catálogo.`,
    });
    router.refresh();
  }

  async function handleDeleteProduct(p: ProductoDTO) {
    if (!confirm(`¿Confirmar baja del insumo "${p.nombre}" (${p.codigo})?`)) return;
    setLoading(true);
    const res = await deleteProductoAction(p.id);
    setLoading(false);
    if (res.ok) {
      setBanner({ type: "ok", msg: `Insumo ${p.codigo} eliminado.` });
      router.refresh();
    } else {
      setBanner({ type: "err", msg: res.error || "No se pudo eliminar." });
    }
  }

  async function handleBulkPriceAdjust(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await ajustarPrecioMasivoAction({
      porcentaje: Number(porcentajeAjuste),
      categoriaId: catAjuste,
    });
    setLoading(false);
    if (res.ok) {
      setPriceModalOpen(false);
      setBanner({
        type: "ok",
        msg: `Precios actualizados en ${res.actualizados} insumos (${Number(porcentajeAjuste) > 0 ? "+" : ""}${porcentajeAjuste}%).`,
      });
      router.refresh();
    } else {
      setBanner({ type: "err", msg: res.error || "Error al ajustar precios." });
    }
  }

  async function handleSaveMovimiento(e: React.FormEvent) {
    e.preventDefault();
    if (!movModalProd) return;
    setLoading(true);
    const res = await registrarMovimientoStockAction({
      productoId: movModalProd.id,
      tipo: tipoMov,
      cantidad: Number(cantidadMov),
      motivo: motivoMov,
      entidadId: entidadMov || null,
    });
    setLoading(false);
    if (res.ok) {
      setMovModalProd(null);
      setMotivoMov("");
      setBanner({
        type: "ok",
        msg: `Movimiento de ${tipoMov} registrado sobre ${movModalProd.codigo}.`,
      });
      router.refresh();
    } else {
      setBanner({ type: "err", msg: res.error || "Error en movimiento." });
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await crearCategoriaAction({
      nombre: nuevaCatNombre,
      descripcion: nuevaCatDesc,
    });
    setLoading(false);
    if (res.ok) {
      setCatModalOpen(false);
      setNuevaCatNombre("");
      setNuevaCatDesc("");
      setBanner({ type: "ok", msg: "Categoría creada exitosamente." });
      router.refresh();
    } else {
      setBanner({ type: "err", msg: res.error || "Error al crear categoría." });
    }
  }

  return (
    <ErpShell
      title="Gestión de Inventario & Precios"
      subtitle="Catálogo técnico de esterilización médica, control de stock mínimo y listas de precios"
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
          <button onClick={() => setBanner(null)} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Barra Superior de Filtros y Acciones */}
      <BentoCard className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por código, pouch, indicador, medida..."
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={catFilter}
                onChange={(e) => {
                  setCatFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-white/12 bg-[#0d1017] px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400/50"
              >
                <option value="ALL">Todas las categorías</option>
                {initialData.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <div className="inline-flex rounded-xl border border-white/12 bg-white/[0.03] p-1">
                {(["ALL", "CRITICO", "OK"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStockFilter(st);
                      setPage(1);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      stockFilter === st
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    {st === "ALL"
                      ? "Todos"
                      : st === "CRITICO"
                      ? `Críticos (${criticalCount})`
                      : "Óptimos"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCatModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-white/85 hover:bg-white/10"
            >
              <FolderPlus className="h-4 w-4 text-cyan-300" />
              Categoría
            </button>

            <button
              type="button"
              onClick={() => setPriceModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/35 bg-amber-500/12 px-3.5 py-2.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
            >
              <Percent className="h-4 w-4 text-amber-300" />
              Ajustar Precios (%)
            </button>

            <button
              type="button"
              onClick={openNewProductModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:bg-cyan-50"
            >
              <Plus className="h-4 w-4" />
              Nuevo Insumo
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Tabla Responsiva de Productos */}
      <BentoCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-semibold uppercase tracking-wider text-white/55">
                <th className="py-3.5 px-4">Código / Insumo</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Medida & Presentación</th>
                <th className="py-3.5 px-4 text-center">Stock Actual</th>
                <th className="py-3.5 px-4 text-right">Precio Costo</th>
                <th className="py-3.5 px-4 text-right">Precio Venta</th>
                <th className="py-3.5 px-4 text-right">Margen</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 text-xs sm:text-sm">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/45">
                    No se encontraron insumos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const isCrit = p.stockActual <= p.stockMinimo;
                  const margen =
                    p.precioCosto > 0
                      ? Math.round(
                          ((p.precioVenta - p.precioCosto) / p.precioCosto) * 100
                        )
                      : 0;

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-white/[0.025]"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 font-mono text-[11px] font-bold text-cyan-300">
                            {p.codigo}
                          </span>
                          {isCrit && (
                            <span
                              title="Stock Crítico"
                              className="inline-flex items-center rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300"
                            >
                              CRÍTICO
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-semibold text-white">
                          {p.nombre}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-white/70">
                        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1">
                          {p.categoria?.nombre || "General"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-white/75">
                        <p className="font-medium text-white">{p.medida}</p>
                        <p className="text-white/45">{p.presentacion}</p>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`rounded-xl px-3 py-1 text-xs font-bold ${
                              isCrit
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {p.stockActual} u.
                          </span>
                          <span className="mt-0.5 text-[10px] text-white/40">
                            Mín: {p.stockMinimo}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-white/70">
                        {formatARS(p.precioCosto)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-white">
                        {formatARS(p.precioVenta)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="rounded-md bg-white/8 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                          +{margen}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setMovModalProd(p);
                              setTipoMov("ENTRADA");
                              setCantidadMov("10");
                              setMotivoMov("");
                            }}
                            title="Registrar Entrada / Salida de Stock"
                            className="rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25"
                          >
                            <ArrowUpDown className="h-3.5 w-3.5 inline mr-1" />
                            Stock
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditProductModal(p)}
                            title="Editar Producto / Precio"
                            className="rounded-lg border border-white/12 bg-white/5 p-1.5 text-white/75 hover:bg-white/12 hover:text-white"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            title="Eliminar Producto"
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-rose-300/75 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] px-5 py-3.5 text-xs text-white/60">
          <span>
            Mostrando{" "}
            <strong className="text-white">{paginated.length}</strong> de{" "}
            <strong className="text-white">{filteredProducts.length}</strong>{" "}
            insumos médicos
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
            <span className="px-2 font-semibold text-white">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-white disabled:opacity-40"
            >
              Siguiente
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </BentoCard>

      {/* MODAL 1: Crear / Editar Producto y Precios */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-xl rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl animate-dialog-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingProd
                    ? `Editar Insumo ${editingProd.codigo}`
                    : "Registrar Nuevo Insumo de Esterilización"}
                </h2>
                <p className="text-xs text-white/50">
                  Ficha técnica, umbrales de stock y estructura de costos
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="ANT-POU-011"
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Categoría
                  </label>
                  <select
                    required
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-[#0d1017] px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    {initialData.categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Nombre Técnico del Insumo
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Pouch con testigo para óxido de etileno"
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Medida / Calibre
                  </label>
                  <input
                    type="text"
                    required
                    value={medida}
                    onChange={(e) => setMedida(e.target.value)}
                    placeholder="Ej. 15 cm x 200 m / 5 Litros"
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Presentación Comercial
                  </label>
                  <input
                    type="text"
                    required
                    value={presentacion}
                    onChange={(e) => setPresentacion(e.target.value)}
                    placeholder="Ej. Rollo x 200 m / Caja x 24 u."
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockActual}
                    onChange={(e) => setStockActual(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Precio Costo ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={precioCosto}
                    onChange={(e) => setPrecioCosto(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Precio Venta ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/75 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-50 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar Insumo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ajuste Masivo de Precios */}
      {priceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-md rounded-3xl border border-white/15 p-6 shadow-2xl animate-dialog-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-5 w-5 text-amber-300" />
                <h2 className="text-base font-bold text-white">
                  Actualización Masiva de Listas
                </h2>
              </div>
              <button
                onClick={() => setPriceModalOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkPriceAdjust} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Categoría Objetivo
                </label>
                <select
                  value={catAjuste}
                  onChange={(e) => setCatAjuste(e.target.value)}
                  className="w-full rounded-xl border border-white/12 bg-[#0d1017] px-3.5 py-2.5 text-sm text-white outline-none"
                >
                  <option value="ALL">Todo el catálogo de insumos</option>
                  {initialData.categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Variación Porcentual (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={porcentajeAjuste}
                  onChange={(e) => setPorcentajeAjuste(e.target.value)}
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                />
                <p className="mt-1 text-[11px] text-white/45">
                  Actualiza simultáneamente Precio de Costo y Precio de Venta.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(false)}
                  className="rounded-xl border border-white/12 px-4 py-2 text-xs text-white/70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300"
                >
                  {loading ? "Aplicando..." : "Aplicar Ajuste"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Registrar Movimiento de Stock (Entrada / Salida) */}
      {movModalProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-md rounded-3xl border border-white/15 p-6 shadow-2xl animate-dialog-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Movimiento de Stock ({movModalProd.codigo})
                </h2>
                <p className="text-xs text-white/55 truncate">
                  {movModalProd.nombre} • Actual: {movModalProd.stockActual} u.
                </p>
              </div>
              <button
                onClick={() => setMovModalProd(null)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovimiento} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {(["ENTRADA", "SALIDA"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipoMov(t)}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                      tipoMov === t
                        ? t === "ENTRADA"
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                          : "border-amber-400 bg-amber-500/20 text-amber-200"
                        : "border-white/10 bg-white/5 text-white/55"
                    }`}
                  >
                    {t === "ENTRADA"
                      ? "+ ENTRADA (Compra/Ingreso)"
                      : "- SALIDA (Entrega/Venta)"}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Cantidad de Unidades
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadMov}
                  onChange={(e) => setCantidadMov(e.target.value)}
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Cliente / Proveedor Asociado (Opcional)
                </label>
                <select
                  value={entidadMov}
                  onChange={(e) => setEntidadMov(e.target.value)}
                  className="w-full rounded-xl border border-white/12 bg-[#0d1017] px-3.5 py-2.5 text-sm text-white outline-none"
                >
                  <option value="">— Sin entidad vinculada —</option>
                  {initialData.entidades.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{e.tipo}] {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Motivo / Remito / Lote
                </label>
                <input
                  type="text"
                  required
                  value={motivoMov}
                  onChange={(e) => setMotivoMov(e.target.value)}
                  placeholder="Ej. Remito #0004-1290 Hospital Regional"
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setMovModalProd(null)}
                  className="rounded-xl border border-white/12 px-4 py-2 text-xs text-white/70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-slate-950"
                >
                  {loading ? "Registrando..." : "Confirmar Movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Nueva Categoría */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-md rounded-3xl border border-white/15 p-6 shadow-2xl animate-dialog-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white">
                Nueva Categoría de Insumos
              </h2>
              <button
                onClick={() => setCatModalOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Nombre de Categoría
                </label>
                <input
                  type="text"
                  required
                  value={nuevaCatNombre}
                  onChange={(e) => setNuevaCatNombre(e.target.value)}
                  placeholder="Ej. Selladoras Rotativas y Accesorios"
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Descripción Técnica
                </label>
                <input
                  type="text"
                  value={nuevaCatDesc}
                  onChange={(e) => setNuevaCatDesc(e.target.value)}
                  placeholder="Opcional..."
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="rounded-xl border border-white/12 px-4 py-2 text-xs text-white/70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-slate-950"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpShell>
  );
}
