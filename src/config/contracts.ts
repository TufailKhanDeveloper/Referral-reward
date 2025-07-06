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
  // Custom Errors - IMPORTANT: These are needed to decode revert reasons
  'error AccessControlBadConfirmation()',
  'error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)',
  'error InsufficientTokenBalance()',
  'error InvalidAddress()',
  'error InvalidAmount()',
  'error MaxReferralsExceeded()',
  'error OwnableInvalidOwner(address owner)',
  'error OwnableUnauthorizedAccount(address account)',
  'error ReferralTooSoon()',
  'error SelfReferralNotAllowed()',
  'error UnauthorizedBackend()',
  'error UserAlreadyReferred()',

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
  'function paused() view returns (bool)',
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function BACKEND_ROLE() view returns (bytes32)',
  
  // Write functions
  'function processReferral(address referee, address referrer)',
  
  // Events
  'event ReferralProcessed(address indexed referee, address indexed referrer, uint256 timestamp)',
  'event RewardsDistributed(address indexed user, uint256 amount, uint8 referralType)',
];

export const REFERRAL_TOKEN_ABI = [
  // Custom Errors
  'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)',
  'error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)',
  'error ERC20InvalidApprover(address approver)',
  'error ERC20InvalidReceiver(address receiver)',
  'error ERC20InvalidSender(address sender)',
  'error ERC20InvalidSpender(address spender)',
  'error ExceedsMaxSupply()',
  'error InvalidAddress()',
  'error InvalidAmount()',
  'error OwnableInvalidOwner(address owner)',
  'error OwnableUnauthorizedAccount(address account)',
  'error UnauthorizedMinter()',

  // Standard ERC20 functions
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function remainingSupply() view returns (uint256)',
  'function paused() view returns (bool)',
];

// Error message mapping for better user experience
export const CONTRACT_ERROR_MESSAGES = {
  'InsufficientTokenBalance': 'Contract does not have enough tokens for rewards. Please contact support.',
  'InvalidAddress': 'Invalid wallet address provided.',
  'InvalidAmount': 'Invalid amount specified.',
  'MaxReferralsExceeded': 'You have reached the maximum number of referrals allowed.',
  'ReferralTooSoon': 'Please wait before making another referral. Rate limit in effect.',
  'SelfReferralNotAllowed': 'You cannot refer yourself!',
  'UnauthorizedBackend': 'This operation requires backend authorization.',
  'UserAlreadyReferred': 'This user has already been referred by someone else.',
  'AccessControlUnauthorizedAccount': 'You do not have permission to perform this action.',
  'UnauthorizedMinter': 'Unauthorized to mint tokens.',
  'ExceedsMaxSupply': 'Would exceed maximum token supply.',
  'ERC20InsufficientBalance': 'Insufficient token balance.',
  'ERC20InsufficientAllowance': 'Insufficient token allowance.',
};