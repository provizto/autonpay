import { PublicKey } from '@solana/web3.js';

// RPC Jaringan Solana Devnet
export const SOLANA_NETWORK = 'devnet';
export const DEVNET_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Wallet Admin Platform (Fee 5%)
// Default Base58 valid - ganti dengan Public Key Phantom Devnet Anda jika sudah ada
export const ADMIN_WALLET_ADDRESS = new PublicKey(
  'BvmRYWTbkCwNqVUEeD7qgVqzM9rXh9egrDiWDBcsofny'
);

// Fallback Wallet Affiliate (Fee 5% jika pembeli tidak membawa referral)
export const DEFAULT_AFFILIATE_ADDRESS = new PublicKey(
  'H8XSVM7UDZbk5eFhzWMLU5WPKZwNLBo85wGbrfPDX6Gw'
);

// Standard Solana Memo Program ID (Untuk mencatat ID lisensi on-chain)
export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
);