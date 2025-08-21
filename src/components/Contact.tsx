import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FormData {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const Contact = () => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateApiCall = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Network error. Please try again.'));
        }
      }, 2000);
    });
  };

  const sendToN8N = async (contactData: any): Promise<void> => {
    const webhookUrl = 'https://app.n8n-tech.cloud/webhook/56144a26-b713-482c-9383-1ff3e562ae0a';
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Contact lead sent to N8N successfully');
    } catch (error) {
      console.error('Error sending to N8N:', error);
      // Don't throw error - we don't want to break user experience
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare data for N8N
    const contactData = {
      full_name: formData.name,
      email: formData.email,
      company: formData.company || null,
      service: formData.service || null,
      message: formData.message,
      source: 'contact_form',
      created_at: new Date().toISOString(),
      language: t('contact.phone') === 'Phone' ? 'en' : 'es' // Detect language
    };

    // Send to N8N first, then simulate success
    Promise.all([
      sendToN8N(contactData),
      simulateApiCall()
    ])
      .then(() => {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          service: '',
          message: ''
        });
        setTimeout(() => setIsSubmitted(false), 5000);
      })
      .catch((error) => {
        setSubmitError(error.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError(null);
    }
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

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: t('contact.phone'),
      details: ["+1 (813) 710-8860", t('contact.phoneAvailable')],
      color: "from-blue-500 to-blue-600",
      action: handlePhoneCall
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t('contact.email'),
      details: ["support@triexpertservice.com", t('contact.emailSupport')],
      color: "from-green-500 to-green-600",
      action: handleEmailClick
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t('contact.location'),
      details: ["2800 E 113th Ave, Apt 120", "Tampa, Florida 33612"],
      color: "from-purple-500 to-purple-600",
      action: handleLocationClick
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t('contact.hours'),
      details: [t('contact.hoursWeek'), t('contact.hoursSat')],
      color: "from-orange-500 to-orange-600",
      action: undefined
    }
  ];

  return (
    <section id="contacto" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
            <Send className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 text-sm font-medium">{t('contact.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('contact.title')}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> {t('contact.titleAccent')}</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <div 
                key={index} 
                onClick={info.action}
                className={`bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-600 ${
                  info.action ? 'cursor-pointer hover:border-blue-500/50' : ''
                }`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl text-white mb-4`}>
                  {info.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{info.title}</h3>
                {info.details.map((detail, detailIndex) => (
                  <p key={detailIndex} className="text-slate-300 text-sm mb-1">{detail}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">{t('contact.sendMessage')}</h3>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">{t('contact.messageSent')}</h4>
                  <p className="text-slate-300">{t('contact.messageResponse')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('contact.fullName')} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.name ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder={t('contact.namePlaceholder')}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.email ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder={t('contact.emailPlaceholder')}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('contact.company')}
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder={t('contact.companyPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('contact.service')}
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">{t('contact.selectService')}</option>
                        <option value="consulting">{t('services.consulting.title')}</option>
                        <option value="security">{t('services.security.title')}</option>
                        <option value="cloud">{t('services.cloud.title')}</option>
                        <option value="development">{t('services.development.title')}</option>
                        <option value="data">{t('services.data.title')}</option>
                        <option value="automation">{t('services.automation.title')}</option>
                        <option value="translations">{t('services.translations.title')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {t('contact.message')} *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        errors.message ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder={t('contact.messagePlaceholder')}
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 ${
                      isSubmitting 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>{t('contact.send')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;