import React, { useState } from 'react';
import { 
  Rocket, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Wallet,
  DollarSign,
  Settings,
  Zap
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { CONTRACT_CONFIG } from '../config/contracts';
import toast from 'react-hot-toast';

export const ContractSetupGuide: React.FC = () => {
  const { address } = useWallet();
  const { contractsDeployed, checkAndFundContract } = useContract();
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isAutoFunding, setIsAutoFunding] = useState(false);

  const copyToClipboard = async (text: string, stepId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStep(stepId);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedStep(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const handleAutoFund = async () => {
    setIsAutoFunding(true);
    try {
      const success = await checkAndFundContract();
      if (success) {
        toast.success('Contract funded successfully!', {
          duration: 5000,
          icon: '✅',
        });
        markStepComplete('fund-contract');
      }
    } catch (error) {
      toast.error('Auto-funding failed. Please try manual funding.', {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setIsAutoFunding(false);
    }
  };

  const setupSteps = [
    {
      id: 'check-balance',
      title: 'Check Your REFT Token Balance',
      description: 'Ensure you have REFT tokens to fund the contract',
      action: 'Check Balance',
      link: `${CONTRACT_CONFIG.blockExplorer}/token/${CONTRACT_CONFIG.referralTokenAddress}?a=${address}`,
      estimate: '1 minute',
      copyText: `Go to: ${CONTRACT_CONFIG.blockExplorer}/token/${CONTRACT_CONFIG.referralTokenAddress}?a=${address}`
    },
    {
      id: 'fund-contract',
      title: 'Fund ReferralSystem Contract',
      description: 'Transfer REFT tokens to the contract for reward distribution',
      action: 'Auto Fund',
      estimate: '2 minutes',
      copyText: `Contract Address: ${CONTRACT_CONFIG.referralSystemAddress}
Recommended Amount: 75,000 REFT (50x reward amount)
This ensures the contract can process many referrals`,
      autoAction: true
    },
    {
      id: 'verify-funding',
      title: 'Verify Contract Balance',
      description: 'Check that the contract has sufficient tokens',
      action: 'Check Contract',
      link: `${CONTRACT_CONFIG.blockExplorer}/address/${CONTRACT_CONFIG.referralSystemAddress}`,
      estimate: '1 minute'
    },
    {
      id: 'test-referral',
      title: 'Test Referral System',
      description: 'Use a demo code to test the system',
      estimate: '2 minutes',
      copyText: 'Try demo codes: REF_ABC123, REF_DEF456, REF_GHI789'
    }
  ];

  const manualFundingSteps = [
    {
      step: 1,
      title: 'Open ReferralToken Contract',
      description: 'Go to the token contract on Etherscan',
      link: `${CONTRACT_CONFIG.blockExplorer}/address/${CONTRACT_CONFIG.referralTokenAddress}#writeContract`
    },
    {
      step: 2,
      title: 'Connect Your Wallet',
      description: 'Click "Connect to Web3" and connect MetaMask'
    },
    {
      step: 3,
      title: 'Use Transfer Function',
      description: 'Find the "transfer" function and fill in:',
      details: [
        `to: ${CONTRACT_CONFIG.referralSystemAddress}`,
        'value: 75000000000000000000000 (75,000 REFT in wei)'
      ]
    },
    {
      step: 4,
      title: 'Execute Transaction',
      description: 'Click "Write" and confirm the transaction in MetaMask'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Contract Setup Guide
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Fix the "Contract does not have enough tokens" error
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Issue */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Current Issue: Contract Needs Funding
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                The ReferralSystem contract doesn't have enough REFT tokens to distribute rewards. 
                Each referral requires 1,500 REFT (1,000 for referrer + 500 for referee).
              </p>
            </div>
          </div>
        </div>

        {/* Quick Fix Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Quick Fix: Auto-Fund Contract
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                If you have REFT tokens in your wallet, we can automatically transfer them to the contract.
              </p>
              <button
                onClick={handleAutoFund}
                disabled={isAutoFunding || !contractsDeployed}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {isAutoFunding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Funding Contract...</span>
                  </>
                ) : (
                  <>
                    <DollarSign size={16} />
                    <span>Auto-Fund Contract</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Setup Steps
          </h3>
          
          {setupSteps.map((step, index) => (
            <div
              key={step.id}
              className={`border rounded-lg p-4 transition-colors ${
                completedSteps.has(step.id)
                  ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    completedSteps.has(step.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {completedSteps.has(step.id) ? (
                      <CheckCircle size={16} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {step.title}
                      </h4>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={12} />
                        <span>{step.estimate}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {step.description}
                    </p>
                    
                    {step.copyText && (
                      <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 mb-3">
                        <code className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {step.copyText}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {step.copyText && (
                    <button
                      onClick={() => copyToClipboard(step.copyText!, step.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {copiedStep === step.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  )}
                  
                  {step.autoAction && (
                    <button
                      onClick={handleAutoFund}
                      disabled={isAutoFunding || !contractsDeployed}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm rounded transition-colors"
                    >
                      <DollarSign size={12} />
                      <span>{step.action}</span>
                    </button>
                  )}
                  
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      <span>{step.action}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  
                  <button
                    onClick={() => markStepComplete(step.id)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      completedSteps.has(step.id)
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {completedSteps.has(step.id) ? 'Complete' : 'Mark Done'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Manual Funding Guide */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Manual Funding Guide
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            If auto-funding doesn't work, follow these manual steps:
          </p>
          
          <div className="space-y-3">
            {manualFundingSteps.map((step) => (
              <div key={step.step} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                  {step.details && (
                    <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 list-disc list-inside">
                      {step.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  )}
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-1"
                    >
                      <span>Open Contract</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            After Funding You'll Have:
          </h3>
          <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
            <li>✅ Working referral system with real token rewards</li>
            <li>✅ Automatic reward distribution for referrals</li>
            <li>✅ No more "insufficient tokens" errors</li>
            <li>✅ Smooth user experience for all referrals</li>
          </ul>
        </div>
      </div>
    </div>
  );
};