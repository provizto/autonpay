import { Connection, PublicKey } from '@solana/web3.js';
import AmmImpl from '@meteora-ag/dynamic-amm-sdk';

const RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export async function getMeteoraPoolInfo(poolAddressString) {
  try {
    const poolPubkey = new PublicKey(poolAddressString);
    const pool = await AmmImpl.create(connection, poolPubkey);

    const tokenA = pool.tokenAMint.address.toBase58();
    const tokenB = pool.tokenBMint.address.toBase58();
    const feeInfo = pool.poolState.fees;

    return {
      success: true,
      poolAddress: poolAddressString,
      tokenA,
      tokenB,
      tradeFeeNumerator: feeInfo.tradeFeeNumerator.toString(),
      tradeFeeDenominator: feeInfo.tradeFeeDenominator.toString(),
    };
  } catch (error) {
    console.error('[METEORA SERVICE ERROR] Failed to fetch pool:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export function calculateDynamicFeeRouting(poolInstance, feeAmountLamports) {
  return {
    allocatedLamports: feeAmountLamports,
    routeTarget: 'Meteora DAMM v2 Auto-Liquidity',
    timestamp: Date.now(),
  };
}