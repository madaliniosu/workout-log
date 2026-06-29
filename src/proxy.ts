import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const protectedRoutes = ['/dashboard', '/workouts', '/exercises', '/settings', '/analytics', '/calendar', '/history'];

export default auth((req) => {
  const isProtected = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/workouts/:path*', '/exercises/:path*', '/settings/:path*', '/analytics/:path*', '/calendar/:path*', '/history/:path*'],
};
