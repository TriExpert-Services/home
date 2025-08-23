import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

    console.log(`Reviews API Request: ${method} ${path}`)

    // GET /api-reviews - List all reviews
    if (method === 'GET' && (path === '/api-reviews' || path === '/')) {
      const searchParams = url.searchParams
      const approved = searchParams.get('approved')
      const featured = searchParams.get('featured')
      const rating = searchParams.get('rating')
      const limit = searchParams.get('limit') || '50'

      let query = supabase
        .from('client_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit))

      if (approved !== null) query = query.eq('is_approved', approved === 'true')
      if (featured !== null) query = query.eq('is_featured', featured === 'true')
      if (rating) query = query.eq('rating', parseInt(rating))

      const { data, error } = await query

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /api-reviews/:id - Get specific review
    if (method === 'GET' && path.startsWith('/api-reviews/')) {
      const id = path.split('/').pop()
      
      const { data, error } = await supabase
        .from('client_reviews')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // PUT /api-reviews/:id/approve - Approve review
    if (method === 'PUT' && path.includes('/approve')) {
      const id = path.split('/')[2]
      const { is_featured = false } = await req.json()

      const { data, error } = await supabase
        .from('client_reviews')
        .update({
          is_approved: true,
          is_featured,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data, message: 'Review approved' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // PUT /api-reviews/:id/reject - Reject review
    if (method === 'PUT' && path.includes('/reject')) {
      const id = path.split('/')[2]

      const { data, error } = await supabase
        .from('client_reviews')
        .update({
          is_approved: false,
          is_featured: false,
          approved_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data, message: 'Review rejected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // PUT /api-reviews/:id/feature - Toggle featured status
    if (method === 'PUT' && path.includes('/feature')) {
      const id = path.split('/')[2]
      const { is_featured } = await req.json()

      const { data, error } = await supabase
        .from('client_reviews')
        .update({
          is_featured: Boolean(is_featured),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data, message: 'Featured status updated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // DELETE /api-reviews/:id - Delete review
    if (method === 'DELETE' && path.startsWith('/api-reviews/')) {
      const id = path.split('/').pop()

      const { error } = await supabase
        .from('client_reviews')
        .delete()
        .eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true, message: 'Review deleted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /api-reviews/stats - Get review statistics
    if (method === 'GET' && path === '/api-reviews/stats') {
      const { data, error } = await supabase
        .rpc('get_review_stats')

      if (error) throw error

      const stats = data && data.length > 0 ? data[0] : {
        total_reviews: 0,
        average_rating: 0,
        rating_5_count: 0,
        rating_4_count: 0,
        rating_3_count: 0,
        rating_2_count: 0,
        rating_1_count: 0
      }

      return new Response(JSON.stringify({ success: true, data: stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /api-reviews/featured - Get featured reviews for homepage
    if (method === 'GET' && path === '/api-reviews/featured') {
      const limit = url.searchParams.get('limit') || '6'
      
      const { data, error } = await supabase
        .rpc('get_featured_reviews', { limit_count: parseInt(limit) })

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