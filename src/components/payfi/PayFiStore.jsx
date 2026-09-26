import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { executePayFiPayment } from '../../services/payfiService';

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    sku: 'SKU-01',
    title: 'Solana PayFi Full Source Code',
    category: '💻 Software',
    priceSol: '0.005',
    vendorWallet: 'BvmRYWTbkCwNqVUEeD7qgVqzM9rXh9egrDiWDBcsofny'
  },
  {
    id: 2,
    sku: 'SKU-02',
    title: 'Enterprise Multi-Vendor License Key',
    category: '🔑 License',
    priceSol: '0.003',
    vendorWallet: 'H8XSVM7UDZbk5eFhzWMLU5WPKZwNLBo85wGbrfPDX6Gw'
  },
  {
    id: 3,
    sku: 'SKU-03',
    title: 'PayFi SDK: Hybrid Settlement Gateway',
    category: '⚡ Web3 Core',
    priceSol: '0.0019',
    vendorWallet: 'FU6cLtPS4eUBy92xa96Fb7pdaFv8A93LdEpT7MyHi7uh'
  }
];

export default function PayFiStore({ solPriceUsd = 145, affiliateAddress = null }) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [loadingSku, setLoadingSku] = useState(null);
  const [txResult, setTxResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [search, setSearch] = useState('');

  const handleBuy = async (product) => {
    setErrorMsg(null);
    setTxResult(null);

    // 1. Cek koneksi wallet
    if (!connected || !publicKey) {
      if (openWalletModal) {
        openWalletModal(true);
      } else {
        alert('Silakan hubungkan dompet Phantom Devnet Anda terlebih dahulu!');
      }
      return;
    }

    try {
      setLoadingSku(product.sku);

      // 2. Eksekusi Pembayaran On-Chain Atomik 90/5/5
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
      setErrorMsg(err.message || 'Transaksi dibatalkan atau Devnet SOL tidak mencukupi.');
    } finally {
      setLoadingSku(null);
    }
  };

  const filtered = DEFAULT_PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-3 font-sans pb-8">
      
      {/* Search Input */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
        <span className="text-cyan-400 text-xs">🔍</span>
        <input
          type="text"
          placeholder="Cari produk lisensi, source code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
        />
      </div>

      {/* Banner Error */}
      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Kuitansi Sukses On-Chain */}
      {txResult && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-700/80 rounded-xl text-xs text-emerald-300 space-y-2 shadow-lg font-mono">
          <div className="font-bold flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span>✅</span> Settlement On-Chain Berhasil!
            </span>
            <span className="text-[10px] bg-emerald-900/60 border border-emerald-700 px-1.5 py-0.5 rounded">
              Devnet
            </span>
          </div>
          
          <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
            Lisensi <strong>{txResult.productTitle}</strong> berhasil diterbitkan.
          </div>

          <div className="bg-[#060a12] p-2 rounded-lg border border-emerald-900/60 text-[10px] text-slate-400 space-y-0.5">
            <div className="text-cyan-300 font-bold">Split Atomik 90 / 5 / 5:</div>
            <div>• Vendor (90%): +{(txResult.priceSol * 0.9).toFixed(4)} SOL</div>
            <div>• Platform Fee (5%): +{(txResult.priceSol * 0.05).toFixed(4)} SOL</div>
            <div>• Affiliate Split (5%): +{(txResult.priceSol * 0.05).toFixed(4)} SOL</div>
          </div>

          <a
            href={txResult.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-[11px] text-cyan-400 underline hover:text-cyan-300 pt-0.5"
          >
            Lihat Bukti Transaksi di Solscan Devnet ↗
          </a>
        </div>
      )}

      {/* Header List */}
      <div className="flex justify-between items-center px-1 text-xs text-slate-400">
        <span className="font-bold text-white flex items-center gap-1">
          <span>🛍️</span> Katalog Produk PayFi
        </span>
        <span className="font-mono text-[10px]">{filtered.length} Active Items</span>
      </div>

      {/* Baris Produk */}
      <div className="space-y-2">
        {filtered.map((item) => {
          const isLoading = loadingSku === item.sku;
          const idrPrice = Math.round(Number(item.priceSol) * solPriceUsd * 16000);

          return (
            <div
              key={item.sku}
              className="bg-[#0b1329] border border-slate-800/90 hover:border-cyan-800/60 rounded-2xl p-3 flex items-center justify-between gap-2.5 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-[#121c38] border border-slate-800 flex items-center justify-center text-base flex-shrink-0">
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

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right font-mono">
                  <div className="text-xs font-black text-cyan-400 leading-tight">
                    {item.priceSol} SOL
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    Rp {idrPrice.toLocaleString('id-ID')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuy(item)}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-blue-900/30 active:scale-95 transition"
                >
                  <span>{isLoading ? '⏳' : '🛒'}</span>
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