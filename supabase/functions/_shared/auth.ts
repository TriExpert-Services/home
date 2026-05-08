/**
 * Shared bearer-auth helper for the public REST edge functions
 * (api-leads, api-translations, api-reviews, api-stats, api-notifications).
 *
 * These functions are designed to be called by n8n with the
 * SUPABASE_SERVICE_ROLE_KEY as a bearer token (see N8N_API_DOCUMENTATION.md).
 * Until this helper, the auth header was never validated — anyone on the
 * internet could call them.
 *
 * Accepts either:
 *   - Bearer = SUPABASE_SERVICE_ROLE_KEY (n8n machine-to-machine)
 *   - Bearer = a logged-in admin user's JWT (admin panel)
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthSuccess {
  ok: true;
  caller: 'service' | 'admin_user';
  userId?: string;
  supabase: SupabaseClient;
}

export interface AuthFailure {
  ok: false;
  status: number;
  body: { success: false; error: string };
}

export type AuthResult = AuthSuccess | AuthFailure;

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '*')
  .split(',')
  .map((o) => o.trim());

export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allow =
    ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)
      ? origin || '*'
      : ALLOWED_ORIGINS[0] ?? '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  };
}

/**
 * Constant-time string compare so token validation does not leak
 * timing information.
 */
function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function requireAdminOrService(req: Request): Promise<AuthResult> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      ok: false,
      status: 500,
      body: { success: false, error: 'Server misconfigured' },
    };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      body: { success: false, error: 'Missing bearer token' },
    };
  }

  const token = authHeader.slice('Bearer '.length).trim();

  // Path A: machine-to-machine (n8n) — bearer is the service role key.
  if (timingSafeEq(token, serviceRoleKey)) {
    return { ok: true, caller: 'service', supabase };
  }

  // Path B: admin user JWT — verify and check is_admin.
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return {
      ok: false,
      status: 401,
      body: { success: false, error: 'Unauthorized' },
    };
  }

  const { data: isAdminRow, error: rpcError } = await supabase.rpc('is_admin', {
    check_user_id: user.id,
  });
  if (rpcError || isAdminRow !== true) {
    return {
      ok: false,
      status: 403,
      body: { success: false, error: 'Forbidden' },
    };
  }

  return { ok: true, caller: 'admin_user', userId: user.id, supabase };
}

export function jsonResponse(
  body: unknown,
  status: number,
  cors: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
