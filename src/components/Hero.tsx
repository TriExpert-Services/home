import React from 'react';
import { ArrowRight, Star, Users, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Tech-inspired background */}
      <div className="absolute inset-0 bg-slate-900"></div>
      
      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Floating tech elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Connection nodes */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 left-40 w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-40 left-24 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-32 right-40 w-2 h-2 bg-indigo-300 rounded-full animate-pulse delay-300"></div>
        
        {/* Connection lines */}
        <svg className="absolute top-20 left-20 w-96 h-96 opacity-30" viewBox="0 0 400 400">
          <path d="M20 20 L180 160 L320 80 L200 240" stroke="url(#gradient1)" strokeWidth="1" fill="none" strokeDasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="2s" repeatCount="indefinite"/>
          </path>
          <path d="M80 320 L240 180 L360 280" stroke="url(#gradient2)" strokeWidth="1" fill="none" strokeDasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="8;0" dur="3s" repeatCount="indefinite"/>
          </path>
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#6366f1"/>
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4"/>
              <stop offset="100%" stopColor="#3b82f6"/>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Data blocks */}
        <div className="absolute top-60 right-20 opacity-20">
          <div className="grid grid-cols-3 gap-1">
            <div className="w-2 h-2 bg-blue-400 animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-indigo-400 animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-cyan-400 animate-pulse delay-500"></div>
            <div className="w-2 h-2 bg-blue-300 animate-pulse delay-700"></div>
            <div className="w-2 h-2 bg-indigo-300 animate-pulse delay-900"></div>
            <div className="w-2 h-2 bg-cyan-300 animate-pulse delay-1100"></div>
          </div>
        </div>
        
        {/* Server racks representation */}
        <div className="absolute bottom-20 left-1/4 opacity-10">
          <div className="flex space-x-1">
            <div className="w-4 h-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm animate-pulse"></div>
            <div className="w-4 h-12 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-sm animate-pulse delay-500"></div>
            <div className="w-4 h-14 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-sm animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
      
      {/* Subtle glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-sm font-medium">{t('hero.badge')}</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t('hero.title')}
            <span className="block bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              {t('hero.subtitle')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-2xl flex items-center justify-center space-x-2">
              <span>{t('hero.getStarted')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20">
              {t('hero.learnMore')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-3 mx-auto">
                <Users className="w-6 h-6 text-blue-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-blue-200">{t('hero.clients')}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-500/20 rounded-xl mb-3 mx-auto">
                <Award className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">15+</div>
              <div className="text-blue-200">{t('hero.experience')}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-3 mx-auto">
                <Star className="w-6 h-6 text-purple-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-blue-200">{t('hero.rating')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;