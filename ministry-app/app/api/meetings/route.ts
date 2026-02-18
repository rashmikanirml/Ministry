import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all meetings
export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

// POST new meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const meeting = await prisma.meeting.create({
      data: {
        name: body.name,
        email: body.email,
        department: body.department,
        purpose: body.purpose,
        date: body.date,
        time: body.time,
        status: 'Pending',
      },
    });
    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}

// PUT update meeting
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    const meeting = await prisma.meeting.update({
      where: { id: parseInt(id) },
      data,
    });
    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

// DELETE meeting
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 });
    }

    await prisma.meeting.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}
