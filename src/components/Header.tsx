import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-4 bg-white rounded-full"></div>
                  <div className="w-1 h-6 bg-white rounded-full"></div>
                  <div className="w-1 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <div>
              <h1 className={`font-bold text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                TriExpert Services
              </h1>
              <p className={`text-xs ${isScrolled ? 'text-gray-600' : 'text-blue-100'}`}>
                {t('header.tagline')}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className={`font-medium transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
            }`}>
              {t('header.inicio')}
            </a>
            <a href="#servicios" className={`font-medium transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
            }`}>
              {t('header.servicios')}
            </a>
            <a href="#nosotros" className={`font-medium transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
            }`}>
              {t('header.nosotros')}
            </a>
            <a href="#contacto" className={`font-medium transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
            }`}>
              {t('header.contacto')}
            </a>
            
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <Globe className={`w-4 h-4 ${isScrolled ? 'text-gray-700' : 'text-white'}`} />
              <button
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className={`text-sm font-medium transition-colors ${
                  isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
                }`}
              >
                {language === 'en' ? 'ES' : 'EN'}
              </button>
            </div>
            
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
              {t('header.cotizar')}
            </button>
          </nav>

          <button 
            className={`md:hidden ${isScrolled ? 'text-gray-900' : 'text-white'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-xl shadow-xl p-4 space-y-4">
            <a href="#inicio" className="block text-gray-700 hover:text-blue-600 font-medium">{t('header.inicio')}</a>
            <a href="#servicios" className="block text-gray-700 hover:text-blue-600 font-medium">{t('header.servicios')}</a>
            <a href="#nosotros" className="block text-gray-700 hover:text-blue-600 font-medium">{t('header.nosotros')}</a>
            <a href="#contacto" className="block text-gray-700 hover:text-blue-600 font-medium">{t('header.contacto')}</a>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-700" />
                <span className="text-sm text-gray-700">Language:</span>
              </div>
              <button
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {language === 'en' ? 'Español' : 'English'}
              </button>
            </div>
            
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium">
              {t('header.cotizar')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;