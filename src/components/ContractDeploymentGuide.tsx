import React, { useState } from 'react';
import { 
  Rocket, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Wallet
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_CONFIG } from '../config/contracts';
import toast from 'react-hot-toast';

export const ContractDeploymentGuide: React.FC = () => {
  const { address } = useWallet();
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

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

  const deploymentSteps = [
    {
      id: 'sepolia-eth',
      title: 'Get Sepolia ETH',
      description: 'You need testnet ETH for gas fees',
      action: 'Get Free ETH',
      link: 'https://sepoliafaucet.com/',
      estimate: '2 minutes'
    },
    {
      id: 'remix-setup',
      title: 'Open Remix IDE',
      description: 'Browser-based Solidity IDE for deployment',
      action: 'Open Remix',
      link: 'https://remix.ethereum.org/',
      estimate: '1 minute'
    },
    {
      id: 'copy-contracts',
      title: 'Copy Smart Contracts',
      description: 'Create new files in Remix and copy the contract code',
      copyText: `// Copy ReferralToken.sol and ReferralSystem.sol from /contracts/ folder`,
      estimate: '3 minutes'
    },
    {
      id: 'deploy-token',
      title: 'Deploy ReferralToken',
      description: 'Deploy the ERC20 token contract first',
      copyText: address || 'YOUR_WALLET_ADDRESS',
      estimate: '2 minutes'
    },
    {
      id: 'deploy-system',
      title: 'Deploy ReferralSystem',
      description: 'Deploy the main referral contract',
      copyText: `_tokenAddress: REFERRAL_TOKEN_ADDRESS
_referrerReward: 1000000000000000000000
_refereeReward: 500000000000000000000
_backendWallet: ${address || 'YOUR_WALLET_ADDRESS'}
_minReferralInterval: 3600`,
      estimate: '2 minutes'
    },
    {
      id: 'setup-permissions',
      title: 'Setup Token Permissions',
      description: 'Allow ReferralSystem to mint tokens',
      copyText: 'addMinter(REFERRAL_SYSTEM_ADDRESS)',
      estimate: '1 minute'
    }
  ];

  const envTemplate = `VITE_REFERRAL_SYSTEM_ADDRESS=0xYourDeployedReferralSystemAddress
VITE_REFERRAL_TOKEN_ADDRESS=0xYourDeployedReferralTokenAddress
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Deploy Contracts to Get Real REFT Tokens
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Follow these steps to deploy smart contracts and start earning real tokens
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Status */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Why You're Seeing Mock Data
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                The app is showing placeholder data because smart contracts aren't deployed yet. 
                Once deployed, all data will be real and come from the blockchain.
              </p>
            </div>
          </div>
        </div>

        {/* Deployment Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Deployment Steps
          </h3>
          
          {deploymentSteps.map((step, index) => (
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

        {/* Environment Configuration */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Update .env File
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            After deployment, update your .env file with the contract addresses:
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 relative">
            <code className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre">
              {envTemplate}
            </code>
            <button
              onClick={() => copyToClipboard(envTemplate, 'env')}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {copiedStep === 'env' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* What You'll Get */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            After Deployment You'll Have:
          </h3>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>✅ Real REFT tokens in your wallet</li>
            <li>✅ Functional referral system with actual rewards</li>
            <li>✅ Live blockchain events and transactions</li>
            <li>✅ Real-time leaderboard with actual users</li>
            <li>✅ Authentic platform statistics</li>
          </ul>
        </div>

        {/* Need Help */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Need help with deployment?
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://docs.soliditylang.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
            >
              Solidity Docs
            </a>
            <a
              href="https://remix-ide.readthedocs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
            >
              Remix Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};