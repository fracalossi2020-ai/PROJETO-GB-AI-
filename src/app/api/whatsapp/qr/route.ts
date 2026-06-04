import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const storeSlug = 'burger-king-gb';
    const link = `${appUrl}/${storeSlug}`;

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
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar QR Code' },
      { status: 500 }
    );
  }
}
