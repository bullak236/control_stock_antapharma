export interface LineaCatalogo {
  id: string;
  numero: number;
  codigoLinea: string;
  nombre: string;
  descripcion: string;
  colorHex: string;
  icono: string;
  cantidadProductos: number;
}

export interface ItemCatalogoOficial {
  orden: number;
  codigo: string;
  lineaNumero: number;
  linea: string;
  familia: string;
  nombre: string;
  presentacion: string;
  costoSugerido: number;
  stockInicial: number;
  stockMinimo: number;
  proveedor: string;
}

export const BRAND_CONTACT = {
  empresa: "Antapharma",
  descriptor: "Descartables · Esterilización",
  claim: "Cuidamos lo que cuida.",
  proposito: "Que en el área crítica nada falte ni falle.",
  responsable: "David E. Bulacio Pereyra",
  cargo: "Dirección Comercial",
  telefono: "385 420-9044",
  whatsappNumber: "5493854209044",
  email: "antapharma@gmail.com",
  direccion: "San Ramón Nonato 5947",
  ciudad: "(4200) Santiago del Estero · Argentina",
  cuit: "20-29305856-4",
  edicionCatalogo: "2027",
  versionManual: "V1.1 — 11.2026",
};

export const LINEAS_OFICIALES: LineaCatalogo[] = [
  {
    id: "22222222-2222-4222-8222-222222222201",
    numero: 1,
    codigoLinea: "01",
    nombre: "Descartables",
    descripcion:
      "Lo que se usa todos los días: guantes, bajalenguas, hisopos, gasas, descartadores y más.",
    colorHex: "#B9673A",
    icono: "guantes",
    cantidadProductos: 35,
  },
  {
    id: "22222222-2222-4222-8222-222222222202",
    numero: 2,
    codigoLinea: "02",
    nombre: "Empaque para esterilización",
    descripcion:
      "Pouch, bobinas, papeles y bolsas para cada método de esterilización.",
    colorHex: "#1E7F7A",
    icono: "pouch",
    cantidadProductos: 69,
  },
  {
    id: "22222222-2222-4222-8222-222222222203",
    numero: 3,
    codigoLinea: "03",
    nombre: "Control de esterilización",
    descripcion:
      "Indicadores biológicos y químicos, integradores y cintas testigo.",
    colorHex: "#C8952B",
    icono: "ind-biologicos",
    cantidadProductos: 14,
  },
  {
    id: "22222222-2222-4222-8222-222222222204",
    numero: 4,
    codigoLinea: "04",
    nombre: "Óxido de etileno",
    descripcion:
      "Cartuchos de aluminio y kits de esterilización manual con ampollas.",
    colorHex: "#8C3B4A",
    icono: "cartuchos-oe",
    cantidadProductos: 16,
  },
  {
    id: "22222222-2222-4222-8222-222222222205",
    numero: 5,
    codigoLinea: "05",
    nombre: "Limpieza y desinfección",
    descripcion:
      "Detergentes enzimáticos y desinfectantes de alto nivel para áreas críticas.",
    colorHex: "#2E6E9E",
    icono: "enzimaticos",
    cantidadProductos: 9,
  },
  {
    id: "22222222-2222-4222-8222-222222222206",
    numero: 6,
    codigoLinea: "06",
    nombre: "Equipamiento y seguridad",
    descripcion:
      "Selladoras, dispensers y elementos de protección para el operador.",
    colorHex: "#55656A",
    icono: "selladoras",
    cantidadProductos: 11,
  },
];

// Raw rows [codigo, lineaNumero, familia, nombre, presentacion, costoSugerido, stockInicial, stockMinimo, proveedor]
const RAW_CATALOG: [
  string,
  number,
  string,
  string,
  string,
  number,
  number,
  number,
  string,
][] = [
  // LÍNEA 01: Descartables (35)
  ["BL-P100", 1, "Bajalenguas", "Bajalengua pediátrico", "Caja × 100 u", 3200, 40, 10, "Descartables Médicos SA"],
  ["BL-A100", 1, "Bajalenguas", "Bajalengua adulto", "Caja × 100 u", 3400, 55, 15, "Descartables Médicos SA"],
  ["BL-P5000", 1, "Bajalenguas", "Bajalengua pediátrico", "Caja × 5000 u", 125000, 8, 3, "Descartables Médicos SA"],
  ["BL-A5000", 1, "Bajalenguas", "Bajalengua adulto", "Caja × 5000 u", 132000, 10, 3, "Descartables Médicos SA"],
  ["HI-M100", 1, "Hisopos", "Hisopo de madera", "Bolsa × 100 u", 2100, 60, 15, "Descartables Médicos SA"],
  ["HI-P100", 1, "Hisopos", "Hisopo de plástico", "Bolsa × 100 u", 2300, 45, 15, "Descartables Médicos SA"],
  ["HI-ME", 1, "Hisopos", "Hisopo de madera estéril", "Unidad", 450, 200, 50, "Descartables Médicos SA"],
  ["GN-S", 1, "Guantes", "Guante de nitrilo negro para examen — talle S", "Caja × 100 u", 9800, 32, 15, "Importadora BioMed"],
  ["GN-M", 1, "Guantes", "Guante de nitrilo negro para examen — talle M", "Caja × 100 u", 9800, 8, 20, "Importadora BioMed"],
  ["GN-L", 1, "Guantes", "Guante de nitrilo negro para examen — talle L", "Caja × 100 u", 9800, 28, 15, "Importadora BioMed"],
  ["GE-K5", 1, "Gel", "Gel para ecografía y kinesiología", "5 kg", 11500, 18, 6, "Química Sur SA"],
  ["GE-05", 1, "Gel", "Gel para ecografía PM 2193-10", "0,5 kg", 2400, 35, 10, "Química Sur SA"],
  ["GE-1", 1, "Gel", "Gel para ecografía PM 2193-10", "1 kg", 3900, 30, 10, "Química Sur SA"],
  ["GE-3", 1, "Gel", "Gel para ecografía PM 2193-10", "3 kg", 8900, 15, 5, "Química Sur SA"],
  ["GE-4", 1, "Gel", "Gel para ecografía PM 2193-10", "4 kg", 10500, 12, 5, "Química Sur SA"],
  ["GA-10", 1, "Gasas y compresas", "Gasa por pieza", "Pieza × 1 kg", 16800, 25, 10, "Textil Sanitaria SRL"],
  ["GA-15", 1, "Gasas y compresas", "Gasa por pieza", "Pieza × 1,5 kg", 24200, 20, 8, "Textil Sanitaria SRL"],
  ["CN-75-10", 1, "Gasas y compresas", "Compresa NT 7,5 × 7,5 cm RV", "× 10 u · s/pouch E", 1850, 80, 20, "Textil Sanitaria SRL"],
  ["CN-75-05", 1, "Gasas y compresas", "Compresa NT 7,5 × 7,5 cm RV", "× 5 u · s/pouch E", 1100, 75, 20, "Textil Sanitaria SRL"],
  ["CN-10-10", 1, "Gasas y compresas", "Compresa NT 10 × 10 cm RV", "× 10 u · s/pouch E", 2400, 65, 20, "Textil Sanitaria SRL"],
  ["CN-10-05", 1, "Gasas y compresas", "Compresa NT 10 × 10 cm RV", "× 5 u · s/pouch E", 1450, 60, 20, "Textil Sanitaria SRL"],
  ["RO-125", 1, "Recolectores", "Recolector de orina estéril, tapa a rosca", "125 ml", 620, 150, 40, "Descartables Médicos SA"],
  ["L3-10", 1, "Llaves de tres vías", "Llave de tres vías con prolongador 10 cm", "Unidad", 950, 90, 25, "Importadora BioMed"],
  ["L3-15", 1, "Llaves de tres vías", "Llave de tres vías con prolongador 15 cm", "Unidad", 1020, 80, 25, "Importadora BioMed"],
  ["L3-20", 1, "Llaves de tres vías", "Llave de tres vías con prolongador 20 cm", "Unidad", 1100, 70, 20, "Importadora BioMed"],
  ["L3-50", 1, "Llaves de tres vías", "Llave de tres vías con prolongador 50 cm", "Unidad", 1350, 60, 20, "Importadora BioMed"],
  ["CA-IMP", 1, "Protección personal", "Camisolín bata impermeable descartable, polietileno — 120 × 70 cm", "Unidad", 1600, 110, 30, "Textil Sanitaria SRL"],
  ["V1", 1, "Descartadores de cortopunzantes", "Descartador rojo, plástico virgen — 1 L", "Unidad", 1900, 45, 15, "BioPlast Hospitalario"],
  ["M2", 1, "Descartadores de cortopunzantes", "Descartador rojo, plástico virgen — 2,2 L", "Unidad", 2650, 6, 20, "BioPlast Hospitalario"],
  ["M4", 1, "Descartadores de cortopunzantes", "Descartador rojo, plástico virgen — 4,8 L", "Unidad", 3800, 35, 15, "BioPlast Hospitalario"],
  ["V8", 1, "Descartadores de cortopunzantes", "Descartador rojo, plástico virgen — 8 L", "Unidad", 5400, 24, 10, "BioPlast Hospitalario"],
  ["MR1", 1, "Descartadores de cortopunzantes", "Descartador negro — 1 L", "Unidad", 1550, 40, 15, "BioPlast Hospitalario"],
  ["MR2", 1, "Descartadores de cortopunzantes", "Descartador negro — 2,2 L", "Unidad", 2150, 50, 15, "BioPlast Hospitalario"],
  ["MR4", 1, "Descartadores de cortopunzantes", "Descartador negro — 4,8 L", "Unidad", 3100, 38, 12, "BioPlast Hospitalario"],
  ["MR7", 1, "Descartadores de cortopunzantes", "Descartador negro — 8 L", "Unidad", 4400, 22, 10, "BioPlast Hospitalario"],

  // LÍNEA 02: Empaque para esterilización (69)
  ["PT-050", 2, "Pouch con testigo (OE y vapor)", "Pouch con testigo 50 mm", "Rollo × 200 m", 11200, 24, 8, "Empaques Médicos SRL"],
  ["PT-075", 2, "Pouch con testigo (OE y vapor)", "Pouch con testigo 75 mm", "Rollo × 200 m", 15400, 30, 10, "Empaques Médicos SRL"],
  ["PT-100", 2, "Pouch con testigo (OE y vapor)", "Pouch con testigo 100 mm", "Rollo × 200 m", 19800, 36, 12, "Empaques Médicos SRL"],
  ["PT-150", 2, "Pouch con testigo (OE y vapor)", "Pouch con testigo 150 mm", "Rollo × 200 m", 28500, 4, 15, "Empaques Médicos SRL"],
  ["PT-200", 2, "Pouch con testigo (OE y vapor)", "Pouch con testigo 200 mm", "Rollo × 200 m", 37200, 22, 10, "Empaques Médicos SRL"],
  ["PT-300", 2, "Pouch con testigo (OE y vapor)", "Pouch con testigo 300 mm", "Rollo × 200 m", 54800, 16, 6, "Empaques Médicos SRL"],
  ["PT-400", 2, "Pouch con testigo (OE y vapor)", "Pouch con testigo 400 mm", "Rollo × 200 m", 71500, 10, 4, "Empaques Médicos SRL"],
  ["PT-500", 2, "Pouch con testigo (OE y vapor)", "Pouch con testigo 500 mm", "Rollo × 200 m", 88900, 8, 3, "Empaques Médicos SRL"],
  ["PT-600", 2, "Pouch con testigo (OE y vapor)", "Pouch con testigo 600 mm", "Rollo × 200 m", 104000, 6, 3, "Empaques Médicos SRL"],

  ["RP-08-50", 2, "Rollos de polietileno", "Polietileno 8 cm · 50 micrones", "Rollo × 125 m", 7800, 18, 5, "Empaques Médicos SRL"],
  ["RP-08-70", 2, "Rollos de polietileno", "Polietileno 8 cm · 70 micrones", "Rollo × 85 m", 8200, 15, 5, "Empaques Médicos SRL"],
  ["RP-10-50", 2, "Rollos de polietileno", "Polietileno 10 cm · 50 micrones", "Rollo × 125 m", 9400, 20, 6, "Empaques Médicos SRL"],
  ["RP-10-70", 2, "Rollos de polietileno", "Polietileno 10 cm · 70 micrones", "Rollo × 85 m", 9900, 16, 5, "Empaques Médicos SRL"],
  ["RP-12-50", 2, "Rollos de polietileno", "Polietileno 12 cm · 50 micrones", "Rollo × 125 m", 11200, 18, 6, "Empaques Médicos SRL"],
  ["RP-12-70", 2, "Rollos de polietileno", "Polietileno 12 cm · 70 micrones", "Rollo × 85 m", 11800, 14, 5, "Empaques Médicos SRL"],
  ["RP-15-50", 2, "Rollos de polietileno", "Polietileno 15 cm · 50 micrones", "Rollo × 125 m", 13900, 22, 6, "Empaques Médicos SRL"],
  ["RP-15-70", 2, "Rollos de polietileno", "Polietileno 15 cm · 70 micrones", "Rollo × 85 m", 14500, 16, 5, "Empaques Médicos SRL"],
  ["RP-20-50", 2, "Rollos de polietileno", "Polietileno 20 cm · 50 micrones", "Rollo × 125 m", 18200, 18, 5, "Empaques Médicos SRL"],
  ["RP-20-70", 2, "Rollos de polietileno", "Polietileno 20 cm · 70 micrones", "Rollo × 85 m", 18900, 14, 5, "Empaques Médicos SRL"],
  ["RP-25-50", 2, "Rollos de polietileno", "Polietileno 25 cm · 50 micrones", "Rollo × 125 m", 22400, 14, 4, "Empaques Médicos SRL"],
  ["RP-25-70", 2, "Rollos de polietileno", "Polietileno 25 cm · 70 micrones", "Rollo × 85 m", 23100, 12, 4, "Empaques Médicos SRL"],
  ["RP-30-50", 2, "Rollos de polietileno", "Polietileno 30 cm · 50 micrones", "Rollo × 125 m", 26800, 12, 4, "Empaques Médicos SRL"],
  ["RP-30-70", 2, "Rollos de polietileno", "Polietileno 30 cm · 70 micrones", "Rollo × 85 m", 27500, 10, 4, "Empaques Médicos SRL"],
  ["RP-30-30", 2, "Rollos de polietileno", "Polietileno 30 cm · 30 micrones", "Rollo × 250 m", 29500, 10, 3, "Empaques Médicos SRL"],
  ["RP-40-70", 2, "Rollos de polietileno", "Polietileno 40 cm · 70 micrones", "Rollo × 250 m", 58000, 8, 3, "Empaques Médicos SRL"],
  ["RP-50-70", 2, "Rollos de polietileno", "Polietileno 50 cm · 70 micrones", "Rollo × 250 m", 72000, 8, 3, "Empaques Médicos SRL"],
  ["RP-80-80", 2, "Rollos de polietileno", "Polietileno 80 cm · 80 micrones", "Rollo × 100 m", 64000, 6, 2, "Empaques Médicos SRL"],

  ["PG-020-334", 2, "Papel grado médico", "Bobina papel grado médico 20 cm", "334 m · 4 kg", 32000, 12, 4, "Papelera Quirúrgica"],
  ["PG-030-334", 2, "Papel grado médico", "Bobina papel grado médico 30 cm", "334 m · 5 kg", 41000, 12, 4, "Papelera Quirúrgica"],
  ["PG-040-334", 2, "Papel grado médico", "Bobina papel grado médico 40 cm", "334 m · 6 kg", 49500, 10, 4, "Papelera Quirúrgica"],
  ["PG-060-334", 2, "Papel grado médico", "Bobina papel grado médico 60 cm", "334 m · 12 kg", 89000, 10, 3, "Papelera Quirúrgica"],
  ["PG-080-334", 2, "Papel grado médico", "Bobina papel grado médico 80 cm", "334 m · 16 kg", 118000, 8, 3, "Papelera Quirúrgica"],
  ["PG-080-375", 2, "Papel grado médico", "Bobina papel grado médico 80 cm", "375 m", 129000, 6, 2, "Papelera Quirúrgica"],
  ["PG-100-100", 2, "Papel grado médico", "Bobina papel grado médico 100 cm", "100 m", 48000, 10, 3, "Papelera Quirúrgica"],
  ["PG-120-334", 2, "Papel grado médico", "Bobina papel grado médico 120 cm", "334 m · 24 kg", 174000, 6, 2, "Papelera Quirúrgica"],
  ["PG-120-100", 2, "Papel grado médico", "Bobina papel grado médico 120 cm", "100 m", 56000, 8, 3, "Papelera Quirúrgica"],
  ["PGT-060-334", 2, "Papel grado médico", "Papel grado médico 60 cm con testigo impreso", "334 m", 96000, 8, 3, "Papelera Quirúrgica"],
  ["PGT-060-100", 2, "Papel grado médico", "Papel grado médico 60 cm con testigo impreso", "100 m", 34000, 12, 4, "Papelera Quirúrgica"],
  ["PGT-080-100", 2, "Papel grado médico", "Papel grado médico 80 cm con testigo impreso", "100 m", 44000, 12, 4, "Papelera Quirúrgica"],
  ["PGT-080-200", 2, "Papel grado médico", "Papel grado médico 80 cm con testigo impreso", "200 m", 82000, 8, 3, "Papelera Quirúrgica"],
  ["PGT-080-334", 2, "Papel grado médico", "Papel grado médico 80 cm con testigo impreso", "334 m", 126000, 6, 2, "Papelera Quirúrgica"],

  ["PC-060", 2, "Papel crepé", "Papel crepé 60 g — bobina 60 cm", "100 m", 38000, 14, 4, "Papelera Quirúrgica"],
  ["PC-080", 2, "Papel crepé", "Papel crepé 60 g — bobina 80 cm", "100 m", 49000, 14, 4, "Papelera Quirúrgica"],
  ["PC-100", 2, "Papel crepé", "Papel crepé 60 g — bobina 100 cm", "100 m", 61000, 10, 3, "Papelera Quirúrgica"],
  ["PC-120", 2, "Papel crepé", "Papel crepé 60 g — bobina 120 cm", "100 m", 72000, 8, 3, "Papelera Quirúrgica"],

  ["TS-90-50-150", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 90 × 50 × 150", "Consultar", 18500, 15, 5, "Empaques Médicos SRL"],
  ["TS-90-25-150", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 90 × 25 × 150", "Consultar", 17900, 15, 5, "Empaques Médicos SRL"],
  ["TS-90-50-250", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 90 × 50 × 250", "Consultar", 22400, 15, 5, "Empaques Médicos SRL"],
  ["TS-125-50-250", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 125 × 50 × 250", "Consultar", 26800, 12, 4, "Empaques Médicos SRL"],
  ["TS-110-30-190", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 110 × 30 × 190", "Consultar", 21500, 12, 4, "Empaques Médicos SRL"],
  ["TS-140-40-250", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 140 × 40 × 250", "Consultar", 28900, 12, 4, "Empaques Médicos SRL"],
  ["TS-140-50-330", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 140 × 50 × 330", "Consultar", 34500, 10, 4, "Empaques Médicos SRL"],
  ["TS-320-125-610", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 320 × 125 × 610", "Consultar", 68000, 8, 3, "Empaques Médicos SRL"],
  ["TS-250-60-520", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 250 × 60 × 520", "Consultar", 52000, 8, 3, "Empaques Médicos SRL"],
  ["TS-250-100-380", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 250 × 100 × 380", "Consultar", 46000, 8, 3, "Empaques Médicos SRL"],
  ["TS-180-60-420", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 180 × 60 × 420", "Consultar", 39000, 10, 3, "Empaques Médicos SRL"],
  ["TS-300-125-610", 2, "Bolsas termosoldables premium", "Bolsa termosoldable premium 300 × 125 × 610", "Consultar", 64000, 8, 3, "Empaques Médicos SRL"],

  ["TY-050", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 5 cm", "Rollo × 70 m", 34000, 10, 3, "Empaques Médicos SRL"],
  ["TY-075", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 7,5 cm", "Rollo × 70 m", 46000, 10, 3, "Empaques Médicos SRL"],
  ["TY-100", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 10 cm", "Rollo × 70 m", 58000, 12, 4, "Empaques Médicos SRL"],
  ["TY-125", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 12,5 cm", "Rollo × 70 m", 71000, 10, 3, "Empaques Médicos SRL"],
  ["TY-150", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 15 cm", "Rollo × 70 m", 84000, 10, 3, "Empaques Médicos SRL"],
  ["TY-200", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 20 cm", "Rollo × 70 m", 108000, 8, 3, "Empaques Médicos SRL"],
  ["TY-250", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 25 cm", "Rollo × 70 m", 132000, 6, 2, "Empaques Médicos SRL"],
  ["TY-300", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 30 cm", "Rollo × 70 m", 156000, 6, 2, "Empaques Médicos SRL"],
  ["TY-350", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 35 cm", "Rollo × 70 m", 179000, 5, 2, "Empaques Médicos SRL"],
  ["TY-400", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 40 cm", "Rollo × 70 m", 204000, 4, 2, "Empaques Médicos SRL"],
  ["TY-500", 2, "Pouch Tyvek (peróxido / plasma)", "Pouch Tyvek con testigo 50 cm", "Rollo × 70 m", 248000, 4, 2, "Empaques Médicos SRL"],

  ["SMS-100", 2, "Tela no tejida SMS", "Hojas de tela no tejida SMS 100 × 100 cm", "× 100 hojas", 68000, 22, 8, "Textil Sanitaria SRL"],

  // LÍNEA 03: Control de esterilización (14)
  ["BT10", 3, "Indicadores biológicos", "Indicador biológico óxido de etileno", "Caja × 100 u", 142000, 12, 5, "Terragene División Control"],
  ["BT110", 3, "Indicadores biológicos", "Indicador biológico óxido de etileno — rápido", "Caja × 50 u", 118000, 10, 4, "Terragene División Control"],
  ["BT20", 3, "Indicadores biológicos", "Indicador biológico vapor", "Caja × 100 u", 136000, 5, 10, "Terragene División Control"],
  ["BT220", 3, "Indicadores biológicos", "Indicador biológico vapor — rápido", "Caja × 50 u", 115000, 14, 5, "Terragene División Control"],
  ["BT95", 3, "Indicadores biológicos", "Indicador biológico peróxido de hidrógeno — rápido", "Caja × 50 u", 164000, 8, 3, "Terragene División Control"],
  ["CD16", 3, "Indicadores químicos", "Indicador químico óxido de etileno — clase 4", "Caja × 250 tiras dobles", 24500, 28, 10, "Terragene División Control"],
  ["CD29", 3, "Indicadores químicos", "Indicador químico vapor — clase 4", "Caja × 250 tiras dobles", 23800, 34, 10, "Terragene División Control"],
  ["IT31", 3, "Indicadores químicos", "Indicador químico calor seco — clase 4", "Caja × 250 tiras dobles", 25200, 18, 6, "Terragene División Control"],
  ["IT12", 3, "Integradores químicos", "Integrador químico óxido de etileno", "Pack × 250 u", 38500, 20, 8, "Terragene División Control"],
  ["IT26", 3, "Integradores químicos", "Integrador químico vapor 1YS — clase 5", "Pack × 250 u", 42000, 25, 8, "Terragene División Control"],
  ["CT10", 3, "Cintas indicadoras", "Cinta indicadora óxido de etileno — clase 1", "18 mm × 50 m", 6800, 45, 15, "Terragene División Control"],
  ["CT20", 3, "Cintas indicadoras", "Cinta indicadora vapor — clase 1", "19 mm × 50 m", 5400, 60, 20, "Terragene División Control"],
  ["CT30", 3, "Cintas indicadoras", "Cinta indicadora calor seco — clase 1", "18 mm × 50 m", 6200, 30, 10, "Terragene División Control"],
  ["CT40", 3, "Cintas indicadoras", "Cinta indicadora peróxido de hidrógeno", "18 mm × 50 m", 14500, 18, 6, "Terragene División Control"],

  // LÍNEA 04: Óxido de etileno (16)
  ["EC-07", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 10 g — Ø 25 × 85 mm", "Caja × 25 u", 98000, 10, 4, "Gases Esterilizantes SRL"],
  ["EC-25", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 30 g — Ø 25 × 105 mm", "Caja × 25 u", 124000, 10, 4, "Gases Esterilizantes SRL"],
  ["EC-50", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 50 g — Ø 35 × 105 mm", "Caja × 12 u", 112000, 12, 4, "Gases Esterilizantes SRL"],
  ["EC-67", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 67 g — Ø 35 × 105 mm", "Caja × 12 u", 128000, 10, 4, "Gases Esterilizantes SRL"],
  ["EC-100", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 100 g — Ø 38 × 165 mm", "Caja × 12 u", 156000, 3, 6, "Gases Esterilizantes SRL"],
  ["EC-127", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 127 g — Ø 38 × 165 mm", "Caja × 12 u", 174000, 8, 3, "Gases Esterilizantes SRL"],
  ["EC-128", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 128 g — Ø 38 × 165 mm", "Caja × 12 u", 176000, 8, 3, "Gases Esterilizantes SRL"],
  ["EC-134", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 134 g — Ø 38 × 165 mm", "Caja × 12 u", 182000, 8, 3, "Gases Esterilizantes SRL"],
  ["EC-160", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 160 g — Ø 50 × 174 mm", "Caja × 8 u", 168000, 6, 3, "Gases Esterilizantes SRL"],
  ["EC-180", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 180 g — Ø 50 × 174 mm", "Caja × 8 u", 184000, 6, 3, "Gases Esterilizantes SRL"],
  ["EC-200", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 200 g — Ø 50 × 174 mm", "Caja × 8 u", 198000, 6, 2, "Gases Esterilizantes SRL"],
  ["EC-220", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 220 g — Ø 50 × 174 mm", "Caja × 8 u", 212000, 5, 2, "Gases Esterilizantes SRL"],
  ["EC-230", 4, "Cartuchos de aluminio", "Cartucho de óxido de etileno 230 g — Ø 50 × 174 mm", "Caja × 8 u", 224000, 5, 2, "Gases Esterilizantes SRL"],
  ["EA-05", 4, "Kits con ampollas", "Kit de esterilización manual — ampolla 5 cm³, bolsas 31 × 60 cm (11 L), con precintos", "Caja × 60 ampollas", 165000, 8, 3, "Gases Esterilizantes SRL"],
  ["EA-20", 4, "Kits con ampollas", "Kit de esterilización manual — ampolla 20 cm³, bolsas 58 × 92 cm (34 L), con precintos", "Caja × 15 ampollas", 142000, 10, 3, "Gases Esterilizantes SRL"],
  ["EA-20MAX", 4, "Kits con ampollas", "Kit de esterilización manual — ampolla 20 cm³, bolsas 58 × 92 cm (34 L), con cartucho inteligente, precintos e indicador", "Caja × 15 ampollas", 189000, 6, 2, "Gases Esterilizantes SRL"],

  // LÍNEA 05: Limpieza y desinfección (9)
  ["EZ-1", 5, "Detergentes enzimáticos", "Detergente enzimático (pH neutro)", "5 L", 26500, 18, 6, "Química Enzimática Sur SA"],
  ["EZ-2", 5, "Detergentes enzimáticos", "Detergente bi-enzimático (amilasa y proteasa)", "5 L", 32800, 16, 6, "Química Enzimática Sur SA"],
  ["EZ-3", 5, "Detergentes enzimáticos", "Detergente tri-enzimático (amilasa, proteasa y lipasa)", "5 L", 41000, 3, 8, "Química Enzimática Sur SA"],
  ["EZ-4", 5, "Detergentes enzimáticos", "Detergente multienzimático (amilasa, proteasa, lipasa y celulasa)", "5 L", 49500, 14, 5, "Química Enzimática Sur SA"],
  ["GL-14", 5, "Desinfectantes", "Glutaraldehído sin surfactante — 14 días", "5 L", 34000, 15, 5, "Química Enzimática Sur SA"],
  ["GL-28", 5, "Desinfectantes", "Glutaraldehído con surfactante — 28 días", "5 L", 39500, 16, 5, "Química Enzimática Sur SA"],
  ["OPA-055", 5, "Desinfectantes", "AdoxOPA — orto-ftalaldehído 0,55 %, superficies e instrumental", "Consultar", 64000, 10, 4, "Química Enzimática Sur SA"],
  ["PAC-AC", 5, "Desinfectantes", "PetrovAC — detergente desinfectante con amonios cuaternarios", "Consultar", 36000, 12, 4, "Química Enzimática Sur SA"],
  ["LT8-20", 5, "Desinfectantes", "Adox LT8 Plus — limpiador desinfectante para áreas críticas", "Sobre monodosis 20 g (rinde 1 L)", 2900, 80, 20, "Química Enzimática Sur SA"],

  // LÍNEA 06: Equipamiento y seguridad (11)
  ["SE-2200", 6, "Selladoras", "Selladora continua para pouch y bolsas termosoldables, acero inoxidable, con pirómetro — mod. 2200", "Unidad", 680000, 3, 1, "Equipamiento Médico AR"],
  ["SE-M40", 6, "Selladoras", "Selladora de pouch de mesa, manual — 40 cm", "Unidad", 195000, 5, 2, "Equipamiento Médico AR"],
  ["SE-P80", 6, "Selladoras", "Selladora de pouch a pedal con portabobina — 80 cm", "Unidad", 340000, 4, 1, "Equipamiento Médico AR"],
  ["SE-PE80", 6, "Selladoras", "Selladora de polietileno a pedal con portabobina — 80 cm", "Unidad", 295000, 4, 1, "Equipamiento Médico AR"],
  ["DI-90", 6, "Dispensers", "Dispenser para bobinas mixtas / pouch con corte rotativo — 90 × 34 cm, corte 80 cm", "Unidad", 148000, 6, 2, "Equipamiento Médico AR"],
  ["SG-MAS", 6, "Seguridad", "Máscara panorámica para óxido de etileno", "Unidad", 185000, 6, 2, "Equipamiento Médico AR"],
  ["SG-FIL", 6, "Seguridad", "Filtro para máscara de OE — 100 h de trabajo", "Unidad", 62000, 12, 4, "Equipamiento Médico AR"],
  ["SG-GNE", 6, "Seguridad", "Guantes de neoprene para OE", "Par", 28500, 15, 5, "Equipamiento Médico AR"],
  ["SG-KIT", 6, "Seguridad", "Kit delantal de neoprene (1,1 m, puños y cierre velcro) + botas, para OE", "Kit", 94000, 6, 2, "Equipamiento Médico AR"],
  ["SG-GAT", 6, "Seguridad", "Guantes largos para alta temperatura, con fibra Dupont", "Par", 44000, 10, 3, "Equipamiento Médico AR"],
  ["SG-GMA", 6, "Seguridad", "Guantes de protección de corte, malla de acero inoxidable", "Par", 86000, 6, 2, "Equipamiento Médico AR"],
];

export const CATALOGO_2027_ITEMS: ItemCatalogoOficial[] = RAW_CATALOG.map(
  (row, index) => {
    const lineaObj =
      LINEAS_OFICIALES.find((l) => l.numero === row[1]) || LINEAS_OFICIALES[0];
    return {
      orden: index + 1,
      codigo: row[0],
      lineaNumero: row[1],
      linea: lineaObj.nombre,
      familia: row[2],
      nombre: row[3],
      presentacion: row[4],
      costoSugerido: row[5],
      stockInicial: row[6],
      stockMinimo: row[7],
      proveedor: row[8],
    };
  }
);
