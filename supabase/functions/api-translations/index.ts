import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface TranslationRequest {
  id?: string;
  full_name: string;
  phone: string;
  email: string;
  source_language: string;
  target_language: string;
  processing_time: string;
  desired_format: string;
  page_count: number;
  document_type: string;
  request_date: string;
  special_instructions?: string;
  file_urls?: string[];
  status?: string;
  total_cost?: number;
}

serve(async (req) => {
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

    // GET /api-translations - List all translation requests
    if (method === 'GET' && path === '/api-translations') {
      const { data, error } = await supabase
        .from('translation_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /api-translations/:id - Get specific translation request
    if (method === 'GET' && path.startsWith('/api-translations/')) {
      const id = path.split('/').pop()
      
      const { data, error } = await supabase
        .from('translation_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST /api-translations - Create new translation request
    if (method === 'POST' && path === '/api-translations') {
      const requestData: TranslationRequest = await req.json()

      const { data, error } = await supabase
        .from('translation_requests')
        .insert([{
          ...requestData,
          status: requestData.status || 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // PUT /api-translations/:id - Update translation request
    if (method === 'PUT' && path.startsWith('/api-translations/')) {
      const id = path.split('/').pop()
      const updateData = await req.json()

      const { data, error } = await supabase
        .from('translation_requests')
        .update({
          ...updateData,
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

    // PUT /api-translations/:id/status - Update status only
    if (method === 'PUT' && path.includes('/status')) {
      const id = path.split('/')[2]
      const { status, translator_notes, delivery_date } = await req.json()

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (translator_notes) updateData.translator_notes = translator_notes
      if (delivery_date) updateData.delivery_date = delivery_date
      if (status === 'completed' && !delivery_date) {
        updateData.delivery_date = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('translation_requests')
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

    // DELETE /api-translations/:id - Delete translation request
    if (method === 'DELETE' && path.startsWith('/api-translations/')) {
      const id = path.split('/').pop()

      const { error } = await supabase
        .from('translation_requests')
        .delete()
        .eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true, message: 'Translation request deleted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST /api-translations/:id/files - Add translated files
    if (method === 'POST' && path.includes('/files')) {
      const id = path.split('/')[2]
      const { file_urls, translator_notes, quality_score } = await req.json()

      // Get current file URLs
      const { data: currentData } = await supabase
        .from('translation_requests')
        .select('translated_file_urls')
        .eq('id', id)
        .single()

      const currentUrls = currentData?.translated_file_urls || []
      const newUrls = [...currentUrls, ...file_urls]

      const { data, error } = await supabase
        .from('translation_requests')
        .update({
          translated_file_urls: newUrls,
          translator_notes,
          quality_score,
          status: 'completed',
          delivery_date: new Date().toISOString(),
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

    return new Response(JSON.stringify({ error: 'Not Found' }), {
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