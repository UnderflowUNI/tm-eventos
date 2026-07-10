# 🏛️ Espaço Teixeira Machado

Salão de eventos em **Canaã — MG**, com estrutura completa e ambiente integrado à natureza para festas, casamentos, formaturas, aniversários e confraternizações inesquecíveis.

🔗 **Site:** [tm-eventos.vercel.app](https://tm-eventos.vercel.app/)

## ✨ O espaço

- **Ambiente amplo e coberto**, com capacidade para grandes eventos
- **Integrado à natureza**, com áreas verdes ao redor
- **Buffet próprio**, com cozinha preparada e equipe experiente
- **Churrasco na hora**, servido fresco durante o evento

## 📅 Como agendar

Pelo site é possível:
- Consultar o **calendário de disponibilidade** em tempo real
- **Solicitar um orçamento** em poucos passos, escolhendo o tipo de evento, a data, o número de convidados e os itens do cardápio
- Enviar o pedido **direto pelo WhatsApp**, já formatado

## 📍 Contato

- **Local:** Canaã — MG
- **WhatsApp / Telefone:** disponível na seção de contato do site
- **E-mail:** teixeiramachado43@gmail.com
- **Instagram:** [@teixeiramachado_](https://instagram.com/teixeiramachado_)
- **Atendimento:** todos os dias, das 8h às 20h — visitas técnicas mediante agendamento prévio

---

## 🎨 Design system — "Varanda"

Identidade editorial clara (papel quente + verde-mata), com tema escuro ("varanda à noite"),
tipografia Fraunces/Manrope/IBM Plex Mono e o motivo-assinatura da **linha de telha**.

### Tokens

A fonte única de verdade é [`app/globals.css`](app/globals.css). As cores são triplas RGB
(`--c-bg: 247 241 230`) para o Tailwind aplicar alpha (`bg-accent/10`). O
[`tailwind.config.js`](tailwind.config.js) mapeia cada token para um nome semântico:

| Classe Tailwind | Token | Uso |
| --- | --- | --- |
| `bg` | `--c-bg` | fundo da página |
| `surface`, `surface-2` | `--c-surface`, `--c-surface-2` | cartões e apoios |
| `ink` | `--c-text` | texto principal |
| `muted` | `--c-muted` | texto secundário (AA garantido) |
| `accent`, `accent-contrast` | `--c-accent`, `--c-accent-contrast` | ação primária e texto sobre ela |
| `terra` | `--c-terra` | motivo da telha e detalhes grandes |
| `bronze` | `--c-bronze` | eyebrows e metadados mono |
| `line` | `--c-border` | bordas de 1px |
| `danger` / `success` / `warn` | idem | estados semânticos |

Regras: **componentes nunca usam cor hardcoded** — só esses nomes. Metadados (datas,
preços, CNPJ, rótulos) são sempre `font-mono` + `bronze`. Fotos recebem `.telha-edge`
na borda superior; divisores de seção usam `.telha-divider`.

### Temas e preferências

- O script inline em [`app/layout.tsx`](app/layout.tsx) aplica `data-theme` e
  `data-font-scale` no `<html>` **antes do primeiro paint** (sem flash), lendo
  `localStorage` (`tm-theme`, `tm-font-scale`) com fallback para `prefers-color-scheme`.
- O toggle de tema e o controle **A / A+ / A++** ficam em
  [`components/site/PrefsControls.tsx`](components/site/PrefsControls.tsx). A escala de
  fonte muda o `font-size` do root (100% / 112,5% / 125%) — todo o layout é rem-based.

### Como criar uma página nova no sistema

1. Envolva o conteúdo com o layout compartilhado:
   ```tsx
   import { Header } from "@/components/site/Header";
   import { Footer } from "@/components/site/Footer";

   export default function Pagina() {
     return (
       <>
         <Header />
         <main id="conteudo">{/* seu conteúdo */}</main>
         <Footer />
       </>
     );
   }
   ```
   O `id="conteudo"` é o alvo do skip link do layout raiz.
2. Use apenas classes semânticas (`bg-surface`, `text-muted`, `border-line`…), os
   componentes de [`components/ui/`](components/ui/) (`Button`, `ButtonLink`, `Eyebrow`)
   e as fontes `font-display` / `font-sans` / `font-mono`.
3. Títulos display usam a escala fluida `text-display` / `text-display-sm` / `text-title`.
4. Alvos de toque ≥ `2.75rem` (44px); animações só em `transform`/`opacity` (o
   `prefers-reduced-motion` global já as desativa).

---

*"Seu evento começa aqui."*
