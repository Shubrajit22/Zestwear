import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { auth } from '@/lib/auth1'; 
import { prisma } from '@/lib/prisma';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
async function checkAdmin() {
  const session = await auth();
  if (!session?.user) return { status: 401, message: 'Unauthorized' };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user?.isAdmin) return { status: 403, message: 'Forbidden' };

  return null; // ✅ Passed
}
export async function GET() {
    const authError = await checkAdmin();
      if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const imageFiles = files.filter(file => /\.(jpe?g|png|gif|webp|avif)$/i.test(file));
    return NextResponse.json({ files: imageFiles });
  } catch (error) {
    console.error('Error reading uploads folder:', error);
    return NextResponse.json({ message: 'Failed to read uploads directory' }, { status: 500 });
  }
}
