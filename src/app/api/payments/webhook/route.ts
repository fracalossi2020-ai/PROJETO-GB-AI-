import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

function verifySignature(signature: string | null, body: string, queryId?: string | null) {
  if (!WEBHOOK_SECRET) return true;
  if (!signature) return false;

  const parts = signature.split(',');
  const tsPart = parts.find(p => p.startsWith('ts='));
  const v1Part = parts.find(p => p.startsWith('v1='));
  if (!tsPart || !v1Part) return false;

  const ts = tsPart.split('=')[1];
  const hash = v1Part.split('=')[1];
  const idPart = queryId ? `?data.id=${queryId}&type=payment` : '';
  const template = `id:${queryId || ''}${idPart};request-id:;ts:${ts};`;
  const crypted = crypto.createHmac('sha256', WEBHOOK_SECRET).update(template).digest('hex');
  return crypted === hash;
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-signature');
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get('data.id');
    const body = await req.text();

    if (!verifySignature(signature, body, queryId)) {
      return NextResponse.json({ success: false, message: 'Assinatura inválida' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const type = payload.type || searchParams.get('type');

    if (type !== 'payment' || !payload.data?.id) {
      return NextResponse.json({ success: true, message: 'Evento ignorado' });
    }

    const mpPaymentId = String(payload.data.id);

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
    });

    if (!mpRes.ok) {
      return NextResponse.json({ success: false, message: 'Erro ao consultar Mercado Pago' }, { status: 500 });
    }

    const mpJson = await mpRes.json();
    const orderId = mpJson.external_reference;
    const status = mpJson.status;

    if (!orderId) {
      return NextResponse.json({ success: true, message: 'Sem external_reference' });
    }

    const paymentStatus = status === 'approved' ? 'APROVADO' : status === 'pending' || status === 'in_process' ? 'PENDENTE' : 'REJEITADO';

    await prisma.payment.updateMany({
      where: { mercadoPagoId: mpPaymentId },
      data: {
        status: paymentStatus,
        paidAt: status === 'approved' ? new Date() : null,
        metadata: JSON.stringify({ mpResponse: mpJson }),
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: status === 'approved' ? 'PAGO' : 'PENDENTE' },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro no webhook' }, { status: 500 });
  }
}
