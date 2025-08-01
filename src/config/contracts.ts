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

// Updated ABI based on your actual deployed contract
export const REFERRAL_SYSTEM_ABI = [
  // Custom Errors - IMPORTANT: These match your actual contract
  'error AccessControlBadConfirmation()',
  'error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)',
  'error InsufficientTokenBalance()',
  'error InvalidAddress()',
  'error InvalidAmount()',
  'error InvalidReferralCode()',
  'error MaxReferralsExceeded()',
  'error OwnableInvalidOwner(address owner)',
  'error OwnableUnauthorizedAccount(address account)',
  'error ReferralCodeAlreadyExists()',
  'error ReferralTooSoon()',
  'error SelfReferralNotAllowed()',
  'error UnauthorizedBackend()',
  'error UserAlreadyReferred()',

  // Read functions - Based on your actual ABI
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
  'function frontendMode() view returns (bool)',
  'function demoMode() view returns (bool)',
  'function getReferrerFromCode(string referralCode) view returns (address)',
  'function getReferralCode(address user) view returns (string)',
  'function referralCodeToAddress(string) view returns (address)',
  'function addressToReferralCode(address) view returns (string)',
  'function demoReferralCodes(string) view returns (address)',
  'function isDemoCode(string referralCode) view returns (bool)',
  
  // Write functions
  'function processReferral(address referee, address referrer)',
  'function processReferralByCode(string referralCode)',
  'function registerReferralCode(string referralCode)',
  'function setFrontendMode(bool enabled)',
  'function setDemoMode(bool enabled)',
  'function addDemoCode(string referralCode, address referrer)',
  
  // Events
  'event ReferralProcessed(address indexed referee, address indexed referrer, uint256 timestamp)',
  'event RewardsDistributed(address indexed user, uint256 amount, uint8 referralType)',
  'event ReferralCodeRegistered(address indexed user, string referralCode)',
  'event FrontendModeUpdated(bool enabled)',
  'event DemoModeUpdated(bool enabled)',
  'event DemoCodeAdded(string referralCode, address referrer)',
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

// Enhanced error message mapping for better user experience
export const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  // Contract-specific errors
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
  'InvalidReferralCode': 'Invalid or non-existent referral code. Please check the code and try again, or use one of the demo codes.',
  'ReferralCodeAlreadyExists': 'This referral code is already registered.',
  
  // ERC20 errors
  'ERC20InsufficientBalance': 'Insufficient token balance.',
  'ERC20InsufficientAllowance': 'Insufficient token allowance.',
  'ERC20InvalidReceiver': 'Invalid token receiver address.',
  'ERC20InvalidSender': 'Invalid token sender address.',
  'ERC20InvalidApprover': 'Invalid token approver address.',
  'ERC20InvalidSpender': 'Invalid token spender address.',
  
  // Ownable errors
  'OwnableUnauthorizedAccount': 'Only the contract owner can perform this action.',
  'OwnableInvalidOwner': 'Invalid owner address.',
  
  // Access control errors
  'AccessControlBadConfirmation': 'Access control confirmation failed.',
};

// Error selector mapping for quick lookup - Updated with correct selectors
export const ERROR_SELECTORS: Record<string, string> = {
  '0xe4455cae': 'UnauthorizedBackend',
  '0xd92e233d': 'InvalidAddress',
  '0x2c5211c6': 'InvalidAmount',
  '0x3ee5aeb5': 'UserAlreadyReferred',
  '0x4ca88867': 'SelfReferralNotAllowed',
  '0x8d6ea8be': 'ReferralTooSoon',
  '0x7d3d5b0a': 'MaxReferralsExceeded',
  '0x356680b7': 'InsufficientTokenBalance',
  '0xe55b4629': 'InvalidReferralCode', // This is the error you're getting
  '0x9b96eece': 'ReferralCodeAlreadyExists',
};

// Function to decode error by selector
export const decodeErrorBySelector = (errorData: string): string | null => {
  if (!errorData || errorData.length < 10) return null;
  
  const selector = errorData.slice(0, 10); // First 4 bytes (8 hex chars + 0x)
  const errorName = ERROR_SELECTORS[selector];
  
  if (errorName) {
    return CONTRACT_ERROR_MESSAGES[errorName] || `Contract error: ${errorName}`;
  }
  
  return null;
};