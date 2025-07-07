import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  Clock, 
  TrendingUp, 
  Award, 
  Calendar, 
  CheckCircle, 
  ExternalLink,
  Target,
  Zap,
  Star,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { useContract } from '../../hooks/useContract';
import { useWallet } from '../../hooks/useWallet';
import { Referral } from '../../types';
import { CONTRACT_CONFIG } from '../../config/contracts';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { Tooltip } from '../ui/Tooltip';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ContractFundingHelper } from '../ContractFundingHelper';

export const EnhancedDashboard: React.FC = () => {
  const { user, getReferralHistory, getTokenBalance, contractsDeployed, checkAndFundContract } = useContract();
  const { address } = useWallet();
  const [referralHistory, setReferralHistory] = useState<Referral[]>([]);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [contractBalance, setContractBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | 'all'>('30d');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [needsFunding, setNeedsFunding] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!address) return;
      
      setLoading(true);
      try {
        const [history, balance] = await Promise.all([
          getReferralHistory(address),
          getTokenBalance(address),
        ]);
        
        setReferralHistory(history);
        setTokenBalance(balance);

        // Check contract balance if contracts are deployed
        if (contractsDeployed) {
          const { getReferralSystemContract } = await import('../../hooks/useContract');
          // This is a simplified check - in practice you'd want to properly import the hook
          // For now, we'll assume the contract needs funding if there are errors
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // If we get a "Contract does not have enough tokens" error, show setup guide
        if (error instanceof Error && error.message.includes('Contract does not have enough tokens')) {
          setNeedsFunding(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address, getReferralHistory, getTokenBalance, contractsDeployed]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const openInExplorer = (address: string) => {
    window.open(`${CONTRACT_CONFIG.blockExplorer}/address/${address}`, '_blank');
  };

  // Calculate progress towards next milestone
  const nextMilestone = Math.ceil((user?.totalReferrals || 0) / 10) * 10;
  const milestoneProgress = user?.totalReferrals || 0;

  // Calculate recent activity
  const recentReferrals = referralHistory.filter(ref => {
    const daysSince = (Date.now() / 1000 - ref.timestamp) / (24 * 60 * 60);
    return selectedTimeframe === '7d' ? daysSince <= 7 : 
           selectedTimeframe === '30d' ? daysSince <= 30 : true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  // Show setup guide if contracts need funding
  if (needsFunding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contract Funding Required
          </h2>
        </div>
        <ContractFundingHelper />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Contract Status Banner */}
      {contractsDeployed && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  🎉 Smart Contracts Connected Successfully!
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Your REFT tokens are real and live on Sepolia testnet. All data is fetched directly from the blockchain.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Tooltip content="View ReferralSystem contract on Etherscan">
                  <button
                    onClick={() => openInExplorer(CONTRACT_CONFIG.referralSystemAddress)}
                    className="flex items-center space-x-2 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-mono bg-green-100 dark:bg-green-900 px-3 py-2 rounded-lg transition-colors"
                  >
                    <span>ReferralSystem: {formatAddress(CONTRACT_CONFIG.referralSystemAddress)}</span>
                    <ExternalLink size={12} />
                  </button>
                </Tooltip>
                <Tooltip content="View ReferralToken contract on Etherscan">
                  <button
                    onClick={() => openInExplorer(CONTRACT_CONFIG.referralTokenAddress)}
                    className="flex items-center space-x-2 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-mono bg-green-100 dark:bg-green-900 px-3 py-2 rounded-lg transition-colors"
                  >
                    <span>ReferralToken: {formatAddress(CONTRACT_CONFIG.referralTokenAddress)}</span>
                    <ExternalLink size={12} />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Funding Warning */}
      {contractsDeployed && parseFloat(contractBalance) < 1500 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Contract May Need Funding
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                The contract might not have enough tokens for rewards. Each referral requires 1,500 REFT tokens.
              </p>
              <div className="mt-4">
                <ContractFundingHelper />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Referrals Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <StatusBadge 
              status={contractsDeployed ? 'success' : 'pending'} 
              text={contractsDeployed ? 'Live' : 'Pending'} 
              size="sm"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Referrals
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter value={user?.totalReferrals || 0} />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {contractsDeployed ? 'Live from blockchain' : 'Waiting for contracts'}
            </p>
          </div>
        </div>

        {/* Total Rewards Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <Tooltip content="Total REFT tokens earned from referrals">
              <Star className="h-4 w-4 text-yellow-500" />
            </Tooltip>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Rewards
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter 
                value={parseFloat(user?.totalRewards || '0')} 
                decimals={2}
                suffix=" REFT"
              />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {contractsDeployed ? 'Real REFT tokens' : 'Deploy contracts first'}
            </p>
          </div>
        </div>

        {/* Token Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Award className="h-6 w-6 text-white" />
            </div>
            <Tooltip content="Current REFT balance in your wallet">
              <Zap className="h-4 w-4 text-purple-500" />
            </Tooltip>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Wallet Balance
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedCounter 
                value={parseFloat(tokenBalance)} 
                decimals={2}
                suffix=" REFT"
              />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {contractsDeployed ? 'In your wallet' : 'No tokens yet'}
            </p>
          </div>
        </div>

        {/* Eligibility Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <StatusBadge 
              status={user?.isEligible ? 'success' : 'warning'} 
              text={user?.isEligible ? 'Eligible' : 'Rate Limited'} 
              size="sm"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Referral Status
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.isEligible ? '✅ Ready' : '⏳ Waiting'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {user?.isEligible ? 'Can refer others' : 'Rate limited'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Progress to Next Milestone
          </h3>
        </div>
        
        <ProgressBar
          progress={milestoneProgress}
          max={nextMilestone || 10}
          label={`${milestoneProgress} / ${nextMilestone || 10} referrals`}
          className="mb-4"
        />
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {nextMilestone - milestoneProgress} more referrals to reach your next milestone!
        </p>
      </div>

      {/* Enhanced Referral History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-4 sm:mb-0">
              <TrendingUp className="mr-2" size={24} />
              Referral History
              {contractsDeployed && (
                <StatusBadge status="success" text="Live Data" size="sm" className="ml-3" />
              )}
            </h3>
            
            {/* Timeframe Filter */}
            <div className="flex space-x-2">
              {(['7d', '30d', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTimeframe === period
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {period === '7d' ? 'Last 7 days' : 
                   period === '30d' ? 'Last 30 days' : 
                   'All time'}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {recentReferrals.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No referrals yet
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                {contractsDeployed 
                  ? "Start sharing your referral code to see your history here!"
                  : "Referral history will appear here once contracts are deployed"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReferrals.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(referral.timestamp)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <StatusBadge
                          status={referral.referrer === address ? 'success' : 'pending'}
                          text={referral.referrer === address ? 'Referrer' : 'Referee'}
                          size="sm"
                          showIcon={false}
                        />
                        <Tooltip content="View on Etherscan">
                          <button
                            onClick={() => openInExplorer(
                              referral.referrer === address ? referral.referee : referral.referrer
                            )}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <ExternalLink size={12} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      +{parseFloat(
                        referral.referrer === address
                          ? referral.referrerReward
                          : referral.refereeReward
                      ).toFixed(2)} REFT
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reward earned
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};