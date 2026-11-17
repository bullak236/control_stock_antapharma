"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  Mail,
  MessageCircle,
  Share2,
  Eye,
  X,
  CheckCircle2,
  Search,
  Copy,
  FileText,
  ExternalLink,
} from "lucide-react";
import type {
  EntidadDTO,
  ParametrosErpDTO,
  ProductoDTO,
} from "@/lib/supabase";
import {
  BRAND_CONTACT,
  LINEAS_OFICIALES,
} from "@/lib/catalogo-2027-data";
import {
  AntapharmaLogo,
  BrandFamilyIcon,
  FranjaTestigo,
  PuntoTestigoPill,
} from "@/components/brand/antapharma-brand";
import {
  buildGmailComposeCatalogUrl,
  buildMailtoCatalogUrl,
  buildWhatsAppCatalogUrl,
  generarCatalogo2027PDF,
  generarListaPreciosClientePDF,
} from "@/lib/document-generators";

interface CatalogoShareHubProps {
  productos: ProductoDTO[];
  entidades: EntidadDTO[];
  parametros: ParametrosErpDTO;
}

export function CatalogoShareHub({
  productos,
  entidades,
  parametros,
}: CatalogoShareHubProps) {
  const clientes = useMemo(
    () => entidades.filter((e) => e.tipo === "CLIENTE"),
    [entidades]
  );

  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [customPhone, setCustomPhone] = useState<string>("");
  const [customEmail, setCustomEmail] = useState<string>("");
  const [modoEnvio, setModoEnvio] = useState<"CATALOGO" | "LISTA_CLIENTE">(
    "CATALOGO"
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeLinea, setActiveLinea] = useState<number>(1);
  const [searchCat, setSearchCat] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const clienteObj = useMemo(
    () => clientes.find((c) => c.id === selectedClientId) || null,
    [clientes, selectedClientId]
  );

  const targetPhone = customPhone.trim() || clienteObj?.telefono || "";
  const targetEmail =
    customEmail.trim() || clienteObj?.email || BRAND_CONTACT.email;
  const targetName = clienteObj?.nombre || "";

  async function handleDownloadCatalogo() {
    setBusy(true);
    try {
      if (modoEnvio === "LISTA_CLIENTE") {
        await generarListaPreciosClientePDF({
          productos,
          cliente: clienteObj,
          parametros,
          download: true,
        });
        setToast(
          `Lista de precios PDF (${
            clienteObj?.nombre || "General"
          }) descargada sin costos.`
        );
      } else {
        await generarCatalogo2027PDF(productos, { download: true });
        setToast("Catálogo Oficial de Productos 2027 (PDF) descargado.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleShareWhatsApp() {
    setBusy(true);
    try {
      // Descargar el PDF para que lo tenga listo para adjuntar en el chat
      const pdfRes =
        modoEnvio === "LISTA_CLIENTE"
          ? await generarListaPreciosClientePDF({
              productos,
              cliente: clienteObj,
              parametros,
              download: true,
            })
          : await generarCatalogo2027PDF(productos, { download: true });

      // Si está en teléfono móvil con soporte nativo de compartir archivos, ofrecer Web Share API
      if (typeof navigator !== "undefined" && navigator.canShare) {
        const file = new File([pdfRes.blob], pdfRes.fileName, {
          type: "application/pdf",
        });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title:
                modoEnvio === "LISTA_CLIENTE"
                  ? "Antapharma — Lista de Precios"
                  : "Antapharma — Catálogo 2027",
              text: `Catálogo oficial de productos Antapharma (${BRAND_CONTACT.email} · ${BRAND_CONTACT.telefono})`,
              files: [file],
            });
            setToast("Documento compartido directamente desde el teléfono.");
            return;
          } catch {
            // Si el usuario cancela el share nativo, abrir enlace de WhatsApp
          }
        }
      }

      const url = buildWhatsAppCatalogUrl({
        telefonoDestino: targetPhone,
        nombreCliente: targetName,
        incluirListaPrecios: modoEnvio === "LISTA_CLIENTE",
      });
      window.open(url, "_blank", "noopener,noreferrer");
      setToast(
        "PDF descargado y conversación de WhatsApp lista para adjuntar y enviar."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleShareEmail(useGmailWeb = false) {
    setBusy(true);
    try {
      if (modoEnvio === "LISTA_CLIENTE") {
        await generarListaPreciosClientePDF({
          productos,
          cliente: clienteObj,
          parametros,
          download: true,
        });
      } else {
        await generarCatalogo2027PDF(productos, { download: true });
      }

      if (useGmailWeb) {
        const gmailUrl = buildGmailComposeCatalogUrl({
          emailDestino: targetEmail,
          nombreCliente: targetName,
          incluirListaPrecios: modoEnvio === "LISTA_CLIENTE",
        });
        window.open(gmailUrl, "_blank", "noopener,noreferrer");
      } else {
        const mailtoUrl = buildMailtoCatalogUrl({
          emailDestino: targetEmail,
          nombreCliente: targetName,
          incluirListaPrecios: modoEnvio === "LISTA_CLIENTE",
        });
        window.location.href = mailtoUrl;
      }

      setToast(
        `PDF descargado y correo preparado con ${BRAND_CONTACT.email} para enviar a ${targetEmail}.`
      );
    } finally {
      setBusy(false);
    }
  }

  function handleCopyEmailInfo() {
    navigator.clipboard?.writeText(BRAND_CONTACT.email);
    setToast(`Correo oficial ${BRAND_CONTACT.email} copiado al portapapeles.`);
  }

  const prodsLineaActiva = useMemo(() => {
    const q = searchCat.trim().toLowerCase();
    return [...productos]
      .filter((p) => {
        if (q) {
          return (
            p.codigo.toLowerCase().includes(q) ||
            p.nombre.toLowerCase().includes(q) ||
            (p.familia || p.medida || "").toLowerCase().includes(q)
          );
        }
        return (p.categoria?.numeroLinea || 1) === activeLinea;
      })
      .sort((a, b) => (a.ordenCatalogo || 999) - (b.ordenCatalogo || 999));
  }, [productos, activeLinea, searchCat]);

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-[#1E7F7A]/40 bg-[#0F3A40] text-white shadow-xl">
        {/* Franja Testigo oficial en el borde derecho (Manual Pág. 15) */}
        <FranjaTestigo
          variant="cobre-petroleo"
          className="absolute right-0 top-0 bottom-0 w-3 sm:w-4"
        />

        <div className="p-5 sm:p-6 pr-6 sm:pr-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <PuntoTestigoPill
                  label="Catálogo Oficial 2027"
                  sublabel="6 Líneas · 154 Presentaciones"
                  tone="dark"
                />
                <button
                  type="button"
                  onClick={handleCopyEmailInfo}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DCEBE8]/25 bg-white/5 px-3 py-1 font-mono text-[11px] text-[#DCEBE8] hover:bg-white/10"
                  title="Copiar correo oficial"
                >
                  <Mail className="h-3 w-3 text-[#B9673A]" />
                  <span>{BRAND_CONTACT.email}</span>
                  <Copy className="h-2.5 w-2.5 opacity-60" />
                </button>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                Catálogo de productos 2027 y Lista de Precios por Cliente
              </h2>
              <p className="text-xs sm:text-sm text-[#DCEBE8]/85 leading-relaxed">
                Compartí el catálogo institucional (sin precios, apto WhatsApp e
                impresión) o emití la lista vigente calculada para un cliente
                específico por <strong>WhatsApp</strong> o por correo desde{" "}
                <strong className="font-mono text-white">
                  {BRAND_CONTACT.email}
                </strong>
                .
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#DCEBE8]/30 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
              >
                <Eye className="h-4 w-4 text-[#B9673A]" />
                Ver Catálogo 2027
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={handleDownloadCatalogo}
                className="inline-flex items-center gap-2 rounded-lg bg-[#F6F3EE] px-4 py-2.5 text-xs font-bold text-[#0F3A40] transition-colors hover:bg-white disabled:opacity-50"
              >
                <Download className="h-4 w-4 text-[#B9673A]" />
                {modoEnvio === "LISTA_CLIENTE"
                  ? "Descargar Lista PDF"
                  : "Descargar Catálogo PDF"}
              </button>
            </div>
          </div>

          {/* Controles rápidos de destinatario y canal de envío */}
          <div className="mt-5 pt-5 border-t border-white/12 grid grid-cols-1 gap-4 lg:grid-cols-12 items-end">
            {/* Selector de qué documento enviar */}
            <div className="lg:col-span-3">
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/75">
                Documento a compartir
              </label>
              <div className="grid grid-cols-2 rounded-lg border border-white/15 bg-[#1D2527]/50 p-1">
                <button
                  type="button"
                  onClick={() => setModoEnvio("CATALOGO")}
                  className={`rounded-md py-1.5 px-2 text-xs font-semibold transition-all ${
                    modoEnvio === "CATALOGO"
                      ? "bg-[#B9673A] text-white shadow"
                      : "text-[#DCEBE8]/75 hover:text-white"
                  }`}
                >
                  Catálogo 2027
                </button>
                <button
                  type="button"
                  onClick={() => setModoEnvio("LISTA_CLIENTE")}
                  className={`rounded-md py-1.5 px-2 text-xs font-semibold transition-all ${
                    modoEnvio === "LISTA_CLIENTE"
                      ? "bg-[#1E7F7A] text-white shadow"
                      : "text-[#DCEBE8]/75 hover:text-white"
                  }`}
                >
                  Lista Cliente
                </button>
              </div>
            </div>

            {/* Selector de cliente del directorio */}
            <div className="lg:col-span-3">
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/75">
                Cliente destinatario (opcional)
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedClientId(id);
                  const found = clientes.find((c) => c.id === id);
                  if (found) {
                    setCustomPhone(found.telefono || "");
                    setCustomEmail(found.email || "");
                  }
                }}
                className="w-full rounded-lg border border-white/20 bg-[#1D2527]/70 px-3 py-2 text-xs text-white outline-none focus:border-[#B9673A]"
              >
                <option value="">— Seleccionar cliente o libre —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({Math.round((c.markupGeneral ?? 0.4) * 100)}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Teléfono / Email rápidos */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/75">
                  WhatsApp destino
                </label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Ej. 385 420-9044"
                  className="w-full rounded-lg border border-white/20 bg-[#1D2527]/70 px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-[#B9673A]"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[#DCEBE8]/75">
                  Correo destino
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="cliente@sanatorio.com"
                  className="w-full rounded-lg border border-white/20 bg-[#1D2527]/70 px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-[#B9673A]"
                />
              </div>
            </div>

            {/* Botones de Compartir por WhatsApp y Mail */}
            <div className="lg:col-span-3 flex flex-wrap sm:flex-nowrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={handleShareWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E7F7A] px-3.5 py-2.5 text-xs font-bold text-white shadow transition-all hover:bg-[#1E7F7A]/90 disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => handleShareEmail(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#B9673A] px-3.5 py-2.5 text-xs font-bold text-white shadow transition-all hover:bg-[#B9673A]/90 disabled:opacity-50"
                title={`Enviar por correo (${BRAND_CONTACT.email})`}
              >
                <Mail className="h-4 w-4" />
                <span>Enviar Mail</span>
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => handleShareEmail(true)}
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 p-2.5 text-xs font-semibold text-white hover:bg-white/20"
                title={`Abrir en Gmail Web (${BRAND_CONTACT.email})`}
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>

          {toast && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-[#DCEBE8]/30 bg-[#1D2527]/70 px-3.5 py-2 text-xs text-[#DCEBE8]">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#B9673A] shrink-0" />
                {toast}
              </span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL INTERACTIVO DEL CATÁLOGO OFICIAL 2027 */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-xl border border-[#6B7A7D]/40 bg-[#F6F3EE] text-[#1D2527] shadow-2xl">
            {/* Cabecera del Catálogo en Petróleo */}
            <div className="relative flex flex-wrap items-center justify-between gap-4 bg-[#0F3A40] px-5 py-4 text-white">
              <FranjaTestigo
                variant="cobre-petroleo"
                className="absolute right-0 top-0 bottom-0 w-3"
              />
              <div className="flex items-center gap-4">
                <AntapharmaLogo
                  variant="negative"
                  size="sm"
                  showDescriptor={true}
                />
                <div className="hidden sm:block h-7 w-px bg-white/20" />
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#DCEBE8]">
                    EDICIÓN 2027 · 6 LÍNEAS · 154 PRESENTACIONES
                  </span>
                  <p className="text-xs text-[#DCEBE8]/80">
                    Descartables primero · Códigos propios en IBM Plex Mono ·
                    Sin precios
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pr-3">
                <button
                  type="button"
                  onClick={handleDownloadCatalogo}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#B9673A] px-3 py-2 text-xs font-bold text-white hover:bg-[#B9673A]/90"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E7F7A] px-3 py-2 text-xs font-bold text-white hover:bg-[#1E7F7A]/90"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="rounded-lg border border-white/20 p-2 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Navegador de las 6 Líneas Oficiales (con sus colores asignados Pág. 13) */}
            <div className="border-b border-[#6B7A7D]/25 bg-white px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scroll">
                  {LINEAS_OFICIALES.map((l) => {
                    const active = activeLinea === l.numero && !searchCat;
                    return (
                      <button
                        key={l.numero}
                        type="button"
                        onClick={() => {
                          setActiveLinea(l.numero);
                          setSearchCat("");
                        }}
                        style={{
                          backgroundColor: active ? l.colorHex : "transparent",
                          borderColor: l.colorHex,
                          color: active ? "#FFFFFF" : "#0F3A40",
                        }}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all"
                      >
                        <span className="font-mono text-[10px] opacity-85">
                          {l.codigoLinea}
                        </span>
                        <span>{l.nombre}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7A7D]" />
                  <input
                    type="text"
                    value={searchCat}
                    onChange={(e) => setSearchCat(e.target.value)}
                    placeholder="Buscar código (ej. PT-150, BT20)..."
                    className="w-full rounded-lg border border-[#6B7A7D]/35 bg-[#F6F3EE] pl-8 pr-3 py-1.5 text-xs text-[#1D2527] placeholder-[#6B7A7D] outline-none focus:border-[#0F3A40]"
                  />
                </div>
              </div>
            </div>

            {/* Cuerpo de página de catálogo (Estilo editorial Gasa #F6F3EE) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {!searchCat &&
                (() => {
                  const lineaInfo =
                    LINEAS_OFICIALES.find((l) => l.numero === activeLinea) ||
                    LINEAS_OFICIALES[0];
                  return (
                    <div
                      style={{ backgroundColor: lineaInfo.colorHex }}
                      className="flex items-center justify-between rounded-xl p-5 text-white shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-display text-3xl sm:text-4xl font-bold opacity-95">
                          {lineaInfo.codigoLinea}
                        </span>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest opacity-85">
                            LÍNEA {lineaInfo.codigoLinea} ·{" "}
                            {prodsLineaActiva.length} PRODUCTOS
                          </p>
                          <h3 className="font-display text-lg sm:text-xl font-bold">
                            {lineaInfo.nombre}
                          </h3>
                          <p className="text-xs opacity-90 mt-0.5">
                            {lineaInfo.descripcion}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                        <BrandFamilyIcon
                          familia={lineaInfo.nombre}
                          className="h-7 w-7 text-white"
                        />
                      </div>
                    </div>
                  );
                })()}

              {/* Tabla de productos estilo Catálogo 2027 */}
              <div className="rounded-xl border border-[#6B7A7D]/25 bg-white overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#6B7A7D]/25 bg-[#DCEBE8]/50 font-mono text-[10px] uppercase tracking-wider text-[#0F3A40]">
                      <th className="py-2.5 px-4">Código</th>
                      <th className="py-2.5 px-4">Familia</th>
                      <th className="py-2.5 px-4">Producto</th>
                      <th className="py-2.5 px-4 text-right">Presentación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#6B7A7D]/20 text-xs">
                    {prodsLineaActiva.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#F6F3EE]/70 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-[#B9673A] whitespace-nowrap">
                          {item.codigo}
                        </td>
                        <td className="py-2.5 px-4 text-[#6B7A7D]">
                          <span className="inline-flex items-center gap-1.5">
                            <BrandFamilyIcon
                              familia={item.familia || item.medida}
                              className="h-3.5 w-3.5 text-[#0F3A40]"
                            />
                            <span>{item.familia || item.medida}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-[#1D2527]">
                          {item.nombre}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-[#6B7A7D] whitespace-nowrap">
                          {item.presentacion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pie fijo oficial del catálogo */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#6B7A7D]/25 bg-white px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-[#6B7A7D]">
              <span>
                ANTAPHARMA · CATÁLOGO 2027 · {BRAND_CONTACT.telefono} ·{" "}
                {BRAND_CONTACT.email}
              </span>
              <span className="font-bold text-[#0F3A40]">
                Cuidamos lo que cuida.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
