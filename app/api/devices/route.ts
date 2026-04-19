import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const devices = await prisma.device.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error in /api/devices:', error);
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
    const { name, status, grid, lat, lng, signalStrength } = body;

    if (!name || !grid || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Name, grid, lat, and lng are required' },
        { status: 400 }
      );
    }

    const device = await prisma.device.create({
      data: {
        name,
        status: status || 'offline',
        grid,
        lat,
        lng,
        signalStrength: signalStrength || null,
      },
    });

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    console.error('Error in /api/devices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}