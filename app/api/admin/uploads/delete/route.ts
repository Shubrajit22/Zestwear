import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { auth } from '@/lib/auth1'; 
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user) return { status: 401, message: 'Unauthorized' };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user?.isAdmin) return { status: 403, message: 'Forbidden' };

  return null; // ✅ Passed
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function DELETE(request: NextRequest) {
  const authError = await checkAdmin();
        if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });
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
