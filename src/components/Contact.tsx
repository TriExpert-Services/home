import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { logger } from '../lib/logger';
import { trackEvent } from '../lib/analytics';
import { Button, Card, Input, Textarea } from './primitives';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const Contact = () => {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone.trim() && !/^\+?[\d\s\-().]{7,20}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendToN8N = async (contactData: Record<string, unknown>): Promise<void> => {
    const webhookUrl = import.meta.env.VITE_N8N_CONTACT_WEBHOOK_URL;
    if (!webhookUrl) return; // n8n step is optional; DB write is the source of truth

    try {
      const webhookToken = import.meta.env.VITE_N8N_WEBHOOK_TOKEN;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (webhookToken) headers['X-Webhook-Token'] = webhookToken;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(contactData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      // n8n is best-effort; don't break the user flow if it's down
      logger.error('Error sending to N8N:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { data: leadId, error: dbError } = await supabase.rpc('create_contact_lead', {
        p_full_name: formData.name,
        p_email: formData.email,
        p_message: formData.message,
        p_company: formData.company || null,
        p_service: formData.service || null,
        p_phone: formData.phone || null,
        p_source: 'website_form',
        p_referrer: document.referrer || null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
      });

      if (dbError) {
        logger.error('Database error:', dbError);
        setSubmitError('Could not submit your message. Please try again.');
        setIsSubmitting(false);
        return;
      }

      void sendToN8N({
        lead_id: leadId ?? 'unknown',
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        service: formData.service || null,
        message: formData.message,
        source: 'contact_form',
        language,
        created_at: new Date().toISOString(),
      });

      trackEvent('Contact Submitted', { service: formData.service || 'unspecified' });

      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', company: '', service: '', message: '' });

      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      logger.error('Contact form error:', error);
      setSubmitError('Error processing your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (submitError) setSubmitError(null);
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: t('contact.phone'),
      details: ['+1 (813) 710-8860', t('contact.phoneAvailable')],
      color: 'from-blue-500 to-blue-600',
      action: () => window.open('tel:+18137108860', '_self'),
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t('contact.email'),
      details: ['support@triexpertservice.com', t('contact.emailSupport')],
      color: 'from-green-500 to-green-600',
      action: () => window.open('mailto:support@triexpertservice.com', '_self'),
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t('contact.location'),
      details: ['2800 E 113th Ave, Apt 120', 'Tampa, Florida 33612'],
      color: 'from-purple-500 to-purple-600',
      action: () =>
        window.open('https://maps.google.com/?q=2800+E+113th+Ave,+Tampa,+FL+33612', '_blank'),
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t('contact.hours'),
      details: [t('contact.hoursWeek'), t('contact.hoursSat')],
      color: 'from-orange-500 to-orange-600',
      action: undefined,
    },
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
            <span className="bg-gradient-to-r from-brand-400 to-accent-500 bg-clip-text text-transparent">
              {' '}
              {t('contact.titleAccent')}
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">{t('contact.description')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact info cards */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <button
                type="button"
                key={index}
                onClick={info.action}
                disabled={!info.action}
                className={`w-full text-left bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-600 ${
                  info.action
                    ? 'cursor-pointer hover:-translate-y-1 hover:border-brand-500/50'
                    : 'cursor-default'
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl text-white mb-4`}
                >
                  {info.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-slate-300 text-sm mb-1">
                    {detail}
                  </p>
                ))}
              </button>
            ))}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <h3 className="text-2xl font-bold text-white mb-6">{t('contact.sendMessage')}</h3>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">{t('contact.messageSent')}</h4>
                  <p className="text-slate-300">{t('contact.messageResponse')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      name="name"
                      label={`${t('contact.fullName')} *`}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder={t('contact.namePlaceholder')}
                      error={errors.name}
                    />
                    <Input
                      name="email"
                      type="email"
                      label="Email *"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder={t('contact.emailPlaceholder')}
                      error={errors.email}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      name="phone"
                      type="tel"
                      label={t('contact.phone')}
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      placeholder="+1 (555) 123-4567"
                      error={errors.phone}
                    />
                    <Input
                      name="company"
                      label={t('contact.company')}
                      value={formData.company}
                      onChange={handleChange}
                      autoComplete="organization"
                      placeholder={t('contact.companyPlaceholder')}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="service"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      {t('contact.service')}
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:border-transparent transition-colors"
                    >
                      <option value="" className="bg-slate-800">
                        {t('contact.selectService')}
                      </option>
                      <option value="consulting" className="bg-slate-800">
                        {t('services.consulting.title')}
                      </option>
                      <option value="security" className="bg-slate-800">
                        {t('services.security.title')}
                      </option>
                      <option value="cloud" className="bg-slate-800">
                        {t('services.cloud.title')}
                      </option>
                      <option value="development" className="bg-slate-800">
                        {t('services.development.title')}
                      </option>
                      <option value="data" className="bg-slate-800">
                        {t('services.data.title')}
                      </option>
                      <option value="automation" className="bg-slate-800">
                        {t('services.automation.title')}
                      </option>
                      <option value="translations" className="bg-slate-800">
                        {t('services.translations.title')}
                      </option>
                    </select>
                  </div>

                  <Textarea
                    name="message"
                    label={`${t('contact.message')} *`}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder={t('contact.messagePlaceholder')}
                    error={errors.message}
                  />

                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="text-sm">{submitError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    leftIcon={!isSubmitting && <Send className="w-5 h-5" />}
                  >
                    {isSubmitting ? 'Sending…' : t('contact.send')}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
