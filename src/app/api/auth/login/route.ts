import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'E-mail ou senha incorretos' }, { status: 401 });
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ success: false, message: 'E-mail ou senha incorretos' }, { status: 401 });
  }

  const token = signToken(user.id, user.role);

  return NextResponse.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    },
  });
}
