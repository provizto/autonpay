import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// 1. Supabase Initialization
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Solana Devnet Configuration
const RPC_ENDPOINT = process.env.VITE_SOLANA_RPC_URL || 'https://solana-rpc.publicnode.com';
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Protocol Wallets
const TARGET_VENDOR = new PublicKey('ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4');
const TARGET_ADMIN = new PublicKey('ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4');
const TARGET_AFFILIATE = new PublicKey('ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4');

// Load or Generate Agent Keypair
let agentKeypair;
const KEYPAIR_FILE = './agent-wallet.json';

if (fs.existsSync(KEYPAIR_FILE)) {
  const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_FILE, 'utf8')));
  agentKeypair = Keypair.fromSecretKey(secretKey);
} else {
  agentKeypair = Keypair.generate();
  fs.writeFileSync(KEYPAIR_FILE, JSON.stringify(Array.from(agentKeypair.secretKey)));
  console.log(`[INIT] Generated new Agent Keypair: ${agentKeypair.publicKey.toBase58()}`);
}

const AGENT_PUBKEY = agentKeypair.publicKey;

// Task SKU Catalog to simulate M2M purchasing
const AGENT_CATALOG = [
  { sku: 'API-LLM-10M', priceSol: 0.005 },
  { sku: 'FEED-SOL-SENTIMENT', priceSol: 0.003 },
  { sku: 'GPU-H100-1HR', priceSol: 0.007 }
];

async function executeAgentPurchase() {
  const task = AGENT_CATALOG[Math.floor(Math.random() * AGENT_CATALOG.length)];
  const timestamp = new Date().toLocaleTimeString('en-US');

  console.log(`\n======================================================`);
  console.log(`[${timestamp}] 🤖 M2M TRIGGER: Quota low for [${task.sku}]`);
  console.log(`Target Amount: ${task.priceSol} SOL | Payer: ${AGENT_PUBKEY.toBase58()}`);

  try {
    const balance = await connection.getBalance(AGENT_PUBKEY);
    const balanceSol = balance / LAMPORTS_PER_SOL;
    console.log(`[BALANCE] Current Gas Tank: ${balanceSol.toFixed(4)} SOL`);

    if (balanceSol < task.priceSol + 0.001) {
      console.log(`⚠️ Insufficient Mainnet SOL balance to trigger on-chain TX.`);
      console.log(`👉 Fund agent wallet with real SOL: ${AGENT_PUBKEY.toBase58()}`);
      return;
    }

    // Split Calculation (90% / 5% / 5%)
    const totalLamports = Math.round(task.priceSol * LAMPORTS_PER_SOL);
    const vendorLamports = Math.floor(totalLamports * 0.90);
    const adminLamports = Math.floor(totalLamports * 0.05);
    const affiliateLamports = totalLamports - vendorLamports - adminLamports;

    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({ fromPubkey: AGENT_PUBKEY, toPubkey: TARGET_VENDOR, lamports: vendorLamports }),
      SystemProgram.transfer({ fromPubkey: AGENT_PUBKEY, toPubkey: TARGET_ADMIN, lamports: adminLamports }),
      SystemProgram.transfer({ fromPubkey: AGENT_PUBKEY, toPubkey: TARGET_AFFILIATE, lamports: affiliateLamports })
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = AGENT_PUBKEY;
    transaction.sign(agentKeypair);

    console.log(`[TX] Broadcasting 90/5/5 atomic transfer to Solana Mainnet...`);
    const txSignature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction({ signature: txSignature, blockhash, lastValidBlockHeight }, 'confirmed');

    const generatedLicense = 'AUTON-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-SOL';
    console.log(`✅ SETTLED ON-CHAIN!`);
    console.log(`   Tx Hash: ${txSignature}`);
    console.log(`   License: ${generatedLicense}`);

    // Poin 1: Simpan riil ke database Supabase
    console.log(`[DB] Syncing settlement to Supabase...`);
    const { error: dbError } = await supabase.from('settlements').insert([{
      tx_signature: txSignature,
      sku: task.sku,
      buyer_wallet: AGENT_PUBKEY.toBase58(),
      vendor_wallet: TARGET_VENDOR.toBase58(),
      admin_wallet: TARGET_ADMIN.toBase58(),       // <--- Tambahkan ini
      affiliate_wallet: TARGET_AFFILIATE.toBase58(), // <--- Tambahkan ini juga
      gross_sol: task.priceSol,
      vendor_sol: Number((task.priceSol * 0.90).toFixed(5)),
      admin_sol: Number((task.priceSol * 0.05).toFixed(5)),
      affiliate_sol: Number((task.priceSol * 0.05).toFixed(5)),
      license_key: generatedLicense,
      status: 'Settled'
    }]);

    if (dbError) {
      console.error(`❌ DB Sync Failed:`, dbError.message);
    } else {
      console.log(`⚡ DB Sync SUCCESS: Broadcasted to live web application!`);
    }

  } catch (err) {
    console.error(`❌ Purchase failed:`, err.message);
  }
}

// Poin 3: Daemon Loop (Berjalan berkala setiap 25 detik)
console.log(`🚀 AUTONPAY DAEMON BOT ACTIVATED`);
console.log(`Agent Wallet Address : ${AGENT_PUBKEY.toBase58()}`);
console.log(`Settlement Node      : Solana Mainnet`);
console.log(`Sync Target          : Supabase Settlements Table`);
console.log(`Running loop every 25 seconds... (Press Ctrl+C to terminate)\n`);

// Eksekusi langsung 1x saat pertama jalan
executeAgentPurchase();

// Loop berkelanjutan
setInterval(() => {
  executeAgentPurchase();
}, 900000);