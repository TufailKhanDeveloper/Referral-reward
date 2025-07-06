export interface User {
  address: string;
  referralCode: string;
  totalReferrals: number;
  totalRewards: string;
  pendingRewards: string;
  isReferred: boolean;
  lastReferralTime: number;
  isEligible: boolean;
}

export interface Referral {
  referee: string;
  referrer: string;
  timestamp: number;
  referrerReward: string;
  refereeReward: string;
  txHash?: string;
}

export interface LeaderboardEntry {
  address: string;
  referralCount: number;
  totalRewards: string;
  rank: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalReferrals: number;
  totalRewardsDistributed: string;
  activeUsers24h: number;
  contractBalance: string;
}

export interface ContractConfig {
  referralSystemAddress: string;
  referralTokenAddress: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
}

export enum ReferralType {
  REFERRER = 0,
  REFEREE = 1
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  isCorrectNetwork: boolean;
}

export interface ContractEvent {
  event: string;
  args: any[];
  transactionHash: string;
  blockNumber: number;
}