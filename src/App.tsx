import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { WalletConnect } from './components/WalletConnect';
import { NetworkGuard } from './components/NetworkGuard';
import { EnhancedDashboard } from './components/enhanced/EnhancedDashboard';
import { EnhancedReferralGenerator } from './components/enhanced/EnhancedReferralGenerator';
import { EnhancedReferralInput } from './components/enhanced/EnhancedReferralInput';
import { Leaderboard } from './components/Leaderboard';
import { RealTimeEvents } from './components/RealTimeEvents';
import { ThemeToggle } from './components/ThemeToggle';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import { Users, Trophy, Gift, BarChart3, Activity, Sparkles, Heart, Coffee, Github, ExternalLink } from 'lucide-react';

type Tab = 'dashboard' | 'referral' | 'leaderboard' | 'events';

function App() {
  const { isConnected, address, isCorrectNetwork } = useWallet();
  const { user } = useContract();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const referralLink = user ? `${window.location.origin}?ref=${user.referralCode}` : '';

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
    { id: 'referral' as Tab, label: 'Referral', icon: Gift, color: 'from-green-500 to-green-600' },
    { id: 'leaderboard' as Tab, label: 'Leaderboard', icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
    { id: 'events' as Tab, label: 'Live Events', icon: Activity, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <NetworkGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
        <Toaster 
          position="top-right"
          containerStyle={{
            top: 20,
            right: 20,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#374151',
              borderRadius: '12px',
              border: '1px solid rgba(229, 231, 235, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              maxWidth: '400px',
            },
            success: {
              style: {
                background: 'rgba(16, 185, 129, 0.95)',
                color: 'white',
                border: '1px solid rgba(16, 185, 129, 0.8)',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#10B981',
              },
            },
            error: {
              style: {
                background: 'rgba(239, 68, 68, 0.95)',
                color: 'white',
                border: '1px solid rgba(239, 68, 68, 0.8)',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#EF4444',
              },
            },
            loading: {
              style: {
                background: 'rgba(59, 130, 246, 0.95)',
                color: 'white',
                border: '1px solid rgba(59, 130, 246, 0.8)',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#3B82F6',
              },
            },
          }}
        />
        
        {/* Enhanced Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Referral Rewards
                  </h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sepolia Testnet
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <ThemeToggle />
                <WalletConnect />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {!isConnected || !isCorrectNetwork ? (
            <div className="text-center py-12 sm:py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 flex items-center justify-center">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                Welcome to Referral Rewards
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto text-base sm:text-lg px-4">
                Connect your wallet to Sepolia testnet to start earning rewards by referring friends and family to our platform.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 sm:mb-8">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Real REFT tokens</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Gift className="h-4 w-4" />
                  <span>Instant rewards</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Trophy className="h-4 w-4" />
                  <span>Leaderboard</span>
                </div>
              </div>
              
              <WalletConnect />
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Enhanced Navigation Tabs */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex-1 ${
                          isActive
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse hidden sm:block"></div>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Enhanced Tab Content */}
              <div className="transition-all duration-300 ease-in-out">
                {activeTab === 'dashboard' && <EnhancedDashboard />}
                
                {activeTab === 'referral' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                    {user && (
                      <EnhancedReferralGenerator
                        referralCode={user.referralCode}
                        referralLink={referralLink}
                      />
                    )}
                    <EnhancedReferralInput />
                  </div>
                )}
                
                {activeTab === 'leaderboard' && <Leaderboard />}
                
                {activeTab === 'events' && <RealTimeEvents />}
              </div>
            </div>
          )}
        </main>

        {/* Enhanced Personal Footer */}
        <footer className="mt-12 sm:mt-16 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-gray-800 dark:via-gray-900 dark:to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Main Footer Content */}
            <div className="text-center space-y-6">
              {/* Made with Love Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-white/90">
                  <span className="text-lg font-medium">Made with</span>
                  <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                  <span className="text-lg font-medium">by</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Huzaifa Khan
                  </h3>
                  <p className="text-blue-200 dark:text-blue-300 font-medium text-lg">
                    Full-Stack Developer & Blockchain Enthusiast
                  </p>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-purple-200 dark:text-purple-300">
                  <span className="text-sm">Powered by coffee</span>
                  <Coffee className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">and creativity</span>
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </div>
              </div>

              {/* Links Section */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                {/* Profile Link */}
                <a
                  href="https://github.com/HuzaifaKhanDeveloper/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/20 hover:border-white/30"
                >
                  <Github className="h-5 w-5 text-white group-hover:text-blue-300 transition-colors" />
                  <span className="text-white font-medium">Profile</span>
                  <ExternalLink className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
                </a>

                {/* Source Code Link */}
                <a
                  href="https://github.com/HuzaifaKhanDeveloper/Referral-reward"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/20 hover:border-white/30"
                >
                  <Github className="h-5 w-5 text-white group-hover:text-green-300 transition-colors" />
                  <span className="text-white font-medium">Source Code</span>
                  <ExternalLink className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
                </a>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

              {/* Bottom Section */}
              <div className="space-y-3">
                <p className="text-white/80 text-sm">
                  Built with ❤️ for the Web3 community • Powered by Ethereum Sepolia Testnet
                </p>
                <p className="text-white/60 text-xs">
                  © 2024 Huzaifa Khan. Open source and available on GitHub.
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </footer>
      </div>
    </NetworkGuard>
  );
}

export default App;