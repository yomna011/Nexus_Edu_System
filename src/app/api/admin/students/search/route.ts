import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Build the query to search by name OR ID
    const searchConditions: any[] = [
      { name: { $regex: query, $options: 'i' } }
    ];

    // If the query is a valid MongoDB ObjectId, include it in the search
    if (mongoose.Types.ObjectId.isValid(query)) {
      searchConditions.push({ _id: query });
    }

    const students = await User.find({
      role: 'STUDENT',
      $or: searchConditions
    }).select('name email _id').lean();

    return NextResponse.json({ results: students });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to search students' }, { status: 500 });
  }
}
