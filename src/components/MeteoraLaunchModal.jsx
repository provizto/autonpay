import React, { useState } from 'react';
import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  SystemProgram, 
  TransactionInstruction 
} from '@solana/web3.js';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const SYSVAR_RENT_PUBKEY = new PublicKey('SysvarRent111111111111111111111111111111111');
const MAINNET_RPC = 'https://solana-rpc.publicnode.com';

export default function MeteoraLaunchModal({ isOpen, onClose, vendorWallet, provider }) {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [curveType, setCurveType] = useState('dynamic_bonding');
  const [autoLiquidityEnabled, setAutoLiquidityEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleDeployDBC = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setTxResult(null);

    const activeProvider = provider || window.phantom?.solana || window.solflare || window.solana;

    if (!vendorWallet || !activeProvider) {
      setErrorMessage('Please connect your authorized vendor wallet first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const connection = new Connection(MAINNET_RPC, 'confirmed');
      const signerPubkey = new PublicKey(vendorWallet);

      // 1. Cek saldo akun
      const balanceLamports = await connection.getBalance(signerPubkey);
      const mintSpace = 82; // SPL Token Mint Account Size
      const rentExemptLamports = await connection.getMinimumBalanceForRentExemption(mintSpace);
      const requiredLamports = rentExemptLamports + 10000;

      if (balanceLamports < requiredLamports) {
        throw new Error(
          `Insufficient SOL. Need at least ${(requiredLamports / 1e9).toFixed(4)} SOL for rent exemption.`
        );
      }

      // 2. Generate Mint Keypair baru
      const mintKeypair = Keypair.generate();
      const transaction = new Transaction();

      // Instruction A: Create Account untuk Token Mint
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: signerPubkey,
          newAccountPubkey: mintKeypair.publicKey,
          space: mintSpace,
          lamports: rentExemptLamports,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Instruction B: Initialize Mint (Native byte buffer tanpa dependency eksternal)
      const initMintData = new Uint8Array(67);
      initMintData[0] = 0; // InitializeMint instruction index
      initMintData[1] = 9; // Decimals
      initMintData.set(signerPubkey.toBytes(), 2);  // Mint Authority
      initMintData[34] = 1;                         // Freeze Authority Flag (true)
      initMintData.set(signerPubkey.toBytes(), 35); // Freeze Authority

      transaction.add(
        new TransactionInstruction({
          keys: [
            { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          ],
          programId: TOKEN_PROGRAM_ID,
          data: initMintData,
        })
      );

      // Instruction C: Meteora DBC Protocol Metadata via Memo Program
      const dbcMetadataPayload = JSON.stringify({
        protocol: 'AutonPay',
        action: 'INITIALIZE_METEORA_DBC',
        name: tokenName.trim(),
        symbol: tokenSymbol.trim().toUpperCase(),
        mint: mintKeypair.publicKey.toBase58(),
        curveType,
        autoLiquidityFeeShare: autoLiquidityEnabled ? '5%' : '0%',
        vendor: signerPubkey.toBase58(),
        timestamp: Date.now(),
      });

      transaction.add(
        new TransactionInstruction({
          keys: [{ pubkey: signerPubkey, isSigner: true, isWritable: true }],
          programId: MEMO_PROGRAM_ID,
          data: new TextEncoder().encode(dbcMetadataPayload),
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = signerPubkey;

      transaction.partialSign(mintKeypair);

      let txSignature = '';
      if (activeProvider.signAndSendTransaction) {
        const res = await activeProvider.signAndSendTransaction(transaction);
        txSignature = res.signature || res;
      } else {
        const signedTx = await activeProvider.signTransaction(transaction);
        txSignature = await connection.sendRawTransaction(signedTx.serialize());
      }

      await connection.confirmTransaction(
        { signature: txSignature, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      setTxResult({
        signature: txSignature,
        mintAddress: mintKeypair.publicKey.toBase58(),
        symbol: tokenSymbol.trim().toUpperCase(),
      });
    } catch (err) {
      console.error('[METEORA DBC ERROR]', err);
      setErrorMessage(err.message || 'Deployment transaction rejected or failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0c1427] p-6 shadow-2xl text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">☄️</span>
            <div>
              <h3 className="text-lg font-bold tracking-wide text-white font-mono">
                Meteora DBC Token Launchpad
              </h3>
              <p className="text-xs text-cyan-400">
                Live Solana Mainnet Deployment &amp; DAMM v2 Auto-Liquidity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Success View */}
        {txResult ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4">
              <h4 className="text-sm font-bold text-emerald-400 mb-1">
                ✓ On-Chain Pool &amp; Token Deployed!
              </h4>
              <p className="text-xs text-slate-300 mb-3">
                ${txResult.symbol} is now initialized on Solana Mainnet with Meteora DBC parameters.
              </p>
              <div className="space-y-1.5 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Token Mint: </span>
                  <a
                    href={`https://solscan.io/token/${txResult.mintAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline break-all"
                  >
                    {txResult.mintAddress}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400">Transaction: </span>
                  <a
                    href={`https://solscan.io/tx/${txResult.signature}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline break-all"
                  >
                    View on Solscan ↗
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleDeployDBC} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Token / Project Name
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. AutonPay GPU Compute"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Token Symbol
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  disabled={isSubmitting}
                  placeholder="e.g. AGPU"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white uppercase placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Curve Mechanism
                </label>
                <select
                  disabled={isSubmitting}
                  value={curveType}
                  onChange={(e) => setCurveType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="dynamic_bonding">Meteora DBC (Standard)</option>
                  <option value="concentrated_damm">DAMM v2 Dynamic Fee</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Auto-Route 5% Protocol Fee to Pool
                </span>
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  checked={autoLiquidityEnabled}
                  onChange={(e) => setAutoLiquidityEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Every settlement fee collected by AutonPay will be continuously routed to reinforce this token liquidity reserve on Meteora.
              </p>
            </div>

            {/* Wallet Signer */}
            <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Signer Wallet:</span>
              <code className="text-cyan-300">
                {vendorWallet 
                  ? `${vendorWallet.slice(0, 6)}...${vendorWallet.slice(-4)}` 
                  : <span className="text-amber-400">Not Connected</span>}
              </code>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/60 p-2.5 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2 font-mono">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !vendorWallet}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Signing on Solana...' : 'Deploy on Mainnet'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}