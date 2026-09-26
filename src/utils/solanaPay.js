import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';

// RPC Solana Devnet
export const connection = new Connection(
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Wallet Penampung Protocol Vault (5% Fee)
const PROTOCOL_VAULT = 'BvmRYWTbkCwNqVUEeD7qgVqzM9rXh9egrDiWDBcsofny';

/**
 * Eksekusi Pembelian On-Chain Riil:
 * - 95% SOL langsung masuk ke dompet Merchant/Vendor
 * - 5% SOL otomatis masuk ke Vault Protokol
 */
export async function executePayFiPurchase({
  wallet,
  vendorAddress,
  priceSol,
  productSku
}) {
  if (!wallet || !wallet.publicKey) {
    throw new Error('Hubungkan dompet Solana terlebih dahulu!');
  }

  const buyerPubkey = new PublicKey(wallet.publicKey);
  const vendorPubkey = new PublicKey(vendorAddress || PROTOCOL_VAULT);
  const vaultPubkey = new PublicKey(PROTOCOL_VAULT);

  // 1. Konversi SOL ke Lamports (1 SOL = 1.000.000.000 Lamports)
  const totalLamports = Math.round(Number(priceSol) * LAMPORTS_PER_SOL);
  if (totalLamports <= 0) throw new Error('Nominal harga tidak valid.');

  const merchantLamports = Math.floor(totalLamports * 0.95);
  const vaultLamports = totalLamports - merchantLamports;

  // 2. Buat transaksi atomik 2 instruksi
  const transaction = new Transaction();

  // Instruksi A: 95% ke Vendor
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPubkey,
      toPubkey: vendorPubkey,
      lamports: merchantLamports,
    })
  );

  // Instruksi B: 5% ke Protocol Vault
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPubkey,
      toPubkey: vaultPubkey,
      lamports: vaultLamports,
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
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    merchantCut: merchantLamports / LAMPORTS_PER_SOL,
    vaultCut: vaultLamports / LAMPORTS_PER_SOL,
    sku: productSku
  };
}