import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'prisma', 'whatsapp-status.json');
const QR_IMAGE_FILE = path.join(process.cwd(), 'public', 'whatsapp-qr.png');

export async function GET() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
      // Verifica se a imagem do QR realmente existe
      const qrImageExists = status.qrUrl && fs.existsSync(QR_IMAGE_FILE);
      // Adiciona timestamp na URL do QR para evitar cache do navegador
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
