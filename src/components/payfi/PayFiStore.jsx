import React, { useState } from 'react';
import { initialProducts } from '../../data/products';
import { executePayFiPurchase } from '../../utils/solanaPay';

export default function PayFiStore({ solPriceUsd = 145 }) {
  const [products] = useState(initialProducts);
  const [loadingId, setLoadingId] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const handleBuy = async (product) => {
    setLoadingId(product.id);
    try {
      if (typeof window !== 'undefined' && window.solana?.isPhantom) {
        const res = await executePayFiPurchase({
          wallet: window.solana,
          vendorAddress: product.vendorWallet,
          priceSol: product.priceSol,
          productSku: product.sku
        });
        setReceipt({
          ...res,
          title: product.title,
          productLink: product.instantAccessUrl,
          priceSol: product.priceSol
        });
      } else {
        // Fallback simulation for non-wallet environment
        setTimeout(() => {
          setReceipt({
            signature: '5wKz' + Math.random().toString(36).substring(2, 8),
            explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
            merchantCut: (product.priceSol * 0.90).toFixed(4),
            adminCut: (product.priceSol * 0.05).toFixed(4),
            affiliateCut: (product.priceSol * 0.05).toFixed(4),
            title: product.title,
            productLink: product.instantAccessUrl,
            priceSol: product.priceSol,
            sku: product.sku
          });
        }, 800);
      }
    } catch (err) {
      alert('Purchase failed: ' + (err.message || 'Transaction cancelled'));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-3 font-sans pb-4">
      
      {/* Mobile Streamlined Asset List */}
      <div className="space-y-2">
        {products.map((p) => {
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
        })}
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