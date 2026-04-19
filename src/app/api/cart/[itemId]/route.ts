import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import Semester from '@/models/Semester';
import { getSession } from '@/lib/auth';

// DELETE /api/cart/[itemId] - Remove a single course from cart
export async function DELETE(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const activeSemester = await Semester.findOne({ isRegistrationTerm: true });
  if (!activeSemester) {
    return NextResponse.json({ error: 'No active registration period' }, { status: 400 });
  }

  const cart = await Cart.findOne({
    student: session._id,
    semester: activeSemester._id,
  });

  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  // Remove the item (itemId is the course ID in the items array)
  cart.items = cart.items.filter(
    (item: any) => item.course.toString() !== params.itemId
  );
  await cart.save();

  // Return updated cart
  const updatedCart = await Cart.findById(cart._id).populate({
    path: 'items.course',
    populate: { path: 'department', select: 'name code' }
  });

  const totalCredits = updatedCart.items.reduce((sum: number, item: any) => {
    return sum + (item.course?.creditHours || 0);
  }, 0);

  return NextResponse.json({
    ...updatedCart.toObject(),
    totalCredits,
  });
}