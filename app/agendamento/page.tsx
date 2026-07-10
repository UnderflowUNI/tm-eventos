import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Wizard } from "./Wizard";

export const metadata: Metadata = {
  title: "Agendamento — TM Salão de Eventos",
  description:
    "Reserve o espaço para seu evento ou uma mesa no pesque-pague. Monte seu cardápio e receba a estimativa na hora.",
};

export default function AgendamentoPage() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Wizard />
      </main>
      <Footer />
    </>
  );
}
