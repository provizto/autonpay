import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';

export const DEVNET_RPC = 'https://api.mainnet-beta.solana.com';
export const DEFAULT_ADMIN_WALLET = 'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4';
export const DEFAULT_AFFILIATE_WALLET = 'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4';
export const DEFAULT_VENDOR_WALLET = 'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4';

export async function executePayFiPayment({
  wallet,
  vendorAddress,
  affiliateAddress,
  amountSol,
  licenseId,
  productTitle
}) {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const payerPubkey = wallet.publicKey;

  // 1. Tentukan target wallet (dengan fallback jika kosong)
  const vendorPubkey = new PublicKey(vendorAddress || DEFAULT_VENDOR_WALLET);
  const adminPubkey = new PublicKey(DEFAULT_ADMIN_WALLET);
  const affiliatePubkey = new PublicKey(affiliateAddress || DEFAULT_AFFILIATE_WALLET);

  // 2. Hitung split 90% / 5% / 5% dalam Lamports (1 SOL = 10^9 Lamports)
  const totalLamports = Math.round(amountSol * LAMPORTS_PER_SOL);
  const vendorLamports = Math.round(totalLamports * 0.90);
  const adminLamports = Math.round(totalLamports * 0.05);
  const affiliateLamports = totalLamports - vendorLamports - adminLamports; // sisa lamports presisi

  // 3. Susun 1 transaksi atomik (3 transfer sekaligus)
  const transaction = new Transaction();

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: payerPubkey,
      toPubkey: vendorPubkey,
      lamports: vendorLamports,
    }),
    SystemProgram.transfer({
      fromPubkey: payerPubkey,
      toPubkey: adminPubkey,
      lamports: adminLamports,
    }),
    SystemProgram.transfer({
      fromPubkey: payerPubkey,
      toPubkey: affiliatePubkey,
      lamports: affiliateLamports,
    })
  );

  // 4. Ambil blockhash terbaru & kirim via dompet pembeli
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payerPubkey;

  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return {
    signature,
    licenseId,
    productTitle,
    explorerUrl: `https://solscan.io/tx/${signature}`
  };
}