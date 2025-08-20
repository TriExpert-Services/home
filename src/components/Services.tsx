import React from 'react';
import { Settings, Shield, Zap, Code, Database, Cloud, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Settings className="w-8 h-8" />,
      title: t('services.consulting.title'),
      description: t('services.consulting.description'),
      features: [t('services.consulting.feature1'), t('services.consulting.feature2'), t('services.consulting.feature3')],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t('services.security.title'),
      description: t('services.security.description'),
      features: [t('services.security.feature1'), t('services.security.feature2'), t('services.security.feature3')],
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: t('services.cloud.title'),
      description: t('services.cloud.description'),
      features: [t('services.cloud.feature1'), t('services.cloud.feature2'), t('services.cloud.feature3')],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: t('services.development.title'),
      description: t('services.development.description'),
      features: [t('services.development.feature1'), t('services.development.feature2'), t('services.development.feature3')],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: t('services.data.title'),
      description: t('services.data.description'),
      features: [t('services.data.feature1'), t('services.data.feature2'), t('services.data.feature3')],
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: t('services.automation.title'),
      description: t('services.automation.description'),
      features: [t('services.automation.feature1'), t('services.automation.feature2'), t('services.automation.feature3')],
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t('services.translations.title'),
      description: t('services.translations.description'),
      features: [t('services.translations.feature1'), t('services.translations.feature2'), t('services.translations.feature3')],
      color: "from-red-500 to-red-600"
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
            <div key={index} className="group">
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
                
                <button className={`w-full bg-gradient-to-r ${service.color} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200`}>
                  {t('services.learnMore')}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-xl">
            {t('services.viewAll')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;