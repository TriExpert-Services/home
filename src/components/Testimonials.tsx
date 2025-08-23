import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  client_name: string;
  service_type: string;
  created_at: string;
  show_full_name: boolean;
}

const Testimonials = () => {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedReviews();
  }, []);

  const loadFeaturedReviews = async () => {
    setIsLoading(true);
    try {
      const { data: featuredReviews, error } = await supabase
        .rpc('get_featured_reviews', { limit_count: 12 });

      if (error) throw error;

      if (featuredReviews && featuredReviews.length > 0) {
        setReviews(featuredReviews);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const getServiceDisplayName = (serviceType: string) => {
    const serviceNames: { [key: string]: { en: string, es: string } } = {
      birth_certificate: { en: 'Birth Certificate', es: 'Acta de Nacimiento' },
      marriage_certificate: { en: 'Marriage Certificate', es: 'Acta de Matrimonio' },
      death_certificate: { en: 'Death Certificate', es: 'Acta de Defunción' },
      diploma: { en: 'Diploma Translation', es: 'Traducción de Diploma' },
      transcript: { en: 'Academic Transcript', es: 'Expediente Académico' },
      passport: { en: 'Passport Translation', es: 'Traducción de Pasaporte' },
      license: { en: 'License Translation', es: 'Traducción de Licencia' },
      contract: { en: 'Contract Translation', es: 'Traducción de Contrato' },
      medical: { en: 'Medical Document', es: 'Documento Médico' },
      legal: { en: 'Legal Document', es: 'Documento Legal' },
      other: { en: 'Other Document', es: 'Otro Documento' }
    };

    return serviceNames[serviceType]?.[language] || serviceType.replace('_', ' ');
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white mt-4">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  const currentReview = reviews[currentIndex];
  const displayName = currentReview.show_full_name 
    ? currentReview.client_name 
    : `${currentReview.client_name.split(' ')[0]} ${currentReview.client_name.split(' ')[1]?.[0] || ''}.`;

  return (
    <section className="py-20 bg-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-yellow-100 rounded-full px-4 py-2 mb-4">
            <MessageSquare className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-600 text-sm font-medium">
              {language === 'es' ? 'Testimonios Reales' : 'Real Testimonials'}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'es' ? 'Lo que Dicen Nuestros ' : 'What Our '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {language === 'es' ? 'Clientes' : 'Clients Say'}
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {language === 'es' 
              ? 'Reseñas auténticas de clientes reales que han usado nuestros servicios de traducción'
              : 'Authentic reviews from real clients who have used our translation services'
            }
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-slate-600 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              {/* Quote icon */}
              <Quote className="w-12 h-12 text-yellow-400 mb-6 opacity-50" />
              
              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= currentReview.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-500'
                    }`}
                  />
                ))}
                <span className="ml-2 text-yellow-400 font-semibold">
                  {currentReview.rating}/5
                </span>
              </div>

              {/* Title */}
              {currentReview.title && (
                <h3 className="text-2xl font-bold text-white mb-4">
                  {currentReview.title}
                </h3>
              )}

              {/* Review text */}
              <blockquote className="text-lg text-slate-200 leading-relaxed mb-6">
                "{currentReview.comment}"
              </blockquote>

              {/* Client info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {displayName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{displayName}</p>
                    <p className="text-slate-400 text-sm">
                      {getServiceDisplayName(currentReview.service_type)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Navigation */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevReview}
                      className="w-10 h-10 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center transition-colors"
                      aria-label="Previous review"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-slate-400 text-sm">
                      {currentIndex + 1} / {reviews.length}
                    </span>
                    <button
                      onClick={nextReview}
                      className="w-10 h-10 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center transition-colors"
                      aria-label="Next review"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(1, 7).map((review, index) => {
            const reviewDisplayName = review.show_full_name 
              ? review.client_name 
              : `${review.client_name.split(' ')[0]} ${review.client_name.split(' ')[1]?.[0] || ''}.`;
            
            return (
              <div
                key={review.id}
                className="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600 hover:border-yellow-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => setCurrentIndex(index + 1)}
              >
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-500'
                      }`}
                    />
                  ))}
                </div>

                {/* Title */}
                {review.title && (
                  <h4 className="font-bold text-white mb-2 text-sm">
                    {review.title}
                  </h4>
                )}

                {/* Comment (truncated) */}
                <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                  {review.comment.length > 100 
                    ? `${review.comment.substring(0, 100)}...` 
                    : review.comment
                  }
                </p>

                {/* Client info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {reviewDisplayName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{reviewDisplayName}</p>
                    <p className="text-slate-400 text-xs">
                      {getServiceDisplayName(review.service_type)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              {language === 'es' ? '¿Necesitas una traducción?' : 'Need a translation?'}
            </h3>
            <p className="text-slate-300 mb-6">
              {language === 'es'
                ? 'Únete a nuestros clientes satisfechos y recibe una traducción certificada de alta calidad'
                : 'Join our satisfied clients and get a high-quality certified translation'
              }
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('showTranslationForm'))}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300"
            >
              {language === 'es' ? 'Solicitar Traducción' : 'Request Translation'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;