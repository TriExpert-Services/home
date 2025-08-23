import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ContactLead {
  id?: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  message: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  admin_notes?: string;
  follow_up_date?: string;
  estimated_value?: number;
  actual_value?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    console.log(`Leads API Request: ${method} ${path}`)

    // GET /api-leads - List all contact leads
    if (method === 'GET' && (path === '/api-leads' || path === '/')) {
      const searchParams = url.searchParams
      const status = searchParams.get('status')
      const priority = searchParams.get('priority')
      const limit = searchParams.get('limit') || '50'

      let query = supabase
        .from('contact_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit))

      if (status) query = query.eq('status', status)
      if (priority) query = query.eq('priority', priority)

      const { data, error } = await query

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /api-leads/:id - Get specific contact lead
    if (method === 'GET' && path.startsWith('/api-leads/')) {
      const id = path.split('/').pop()
      
      const { data, error } = await supabase
        .from('contact_leads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST /api-leads - Create new contact lead
    if (method === 'POST' && (path === '/api-leads' || path === '/')) {
      const leadData: ContactLead = await req.json()

      console.log('Creating lead with data:', leadData)

      // Set automatic priority based on service
      const priority = leadData.service && ['consulting', 'security'].includes(leadData.service) 
        ? 'high' 
        : leadData.priority || 'medium'

      const { data, error } = await supabase
        .from('contact_leads')
        .insert([{
          ...leadData,
          status: leadData.status || 'new',
          priority,
          source: 'n8n_api',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Lead created successfully:', data)

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // PUT /api-leads/:id - Update contact lead
    if (method === 'PUT' && path.startsWith('/api-leads/')) {
      const id = path.split('/').pop()
      const updateData = await req.json()

      // Add timestamps for status changes
      const statusTimestamps: any = {}
      if (updateData.status === 'contacted' && !updateData.contacted_at) {
        statusTimestamps.contacted_at = new Date().toISOString()
      }
      if (updateData.status === 'converted' && !updateData.converted_at) {
        statusTimestamps.converted_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('contact_leads')
        .update({
          ...updateData,
          ...statusTimestamps,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // PUT /api-leads/:id/status - Update status only
    if (method === 'PUT' && path.includes('/status')) {
      const id = path.split('/')[2]
      const { status, admin_notes } = await req.json()

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      // Add automatic timestamps
      if (status === 'contacted') updateData.contacted_at = new Date().toISOString()
      if (status === 'converted') updateData.converted_at = new Date().toISOString()
      if (admin_notes) updateData.admin_notes = admin_notes

      const { data, error } = await supabase
        .from('contact_leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // DELETE /api-leads/:id - Delete contact lead
    if (method === 'DELETE' && path.startsWith('/api-leads/')) {
      const id = path.split('/').pop()

      const { error } = await supabase
        .from('contact_leads')
        .delete()
        .eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true, message: 'Contact lead deleted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /api-leads/stats - Get lead statistics
    if (method === 'GET' && path === '/api-leads/stats') {
      const { data, error } = await supabase
        .from('contact_leads_stats')
        .select('*')
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Not Found', path, method }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    })

  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})