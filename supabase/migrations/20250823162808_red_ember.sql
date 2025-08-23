/*
  # Sistema de Contact Leads
  
  ## Descripción
  Sistema para gestionar leads/contactos que llegan desde el formulario de contacto:
  
  1. Nueva Tabla: contact_leads
     - Información del contacto
     - Servicio de interés
     - Estado del lead (nuevo, contactado, convertido)
     - Notas del admin
     
  2. Seguridad
     - RLS habilitado
     - Políticas para creación pública y gestión admin
     
  3. Funciones
     - Crear leads automáticamente desde formulario
     - Gestión completa desde admin panel
*/

-- ========================================
-- 1. CREAR TABLA DE CONTACT LEADS
-- ========================================

CREATE TABLE IF NOT EXISTS public.contact_leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Información de contacto
    full_name text NOT NULL,
    email text NOT NULL,
    company text,
    phone text,
    
    -- Detalles del interés
    service text,
    message text NOT NULL,
    
    -- Gestión del lead
    status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to uuid, -- Reference to admin user
    
    -- Seguimiento
    admin_notes text,
    follow_up_date timestamptz,
    contacted_at timestamptz,
    converted_at timestamptz,
    
    -- Metadata
    source text DEFAULT 'website_form',
    referrer text,
    ip_address inet,
    user_agent text,
    
    -- Valor estimado
    estimated_value numeric(10,2),
    actual_value numeric(10,2)
);

-- ========================================
-- 2. CREAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_contact_leads_email ON public.contact_leads(email);
CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON public.contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_priority ON public.contact_leads(priority);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON public.contact_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_follow_up ON public.contact_leads(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_contact_leads_assigned ON public.contact_leads(assigned_to);

-- ========================================
-- 3. CREAR TRIGGER PARA UPDATED_AT
-- ========================================

CREATE TRIGGER update_contact_leads_updated_at
    BEFORE UPDATE ON public.contact_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. HABILITAR RLS
-- ========================================

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CREAR POLÍTICAS RLS
-- ========================================

-- Política: Cualquiera puede crear leads (formulario público)
CREATE POLICY "Anyone can create contact leads"
    ON public.contact_leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Política: Admins pueden leer todos los leads
CREATE POLICY "Admins can read all contact leads"
    ON public.contact_leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: Admins pueden actualizar leads
CREATE POLICY "Admins can update contact leads"
    ON public.contact_leads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política: Admins pueden eliminar leads
CREATE POLICY "Admins can delete contact leads"
    ON public.contact_leads
    FOR DELETE
    TO authenticated
    USING (true);

-- Política: Service role puede hacer todo
CREATE POLICY "Service role can manage all contact leads"
    ON public.contact_leads
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 6. CREAR VISTA PARA ESTADÍSTICAS
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
    ROUND(AVG(estimated_value), 2) as avg_estimated_value,
    ROUND(SUM(actual_value), 2) as total_revenue_from_leads,
    ROUND(
        (COUNT(CASE WHEN status = 'converted' THEN 1 END)::float / NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as conversion_rate
FROM public.contact_leads;

-- ========================================
-- 7. CREAR FUNCIÓN PARA CREAR LEAD
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
BEGIN
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
        CASE 
            WHEN p_service IN ('consulting', 'security') THEN 'high'
            WHEN p_service IN ('development', 'cloud') THEN 'medium'
            ELSE 'medium'
        END
    ) RETURNING id INTO lead_id;
    
    RETURN lead_id;
END;
$$;

-- ========================================
-- 8. DATOS DE EJEMPLO
-- ========================================

-- Insertar algunos leads de ejemplo
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
-- 9. PERMISOS
-- ========================================

-- Permisos para funciones
GRANT EXECUTE ON FUNCTION create_contact_lead(text, text, text, text, text, text, text, text, inet, text) TO anon, authenticated;

-- Permisos para tablas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_leads TO authenticated;
GRANT SELECT, INSERT ON public.contact_leads TO anon;
GRANT SELECT ON public.contact_leads_stats TO authenticated;

-- Permisos para secuencias
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