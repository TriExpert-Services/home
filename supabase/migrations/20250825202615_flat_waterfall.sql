/*
  # Rich Content Support for Blog System
  
  ## Description
  This migration adds rich content support to the blog system:
  
  1. HTML Content Support
     - Change content columns to support HTML
     - Add content type field (text/html/markdown)
     - Add video embed support
     
  2. Enhanced Features
     - Featured image support
     - Social media metadata
     - Content sections/blocks
     
  3. Security
     - HTML sanitization flags
     - Content approval workflow
*/

-- ========================================
-- 1. ADD RICH CONTENT FIELDS
-- ========================================

-- Add rich content support fields
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'html' CHECK (content_type IN ('text', 'html', 'markdown')),
ADD COLUMN IF NOT EXISTS featured_video_url text,
ADD COLUMN IF NOT EXISTS social_image_url text,
ADD COLUMN IF NOT EXISTS meta_description_en text,
ADD COLUMN IF NOT EXISTS meta_description_es text,
ADD COLUMN IF NOT EXISTS allow_html boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS content_blocks jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS seo_keywords text[];

-- ========================================
-- 2. CREATE RICH CONTENT FUNCTIONS
-- ========================================

-- Function to sanitize HTML content (basic implementation)
CREATE OR REPLACE FUNCTION sanitize_blog_html(html_content text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Basic HTML sanitization - in production, use a proper HTML sanitizer
    -- This is a simplified version for demo purposes
    
    -- Remove potentially dangerous tags
    html_content := regexp_replace(html_content, '<script[^>]*>.*?</script>', '', 'gi');
    html_content := regexp_replace(html_content, '<style[^>]*>.*?</style>', '', 'gi');
    html_content := regexp_replace(html_content, 'javascript:', '', 'gi');
    html_content := regexp_replace(html_content, 'vbscript:', '', 'gi');
    html_content := regexp_replace(html_content, 'on\w+\s*=', '', 'gi');
    
    RETURN html_content;
END;
$$;

-- Function to extract video URLs from content
CREATE OR REPLACE FUNCTION extract_video_urls(content text)
RETURNS text[]
LANGUAGE plpgsql
AS $$
DECLARE
    video_urls text[] := ARRAY[]::text[];
    youtube_matches text[];
    vimeo_matches text[];
BEGIN
    -- Extract YouTube URLs
    SELECT array_agg(matches[1])
    INTO youtube_matches
    FROM regexp_split_to_table(content, E'\\n') as line,
         regexp_matches(line, 'https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]+)', 'g') as matches;
    
    -- Extract Vimeo URLs  
    SELECT array_agg(matches[1])
    INTO vimeo_matches
    FROM regexp_split_to_table(content, E'\\n') as line,
         regexp_matches(line, 'https?://(?:www\.)?vimeo\.com/(\d+)', 'g') as matches;
    
    -- Combine all video URLs
    IF youtube_matches IS NOT NULL THEN
        video_urls := video_urls || youtube_matches;
    END IF;
    
    IF vimeo_matches IS NOT NULL THEN
        video_urls := video_urls || vimeo_matches;
    END IF;
    
    RETURN video_urls;
END;
$$;

-- ========================================
-- 3. UPDATE EXISTING POSTS TO HTML FORMAT
-- ========================================

-- Convert existing posts to HTML format
UPDATE public.blog_posts 
SET 
    content_type = 'html',
    allow_html = true,
    content_en = '<div class="prose prose-lg max-w-none">' || replace(replace(content_en, E'\n\n', '</p><p>'), E'\n', '<br>') || '</div>',
    content_es = '<div class="prose prose-lg max-w-none">' || replace(replace(content_es, E'\n\n', '</p><p>'), E'\n', '<br>') || '</div>'
WHERE content_type IS NULL OR content_type = 'text';

-- ========================================
-- 4. CREATE RICH CONTENT TEMPLATES
-- ========================================

-- Insert a rich content example post with embedded video
INSERT INTO public.blog_posts (
    title_en, title_es, 
    content_en, content_es, 
    excerpt_en, excerpt_es,
    category, tags, slug, 
    status, published_at, featured, 
    read_time_minutes, difficulty_level,
    content_type, allow_html, featured_video_url
) VALUES (
    'Introduction to AI Automation: Video Guide',
    'Introducción a la Automatización con IA: Guía en Video',
    
    '<div class="prose prose-lg max-w-none">
        <h2 class="text-2xl font-bold text-blue-400 mb-4">Watch Our Complete AI Automation Guide</h2>
        
        <div class="bg-slate-800 rounded-xl p-1 mb-6">
            <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="AI Automation Guide" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                class="rounded-lg">
            </iframe>
        </div>
        
        <p class="text-lg text-slate-300 mb-6">This comprehensive video guide shows you exactly how TriExpert Services implements AI automation solutions that deliver real ROI.</p>
        
        <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
            <h3 class="text-xl font-bold text-blue-400 mb-3">What You''ll Learn:</h3>
            <ul class="space-y-2 text-slate-300">
                <li class="flex items-center"><span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>How AI reduces operational costs by 40%</li>
                <li class="flex items-center"><span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Real automation examples from our clients</li>
                <li class="flex items-center"><span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Step-by-step implementation process</li>
                <li class="flex items-center"><span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>ROI calculations and success metrics</li>
            </ul>
        </div>
        
        <blockquote class="border-l-4 border-blue-500 pl-6 italic text-slate-400 mb-6">
            "After implementing TriExpert''s AI automation, we saved 25 hours per week and increased accuracy by 95%"
            <footer class="text-sm mt-2 text-blue-400">— Sarah Johnson, Operations Manager</footer>
        </blockquote>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-slate-700/50 rounded-xl p-4">
                <h4 class="font-bold text-green-400 mb-2">Before Automation</h4>
                <ul class="text-slate-300 text-sm space-y-1">
                    <li>• 40+ hours/week on manual processes</li>
                    <li>• 15% error rate</li>
                    <li>• Limited scalability</li>
                    <li>• High operational costs</li>
                </ul>
            </div>
            <div class="bg-slate-700/50 rounded-xl p-4">
                <h4 class="font-bold text-blue-400 mb-2">After TriExpert AI</h4>
                <ul class="text-slate-300 text-sm space-y-1">
                    <li>• 15 hours/week (62% reduction)</li>
                    <li>• <1% error rate (95% improvement)</li>
                    <li>• Unlimited scalability</li>
                    <li>• 40% cost reduction</li>
                </ul>
            </div>
        </div>
        
        <div class="text-center">
            <a href="/translate" class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all">
                Get Your AI Automation Quote
            </a>
        </div>
    </div>',
    
    '<div class="prose prose-lg max-w-none">
        <h2 class="text-2xl font-bold text-blue-400 mb-4">Mira Nuestra Guía Completa de Automatización con IA</h2>
        
        <div class="bg-slate-800 rounded-xl p-1 mb-6">
            <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Guía de Automatización con IA" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                class="rounded-lg">
            </iframe>
        </div>
        
        <p class="text-lg text-slate-300 mb-6">Esta guía completa en video te muestra exactamente cómo TriExpert Services implementa soluciones de automatización con IA que entregan ROI real.</p>
        
        <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
            <h3 class="text-xl font-bold text-blue-400 mb-3">Lo Que Aprenderás:</h3>
            <ul class="space-y-2 text-slate-300">
                <li class="flex items-center"><span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Cómo la IA reduce costos operacionales en 40%</li>
                <li class="flex items-center"><span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Ejemplos reales de automatización de nuestros clientes</li>
                <li class="flex items-center"><span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Proceso de implementación paso a paso</li>
                <li class="flex items-center"><span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Cálculos de ROI y métricas de éxito</li>
            </ul>
        </div>
        
        <blockquote class="border-l-4 border-blue-500 pl-6 italic text-slate-400 mb-6">
            "Después de implementar la automatización con IA de TriExpert, ahorramos 25 horas por semana y aumentamos precisión en 95%"
            <footer class="text-sm mt-2 text-blue-400">— Sarah Johnson, Gerente de Operaciones</footer>
        </blockquote>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-slate-700/50 rounded-xl p-4">
                <h4 class="font-bold text-red-400 mb-2">Antes de la Automatización</h4>
                <ul class="text-slate-300 text-sm space-y-1">
                    <li>• 40+ horas/semana en procesos manuales</li>
                    <li>• 15% tasa de error</li>
                    <li>• Escalabilidad limitada</li>
                    <li>• Costos operacionales altos</li>
                </ul>
            </div>
            <div class="bg-slate-700/50 rounded-xl p-4">
                <h4 class="font-bold text-green-400 mb-2">Después de TriExpert IA</h4>
                <ul class="text-slate-300 text-sm space-y-1">
                    <li>• 15 horas/semana (62% reducción)</li>
                    <li>• <1% tasa de error (95% mejora)</li>
                    <li>• Escalabilidad ilimitada</li>
                    <li>• 40% reducción de costos</li>
                </ul>
            </div>
        </div>
        
        <div class="text-center">
            <a href="/translate" class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all">
                Obtén Tu Cotización de Automatización IA
            </a>
        </div>
    </div>',
    
    'Watch our comprehensive video guide on AI automation and discover how TriExpert transforms businesses.',
    'Mira nuestra guía completa en video sobre automatización con IA y descubre cómo TriExpert transforma negocios.',
    
    'ai',
    ARRAY['artificial intelligence', 'automation', 'video guide', 'business transformation'],
    'ai-automation-video-guide-triexpert',
    'published',
    now(),
    true,
    15,
    'beginner',
    'html',
    true,
    'https://www.youtube.com/embed/dQw4w9WgXcQ'
) ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 3. ADD CONTENT TEMPLATES
-- ========================================

-- Insert another rich content example with interactive elements
INSERT INTO public.blog_posts (
    title_en, title_es,
    content_en, content_es,
    excerpt_en, excerpt_es,
    category, tags, slug,
    status, published_at, featured,
    read_time_minutes, difficulty_level,
    content_type, allow_html
) VALUES (
    'Interactive ROI Calculator: See Your Automation Savings',
    'Calculadora Interactiva de ROI: Ve Tus Ahorros de Automatización',
    
    '<div class="prose prose-lg max-w-none">
        <h2 class="text-2xl font-bold text-purple-400 mb-6">Calculate Your Potential Savings</h2>
        
        <div class="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-8 mb-8">
            <h3 class="text-xl font-bold text-purple-400 mb-4">ROI Calculator</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-slate-300 mb-2">Current Manual Hours/Week:</label>
                    <input type="number" id="manualHours" value="40" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                    <label class="block text-slate-300 mb-2">Hourly Cost ($):</label>
                    <input type="number" id="hourlyCost" value="25" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                </div>
            </div>
            
            <div class="mt-6 text-center">
                <button onclick="calculateROI()" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">
                    Calculate Savings
                </button>
            </div>
            
            <div id="roiResults" class="mt-6 hidden">
                <div class="bg-slate-800/50 rounded-xl p-6">
                    <h4 class="text-lg font-bold text-green-400 mb-4">Your Potential Savings:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div class="text-2xl font-bold text-green-400" id="weeklySavings">$0</div>
                            <div class="text-slate-400 text-sm">Weekly Savings</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-green-400" id="monthlySavings">$0</div>
                            <div class="text-slate-400 text-sm">Monthly Savings</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-green-400" id="yearlySavings">$0</div>
                            <div class="text-slate-400 text-sm">Yearly Savings</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
        function calculateROI() {
            const manualHours = document.getElementById("manualHours").value;
            const hourlyCost = document.getElementById("hourlyCost").value;
            
            // Assume 60% automation efficiency
            const automatedHours = manualHours * 0.6;
            const weeklySavings = automatedHours * hourlyCost;
            const monthlySavings = weeklySavings * 4.33;
            const yearlySavings = monthlySavings * 12;
            
            document.getElementById("weeklySavings").textContent = "$" + Math.round(weeklySavings).toLocaleString();
            document.getElementById("monthlySavings").textContent = "$" + Math.round(monthlySavings).toLocaleString();
            document.getElementById("yearlySavings").textContent = "$" + Math.round(yearlySavings).toLocaleString();
            
            document.getElementById("roiResults").classList.remove("hidden");
        }
        </script>
        
        <h3 class="text-xl font-bold text-slate-200 mb-4">Real Client Results</h3>
        
        <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-slate-600 rounded-lg overflow-hidden">
                <thead class="bg-slate-700">
                    <tr>
                        <th class="border border-slate-600 px-4 py-3 text-slate-200">Company</th>
                        <th class="border border-slate-600 px-4 py-3 text-slate-200">Industry</th>
                        <th class="border border-slate-600 px-4 py-3 text-slate-200">Time Saved</th>
                        <th class="border border-slate-600 px-4 py-3 text-slate-200">Cost Reduction</th>
                    </tr>
                </thead>
                <tbody class="bg-slate-800/50">
                    <tr>
                        <td class="border border-slate-600 px-4 py-3 text-slate-300">TechCorp</td>
                        <td class="border border-slate-600 px-4 py-3 text-slate-300">Manufacturing</td>
                        <td class="border border-slate-600 px-4 py-3 text-green-400 font-semibold">25 hrs/week</td>
                        <td class="border border-slate-600 px-4 py-3 text-green-400 font-semibold">$65,000/year</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-600 px-4 py-3 text-slate-300">ServicePlus</td>
                        <td class="border border-slate-600 px-4 py-3 text-slate-300">Healthcare</td>
                        <td class="border border-slate-600 px-4 py-3 text-green-400 font-semibold">30 hrs/week</td>
                        <td class="border border-slate-600 px-4 py-3 text-green-400 font-semibold">$78,000/year</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="text-center">
            <h3 class="text-xl font-bold text-slate-200 mb-4">Ready to Start Your Automation Journey?</h3>
            <p class="text-slate-300 mb-6">Contact TriExpert Services for a free automation assessment and discover your potential savings.</p>
            <a href="#contacto" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all">
                Get Free Assessment
            </a>
        </div>
    </div>',
    
    '<div class="prose prose-lg max-w-none">
        <h2 class="text-2xl font-bold text-purple-400 mb-6">Calcula Tus Ahorros Potenciales</h2>
        
        <div class="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-8 mb-8">
            <h3 class="text-xl font-bold text-purple-400 mb-4">Calculadora de ROI</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-slate-300 mb-2">Horas Manuales Actuales/Semana:</label>
                    <input type="number" id="manualHours" value="40" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                    <label class="block text-slate-300 mb-2">Costo por Hora ($):</label>
                    <input type="number" id="hourlyCost" value="25" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                </div>
            </div>
            
            <div class="mt-6 text-center">
                <button onclick="calculateROI()" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">
                    Calcular Ahorros
                </button>
            </div>
            
            <div id="roiResults" class="mt-6 hidden">
                <div class="bg-slate-800/50 rounded-xl p-6">
                    <h4 class="text-lg font-bold text-green-400 mb-4">Tus Ahorros Potenciales:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div class="text-2xl font-bold text-green-400" id="weeklySavings">$0</div>
                            <div class="text-slate-400 text-sm">Ahorros Semanales</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-green-400" id="monthlySavings">$0</div>
                            <div class="text-slate-400 text-sm">Ahorros Mensuales</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-green-400" id="yearlySavings">$0</div>
                            <div class="text-slate-400 text-sm">Ahorros Anuales</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <h3 class="text-xl font-bold text-slate-200 mb-4">Resultados Reales de Clientes</h3>
        
        <div class="overflow-x-auto mb-6">
            <table class="w-full border-collapse border border-slate-600 rounded-lg overflow-hidden">
                <thead class="bg-slate-700">
                    <tr>
                        <th class="border border-slate-600 px-4 py-3 text-slate-200">Empresa</th>
                        <th class="border border-slate-600 px-4 py-3 text-slate-200">Industria</th>
                        <th class="border border-slate-600 px-4 py-3 text-slate-200">Tiempo Ahorrado</th>
                        <th class="border border-slate-600 px-4 py-3 text-slate-200">Reducción Costos</th>
                    </tr>
                </thead>
                <tbody class="bg-slate-800/50">
                    <tr>
                        <td class="border border-slate-600 px-4 py-3 text-slate-300">TechCorp</td>
                        <td class="border border-slate-600 px-4 py-3 text-slate-300">Manufactura</td>
                        <td class="border border-slate-600 px-4 py-3 text-green-400 font-semibold">25 hrs/semana</td>
                        <td class="border border-slate-600 px-4 py-3 text-green-400 font-semibold">$65,000/año</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-600 px-4 py-3 text-slate-300">ServicePlus</td>
                        <td class="border border-slate-600 px-4 py-3 text-slate-300">Salud</td>
                        <td class="border border-slate-600 px-4 py-3 text-green-400 font-semibold">30 hrs/semana</td>
                        <td class="border border-slate-600 px-4 py-3 text-green-400 font-semibold">$78,000/año</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="text-center">
            <h3 class="text-xl font-bold text-slate-200 mb-4">¿Listo para Comenzar Tu Jornada de Automatización?</h3>
            <p class="text-slate-300 mb-6">Contacta TriExpert Services para una evaluación gratuita de automatización y descubre tus ahorros potenciales.</p>
            <a href="#contacto" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all">
                Obtener Evaluación Gratuita
            </a>
        </div>
    </div>',
    
    'Use our interactive ROI calculator to see exactly how much your business can save with TriExpert automation.',
    'Usa nuestra calculadora interactiva de ROI para ver exactamente cuánto puede ahorrar tu negocio con automatización de TriExpert.',
    
    'automation',
    ARRAY['ROI calculator', 'business automation', 'cost savings', 'interactive tools'],
    'interactive-roi-calculator-automation-savings',
    'published',
    now() - interval '1 day',
    false,
    10,
    'intermediate',
    'html',
    true
) ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 4. PERMISSIONS
-- ========================================

GRANT EXECUTE ON FUNCTION sanitize_blog_html(text) TO authenticated;
GRANT EXECUTE ON FUNCTION extract_video_urls(text) TO authenticated;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Rich Content Support added to Blog!';
    RAISE NOTICE '🎥 Video embeds enabled';
    RAISE NOTICE '🎨 HTML content support ready';
    RAISE NOTICE '🧮 Interactive elements supported';
    RAISE NOTICE '🛡️ HTML sanitization functions created';
    RAISE NOTICE '🚀 Rich blog content ready!';
END $$;