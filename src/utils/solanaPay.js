import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';

// RPC Solana Mainnet
export const connection = new Connection(
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// Wallet Admin Resmi Pump.fun
const PROTOCOL_ADMIN_VAULT = 'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4';

// Fallback Affiliate diarahkan ke Admin
const DEFAULT_AFFILIATE_VAULT = PROTOCOL_ADMIN_VAULT;

/**
 * Eksekusi Pembelian On-Chain Riil (Devnet):
 * - 90% SOL langsung masuk ke dompet Vendor
 * - 5% SOL masuk ke Platform Admin
 * - 5% SOL masuk ke Affiliate / Referral Partner
 */
export async function executePayFiPurchase({
  wallet,
  vendorAddress,
  affiliateAddress = null,
  priceSol,
  productSku
}) {
  if (!wallet || !wallet.publicKey) {
    throw new Error('Hubungkan dompet Solana terlebih dahulu!');
  }

  const buyerPubkey = new PublicKey(wallet.publicKey);
  const vendorPubkey = new PublicKey(vendorAddress || PROTOCOL_ADMIN_VAULT);
  const adminPubkey = new PublicKey(PROTOCOL_ADMIN_VAULT);
  
  // Tentukan target affiliate (jika tidak ada ref, masuk ke admin atau fallback pool)
  let affiliatePubkey = adminPubkey;
  if (affiliateAddress) {
    try {
      affiliatePubkey = new PublicKey(affiliateAddress);
    } catch {
      affiliatePubkey = adminPubkey;
    }
  }

  // 1. Konversi SOL ke Lamports (1 SOL = 1.000.000.000 Lamports)
  const totalLamports = Math.round(Number(priceSol) * LAMPORTS_PER_SOL);
  if (totalLamports <= 0) throw new Error('Nominal harga tidak valid.');

  // Kalkulasi Split 90% : 5% : 5%
  const vendorLamports = Math.floor(totalLamports * 0.90);
  const adminLamports = Math.floor(totalLamports * 0.05);
  const affiliateLamports = totalLamports - vendorLamports - adminLamports; // Sisa persis 5%

  // 2. Buat transaksi multi-instruksi atomik
  const transaction = new Transaction();

  // Instruksi 1: 90% ke Vendor
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPubkey,
      toPubkey: vendorPubkey,
      lamports: vendorLamports,
    })
  );

  // Instruksi 2: 5% ke Protocol Admin
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPubkey,
      toPubkey: adminPubkey,
      lamports: adminLamports,
    })
  );

  // Instruksi 3: 5% ke Affiliate
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPubkey,
      toPubkey: affiliatePubkey,
      lamports: affiliateLamports,
    })
  );

  // 3. Ambil blockhash terbaru
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = buyerPubkey;

  // 4. Kirim & Minta tanda tangan wallet (Phantom/Solflare)
  let signature = '';
  if (wallet.sendTransaction) {
    signature = await wallet.sendTransaction(transaction, connection);
  } else if (window.solana && window.solana.signAndSendTransaction) {
    const res = await window.solana.signAndSendTransaction(transaction);
    signature = res.signature;
  } else {
    throw new Error('Ekstensi wallet tidak terdeteksi.');
  }

  // 5. Konfirmasi on-chain
  const confirmation = await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight
  }, 'confirmed');

  if (confirmation.value.err) {
    throw new Error('Transaksi ditolak oleh jaringan Solana.');
  }

  return {
    signature,
    explorerUrl: `https://solscan.io/tx/${signature}`,
    merchantCut: (vendorLamports / LAMPORTS_PER_SOL).toFixed(4),
    adminCut: (adminLamports / LAMPORTS_PER_SOL).toFixed(4),
    affiliateCut: (affiliateLamports / LAMPORTS_PER_SOL).toFixed(4),
    sku: productSku
  };
}