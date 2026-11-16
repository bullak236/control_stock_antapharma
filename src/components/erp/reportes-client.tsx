"use client";

import { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  BarChart3,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
import { VercelTabs } from "@/components/ui/vercel-tabs";
import type { ErpSnapshot } from "@/app/actions/erp-actions";
import { formatARS, formatDateTimeAR } from "@/lib/utils";

export function ReportesClient({ initialData }: { initialData: ErpSnapshot }) {
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [catFiltro, setCatFiltro] = useState("ALL");

  const criticalCount = initialData.productos.filter(
    (p) => p.stockActual <= p.stockMinimo
  ).length;

  const productosFiltrados =
    catFiltro === "ALL"
      ? initialData.productos
      : initialData.productos.filter((p) => p.categoriaId === catFiltro);

  // 1. Generar Catálogo (PDF) con jsPDF + autoTable
  async function handleExportCatalogoPDF() {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFillColor(7, 10, 18);
    doc.rect(0, 0, 297, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(
      "ANTAPHARMA DISTRIBUIDORA — CATALOGO OFICIAL DE INSUMOS",
      14,
      14
    );

    doc.setFontSize(10);
    doc.setTextColor(56, 189, 248);
    doc.text(
      `Division Esterilizacion Medica • Emision: ${new Date().toLocaleDateString("es-AR")} • Direccion General (David)`,
      14,
      23
    );

    const rows = productosFiltrados.map((p) => [
      p.codigo,
      p.nombre,
      p.categoria?.nombre || "General",
      p.medida,
      p.presentacion,
      `${p.stockActual} u.`,
      formatARS(p.precioCosto),
      formatARS(p.precioVenta),
    ]);

    autoTable(doc, {
      startY: 38,
      head: [
        [
          "Codigo SKU",
          "Insumo de Esterilizacion",
          "Categoria",
          "Medida",
          "Presentacion",
          "Stock",
          "Costo",
          "Precio Lista",
        ],
      ],
      body: rows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [14, 116, 144], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`Antapharma_Catalogo_Esterilizacion_${new Date().toISOString().slice(0, 10)}.pdf`);
    setExportStatus("Catálogo PDF generado y descargado correctamente.");
  }

  // 2. Exportar Ventas y Balance (XLSX) con SheetJS
  async function handleExportVentasXLSX() {
    const XLSX = await import("xlsx");

    const ventasRows = initialData.transacciones.map((t) => ({
      Fecha: formatDateTimeAR(t.fecha),
      Tipo: t.tipo,
      Comprobante: t.comprobante || "S/C",
      Concepto: t.concepto,
      Entidad: t.entidad?.nombre || "Directo",
      Tipo_Entidad: t.entidad?.tipo || "—",
      Monto_ARS: t.monto,
    }));

    const inventarioRows = initialData.productos.map((p) => ({
      Codigo: p.codigo,
      Insumo: p.nombre,
      Categoria: p.categoria?.nombre || "General",
      Medida: p.medida,
      Presentacion: p.presentacion,
      Stock_Actual: p.stockActual,
      Stock_Minimo: p.stockMinimo,
      Estado: p.stockActual <= p.stockMinimo ? "CRITICO" : "OPTIMO",
      Precio_Costo_ARS: p.precioCosto,
      Precio_Venta_ARS: p.precioVenta,
      Valor_Stock_Venta_ARS: p.stockActual * p.precioVenta,
    }));

    const kardexRows = initialData.movimientos.map((m) => ({
      Fecha: formatDateTimeAR(m.fecha),
      Movimiento: m.tipo,
      Codigo: m.producto?.codigo || "—",
      Insumo: m.producto?.nombre || "—",
      Cantidad: m.cantidad,
      Entidad: m.entidad?.nombre || "—",
      Motivo: m.motivo,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(ventasRows),
      "Flujo_Ventas_Compras"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(inventarioRows),
      "Inventario_Actual"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(kardexRows),
      "Kardex_Trazabilidad"
    );

    XLSX.writeFile(
      wb,
      `Antapharma_Ventas_e_Inventario_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    setExportStatus("Libro Excel (.XLSX) con 3 hojas contables descargado.");
  }

  // 3. Descargar CSV con PapaParse
  async function handleExportCSV() {
    const Papa = (await import("papaparse")).default;

    const data = productosFiltrados.map((p) => ({
      codigo: p.codigo,
      nombre: p.nombre,
      categoria: p.categoria?.nombre || "General",
      medida: p.medida,
      presentacion: p.presentacion,
      stock_actual: p.stockActual,
      stock_minimo: p.stockMinimo,
      precio_costo: p.precioCosto,
      precio_venta: p.precioVenta,
      valorizado_venta: p.stockActual * p.precioVenta,
    }));

    const csv = Papa.unparse(data, { delimiter: ";" });
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Antapharma_Datos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportStatus("Archivo CSV plano descargado con codificación UTF-8.");
  }

  const resumenCategorias = initialData.categorias.map((c) => {
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
      referencias: items.length,
      unidades,
      valorVenta,
      valorCosto,
      criticos,
    };
  });

  return (
    <ErpShell
      title="Centro de Reportes & Exportación"
      subtitle="Cruce de indicadores de inventario, auditoría y emisión de documentos en PDF, Excel y CSV"
      criticalCount={criticalCount}
    >
      {exportStatus && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-xs text-cyan-200">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
            {exportStatus}
          </span>
          <button
            onClick={() => setExportStatus(null)}
            className="text-white/60 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Panel Principal de Exportación (Los 3 botones requeridos) */}
      <BentoCard glowColor="cyan" className="mb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-0.5 text-[11px] font-semibold text-cyan-300">
              Motor de Exportación Documental
            </span>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-white">
              Emisión Instantánea de Catálogo y Balances
            </h2>
            <p className="mt-1 text-xs text-white/55 max-w-2xl">
              Seleccione una categoría específica o exporte el padrón completo de
              insumos de esterilización médica y asientos financieros.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs font-medium text-white/70">
                Filtrar alcance de catálogo:
              </label>
              <select
                value={catFiltro}
                onChange={(e) => setCatFiltro(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#0d1017] px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
              >
                <option value="ALL">
                  Todas las categorías ({initialData.productos.length} insumos)
                </option>
                {initialData.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleExportCatalogoPDF}
              className="group flex flex-col items-start justify-between rounded-2xl border border-rose-500/35 bg-gradient-to-br from-rose-500/20 via-rose-500/5 to-transparent p-4 text-left transition-all hover:scale-[1.02] hover:border-rose-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Generar Catálogo (PDF)
                </p>
                <p className="mt-0.5 text-[11px] text-white/50">
                  Lista oficial con medidas y PVP
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportVentasXLSX}
              className="group flex flex-col items-start justify-between rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent p-4 text-left transition-all hover:scale-[1.02] hover:border-emerald-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 mb-3">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Exportar Ventas (XLSX)
                </p>
                <p className="mt-0.5 text-[11px] text-white/50">
                  Excel multi-hoja + Kardex
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="group flex flex-col items-start justify-between rounded-2xl border border-cyan-500/35 bg-gradient-to-br from-cyan-500/20 via-cyan-500/5 to-transparent p-4 text-left transition-all hover:scale-[1.02] hover:border-cyan-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 mb-3">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Descargar CSV</p>
                <p className="mt-0.5 text-[11px] text-white/50">
                  Datos planos separados por ;
                </p>
              </div>
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Cruce de Datos con VercelTabs de OpenHero */}
      <BentoCard>
        <VercelTabs
          tabs={[
            {
              value: "categorias",
              label: "Matriz por Categoría de Insumos",
              badge: resumenCategorias.length,
              content: (
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-white/55">
                        <th className="py-3 px-4">Categoría Técnica</th>
                        <th className="py-3 px-4 text-center">Referencias</th>
                        <th className="py-3 px-4 text-center">Unidades Totales</th>
                        <th className="py-3 px-4 text-center">Alertas Críticas</th>
                        <th className="py-3 px-4 text-right">Valor Costo</th>
                        <th className="py-3 px-4 text-right">Valor Venta (PVP)</th>
                        <th className="py-3 px-4 text-right">Utilidad Potencial</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8 text-xs sm:text-sm">
                      {resumenCategorias.map((rc) => (
                        <tr key={rc.id} className="hover:bg-white/[0.02]">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-white">{rc.nombre}</p>
                            <p className="text-xs text-white/45">
                              {rc.descripcion}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-white">
                            {rc.referencias}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-white/80">
                            {rc.unidades} u.
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {rc.criticos > 0 ? (
                              <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-xs font-bold text-rose-300">
                                {rc.criticos} críticos
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-300">
                                0 alertas
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-white/70">
                            {formatARS(rc.valorCosto)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                            {formatARS(rc.valorVenta)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">
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
              label: "Kardex Completo de Movimientos",
              badge: initialData.movimientos.length,
              content: (
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-white/55">
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Insumo</th>
                        <th className="py-3 px-4 text-center">Cantidad</th>
                        <th className="py-3 px-4">Entidad Vinculada</th>
                        <th className="py-3 px-4">Motivo / Lote</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8 text-xs sm:text-sm">
                      {initialData.movimientos.map((m) => (
                        <tr key={m.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 text-xs text-white/60 whitespace-nowrap">
                            {formatDateTimeAR(m.fecha)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                m.tipo === "ENTRADA"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              {m.tipo}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {m.producto?.codigo} — {m.producto?.nombre}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-white">
                            {m.tipo === "ENTRADA" ? "+" : "-"}
                            {m.cantidad} u.
                          </td>
                          <td className="py-3 px-4 text-xs text-white/70">
                            {m.entidad?.nombre || " Ajuste Interno "}
                          </td>
                          <td className="py-3 px-4 text-xs text-white/60">
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
              label: "Registro de Auditoría y Seguridad",
              badge: initialData.logs.length,
              content: (
                <div className="space-y-2.5">
                  {initialData.logs.map((l) => (
                    <div
                      key={l.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-cyan-300 mr-2">
                            [{l.accion}]
                          </span>
                          <span className="text-white/80">{l.detalle}</span>
                        </div>
                      </div>
                      <span className="mt-1 sm:mt-0 text-[11px] text-white/45 font-mono">
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
