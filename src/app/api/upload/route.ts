import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { requireAuthAndSubscription } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuthAndSubscription(req);
  if ('status' in auth) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Arquivo inválido. Envie uma imagem.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${safeName}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    const filePath = join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${folder}/${uniqueName}`;
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Erro ao fazer upload' }, { status: 500 });
  }
}
