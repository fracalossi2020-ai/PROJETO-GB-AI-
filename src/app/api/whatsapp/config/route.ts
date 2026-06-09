import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'prisma', 'whatsapp-config.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {
      enabled: false,
      testNumbers: [],
      welcomeMessage: '',
      keywords: [],
    };
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

function saveConfig(config: any) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ ...config, updatedAt: new Date().toISOString() }, null, 2));
}

export async function GET() {
  try {
    const config = loadConfig();
    return NextResponse.json({ success: true, data: config });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao carregar config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = loadConfig();

    const updated = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    saveConfig(updated);
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao salvar config' }, { status: 500 });
  }
}
