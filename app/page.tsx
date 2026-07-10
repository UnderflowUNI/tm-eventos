import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/sections/Hero";
import { Sobre } from "@/components/sections/Sobre";
import { Galeria } from "@/components/sections/Galeria";
import { Agendamento } from "@/components/sections/Agendamento";

export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />
        <Sobre />
        <Galeria />
        <Agendamento />
      </main>
      <Footer />
    </>
  );
}
