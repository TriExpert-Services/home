import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface DatabaseConfig {
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  schema: string;
  table_name: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (!action) {
      throw new Error('Missing action parameter');
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
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
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
        throw new Error(`Unknown action: ${action}`);
    }

    await supabase.from('n8n_connection_logs').insert({
      config_id: config.id,
      action,
      status: 'success',
      message: `Action ${action} completed successfully`,
      admin_user_id: user.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in n8n-chat-proxy:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function testConnection(config: DatabaseConfig): Promise<any> {
  const client = new Client({
    hostname: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database_name,
  });

  try {
    await client.connect();
    const result = await client.queryObject(`SELECT COUNT(*) as count FROM ${config.schema}.${config.table_name}`);
    await client.end();

    return {
      connected: true,
      message: 'Connection successful',
      record_count: result.rows[0]?.count || 0,
    };
  } catch (error) {
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    throw new Error(`Connection failed: ${error.message}`);
  }
}

async function getClients(config: DatabaseConfig, params: URLSearchParams): Promise<any> {
  const client = new Client({
    hostname: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database_name,
  });

  try {
    await client.connect();

    const limit = params.get('limit') || '50';
    const offset = params.get('offset') || '0';
    const search = params.get('search') || '';

    let query = `
      SELECT 
        session_id as phone_number,
        COUNT(*) as message_count,
        MAX(created_at) as last_message_at,
        MIN(created_at) as first_message_at
      FROM ${config.schema}.${config.table_name}
    `;

    if (search) {
      query += ` WHERE session_id ILIKE '%${search}%'`;
    }

    query += `
      GROUP BY session_id
      ORDER BY MAX(created_at) DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const result = await client.queryObject(query);
    await client.end();

    return result.rows;
  } catch (error) {
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to get clients: ${error.message}`);
  }
}

async function getConversation(config: DatabaseConfig, params: URLSearchParams): Promise<any> {
  const phoneNumber = params.get('phone_number');
  if (!phoneNumber) {
    throw new Error('Missing phone_number parameter');
  }

  const client = new Client({
    hostname: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database_name,
  });

  try {
    await client.connect();

    const limit = params.get('limit') || '100';
    const offset = params.get('offset') || '0';

    const query = `
      SELECT *
      FROM ${config.schema}.${config.table_name}
      WHERE session_id = '${phoneNumber}'
      ORDER BY created_at ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const result = await client.queryObject(query);
    await client.end();

    return result.rows;
  } catch (error) {
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to get conversation: ${error.message}`);
  }
}

async function getStatistics(config: DatabaseConfig, params: URLSearchParams): Promise<any> {
  const client = new Client({
    hostname: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database_name,
  });

  try {
    await client.connect();

    const startDate = params.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = params.get('end_date') || new Date().toISOString();

    const totalQuery = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT session_id) as total_clients
      FROM ${config.schema}.${config.table_name}
      WHERE created_at BETWEEN '${startDate}' AND '${endDate}'
    `;

    const dailyQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as message_count
      FROM ${config.schema}.${config.table_name}
      WHERE created_at BETWEEN '${startDate}' AND '${endDate}'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const topClientsQuery = `
      SELECT 
        session_id as phone_number,
        COUNT(*) as message_count
      FROM ${config.schema}.${config.table_name}
      WHERE created_at BETWEEN '${startDate}' AND '${endDate}'
      GROUP BY session_id
      ORDER BY COUNT(*) DESC
      LIMIT 15
    `;

    const hourlyQuery = `
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as message_count
      FROM ${config.schema}.${config.table_name}
      WHERE created_at BETWEEN '${startDate}' AND '${endDate}'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `;

    const [totalResult, dailyResult, topClientsResult, hourlyResult] = await Promise.all([
      client.queryObject(totalQuery),
      client.queryObject(dailyQuery),
      client.queryObject(topClientsQuery),
      client.queryObject(hourlyQuery),
    ]);

    await client.end();

    return {
      totals: totalResult.rows[0],
      daily: dailyResult.rows,
      top_clients: topClientsResult.rows,
      hourly: hourlyResult.rows,
    };
  } catch (error) {
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to get statistics: ${error.message}`);
  }
}

async function searchMessages(config: DatabaseConfig, params: URLSearchParams): Promise<any> {
  const searchTerm = params.get('query');
  if (!searchTerm) {
    throw new Error('Missing query parameter');
  }

  const client = new Client({
    hostname: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database_name,
  });

  try {
    await client.connect();

    const limit = params.get('limit') || '50';

    const query = `
      SELECT *
      FROM ${config.schema}.${config.table_name}
      WHERE message ILIKE '%${searchTerm}%'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const result = await client.queryObject(query);
    await client.end();

    return result.rows;
  } catch (error) {
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to search messages: ${error.message}`);
  }
}