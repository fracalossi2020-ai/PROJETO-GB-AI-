import { NextResponse } from 'next/server';
import { initWhatsApp, getWhatsAppStatus } from '@/lib/whatsapp';

export async function GET() {
  try {
    await initWhatsApp();

    // Aguarda até 5 segundos pelo QR code
    let attempts = 0;
    while (attempts < 20) {
      const status = getWhatsAppStatus();
      if (status.qr) {
        return NextResponse.json({
          success: true,
          data: {
            qrCode: status.qr,
            connected: status.connected,
            message: 'Escaneie com o WhatsApp',
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
      error: 'QR Code não gerado. Tente novamente.',
    }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar QR Code do WhatsApp' },
      { status: 500 }
    );
  }
}
