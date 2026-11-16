import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05060a",
};

export const metadata: Metadata = {
  title: {
    default: "ANTAPHARMA ERP — Control de Stock, Finanzas y Esterilización Médica",
    template: "%s | ANTAPHARMA ERP",
  },
  description:
    "Sistema ERP, Inventario, Flujo de Caja y Reportes 100% privado para ANTAPHARMA DISTRIBUIDORA de Insumos de Esterilización Médica.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-antapharma.png",
    apple: "/logo-antapharma.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Antapharma ERP",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
