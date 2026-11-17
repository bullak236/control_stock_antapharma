import type {
  EntidadDTO,
  MovimientoStockDTO,
  ParametrosErpDTO,
  ProductoDTO,
  TransaccionFinancieraDTO,
} from "@/lib/supabase";
import {
  BRAND_CONTACT,
  LINEAS_OFICIALES,
} from "@/lib/catalogo-2027-data";
import {
  calcularPrecioProductoCliente,
  DEFAULT_PARAMETROS,
  resolverNumeroLinea,
} from "@/lib/pricing";
import { formatARS, formatDateTimeAR } from "@/lib/utils";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function drawTestigoLogoOnPdf(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
  x: number,
  y: number,
  scale = 1,
  variant: "negative" | "positive" = "negative"
) {
  const mainColor: [number, number, number] =
    variant === "negative" ? [255, 255, 255] : [15, 58, 64];
  const cobreColor: [number, number, number] = [185, 103, 58];

  // Draw the 'A' symbol
  doc.setFillColor(...mainColor);
  doc.triangle(
    x + 6 * scale,
    y,
    x,
    y + 14 * scale,
    x + 3.2 * scale,
    y + 14 * scale,
    "F"
  );
  doc.triangle(
    x + 6 * scale,
    y,
    x + 8.8 * scale,
    y + 14 * scale,
    x + 12 * scale,
    y + 14 * scale,
    "F"
  );
  doc.rect(x + 4.6 * scale, y, 2.8 * scale, 2.4 * scale, "F");

  // Draw the Cobre pill (Punto Testigo)
  doc.setFillColor(...cobreColor);
  doc.roundedRect(
    x + 3.6 * scale,
    y + 8.8 * scale,
    4.8 * scale,
    2.1 * scale,
    1 * scale,
    1 * scale,
    "F"
  );

  // Wordmark "antapharma"
  doc.setTextColor(...mainColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16 * scale);
  doc.text("anta", x + 15 * scale, y + 10.2 * scale);
  const antaWidth = doc.getTextWidth("anta");
  doc.setFont("helvetica", "normal");
  doc.text("pharma", x + 15 * scale + antaWidth, y + 10.2 * scale);

  // Descriptor
  doc.setFontSize(5.2 * scale);
  if (variant === "negative") {
    doc.setTextColor(220, 235, 232);
  } else {
    doc.setTextColor(107, 122, 125);
  }
  doc.text(
    "DESCARTABLES  ·  ESTERILIZACION",
    x + 15.2 * scale,
    y + 13.6 * scale
  );
}

function drawFranjaTestigoRight(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
  pageWidth = 210,
  pageHeight = 297,
  stripeWidth = 14
) {
  const xStart = pageWidth - stripeWidth;
  doc.setFillColor(15, 58, 64);
  doc.rect(xStart, 0, stripeWidth, pageHeight, "F");

  doc.setDrawColor(185, 103, 58);
  doc.setLineWidth(3.2);
  for (let y = -20; y < pageHeight + 20; y += 7.5) {
    doc.line(xStart, y + stripeWidth, pageWidth, y);
  }
}

/**
 * 1. GENERADOR DEL CATÁLOGO OFICIAL DE PRODUCTOS 2027 (PDF A4 VERTICAL)
 * Respeta el Manual de Marca v1.1:
 * - Tapa Petróleo (#0F3A40) + El Testigo + Franja Cobre (#B9673A) + Índice de 6 líneas
 * - Páginas internas por Línea (01 a 06) con su color asignado, agrupadas por Familia
 * - Código en tipografía mono, sin precios ("Sin precios: van en la lista por cliente")
 * - Pie fijo con contacto en todas las páginas
 * - Contratapa "Pedir es simple. Cuidamos lo que cuida."
 */
export async function generarCatalogo2027PDF(
  productos: ProductoDTO[],
  options?: { download?: boolean }
): Promise<{ blob: Blob; fileName: string }> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;

  // ==================== PÁGINA 1: TAPA OFICIAL ====================
  doc.setFillColor(15, 58, 64); // Petróleo #0F3A40
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  drawFranjaTestigoRight(doc, pageWidth, pageHeight, 16);

  doc.setTextColor(220, 235, 232);
  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.text("CATALOGO DE PRODUCTOS     EDICION 2027", 20, 22);

  // Símbolo A gigante en blanco + punto testigo cobre
  doc.setFillColor(255, 255, 255);
  doc.triangle(38, 52, 20, 96, 29, 96, "F");
  doc.triangle(38, 52, 47, 96, 56, 96, "F");
  doc.roundedRect(33.5, 51, 9, 6, 2, 2, "F");
  doc.setFillColor(185, 103, 58); // Cobre Anta #B9673A
  doc.roundedRect(30.5, 79, 15, 6.8, 3.4, 3.4, "F");

  // Título Tapa
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.text("Catálogo", 20, 125);
  doc.text("de productos", 20, 139);

  doc.setTextColor(185, 103, 58);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(32);
  doc.text("2027", 20, 153);

  // Índice de las 6 Líneas con su píldora de color oficial
  let yLine = 182;
  for (const linea of LINEAS_OFICIALES) {
    doc.setDrawColor(107, 122, 125);
    doc.setLineWidth(0.2);
    doc.line(20, yLine - 6, 145, yLine - 6);

    const rgb = hexToRgb(linea.colorHex);
    doc.setFillColor(...rgb);
    doc.roundedRect(20, yLine - 3.2, 6.5, 3.2, 1.6, 1.6, "F");

    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(220, 235, 232);
    doc.text(linea.codigoLinea, 30, yLine - 0.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(linea.nombre, 40, yLine - 0.5);

    yLine += 11;
  }
  doc.setDrawColor(107, 122, 125);
  doc.line(20, yLine - 6, 145, yLine - 6);

  // Pie de Tapa
  drawTestigoLogoOnPdf(doc, 20, 262, 1.05, "negative");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(220, 235, 232);
  doc.text("Santiago del Estero", 132, 269);
  doc.text("Argentina", 132, 274.5);

  // ==================== PÁGINAS POR LÍNEA (01 a 06) ====================
  const sortedProds = [...productos].sort(
    (a, b) => (a.ordenCatalogo || 999) - (b.ordenCatalogo || 999)
  );

  let pageNumber = 2;

  for (const linea of LINEAS_OFICIALES) {
    const prodsLinea = sortedProds.filter(
      (p) => resolverNumeroLinea(p) === linea.numero
    );
    if (prodsLinea.length === 0) continue;

    doc.addPage();
    // Fondo Gasa suave (#F6F3EE)
    doc.setFillColor(246, 243, 238);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Banner de Línea con el color oficial de línea
    const lineRgb = hexToRgb(linea.colorHex);
    doc.setFillColor(...lineRgb);
    doc.roundedRect(14, 14, pageWidth - 28, 28, 4, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(linea.codigoLinea, 21, 31);

    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.text(
      `LINEA ${linea.codigoLinea}  ·  ${prodsLinea.length} PRODUCTOS`,
      40,
      22
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(linea.nombre, 40, 29.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(linea.descripcion, 40, 36);

    // Agrupar por familia dentro de la línea
    const familiasMap = new Map<string, ProductoDTO[]>();
    for (const p of prodsLinea) {
      const fam = p.familia || p.medida || "General";
      if (!familiasMap.has(fam)) familiasMap.set(fam, []);
      familiasMap.get(fam)!.push(p);
    }

    // Construir filas con separadores de familia
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableBody: any[] = [];
    for (const [familiaNombre, items] of familiasMap.entries()) {
      tableBody.push([
        {
          content: `${familiaNombre.toUpperCase()}  (${items.length} ${
            items.length === 1 ? "PRESENTACION" : "PRESENTACIONES"
          })`,
          colSpan: 3,
          styles: {
            fillColor: [220, 235, 232],
            textColor: [15, 58, 64],
            fontStyle: "bold",
            fontSize: 8.5,
            cellPadding: { top: 2.5, bottom: 2, left: 3, right: 3 },
          },
        },
      ]);
      for (const item of items) {
        tableBody.push([item.codigo, item.nombre, item.presentacion]);
      }
    }

    autoTable(doc, {
      startY: 47,
      margin: { left: 14, right: 14, bottom: 20 },
      head: [["CODIGO", "PRODUCTO", "PRESENTACION"]],
      body: tableBody,
      theme: "plain",
      styles: {
        fontSize: 8.2,
        cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 },
        textColor: [29, 37, 39],
        lineColor: [107, 122, 125],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [246, 243, 238],
        textColor: [107, 122, 125],
        fontStyle: "bold",
        fontSize: 7.2,
      },
      columnStyles: {
        0: {
          font: "courier",
          fontStyle: "bold",
          textColor: [185, 103, 58],
          cellWidth: 32,
        },
        1: {
          cellWidth: 108,
        },
        2: {
          font: "courier",
          textColor: [107, 122, 125],
          halign: "right",
          cellWidth: 42,
        },
      },
      didDrawPage: () => {
        // Pie fijo con contacto en todas las páginas (Regla Manual Pág. 17)
        doc.setFont("courier", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(107, 122, 125);
        doc.text(
          "ANTAPHARMA · CATALOGO 2027 · 385 420-9044 · ANTAPHARMA@GMAIL.COM",
          14,
          288
        );
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 58, 64);
        doc.text(
          String(pageNumber).padStart(2, "0"),
          pageWidth - 14,
          288,
          { align: "right" }
        );
        pageNumber++;
      },
    });
  }

  // ==================== CONTRATAPA OFICIAL ====================
  doc.addPage();
  doc.setFillColor(15, 58, 64); // Petróleo #0F3A40
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  drawFranjaTestigoRight(doc, pageWidth, pageHeight, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Pedir es simple.", 20, 52);

  doc.setTextColor(185, 103, 58); // Cobre Anta
  doc.setFont("helvetica", "normal");
  doc.setFontSize(26);
  doc.text("Cuidamos lo que cuida.", 20, 64);

  const pasos = [
    {
      num: "01",
      titulo: "Elegí por código",
      desc: "Cada producto tiene un código y una presentación. Con eso alcanza para armar el pedido.",
    },
    {
      num: "02",
      titulo: "Escribinos",
      desc: "Por WhatsApp o por correo. Te confirmamos stock, precio y entrega en el mismo día.",
    },
    {
      num: "03",
      titulo: "Pedí tu lista de precios",
      desc: "Los precios no figuran en este catálogo: enviamos una lista vigente a cada cliente.",
    },
  ];

  let yPaso = 104;
  for (const p of pasos) {
    doc.setDrawColor(107, 122, 125);
    doc.setLineWidth(0.2);
    doc.line(20, yPaso - 10, 175, yPaso - 10);

    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(185, 103, 58);
    doc.text(p.num, 20, yPaso);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(p.titulo, 36, yPaso);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(220, 235, 232);
    doc.text(p.desc, 36, yPaso + 7);

    yPaso += 28;
  }

  // Datos de contacto al pie de contratapa
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(185, 103, 58);
  doc.text("WHATSAPP", 20, 240);
  doc.text("CORREO", 68, 240);
  doc.text("DIRECCION", 132, 240);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(BRAND_CONTACT.telefono, 20, 247);
  doc.text(BRAND_CONTACT.email, 68, 247);
  doc.text(BRAND_CONTACT.direccion, 132, 247);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(220, 235, 232);
  doc.text("(4200) Santiago del Estero", 132, 253);

  doc.setFontSize(7.5);
  doc.setTextColor(107, 122, 125);
  doc.text(
    "Las marcas mencionadas pertenecen a sus respectivos fabricantes. Las presentaciones pueden variar según disponibilidad.",
    20,
    275
  );

  const fileName = `Antapharma_Catalogo_Productos_2027.pdf`;
  const blob = doc.output("blob");

  if (options?.download !== false) {
    doc.save(fileName);
  }

  return { blob, fileName };
}

/**
 * 2. GENERADOR DE LISTA DE PRECIOS POR CLIENTE (PDF A4)
 * Regla Manual de Marca pág. 18, 20 y 21:
 * "Se exporta solo esa hoja y se envía. Los costos nunca salen de la planilla."
 */
export async function generarListaPreciosClientePDF({
  productos,
  cliente,
  parametros = DEFAULT_PARAMETROS,
  lineaFiltro = "ALL",
  download = true,
}: {
  productos: ProductoDTO[];
  cliente: EntidadDTO | null;
  parametros?: ParametrosErpDTO;
  lineaFiltro?: string;
  download?: boolean;
}): Promise<{ blob: Blob; fileName: string }> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;

  // Cabecera Petróleo
  doc.setFillColor(15, 58, 64);
  doc.rect(0, 0, pageWidth, 38, "F");

  // Franja testigo superior derecha
  doc.setFillColor(185, 103, 58);
  doc.rect(pageWidth - 12, 0, 12, 38, "F");

  drawTestigoLogoOnPdf(doc, 14, 10, 1.0, "negative");

  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(220, 235, 232);
  doc.text("LISTA DE PRECIOS VIGENTE", pageWidth - 18, 14, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `Cliente: ${cliente?.nombre || "Lista General Antapharma"}`,
    pageWidth - 18,
    21,
    { align: "right" }
  );

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 235, 232);
  doc.text(
    `Vigencia desde: ${parametros.vigenciaDesde}  ·  Condición: ${
      cliente?.condicionPago || "Contado"
    }`,
    pageWidth - 18,
    28,
    { align: "right" }
  );

  const itemsLista = [...productos]
    .filter((p) => p.incluirEnLista !== false && p.precioCosto > 0)
    .filter((p) => lineaFiltro === "ALL" || p.categoriaId === lineaFiltro)
    .sort((a, b) => (a.ordenCatalogo || 999) - (b.ordenCatalogo || 999));

  const rows = itemsLista.map((p) => {
    const calc = calcularPrecioProductoCliente(p, cliente, parametros);
    return [
      p.codigo,
      p.categoria?.nombre || "Descartables",
      p.nombre,
      p.presentacion,
      formatARS(calc.precioSinIva),
      formatARS(calc.montoIva),
      formatARS(calc.precioFinal),
    ];
  });

  autoTable(doc, {
    startY: 44,
    margin: { left: 12, right: 12, bottom: 24 },
    head: [
      [
        "CODIGO",
        "LINEA",
        "PRODUCTO",
        "PRESENTACION",
        "PRECIO S/IVA",
        "IVA",
        "PRECIO FINAL",
      ],
    ],
    body: rows,
    styles: {
      fontSize: 7.8,
      cellPadding: 2.2,
      textColor: [29, 37, 39],
    },
    headStyles: {
      fillColor: [15, 58, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.2,
    },
    alternateRowStyles: {
      fillColor: [246, 243, 238], // Gasa
    },
    columnStyles: {
      0: { font: "courier", fontStyle: "bold", textColor: [185, 103, 58], cellWidth: 24 },
      1: { cellWidth: 32, fontSize: 7 },
      2: { cellWidth: 58 },
      3: { cellWidth: 26, fontSize: 7.2 },
      4: { font: "courier", halign: "right", cellWidth: 16 },
      5: { font: "courier", halign: "right", cellWidth: 14 },
      6: { font: "courier", fontStyle: "bold", halign: "right", cellWidth: 18 },
    },
    didDrawPage: () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(107, 122, 125);
      doc.text(parametros.condiciones, 12, 284);
      doc.setFont("courier", "normal");
      doc.text(parametros.contacto, 12, 289);
    },
  });

  const cleanClient = (cliente?.nombre || "General")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30);
  const fileName = `Antapharma_Lista_Precios_${cleanClient}_${parametros.vigenciaDesde}.pdf`;
  const blob = doc.output("blob");

  if (download) {
    doc.save(fileName);
  }
  return { blob, fileName };
}

/**
 * 3. EXPORTADOR EXCEL INTERNO COMPLETO (5 HOJAS IGUAL AL EXCEL OFICIAL)
 * Hojas:
 * 1. Inicio (Parámetros, Referencias, Fórmula, Notas)
 * 2. Productos (Costos, Gastos %, Costo Final, IVA %, Stock, Proveedor)
 * 3. Clientes (Markup general y Markup por cada una de las 6 líneas)
 * 4. Lista de precios (Cálculo para el cliente seleccionado)
 * 5. Análisis interno (Costo final, Markup aplicado, Ganancia $, Margen s/ precio)
 */
export async function generarPlanillaInternaExcel({
  productos,
  entidades,
  clienteSeleccionado,
  parametros = DEFAULT_PARAMETROS,
  movimientos = [],
  transacciones = [],
}: {
  productos: ProductoDTO[];
  entidades: EntidadDTO[];
  clienteSeleccionado?: EntidadDTO | null;
  parametros?: ParametrosErpDTO;
  movimientos?: MovimientoStockDTO[];
  transacciones?: TransaccionFinancieraDTO[];
}) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const clientes = entidades.filter((e) => e.tipo === "CLIENTE");
  const clienteActivo = clienteSeleccionado || clientes[0] || null;
  const sortedProds = [...productos].sort(
    (a, b) => (a.ordenCatalogo || 999) - (b.ordenCatalogo || 999)
  );

  // Hoja 1: Inicio (Parámetros, Referencias, Fórmula, Notas)
  const inicioAoA = [
    ["Antapharma — Lista de precios (uso interno)"],
    [
      "Planilla interna: contiene costos y markups. No compartir este archivo; al cliente se le envía solo el PDF de la hoja “Lista de precios”.",
    ],
    [],
    ["", "CÓMO SE USA"],
    [
      "",
      "1 · Productos",
      "Cargar el costo unitario sin IVA de cada producto. Los productos sin costo no aparecen en la lista.",
    ],
    [
      "",
      "2 · Clientes",
      "Cargar cada cliente con su markup general. Si una línea lleva un markup distinto, completar la columna de esa línea.",
    ],
    [
      "",
      "3 · Lista de precios",
      "Elegir el cliente. La lista se calcula sola.",
    ],
    [
      "",
      "4 · Compartir",
      "Exportar PDF solo de la Lista de precios. Nunca enviar el Excel con costos.",
    ],
    [
      "",
      "5 · Análisis interno",
      "Muestra costo, markup aplicado, ganancia y margen del cliente elegido.",
    ],
    [],
    ["", "PARÁMETROS", "", "", "", "LÍNEAS DE PRODUCTO"],
    [
      "",
      "IVA general",
      parametros.ivaGeneral,
      "Se aplica a todo producto sin IVA propio en la hoja Productos.",
      "",
      "Descartables",
    ],
    [
      "",
      "Gastos generales sobre costo",
      parametros.gastosGenerales,
      "Flete, comisiones u otros gastos que se suman al costo.",
      "",
      "Empaque para esterilización",
    ],
    [
      "",
      "Redondeo del precio (múltiplo de $)",
      parametros.redondeoMultiplo,
      "El precio sin IVA se redondea a este múltiplo.",
      "",
      "Control de esterilización",
    ],
    [
      "",
      "Vigencia desde",
      parametros.vigenciaDesde,
      "Se imprime en la lista de precios.",
      "",
      "Óxido de etileno",
    ],
    [
      "",
      "Condiciones",
      parametros.condiciones,
      "Texto al pie de la lista de precios.",
      "",
      "Limpieza y desinfección",
    ],
    [
      "",
      "Contacto",
      parametros.contacto,
      "Texto al pie de la lista de precios.",
      "",
      "Equipamiento y seguridad",
    ],
    [],
    ["", "FÓRMULA"],
    [
      "",
      "Precio sin IVA = Costo × (1 + gastos) × (1 + markup del cliente), redondeado.   Precio final = Precio sin IVA × (1 + IVA).",
    ],
    [
      "",
      "El markup se aplica sobre el costo: 40 % de markup equivale a 28,6 % de margen sobre el precio de venta.",
    ],
    [],
    ["", "NOTAS SOBRE EL CATÁLOGO CARGADO"],
    ...parametros.notasCatalogo.split("\n").map((line) => ["", line]),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(inicioAoA),
    "Inicio"
  );

  // Hoja 2: Productos y costos
  const productosRows = sortedProds.map((p, idx) => {
    const calc = calcularPrecioProductoCliente(p, clienteActivo, parametros);
    return {
      Código: p.codigo,
      Línea: p.categoria?.nombre || "Descartables",
      Familia: p.familia || p.medida || "General",
      Producto: p.nombre,
      Presentación: p.presentacion,
      "Costo unitario sin IVA ($)": p.precioCosto,
      "Gastos % (opcional)": p.gastosPorcentaje ?? "",
      "Costo final ($)": calc.costoFinal,
      "IVA % (opcional)": p.ivaPorcentaje ?? "",
      "Incluir en lista": p.incluirEnLista === false ? "NO" : "SI",
      Proveedor: p.proveedorNombre || "",
      "Fecha del costo": p.fechaCosto || parametros.vigenciaDesde,
      "Stock Actual": p.stockActual,
      "Stock Mínimo": p.stockMinimo,
      "Orden (automático)": p.ordenCatalogo || idx + 1,
    };
  });
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(productosRows),
    "Productos"
  );

  // Hoja 3: Clientes y markups
  const clientesRows = clientes.map((c) => ({
    Cliente: c.nombre,
    Tipo: c.subtipo || "Sanatorio",
    "Markup general": c.markupGeneral ?? 0.4,
    Descartables: c.markupLinea1 ?? "",
    "Empaque para esterilización": c.markupLinea2 ?? "",
    "Control de esterilización": c.markupLinea3 ?? "",
    "Óxido de etileno": c.markupLinea4 ?? "",
    "Limpieza y desinfección": c.markupLinea5 ?? "",
    "Equipamiento y seguridad": c.markupLinea6 ?? "",
    "Condición de pago": c.condicionPago || "Contado",
    Notas: c.notas || "",
    Teléfono: c.telefono,
    Email: c.email,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(clientesRows),
    "Clientes"
  );

  // Hoja 4: Lista de precios (para el cliente seleccionado)
  const listaRows = sortedProds
    .filter((p) => p.incluirEnLista !== false && p.precioCosto > 0)
    .map((p) => {
      const calc = calcularPrecioProductoCliente(p, clienteActivo, parametros);
      return {
        Código: p.codigo,
        Línea: p.categoria?.nombre || "Descartables",
        Producto: p.nombre,
        Presentación: p.presentacion,
        "Precio sin IVA": calc.precioSinIva,
        IVA: calc.montoIva,
        "Precio final": calc.precioFinal,
      };
    });
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(listaRows),
    "Lista de precios"
  );

  // Hoja 5: Análisis interno
  const analisisRows = sortedProds.map((p) => {
    const calc = calcularPrecioProductoCliente(p, clienteActivo, parametros);
    return {
      Código: p.codigo,
      Línea: p.categoria?.nombre || "Descartables",
      Producto: p.nombre,
      Presentación: p.presentacion,
      "Costo final ($)": calc.costoFinal,
      "Markup aplicado": calc.markupAplicado,
      "Precio sin IVA ($)": calc.precioSinIva,
      "IVA %": calc.ivaPct,
      "Precio final ($)": calc.precioFinal,
      "Ganancia ($)": calc.ganancia,
      "Margen s/ precio": Number((calc.margenSobrePrecio * 100).toFixed(1)) + "%",
    };
  });
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(analisisRows),
    "Análisis interno"
  );

  // Hoja 6 opcional si hay movimientos / kardex
  if (movimientos.length > 0 || transacciones.length > 0) {
    const kardexRows = movimientos.map((m) => ({
      Fecha: formatDateTimeAR(m.fecha),
      Movimiento: m.tipo,
      Código: m.producto?.codigo || "—",
      Producto: m.producto?.nombre || "—",
      Cantidad: m.cantidad,
      Entidad: m.entidad?.nombre || "Ajuste Interno",
      Motivo: m.motivo,
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(kardexRows),
      "Kardex_Stock"
    );
  }

  const fileName = `Antapharma_Lista_de_Precios_Interno_${parametros.vigenciaDesde}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return { fileName };
}

/**
 * 4. COMPARTIR POR WHATSAPP Y POR MAIL (antapharma@gmail.com)
 * Segun la voz de marca del Manual v1.1 (Pág. 06 y 19):
 * Cercana, precisa y resolutiva.
 */
export function buildWhatsAppCatalogUrl({
  telefonoDestino,
  nombreCliente,
  incluirListaPrecios = false,
}: {
  telefonoDestino?: string;
  nombreCliente?: string;
  incluirListaPrecios?: boolean;
}) {
  const saludo = nombreCliente ? `¡Hola ${nombreCliente}!` : "¡Hola!";
  const texto = incluirListaPrecios
    ? `${saludo} Te compartimos la Lista de Precios vigente y el Catálogo 2027 de Antapharma (Descartables · Esterilización).\n\n` +
      `• Elegí por código y presentación.\n` +
      `• Te confirmamos stock y entrega en el día.\n\n` +
      `Contacto directo:\n` +
      `WhatsApp: ${BRAND_CONTACT.telefono}\n` +
      `Correo: ${BRAND_CONTACT.email}\n` +
      `${BRAND_CONTACT.direccion} — Santiago del Estero\n` +
      `Antapharma · Cuidamos lo que cuida.`
    : `${saludo} Te compartimos el Catálogo de Productos 2027 de Antapharma (Descartables e insumos de esterilización: 154 presentaciones en 6 líneas).\n\n` +
      `01 · Descartables\n` +
      `02 · Empaque para esterilización\n` +
      `03 · Control de esterilización\n` +
      `04 · Óxido de etileno\n` +
      `05 · Limpieza y desinfección\n` +
      `06 · Equipamiento y seguridad\n\n` +
      `Indicános los códigos y cantidades que necesitás y te pasamos cotización y entrega hoy.\n\n` +
      `Correo: ${BRAND_CONTACT.email} · Tel: ${BRAND_CONTACT.telefono}`;

  const cleanPhone = (telefonoDestino || "").replace(/[^0-9]/g, "");
  const base = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("54") ? cleanPhone : `549${cleanPhone}`}`
    : `https://wa.me/`;

  return `${base}?text=${encodeURIComponent(texto)}`;
}

export function buildMailtoCatalogUrl({
  emailDestino,
  nombreCliente,
  incluirListaPrecios = false,
}: {
  emailDestino?: string;
  nombreCliente?: string;
  incluirListaPrecios?: boolean;
}) {
  const to = (emailDestino || "").trim();
  const subject = incluirListaPrecios
    ? `Antapharma — Lista de Precios Vigente y Catálogo 2027${
        nombreCliente ? ` (${nombreCliente})` : ""
      }`
    : `Antapharma — Catálogo de Productos 2027 (Descartables · Esterilización)`;

  const saludo = nombreCliente ? `Hola ${nombreCliente},` : "Hola,";
  const body =
    `${saludo}\n\n` +
    `Te enviamos adjunto el ${
      incluirListaPrecios
        ? "listado de precios actualizado y el Catálogo 2027"
        : "Catálogo de Productos 2027"
    } de Antapharma (Descartables e insumos de esterilización para áreas críticas).\n\n` +
    `Líneas disponibles en stock:\n` +
    `01 · Descartables (guantes, bajalenguas, hisopos, gasas, descartadores)\n` +
    `02 · Empaque para esterilización (pouch con testigo, Tyvek, polietileno, papel grado médico, crepé, SMS)\n` +
    `03 · Control de esterilización (indicadores biológicos, químicos, integradores clase 5 y cintas testigo)\n` +
    `04 · Óxido de etileno (cartuchos de aluminio y kits con ampollas)\n` +
    `05 · Limpieza y desinfección (detergentes enzimáticos, glutaraldehído, OPA, amonios)\n` +
    `06 · Equipamiento y seguridad (selladoras, dispensers, máscaras y protección OE)\n\n` +
    `Para realizar un pedido, simplemente respondé este correo a ${BRAND_CONTACT.email} o escribinos por WhatsApp al ${BRAND_CONTACT.telefono} indicando código y cantidad.\n\n` +
    `Saludos cordiales,\n` +
    `${BRAND_CONTACT.responsable}\n` +
    `${BRAND_CONTACT.empresa} · ${BRAND_CONTACT.descriptor}\n` +
    `${BRAND_CONTACT.telefono} · ${BRAND_CONTACT.email}\n` +
    `${BRAND_CONTACT.direccion} · ${BRAND_CONTACT.ciudad}`;

  const cc = to && to.toLowerCase() !== BRAND_CONTACT.email ? `&cc=${encodeURIComponent(BRAND_CONTACT.email)}` : "";
  return `mailto:${encodeURIComponent(to || BRAND_CONTACT.email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}${cc}`;
}

export function buildGmailComposeCatalogUrl({
  emailDestino,
  nombreCliente,
  incluirListaPrecios = false,
}: {
  emailDestino?: string;
  nombreCliente?: string;
  incluirListaPrecios?: boolean;
}) {
  const to = (emailDestino || BRAND_CONTACT.email).trim();
  const subject = incluirListaPrecios
    ? `Antapharma — Lista de Precios Vigente y Catálogo 2027${
        nombreCliente ? ` (${nombreCliente})` : ""
      }`
    : `Antapharma — Catálogo de Productos 2027 (Descartables · Esterilización)`;

  const saludo = nombreCliente ? `Hola ${nombreCliente},` : "Hola,";
  const body =
    `${saludo}\n\n` +
    `Te enviamos el ${
      incluirListaPrecios
        ? "listado de precios vigente y el Catálogo 2027"
        : "Catálogo de Productos 2027"
    } de Antapharma (Descartables · Esterilización).\n\n` +
    `Cada producto cuenta con código propio y presentación unificada para agilizar tus pedidos.\n\n` +
    `Saludos cordiales,\n` +
    `${BRAND_CONTACT.responsable}\n` +
    `Antapharma · Descartables e insumos de esterilización\n` +
    `${BRAND_CONTACT.telefono} · ${BRAND_CONTACT.email}\n` +
    `${BRAND_CONTACT.direccion} · ${BRAND_CONTACT.ciudad}`;

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    to
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
