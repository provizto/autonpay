import React, { useState } from 'react';

export default function VendorPortal({ 
  vendorWallet, 
  products = [], 
  onAddProduct, 
  onDeleteProduct,
  sales = [] 
}) {
  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    category: 'Compute & LLM',
    priceSol: '',
    instantAccessUrl: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const vendorSales = sales;
  const totalGross = vendorSales.reduce((acc, s) => acc + (s.grossSol || 0), 0);
  const netEarnings = vendorSales.reduce((acc, s) => acc + (s.netVendorSol || s.grossSol * 0.9), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.title || !formData.priceSol) {
      alert('Please fill in SKU, Title, and Price in SOL.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newProd = {
        id: `prod-${Date.now().toString().slice(-4)}`,
        sku: formData.sku.toUpperCase().trim(),
        title: formData.title.trim(),
        category: formData.category,
        priceSol: parseFloat(formData.priceSol),
        seller: vendorWallet ? `${vendorWallet.slice(0, 4)}...${vendorWallet.slice(-4)}` : 'Vendor-Node',
        vendorWallet: vendorWallet || 'BvmRYWTbkCwNqVUEeD7qgVqzM9rXh9egrDiWDBcsofny',
        instantAccessUrl: formData.instantAccessUrl || 'https://api.autonpay.network/v1/auth',
        description: formData.description || 'API pass for autonomous agents.'
      };

      if (onAddProduct) onAddProduct(newProd);

      setSuccessMsg(`Asset ${newProd.sku} successfully listed on marketplace!`);
      setFormData({
        sku: '',
        title: '',
        category: 'Compute & LLM',
        priceSol: '',
        instantAccessUrl: '',
        description: ''
      });
      setIsSubmitting(false);

      setTimeout(() => setSuccessMsg(null), 4000);
    }, 300);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Vendor Header Info */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-cyan-950 border border-cyan-800 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">
              VENDOR CONSOLE
            </span>
            <span className="text-xs font-mono text-slate-400">90% Direct Settlement</span>
          </div>
          <h2 className="text-lg font-bold text-white">Merchant & Creator Dashboard</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Connected Wallet: <span className="text-cyan-300 font-bold">{vendorWallet || 'Solana Devnet Wallet'}</span>
          </p>
        </div>

        {/* Store Revenue Metrics */}
        <div className="flex items-center gap-3 font-mono">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[10px] text-slate-500 uppercase block">Total Sales</span>
            <span className="text-sm font-bold text-white">{totalGross.toFixed(4)} SOL</span>
          </div>
          <div className="bg-slate-950 border border-emerald-900/80 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[10px] text-emerald-400 uppercase block">Net Payout (90%)</span>
            <span className="text-sm font-bold text-emerald-400">+{netEarnings.toFixed(4)} SOL</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Register New Asset Form */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-cyan-400 font-bold">📦</span>
            <h3 className="text-sm font-bold text-white font-mono uppercase">Register New Asset / API</h3>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-700/80 text-emerald-300 text-xs rounded-xl font-mono">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ASSET SKU</label>
              <input
                type="text"
                placeholder="e.g. LLM-REASON-V2"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">PRODUCT TITLE</label>
              <input
                type="text"
                placeholder="e.g. DeepSeek-R1 Realtime Inference Node"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">CATEGORY</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white outline-none focus:border-cyan-500 text-[11px]"
                >
                  <option value="Compute & LLM">Compute & LLM</option>
                  <option value="Data Feeds">Data Feeds</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Datasets">Datasets</option>
                  <option value="Smart Contracts">Smart Contracts</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PRICE (SOL)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.05"
                  value={formData.priceSol}
                  onChange={(e) => setFormData({ ...formData, priceSol: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-bold outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ACCESS / WEBSOCKET ENDPOINT</label>
              <input
                type="url"
                placeholder="https://api.autonpay.network/v1/..."
                value={formData.instantAccessUrl}
                onChange={(e) => setFormData({ ...formData, instantAccessUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none focus:border-cyan-500 text-[11px]"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">DESCRIPTION</label>
              <textarea
                rows="2"
                placeholder="Brief description of the API specifications or license terms..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 outline-none focus:border-cyan-500 font-sans text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-cyan-950 active:scale-98"
            >
              {isSubmitting ? 'Registering on-chain...' : 'Publish to Marketplace'}
            </button>
          </form>
        </div>

        {/* Listings & Sales Ledger */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Active Listings Table */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>🏷️</span> Your Active Listings ({products.length})
              </span>
              <span className="text-slate-500">Auto-routed 90% payout</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {products.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  No active listings found. Register a new asset on the left.
                </div>
              ) : (
                products.map((p) => (
                  <div key={p.id} className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                          {p.sku}
                        </span>
                        <span className="font-bold text-white truncate">{p.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                        {p.category} • Endpoint: {p.instantAccessUrl ? p.instantAccessUrl.slice(0, 32) : 'Default'}...
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono flex-shrink-0">
                      <div className="text-right">
                        <div className="text-cyan-400 font-bold">{p.priceSol} SOL</div>
                        <div className="text-[9px] text-emerald-400">Net: +{(p.priceSol * 0.9).toFixed(4)} SOL</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Remove listing ${p.sku} (${p.title}) from the marketplace?`)) {
                            onDeleteProduct?.(p.id);
                          }
                        }}
                        className="bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 px-2 py-1 rounded-lg text-xs transition"
                        title="Delete this listing"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sales Ledger */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>📜</span> Inbound Payout Ledger
              </span>
              <span className="text-emerald-400 font-bold">Status: Instant Finality</span>
            </div>

            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2">Gross</th>
                    <th className="pb-2">Your 90% Cut</th>
                    <th className="pb-2">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vendorSales.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-slate-500 text-xs">
                        No sales transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    vendorSales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-2 text-slate-400">{s.time}</td>
                        <td className="py-2 text-cyan-300 font-bold">{s.sku}</td>
                        <td className="py-2 text-white">{s.grossSol} SOL</td>
                        <td className="py-2 text-emerald-400 font-bold">+{(s.netVendorSol || s.grossSol * 0.9).toFixed(4)} SOL</td>
                        <td className="py-2">
                          <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded">
                            Settled
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}