import React from 'react';
import { useState } from 'react';
import { Settings, Shield, Zap, Code, Database, Cloud, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Services = () => {
  const { t, language } = useLanguage();
  const [expandedService, setExpandedService] = useState<number | null>(null);

  const scrollToContact = () => {
    const element = document.getElementById('contacto');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleTranslationFormClick = () => {
    // Navigate to /translate route
    window.history.pushState({}, '', '/translate');
    window.dispatchEvent(new Event('popstate'));
  };

  const handleServiceInquiry = (serviceTitle: string) => {
    // Scroll to contact form and pre-select the service
    scrollToContact();
    
    // Wait for scroll to complete, then set the service
    setTimeout(() => {
      const serviceSelect = document.querySelector('select[name="service"]') as HTMLSelectElement;
      if (serviceSelect) {
        // Map service titles to option values
        const serviceMap: { [key: string]: string } = {
          [t('services.consulting.title')]: 'consulting',
          [t('services.security.title')]: 'security',
          [t('services.cloud.title')]: 'cloud',
          [t('services.development.title')]: 'development',
          [t('services.data.title')]: 'data',
          [t('services.automation.title')]: 'automation',
          [t('services.translations.title')]: 'translations'
        };
        
        const serviceValue = serviceMap[serviceTitle];
        if (serviceValue) {
          serviceSelect.value = serviceValue;
          // Trigger change event
          serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }, 1000);
  };

  const toggleService = (index: number) => {
    setExpandedService(expandedService === index ? null : index);
  };

  const services = [
    {
      icon: <Settings className="w-8 h-8" />,
      title: t('services.consulting.title'),
      description: t('services.consulting.description'),
      detailedDescription: t('services.consulting.detailed'),
      businessBenefits: {
        small: t('services.consulting.smallBusiness'),
        medium: t('services.consulting.mediumBusiness'), 
        enterprise: t('services.consulting.enterprise')
      },
      features: [t('services.consulting.feature1'), t('services.consulting.feature2'), t('services.consulting.feature3')],
      color: "from-blue-500 to-blue-600",
      highlight: "Most Popular",
      keyBenefits: [
        t('services.consulting.benefit1'),
        t('services.consulting.benefit2'), 
        t('services.consulting.benefit3'),
        t('services.consulting.benefit4')
      ]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t('services.security.title'),
      description: t('services.security.description'),
      detailedDescription: t('services.security.detailed'),
      businessBenefits: {
        small: t('services.security.smallBusiness'),
        medium: t('services.security.mediumBusiness'),
        enterprise: t('services.security.enterprise')
      },
      features: [t('services.security.feature1'), t('services.security.feature2'), t('services.security.feature3')],
      color: "from-green-500 to-green-600",
      highlight: "High Demand",
      keyBenefits: [
        t('services.security.benefit1'),
        t('services.security.benefit2'),
        t('services.security.benefit3'), 
        t('services.security.benefit4')
      ]
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: t('services.cloud.title'),
      description: t('services.cloud.description'),
      detailedDescription: t('services.cloud.detailed'),
      businessBenefits: {
        small: t('services.cloud.smallBusiness'),
        medium: t('services.cloud.mediumBusiness'),
        enterprise: t('services.cloud.enterprise')
      },
      features: [t('services.cloud.feature1'), t('services.cloud.feature2'), t('services.cloud.feature3')],
      color: "from-purple-500 to-purple-600",
      highlight: "Trending",
      keyBenefits: [
        t('services.cloud.benefit1'),
        t('services.cloud.benefit2'),
        t('services.cloud.benefit3'),
        t('services.cloud.benefit4')
      ]
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: t('services.development.title'),
      description: t('services.development.description'),
      detailedDescription: t('services.development.detailed'),
      businessBenefits: {
        small: t('services.development.smallBusiness'),
        medium: t('services.development.mediumBusiness'),
        enterprise: t('services.development.enterprise')
      },
      features: [t('services.development.feature1'), t('services.development.feature2'), t('services.development.feature3')],
      color: "from-orange-500 to-orange-600",
      highlight: "Custom Solutions",
      keyBenefits: [
        t('services.development.benefit1'),
        t('services.development.benefit2'),
        t('services.development.benefit3'),
        t('services.development.benefit4')
      ]
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: t('services.data.title'),
      description: t('services.data.description'),
      detailedDescription: t('services.data.detailed'),
      businessBenefits: {
        small: t('services.data.smallBusiness'),
        medium: t('services.data.mediumBusiness'),
        enterprise: t('services.data.enterprise')
      },
      features: [t('services.data.feature1'), t('services.data.feature2'), t('services.data.feature3')],
      color: "from-indigo-500 to-indigo-600",
      highlight: "Enterprise Ready",
      keyBenefits: [
        t('services.data.benefit1'),
        t('services.data.benefit2'),
        t('services.data.benefit3'),
        t('services.data.benefit4')
      ]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: t('services.automation.title'),
      description: t('services.automation.description'),
      detailedDescription: t('services.automation.detailed'),
      businessBenefits: {
        small: t('services.automation.smallBusiness'),
        medium: t('services.automation.mediumBusiness'),
        enterprise: t('services.automation.enterprise')
      },
      features: [t('services.automation.feature1'), t('services.automation.feature2'), t('services.automation.feature3')],
      color: "from-yellow-500 to-yellow-600",
      highlight: "Efficiency Boost",
      keyBenefits: [
        t('services.automation.benefit1'),
        t('services.automation.benefit2'),
        t('services.automation.benefit3'),
        t('services.automation.benefit4')
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t('services.translations.title'),
      description: t('services.translations.description'),
      features: [t('services.translations.feature1'), t('services.translations.feature2'), t('services.translations.feature3')],
      color: "from-red-500 to-red-600",
      highlight: "Certified"
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 text-sm font-medium">{t('services.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('services.title')}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> {t('services.titleAccent')}</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {t('services.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group relative">
              {/* Service highlight badge */}
              {service.highlight && (
                <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${service.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg z-10 transform rotate-3`}>
                  {service.highlight}
                </div>
              )}
              
              <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                expandedService === index ? 'border-blue-500/50' : ''
              }`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {service.title}
                </h3>
                
                <p className="text-slate-300 mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Expanded Content - Only shown when service is expanded */}
                {expandedService === index && (
                  <div className="mb-6 animate-in slide-in-from-top duration-300">
                    {/* Detailed Description - Only for non-translation services */}
                    {service.detailedDescription && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">
                          {language === 'es' ? 'Descripción Detallada' : 'Detailed Description'}
                        </h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {service.detailedDescription}
                        </p>
                      </div>
                    )}

                    {/* Business Benefits - Only for non-translation services */}
                    {service.businessBenefits && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">
                          {language === 'es' ? 'Beneficios por Sector' : 'Benefits by Sector'}
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-slate-700/30 rounded-lg p-3">
                            <h5 className="font-medium text-green-400 text-sm mb-1">
                              {language === 'es' ? 'Pequeñas Empresas:' : 'Small Businesses:'}
                            </h5>
                            <p className="text-slate-300 text-xs">{service.businessBenefits.small}</p>
                          </div>
                          <div className="bg-slate-700/30 rounded-lg p-3">
                            <h5 className="font-medium text-blue-400 text-sm mb-1">
                              {language === 'es' ? 'Medianas Empresas:' : 'Medium Businesses:'}
                            </h5>
                            <p className="text-slate-300 text-xs">{service.businessBenefits.medium}</p>
                          </div>
                          <div className="bg-slate-700/30 rounded-lg p-3">
                            <h5 className="font-medium text-purple-400 text-sm mb-1">
                              {language === 'es' ? 'Grandes Empresas:' : 'Enterprise:'}
                            </h5>
                            <p className="text-slate-300 text-xs">{service.businessBenefits.enterprise}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Key Benefits - Only for non-translation services */}
                    {service.keyBenefits && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-orange-400 mb-3">
                          {language === 'es' ? 'Beneficios Clave' : 'Key Benefits'}
                        </h4>
                        <ul className="space-y-2">
                          {service.keyBenefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-start text-sm text-slate-300">
                              <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full mr-3 mt-1.5 flex-shrink-0`}></div>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    </div>
                )}

                {/* Regular Features */}
                <div className={`mb-6 ${expandedService === index ? '' : 'mb-auto'}`}>
                  <h4 className="text-base font-medium text-white mb-3">
                    {language === 'es' ? 'Incluye:' : 'Includes:'}
                  </h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-slate-400">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3">
                  {/* Learn More / Collapse Button */}
                  {(service.detailedDescription || service.businessBenefits || service.keyBenefits) && (
                    <button 
                      onClick={() => toggleService(index)}
                      className="w-full bg-slate-600/50 hover:bg-slate-600/70 text-slate-300 hover:text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border border-slate-600 hover:border-slate-500"
                    >
                      <span>
                        {expandedService === index 
                          ? (language === 'es' ? 'Mostrar Menos' : 'Show Less')
                          : t('services.learnMore')
                        }
                      </span>
                      <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                        expandedService === index ? 'rotate-90' : ''
                      }`} />
                    </button>
                  )}

                  {/* Action Button */}
                  <button 
                    onClick={() => {
                      if (service.title === t('services.translations.title')) {
                        handleTranslationFormClick();
                      } else {
                        handleServiceInquiry(service.title);
                      }
                    }}
                    className={`group/btn w-full bg-gradient-to-r ${service.color} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2`}
                  >
                    <span>
                      {service.title === t('services.translations.title') 
                        ? (language === 'es' ? 'Solicitar Traducción' : 'Request Translation')
                        : (language === 'es' ? 'Solicitar Consulta' : 'Request Consultation')
                      }
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button 
            onClick={scrollToContact}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center space-x-3 mx-auto"
          >
            <span>{t('services.viewAll')}</span>
            <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          
          <p className="text-slate-400 mt-4 text-sm">
            Need a custom solution? Our experts are ready to help you find the perfect fit.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;