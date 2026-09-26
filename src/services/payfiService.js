import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  TransactionInstruction, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  DEVNET_RPC_URL, 
  ADMIN_WALLET_ADDRESS, 
  DEFAULT_AFFILIATE_ADDRESS, 
  MEMO_PROGRAM_ID 
} from '../config/solanaConfig';

/**
 * Eksekusi Pembayaran PayFi Atomik di Solana Devnet:
 * - 90% SOL ke Vendor
 * - 5% SOL ke Platform Admin
 * - 5% SOL ke Affiliate / Referral
 * - Dicatat langsung di on-chain Memo Program
 */
export async function executePayFiPayment({
  wallet,             // Objek { publicKey, sendTransaction }
  vendorAddress,      // Public key vendor (string atau PublicKey)
  affiliateAddress,   // Public key affiliate (string, PublicKey, atau null)
  amountSol,          // Nilai SOL (number atau string, misal 0.05)
  licenseId,          // Contoh: 'AUTON-API-9901'
  productTitle = 'Digital Asset'
}) {
  if (!wallet || !wallet.publicKey) {
    throw new Error('Wallet belum terhubung! Silakan hubungkan dompet Phantom Devnet.');
  }

  const connection = new Connection(DEVNET_RPC_URL, 'confirmed');
  const buyerPublicKey = new PublicKey(wallet.publicKey);

  // 1. Parsing Lamports (1 SOL = 1.000.000.000 Lamports)
  const numericSol = parseFloat(amountSol);
  if (isNaN(numericSol) || numericSol <= 0) {
    throw new Error('Nominal harga tidak valid.');
  }

  const totalLamports = Math.round(numericSol * LAMPORTS_PER_SOL);
  const vendorLamports = Math.floor(totalLamports * 0.90);
  const adminLamports = Math.floor(totalLamports * 0.05);
  const affiliateLamports = totalLamports - vendorLamports - adminLamports; // Sisa persis 5%

  // 2. Tentukan target Public Key yang valid
  let targetVendor;
  try {
    targetVendor = new PublicKey(vendorAddress || ADMIN_WALLET_ADDRESS);
  } catch {
    targetVendor = ADMIN_WALLET_ADDRESS;
  }

  let targetAffiliate;
  try {
    targetAffiliate = affiliateAddress 
      ? new PublicKey(affiliateAddress) 
      : DEFAULT_AFFILIATE_ADDRESS;
  } catch {
    targetAffiliate = DEFAULT_AFFILIATE_ADDRESS;
  }

  // 3. Susun Transaksi Atomik Multi-Instruksi
  const transaction = new Transaction();

  // Instruksi 1: 90% ke Vendor
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: targetVendor,
      lamports: vendorLamports,
    })
  );

  // Instruksi 2: 5% ke Admin Platform
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: ADMIN_WALLET_ADDRESS,
      lamports: adminLamports,
    })
  );

  // Instruksi 3: 5% ke Affiliate
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: targetAffiliate,
      lamports: affiliateLamports,
    })
  );

  // Instruksi 4: Catat Lisensi ke On-Chain Memo Solana
  try {
    const memoContent = `AUTONPAY:${licenseId}:${productTitle.slice(0, 24)}`;
    transaction.add(
      new TransactionInstruction({
        keys: [{ pubkey: buyerPublicKey, isSigner: true, isWritable: true }],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoContent, 'utf-8'),
      })
    );
  } catch (e) {
    console.warn('Gagal menambahkan memo on-chain:', e);
  }

  // 4. Ambil blockhash terbaru & tandatangani transaksi
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = buyerPublicKey;

  let signature = '';
  if (wallet.sendTransaction) {
    signature = await wallet.sendTransaction(transaction, connection);
  } else if (window.solana && window.solana.signAndSendTransaction) {
    const res = await window.solana.signAndSendTransaction(transaction);
    signature = res.signature;
  } else {
    throw new Error('Ekstensi wallet tidak mendukung penandatanganan.');
  }

  // 5. Konfirmasi on-chain
  const confirmation = await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight
  }, 'confirmed');

  if (confirmation.value.err) {
    throw new Error('Transaksi gagal atau ditolak di Solana Devnet.');
  }

  return {
    success: true,
    signature,
    licenseId,
    explorerUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    splitSummary: {
      totalSol: numericSol,
      vendorSol: (vendorLamports / LAMPORTS_PER_SOL).toFixed(4),
      adminSol: (adminLamports / LAMPORTS_PER_SOL).toFixed(4),
      affiliateSol: (affiliateLamports / LAMPORTS_PER_SOL).toFixed(4),
    }
  };
}