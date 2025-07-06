import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  Download,
  Sparkles,
  Users,
  Gift,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { TwitterShareButton, TelegramShareButton } from 'react-share';
import QRCodeLib from 'qrcode';
import { StatusBadge } from '../ui/StatusBadge';
import { Tooltip } from '../ui/Tooltip';
import toast from 'react-hot-toast';

interface EnhancedReferralGeneratorProps {
  referralCode: string;
  referralLink: string;
}

export const EnhancedReferralGenerator: React.FC<EnhancedReferralGeneratorProps> = ({
  referralCode,
  referralLink,
}) => {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type === 'code' ? 'Referral code' : 'Referral link'} copied! 📋`, {
        duration: 3000,
        icon: '✅',
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard', {
        duration: 3000,
        icon: '❌',
      });
    }
  };

  const generateQRCode = async () => {
    try {
      const url = await QRCodeLib.toDataURL(referralLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setQrCodeUrl(url);
      setShowQR(true);
      toast.success('QR code generated! 📱', {
        duration: 2000,
        icon: '🎯',
      });
    } catch (error) {
      toast.error('Failed to generate QR code', {
        duration: 3000,
        icon: '❌',
      });
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `referral-qr-${referralCode}.png`;
      link.href = qrCodeUrl;
      link.click();
      toast.success('QR code downloaded! 💾', {
        duration: 2000,
        icon: '⬇️',
      });
    }
  };

  const shareText = `🎉 Join me on this amazing platform and earn REFT tokens! Use my referral code: ${referralCode}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
            <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Your Referral Code
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Share with friends to earn rewards together
            </p>
          </div>
        </div>
        <StatusBadge status="success" text="Active" size="sm" />
      </div>
      
      <div className="space-y-6">
        {/* Referral Code Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Referral Code
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
              <div className="text-center">
                <p className="font-mono text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-wider break-all">
                  {referralCode}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your unique referral identifier
                </p>
              </div>
            </div>
            <Tooltip content="Copy referral code">
              <button
                onClick={() => copyToClipboard(referralCode, 'code')}
                className="w-full sm:w-auto p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
              >
                {copied === 'code' ? <Check size={20} /> : <Copy size={20} />}
                <span className="ml-2 sm:hidden">Copy Code</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Referral Link
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                {referralLink}
              </p>
            </div>
            <Tooltip content="Copy referral link">
              <button
                onClick={() => copyToClipboard(referralLink, 'link')}
                className="w-full sm:w-auto p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
              >
                {copied === 'link' ? <Check size={20} /> : <Copy size={20} />}
                <span className="ml-2 sm:hidden">Copy Link</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tooltip content="Generate QR code for easy sharing">
            <button
              onClick={generateQRCode}
              className="flex items-center justify-center space-x-2 px-3 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <QrCode size={16} />
              <span className="text-sm">QR Code</span>
            </button>
          </Tooltip>

          <Tooltip content="Share on Twitter">
            <TwitterShareButton
              url={referralLink}
              title={shareText}
              className="flex items-center justify-center space-x-2 px-3 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
            >
              <Share2 size={16} />
              <span className="text-sm">Twitter</span>
            </TwitterShareButton>
          </Tooltip>

          <Tooltip content="Share on Telegram">
            <TelegramShareButton
              url={referralLink}
              title={shareText}
              className="flex items-center justify-center space-x-2 px-3 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
            >
              <Share2 size={16} />
              <span className="text-sm">Telegram</span>
            </TelegramShareButton>
          </Tooltip>

          <Tooltip content="More sharing options">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Join me and earn REFT tokens!',
                    text: shareText,
                    url: referralLink,
                  });
                } else {
                  copyToClipboard(shareText + ' ' + referralLink, 'link');
                }
              }}
              className="flex items-center justify-center space-x-2 px-3 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Sparkles size={16} />
              <span className="text-sm">More</span>
            </button>
          </Tooltip>
        </div>

        {/* Rewards Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              Referral Rewards
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                👤
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  You earn: 1000 REFT
                </p>
                <p className="text-green-600 dark:text-green-400 text-xs">
                  For each successful referral
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                🎁
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  They earn: 500 REFT
                </p>
                <p className="text-green-600 dark:text-green-400 text-xs">
                  Welcome bonus for new users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                QR Code
              </h4>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                <img src={qrCodeUrl} alt="QR Code" className="rounded-lg" />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code to access your referral link
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                
                <button
                  onClick={() => copyToClipboard(referralLink, 'link')}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Copy size={16} />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};