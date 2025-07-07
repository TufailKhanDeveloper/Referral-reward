import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, REFERRAL_SYSTEM_ABI, REFERRAL_TOKEN_ABI, CONTRACT_ERROR_MESSAGES, decodeErrorBySelector } from '../config/contracts';
import { User, Referral, LeaderboardEntry, PlatformStats, ContractEvent } from '../types';
import { useWallet } from './useWallet';
import toast from 'react-hot-toast';

export const useContract = () => {
  const { provider, signer, address, isConnected, isCorrectNetwork } = useWallet();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [contractsDeployed, setContractsDeployed] = useState(false);
  const [frontendMode, setFrontendMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const eventListenersRef = useRef<{ [key: string]: any }>({});
  const contractCheckRef = useRef<boolean>(false);
  const toastShownRef = useRef<Set<string>>(new Set());

  // Enhanced error handling function with better decoding
  const handleContractError = useCallback((error: any): string => {
    console.error('Contract error details:', error);
    
    // Try to decode error by selector first
    if (error.data) {
      const decodedMessage = decodeErrorBySelector(error.data);
      if (decodedMessage) {
        return decodedMessage;
      }
    }
    
    // Try to decode using contract interface
    if (error.data) {
      try {
        const contract = getReferralSystemContract();
        if (contract) {
          const decodedError = contract.interface.parseError(error.data);
          if (decodedError) {
            const errorName = decodedError.name;
            const userMessage = CONTRACT_ERROR_MESSAGES[errorName];
            if (userMessage) {
              return userMessage;
            }
            return `Contract error: ${errorName}`;
          }
        }
      } catch (decodeError) {
        console.warn('Could not decode custom error:', decodeError);
      }
    }

    // Check for known error patterns in the message
    const errorMessage = error.message || error.reason || '';
    
    // Check for specific error patterns
    for (const [errorType, userMessage] of Object.entries(CONTRACT_ERROR_MESSAGES)) {
      if (errorMessage.includes(errorType)) {
        return userMessage;
      }
    }

    // Handle common transaction errors
    if (errorMessage.includes('user rejected')) {
      return 'Transaction was cancelled by user';
    }
    
    if (errorMessage.includes('insufficient funds')) {
      return 'Insufficient funds for gas fees. Please add more Sepolia ETH to your wallet.';
    }
    
    if (errorMessage.includes('nonce too high') || errorMessage.includes('nonce too low')) {
      return 'Transaction nonce error. Please try again.';
    }
    
    if (errorMessage.includes('gas')) {
      return 'Transaction failed due to gas issues. Please try again with higher gas limit.';
    }

    if (errorMessage.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }

    // Default error message
    return 'Transaction failed. Please try again.';
  }, []);

  // Check if contracts are deployed and get modes
  useEffect(() => {
    const checkContracts = async () => {
      if (!provider || !isCorrectNetwork || contractCheckRef.current) return;
      
      contractCheckRef.current = true;
      
      try {
        const systemCode = await provider.getCode(CONTRACT_CONFIG.referralSystemAddress);
        const tokenCode = await provider.getCode(CONTRACT_CONFIG.referralTokenAddress);
        
        const deployed = systemCode !== '0x' && tokenCode !== '0x';
        setContractsDeployed(deployed);
        
        if (deployed) {
          // Check contract modes
          const contract = new ethers.Contract(
            CONTRACT_CONFIG.referralSystemAddress,
            REFERRAL_SYSTEM_ABI,
            provider
          );
          
          try {
            const [isFrontendMode, isDemoMode] = await Promise.all([
              contract.frontendMode(),
              contract.demoMode()
            ]);
            
            setFrontendMode(isFrontendMode);
            setDemoMode(isDemoMode);
            
            console.log('✅ Contracts successfully detected at:');
            console.log('ReferralSystem:', CONTRACT_CONFIG.referralSystemAddress);
            console.log('ReferralToken:', CONTRACT_CONFIG.referralTokenAddress);
            console.log('Frontend Mode:', isFrontendMode ? 'Enabled' : 'Disabled');
            console.log('Demo Mode:', isDemoMode ? 'Enabled' : 'Disabled');
            
            const toastKey = 'contracts-connected';
            if (!toastShownRef.current.has(toastKey)) {
              toast.success(`Smart contracts connected! Demo codes available: ${isDemoMode ? 'Yes' : 'No'}`, {
                duration: 3000,
                icon: '🎉',
                id: toastKey,
              });
              toastShownRef.current.add(toastKey);
            }
          } catch (error) {
            console.warn('Could not check contract modes:', error);
            setFrontendMode(false);
            setDemoMode(false);
          }
        } else {
          const toastKey = 'contracts-not-found';
          if (!toastShownRef.current.has(toastKey)) {
            console.warn('❌ Contracts not found at specified addresses');
            toast.error('Smart contracts not found at specified addresses', {
              duration: 5000,
              icon: '⚠️',
              id: toastKey,
            });
            toastShownRef.current.add(toastKey);
          }
        }
      } catch (error) {
        console.error('Error checking contract deployment:', error);
        setContractsDeployed(false);
        const toastKey = 'contracts-error';
        if (!toastShownRef.current.has(toastKey)) {
          toast.error('Error connecting to smart contracts', {
            duration: 5000,
            icon: '❌',
            id: toastKey,
          });
          toastShownRef.current.add(toastKey);
        }
      }
    };

    checkContracts();
  }, [provider, isCorrectNetwork]);

  // Reset contract check when network changes
  useEffect(() => {
    contractCheckRef.current = false;
    toastShownRef.current.clear();
  }, [isCorrectNetwork]);

  const getReferralSystemContract = useCallback(() => {
    if (!provider || !isCorrectNetwork || !contractsDeployed) return null;
    return new ethers.Contract(
      CONTRACT_CONFIG.referralSystemAddress,
      REFERRAL_SYSTEM_ABI,
      signer || provider
    );
  }, [provider, signer, isCorrectNetwork, contractsDeployed]);

  const getReferralTokenContract = useCallback(() => {
    if (!provider || !isCorrectNetwork || !contractsDeployed) return null;
    return new ethers.Contract(
      CONTRACT_CONFIG.referralTokenAddress,
      REFERRAL_TOKEN_ABI,
      signer || provider
    );
  }, [provider, signer, isCorrectNetwork, contractsDeployed]);

  const generateReferralCode = useCallback((address: string): string => {
    // Generate a deterministic referral code based on address
    const hash = ethers.keccak256(ethers.toUtf8Bytes(address));
    return `REF_${hash.slice(2, 8).toUpperCase()}`;
  }, []);

  // Register referral code on the contract
  const registerReferralCode = useCallback(async (referralCode: string): Promise<boolean> => {
    if (!signer || !address || !contractsDeployed || !frontendMode) return false;
    
    const contract = getReferralSystemContract();
    if (!contract) return false;
    
    try {
      // Check if user already has this code registered
      const existingCode = await contract.getReferralCode(address);
      if (existingCode === referralCode) {
        return true; // Already registered
      }
      
      // Estimate gas with higher limit
      const gasEstimate = await contract.registerReferralCode.estimateGas(referralCode);
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer
      
      const tx = await contract.registerReferralCode(referralCode, {
        gasLimit: gasLimit
      });
      await tx.wait();
      
      toast.success('Referral code registered successfully!', {
        duration: 3000,
        icon: '✅',
      });
      
      return true;
    } catch (error) {
      console.error('Error registering referral code:', error);
      const errorMessage = handleContractError(error);
      toast.error(`Failed to register referral code: ${errorMessage}`, {
        duration: 4000,
        icon: '❌',
      });
      return false;
    }
  }, [signer, address, contractsDeployed, frontendMode, getReferralSystemContract, handleContractError]);

  // Enhanced referral code validation service
  const validateReferralCode = useCallback(async (code: string): Promise<{ valid: boolean; referrerAddress?: string; isDemoCode?: boolean }> => {
    // Input validation
    if (!code || typeof code !== 'string') {
      return { valid: false };
    }

    // Format validation
    const codeRegex = /^REF_[A-F0-9]{6}$/;
    if (!codeRegex.test(code.trim().toUpperCase())) {
      return { valid: false };
    }

    const normalizedCode = code.trim().toUpperCase();

    // If contracts are deployed, check the contract
    if (contractsDeployed) {
      const contract = getReferralSystemContract();
      if (contract) {
        try {
          const [referrerAddress, isDemoCodeResult] = await Promise.all([
            contract.getReferrerFromCode(normalizedCode),
            contract.isDemoCode(normalizedCode)
          ]);
          
          if (referrerAddress && referrerAddress !== ethers.ZeroAddress) {
            return { 
              valid: true, 
              referrerAddress, 
              isDemoCode: isDemoCodeResult 
            };
          }
        } catch (error) {
          console.error('Error validating referral code on contract:', error);
        }
      }
    }

    return { valid: false };
  }, [contractsDeployed, getReferralSystemContract]);

  const getUserData = useCallback(async (userAddress: string): Promise<User | null> => {
    const contract = getReferralSystemContract();
    const referralCode = generateReferralCode(userAddress);
    
    // Auto-register referral code if frontend mode is enabled
    if (contract && frontendMode && signer && userAddress === address) {
      registerReferralCode(referralCode);
    }
    
    if (!contract) {
      return {
        address: userAddress,
        referralCode,
        totalReferrals: 0,
        totalRewards: '0',
        pendingRewards: '0',
        isReferred: false,
        lastReferralTime: 0,
        isEligible: true,
      };
    }

    try {
      const [
        [totalRefs, totalRewards, lastReferral, isReferred],
        isEligible
      ] = await Promise.all([
        contract.getUserStats(userAddress),
        contract.isEligibleForReferral(userAddress)
      ]);
      
      return {
        address: userAddress,
        referralCode,
        totalReferrals: Number(totalRefs),
        totalRewards: ethers.formatEther(totalRewards),
        pendingRewards: '0',
        isReferred,
        lastReferralTime: Number(lastReferral),
        isEligible,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      const errorMessage = handleContractError(error);
      const toastKey = `user-data-error-${userAddress}`;
      if (!toastShownRef.current.has(toastKey)) {
        toast.error(`Error fetching user data: ${errorMessage}`, {
          duration: 4000,
          icon: '⚠️',
          id: toastKey,
        });
        toastShownRef.current.add(toastKey);
      }
      return null;
    }
  }, [getReferralSystemContract, generateReferralCode, frontendMode, signer, address, registerReferralCode, handleContractError]);

  // Function to check and fund contract if needed
  const checkAndFundContract = useCallback(async (): Promise<boolean> => {
    if (!signer || !address || !contractsDeployed) return false;

    const systemContract = getReferralSystemContract();
    const tokenContract = getReferralTokenContract();
    
    if (!systemContract || !tokenContract) return false;

    try {
      const [contractBalance, [refReward, reeReward], userBalance] = await Promise.all([
        systemContract.getContractBalance(),
        systemContract.getRewardConfig(),
        tokenContract.balanceOf(address)
      ]);

      const totalRewardNeeded = refReward + reeReward;
      
      // If contract doesn't have enough tokens, try to fund it
      if (contractBalance < totalRewardNeeded) {
        console.log('Contract needs funding. Checking user balance...');
        
        if (userBalance >= totalRewardNeeded * BigInt(10)) { // User has at least 10x the reward amount
          const fundingToastId = toast.loading('Contract needs tokens for rewards. Funding contract...', {
            icon: '💰',
          });

          try {
            // Transfer tokens to contract
            const transferAmount = totalRewardNeeded * BigInt(50); // Fund with 50x reward amount
            const gasEstimate = await tokenContract.transfer.estimateGas(CONTRACT_CONFIG.referralSystemAddress, transferAmount);
            const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer
            
            const tx = await tokenContract.transfer(CONTRACT_CONFIG.referralSystemAddress, transferAmount, {
              gasLimit: gasLimit
            });
            await tx.wait();

            toast.success('Contract funded successfully! You can now process referrals.', {
              duration: 5000,
              icon: '✅',
              id: fundingToastId,
            });
            
            return true;
          } catch (error) {
            console.error('Error funding contract:', error);
            toast.error('Failed to fund contract. Please try manually transferring tokens.', {
              duration: 5000,
              icon: '❌',
              id: fundingToastId,
            });
            return false;
          }
        } else {
          toast.error('Contract needs tokens for rewards, but you don\'t have enough tokens to fund it.', {
            duration: 5000,
            icon: '💰',
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking contract funding:', error);
      return false;
    }
  }, [signer, address, contractsDeployed, getReferralSystemContract, getReferralTokenContract]);

  const processReferral = useCallback(async (referralCode: string): Promise<boolean> => {
    if (!signer || !address || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Sepolia network', {
        duration: 4000,
        icon: '🔗',
        id: 'wallet-not-connected',
      });
      return false;
    }

    const contract = getReferralSystemContract();
    if (!contract) {
      toast.error('Smart contracts not available', {
        duration: 4000,
        icon: '⚠️',
        id: 'contracts-not-available',
      });
      return false;
    }

    setLoading(true);
    
    try {
      // Validate referral code
      const validation = await validateReferralCode(referralCode);
      if (!validation.valid || !validation.referrerAddress) {
        toast.error('Invalid referral code. Please check the code and try again, or use one of the demo codes.', {
          duration: 5000,
          icon: '❌',
          id: 'invalid-referral-code',
        });
        return false;
      }

      const referrerAddress = validation.referrerAddress;

      if (referrerAddress.toLowerCase() === address.toLowerCase()) {
        toast.error('You cannot refer yourself!', {
          duration: 4000,
          icon: '🚫',
          id: 'self-referral',
        });
        return false;
      }

      // Pre-flight checks
      const [hasBeenReferred, isPaused] = await Promise.all([
        contract.hasBeenReferred(address),
        contract.paused()
      ]);

      if (isPaused) {
        toast.error('Referral system is currently paused. Please try again later.', {
          duration: 4000,
          icon: '⏸️',
          id: 'system-paused',
        });
        return false;
      }

      if (hasBeenReferred) {
        toast.error('You have already been referred by someone else!', {
          duration: 4000,
          icon: '⚠️',
          id: 'already-referred',
        });
        return false;
      }

      // Check and fund contract if needed
      const contractFunded = await checkAndFundContract();
      if (!contractFunded) {
        return false;
      }

      const processingToastId = toast.loading('Processing referral...', {
        icon: '⏳',
      });

      let tx;
      
      try {
        // Use the appropriate function based on frontend mode
        if (frontendMode) {
          // Use referral code directly with higher gas limit
          const gasEstimate = await contract.processReferralByCode.estimateGas(referralCode);
          const gasLimit = gasEstimate * BigInt(150) / BigInt(100); // Add 50% buffer for complex operations
          
          tx = await contract.processReferralByCode(referralCode, {
            gasLimit: gasLimit
          });
        } else {
          // Use addresses (requires backend role) with higher gas limit
          const gasEstimate = await contract.processReferral.estimateGas(address, referrerAddress);
          const gasLimit = gasEstimate * BigInt(150) / BigInt(100); // Add 50% buffer
          
          tx = await contract.processReferral(address, referrerAddress, {
            gasLimit: gasLimit
          });
        }
      } catch (gasError) {
        console.error('Gas estimation failed, trying with fixed gas limit:', gasError);
        
        // Fallback to fixed gas limit if estimation fails
        if (frontendMode) {
          tx = await contract.processReferralByCode(referralCode, {
            gasLimit: 500000 // Fixed gas limit
          });
        } else {
          tx = await contract.processReferral(address, referrerAddress, {
            gasLimit: 500000 // Fixed gas limit
          });
        }
      }
      
      toast.loading('Waiting for transaction confirmation...', {
        id: processingToastId,
        icon: '⛓️',
      });
      
      const receipt = await tx.wait();
      
      const rewardMessage = validation.isDemoCode 
        ? `Referral processed successfully! 🎉\nYou earned 500 REFT tokens!\n(Demo referral - referrer gets virtual rewards)`
        : `Referral processed successfully! 🎉\nYou earned 500 REFT tokens!\nReferrer earned 1000 REFT tokens!`;
      
      toast.success(rewardMessage, {
        duration: 6000,
        icon: '🎊',
        id: processingToastId,
      });

      // Refresh user data
      if (address) {
        getUserData(address).then(setUser);
      }

      return true;
      
    } catch (error: any) {
      console.error('Error processing referral:', error);
      const errorMessage = handleContractError(error);
      
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
        id: 'referral-error',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [signer, address, isCorrectNetwork, getReferralSystemContract, validateReferralCode, getUserData, handleContractError, frontendMode, checkAndFundContract]);

  const getReferralHistory = useCallback(async (userAddress: string): Promise<Referral[]> => {
    const contract = getReferralSystemContract();
    if (!contract) return [];

    try {
      const referrals = await contract.getReferrals(userAddress);
      return referrals.map((ref: any) => ({
        referee: ref.referee,
        referrer: ref.referrer,
        timestamp: Number(ref.timestamp),
        referrerReward: ethers.formatEther(ref.referrerReward),
        refereeReward: ethers.formatEther(ref.refereeReward),
      }));
    } catch (error) {
      console.error('Error fetching referral history:', error);
      return [];
    }
  }, [getReferralSystemContract]);

  const getTokenBalance = useCallback(async (userAddress: string): Promise<string> => {
    const contract = getReferralTokenContract();
    if (!contract) return '0';

    try {
      const balance = await contract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  }, [getReferralTokenContract]);

  const getLeaderboard = useCallback(async (): Promise<LeaderboardEntry[]> => {
    if (!contractsDeployed) {
      return [];
    }
    
    try {
      const contract = getReferralSystemContract();
      if (!contract) return [];
      
      // Query recent events to build a basic leaderboard
      const filter = contract.filters.ReferralProcessed();
      const events = await contract.queryFilter(filter, -10000); // Last 10k blocks
      
      // Process events to create leaderboard
      const referrerStats: { [address: string]: { count: number; rewards: bigint } } = {};
      
      for (const event of events) {
        const referrer = event.args?.[1];
        if (referrer) {
          if (!referrerStats[referrer]) {
            referrerStats[referrer] = { count: 0, rewards: BigInt(0) };
          }
          referrerStats[referrer].count++;
          // Estimate rewards (1000 REFT per referral)
          referrerStats[referrer].rewards += ethers.parseEther('1000');
        }
      }
      
      // Convert to leaderboard format
      const leaderboard = Object.entries(referrerStats)
        .map(([address, stats]) => ({
          address,
          referralCount: stats.count,
          totalRewards: ethers.formatEther(stats.rewards),
          rank: 0,
        }))
        .sort((a, b) => b.referralCount - a.referralCount)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
      
      return leaderboard.slice(0, 10); // Top 10
    } catch (error) {
      console.error('Error building leaderboard:', error);
      return [];
    }
  }, [contractsDeployed, getReferralSystemContract]);

  const getPlatformStats = useCallback(async (): Promise<PlatformStats> => {
    const contract = getReferralSystemContract();
    if (!contract) {
      return {
        totalUsers: 0,
        totalReferrals: 0,
        totalRewardsDistributed: '0',
        activeUsers24h: 0,
        contractBalance: '0',
      };
    }

    try {
      const contractBalance = await contract.getContractBalance();
      
      // Query events to get real stats
      const referralFilter = contract.filters.ReferralProcessed();
      const rewardFilter = contract.filters.RewardsDistributed();
      
      const [referralEvents, rewardEvents] = await Promise.all([
        contract.queryFilter(referralFilter, -10000),
        contract.queryFilter(rewardFilter, -10000),
      ]);
      
      // Calculate unique users
      const uniqueUsers = new Set();
      referralEvents.forEach(event => {
        if (event.args) {
          uniqueUsers.add(event.args[0]); // referee
          uniqueUsers.add(event.args[1]); // referrer
        }
      });
      
      // Calculate total rewards
      let totalRewards = BigInt(0);
      rewardEvents.forEach(event => {
        if (event.args) {
          totalRewards += BigInt(event.args[1]);
        }
      });
      
      // Calculate active users in last 24h
      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
      const recentEvents = referralEvents.filter(event => {
        return event.args && Number(event.args[2]) > oneDayAgo;
      });
      
      const activeUsers = new Set();
      recentEvents.forEach(event => {
        if (event.args) {
          activeUsers.add(event.args[0]);
          activeUsers.add(event.args[1]);
        }
      });
      
      return {
        totalUsers: uniqueUsers.size,
        totalReferrals: referralEvents.length,
        totalRewardsDistributed: ethers.formatEther(totalRewards),
        activeUsers24h: activeUsers.size,
        contractBalance: ethers.formatEther(contractBalance),
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {
        totalUsers: 0,
        totalReferrals: 0,
        totalRewardsDistributed: '0',
        activeUsers24h: 0,
        contractBalance: '0',
      };
    }
  }, [getReferralSystemContract]);

  // Set up real-time event listeners
  useEffect(() => {
    const contract = getReferralSystemContract();
    if (!contract || !isConnected || !isCorrectNetwork) return;

    console.log('🔄 Setting up real-time event listeners...');

    // Clean up existing listeners
    Object.values(eventListenersRef.current).forEach(listener => {
      if (listener && typeof listener.removeAllListeners === 'function') {
        listener.removeAllListeners();
      }
    });

    // Set up new listeners
    const referralProcessedListener = contract.on('ReferralProcessed', (referee, referrer, timestamp, event) => {
      console.log('🎉 ReferralProcessed event:', { referee, referrer, timestamp });
      
      if (address && (referee === address || referrer === address)) {
        getUserData(address).then(setUser);
        
        const eventToastKey = `referral-event-${event.transactionHash}`;
        if (!toastShownRef.current.has(eventToastKey)) {
          if (referee === address) {
            toast.success('Welcome! You earned 500 REFT tokens! 🎊', {
              duration: 6000,
              icon: '🎁',
              id: eventToastKey,
            });
          } else {
            toast.success('New referral! You earned 1000 REFT tokens! 🎉', {
              duration: 6000,
              icon: '💰',
              id: eventToastKey,
            });
          }
          toastShownRef.current.add(eventToastKey);
        }
      }
      
      setEvents(prev => [...prev, {
        event: 'ReferralProcessed',
        args: [referee, referrer, timestamp],
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      }]);
    });

    const rewardsDistributedListener = contract.on('RewardsDistributed', (user, amount, referralType, event) => {
      console.log('💰 RewardsDistributed event:', { user, amount, referralType });
      
      if (address && user === address) {
        getUserData(address).then(setUser);
      }
      
      setEvents(prev => [...prev, {
        event: 'RewardsDistributed',
        args: [user, amount, referralType],
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      }]);
    });

    eventListenersRef.current = {
      referralProcessed: referralProcessedListener,
      rewardsDistributed: rewardsDistributedListener,
    };

    console.log('✅ Event listeners set up successfully');

    return () => {
      console.log('🧹 Cleaning up event listeners');
      Object.values(eventListenersRef.current).forEach(listener => {
        if (listener && typeof listener.removeAllListeners === 'function') {
          listener.removeAllListeners();
        }
      });
    };
  }, [getReferralSystemContract, isConnected, isCorrectNetwork, address, getUserData]);

  // Load user data when wallet connects
  useEffect(() => {
    if (isConnected && address && isCorrectNetwork) {
      getUserData(address).then(setUser);
    } else {
      setUser(null);
    }
  }, [isConnected, address, isCorrectNetwork, getUserData]);

  return {
    loading,
    user,
    events,
    contractsDeployed,
    frontendMode,
    demoMode,
    generateReferralCode,
    processReferral,
    getReferralHistory,
    getTokenBalance,
    getLeaderboard,
    getPlatformStats,
    getUserData,
    validateReferralCode,
    handleContractError,
    registerReferralCode,
    checkAndFundContract,
  };
};