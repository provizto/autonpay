import React, { useState } from 'react';

export default function MeteoraLaunchModal({ isOpen, onClose, vendorWallet }) {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [curveType, setCurveType] = useState('dynamic_bonding');
  const [autoLiquidityEnabled, setAutoLiquidityEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleDeployDBC = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Initializing Meteora DBC Pool configuration...' });

    try {
      // Simulasi inisialisasi pool Meteora DBC on-chain
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatusMessage({
        type: 'success',
        text: `Pool DBC untuk $${tokenSymbol.toUpperCase()} berhasil dikonfigurasi! 5% protocol fee siap dialirkan ke Meteora DAMM v2.`
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `Gagal menginisialisasi pool: ${err.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0c1427] p-6 shadow-2xl text-slate-100">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">☄️</span>
            <div>
              <h3 className="text-lg font-bold tracking-wide text-white">
                Meteora DBC Token Launchpad
              </h3>
              <p className="text-xs text-cyan-400">
                Dynamic Bonding Curve &amp; DAMM v2 Auto-Liquidity
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

        {/* Form Peluncuran */}
        <form onSubmit={handleDeployDBC} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Token / Project Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DeepSeek GPU Compute"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Token Symbol
              </label>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="e.g. COMPUT"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white uppercase placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Curve Mechanism
              </label>
              <select
                value={curveType}
                onChange={(e) => setCurveType(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="dynamic_bonding">Meteora DBC (Standard)</option>
                <option value="concentrated_damm">DAMM v2 Dynamic Fee</option>
              </select>
            </div>
          </div>

          {/* Pengaturan Pembagian PayFi */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Auto-Route 5% Protocol Fee to Pool
              </span>
              <input
                type="checkbox"
                checked={autoLiquidityEnabled}
                onChange={(e) => setAutoLiquidityEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Setiap kali aset AI/Compute dibeli di AutonPay, 5% fee protokol langsung dialirkan secara otomatis ke liquidity pool token ini di Meteora untuk menjaga stabilitas likuiditas.
            </p>
          </div>

          {/* Merchant Wallet Info */}
          <div className="text-[11px] text-slate-400">
            <span>Settlement Vendor Wallet: </span>
            <code className="text-cyan-300 font-mono">
              {vendorWallet ? `${vendorWallet.slice(0, 6)}...${vendorWallet.slice(-4)}` : 'Wallet belum terhubung'}
            </code>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`rounded-lg p-2.5 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Deploying Pool...' : 'Deploy Meteora DBC'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}