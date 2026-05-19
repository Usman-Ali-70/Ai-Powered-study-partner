import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * OAuth + email confirmation callback.
 *
 * Supabase delivers two flow shapes:
 *   1. Implicit / hash flow → tokens are in the URL fragment (#access_token=...).
 *      Server can't see fragments, so we just redirect; supabase-js on the
 *      destination page picks up the session from the URL automatically.
 *   2. PKCE / code flow → `?code=...` is in the query string. We exchange it
 *      here on the server and then redirect.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL('/login', origin);
      url.searchParams.set('error', error.message);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
