import React, { useState, useEffect, useRef } from 'react';
import { initialProducts } from './data/products';
import MobileView from './components/MobileView';

export default function App() {
  // 0. Deteksi Otomatis Layar Mobile (< 768px)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'merchant'
  const [products] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. Solana Wallet State (Real Window Injection / Fallback Devnet)
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [agentVaultBalance, setAgentVaultBalance] = useState(1.50);

  // 2. State Fitur & Modal
  const [activePurchase, setActivePurchase] = useState(null);
  const [licenseModal, setLicenseModal] = useState(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [sdkSnippetTab, setSdkSnippetTab] = useState('python'); // 'python' | 'json' | 'curl'

  // 3. Autonomous Bot Simulation State
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, time: '00:00:01', type: 'SYS', msg: 'AutonPay PayFi Core Engine Initialized.' },
    { id: 2, time: '00:00:02', type: 'NET', msg: 'Solana Devnet Settlement Gateway connected.' }
  ]);
  const terminalEndRef = useRef(null);

  // 4. Merchant Dashboard State
  const [merchantSales, setMerchantSales] = useState([
    { id: 'tx-01', time: '09:40:12', sku: 'API-LLM-10M', agent: 'Agent-7X (Bot)', grossSol: 0.05, netSol: 0.0475, feeSol: 0.0025, status: 'Settled' },
    { id: 'tx-02', time: '09:44:05', sku: 'FEED-SOL-SENTIMENT', agent: 'WhaleTracker_AI', grossSol: 0.025, netSol: 0.02375, feeSol: 0.00125, status: 'Settled' }
  ]);
  const [claimedEarnings, setClaimedEarnings] = useState(0);

  const addLog = (type, msg) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev.slice(-35), { id: Date.now() + Math.random(), time, type, msg }]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Connect Solana Wallet Real or Devnet Mock
  const handleConnectWallet = async () => {
    if (isWalletConnected) {
      setIsWalletConnected(false);
      setWalletAddress('');
      addLog('SYS', 'Wallet disconnected.');
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.solana?.isPhantom) {
        const resp = await window.solana.connect();
        const pub = resp.publicKey.toString();
        setWalletAddress(pub.slice(0, 4) + '...' + pub.slice(-4));
        setIsWalletConnected(true);
        addLog('NET', `Phantom Wallet connected: ${pub.slice(0, 6)}...`);
      } else {
        const mockAddr = 'Sol7' + Math.random().toString(36).substring(2, 6) + '...9dev';
        setWalletAddress(mockAddr);
        setIsWalletConnected(true);
        addLog('NET', `Solana Devnet Node linked: ${mockAddr}`);
      }
    } catch (err) {
      addLog('ERR', 'Wallet connection rejected: ' + (err.message || 'Cancelled'));
    }
  };

  // Eksekusi Settlement PayFi
  const executeBuy = (product, isAgentAuto = false) => {
    if (agentVaultBalance < product.priceSol) {
      addLog('ERR', `Settlement aborted: Insufficient Agent Vault balance for ${product.sku}`);
      return;
    }

    setActivePurchase(product.id);
    addLog(isAgentAuto ? 'BOT' : 'M2M', `Initiating atomic settlement for ${product.sku} (${product.priceSol} SOL)...`);

    setTimeout(() => {
      const gross = product.priceSol;
      const net = parseFloat((gross * 0.95).toFixed(4));
      const fee = parseFloat((gross * 0.05).toFixed(4));
      const txSig = '5wKz' + Math.random().toString(36).substring(2, 8);
      const generatedKey = 'AUTON-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-SOL';

      setAgentVaultBalance((prev) => parseFloat((prev - gross).toFixed(4)));
      setActivePurchase(null);

      // Tambahkan ke telemetry
      addLog('TX', `Settled on Solana! Tx: ${txSig}... | Merchant: +${net} SOL, Protocol: +${fee} SOL`);
      addLog('KEY', `License Emitted: ${generatedKey}`);

      // Tambahkan data ke Merchant Revenue Ledger
      setMerchantSales((prev) => [
        {
          id: 'tx-' + Math.random().toString(36).substring(2, 6),
          time: new Date().toLocaleTimeString(),
          sku: product.sku,
          agent: isAgentAuto ? 'AutonomousDaemon_Bot' : 'Manual_Terminal',
          grossSol: gross,
          netSol: net,
          feeSol: fee,
          status: 'Settled'
        },
        ...prev
      ]);

      if (!isAgentAuto) {
        setLicenseModal({
          product,
          txSignature: txSig + '...',
          licenseKey: generatedKey,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }, 1100);
  };

  // Autonomous Bot Simulator Loop
  useEffect(() => {
    let interval = null;
    if (isAutonomous) {
      addLog('BOT', 'Autonomous Agent Daemon ACTIVE. Monitoring task dependencies...');
      interval = setInterval(() => {
        const randomProd = products[Math.floor(Math.random() * products.length)];
        addLog('TRIG', `Task trigger: Quota low for [${randomProd.category}]. Auto-purchasing ${randomProd.sku}...`);
        executeBuy(randomProd, true);
      }, 7000);
    } else {
      addLog('SYS', 'Autonomous Mode paused.');
    }
    return () => clearInterval(interval);
  }, [isAutonomous, agentVaultBalance]);

  // Verifikasi Kunci Lisensi
  const handleVerify = (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    if (inputKey.startsWith('AUTON-')) {
      setVerifyResult({
        valid: true,
        cluster: 'Solana Devnet',
        status: 'ACTIVE_NODE',
        rateLimit: 'Unlimited M2M Throughput'
      });
    } else {
      setVerifyResult({
        valid: false,
        msg: 'Invalid format. On-chain signature not found.'
      });
    }
  };

  // Perhitungan Merchant Revenue
  const totalMerchantGross = merchantSales.reduce((acc, s) => acc + s.grossSol, 0);
  const totalMerchantNet = merchantSales.reduce((acc, s) => acc + s.netSol, 0);
  const totalProtocolCut = merchantSales.reduce((acc, s) => acc + s.feeSol, 0);
  const claimableRevenue = parseFloat((totalMerchantNet - claimedEarnings).toFixed(4));

  const handleClaimEarnings = () => {
    if (claimableRevenue <= 0) return;
    setClaimedEarnings((prev) => parseFloat((prev + claimableRevenue).toFixed(4)));
    addLog('TX', `Payout: Claimed ${claimableRevenue} SOL to Merchant Settlement Vault.`);
  };

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // JIKA DIBUKA DI SMARTPHONE / LAYAR KECIL: TAMPILKAN MOBILEVIEW
  if (isMobile) {
    return (
      <MobileView
        wallet={isWalletConnected ? walletAddress : ''}
        onConnectWallet={handleConnectWallet}
        solPriceUsd={145}
      />
    );
  }

  // TAMPILAN LAPTOP / DESKTOP LENGKAP
  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 font-sans pb-16">
      
      {/* 1. Global Header */}
      <header className="border-b border-slate-800 bg-[#090e1a]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-white text-base tracking-wider">AUTONPAY</span>
                <span className="text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  PAYFI M2M
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Autonomous Payment Rail</p>
            </div>

            {/* Navigasi Tab */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 ml-3 text-xs font-mono">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTab === 'marketplace' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setActiveTab('merchant')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTab === 'merchant' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Merchant Portal
              </button>
            </div>
          </div>

          {/* Quick Actions & Wallet */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { setIsVerifyOpen(true); setVerifyResult(null); }}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <span>🔍</span> <span>Verify Key</span>
            </button>

            {/* Agent Vault Indicator */}
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="text-xs">⚡</span>
              <div className="text-right font-mono">
                <div className="text-[9px] text-slate-500 uppercase">Agent Gas Tank</div>
                <div className="text-xs font-bold text-cyan-400">{agentVaultBalance} SOL</div>
              </div>
            </div>

            {/* Connect Wallet Button */}
            <button
              onClick={handleConnectWallet}
              className={`text-xs font-bold font-mono px-3.5 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                isWalletConnected
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-blue-600 border-blue-500 hover:bg-blue-500 text-white shadow-md'
              }`}
            >
              <span>{isWalletConnected ? '🟢' : '👛'}</span>
              <span>{isWalletConnected ? walletAddress : 'Connect Wallet'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Body Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* VIEW 1: AGENT MARKETPLACE & BOT TELEMETRY */}
        {activeTab === 'marketplace' && (
          <>
            {/* Banner Protokol */}
            <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    Solana Settlement Node Active
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">Machine-to-Machine Commerce Gateway</h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                  PayFi rail enabling autonomous AI agents to purchase compute licenses, API credits, and datasets on Solana with zero human intervention.
                </p>
              </div>

              {/* Bot Auto-Pilot Toggle */}
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-left font-mono">
                  <div className="text-[9px] text-slate-500 uppercase">Autonomous Agent Bot</div>
                  <div className={`text-xs font-bold ${isAutonomous ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isAutonomous ? '● AUTO-PILOT ON' : '○ MANUAL MODE'}
                  </div>
                </div>
                <button
                  onClick={() => setIsAutonomous(!isAutonomous)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                    isAutonomous ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {isAutonomous ? 'Stop Agent' : 'Start Agent'}
                </button>
              </div>
            </div>

            {/* Katalog di Kiri, Live Telemetry di Kanan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-xl whitespace-nowrap transition ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
                    <span className="text-slate-500 text-xs">🔍</span>
                    <input
                      type="text"
                      placeholder="Search SKU or license..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                    />
                  </div>
                </div>

                {/* List Kartu Produk */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between gap-4 transition shadow-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 px-2 py-0.5 rounded-lg">
                            {prod.sku}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Seller: {prod.seller}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm leading-snug">{prod.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{prod.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">SETTLEMENT</span>
                          <span className="text-base font-extrabold text-cyan-400 font-mono">
                            {prod.priceSol} SOL
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={activePurchase === prod.id}
                          onClick={() => executeBuy(prod, false)}
                          className={`font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md ${
                            activePurchase === prod.id
                              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white'
                          }`}
                        >
                          {activePurchase === prod.id ? (
                            <>
                              <span className="animate-spin text-xs">🌀</span>
                              <span>Settling...</span>
                            </>
                          ) : (
                            <>
                              <span>⚡</span>
                              <span>Agent Buy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal Telemetri Agen */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <span className="text-cyan-400">📟</span>
                    <span>AGENT TELEMETRY LOG</span>
                  </div>
                  <button 
                    onClick={() => setTerminalLogs([])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                  >
                    Clear
                  </button>
                </div>

                <div className="bg-[#05080f] border border-slate-800 rounded-2xl p-3 h-[460px] flex flex-col justify-between font-mono text-[11px] shadow-inner">
                  <div className="overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {terminalLogs.map((log) => (
                      <div key={log.id} className="leading-tight break-all">
                        <span className="text-slate-600 mr-1.5">[{log.time}]</span>
                        <span className={`font-bold mr-1.5 ${
                          log.type === 'BOT' ? 'text-emerald-400' :
                          log.type === 'TX' ? 'text-cyan-400' :
                          log.type === 'KEY' ? 'text-amber-300' :
                          log.type === 'ERR' ? 'text-red-400' :
                          log.type === 'TRIG' ? 'text-purple-400' : 'text-blue-400'
                        }`}>
                          [{log.type}]
                        </span>
                        <span className="text-slate-300">{log.msg}</span>
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Cluster: Solana Devnet</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      RPC Synced
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {/* VIEW 2: MERCHANT REVENUE PORTAL */}
        {activeTab === 'merchant' && (
          <div className="space-y-6">
            
            {/* Metrik Pendapatan */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase block">Total Gross Inflow</span>
                <span className="text-xl font-bold text-white mt-1 block">{totalMerchantGross.toFixed(4)} SOL</span>
                <span className="text-[10px] text-slate-500">From Autonomous Agents</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase block">Merchant Net (95%)</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block">+{totalMerchantNet.toFixed(4)} SOL</span>
                <span className="text-[10px] text-emerald-500/80">Direct Revenue</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase block">Protocol Split (5%)</span>
                <span className="text-xl font-bold text-cyan-400 mt-1 block">+{totalProtocolCut.toFixed(4)} SOL</span>
                <span className="text-[10px] text-cyan-500/80">Autonomous Treasury</span>
              </div>
              <div className="bg-slate-900 border border-cyan-800/80 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase block">Available for Payout</span>
                  <span className="text-xl font-bold text-white mt-1 block">{claimableRevenue} SOL</span>
                </div>
                <button
                  onClick={handleClaimEarnings}
                  disabled={claimableRevenue <= 0}
                  className={`mt-2 py-1.5 px-3 rounded-xl font-bold text-xs transition ${
                    claimableRevenue > 0
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Withdraw to Wallet
                </button>
              </div>
            </div>

            {/* Riwayat Penjualan M2M */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm font-mono text-white flex items-center gap-2">
                  <span>📊</span> <span>M2M AGENT SETTLEMENT LEDGER</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500">{merchantSales.length} Total Settlements</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Asset SKU</th>
                      <th className="pb-3">Purchaser Entity</th>
                      <th className="pb-3">Gross</th>
                      <th className="pb-3">Net (95%)</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {merchantSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 text-slate-400">{sale.time}</td>
                        <td className="py-2.5 text-cyan-300 font-bold">{sale.sku}</td>
                        <td className="py-2.5 text-slate-300">{sale.agent}</td>
                        <td className="py-2.5 text-white">{sale.grossSol} SOL</td>
                        <td className="py-2.5 text-emerald-400 font-bold">+{sale.netSol} SOL</td>
                        <td className="py-2.5">
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 3. Modal Kuitansi & Agent SDK Exporter */}
      {licenseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1120] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
              <span>✅</span>
              <span>AUTONPAY SETTLEMENT CONFIRMED</span>
            </div>

            {/* Detail Struk */}
            <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Asset:</span>
                <span className="text-white font-bold">{licenseModal.product.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settled:</span>
                <span className="text-cyan-400 font-bold">{licenseModal.product.priceSol} SOL (~400ms)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tx Signature:</span>
                <span className="text-slate-400">{licenseModal.txSignature}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-800">
                <span className="text-slate-500 block mb-1">Assigned License Key:</span>
                <div className="bg-slate-900 p-1.5 rounded border border-cyan-800/60 text-cyan-300 font-bold select-all break-all">
                  {licenseModal.licenseKey}
                </div>
              </div>
            </div>

            {/* SDK Code Snippet Exporter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400 font-bold">Inject into AI Agent Code:</span>
                <div className="flex gap-1">
                  {['python', 'json', 'curl'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSdkSnippetTab(t)}
                      className={`px-2 py-0.5 rounded uppercase text-[10px] font-mono transition ${
                        sdkSnippetTab === t 
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold' 
                          : 'text-slate-500 hover:text-slate-300 border border-transparent'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre select-all leading-relaxed">
                {sdkSnippetTab === 'python' && (
`from autonpay import PayFiClient

client = PayFiClient(
    license_key="${licenseModal.licenseKey}",
    endpoint="${(licenseModal.product.instantAccessUrl || '').replace('agentpay', 'autonpay')}"
)
response = client.execute_query(prompt="Analyze market signals")`
                )}

                {sdkSnippetTab === 'json' && (
JSON.stringify({
  license_key: licenseModal.licenseKey,
  sku: licenseModal.product.sku,
  network: "solana-devnet",
  endpoint: (licenseModal.product.instantAccessUrl || '').replace('agentpay', 'autonpay'),
  status: "ACTIVE"
}, null, 2)
                )}

                {sdkSnippetTab === 'curl' && (
`curl -X POST ${(licenseModal.product.instantAccessUrl || '').replace('agentpay', 'autonpay')} \\
  -H "X-AutonPay-Key: ${licenseModal.licenseKey}" \\
  -H "Content-Type: application/json"`
                )}
              </pre>
            </div>

            <button
              onClick={() => setLicenseModal(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl transition font-mono"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* 4. Modal Verifikasi Lisensi */}
      {isVerifyOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1120] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-sm">
                <span>🔍</span>
                <span>VERIFY ON-CHAIN LICENSE</span>
              </div>
              <button onClick={() => setIsVerifyOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Enter License Key:</label>
                <input
                  type="text"
                  placeholder="e.g. AUTON-7X29A-SOL"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs py-2 rounded-xl transition"
              >
                Verify Status
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
                    <div className="font-bold flex items-center gap-1">
                      <span>✓</span> <span>LICENSE VALID & ACTIVE</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Cluster: {verifyResult.cluster} <br />
                      Status: {verifyResult.status} <br />
                      Throughput: {verifyResult.rateLimit}
                    </div>
                  </div>
                ) : (
                  <div>{verifyResult.msg}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}