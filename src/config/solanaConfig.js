import { PublicKey } from '@solana/web3.js';

// 1. Jaringan & RPC Solana Mainnet
export const SOLANA_NETWORK = 'mainnet-beta';

export const SOLANA_RPC_URL = 
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Alias kompatibilitas jika ada file lama yang memanggil nama DEVNET_RPC_URL
export const DEVNET_RPC_URL = SOLANA_RPC_URL;

// 2. Wallet Admin AutonPay (Penerima Fee Protokol 5%)
// Alamat resmi wallet kreator Pump.fun Anda
export const ADMIN_WALLET_ADDRESS = new PublicKey(
  'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4'
);

// 3. Fallback Wallet Affiliate (Fee 5% jika pembeli tidak membawa referral)
// Digabung ke Wallet Admin agar jika tanpa referral, 10% masuk ke dompet Anda
export const DEFAULT_AFFILIATE_ADDRESS = ADMIN_WALLET_ADDRESS;

// 4. Token Resmi $AUTON di Pump.fun (Mint / CA)
export const AUTON_TOKEN_MINT = new PublicKey(
  '2X7saQ967isTkJEP6FKgFuTzTWsH4ZMkCh1MDGDApump'
);

// 5. Smart Contract Pump.fun Program ID (Solana Mainnet)
export const PUMPFUN_PROGRAM_ID = new PublicKey(
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
);

// 6. Standard Solana SPL Memo Program ID (Resmi Mainnet)
export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
);

// Helper Link Solscan Mainnet
export const getExplorerUrl = (txSignature) => {
  return `https://solscan.io/tx/${txSignature}`;
};