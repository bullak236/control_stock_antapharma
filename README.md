# ANTAPHARMA ERP — Control de Stock, Flujo de Caja y Esterilización Médica

Sistema ERP, Dashboard Bento Grid y PWA 100% privado desarrollado para **ANTAPHARMA DISTRIBUIDORA** (provisión de insumos de esterilización médica), diseñado para la gestión integral de Dirección General (**David**).

## Arquitectura y Stack Tecnológico

- **Frontend & Backend:** Next.js 16 (App Router, Server Actions, Edge Middleware) + React 19 + TypeScript.
- **UI/UX Design System:** Basado en la arquitectura visual de [OpenHero](https://github.com/CristianOlivera1/openhero) — Tailwind CSS v4 (`oklch` Dark Theme), Glassmorphism, Bento Grid, `VercelTabs`, `LiquidMetalButton` y animaciones con Framer Motion.
- **Base de Datos:** PostgreSQL en **Supabase** (`campjwuaytuoqwrvdjss` - Proyecto `ANTAPHARMA`) modelado con **Prisma ORM** (`prisma/schema.prisma`) y cliente Edge `@supabase/supabase-js`.
- **Reportes Documentales:**
  - **PDF:** Catálogo oficial con membrete y precios (`jspdf` + `jspdf-autotable`).
  - **XLSX:** Libro contable multi-hoja de Ventas, Compras, Inventario y Kardex (`xlsx`).
  - **CSV:** Exportación plana UTF-8 (`papaparse`).
- **Infraestructura Edge:** Cloudflare Workers / Pages (`*.workers.dev` / `*.pages.dev`).

## Modelos de Datos (`prisma/schema.prisma`)

1. **`Usuario` (`erp_usuarios`):** Control de acceso (`email`, `password_hash`, `rol`).
2. **`Categoria` (`erp_categorias`):** Agrupación técnica de insumos de esterilización.
3. **`Producto` (`erp_productos`):** `id`, `codigo`, `nombre`, `medida`, `presentacion`, `stockActual`, `stockMinimo`, `precioCosto`, `precioVenta`, `categoriaId`.
4. **`Entidad` (`erp_entidades`):** Clientes (Hospitales/Sanatorios) y Proveedores (`CLIENTE` / `PROVEEDOR`).
5. **`MovimientoStock` (`erp_movimientos_stock`):** Kardex de trazabilidad (`ENTRADA` / `SALIDA`).
6. **`TransaccionFinanciera` (`erp_transacciones_financieras`):** Flujo de caja (`INGRESO` / `EGRESO`).
7. **`LogAuditoria` (`erp_logs_auditoria`):** Bitácora de seguridad interna.

## Rutas Principales

- `/` — Login privado minimalista + `src/middleware.ts` de bloqueo estricto sin sesión.
- `/dashboard` — Panel Bento Grid con Ingresos, Egresos, Ganancia Neta, Valorización de Inventario y Alertas de Stock Crítico con reposición en 1 clic.
- `/productos` — Tabla responsiva, filtrable y paginada con CRUD de insumos, ajuste masivo porcentual de precios y registro de entradas/salidas de stock.
- `/entidades` — Directorio CRUD de Hospitales, Clínicas y Laboratorios Proveedores.
- `/finanzas` — Libro de Caja para asentar ingresos por ventas y egresos por compras de mercadería.
- `/reportes` — Cruce matricial de datos y exportación instantánea en PDF, XLSX y CSV.
