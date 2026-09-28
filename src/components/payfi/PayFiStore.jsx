import React, { useState } from 'react';
import { executePayFiPurchase } from '../../utils/solanaPay';

// Multi-Wallet Auto Detection (Phantom, Solflare, Backpack, Solana Browser)
const getSolanaProvider = () => {
  if (typeof window === 'undefined') return null;
  return window.phantom?.solana || window.solflare || window.backpack || window.solana || null;
};

export default function PayFiStore({ 
  solPriceUsd = 145, 
  products: propProducts = [], 
  onBuyProduct 
}) {
  const products = propProducts || [];
  const [loadingId, setLoadingId] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const handleBuy = async (product) => {
    // 1. Prioritize primary handler from App.jsx if provided
    if (onBuyProduct) {
      onBuyProduct(product);
      return;
    }

    setLoadingId(product.id);

    try {
      const provider = getSolanaProvider();

      // 2. Require an active Solana wallet
      if (!provider) {
        alert('Solana wallet not detected! Please open this app inside Phantom, Solflare, or Backpack in-app browser.');
        setLoadingId(null);
        return;
      }

      // 3. Request connection if not connected yet
      if (!provider.publicKey) {
        try {
          await provider.connect();
        } catch {
          alert('Wallet connection rejected. Please connect your wallet to purchase.');
          setLoadingId(null);
          return;
        }
      }

      // 4. Execute on-chain settlement
      const res = await executePayFiPurchase({
        wallet: provider,
        vendorAddress: product.vendorWallet,
        priceSol: product.priceSol,
        productSku: product.sku
      });

      setReceipt({
        ...res,
        title: product.title,
        productLink: product.instantAccessUrl,
        priceSol: product.priceSol,
        merchantCut: res?.merchantCut || (product.priceSol * 0.90).toFixed(4),
        adminCut: res?.adminCut || (product.priceSol * 0.05).toFixed(4),
        affiliateCut: res?.affiliateCut || (product.priceSol * 0.05).toFixed(4),
        signature: res?.signature || res?.txSignature
      });

    } catch (err) {
      console.error(err);
      alert('Purchase failed: ' + (err.message || 'Transaction rejected or insufficient Devnet SOL.'));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-3 font-sans pb-4">
      
      {/* Mobile Streamlined Asset List */}
      <div className="space-y-2">
        {products.length === 0 ? (
          <div className="bg-[#0b1222] border border-slate-800/80 p-6 rounded-2xl text-center text-slate-500 text-xs font-mono">
            No live products available.
          </div>
        ) : (
          products.map((p) => {
            const usdValue = (p.priceSol * solPriceUsd).toFixed(2);
            const isBuying = loadingId === p.id;

            return (
              <div
                key={p.id}
                className="bg-[#0b1222] border border-slate-800/80 hover:border-cyan-500/40 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-md transition"
              >
                {/* Product Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                    📦
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate leading-snug">
                      {p.title}
                    </h4>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {p.category} • {p.sku}
                    </div>
                  </div>
                </div>

                {/* Pricing & Buy Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-cyan-400">
                      {p.priceSol} SOL
                    </div>
                    <div className="text-[9px] text-slate-500">
                      ≈ ${usdValue}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isBuying}
                    onClick={() => handleBuy(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1 shadow ${
                      isBuying
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                    }`}
                  >
                    <span>{isBuying ? '🌀' : '⚡'}</span>
                    <span>{isBuying ? '...' : 'Buy'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Settlement Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1222] border border-cyan-500/60 w-full max-w-sm rounded-2xl p-4 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span>✅</span> <span>PAYFI SETTLEMENT CONFIRMED</span>
            </div>

            <div className="bg-[#060a12] p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-white font-bold truncate">{receipt.title}</div>
              <div className="text-cyan-400 font-bold">{receipt.priceSol} SOL</div>
              
              <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1">
                Vendor: +{receipt.merchantCut} SOL (90%) <br />
                Admin: +{receipt.adminCut} SOL (5%) <br />
                Affiliate: +{receipt.affiliateCut} SOL (5%)
              </div>

              {receipt.signature && (
                <div className="text-[10px] text-slate-400 pt-1">
                  Tx Signature:{' '}
                  <a
                    href={`https://solscan.io/tx/${receipt.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline font-bold"
                  >
                    {receipt.signature.slice(0, 10)}... (Solscan ↗)
                  </a>
                </div>
              )}
              
              {receipt.productLink && (
                <div className="pt-1.5 border-t border-slate-800">
                  <a
                    href={receipt.productLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 underline font-bold text-[11px] block truncate"
                  >
                    🔗 Open Product / Drive Link ↗
                  </a>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl transition"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}