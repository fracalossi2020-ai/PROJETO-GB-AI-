import { NextResponse } from 'next/server';
import { initWhatsApp, getWhatsAppStatus } from '@/lib/whatsapp';

export async function GET() {
  try {
    await initWhatsApp();

    // Aguarda um pouco para o QR code ser gerado
    let attempts = 0;
    while (attempts < 10) {
      const status = getWhatsAppStatus();
      if (status.qr) {
        return NextResponse.json({
          success: true,
          data: {
            qrCode: status.qr,
            connected: status.connected,
            expiresAt: new Date(Date.now() + 60 * 1000).toISOString(),
          },
        });
      }
      if (status.connected) {
        return NextResponse.json({
          success: true,
          data: {
            qrCode: null,
            connected: true,
            message: 'WhatsApp já conectado',
          },
        });
      }
      await new Promise(r => setTimeout(r, 500));
      attempts++;
    }

    return NextResponse.json({
      success: false,
      error: 'QR Code não gerado ainda. Tente novamente.',
    }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar QR Code do WhatsApp' },
      { status: 500 }
    );
  }
}
