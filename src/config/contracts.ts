import { ContractConfig } from '../types';

// Validate environment variables
const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

export const CONTRACT_CONFIG: ContractConfig = {
  referralSystemAddress: validateEnvVar('VITE_REFERRAL_SYSTEM_ADDRESS', import.meta.env.VITE_REFERRAL_SYSTEM_ADDRESS),
  referralTokenAddress: validateEnvVar('VITE_REFERRAL_TOKEN_ADDRESS', import.meta.env.VITE_REFERRAL_TOKEN_ADDRESS),
  chainId: parseInt(validateEnvVar('VITE_CHAIN_ID', import.meta.env.VITE_CHAIN_ID)),
  rpcUrl: validateEnvVar('VITE_RPC_URL', import.meta.env.VITE_RPC_URL),
  blockExplorer: validateEnvVar('VITE_BLOCK_EXPLORER', import.meta.env.VITE_BLOCK_EXPLORER),
};

export const SEPOLIA_CHAIN_CONFIG = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia test network',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [CONTRACT_CONFIG.rpcUrl],
  blockExplorerUrls: [CONTRACT_CONFIG.blockExplorer],
};

export const REFERRAL_SYSTEM_ABI = [
  // Read functions
  'function getReferrals(address user) view returns (tuple(address referee, address referrer, uint256 timestamp, uint256 referrerReward, uint256 refereeReward)[])',
  'function getReferralCount(address user) view returns (uint256)',
  'function isEligibleForReferral(address user) view returns (bool)',
  'function getUserStats(address user) view returns (uint256 totalRefs, uint256 totalRewards, uint256 lastReferral, bool isReferred)',
  'function getContractBalance() view returns (uint256)',
  'function getRewardConfig() view returns (uint256, uint256)',
  'function hasBeenReferred(address user) view returns (bool)',
  'function totalReferrals(address user) view returns (uint256)',
  'function totalRewardsEarned(address user) view returns (uint256)',
  'function lastReferralTime(address user) view returns (uint256)',
  'function minReferralInterval() view returns (uint256)',
  'function maxReferralsPerUser() view returns (uint256)',
  
  // Write functions
  'function processReferral(address referee, address referrer)',
  
  // Events
  'event ReferralProcessed(address indexed referee, address indexed referrer, uint256 timestamp)',
  'event RewardsDistributed(address indexed user, uint256 amount, uint8 referralType)',
];

export const REFERRAL_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function remainingSupply() view returns (uint256)',
];