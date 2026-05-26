// Script para criar a usuária admin (a dona).
// Rode com: npm run db:seed
// Pode editar email/senha/nome aqui antes de rodar.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "dona@teixeiramachado.com";
  const password = "TMachado2026"; // ⚠️ TROQUE depois de criar!
  const name = "Sra. Teixeira Machado";

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Usuária admin já existe: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.adminUser.create({
    data: { email, password: hash, name },
  });

  console.log("\n🎉 Usuária admin criada com sucesso!");
  console.log(`   E-mail:  ${email}`);
  console.log(`   Senha:   ${password}`);
  console.log("\n⚠️  ALTERE A SENHA assim que entrar no sistema!\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
