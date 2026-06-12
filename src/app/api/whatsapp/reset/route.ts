import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuthAndSubscription } from '@/lib/api-auth';

const STATUS_FILE = path.join(process.cwd(), 'prisma', 'whatsapp-status.json');
const AUTH_DIR = path.join(process.cwd(), 'prisma', 'baileys-auth');

export async function POST(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(AUTH_DIR, { recursive: true });

    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      qr: null,
      connected: false,
      phone: null,
      state: 'connecting',
      message: 'Sessão resetada. Aguarde o novo QR Code...',
      updatedAt: new Date().toISOString(),
    }, null, 2));

    return NextResponse.json({ success: true, message: 'Sessão resetada. O novo QR Code será gerado em instantes.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
