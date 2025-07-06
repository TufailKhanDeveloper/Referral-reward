import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface NetworkGuardProps {
  children: React.ReactNode;
}

export const NetworkGuard: React.FC<NetworkGuardProps> = ({ children }) => {
  const { isConnected, isCorrectNetwork, switchToSepolia } = useWallet();

  if (!isConnected) {
    return <>{children}</>;
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Wrong Network
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This application only works on Sepolia testnet. Please switch your network to continue.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={switchToSepolia}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <span>Switch to Sepolia</span>
              </button>
              
              <a
                href="https://sepoliafaucet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                <span>Get Sepolia ETH</span>
                <ExternalLink size={16} />
              </a>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Need Sepolia ETH?</strong> Use the faucet above to get free testnet ETH for gas fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};