import React from 'react';
import { Target, Users, Award, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: <Users className="w-6 h-6" />, number: "500+", label: t('about.projects') },
    { icon: <Award className="w-6 h-6" />, number: "15+", label: t('about.years') },
    { icon: <TrendingUp className="w-6 h-6" />, number: "98%", label: t('about.satisfaction') },
    { icon: <Target className="w-6 h-6" />, number: "24/7", label: t('about.support') }
  ];

  return (
    <section id="nosotros" className="py-20 bg-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-100 rounded-full px-4 py-2 mb-6">
              <Target className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-600 text-sm font-medium">{t('about.badge')}</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t('about.title')}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> {t('about.titleAccent')}</span>
            </h2>
            
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              {t('about.description')}
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <span className="text-slate-300">{t('about.feature1')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <span className="text-slate-300">{t('about.feature2')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <span className="text-slate-300">{t('about.feature3')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <span className="text-slate-300">{t('about.feature4')}</span>
              </div>
            </div>
            
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
              {t('about.learnMore')}
            </button>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-600">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-slate-700/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-600">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-300">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 bg-slate-700/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-600">
                <h3 className="font-bold text-white mb-3">{t('about.mission')}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {t('about.missionText')}
                </p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;