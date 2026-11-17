import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://campjwuaytuoqwrvdjss.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbXBqd3VheXR1b3F3cnZkanNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1Nzc4MDIsImV4cCI6MjA5ODE1MzgwMn0.KjV3tf681lQ1CEE759l_s_wJQEJ0fymv3svKfwn9CsQ";

export function getSupabaseServerClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type RolUsuario = "OWNER" | "ADMIN" | "AUDITOR";
export type TipoEntidad = "CLIENTE" | "PROVEEDOR";
export type TipoMovimiento = "ENTRADA" | "SALIDA";
export type TipoTransaccion = "INGRESO" | "EGRESO";

export interface ParametrosErpDTO {
  id: string;
  ivaGeneral: number;
  gastosGenerales: number;
  redondeoMultiplo: number;
  vigenciaDesde: string;
  condiciones: string;
  contacto: string;
  notasCatalogo: string;
  updatedAt?: string;
}

export interface CategoriaDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
  numeroLinea?: number;
  colorHex?: string;
  icono?: string;
}

export interface ProductoDTO {
  id: string;
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
  ordenCatalogo?: number;
  categoriaId: string;
  categoria?: CategoriaDTO | null;
  updatedAt?: string;
}

export interface EntidadDTO {
  id: string;
  nombre: string;
  tipo: TipoEntidad;
  subtipo?: string | null;
  telefono: string;
  email: string;
  cuit?: string | null;
  direccion?: string | null;
  markupGeneral?: number;
  markupLinea1?: number | null;
  markupLinea2?: number | null;
  markupLinea3?: number | null;
  markupLinea4?: number | null;
  markupLinea5?: number | null;
  markupLinea6?: number | null;
  condicionPago?: string | null;
  notas?: string | null;
  createdAt?: string;
}

export interface MovimientoStockDTO {
  id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string;
  motivo: string;
  productoId: string;
  entidadId: string | null;
  producto?: ProductoDTO | null;
  entidad?: EntidadDTO | null;
}

export interface TransaccionFinancieraDTO {
  id: string;
  tipo: TipoTransaccion;
  monto: number;
  concepto: string;
  comprobante?: string | null;
  fecha: string;
  entidadId: string | null;
  entidad?: EntidadDTO | null;
}

export interface LogAuditoriaDTO {
  id: string;
  accion: string;
  detalle: string;
  fecha: string;
  usuarioId: string;
}
