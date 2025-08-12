import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: true } };

export async function POST(req: Request) {
  const body = await req.json();
  const { filename, fileBase64 } = body;

  if (!filename || !fileBase64) {
    return NextResponse.json({ error: 'Missing filename or fileBase64' }, { status: 400 });
  }

  // Remove header "data:image/png;base64," if exists
  const base64Data = fileBase64.replace(/^data:.+;base64,/, '');

  const uploadDir = path.join(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, filename);

  // Write buffer to disk
  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 200 });
}
