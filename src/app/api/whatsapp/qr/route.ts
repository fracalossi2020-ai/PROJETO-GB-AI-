import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET() {
  try {
    const phone = '5511999999999';
    const message = encodeURIComponent('Olá! Vi o QR Code e quero fazer um pedido 🍔');
    const link = `https://wa.me/${phone}?text=${message}`;

    const qrBase64 = await QRCode.toDataURL(link, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrBase64,
        link,
        phone,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar QR Code' },
      { status: 500 }
    );
  }
}
