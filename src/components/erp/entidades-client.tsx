"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Percent,
  MessageCircle,
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
import {
  buildMailtoCatalogUrl,
  buildWhatsAppCatalogUrl,
  generarListaPreciosClientePDF,
} from "@/lib/document-generators";
import { LINEAS_OFICIALES } from "@/lib/catalogo-2027-data";
import {
  upsertEntidadAction,
  deleteEntidadAction,
  type ErpSnapshot,
} from "@/app/actions/erp-actions";
import type { EntidadDTO, TipoEntidad } from "@/lib/supabase";
import { formatARS } from "@/lib/utils";

export function EntidadesClient({ initialData }: { initialData: ErpSnapshot }) {
  const router = useRouter();
  const [tab, setTab] = useState<"ALL" | "CLIENTE" | "PROVEEDOR">("ALL");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EntidadDTO | null>(null);

  // Datos comerciales + Markups del Excel (Hoja 3 "Clientes y markups")
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoEntidad>("CLIENTE");
  const [subtipo, setSubtipo] = useState("Sanatorio");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [cuit, setCuit] = useState("");
  const [direccion, setDireccion] = useState("");
  const [condicionPago, setCondicionPago] = useState("Contado");
  const [notas, setNotas] = useState("");

  // Markups en porcentaje (ej. "40" = 0.40)
  const [markupGeneralPct, setMarkupGeneralPct] = useState("40");
  const [mLinea1, setMLinea1] = useState("");
  const [mLinea2, setMLinea2] = useState("");
  const [mLinea3, setMLinea3] = useState("");
  const [mLinea4, setMLinea4] = useState("");
  const [mLinea5, setMLinea5] = useState("");
  const [mLinea6, setMLinea6] = useState("");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

  const criticalCount = initialData.productos.filter(
    (p) => p.stockActual <= p.stockMinimo
  ).length;

  const clientesCount = initialData.entidades.filter(
    (e) => e.tipo === "CLIENTE"
  ).length;
  const proveedoresCount = initialData.entidades.filter(
    (e) => e.tipo === "PROVEEDOR"
  ).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialData.entidades.filter((e) => {
      const matchTab = tab === "ALL" || e.tipo === tab;
      const matchSearch =
        !q ||
        e.nombre.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.telefono.toLowerCase().includes(q) ||
        (e.cuit || "").toLowerCase().includes(q) ||
        (e.subtipo || "").toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [initialData.entidades, tab, search]);

  const toPctStr = (val?: number | null) =>
    typeof val === "number" && !Number.isNaN(val) && val > 0
      ? String(Math.round(val * 10000) / 100)
      : "";

  const fromPctStr = (str: string): number | null => {
    const clean = str.trim();
    if (!clean) return null;
    const num = Number(clean);
    if (Number.isNaN(num) || num <= 0) return null;
    return num / 100;
  };

  function openNewModal(defaultTipo: TipoEntidad = "CLIENTE") {
    setEditing(null);
    setNombre("");
    setTipo(defaultTipo);
    setSubtipo(defaultTipo === "CLIENTE" ? "Sanatorio" : "Laboratorio");
    setTelefono("385 ");
    setEmail("");
    setCuit("30-");
    setDireccion("Santiago del Estero");
    setCondicionPago("Contado");
    setNotas("");
    setMarkupGeneralPct("40");
    setMLinea1("");
    setMLinea2("");
    setMLinea3("");
    setMLinea4("");
    setMLinea5("");
    setMLinea6("");
    setModalOpen(true);
  }

  function openEditModal(e: EntidadDTO) {
    setEditing(e);
    setNombre(e.nombre);
    setTipo(e.tipo);
    setSubtipo(
      e.subtipo || (e.tipo === "CLIENTE" ? "Sanatorio" : "Laboratorio")
    );
    setTelefono(e.telefono);
    setEmail(e.email);
    setCuit(e.cuit || "");
    setDireccion(e.direccion || "");
    setCondicionPago(e.condicionPago || "Contado");
    setNotas(e.notas || "");
    setMarkupGeneralPct(
      String(Math.round((e.markupGeneral ?? 0.4) * 10000) / 100)
    );
    setMLinea1(toPctStr(e.markupLinea1));
    setMLinea2(toPctStr(e.markupLinea2));
    setMLinea3(toPctStr(e.markupLinea3));
    setMLinea4(toPctStr(e.markupLinea4));
    setMLinea5(toPctStr(e.markupLinea5));
    setMLinea6(toPctStr(e.markupLinea6));
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = await upsertEntidadAction({
      id: editing?.id,
      nombre,
      tipo,
      subtipo,
      telefono,
      email,
      cuit,
      direccion,
      condicionPago,
      notas,
      markupGeneral: (Number(markupGeneralPct) || 40) / 100,
      markupLinea1: fromPctStr(mLinea1),
      markupLinea2: fromPctStr(mLinea2),
      markupLinea3: fromPctStr(mLinea3),
      markupLinea4: fromPctStr(mLinea4),
      markupLinea5: fromPctStr(mLinea5),
      markupLinea6: fromPctStr(mLinea6),
    });
    setLoading(false);

    if (!res.ok) {
      setBanner({ type: "err", msg: res.error || "Error al guardar." });
      return;
    }

    setModalOpen(false);
    setBanner({
      type: "ok",
      msg: editing
        ? `Entidad "${nombre}" y sus markups actualizados.`
        : `Nuevo ${tipo.toLowerCase()} "${nombre}" registrado.`,
    });
    router.refresh();
  }

  async function handleDelete(e: EntidadDTO) {
    if (!confirm(`¿Eliminar el registro comercial de "${e.nombre}"?`)) return;
    setLoading(true);
    const res = await deleteEntidadAction(e.id);
    setLoading(false);
    if (res.ok) {
      setBanner({ type: "ok", msg: `Entidad "${e.nombre}" eliminada.` });
      router.refresh();
    } else {
      setBanner({ type: "err", msg: res.error || "No se pudo eliminar." });
    }
  }

  async function handleExportarListaPDF(cliente: EntidadDTO) {
    await generarListaPreciosClientePDF({
      productos: initialData.productos,
      cliente,
      parametros: initialData.parametros,
      download: true,
    });
    setBanner({
      type: "ok",
      msg: `Lista de Precios PDF emitida para "${cliente.nombre}".`,
    });
  }

  return (
    <ErpShell
      title="Clientes, Markups por Línea & Proveedores"
      subtitle="Configuración de markup general y diferencial por línea para cada cliente (Sanatorios, Clínicas y Estado)"
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

      {/* Resumen superior */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <BentoCard glowColor="quirofano" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#DCEBE8]/70">
                Públicos y Cartera Activa
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-white">
                {initialData.entidades.length} entidades
              </p>
            </div>
            <Building2 className="h-7 w-7 text-[#B9673A]" />
          </div>
        </BentoCard>

        <BentoCard glowColor="cobre" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#DCEBE8]/70">
                Clientes con Lista Propia
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-white">
                {clientesCount} clientes
              </p>
            </div>
            <Percent className="h-7 w-7 text-[#B9673A]" />
          </div>
        </BentoCard>

        <BentoCard glowColor="indigo" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#DCEBE8]/70">
                Proveedores y Fabricantes
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-white">
                {proveedoresCount} laboratorios
              </p>
            </div>
            <Truck className="h-7 w-7 text-[#1E7F7A]" />
          </div>
        </BentoCard>
      </div>

      {/* Controles y Filtros */}
      <BentoCard className="mb-6">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "ALL", label: `Todos (${initialData.entidades.length})` },
                {
                  id: "CLIENTE",
                  label: `Clientes & Markups (${clientesCount})`,
                },
                { id: "PROVEEDOR", label: `Proveedores (${proveedoresCount})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                  tab === t.id
                    ? "bg-[#B9673A] text-white shadow"
                    : "border border-[#DCEBE8]/15 bg-[#1D2527]/40 text-[#DCEBE8]/75 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DCEBE8]/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar sanatorio, hospital, consultorio o proveedor..."
                className="input-gasa w-full rounded-lg pl-10 pr-4 py-2 text-xs outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => openNewModal("CLIENTE")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#B9673A] px-4 py-2 text-xs font-bold text-white hover:bg-[#B9673A]/90"
            >
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Grid de Tarjetas Comerciales con Markups por Línea */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((ent) => {
          const volumenOperado = initialData.transacciones
            .filter((t) => t.entidadId === ent.id)
            .reduce((acc, t) => acc + Number(t.monto || 0), 0);

          const movimientosAsociados = initialData.movimientos.filter(
            (m) => m.entidadId === ent.id
          ).length;

          const markupsLineas = [
            { num: "01", label: "Descartables", val: ent.markupLinea1 },
            { num: "02", label: "Empaque", val: ent.markupLinea2 },
            { num: "03", label: "Control", val: ent.markupLinea3 },
            { num: "04", label: "Óxido Etileno", val: ent.markupLinea4 },
            { num: "05", label: "Limpieza", val: ent.markupLinea5 },
            { num: "06", label: "Equipamiento", val: ent.markupLinea6 },
          ].filter((m) => typeof m.val === "number" && m.val > 0);

          return (
            <BentoCard
              key={ent.id}
              glowColor={ent.tipo === "CLIENTE" ? "quirofano" : "indigo"}
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          ent.tipo === "CLIENTE"
                            ? "border-[#1E7F7A] bg-[#1E7F7A]/25 text-[#DCEBE8]"
                            : "border-[#2E6E9E] bg-[#2E6E9E]/25 text-[#DCEBE8]"
                        }`}
                      >
                        {ent.tipo === "CLIENTE" ? (
                          <Building2 className="h-3 w-3 text-[#B9673A]" />
                        ) : (
                          <Truck className="h-3 w-3" />
                        )}
                        {ent.tipo} · {ent.subtipo || "General"}
                      </span>

                      {ent.tipo === "CLIENTE" && (
                        <span className="rounded-full bg-[#B9673A] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                          Markup Gral:{" "}
                          {Math.round((ent.markupGeneral ?? 0.4) * 100)}%
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 font-display text-base sm:text-lg font-bold text-white">
                      {ent.nombre}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(ent)}
                      className="rounded-lg border border-[#DCEBE8]/20 bg-white/5 p-2 text-[#DCEBE8] hover:bg-white/15 hover:text-white"
                      title="Editar contacto y markups"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ent)}
                      className="rounded-lg border border-[#8C3B4A]/40 bg-[#8C3B4A]/20 p-2 text-white/80 hover:bg-[#8C3B4A]/40"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Markups Diferenciales por Línea (si tiene) */}
                {ent.tipo === "CLIENTE" && (
                  <div className="mt-3 rounded-lg border border-[#DCEBE8]/12 bg-[#1D2527]/50 p-2.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase text-[#DCEBE8]/70">
                        Condición:{" "}
                        <strong className="text-white">
                          {ent.condicionPago || "Contado"}
                        </strong>
                      </span>
                      {markupsLineas.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {markupsLineas.map((ml) => (
                            <span
                              key={ml.num}
                              className="rounded bg-[#1E7F7A]/40 border border-[#1E7F7A] px-2 py-0.5 font-mono text-[10px] text-white"
                            >
                              L{ml.num} {ml.label}:{" "}
                              {Math.round((ml.val || 0) * 100)}%
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] text-[#DCEBE8]/60">
                          Usa markup general en las 6 líneas
                        </span>
                      )}
                    </div>
                    {ent.notas && (
                      <p className="mt-1.5 text-[11px] text-[#DCEBE8]/75">
                        {ent.notas}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-3.5 grid grid-cols-1 gap-2 text-xs text-[#DCEBE8]/80 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#B9673A] shrink-0" />
                    <span className="font-mono truncate">{ent.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#B9673A] shrink-0" />
                    <span className="truncate">{ent.email}</span>
                  </div>
                  {ent.cuit && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#DCEBE8]/50 shrink-0" />
                      <span className="font-mono">CUIT: {ent.cuit}</span>
                    </div>
                  )}
                  {ent.direccion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#DCEBE8]/50 shrink-0" />
                      <span className="truncate">{ent.direccion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCEBE8]/12 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-[#DCEBE8]/65">
                  Remitos: <strong className="text-white">{movimientosAsociados}</strong>{" "}
                  · Operado:{" "}
                  <strong className="font-mono text-white">
                    {formatARS(volumenOperado)}
                  </strong>
                </div>

                {ent.tipo === "CLIENTE" && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleExportarListaPDF(ent)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#F6F3EE] px-2.5 py-1.5 text-[11px] font-bold text-[#0F3A40] hover:bg-white"
                      title="Descargar Lista de Precios PDF para este cliente"
                    >
                      <FileText className="h-3 w-3 text-[#B9673A]" />
                      Lista PDF
                    </button>
                    <a
                      href={buildWhatsAppCatalogUrl({
                        telefonoDestino: ent.telefono,
                        nombreCliente: ent.nombre,
                        incluirListaPrecios: true,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#1E7F7A] px-2.5 py-1.5 text-[11px] font-bold text-white"
                      title="Enviar por WhatsApp"
                    >
                      <MessageCircle className="h-3 w-3" />
                      WA
                    </a>
                    <a
                      href={buildMailtoCatalogUrl({
                        emailDestino: ent.email,
                        nombreCliente: ent.nombre,
                        incluirListaPrecios: true,
                      })}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#B9673A] px-2.5 py-1.5 text-[11px] font-bold text-white"
                      title="Enviar por Mail"
                    >
                      <Mail className="h-3 w-3" />
                      Mail
                    </a>
                  </div>
                )}
              </div>
            </BentoCard>
          );
        })}
      </div>

      {/* MODAL CREAR / EDITAR CLIENTE CON MARKUPS POR LÍNEA (Hoja 3 del Excel) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-2xl rounded-2xl border border-[#DCEBE8]/20 p-5 sm:p-7 shadow-2xl animate-dialog-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCEBE8]/15 pb-3.5">
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  {editing
                    ? `Editar ${editing.nombre}`
                    : "Registrar Cliente o Proveedor"}
                </h2>
                <p className="text-xs text-[#DCEBE8]/70">
                  Datos de contacto y configuración de markups por línea de
                  catálogo
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#DCEBE8]/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["CLIENTE", "PROVEEDOR"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`rounded-lg border py-2.5 text-xs font-bold transition-all ${
                      tipo === t
                        ? t === "CLIENTE"
                          ? "border-[#B9673A] bg-[#B9673A] text-white"
                          : "border-[#1E7F7A] bg-[#1E7F7A] text-white"
                        : "border-[#DCEBE8]/15 bg-[#1D2527]/50 text-[#DCEBE8]/70"
                    }`}
                  >
                    {t === "CLIENTE"
                      ? "CLIENTE (Sanatorio / Consultorio / Estado)"
                      : "PROVEEDOR (Fabricante / Importador)"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Nombre / Razón Social
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Sanatorio — Central de esterilización"
                    className="input-gasa w-full rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Tipo / Segmento
                  </label>
                  <input
                    type="text"
                    value={subtipo}
                    onChange={(e) => setSubtipo(e.target.value)}
                    placeholder="Sanatorio / Consultorio"
                    className="input-gasa w-full rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Configuración de Markups del Cliente (Hoja 3 del Excel) */}
              {tipo === "CLIENTE" && (
                <div className="rounded-xl border border-[#B9673A]/45 bg-[#1D2527]/55 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#B9673A]">
                      MARKUPS DEL CLIENTE (SOBRE COSTO)
                    </span>
                    <span className="text-[11px] text-[#DCEBE8]/70">
                      Si una línea queda vacía, usa el Markup General
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase text-white font-bold">
                        Markup General (%) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={markupGeneralPct}
                        onChange={(e) => setMarkupGeneralPct(e.target.value)}
                        className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                        Condición de Pago
                      </label>
                      <input
                        type="text"
                        value={condicionPago}
                        onChange={(e) => setCondicionPago(e.target.value)}
                        placeholder="Contado / 30 días"
                        className="input-gasa w-full rounded-lg px-3 py-2 text-xs outline-none"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                        Notas internas
                      </label>
                      <input
                        type="text"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder="Ej. Entrega semanal"
                        className="input-gasa w-full rounded-lg px-3 py-2 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <p className="mb-2 font-mono text-[10px] uppercase text-[#DCEBE8]/75">
                      Markup diferencial por línea (opcional — %):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        {
                          linea: LINEAS_OFICIALES[0],
                          val: mLinea1,
                          set: setMLinea1,
                        },
                        {
                          linea: LINEAS_OFICIALES[1],
                          val: mLinea2,
                          set: setMLinea2,
                        },
                        {
                          linea: LINEAS_OFICIALES[2],
                          val: mLinea3,
                          set: setMLinea3,
                        },
                        {
                          linea: LINEAS_OFICIALES[3],
                          val: mLinea4,
                          set: setMLinea4,
                        },
                        {
                          linea: LINEAS_OFICIALES[4],
                          val: mLinea5,
                          set: setMLinea5,
                        },
                        {
                          linea: LINEAS_OFICIALES[5],
                          val: mLinea6,
                          set: setMLinea6,
                        },
                      ].map(({ linea, val, set }) => (
                        <div key={linea.numero}>
                          <label className="mb-1 flex items-center gap-1.5 text-[11px] text-[#DCEBE8]">
                            <span
                              style={{ backgroundColor: linea.colorHex }}
                              className="h-2 w-2 rounded-full"
                            />
                            <span className="truncate">
                              0{linea.numero} · {linea.nombre}
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            placeholder={`Gral (${markupGeneralPct}%)`}
                            className="input-gasa w-full rounded-lg px-2.5 py-1.5 font-mono text-xs outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="385 420-9044"
                    className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="compras@sanatorio.com.ar"
                    className="input-gasa w-full rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    CUIT
                  </label>
                  <input
                    type="text"
                    value={cuit}
                    onChange={(e) => setCuit(e.target.value)}
                    placeholder="30-00000000-0"
                    className="input-gasa w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-[#DCEBE8]/80">
                    Dirección de Entrega
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Santiago del Estero"
                    className="input-gasa w-full rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
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
                  {loading ? "Guardando..." : "Guardar Ficha Comercial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpShell>
  );
}
