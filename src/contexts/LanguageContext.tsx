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
    'services.consulting.detailed': 'Our expert consultants provide comprehensive technology assessments, identifying bottlenecks, security vulnerabilities, and optimization opportunities to accelerate your digital transformation.',
    'services.consulting.smallBusiness': 'Cost-effective technology roadmaps that scale with your growth, avoiding expensive mistakes and maximizing ROI on tech investments.',
    'services.consulting.mediumBusiness': 'Advanced system integration strategies, workflow optimization, and technology stack modernization to compete with larger enterprises.',
    'services.consulting.enterprise': 'Enterprise-grade architecture design, legacy system migration planning, and multi-location technology standardization for operational excellence.',
    'services.consulting.feature1': 'Complete audit',
    'services.consulting.feature2': 'Process optimization',
    'services.consulting.feature3': 'Technology strategy',
    'services.consulting.benefit1': 'Reduce operational costs by up to 40%',
    'services.consulting.benefit2': 'Accelerate decision-making with data-driven insights',
    'services.consulting.benefit3': 'Future-proof your technology investments',
    'services.consulting.benefit4': 'Achieve competitive advantage through innovation',
    
    'services.security.title': 'Digital Security',
    'services.security.description': 'Comprehensive protection of your data and systems with the best cybersecurity practices in the market.',
    'services.security.detailed': 'Advanced cybersecurity solutions including threat detection, incident response, compliance management, and employee training to protect your business from evolving digital threats.',
    'services.security.smallBusiness': 'Affordable security packages that protect against common threats without requiring dedicated IT staff - essential protection that fits your budget.',
    'services.security.mediumBusiness': 'Multi-layered security infrastructure with real-time monitoring, automated threat response, and compliance support for industry regulations.',
    'services.security.enterprise': 'Enterprise-grade security operations center (SOC), advanced threat intelligence, zero-trust architecture, and comprehensive risk management frameworks.',
    'services.security.feature1': 'Vulnerability analysis',
    'services.security.feature2': 'Firewall implementation',
    'services.security.feature3': '24/7 monitoring',
    'services.security.benefit1': 'Prevent data breaches that cost average $4.45M',
    'services.security.benefit2': 'Meet compliance requirements (GDPR, HIPAA, SOX)',
    'services.security.benefit3': 'Protect customer trust and brand reputation',
    'services.security.benefit4': 'Reduce cyber insurance premiums',
    
    'services.cloud.title': 'Cloud Services',
    'services.cloud.description': 'Cloud infrastructure migration and management for greater scalability and operational efficiency.',
    'services.cloud.detailed': 'Full-service cloud transformation including AWS, Azure, and Google Cloud migrations, hybrid cloud strategies, and ongoing optimization to reduce costs while improving performance.',
    'services.cloud.smallBusiness': 'Start cloud-first with pay-as-you-grow models, eliminating upfront infrastructure costs and gaining enterprise-level capabilities from day one.',
    'services.cloud.mediumBusiness': 'Seamless migration of existing systems to cloud with minimal downtime, plus auto-scaling capabilities to handle traffic spikes and seasonal demands.',
    'services.cloud.enterprise': 'Multi-cloud strategies, disaster recovery planning, global content delivery networks, and advanced analytics platforms for data-driven decision making.',
    'services.cloud.feature1': 'Cloud migration',
    'services.cloud.feature2': 'Automatic backup',
    'services.cloud.feature3': 'Dynamic scalability',
    'services.cloud.benefit1': 'Reduce IT infrastructure costs by 20-50%',
    'services.cloud.benefit2': 'Scale instantly during peak demand periods',
    'services.cloud.benefit3': 'Access data and applications from anywhere',
    'services.cloud.benefit4': 'Improve disaster recovery and business continuity',
    
    'services.development.title': 'Software Development',
    'services.development.description': 'Custom software solutions that perfectly adapt to your business needs.',
    'services.development.detailed': 'Full-stack development services creating custom web applications, mobile apps, and software integrations that streamline your unique business processes and provide competitive advantages.',
    'services.development.smallBusiness': 'Custom software that automates manual processes, improves customer experience, and provides professional credibility at a fraction of off-the-shelf solution costs.',
    'services.development.mediumBusiness': 'Enterprise-quality applications with advanced features like real-time analytics, multi-user collaboration, and third-party system integrations.',
    'services.development.enterprise': 'Large-scale software architecture, microservices development, API ecosystems, and high-performance applications handling millions of transactions.',
    'services.development.feature1': 'Mobile apps',
    'services.development.feature2': 'Web systems',
    'services.development.feature3': 'API integrations',
    'services.development.benefit1': 'Increase operational efficiency by 60%+',
    'services.development.benefit2': 'Create new revenue streams through digital products',
    'services.development.benefit3': 'Improve customer satisfaction with better UX',
    'services.development.benefit4': 'Own your technology instead of licensing',
    
    'services.data.title': 'Data Management',
    'services.data.description': 'Database optimization and administration to maximize efficiency and security of your information.',
    'services.data.detailed': 'Comprehensive data strategy including database design, ETL processes, business intelligence dashboards, and predictive analytics to turn your data into actionable business insights.',
    'services.data.smallBusiness': 'Organize scattered data into unified systems, create automated reports, and gain insights that help you make better business decisions faster.',
    'services.data.mediumBusiness': 'Advanced analytics, customer segmentation, inventory optimization, and performance dashboards that reveal hidden opportunities for growth.',
    'services.data.enterprise': 'Big data processing, machine learning models, real-time analytics, and data governance frameworks for enterprise-wide intelligence.',
    'services.data.feature1': 'DB optimization',
    'services.data.feature2': 'Data analysis',
    'services.data.feature3': 'Business Intelligence',
    'services.data.benefit1': 'Make data-driven decisions 5x faster',
    'services.data.benefit2': 'Identify new market opportunities',
    'services.data.benefit3': 'Optimize operations and reduce waste',
    'services.data.benefit4': 'Predict trends and customer behavior',
    
    'services.automation.title': 'Automation',
    'services.automation.description': 'Automated processes that reduce human errors and increase your team\'s productivity.',
    'services.automation.detailed': 'Intelligent process automation using AI and workflow optimization to eliminate repetitive tasks, reduce errors, and free your team to focus on high-value strategic work.',
    'services.automation.smallBusiness': 'Automate invoicing, appointment scheduling, customer follow-ups, and inventory management to run your business like a larger competitor.',
    'services.automation.mediumBusiness': 'Complex workflow automation, automated quality control, customer service chatbots, and integrated business process optimization.',
    'services.automation.enterprise': 'Enterprise-wide process automation, AI-powered decision making, robotic process automation (RPA), and cross-departmental workflow integration.',
    'services.automation.feature1': 'Automatic workflows',
    'services.automation.feature2': 'System integration',
    'services.automation.feature3': 'Task optimization',
    'services.automation.benefit1': 'Save 25+ hours per week on repetitive tasks',
    'services.automation.benefit2': 'Eliminate human errors and improve quality',
    'services.automation.benefit3': 'Scale operations without hiring more staff',
    'services.automation.benefit4': 'Provide 24/7 customer service capabilities',
    
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
    'services.consulting.detailed': 'Nuestros consultores expertos proporcionan evaluaciones tecnológicas integrales, identificando cuellos de botella, vulnerabilidades de seguridad y oportunidades de optimización para acelerar tu transformación digital.',
    'services.consulting.smallBusiness': 'Roadmaps tecnológicos rentables que escalan con tu crecimiento, evitando errores costosos y maximizando el ROI en inversiones tecnológicas.',
    'services.consulting.mediumBusiness': 'Estrategias avanzadas de integración de sistemas, optimización de flujos de trabajo y modernización del stack tecnológico para competir con empresas más grandes.',
    'services.consulting.enterprise': 'Diseño de arquitectura empresarial, planificación de migración de sistemas legacy y estandarización tecnológica multi-ubicación para excelencia operacional.',
    'services.consulting.feature1': 'Auditoría completa',
    'services.consulting.feature2': 'Optimización de procesos',
    'services.consulting.feature3': 'Estrategia tecnológica',
    'services.consulting.benefit1': 'Reduce costos operativos hasta en un 40%',
    'services.consulting.benefit2': 'Acelera la toma de decisiones con insights basados en datos',
    'services.consulting.benefit3': 'Asegura el futuro de tus inversiones tecnológicas',
    'services.consulting.benefit4': 'Logra ventaja competitiva a través de la innovación',
    
    'services.security.title': 'Seguridad Digital',
    'services.security.description': 'Protección integral de tus datos y sistemas con las mejores prácticas de ciberseguridad del mercado.',
    'services.security.detailed': 'Soluciones avanzadas de ciberseguridad incluyendo detección de amenazas, respuesta a incidentes, gestión de cumplimiento y capacitación de empleados para proteger tu negocio de amenazas digitales en evolución.',
    'services.security.smallBusiness': 'Paquetes de seguridad asequibles que protegen contra amenazas comunes sin requerir personal de TI dedicado - protección esencial que se ajusta a tu presupuesto.',
    'services.security.mediumBusiness': 'Infraestructura de seguridad multicapa con monitoreo en tiempo real, respuesta automatizada a amenazas y soporte de cumplimiento para regulaciones industriales.',
    'services.security.enterprise': 'Centro de operaciones de seguridad (SOC) empresarial, inteligencia avanzada de amenazas, arquitectura de confianza cero y marcos integrales de gestión de riesgos.',
    'services.security.feature1': 'Análisis de vulnerabilidades',
    'services.security.feature2': 'Implementación de firewall',
    'services.security.feature3': 'Monitoreo 24/7',
    'services.security.benefit1': 'Previene brechas de datos que cuestan promedio $4.45M',
    'services.security.benefit2': 'Cumple requisitos de compliance (GDPR, HIPAA, SOX)',
    'services.security.benefit3': 'Protege la confianza del cliente y reputación de marca',
    'services.security.benefit4': 'Reduce primas de seguros cibernéticos',
    
    'services.cloud.title': 'Servicios en la Nube',
    'services.cloud.description': 'Migración y gestión de infraestructura en la nube para mayor escalabilidad y eficiencia operativa.',
    'services.cloud.detailed': 'Servicio completo de transformación en la nube incluyendo migraciones AWS, Azure y Google Cloud, estrategias de nube híbrida y optimización continua para reducir costos mientras mejora el rendimiento.',
    'services.cloud.smallBusiness': 'Comienza cloud-first con modelos de pago por crecimiento, eliminando costos iniciales de infraestructura y obteniendo capacidades empresariales desde el día uno.',
    'services.cloud.mediumBusiness': 'Migración fluida de sistemas existentes a la nube con mínimo tiempo de inactividad, más capacidades de auto-escalado para manejar picos de tráfico y demandas estacionales.',
    'services.cloud.enterprise': 'Estrategias multi-nube, planificación de recuperación ante desastres, redes globales de distribución de contenido y plataformas avanzadas de análisis para toma de decisiones basada en datos.',
    'services.cloud.feature1': 'Migración a la nube',
    'services.cloud.feature2': 'Respaldo automático',
    'services.cloud.feature3': 'Escalabilidad dinámica',
    'services.cloud.benefit1': 'Reduce costos de infraestructura de TI 20-50%',
    'services.cloud.benefit2': 'Escala instantáneamente durante períodos de alta demanda',
    'services.cloud.benefit3': 'Accede a datos y aplicaciones desde cualquier lugar',
    'services.cloud.benefit4': 'Mejora recuperación ante desastres y continuidad del negocio',
    
    'services.development.title': 'Desarrollo de Software',
    'services.development.description': 'Soluciones de software personalizadas que se adaptan perfectamente a las necesidades de tu negocio.',
    'services.development.detailed': 'Servicios de desarrollo full-stack creando aplicaciones web personalizadas, apps móviles e integraciones de software que optimizan tus procesos únicos de negocio y proporcionan ventajas competitivas.',
    'services.development.smallBusiness': 'Software personalizado que automatiza procesos manuales, mejora la experiencia del cliente y proporciona credibilidad profesional a una fracción del costo de soluciones prefabricadas.',
    'services.development.mediumBusiness': 'Aplicaciones de calidad empresarial con características avanzadas como análisis en tiempo real, colaboración multiusuario e integraciones con sistemas de terceros.',
    'services.development.enterprise': 'Arquitectura de software a gran escala, desarrollo de microservicios, ecosistemas de APIs y aplicaciones de alto rendimiento manejando millones de transacciones.',
    'services.development.feature1': 'Apps móviles',
    'services.development.feature2': 'Sistemas web',
    'services.development.feature3': 'Integraciones API',
    'services.development.benefit1': 'Aumenta eficiencia operacional en 60%+',
    'services.development.benefit2': 'Crea nuevas fuentes de ingresos con productos digitales',
    'services.development.benefit3': 'Mejora satisfacción del cliente con mejor UX',
    'services.development.benefit4': 'Posee tu tecnología en lugar de licenciarla',
    
    'services.data.title': 'Gestión de Datos',
    'services.data.description': 'Optimización y administración de bases de datos para maximizar la eficiencia y seguridad de tu información.',
    'services.data.detailed': 'Estrategia integral de datos incluyendo diseño de bases de datos, procesos ETL, dashboards de inteligencia de negocios y análisis predictivo para convertir tus datos en insights accionables de negocio.',
    'services.data.smallBusiness': 'Organiza datos dispersos en sistemas unificados, crea reportes automatizados y obtén insights que te ayuden a tomar mejores decisiones de negocio más rápido.',
    'services.data.mediumBusiness': 'Análisis avanzados, segmentación de clientes, optimización de inventarios y dashboards de rendimiento que revelan oportunidades ocultas de crecimiento.',
    'services.data.enterprise': 'Procesamiento de big data, modelos de machine learning, análisis en tiempo real y marcos de gobernanza de datos para inteligencia empresarial.',
    'services.data.feature1': 'Optimización de BD',
    'services.data.feature2': 'Análisis de datos',
    'services.data.feature3': 'Business Intelligence',
    'services.data.benefit1': 'Toma decisiones basadas en datos 5x más rápido',
    'services.data.benefit2': 'Identifica nuevas oportunidades de mercado',
    'services.data.benefit3': 'Optimiza operaciones y reduce desperdicios',
    'services.data.benefit4': 'Predice tendencias y comportamiento del cliente',
    
    'services.automation.title': 'Automatización',
    'services.automation.description': 'Procesos automatizados que reducen errores humanos e incrementan la productividad de tu equipo.',
    'services.automation.detailed': 'Automatización inteligente de procesos usando IA y optimización de flujos de trabajo para eliminar tareas repetitivas, reducir errores y liberar a tu equipo para enfocarse en trabajo estratégico de alto valor.',
    'services.automation.smallBusiness': 'Automatiza facturación, programación de citas, seguimiento de clientes y gestión de inventarios para operar tu negocio como un competidor más grande.',
    'services.automation.mediumBusiness': 'Automatización de flujos de trabajo complejos, control de calidad automatizado, chatbots de atención al cliente y optimización integrada de procesos de negocio.',
    'services.automation.enterprise': 'Automatización de procesos empresariales, toma de decisiones potenciada por IA, automatización robótica de procesos (RPA) e integración de flujos de trabajo interdepartamentales.',
    'services.automation.feature1': 'Flujos automáticos',
    'services.automation.feature2': 'Integración de sistemas',
    'services.automation.feature3': 'Optimización de tareas',
    'services.automation.benefit1': 'Ahorra 25+ horas por semana en tareas repetitivas',
    'services.automation.benefit2': 'Elimina errores humanos y mejora la calidad',
    'services.automation.benefit3': 'Escala operaciones sin contratar más personal',
    'services.automation.benefit4': 'Proporciona capacidades de atención al cliente 24/7',
    
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