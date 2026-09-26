import React, { useState, useEffect } from 'react';
import PayFiStore from './payfi/PayFiStore';

export default function MobileView({
  wallet,
  onConnectWallet,
  solPriceUsd = 145,
  // Props penghubung agar sinkron dengan Laptop (opsional, otomatis fallback ke lokal)
  isBotRunning: externalIsBotRunning,
  setIsBotRunning: externalSetIsBotRunning,
  gasTank: externalGasTank,
  setGasTank: externalSetGasTank,
  botLogs: externalBotLogs,
  setBotLogs: externalSetBotLogs,
}) {
  // Hanya 2 Tab Utama: 'MARKET' atau 'BOT'
  const [currentTab, setCurrentTab] = useState('MARKET');
  
  // Status AI Agent Bot (Sinkron dengan Parent jika dioper, atau pakai State Lokal)
  const [localIsBotRunning, setLocalIsBotRunning] = useState(false);
  const isBotRunning = externalIsBotRunning !== undefined ? externalIsBotRunning : localIsBotRunning;
  const setIsBotRunning = externalSetIsBotRunning || setLocalIsBotRunning;

  const [localGasTank, setLocalGasTank] = useState(1.500);
  const gasTank = externalGasTank !== undefined ? externalGasTank : localGasTank;
  const setGasTank = externalSetGasTank || setLocalGasTank;

  const [localBotLogs, setLocalBotLogs] = useState([
    { time: '12:00:01', tag: 'SYS', msg: 'AutonPay M2M Settlement Rail initialized.' },
    { time: '12:00:02', tag: 'NET', msg: 'Connected to Solana Devnet Gateway.' },
    { time: '12:00:03', tag: 'CONF', msg: 'Payout split configured: Vendor 90% | Admin 5% | Affiliate 5%.' }
  ]);
  const botLogs = externalBotLogs !== undefined ? externalBotLogs : localBotLogs;
  const setBotLogs = externalSetBotLogs || setLocalBotLogs;

  // Modal Verifikasi Kunci Lisensi
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyKey, setVerifyKey] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // Simulasi Bot AI Otomatis (M2M) Membeli Mandiri
  useEffect(() => {
    let interval = null;
    if (isBotRunning) {
      interval = setInterval(() => {
        const time = new Date().toLocaleTimeString('en-US');
        const price = 0.050; // 0.05 SOL

        setGasTank((prev) => {
          if (prev < price) {
            setIsBotRunning(false);
            setBotLogs((l) => [
              { time, tag: 'ERR', msg: 'Gas Tank depleted. Auto-pilot paused.' },
              ...l.slice(0, 7)
            ]);
            return prev;
          }
          return parseFloat((prev - price).toFixed(3));
        });

        // Simulasi kalkulasi split ke 3 wallet
        const vendorCut = (price * 0.90).toFixed(4);
        const adminCut = (price * 0.05).toFixed(4);
        const affiliateCut = (price * 0.05).toFixed(4);
        const txHash = '5wK' + Math.random().toString(36).substring(2, 6);
        const generatedKey = 'AUTON-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-SOL';

        setBotLogs((l) => [
          { time, tag: 'KEY', msg: `License issued: ${generatedKey} -> Injected into agent.` },
          { time, tag: 'TX', msg: `Tx: ${txHash}... | Vendor: +${vendorCut} SOL | Admin: +${adminCut} SOL | Affiliate: +${affiliateCut} SOL` },
          { time, tag: 'M2M', msg: `AI quota low. Auto-purchased API-LLM-10M (${price} SOL)` },
          ...l.slice(0, 6)
        ]);
      }, 6500);
    }
    return () => clearInterval(interval);
  }, [isBotRunning]);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verifyKey.trim()) return;
    setVerifyResult({
      status: 'AUTHENTIC LICENSE',
      key: verifyKey.trim(),
      cluster: 'Solana Devnet Cluster',
      timestamp: new Date().toLocaleString('en-US')
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#060a12] text-slate-100 font-sans flex justify-center overflow-x-hidden">
      <div className="w-full max-w-md min-h-screen px-3.5 pt-3 pb-20 flex flex-col justify-between box-border">
        
        {/* ======================================================== */}
        {/* 1. HEADER RINGKAS & SEIMBANG                             */}
        {/* ======================================================== */}
        <div className="w-full mb-3 space-y-2.5">
          
          {/* Baris 1: Logo & Tombol Wallet Ramping */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0e172a] border border-cyan-800/50 flex items-center justify-center text-lg shadow-sm">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white tracking-wider">
                    AUTONPAY
                  </span>
                  <span className="bg-cyan-950 border border-cyan-700/60 text-cyan-400 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">
                    PAYFI M2M
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                  Autonomous Payment Rail
                </p>
              </div>
            </div>

            {/* Wallet Pill */}
            <button
              type="button"
              onClick={onConnectWallet}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm ${
                wallet
                  ? 'bg-[#0d1629] border-emerald-700/70 text-emerald-300'
                  : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white'
              }`}
            >
              <span>{wallet ? '🟢' : '👛'}</span>
              <span>{wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : 'Connect'}</span>
            </button>
          </div>

          {/* Baris 2: Gas Tank AI + Tombol Verify Key */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 bg-[#0b1222] border border-slate-800/90 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
              <span className="text-amber-400 text-xs">⚡</span>
              <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Agent Gas Tank:</span>
              <span className="text-xs font-extrabold text-cyan-300 font-mono ml-auto">{gasTank} SOL</span>
            </div>

            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="bg-[#0b1222] hover:bg-[#121c35] border border-cyan-900/60 hover:border-cyan-600 text-cyan-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
            >
              <span>🔍</span>
              <span>Verify Key</span>
            </button>
          </div>

          {/* Baris 3: Navigasi Hanya 2 Tab (Marketplace & Agent Bot) */}
          <div className="flex bg-[#0b1222] border border-slate-800/90 p-1 rounded-xl gap-1 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setCurrentTab('MARKET')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                currentTab === 'MARKET'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🛍️</span> <span>Marketplace</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('BOT')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                currentTab === 'BOT'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🤖</span> <span>AI Agent (M2M)</span>
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA                                          */}
        {/* ======================================================== */}
        <div className="flex-1 w-full mt-1">
          
          {/* --- TAB 1: MARKETPLACE ETALASE --- */}
          {currentTab === 'MARKET' && (
            <div className="w-full">
              <PayFiStore solPriceUsd={solPriceUsd} />
            </div>
          )}

          {/* --- TAB 2: AGENT BOT & LIVE 3-WALLET SETTLEMENT --- */}
          {currentTab === 'BOT' && (
            <div className="space-y-3">
              
              {/* Status Bot & Sakelar Otomatis */}
              <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    <span className={`text-[10px] font-bold font-mono tracking-wider uppercase ${isBotRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isBotRunning ? 'AUTONOMOUS AGENT ACTIVE' : 'AGENT DAEMON IDLE'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Devnet</span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white leading-snug">
                    Machine-to-Machine Autonomous Buyer
                  </h2>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    When active, the AI daemon monitors compute quotas, debits its Gas Tank, and splits settlements on-chain with zero human clicks.
                  </p>
                </div>

                {/* Sakelar Kendali Bot */}
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

                {/* Info Rincian Split 3 Pihak */}
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

              {/* Feed Telemetri M2M Real-Time */}
              <div className="bg-[#070d19] border border-slate-800/80 rounded-2xl p-3 font-mono text-[11px] space-y-2">
                <div className="text-slate-400 font-bold flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                  <span className="flex items-center gap-1.5">
                    <span>📟</span> <span>M2M Execution Telemetry</span>
                  </span>
                  <button 
                    type="button"
                    onClick={() => setBotLogs([])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {botLogs.map((log, idx) => (
                    <div key={idx} className="leading-tight break-all">
                      <span className="text-slate-600 mr-1.5">[{log.time}]</span>
                      <span className={`font-bold mr-1.5 ${
                        log.tag === 'M2M' ? 'text-purple-400' :
                        log.tag === 'TX' ? 'text-emerald-400' :
                        log.tag === 'KEY' ? 'text-amber-300' :
                        log.tag === 'ERR' ? 'text-rose-400' : 'text-cyan-400'
                      }`}>
                        [{log.tag}]
                      </span>
                      <span className="text-slate-300">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* 3. MODAL VERIFIKASI LISENSI                              */}
        {/* ======================================================== */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0b1222] border border-slate-800 w-full max-w-sm rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
                  <span>🔍</span> Verify License
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
                  placeholder="Enter Tx Hash or License Key..."
                  value={verifyKey}
                  onChange={(e) => setVerifyKey(e.target.value)}
                  className="w-full bg-[#060a12] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs py-2 rounded-xl transition shadow"
                >
                  Verify On-Chain Authenticity
                </button>
              </form>

              {verifyResult && (
                <div className="p-3 bg-[#060a12] border border-emerald-800/80 rounded-xl text-xs font-mono space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>✅</span> {verifyResult.status}
                  </div>
                  <div className="text-slate-400 text-[10px]">Key: <span className="text-white">{verifyResult.key}</span></div>
                  <div className="text-slate-400 text-[10px]">Cluster: <span className="text-cyan-400">{verifyResult.cluster}</span></div>
                  <div className="text-slate-500 text-[9px] pt-1 border-t border-slate-800">{verifyResult.timestamp}</div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}