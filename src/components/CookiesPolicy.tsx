import React from 'react';
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, Mail, ToggleLeft, ToggleRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

interface CookiesPolicyProps {
  onBack: () => void;
}

const CookiesPolicy: React.FC<CookiesPolicyProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always required
    analytics: true,
    marketing: false,
    functional: true
  });

  const togglePreference = (type: keyof typeof cookiePreferences) => {
    if (type === 'essential') return; // Can't disable essential cookies
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const savePreferences = () => {
    // Save cookie preferences to localStorage
    localStorage.setItem('triexpert-cookie-preferences', JSON.stringify(cookiePreferences));
    
    // Show success message
    alert(language === 'es' 
      ? 'Preferencias de cookies guardadas exitosamente'
      : 'Cookie preferences saved successfully'
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-white hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cookie className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {language === 'es' ? 'Política de Cookies' : 'Cookies Policy'}
            </h1>
            <p className="text-slate-300">
              {language === 'es' 
                ? 'Última actualización: 20 de Enero, 2025' 
                : 'Last updated: January 20, 2025'
              }
            </p>
          </div>
        </div>

        {/* Cookie Preferences Panel */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-orange-400 mr-3" />
            <h2 className="text-2xl font-bold text-orange-400">
              {language === 'es' ? 'Configurar Cookies' : 'Cookie Settings'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Essential Cookies */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">
                  {language === 'es' ? 'Cookies Esenciales' : 'Essential Cookies'}
                </h3>
                <ToggleRight className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm text-slate-300">
                {language === 'es' 
                  ? 'Necesarias para el funcionamiento básico del sitio'
                  : 'Required for basic site functionality'
                }
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">
                  {language === 'es' ? 'Cookies de Análisis' : 'Analytics Cookies'}
                </h3>
                <button onClick={() => togglePreference('analytics')}>
                  {cookiePreferences.analytics 
                    ? <ToggleRight className="w-6 h-6 text-green-400" />
                    : <ToggleLeft className="w-6 h-6 text-gray-400" />
                  }
                </button>
              </div>
              <p className="text-sm text-slate-300">
                {language === 'es' 
                  ? 'Nos ayudan a mejorar nuestros servicios'
                  : 'Help us improve our services'
                }
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">
                  {language === 'es' ? 'Cookies Funcionales' : 'Functional Cookies'}
                </h3>
                <button onClick={() => togglePreference('functional')}>
                  {cookiePreferences.functional 
                    ? <ToggleRight className="w-6 h-6 text-green-400" />
                    : <ToggleLeft className="w-6 h-6 text-gray-400" />
                  }
                </button>
              </div>
              <p className="text-sm text-slate-300">
                {language === 'es' 
                  ? 'Recordar preferencias y configuraciones'
                  : 'Remember preferences and settings'
                }
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">
                  {language === 'es' ? 'Cookies de Marketing' : 'Marketing Cookies'}
                </h3>
                <button onClick={() => togglePreference('marketing')}>
                  {cookiePreferences.marketing 
                    ? <ToggleRight className="w-6 h-6 text-green-400" />
                    : <ToggleLeft className="w-6 h-6 text-gray-400" />
                  }
                </button>
              </div>
              <p className="text-sm text-slate-300">
                {language === 'es' 
                  ? 'Personalizar anuncios y contenido'
                  : 'Personalize ads and content'
                }
              </p>
            </div>
          </div>

          <button
            onClick={savePreferences}
            className="mt-6 w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all"
          >
            {language === 'es' ? 'Guardar Preferencias' : 'Save Preferences'}
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <div className="prose prose-invert max-w-none">
            {language === 'es' ? (
              <>
                {/* Spanish Content */}
                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <Cookie className="w-6 h-6 text-orange-400 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-400">1. ¿Qué son las Cookies?</h2>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Las cookies son pequeños archivos de texto que se almacenan en su navegador cuando visita nuestro sitio web. Estas cookies nos permiten recordar sus preferencias, mejorar su experiencia de navegación y proporcionar servicios personalizados.
                  </p>
                </section>

                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="w-6 h-6 text-orange-400 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-400">2. Tipos de Cookies que Utilizamos</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Cookies Esenciales</h3>
                      <p className="text-slate-300 mb-3">
                        Son absolutamente necesarias para el funcionamiento del sitio web. Sin estas cookies, el sitio web no funcionaría correctamente.
                      </p>
                      <ul className="text-slate-300 space-y-1 text-sm ml-4">
                        <li>• Autenticación de usuarios</li>
                        <li>• Seguridad del sitio web</li>
                        <li>• Preferencias de idioma</li>
                        <li>• Carrito de compras (para traducciones)</li>
                      </ul>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">Cookies de Rendimiento</h3>
                      <p className="text-slate-300 mb-3">
                        Recopilan información sobre cómo los visitantes usan nuestro sitio web para ayudarnos a mejorarlo.
                      </p>
                      <ul className="text-slate-300 space-y-1 text-sm ml-4">
                        <li>• Google Analytics (tráfico y comportamiento)</li>
                        <li>• Estadísticas de uso de páginas</li>
                        <li>• Tiempo de carga y errores</li>
                        <li>• Optimización de rendimiento</li>
                      </ul>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Cookies Funcionales</h3>
                      <p className="text-slate-300 mb-3">
                        Permiten que el sitio web recuerde las elecciones que hace para proporcionar funciones mejoradas.
                      </p>
                      <ul className="text-slate-300 space-y-1 text-sm ml-4">
                        <li>• Preferencias de idioma guardadas</li>
                        <li>• Configuraciones de usuario</li>
                        <li>• Formularios autocompletados</li>
                        <li>• Chat en vivo y soporte</li>
                      </ul>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-red-400 mb-2">Cookies de Marketing</h3>
                      <p className="text-slate-300 mb-3">
                        Se utilizan para rastrear a los visitantes en los sitios web con el fin de mostrar anuncios relevantes.
                      </p>
                      <ul className="text-slate-300 space-y-1 text-sm ml-4">
                        <li>• Seguimiento de conversiones</li>
                        <li>• Publicidad personalizada</li>
                        <li>• Redes sociales (Facebook, LinkedIn)</li>
                        <li>• Remarketing y retargeting</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">3. Cookies de Terceros</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    Utilizamos algunos servicios de terceros que pueden establecer cookies en su dispositivo:
                  </p>
                  <ul className="text-slate-300 space-y-3 ml-6">
                    <li>• <strong>Stripe:</strong> Para procesamiento seguro de pagos</li>
                    <li>• <strong>Supabase:</strong> Para gestión de base de datos y autenticación</li>
                    <li>• <strong>Google Analytics:</strong> Para análisis de tráfico web</li>
                    <li>• <strong>N8N:</strong> Para automatización de procesos</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">4. Control de Cookies</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    Usted puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están en su computadora y puede configurar la mayoría de los navegadores para evitar que se coloquen.
                  </p>
                  
                  <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Configuración del Navegador</h3>
                    <ul className="text-slate-300 space-y-2 text-sm">
                      <li>• <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                      <li>• <strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
                      <li>• <strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
                      <li>• <strong>Edge:</strong> Configuración → Cookies y permisos del sitio</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">5. Actualizaciones de la Política</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Esta política de cookies puede actualizarse periódicamente para reflejar cambios en nuestras prácticas o por razones operativas, legales o regulatorias. Le recomendamos revisar esta página regularmente.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">6. Contacto</h2>
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <p className="text-slate-300 mb-4">
                      Si tiene preguntas sobre nuestra política de cookies:
                    </p>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-orange-400" />
                        <span>support@triexpertservice.com</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-orange-400" />
                        <span>2800 E 113th Ave, Apt 120, Tampa, FL 33612</span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <>
                {/* English Content */}
                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <Cookie className="w-6 h-6 text-orange-400 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-400">1. What are Cookies?</h2>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Cookies are small text files that are stored in your browser when you visit our website. These cookies allow us to remember your preferences, improve your browsing experience, and provide personalized services.
                  </p>
                </section>

                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="w-6 h-6 text-orange-400 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-400">2. Types of Cookies We Use</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Essential Cookies</h3>
                      <p className="text-slate-300 mb-3">
                        These are absolutely necessary for the website to function properly. Without these cookies, the website would not work correctly.
                      </p>
                      <ul className="text-slate-300 space-y-1 text-sm ml-4">
                        <li>• User authentication</li>
                        <li>• Website security</li>
                        <li>• Language preferences</li>
                        <li>• Shopping cart (for translations)</li>
                      </ul>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">Performance Cookies</h3>
                      <p className="text-slate-300 mb-3">
                        These collect information about how visitors use our website to help us improve it.
                      </p>
                      <ul className="text-slate-300 space-y-1 text-sm ml-4">
                        <li>• Google Analytics (traffic and behavior)</li>
                        <li>• Page usage statistics</li>
                        <li>• Loading times and errors</li>
                        <li>• Performance optimization</li>
                      </ul>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Functional Cookies</h3>
                      <p className="text-slate-300 mb-3">
                        These allow the website to remember choices you make to provide enhanced features.
                      </p>
                      <ul className="text-slate-300 space-y-1 text-sm ml-4">
                        <li>• Saved language preferences</li>
                        <li>• User settings</li>
                        <li>• Form auto-completion</li>
                        <li>• Live chat and support</li>
                      </ul>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-red-400 mb-2">Marketing Cookies</h3>
                      <p className="text-slate-300 mb-3">
                        These are used to track visitors across websites to display relevant advertisements.
                      </p>
                      <ul className="text-slate-300 space-y-1 text-sm ml-4">
                        <li>• Conversion tracking</li>
                        <li>• Personalized advertising</li>
                        <li>• Social networks (Facebook, LinkedIn)</li>
                        <li>• Remarketing and retargeting</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">3. Third-Party Cookies</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    We use some third-party services that may set cookies on your device:
                  </p>
                  <ul className="text-slate-300 space-y-3 ml-6">
                    <li>• <strong>Stripe:</strong> For secure payment processing</li>
                    <li>• <strong>Supabase:</strong> For database management and authentication</li>
                    <li>• <strong>Google Analytics:</strong> For web traffic analysis</li>
                    <li>• <strong>N8N:</strong> For process automation</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">4. Cookie Control</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
                  </p>
                  
                  <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Browser Settings</h3>
                    <ul className="text-slate-300 space-y-2 text-sm">
                      <li>• <strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                      <li>• <strong>Firefox:</strong> Options → Privacy and security → Cookies</li>
                      <li>• <strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                      <li>• <strong>Edge:</strong> Settings → Cookies and site permissions</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">5. Policy Updates</h2>
                  <p className="text-slate-300 leading-relaxed">
                    This cookie policy may be updated periodically to reflect changes in our practices or for operational, legal, or regulatory reasons. We recommend reviewing this page regularly.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-orange-400 mb-4">6. Contact</h2>
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <p className="text-slate-300 mb-4">
                      If you have questions about our cookie policy:
                    </p>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-orange-400" />
                        <span>support@triexpertservice.com</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-orange-400" />
                        <span>2800 E 113th Ave, Apt 120, Tampa, FL 33612</span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;