/*
  # Payment columns on translation_requests (close the revenue loop)

  Until now a successful Stripe payment was only logged into a dead-end
  stripe_payments table and the original order stayed status='pending'
  forever. Add explicit payment columns so the pagos_recibidos_stripe webhook
  (after verifying the Stripe signature) can mark the order paid and attribute
  the conversion.

  Idempotent.
*/

ALTER TABLE public.translation_requests
  ADD COLUMN IF NOT EXISTS is_paid                  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at                  timestamptz,
  ADD COLUMN IF NOT EXISTS amount_paid_cents        integer,
  ADD COLUMN IF NOT EXISTS stripe_session_id        text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

CREATE INDEX IF NOT EXISTS idx_translation_requests_is_paid
  ON public.translation_requests(is_paid);

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260622000003', 'translation_paid_columns')
ON CONFLICT (version) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '💳 translation_requests now has is_paid/paid_at/amount_paid_cents/stripe ids';
END $$;
