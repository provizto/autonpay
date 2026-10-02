import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  TransactionInstruction 
} from '@solana/web3.js';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// AutonPay Protocol Meteora Fee Vault on Solana Mainnet
export const AUTONPAY_METEORA_FEE_VAULT = new PublicKey(
  'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4'
);

/**
 * Builds an atomic Solana settlement transaction:
 * - 95% transferred directly to the vendor's wallet
 * - 5% routed to AutonPay Meteora Liquidity Vault
 * - Attaches PayFi settlement Memo instruction
 */
export function buildPayFiSettlementTransaction({
  buyerPubkey,
  vendorPubkey,
  totalSolAmount,
  orderId,
  feeVaultPubkey = AUTONPAY_METEORA_FEE_VAULT,
}) {
  const totalLamports = Math.round(totalSolAmount * LAMPORTS_PER_SOL);
  const protocolFeeLamports = Math.round(totalLamports * 0.05); // 5% Protocol Cut
  const vendorLamports = totalLamports - protocolFeeLamports;   // 95% Vendor Settlement

  const transaction = new Transaction();

  // Instruction 1: 95% Direct Vendor Payout
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPubkey,
      toPubkey: vendorPubkey,
      lamports: vendorLamports,
    })
  );

  // Instruction 2: 5% Meteora DAMM v2 Protocol Fee Allocation
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPubkey,
      toPubkey: feeVaultPubkey,
      lamports: protocolFeeLamports,
    })
  );

  // Instruction 3: On-Chain PayFi Memo Proof
  const memoPayload = JSON.stringify({
    protocol: 'AutonPay',
    orderId,
    vendorShareLamports: vendorLamports,
    meteoraPoolFeeLamports: protocolFeeLamports,
  });

  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: buyerPubkey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoPayload, 'utf-8'),
    })
  );

  return {
    transaction,
    breakdown: {
      totalLamports,
      vendorLamports,
      protocolFeeLamports,
    },
  };
}

/**
 * Queries real account info directly from Solana Mainnet
 */
export async function verifyOnChainAccount(connection, addressString) {
  try {
    const pubkey = new PublicKey(addressString);
    const accountInfo = await connection.getAccountInfo(pubkey);
    return {
      exists: accountInfo !== null,
      lamports: accountInfo ? accountInfo.lamports : 0,
      owner: accountInfo ? accountInfo.owner.toBase58() : null,
    };
  } catch (error) {
    console.error('[METEORA SERVICE] Account verification error:', error);
    return { exists: false, error: error.message };
  }
}