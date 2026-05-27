import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSession } from "@/lib/auth";
import { validateLogin } from "@/lib/validation";
import bcrypt from "bcryptjs";

// Hash real (custo 10) usado quando o e-mail não existe —
// garante tempo constante e impede enumeração de usuários via timing.
const DUMMY_HASH =
  "$2a$10$2JTDpf4L5Pkl8N9v4AZcAOrhkPbQ27b3Wt9l06GHd40/O5YXOuf4S";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const check = validateLogin(body);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const { email, password } = body;

    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Sempre roda bcrypt — mesmo quando usuário não existe — para evitar
    // enumeração de e-mails via diferença de tempo de resposta.
    const hashToCompare = user?.password ?? DUMMY_HASH;
    const passwordOk = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordOk) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = await signSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({ ok: true, name: user.name });
    res.cookies.set("tm_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error("[login] error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("tm_session");
  return res;
}
