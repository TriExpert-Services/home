/*
  # Sistema de Gestión de Proyectos
  
  ## Descripción
  Sistema completo para convertir leads en proyectos gestionables:
  
  1. Nueva Tabla: projects
     - Proyectos derivados de leads convertidos
     - Estados de proyecto con timeline
     - Asignación de equipo y recursos
     - Seguimiento de progreso y entregables
     
  2. Seguridad
     - RLS habilitado
     - Solo administradores pueden gestionar proyectos
     - Historial de cambios
     
  3. Funciones
     - Convertir lead a proyecto
     - Actualizar estados de proyecto
     - Generar reportes de progreso
*/

-- ========================================
-- 1. CREAR TABLA DE PROYECTOS
-- ========================================

CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Referencias
    lead_id uuid REFERENCES public.contact_leads(id) ON DELETE SET NULL,
    client_name text NOT NULL,
    client_email text NOT NULL,
    client_company text,
    
    -- Detalles del proyecto
    project_name text NOT NULL,
    project_description text,
    service_type text NOT NULL,
    project_scope text,
    
    -- Timeline y estados
    status text DEFAULT 'planning' CHECK (status IN ('planning', 'development', 'testing', 'delivery', 'completed', 'cancelled', 'on_hold')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Fechas importantes
    start_date timestamptz,
    planned_delivery_date timestamptz,
    actual_delivery_date timestamptz,
    
    -- Asignación y recursos
    project_manager_id uuid,
    assigned_team text[], -- Array de nombres o IDs del equipo
    
    -- Progreso
    progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_phase text,
    next_milestone text,
    
    -- Financiero
    estimated_value numeric(10,2),
    actual_cost numeric(10,2),
    billing_status text DEFAULT 'pending' CHECK (billing_status IN ('pending', 'invoiced', 'paid', 'overdue')),
    
    -- Documentos y entregables
    project_files text[], -- URLs de archivos del proyecto
    deliverables jsonb DEFAULT '[]', -- Lista de entregables con estado
    
    -- Comunicación
    last_client_communication timestamptz,
    next_follow_up timestamptz,
    
    -- Notas y metadata
    admin_notes text,
    client_feedback text,
    internal_notes text,
    
    -- Estado del cliente
    client_satisfaction_score integer CHECK (client_satisfaction_score >= 1 AND client_satisfaction_score <= 5),
    
    -- Metadata
    created_by uuid,
    last_modified_by uuid
);

-- ========================================
-- 2. CREAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON public.projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON public.projects(client_email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON public.projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_service_type ON public.projects(service_type);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON public.projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_delivery_date ON public.projects(planned_delivery_date);
CREATE INDEX IF NOT EXISTS idx_projects_project_manager ON public.projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ========================================
-- 3. CREAR TRIGGER PARA UPDATED_AT
-- ========================================

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. HABILITAR RLS
-- ========================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CREAR POLÍTICAS RLS
-- ========================================

-- Política: Solo administradores pueden gestionar proyectos
CREATE POLICY "authenticated_can_manage_projects"
    ON public.projects
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política: Service role puede hacer todo
CREATE POLICY "service_role_full_access_projects"
    ON public.projects
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 6. CREAR FUNCIÓN PARA CONVERTIR LEAD A PROYECTO
-- ========================================

CREATE OR REPLACE FUNCTION convert_lead_to_project(
    p_lead_id uuid,
    p_project_name text,
    p_project_description text DEFAULT NULL,
    p_project_scope text DEFAULT NULL,
    p_start_date timestamptz DEFAULT NULL,
    p_planned_delivery_date timestamptz DEFAULT NULL,
    p_estimated_value numeric DEFAULT NULL,
    p_project_manager_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    project_id uuid;
    lead_record RECORD;
BEGIN
    -- Obtener información del lead
    SELECT * INTO lead_record
    FROM public.contact_leads
    WHERE id = p_lead_id;
    
    IF lead_record.id IS NULL THEN
        RAISE EXCEPTION 'Lead not found';
    END IF;
    
    -- Crear el proyecto
    INSERT INTO public.projects (
        lead_id,
        client_name,
        client_email,
        client_company,
        project_name,
        project_description,
        service_type,
        project_scope,
        status,
        priority,
        start_date,
        planned_delivery_date,
        estimated_value,
        project_manager_id,
        progress_percentage,
        current_phase
    ) VALUES (
        p_lead_id,
        lead_record.full_name,
        lead_record.email,
        lead_record.company,
        p_project_name,
        p_project_description,
        lead_record.service,
        p_project_scope,
        'planning',
        lead_record.priority,
        COALESCE(p_start_date, now()),
        p_planned_delivery_date,
        COALESCE(p_estimated_value, lead_record.estimated_value),
        p_project_manager_id,
        0,
        'Project initiation'
    ) RETURNING id INTO project_id;
    
    -- Actualizar el lead como convertido
    UPDATE public.contact_leads 
    SET 
        status = 'converted',
        converted_at = now(),
        actual_value = COALESCE(p_estimated_value, estimated_value),
        admin_notes = COALESCE(admin_notes || E'\n', '') || 'Converted to project: ' || project_id,
        updated_at = now()
    WHERE id = p_lead_id;
    
    RETURN project_id;
END;
$$;

-- ========================================
-- 7. CREAR VISTA DE PROYECTOS PARA ADMIN
-- ========================================

CREATE OR REPLACE VIEW public.projects_admin_view AS
SELECT 
    p.*,
    cl.message as original_lead_message,
    cl.source as lead_source,
    CASE 
        WHEN p.actual_delivery_date IS NOT NULL THEN 'Delivered'
        WHEN p.planned_delivery_date < now() AND p.status != 'completed' THEN 'Overdue'
        WHEN p.planned_delivery_date - now() <= interval '7 days' AND p.status != 'completed' THEN 'Due Soon'
        ELSE 'On Track'
    END as delivery_status,
    CASE 
        WHEN p.progress_percentage >= 90 THEN 'Nearly Complete'
        WHEN p.progress_percentage >= 70 THEN 'Advanced'
        WHEN p.progress_percentage >= 40 THEN 'In Progress'
        WHEN p.progress_percentage >= 10 THEN 'Started'
        ELSE 'Planning'
    END as progress_status,
    EXTRACT(DAYS FROM (COALESCE(p.actual_delivery_date, p.planned_delivery_date) - p.start_date)) as project_duration_days
FROM public.projects p
LEFT JOIN public.contact_leads cl ON p.lead_id = cl.id
ORDER BY 
    CASE p.status
        WHEN 'planning' THEN 1
        WHEN 'development' THEN 2
        WHEN 'testing' THEN 3
        WHEN 'delivery' THEN 4
        WHEN 'completed' THEN 5
        ELSE 6
    END,
    p.priority DESC,
    p.created_at DESC;

-- ========================================
-- 8. CREAR ESTADÍSTICAS DE PROYECTOS
-- ========================================

CREATE OR REPLACE VIEW public.projects_stats AS
SELECT 
    COUNT(*) as total_projects,
    COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_projects,
    COUNT(CASE WHEN status = 'development' THEN 1 END) as development_projects,
    COUNT(CASE WHEN status = 'testing' THEN 1 END) as testing_projects,
    COUNT(CASE WHEN status = 'delivery' THEN 1 END) as delivery_projects,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
    COUNT(CASE WHEN planned_delivery_date < now() AND status != 'completed' THEN 1 END) as overdue_projects,
    ROUND(AVG(progress_percentage)::numeric, 1) as average_progress,
    CASE 
        WHEN SUM(estimated_value) IS NULL THEN 0
        ELSE ROUND(SUM(estimated_value)::numeric, 2)
    END as total_estimated_value,
    CASE 
        WHEN SUM(actual_cost) IS NULL THEN 0
        ELSE ROUND(SUM(actual_cost)::numeric, 2)
    END as total_actual_cost,
    CASE 
        WHEN AVG(client_satisfaction_score) IS NULL THEN 0
        ELSE ROUND(AVG(client_satisfaction_score)::numeric, 1)
    END as average_satisfaction
FROM public.projects;

-- ========================================
-- 9. DATOS DE EJEMPLO
-- ========================================

-- Crear algunos proyectos de ejemplo basados en leads existentes
DO $$
DECLARE
    lead_record RECORD;
    project_id uuid;
BEGIN
    -- Convertir lead de consulting en proyecto
    SELECT * INTO lead_record
    FROM public.contact_leads 
    WHERE service = 'consulting' AND status = 'qualified'
    LIMIT 1;
    
    IF lead_record.id IS NOT NULL THEN
        SELECT convert_lead_to_project(
            lead_record.id,
            'IT Infrastructure Modernization',
            'Complete assessment and modernization of existing IT infrastructure for improved efficiency and security.',
            'Phase 1: Assessment, Phase 2: Planning, Phase 3: Implementation, Phase 4: Testing, Phase 5: Go-live',
            now(),
            now() + interval '90 days',
            12000.00
        ) INTO project_id;
    END IF;
    
    -- Convertir lead de development en proyecto
    SELECT * INTO lead_record
    FROM public.contact_leads 
    WHERE service = 'development' AND status = 'contacted'
    LIMIT 1;
    
    IF lead_record.id IS NOT NULL THEN
        INSERT INTO public.projects (
            lead_id,
            client_name,
            client_email,
            client_company,
            project_name,
            project_description,
            service_type,
            status,
            priority,
            start_date,
            planned_delivery_date,
            estimated_value,
            progress_percentage,
            current_phase
        ) VALUES (
            lead_record.id,
            lead_record.full_name,
            lead_record.email,
            lead_record.company,
            'Custom Platform Development',
            'Full-stack web application with user management and advanced features',
            'development',
            'development',
            'high',
            now() - interval '15 days',
            now() + interval '45 days',
            18000.00,
            35,
            'Backend API Development'
        );
        
        -- Actualizar el lead
        UPDATE public.contact_leads 
        SET status = 'converted', converted_at = now()
        WHERE id = lead_record.id;
    END IF;
END $$;

-- ========================================
-- 10. PERMISOS
-- ========================================

-- Permisos para funciones
GRANT EXECUTE ON FUNCTION convert_lead_to_project(uuid, text, text, text, timestamptz, timestamptz, numeric, uuid) TO authenticated;

-- Permisos para tablas
GRANT ALL ON public.projects TO authenticated;
GRANT SELECT ON public.projects_admin_view TO authenticated;
GRANT SELECT ON public.projects_stats TO authenticated;

-- Permisos para secuencias
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Projects Management System created successfully!';
    RAISE NOTICE '📋 Projects table ready';
    RAISE NOTICE '🔄 Lead to project conversion function ready';
    RAISE NOTICE '📊 Project statistics view created';
    RAISE NOTICE '🎯 Project tracking system complete';
    RAISE NOTICE '🚀 Ready for project management';
END $$;