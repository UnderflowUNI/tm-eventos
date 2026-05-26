import "dotenv/config";
import { google } from "googleapis";

async function main() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  console.log("\n=== Variáveis de ambiente ===");
  console.log("GOOGLE_CLIENT_EMAIL:", email ? "✅ definido" : "❌ vazio");
  console.log(
    "GOOGLE_PRIVATE_KEY:",
    key ? `✅ definido (${key.length} chars)` : "❌ vazio"
  );
  console.log("GOOGLE_CALENDAR_ID:", calendarId ? "✅ definido" : "❌ vazio");

  if (!email || !key || !calendarId) {
    console.error("\n❌ Faltam variáveis no .env. Abortando.");
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  const cal = google.calendar({ version: "v3", auth });

  console.log("\n=== Teste 1/3 · Autenticação ===");
  try {
    await auth.authorize();
    console.log("✅ Autenticou com sucesso na conta de serviço");
  } catch (e: any) {
    console.error("❌ Falhou ao autenticar:", e.message);
    process.exit(1);
  }

  console.log("\n=== Teste 2/3 · Inserir evento ===");
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  let inseridoId: string | null = null;
  try {
    const res = await cal.events.insert({
      calendarId,
      requestBody: {
        summary: "🧪 TESTE — integração TM Eventos",
        description: "Evento de teste criado pelo script test-gcal.ts. Pode apagar.",
        start: { date: hoje.toISOString().split("T")[0] },
        end: { date: amanha.toISOString().split("T")[0] },
      },
    });
    inseridoId = res.data.id || null;
    console.log("✅ Evento criado com ID:", inseridoId);
    console.log("   Abre o Google Calendar — deve ter um evento 'TESTE' hoje");
  } catch (e: any) {
    console.error("❌ Falhou ao criar evento:", e.message);
    if (e.message?.includes("notFound")) {
      console.error("   → GOOGLE_CALENDAR_ID está errado");
    }
    if (e.message?.includes("forbidden") || e.message?.includes("permission")) {
      console.error(
        "   → A agenda não foi compartilhada com a conta de serviço (ou só como 'Ver', precisa ser 'Fazer alterações')"
      );
    }
    process.exit(1);
  }

  console.log("\n=== Teste 3/3 · Listar eventos do dia ===");
  try {
    const res = await cal.events.list({
      calendarId,
      timeMin: hoje.toISOString(),
      timeMax: amanha.toISOString(),
      singleEvents: true,
    });
    const items = res.data.items || [];
    console.log(`✅ Encontrou ${items.length} evento(s) hoje:`);
    items.forEach((e) => console.log(`   · ${e.summary} (${e.id})`));
  } catch (e: any) {
    console.error("❌ Falhou ao listar:", e.message);
  }

  if (inseridoId) {
    console.log("\n=== Limpando evento de teste ===");
    try {
      await cal.events.delete({ calendarId, eventId: inseridoId });
      console.log("✅ Evento de teste apagado");
    } catch (e: any) {
      console.error("⚠️  Não apagou o evento de teste:", e.message);
      console.error("   Apague manualmente pelo Google Calendar");
    }
  }

  console.log("\n🎉 Tudo certo! A integração tá funcionando.\n");
}

main().catch((e) => {
  console.error("\n💥 Erro inesperado:", e);
  process.exit(1);
});
