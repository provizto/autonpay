import React, { useState } from 'react';
import VendorPortal from './vendor/VendorPortal';
import AdminPortal from './admin/AdminPortal';
import AutonPayLogo from './AutonPayLogo';
import { verifyLicenseOnDb } from '../services/settlements';

export default function MobileView({
  wallet,
  isAdmin = false,
  isVendor = false,
  onConnectWallet,
  solPriceUsd = 145,
  isBotRunning: externalIsBotRunning,
  setIsBotRunning: externalSetIsBotRunning,
  gasTank: externalGasTank,
  setGasTank: externalSetGasTank,
  botLogs: externalBotLogs,
  setBotLogs: externalSetBotLogs,
  logs: externalLogs,
  activePurchase,
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  merchantSales = [],
  onClearSales,
  onBuyProduct,
}) {
  const [currentTab, setCurrentTab] = useState('MARKET');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];
  
  const walletAddress = typeof wallet === 'string' ? wallet : wallet?.address;

  // Bot State
  const [localIsBotRunning, setLocalIsBotRunning] = useState(false);
  const isBotRunning = externalIsBotRunning !== undefined ? externalIsBotRunning : localIsBotRunning;
  const setIsBotRunning = externalSetIsBotRunning || setLocalIsBotRunning;

  const [localGasTank, setLocalGasTank] = useState(1.500);
  const gasTank = externalGasTank !== undefined ? externalGasTank : localGasTank;
  const setGasTank = externalSetGasTank || setLocalGasTank;

  const [localBotLogs, setLocalBotLogs] = useState([
    { id: 1, time: '12:00:01', tag: 'SYS', msg: 'AutonPay M2M Settlement Rail initialized.' },
    { id: 2, time: '12:00:02', tag: 'NET', msg: 'Connected to Solana Mainnet Gateway.' },
    { id: 3, time: '12:00:03', tag: 'CONF', msg: 'Fee split protocol active: Vendor 90% | Admin 5% | Affiliate 5%.' }
  ]);
  const botLogs = externalBotLogs || externalLogs || localBotLogs;
  const setBotLogs = externalSetBotLogs || setLocalBotLogs;

  // Verify Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyKey, setVerifyKey] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRefillGas = () => {
    setGasTank((prev) => parseFloat((prev + 1.0).toFixed(3)));
    setBotLogs((l) => [
      { id: Date.now(), time: new Date().toLocaleTimeString('en-US'), tag: 'SYS', msg: 'Agent Gas Tank refilled (+1.000 SOL).' },
      ...l.slice(0, 7)
    ]);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyKey.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifyLicenseOnDb(verifyKey.trim());
      setVerifyResult(res);
    } catch {
      setVerifyResult({ valid: false, msg: 'Verification failed due to network latency.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="w-full min-h-screen bg-[#060a12] text-slate-100 font-sans flex justify-center overflow-x-hidden">
      <div className="w-full max-w-md min-h-screen px-3 pt-3 pb-20 flex flex-col justify-start box-border">
        
        {/* HEADER */}
        <div className="w-full mb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <AutonPayLogo size={28} withText={true} />

            <div className="flex items-center gap-1.5">
              {walletAddress && (
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}?ref=${walletAddress}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert(`Referral Link copied!\n\n${shareUrl}\n\nShare this link to automatically receive an instant 5% SOL!`);
                  }}
                  className="bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[11px] font-mono font-bold px-2 py-1.5 rounded-lg transition flex items-center gap-1 shadow shrink-0 active:scale-95"
                  title="Salin Link Referral"
                >
                  <span>🔗</span> <span>5%</span>
                </button>
              )}

              <button
                type="button"
                onClick={onConnectWallet}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-bold transition flex items-center gap-1.5 shadow-sm shrink-0 ${
                  walletAddress
                    ? 'bg-[#0d1629] border-emerald-700/70 text-emerald-300'
                    : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white'
                }`}
              >
                <span>{walletAddress ? '🟢' : '👛'}</span>
                <span>{walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect'}</span>
              </button>
            </div>
          </div>

          {/* KODE BARU: BERSIH & RAMPING */}
<button
  type="button"
  onClick={() => {
    setShowVerifyModal(true);
    setVerifyResult(null);
    setVerifyKey('');
  }}
  className="w-full bg-[#0b1222] hover:bg-[#121c35] border border-cyan-900/60 text-cyan-300 text-xs font-mono font-bold py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
>
  <span>🔍</span>
  <span>Verify License Key</span>
</button>

          {/* TABS */}
          <div className="grid grid-cols-4 bg-[#0b1222] border border-slate-800/90 p-1 rounded-xl gap-1 text-[11px] font-mono font-bold">
            <button
              type="button"
              onClick={() => setCurrentTab('MARKET')}
              className={`py-1 rounded-lg transition flex items-center justify-center gap-1 ${
                currentTab === 'MARKET' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🛍️</span> <span>Market</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('BOT')}
              className={`py-1 rounded-lg transition flex items-center justify-center gap-1 ${
                currentTab === 'BOT' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🤖</span> <span>Agent</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('VENDOR')}
              className={`py-1 rounded-lg transition flex items-center justify-center gap-1 ${
                currentTab === 'VENDOR' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📦</span> <span>Vendor</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('ADMIN')}
              className={`py-1 rounded-lg transition flex items-center justify-center gap-1 ${
                currentTab === 'ADMIN' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚙️</span> <span>Admin</span>
            </button>
          </div>
        </div>

        {/* CONTENTS */}
        <div className="flex-1 w-full mt-1">
          
          {/* TAB 1: MARKETPLACE */}
          {currentTab === 'MARKET' && (
            <div className="w-full space-y-2.5">
              {/* Search Bar */}
              <div className="bg-[#0b1329] border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
                <span className="text-cyan-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search license or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full font-mono"
                />
              </div>

              {/* Tulisan List Products & Kapsul Kategori */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-sm font-mono px-0.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span>📦</span> List Products ({filteredProducts.length})
                  </span>
                  <span className="text-[10px] text-slate-500">Mainnet Live</span>
                </div>

                {/* Kapsul Kategori (Bisa di-swipe horizontal di layar HP) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-[#0b1222] border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ramping & Compact Product Cards */}
              <div className="space-y-2">
                {filteredProducts.map((prod) => {
                  const isSettling = activePurchase === prod.id;
                  const usdPrice = (Number(prod.priceSol) * solPriceUsd).toFixed(2);

                  return (
                    <div
                      key={prod.id || prod.sku}
                      className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-2.5 flex flex-col justify-between gap-2 shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-mono font-bold bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 px-1.5 py-0.5 rounded">
                            {prod.sku}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 truncate max-w-[140px]">
                            Seller: {prod.seller || (prod.vendorWallet ? `${prod.vendorWallet.slice(0, 4)}...${prod.vendorWallet.slice(-4)}` : 'Verified')}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm leading-snug line-clamp-1">{prod.title}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                          {prod.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block leading-none">SETTLEMENT</span>
                          <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                            <span className="text-xs font-bold text-cyan-400">
                              {prod.priceSol} SOL
                            </span>
                            <span className="text-[11px] text-slate-500">
                              ≈ ${usdPrice}
                            </span>
                          </div>
                        </div>

                        {/* Tombol Buy Ukuran Pas */}
                        <button
                          type="button"
                          disabled={isSettling}
                          onClick={() => onBuyProduct && onBuyProduct(prod)}
                          className={`font-mono font-bold text-[11px] px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1 transition ${
                            isSettling
                              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 active:scale-95 text-white'
                          }`}
                        >
                          {isSettling ? (
                            <>
                              <span className="animate-spin text-xs">🌀</span>
                              <span>Settling...</span>
                            </>
                          ) : (
                            <>
                              <span>⚡</span>
                              <span>Buy License</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AGENT TELEMETRY */}
          {currentTab === 'BOT' && (
            <div className="space-y-2.5">
              <div className="bg-[#0b1222] border border-slate-800 rounded-xl p-3 shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    <span className={`text-[10px] font-bold font-mono tracking-wider uppercase ${isBotRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isBotRunning ? 'AUTONOMOUS ACTIVE' : 'AGENT DAEMON IDLE'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Solana Mainnet</span>
                </div>

                <div>
                  <h2 className="text-xs font-bold text-white leading-snug">
                    Machine-to-Machine Autonomous Buyer
                  </h2>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                    Daemon monitors API quotas, deducts Gas Tank, and autonomously executes on-chain 90/5/5 split fees.
                  </p>
                </div>

                <div className="bg-[#060a12] border border-slate-800/80 rounded-lg p-2 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-slate-500 font-mono uppercase block">Execution Mode</span>
                    <span className={`text-xs font-bold font-mono ${isBotRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isBotRunning ? '● AUTO-PILOT RUNNING' : '○ MANUAL MODE'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBotRunning(!isBotRunning)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition shadow ${
                      isBotRunning
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isBotRunning ? 'Stop Agent' : 'Start Agent'}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1.5 text-center font-mono">
                  <div className="bg-[#060a12] p-1 rounded border border-slate-800/60">
                    <span className="text-[8px] text-slate-500 block">Vendor</span>
                    <span className="text-xs font-bold text-emerald-400">90%</span>
                  </div>
                  <div className="bg-[#060a12] p-1 rounded border border-slate-800/60">
                    <span className="text-[8px] text-slate-500 block">Admin</span>
                    <span className="text-xs font-bold text-cyan-400">5%</span>
                  </div>
                  <div className="bg-[#060a12] p-1 rounded border border-slate-800/60">
                    <span className="text-[8px] text-slate-500 block">Affiliate</span>
                    <span className="text-xs font-bold text-amber-400">5%</span>
                  </div>
                </div>
              </div>

              {/* M2M Telemetry Feed */}
              <div className="bg-[#070d19] border border-slate-800/80 rounded-xl p-2.5 font-mono text-[10px] space-y-2 shadow-inner">
                <div className="text-slate-400 font-bold flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="flex items-center gap-1.5">
                    <span>📟</span> <span>M2M Execution Telemetry</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setBotLogs([])}
                    className="text-[9px] text-slate-500 hover:text-slate-300 underline"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {botLogs.map((log, idx) => {
                    const tag = log.tag || log.type || 'SYS';
                    return (
                      <div key={log.id || idx} className="leading-tight break-all">
                        <span className="text-slate-600 mr-1">[{log.time}]</span>
                        <span className={`font-bold mr-1 ${
                          tag === 'M2M' || tag === 'TRIG' ? 'text-purple-400' :
                          tag === 'TX' ? 'text-emerald-400' :
                          tag === 'KEY' ? 'text-amber-300' :
                          tag === 'ERR' ? 'text-rose-400' :
                          tag === 'BOT' ? 'text-emerald-400' : 'text-cyan-400'
                        }`}>
                          [{tag}]
                        </span>
                        <span className="text-slate-300">{log.msg}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VENDOR PORTAL */}
          {currentTab === 'VENDOR' && (
            <div className="w-full">
              {!isVendor ? (
                <div className="bg-[#0b1222] border border-cyan-900/50 rounded-xl p-5 text-center space-y-3 my-2 font-mono shadow-xl">
                  <div className="w-10 h-10 mx-auto bg-slate-900 border border-cyan-800/50 rounded-xl flex items-center justify-center text-xl shadow-inner">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Verified Merchant Portal
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                      {walletAddress ? (
                        <>
                          Wallet <span className="text-amber-400 font-mono">{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span> is a standard buyer account and is not whitelisted for merchant asset creation.
                        </>
                      ) : (
                        'Please connect an approved vendor wallet to access catalog and revenue management.'
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    {/* Tombol Connect / Switch Wallet */}
                    <button
                      type="button"
                      onClick={onConnectWallet}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>👛</span> {walletAddress ? 'Switch to Vendor Wallet' : 'Connect Vendor Wallet'}
                    </button>

                    {/* Tombol Onboarding Telegram Langsung ke @provizto */}
                    <a
                      href="https://t.me/provizto?text=Hi%20AutonPay%20Team,%20I%20would%20like%20to%20apply%20for%20Merchant%20Onboarding.%0A%0A-%20Project%20Name:%20%0A-%20Product%20Type%20(API/Compute/License):%20%0A-%20Solana%20Vendor%20Wallet:%20%0A-%20Website/Docs:%20"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/60 text-cyan-400 hover:text-cyan-300 font-bold font-mono text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow active:scale-95"
                    >
                      <span>✈️</span> Apply for Merchant Access (@provizto)
                    </a>
                  </div>

                  <p className="text-[10px] text-slate-500 font-sans">
                    Vendor access requires manual review before whitelist approval.
                  </p>
                </div>
              ) : (
                <VendorPortal
                  vendorWallet={walletAddress}
                  products={products}
                  onAddProduct={onAddProduct}
                  onUpdateProduct={onUpdateProduct}
                  onDeleteProduct={onDeleteProduct}
                  sales={merchantSales}
                />
              )}
            </div>
          )}

          {/* TAB 4: ADMIN CONSOLE */}
          {currentTab === 'ADMIN' && (
            <div className="w-full">
              {!isAdmin ? (
                <div className="bg-[#0b1222] border border-red-900/50 rounded-xl p-5 text-center space-y-3 my-2 font-mono shadow-xl">
                  <div className="w-10 h-10 mx-auto bg-slate-900 border border-red-800/50 rounded-xl flex items-center justify-center text-xl shadow-inner">
                    ⛔
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Access Denied: Admin Only
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                      {walletAddress ? (
                        <>
                          Dompet <span className="text-amber-400 font-mono">{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span> tidak memiliki izin administrator.
                        </>
                      ) : (
                        'Silakan hubungkan dompet resmi Admin untuk membuka panel audit.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onConnectWallet}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-xl transition shadow flex items-center justify-center gap-2"
                  >
                    <span>👛</span> {walletAddress ? 'Switch Wallet' : 'Connect Admin Wallet'}
                  </button>
                </div>
              ) : (
                <AdminPortal
                  sales={merchantSales}
                  onClearSales={onClearSales}
                  products={products}
                  onDeleteProduct={onDeleteProduct}
                  onResetProducts={onResetProducts}
                />
              )}
            </div>
          )}
        </div>

        {/* VERIFY MODAL */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0b1222] border border-slate-800 w-full max-w-sm rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
                  <span>🔍</span> Verify License (Supabase DB)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerifyResult(null);
                    setVerifyKey('');
                  }}
                  className="text-slate-400 hover:text-white text-base"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleVerify} className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter License Key (e.g. AUTON-...)"
                  value={verifyKey}
                  onChange={(e) => setVerifyKey(e.target.value)}
                  className="w-full bg-[#060a12] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs py-2 rounded-xl transition shadow flex items-center justify-center gap-1.5"
                >
                  {isVerifying ? (
                    <>
                      <span className="animate-spin text-xs">🌀</span>
                      <span>Querying Supabase...</span>
                    </>
                  ) : (
                    <span>Verify On-Chain Authenticity</span>
                  )}
                </button>
              </form>

              {verifyResult && (
                <div className={`p-3 rounded-xl border text-xs font-mono ${
                  verifyResult.valid ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-red-950/40 border-red-800 text-red-300'
                }`}>
                  {verifyResult.valid ? (
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1 text-emerald-400">
                        <span>✓</span> <span>LICENSE AUTHENTIC & ACTIVE</span>
                      </div>
                      <div className="text-[10px] text-slate-300 pt-1 space-y-0.5">
                        <div>Asset SKU: <strong className="text-white">{verifyResult.data.sku}</strong></div>
                        <div>Buyer: <strong className="text-white">{verifyResult.data.buyer?.slice(0, 6)}...{verifyResult.data.buyer?.slice(-4)}</strong></div>
                        <div>Status: <span className="text-emerald-400">{verifyResult.data.status}</span></div>
                        <div>Tx: <a href={`https://solscan.io/tx/${verifyResult.data.txSignature}`} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{verifyResult.data.txSignature?.slice(0, 10)}...</a></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{verifyResult.msg}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}