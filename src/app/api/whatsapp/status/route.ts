import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuthAndSubscription } from '@/lib/api-auth';

const STATUS_FILE = path.join(process.cwd(), 'prisma', 'whatsapp-status.json');
const QR_IMAGE_FILE = path.join(process.cwd(), 'public', 'whatsapp-qr.png');

export async function GET(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    if (fs.existsSync(STATUS_FILE)) {
      const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
      const qrImageExists = status.qrUrl && fs.existsSync(QR_IMAGE_FILE);
      let qrUrl = qrImageExists ? status.qrUrl : null;
      if (qrUrl) {
        qrUrl = `${qrUrl}?t=${Date.now()}`;
      }
      return NextResponse.json({
        success: true,
        data: {
          connected: status.connected,
          phone: status.phone,
          state: status.state,
          message: status.message,
          qrUrl: qrUrl,
          pairingCode: status.pairingCode || null,
          updatedAt: status.updatedAt,
        },
      });
    }

    return NextResponse.json({
      success: false,
      data: { connected: false, phone: null, state: 'offline', message: 'Servidor não iniciado' },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao ler status' }, { status: 500 });
  }
}
