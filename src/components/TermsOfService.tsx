import React from 'react';
import { ArrowLeft, Shield, FileText, AlertTriangle, Clock, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {language === 'es' ? 'Términos de Servicio' : 'Terms of Service'}
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
                    <Shield className="w-6 h-6 text-blue-400 mr-3" />
                    <h2 className="text-2xl font-bold text-blue-400">1. Aceptación de los Términos</h2>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Al acceder y utilizar los servicios de TriExpert Services LLC, ubicada en 2800 E 113th Ave, Apt 120, Tampa, Florida 33612, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestros servicios.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">2. Descripción de Servicios</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    TriExpert Services proporciona servicios profesionales de tecnología incluyendo, pero no limitándose a:
                  </p>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• Consultoría técnica y análisis de infraestructura</li>
                    <li>• Servicios de seguridad digital y ciberseguridad</li>
                    <li>• Migración y gestión de servicios en la nube</li>
                    <li>• Desarrollo de software personalizado</li>
                    <li>• Gestión y optimización de bases de datos</li>
                    <li>• Automatización de procesos empresariales</li>
                    <li>• Traducciones certificadas de documentos</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">3. Traducciones Certificadas</h2>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center text-amber-400 mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Términos Específicos para Traducciones</span>
                    </div>
                    <ul className="text-slate-300 space-y-2">
                      <li>• Las traducciones son realizadas por traductores certificados</li>
                      <li>• Los tiempos de entrega: Normal (8-12 horas), Urgente (1-2 horas)</li>
                      <li>• Servicio urgente tiene un costo adicional del 35%</li>
                      <li>• Precios: $20/página (1-9 páginas), $17.50/página (10+ páginas)</li>
                      <li>• Formato físico + digital tiene un costo adicional del 20%</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">4. Términos de Pago</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    Los pagos se procesan a través de Stripe, nuestro procesador de pagos seguro. Los precios están en dólares estadounidenses (USD). Para traducciones certificadas, el pago se requiere antes del inicio del trabajo.
                  </p>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• Aceptamos todas las tarjetas de crédito/débito principales</li>
                    <li>• Los pagos son procesados de forma segura por Stripe</li>
                    <li>• Política de reembolso disponible dentro de 24 horas del pago</li>
                    <li>• Los precios no incluyen impuestos aplicables</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">5. Confidencialidad</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Respetamos la confidencialidad de toda la información proporcionada por nuestros clientes. Toda la información, documentos y datos proporcionados son tratados con la más estricta confidencialidad y no serán compartidos con terceros sin consentimiento explícito.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">6. Limitación de Responsabilidad</h2>
                  <p className="text-slate-300 leading-relaxed">
                    TriExpert Services no será responsable por daños indirectos, incidentales o consecuentes que surjan del uso de nuestros servicios. Nuestra responsabilidad total no excederá el monto pagado por los servicios específicos.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">7. Modificaciones</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en nuestro sitio web.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">8. Contacto</h2>
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <p className="text-slate-300 mb-4">
                      Para preguntas sobre estos términos, contáctenos:
                    </p>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-400" />
                        <span>support@triexpertservice.com</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-400" />
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
                    <Shield className="w-6 h-6 text-blue-400 mr-3" />
                    <h2 className="text-2xl font-bold text-blue-400">1. Acceptance of Terms</h2>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    By accessing and using the services of TriExpert Services LLC, located at 2800 E 113th Ave, Apt 120, Tampa, Florida 33612, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you should not use our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">2. Service Description</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    TriExpert Services provides professional technology services including, but not limited to:
                  </p>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• Technical consulting and infrastructure analysis</li>
                    <li>• Digital security and cybersecurity services</li>
                    <li>• Cloud services migration and management</li>
                    <li>• Custom software development</li>
                    <li>• Database management and optimization</li>
                    <li>• Business process automation</li>
                    <li>• Certified document translations</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">3. Certified Translations</h2>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center text-amber-400 mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Translation-Specific Terms</span>
                    </div>
                    <ul className="text-slate-300 space-y-2">
                      <li>• Translations are performed by certified translators</li>
                      <li>• Delivery times: Standard (8-12 hours), Urgent (1-2 hours)</li>
                      <li>• Urgent service has an additional 35% cost</li>
                      <li>• Pricing: $20/page (1-9 pages), $17.50/page (10+ pages)</li>
                      <li>• Physical + digital format has an additional 20% cost</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">4. Payment Terms</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    Payments are processed through Stripe, our secure payment processor. Prices are in US Dollars (USD). For certified translations, payment is required before work begins.
                  </p>
                  <ul className="text-slate-300 space-y-2 ml-6">
                    <li>• We accept all major credit/debit cards</li>
                    <li>• Payments are securely processed by Stripe</li>
                    <li>• Refund policy available within 24 hours of payment</li>
                    <li>• Prices do not include applicable taxes</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">5. Confidentiality</h2>
                  <p className="text-slate-300 leading-relaxed">
                    We respect the confidentiality of all information provided by our clients. All information, documents, and data provided are treated with the strictest confidentiality and will not be shared with third parties without explicit consent.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">6. Limitation of Liability</h2>
                  <p className="text-slate-300 leading-relaxed">
                    TriExpert Services shall not be liable for indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for specific services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">7. Modifications</h2>
                  <p className="text-slate-300 leading-relaxed">
                    We reserve the right to modify these terms at any time. Modifications will take effect immediately after posting on our website.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-blue-400 mb-4">8. Contact</h2>
                  <div className="bg-slate-700/50 rounded-xl p-6">
                    <p className="text-slate-300 mb-4">
                      For questions about these terms, contact us:
                    </p>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-400" />
                        <span>support@triexpertservice.com</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-400" />
                        <span>2800 E 113th Ave, Apt 120, Tampa, FL 33612</span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center text-yellow-400 mb-2">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {language === 'es' 
                ? 'Estos términos están sujetos a las leyes del estado de Florida, EE.UU.' 
                : 'These terms are subject to the laws of the state of Florida, USA.'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;