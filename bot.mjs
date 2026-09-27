import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import crypto from 'crypto';
import fs from 'fs';

// 1. LOAD SUPABASE CREDENTIALS FROM .ENV
const envConfig = fs.existsSync('.env') 
  ? fs.readFileSync('.env', 'utf-8')
      .split('\n')
      .reduce((acc, line) => {
        const [key, ...val] = line.trim().split('=');
        if (key && val.length) acc[key.trim()] = val.join('=').trim();
        return acc;
      }, {})
  : {};

const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_KEY = envConfig.VITE_SUPABASE_ANON_KEY;

async function recordSettlement(payload) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[DB] Supabase credentials missing in .env. Skipping database sync.');
    return;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/settlements`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[DB] Failed to insert settlement:', err);
    } else {
      console.log('[DB] Settlement recorded successfully in Supabase.');
    }
  } catch (err) {
    console.error('[DB] Network error sync to Supabase:', err.message);
  }
}

// 2. CONFIG & PROTOCOL WALLETS
const DEVNET_RPC = 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC, 'confirmed');

const VENDOR_WALLET = new PublicKey('7LLjrqrfvg6qQKee8bX8XQyT9J8NFQWtyzzj2K8rGXpB');
const ADMIN_WALLET = new PublicKey('9bvD1899yYZCf2MKeuds59EXAGgVBwuFkrCS1Cgo3AhS');
const AFFILIATE_WALLET = new PublicKey('FU6cLtPS4eUBy92xa96Fb7pdaFv8A93LdEpT7MyHi7uh');

// 3. LOAD OR PERSIST AGENT BOT KEYPAIR
const KEYPAIR_FILE = './bot-keypair.json';
let agentWallet;

if (fs.existsSync(KEYPAIR_FILE)) {
  const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_FILE, 'utf-8')));
  agentWallet = Keypair.fromSecretKey(secretKey);
} else {
  agentWallet = Keypair.generate();
  fs.writeFileSync(KEYPAIR_FILE, JSON.stringify(Array.from(agentWallet.secretKey)));
}

console.log(`[BOOT] Persistent Agent Wallet: ${agentWallet.publicKey.toBase58()}`);

// 4. ATOMIC 90/5/5 ON-CHAIN SETTLEMENT
async function executeAutonomousProcure(sku, priceSol) {
  const totalLamports = Math.round(priceSol * LAMPORTS_PER_SOL);
  const vendorLamports = Math.floor(totalLamports * 0.90);
  const adminLamports = Math.floor(totalLamports * 0.05);
  const affiliateLamports = totalLamports - vendorLamports - adminLamports;

  const transaction = new Transaction();

  // 90% Vendor Allocation
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: agentWallet.publicKey,
      toPubkey: VENDOR_WALLET,
      lamports: vendorLamports,
    })
  );

  // 5% Admin Protocol Fee
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: agentWallet.publicKey,
      toPubkey: ADMIN_WALLET,
      lamports: adminLamports,
    })
  );

  // 5% Affiliate Split
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: agentWallet.publicKey,
      toPubkey: AFFILIATE_WALLET,
      lamports: affiliateLamports,
    })
  );

  console.log(`[TX] Signing & broadcasting atomic transaction to Solana Devnet...`);

  const txSig = await sendAndConfirmTransaction(
    connection,
    transaction,
    [agentWallet],
    { commitment: 'confirmed' }
  );

  const licenseKey = 'AUTON-' + crypto.randomBytes(4).toString('hex').toUpperCase() + '-SOL';

  console.log(`\n==================================================`);
  console.log(`[SUCCESS] On-Chain Settlement Confirmed!`);
  console.log(`[SPLIT] Vendor (90%): +${vendorLamports / LAMPORTS_PER_SOL} SOL | Admin (5%): +${adminLamports / LAMPORTS_PER_SOL} SOL | Affiliate (5%): +${affiliateLamports / LAMPORTS_PER_SOL} SOL`);
  console.log(`[LICENSE] Emitted License Key: ${licenseKey}`);
  console.log(`[SOLSCAN] https://solscan.io/tx/${txSig}?cluster=devnet`);
  console.log(`==================================================\n`);

  // Record settlement to Supabase database
  await recordSettlement({
    tx_signature: txSig,
    sku: sku,
    buyer_wallet: agentWallet.publicKey.toBase58(),
    vendor_wallet: VENDOR_WALLET.toBase58(),
    admin_wallet: ADMIN_WALLET.toBase58(),
    affiliate_wallet: AFFILIATE_WALLET.toBase58(),
    gross_sol: priceSol,
    vendor_sol: vendorLamports / LAMPORTS_PER_SOL,
    admin_sol: adminLamports / LAMPORTS_PER_SOL,
    affiliate_sol: affiliateLamports / LAMPORTS_PER_SOL,
    license_key: licenseKey,
    status: 'Settled'
  });
}

async function main() {
  const balanceLamports = await connection.getBalance(agentWallet.publicKey);
  const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
  console.log(`[GAS] Current Balance: ${balanceSol} SOL`);

  const requiredSol = 0.03;
  if (balanceSol < requiredSol) {
    console.log(`\n[WARN] Insufficient agent balance for autonomous settlement.`);
    console.log(`Please transfer at least 0.05 Devnet SOL to this agent address:`);
    console.log(`👉  ${agentWallet.publicKey.toBase58()}  👈\n`);
    return;
  }

  console.log(`\n[TASK] Resource depleted for SKU: FEED-SOL-SENTIMENT`);
  console.log(`[DECISION] Executing autonomous settlement for 0.025 SOL...`);
  await executeAutonomousProcure('FEED-SOL-SENTIMENT', 0.025);
}

main().catch(console.error);