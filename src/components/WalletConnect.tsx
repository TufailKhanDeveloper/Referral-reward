import React from 'react';
import { Wallet, LogOut, AlertCircle, ExternalLink } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_CONFIG } from '../config/contracts';

export const WalletConnect: React.FC = () => {
  const { 
    isConnected, 
    address, 
    chainId, 
    isConnecting, 
    error, 
    isCorrectNetwork,
    connectWallet, 
    disconnectWallet, 
    switchToSepolia 
  } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const openInExplorer = () => {
    if (address) {
      window.open(`${CONTRACT_CONFIG.blockExplorer}/address/${address}`, '_blank');
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatAddress(address)}
            </span>
            <button
              onClick={openInExplorer}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hidden sm:block"
            >
              <ExternalLink size={14} />
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isCorrectNetwork ? 'Sepolia Testnet' : `Chain ${chainId}`}
          </div>
        </div>
        
        {!isCorrectNetwork && (
          <button
            onClick={switchToSepolia}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
          >
            <AlertCircle size={16} />
            <span className="hidden sm:inline">Switch to Sepolia</span>
            <span className="sm:hidden">Switch</span>
          </button>
        )}
        
        <button
          onClick={disconnectWallet}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
      >
        <Wallet size={18} className="sm:w-5 sm:h-5" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 max-w-xs">
          <AlertCircle size={16} />
          <span className="text-sm text-center">{error}</span>
        </div>
      )}
      
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-xs">
        <p>This app only works on Sepolia testnet</p>
        <p>Make sure you have SepoliaETH for gas fees</p>
      </div>
    </div>
  );
};