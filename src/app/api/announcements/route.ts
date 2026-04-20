import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Announcement from '@/models/Announcement';
import { getSession } from '@/lib/auth';

// GET /api/announcements
// - Without ?all=true: returns active, non-expired announcements for the current user's role
// - With ?all=true: returns all announcements (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get('all') === 'true';

    // Admin-only restriction for fetching all announcements
    if (showAll && !['ADMIN', 'IT_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const query: any = {};

    if (!showAll) {
      // Regular user: only active and non-expired announcements targeted to their role or ALL
      query.isactive = true;
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } },
      ];
      query.targetAudience = { $in: [session.role, 'ALL'] };
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(announcements);
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create a new announcement (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'IT_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    if (!data.title || !data.message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const announcement = await Announcement.create({
      ...data,
      author: session._id,
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'IT_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}