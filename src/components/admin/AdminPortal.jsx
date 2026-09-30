import React, { useState } from 'react';
import { ADMIN_WALLET_ADDRESS, DEFAULT_AFFILIATE_ADDRESS, DEVNET_RPC_URL } from '../../config/solanaConfig';

// Default Protocol Wallets
const PROTOCOL_ADMIN_WALLET = 'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4';
const PROTOCOL_AFFILIATE_WALLET = 'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4';
const PROTOCOL_DEVNET_RPC = 'https://api.mainnet-beta.solana.com';

export default function AdminPortal({ 
  sales = [], 
  onClearSales, 
  products = [], 
  onDeleteProduct, 
  onResetProducts,
  currentWallet = '',
  whitelistedVendors = [],
  onAddVendor,
  onRemoveVendor
}) {
  const [newVendorInput, setNewVendorInput] = useState('');

  const [adminTreasury, setAdminTreasury] = useState(
    ADMIN_WALLET_ADDRESS ? ADMIN_WALLET_ADDRESS.toString() : PROTOCOL_ADMIN_WALLET
  );
  const [affiliateTreasury, setAffiliateTreasury] = useState(
    DEFAULT_AFFILIATE_ADDRESS ? DEFAULT_AFFILIATE_ADDRESS.toString() : PROTOCOL_AFFILIATE_WALLET
  );
  const [isSaved, setIsSaved] = useState(false);

  // Kalkulasi Global
  const totalVolume = sales.reduce((acc, s) => acc + (s.grossSol || 0), 0);
  const totalAdminFees = sales.reduce((acc, s) => acc + (s.adminFeeSol || s.grossSol * 0.05), 0);
  const totalAffiliateFees = sales.reduce((acc, s) => acc + (s.affiliateFeeSol || s.grossSol * 0.05), 0);
  const totalVendorSettlements = totalVolume - totalAdminFees - totalAffiliateFees;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Fitur Export CSV Riwayat Transaksi untuk Audit
  const handleExportCSV = () => {
    if (sales.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor.');
      return;
    }

    const headers = ['ID,Time,SKU,Agent,GrossSOL,VendorCutSOL,AdminFeeSOL,AffiliateFeeSOL,Status,Signature\n'];
    const rows = sales.map(s => 
      `${s.id},${s.time},${s.sku},${s.agent || 'Buyer'},${s.grossSol},${s.netVendorSol || (s.grossSol * 0.9)},${s.adminFeeSol || (s.grossSol * 0.05)},${s.affiliateFeeSol || (s.grossSol * 0.05)},${s.status || 'Settled'},${s.signature || s.txSignature || 'N/A'}`
    );

    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `autonpay_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Admin */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-purple-950 border border-purple-800 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
              SUPERADMIN CONTROL
            </span>
            <span className="text-xs font-mono text-emerald-400">● Mainnet Settlement Engine Online</span>
          </div>
          <h2 className="text-lg font-bold text-white">AutonPay Protocol Governance</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Atomic Multi-Instruction Routing Inspector (90% Vendor / 5% Admin / 5% Affiliate)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
          >
            <span>📥</span> Export CSV
          </button>

          {/* Tombol Bersihkan Ledger */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Yakin ingin membersihkan riwayat transaksi testing ini?')) {
                onClearSales?.();
              }
            }}
            className="bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
          >
            <span>🧹</span> Clear Ledger
          </button>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama Admin */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase block">Platform Revenue (5%)</span>
          <span className="text-xl font-bold text-cyan-400 mt-1 block">+{totalAdminFees.toFixed(4)} SOL</span>
          <span className="text-[10px] text-slate-500">Collected Protocol Treasury</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase block">Affiliate Pool (5%)</span>
          <span className="text-xl font-bold text-purple-400 mt-1 block">+{totalAffiliateFees.toFixed(4)} SOL</span>
          <span className="text-[10px] text-slate-500">Disbursed to Referral Nodes</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase block">Vendor Volume (90%)</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">+{totalVendorSettlements.toFixed(4)} SOL</span>
          <span className="text-[10px] text-slate-500">Directly Handed to Merchants</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase block">Total Settlements</span>
          <span className="text-xl font-bold text-white mt-1 block">{sales.length} TXs</span>
          <span className="text-[10px] text-emerald-500/80">Mainnet Settlement Registry</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Konfigurasi Wallet & Reset Produk */}
        <div className="space-y-4 font-mono text-xs">
          
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="text-purple-400 font-bold">⚙️</span>
              <h3 className="text-sm font-bold text-white uppercase">Fee Destination Config</h3>
            </div>

            {isSaved && (
              <div className="p-2.5 bg-emerald-950/70 border border-emerald-700/80 text-emerald-300 rounded-xl">
                ✅ Konfigurasi dompet tersimpan!
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PLATFORM ADMIN VAULT (5%)</label>
                <input
                  type="text"
                  value={adminTreasury}
                  onChange={(e) => setAdminTreasury(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 text-[11px] outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">AFFILIATE DEFAULT VAULT (5%)</label>
                <input
                  type="text"
                  value={affiliateTreasury}
                  onChange={(e) => setAffiliateTreasury(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-purple-300 text-[11px] outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">SOLANA RPC CONNECTION</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 text-[11px] truncate">
                  {DEVNET_RPC_URL || PROTOCOL_DEVNET_RPC}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-purple-950"
              >
                Update Protocol Destinations
              </button>
            </form>
          </div>

        </div>

        {/* KOTAK MANAJEMEN VENDOR TERPERCAYA */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Verified Vendor Whitelist</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Only authenticated wallet addresses on this whitelist are authorized to publish and manage compute licenses.
            </p>
          </div>

          {/* Quick Button: Authorize currently connected wallet */}
          {currentWallet && !whitelistedVendors.includes(currentWallet) && (
            <button
              type="button"
              onClick={() => onAddVendor && onAddVendor(currentWallet)}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1"
            >
              <span>⚡</span> Authorize Current Wallet
            </button>
          )}
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (onAddVendor && newVendorInput) {
              onAddVendor(newVendorInput);
              setNewVendorInput('');
            }
          }} 
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Paste new Solana vendor public key..."
            value={newVendorInput}
            onChange={(e) => setNewVendorInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-500"
            required
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono text-xs px-4 py-2 rounded-xl transition whitespace-nowrap"
          >
            + Add Vendor
          </button>
        </form>

        {/* Active Vendor Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {whitelistedVendors.map((w) => (
            <div 
              key={w} 
              className="bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-[11px] font-mono"
            >
              <span className="text-emerald-400">✓</span>
              <span className="text-slate-300 font-bold">{w.slice(0, 4)}...{w.slice(-4)}</span>
              {whitelistedVendors.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveVendor && onRemoveVendor(w)}
                  className="text-red-400 hover:text-red-300 ml-1 text-xs"
                  title="Revoke Vendor Access"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

        {/* Kolom Kanan: Global Protocol Ledger Monitor */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg font-mono">
          <div className="flex justify-between items-center text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span>🌐</span> <span>CROSS-PROTOCOL SETTLEMENT AUDIT LOG</span>
            </h3>
            <span className="text-[10px] text-slate-500">{sales.length} Audited Events</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Asset SKU</th>
                  <th className="pb-3">Gross</th>
                  <th className="pb-3">Vendor (90%)</th>
                  <th className="pb-3">Admin (5%)</th>
                  <th className="pb-3">Affiliate (5%)</th>
                  <th className="pb-3">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-slate-500 text-xs">
                      No on-chain settlement records found.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => {
                    const sig = sale.signature || sale.txSignature || '';
                    const isRealOnChain = sig.length > 40 && !sig.endsWith('dev') && !sig.endsWith('sol');

                    return (
                      <tr key={sale.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 text-slate-400">{sale.time}</td>
                        <td className="py-2.5 text-cyan-300 font-bold">{sale.sku}</td>
                        <td className="py-2.5 text-white">{sale.grossSol} SOL</td>
                        <td className="py-2.5 text-emerald-400 font-bold">
                          +{(sale.netVendorSol || sale.grossSol * 0.9).toFixed(4)} SOL
                        </td>
                        <td className="py-2.5 text-cyan-400">
                          +{(sale.adminFeeSol || sale.grossSol * 0.05).toFixed(4)} SOL
                        </td>
                        <td className="py-2.5 text-purple-400">
                          +{(sale.affiliateFeeSol || sale.grossSol * 0.05).toFixed(4)} SOL
                        </td>
                        <td className="py-2.5">
                          {isRealOnChain ? (
                            <a
                              href={`https://solscan.io/tx/${sig}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 underline text-[10px] hover:text-cyan-300 font-bold"
                              title={sig}
                            >
                              Solscan ↗
                            </a>
                          ) : (
                            <span 
                              className="text-slate-500 text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 select-none"
                              title="Simulated agent transaction (Local Gas Tank)"
                            >
                              🤖 Simulated
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}