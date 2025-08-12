import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function DELETE(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ message: 'Filename is required' }, { status: 400 });
    }

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ message: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.unlink(filePath);

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ message: 'Failed to delete file' }, { status: 500 });
  }
}
