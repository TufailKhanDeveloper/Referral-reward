import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types';
import { CONTRACT_CONFIG, SEPOLIA_CHAIN_CONFIG } from '../config/contracts';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
    isCorrectNetwork: false,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const isCorrectNetwork = useCallback((chainId: number) => {
    return chainId === CONTRACT_CONFIG.chainId;
  }, []);

  const addSepoliaNetwork = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [SEPOLIA_CHAIN_CONFIG],
      });
      return true;
    } catch (error: any) {
      console.error('Error adding Sepolia network:', error);
      toast.error('Failed to add Sepolia network');
      return false;
    }
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_CONFIG.chainId }],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, try to add it
        return await addSepoliaNetwork();
      } else {
        console.error('Error switching to Sepolia:', error);
        toast.error('Failed to switch to Sepolia network');
        return false;
      }
    }
  }, [addSepoliaNetwork]);

  const checkConnection = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          const correctNetwork = isCorrectNetwork(chainId);
          
          if (correctNetwork) {
            const signer = await provider.getSigner();
            
            setWalletState({
              isConnected: true,
              address: accounts[0].address,
              chainId,
              isConnecting: false,
              error: null,
              isCorrectNetwork: true,
            });
            
            setProvider(provider);
            setSigner(signer);
          } else {
            setWalletState(prev => ({
              ...prev,
              isConnected: true,
              address: accounts[0].address,
              chainId,
              isCorrectNetwork: false,
              error: 'Please switch to Sepolia testnet',
            }));
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  }, [isCorrectNetwork]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use this application');
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      if (!isCorrectNetwork(chainId)) {
        const switched = await switchToSepolia();
        if (!switched) {
          setWalletState(prev => ({
            ...prev,
            isConnecting: false,
            error: 'Please switch to Sepolia testnet',
          }));
          return;
        }
        // Re-check after switching
        await checkConnection();
        return;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletState({
        isConnected: true,
        address,
        chainId,
        isConnecting: false,
        error: null,
        isCorrectNetwork: true,
      });

      setProvider(provider);
      setSigner(signer);
      
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, [isCorrectNetwork, switchToSepolia, checkConnection]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      isConnecting: false,
      error: null,
      isCorrectNetwork: false,
    });
    setProvider(null);
    setSigner(null);
    toast.success('Wallet disconnected');
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = () => {
        checkConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection, disconnectWallet]);

  return {
    ...walletState,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  };
};