import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const imageFiles = files.filter(file => /\.(jpe?g|png|gif|webp|avif)$/i.test(file));
    return NextResponse.json({ files: imageFiles });
  } catch (error) {
    console.error('Error reading uploads folder:', error);
    return NextResponse.json({ message: 'Failed to read uploads directory' }, { status: 500 });
  }
}
