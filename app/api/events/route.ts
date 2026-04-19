import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      orderBy: { start: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error in /api/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { status, severity, location, grid, start, duration, lat, lng, notes, affectedCustomers } = body;

    if (!location || !grid || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Location, grid, lat, and lng are required' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        status: status || 'Active',
        severity: severity || 'Medium',
        location,
        grid,
        start: start ? new Date(start) : new Date(),
        duration: duration || null,
        lat,
        lng,
        notes: notes || null,
        affectedCustomers: affectedCustomers || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error in /api/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}