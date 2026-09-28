import React, { useState } from 'react';

export default function VendorPortal({ 
  vendorWallet, 
  products = [], 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  sales = [] 
}) {
  // State Form Tambah Produk
  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    category: 'Google Drive / Files',
    priceSol: '',
    instantAccessUrl: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // State Modal Edit Produk
  const [editingProduct, setEditingProduct] = useState(null);

  // State Modal Panduan Kategori (Bilingual: EN & ID)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryGuideLang, setCategoryGuideLang] = useState('en');

  // Perhitungan Keuangan Vendor (90% Hak Vendor)
  const vendorSales = sales;
  const totalGross = vendorSales.reduce((acc, s) => acc + (s.grossSol || 0), 0);
  const netEarnings = vendorSales.reduce((acc, s) => acc + (s.netVendorSol || s.grossSol * 0.9), 0);

  // Handle Tambah Produk Baru
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.title || !formData.priceSol) {
      alert('Mohon lengkapi SKU, Judul, dan Harga SOL.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newProd = {
        id: `prod-${Date.now().toString().slice(-4)}`,
        sku: formData.sku.toUpperCase(),
        title: formData.title,
        category: formData.category,
        priceSol: parseFloat(formData.priceSol),
        seller: vendorWallet ? `${vendorWallet.slice(0, 4)}...${vendorWallet.slice(-4)}` : 'Vendor-Self',
        vendorWallet: vendorWallet || '7LLjrqrfvg6qQKee8bX8XQyT9J8NFQWtyzzj2K8rGXpB',
        instantAccessUrl: formData.instantAccessUrl || '',
        description: formData.description || 'Digital asset delivered via AutonPay rail.'
      };

      if (onAddProduct) onAddProduct(newProd);

      setSuccessMsg(`Product ${newProd.sku} is listed successfully on marketplace!`);
      setFormData({
        sku: '',
        title: '',
        category: 'Google Drive / Files',
        priceSol: '',
        instantAccessUrl: '',
        description: ''
      });
      setIsSubmitting(false);

      setTimeout(() => setSuccessMsg(null), 4000);
    }, 300);
  };

  // Handle Simpan Perubahan Edit Produk
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (onUpdateProduct) {
      onUpdateProduct({
        ...editingProduct,
        priceSol: parseFloat(editingProduct.priceSol)
      });
    }

    setSuccessMsg(`Product ${editingProduct.sku} is updated successfully!`);
    setEditingProduct(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Handle Hapus Produk
  const handleDelete = (prod) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk [${prod.sku}] dari katalog?`)) {
      if (onDeleteProduct) onDeleteProduct(prod.id);
      setSuccessMsg(`Produk ${prod.sku} telah dihapus.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Info Vendor */}
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
            Vendor Wallet: <span className="text-cyan-300 font-bold">{vendorWallet || 'Solana Devnet Node'}</span>
          </p>
        </div>

        {/* Metrik Saldo Bersih */}
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

      {successMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs rounded-xl font-mono">
          ✅ {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Form Tambah Produk Baru */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-cyan-400 font-bold">📦</span>
            <h3 className="text-sm font-bold text-white font-mono uppercase">Register New Asset</h3>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ASSET SKU</label>
              <input
                type="text"
                placeholder="e.g. GDRIVE-SOURCE-01"
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
                placeholder="e.g. Full Source Code Web3 App"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                {/* Header Label + Tombol Panduan Kategori */}
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-slate-400 uppercase">CATEGORY</label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition underline decoration-dotted"
                  >
                    <span>ℹ️</span> <span>Guide</span>
                  </button>
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white outline-none focus:border-cyan-500 text-[11px]"
                >
                  <option value="Google Drive / Files">📁 Google Drive / Files</option>
                  <option value="Source Code & Repo">💻 Source Code & Repo</option>
                  <option value="Compute & LLM">⚡ Compute & LLM</option>
                  <option value="Data Feeds">📊 Data Feeds</option>
                  <option value="Smart Contracts">📜 Smart Contracts</option>
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
              <label className="text-[10px] text-slate-400 block mb-1">
                PRODUCT LINK (GOOGLE DRIVE / GITHUB / API)
              </label>
              <input
                type="text"
                placeholder="https://drive.google.com/... atau https://github.com/..."
                value={formData.instantAccessUrl}
                onChange={(e) => setFormData({ ...formData, instantAccessUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none focus:border-cyan-500 text-[11px]"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">DESCRIPTION</label>
              <textarea
                rows="2"
                placeholder="Deskripsi singkat produk lisensi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 outline-none focus:border-cyan-500 font-sans text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl transition shadow-md active:scale-98"
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Publish to Marketplace'}
            </button>
          </form>
        </div>

        {/* 3. Daftar Produk Aktif (DILENGKAPI TOMBOL EDIT & DELETE) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>🏷️</span> Your Active Listings ({products.length})
              </span>
              <span className="text-slate-500">Edit / Delete directly</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {products.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                        {p.sku}
                      </span>
                      <span className="font-bold text-white truncate">{p.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      {p.category} • Link: {p.instantAccessUrl ? p.instantAccessUrl.slice(0, 30) + '...' : 'None'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right font-mono">
                      <div className="text-cyan-400 font-bold">{p.priceSol} SOL</div>
                      <div className="text-[9px] text-emerald-400">Net: +{(p.priceSol * 0.9).toFixed(4)} SOL</div>
                    </div>

                    {/* TOMBOL EDIT & DELETE */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...p })}
                        className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-1 rounded-lg text-xs font-mono transition"
                        title="Edit Produk"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-400 px-2 py-1 rounded-lg text-xs font-mono transition"
                        title="Hapus Produk"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger Penjualan Masuk */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>📜</span> Inbound Payout Ledger
              </span>
              <span className="text-emerald-400 font-bold">Instant Finality</span>
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
                  {vendorSales.map((s) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* 4. MODAL POP-UP EDIT PRODUK */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0b1222] border border-cyan-500/50 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <span>✏️</span>
                <span>EDIT ASSET: {editingProduct.sku}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingProduct(null)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PRODUCT TITLE</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-400 uppercase">CATEGORY</label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Guide
                    </button>
                  </div>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white outline-none focus:border-cyan-500 text-[11px]"
                  >
                    <option value="Google Drive / Files">📁 Google Drive / Files</option>
                    <option value="Source Code & Repo">💻 Source Code & Repo</option>
                    <option value="Compute & LLM">⚡ Compute & LLM</option>
                    <option value="Data Feeds">📊 Data Feeds</option>
                    <option value="Smart Contracts">📜 Smart Contracts</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">PRICE (SOL)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingProduct.priceSol}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceSol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-bold outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PRODUCT LINK (GOOGLE DRIVE / GITHUB)</label>
                <input
                  type="text"
                  value={editingProduct.instantAccessUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, instantAccessUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none focus:border-cyan-500 text-[11px]"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">DESCRIPTION</label>
                <textarea
                  rows="2"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-300 outline-none focus:border-cyan-500 font-sans text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-xl transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL PANDUAN KATEGORI (BILINGUAL: EN & ID) */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0b1222] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl font-sans">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📚</span>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    {categoryGuideLang === 'en' ? 'Category Selection Guide' : 'Panduan Pemilihan Kategori'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {categoryGuideLang === 'en' ? 'Choose the best classification for your asset' : 'Pilih klasifikasi yang tepat untuk aset digital Anda'}
                  </p>
                </div>
              </div>

              {/* Language Switcher EN / ID */}
              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setCategoryGuideLang('en')}
                  className={`px-2 py-0.5 rounded transition ${categoryGuideLang === 'en' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryGuideLang('id')}
                  className={`px-2 py-0.5 rounded transition ${categoryGuideLang === 'id' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  ID
                </button>
              </div>
            </div>

            {/* List Penjelasan Kategori */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 text-xs font-mono">
              
              {/* 1. Google Drive / Files */}
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <span>📁</span> <span>Google Drive / Files</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {categoryGuideLang === 'en'
                    ? 'Use for downloadable archives via cloud storage links: ZIP source bundles, PDF guides, installer packages, datasets, or media assets.'
                    : 'Gunakan untuk arsip yang diunduh melalui link penyimpanan cloud: paket arsip ZIP, panduan PDF, installer software, dataset, atau aset media.'}
                </p>
              </div>

              {/* 2. Source Code & Repo */}
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                  <span>💻</span> <span>Source Code & Repo</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {categoryGuideLang === 'en'
                    ? 'Use for complete application codebases, GitHub/GitLab repository invitations, boilerplates, and developer scripts (e.g., NewsPortal CMS, Web3 Bots).'
                    : 'Gunakan untuk full source code aplikasi, link repositori privat GitHub/GitLab, boilerplate, dan skrip developer (contoh: NewsPortal CMS, Bot Web3).'}
                </p>
              </div>

              {/* 3. Compute & LLM */}
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
                <div className="font-bold text-orange-400 flex items-center gap-1.5 mb-1">
                  <span>⚡</span> <span>Compute & LLM</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {categoryGuideLang === 'en'
                    ? 'Use for AI model inference quotas, high-throughput LLM token gateways, GPU clusters, and execution runtime environments for AI agents.'
                    : 'Gunakan untuk kuota inferensi model AI, gateway streaming token LLM, kluster GPU, dan lingkungan runtime eksekusi untuk agen AI otonom.'}
                </p>
              </div>

              {/* 4. Data Feeds */}
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <span>📊</span> <span>Data Feeds</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {categoryGuideLang === 'en'
                    ? 'Use for real-time WebSocket/gRPC streams, crypto price oracles, smart-money wallet trackers, and automated market sentiment telemetry.'
                    : 'Gunakan untuk stream real-time WebSocket/gRPC, oracle harga kripto, tracker dompet whale/smart-money, dan sinyal sentimen pasar.'}
                </p>
              </div>

              {/* 5. Smart Contracts */}
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
                <div className="font-bold text-purple-400 flex items-center gap-1.5 mb-1">
                  <span>📜</span> <span>Smart Contracts</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {categoryGuideLang === 'en'
                    ? 'Use for verified Solana Anchor programs, pre-audited smart contract modules, on-chain governance tooling, and protocol deployment scripts.'
                    : 'Gunakan untuk program Solana Anchor, modul kontrak pintar yang sudah diaudit, tooling tata kelola on-chain, dan skrip deploy protokol.'}
                </p>
              </div>

            </div>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs py-2 rounded-xl transition"
            >
              {categoryGuideLang === 'en' ? 'Close Guide' : 'Tutup Panduan'}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}