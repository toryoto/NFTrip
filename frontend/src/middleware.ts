import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const protectedRoutes = ['/dashboard', '/spots', '/profile', '/nfts'];
const publicRoutes = ['/', '/login'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path === route);

  const authToken = cookies().get('auth_token')?.value;

  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isPublicRoute && authToken && path !== '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/spots/:path*',
    '/profile/:path*',
    '/nfts/:path*',
  ],
}