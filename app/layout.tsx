import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Velocity — Panel Interno",
  description: "Panel interno de gestión de clientes y campañas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full flex" style={{ background: "#0f1117" }}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
