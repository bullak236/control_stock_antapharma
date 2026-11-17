import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F3A40",
};

export const metadata: Metadata = {
  title: {
    default: "Antapharma — Descartables e insumos de esterilización",
    template: "%s | Antapharma",
  },
  description:
    "Sistema de gestión de inventario, catálogo 2027, listas de precios por cliente, tesorería y PAMI para Antapharma (Santiago del Estero · Argentina). Cuidamos lo que cuida.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Antapharma",
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
