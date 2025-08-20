-- ========================================
-- FIX PARA POLÍTICAS RLS - TRADUCCIONES
-- ========================================
-- Este script corrige las políticas de seguridad para permitir
-- que usuarios anónimos puedan crear solicitudes de traducción

-- ========================================
-- 1. ELIMINAR POLÍTICAS PROBLEMÁTICAS
-- ========================================

-- Eliminar políticas existentes que no funcionan con usuarios anónimos
DROP POLICY IF EXISTS "Cualquiera puede crear solicitudes" ON public.translation_requests;
DROP POLICY IF EXISTS "Ver solicitudes propias por email" ON public.translation_requests;
DROP POLICY IF EXISTS "Admin puede ver todo" ON public.translation_requests;

-- ========================================
-- 2. CREAR POLÍTICAS CORREGIDAS
-- ========================================

-- Permitir que usuarios anónimos (anon) puedan insertar solicitudes
CREATE POLICY "Anonymous users can create translation requests"
    ON public.translation_requests
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Permitir que usuarios autenticados también puedan insertar solicitudes  
CREATE POLICY "Authenticated users can create translation requests"
    ON public.translation_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Permitir que usuarios anónimos puedan leer todas las solicitudes (para formularios públicos)
CREATE POLICY "Anonymous users can read all requests"
    ON public.translation_requests
    FOR SELECT
    TO anon
    USING (true);

-- Permitir que usuarios autenticados puedan ver sus propias solicitudes
CREATE POLICY "Authenticated users can read own requests"
    ON public.translation_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text OR auth.jwt() ->> 'email' = email);

-- Permitir que administradores puedan hacer todo (para futuro)
CREATE POLICY "Service role can do everything"
    ON public.translation_requests
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 3. VERIFICAR Y AJUSTAR STORAGE POLICIES
-- ========================================

-- Eliminar políticas de storage existentes que puedan causar problemas
DROP POLICY IF EXISTS "Cualquiera puede subir archivos" ON storage.objects;
DROP POLICY IF EXISTS "Archivos públicamente legibles" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar archivos" ON storage.objects;

-- Crear políticas de storage corregidas
CREATE POLICY "Anonymous users can upload files"
    ON storage.objects
    FOR INSERT
    TO anon
    WITH CHECK (bucket_id = 'translation-files');

CREATE POLICY "Authenticated users can upload files"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'translation-files');

CREATE POLICY "Public can read translation files"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'translation-files');

CREATE POLICY "Users can update translation files"
    ON storage.objects
    FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'translation-files');

CREATE POLICY "Users can delete translation files"
    ON storage.objects
    FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'translation-files');

-- ========================================
-- 4. ASEGURAR PERMISOS CORRECTOS
-- ========================================

-- Dar permisos explícitos a rol anon para la tabla
GRANT SELECT, INSERT ON public.translation_requests TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Dar permisos para storage al rol anon
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO anon;

-- ========================================
-- 5. VERIFICAR CONFIGURACIÓN
-- ========================================

-- Mostrar todas las políticas activas para verificación
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Políticas RLS corregidas para traduccciones!';
    RAISE NOTICE '🔓 Usuarios anónimos pueden crear solicitudes';
    RAISE NOTICE '📁 Storage configurado para usuarios anónimos'; 
    RAISE NOTICE '🔒 RLS sigue habilitado para seguridad';
    RAISE NOTICE '🚀 Formulario debería funcionar ahora';
END $$;

-- Verificar que RLS esté habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'translation_requests';

-- Mostrar políticas activas
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'translation_requests';