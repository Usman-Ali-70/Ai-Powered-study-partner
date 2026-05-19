import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export function createServerClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Resolves the authenticated user from a request. Looks at the
 * `Authorization: Bearer <jwt>` header first (set by the client),
 * then falls back to nothing.
 *
 * Returns the Supabase user id (UUID) or null. API routes that need
 * to insert rows tied to the authenticated user must call this and
 * 401 if it returns null.
 */
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) return null;

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
