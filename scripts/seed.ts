import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import your models
import User from '../src/models/User';
import Department from '../src/models/Department';
import Room from '../src/models/Room';
import Semester from '../src/models/Semester';
import Course from '../src/models/Course';

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await User.findOneAndUpdate(
    { email: 'admin@nexusedu.edu' },
    {
      name: 'System Administrator',
      email: 'admin@nexusedu.edu',
      password: adminPassword,
      role: 'IT_ADMIN',
      forcePasswordChange: false,
    },
    { upsert: true, new: true }
  );
  console.log('👤 Admin user ready:', admin.email);

  // 2. Create Departments
  const csDept = await Department.findOneAndUpdate(
    { code: 'CS' },
    {
      name: 'Computer Science',
      code: 'CS',
      college: 'Faculty of Engineering',
      status: 'active',
    },
    { upsert: true, new: true }
  );
  const mathDept = await Department.findOneAndUpdate(
    { code: 'MATH' },
    {
      name: 'Mathematics',
      code: 'MATH',
      college: 'Faculty of Science',
      status: 'active',
    },
    { upsert: true, new: true }
  );
  console.log('🏛️ Departments seeded');

  // 3. Create a few Rooms
  const rooms = [
    { name: 'Room 101', building: 'Science Hall', type: 'CLASSROOM', capacity: 40 },
    { name: 'Lab A', building: 'Tech Wing', type: 'LAB', capacity: 25 },
    { name: 'Lecture Hall 1', building: 'Main Building', type: 'LECTURE_HALL', capacity: 120 },
  ];
  for (const room of rooms) {
    await Room.findOneAndUpdate(
      { name: room.name, building: room.building },
      room,
      { upsert: true }
    );
  }
  console.log('🚪 Rooms seeded');

  // 4. Create active Semester
  const semester = await Semester.findOneAndUpdate(
    { name: 'Fall 2026', academicYear: '2026' },
    {
      name: 'Fall 2026',
      termType: 'FALL',
      academicYear: '2026',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-20'),
      addDropDeadline: new Date('2026-09-15'),
      finalExamStart: new Date('2026-12-10'),
      status: 'active',
      isRegistrationTerm: true,
    },
    { upsert: true, new: true }
  );
  console.log('📅 active semester:', semester.name);

  // 5. Create Sample Courses (optional, but useful for testing)
  const courses = [
    {
      code: 'CS101',
      title: 'Introduction to Programming',
      creditHours: 3,
      type: 'CORE',
      department: csDept._id,
      semester: semester._id,
      schedule: { day: 'MON', startTime: '10:00', endTime: '11:30', room: 'Room 101' },
      capacity: 30,
    },
    {
      code: 'CS201',
      title: 'Data Structures',
      creditHours: 4,
      type: 'CORE',
      department: csDept._id,
      semester: semester._id,
      schedule: { day: 'WED', startTime: '13:00', endTime: '14:30', room: 'Lab A' },
      capacity: 25,
    },
    {
      code: 'MATH101',
      title: 'Calculus I',
      creditHours: 4,
      type: 'CORE',
      department: mathDept._id,
      semester: semester._id,
      schedule: { day: 'TUE', startTime: '09:00', endTime: '10:30', room: 'Lecture Hall 1' },
      capacity: 40,
    },
  ];

  for (const course of courses) {
    await Course.findOneAndUpdate(
      { code: course.code, semester: semester._id },
      course,
      { upsert: true }
    );
  }
  console.log('Sample courses seeded');

  await mongoose.disconnect();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});