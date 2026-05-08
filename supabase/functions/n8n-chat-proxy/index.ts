import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '*')
  .split(',')
  .map((o) => o.trim());

function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allow =
    ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)
      ? origin || '*'
      : ALLOWED_ORIGINS[0] ?? '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Client-Info, Apikey',
    Vary: 'Origin',
  };
}

interface DatabaseConfig {
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  schema: string;
  table_name: string;
}

const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;

function quoteIdent(name: string): string {
  if (!IDENT_RE.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return `"${name}"`;
}

function intParam(raw: string | null, fallback: number, min = 0, max = 1000): number {
  const n = raw === null ? fallback : parseInt(raw, 10);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}

function isoParam(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return fallback;
  return d.toISOString();
}

function qualifiedTable(config: DatabaseConfig): string {
  return `${quoteIdent(config.schema)}.${quoteIdent(config.table_name)}`;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing bearer token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.slice('Bearer '.length);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdminRow, error: adminErr } = await supabase.rpc('is_admin', {
      check_user_id: user.id,
    });
    if (adminErr || isAdminRow !== true) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    if (!action) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: config, error: configError } = await supabase
      .from('n8n_database_config')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (configError || !config) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No active n8n database configuration found. Please configure it in Settings.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    switch (action) {
      case 'test_connection':
        result = await testConnection(config);
        break;
      case 'get_clients':
        result = await getClients(config, url.searchParams);
        break;
      case 'get_conversation':
        result = await getConversation(config, url.searchParams);
        break;
      case 'get_statistics':
        result = await getStatistics(config, url.searchParams);
        break;
      case 'search_messages':
        result = await searchMessages(config, url.searchParams);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    await supabase.from('n8n_connection_logs').insert({
      config_id: config.id,
      action,
      status: 'success',
      message: `Action ${action} completed successfully`,
      admin_user_id: user.id,
    });

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in n8n-chat-proxy:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function newClient(config: DatabaseConfig): Promise<Client> {
  return new Client({
    hostname: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database_name,
    tls: { enabled: true, enforce: false },
  });
}

async function testConnection(config: DatabaseConfig): Promise<unknown> {
  const client = await newClient(config);
  try {
    await client.connect();
    const tbl = qualifiedTable(config);
    const result = await client.queryObject(`SELECT COUNT(*)::bigint AS count FROM ${tbl}`);
    return {
      connected: true,
      message: 'Connection successful',
      record_count: Number((result.rows[0] as { count: bigint }).count) || 0,
    };
  } catch (error) {
    throw new Error(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
}

async function getClients(config: DatabaseConfig, params: URLSearchParams): Promise<unknown> {
  const client = await newClient(config);
  try {
    await client.connect();

    const limit  = intParam(params.get('limit'), 50, 1, 500);
    const offset = intParam(params.get('offset'), 0, 0, 1_000_000);
    const search = params.get('search') ?? '';

    const tbl = qualifiedTable(config);
    const where = search ? 'WHERE session_id ILIKE $1' : '';
    const sqlParams: unknown[] = search ? [`%${search}%`] : [];

    const query = `
      SELECT
        session_id AS phone_number,
        COUNT(*)   AS message_count,
        MAX(created_at) AS last_message_at,
        MIN(created_at) AS first_message_at
      FROM ${tbl}
      ${where}
      GROUP BY session_id
      ORDER BY MAX(created_at) DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const result = await client.queryObject(query, sqlParams);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to get clients: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
}

async function getConversation(config: DatabaseConfig, params: URLSearchParams): Promise<unknown> {
  const phoneNumber = params.get('phone_number');
  if (!phoneNumber) throw new Error('Missing phone_number parameter');

  const client = await newClient(config);
  try {
    await client.connect();

    const limit  = intParam(params.get('limit'), 100, 1, 1000);
    const offset = intParam(params.get('offset'), 0, 0, 1_000_000);
    const tbl = qualifiedTable(config);

    const result = await client.queryObject(
      `SELECT *
         FROM ${tbl}
        WHERE session_id = $1
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}`,
      [phoneNumber]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to get conversation: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
}

async function getStatistics(config: DatabaseConfig, params: URLSearchParams): Promise<unknown> {
  const client = await newClient(config);
  try {
    await client.connect();

    const startDate = isoParam(
      params.get('start_date'),
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    );
    const endDate = isoParam(params.get('end_date'), new Date().toISOString());
    const tbl = qualifiedTable(config);

    const totalQuery = `
      SELECT COUNT(*) AS total_messages,
             COUNT(DISTINCT session_id) AS total_clients
        FROM ${tbl}
       WHERE created_at BETWEEN $1 AND $2
    `;
    const dailyQuery = `
      SELECT DATE(created_at) AS date, COUNT(*) AS message_count
        FROM ${tbl}
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY DATE(created_at)
       ORDER BY date ASC
    `;
    const topClientsQuery = `
      SELECT session_id AS phone_number, COUNT(*) AS message_count
        FROM ${tbl}
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY session_id
       ORDER BY COUNT(*) DESC
       LIMIT 15
    `;
    const hourlyQuery = `
      SELECT EXTRACT(HOUR FROM created_at) AS hour, COUNT(*) AS message_count
        FROM ${tbl}
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY EXTRACT(HOUR FROM created_at)
       ORDER BY hour ASC
    `;

    const args = [startDate, endDate];
    const [totalResult, dailyResult, topClientsResult, hourlyResult] = await Promise.all([
      client.queryObject(totalQuery, args),
      client.queryObject(dailyQuery, args),
      client.queryObject(topClientsQuery, args),
      client.queryObject(hourlyQuery, args),
    ]);

    return {
      totals: totalResult.rows[0],
      daily: dailyResult.rows,
      top_clients: topClientsResult.rows,
      hourly: hourlyResult.rows,
    };
  } catch (error) {
    throw new Error(`Failed to get statistics: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
}

async function searchMessages(config: DatabaseConfig, params: URLSearchParams): Promise<unknown> {
  const searchTerm = params.get('query');
  if (!searchTerm) throw new Error('Missing query parameter');

  const client = await newClient(config);
  try {
    await client.connect();

    const limit = intParam(params.get('limit'), 50, 1, 500);
    const tbl = qualifiedTable(config);

    const result = await client.queryObject(
      `SELECT *
         FROM ${tbl}
        WHERE message ILIKE $1
        ORDER BY created_at DESC
        LIMIT ${limit}`,
      [`%${searchTerm}%`]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to search messages: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
}
