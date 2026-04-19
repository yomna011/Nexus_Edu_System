import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { generateEmail, generateTemporaryPassword } from '@/lib/utils';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const roleParam = searchParams.get('role');
  const department = searchParams.get('department');
  
  const query: any = {};
  
  if (roleParam) {
    const roles = roleParam.split(',').map(r => r.trim().toUpperCase());
    query.role = { $in: roles };
  }
  if (department) query.department = department;

  const users = await User.find(query)
    .select('-password')
    .populate('department', 'name code');
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, nationalId, departmentId, role } = await req.json();

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    let email = generateEmail(firstName, lastName);

    let exists = await User.findOne({ email });
    let counter = 1;
    const baseEmail = email;
    while (exists) {
      email = `${baseEmail.split('@')[0]}${counter}@nexusedu.edu`;
      exists = await User.findOne({ email });
      counter++;
    }

    const tempPassword = generateTemporaryPassword();
    const hashed = await hashPassword(tempPassword);

    const user = await User.create({
      name,
      email,
      password: hashed,
      nationalId,
      department: departmentId || null,
      role,
      forcePasswordChange: true,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        temporaryPassword: tempPassword,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 400 }
    );
  }
}