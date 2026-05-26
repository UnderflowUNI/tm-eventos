import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TM Salão de Eventos — Teixeira Machado · Canaã/MG",
  description:
    "Estrutura completa para casamentos, formaturas, aniversários e eventos especiais. Salão de eventos em Canaã - MG.",
  icons: { icon: "/brand/logo-tm.png" },
  openGraph: {
    title: "TM Salão de Eventos",
    description: "Seu evento começa aqui.",
    images: ["/brand/logo-tm.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
