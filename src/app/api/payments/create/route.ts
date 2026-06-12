import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mpFetch, formatMoney } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, method, payer } = body;

    if (!orderId || !method) {
      return NextResponse.json({ success: false, message: 'Pedido e método são obrigatórios' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true, customer: true, items: { include: { product: true, addons: true } } },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Pedido não encontrado' }, { status: 404 });
    }

    const existing = await prisma.payment.findFirst({
      where: { orderId, status: { in: ['PENDENTE', 'EM_PROCESSAMENTO'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const description = `Pedido #${order.orderNumber || order.id.slice(-6).toUpperCase()} - ${order.store.name}`;
    const amount = formatMoney(order.total);
    const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`;

    let paymentData: any = {
      transaction_amount: amount,
      description,
      notification_url: notificationUrl,
      external_reference: order.id,
      payer: {
        email: payer?.email || order.customer?.email || `cliente+${order.customerId}@gbai.local`,
        first_name: order.customer?.name?.split(' ')[0] || 'Cliente',
        last_name: order.customer?.name?.split(' ').slice(1).join(' ') || '',
      },
    };

    if (method === 'pix') {
      paymentData.payment_method_id = 'pix';
    } else if (method === 'credit_card' || method === 'debit_card') {
      if (!body.token || !body.paymentMethodId) {
        return NextResponse.json({ success: false, message: 'Dados do cartão incompletos' }, { status: 400 });
      }
      paymentData.token = body.token;
      paymentData.installments = body.installments || 1;
      paymentData.issuer_id = body.issuerId;
      paymentData.payment_method_id = body.paymentMethodId;
    } else {
      return NextResponse.json({ success: false, message: 'Método não suportado' }, { status: 400 });
    }

    const mpRes = await mpFetch('/v1/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    const mpJson = await mpRes.json();

    if (!mpRes.ok) {
      return NextResponse.json({ success: false, message: mpJson.message || 'Erro no Mercado Pago' }, { status: 500 });
    }

    const qrCode = mpJson.point_of_interaction?.transaction_data?.qr_code || null;
    const qrCodeBase64 = mpJson.point_of_interaction?.transaction_data?.qr_code_base64 || null;
    const ticketUrl = mpJson.point_of_interaction?.transaction_data?.ticket_url || null;

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        status: mpJson.status === 'approved' ? 'APROVADO' : 'PENDENTE',
        mercadoPagoId: String(mpJson.id),
        qrCode,
        qrCodeBase64,
        ticketUrl,
        metadata: JSON.stringify({ mpResponse: mpJson }),
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: mpJson.status === 'approved' ? 'PAGO' : 'PENDENTE' },
    });

    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao criar pagamento' }, { status: 500 });
  }
}
