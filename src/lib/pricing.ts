import type {
  EntidadDTO,
  ParametrosErpDTO,
  ProductoDTO,
} from "@/lib/supabase";

export interface CalculoPrecioCliente {
  costoUnitario: number;
  gastosPct: number;
  costoFinal: number;
  markupAplicado: number;
  esMarkupEspecificoLinea: boolean;
  precioSinIva: number;
  ivaPct: number;
  montoIva: number;
  precioFinal: number;
  ganancia: number;
  margenSobrePrecio: number;
}

export const DEFAULT_PARAMETROS: ParametrosErpDTO = {
  id: "default",
  ivaGeneral: 0.21,
  gastosGenerales: 0,
  redondeoMultiplo: 10,
  vigenciaDesde: "2026-11-10",
  condiciones:
    "Precios en pesos argentinos. Sujetos a modificación sin previo aviso.",
  contacto:
    "antapharma@gmail.com · 385 420-9044 · San Ramón Nonato 5947, Santiago del Estero",
  notasCatalogo:
    "• Los productos provienen de “LISTADO DE PRODUCTOS.pdf”. Los códigos que no existían en ese listado son una propuesta y pueden cambiarse.\n• Rollos de polietileno: se asumió 50 micrones × 125 m y 70 micrones × 85 m para cada ancho. Verificar.\n• Presentaciones marcadas “A confirmar / Consultar”: el listado original no las indica.",
};

export function resolverNumeroLinea(producto: ProductoDTO): number {
  if (producto.categoria?.numeroLinea) {
    return producto.categoria.numeroLinea;
  }
  const nom = (producto.categoria?.nombre || "").toLowerCase();
  if (nom.includes("descartable")) return 1;
  if (nom.includes("empaque") || nom.includes("pouch") || nom.includes("papel"))
    return 2;
  if (nom.includes("control") || nom.includes("indicador")) return 3;
  if (nom.includes("óxido") || nom.includes("oxido") || nom.includes("etileno"))
    return 4;
  if (nom.includes("limpieza") || nom.includes("enzim")) return 5;
  if (nom.includes("equipamiento") || nom.includes("seguridad")) return 6;
  return 1;
}

export function resolverMarkupClienteParaLinea(
  cliente: EntidadDTO | null | undefined,
  numeroLinea: number
): { markup: number; especifico: boolean } {
  if (!cliente) {
    return { markup: 0.4, especifico: false };
  }
  const general =
    typeof cliente.markupGeneral === "number" && !Number.isNaN(cliente.markupGeneral)
      ? cliente.markupGeneral
      : 0.4;

  const mapLinea: Record<number, number | null | undefined> = {
    1: cliente.markupLinea1,
    2: cliente.markupLinea2,
    3: cliente.markupLinea3,
    4: cliente.markupLinea4,
    5: cliente.markupLinea5,
    6: cliente.markupLinea6,
  };

  const valorLinea = mapLinea[numeroLinea];
  if (typeof valorLinea === "number" && !Number.isNaN(valorLinea) && valorLinea > 0) {
    return { markup: valorLinea, especifico: true };
  }
  return { markup: general, especifico: false };
}

export function calcularPrecioProductoCliente(
  producto: ProductoDTO,
  cliente: EntidadDTO | null | undefined,
  parametros: ParametrosErpDTO = DEFAULT_PARAMETROS
): CalculoPrecioCliente {
  const costoUnitario = Math.max(0, Number(producto.precioCosto) || 0);
  const gastosPct =
    typeof producto.gastosPorcentaje === "number" &&
    !Number.isNaN(producto.gastosPorcentaje)
      ? producto.gastosPorcentaje
      : parametros.gastosGenerales;

  const costoFinal = costoUnitario * (1 + gastosPct);

  const numLinea = resolverNumeroLinea(producto);
  const { markup: markupAplicado, especifico: esMarkupEspecificoLinea } =
    resolverMarkupClienteParaLinea(cliente, numLinea);

  const precioSinIvaBruto = costoFinal * (1 + markupAplicado);
  const multiplo =
    parametros.redondeoMultiplo && parametros.redondeoMultiplo > 0
      ? parametros.redondeoMultiplo
      : 0.01;

  const precioSinIva =
    costoUnitario > 0
      ? Math.round((precioSinIvaBruto / multiplo) * 1e6) / 1e6 >= 0
        ? Math.round(precioSinIvaBruto / multiplo) * multiplo
        : 0
      : 0;

  const ivaPct =
    typeof producto.ivaPorcentaje === "number" &&
    !Number.isNaN(producto.ivaPorcentaje)
      ? producto.ivaPorcentaje
      : parametros.ivaGeneral;

  const montoIva = Math.round(precioSinIva * ivaPct * 100) / 100;
  const precioFinal = Math.round((precioSinIva + montoIva) * 100) / 100;
  const ganancia = Math.max(0, precioSinIva - costoFinal);
  const margenSobrePrecio = precioSinIva > 0 ? ganancia / precioSinIva : 0;

  return {
    costoUnitario,
    gastosPct,
    costoFinal,
    markupAplicado,
    esMarkupEspecificoLinea,
    precioSinIva,
    ivaPct,
    montoIva,
    precioFinal,
    ganancia,
    margenSobrePrecio,
  };
}
