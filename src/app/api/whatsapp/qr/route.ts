import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'prisma', 'whatsapp-status.json');

export async function GET() {
  try {
    if (!fs.existsSync(STATUS_FILE)) {
      return NextResponse.json({
        success: false,
        data: { qrUrl: null, connected: false, phone: null, state: 'offline', message: 'Servidor WhatsApp não iniciado' },
      });
    }

    const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
    // Adiciona timestamp na URL do QR para evitar cache do navegador
    let qrUrl = status.qrUrl || null;
    if (qrUrl) {
      qrUrl = `${qrUrl}?t=${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        qrUrl,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao ler status do WhatsApp' },
      { status: 500 }
    );
  }
}
