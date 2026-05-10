/*
  # Reports / analytics views and admin RPCs

  Powers the new Reports tab in the admin panel. All aggregations are
  exposed through SECURITY DEFINER functions gated by `is_admin()` so
  the frontend can call them with the regular anon key while still
  keeping non-admin clients out.

  - `translation_daily_stats`  materialized view (last 120 days, daily
    grain). Heavy aggregation that we don't want to recompute on every
    chart render. Refresh via `refresh_translation_daily_stats()` —
    the RPC also lets the admin trigger a refresh from the UI.

  - `get_translation_daily_stats(p_days)`  thin admin RPC reading the
    matview, returns the last N days.

  - `get_lead_funnel()`  current snapshot of the
    new → contacted → qualified → converted funnel.

  - `get_revenue_by_language_pair(p_limit)`  top language pairs by
    completed-translation revenue.

  - `get_review_distribution()`  star count buckets + average.

  Idempotent. Safe on prod with live data.
*/

-- =====================================================================
-- Materialized view: daily translation stats
-- =====================================================================

DROP MATERIALIZED VIEW IF EXISTS public.translation_daily_stats;

CREATE MATERIALIZED VIEW public.translation_daily_stats AS
SELECT
  DATE(created_at)                                                                  AS day,
  COUNT(*)                                                                          AS total_requests,
  COUNT(*) FILTER (WHERE status = 'pending')                                        AS pending_count,
  COUNT(*) FILTER (WHERE status = 'in_progress')                                    AS in_progress_count,
  COUNT(*) FILTER (WHERE status = 'completed')                                      AS completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled')                                      AS cancelled_count,
  COALESCE(SUM(total_cost) FILTER (WHERE status = 'completed'), 0)                  AS daily_revenue,
  ROUND(
    AVG(
      CASE
        WHEN status = 'completed' AND delivery_date IS NOT NULL
        THEN EXTRACT(EPOCH FROM (delivery_date - created_at)) / 86400.0
      END
    )::numeric,
    2
  )                                                                                 AS avg_turnaround_days
FROM public.translation_requests
WHERE created_at >= NOW() - INTERVAL '120 days'
GROUP BY DATE(created_at);

CREATE UNIQUE INDEX translation_daily_stats_day_idx
  ON public.translation_daily_stats(day);

GRANT SELECT ON public.translation_daily_stats TO authenticated, service_role;

-- =====================================================================
-- Refresh helper (admin-only)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.refresh_translation_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.translation_daily_stats;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_translation_daily_stats() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.refresh_translation_daily_stats() TO authenticated, service_role;

-- =====================================================================
-- Admin RPCs — all gated by is_admin()
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_translation_daily_stats(p_days int DEFAULT 30)
RETURNS TABLE (
  day                  date,
  total_requests       bigint,
  pending_count        bigint,
  in_progress_count    bigint,
  completed_count      bigint,
  cancelled_count      bigint,
  daily_revenue        numeric,
  avg_turnaround_days  numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    s.day,
    s.total_requests,
    s.pending_count,
    s.in_progress_count,
    s.completed_count,
    s.cancelled_count,
    s.daily_revenue,
    s.avg_turnaround_days
  FROM public.translation_daily_stats s
  WHERE s.day >= CURRENT_DATE - (p_days || ' days')::interval
  ORDER BY s.day ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_translation_daily_stats(int) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_translation_daily_stats(int) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_lead_funnel()
RETURNS TABLE (
  stage      text,
  count      bigint,
  pct_total  numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  total_leads bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*) INTO total_leads FROM public.contact_leads;

  RETURN QUERY
  SELECT
    'new'::text AS stage,
    COUNT(*)::bigint AS count,
    CASE WHEN total_leads > 0
         THEN ROUND(100.0 * COUNT(*) / total_leads, 1)
         ELSE 0
    END AS pct_total
  FROM public.contact_leads
  WHERE status IN ('new','contacted','qualified','converted')
  UNION ALL
  SELECT
    'contacted',
    COUNT(*)::bigint,
    CASE WHEN total_leads > 0
         THEN ROUND(100.0 * COUNT(*) / total_leads, 1)
         ELSE 0
    END
  FROM public.contact_leads
  WHERE status IN ('contacted','qualified','converted')
  UNION ALL
  SELECT
    'qualified',
    COUNT(*)::bigint,
    CASE WHEN total_leads > 0
         THEN ROUND(100.0 * COUNT(*) / total_leads, 1)
         ELSE 0
    END
  FROM public.contact_leads
  WHERE status IN ('qualified','converted')
  UNION ALL
  SELECT
    'converted',
    COUNT(*)::bigint,
    CASE WHEN total_leads > 0
         THEN ROUND(100.0 * COUNT(*) / total_leads, 1)
         ELSE 0
    END
  FROM public.contact_leads
  WHERE status = 'converted';
END;
$$;

REVOKE ALL ON FUNCTION public.get_lead_funnel() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_lead_funnel() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_revenue_by_language_pair(p_limit int DEFAULT 10)
RETURNS TABLE (
  source_language  text,
  target_language  text,
  pair_label       text,
  request_count    bigint,
  total_revenue    numeric,
  avg_revenue      numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    tr.source_language,
    tr.target_language,
    (tr.source_language || ' → ' || tr.target_language) AS pair_label,
    COUNT(*)::bigint                                     AS request_count,
    COALESCE(SUM(tr.total_cost), 0)                      AS total_revenue,
    ROUND(AVG(tr.total_cost), 2)                         AS avg_revenue
  FROM public.translation_requests tr
  WHERE tr.status = 'completed'
    AND tr.source_language IS NOT NULL
    AND tr.target_language IS NOT NULL
  GROUP BY tr.source_language, tr.target_language
  ORDER BY total_revenue DESC
  LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.get_revenue_by_language_pair(int) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_revenue_by_language_pair(int) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_review_distribution()
RETURNS TABLE (
  total_reviews    bigint,
  approved_reviews bigint,
  average_rating   numeric,
  five_stars       bigint,
  four_stars       bigint,
  three_stars      bigint,
  two_stars        bigint,
  one_stars        bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::bigint                                         AS total_reviews,
    COUNT(*) FILTER (WHERE is_approved = true)::bigint       AS approved_reviews,
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0)              AS average_rating,
    COUNT(*) FILTER (WHERE rating = 5)::bigint               AS five_stars,
    COUNT(*) FILTER (WHERE rating = 4)::bigint               AS four_stars,
    COUNT(*) FILTER (WHERE rating = 3)::bigint               AS three_stars,
    COUNT(*) FILTER (WHERE rating = 2)::bigint               AS two_stars,
    COUNT(*) FILTER (WHERE rating = 1)::bigint               AS one_stars
  FROM public.client_reviews
  WHERE is_approved = true;
END;
$$;

REVOKE ALL ON FUNCTION public.get_review_distribution() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_review_distribution() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_overview_kpis()
RETURNS TABLE (
  total_translations            bigint,
  completed_translations        bigint,
  pending_translations          bigint,
  total_revenue                 numeric,
  this_month_revenue            numeric,
  avg_translation_cost          numeric,
  total_leads                   bigint,
  converted_leads               bigint,
  conversion_rate_pct           numeric,
  total_reviews                 bigint,
  pending_review_approvals      bigint,
  avg_rating                    numeric,
  active_projects               bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH t AS (
    SELECT
      COUNT(*)                                                        AS total_t,
      COUNT(*) FILTER (WHERE status = 'completed')                    AS completed_t,
      COUNT(*) FILTER (WHERE status = 'pending')                      AS pending_t,
      COALESCE(SUM(total_cost) FILTER (WHERE status = 'completed'),0) AS revenue,
      COALESCE(
        SUM(total_cost) FILTER (
          WHERE status = 'completed' AND created_at >= DATE_TRUNC('month', NOW())
        ), 0
      )                                                               AS month_revenue,
      ROUND(
        AVG(total_cost) FILTER (WHERE status = 'completed')::numeric,
        2
      )                                                               AS avg_cost
    FROM public.translation_requests
  ),
  l AS (
    SELECT
      COUNT(*)                                       AS total_l,
      COUNT(*) FILTER (WHERE status = 'converted')   AS converted_l
    FROM public.contact_leads
  ),
  r AS (
    SELECT
      COUNT(*)                                                            AS total_r,
      COUNT(*) FILTER (WHERE is_approved = false)                         AS pending_r,
      COALESCE(ROUND(AVG(rating) FILTER (WHERE is_approved = true)::numeric, 2), 0) AS avg_r
    FROM public.client_reviews
  ),
  p AS (
    SELECT COUNT(*) AS active_p
    FROM public.projects
    WHERE status NOT IN ('completed', 'cancelled')
  )
  SELECT
    t.total_t,
    t.completed_t,
    t.pending_t,
    t.revenue,
    t.month_revenue,
    COALESCE(t.avg_cost, 0),
    l.total_l,
    l.converted_l,
    CASE WHEN l.total_l > 0
         THEN ROUND(100.0 * l.converted_l / l.total_l, 1)
         ELSE 0
    END,
    r.total_r,
    r.pending_r,
    r.avg_r,
    p.active_p
  FROM t, l, r, p;
END;
$$;

REVOKE ALL ON FUNCTION public.get_overview_kpis() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_overview_kpis() TO authenticated, service_role;

DO $$
BEGIN
  RAISE NOTICE '✅ Reports infra ready: 1 matview, 6 admin RPCs (gated by is_admin())';
END $$;
