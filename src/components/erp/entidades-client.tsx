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
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
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

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoEntidad>("CLIENTE");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [cuit, setCuit] = useState("");
  const [direccion, setDireccion] = useState("");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );

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
        (e.cuit || "").toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [initialData.entidades, tab, search]);

  function openNewModal(defaultTipo: TipoEntidad = "CLIENTE") {
    setEditing(null);
    setNombre("");
    setTipo(defaultTipo);
    setTelefono("+54 381 ");
    setEmail("");
    setCuit("30-");
    setDireccion("");
    setModalOpen(true);
  }

  function openEditModal(e: EntidadDTO) {
    setEditing(e);
    setNombre(e.nombre);
    setTipo(e.tipo);
    setTelefono(e.telefono);
    setEmail(e.email);
    setCuit(e.cuit || "");
    setDireccion(e.direccion || "");
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
      telefono,
      email,
      cuit,
      direccion,
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
        ? `Contacto "${nombre}" actualizado.`
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

  return (
    <ErpShell
      title="Directorio de Clientes & Proveedores"
      subtitle="Gestión comercial de Hospitales, Sanatorios, Centros de Esterilización y Laboratorios Proveedores"
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

      {/* Resumen superior */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <BentoCard glowColor="cyan" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/55">Total Cartera Comercial</p>
              <p className="mt-1 text-2xl font-black text-white">
                {initialData.entidades.length} entidades
              </p>
            </div>
            <Building2 className="h-7 w-7 text-cyan-300" />
          </div>
        </BentoCard>

        <BentoCard glowColor="emerald" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/55">
                Clientes (Hospitales / Clínicas)
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-300">
                {clientesCount} activos
              </p>
            </div>
            <Building2 className="h-7 w-7 text-emerald-300" />
          </div>
        </BentoCard>

        <BentoCard glowColor="indigo" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/55">
                Proveedores e Importadores
              </p>
              <p className="mt-1 text-2xl font-black text-indigo-300">
                {proveedoresCount} laboratorios
              </p>
            </div>
            <Truck className="h-7 w-7 text-indigo-300" />
          </div>
        </BentoCard>
      </div>

      {/* Controles y Filtros */}
      <BentoCard className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "ALL", label: `Todos (${initialData.entidades.length})` },
                { id: "CLIENTE", label: `Clientes (${clientesCount})` },
                { id: "PROVEEDOR", label: `Proveedores (${proveedoresCount})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  tab === t.id
                    ? "bg-white text-slate-950 shadow-md"
                    : "border border-white/10 bg-white/[0.03] text-white/65 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 max-w-md items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar hospital, laboratorio, CUIT o email..."
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={() => openNewModal("CLIENTE")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-50"
            >
              <Plus className="h-4 w-4" />
              Nueva Entidad
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Grid de Tarjetas Bento Comerciales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((ent) => {
          const volumenOperado = initialData.transacciones
            .filter((t) => t.entidadId === ent.id)
            .reduce((acc, t) => acc + Number(t.monto || 0), 0);

          const movimientosAsociados = initialData.movimientos.filter(
            (m) => m.entidadId === ent.id
          ).length;

          return (
            <BentoCard
              key={ent.id}
              glowColor={ent.tipo === "CLIENTE" ? "emerald" : "indigo"}
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        ent.tipo === "CLIENTE"
                          ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
                          : "border-indigo-500/35 bg-indigo-500/15 text-indigo-300"
                      }`}
                    >
                      {ent.tipo === "CLIENTE" ? (
                        <Building2 className="h-3 w-3" />
                      ) : (
                        <Truck className="h-3 w-3" />
                      )}
                      {ent.tipo}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-white">
                      {ent.nombre}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(ent)}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/15 hover:text-white"
                      title="Editar contacto"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ent)}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-300/75 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-200"
                      title="Eliminar contacto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-white/70 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{ent.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{ent.email}</span>
                  </div>
                  {ent.cuit && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-white/40 shrink-0" />
                      <span>CUIT: {ent.cuit}</span>
                    </div>
                  )}
                  {ent.direccion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
                      <span className="truncate">{ent.direccion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/50">
                  Remitos de stock:{" "}
                  <strong className="text-white">{movimientosAsociados}</strong>
                </span>
                <span className="font-mono font-bold text-white">
                  Operado: {formatARS(volumenOperado)}
                </span>
              </div>
            </BentoCard>
          );
        })}
      </div>

      {/* Modal Crear / Editar Entidad */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-glass w-full max-w-lg rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl animate-dialog-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editing
                    ? "Editar Ficha Comercial"
                    : "Registrar Cliente o Proveedor"}
                </h2>
                <p className="text-xs text-white/50">
                  Directorio oficial de Antapharma Distribuidora
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["CLIENTE", "PROVEEDOR"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                      tipo === t
                        ? t === "CLIENTE"
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                          : "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                        : "border-white/10 bg-white/5 text-white/55"
                    }`}
                  >
                    {t === "CLIENTE"
                      ? "CLIENTE (Hospital / Clínica)"
                      : "PROVEEDOR (Laboratorio)"}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Razón Social / Institución
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Hospital Privado de Esterilización"
                  className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Teléfono Directo / Guardia
                  </label>
                  <input
                    type="text"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+54 381 400-0000"
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Correo Electrónico (Compras/Ventas)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="compras@institucion.com.ar"
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    CUIT
                  </label>
                  <input
                    type="text"
                    value={cuit}
                    onChange={(e) => setCuit(e.target.value)}
                    placeholder="30-00000000-0"
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Dirección de Entrega / Depósito
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Av. Sarmiento 850"
                    className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
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
                  {loading ? "Guardando..." : "Guardar Entidad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpShell>
  );
}
