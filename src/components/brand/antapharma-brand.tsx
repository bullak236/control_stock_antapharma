"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * SÍMBOLO OFICIAL: "EL TESTIGO" (Manual de Marca v1.1 - Pág. 08 y 09)
 * La A es un trazo firme como un pliegue de pouch sellado;
 * su travesaño es el punto testigo en Cobre Anta (#B9673A).
 */
export function TestigoMark({
  variant = "negative",
  boxed = false,
  className,
}: {
  variant?: "positive" | "negative" | "mono-dark" | "mono-light";
  boxed?: boolean;
  className?: string;
}) {
  const strokeColor =
    variant === "positive" || variant === "mono-dark" ? "#0F3A40" : "#FFFFFF";
  const pillColor =
    variant === "mono-dark"
      ? "#0F3A40"
      : variant === "mono-light"
      ? "#FFFFFF"
      : "#B9673A";

  if (boxed) {
    const boxBg =
      variant === "positive" ? "#F6F3EE" : "#0F3A40";
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-10 w-10 shrink-0", className)}
        aria-label="Antapharma El Testigo"
      >
        <rect width="64" height="64" rx="14" fill={boxBg} />
        {/* A de trazo firme (pliegue de pouch sellado) */}
        <path
          d="M27.6 13.5C28.4 11.6 29.8 10.8 32 10.8C34.2 10.8 35.6 11.6 36.4 13.5L51.5 51H42.3L32 23.6L21.7 51H12.5L27.6 13.5Z"
          fill={strokeColor}
        />
        {/* Punto testigo en Cobre Anta */}
        <rect x="25.5" y="36.5" width="13" height="6.2" rx="3.1" fill={pillColor} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 52 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-9 w-9 shrink-0", className)}
      aria-label="Antapharma El Testigo"
    >
      <path
        d="M21.4 4.2C22.3 2.1 23.8 1.2 26 1.2C28.2 1.2 29.7 2.1 30.6 4.2L47.5 46H37.4L26 15.8L14.6 46H4.5L21.4 4.2Z"
        fill={strokeColor}
      />
      <rect x="19" y="30" width="14" height="6.6" rx="3.3" fill={pillColor} />
    </svg>
  );
}

/**
 * LOGO OFICIAL ANTAPHARMA (Manual de Marca v1.1 - Pág. 06, 08, 09, 10)
 * Regla estricta:
 * - En el logo va siempre en minúsculas: "anta" en Bold y "pharma" en Regular.
 * - Nunca "AntaPharma" ni "ANTAPHARMA".
 * - Descriptor: "DESCARTABLES · ESTERILIZACIÓN"
 */
export function AntapharmaLogo({
  variant = "negative",
  layout = "horizontal",
  showDescriptor = true,
  size = "md",
  className,
}: {
  variant?: "positive" | "negative" | "mono-dark" | "mono-light";
  layout?: "horizontal" | "vertical";
  showDescriptor?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const textColor =
    variant === "positive" || variant === "mono-dark"
      ? "text-[#0F3A40]"
      : "text-white";
  const descColor =
    variant === "positive" || variant === "mono-dark"
      ? "text-[#6B7A7D]"
      : "text-[#DCEBE8]/75";

  const sizeClasses = {
    sm: {
      mark: "h-7 w-7",
      word: "text-xl",
      desc: "text-[8px] tracking-[0.22em]",
    },
    md: {
      mark: "h-9 w-9",
      word: "text-2xl",
      desc: "text-[9px] tracking-[0.25em]",
    },
    lg: {
      mark: "h-12 w-12",
      word: "text-3xl sm:text-4xl",
      desc: "text-[10px] tracking-[0.28em]",
    },
  }[size];

  if (layout === "vertical") {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center text-center select-none",
          className
        )}
      >
        <TestigoMark variant={variant} className={sizeClasses.mark} />
        <div
          className={cn(
            "mt-2 font-display leading-none tracking-tight",
            sizeClasses.word,
            textColor
          )}
        >
          <span className="font-bold">anta</span>
          <span className="font-normal">pharma</span>
        </div>
        {showDescriptor && (
          <span
            className={cn(
              "mt-1.5 font-mono uppercase",
              sizeClasses.desc,
              descColor
            )}
          >
            DESCARTABLES · ESTERILIZACIÓN
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <TestigoMark variant={variant} className={sizeClasses.mark} />
      <div className="flex flex-col justify-center">
        <div
          className={cn(
            "font-display leading-none tracking-tight",
            sizeClasses.word,
            textColor
          )}
        >
          <span className="font-bold">anta</span>
          <span className="font-normal">pharma</span>
        </div>
        {showDescriptor && (
          <span
            className={cn(
              "mt-1 font-mono uppercase",
              sizeClasses.desc,
              descColor
            )}
          >
            DESCARTABLES · ESTERILIZACIÓN
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * 02 · EL PUNTO TESTIGO (Manual de Marca v1.1 - Pág. 15)
 * Una píldora en Cobre (#B9673A) que señala lo importante:
 * novedades, vigencia de la lista, estado de stock.
 */
export function PuntoTestigoPill({
  label,
  sublabel,
  tone = "default",
  className,
}: {
  label: string;
  sublabel?: string;
  tone?: "default" | "outline" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-xs font-medium",
        tone === "outline" &&
          "border border-[#6B7A7D]/40 bg-transparent text-[#DCEBE8]",
        tone === "dark" &&
          "bg-[#0F3A40] text-white border border-[#1E7F7A]/40",
        tone === "default" &&
          "bg-[#F6F3EE] text-[#0F3A40] border border-[#6B7A7D]/25",
        className
      )}
    >
      <span
        className="inline-block h-2.5 w-5 shrink-0 rounded-full bg-[#B9673A]"
        aria-hidden="true"
      />
      <span className="font-semibold tracking-tight">{label}</span>
      {sublabel && (
        <span className="font-mono text-[10px] uppercase tracking-wider opacity-75">
          {sublabel}
        </span>
      )}
    </div>
  );
}

/**
 * 01 · LA FRANJA TESTIGO (Manual de Marca v1.1 - Pág. 15)
 * Diagonal a 45°, franja y hueco en proporción 4:3.
 * Variantes permitidas: Cobre/Gasa, Petróleo/Gasa, Cobre/Petróleo y Blanco/Petróleo.
 */
export function FranjaTestigo({
  variant = "cobre-petroleo",
  className,
}: {
  variant?:
    | "cobre-gasa"
    | "petroleo-gasa"
    | "cobre-petroleo"
    | "blanco-petroleo";
  className?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    "cobre-gasa": {
      backgroundImage:
        "repeating-linear-gradient(-45deg, #B9673A 0px, #B9673A 8px, #F6F3EE 8px, #F6F3EE 14px)",
    },
    "petroleo-gasa": {
      backgroundImage:
        "repeating-linear-gradient(-45deg, #0F3A40 0px, #0F3A40 8px, #F6F3EE 8px, #F6F3EE 14px)",
    },
    "cobre-petroleo": {
      backgroundImage:
        "repeating-linear-gradient(-45deg, #B9673A 0px, #B9673A 8px, #0F3A40 8px, #0F3A40 14px)",
    },
    "blanco-petroleo": {
      backgroundImage:
        "repeating-linear-gradient(-45deg, #FFFFFF 0px, #FFFFFF 8px, #0F3A40 8px, #0F3A40 14px)",
    },
  };

  return (
    <div
      style={styles[variant]}
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
    />
  );
}

/**
 * 14 · FAMILIA DE ÍCONOS PROPIOS (Manual de Marca v1.1 - Pág. 16 + Catálogo 2027)
 * Trazo 1.5 · Terminaciones redondas · Grilla 24
 */
export function BrandFamilyIcon({
  familia,
  className,
}: {
  familia: string;
  className?: string;
}) {
  const f = (familia || "").toLowerCase();

  const renderPaths = () => {
    if (f.includes("bajalengua")) {
      return (
        <>
          <rect
            x="4"
            y="10"
            width="16"
            height="4"
            rx="2"
            transform="rotate(-30 12 12)"
          />
          <rect
            x="4"
            y="10"
            width="16"
            height="4"
            rx="2"
            transform="rotate(30 12 12)"
          />
        </>
      );
    }
    if (f.includes("hisopo")) {
      return (
        <>
          <line x1="5" y1="19" x2="15.5" y2="8.5" />
          <ellipse
            cx="17.5"
            cy="6.5"
            rx="3.2"
            ry="2"
            transform="rotate(-45 17.5 6.5)"
          />
        </>
      );
    }
    if (f.includes("gasa") || f.includes("compresa") || f.includes("sms") || f.includes("tela")) {
      return (
        <>
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
          <line x1="9.3" y1="4" x2="9.3" y2="20" />
          <line x1="14.7" y1="4" x2="14.7" y2="20" />
          <line x1="4" y1="9.3" x2="20" y2="9.3" />
          <line x1="4" y1="14.7" x2="20" y2="14.7" />
        </>
      );
    }
    if (f.includes("recolector") || f.includes("bolsas termosoldables")) {
      return (
        <>
          <rect x="6" y="4" width="12" height="3" rx="1" />
          <path d="M7 7H17V18.5C17 19.6 16.1 20.5 15 20.5H9C7.9 20.5 7 19.6 7 18.5V7Z" />
          <line x1="10" y1="11" x2="14" y2="11" />
          <line x1="10" y1="14" x2="14" y2="14" />
          <line x1="10" y1="17" x2="13" y2="17" />
        </>
      );
    }
    if (f.includes("llave")) {
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <line x1="4" y1="12" x2="9" y2="12" />
          <line x1="15" y1="12" x2="20" y2="12" />
          <line x1="12" y1="5" x2="12" y2="9" />
          <line x1="9" y1="5" x2="15" y2="5" />
          <line x1="12" y1="15" x2="12" y2="19" />
        </>
      );
    }
    if (f.includes("camisol") || f.includes("protección") || f.includes("proteccion")) {
      return (
        <path d="M9 4L4 7.5L6.2 11L8.5 9.5V20H15.5V9.5L17.8 11L20 7.5L15 4C14.2 5.2 13.2 5.8 12 5.8C10.8 5.8 9.8 5.2 9 4Z" />
      );
    }
    if (f.includes("descartador")) {
      return (
        <>
          <path d="M6 7H18L17 20H7L6 7Z" />
          <path d="M5 7H19" />
          <path d="M9 4.5H15V7H9V4.5Z" />
          <line x1="12" y1="11" x2="12" y2="16" />
          <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
        </>
      );
    }
    if (
      f.includes("pouch") ||
      f.includes("polietileno") ||
      f.includes("papel") ||
      f.includes("bobina") ||
      f.includes("empaque") ||
      f.includes("dispenser")
    ) {
      return (
        <>
          <ellipse cx="9.5" cy="12" rx="4.5" ry="6.5" />
          <ellipse cx="9.5" cy="12" rx="1.6" ry="2.6" />
          <path d="M9.5 5.5H16.5C18.4 5.5 20 8.4 20 12V17.5H13" />
          <line x1="13" y1="18.5" x2="20" y2="18.5" />
        </>
      );
    }
    if (f.includes("biológ") || f.includes("biolog") || f.includes("ampolla") || f.includes("control")) {
      return (
        <>
          <rect x="9" y="3.5" width="6" height="3.5" rx="1" />
          <path d="M9.5 7H14.5V17.5C14.5 19.2 13.4 20.5 12 20.5C10.6 20.5 9.5 19.2 9.5 17.5V7Z" />
          <line x1="9.5" y1="13" x2="14.5" y2="13" />
        </>
      );
    }
    if (f.includes("cinta") || f.includes("químic") || f.includes("quimic") || f.includes("integrador")) {
      return (
        <>
          <circle cx="10.5" cy="12" r="5.5" />
          <circle cx="10.5" cy="12" r="2.2" />
          <path d="M10.5 17.5H20V14.5H15.5" />
        </>
      );
    }
    if (f.includes("cartucho") || f.includes("óxido") || f.includes("oxido") || f.includes("etileno")) {
      return (
        <>
          <rect x="7.5" y="7.5" width="9" height="13" rx="2.5" />
          <path d="M9.5 7.5V5.5C9.5 4.9 10 4.5 10.5 4.5H13.5C14 4.5 14.5 4.9 14.5 5.5V7.5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </>
      );
    }
    if (f.includes("enzim") || f.includes("limpieza")) {
      return (
        <>
          <path d="M7 8.5C7 7.4 7.9 6.5 9 6.5H15L17.5 9V18.5C17.5 19.6 16.6 20.5 15.5 20.5H9C7.9 20.5 7 19.6 7 18.5V8.5Z" />
          <rect x="9" y="3.5" width="4" height="3" rx="0.8" />
          <path d="M10.2 12L14.2 16M14.2 12L10.2 16" />
        </>
      );
    }
    if (f.includes("desinfectante") || f.includes("gel")) {
      return (
        <path d="M12 3.8C12 3.8 6.5 10.2 6.5 14.5C6.5 17.5 9 20 12 20C15 20 17.5 17.5 17.5 14.5C17.5 10.2 12 3.8 12 3.8Z" />
      );
    }
    if (f.includes("selladora") || f.includes("equipamiento")) {
      return (
        <>
          <rect x="4" y="10" width="16" height="6" rx="1.5" />
          <path d="M7 10V6.5H17V10" />
          <line x1="4" y1="13" x2="20" y2="13" />
          <line x1="7" y1="16" x2="7" y2="19" />
          <line x1="17" y1="16" x2="17" y2="19" />
        </>
      );
    }
    if (f.includes("máscara") || f.includes("mascara")) {
      return (
        <>
          <path d="M6.5 10.5C6.5 6.9 8.9 4.5 12 4.5C15.1 4.5 17.5 6.9 17.5 10.5V14.5C17.5 17.5 15 19.8 12 19.8C9 19.8 6.5 17.5 6.5 14.5V10.5Z" />
          <rect x="8.5" y="8" width="7" height="4.5" rx="2" />
          <circle cx="12" cy="16" r="1.6" />
        </>
      );
    }
    if (f.includes("seguridad")) {
      return (
        <>
          <path d="M12 3.5L19 6.5V12C19 16.2 16 19.4 12 20.8C8 19.4 5 16.2 5 12V6.5L12 3.5Z" />
          <path d="M9.2 12.2L11.2 14.2L15.2 10.2" />
        </>
      );
    }
    // Default: Guantes (Línea 01)
    return (
      <path d="M8.5 11V6.5C8.5 5.7 9.1 5 9.9 5C10.7 5 11.3 5.7 11.3 6.5V10M11.3 6C11.3 5.2 11.9 4.5 12.7 4.5C13.5 4.5 14.1 5.2 14.1 6V10M14.1 6.8C14.1 6 14.7 5.3 15.5 5.3C16.3 5.3 16.9 6 16.9 6.8V11.5M16.9 8.5C16.9 7.8 17.5 7.2 18.2 7.2C18.9 7.2 19.5 7.8 19.5 8.5V14.5C19.5 17.8 16.8 20.5 13.5 20.5H11C8.2 20.5 6.2 18.6 5.5 16L4.6 12.8C4.3 11.9 4.8 11 5.7 10.8C6.5 10.6 7.3 11 7.7 11.8L8.5 13V11Z" />
    );
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5 shrink-0", className)}
    >
      {renderPaths()}
    </svg>
  );
}

/**
 * Devuelve el color oficial de línea según el Manual de Marca (Pág. 13)
 */
export function getLineColorHex(nombreLineaOrNum?: string | number | null): string {
  if (typeof nombreLineaOrNum === "number") {
    switch (nombreLineaOrNum) {
      case 1:
        return "#B9673A"; // Descartables
      case 2:
        return "#1E7F7A"; // Empaque para esterilización
      case 3:
        return "#C8952B"; // Control de esterilización
      case 4:
        return "#8C3B4A"; // Óxido de etileno
      case 5:
        return "#2E6E9E"; // Limpieza y desinfección
      case 6:
        return "#55656A"; // Equipamiento y seguridad
      default:
        return "#B9673A";
    }
  }
  const n = (nombreLineaOrNum || "").toLowerCase();
  if (n.includes("descartable")) return "#B9673A";
  if (n.includes("empaque") || n.includes("pouch") || n.includes("papel"))
    return "#1E7F7A";
  if (n.includes("control") || n.includes("indicador")) return "#C8952B";
  if (n.includes("óxido") || n.includes("oxido") || n.includes("etileno"))
    return "#8C3B4A";
  if (n.includes("limpieza") || n.includes("enzim")) return "#2E6E9E";
  if (n.includes("equipamiento") || n.includes("seguridad")) return "#55656A";
  return "#B9673A";
}
