import React from 'react';
import { ArrowLeft, Cookie, BarChart3, Shield, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CookiesPolicyProps {
  onBack: () => void;
}

const CookiesPolicy: React.FC<CookiesPolicyProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-white hover:text-blue-300 transition-colors"
            aria-label={es ? 'Volver' : 'Back'}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cookie className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {es ? 'Política de Cookies' : 'Cookies Policy'}
            </h1>
            <p className="text-slate-300">
              {es ? 'Última actualización: 22 de junio, 2026' : 'Last updated: June 22, 2026'}
            </p>
          </div>
        </div>

        {/* Honest summary */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center mb-3">
            <Shield className="w-6 h-6 text-emerald-400 mr-3" />
            <h2 className="text-2xl font-bold text-emerald-400">
              {es ? 'En resumen' : 'In short'}
            </h2>
          </div>
          <p className="text-slate-200 leading-relaxed">
            {es
              ? 'Este sitio NO usa cookies de publicidad, de marketing ni de rastreo entre sitios. Solo usamos almacenamiento estrictamente necesario y funcional (por ejemplo, recordar tu idioma) y estadísticas de tráfico anónimas y sin cookies. Por eso no mostramos un banner de consentimiento de cookies.'
              : 'This site does NOT use advertising, marketing, or cross-site tracking cookies. We only use strictly necessary and functional storage (for example, remembering your language) and anonymous, cookieless traffic statistics. That is why we do not show a cookie-consent banner.'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Cookie className="w-6 h-6 text-orange-400 mr-3" />
                <h2 className="text-2xl font-bold text-orange-400">
                  {es ? '1. ¿Qué son las cookies y el almacenamiento local?' : '1. What are cookies and local storage?'}
                </h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {es
                  ? 'Las cookies son pequeños archivos que un sitio guarda en tu navegador. Muchos sitios también usan "local storage", un almacenamiento similar dentro del navegador. Nosotros usamos principalmente local storage para recordar ajustes básicos; no usamos cookies para publicidad ni para seguirte por otros sitios.'
                  : 'Cookies are small files a site stores in your browser. Many sites also use "local storage", a similar in-browser store. We mainly use local storage to remember basic settings; we do not use cookies for advertising or to track you across other sites.'}
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-6 h-6 text-orange-400 mr-3" />
                <h2 className="text-2xl font-bold text-orange-400">
                  {es ? '2. Qué usamos exactamente' : '2. What we actually use'}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">
                    {es ? 'Esencial y funcional (sin consentimiento)' : 'Essential & functional (no consent needed)'}
                  </h3>
                  <p className="text-slate-300 mb-3">
                    {es
                      ? 'Necesario para que el sitio funcione y recuerde tus preferencias. Se guarda en el almacenamiento local de tu navegador, no se comparte con terceros con fines publicitarios.'
                      : 'Needed for the site to work and to remember your preferences. Stored in your browser’s local storage and not shared with third parties for advertising.'}
                  </p>
                  <ul className="text-slate-300 space-y-1 text-sm ml-4">
                    <li>• {es ? 'Tu preferencia de idioma (ES/EN)' : 'Your language preference (ES/EN)'}</li>
                    <li>• {es ? 'Sesión de inicio de sesión del panel de administración (solo para personal)' : 'Admin panel login session (staff only)'}</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">
                    {es ? 'Estadísticas anónimas sin cookies' : 'Anonymous, cookieless statistics'}
                  </h3>
                  <p className="text-slate-300 mb-3">
                    {es
                      ? 'Para entender cuántas personas visitan el sitio usamos una herramienta de analítica respetuosa con la privacidad que NO usa cookies, no rastrea entre sitios y no recopila datos personales identificables.'
                      : 'To understand how many people visit the site we use a privacy-friendly analytics tool that does NOT use cookies, does not track across sites, and does not collect identifiable personal data.'}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-orange-400 mb-4">
                {es ? '3. Servicios de terceros' : '3. Third-party services'}
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                {es
                  ? 'Algunos servicios que hacen funcionar el sitio pueden establecer su propio almacenamiento cuando interactúas con ellos:'
                  : 'Some services that make the site work may set their own storage when you interact with them:'}
              </p>
              <ul className="text-slate-300 space-y-3 ml-6">
                <li>• <strong>Stripe:</strong> {es ? 'procesamiento seguro de pagos (solo cuando procedes al pago de una traducción).' : 'secure payment processing (only when you proceed to pay for a translation).'}</li>
                <li>• <strong>Supabase:</strong> {es ? 'base de datos y autenticación del sitio.' : 'site database and authentication.'}</li>
              </ul>
              <p className="text-slate-400 text-sm mt-4">
                {es
                  ? 'No usamos Google Analytics, píxeles de redes sociales, ni cookies de remarketing o publicidad.'
                  : 'We do not use Google Analytics, social-media pixels, or remarketing/advertising cookies.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-orange-400 mb-4">
                {es ? '4. Control del almacenamiento' : '4. Controlling storage'}
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                {es
                  ? 'Puedes borrar el almacenamiento y las cookies de este sitio en cualquier momento desde la configuración de tu navegador. Hacerlo solo restablecerá ajustes básicos como tu idioma.'
                  : 'You can clear this site’s storage and cookies at any time from your browser settings. Doing so will only reset basic settings such as your language.'}
              </p>
              <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  {es ? 'Configuración del navegador' : 'Browser settings'}
                </h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>• <strong>Chrome:</strong> {es ? 'Configuración → Privacidad y seguridad → Cookies' : 'Settings → Privacy and security → Cookies'}</li>
                  <li>• <strong>Firefox:</strong> {es ? 'Opciones → Privacidad y seguridad → Cookies' : 'Options → Privacy and security → Cookies'}</li>
                  <li>• <strong>Safari:</strong> {es ? 'Preferencias → Privacidad' : 'Preferences → Privacy'}</li>
                  <li>• <strong>Edge:</strong> {es ? 'Configuración → Cookies y permisos del sitio' : 'Settings → Cookies and site permissions'}</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-orange-400 mb-4">
                {es ? '5. Actualizaciones de la política' : '5. Policy updates'}
              </h2>
              <p className="text-slate-300 leading-relaxed">
                {es
                  ? 'Esta política puede actualizarse para reflejar cambios en nuestras prácticas o por razones legales. Si en el futuro añadimos alguna cookie no esencial, actualizaremos esta página y, si la ley lo requiere, pediremos tu consentimiento primero.'
                  : 'This policy may be updated to reflect changes in our practices or for legal reasons. If we ever add a non-essential cookie, we will update this page and, where required by law, ask for your consent first.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-orange-400 mb-4">
                {es ? '6. Contacto' : '6. Contact'}
              </h2>
              <div className="bg-slate-700/50 rounded-xl p-6">
                <p className="text-slate-300 mb-4">
                  {es ? 'Si tienes preguntas sobre esta política:' : 'If you have questions about this policy:'}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
