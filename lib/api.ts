import { supabase } from '@/lib/supabase/client';

/**
 * Fetch wrapper that automatically attaches the current user's
 * Supabase access token as a Bearer Authorization header so server
 * routes can identify the user. Use for all mutating API calls.
 *
 * For multipart/form-data requests, pass a FormData as `body` and
 * do not set Content-Type yourself — the browser sets the boundary.
 */
export async function authedFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(init.headers ?? {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, { ...init, headers });
}
