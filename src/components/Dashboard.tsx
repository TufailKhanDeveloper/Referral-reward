import React, { useState, useEffect } from 'react';
import { Users, Gift, Clock, TrendingUp, Award, Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { Referral } from '../types';
import { CONTRACT_CONFIG } from '../config/contracts';

export const Dashboard: React.FC = () => {
  const { user, getReferralHistory, getTokenBalance, contractsDeployed } = useContract();
  const { address } = useWallet();
  const [referralHistory, setReferralHistory] = useState<Referral[]>([]);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address, getReferralHistory, getTokenBalance]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const openInExplorer = (address: string) => {
    window.open(`${CONTRACT_CONFIG.blockExplorer}/address/${address}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Status */}
      {contractsDeployed && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Smart Contracts Connected ✅
              </h3>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Your REFT tokens are real and live on Sepolia testnet! All data below is fetched directly from the blockchain.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">ReferralSystem:</span>
                  <button
                    onClick={() => openInExplorer(CONTRACT_CONFIG.referralSystemAddress)}
                    className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-mono flex items-center space-x-1"
                  >
                    <span>{formatAddress(CONTRACT_CONFIG.referralSystemAddress)}</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">ReferralToken:</span>
                  <button
                    onClick={() => openInExplorer(CONTRACT_CONFIG.referralTokenAddress)}
                    className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-mono flex items-center space-x-1"
                  >
                    <span>{formatAddress(CONTRACT_CONFIG.referralTokenAddress)}</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Referrals
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.totalReferrals || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {contractsDeployed ? 'Live from blockchain' : 'Waiting for contracts'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Rewards
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {parseFloat(user?.totalRewards || '0').toFixed(2)} REFT
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {contractsDeployed ? 'Real REFT tokens' : 'Deploy contracts first'}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Token Balance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {parseFloat(tokenBalance).toFixed(2)} REFT
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {contractsDeployed ? 'In your wallet' : 'No tokens yet'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Eligibility Status
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.isEligible ? '✅' : '❌'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {user?.isEligible ? 'Can refer others' : 'Rate limited'}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="mr-2" size={24} />
            Referral History
            {contractsDeployed && (
              <span className="ml-2 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                Live Data
              </span>
            )}
          </h3>
        </div>
        
        <div className="p-6">
          {referralHistory.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {contractsDeployed 
                  ? "No referrals yet. Start sharing your referral code!"
                  : "Referral history will appear here once contracts are deployed"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Address
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Reward
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referralHistory.map((referral, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          {formatDate(referral.timestamp)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            referral.referrer === address
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}
                        >
                          {referral.referrer === address ? 'Referrer' : 'Referee'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-mono">
                        <button
                          onClick={() => openInExplorer(
                            referral.referrer === address ? referral.referee : referral.referrer
                          )}
                          className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <span>
                            {formatAddress(
                              referral.referrer === address ? referral.referee : referral.referrer
                            )}
                          </span>
                          <ExternalLink size={12} />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        {parseFloat(
                          referral.referrer === address
                            ? referral.referrerReward
                            : referral.refereeReward
                        ).toFixed(2)}{' '}
                        REFT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};