import React from 'react';
import { Settings, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSocialClick = (platform: string) => {
    const urls = {
      facebook: 'https://facebook.com/triexpertservices',
      twitter: 'https://twitter.com/triexpertservices', 
      linkedin: 'https://linkedin.com/company/triexpertservices',
      instagram: 'https://instagram.com/triexpertservices'
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  const handlePhoneCall = () => {
    window.open('tel:+18137108860', '_self');
  };

  const handleEmailClick = () => {
    window.open('mailto:support@triexpertservice.com', '_self');
  };

  const handleLocationClick = () => {
    window.open('https://maps.google.com/?q=2800+E+113th+Ave,+Tampa,+FL+33612', '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-4 bg-white rounded-full"></div>
                  <div className="w-1 h-6 bg-white rounded-full"></div>
                  <div className="w-1 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">TriExpert Services</h3>
                <p className="text-xs text-gray-400">Professional Technology Solutions</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => handleSocialClick('facebook')}
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110"
                title="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleSocialClick('twitter')}
                className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-all hover:scale-110"
                title="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleSocialClick('linkedin')}
                className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-800 transition-all hover:scale-110"
                title="Connect on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleSocialClick('instagram')}
                className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-all hover:scale-110"
                title="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('servicios')}
                  className="text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transform duration-200 flex items-center group"
                >
                  <span>{t('services.consulting.title')}</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('servicios')}
                  className="text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transform duration-200 flex items-center group"
                >
                  <span>{t('services.security.title')}</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('servicios')}
                  className="text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transform duration-200 flex items-center group"
                >
                  <span>{t('services.cloud.title')}</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('servicios')}
                  className="text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transform duration-200 flex items-center group"
                >
                  <span>{t('services.development.title')}</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('servicios')}
                  className="text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transform duration-200 flex items-center group"
                >
                  <span>{t('services.data.title')}</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('servicios')}
                  className="text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transform duration-200 flex items-center group"
                >
                  <span>{t('services.automation.title')}</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('nosotros')}
                  className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-200 flex items-center group"
                >
                  <span>{t('footer.aboutUs')}</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li><span className="text-gray-500 cursor-not-allowed">{t('footer.ourTeam')} (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">{t('footer.successStories')} (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">{t('footer.blog')} (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">{t('footer.careers')} (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">{t('footer.privacy')} (Coming Soon)</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              <li 
                onClick={handlePhoneCall}
                className="flex items-center space-x-3 cursor-pointer hover:text-blue-300 transition-colors group"
              >
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 group-hover:text-white">+1 (813) 710-8860</span>
              </li>
              <li 
                onClick={handleEmailClick}
                className="flex items-center space-x-3 cursor-pointer hover:text-blue-300 transition-colors group"
              >
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 group-hover:text-white">support@triexpertservice.com</span>
              </li>
              <li 
                onClick={handleLocationClick}
                className="flex items-start space-x-3 cursor-pointer hover:text-blue-300 transition-colors group"
              >
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 group-hover:text-white">2800 E 113th Ave, Apt 120<br />Tampa, Florida 33612</span>
              </li>
            </ul>

            <div className="mt-6">
              <h5 className="font-semibold mb-2">{t('footer.businessHours')}</h5>
              <p className="text-gray-300 text-sm">{t('contact.hoursWeek')}</p>
              <p className="text-gray-300 text-sm">{t('contact.hoursSat')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} TriExpert Services. {t('footer.rights')}
            </p>
            <div className="flex space-x-6 text-sm">
              <span className="text-gray-500 cursor-not-allowed">{t('footer.terms')}</span>
              <span className="text-gray-500 cursor-not-allowed">{t('footer.privacy')}</span>
              <span className="text-gray-500 cursor-not-allowed">{t('footer.cookies')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;