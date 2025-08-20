import React from 'react';
import { Settings, Shield, Zap, Code, Database, Cloud, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Services = () => {
  const { t } = useLanguage();

  const scrollToContact = () => {
    const element = document.getElementById('contacto');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
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

  const services = [
    {
      icon: <Settings className="w-8 h-8" />,
      title: t('services.consulting.title'),
      description: t('services.consulting.description'),
      features: [t('services.consulting.feature1'), t('services.consulting.feature2'), t('services.consulting.feature3')],
      color: "from-blue-500 to-blue-600",
      highlight: "Most Popular"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t('services.security.title'),
      description: t('services.security.description'),
      features: [t('services.security.feature1'), t('services.security.feature2'), t('services.security.feature3')],
      color: "from-green-500 to-green-600",
      highlight: "High Demand"
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: t('services.cloud.title'),
      description: t('services.cloud.description'),
      features: [t('services.cloud.feature1'), t('services.cloud.feature2'), t('services.cloud.feature3')],
      color: "from-purple-500 to-purple-600",
      highlight: "Trending"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: t('services.development.title'),
      description: t('services.development.description'),
      features: [t('services.development.feature1'), t('services.development.feature2'), t('services.development.feature3')],
      color: "from-orange-500 to-orange-600",
      highlight: "Custom Solutions"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: t('services.data.title'),
      description: t('services.data.description'),
      features: [t('services.data.feature1'), t('services.data.feature2'), t('services.data.feature3')],
      color: "from-indigo-500 to-indigo-600",
      highlight: "Enterprise Ready"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: t('services.automation.title'),
      description: t('services.automation.description'),
      features: [t('services.automation.feature1'), t('services.automation.feature2'), t('services.automation.feature3')],
      color: "from-yellow-500 to-yellow-600",
      highlight: "Efficiency Boost"
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
              
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">
                  {service.title}
                </h3>
                
                <p className="text-slate-300 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleServiceInquiry(service.title)}
                  className={`group/btn w-full bg-gradient-to-r ${service.color} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2`}
                >
                  <span>{t('services.learnMore')}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
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
            {t('services.viewAll')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;