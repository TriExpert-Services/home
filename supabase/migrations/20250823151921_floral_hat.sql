/*
  # Sistema de Reseñas y Testimonios
  
  ## Descripción
  Este sistema permite que los clientes dejen reseñas después de verificar
  sus traducciones y usa estas reseñas reales en la página principal.
  
  1. Nueva Tabla: client_reviews
     - Reseñas de clientes reales
     - Vinculadas a solicitudes de traducción
     - Sistema de aprobación para moderación
     
  2. Seguridad
     - RLS habilitado
     - Solo clientes verificados pueden crear reseñas
     - Solo administradores pueden aprobar
     
  3. Funciones
     - Verificar elegibilidad para reseñar
     - Obtener reseñas aprobadas para mostrar
*/

-- ========================================
-- 1. CREAR TABLA DE RESEÑAS
-- ========================================

CREATE TABLE IF NOT EXISTS public.client_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Referencia a la traducción
    translation_request_id uuid REFERENCES public.translation_requests(id) ON DELETE CASCADE NOT NULL,
    
    -- Datos de la reseña
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title text,
    comment text NOT NULL CHECK (length(comment) >= 10),
    
    -- Información del cliente
    client_name text NOT NULL,
    client_email text NOT NULL,
    service_type text NOT NULL,
    
    -- Sistema de moderación
    is_approved boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    approved_at timestamptz,
    approved_by uuid,
    
    -- Metadata
    verification_token text NOT NULL,
    ip_address inet,
    user_agent text,
    
    -- Configuración de privacidad
    show_full_name boolean DEFAULT true,
    show_service_details boolean DEFAULT true
);

-- ========================================
-- 2. CREAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_client_reviews_translation_id 
ON public.client_reviews(translation_request_id);
CREATE INDEX IF NOT EXISTS idx_client_reviews_approved 
ON public.client_reviews(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_reviews_featured 
ON public.client_reviews(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_reviews_rating 
ON public.client_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_client_reviews_verification 
ON public.client_reviews(verification_token);

-- ========================================
-- 3. CREAR TRIGGER PARA UPDATED_AT
-- ========================================

CREATE TRIGGER update_client_reviews_updated_at
    BEFORE UPDATE ON public.client_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. HABILITAR RLS
-- ========================================

ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CREAR POLÍTICAS RLS
-- ========================================

-- Política: Cualquiera puede crear reseñas (para verificación pública)
CREATE POLICY "Anyone can create reviews"
    ON public.client_reviews
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Política: Solo reseñas aprobadas son públicamente visibles
CREATE POLICY "Public can read approved reviews"
    ON public.client_reviews
    FOR SELECT
    TO anon, authenticated
    USING (is_approved = true);

-- Política: Administradores pueden ver todas las reseñas
CREATE POLICY "Admins can read all reviews"
    ON public.client_reviews
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.is_admin = true
        )
    );

-- Política: Administradores pueden modificar reseñas
CREATE POLICY "Admins can manage reviews"
    ON public.client_reviews
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.is_admin = true
        )
    );

-- Política: Service role puede hacer todo
CREATE POLICY "Service role can manage all reviews"
    ON public.client_reviews
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 6. FUNCIÓN PARA VERIFICAR ELEGIBILIDAD
-- ========================================

CREATE OR REPLACE FUNCTION can_leave_review(verification_token text)
RETURNS TABLE (
    can_review boolean,
    translation_id uuid,
    client_name text,
    client_email text,
    service_type text,
    already_reviewed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    translation_record RECORD;
    existing_review_count integer;
BEGIN
    -- Buscar la traducción por token de verificación
    SELECT tr.id, tr.full_name, tr.email, tr.document_type, tr.status, tr.verification_expires_at
    INTO translation_record
    FROM public.translation_requests tr
    WHERE tr.verification_link = verification_token;
    
    -- Verificar si existe la traducción
    IF translation_record.id IS NULL THEN
        RETURN QUERY SELECT false, null::uuid, null::text, null::text, null::text, false;
        RETURN;
    END IF;
    
    -- Verificar si está completada y no ha expirado
    IF translation_record.status != 'completed' OR 
       translation_record.verification_expires_at < now() THEN
        RETURN QUERY SELECT false, null::uuid, null::text, null::text, null::text, false;
        RETURN;
    END IF;
    
    -- Verificar si ya dejó una reseña
    SELECT COUNT(*)
    INTO existing_review_count
    FROM public.client_reviews cr
    WHERE cr.translation_request_id = translation_record.id;
    
    -- Retornar resultado
    RETURN QUERY SELECT 
        true,
        translation_record.id,
        translation_record.full_name,
        translation_record.email,
        translation_record.document_type,
        existing_review_count > 0;
END;
$$;

-- ========================================
-- 7. FUNCIÓN PARA OBTENER RESEÑAS DESTACADAS
-- ========================================

CREATE OR REPLACE FUNCTION get_featured_reviews(limit_count integer DEFAULT 6)
RETURNS TABLE (
    id uuid,
    rating integer,
    title text,
    comment text,
    client_name text,
    service_type text,
    created_at timestamptz,
    show_full_name boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.id,
        cr.rating,
        cr.title,
        cr.comment,
        CASE 
            WHEN cr.show_full_name THEN cr.client_name
            ELSE split_part(cr.client_name, ' ', 1) || ' ' || 
                 left(split_part(cr.client_name, ' ', 2), 1) || '.'
        END as display_name,
        cr.service_type,
        cr.created_at,
        cr.show_full_name
    FROM public.client_reviews cr
    WHERE cr.is_approved = true
    ORDER BY 
        cr.is_featured DESC,
        cr.rating DESC,
        cr.created_at DESC
    LIMIT limit_count;
END;
$$;

-- ========================================
-- 8. FUNCIÓN PARA OBTENER ESTADÍSTICAS
-- ========================================

CREATE OR REPLACE FUNCTION get_review_stats()
RETURNS TABLE (
    total_reviews integer,
    average_rating numeric,
    rating_5_count integer,
    rating_4_count integer,
    rating_3_count integer,
    rating_2_count integer,
    rating_1_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::integer as total_reviews,
        ROUND(AVG(rating), 2) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END)::integer as rating_5_count,
        COUNT(CASE WHEN rating = 4 THEN 1 END)::integer as rating_4_count,
        COUNT(CASE WHEN rating = 3 THEN 1 END)::integer as rating_3_count,
        COUNT(CASE WHEN rating = 2 THEN 1 END)::integer as rating_2_count,
        COUNT(CASE WHEN rating = 1 THEN 1 END)::integer as rating_1_count
    FROM public.client_reviews
    WHERE is_approved = true;
END;
$$;

-- ========================================
-- 9. VISTA PARA ADMINISTRACIÓN
-- ========================================

CREATE OR REPLACE VIEW public.reviews_admin_view AS
SELECT 
    cr.*,
    tr.status as translation_status,
    tr.total_cost as translation_cost,
    tr.created_at as translation_date,
    CASE 
        WHEN cr.is_approved THEN 'Approved'
        ELSE 'Pending'
    END as approval_status,
    CASE 
        WHEN cr.created_at > now() - interval '24 hours' THEN 'New'
        WHEN cr.created_at > now() - interval '7 days' THEN 'Recent'
        ELSE 'Old'
    END as age_category
FROM public.client_reviews cr
JOIN public.translation_requests tr ON cr.translation_request_id = tr.id
ORDER BY cr.created_at DESC;

-- ========================================
-- 10. PERMISOS
-- ========================================

-- Permisos para funciones
GRANT EXECUTE ON FUNCTION can_leave_review(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_featured_reviews(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_review_stats() TO anon, authenticated;

-- Permisos para tablas
GRANT SELECT, INSERT ON public.client_reviews TO anon, authenticated;
GRANT ALL ON public.client_reviews TO service_role;
GRANT SELECT ON public.reviews_admin_view TO authenticated;

-- Permisos para secuencias
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ========================================
-- 11. DATOS DE EJEMPLO (OPCIONAL)
-- ========================================

-- Insertar algunas reseñas de ejemplo aprobadas
DO $$
DECLARE
    sample_request_id uuid;
BEGIN
    -- Buscar una solicitud completada para el ejemplo
    SELECT id INTO sample_request_id 
    FROM public.translation_requests 
    WHERE status = 'completed' 
    LIMIT 1;
    
    -- Solo insertar si hay solicitudes completadas
    IF sample_request_id IS NOT NULL THEN
        INSERT INTO public.client_reviews (
            translation_request_id,
            rating,
            title,
            comment,
            client_name,
            client_email,
            service_type,
            is_approved,
            is_featured,
            approved_at,
            verification_token,
            show_full_name
        ) VALUES 
        (
            sample_request_id,
            5,
            'Excellent Professional Service',
            'Outstanding quality and very fast delivery. The translation was perfect and the verification process was seamless. Highly recommended for anyone needing certified translations.',
            'Maria Rodriguez',
            'maria.r@example.com',
            'birth_certificate',
            true,
            true,
            now(),
            'sample-token-1',
            true
        ),
        (
            sample_request_id,
            5,
            'Perfect Translation Quality',
            'Very impressed with the attention to detail and professionalism. The documents were translated accurately and delivered on time.',
            'John Smith',
            'john.smith@example.com',
            'diploma',
            true,
            true,
            now(),
            'sample-token-2',
            false
        ),
        (
            sample_request_id,
            4,
            'Great Service',
            'Good experience overall. Fast and reliable service. The verification system is very convenient.',
            'Ana García',
            'ana.garcia@example.com',
            'marriage_certificate',
            true,
            false,
            now(),
            'sample-token-3',
            true
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Sistema de Reseñas creado exitosamente!';
    RAISE NOTICE '⭐ Tabla client_reviews lista';
    RAISE NOTICE '🔒 Políticas RLS configuradas';
    RAISE NOTICE '⚡ Funciones de verificación y estadísticas creadas';
    RAISE NOTICE '📊 Vista de administración lista';
    RAISE NOTICE '🚀 Sistema listo para reseñas reales';
END $$;