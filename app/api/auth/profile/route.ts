import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, email } = body;

    if (!displayName && !email) {
      return NextResponse.json(
        { error: 'Display name or email is required' },
        { status: 400 }
      );
    }

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: displayName || user.displayName,
        email: email || user.email,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in /api/auth/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}