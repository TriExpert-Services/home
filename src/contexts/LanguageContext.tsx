import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.inicio': 'Home',
    'header.servicios': 'Services',
    'header.nosotros': 'About',
    'header.contacto': 'Contact',
    'header.cotizar': 'Get Quote',
    'header.tagline': 'Professional Technology Solutions',
    
    // Hero
    'hero.badge': 'Leading Professional Technology Solutions',
    'hero.title': 'Experts in',
    'hero.subtitle': 'Comprehensive Solutions',
    'hero.description': 'Transform your business with high-quality professional services. Technology, consulting, and specialized support to drive your success.',
    'hero.getStarted': 'Get Started',
    'hero.learnMore': 'Learn More',
    'hero.clients': 'Satisfied Clients',
    'hero.experience': 'Years of Experience',
    'hero.rating': 'Average Rating',
    
    // Services
    'services.badge': 'Our Services',
    'services.title': 'Solutions that',
    'services.titleAccent': 'Transform',
    'services.description': 'We offer specialized services designed to propel your business into the digital future',
    
    'services.consulting.title': 'Technical Consulting',
    'services.consulting.description': 'Deep analysis of your technological infrastructure and strategic recommendations to optimize your performance.',
    'services.consulting.feature1': 'Complete audit',
    'services.consulting.feature2': 'Process optimization',
    'services.consulting.feature3': 'Technology strategy',
    
    'services.security.title': 'Digital Security',
    'services.security.description': 'Comprehensive protection of your data and systems with the best cybersecurity practices in the market.',
    'services.security.feature1': 'Vulnerability analysis',
    'services.security.feature2': 'Firewall implementation',
    'services.security.feature3': '24/7 monitoring',
    
    'services.cloud.title': 'Cloud Services',
    'services.cloud.description': 'Cloud infrastructure migration and management for greater scalability and operational efficiency.',
    'services.cloud.feature1': 'Cloud migration',
    'services.cloud.feature2': 'Automatic backup',
    'services.cloud.feature3': 'Dynamic scalability',
    
    'services.development.title': 'Software Development',
    'services.development.description': 'Custom software solutions that perfectly adapt to your business needs.',
    'services.development.feature1': 'Mobile apps',
    'services.development.feature2': 'Web systems',
    'services.development.feature3': 'API integrations',
    
    'services.data.title': 'Data Management',
    'services.data.description': 'Database optimization and administration to maximize efficiency and security of your information.',
    'services.data.feature1': 'DB optimization',
    'services.data.feature2': 'Data analysis',
    'services.data.feature3': 'Business Intelligence',
    
    'services.automation.title': 'Automation',
    'services.automation.description': 'Automated processes that reduce human errors and increase your team\'s productivity.',
    'services.automation.feature1': 'Automatic workflows',
    'services.automation.feature2': 'System integration',
    'services.automation.feature3': 'Task optimization',
    
    'services.translations.title': 'Certified Translations',
    'services.translations.description': 'Official translation of legal and personal documents with certified translator signature and delivery options.',
    'services.translations.feature1': 'Legal documents',
    'services.translations.feature2': 'Personal certificates',
    'services.translations.feature3': 'Digital & physical delivery',
    
    'services.learnMore': 'Learn More',
    'services.viewAll': 'View All Services',
    
    // About
    'about.badge': 'About Us',
    'about.title': 'Leading the',
    'about.titleAccent': 'Innovation',
    'about.description': 'At TriExpert Services, under the leadership of CEO Yunior Medina, we specialize in providing comprehensive technology solutions that transform how businesses operate. With over 15 years of experience based in Tampa, Florida, we\'ve helped hundreds of organizations achieve their digital objectives.',
    'about.feature1': 'Team of certified experts',
    'about.feature2': 'Agile and proven methodologies',
    'about.feature3': 'Continuous and personalized support',
    'about.feature4': 'Constant innovation and technology updates',
    'about.learnMore': 'Learn More',
    'about.projects': 'Projects Completed',
    'about.years': 'Years of Experience',
    'about.satisfaction': 'Client Satisfaction',
    'about.support': 'Technical Support',
    'about.mission': 'Our Mission',
    'about.missionText': 'Empower businesses with cutting-edge technology and specialized services that drive growth and competitiveness in the digital marketplace.',
    
    // Contact
    'contact.badge': 'Contact',
    'contact.title': 'Ready to',
    'contact.titleAccent': 'Get Started?',
    'contact.description': 'Contact us today and discover how we can transform your business with our specialized solutions',
    'contact.phone': 'Phone',
    'contact.phoneAvailable': 'Available Mon-Sat',
    'contact.email': 'Email',
    'contact.emailSupport': 'Professional Support',
    'contact.location': 'Location',
    'contact.hours': 'Hours',
    'contact.hoursWeek': 'Mon - Fri: 9:00 AM - 6:00 PM',
    'contact.hoursSat': 'Sat: 10:00 AM - 2:00 PM',
    'contact.sendMessage': 'Send us a Message',
    'contact.messageSent': 'Message Sent!',
    'contact.messageResponse': 'We\'ll contact you soon to discuss your project.',
    'contact.fullName': 'Full Name',
    'contact.namePlaceholder': 'Your name',
    'contact.emailPlaceholder': 'your@email.com',
    'contact.company': 'Company',
    'contact.companyPlaceholder': 'Your company name',
    'contact.service': 'Service of Interest',
    'contact.selectService': 'Select a service',
    'contact.message': 'Message',
    'contact.messagePlaceholder': 'Tell us about your project or needs...',
    'contact.send': 'Send Message',
    
    // Footer
    'footer.description': 'We transform businesses with cutting-edge technology and specialized services. Your strategic partner for digital success.',
    'footer.services': 'Services',
    'footer.company': 'Company',
    'footer.aboutUs': 'About Us',
    'footer.ourTeam': 'Our Team',
    'footer.successStories': 'Success Stories',
    'footer.blog': 'Blog',
    'footer.careers': 'Careers',
    'footer.privacy': 'Privacy Policy',
    'footer.contact': 'Contact',
    'footer.businessHours': 'Business Hours',
    'footer.rights': 'All rights reserved.',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookies',
    
    // Legal Pages
    'legal.terms': 'Terms of Service',
    'legal.privacy': 'Privacy Policy', 
    'legal.cookies': 'Cookies Policy',
    'legal.backToHome': 'Back to Home'
  },
  es: {
    // Header
    'header.inicio': 'Inicio',
    'header.servicios': 'Servicios',
    'header.nosotros': 'Nosotros',
    'header.contacto': 'Contacto',
    'header.cotizar': 'Cotizar',
    'header.tagline': 'Soluciones Tecnológicas Profesionales',
    
    // Hero
    'hero.badge': 'Liderando las Soluciones Tecnológicas Profesionales',
    'hero.title': 'Expertos en',
    'hero.subtitle': 'Soluciones Integrales',
    'hero.description': 'Transforma tu negocio con servicios profesionales de alta calidad. Tecnología, consultoría y soporte especializado para impulsar tu éxito.',
    'hero.getStarted': 'Comenzar',
    'hero.learnMore': 'Conocer Más',
    'hero.clients': 'Clientes Satisfechos',
    'hero.experience': 'Años de Experiencia',
    'hero.rating': 'Calificación Promedio',
    
    // Services
    'services.badge': 'Nuestros Servicios',
    'services.title': 'Soluciones que',
    'services.titleAccent': 'Transforman',
    'services.description': 'Ofrecemos servicios especializados diseñados para impulsar tu negocio hacia el futuro digital',
    
    'services.consulting.title': 'Consultoría Técnica',
    'services.consulting.description': 'Análisis profundo de tu infraestructura tecnológica y recomendaciones estratégicas para optimizar tu rendimiento.',
    'services.consulting.feature1': 'Auditoría completa',
    'services.consulting.feature2': 'Optimización de procesos',
    'services.consulting.feature3': 'Estrategia tecnológica',
    
    'services.security.title': 'Seguridad Digital',
    'services.security.description': 'Protección integral de tus datos y sistemas con las mejores prácticas de ciberseguridad del mercado.',
    'services.security.feature1': 'Análisis de vulnerabilidades',
    'services.security.feature2': 'Implementación de firewall',
    'services.security.feature3': 'Monitoreo 24/7',
    
    'services.cloud.title': 'Servicios en la Nube',
    'services.cloud.description': 'Migración y gestión de infraestructura en la nube para mayor escalabilidad y eficiencia operativa.',
    'services.cloud.feature1': 'Migración a la nube',
    'services.cloud.feature2': 'Respaldo automático',
    'services.cloud.feature3': 'Escalabilidad dinámica',
    
    'services.development.title': 'Desarrollo de Software',
    'services.development.description': 'Soluciones de software personalizadas que se adaptan perfectamente a las necesidades de tu negocio.',
    'services.development.feature1': 'Apps móviles',
    'services.development.feature2': 'Sistemas web',
    'services.development.feature3': 'Integraciones API',
    
    'services.data.title': 'Gestión de Datos',
    'services.data.description': 'Optimización y administración de bases de datos para maximizar la eficiencia y seguridad de tu información.',
    'services.data.feature1': 'Optimización de BD',
    'services.data.feature2': 'Análisis de datos',
    'services.data.feature3': 'Business Intelligence',
    
    'services.automation.title': 'Automatización',
    'services.automation.description': 'Procesos automatizados que reducen errores humanos e incrementan la productividad de tu equipo.',
    'services.automation.feature1': 'Flujos automáticos',
    'services.automation.feature2': 'Integración de sistemas',
    'services.automation.feature3': 'Optimización de tareas',
    
    'services.translations.title': 'Traducciones Certificadas',
    'services.translations.description': 'Traducción oficial de documentos legales y personales con firma de traductor certificado y opciones de entrega.',
    'services.translations.feature1': 'Documentos legales',
    'services.translations.feature2': 'Certificados personales',
    'services.translations.feature3': 'Entrega digital y física',
    
    'services.learnMore': 'Conocer Más',
    'services.viewAll': 'Ver Todos los Servicios',
    
    // About
    'about.badge': 'Sobre Nosotros',
    'about.title': 'Liderando la',
    'about.titleAccent': 'Innovación',
    'about.description': 'En TriExpert Services, bajo el liderazgo del CEO Yunior Medina, nos especializamos en brindar soluciones tecnológicas integrales que transforman la forma en que operan las empresas. Con más de 15 años de experiencia basados en Tampa, Florida, hemos ayudado a cientos de organizaciones a alcanzar sus objetivos digitales.',
    'about.feature1': 'Equipo de expertos certificados',
    'about.feature2': 'Metodologías ágiles y comprobadas',
    'about.feature3': 'Soporte continuo y personalizado',
    'about.feature4': 'Innovación constante y actualización tecnológica',
    'about.learnMore': 'Conocer Más',
    'about.projects': 'Proyectos Completados',
    'about.years': 'Años de Experiencia',
    'about.satisfaction': 'Satisfacción del Cliente',
    'about.support': 'Soporte Técnico',
    'about.mission': 'Nuestra Misión',
    'about.missionText': 'Empoderar a las empresas con tecnología de vanguardia y servicios especializados que impulsen el crecimiento y la competitividad en el mercado digital.',
    
    // Contact
    'contact.badge': 'Contacto',
    'contact.title': '¿Listo para',
    'contact.titleAccent': 'Comenzar?',
    'contact.description': 'Contáctanos hoy y descubre cómo podemos transformar tu negocio con nuestras soluciones especializadas',
    'contact.phone': 'Teléfono',
    'contact.phoneAvailable': 'Disponible Lun-Sáb',
    'contact.email': 'Email',
    'contact.emailSupport': 'Soporte Profesional',
    'contact.location': 'Ubicación',
    'contact.hours': 'Horarios',
    'contact.hoursWeek': 'Lun - Vie: 9:00 AM - 6:00 PM',
    'contact.hoursSat': 'Sáb: 10:00 AM - 2:00 PM',
    'contact.sendMessage': 'Envíanos un Mensaje',
    'contact.messageSent': '¡Mensaje Enviado!',
    'contact.messageResponse': 'Te contactaremos pronto para discutir tu proyecto.',
    'contact.fullName': 'Nombre Completo',
    'contact.namePlaceholder': 'Tu nombre',
    'contact.emailPlaceholder': 'tu@email.com',
    'contact.company': 'Empresa',
    'contact.companyPlaceholder': 'Nombre de tu empresa',
    'contact.service': 'Servicio de Interés',
    'contact.selectService': 'Selecciona un servicio',
    'contact.message': 'Mensaje',
    'contact.messagePlaceholder': 'Cuéntanos sobre tu proyecto o necesidades...',
    'contact.send': 'Enviar Mensaje',
    
    // Footer
    'footer.description': 'Transformamos empresas con tecnología de vanguardia y servicios especializados. Tu socio estratégico para el éxito digital.',
    'footer.services': 'Servicios',
    'footer.company': 'Empresa',
    'footer.aboutUs': 'Sobre Nosotros',
    'footer.ourTeam': 'Nuestro Equipo',
    'footer.successStories': 'Casos de Éxito',
    'footer.blog': 'Blog',
    'footer.careers': 'Carreras',
    'footer.privacy': 'Política de Privacidad',
    'footer.contact': 'Contacto',
    'footer.businessHours': 'Horarios de Atención',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.terms': 'Términos de Servicio',
    'footer.cookies': 'Cookies',
    
    // Legal Pages
    'legal.terms': 'Términos de Servicio',
    'legal.privacy': 'Política de Privacidad',
    'legal.cookies': 'Política de Cookies', 
    'legal.backToHome': 'Volver al Inicio'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};