import React, { useState, useRef } from 'react';
import { QrCode, Download, Copy, CheckCircle, Eye, ExternalLink, Share } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface QRCodeGeneratorProps {
  verificationLink: string;
  clientName: string;
  requestId: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  verificationLink, 
  clientName, 
  requestId 
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fullVerificationUrl = `${window.location.origin}/verify/${verificationLink}`;

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(fullVerificationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e293b', // Slate 800
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = async () => {
    if (!qrCodeDataUrl) {
      await generateQR();
      return;
    }

    try {
      // Create a higher quality QR for download
      const highQualityQR = await QRCodeLib.toDataURL(fullVerificationUrl, {
        width: 600,
        margin: 4,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      const link = document.createElement('a');
      link.download = `verification-qr-${requestId}-${clientName.replace(/\s+/g, '-')}.png`;
      link.href = highQualityQR;
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Error downloading QR code');
    }
  };

  const copyVerificationLink = async () => {
    try {
      await navigator.clipboard.writeText(fullVerificationUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const openVerificationPage = () => {
    window.open(fullVerificationUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`TriExpert Services - Your Translation Verification`);
    const body = encodeURIComponent(
      `Dear ${clientName},\n\n` +
      `Your certified translation is ready for verification and download.\n\n` +
      `Verification Link: ${fullVerificationUrl}\n\n` +
      `You can also scan the attached QR code to access your documents.\n\n` +
      `Best regards,\n` +
      `TriExpert Services Team\n` +
      `support@triexpertservice.com`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  React.useEffect(() => {
    if (verificationLink) {
      generateQR();
    }
  }, [verificationLink]);

  if (!verificationLink) {
    return (
      <div className="bg-slate-600/30 rounded-xl p-6 text-center">
        <QrCode className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-400">No verification link available</p>
        <p className="text-slate-500 text-sm">Generate a verification link first</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <QrCode className="w-5 h-5 mr-2 text-purple-400" />
          QR Code Generator
        </h3>
        <div className="flex items-center space-x-2">
          <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="text-center">
          <div className="bg-white rounded-xl p-4 inline-block shadow-lg">
            {isGenerating ? (
              <div className="w-[300px] h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code for verification" 
                className="w-[300px] h-[300px] mx-auto"
              />
            ) : (
              <div className="w-[300px] h-[300px] flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="text-white font-medium">Client: {clientName}</p>
            <p className="text-slate-400 text-sm">Scan to verify translation</p>
          </div>
        </div>

        {/* Actions and Details */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2">Verification URL</h4>
            <div className="bg-slate-600/50 rounded-lg p-3">
              <code className="text-blue-300 text-sm break-all">{fullVerificationUrl}</code>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copyVerificationLink}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                linkCopied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={openVerificationPage}
              className="flex items-center justify-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            <button
              onClick={downloadQR}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download QR</span>
            </button>

            <button
              onClick={shareViaEmail}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
            >
              <Share className="w-4 h-4" />
              <span>Email</span>
            </button>
          </div>

          <div className="bg-slate-600/30 rounded-lg p-4">
            <h5 className="font-medium text-white mb-2">Usage Instructions</h5>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Send QR code to client via email or print</li>
              <li>• Client scans QR to access verification page</li>
              <li>• Client can download translated documents</li>
              <li>• Client can leave a review after verification</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center text-blue-300 text-sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              <span>QR code links directly to secure verification page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;