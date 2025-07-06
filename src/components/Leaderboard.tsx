import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { LeaderboardEntry, PlatformStats } from '../types';

export const Leaderboard: React.FC = () => {
  const { getLeaderboard, getPlatformStats, contractsDeployed } = useContract();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all-time'>('all-time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [leaderboardData, statsData] = await Promise.all([
          getLeaderboard(),
          getPlatformStats(),
        ]);
        
        setLeaderboard(leaderboardData);
        setPlatformStats(statsData);
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getLeaderboard, getPlatformStats, timeframe]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
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
      {/* Contract Status Warning */}
      {!contractsDeployed && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-yellow-800 dark:text-yellow-200">
              Leaderboard will show real data once contracts are deployed and users start making referrals.
            </p>
          </div>
        </div>
      )}

      {/* Platform Stats */}
      {platformStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformStats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Referrals
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformStats.totalReferrals.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rewards Distributed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {parseFloat(platformStats.totalRewardsDistributed).toLocaleString()} REFT
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
                  Active Users (24h)
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformStats.activeUsers24h.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Medal className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-4 sm:mb-0">
              <Trophy className="mr-2" size={24} />
              Leaderboard
            </h3>
            
            <div className="flex space-x-2">
              {(['daily', 'weekly', 'all-time'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {contractsDeployed 
                  ? "No leaderboard data available yet. Start referring to see rankings!"
                  : "Leaderboard will populate once contracts are deployed and referrals begin."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.address}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    entry.rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div>
                      <p className="font-mono text-lg font-medium text-gray-900 dark:text-white">
                        {formatAddress(entry.address)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.referralCount} referrals
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {parseFloat(entry.totalRewards).toLocaleString()} REFT
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total rewards
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