/*
  # Lock down RLS on chatbot tracking tables

  Continuation of 20260507000002_lock_rls_critical_tables.sql.

  These five tables were left without RLS and with full GRANTs (SELECT,
  INSERT, UPDATE, DELETE, TRUNCATE) on the `anon` role:

    - conversation_tracking   (PII: phone_number, customer_name, quoted_price,
                               stripe_payment_id, last_customer_message)
    - conversation_events     (per-message events, FK -> conversation_tracking)
    - conversation_metrics    (aggregated metrics, currently empty)
    - conversion_metrics      (conversion funnel metrics, currently empty)
    - agent_control           (operational toggles for the bot, currently empty)

  Anyone with the public anon key (which is in the frontend bundle) could
  read all chats, exfiltrate phone numbers/payment IDs, or even TRUNCATE
  the tables. These are written by n8n using the service_role key, which
  bypasses RLS, so locking them down does not affect the chatbot pipeline.

  After this migration:
    - service_role: unchanged (bypasses RLS)
    - anon:         no privileges
    - authenticated + is_admin(): full access (so the admin panel can read
                                  history if/when a tab is added)

  Idempotent. Safe to run on production.
*/

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'conversation_tracking',
    'conversation_events',
    'conversation_metrics',
    'conversion_metrics',
    'agent_control'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name=t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

      -- drop any pre-existing policies (none expected, but be safe + idempotent)
      EXECUTE (
        SELECT COALESCE(string_agg(format('DROP POLICY IF EXISTS %I ON public.%I;', policyname, t), E'\n'), '')
        FROM pg_policies WHERE schemaname='public' AND tablename=t
      );

      -- strip everything from anon, keep service_role implicit (bypasses RLS),
      -- and grant authenticated which is then gated by is_admin() in the policy.
      EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);

      EXECUTE format($f$
        CREATE POLICY %I
          ON public.%I FOR ALL TO authenticated
          USING (public.is_admin())
          WITH CHECK (public.is_admin())
      $f$, t || '_admin_all', t);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  RAISE NOTICE '🔒 RLS enabled on conversation_tracking, conversation_events, conversation_metrics,';
  RAISE NOTICE '   conversion_metrics, agent_control';
  RAISE NOTICE '🚫 anon GRANTs revoked — frontend bundle no longer carries read/write access';
  RAISE NOTICE '✅ service_role (n8n) unaffected; admin panel can read via authenticated + is_admin()';
END $$;
