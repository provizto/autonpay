import React, { useState, useEffect } from 'react';
import VendorPortal from './vendor/VendorPortal';
import AdminPortal from './admin/AdminPortal';
import AutonPayLogo from './AutonPayLogo';
import { verifyLicenseOnDb } from '../services/settlements';
import Footer from './Footer';

export default function MobileView({
  wallet,
  onConnectWallet,
  solPriceUsd = 145,
  isBotRunning: externalIsBotRunning,
  setIsBotRunning: externalSetIsBotRunning,
  gasTank: externalGasTank,
  setGasTank: externalSetGasTank,
  botLogs: externalBotLogs,
  setBotLogs: externalSetBotLogs,
  logs: externalLogs,
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  merchantSales = [],
  onClearSales,
  onBuyProduct,
}) {
  // 4 Mobile Navigation Tabs: 'MARKET' | 'BOT' | 'VENDOR' | 'ADMIN'
  const [currentTab, setCurrentTab] = useState('MARKET');
  
  const walletAddress = typeof wallet === 'string' ? wallet : wallet?.address;

  // Autonomous Agent States
  const [localIsBotRunning, setLocalIsBotRunning] = useState(false);
  const isBotRunning = externalIsBotRunning !== undefined ? externalIsBotRunning : localIsBotRunning;
  const setIsBotRunning = externalSetIsBotRunning || setLocalIsBotRunning;

  const [localGasTank, setLocalGasTank] = useState(1.500);
  const gasTank = externalGasTank !== undefined ? externalGasTank : localGasTank;
  const setGasTank = externalSetGasTank || setLocalGasTank;

  const [localBotLogs, setLocalBotLogs] = useState([
    { id: 1, time: '12:00:01', tag: 'SYS', msg: 'AutonPay M2M Settlement Rail initialized.' },
    { id: 2, time: '12:00:02', tag: 'NET', msg: 'Connected to Solana Devnet Gateway.' },
    { id: 3, time: '12:00:03', tag: 'CONF', msg: 'Fee split protocol active: Vendor 90% | Admin 5% | Affiliate 5%.' }
  ]);
  const botLogs = externalBotLogs || externalLogs || localBotLogs;
  const setBotLogs = externalSetBotLogs || setLocalBotLogs;

  // License Key Verification Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyKey, setVerifyKey] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Refill Gas Tank Handler
  const handleRefillGas = () => {
    setGasTank((prev) => parseFloat((prev + 1.0).toFixed(3)));
    setBotLogs((l) => [
      { id: Date.now(), time: new Date().toLocaleTimeString('en-US'), tag: 'SYS', msg: 'Agent Gas Tank refilled (+1.000 Devnet SOL).' },
      ...l.slice(0, 7)
    ]);
  };

  // M2M Autonomous Purchasing Simulation
  useEffect(() => {
    let interval = null;
    if (isBotRunning && !externalBotLogs) {
      interval = setInterval(() => {
        const time = new Date().toLocaleTimeString('en-US');
        const price = 0.050;

        setGasTank((prev) => {
          if (prev < price) {
            setIsBotRunning(false);
            setBotLogs((l) => [
              { id: Date.now(), time, tag: 'ERR', msg: 'Agent Gas Tank depleted. Auto-pilot paused.' },
              ...l.slice(0, 7)
            ]);
            return prev;
          }

          const updatedGas = parseFloat((prev - price).toFixed(3));
          const vendorCut = (price * 0.90).toFixed(4);
          const adminCut = (price * 0.05).toFixed(4);
          const affiliateCut = (price * 0.05).toFixed(4);
          const txHash = '5wK' + Math.random().toString(36).substring(2, 6) + 'dev';
          const generatedKey = 'AUTON-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-SOL';

          setBotLogs((l) => [
            { id: Date.now() + 1, time, tag: 'KEY', msg: `License issued: ${generatedKey} -> Injected into agent.` },
            { id: Date.now() + 2, time, tag: 'TX', msg: `Tx: ${txHash}... | Vendor: +${vendorCut} SOL | Admin: +${adminCut} SOL | Affiliate: +${affiliateCut} SOL` },
            { id: Date.now() + 3, time, tag: 'M2M', msg: `AI quota low. Auto-purchased API-LLM-10M (${price} SOL)` },
            ...l.slice(0, 6)
          ]);

          return updatedGas;
        });
      }, 6500);
    }
    return () => clearInterval(interval);
  }, [isBotRunning, externalBotLogs, setIsBotRunning, setGasTank, setBotLogs]);

  // Real Database License Verifier (Supabase)
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

  return (
    <div className="w-full min-h-screen bg-[#060a12] text-slate-100 font-sans flex justify-center overflow-x-hidden">
      <div className="w-full max-w-md min-h-screen px-3 pt-3 pb-20 flex flex-col justify-start box-border">
        
        {/* ======================================================== */}
        {/* 1. MOBILE HEADER                                         */}
        {/* ======================================================== */}
        <div className="w-full mb-3 space-y-2.5">
          
          {/* Row 1: Logo & Wallet Button */}
          <div className="flex items-center justify-between gap-2">
            <AutonPayLogo size={32} withText={true} />

            <button
              type="button"
              onClick={onConnectWallet}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm shrink-0 ${
                walletAddress
                  ? 'bg-[#0d1629] border-emerald-700/70 text-emerald-300'
                  : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white'
              }`}
            >
              <span>{walletAddress ? '🟢' : '👛'}</span>
              <span>{walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}</span>
            </button>
          </div>

          {/* Row 2: Gas Tank (+Refill) & Verify Key Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 bg-[#0b1222] border border-slate-800/90 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRefillGas}
                  className="text-amber-400 text-xs hover:scale-110 active:scale-95 transition"
                  title="Click to Refill Tank (+1.0 SOL)"
                >
                  ⚡
                </button>
                <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Gas Tank:</span>
                <button
                  type="button"
                  onClick={handleRefillGas}
                  className="text-[9px] text-cyan-400 font-mono hover:underline active:opacity-70"
                >
                  (+Refill)
                </button>
              </div>
              <span className="text-xs font-extrabold text-cyan-300 font-mono">{gasTank} SOL</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowVerifyModal(true);
                setVerifyResult(null);
                setVerifyKey('');
              }}
              className="bg-[#0b1222] hover:bg-[#121c35] border border-cyan-900/60 hover:border-cyan-600 text-cyan-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <span>🔍</span>
              <span>Verify Key</span>
            </button>
          </div>

          {/* Row 3: Navigation Tabs */}
          <div className="grid grid-cols-4 bg-[#0b1222] border border-slate-800/90 p-1 rounded-xl gap-1 text-[11px] font-mono font-bold">
            <button
              type="button"
              onClick={() => setCurrentTab('MARKET')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                currentTab === 'MARKET'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🛍️</span> <span>Market</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('BOT')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                currentTab === 'BOT'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🤖</span> <span>Agent</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('VENDOR')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                currentTab === 'VENDOR'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📦</span> <span>Vendor</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('ADMIN')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                currentTab === 'ADMIN'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚙️</span> <span>Admin</span>
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 2. TAB CONTENTS                                          */}
        {/* ======================================================== */}
        <div className="flex-1 w-full mt-1">
          
          {/* --- TAB 1: SINGLE STREAMLINED MARKETPLACE LIST (100% BEBAS DOBEL) --- */}
          {currentTab === 'MARKET' && (
            <div className="w-full space-y-2 pb-4">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 px-1 pb-1">
                <span>AVAILABLE COMPUTE LICENSES</span>
                <span className="text-[10px] text-cyan-400">90/5/5 Split Rail</span>
              </div>

              {products.map((p) => {
                const usdValue = (p.priceSol * solPriceUsd).toFixed(2);
                return (
                  <div
                    key={p.id}
                    className="bg-[#0b1222] border border-slate-800/80 hover:border-cyan-500/40 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-md transition"
                  >
                    {/* Info Produk */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0">
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

                    {/* Harga & Tombol Beli */}
                    <div className="flex items-center gap-2 shrink-0">
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
                        onClick={() => onBuyProduct?.(p)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 active:scale-95 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow"
                      >
                        <span>⚡</span>
                        <span>Buy</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* --- TAB 2: AGENT BOT SIMULATOR & TELEMETRY --- */}
          {currentTab === 'BOT' && (
            <div className="space-y-3">
              <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    <span className={`text-[10px] font-bold font-mono tracking-wider uppercase ${isBotRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isBotRunning ? 'AUTONOMOUS ACTIVE' : 'AGENT DAEMON IDLE'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Solana Devnet</span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white leading-snug">
                    Machine-to-Machine Autonomous Buyer
                  </h2>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    Daemon monitors API quotas, deducts Gas Tank, and autonomously executes on-chain 90/5/5 split fees.
                  </p>
                </div>

                <div className="bg-[#060a12] border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Execution Mode</span>
                    <span className={`text-xs font-bold font-mono ${isBotRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isBotRunning ? '● AUTO-PILOT RUNNING' : '○ MANUAL MODE'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBotRunning(!isBotRunning)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition shadow ${
                      isBotRunning
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isBotRunning ? 'Stop Agent' : 'Start Agent'}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1.5 text-center font-mono">
                  <div className="bg-[#060a12] p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-[9px] text-slate-500 block">Vendor</span>
                    <span className="text-xs font-bold text-emerald-400">90%</span>
                  </div>
                  <div className="bg-[#060a12] p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-[9px] text-slate-500 block">Admin</span>
                    <span className="text-xs font-bold text-cyan-400">5%</span>
                  </div>
                  <div className="bg-[#060a12] p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-[9px] text-slate-500 block">Affiliate</span>
                    <span className="text-xs font-bold text-amber-400">5%</span>
                  </div>
                </div>
              </div>

              {/* M2M Telemetry Feed */}
              <div className="bg-[#070d19] border border-slate-800/80 rounded-2xl p-3 font-mono text-[11px] space-y-2 shadow-inner">
                <div className="text-slate-400 font-bold flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                  <span className="flex items-center gap-1.5">
                    <span>📟</span> <span>M2M Execution Telemetry</span>
                  </span>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBotLogs([]);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded border border-slate-700 transition"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {botLogs.map((log, idx) => {
                    const tag = log.tag || log.type || 'SYS';
                    return (
                      <div key={log.id || idx} className="leading-tight break-all">
                        <span className="text-slate-600 mr-1.5">[{log.time}]</span>
                        <span className={`font-bold mr-1.5 ${
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

          {/* --- TAB 3: VENDOR PORTAL --- */}
          {currentTab === 'VENDOR' && (
            <div className="w-full">
              {!walletAddress ? (
                <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-6 text-center space-y-4 my-4 font-mono shadow-xl">
                  <div className="w-12 h-12 mx-auto bg-slate-900 border border-cyan-800/50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                    🔒
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Vendor Console Restricted
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
                      Connect your Solana Devnet wallet to register new API licenses and track 90% direct payouts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onConnectWallet}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>👛</span> Connect Vendor Wallet
                  </button>
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

          {/* --- TAB 4: ADMIN CONSOLE --- */}
          {currentTab === 'ADMIN' && (
            <div className="w-full">
              {!walletAddress ? (
                <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-6 text-center space-y-4 my-4 font-mono shadow-xl">
                  <div className="w-12 h-12 mx-auto bg-slate-900 border border-purple-800/50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                    🔒
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Admin Console Restricted
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
                      Accessing protocol audit logs and fee allocations requires Solana wallet authentication.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onConnectWallet}
                    className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>👛</span> Connect Admin Wallet
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

        {/* ======================================================== */}
        {/* FOOTER MOBILE                                           */}
        {/* ======================================================== */}
        <div className="pt-4 pb-2 w-full">
          <Footer />
        </div>

        {/* ======================================================== */}
        {/* 3. VERIFY LICENSE MODAL                                  */}
        {/* ======================================================== */}
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
                  verifyResult.valid 
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                    : 'bg-red-950/40 border-red-800 text-red-300'
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
                        <div>Tx: <a href={`https://solscan.io/tx/${verifyResult.data.txSignature}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{verifyResult.data.txSignature?.slice(0, 10)}...</a></div>
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