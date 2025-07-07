import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Loader2,
  ArrowRight,
  Wallet,
  Target,
  Zap
} from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_CONFIG } from '../config/contracts';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export const ContractFundingHelper: React.FC = () => {
  const { address, signer } = useWallet();
  const { getReferralTokenContract, getReferralSystemContract, contractsDeployed } = useContract();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [balances, setBalances] = useState({
    userBalance: '0',
    contractBalance: '0',
    requiredAmount: '1500'
  });
  const [fundingStatus, setFundingStatus] = useState<'checking' | 'needed' | 'sufficient' | 'error'>('checking');

  // Check balances and funding status
  const checkFundingStatus = async () => {
    if (!contractsDeployed || !address) return;

    setChecking(true);
    try {
      const tokenContract = getReferralTokenContract();
      const systemContract = getReferralSystemContract();
      
      if (!tokenContract || !systemContract) return;

      const [userBalance, contractBalance, rewardConfig] = await Promise.all([
        tokenContract.balanceOf(address),
        systemContract.getContractBalance(),
        systemContract.getRewardConfig()
      ]);

      const [referrerReward, refereeReward] = rewardConfig;
      const totalRewardNeeded = referrerReward + refereeReward;

      setBalances({
        userBalance: ethers.formatEther(userBalance),
        contractBalance: ethers.formatEther(contractBalance),
        requiredAmount: ethers.formatEther(totalRewardNeeded)
      });

      // Determine funding status
      if (contractBalance >= totalRewardNeeded * BigInt(10)) {
        setFundingStatus('sufficient');
      } else if (userBalance >= totalRewardNeeded * BigInt(50)) {
        setFundingStatus('needed');
      } else {
        setFundingStatus('error');
      }
    } catch (error) {
      console.error('Error checking funding status:', error);
      setFundingStatus('error');
    } finally {
      setChecking(false);
    }
  };

  // Auto-fund the contract
  const autoFundContract = async () => {
    if (!signer || !address || !contractsDeployed) return;

    setLoading(true);
    const fundingToastId = toast.loading('Funding contract with REFT tokens...', {
      icon: '💰',
    });

    try {
      const tokenContract = getReferralTokenContract();
      const systemContract = getReferralSystemContract();
      
      if (!tokenContract || !systemContract) {
        throw new Error('Contracts not available');
      }

      // Get reward configuration
      const [referrerReward, refereeReward] = await systemContract.getRewardConfig();
      const totalRewardNeeded = referrerReward + refereeReward;
      
      // Fund with 50x the reward amount (75,000 REFT for 1,500 REFT per referral)
      const fundingAmount = totalRewardNeeded * BigInt(50);
      
      toast.loading(`Transferring ${ethers.formatEther(fundingAmount)} REFT tokens to contract...`, {
        id: fundingToastId,
        icon: '⏳',
      });

      // Estimate gas and add buffer
      const gasEstimate = await tokenContract.transfer.estimateGas(
        CONTRACT_CONFIG.referralSystemAddress, 
        fundingAmount
      );
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // 20% buffer

      // Execute transfer
      const tx = await tokenContract.transfer(
        CONTRACT_CONFIG.referralSystemAddress, 
        fundingAmount,
        { gasLimit }
      );

      toast.loading('Waiting for transaction confirmation...', {
        id: fundingToastId,
        icon: '⛓️',
      });

      await tx.wait();

      toast.success(`Successfully funded contract with ${ethers.formatEther(fundingAmount)} REFT tokens! 🎉`, {
        duration: 6000,
        icon: '✅',
        id: fundingToastId,
      });

      // Refresh status
      await checkFundingStatus();

    } catch (error: any) {
      console.error('Error funding contract:', error);
      
      let errorMessage = 'Failed to fund contract';
      if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      }

      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
        id: fundingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

  // Check status on component mount and when contracts change
  useEffect(() => {
    checkFundingStatus();
  }, [contractsDeployed, address]);

  const openEtherscan = (address: string) => {
    window.open(`${CONTRACT_CONFIG.blockExplorer}/address/${address}`, '_blank');
  };

  if (!contractsDeployed) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Smart Contracts Not Connected
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
              Please ensure you're connected to Sepolia testnet and contracts are deployed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Contract Funding Status
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Ensure the contract has enough tokens for rewards
              </p>
            </div>
          </div>
          
          <button
            onClick={checkFundingStatus}
            disabled={checking}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
            <span>Refresh</span>
          </button>
        </div>

        {/* Balance Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Your Balance</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {parseFloat(balances.userBalance).toLocaleString()} REFT
            </p>
            <button
              onClick={() => openEtherscan(address!)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 mt-1"
            >
              <span>View on Etherscan</span>
              <ExternalLink size={10} />
            </button>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Contract Balance</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {parseFloat(balances.contractBalance).toLocaleString()} REFT
            </p>
            <button
              onClick={() => openEtherscan(CONTRACT_CONFIG.referralSystemAddress)}
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center space-x-1 mt-1"
            >
              <span>View Contract</span>
              <ExternalLink size={10} />
            </button>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Per Referral</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {parseFloat(balances.requiredAmount).toLocaleString()} REFT
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              1000 + 500 REFT
            </p>
          </div>
        </div>

        {/* Status-based Action */}
        {fundingStatus === 'sufficient' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  ✅ Contract Fully Funded!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  The contract has sufficient tokens for many referrals. You're all set!
                </p>
              </div>
            </div>
          </div>
        )}

        {fundingStatus === 'needed' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Contract Needs Funding
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                  The contract needs more REFT tokens to process referrals. You have enough tokens to fund it.
                </p>
                <button
                  onClick={autoFundContract}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Funding Contract...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" />
                      <span>Fund Contract with 75,000 REFT</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {fundingStatus === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  Insufficient Tokens
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  You don't have enough REFT tokens to fund the contract. Please acquire more tokens first.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => openEtherscan(CONTRACT_CONFIG.referralTokenAddress)}
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors"
          >
            <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <p className="font-medium text-blue-800 dark:text-blue-200">View Token Contract</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Check token details</p>
            </div>
          </button>

          <button
            onClick={() => openEtherscan(CONTRACT_CONFIG.referralSystemAddress)}
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg transition-colors"
          >
            <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="text-left">
              <p className="font-medium text-green-800 dark:text-green-200">View System Contract</p>
              <p className="text-sm text-green-600 dark:text-green-400">Check contract balance</p>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Funding Instructions */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Manual Funding (Alternative)
        </h3>
        
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Open ReferralToken contract on Etherscan</p>
              <button
                onClick={() => openEtherscan(`${CONTRACT_CONFIG.referralTokenAddress}#writeContract`)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 mt-1"
              >
                <span>Open Contract</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <p>Connect your wallet and find the "transfer" function</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Fill in the transfer parameters:</p>
              <div className="bg-white dark:bg-gray-800 rounded p-2 mt-1 font-mono text-xs">
                <p>to: {CONTRACT_CONFIG.referralSystemAddress}</p>
                <p>value: 75000000000000000000000</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              4
            </div>
            <p>Click "Write" and confirm the transaction in MetaMask</p>
          </div>
        </div>
      </div>
    </div>
  );
};