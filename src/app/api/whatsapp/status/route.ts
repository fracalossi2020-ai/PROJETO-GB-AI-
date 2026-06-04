import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'prisma', 'whatsapp-status.json');

export async function GET() {
  try {
    if (!fs.existsSync(STATUS_FILE)) {
      return NextResponse.json({
        success: false,
        data: { connected: false, phone: null, state: 'offline' },
      });
    }

    const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
    return NextResponse.json({
      success: true,
      data: {
        connected: status.connected,
        phone: status.phone,
        state: status.state,
        message: status.message,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao ler status' },
      { status: 500 }
    );
  }
}
