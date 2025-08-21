import React, { useState, useRef } from 'react';
import { Upload, Download, Eye, FileText, Check, X, Calendar, Star, AlertCircle, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DocumentManagementProps {
  requestId: string;
  requestData: any;
  onUpdate: () => void;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ 
  requestId, 
  requestData, 
  onUpdate 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [translatorNotes, setTranslatorNotes] = useState(requestData.translator_notes || '');
  const [qualityScore, setQualityScore] = useState(requestData.quality_score || 5);
  const [verificationLink, setVerificationLink] = useState(requestData.verification_link || '');
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const translatedFiles = requestData.translated_file_urls || [];
  const originalFiles = requestData.file_urls || [];

  const uploadTranslatedDocuments = async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `translated_${requestId}_${Date.now()}_${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('translated-documents')
          .upload(fileName, file);

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('translated-documents')
          .getPublicUrl(fileName);

        return publicUrl.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Update the translation request with uploaded files
      const currentUrls = requestData.translated_file_urls || [];
      const updatedUrls = [...currentUrls, ...uploadedUrls];

      const { error } = await supabase
        .from('translation_requests')
        .update({
          translated_file_urls: updatedUrls,
          status: 'completed',
          delivery_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      onUpdate();
      alert('Documents uploaded successfully!');

    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    } finally {
      setIsUploading(false);
    }
  };

  const generateVerificationLink = async () => {
    try {
      // Generate unique verification token
      const verificationToken = `${crypto.randomUUID()}-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('translation_requests')
        .update({
          verification_link: verificationToken,
          verification_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          is_verified: true
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      setVerificationLink(verificationToken);
      onUpdate();
      alert('Verification link generated successfully!');

    } catch (error) {
      console.error('Error generating verification link:', error);
      alert('Error generating verification link');
    }
  };

  const updateTranslatorData = async () => {
    try {
      const { error } = await supabase
        .from('translation_requests')
        .update({
          translator_notes: translatorNotes,
          quality_score: qualityScore
        })
        .eq('id', requestId);

      if (error) throw error;

      onUpdate();
      alert('Translator data updated successfully!');

    } catch (error) {
      console.error('Error updating translator data:', error);
      alert('Error updating translator data');
    }
  };

  const copyVerificationLink = async () => {
    const fullLink = `${window.location.origin}/verify/${verificationLink}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="space-y-6">
      {/* Original Client Documents Section */}
      <div className="bg-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-orange-400" />
            Client's Original Documents
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            originalFiles.length > 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'
          }`}>
            {originalFiles.length} original files
          </span>
        </div>

        {originalFiles.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-white font-medium">Documents to Translate:</h4>
            {originalFiles.map((url, index) => {
              const fileName = url.split('/').pop() || `original_file_${index + 1}`;
              const cleanFileName = fileName.replace(/^\d+_/, ''); // Remove timestamp prefix
              
              return (
                <div key={index} className="flex items-center justify-between bg-slate-600/50 rounded-lg p-3 border-l-4 border-orange-400">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-orange-400" />
                    <div>
                      <span className="text-white text-sm font-medium">{cleanFileName}</span>
                      <p className="text-slate-400 text-xs">Original document from client</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(url, '_blank')}
                      className="text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/20 p-2 rounded-lg hover:bg-orange-500/30"
                      title="View original file"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadFile(url, cleanFileName)}
                      className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/20 p-2 rounded-lg hover:bg-blue-500/30"
                      title="Download original file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-600/30 rounded-lg border-2 border-dashed border-slate-600">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-400">No original documents uploaded by client</p>
            <p className="text-slate-500 text-sm">Client may have submitted request without files</p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Upload className="w-5 h-5 mr-2 text-green-400" />
            Upload Your Translated Documents
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            requestData.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
          }`}>
            {translatedFiles.length} translated files uploaded
          </span>
        </div>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            onChange={(e) => e.target.files && uploadTranslatedDocuments(e.target.files)}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-6 text-center transition-colors disabled:opacity-50"
          >
            <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white mb-1">
              {isUploading ? 'Uploading...' : 'Click to upload translated documents'}
            </p>
            <p className="text-slate-400 text-sm">Upload your completed translations (PDF, Word, Images, TXT)</p>
          </button>

          {/* Uploaded Files List */}
          {translatedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-medium">Your Translated Files:</h4>
              {translatedFiles.map((url, index) => {
                const fileName = url.split('/').pop() || `file_${index + 1}`;
                const cleanFileName = fileName.replace(`translated_${requestId}_`, '').replace(/^\d+_/, '');
                
                return (
                  <div key={index} className="flex items-center justify-between bg-slate-600/50 rounded-lg p-3 border-l-4 border-green-400">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-400" />
                      <div>
                        <span className="text-white text-sm font-medium">{cleanFileName}</span>
                        <p className="text-slate-400 text-xs">Translated document</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(url, '_blank')}
                        className="text-green-400 hover:text-green-300 transition-colors bg-green-500/20 p-2 rounded-lg hover:bg-green-500/30"
                        title="View translated file"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadFile(url, cleanFileName)}
                        className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/20 p-2 rounded-lg hover:bg-blue-500/30"
                        title="Download translated file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Translator Notes Section */}
      <div className="bg-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-green-400" />
          Translator Notes & Quality
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Translator Notes
            </label>
            <textarea
              value={translatorNotes}
              onChange={(e) => setTranslatorNotes(e.target.value)}
              rows={4}
              className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add any notes about the translation process, challenges, or special considerations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quality Score
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setQualityScore(star)}
                    className={`transition-colors ${
                      star <= qualityScore ? 'text-yellow-400' : 'text-slate-500'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
              <span className="text-white">
                {qualityScore}/5 - {
                  qualityScore === 5 ? 'Excellent' :
                  qualityScore === 4 ? 'Very Good' :
                  qualityScore === 3 ? 'Good' :
                  qualityScore === 2 ? 'Fair' : 'Needs Improvement'
                }
              </span>
            </div>
          </div>

          <button
            onClick={updateTranslatorData}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all"
          >
            Update Translator Data
          </button>
        </div>
      </div>

      {/* Verification Link Section */}
      <div className="bg-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <ExternalLink className="w-5 h-5 mr-2 text-purple-400" />
          Verification Link
        </h3>

        {verificationLink ? (
          <div className="space-y-4">
            <div className="bg-slate-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Public Verification URL:</span>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Active</span>
                  {requestData.verification_expires_at && (
                    <span className="text-xs text-slate-400">
                      Expires: {new Date(requestData.verification_expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-slate-800 text-blue-300 px-3 py-2 rounded text-sm overflow-x-auto">
                  {window.location.origin}/verify/{verificationLink}
                </code>
                <button
                  onClick={copyVerificationLink}
                  className={`px-3 py-2 rounded transition-all ${
                    linkCopied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-400">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Share this link with the client to verify and download their translated documents.
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <p className="text-slate-300 mb-4">No verification link generated yet</p>
            <button
              onClick={generateVerificationLink}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              Generate Verification Link
            </button>
          </div>
        )}
      </div>

      {/* Delivery Information */}
      {requestData.delivery_date && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center text-green-300">
            <Calendar className="w-5 h-5 mr-3" />
            <div>
              <p className="font-medium">Translation Completed</p>
              <p className="text-sm text-green-400">
                Delivered on {new Date(requestData.delivery_date).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;