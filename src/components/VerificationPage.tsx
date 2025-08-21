import React, { useState, useEffect } from 'react';
import { Shield, Download, Eye, FileText, Calendar, User, Globe, CheckCircle, XCircle, Clock, ArrowLeft, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VerificationPageProps {
  verificationToken: string;
  onBack: () => void;
}

interface VerificationData {
  is_valid: boolean;
  request_id: string;
  full_name: string;
  status: string;
  expires_at: string;
}

interface TranslationDetails {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  source_language: string;
  target_language: string;
  document_type: string;
  page_count: number;
  processing_time: string;
  desired_format: string;
  request_date: string;
  delivery_date: string;
  translator_notes: string;
  quality_score: number;
  translated_file_urls: string[];
  status: string;
  total_cost: number;
  created_at: string;
}

const VerificationPage: React.FC<VerificationPageProps> = ({ verificationToken, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [translationDetails, setTranslationDetails] = useState<TranslationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyAndLoadData();
  }, [verificationToken]);

  const verifyAndLoadData = async () => {
    setIsLoading(true);
    try {
      // Validate verification link
      const { data: verificationResult, error: verificationError } = await supabase
        .rpc('validate_verification_link', { link: verificationToken });

      if (verificationError) throw verificationError;

      if (!verificationResult || verificationResult.length === 0) {
        setError('Invalid verification link');
        return;
      }

      const verification = verificationResult[0];
      setVerificationData(verification);

      if (!verification.is_valid) {
        if (new Date(verification.expires_at) < new Date()) {
          setError('This verification link has expired');
        } else if (verification.status !== 'completed') {
          setError('Translation is not yet completed');
        } else {
          setError('Invalid verification link');
        }
        return;
      }

      // Load full translation details
      const { data: translationData, error: translationError } = await supabase
        .from('translation_requests')
        .select('*')
        .eq('id', verification.request_id)
        .single();

      if (translationError) throw translationError;

      setTranslationDetails(translationData);

      // Log verification access
      await logAccess('view');

    } catch (error) {
      console.error('Verification error:', error);
      setError('Error validating verification link');
    } finally {
      setIsLoading(false);
    }
  };

  const logAccess = async (accessType: 'view' | 'download', fileName?: string) => {
    try {
      await supabase.rpc('log_verification_access', {
        p_verification_link: verificationToken,
        p_access_type: accessType,
        p_ip_address: null, // Could be enhanced with IP detection
        p_user_agent: navigator.userAgent,
        p_downloaded_file: fileName || null
      });
    } catch (error) {
      console.error('Error logging access:', error);
    }
  };

  const downloadFile = async (url: string, fileName: string) => {
    await logAccess('download', fileName);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'es': 'Spanish',
      'en': 'English',
      'fr': 'French',
      'pt': 'Portuguese',
      'it': 'Italian',
      'de': 'German',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ar': 'Arabic',
      'ru': 'Russian'
    };
    return languages[code] || code.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying translation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-white/70 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Site
          </button>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-red-500/20">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
            <p className="text-red-300 mb-6">{error}</p>
            <div className="text-sm text-white/70">
              <p>If you believe this is an error, please contact:</p>
              <p className="mt-2">support@triexpertservice.com</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!translationDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Loading translation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Site
          </button>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Verified Translation</h1>
          </div>
          <div></div>
        </div>

        {/* Verification Status */}
        <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center text-green-300 mb-4">
            <CheckCircle className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-xl font-bold">Translation Verified</h2>
              <p className="text-green-400">This is an official certified translation by TriExpert Services</p>
            </div>
          </div>
          
          {verificationData && (
            <div className="text-center text-sm text-green-400">
              <Clock className="w-4 h-4 inline mr-1" />
              Valid until {new Date(verificationData.expires_at).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Information */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 h-fit">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Client Information
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-white/70">Full Name:</label>
                  <p className="text-white font-medium">{translationDetails.full_name}</p>
                </div>
                <div>
                  <label className="text-white/70">Email:</label>
                  <p className="text-white font-medium">{translationDetails.email}</p>
                </div>
                <div>
                  <label className="text-white/70">Phone:</label>
                  <p className="text-white font-medium">{translationDetails.phone}</p>
                </div>
              </div>
            </div>

            {/* Translation Quality */}
            {translationDetails.quality_score && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Quality Assurance</h3>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= translationDetails.quality_score
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-500'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white font-medium">
                    {translationDetails.quality_score}/5
                  </span>
                </div>
                <p className="text-white/70 text-sm">
                  Professional quality certified translation
                </p>
              </div>
            )}
          </div>

          {/* Translation Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                Translation Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="text-white/70">Document Type:</label>
                  <p className="text-white font-medium capitalize">
                    {translationDetails.document_type.replace('_', ' ')}
                  </p>
                </div>
                
                <div>
                  <label className="text-white/70">Page Count:</label>
                  <p className="text-white font-medium">{translationDetails.page_count} pages</p>
                </div>

                <div>
                  <label className="text-white/70 flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    Languages:
                  </label>
                  <p className="text-white font-medium">
                    {getLanguageName(translationDetails.source_language)} → {getLanguageName(translationDetails.target_language)}
                  </p>
                </div>

                <div>
                  <label className="text-white/70">Format:</label>
                  <p className="text-white font-medium capitalize">{translationDetails.desired_format}</p>
                </div>

                <div>
                  <label className="text-white/70">Processing Time:</label>
                  <p className="text-white font-medium capitalize">{translationDetails.processing_time}</p>
                </div>

                <div>
                  <label className="text-white/70">Total Cost:</label>
                  <p className="text-white font-medium">{formatCurrency(translationDetails.total_cost)}</p>
                </div>

                <div>
                  <label className="text-white/70">Requested:</label>
                  <p className="text-white font-medium">{formatDate(translationDetails.created_at)}</p>
                </div>

                <div>
                  <label className="text-white/70">Delivered:</label>
                  <p className="text-white font-medium">
                    {translationDetails.delivery_date ? formatDate(translationDetails.delivery_date) : 'In progress'}
                  </p>
                </div>
              </div>

              {/* Translator Notes */}
              {translationDetails.translator_notes && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <label className="text-white/70 block mb-2">Translator Notes:</label>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-white text-sm leading-relaxed">
                      {translationDetails.translator_notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Translated Documents */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <Download className="w-5 h-5 mr-2 text-green-400" />
                Translated Documents
              </h3>

              {translationDetails.translated_file_urls && translationDetails.translated_file_urls.length > 0 ? (
                <div className="space-y-3">
                  {translationDetails.translated_file_urls.map((url, index) => {
                    const fileName = url.split('/').pop() || `translation_${index + 1}`;
                    const displayName = fileName.replace(`translated_${translationDetails.id}_`, '').replace(/^\d+_/, '');
                    
                    return (
                      <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">{displayName}</p>
                            <p className="text-white/60 text-sm">Certified Translation</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(url, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => downloadFile(url, displayName)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-white/70">No translated documents available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t border-white/20">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">TriExpert Services</span>
          </div>
          <p className="text-white/60 text-sm">
            Professional certified translations • Tampa, Florida
          </p>
          <p className="text-white/40 text-xs mt-1">
            This verification page confirms the authenticity of your translated documents
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;