import { NextResponse } from 'next/server';
import { getSessionUser, clearSessionCookie, deleteUserSessions } from '@/lib/auth';

export async function POST() {
  try {
    const user = await getSessionUser();
    
    if (user) {
      await deleteUserSessions(user.id);
    }

    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', clearSessionCookie());

    return response;
  } catch (error) {
    console.error('Error in /api/auth/logout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}