/*
  # Fix Function Parameters Default Values Error
  
  ## Description
  This migration fixes the PostgreSQL error about function parameters.
  In PostgreSQL, if a parameter has a default value, ALL subsequent parameters
  must also have default values.
  
  ## Solution
  Reorder parameters so required ones come first, then optional ones with defaults.
*/

-- ========================================
-- 1. DROP AND RECREATE THE FUNCTION WITH CORRECT PARAMETER ORDER
-- ========================================

-- Drop the problematic function
DROP FUNCTION IF EXISTS create_contact_lead(text, text, text, text, text, text, text, text, inet, text);

-- Create the function with correct parameter order
CREATE OR REPLACE FUNCTION create_contact_lead(
    p_full_name text,
    p_email text,
    p_message text,
    p_company text DEFAULT NULL,
    p_service text DEFAULT NULL,
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
-- 2. GRANT PERMISSIONS
-- ========================================

GRANT EXECUTE ON FUNCTION create_contact_lead(text, text, text, text, text, text, text, text, inet, text) TO anon, authenticated;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Function parameters fixed!';
    RAISE NOTICE '🔧 Required parameters moved to beginning';
    RAISE NOTICE '📝 Optional parameters with defaults at end';
    RAISE NOTICE '🚀 Contact lead creation should work now';
END $$;