import { PublicKey } from '@solana/web3.js';

// RPC Jaringan Solana Devnet
export const SOLANA_NETWORK = 'devnet';
export const DEVNET_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Wallet Admin Platform (Fee 5%)
// Default Base58 valid - ganti dengan Public Key Phantom Devnet Anda jika sudah ada
export const ADMIN_WALLET_ADDRESS = new PublicKey(
  '9bvD1899yYZCf2MKeuds59EXAGgVBwuFkrCS1Cgo3AhS'
);

// Fallback Wallet Affiliate (Fee 5% jika pembeli tidak membawa referral)
export const DEFAULT_AFFILIATE_ADDRESS = new PublicKey(
  'FU6cLtPS4eUBy92xa96Fb7pdaFv8A93LdEpT7MyHi7uh'
);

// Standard Solana Memo Program ID (Untuk mencatat ID lisensi on-chain)
export const MEMO_PROGRAM_ID = new PublicKey(
  'HVHRr2JbMAT1zQ8N2vuWKctfV3ycvQYdDDzob1nqd6jD'
);