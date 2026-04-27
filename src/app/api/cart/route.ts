import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import Course from '@/models/Course';
import Semester from '@/models/Semester';
import { getSession } from '@/lib/auth';

// GET /api/cart - Get current student's cart for active registration semester
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Only students can access cart' }, { status: 403 });
  }

  await dbConnect();
  
  // Find the active registration semester
  const activeSemester = await Semester.findOne({ isRegistrationTerm: true });
  if (!activeSemester) {
    return NextResponse.json({ error: 'No active registration period' }, { status: 400 });
  }

  // Find or create cart
  let cart = await Cart.findOne({
    student: session._id,
    semester: activeSemester._id,
  }).populate({
    path: 'items.course',
    populate: { path: 'department', select: 'name code' }
  });

  if (!cart) {
    cart = await Cart.create({
      student: session._id,
      semester: activeSemester._id,
      items: [],
    });
  }

  // Calculate total credits
  const totalCredits = cart.items.reduce((sum: number, item: any) => {
    return sum + (item.course?.creditHours || 0);
  }, 0);

  return NextResponse.json({
    ...cart.toObject(),
    totalCredits,
  });
}

// POST /api/cart - Add a course to cart with conflict detection
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const { courseId } = await req.json();

  // Validate course exists and is in active semester
  const activeSemester = await Semester.findOne({ isRegistrationTerm: true });
  if (!activeSemester) {
    return NextResponse.json({ error: 'No active registration period' }, { status: 400 });
  }

  const course = await Course.findById(courseId).populate('department');
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }
  if (course.semester?.toString() !== activeSemester._id.toString()) {
    return NextResponse.json({ error: 'Course is not offered in current semester' }, { status: 400 });
  }
  if (course.enrolledCount >= (course.capacity || 30)) {
    return NextResponse.json({ error: 'Course is full' }, { status: 400 });
  }

  // Get or create cart
  let cart = await Cart.findOne({
    student: session._id,
    semester: activeSemester._id,
  }).populate('items.course');

  if (!cart) {
    cart = new Cart({
      student: session._id,
      semester: activeSemester._id,
      items: [],
    });
  }

  // Check if course already in cart
  const alreadyInCart = cart.items.some(
    (item: any) => item.course._id.toString() === courseId
  );
  if (alreadyInCart) {
    return NextResponse.json({ error: 'Course already in cart' }, { status: 409 });
  }

  // US-2.2C: Time conflict detection
  const newCourseSchedule = course.schedule;
  if (newCourseSchedule?.day && newCourseSchedule.startTime) {
    for (const item of cart.items) {
      const existing = item.course as any;
      const existingSchedule = existing.schedule;
      
      if (!existingSchedule?.day) continue;

      // Same day
      if (existingSchedule.day === newCourseSchedule.day) {
        // Check time overlap
        const newStart = timeToMinutes(newCourseSchedule.startTime);
        const newEnd = timeToMinutes(newCourseSchedule.endTime);
        const existStart = timeToMinutes(existingSchedule.startTime);
        const existEnd = timeToMinutes(existingSchedule.endTime);

        if (
          (newStart >= existStart && newStart < existEnd) ||
          (newEnd > existStart && newEnd <= existEnd) ||
          (newStart <= existStart && newEnd >= existEnd)
        ) {
          return NextResponse.json(
            { 
              error: `Time conflict with ${existing.code} (${existingSchedule.day} ${existingSchedule.startTime}-${existingSchedule.endTime})` 
            },
            { status: 409 }
          );
        }
      }
    }
  }

  // Add to cart
  cart.items.push({ course: courseId });
  await cart.save();

  // Populate and return
  cart = await Cart.findById(cart._id).populate({
    path: 'items.course',
    populate: { path: 'department', select: 'name code' }
  });

  const totalCredits = cart.items.reduce((sum: number, item: any) => {
    return sum + (item.course?.creditHours || 0);
  }, 0);

  return NextResponse.json({
    ...cart.toObject(),
    totalCredits,
  });
}

// Helper function to convert "HH:MM" to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}