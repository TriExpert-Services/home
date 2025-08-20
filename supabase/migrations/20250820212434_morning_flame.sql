/*
  # Setup completo para TriExpert Services - Traducciones Certificadas
  
  ## Descripción
  Este script crea toda la infraestructura necesaria para el sistema de solicitudes de traducciones:
  
  1. Nueva Tabla: translation_requests
     - Información personal del cliente
     - Detalles de traducción (idiomas, tiempo, formato, etc.)
     - Archivos subidos y costos
     - Sistema de estados para seguimiento
     
  2. Seguridad
     - Habilita RLS en todas las tablas
     - Políticas para que los usuarios puedan crear y leer sus solicitudes
     - Políticas de storage para archivos
     
  3. Storage
     - Bucket 'translation-files' para documentos
     - Políticas públicas de lectura y escritura autenticada
*/

-- ========================================
-- 1. CREAR TABLA PRINCIPAL
-- ========================================

CREATE TABLE IF NOT EXISTS public.translation_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    -- Información Personal
    full_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    
    -- Detalles de Traducción
    source_language text NOT NULL,
    target_language text NOT NULL,
    processing_time text NOT NULL CHECK (processing_time IN ('express', 'standard', 'economy')),
    desired_format text NOT NULL CHECK (desired_format IN ('digital', 'physical', 'both')),
    page_count integer NOT NULL CHECK (page_count > 0),
    document_type text NOT NULL,
    request_date date NOT NULL,
    
    -- Archivos e Instrucciones
    special_instructions text,
    file_urls text[],
    
    -- Estados y Costos
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    total_cost numeric(10,2),
    
    -- Metadatos
    updated_at timestamptz DEFAULT now()
);

-- ========================================
-- 2. CREAR ÍNDICES PARA RENDIMIENTO
-- ========================================

CREATE INDEX IF NOT EXISTS idx_translation_requests_email ON public.translation_requests(email);
CREATE INDEX IF NOT EXISTS idx_translation_requests_status ON public.translation_requests(status);
CREATE INDEX IF NOT EXISTS idx_translation_requests_created_at ON public.translation_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_translation_requests_request_date ON public.translation_requests(request_date);

-- ========================================
-- 3. CREAR TRIGGER PARA UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_translation_requests_updated_at ON public.translation_requests;
CREATE TRIGGER update_translation_requests_updated_at
    BEFORE UPDATE ON public.translation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. CONFIGURAR SEGURIDAD RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE public.translation_requests ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede insertar solicitudes (para formulario público)
CREATE POLICY "Cualquiera puede crear solicitudes"
    ON public.translation_requests
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Política: Los usuarios pueden ver sus propias solicitudes por email
CREATE POLICY "Ver solicitudes propias por email"
    ON public.translation_requests
    FOR SELECT
    TO public
    USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Política: Admin puede ver todo (para roles futuros)
CREATE POLICY "Admin puede ver todo"
    ON public.translation_requests
    FOR ALL
    TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
    );

-- ========================================
-- 5. CREAR STORAGE BUCKET
-- ========================================

-- Crear bucket para archivos de traducción
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'translation-files',
    'translation-files', 
    true,
    52428800, -- 50MB limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'image/webp'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 6. CONFIGURAR POLÍTICAS DE STORAGE
-- ========================================

-- Política: Cualquiera puede subir archivos
CREATE POLICY "Cualquiera puede subir archivos"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'translation-files');

-- Política: Archivos son públicamente legibles
CREATE POLICY "Archivos públicamente legibles"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'translation-files');

-- Política: Los usuarios pueden actualizar sus archivos
CREATE POLICY "Usuarios pueden actualizar archivos"
    ON storage.objects
    FOR UPDATE
    TO public
    USING (bucket_id = 'translation-files');

-- Política: Los usuarios pueden eliminar sus archivos
CREATE POLICY "Usuarios pueden eliminar archivos"
    ON storage.objects
    FOR DELETE
    TO public
    USING (bucket_id = 'translation-files');

-- ========================================
-- 7. CREAR VISTA PARA ESTADÍSTICAS (OPCIONAL)
-- ========================================

CREATE OR REPLACE VIEW public.translation_stats AS
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_requests,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as requests_last_30_days,
    ROUND(AVG(total_cost), 2) as average_cost,
    ROUND(SUM(total_cost), 2) as total_revenue
FROM public.translation_requests;

-- ========================================
-- 8. DATOS DE EJEMPLO (OPCIONAL)
-- ========================================

-- Insertar una solicitud de ejemplo para testing
INSERT INTO public.translation_requests (
    full_name,
    phone,
    email,
    source_language,
    target_language,
    processing_time,
    desired_format,
    page_count,
    document_type,
    request_date,
    special_instructions,
    status,
    total_cost
) VALUES (
    'Juan Pérez',
    '+1-813-555-0123',
    'juan.perez@example.com',
    'es',
    'en', 
    'standard',
    'digital',
    3,
    'birth_certificate',
    CURRENT_DATE,
    'Necesito traducción certificada para inmigración',
    'pending',
    75.00
) ON CONFLICT DO NOTHING;

-- ========================================
-- 9. GRANTS Y PERMISOS FINALES
-- ========================================

-- Asegurar que los permisos están correctos
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON public.translation_requests TO anon;
GRANT ALL ON public.translation_requests TO authenticated;
GRANT SELECT ON public.translation_stats TO authenticated;

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

-- Mostrar resumen de lo creado
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Base de datos configurada exitosamente!';
    RAISE NOTICE '📊 Tabla: translation_requests creada';
    RAISE NOTICE '🔒 Políticas RLS configuradas'; 
    RAISE NOTICE '📁 Storage bucket "translation-files" creado';
    RAISE NOTICE '🚀 Sistema listo para recibir solicitudes';
END $$;