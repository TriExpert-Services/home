/*
  # Fix Contact Leads SQL Errors
  
  ## Description
  This migration fixes the SQL syntax errors in the contact leads system:
  
  1. Fix ROUND function with proper type casting
  2. Remove problematic policies
  3. Create proper contact leads table with correct syntax
*/

-- ========================================
-- 1. CREATE CONTACT LEADS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.contact_leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Contact information
    full_name text NOT NULL,
    email text NOT NULL,
    company text,
    phone text,
    
    -- Interest details
    service text,
    message text NOT NULL,
    
    -- Lead management
    status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to uuid,
    
    -- Follow-up
    admin_notes text,
    follow_up_date timestamptz,
    contacted_at timestamptz,
    converted_at timestamptz,
    
    -- Metadata
    source text DEFAULT 'website_form',
    referrer text,
    ip_address inet,
    user_agent text,
    
    -- Value tracking
    estimated_value numeric(10,2),
    actual_value numeric(10,2)
);

-- ========================================
-- 2. CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_contact_leads_email ON public.contact_leads(email);
CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON public.contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_priority ON public.contact_leads(priority);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON public.contact_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_follow_up ON public.contact_leads(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_contact_leads_assigned ON public.contact_leads(assigned_to);

-- ========================================
-- 3. CREATE TRIGGER FOR UPDATED_AT
-- ========================================

CREATE TRIGGER update_contact_leads_updated_at
    BEFORE UPDATE ON public.contact_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. ENABLE RLS
-- ========================================

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CREATE RLS POLICIES
-- ========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Admins can read all contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Admins can update contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Admins can delete contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Service role can manage all contact leads" ON public.contact_leads;

-- Create new policies
CREATE POLICY "public_can_create_contact_leads"
    ON public.contact_leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "authenticated_can_read_contact_leads"
    ON public.contact_leads
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "authenticated_can_update_contact_leads"
    ON public.contact_leads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "authenticated_can_delete_contact_leads"
    ON public.contact_leads
    FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "service_role_full_access_contact_leads"
    ON public.contact_leads
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 6. CREATE STATS VIEW WITH FIXED ROUND
-- ========================================

CREATE OR REPLACE VIEW public.contact_leads_stats AS
SELECT 
    COUNT(*) as total_leads,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
    COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_leads,
    COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified_leads,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as leads_last_30_days,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as leads_last_7_days,
    CASE 
        WHEN AVG(estimated_value) IS NULL THEN 0
        ELSE ROUND(AVG(estimated_value)::numeric, 2)
    END as avg_estimated_value,
    CASE 
        WHEN SUM(actual_value) IS NULL THEN 0
        ELSE ROUND(SUM(actual_value)::numeric, 2)
    END as total_revenue_from_leads,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(CASE WHEN status = 'converted' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)
    END as conversion_rate
FROM public.contact_leads;

-- ========================================
-- 7. CREATE LEAD CREATION FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION create_contact_lead(
    p_full_name text,
    p_email text,
    p_company text DEFAULT NULL,
    p_service text DEFAULT NULL,
    p_message text,
    p_phone text DEFAULT NULL,
    p_source text DEFAULT 'website_form',
    p_referrer text DEFAULT NULL,
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    lead_id uuid;
    lead_priority text;
BEGIN
    -- Set priority based on service type
    lead_priority := CASE 
        WHEN p_service IN ('consulting', 'security') THEN 'high'
        WHEN p_service IN ('development', 'cloud') THEN 'medium'
        ELSE 'medium'
    END;
    
    INSERT INTO public.contact_leads (
        full_name,
        email,
        company,
        phone,
        service,
        message,
        source,
        referrer,
        ip_address,
        user_agent,
        status,
        priority
    ) VALUES (
        p_full_name,
        p_email,
        p_company,
        p_phone,
        p_service,
        p_message,
        p_source,
        p_referrer,
        p_ip_address,
        p_user_agent,
        'new',
        lead_priority
    ) RETURNING id INTO lead_id;
    
    RETURN lead_id;
END;
$$;

-- ========================================
-- 8. SAMPLE DATA
-- ========================================

INSERT INTO public.contact_leads (
    full_name,
    email,
    company,
    service,
    message,
    status,
    priority,
    admin_notes,
    estimated_value
) VALUES 
(
    'Maria Rodriguez',
    'maria.rodriguez@techcorp.com',
    'TechCorp Solutions',
    'consulting',
    'Necesitamos una consultoría técnica para modernizar nuestra infraestructura de TI. Somos una empresa de 200 empleados.',
    'new',
    'high',
    'Lead interesante - empresa mediana con buen presupuesto potencial',
    5000.00
),
(
    'John Smith',
    'j.smith@startupxyz.io',
    'StartupXYZ',
    'development',
    'Looking for custom software development for our new platform. We need a full-stack solution.',
    'contacted',
    'medium',
    'Llamé el 20/08. Interesados en desarrollo custom. Reunión programada para esta semana.',
    15000.00
),
(
    'Ana García',
    'ana.garcia@gmail.com',
    NULL,
    'translations',
    'Necesito traducir mi diploma para inmigración. ¿Cuánto costaría?',
    'converted',
    'low',
    'Convertido a traducción. Solicitud procesada.',
    75.00
),
(
    'Robert Wilson',
    'rwilson@enterprise.com',
    'Enterprise Corp',
    'security',
    'We need a comprehensive security audit for our systems. We handle sensitive financial data.',
    'qualified',
    'urgent',
    'Empresa grande con necesidad urgente. Excelente prospect.',
    25000.00
),
(
    'Carlos Mendez',
    'cmendez@pyme.mx',
    'PYME Soluciones',
    'cloud',
    'Queremos migrar a la nube pero no sabemos por dónde empezar. ¿Pueden ayudarnos?',
    'new',
    'medium',
    NULL,
    8000.00
)
ON CONFLICT DO NOTHING;

-- ========================================
-- 9. PERMISSIONS
-- ========================================

GRANT EXECUTE ON FUNCTION create_contact_lead(text, text, text, text, text, text, text, text, inet, text) TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_leads TO authenticated;
GRANT SELECT, INSERT ON public.contact_leads TO anon;
GRANT SELECT ON public.contact_leads_stats TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Contact Leads System created successfully!';
    RAISE NOTICE '📞 Contact leads table ready';
    RAISE NOTICE '🔒 RLS policies configured';
    RAISE NOTICE '📊 Statistics view created';
    RAISE NOTICE '⚡ Lead creation function ready';
    RAISE NOTICE '🚀 Ready for lead management';
END $$;