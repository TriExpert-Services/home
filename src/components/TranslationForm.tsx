import React, { useState } from 'react';
import { ArrowLeft, User, Globe, Upload, Clock, FileText, Calendar, CreditCard, Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  sourceLanguage: string;
  targetLanguage: string;
  processingTime: string;
  desiredFormat: string;
  pageCount: string;
  documentType: string;
  requestDate: string;
  specialInstructions: string;
  files: FileList | null;
}

interface FormErrors {
  [key: string]: string;
}

const TranslationForm = ({ onBack }: { onBack: () => void }) => {
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    sourceLanguage: '',
    targetLanguage: '',
    processingTime: '',
    desiredFormat: '',
    pageCount: '',
    documentType: '',
    requestDate: '',
    specialInstructions: '',
    files: null
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const languages = [
    { code: 'es', name: language === 'es' ? 'Español' : 'Spanish' },
    { code: 'en', name: language === 'es' ? 'Inglés' : 'English' },
    { code: 'fr', name: language === 'es' ? 'Francés' : 'French' },
    { code: 'pt', name: language === 'es' ? 'Portugués' : 'Portuguese' },
    { code: 'it', name: language === 'es' ? 'Italiano' : 'Italian' },
    { code: 'de', name: language === 'es' ? 'Alemán' : 'German' },
    { code: 'zh', name: language === 'es' ? 'Chino' : 'Chinese' },
    { code: 'ja', name: language === 'es' ? 'Japonés' : 'Japanese' },
    { code: 'ar', name: language === 'es' ? 'Árabe' : 'Arabic' },
    { code: 'ru', name: language === 'es' ? 'Ruso' : 'Russian' }
  ];

  const processingTimes = [
    { value: 'standard', label: language === 'es' ? '8-12 horas (Normal)' : '8-12 hours (Normal)', cost: 1.0 },
    { value: 'urgent', label: language === 'es' ? '1-2 horas (Urgente) +35%' : '1-2 hours (Urgent) +35%', cost: 1.35 }
  ];

  const formats = [
    { value: 'digital', label: language === 'es' ? 'Digital (PDF)' : 'Digital (PDF)' },
    { value: 'physical', label: language === 'es' ? 'Físico (Impreso)' : 'Physical (Printed)' },
    { value: 'both', label: language === 'es' ? 'Ambos (Digital + Físico)' : 'Both (Digital + Physical)' }
  ];

  const documentTypes = [
    { value: 'birth_certificate', label: language === 'es' ? 'Acta de Nacimiento' : 'Birth Certificate' },
    { value: 'marriage_certificate', label: language === 'es' ? 'Acta de Matrimonio' : 'Marriage Certificate' },
    { value: 'death_certificate', label: language === 'es' ? 'Acta de Defunción' : 'Death Certificate' },
    { value: 'diploma', label: language === 'es' ? 'Diploma/Título' : 'Diploma/Degree' },
    { value: 'transcript', label: language === 'es' ? 'Expediente Académico' : 'Academic Transcript' },
    { value: 'passport', label: language === 'es' ? 'Pasaporte' : 'Passport' },
    { value: 'license', label: language === 'es' ? 'Licencia' : 'License' },
    { value: 'contract', label: language === 'es' ? 'Contrato' : 'Contract' },
    { value: 'medical', label: language === 'es' ? 'Documento Médico' : 'Medical Document' },
    { value: 'legal', label: language === 'es' ? 'Documento Legal' : 'Legal Document' },
    { value: 'other', label: language === 'es' ? 'Otro' : 'Other' }
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = language === 'es' ? 'El nombre completo es requerido' : 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = language === 'es' ? 'El teléfono es requerido' : 'Phone is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = language === 'es' ? 'El correo electrónico es requerido' : 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = language === 'es' ? 'Ingrese un correo válido' : 'Please enter a valid email';
    }

    if (!formData.sourceLanguage) {
      newErrors.sourceLanguage = language === 'es' ? 'Seleccione el idioma de origen' : 'Select source language';
    }

    if (!formData.targetLanguage) {
      newErrors.targetLanguage = language === 'es' ? 'Seleccione el idioma de destino' : 'Select target language';
    }

    if (!formData.processingTime) {
      newErrors.processingTime = language === 'es' ? 'Seleccione el tiempo de procesamiento' : 'Select processing time';
    }

    if (!formData.desiredFormat) {
      newErrors.desiredFormat = language === 'es' ? 'Seleccione el formato deseado' : 'Select desired format';
    }

    if (!formData.pageCount || parseInt(formData.pageCount) < 1) {
      newErrors.pageCount = language === 'es' ? 'Ingrese un número válido de páginas' : 'Enter a valid page count';
    }

    if (!formData.documentType) {
      newErrors.documentType = language === 'es' ? 'Seleccione el tipo de documento' : 'Select document type';
    }

    if (!formData.requestDate) {
      newErrors.requestDate = language === 'es' ? 'Seleccione la fecha de solicitud' : 'Select request date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCost = (): number => {
    const pages = parseInt(formData.pageCount) || 0;
    
    // Precio por página: $20 base, $17.50 para 10+ páginas
    const baseRate = pages >= 10 ? 17.50 : 20.00;
    
    const processingMultiplier = processingTimes.find(p => p.value === formData.processingTime)?.cost || 1;
    const formatMultiplier = formData.desiredFormat === 'both' ? 1.2 : 1;
    
    return Math.round(pages * baseRate * processingMultiplier * formatMultiplier);
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (!formData.files || formData.files.length === 0) return [];

    try {
      const fileUrls: string[] = [];
      
      for (let i = 0; i < formData.files.length; i++) {
        const file = formData.files[i];
        const fileName = `${Date.now()}_${file.name}`;
        
        try {
          const { data, error } = await supabase.storage
            .from('translation-files')
            .upload(fileName, file);

          if (error) {
            console.error('Error uploading file:', error);
            throw new Error(`Error uploading ${file.name}: ${error.message}`);
          }

          const { data: publicUrl } = supabase.storage
            .from('translation-files')
            .getPublicUrl(fileName);

          fileUrls.push(publicUrl.publicUrl);
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          // Continue with other files, don't fail the entire upload
        }
      }

      return fileUrls;
    } catch (error) {
      console.error('File upload failed:', error);
      // Return empty array to continue with form submission
      return [];
    }
  };

  const sendToN8N = async (requestData: any) => {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      throw new Error('N8N webhook URL not configured');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  };

  const waitForPaymentLink = async (requestData: any): Promise<string | null> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null); // Timeout after 20 seconds
      }, 20000);

      sendToN8N(requestData)
        .then((response) => {
          clearTimeout(timeout);
          // N8N response format: [{ "url": "stripe_payment_url" }]
          let paymentUrl = null;
          
          if (Array.isArray(response) && response.length > 0) {
            // Response is an array with Stripe payment_link object
            paymentUrl = response[0]?.url;
          } else if (response?.url) {
            // Fallback for direct object response
            paymentUrl = response.url;
          }
          
          resolve(paymentUrl || null);
        })
        .catch((error) => {
          clearTimeout(timeout);
          console.error('Error getting payment link:', error);
          resolve(null);
        });
    });
  };

  const redirectToStripe = (paymentUrl: string) => {
    // Redirect to Stripe payment page
    window.location.href = paymentUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files first
      let fileUrls: string[] = [];
      let uploadWarning = '';
      
      try {
        fileUrls = await uploadFiles();
      } catch (uploadError) {
        console.error('File upload failed:', uploadError);
        uploadWarning = language === 'es' 
          ? 'Los archivos no pudieron subirse, pero su solicitud fue enviada. Contacte con nosotros para enviar los archivos.'
          : 'Files could not be uploaded, but your request was submitted. Please contact us to send the files.';
      }
      
      // Prepare data for database
      const requestData = {
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        source_language: formData.sourceLanguage,
        target_language: formData.targetLanguage,
        processing_time: formData.processingTime,
        desired_format: formData.desiredFormat,
        page_count: parseInt(formData.pageCount),
        document_type: formData.documentType,
        request_date: formData.requestDate,
        special_instructions: formData.specialInstructions || null,
        file_urls: fileUrls,
        status: 'pending',
        total_cost: calculateCost()
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('translation_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Prepare data for N8N
      const n8nData = {
        ...requestData,
        request_id: data.id,
        created_at: data.created_at
      };

      // Show payment waiting screen
      setIsSubmitting(false);
      setIsWaitingPayment(true);

      // Wait for payment link from N8N
      const paymentUrl = await waitForPaymentLink(n8nData);

      setIsWaitingPayment(false);

      if (paymentUrl) {
        // Redirect to Stripe payment
        redirectToStripe(paymentUrl);
      } else {
        // Show success message if no payment link received
        setIsSubmitted(true);
      }

      // Show upload warning if files failed to upload
      if (uploadWarning) {
        console.warn(uploadWarning);
      }

      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        sourceLanguage: '',
        targetLanguage: '',
        processingTime: '',
        desiredFormat: '',
        pageCount: '',
        documentType: '',
        requestDate: '',
        specialInstructions: '',
        files: null
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (files) {
      setFormData({ ...formData, files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Waiting for payment component
  if (isWaitingPayment) {
    return (
      <div className="min-h-screen bg-slate-900 py-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-slate-800 rounded-3xl p-12 text-center">
            {/* Animated payment processing icon */}
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto">
                <div className="w-full h-full border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              {language === 'es' ? 'Procesando tu Solicitud' : 'Processing Your Request'}
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center text-purple-300">
                <Zap className="w-5 h-5 mr-2 animate-bounce" />
                <span className="text-lg">
                  {language === 'es' 
                    ? 'Generando enlace de pago seguro...' 
                    : 'Generating secure payment link...'
                  }
                </span>
              </div>
              
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center text-purple-300 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                {language === 'es' 
                  ? 'Este proceso puede tomar hasta 20 segundos' 
                  : 'This process may take up to 20 seconds'
                }
              </div>
            </div>

            <p className="text-slate-400 text-sm">
              {language === 'es' 
                ? 'Serás redirigido automáticamente a la página de pago de Stripe' 
                : 'You will be automatically redirected to the Stripe payment page'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 py-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-slate-800 rounded-3xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {language === 'es' ? '¡Solicitud Enviada!' : 'Request Submitted!'}
            </h2>
            <p className="text-slate-300 mb-6">
              {language === 'es' 
                ? 'Hemos recibido su solicitud de traducción. Le contactaremos pronto con los detalles del pago y cronograma.' 
                : 'We have received your translation request. We will contact you soon with payment details and timeline.'
              }
            </p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-white hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {language === 'es' ? 'Solicitud de Traducción' : 'Translation Request'}
            </h1>
            <p className="text-slate-300">
              {language === 'es' 
                ? 'Completa el formulario para recibir una cotización personalizada' 
                : 'Complete the form to receive a personalized quote'
              }
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-blue-400">
                {language === 'es' ? 'Información Personal' : 'Personal Information'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Nombre completo' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.fullName ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder={language === 'es' ? 'Ingresa tu nombre completo' : 'Enter your full name'}
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Teléfono' : 'Phone'} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.phone ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="+1 234 567 8900"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Correo electrónico' : 'Email'} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.email ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Translation Details */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3">
                <Globe className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-green-400">
                {language === 'es' ? 'Detalles de Traducción' : 'Translation Details'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Idioma de origen' : 'Source Language'} *
                </label>
                <select
                  name="sourceLanguage"
                  value={formData.sourceLanguage}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.sourceLanguage ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">{language === 'es' ? 'Selecciona el idioma' : 'Select language'}</option>
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                {errors.sourceLanguage && <p className="mt-1 text-sm text-red-400">{errors.sourceLanguage}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Idioma de destino' : 'Target Language'} *
                </label>
                <select
                  name="targetLanguage"
                  value={formData.targetLanguage}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.targetLanguage ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">{language === 'es' ? 'Selecciona el idioma' : 'Select language'}</option>
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                {errors.targetLanguage && <p className="mt-1 text-sm text-red-400">{errors.targetLanguage}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Tiempo de procesamiento' : 'Processing Time'} *
                </label>
                <select
                  name="processingTime"
                  value={formData.processingTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.processingTime ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">{language === 'es' ? 'Selecciona el tiempo' : 'Select time'}</option>
                  {processingTimes.map((time) => (
                    <option key={time.value} value={time.value}>{time.label}</option>
                  ))}
                </select>
                {errors.processingTime && <p className="mt-1 text-sm text-red-400">{errors.processingTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Formato deseado' : 'Desired Format'} *
                </label>
                <select
                  name="desiredFormat"
                  value={formData.desiredFormat}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.desiredFormat ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">{language === 'es' ? 'Selecciona el formato' : 'Select format'}</option>
                  {formats.map((format) => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
                {errors.desiredFormat && <p className="mt-1 text-sm text-red-400">{errors.desiredFormat}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Número de hojas' : 'Number of Pages'} *
                </label>
                <input
                  type="number"
                  name="pageCount"
                  value={formData.pageCount}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.pageCount ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder={language === 'es' ? 'Ejemplo: 5' : 'Example: 5'}
                />
                {errors.pageCount && <p className="mt-1 text-sm text-red-400">{errors.pageCount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Tipo de documento' : 'Document Type'} *
                </label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.documentType ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">{language === 'es' ? 'Selecciona el tipo' : 'Select type'}</option>
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.documentType && <p className="mt-1 text-sm text-red-400">{errors.documentType}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Fecha de solicitud' : 'Request Date'}
                </label>
                <input
                  type="date"
                  name="requestDate"
                  value={formData.requestDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.requestDate ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.requestDate && <p className="mt-1 text-sm text-red-400">{errors.requestDate}</p>}
              </div>
            </div>
          </div>

          {/* Files and Instructions */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mr-3">
                <Upload className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-orange-400">
                {language === 'es' ? 'Archivos e Instrucciones' : 'Files and Instructions'}
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Archivos a traducir' : 'Files to Translate'}
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    name="files"
                    onChange={handleChange}
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png,.gif,.svg"
                    className="hidden"
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-white mb-2">
                      {formData.files && formData.files.length > 0
                        ? `${formData.files.length} ${language === 'es' ? 'archivo(s) seleccionado(s)' : 'file(s) selected'}`
                        : (language === 'es' ? 'Seleccionar archivos' : 'Choose Files')
                      }
                    </p>
                    <p className="text-sm text-slate-400">
                      {language === 'es' 
                        ? 'Formatos aceptados: PDF, Word, PowerPoint, Excel, TXT, JPG, PNG, GIF, SVG, WebP' 
                        : 'Accepted formats: PDF, Word, PowerPoint, Excel, TXT, JPG, PNG, GIF, SVG, WebP'
                      }
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'es' ? 'Instrucciones especiales' : 'Special Instructions'}
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder={language === 'es' 
                    ? 'Describe cualquier instrucción especial, contexto o preferencias para la traducción...' 
                    : 'Describe any special instructions, context, or preferences for the translation...'
                  }
                />
              </div>
            </div>
          </div>

          {/* Cost Estimate */}
          {formData.pageCount && formData.processingTime && (
            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="w-8 h-8 text-purple-400 mr-3" />
                  <div>
                    <h3 className="font-bold text-white">
                      {language === 'es' ? 'Cotización Estimada' : 'Estimated Quote'}
                    </h3>
                    <p className="text-sm text-slate-300">
                      {language === 'es' ? 'Precio final sujeto a revisión' : 'Final price subject to review'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">${calculateCost()}</div>
                  <div className="text-sm text-slate-300">USD</div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center space-x-3 ${
              isSubmitting 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{language === 'es' ? 'Procesando...' : 'Processing...'}</span>
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                <span>{language === 'es' ? 'Proceder al Pago' : 'Proceed to Payment'}</span>
              </>
            )}
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center text-yellow-400 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                {language === 'es' ? 'Recibirás una respuesta en minutos' : 'You will receive a response in minutes'}
              </span>
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TranslationForm;