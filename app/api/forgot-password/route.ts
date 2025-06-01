import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if user exists
    return NextResponse.json({ success: true });
  }
  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  // Save token to DB (create a PasswordResetToken model if needed)
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expires,
    },
  });
  // TODO: Send email. For now, log the reset link
  console.log(`Reset link: http://localhost:3000/reset-password?token=${token}`);
  return NextResponse.json({ success: true });
} 