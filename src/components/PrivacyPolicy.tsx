import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Lock, Mail, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const { t, language } = useLanguage();

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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
            </h1>
            <p className="text-slate-300">
              {language === 'es' 
                ? 'Última actualización: 20 de Enero, 2025' 
                : 'Last updated: January 20, 2025'
              }
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <div className="prose prose-invert max-w-none">
            {language === 'es' ? (
              <>
                {/* Spanish Content */}
                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <Eye className="w-6 h-6 text-purple-400 mr-3" />
                    <h2 className="text-2xl font-bold text-purple-400">1. Introducción</h2>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    En TriExpert Services LLC, respetamos su privacidad y nos comprometemos a proteger su información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestros servicios.
                  </p>
                </section>

                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <Database className="w-6 h-6 text-purple-400 mr-3" />
                    <h2 className="text-2xl font-bold text-purple-400">2. Información que Recopilamos</h2>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-blue-400 mb-3">2.1 Información Personal</h3>
                    <ul className="text-slate-300 space-y-2 ml-6">
                      <li>• Nombre completo y información de contacto</li>
                      <li>• Dirección de correo electrónico</li>
                      <li>• Número de teléfono</li>
                      <li>• Información de la empresa (opcional)</li>
                      <li>• Documentos para traducción certificada</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-blue-400 mb-3">2.2 Información Técnica</h3>
                    <ul className="text-slate-300 space-y-2 ml-6">
                      <li>• Dirección IP y datos de geolocalización</li>
                      <li>• Tipo de navegador y dispositivo</li>
                      <li>• Páginas visitadas y tiempo de navegación</li>
                      <li>• Cookies y tecnologías similares</li>
                    </ul>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center text-amber-400 mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Documentos Confidenciales</span>
                    </div>
                    <p className="text-slate-300">
                      Para servicios de traducción, tratamos todos los documentos con extrema confidencialidad y los eliminamos de nuestros servidores después de completar el servicio.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <Lock className="w-6 h-6 text-purple-400 mr-3" />
                    <h2 className="text-2xl font-bold text-purple-400">3. Cómo Usamos su Información</h2>
                  </div>
                  <ul className="text-slate-300 space-y-3 ml-6">
                    <li>• <strong>Prestación de servicios:</strong> Procesar solicitudes de traducción, consultoría y otros servicios profesionales</li>
                    <li>• <strong>Comunicación:</strong> Responder a consultas y proporcionar soporte técnico</li>
                    <li>• <strong>Mejora de servicios:</strong> Analizar el uso para mejorar nuestros servicios</li>
                    <li>• <strong>Facturación:</strong> Procesar pagos a través de Stripe</li>
                    <li>• <strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales y regulatorias</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">4. Compartir Información</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    No vendemos, alquilamos o compartimos su información personal con terceros, excepto en las siguientes circunstancias:
                  </p>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• <strong>Proveedores de servicios:</strong> Stripe para procesamiento de pagos, Supabase para almacenamiento de datos</li>
                    <li>• <strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o autoridades competentes</li>
                    <li>• <strong>Consentimiento:</strong> Con su consentimiento explícito</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">5. Seguridad de Datos</h2>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Medidas de Seguridad</h3>
                    <ul className="text-slate-300 space-y-2">
                      <li>• Encriptación SSL/TLS para toda la comunicación</li>
                      <li>• Almacenamiento seguro en servidores certificados</li>
                      <li>• Acceso limitado solo a personal autorizado</li>
                      <li>• Monitoreo continuo de seguridad</li>
                      <li>• Eliminación segura de documentos confidenciales</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">6. Retención de Datos</h2>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• <strong>Información de contacto:</strong> Mientras mantenga una cuenta activa</li>
                    <li>• <strong>Documentos de traducción:</strong> Eliminados 30 días después de la entrega</li>
                    <li>• <strong>Datos de facturación:</strong> Conservados según requisitos fiscales (7 años)</li>
                    <li>• <strong>Datos técnicos:</strong> Anonimizados después de 2 años</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">7. Sus Derechos</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">Usted tiene los siguientes derechos respecto a su información personal:</p>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• <strong>Acceso:</strong> Solicitar una copia de su información personal</li>
                    <li>• <strong>Corrección:</strong> Actualizar información inexacta o incompleta</li>
                    <li>• <strong>Eliminación:</strong> Solicitar la eliminación de su información</li>
                    <li>• <strong>Portabilidad:</strong> Obtener sus datos en formato transferible</li>
                    <li>• <strong>Objeción:</strong> Oponerse al procesamiento de sus datos</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">8. Contacto</h2>
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <p className="text-slate-300 mb-4">
                      Para ejercer sus derechos de privacidad o hacer preguntas sobre esta política:
                    </p>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-purple-400" />
                        <span>support@triexpertservice.com</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-purple-400" />
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
                    <Eye className="w-6 h-6 text-purple-400 mr-3" />
                    <h2 className="text-2xl font-bold text-purple-400">1. Introduction</h2>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    At TriExpert Services LLC, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our services.
                  </p>
                </section>

                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <Database className="w-6 h-6 text-purple-400 mr-3" />
                    <h2 className="text-2xl font-bold text-purple-400">2. Information We Collect</h2>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-blue-400 mb-3">2.1 Personal Information</h3>
                    <ul className="text-slate-300 space-y-2 ml-6">
                      <li>• Full name and contact information</li>
                      <li>• Email address</li>
                      <li>• Phone number</li>
                      <li>• Company information (optional)</li>
                      <li>• Documents for certified translation</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-blue-400 mb-3">2.2 Technical Information</h3>
                    <ul className="text-slate-300 space-y-2 ml-6">
                      <li>• IP address and geolocation data</li>
                      <li>• Browser type and device</li>
                      <li>• Pages visited and browsing time</li>
                      <li>• Cookies and similar technologies</li>
                    </ul>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center text-amber-400 mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Confidential Documents</span>
                    </div>
                    <p className="text-slate-300">
                      For translation services, we treat all documents with extreme confidentiality and delete them from our servers after completing the service.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <Lock className="w-6 h-6 text-purple-400 mr-3" />
                    <h2 className="text-2xl font-bold text-purple-400">3. How We Use Your Information</h2>
                  </div>
                  <ul className="text-slate-300 space-y-3 ml-6">
                    <li>• <strong>Service provision:</strong> Process translation requests, consulting, and other professional services</li>
                    <li>• <strong>Communication:</strong> Respond to inquiries and provide technical support</li>
                    <li>• <strong>Service improvement:</strong> Analyze usage to improve our services</li>
                    <li>• <strong>Billing:</strong> Process payments through Stripe</li>
                    <li>• <strong>Legal compliance:</strong> Comply with legal and regulatory obligations</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">4. Information Sharing</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    We do not sell, rent, or share your personal information with third parties, except in the following circumstances:
                  </p>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• <strong>Service providers:</strong> Stripe for payment processing, Supabase for data storage</li>
                    <li>• <strong>Legal compliance:</strong> When required by law or competent authorities</li>
                    <li>• <strong>Consent:</strong> With your explicit consent</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">5. Data Security</h2>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Security Measures</h3>
                    <ul className="text-slate-300 space-y-2">
                      <li>• SSL/TLS encryption for all communication</li>
                      <li>• Secure storage on certified servers</li>
                      <li>• Limited access only to authorized personnel</li>
                      <li>• Continuous security monitoring</li>
                      <li>• Secure deletion of confidential documents</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">6. Data Retention</h2>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• <strong>Contact information:</strong> While you maintain an active account</li>
                    <li>• <strong>Translation documents:</strong> Deleted 30 days after delivery</li>
                    <li>• <strong>Billing data:</strong> Retained per tax requirements (7 years)</li>
                    <li>• <strong>Technical data:</strong> Anonymized after 2 years</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">7. Your Rights</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">You have the following rights regarding your personal information:</p>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• <strong>Access:</strong> Request a copy of your personal information</li>
                    <li>• <strong>Correction:</strong> Update inaccurate or incomplete information</li>
                    <li>• <strong>Deletion:</strong> Request deletion of your information</li>
                    <li>• <strong>Portability:</strong> Obtain your data in transferable format</li>
                    <li>• <strong>Objection:</strong> Object to processing of your data</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">8. Contact</h2>
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <p className="text-slate-300 mb-4">
                      To exercise your privacy rights or ask questions about this policy:
                    </p>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-purple-400" />
                        <span>support@triexpertservice.com</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-purple-400" />
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

export default PrivacyPolicy;