import React, { useState } from 'react';
import { Gift, Loader, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { CONTRACT_CONFIG } from '../config/contracts';
import toast from 'react-hot-toast';

export const ReferralInput: React.FC = () => {
  const [referralCode, setReferralCode] = useState('');
  const { processReferral, loading, contractsDeployed } = useContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractsDeployed) {
      toast.error('Smart contracts not connected');
      return;
    }
    
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    const success = await processReferral(referralCode.trim());
    if (success) {
      setReferralCode('');
    }
  };

  const openContractInExplorer = () => {
    window.open(`${CONTRACT_CONFIG.blockExplorer}/address/${CONTRACT_CONFIG.referralSystemAddress}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <Gift className="mr-2" size={24} />
        Enter Referral Code
        {contractsDeployed && (
          <span className="ml-2 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
            Live Contract
          </span>
        )}
      </h3>
      
      {/* Contract Status */}
      {contractsDeployed ? (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                Smart Contracts Connected ✅
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Your referral system is live on Sepolia testnet! Real REFT tokens will be distributed.
              </p>
              <button
                onClick={openContractInExplorer}
                className="inline-flex items-center space-x-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                <span>View Contract</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Connecting to Smart Contracts...
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Checking contract deployment at the configured addresses. Make sure you're connected to Sepolia testnet.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Referral Code
          </label>
          <input
            type="text"
            id="referralCode"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter referral code (e.g., REF_ABC123)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={loading || !contractsDeployed}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !referralCode.trim() || !contractsDeployed}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
        >
          {loading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <Gift size={20} />
          )}
          <span>
            {loading 
              ? 'Processing...' 
              : !contractsDeployed 
                ? 'Connecting to Contracts...' 
                : 'Use Referral Code'
            }
          </span>
        </button>
      </form>
      
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>How it works:</strong> {contractsDeployed 
            ? "Enter a referral code from an existing user to earn real REFT tokens for both you and the referrer! Note: Backend integration is required for referral code mapping."
            : "Once contracts are connected, you'll be able to use referral codes to earn real REFT tokens!"
          }
        </p>
      </div>
    </div>
  );
};