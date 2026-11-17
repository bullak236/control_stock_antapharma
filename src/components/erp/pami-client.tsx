"use client";

import { useState } from "react";
import {
  HeartHandshake,
  FileCheck2,
  ClipboardList,
  PackageSearch,
  Building,
  Plus,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ErpShell } from "@/components/layout/erp-shell";
import { BentoCard } from "@/components/ui/bento-card";
import {
  FranjaTestigo,
  PuntoTestigoPill,
} from "@/components/brand/antapharma-brand";
import type { ErpSnapshot } from "@/app/actions/erp-actions";

export function PamiClient({ initialData }: { initialData: ErpSnapshot }) {
  const criticalCount = initialData.productos.filter(
    (p) => p.stockActual <= p.stockMinimo
  ).length;

  const [notasPami, setNotasPami] = useState<string[]>([
    "Definir listado específico de insumos y descartables habilitados para PAMI",
    "Configurar alícuotas, precios de convenio y plazos de liquidación PAMI",
    "Agregar generador de remitos y documentación respaldatoria para expedientes",
  ]);
  const [nuevaNota, setNuevaNota] = useState("");

  function handleAgregarNota(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaNota.trim()) return;
    setNotasPami((prev) => [...prev, nuevaNota.trim()]);
    setNuevaNota("");
  }

  return (
    <ErpShell
      title="Sección PAMI · Antapharma"
      subtitle="Apartado exclusivo para convenios, prestaciones, licitaciones y trazabilidad PAMI"
      criticalCount={criticalCount}
    >
      {/* Cabecera Institucional PAMI */}
      <div className="relative mb-6 overflow-hidden rounded-xl border border-[#1E7F7A]/50 bg-[#0F3A40] p-5 sm:p-7 text-white shadow-xl">
        <FranjaTestigo
          variant="cobre-petroleo"
          className="absolute right-0 top-0 bottom-0 w-3 sm:w-4"
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pr-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <PuntoTestigoPill
                label="Módulo PAMI"
                sublabel="APARTADO RESERVADO"
                tone="dark"
              />
              <span className="rounded bg-[#1E7F7A] px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white">
                COMPRAS DEL ESTADO & CONVENIOS
              </span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Gestión Diferenciada PAMI — Antapharma
            </h2>
            <p className="text-xs sm:text-sm text-[#DCEBE8]/85 leading-relaxed">
              Este apartado está preparado dentro del ERP para centralizar las
              opciones operativas de <strong>PAMI</strong> (listas de convenio,
              órdenes de provisión, remitos conformados y seguimiento de
              expedientes) de manera independiente al circuito comercial
              general.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#DCEBE8]/20 bg-[#1D2527]/60 px-4 py-3 text-right">
              <span className="font-mono text-[10px] uppercase text-[#B9673A] font-bold">
                ESTADO DEL APARTADO
              </span>
              <p className="mt-0.5 text-sm font-bold text-white flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#B9673A]" />
                Estructura Lista para Configurar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos previstos para la sección PAMI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          {
            icon: PackageSearch,
            code: "PAMI · 01",
            title: "Padrón de Insumos PAMI",
            desc: "Selección de descartables, gasas, colectores, guantes y pouches incluidos en convenio.",
            color: "#B9673A",
          },
          {
            icon: ClipboardList,
            code: "PAMI · 02",
            title: "Precios y Convenio",
            desc: "Lista diferenciada, condiciones de facturación y actualización por resolución.",
            color: "#1E7F7A",
          },
          {
            icon: FileCheck2,
            code: "PAMI · 03",
            title: "Documentación y Remitos",
            desc: "Emisión prolija de remitos, certificados de lote/vencimiento y trazabilidad.",
            color: "#2E6E9E",
          },
          {
            icon: Building,
            code: "PAMI · 04",
            title: "Liquidaciones y Pagos",
            desc: "Seguimiento de expedientes presentados, plazos de cobro y estado de cuenta.",
            color: "#C8952B",
          },
        ].map((mod) => {
          const Icon = mod.icon;
          return (
            <BentoCard key={mod.code} glowColor="quirofano" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div
                    style={{ backgroundColor: mod.color }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#DCEBE8]/70">
                    {mod.code}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-white">
                  {mod.title}
                </h3>
                <p className="mt-1.5 text-xs text-[#DCEBE8]/75 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCEBE8]/12 flex items-center justify-between font-mono text-[10px] text-[#B9673A]">
                <span>PRÓXIMA ETAPA</span>
                <span>RESERVADO</span>
              </div>
            </BentoCard>
          );
        })}
      </div>

      {/* Anotador de Requerimientos PAMI para próximas iteraciones */}
      <BentoCard glowColor="cobre">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCEBE8]/15 pb-3.5">
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="h-5 w-5 text-[#B9673A]" />
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Checklist y Pendientes para Implementar en PAMI
              </h3>
              <p className="text-xs text-[#DCEBE8]/70">
                Espacio para anotar las opciones específicas que sumaremos en el
                módulo PAMI
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {notasPami.map((nota, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-[#DCEBE8]/15 bg-[#1D2527]/50 px-3.5 py-2.5 text-xs text-white"
            >
              <CheckCircle2 className="h-4 w-4 text-[#B9673A] shrink-0" />
              <span>{nota}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleAgregarNota} className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            placeholder="Agregar recordatorio o función requerida para PAMI..."
            className="input-gasa flex-1 rounded-lg px-3.5 py-2 text-xs outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#B9673A] px-4 py-2 text-xs font-bold text-white hover:bg-[#B9673A]/90"
          >
            <Plus className="h-4 w-4" />
            Sumar a PAMI
          </button>
        </form>
      </BentoCard>
    </ErpShell>
  );
}
