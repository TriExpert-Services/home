/*
  # Server-side recalculation of translation_requests.total_cost

  Until now `total_cost` was computed in the browser (TranslationForm.tsx)
  and sent to Supabase as part of the INSERT. A user editing the DOM could
  submit a $0 request and the n8n flow would generate a Stripe link for
  that amount.

  This migration adds a BEFORE INSERT/UPDATE trigger that overwrites
  total_cost with the canonical price every time, regardless of caller.

  Pricing rules (mirror of TranslationForm.calculateCost as of 2026-05-07):
    base_per_page    = 15.00
    processing_mult  = 1.00 (standard) | 1.35 (urgent)
    format_mult      = 1.20 (both) | 1.00 (digital | physical)
    total_cost       = ceil(pages * 15 * processing_mult * format_mult)
    minimum_pages    = 1

  Idempotent.
*/

CREATE OR REPLACE FUNCTION public.calculate_translation_cost(
  p_page_count        integer,
  p_processing_time   text,
  p_desired_format    text
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT CEIL(
    GREATEST(COALESCE(p_page_count, 0), 1)::numeric
    * 15.00
    * CASE LOWER(COALESCE(p_processing_time, 'standard'))
        WHEN 'urgent' THEN 1.35
        ELSE 1.00
      END
    * CASE LOWER(COALESCE(p_desired_format, 'digital'))
        WHEN 'both' THEN 1.20
        ELSE 1.00
      END
  );
$$;

CREATE OR REPLACE FUNCTION public.translation_requests_set_cost()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Allow admins to override (they can negotiate or refund) but
  -- recompute for every other caller, including the public form
  -- and the api-translations edge function.
  IF TG_OP = 'INSERT' OR NOT public.is_admin(auth.uid()) THEN
    NEW.total_cost := public.calculate_translation_cost(
      NEW.page_count,
      NEW.processing_time,
      NEW.desired_format
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS translation_requests_set_cost ON public.translation_requests;
CREATE TRIGGER translation_requests_set_cost
  BEFORE INSERT OR UPDATE OF page_count, processing_time, desired_format
  ON public.translation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.translation_requests_set_cost();

DO $$
BEGIN
  RAISE NOTICE '💵 total_cost is now recomputed server-side for every INSERT/UPDATE';
END $$;
