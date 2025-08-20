import React from 'react';
import { ArrowRight, Star, Users, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Tech-inspired background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-indigo-900/30"></div>
      
      {/* Advanced tech pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        {/* Hexagonal grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2px, transparent 2px),
            linear-gradient(30deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(150deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px, 100px 100px, 100px 100px'
        }}></div>
        
        {/* Digital matrix rain effect */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 70%, rgba(59, 130, 246, 0.03) 100%),
            linear-gradient(90deg, transparent 70%, rgba(99, 102, 241, 0.03) 100%)
          `,
          backgroundSize: '20px 40px, 40px 20px',
          animation: 'matrix 20s linear infinite'
        }}></div>
      </div>
      
      {/* Futuristic floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Holographic nodes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
        <div className="absolute top-32 left-40 w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse delay-1000 shadow-lg shadow-indigo-400/50"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full animate-pulse delay-500 shadow-lg shadow-cyan-400/50"></div>
        <div className="absolute bottom-40 left-24 w-2 h-2 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full animate-pulse delay-700 shadow-lg shadow-blue-300/50"></div>
        <div className="absolute bottom-32 right-40 w-4 h-4 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-full animate-pulse delay-300 shadow-lg shadow-indigo-300/50"></div>
        
        {/* Floating hexagons */}
        <div className="absolute top-60 left-10 opacity-20">
          <div className="w-8 h-8 border-2 border-blue-400 rotate-45 transform animate-spin-slow"></div>
        </div>
        <div className="absolute top-80 right-20 opacity-15">
          <div className="w-12 h-12 border-2 border-indigo-400 rotate-12 transform animate-bounce-slow"></div>
        </div>
        <div className="absolute bottom-60 left-1/3 opacity-25">
          <div className="w-6 h-6 border-2 border-cyan-400 rotate-45 transform animate-pulse"></div>
        </div>
        
        {/* Neural network connections */}
        <svg className="absolute top-10 left-10 w-full h-full opacity-20" viewBox="0 0 1200 800">
          <path d="M50 50 Q300 200 600 100 T1100 300" stroke="url(#gradient1)" strokeWidth="2" fill="none" strokeDasharray="8,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="2s" repeatCount="indefinite"/>
          </path>
          <path d="M100 400 Q400 200 700 500 T1000 200" stroke="url(#gradient2)" strokeWidth="2" fill="none" strokeDasharray="6,6">
            <animate attributeName="stroke-dashoffset" values="8;0" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M200 600 Q500 300 800 700 Q900 100 1100 600" stroke="url(#gradient3)" strokeWidth="1.5" fill="none" strokeDasharray="4,8">
            <animate attributeName="stroke-dashoffset" values="0;12" dur="4s" repeatCount="indefinite"/>
          </path>
          <circle cx="300" cy="200" r="3" fill="url(#radialGrad1)">
            <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="700" cy="500" r="2" fill="url(#radialGrad2)">
            <animate attributeName="r" values="2;5;2" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="900" cy="100" r="4" fill="url(#radialGrad3)">
            <animate attributeName="r" values="4;7;4" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="1"/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6"/>
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7"/>
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5"/>
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4"/>
            </linearGradient>
            <radialGradient id="radialGrad1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="1"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="radialGrad2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="1"/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="radialGrad3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1"/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
            </radialGradient>
          </defs>
        </svg>
        
        {/* Holographic data matrix */}
        <div className="absolute top-40 right-10 opacity-30">
          <div className="grid grid-cols-4 gap-2">
            <div className="w-3 h-6 bg-gradient-to-t from-blue-400 to-transparent animate-pulse delay-100 shadow-md shadow-blue-400/30"></div>
            <div className="w-3 h-8 bg-gradient-to-t from-indigo-400 to-transparent animate-pulse delay-300 shadow-md shadow-indigo-400/30"></div>
            <div className="w-3 h-5 bg-gradient-to-t from-cyan-400 to-transparent animate-pulse delay-500 shadow-md shadow-cyan-400/30"></div>
            <div className="w-3 h-9 bg-gradient-to-t from-purple-400 to-transparent animate-pulse delay-700 shadow-md shadow-purple-400/30"></div>
            <div className="w-3 h-7 bg-gradient-to-t from-blue-300 to-transparent animate-pulse delay-900 shadow-md shadow-blue-300/30"></div>
            <div className="w-3 h-4 bg-gradient-to-t from-indigo-300 to-transparent animate-pulse delay-1100 shadow-md shadow-indigo-300/30"></div>
            <div className="w-3 h-8 bg-gradient-to-t from-cyan-300 to-transparent animate-pulse delay-1300 shadow-md shadow-cyan-300/30"></div>
            <div className="w-3 h-6 bg-gradient-to-t from-purple-300 to-transparent animate-pulse delay-1500 shadow-md shadow-purple-300/30"></div>
          </div>
        </div>
        
        {/* Advanced server infrastructure */}
        <div className="absolute bottom-20 left-20 opacity-25">
          <div className="flex space-x-3">
            <div className="relative">
              <div className="w-6 h-20 bg-gradient-to-t from-blue-600 via-blue-400 to-cyan-300 rounded-lg animate-pulse shadow-lg shadow-blue-600/40"></div>
              <div className="absolute top-2 left-1 w-4 h-1 bg-cyan-200 rounded-full animate-pulse"></div>
              <div className="absolute top-5 left-1 w-4 h-1 bg-blue-200 rounded-full animate-pulse delay-500"></div>
            </div>
            <div className="relative">
              <div className="w-6 h-16 bg-gradient-to-t from-indigo-600 via-purple-400 to-pink-300 rounded-lg animate-pulse delay-700 shadow-lg shadow-indigo-600/40"></div>
              <div className="absolute top-2 left-1 w-4 h-1 bg-pink-200 rounded-full animate-pulse delay-200"></div>
              <div className="absolute top-5 left-1 w-4 h-1 bg-purple-200 rounded-full animate-pulse delay-800"></div>
            </div>
            <div className="relative">
              <div className="w-6 h-18 bg-gradient-to-t from-cyan-600 via-teal-400 to-emerald-300 rounded-lg animate-pulse delay-1200 shadow-lg shadow-cyan-600/40"></div>
              <div className="absolute top-2 left-1 w-4 h-1 bg-emerald-200 rounded-full animate-pulse delay-400"></div>
              <div className="absolute top-5 left-1 w-4 h-1 bg-teal-200 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
        
        {/* Quantum particles */}
        <div className="absolute top-1/3 right-1/4 opacity-40">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
        </div>
        <div className="absolute top-2/3 left-1/3 opacity-30">
          <div className="w-1 h-1 bg-blue-300 rounded-full animate-ping delay-1000"></div>
        </div>
        <div className="absolute top-1/2 right-1/3 opacity-35">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping delay-2000"></div>
        </div>
      </div>
      
      {/* Enhanced holographic glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/8 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/12 rounded-full blur-xl animate-pulse delay-1500"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-teal-500/8 rounded-full blur-2xl animate-pulse delay-500"></div>
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

/* Custom animations for futuristic effects */
const style = document.createElement('style');
style.textContent = `
  @keyframes matrix {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes bounce-slow {
    0%, 100% { 
      transform: translateY(0px) rotate(12deg);
      opacity: 0.15;
    }
    50% { 
      transform: translateY(-20px) rotate(12deg);
      opacity: 0.25;
    }
  }
`;

if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

export default Hero;