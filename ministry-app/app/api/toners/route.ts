import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all toner requests
export async function GET() {
  try {
    const toners = await prisma.tonerRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(toners);
  } catch (error) {
    console.error('Error fetching toner requests:', error);
    return NextResponse.json({ error: 'Failed to fetch toner requests' }, { status: 500 });
  }
}

// POST new toner request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const toner = await prisma.tonerRequest.create({
      data: {
        division: body.division,
        printerName: body.printerName,
        model: body.model,
        requestedBy: body.requestedBy,
        pageCounter: body.pageCounter,
        date: body.date,
        notes: body.notes || '',
        status: 'Pending',
      },
    });
    return NextResponse.json(toner, { status: 201 });
  } catch (error) {
    console.error('Error creating toner request:', error);
    return NextResponse.json({ error: 'Failed to create toner request' }, { status: 500 });
  }
}

// PUT update toner request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    const toner = await prisma.tonerRequest.update({
      where: { id: parseInt(id) },
      data,
    });
    return NextResponse.json(toner);
  } catch (error) {
    console.error('Error updating toner request:', error);
    return NextResponse.json({ error: 'Failed to update toner request' }, { status: 500 });
  }
}

// DELETE toner request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Toner request ID required' }, { status: 400 });
    }

    await prisma.tonerRequest.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting toner request:', error);
    return NextResponse.json({ error: 'Failed to delete toner request' }, { status: 500 });
  }
}
