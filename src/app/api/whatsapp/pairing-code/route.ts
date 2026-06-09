import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PAIRING_REQUEST_FILE = path.join(process.cwd(), 'prisma', 'pairing-request.json');
const STATUS_FILE = path.join(process.cwd(), 'prisma', 'whatsapp-status.json');

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      return NextResponse.json({ success: false, message: 'Número de telefone é obrigatório' }, { status: 400 });
    }

    // Limpa pairing code anterior
    if (fs.existsSync(STATUS_FILE)) {
      const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
      status.pairingCode = null;
      fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    }

    // Escreve pedido de pairing code
    fs.writeFileSync(PAIRING_REQUEST_FILE, JSON.stringify({ phoneNumber, requestedAt: new Date().toISOString() }, null, 2));

    // Aguarda o servidor WhatsApp gerar o código (até 15 segundos)
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (fs.existsSync(STATUS_FILE)) {
        const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
        if (status.pairingCode) {
          return NextResponse.json({ success: true, data: { code: status.pairingCode } });
        }
        if (status.connected) {
          return NextResponse.json({ success: false, message: 'WhatsApp já está conectado' });
        }
      }
    }

    return NextResponse.json({ success: false, message: 'Tempo esgotado. O servidor WhatsApp pode estar reiniciando. Tente novamente em alguns segundos.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao gerar código' }, { status: 500 });
  }
}
