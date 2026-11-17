"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE_NAME,
  signPayloadEdge,
  verifyTokenEdge,
  type SessionPayload,
} from "@/lib/auth";
import {
  getSupabaseServerClient,
  type CategoriaDTO,
  type EntidadDTO,
  type LogAuditoriaDTO,
  type MovimientoStockDTO,
  type ParametrosErpDTO,
  type ProductoDTO,
  type TipoEntidad,
  type TipoMovimiento,
  type TipoTransaccion,
  type TransaccionFinancieraDTO,
} from "@/lib/supabase";
import { DEFAULT_PARAMETROS } from "@/lib/pricing";
import {
  CATALOGO_2027_ITEMS,
  LINEAS_OFICIALES,
} from "@/lib/catalogo-2027-data";

const DAVID_DEFAULT_ID = "11111111-1111-4111-8111-111111111111";

async function requireServerSession(): Promise<SessionPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyTokenEdge(token);
  if (!session) {
    throw new Error("NO_AUTORIZADO: Sesión privada requerida.");
  }
  return session;
}

async function logAudit(
  accion: string,
  detalle: string,
  usuarioId = DAVID_DEFAULT_ID
) {
  try {
    const supabase = getSupabaseServerClient();
    await supabase.from("erp_logs_auditoria").insert({
      accion,
      detalle,
      usuarioId,
      fecha: new Date().toISOString(),
    });
  } catch {
    // Non-blocking audit logging
  }
}

export async function loginAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return {
      ok: false,
      error: "Ingrese correo electrónico y clave de acceso.",
    };
  }

  const supabase = getSupabaseServerClient();
  const { data: user } = await supabase
    .from("erp_usuarios")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  const validEmail =
    email === "david@antapharma.com" ||
    email === "antapharma@gmail.com" ||
    email === "admin@antapharma.com" ||
    Boolean(user);

  const validPass =
    password === "Antapharma2026!" ||
    password === "david2026" ||
    (user &&
      (user.password_hash === `sha256:${password}` ||
        user.password_hash === password));

  if (!validEmail || !validPass) {
    return {
      ok: false,
      error:
        "Credenciales inválidas. Acceso restringido a Dirección Comercial (Antapharma).",
    };
  }

  const payload: SessionPayload = {
    userId: user?.id || DAVID_DEFAULT_ID,
    email: user?.email || "antapharma@gmail.com",
    nombre: user?.nombre || "David E. Bulacio Pereyra",
    rol: user?.rol || "OWNER",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };

  const token = await signPayloadEdge(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  await logAudit(
    "INICIO_SESION",
    `Sesión iniciada por ${payload.email} en Antapharma ERP`,
    payload.userId
  );

  return { ok: true };
}

export async function logoutAction(): Promise<{ ok: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { ok: true };
}

export interface ErpSnapshot {
  parametros: ParametrosErpDTO;
  categorias: CategoriaDTO[];
  productos: ProductoDTO[];
  entidades: EntidadDTO[];
  movimientos: MovimientoStockDTO[];
  transacciones: TransaccionFinancieraDTO[];
  logs: LogAuditoriaDTO[];
  usuarioActual: {
    nombre: string;
    email: string;
    rol: string;
  };
}

export async function getErpSnapshotAction(): Promise<ErpSnapshot> {
  const cookieStore = await cookies();
  const session = await verifyTokenEdge(
    cookieStore.get(SESSION_COOKIE_NAME)?.value
  );

  const supabase = getSupabaseServerClient();

  const [paramRes, catRes, prodRes, entRes, movRes, txRes, logRes] =
    await Promise.all([
      supabase
        .from("erp_parametros")
        .select("*")
        .eq("id", "default")
        .maybeSingle(),
      supabase
        .from("erp_categorias")
        .select("*")
        .order("numeroLinea", { ascending: true }),
      supabase
        .from("erp_productos")
        .select("*")
        .order("ordenCatalogo", { ascending: true })
        .order("codigo", { ascending: true }),
      supabase.from("erp_entidades").select("*").order("nombre"),
      supabase
        .from("erp_movimientos_stock")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(100),
      supabase
        .from("erp_transacciones_financieras")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(100),
      supabase
        .from("erp_logs_auditoria")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(40),
    ]);

  const parametros: ParametrosErpDTO = paramRes.data
    ? {
        ...DEFAULT_PARAMETROS,
        ...paramRes.data,
      }
    : DEFAULT_PARAMETROS;

  const categorias = (catRes.data || []) as CategoriaDTO[];
  const catMap = new Map(categorias.map((c) => [c.id, c]));

  const productos = ((prodRes.data || []) as ProductoDTO[]).map((p) => ({
    ...p,
    familia: p.familia || p.medida || "General",
    incluirEnLista: p.incluirEnLista !== false,
    categoria: catMap.get(p.categoriaId) || null,
  }));
  const prodMap = new Map(productos.map((p) => [p.id, p]));

  const entidades = ((entRes.data || []) as EntidadDTO[]).map((e) => ({
    ...e,
    markupGeneral:
      typeof e.markupGeneral === "number" ? e.markupGeneral : 0.4,
    condicionPago: e.condicionPago || "Contado",
  }));
  const entMap = new Map(entidades.map((e) => [e.id, e]));

  const movimientos = ((movRes.data || []) as MovimientoStockDTO[]).map(
    (m) => ({
      ...m,
      producto: prodMap.get(m.productoId) || null,
      entidad: m.entidadId ? entMap.get(m.entidadId) || null : null,
    })
  );

  const transacciones = (
    (txRes.data || []) as TransaccionFinancieraDTO[]
  ).map((t) => ({
    ...t,
    entidad: t.entidadId ? entMap.get(t.entidadId) || null : null,
  }));

  const logs = (logRes.data || []) as LogAuditoriaDTO[];

  return {
    parametros,
    categorias,
    productos,
    entidades,
    movimientos,
    transacciones,
    logs,
    usuarioActual: {
      nombre: session?.nombre || "David E. Bulacio Pereyra",
      email: session?.email || "antapharma@gmail.com",
      rol: session?.rol || "OWNER",
    },
  };
}

export async function updateParametrosErpAction(input: {
  ivaGeneral: number;
  gastosGenerales: number;
  redondeoMultiplo: number;
  vigenciaDesde: string;
  condiciones: string;
  contacto: string;
  notasCatalogo: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireServerSession();
    const supabase = getSupabaseServerClient();

    const payload = {
      id: "default",
      ivaGeneral: Math.max(0, Number(input.ivaGeneral) || 0.21),
      gastosGenerales: Math.max(0, Number(input.gastosGenerales) || 0),
      redondeoMultiplo: Math.max(0.01, Number(input.redondeoMultiplo) || 10),
      vigenciaDesde: input.vigenciaDesde.trim() || "2026-11-10",
      condiciones:
        input.condiciones.trim() ||
        "Precios en pesos argentinos. Sujetos a modificación sin previo aviso.",
      contacto:
        input.contacto.trim() ||
        "antapharma@gmail.com · 385 420-9044 · San Ramón Nonato 5947, Santiago del Estero",
      notasCatalogo: input.notasCatalogo.trim(),
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("erp_parametros")
      .upsert(payload, { onConflict: "id" });

    if (error) return { ok: false, error: error.message };

    await logAudit(
      "PARAMETROS_ACTUALIZADOS",
      `Parámetros de lista actualizados: IVA ${Math.round(
        payload.ivaGeneral * 100
      )}% · Gastos ${Math.round(
        payload.gastosGenerales * 100
      )}% · Redondeo $${payload.redondeoMultiplo} · Vigencia ${
        payload.vigenciaDesde
      }`,
      session.userId
    );

    revalidatePath("/dashboard");
    revalidatePath("/productos");
    revalidatePath("/entidades");
    revalidatePath("/reportes");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Error al guardar parámetros",
    };
  }
}

export async function upsertProductoAction(input: {
  id?: string;
  codigo: string;
  nombre: string;
  medida: string;
  familia?: string;
  presentacion: string;
  stockActual: number;
  stockMinimo: number;
  precioCosto: number;
  precioVenta: number;
  gastosPorcentaje?: number | null;
  ivaPorcentaje?: number | null;
  incluirEnLista?: boolean;
  proveedorNombre?: string | null;
  fechaCosto?: string | null;
  categoriaId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireServerSession();
    const supabase = getSupabaseServerClient();

    const fam = (input.familia || input.medida || "General").trim();
    const costo = Math.max(0, Number(input.precioCosto) || 0);
    const gastos =
      input.gastosPorcentaje !== undefined &&
      input.gastosPorcentaje !== null &&
      !Number.isNaN(Number(input.gastosPorcentaje))
        ? Number(input.gastosPorcentaje)
        : null;
    const iva =
      input.ivaPorcentaje !== undefined &&
      input.ivaPorcentaje !== null &&
      !Number.isNaN(Number(input.ivaPorcentaje))
        ? Number(input.ivaPorcentaje)
        : null;

    const ventaSugerida =
      Number(input.precioVenta) > 0
        ? Number(input.precioVenta)
        : Math.round((costo * (1 + (gastos || 0)) * 1.4) / 10) * 10;

    const payload = {
      codigo: input.codigo.trim().toUpperCase(),
      nombre: input.nombre.trim(),
      medida: fam,
      familia: fam,
      presentacion: input.presentacion.trim(),
      stockActual: Math.max(0, Number(input.stockActual) || 0),
      stockMinimo: Math.max(0, Number(input.stockMinimo) || 0),
      precioCosto: costo,
      precioVenta: Math.max(0, ventaSugerida),
      gastosPorcentaje: gastos,
      ivaPorcentaje: iva,
      incluirEnLista: input.incluirEnLista !== false,
      proveedorNombre: input.proveedorNombre?.trim() || null,
      fechaCosto:
        input.fechaCosto?.trim() || new Date().toISOString().slice(0, 10),
      categoriaId: input.categoriaId,
      updatedAt: new Date().toISOString(),
    };

    if (!payload.codigo || !payload.nombre || !payload.categoriaId) {
      return {
        ok: false,
        error: "Código, nombre y línea son obligatorios.",
      };
    }

    if (input.id) {
      const { error } = await supabase
        .from("erp_productos")
        .update(payload)
        .eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      await logAudit(
        "PRODUCTO_ACTUALIZADO",
        `Actualizado ${payload.codigo} (${payload.nombre}) — Costo s/IVA: $${payload.precioCosto} | Stock: ${payload.stockActual}`,
        session.userId
      );
    } else {
      const { data: created, error } = await supabase
        .from("erp_productos")
        .insert(payload)
        .select("*")
        .single();
      if (error) return { ok: false, error: error.message };

      if (created && payload.stockActual > 0) {
        await supabase.from("erp_movimientos_stock").insert({
          tipo: "ENTRADA",
          cantidad: payload.stockActual,
          motivo: "Inventario inicial de alta de producto",
          productoId: created.id,
          fecha: new Date().toISOString(),
        });
      }

      await logAudit(
        "PRODUCTO_CREADO",
        `Alta de insumo ${payload.codigo} (${payload.nombre}) con stock inicial ${payload.stockActual}`,
        session.userId
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/productos");
    revalidatePath("/reportes");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al guardar producto",
    };
  }
}

export async function ajustarPrecioMasivoAction(input: {
  porcentaje: number;
  categoriaId?: string;
}): Promise<{ ok: boolean; actualizados?: number; error?: string }> {
  try {
    const session = await requireServerSession();
    const pct = Number(input.porcentaje);
    if (!pct || Number.isNaN(pct) || pct < -90 || pct > 300) {
      return {
        ok: false,
        error: "Ingrese un porcentaje válido entre -90% y +300%.",
      };
    }

    const supabase = getSupabaseServerClient();
    let query = supabase.from("erp_productos").select("*");
    if (input.categoriaId && input.categoriaId !== "ALL") {
      query = query.eq("categoriaId", input.categoriaId);
    }

    const { data: rows, error } = await query;
    if (error || !rows) {
      return {
        ok: false,
        error: error?.message || "No se pudieron obtener productos.",
      };
    }

    const factor = 1 + pct / 100;
    const hoy = new Date().toISOString().slice(0, 10);
    for (const prod of rows) {
      const nuevoCosto = Math.round(Number(prod.precioCosto) * factor);
      const nuevaVenta = Math.round(Number(prod.precioVenta) * factor);
      await supabase
        .from("erp_productos")
        .update({
          precioCosto: nuevoCosto,
          precioVenta: nuevaVenta,
          fechaCosto: hoy,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", prod.id);
    }

    await logAudit(
      "AJUSTE_PRECIOS_MASIVO",
      `Aplicado ajuste del ${pct > 0 ? `+${pct}` : pct}% sobre ${
        rows.length
      } insumos médicos`,
      session.userId
    );

    revalidatePath("/dashboard");
    revalidatePath("/productos");
    revalidatePath("/reportes");
    return { ok: true, actualizados: rows.length };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al ajustar precios",
    };
  }
}

export async function deleteProductoAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireServerSession();
    const supabase = getSupabaseServerClient();
    const { data: target } = await supabase
      .from("erp_productos")
      .select("codigo, nombre")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("erp_productos")
      .delete()
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    await logAudit(
      "PRODUCTO_ELIMINADO",
      `Baja del insumo ${target?.codigo || id} (${target?.nombre || ""})`,
      session.userId
    );

    revalidatePath("/dashboard");
    revalidatePath("/productos");
    revalidatePath("/reportes");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al eliminar producto",
    };
  }
}

export async function registrarMovimientoStockAction(input: {
  productoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
  entidadId?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireServerSession();
    const cantidad = Math.floor(Number(input.cantidad));
    if (!input.productoId || cantidad <= 0 || !input.motivo.trim()) {
      return {
        ok: false,
        error:
          "Seleccione un producto, cantidad mayor a 0 y motivo del movimiento.",
      };
    }

    const supabase = getSupabaseServerClient();
    const { data: prod, error: prodErr } = await supabase
      .from("erp_productos")
      .select("*")
      .eq("id", input.productoId)
      .single();

    if (prodErr || !prod) {
      return { ok: false, error: "Producto no encontrado." };
    }

    if (input.tipo === "SALIDA" && prod.stockActual < cantidad) {
      return {
        ok: false,
        error: `Stock insuficiente en ${prod.nombre}. Disponible: ${prod.stockActual} u.`,
      };
    }

    const nuevoStock =
      input.tipo === "ENTRADA"
        ? prod.stockActual + cantidad
        : prod.stockActual - cantidad;

    const { error: updErr } = await supabase
      .from("erp_productos")
      .update({
        stockActual: nuevoStock,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", prod.id);

    if (updErr) return { ok: false, error: updErr.message };

    const { error: movErr } = await supabase
      .from("erp_movimientos_stock")
      .insert({
        tipo: input.tipo,
        cantidad,
        motivo: input.motivo.trim(),
        productoId: prod.id,
        entidadId: input.entidadId || null,
        fecha: new Date().toISOString(),
      });

    if (movErr) return { ok: false, error: movErr.message };

    await logAudit(
      `STOCK_${input.tipo}`,
      `${input.tipo} de ${cantidad} u. en ${prod.codigo} (${prod.nombre}) — Nuevo stock: ${nuevoStock}`,
      session.userId
    );

    revalidatePath("/dashboard");
    revalidatePath("/productos");
    revalidatePath("/reportes");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Error al registrar movimiento",
    };
  }
}

export async function crearCategoriaAction(input: {
  nombre: string;
  descripcion?: string;
  colorHex?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireServerSession();
    if (!input.nombre.trim()) {
      return { ok: false, error: "El nombre de la línea es obligatorio." };
    }
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("erp_categorias").insert({
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim() || null,
      colorHex: input.colorHex || "#0F3A40",
    });
    if (error) return { ok: false, error: error.message };

    await logAudit(
      "LINEA_CREADA",
      `Nueva línea de catálogo: ${input.nombre.trim()}`,
      session.userId
    );

    revalidatePath("/productos");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al crear línea",
    };
  }
}

export async function upsertEntidadAction(input: {
  id?: string;
  nombre: string;
  tipo: TipoEntidad;
  subtipo?: string;
  telefono: string;
  email: string;
  cuit?: string;
  direccion?: string;
  markupGeneral?: number;
  markupLinea1?: number | null;
  markupLinea2?: number | null;
  markupLinea3?: number | null;
  markupLinea4?: number | null;
  markupLinea5?: number | null;
  markupLinea6?: number | null;
  condicionPago?: string;
  notas?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireServerSession();
    if (!input.nombre.trim() || !input.telefono.trim() || !input.email.trim()) {
      return {
        ok: false,
        error: "Nombre, teléfono y email son campos obligatorios.",
      };
    }

    const parseOptionalMarkup = (val?: number | null) => {
      if (val === undefined || val === null || Number.isNaN(Number(val)) || Number(val) <= 0) {
        return null;
      }
      return Number(val);
    };

    const supabase = getSupabaseServerClient();
    const payload = {
      nombre: input.nombre.trim(),
      tipo: input.tipo,
      subtipo: input.subtipo?.trim() || (input.tipo === "CLIENTE" ? "Sanatorio" : "Laboratorio"),
      telefono: input.telefono.trim(),
      email: input.email.trim(),
      cuit: input.cuit?.trim() || null,
      direccion: input.direccion?.trim() || null,
      markupGeneral:
        typeof input.markupGeneral === "number" && !Number.isNaN(input.markupGeneral)
          ? Math.max(0, input.markupGeneral)
          : 0.4,
      markupLinea1: parseOptionalMarkup(input.markupLinea1),
      markupLinea2: parseOptionalMarkup(input.markupLinea2),
      markupLinea3: parseOptionalMarkup(input.markupLinea3),
      markupLinea4: parseOptionalMarkup(input.markupLinea4),
      markupLinea5: parseOptionalMarkup(input.markupLinea5),
      markupLinea6: parseOptionalMarkup(input.markupLinea6),
      condicionPago: input.condicionPago?.trim() || "Contado",
      notas: input.notas?.trim() || null,
    };

    if (input.id) {
      const { error } = await supabase
        .from("erp_entidades")
        .update(payload)
        .eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      await logAudit(
        "ENTIDAD_ACTUALIZADA",
        `Actualizado ${payload.tipo}: ${payload.nombre} (Markup general: ${Math.round(
          payload.markupGeneral * 100
        )}%)`,
        session.userId
      );
    } else {
      const { error } = await supabase.from("erp_entidades").insert(payload);
      if (error) return { ok: false, error: error.message };
      await logAudit(
        "ENTIDAD_CREADA",
        `Alta de ${payload.tipo}: ${payload.nombre} (${payload.email})`,
        session.userId
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/entidades");
    revalidatePath("/finanzas");
    revalidatePath("/productos");
    revalidatePath("/reportes");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al guardar entidad",
    };
  }
}

export async function deleteEntidadAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireServerSession();
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("erp_entidades")
      .delete()
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    await logAudit(
      "ENTIDAD_ELIMINADA",
      `Eliminado registro comercial ID ${id}`,
      session.userId
    );

    revalidatePath("/entidades");
    revalidatePath("/finanzas");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al eliminar entidad",
    };
  }
}

export async function registrarTransaccionFinancieraAction(input: {
  tipo: TipoTransaccion;
  monto: number;
  concepto: string;
  comprobante?: string;
  entidadId?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireServerSession();
    const monto = Number(input.monto);
    if (!input.concepto.trim() || Number.isNaN(monto) || monto <= 0) {
      return {
        ok: false,
        error: "Ingrese un concepto válido y un monto superior a $0.",
      };
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("erp_transacciones_financieras")
      .insert({
        tipo: input.tipo,
        monto,
        concepto: input.concepto.trim(),
        comprobante: input.comprobante?.trim() || null,
        entidadId: input.entidadId || null,
        fecha: new Date().toISOString(),
      });

    if (error) return { ok: false, error: error.message };

    await logAudit(
      `FINANZAS_${input.tipo}`,
      `Asiento de ${input.tipo} por $${monto.toLocaleString("es-AR")} — ${input.concepto.trim()}`,
      session.userId
    );

    revalidatePath("/dashboard");
    revalidatePath("/finanzas");
    revalidatePath("/reportes");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Error al registrar transacción",
    };
  }
}

export async function deleteTransaccionFinancieraAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireServerSession();
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("erp_transacciones_financieras")
      .delete()
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    await logAudit(
      "FINANZAS_ANULACION",
      `Eliminado asiento financiero ID ${id}`,
      session.userId
    );

    revalidatePath("/dashboard");
    revalidatePath("/finanzas");
    revalidatePath("/reportes");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al eliminar asiento",
    };
  }
}

export async function sincronizarCatalogo2027Action(): Promise<{
  ok: boolean;
  total?: number;
  error?: string;
}> {
  try {
    const session = await requireServerSession();
    const supabase = getSupabaseServerClient();

    for (const l of LINEAS_OFICIALES) {
      await supabase.from("erp_categorias").upsert(
        {
          id: l.id,
          nombre: l.nombre,
          descripcion: l.descripcion,
          numeroLinea: l.numero,
          colorHex: l.colorHex,
          icono: l.icono,
        },
        { onConflict: "id" }
      );
    }

    const rows = CATALOGO_2027_ITEMS.map((item) => {
      const linea =
        LINEAS_OFICIALES.find((l) => l.numero === item.lineaNumero) ||
        LINEAS_OFICIALES[0];
      const precioSinIva = Math.round((item.costoSugerido * 1.4) / 10) * 10;
      return {
        codigo: item.codigo,
        nombre: item.nombre,
        medida: item.familia,
        familia: item.familia,
        presentacion: item.presentacion,
        stockActual: item.stockInicial,
        stockMinimo: item.stockMinimo,
        precioCosto: item.costoSugerido,
        precioVenta: precioSinIva,
        incluirEnLista: true,
        proveedorNombre: item.proveedor,
        fechaCosto: "2026-11-10",
        ordenCatalogo: item.orden,
        categoriaId: linea.id,
        updatedAt: new Date().toISOString(),
      };
    });

    const { error } = await supabase
      .from("erp_productos")
      .upsert(rows, { onConflict: "codigo" });
    if (error) return { ok: false, error: error.message };

    await logAudit(
      "CATALOGO_2027_SINCRONIZADO",
      `Sincronizadas las 6 líneas oficiales y ${rows.length} presentaciones del Catálogo 2027`,
      session.userId
    );

    revalidatePath("/dashboard");
    revalidatePath("/productos");
    revalidatePath("/reportes");
    return { ok: true, total: rows.length };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Error al sincronizar catálogo",
    };
  }
}
