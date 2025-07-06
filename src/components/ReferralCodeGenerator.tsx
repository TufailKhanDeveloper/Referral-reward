import React, { useState } from 'react';
import { Copy, Check, Share2, QrCode } from 'lucide-react';
import { TwitterShareButton, TelegramShareButton } from 'react-share';
import QRCodeLib from 'qrcode';
import toast from 'react-hot-toast';

interface ReferralCodeGeneratorProps {
  referralCode: string;
  referralLink: string;
}

export const ReferralCodeGenerator: React.FC<ReferralCodeGeneratorProps> = ({
  referralCode,
  referralLink,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const generateQRCode = async () => {
    try {
      const url = await QRCodeLib.toDataURL(referralLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
      setShowQR(true);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const shareText = `Join me on this amazing platform and earn rewards! Use my referral code: ${referralCode}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Your Referral Code
      </h3>
      
      <div className="space-y-4">
        {/* Referral Code */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 font-mono text-lg font-bold text-center text-gray-900 dark:text-white">
            {referralCode}
          </div>
          <button
            onClick={() => copyToClipboard(referralCode)}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>

        {/* Referral Link */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 truncate">
            {referralLink}
          </div>
          <button
            onClick={() => copyToClipboard(referralLink)}
            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Copy size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateQRCode}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <QrCode size={16} />
            <span>QR Code</span>
          </button>

          <TwitterShareButton
            url={referralLink}
            title={shareText}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Share2 size={16} />
            <span>Twitter</span>
          </TwitterShareButton>

          <TelegramShareButton
            url={referralLink}
            title={shareText}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <Share2 size={16} />
            <span>Telegram</span>
          </TelegramShareButton>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                QR Code
              </h4>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="QR Code" className="rounded-lg" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
              Scan this QR code to access your referral link
            </p>
          </div>
        </div>
      )}
    </div>
  );
};