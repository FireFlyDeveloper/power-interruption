import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    const device = await prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error in /api/devices/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, status, grid, lat, lng, signalStrength } = body;

    const existingDevice = await prisma.device.findUnique({
      where: { id },
    });

    if (!existingDevice) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const device = await prisma.device.update({
      where: { id },
      data: {
        name: name || existingDevice.name,
        status: status || existingDevice.status,
        grid: grid || existingDevice.grid,
        lat: lat ?? existingDevice.lat,
        lng: lng ?? existingDevice.lng,
        signalStrength: signalStrength ?? existingDevice.signalStrength,
      },
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error in /api/devices/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const existingDevice = await prisma.device.findUnique({
      where: { id },
    });

    if (!existingDevice) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    await prisma.device.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/devices/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}