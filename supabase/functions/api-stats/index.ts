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

    console.log(`Stats API Request: ${method} ${path}`)

    // GET /api-stats - Get all statistics
    if (method === 'GET' && (path === '/api-stats' || path === '/')) {
      // Get translation stats
      const { data: translationStats } = await supabase
        .from('translation_stats')
        .select('*')
        .single()

      // Get leads stats
      const { data: leadsStats } = await supabase
        .from('contact_leads_stats')
        .select('*')
        .single()

      // Get reviews stats
      const { data: reviewsStatsRaw } = await supabase
        .rpc('get_review_stats')

      const reviewsStats = reviewsStatsRaw && reviewsStatsRaw.length > 0 ? reviewsStatsRaw[0] : {
        total_reviews: 0,
        average_rating: 0,
        rating_5_count: 0,
        rating_4_count: 0,
        rating_3_count: 0,
        rating_2_count: 0,
        rating_1_count: 0
      }

      // Get recent activity
      const { data: recentTranslations } = await supabase
        .from('translation_requests')
        .select('id, full_name, status, created_at, total_cost')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentLeads } = await supabase
        .from('contact_leads')
        .select('id, full_name, status, created_at, service')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentReviews } = await supabase
        .from('client_reviews')
        .select('id, client_name, rating, created_at, is_approved')
        .order('created_at', { ascending: false })
        .limit(5)

      const data = {
        translations: translationStats || {
          total_requests: 0,
          pending_requests: 0,
          in_progress_requests: 0,
          completed_requests: 0,
          requests_last_30_days: 0,
          average_cost: 0,
          total_revenue: 0
        },
        leads: leadsStats || {
          total_leads: 0,
          new_leads: 0,
          contacted_leads: 0,
          qualified_leads: 0,
          converted_leads: 0,
          leads_last_30_days: 0,
          leads_last_7_days: 0,
          avg_estimated_value: 0,
          total_revenue_from_leads: 0,
          conversion_rate: 0
        },
        reviews: reviewsStats,
        recent_activity: {
          translations: recentTranslations || [],
          leads: recentLeads || [],
          reviews: recentReviews || []
        },
        summary: {
          total_revenue: (translationStats?.total_revenue || 0) + (leadsStats?.total_revenue_from_leads || 0),
          active_projects: (translationStats?.pending_requests || 0) + (translationStats?.in_progress_requests || 0),
          client_satisfaction: reviewsStats?.average_rating || 0,
          conversion_rate: leadsStats?.conversion_rate || 0
        }
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /api-stats/translations - Get translation statistics only
    if (method === 'GET' && path === '/api-stats/translations') {
      const { data, error } = await supabase
        .from('translation_stats')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found" error

      return new Response(JSON.stringify({ 
        success: true, 
        data: data || {
          total_requests: 0,
          pending_requests: 0,
          in_progress_requests: 0,
          completed_requests: 0,
          requests_last_30_days: 0,
          average_cost: 0,
          total_revenue: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /api-stats/leads - Get leads statistics only
    if (method === 'GET' && path === '/api-stats/leads') {
      const { data, error } = await supabase
        .from('contact_leads_stats')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return new Response(JSON.stringify({ 
        success: true, 
        data: data || {
          total_leads: 0,
          new_leads: 0,
          contacted_leads: 0,
          qualified_leads: 0,
          converted_leads: 0,
          leads_last_30_days: 0,
          leads_last_7_days: 0,
          avg_estimated_value: 0,
          total_revenue_from_leads: 0,
          conversion_rate: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /api-stats/reviews - Get reviews statistics only
    if (method === 'GET' && path === '/api-stats/reviews') {
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