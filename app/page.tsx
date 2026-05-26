import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Sobre } from "@/components/sections/Sobre";
import { Galeria } from "@/components/sections/Galeria";
import { Agendamento } from "@/components/sections/Agendamento";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <Navbar />
      <Hero />
      <Sobre />
      <Galeria />
      <Agendamento />
      <Footer />
    </main>
  );
}
