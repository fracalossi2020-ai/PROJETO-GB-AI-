import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('http://localhost:3001/disable', {
      method: 'POST',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Servidor WhatsApp não está rodando' },
      { status: 503 }
    );
  }
}
