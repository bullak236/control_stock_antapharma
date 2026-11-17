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
  FileText,
  MessageCircle,
  Mail,
  Calculator,
  Package,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
import {
  BrandFamilyIcon,
  getLineColorHex,
  PuntoTestigoPill,
} from "@/components/brand/antapharma-brand";
import {
  BRAND_CONTACT,
  LINEAS_OFICIALES,
} from "@/lib/catalogo-2027-data";
import {
  calcularPrecioProductoCliente,
  resolverNumeroLinea,
} from "@/lib/pricing";
import {
  buildMailtoCatalogUrl,
  buildWhatsAppCatalogUrl,
  generarListaPreciosClientePDF,
} from "@/lib/document-generators";
import {
  upsertProductoAction,
  deleteProductoAction,
  ajustarPrecioMasivoAction,
  registrarMovimientoStockAction,
  sincronizarCatalogo2027Action,
  type ErpSnapshot,
} from "@/app/actions/erp-actions";
import type { ProductoDTO, TipoMovimiento } from "@/lib/supabase";
import { formatARS } from "@/lib/utils";

const ITEMS_PER_PAGE = 15;

export function ProductosClient({ initialData }: { initialData: ErpSnapshot }) {
  const router = useRouter();

  // Pestañas del circuito Excel: 1. Inventario y Costos | 2. Lista de Precios por Cliente | 3. Análisis Interno
  const [activeTab, setActiveTab] = useState<
    "INVENTARIO" | "LISTA_CLIENTE" | "ANALISIS_INTERNO"
  >("INVENTARIO");

  // Cliente elegido para Lista de precios y Análisis interno (Celda C4 del Excel)
  const clientes = useMemo(
    () => initialData.entidades.filter((e) => e.tipo === "CLIENTE"),
    [initialData.entidades]
  );
  const [clienteIdSeleccionado, setClienteIdSeleccionado] = useState<string>(
    clientes[0]?.id || ""
  );
  const clienteElegido = useMemo(
    () => clientes.find((c) => c.id === clienteIdSeleccionado) || clientes[0] || null,
    [clientes, clienteIdSeleccionado]
  );

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "CRITICO" | "OK">(
    "ALL"
  );
  const [page, setPage] = useState(1);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<ProductoDTO | null>(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [movModalProd, setMovModalProd] = useState<ProductoDTO | null>(null);

  // Form states for Create/Edit Product (including Excel columns)
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [familia, setFamilia] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [stockActual, setStockActual] = useState("0");
  const [stockMinimo, setStockMinimo] = useState("10");
  const [precioCosto, setPrecioCosto] = useState("0");
  const [gastosOpc, setGastosOpc] = useState("");
  const [ivaOpc, setIvaOpc] = useState("");
  const [incluirEnLista, setIncluirEnLista] = useState(true);
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [fechaCosto, setFechaCosto] = useState(
    initialData.parametros.vigenciaDesde || "2026-11-10"
  );
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

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

  const criticalCount = useMemo(
    () =>
      initialData.productos.filter((p) => p.stockActual <= p.stockMinimo)
        .length,
    [initialData.productos]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialData.productos.filter((p) => {
      const fam = (p.familia || p.medida || "").toLowerCase();
      const matchesSearch =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        fam.includes(q) ||
        p.presentacion.toLowerCase().includes(q) ||
        (p.proveedorNombre || "").toLowerCase().includes(q);

      const matchesCat = catFilter === "ALL" || p.categoriaId === catFilter;
      const isCrit = p.stockActual <= p.stockMinimo;
      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "CRITICO" && isCrit) ||
        (stockFilter === "OK" && !isCrit);

      if (activeTab === "LISTA_CLIENTE" && (!p.incluirEnLista || p.precioCosto <= 0)) {
        return false;
      }

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [initialData.productos, search, catFilter, stockFilter, activeTab]);

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
    setCodigo("");
    setNombre("");
    setFamilia("Descartables");
    setPresentacion("Caja × 100 u");
    setStockActual("20");
    setStockMinimo("10");
    setPrecioCosto("10000");
    setGastosOpc("");
    setIvaOpc("");
    setIncluirEnLista(true);
    setProveedorNombre("");
    setFechaCosto(new Date().toISOString().slice(0, 10));
    setCategoriaId(initialData.categorias[0]?.id || "");
    setModalOpen(true);
  }

  function openEditProductModal(p: ProductoDTO) {
    setEditingProd(p);
    setCodigo(p.codigo);
    setNombre(p.nombre);
    setFamilia(p.familia || p.medida || "General");
    setPresentacion(p.presentacion);
    setStockActual(String(p.stockActual));
    setStockMinimo(String(p.stockMinimo));
    setPrecioCosto(String(p.precioCosto));
    setGastosOpc(
      p.gastosPorcentaje !== null && p.gastosPorcentaje !== undefined
        ? String(Math.round(p.gastosPorcentaje * 10000) / 100)
        : ""
    );
    setIvaOpc(
      p.ivaPorcentaje !== null && p.ivaPorcentaje !== undefined
        ? String(Math.round(p.ivaPorcentaje * 10000) / 100)
        : ""
    );
    setIncluirEnLista(p.incluirEnLista !== false);
    setProveedorNombre(p.proveedorNombre || "");
    setFechaCosto(
      p.fechaCosto || initialData.parametros.vigenciaDesde || "2026-11-10"
    );
    setCategoriaId(p.categoriaId);
    setModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const gastosNum =
      gastosOpc.trim() !== "" ? Number(gastosOpc) / 100 : null;
    const ivaNum = ivaOpc.trim() !== "" ? Number(ivaOpc) / 100 : null;
    const costoNum = Number(precioCosto) || 0;
    const precioVentaBase =
      Math.round(
        (costoNum *
          (1 + (gastosNum ?? initialData.parametros.gastosGenerales)) *
          1.4) /
          (initialData.parametros.redondeoMultiplo || 10)
      ) * (initialData.parametros.redondeoMultiplo || 10);

    const res = await upsertProductoAction({
      id: editingProd?.id,
      codigo,
      nombre,
      medida: familia,
      familia,
      presentacion,
      stockActual: Number(stockActual),
      stockMinimo: Number(stockMinimo),
      precioCosto: costoNum,
      precioVenta: precioVentaBase,
      gastosPorcentaje: gastosNum,
      ivaPorcentaje: ivaNum,
      incluirEnLista,
      proveedorNombre,
      fechaCosto,
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
        ? `Producto ${codigo} actualizado correctamente.`
        : `Producto ${codigo} incorporado al catálogo.`,
    });
    router.refresh();
  }

  async function handleDeleteProduct(p: ProductoDTO) {
    if (!confirm(`¿Confirmar baja del producto "${p.nombre}" (${p.codigo})?`))
      return;
    setLoading(true);
    const res = await deleteProductoAction(p.id);
    setLoading(false);
    if (res.ok) {
      setBanner({ type: "ok", msg: `Producto ${p.codigo} eliminado.` });
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
        msg: `Costos y precios actualizados en ${res.actualizados} productos (${
          Number(porcentajeAjuste) > 0 ? "+" : ""
        }${porcentajeAjuste}%).`,
      });
      router.refresh();
    } else {
      setBanner({
        type: "err",
        msg: res.error || "Error al ajustar precios.",
      });
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

  async function handleExportarListaClientePDF() {
    setLoading(true);
    try {
      await generarListaPreciosClientePDF({
        productos: initialData.productos,
        cliente: clienteElegido,
        parametros: initialData.parametros,
        lineaFiltro: catFilter,
        download: true,
      });
      setBanner({
        type: "ok",
        msg: `PDF de Lista de Precios para "${
          clienteElegido?.nombre || "General"
        }" exportado (sin costos internos).`,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncCatalogo() {
    setLoading(true);
    const res = await sincronizarCatalogo2027Action();
    setLoading(false);
    if (res.ok) {
      setBanner({
        type: "ok",
        msg: `Catálogo 2027 sincronizado (${res.total} presentaciones en 6 líneas).`,
      });
      router.refresh();
    }
  }

  return (
    <ErpShell
      title="Inventario, Costos & Listas por Cliente"
      subtitle="154 presentaciones en 6 líneas oficiales · Control de stock · Cálculo automático de precios y márgenes"
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
          <button
            onClick={() => setBanner(null)}
            className="opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SELECTOR DE VISTAS DEL EXCEL + CLIENTE ACTIVO */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-xl border border-[#DCEBE8]/15 bg-[#0F3A40] p-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("INVENTARIO");
              setPage(1);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "INVENTARIO"
                ? "bg-[#B9673A] text-white shadow"
                : "text-[#DCEBE8]/75 hover:text-white"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>1 · Productos, Costos y Stock</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("LISTA_CLIENTE");
              setPage(1);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "LISTA_CLIENTE"
                ? "bg-[#1E7F7A] text-white shadow"
                : "text-[#DCEBE8]/75 hover:text-white"
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span>2 · Lista de Precios (Cliente)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("ANALISIS_INTERNO");
              setPage(1);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "ANALISIS_INTERNO"
                ? "bg-[#1D2527] text-white border border-[#B9673A] shadow"
                : "text-[#DCEBE8]/75 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4 text-[#B9673A]" />
            <span>3 · Análisis Interno (Margen)</span>
          </button>
        </div>

        {/* Selector de Cliente (Celda C4 del Excel: "Cliente ▸ elegir") */}
        <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-[#DCEBE8]/20 bg-[#0F3A40] px-3.5 py-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#B9673A] font-bold">
            CLIENTE ▸ ELEGIR:
          </span>
          <select
            value={clienteIdSeleccionado}
            onChange={(e) => setClienteIdSeleccionado(e.target.value)}
            className="rounded-lg border border-[#DCEBE8]/20 bg-[#1D2527] px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-[#B9673A]"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} — Markup base {Math.round((c.markupGeneral ?? 0.4) * 100)}%
              </option>
            ))}
          </select>
          {clienteElegido && (
            <PuntoTestigoPill
              label={`${Math.round(
                (clienteElegido.markupGeneral ?? 0.4) * 100
              )}% markup`}
              sublabel={clienteElegido.condicionPago || "Contado"}
              tone="dark"
              className="text-[11px]"
            />
          )}
        </div>
      </div>

      {/* PESTAÑAS DE LAS 6 LÍNEAS OFICIALES (Colores de Línea Pág. 13 Manual) */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1.5 custom-scroll">
        <button
          type="button"
          onClick={() => {
            setCatFilter("ALL");
            setPage(1);
          }}
          className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-bold transition-all ${
            catFilter === "ALL"
              ? "border-[#B9673A] bg-[#0F3A40] text-white shadow"
              : "border-[#DCEBE8]/15 bg-[#0F3A40]/50 text-[#DCEBE8]/75 hover:text-white"
          }`}
        >
          Todas las líneas ({initialData.productos.length})
        </button>

        {initialData.categorias.map((c, idx) => {
          const numLinea = c.numeroLinea || idx + 1;
          const color = c.colorHex || getLineColorHex(numLinea);
          const active = catFilter === c.id;
          const count = initialData.productos.filter(
            (p) => p.categoriaId === c.id
          ).length;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCatFilter(c.id);
                setPage(1);
              }}
              style={{
                borderColor: active ? "#FFFFFF" : color,
                backgroundColor: active ? color : "rgba(15, 58, 64, 0.85)",
              }}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold text-white transition-all"
            >
              <span
                style={{ backgroundColor: active ? "#0F3A40" : color }}
                className="rounded px-1.5 py-0.5 font-mono text-[10px] text-white"
              >
                0{numLinea}
              </span>
              <span>{c.nombre}</span>
              <span className="font-mono text-[10px] opacity-80">
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* BARRA DE BÚSQUEDA Y ACCIONES */}
      <BentoCard className="mb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DCEBE8]/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por código (PT-150, BT20, EC-100), familia o producto..."
                className="input-gasa w-full rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm outline-none"
              />
            </div>

            <div className="inline-flex rounded-lg border border-[#DCEBE8]/15 bg-[#1D2527]/50 p-1 self-start">
              {(["ALL", "CRITICO", "OK"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStockFilter(st);
                    setPage(1);
                  }}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    stockFilter === st
                      ? "bg-[#B9673A] text-white"
                      : "text-[#DCEBE8]/70 hover:text-white"
                  }`}
                >
                  {st === "ALL"
                    ? "Todo el stock"
                    : st === "CRITICO"
                    ? `Críticos (${criticalCount})`
                    : "Stock óptimo"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "LISTA_CLIENTE" ? (
              <>
                <button
                  type="button"
                  onClick={handleExportarListaClientePDF}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F6F3EE] px-3.5 py-2 text-xs font-bold text-[#0F3A40] hover:bg-white"
                >
                  <FileText className="h-4 w-4 text-[#B9673A]" />
                  Exportar Lista PDF (Sin costos)
                </button>
                <a
                  href={buildWhatsAppCatalogUrl({
                    telefonoDestino: clienteElegido?.telefono,
                    nombreCliente: clienteElegido?.nombre,
                    incluirListaPrecios: true,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E7F7A] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1E7F7A]/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar WhatsApp
                </a>
                <a
                  href={buildMailtoCatalogUrl({
                    emailDestino: clienteElegido?.email,
                    nombreCliente: clienteElegido?.nombre,
                    incluirListaPrecios: true,
                  })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#B9673A] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#B9673A]/90"
                >
                  <Mail className="h-4 w-4" />
                  Enviar Mail ({BRAND_CONTACT.email})
                </a>
              </>
            ) : (
              <>
                {initialData.productos.length < 150 && (
                  <button
                    type="button"
                    onClick={handleSyncCatalogo}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E7F7A] bg-[#1E7F7A]/20 px-3 py-2 text-xs font-bold text-white"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Cargar 154 Productos Oficiales
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPriceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8952B] bg-[#C8952B]/20 px-3.5 py-2 text-xs font-bold text-white hover:bg-[#C8952B]/30"
                >
                  <Percent className="h-3.5 w-3.5 text-[#C8952B]" />
                  Ajustar Costos (%)
                </button>

                <button
                  type="button"
                  onClick={openNewProductModal}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#B9673A] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#B9673A]/90"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Producto
                </button>
              </>
            )}
          </div>
        </div>
      </BentoCard>

      {/* CABECERA INFORMATIVA CUANDO ESTÁ EN LISTA DE PRECIOS O ANÁLISIS INTERNO */}
      {activeTab !== "INVENTARIO" && (
        <div className="mb-4 rounded-xl border border-[#DCEBE8]/20 bg-[#0F3A40] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#B9673A] font-bold">
              {activeTab === "LISTA_CLIENTE"
                ? "HOJA LISTA DE PRECIOS (PARA ENVIAR EN PDF AL CLIENTE — SIN COSTOS)"
                : "HOJA ANÁLISIS INTERNO — COSTO, MARKUP, GANANCIA Y MARGEN S/ PRECIO (USO INTERNO)"}
            </span>
            <p className="mt-0.5 text-sm font-bold text-white">
              Cliente seleccionado: {clienteElegido?.nombre || "General"} ·{" "}
              <span className="text-[#DCEBE8]/80 font-normal">
                Condición: {clienteElegido?.condicionPago || "Contado"} ·
                Vigencia: {initialData.parametros.vigenciaDesde} · Redondeo: $
                {initialData.parametros.redondeoMultiplo}
              </span>
            </p>
          </div>
          <div className="font-mono text-[11px] text-[#DCEBE8]/80">
            IVA Gral: {Math.round(initialData.parametros.ivaGeneral * 100)}% ·
            Gastos s/costo:{" "}
            {Math.round(initialData.parametros.gastosGenerales * 100)}%
          </div>
        </div>
      )}

      {/* TABLA PRINCIPAL ADAPTATIVA (Desktop Table + Mobile Cards para Teléfono) */}
      <BentoCard className="p-0 overflow-hidden">
        {/* Vista Tabla (Desktop y Tablet) */}
        <div className="hidden md:block overflow-x-auto custom-scroll">
          {activeTab === "INVENTARIO" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#6B7A7D]/30 bg-[#1D2527]/60 font-mono text-[10px] font-bold uppercase tracking-wider text-[#DCEBE8]/80">
                  <th className="py-3 px-4">Código / Producto</th>
                  <th className="py-3 px-4">Línea & Familia</th>
                  <th className="py-3 px-4">Presentación</th>
                  <th className="py-3 px-4 text-center">Stock Actual</th>
                  <th className="py-3 px-4 text-right">Costo s/IVA ($)</th>
                  <th className="py-3 px-4 text-right">Costo Final ($)</th>
                  <th className="py-3 px-4 text-right">Precio s/IVA</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B7A7D]/25 text-xs">
                {paginated.map((p) => {
                  const isCrit = p.stockActual <= p.stockMinimo;
                  const numLinea = resolverNumeroLinea(p);
                  const lineColor =
                    p.categoria?.colorHex || getLineColorHex(numLinea);
                  const calc = calcularPrecioProductoCliente(
                    p,
                    clienteElegido,
                    initialData.parametros
                  );

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-white/[0.04]"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#B9673A]/20 border border-[#B9673A]/50 px-2 py-0.5 font-mono text-[11px] font-bold text-[#F6F3EE]">
                            {p.codigo}
                          </span>
                          {isCrit && (
                            <span className="rounded-full bg-[#8C3B4A] px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-white">
                              CRÍTICO
                            </span>
                          )}
                          {p.incluirEnLista === false && (
                            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-[#DCEBE8]/60">
                              OCULTO EN LISTA
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-semibold text-white">
                          {p.nombre}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: lineColor }}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white"
                          >
                            <BrandFamilyIcon
                              familia={p.familia || p.medida}
                              className="h-3.5 w-3.5"
                            />
                          </span>
                          <div>
                            <p className="font-bold text-white text-[11px]">
                              {p.categoria?.nombre || "Descartables"}
                            </p>
                            <p className="text-[11px] text-[#DCEBE8]/65">
                              {p.familia || p.medida}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-[#DCEBE8]">
                        {p.presentacion}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`rounded-lg px-2.5 py-0.5 font-mono text-xs font-bold ${
                              isCrit
                                ? "bg-[#8C3B4A]/40 text-white border border-[#B9673A]"
                                : "bg-[#1E7F7A]/30 text-[#DCEBE8] border border-[#1E7F7A]"
                            }`}
                          >
                            {p.stockActual} u.
                          </span>
                          <span className="mt-0.5 font-mono text-[10px] text-[#DCEBE8]/55">
                            Mín: {p.stockMinimo}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-xs text-[#F6F3EE]">
                        {formatARS(p.precioCosto)}
                        {p.gastosPorcentaje ? (
                          <span className="block text-[10px] text-[#B9673A]">
                            +{Math.round(p.gastosPorcentaje * 100)}% gastos
                          </span>
                        ) : null}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-xs text-[#DCEBE8]/85">
                        {formatARS(calc.costoFinal)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-xs font-bold text-white">
                        {formatARS(calc.precioSinIva)}
                        <span className="block text-[10px] font-normal text-[#DCEBE8]/65">
                          Final c/IVA: {formatARS(calc.precioFinal)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setMovModalProd(p);
                              setTipoMov("ENTRADA");
                              setCantidadMov("10");
                              setMotivoMov("");
                            }}
                            className="rounded-lg border border-[#1E7F7A] bg-[#1E7F7A]/25 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#1E7F7A]/45"
                          >
                            <ArrowUpDown className="h-3.5 w-3.5 inline mr-1" />
                            Stock
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditProductModal(p)}
                            className="rounded-lg border border-[#DCEBE8]/20 bg-white/5 p-1.5 text-[#DCEBE8] hover:bg-white/15 hover:text-white"
                            title="Editar costo y ficha"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="rounded-lg border border-[#8C3B4A]/40 bg-[#8C3B4A]/20 p-1.5 text-white/80 hover:bg-[#8C3B4A]/40 hover:text-white"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === "LISTA_CLIENTE" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#6B7A7D]/30 bg-[#1D2527]/60 font-mono text-[10px] font-bold uppercase tracking-wider text-[#DCEBE8]">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Línea</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Presentación</th>
                  <th className="py-3 px-4 text-right">Precio sin IVA</th>
                  <th className="py-3 px-4 text-right">IVA ($)</th>
                  <th className="py-3 px-4 text-right">Precio Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B7A7D]/25 text-xs">
                {paginated.map((p) => {
                  const calc = calcularPrecioProductoCliente(
                    p,
                    clienteElegido,
                    initialData.parametros
                  );
                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-white/[0.04]"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#B9673A]">
                        {p.codigo}
                      </td>
                      <td className="py-3 px-4 text-[#DCEBE8]/85">
                        {p.categoria?.nombre || "Descartables"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {p.nombre}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#DCEBE8]/80">
                        {p.presentacion}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatARS(calc.precioSinIva)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#DCEBE8]/75">
                        {formatARS(calc.montoIva)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm font-bold text-[#B9673A]">
                        {formatARS(calc.precioFinal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === "ANALISIS_INTERNO" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#6B7A7D]/30 bg-[#1D2527]/60 font-mono text-[10px] font-bold uppercase tracking-wider text-[#DCEBE8]">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Línea / Producto</th>
                  <th className="py-3 px-4 text-right">Costo Final ($)</th>
                  <th className="py-3 px-4 text-center">Markup Aplicado</th>
                  <th className="py-3 px-4 text-right">Precio s/IVA ($)</th>
                  <th className="py-3 px-4 text-right">IVA %</th>
                  <th className="py-3 px-4 text-right">Precio Final ($)</th>
                  <th className="py-3 px-4 text-right">Ganancia ($)</th>
                  <th className="py-3 px-4 text-right">Margen s/ precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B7A7D]/25 text-xs">
                {paginated.map((p) => {
                  const calc = calcularPrecioProductoCliente(
                    p,
                    clienteElegido,
                    initialData.parametros
                  );
                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-white/[0.04]"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#B9673A]">
                        {p.codigo}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{p.nombre}</p>
                        <p className="text-[11px] text-[#DCEBE8]/65">
                          {p.categoria?.nombre} · {p.presentacion}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#DCEBE8]">
                        {formatARS(calc.costoFinal)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                            calc.esMarkupEspecificoLinea
                              ? "bg-[#B9673A] text-white"
                              : "bg-[#1E7F7A]/30 text-[#DCEBE8]"
                          }`}
                        >
                          {Math.round(calc.markupAplicado * 100)}%
                          {calc.esMarkupEspecificoLinea ? " (Línea)" : ""}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatARS(calc.precioSinIva)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#DCEBE8]/75">
                        {Math.round(calc.ivaPct * 100)}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#DCEBE8]">
                        {formatARS(calc.precioFinal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#1E7F7A]">
                        +{formatARS(calc.ganancia)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#B9673A]">
                        {(calc.margenSobrePrecio * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Vista Tarjetas Móvil (Para uso cómodo desde el teléfono) */}
        <div className="md:hidden divide-y divide-[#DCEBE8]/15">
          {paginated.map((p) => {
            const isCrit = p.stockActual <= p.stockMinimo;
            const calc = calcularPrecioProductoCliente(
              p,
              clienteElegido,
              initialData.parametros
            );
            return (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-[#B9673A] px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                        {p.codigo}
                      </span>
                      <span className="font-mono text-[11px] text-[#DCEBE8]/75">
                        {p.presentacion}
                      </span>
                      {isCrit && (
                        <span className="rounded bg-[#8C3B4A] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                          CRÍTICO
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-bold text-sm text-white">
                      {p.nombre}
                    </p>
                    <p className="text-xs text-[#DCEBE8]/65">
                      {p.categoria?.nombre} · {p.familia || p.medida}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block rounded-lg bg-[#1D2527] border border-[#DCEBE8]/20 px-2.5 py-1 font-mono text-xs font-bold text-white">
                      {p.stockActual} u.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#1D2527]/50 p-2.5 text-center font-mono text-xs">
                  <div>
                    <span className="block text-[9px] uppercase text-[#DCEBE8]/60">
                      Costo s/IVA
                    </span>
                    <span className="font-bold text-[#DCEBE8]">
                      {formatARS(p.precioCosto)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase text-[#DCEBE8]/60">
                      Precio s/IVA
                    </span>
                    <span className="font-bold text-white">
                      {formatARS(calc.precioSinIva)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase text-[#B9673A]">
                      Final c/IVA
                    </span>
                    <span className="font-bold text-[#B9673A]">
                      {formatARS(calc.precioFinal)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMovModalProd(p);
                      setTipoMov("ENTRADA");
                      setCantidadMov("10");
                      setMotivoMov("");
                    }}
                    className="flex-1 rounded-lg bg-[#1E7F7A] py-2 text-xs font-bold text-white text-center"
                  >
                    Mover Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditProductModal(p)}
                    className="rounded-lg border border-[#DCEBE8]/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(p)}
                    className="rounded-lg border border-[#8C3B4A] bg-[#8C3B4A]/30 px-2.5 py-2 text-xs text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginación */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DCEBE8]/15 bg-[#1D2527]/40 px-4 py-3.5 text-xs text-[#DCEBE8]/75">
          <span>
            Mostrando <strong className="text-white">{paginated.length}</strong>{" "}
            de <strong className="text-white">{filteredProducts.length}</strong>{" "}
            presentaciones
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-[#DCEBE8]/20 bg-white/5 px-3 py-1.5 text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
            <span className="px-2 font-mono font-bold text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-[#DCEBE8]/20 bg-white/5 px-3 py-1.5 text-white disabled:opacity-40"
            >
              Siguiente
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </BentoCard>

      {/* MODAL 1: Crear / Editar Producto y Costos (Con todos los campos del Excel) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-2xl rounded-2xl border border-[#DCEBE8]/20 p-5 sm:p-7 shadow-2xl animate-dialog-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCEBE8]/15 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  {editingProd
                    ? `Editar Producto ${editingProd.codigo}`
                    : "Alta de Producto en Catálogo Antapharma"}
                </h2>
                <p className="text-xs text-[#DCEBE8]/70">
                  Ficha de catálogo, costo unitario sin IVA y control de stock
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#DCEBE8]/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Código (IBM Plex Mono)
                  </label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. PT-150"
                    className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Línea Oficial (01 a 06)
                  </label>
                  <select
                    required
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="w-full rounded-lg border border-[#DCEBE8]/25 bg-[#1D2527] px-3 py-2 text-sm text-white outline-none"
                  >
                    {initialData.categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        0{c.numeroLinea || ""} · {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Familia de Producto
                  </label>
                  <input
                    type="text"
                    required
                    value={familia}
                    onChange={(e) => setFamilia(e.target.value)}
                    placeholder="Ej. Pouch con testigo"
                    className="input-gasa w-full rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Nombre Técnico del Producto
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Pouch con testigo 150 mm"
                    className="input-gasa w-full rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Presentación
                  </label>
                  <input
                    type="text"
                    required
                    value={presentacion}
                    onChange={(e) => setPresentacion(e.target.value)}
                    placeholder="Ej. Rollo × 200 m"
                    className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
                  />
                </div>
              </div>

              {/* Costos y Parámetros del Producto (Columnas F, G, I, J, K, L del Excel) */}
              <div className="rounded-xl border border-[#B9673A]/40 bg-[#1D2527]/50 p-3.5 space-y-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#B9673A]">
                  ESTRUCTURA DE COSTO (PLANILLA INTERNA)
                </span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                      Costo s/IVA ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={precioCosto}
                      onChange={(e) => setPrecioCosto(e.target.value)}
                      className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                      Gastos % (opcional)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={gastosOpc}
                      onChange={(e) => setGastosOpc(e.target.value)}
                      placeholder={`Gral: ${Math.round(
                        initialData.parametros.gastosGenerales * 100
                      )}%`}
                      className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                      IVA % (opcional)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={ivaOpc}
                      onChange={(e) => setIvaOpc(e.target.value)}
                      placeholder={`Gral: ${Math.round(
                        initialData.parametros.ivaGeneral * 100
                      )}%`}
                      className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                      Incluir en lista
                    </label>
                    <select
                      value={incluirEnLista ? "SI" : "NO"}
                      onChange={(e) =>
                        setIncluirEnLista(e.target.value === "SI")
                      }
                      className="w-full rounded-lg border border-[#DCEBE8]/25 bg-[#0F3A40] px-3 py-2 font-mono text-sm font-bold text-white outline-none"
                    >
                      <option value="SI">SI (Visible)</option>
                      <option value="NO">NO (Ocultar)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                      Proveedor Habitual
                    </label>
                    <input
                      type="text"
                      value={proveedorNombre}
                      onChange={(e) => setProveedorNombre(e.target.value)}
                      placeholder="Ej. Terragene / Empaques Médicos"
                      className="input-gasa w-full rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                      Fecha del costo
                    </label>
                    <input
                      type="date"
                      value={fechaCosto}
                      onChange={(e) => setFechaCosto(e.target.value)}
                      className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Control de Stock */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Stock Actual en Depósito
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockActual}
                    onChange={(e) => setStockActual(e.target.value)}
                    className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Stock Mínimo (Alerta Crítica)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DCEBE8]/15">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-[#DCEBE8]/20 px-4 py-2 text-xs font-semibold text-[#DCEBE8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#B9673A] px-5 py-2 text-xs font-bold text-white hover:bg-[#B9673A]/90 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ajuste Masivo de Costos por Línea */}
      {priceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-md rounded-2xl border border-[#DCEBE8]/20 p-6 shadow-2xl animate-dialog-in">
            <div className="flex items-center justify-between border-b border-[#DCEBE8]/15 pb-3.5">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-5 w-5 text-[#B9673A]" />
                <h2 className="font-display text-base font-bold text-white">
                  Actualización Masiva de Costos (%)
                </h2>
              </div>
              <button
                onClick={() => setPriceModalOpen(false)}
                className="text-[#DCEBE8]/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkPriceAdjust} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                  Línea de Catálogo Objetivo
                </label>
                <select
                  value={catAjuste}
                  onChange={(e) => setCatAjuste(e.target.value)}
                  className="w-full rounded-lg border border-[#DCEBE8]/25 bg-[#1D2527] px-3 py-2.5 text-sm text-white outline-none"
                >
                  <option value="ALL">
                    Todas las 6 líneas (154 productos)
                  </option>
                  {initialData.categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      0{c.numeroLinea || ""} · {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                  Variación Porcentual de Costo (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={porcentajeAjuste}
                  onChange={(e) => setPorcentajeAjuste(e.target.value)}
                  className="input-gasa w-full rounded-lg px-3.5 py-2.5 font-mono text-sm font-bold outline-none"
                />
                <p className="mt-1 text-[11px] text-[#DCEBE8]/65">
                  Al actualizar el costo sin IVA, todas las listas por cliente
                  se recalculan automáticamente.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DCEBE8]/15">
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(false)}
                  className="rounded-lg border border-[#DCEBE8]/20 px-4 py-2 text-xs text-[#DCEBE8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#B9673A] px-4 py-2 text-xs font-bold text-white"
                >
                  {loading ? "Aplicando..." : `Aplicar ${porcentajeAjuste}%`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Registrar Entrada / Salida de Stock (Kardex) */}
      {movModalProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-md rounded-2xl border border-[#DCEBE8]/20 p-6 shadow-2xl animate-dialog-in">
            <div className="flex items-center justify-between border-b border-[#DCEBE8]/15 pb-3.5">
              <div>
                <span className="font-mono text-xs font-bold text-[#B9673A]">
                  {movModalProd.codigo}
                </span>
                <h2 className="font-display text-base font-bold text-white">
                  {movModalProd.nombre}
                </h2>
                <p className="text-xs text-[#DCEBE8]/70">
                  Stock actual disponible: {movModalProd.stockActual} u.
                </p>
              </div>
              <button
                onClick={() => setMovModalProd(null)}
                className="text-[#DCEBE8]/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovimiento} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {(["ENTRADA", "SALIDA"] as const).map((tm) => (
                  <button
                    key={tm}
                    type="button"
                    onClick={() => setTipoMov(tm)}
                    className={`rounded-lg border py-2.5 text-xs font-bold transition-all ${
                      tipoMov === tm
                        ? tm === "ENTRADA"
                          ? "border-[#1E7F7A] bg-[#1E7F7A] text-white"
                          : "border-[#B9673A] bg-[#B9673A] text-white"
                        : "border-[#DCEBE8]/15 bg-[#1D2527]/50 text-[#DCEBE8]/70"
                    }`}
                  >
                    {tm === "ENTRADA"
                      ? "+ ENTRADA (Reposición)"
                      : "- SALIDA (Entrega/Remito)"}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                  Cantidad ({movModalProd.presentacion})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadMov}
                  onChange={(e) => setCantidadMov(e.target.value)}
                  className="input-gasa w-full rounded-lg px-3.5 py-2.5 font-mono text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                  Cliente o Proveedor Vinculado (opcional)
                </label>
                <select
                  value={entidadMov}
                  onChange={(e) => setEntidadMov(e.target.value)}
                  className="w-full rounded-lg border border-[#DCEBE8]/25 bg-[#1D2527] px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="">— Ajuste interno de depósito —</option>
                  {initialData.entidades.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{e.tipo}] {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                  Motivo / N° de Remito o Lote
                </label>
                <input
                  type="text"
                  required
                  value={motivoMov}
                  onChange={(e) => setMotivoMov(e.target.value)}
                  placeholder="Ej. Remito 0001-0125 Sanatorio / Ingreso lote proveedor"
                  className="input-gasa w-full rounded-lg px-3.5 py-2.5 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DCEBE8]/15">
                <button
                  type="button"
                  onClick={() => setMovModalProd(null)}
                  className="rounded-lg border border-[#DCEBE8]/20 px-4 py-2 text-xs text-[#DCEBE8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#B9673A] px-4 py-2 text-xs font-bold text-white"
                >
                  {loading ? "Registrando..." : "Confirmar Movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpShell>
  );
}
