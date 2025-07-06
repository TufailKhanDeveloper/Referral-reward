import React, { useState } from 'react';
import { 
  Gift, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles,
  Users,
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';
import { useContract } from '../../hooks/useContract';
import { CONTRACT_CONFIG } from '../../config/contracts';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { StatusBadge } from '../ui/StatusBadge';
import { Tooltip } from '../ui/Tooltip';
import toast from 'react-hot-toast';

export const EnhancedReferralInput: React.FC = () => {
  const [referralCode, setReferralCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { processReferral, loading, contractsDeployed, validateReferralCode } = useContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractsDeployed) {
      toast.error('Smart contracts not connected', {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }
    
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code', {
        duration: 3000,
        icon: '📝',
      });
      return;
    }

    setIsValidating(true);
    const success = await processReferral(referralCode.trim());
    setIsValidating(false);
    
    if (success) {
      setReferralCode('');
    }
  };

  const openContractInExplorer = () => {
    window.open(`${CONTRACT_CONFIG.blockExplorer}/address/${CONTRACT_CONFIG.referralSystemAddress}`, '_blank');
  };

  const isCodeValid = referralCode.trim().length >= 6;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Enter Referral Code
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Use a friend's code to earn rewards together
            </p>
          </div>
        </div>
        {contractsDeployed && (
          <StatusBadge status="success" text="Live Contract" size="sm" />
        )}
      </div>

      {/* Contract Status */}
      {contractsDeployed ? (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                🎉 Smart Contracts Connected!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Your referral system is live on Sepolia testnet. Real REFT tokens will be distributed instantly.
              </p>
              <Tooltip content="View contract on Etherscan">
                <button
                  onClick={openContractInExplorer}
                  className="inline-flex items-center space-x-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                >
                  <span>View Contract</span>
                  <ExternalLink size={12} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Connecting to Smart Contracts...
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Checking contract deployment at the configured addresses. Make sure you're connected to Sepolia testnet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Demo Codes Info */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
        <div className="flex items-start space-x-3">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Demo Referral Codes
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Try these demo codes to test the referral system:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono text-blue-800 dark:text-blue-200">
                REF_ABC123
              </code>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono text-blue-800 dark:text-blue-200">
                REF_DEF456
              </code>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono text-blue-800 dark:text-blue-200">
                REF_GHI789
              </code>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-mono text-blue-800 dark:text-blue-200">
                REF_JKL012
              </code>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              In production, referral codes would be managed by a backend service.
            </p>
          </div>
        </div>
      </div>

      {/* Referral Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Referral Code
          </label>
          <div className="relative">
            <input
              type="text"
              id="referralCode"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code (e.g., REF_ABC123)"
              className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm sm:text-base ${
                referralCode && isCodeValid 
                  ? 'border-green-300 dark:border-green-600' 
                  : referralCode && !isCodeValid
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={loading || isValidating || !contractsDeployed}
            />
            {referralCode && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCodeValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {referralCode && !isCodeValid && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Referral code must be at least 6 characters long
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || isValidating || !referralCode.trim() || !contractsDeployed || !isCodeValid}
          className="w-full flex items-center justify-center space-x-3 px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 text-sm sm:text-base"
        >
          {loading || isValidating ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="sm:w-5 sm:h-5" />
              <span>
                {!contractsDeployed 
                  ? 'Connecting to Contracts...' 
                  : 'Use Referral Code'
                }
              </span>
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </>
          )}
        </button>
      </form>

      {/* How it Works Section */}
      <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-semibold text-blue-800 dark:text-blue-200">
            How Referrals Work
          </h4>
        </div>
        
        <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <p>
              <strong>Enter a referral code</strong> from an existing user to join the platform
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <p>
              <strong>Both you and the referrer earn REFT tokens</strong> instantly upon successful referral
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <p>
              <strong>Start referring others</strong> using your own code to earn even more rewards
            </p>
          </div>
        </div>

        {contractsDeployed && (
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-600">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                <strong>How it works:</strong> Referral codes are validated through the system. 
                When someone uses your code, both parties receive REFT tokens instantly via smart contract.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};