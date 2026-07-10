import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

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

// Roda antes do primeiro paint: aplica tema e escala de fonte persistidos
// (ou a preferência do sistema) para não haver flash de tema errado.
const prefsScript = `(function(){try{
var t=localStorage.getItem("tm-theme");
if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}
document.documentElement.dataset.theme=t;
var f=localStorage.getItem("tm-font-scale");
if(f==="1"||f==="2"){document.documentElement.dataset.fontScale=f}
}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
