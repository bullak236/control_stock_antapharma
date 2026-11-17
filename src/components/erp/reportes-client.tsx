"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
import { VercelTabs } from "@/components/ui/vercel-tabs";
import { CatalogoShareHub } from "@/components/erp/catalogo-share-modal";
import {
  generarCatalogo2027PDF,
  generarListaPreciosClientePDF,
  generarPlanillaInternaExcel,
} from "@/lib/document-generators";
import { getLineColorHex } from "@/components/brand/antapharma-brand";
import type { ErpSnapshot } from "@/app/actions/erp-actions";
import { formatARS, formatDateTimeAR } from "@/lib/utils";

export function ReportesClient({ initialData }: { initialData: ErpSnapshot }) {
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [catFiltro, setCatFiltro] = useState("ALL");

  const clientes = useMemo(
    () => initialData.entidades.filter((e) => e.tipo === "CLIENTE"),
    [initialData.entidades]
  );
  const [clienteId, setClienteId] = useState<string>(clientes[0]?.id || "");
  const clienteElegido = useMemo(
    () => clientes.find((c) => c.id === clienteId) || clientes[0] || null,
    [clientes, clienteId]
  );

  const criticalCount = initialData.productos.filter(
    (p) => p.stockActual <= p.stockMinimo
  ).length;

  const productosFiltrados =
    catFiltro === "ALL"
      ? initialData.productos
      : initialData.productos.filter((p) => p.categoriaId === catFiltro);

  // 1. Generar Catálogo 2027 Oficial (PDF A4 Vertical sin precios)
  async function handleExportCatalogoPDF() {
    await generarCatalogo2027PDF(productosFiltrados, { download: true });
    setExportStatus(
      "Catálogo Oficial de Productos 2027 (PDF A4 vertical, sin precios) generado y descargado."
    );
  }

  // 2. Generar Lista de Precios por Cliente (PDF A4 sin costos)
  async function handleExportListaClientePDF() {
    await generarListaPreciosClientePDF({
      productos: initialData.productos,
      cliente: clienteElegido,
      parametros: initialData.parametros,
      lineaFiltro: catFiltro,
      download: true,
    });
    setExportStatus(
      `Lista de Precios PDF emitida para "${
        clienteElegido?.nombre || "General"
      }" (costos protegidos).`
    );
  }

  // 3. Exportar Planilla Interna Completa Excel (5 Hojas: Inicio, Productos, Clientes, Lista de precios, Análisis interno)
  async function handleExportPlanillaInternaXLSX() {
    await generarPlanillaInternaExcel({
      productos: initialData.productos,
      entidades: initialData.entidades,
      clienteSeleccionado: clienteElegido,
      parametros: initialData.parametros,
      movimientos: initialData.movimientos,
      transacciones: initialData.transacciones,
    });
    setExportStatus(
      "Planilla Interna Excel (.XLSX) descargada con las 5 hojas oficiales (Inicio, Productos, Clientes, Lista de precios y Análisis interno)."
    );
  }

  // 4. Descargar CSV plano
  async function handleExportCSV() {
    const Papa = (await import("papaparse")).default;

    const data = productosFiltrados.map((p) => ({
      codigo: p.codigo,
      linea: p.categoria?.nombre || "Descartables",
      familia: p.familia || p.medida,
      producto: p.nombre,
      presentacion: p.presentacion,
      stock_actual: p.stockActual,
      stock_minimo: p.stockMinimo,
      costo_sin_iva: p.precioCosto,
      precio_sin_iva: p.precioVenta,
      proveedor: p.proveedorNombre || "",
    }));

    const csv = Papa.unparse(data, { delimiter: ";" });
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Antapharma_Catalogo_Datos_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportStatus("Archivo CSV descargado con codificación UTF-8.");
  }

  const resumenCategorias = initialData.categorias.map((c, idx) => {
    const items = initialData.productos.filter((p) => p.categoriaId === c.id);
    const unidades = items.reduce((a, b) => a + b.stockActual, 0);
    const valorVenta = items.reduce(
      (a, b) => a + b.stockActual * b.precioVenta,
      0
    );
    const valorCosto = items.reduce(
      (a, b) => a + b.stockActual * b.precioCosto,
      0
    );
    const criticos = items.filter((p) => p.stockActual <= p.stockMinimo).length;
    return {
      ...c,
      numeroLinea: c.numeroLinea || idx + 1,
      colorHex: c.colorHex || getLineColorHex(c.numeroLinea || idx + 1),
      referencias: items.length,
      unidades,
      valorVenta,
      valorCosto,
      criticos,
    };
  });

  return (
    <ErpShell
      title="Reportes, Catálogo 2027 & Planilla Interna"
      subtitle="Emisión documental en PDF (Catálogo y Lista por Cliente), Planilla Excel de 5 hojas y envío por WhatsApp/Mail"
      criticalCount={criticalCount}
    >
      {exportStatus && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[#1E7F7A] bg-[#1E7F7A]/20 px-4 py-3 text-xs text-white">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-[#B9673A]" />
            {exportStatus}
          </span>
          <button
            onClick={() => setExportStatus(null)}
            className="text-[#DCEBE8]/70 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Hub de envío directo por WhatsApp y Mail */}
      <div className="mb-6">
        <CatalogoShareHub
          productos={initialData.productos}
          entidades={initialData.entidades}
          parametros={initialData.parametros}
        />
      </div>

      {/* Panel de Exportación de Entregables Oficiales (Manual Pág. 20) */}
      <BentoCard glowColor="quirofano" className="mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCEBE8]/15 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#B9673A] font-bold">
                ENTREGABLES OFICIALES ANTAPHARMA (MANUAL V1.1 · PÁG. 20)
              </span>
              <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-white">
                Emisión de Catálogo 2027, Lista por Cliente y Planilla Interna
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="rounded-lg border border-[#DCEBE8]/25 bg-[#1D2527] px-3 py-2 text-xs font-bold text-white outline-none"
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Cliente: {c.nombre} (
                    {Math.round((c.markupGeneral ?? 0.4) * 100)}%)
                  </option>
                ))}
              </select>

              <select
                value={catFiltro}
                onChange={(e) => setCatFiltro(e.target.value)}
                className="rounded-lg border border-[#DCEBE8]/25 bg-[#1D2527] px-3 py-2 text-xs text-white outline-none"
              >
                <option value="ALL">
                  Todas las líneas ({initialData.productos.length} productos)
                </option>
                {initialData.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    0{c.numeroLinea || ""} · {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={handleExportCatalogoPDF}
              className="group flex flex-col items-start justify-between rounded-xl border border-[#B9673A]/50 bg-[#B9673A]/15 p-4 text-left transition-all hover:bg-[#B9673A]/25"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B9673A] text-white mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-white">
                  Catálogo 2027 (PDF A4)
                </p>
                <p className="mt-0.5 text-[11px] text-[#DCEBE8]/75">
                  Tapa + 6 líneas + contratapa. Sin precios. Apto WhatsApp.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportListaClientePDF}
              className="group flex flex-col items-start justify-between rounded-xl border border-[#1E7F7A]/60 bg-[#1E7F7A]/20 p-4 text-left transition-all hover:bg-[#1E7F7A]/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E7F7A] text-white mb-3">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-white">
                  Lista por Cliente (PDF)
                </p>
                <p className="mt-0.5 text-[11px] text-[#DCEBE8]/75">
                  Precio s/IVA, IVA y Final para{" "}
                  {clienteElegido?.nombre || "cliente"}. Sin costos.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportPlanillaInternaXLSX}
              className="group flex flex-col items-start justify-between rounded-xl border border-[#C8952B]/50 bg-[#C8952B]/15 p-4 text-left transition-all hover:bg-[#C8952B]/25"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C8952B] text-white mb-3">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-white">
                  Planilla Interna (XLSX)
                </p>
                <p className="mt-0.5 text-[11px] text-[#DCEBE8]/75">
                  Las 5 hojas del Excel (Inicio, Productos, Clientes, Lista y
                  Análisis).
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="group flex flex-col items-start justify-between rounded-xl border border-[#DCEBE8]/25 bg-[#1D2527]/50 p-4 text-left transition-all hover:bg-[#1D2527]/80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#55656A] text-white mb-3">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-white">
                  Exportar Datos (CSV)
                </p>
                <p className="mt-0.5 text-[11px] text-[#DCEBE8]/75">
                  Padrón de 154 códigos separado por punto y coma (;).
                </p>
              </div>
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Matriz por Línea + Kardex + Auditoría */}
      <BentoCard>
        <VercelTabs
          tabs={[
            {
              value: "categorias",
              label: "Matriz por las 6 Líneas Oficiales",
              badge: resumenCategorias.length,
              content: (
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCEBE8]/15 font-mono text-[10px] font-bold uppercase tracking-wider text-[#DCEBE8]/75">
                        <th className="py-3 px-4">Línea Oficial</th>
                        <th className="py-3 px-4 text-center">Presentaciones</th>
                        <th className="py-3 px-4 text-center">
                          Unidades Totales
                        </th>
                        <th className="py-3 px-4 text-center">
                          Alertas Críticas
                        </th>
                        <th className="py-3 px-4 text-right">
                          Valor Costo s/IVA
                        </th>
                        <th className="py-3 px-4 text-right">
                          Valor Lista s/IVA
                        </th>
                        <th className="py-3 px-4 text-right">
                          Ganancia Potencial
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCEBE8]/12 text-xs">
                      {resumenCategorias.map((rc) => (
                        <tr
                          key={rc.id}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                style={{ backgroundColor: rc.colorHex }}
                                className="rounded px-2 py-0.5 font-mono text-[10px] font-bold text-white"
                              >
                                0{rc.numeroLinea}
                              </span>
                              <div>
                                <p className="font-bold text-white">
                                  {rc.nombre}
                                </p>
                                <p className="text-[11px] text-[#DCEBE8]/60">
                                  {rc.descripcion}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                            {rc.referencias}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-[#DCEBE8]">
                            {rc.unidades} u.
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {rc.criticos > 0 ? (
                              <span className="rounded-full bg-[#B9673A] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                                {rc.criticos} críticos
                              </span>
                            ) : (
                              <span className="font-mono text-[11px] text-[#1E7F7A]">
                                0 alertas
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#DCEBE8]/80">
                            {formatARS(rc.valorCosto)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                            {formatARS(rc.valorVenta)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#B9673A]">
                            {formatARS(rc.valorVenta - rc.valorCosto)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
            },
            {
              value: "kardex",
              label: "Kardex de Movimientos de Stock",
              badge: initialData.movimientos.length,
              content: (
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCEBE8]/15 font-mono text-[10px] font-bold uppercase tracking-wider text-[#DCEBE8]/75">
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Producto</th>
                        <th className="py-3 px-4 text-center">Cantidad</th>
                        <th className="py-3 px-4">Entidad Vinculada</th>
                        <th className="py-3 px-4">Motivo / Remito</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCEBE8]/12 text-xs">
                      {initialData.movimientos.map((m) => (
                        <tr key={m.id} className="hover:bg-white/[0.03]">
                          <td className="py-3 px-4 font-mono text-[11px] text-[#DCEBE8]/70 whitespace-nowrap">
                            {formatDateTimeAR(m.fecha)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                                m.tipo === "ENTRADA"
                                  ? "bg-[#1E7F7A]/30 text-[#DCEBE8]"
                                  : "bg-[#B9673A]/30 text-white"
                              }`}
                            >
                              {m.tipo}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            <span className="font-mono text-[#B9673A] mr-1.5">
                              {m.producto?.codigo}
                            </span>
                            {m.producto?.nombre}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-white">
                            {m.tipo === "ENTRADA" ? "+" : "-"}
                            {m.cantidad} u.
                          </td>
                          <td className="py-3 px-4 text-[#DCEBE8]/80">
                            {m.entidad?.nombre || "Ajuste Interno"}
                          </td>
                          <td className="py-3 px-4 text-[#DCEBE8]/70">
                            {m.motivo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
            },
            {
              value: "auditoria",
              label: "Bitácora de Auditoría",
              badge: initialData.logs.length,
              content: (
                <div className="space-y-2">
                  {initialData.logs.map((l) => (
                    <div
                      key={l.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#DCEBE8]/12 bg-[#1D2527]/45 px-4 py-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-[#B9673A] shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-[#B9673A] mr-2">
                            [{l.accion}]
                          </span>
                          <span className="text-[#F6F3EE]">{l.detalle}</span>
                        </div>
                      </div>
                      <span className="mt-1 sm:mt-0 font-mono text-[11px] text-[#DCEBE8]/55">
                        {formatDateTimeAR(l.fecha)}
                      </span>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </BentoCard>
    </ErpShell>
  );
}
