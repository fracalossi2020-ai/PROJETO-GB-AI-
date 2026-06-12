import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { name, email, password, phone } = await req.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, message: 'E-mail já cadastrado' }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, phone },
  });

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'GRATUITO',
      status: 'ATIVO',
      price: 0,
      trialEndsAt,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEndsAt,
    },
  });

  const token = signToken(user.id, user.role);

  return NextResponse.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    },
  }, { status: 201 });
}
