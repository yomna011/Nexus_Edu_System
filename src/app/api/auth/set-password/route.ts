import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword, getSession } from '@/lib/auth';
import { validatePassword } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPassword, confirmPassword } = await req.json();
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }
    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { error: 'Password must be 8+ chars with upper, lower, number, and special' },
        { status: 400 }
      );
    }

    await dbConnect();
    const hashed = await hashPassword(newPassword);
    await User.findByIdAndUpdate(session._id, {
      password: hashed,
      forcePasswordChange: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}