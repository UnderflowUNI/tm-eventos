# 🏛️ Espaço Teixeira Machado — Sistema de Eventos

Aplicação completa para o salão de eventos: site público + dashboard admin + sistema de orçamento integrado ao WhatsApp.

## ✨ Funcionalidades

### Site público
- **Hero, Sobre, Galeria, Agendamento, Contato** — todas as seções do protótipo Figma
- **Calendário público** com datas disponíveis/ocupadas/em análise (atualizado pela dona em tempo real)
- **Solicitação de orçamento em 3 passos:**
  1. Tipo de evento, data e número de convidados
  2. Cardápio interativo com cálculo automático (todos os itens dos PDFs anexados)
  3. Dados de contato e envio
- **Envio direto via WhatsApp** com a lista formatada pronta para a dona ler
- **Animações de entrada**, parallax sutil, efeitos de hover, tipografia Fraunces + Manrope

### Dashboard admin (otimizado para idosa)
- Login simples por e-mail/senha
- **Botões grandes** (≥64px), texto ≥18px, cores contrastantes
- **2 abas claras:** Calendário e Pedidos
- **Marcar/liberar datas com 1 clique** — modal grande pergunta "Ocupado" ou "Em análise"
- **Lista de pedidos recebidos** com botão de WhatsApp direto, marcar como contatado/confirmado/recusado
- Notificação visual com badge vermelho quando chega pedido novo

### Integrações (opcionais)
- **Google Calendar** — sincronização automática quando a dona marca uma data
- **WhatsApp Auto** — envio automático via Evolution API ou Z-API (sem precisar clicar no link)

---

## 🚀 Setup local

### 1. Pré-requisitos
- Node.js 20+
- Banco PostgreSQL (Railway, Neon, Supabase, ou local)

### 2. Instalar
```bash
npm install
cp .env.example .env
# edite .env com seus dados (mínimo: DATABASE_URL e JWT_SECRET)
```

### 3. Banco de dados
```bash
npm run db:push      # cria as tabelas
npm run db:seed      # cria a usuária admin (dona@teixeiramachado.com / TMachado2026)
```

### 4. Rodar
```bash
npm run dev
```
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (login: `dona@teixeiramachado.com` / `TMachado2026`)

> ⚠️ **Troque a senha imediatamente** após o primeiro login (editar `scripts/seed.ts` antes ou ajustar direto no banco).

---

## 🌐 Deploy na Vercel

1. Faça push do projeto pro GitHub
2. Importe na Vercel → conecta sozinho
3. Configure as variáveis de ambiente no painel da Vercel (mesmas do `.env.example`)
4. Use Railway para o PostgreSQL (mesma stack do City Explorer)
5. Após o primeiro deploy, rode `npm run db:push` e `npm run db:seed` localmente apontando para o banco de produção

---

## 📅 Integração Google Calendar (OPCIONAL)

Caso queira que as datas marcadas no painel apareçam automaticamente no Google Calendar pessoal da dona:

### Passo a passo:
1. Acesse https://console.cloud.google.com/
2. Crie um projeto novo (ex: "TM Eventos")
3. Ative a **Google Calendar API**
4. Vá em **Credenciais → Criar credenciais → Conta de serviço**
5. Crie a conta, depois clique nela → aba **Chaves → Adicionar chave → JSON**
6. Baixe o JSON. Dentro tem `client_email` e `private_key`
7. Abra o Google Calendar da dona → Configurações → "Compartilhar com pessoas específicas" → adicione o `client_email` com permissão "Fazer alterações em eventos"
8. Copie o **ID do calendário** (Configurações → Integrar agenda → ID da agenda)
9. Preencha no `.env`:
```
GOOGLE_CLIENT_EMAIL="...@...iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID="...@group.calendar.google.com"
```

Pronto — quando a dona marcar uma data, ela aparece no Google Calendar dela.

---

## 💬 WhatsApp automático (OPCIONAL)

Por padrão o sistema gera um **link `wa.me`** que abre o WhatsApp do cliente já com a mensagem formatada. **Funciona 100% sem custo nem configuração.**

Se quiser que o sistema **envie a mensagem sozinho** para a dona (sem o cliente precisar clicar), use uma destas APIs:

### Opção A — Evolution API (gratuita, self-host)
1. Suba uma instância no Railway: https://github.com/EvolutionAPI/evolution-api
2. Conecte um WhatsApp pelo QR code
3. Configure no `.env`:
```
WHATSAPP_API_URL="https://sua-instancia.railway.app"
WHATSAPP_API_KEY="sua-key"
WHATSAPP_INSTANCE="nome-da-instancia"
```

### Opção B — Z-API (paga, mais fácil)
- https://z-api.io — mesmo formato, só trocar a URL

---

## 🛠️ Estrutura

```
tm-eventos/
├── app/
│   ├── page.tsx                    # Landing
│   ├── agendamento/page.tsx        # Fluxo de orçamento
│   ├── admin/
│   │   ├── page.tsx                # Dashboard (auth-gated)
│   │   ├── login/page.tsx          # Login
│   │   └── AdminDashboard.tsx      # UI do dashboard
│   └── api/
│       ├── calendar/route.ts       # GET público
│       ├── booking/route.ts        # POST público
│       ├── auth/login/route.ts     # Login/logout
│       └── admin/
│           ├── calendar/route.ts   # CRUD datas (auth)
│           └── bookings/route.ts   # Listar/atualizar pedidos
├── components/
│   ├── Navbar.tsx
│   ├── PublicCalendar.tsx          # Calendário read-only
│   └── sections/                   # Hero, Sobre, Galeria, etc
├── lib/
│   ├── prisma.ts
│   ├── auth.ts                     # JWT com jose
│   ├── cardapio.ts                 # Dados dos PDFs + cálculo de orçamento
│   ├── whatsapp.ts                 # wa.me + Evolution API
│   ├── google-calendar.ts
│   └── calendar-utils.ts
├── prisma/schema.prisma
└── scripts/seed.ts                 # Cria admin inicial
```

---

## 📝 Ajustando preços do cardápio

Edite `lib/cardapio.ts` — cada item tem `precoPorPessoa`. A dona pode pedir pra você ajustar conforme custos reais. Numa próxima versão dá pra mover isso pro dashboard admin.

---

## 🎨 Customização visual

- Cores: `tailwind.config.js` (cores `ink`, `wood`, `accent`)
- Fontes: `app/globals.css` (Fraunces + Manrope via Google Fonts)
- Imagens: substitua as URLs do Unsplash pelas fotos reais do espaço (recomendo Cloudinary, que você já usa no City Explorer)

---

## 📞 Suporte

Feito por Erick (erickdevz) com Claude.
Stack: Next.js 14 · TypeScript · Tailwind · Prisma · PostgreSQL
