import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Update active section based on scroll position
      const sections = ['inicio', 'servicios', 'nosotros', 'contacto'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

  const handleGetQuote = () => {
    scrollToSection('contacto');
  };

  const navLinkClass = (section: string) => `
    font-medium transition-all duration-300 cursor-pointer relative
    ${isScrolled 
      ? (activeSection === section 
          ? 'text-blue-600' 
          : 'text-gray-700 hover:text-blue-600')
      : (activeSection === section 
          ? 'text-blue-200' 
          : 'text-white hover:text-blue-200')
    }
    ${activeSection === section ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-current after:transform after:scale-x-100' : 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-current after:transform after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300'}
  `;
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
            <button onClick={() => scrollToSection('inicio')} className={navLinkClass('inicio')}>
              {t('header.inicio')}
            </button>
            <button onClick={() => scrollToSection('servicios')} className={navLinkClass('servicios')}>
              {t('header.servicios')}
            </button>
            <button onClick={() => scrollToSection('nosotros')} className={navLinkClass('nosotros')}>
              {t('header.nosotros')}
            </button>
            <button onClick={() => scrollToSection('contacto')} className={navLinkClass('contacto')}>
              {t('header.contacto')}
            </button>
            
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
            
            <button 
              onClick={handleGetQuote}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2 group"
            >
              <Phone className="w-4 h-4 group-hover:animate-pulse" />
              <span>{t('header.cotizar')}</span>
            </button>
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
            <button 
              onClick={() => scrollToSection('inicio')} 
              className={`block w-full text-left font-medium transition-colors ${
                activeSection === 'inicio' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('header.inicio')}
            </button>
            <button 
              onClick={() => scrollToSection('servicios')} 
              className={`block w-full text-left font-medium transition-colors ${
                activeSection === 'servicios' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('header.servicios')}
            </button>
            <button 
              onClick={() => scrollToSection('nosotros')} 
              className={`block w-full text-left font-medium transition-colors ${
                activeSection === 'nosotros' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('header.nosotros')}
            </button>
            <button 
              onClick={() => scrollToSection('contacto')} 
              className={`block w-full text-left font-medium transition-colors ${
                activeSection === 'contacto' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {t('header.contacto')}
            </button>
            
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
            
            <button 
              onClick={handleGetQuote}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t('header.cotizar')}</span>
            </button>
              {t('header.cotizar')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;