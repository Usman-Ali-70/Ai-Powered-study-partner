import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Check for protected routes
  const protectedPaths = ['/dashboard', '/chat', '/explore', '/notes', '/quiz', '/flashcards', '/planner', '/analytics', '/settings'];
  const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  if (!isProtected) return res;

  // Check for auth cookie/token
  // In production, use Supabase auth helpers
  // Allow access if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
    // Supabase not configured — allow access for demo
    return res;
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/explore/:path*',
    '/notes/:path*',
    '/quiz/:path*',
    '/flashcards/:path*',
    '/planner/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ],
};
