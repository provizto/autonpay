import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { executePayFiPayment } from '../../services/payfiService';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    sku: 'SKU-01',
    title: 'Solana PayFi Full Source Code',
    category: 'AI Models',
    priceSol: 0.05,
    vendorWallet: 'BvmRYWTbkCwNqVUEeD7qgVqzM9rXh9egrDiWDBcsofny',
    description: 'Autonomous M2M settlement protocol engine and smart relayer stack.'
  },
  {
    id: 2,
    sku: 'SKU-02',
    title: 'Enterprise Multi-Vendor License Key',
    category: 'SDK & Code',
    priceSol: 0.03,
    vendorWallet: 'H8XSVM7UDZbk5eFhzWMLU5WPKZwNLBo85wGbrfPDX6Gw',
    description: 'Cryptographic node access key with high throughput and telemetry integration.'
  },
  {
    id: 3,
    sku: 'SKU-03',
    title: 'PayFi SDK: Hybrid Settlement Gateway',
    category: 'Compute Clusters',
    priceSol: 0.019,
    vendorWallet: 'FU6cLtPS4eUBy92xa96Fb7pdaFv8A93LdEpT7MyHi7uh',
    description: 'Real-time atomic revenue split mechanism for decentralized AI workloads.'
  }
];

export default function PayFiStore({ 
  solPriceUsd = 145, 
  products = [], 
  onBuyProduct,
  walletAddress,
  onConnectWallet,
  affiliateAddress = null 
}) {
  // Gunakan produk dinamis dari App/Supabase, fallback jika belum termuat
  const displayProducts = products && products.length > 0 ? products : FALLBACK_PRODUCTS;

  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [loadingSku, setLoadingSku] = useState(null);
  const [txResult, setTxResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [search, setSearch] = useState('');

  // Handler Pembelian (Terintegrasi ke App.jsx jika tersedia)
  const handleBuy = async (product) => {
    setErrorMsg(null);
    setTxResult(null);

    // 1. Jika terhubung via props App.jsx (MobileView), delegasikan ke executeBuy terpusat
    if (onBuyProduct) {
      onBuyProduct(product);
      return;
    }

    // 2. Standalone fallback (menggunakan Wallet Adapter lokal)
    if (!connected || !publicKey) {
      if (openWalletModal) {
        openWalletModal(true);
      } else if (onConnectWallet) {
        onConnectWallet();
      } else {
        alert('Please connect your Solana wallet first!');
      }
      return;
    }

    try {
      setLoadingSku(product.sku);

      const res = await executePayFiPayment({
        wallet: { publicKey, sendTransaction },
        vendorAddress: product.vendorWallet,
        affiliateAddress: affiliateAddress,
        amountSol: parseFloat(product.priceSol),
        licenseId: `AUTON-${product.sku}-${Date.now().toString().slice(-4)}`,
        productTitle: product.title
      });

      setTxResult({
        ...res,
        productTitle: product.title,
        priceSol: product.priceSol
      });
    } catch (err) {
      console.error('PayFi Purchase Error:', err);
      setErrorMsg(err.message || 'Transaction cancelled or insufficient Devnet SOL.');
    } finally {
      setLoadingSku(null);
    }
  };

  const filtered = displayProducts.filter(p => 
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-3 font-sans pb-4">
      
      {/* Search Bar */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
        <span className="text-cyan-400 text-xs">🔍</span>
        <input
          type="text"
          placeholder="Search license, compute asset, SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full font-mono"
        />
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Standalone Local Fallback Receipt */}
      {txResult && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-700/80 rounded-xl text-xs text-emerald-300 space-y-2 shadow-lg font-mono">
          <div className="font-bold flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span>✅</span> Settlement Confirmed!
            </span>
            <span className="text-[10px] bg-emerald-900/60 border border-emerald-700 px-1.5 py-0.5 rounded">
              Devnet
            </span>
          </div>
          
          <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
            License for <strong>{txResult.productTitle}</strong> issued successfully.
          </div>

          <div className="bg-[#060a12] p-2 rounded-lg border border-emerald-900/60 text-[10px] text-slate-400 space-y-0.5">
            <div className="text-cyan-300 font-bold">Atomic 90 / 5 / 5 Fee Split:</div>
            <div>• Vendor Payout (90%): +{(txResult.priceSol * 0.9).toFixed(4)} SOL</div>
            <div>• Platform Fee (5%): +{(txResult.priceSol * 0.05).toFixed(4)} SOL</div>
            <div>• Affiliate Split (5%): +{(txResult.priceSol * 0.05).toFixed(4)} SOL</div>
          </div>

          <a
            href={txResult.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-[11px] text-cyan-400 underline hover:text-cyan-300 pt-0.5"
          >
            View on Solscan Devnet ↗
          </a>
        </div>
      )}

      {/* Catalog Header */}
      <div className="flex justify-between items-center px-1 text-xs text-slate-400 font-mono">
        <span className="font-bold text-white flex items-center gap-1">
          <span>🛍️</span> PayFi Product Catalog
        </span>
        <span className="text-[10px] text-slate-500">{filtered.length} Active Items</span>
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {filtered.map((item) => {
          const isLoading = loadingSku === item.sku;
          const usdPrice = (Number(item.priceSol) * solPriceUsd).toFixed(2);

          return (
            <div
              key={item.id || item.sku}
              className="bg-[#0b1329] border border-slate-800/90 hover:border-cyan-800/60 rounded-2xl p-3 flex items-center justify-between gap-2.5 transition active:scale-[0.99] shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-[#121c38] border border-slate-800 flex items-center justify-center text-base shrink-0">
                  📦
                </div>
                <div className="min-w-0 pr-1">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                    {item.category} • {item.sku}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right font-mono">
                  <div className="text-xs font-black text-cyan-400 leading-tight">
                    {item.priceSol} SOL
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    ≈ ${usdPrice}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuy(item)}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 active:scale-95 disabled:bg-slate-800 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md transition"
                >
                  <span>{isLoading ? '⏳' : '⚡'}</span>
                  <span>{isLoading ? 'Signing...' : 'Buy'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}