import React, { useState, useEffect, useRef } from 'react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  getProductsFromDB, 
  insertProductToDB, 
  removeProductFromDB 
} from './services/productService';
import MobileView from './components/MobileView';
import VendorPortal from './components/vendor/VendorPortal';
import AdminPortal from './components/admin/AdminPortal';
import AutonPayLogo from './components/AutonPayLogo';
import { 
  fetchSettlements, 
  insertSettlementRecord, 
  verifyLicenseOnDb, 
  subscribeToLiveSettlements 
} from './services/settlements';
import Footer from './components/Footer';
import MeteoraLaunchModal from './components/MeteoraLaunchModal';

// ==========================================
// SOLANA MAINNET & PROTOCOL WALLET CONFIG
// ==========================================
const MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

const DEFAULT_ADMIN_WALLET = 'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4'; 
const DEFAULT_AFFILIATE_WALLET = 'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4';
const DEFAULT_VENDOR_WALLET = 'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4';

// Protocol Approved & Verified Merchant Whitelist
const WHITELISTED_VENDORS = [
  DEFAULT_ADMIN_WALLET
];

// Multi-Wallet Auto Detection Fallback
const getSolanaProvider = () => {
  if (typeof window === 'undefined') return null;
  return window.phantom?.solana || window.solflare || window.backpack || window.solana || null;
};

export default function App() {
  const [isMeteoraModalOpen, setIsMeteoraModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeTab, setActiveTab] = useState('marketplace'); 
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    async function syncProducts() {
      try {
        const data = await getProductsFromDB();
        setProducts(data || []);
      } catch (err) {
        addLog('ERR', 'Failed to fetch catalog from Supabase.');
      } finally {
        setIsLoadingProducts(false);
      }
    }
    syncProducts();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Wallet State
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [realSolBalance, setRealSolBalance] = useState(null);
  const [agentVaultBalance, setAgentVaultBalance] = useState(1.50);
  const isAdmin = isWalletConnected && walletAddress === DEFAULT_ADMIN_WALLET;

  // Tangkap alamat wallet referral dari URL (?ref=...)
  const [referrerWallet, setReferrerWallet] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        try {
          new PublicKey(refParam);
          return refParam;
        } catch (e) {
          console.warn('Invalid referral wallet in URL, fallback to default.');
        }
      }
    }
    return DEFAULT_AFFILIATE_WALLET;
  });

  // Whitelist Vendor Terpercaya (Tersimpan otomatis di browser)
  const [whitelistedVendors, setWhitelistedVendors] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('autonpay_vendors') : null;
    return saved ? JSON.parse(saved) : [
      'ABemMJGexeCCkccM5WdeDpMZoAtPn4s3B2fJJfpRPuM4'
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autonpay_vendors', JSON.stringify(whitelistedVendors));
    }
  }, [whitelistedVendors]);

  // Strict Verification: Merchants in whitelist can access Vendor Console
  const isVendor = isWalletConnected && (
    whitelistedVendors.includes(walletAddress) || WHITELISTED_VENDORS.includes(walletAddress)
  );

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectedProvider, setConnectedProvider] = useState(null);

  // Modals & Feature States
  const [activePurchase, setActivePurchase] = useState(null);
  const [licenseModal, setLicenseModal] = useState(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sdkSnippetTab, setSdkSnippetTab] = useState('python');

  // Autonomous Agent State & Logs
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, time: '00:00:01', type: 'SYS', msg: 'AutonPay PayFi Core Engine Initialized.' },
    { id: 2, time: '00:00:02', type: 'NET', msg: 'Solana Devnet Settlement Gateway connected.' }
  ]);
  const terminalEndRef = useRef(null);

  // Sales Ledger
  const [merchantSales, setMerchantSales] = useState([]);

  const handleAddVendor = (newWallet) => {
    const cleanWallet = newWallet.trim();
    if (!cleanWallet) return;
    if (whitelistedVendors.includes(cleanWallet)) {
      alert('This wallet is already registered as a verified vendor!');
      return;
    }
    setWhitelistedVendors((prev) => [...prev, cleanWallet]);
    addLog('SYS', `Wallet [${cleanWallet.slice(0, 6)}...] added to Verified Vendor whitelist.`);
  };

  const handleRemoveVendor = (targetWallet) => {
    setWhitelistedVendors((prev) => prev.filter((w) => w !== targetWallet));
    addLog('SYS', `Vendor access revoked for [${targetWallet.slice(0, 6)}...].`);
  };

  const addLog = (type, msg) => {
    const time = new Date().toLocaleTimeString('en-US');
    setTerminalLogs((prev) => [...prev.slice(-35), { id: Date.now() + Math.random(), time, type, msg }]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Refill Saldo Agent Gas Tank
  const handleRefillGas = () => {
    setAgentVaultBalance((prev) => parseFloat((prev + 1.0).toFixed(3)));
    addLog('SYS', 'Agent Gas Tank refilled (+1.000 Devnet SOL).');
  };

  const formatSettlementItem = (item) => {
    const sig = item.tx_signature || item.signature || item.txSignature;
    return {
      id: item.id ? `db-${item.id}` : (sig || Math.random().toString()),
      time: item.created_at 
        ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : new Date().toLocaleTimeString('en-US'),
      sku: item.sku || 'N/A',
      agent: item.buyer_wallet 
        ? `${item.buyer_wallet.slice(0, 4)}...${item.buyer_wallet.slice(-4)}` 
        : 'Agent-Daemon',
      grossSol: Number(item.gross_sol) || 0,
      netVendorSol: Number(item.vendor_sol) || 0,
      adminFeeSol: Number(item.admin_sol) || 0,
      affiliateFeeSol: Number(item.affiliate_sol) || 0,
      status: item.status || 'Settled',
      signature: sig,
      txSignature: sig,
      licenseKey: item.license_key
    };
  };

  useEffect(() => {
    async function loadData() {
      const records = await fetchSettlements();
      if (records && records.length > 0) {
        setMerchantSales(records.map(formatSettlementItem));
        addLog('SYS', `Loaded ${records.length} historical settlements from Supabase.`);
      }
    }
    loadData();

    const unsubscribe = subscribeToLiveSettlements((newRecord) => {
      const formatted = formatSettlementItem(newRecord);
      setMerchantSales((prev) => [formatted, ...prev.filter(s => s.signature !== formatted.signature)]);
      addLog('NET', `[Realtime Inflow] New on-chain settlement: ${newRecord.sku} (+${newRecord.gross_sol} SOL)`);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // CRUD Handlers
  const handleAddProduct = async (newProduct) => {
    try {
      const saved = await insertProductToDB(newProduct);
      setProducts((prev) => [saved, ...prev]);
      addLog('SYS', `New asset [${saved.sku}] permanently recorded on Supabase.`);
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Failed to publish product to Supabase: ' + err.message);
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      if (typeof supabase !== 'undefined') {
        await supabase
          .from('products')
          .update({
            sku: updatedProduct.sku,
            title: updatedProduct.title,
            category: updatedProduct.category,
            price_sol: updatedProduct.priceSol,
            instant_access_url: updatedProduct.instantAccessUrl,
            description: updatedProduct.description
          })
          .eq('id', updatedProduct.id);
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      addLog('SYS', `Asset [${updatedProduct.sku}] updated.`);
    } catch (err) {
      console.error('Failed to update product:', err);
      alert('Failed to update product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await removeProductFromDB(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addLog('SYS', `Product ${productId} deleted permanently.`);
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product from Supabase: ' + err.message);
    }
  };

  const handleResetProducts = async () => {
    try {
      const liveData = await getProductsFromDB();
      setProducts(liveData || []);
      addLog('SYS', 'Catalog re-synced from live Supabase records.');
    } catch (err) {
      console.error('Failed to re-sync catalog:', err);
    }
  };

  const handleClearSales = async () => {
    try {
      if (typeof supabase !== 'undefined') {
        await supabase.from('settlements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
      setMerchantSales([]);
      addLog('SYS', 'Settlement ledger cleared.');
    } catch (err) {
      console.error('Failed to clear sales:', err);
      setMerchantSales([]);
      addLog('SYS', 'Local settlement ledger cleared.');
    }
  };

  // Connect Wallet Handler
  const handleConnectWallet = async () => {
    if (isWalletConnected) {
      const provider = connectedProvider || getSolanaProvider();
      if (provider?.disconnect) {
        try { await provider.disconnect(); } catch (e) {}
      }
      setIsWalletConnected(false);
      setWalletAddress('');
      setRealSolBalance(null);
      setConnectedProvider(null);
      addLog('SYS', 'Wallet disconnected.');
      return;
    }

    setShowWalletModal(true);
  };

  // Connect Provider
  const connectToWallet = async (walletType) => {
    setShowWalletModal(false);
    try {
      let provider = null;

      if (walletType === 'phantom') {
        provider = window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null);
        if (!provider && isMobile) {
          window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`;
          return;
        }
      } else if (walletType === 'solflare') {
        provider = window.solflare;
        if (!provider && isMobile) {
          window.location.href = `https://solflare.com/ul/v1/browse/${encodeURIComponent(window.location.href)}`;
          return;
        }
      } else if (walletType === 'backpack') {
        provider = window.backpack;
      } else {
        provider = window.solana;
      }

      if (!provider) {
        alert(`${walletType.toUpperCase()} wallet not detected! Please install the extension or open inside the wallet app.`);
        return;
      }

      const resp = await provider.connect();
      const pub = (resp?.publicKey || provider.publicKey).toString();
      setWalletAddress(pub);
      setIsWalletConnected(true);
      setConnectedProvider(provider);

      const walletName = walletType === 'phantom' ? 'Phantom' : walletType === 'solflare' ? 'Solflare' : walletType === 'backpack' ? 'Backpack' : 'Web3 Wallet';

      try {
        const connection = new Connection(MAINNET_RPC, 'confirmed');
        const bal = await connection.getBalance(provider.publicKey || resp.publicKey);
        setRealSolBalance((bal / LAMPORTS_PER_SOL).toFixed(3));
        addLog('NET', `${walletName} Connected: ${pub.slice(0, 6)}... (${(bal / LAMPORTS_PER_SOL).toFixed(3)} Devnet SOL)`);
      } catch {
        addLog('NET', `${walletName} Connected: ${pub.slice(0, 6)}... (Devnet Cluster)`);
      }
    } catch (err) {
      addLog('ERR', 'Wallet connection rejected: ' + (err.message || 'Cancelled'));
    }
  };

  // PayFi Execution Engine
  const executeBuy = async (product, isAgentAuto = false) => {
    const provider = connectedProvider || getSolanaProvider();
    const hasWallet = provider && provider.publicKey;

    // 🔒 PENCEGAH UTAMA: Jika pembeli manual belum konek wallet, wajibkan connect dulu!
    if (!isAgentAuto && (!isWalletConnected || !hasWallet)) {
      setShowWalletModal(true);
      return;
    }

    const gross = product.priceSol;
    const netVendor = parseFloat((gross * 0.90).toFixed(4));
    const adminFee = parseFloat((gross * 0.05).toFixed(4));
    const affiliateCut = parseFloat((gross * 0.05).toFixed(4));
    const generatedKey = 'AUTON-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-SOL';

    setActivePurchase(product.id);
    addLog(isAgentAuto ? 'BOT' : 'M2M', `Initiating 90/5/5 settlement for ${product.sku} (${gross} SOL)...`);

    let txSig = '';
    let isRealOnChain = false;

    try {
      if (hasWallet && !isAgentAuto) {
        addLog('SYS', 'Awaiting wallet signature for Solana Devnet...');
        const connection = new Connection(DEVNET_RPC, 'confirmed');
        const buyerPubkey = provider.publicKey;

        const totalLamports = Math.round(gross * LAMPORTS_PER_SOL);
        const vendorLamports = Math.floor(totalLamports * 0.90);
        const adminLamports = Math.floor(totalLamports * 0.05);
        const affiliateLamports = totalLamports - vendorLamports - adminLamports;

        const transaction = new Transaction();
        transaction.add(
          SystemProgram.transfer({ fromPubkey: buyerPubkey, toPubkey: new PublicKey(product.vendorWallet || DEFAULT_VENDOR_WALLET), lamports: vendorLamports }),
          SystemProgram.transfer({ fromPubkey: buyerPubkey, toPubkey: new PublicKey(DEFAULT_ADMIN_WALLET), lamports: adminLamports }),
          SystemProgram.transfer({ fromPubkey: buyerPubkey, toPubkey: new PublicKey(referrerWallet || DEFAULT_AFFILIATE_WALLET), lamports: affiliateLamports })
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = buyerPubkey;

        const signed = await provider.signAndSendTransaction(transaction);
        txSig = signed.signature || signed;
        isRealOnChain = true;

        addLog('NET', `Broadcasted to Devnet! Tx: ${txSig.slice(0, 10)}... Confirming...`);
        await connection.confirmTransaction({ signature: txSig, blockhash, lastValidBlockHeight }, 'confirmed');
        addLog('NET', `Confirmed on Solana Devnet! Hash: ${txSig}`);
      } else {
        // Alur Autonomous Agent Daemon (Simulasi Gas Tank)
        if (agentVaultBalance < gross) {
          addLog('ERR', `Settlement aborted: Insufficient Agent Gas Tank for ${product.sku}. Click (+Refill) in the header.`);
          setActivePurchase(null);
          return;
        }
        txSig = '5wKz' + Math.random().toString(36).substring(2, 8) + 'dev';
        setAgentVaultBalance((prev) => parseFloat((prev - gross).toFixed(4)));
        isRealOnChain = false;
      }

      setActivePurchase(null);
      addLog('TX', `[PayFi Settled] Vendor (90%): +${netVendor} SOL | Admin (5%): +${adminFee} SOL | Affiliate (5%): +${affiliateCut} SOL`);
      addLog('KEY', `License Issued: ${generatedKey}`);

      const newSaleItem = {
        id: 'tx-' + Math.random().toString(36).substring(2, 6),
        time: new Date().toLocaleTimeString('en-US'),
        sku: product.sku,
        agent: isAgentAuto ? 'AutonomousDaemon_Bot' : (walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Manual_Terminal'),
        grossSol: gross,
        netVendorSol: netVendor,
        adminFeeSol: adminFee,
        affiliateFeeSol: affiliateCut,
        status: 'Settled',
        signature: txSig,
        txSignature: txSig,
        licenseKey: generatedKey
      };
      setMerchantSales((prev) => [newSaleItem, ...prev]);

      // Catat ke Supabase hanya transaksi asli on-chain
      if (isRealOnChain && !txSig.endsWith('dev')) {
        try {
          await insertSettlementRecord({
            tx_signature: txSig,
            sku: product.sku,
            buyer_wallet: walletAddress || 'Buyer',
            vendor_wallet: product.vendorWallet || DEFAULT_VENDOR_WALLET,
            admin_wallet: DEFAULT_ADMIN_WALLET,
            affiliate_wallet: referrerWallet || DEFAULT_AFFILIATE_WALLET,
            gross_sol: gross,
            vendor_sol: netVendor,
            admin_sol: adminFee,
            affiliate_sol: affiliateCut,
            license_key: generatedKey,
            status: 'Settled'
          });
        } catch (dbErr) {
          console.warn('DB recording skipped:', dbErr);
        }
      }

      // Kuitansi hanya untuk pembeli manusia
      if (!isAgentAuto) {
        setLicenseModal({
          product,
          txSignature: txSig,
          isRealOnChain,
          licenseKey: generatedKey,
          timestamp: new Date().toLocaleTimeString('en-US'),
          split: { gross, netVendor, adminFee, affiliateCut }
        });
      }

    } catch (err) {
      console.error(err);
      setActivePurchase(null);
      addLog('ERR', 'Transaction cancelled or failed: ' + (err.message || 'Rejected'));
      if (!isAgentAuto) {
        alert('Transaction Failed: ' + (err.message || 'RPC Connection Error'));
      }
    }
  };

  // Autonomous Agent Simulator
  useEffect(() => {
    let interval = null;
    if (isAutonomous) {
      addLog('BOT', 'Autonomous Agent Daemon ACTIVE. Monitoring task triggers...');
      interval = setInterval(() => {
        if (products.length === 0) return;
        const randomProd = products[Math.floor(Math.random() * products.length)];
        addLog('TRIG', `Task trigger: Depleted quota for [${randomProd.category}]. Auto-purchasing ${randomProd.sku}...`);
        executeBuy(randomProd, true);
      }, 7000);
    } else {
      addLog('SYS', 'Autonomous Agent paused.');
    }
    return () => clearInterval(interval);
  }, [isAutonomous, products]);

  // Real Database License Verifier
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const res = await verifyLicenseOnDb(inputKey.trim());
      setVerifyResult(res);
    } catch {
      setVerifyResult({ valid: false, msg: 'Verification failed due to network latency.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 font-sans flex flex-col justify-between">
      
      {/* MOBILE INTERFACE */}
      {isMobile ? (
        <MobileView
          wallet={isWalletConnected ? walletAddress : ''}
          isAdmin={isAdmin}
          isVendor={isVendor}
          onConnectWallet={handleConnectWallet}
          solPriceUsd={145}
          isBotRunning={isAutonomous}
          setIsBotRunning={setIsAutonomous}
          gasTank={agentVaultBalance}
          setGasTank={setAgentVaultBalance}
          botLogs={terminalLogs}
          setBotLogs={setTerminalLogs}
          activePurchase={activePurchase}
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onResetProducts={handleResetProducts}
          merchantSales={merchantSales}
          onClearSales={handleClearSales}
          onBuyProduct={(prod) => executeBuy(prod, false)}
          onOpenMeteora={() => setIsMeteoraModalOpen(true)}
        />
      ) : (
        /* DESKTOP INTERFACE */
        <>
          <header className="border-b border-slate-800 bg-[#090e1a]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AutonPayLogo size={36} withText={true} />

                <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 ml-3 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveTab('marketplace')}
                    className={`px-3 py-1 rounded-lg transition ${activeTab === 'marketplace' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Marketplace
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('vendor')}
                    className={`px-3 py-1 rounded-lg transition ${activeTab === 'vendor' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Vendor Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-1 rounded-lg transition ${activeTab === 'admin' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Admin Console
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => { setIsVerifyOpen(true); setVerifyResult(null); setInputKey(''); }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <span>🔍</span> <span>Verify Key</span>
                </button>

                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className={`text-xs font-bold font-mono px-3.5 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                    isWalletConnected
                      ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                      : 'bg-blue-600 border-blue-500 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  <span>{isWalletConnected ? '🟢' : '👛'}</span>
                  <span>
                    {isWalletConnected 
                      ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)} ${realSolBalance ? `(${realSolBalance} SOL)` : ''}` 
                      : 'Connect Wallet'}
                  </span>
                </button>

                {isWalletConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}?ref=${walletAddress}`;
                      navigator.clipboard.writeText(shareUrl);
                      alert(`Referral Link copied!\n\n${shareUrl}\n\nShare this link and earn an instant 5% SOL payout on every sale!`);
                    }}
                    className="bg-purple-950/70 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs font-mono font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 shadow"
                    title="Copy Your Referral Link"
                  >
                    <span>🔗</span> <span>Earn 5%</span>
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 mt-6 space-y-6">
            {activeTab === 'marketplace' && (
              <>
                <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        Solana Settlement Node Active (Devnet)
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white">Machine-to-Machine Commerce Gateway</h2>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                      Automated 90/5/5 PayFi rail enabling AI agents and users to buy compute licenses on Solana Devnet with instant revenue distribution.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                    <div className="text-left font-mono">
                      <div className="text-[9px] text-slate-500 uppercase">Autonomous Agent</div>
                      <div className={`text-xs font-bold ${isAutonomous ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isAutonomous ? '● AUTO-PILOT ON' : '○ MANUAL MODE'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAutonomous(!isAutonomous)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                        isAutonomous ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {isAutonomous ? 'Stop Agent' : 'Start Agent'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 rounded-xl whitespace-nowrap transition ${
                              selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
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

                    {/* HEADER PRODUCT LIST DESKTOP */}
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
  <div className="flex items-center gap-2">
    <span className="text-cyan-400 text-lg">🏷️</span>
    <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
      Product List ({filteredProducts ? filteredProducts.length : products.length})
    </h2>
  </div>
  <span className="text-xs font-mono text-slate-400">
    Mainnet Real-Time Settlement
  </span>
</div>

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
                                activePurchase === prod.id ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white'
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
                                  <span>Buy License</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terminal Logs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5 font-bold text-slate-300">
                        <span className="text-cyan-400">📟</span>
                        <span>AGENT TELEMETRY LOG</span>
                      </div>
                      <button 
                        type="button" 
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
                          Realtime Active
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {activeTab === 'vendor' && (
  !isVendor ? (
    <div className="bg-[#0b1222] border border-cyan-900/50 rounded-3xl p-10 text-center max-w-lg mx-auto my-12 space-y-4 shadow-2xl font-mono">
      <div className="w-16 h-16 mx-auto bg-slate-900 border border-cyan-800/50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
        🛡️
      </div>
      <h3 className="text-base font-bold text-white uppercase tracking-wider">
        Verified Merchant Portal
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed font-sans">
        Asset publishing and merchant settlement management are strictly restricted to 
        compliance-verified vendors to protect the decentralized ecosystem.
        {isWalletConnected ? (
          <span className="block mt-2 font-mono text-[11px] text-amber-400">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} (Buyer Account / Unregistered)
          </span>
        ) : (
          <span className="block mt-2 text-slate-500">
            Please connect an authorized vendor wallet to continue.
          </span>
        )}
      </p>

      <div className="space-y-2.5 pt-1">
        {/* Tombol Connect / Switch Wallet */}
        <button
          type="button"
          onClick={handleConnectWallet}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
        >
          <span>👛</span> {isWalletConnected ? 'Switch to Vendor Wallet' : 'Connect Vendor Wallet'}
        </button>

        <button
  type="button"
  onClick={() => setIsMeteoraModalOpen(true)}
  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
>
  <span>☄️</span>
  <span>Launch Token (Meteora DBC)</span>
</button>

        {/* Tombol Onboarding Telegram Langsung ke @provizto */}
        <a
          href="https://t.me/provizto?text=Hi%20AutonPay%20Team,%20I%20would%20like%20to%20apply%20for%20Merchant%20Onboarding.%0A%0A-%20Project%20Name:%20%0A-%20Product%20Type%20(API/Compute/License):%20%0A-%20Solana%20Vendor%20Wallet:%20%0A-%20Website/Docs:%20"
          target="_blank"
          rel="noreferrer"
          className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/60 text-cyan-400 hover:text-cyan-300 font-bold font-mono text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow"
        >
          <span>✈️</span> Apply for Merchant Access (@provizto)
        </a>
      </div>

      <p className="text-[10px] text-slate-500 font-sans">
        Vendor onboarding is subject to manual compliance verification before whitelist approval.
      </p>
    </div>
  ) : (
    <VendorPortal
      vendorWallet={walletAddress}
      products={products}
      onAddProduct={handleAddProduct}
      onUpdateProduct={handleUpdateProduct}
      onDeleteProduct={handleDeleteProduct}
      sales={merchantSales}
    />
  )
)}

            {activeTab === 'admin' && (
              !isAdmin ? (
                <div className="bg-[#0b1222] border border-red-900/50 rounded-3xl p-10 text-center max-w-lg mx-auto my-12 space-y-4 shadow-2xl font-mono">
                  <div className="w-16 h-16 mx-auto bg-slate-900 border border-red-800/50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                    ⛔
                  </div>
                  <h3 className="text-base font-bold text-red-400 uppercase tracking-wider">
                    Access Denied: Protocol Admin Only
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Admin Console is strictly locked to the designated protocol treasury wallet.
                    {isWalletConnected ? (
                      <span className="block mt-2 font-mono text-[11px] text-amber-400">
                        Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} (Unauthorized)
                      </span>
                    ) : (
                      <span className="block mt-2 text-slate-500">
                        Please connect the official admin wallet: {DEFAULT_ADMIN_WALLET.slice(0, 6)}...
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>👛</span> {isWalletConnected ? 'Switch / Disconnect Wallet' : 'Connect Admin Wallet'}
                  </button>
                </div>
              ) : (
                <AdminPortal 
                  sales={merchantSales}
                  onClearSales={handleClearSales}
                  products={products}
                  onDeleteProduct={handleDeleteProduct}
                  onResetProducts={handleResetProducts}
                  currentWallet={walletAddress}
                  whitelistedVendors={whitelistedVendors}
                  onAddVendor={handleAddVendor}
                  onRemoveVendor={handleRemoveVendor}
                />
              )
            )}
          </main>
        </>
      )}

      {/* SETTLEMENT RECEIPT MODAL */}
      {licenseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1120] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
              <span>✅</span>
              <span>AUTONPAY ON-CHAIN SETTLEMENT CONFIRMED</span>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Asset:</span>
                <span className="text-white font-bold">{licenseModal.product.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Settled:</span>
                <span className="text-cyan-400 font-bold">{licenseModal.product.priceSol} SOL</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-1 mt-1">
                <span>Distribution:</span>
                <span>Vendor: 90% | Admin: 5% | Affiliate: 5%</span>
              </div>
              
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Product Link:</span>
                {licenseModal.product.instantAccessUrl ? (
                  <a 
                    href={licenseModal.product.instantAccessUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-emerald-400 font-bold underline hover:text-emerald-300 truncate max-w-[220px]"
                    title={licenseModal.product.instantAccessUrl}
                  >
                    🔗 {licenseModal.product.instantAccessUrl} ↗
                  </a>
                ) : (
                  <span className="text-slate-500">No link attached</span>
                )}
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Tx Signature:</span>
                {licenseModal.isRealOnChain ? (
                  <a 
                    href={`https://solscan.io/tx/${licenseModal.txSignature}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-cyan-400 underline font-bold hover:text-cyan-300"
                  >
                    {licenseModal.txSignature.slice(0, 12)}... (View Solscan)
                  </a>
                ) : (
                  <span className="text-slate-400">{licenseModal.txSignature}</span>
                )}
              </div>

              <div className="pt-1.5 border-t border-slate-800">
                <span className="text-slate-500 block mb-1">Assigned License Key:</span>
                <div className="bg-slate-900 p-1.5 rounded border border-cyan-800/60 text-cyan-300 font-bold select-all break-all">
                  {licenseModal.licenseKey}
                </div>
              </div>
            </div>

            {/* SDK Code Snippet */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400 font-bold">Inject into AI Agent Code:</span>
                <div className="flex gap-1">
                  {['python', 'json', 'curl'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSdkSnippetTab(t)}
                      className={`px-2 py-0.5 rounded uppercase text-[10px] font-mono transition ${
                        sdkSnippetTab === t ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold' : 'text-slate-500 hover:text-slate-300 border border-transparent'
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
    endpoint="${licenseModal.product.instantAccessUrl || 'https://api.autonpay.dev/v1/resource'}"
)
response = client.execute_query(prompt="Analyze market signals")`
                )}
                {sdkSnippetTab === 'json' && (
JSON.stringify({
  license_key: licenseModal.licenseKey,
  sku: licenseModal.product.sku,
  network: "solana-devnet",
  product_url: licenseModal.product.instantAccessUrl || "",
  split: "90_vendor_5_admin_5_affiliate",
  status: "ACTIVE"
}, null, 2)
                )}
                {sdkSnippetTab === 'curl' && (
`curl -X POST ${licenseModal.product.instantAccessUrl || 'https://api.autonpay.dev/v1/resource'} \\
  -H "X-AutonPay-Key: ${licenseModal.licenseKey}" \\
  -H "Content-Type: application/json"`
                )}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 font-mono">
              {licenseModal.product.instantAccessUrl && (
                <a
                  href={licenseModal.product.instantAccessUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>🔗</span> Open Product / Drive Link ↗
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                    protocol: "AutonPay PayFi Rail",
                    license_key: licenseModal.licenseKey,
                    sku: licenseModal.product.sku,
                    product: licenseModal.product.title,
                    price_sol: licenseModal.product.priceSol,
                    product_link: licenseModal.product.instantAccessUrl || "N/A",
                    settlement_tx: licenseModal.txSignature,
                    network: "solana-devnet",
                    distribution: "90% Vendor | 5% Admin | 5% Affiliate",
                    timestamp: licenseModal.timestamp,
                    created_at: new Date().toISOString()
                  }, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `license-${licenseModal.licenseKey}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
              >
                <span>📥</span> Download License (.json)
              </button>

              <button
                type="button"
                onClick={() => setLicenseModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL DATABASE LICENSE VERIFIER MODAL */}
      {isVerifyOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1120] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-sm">
                <span>🔍</span>
                <span>VERIFY ON-CHAIN LICENSE (SUPABASE DB)</span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsVerifyOpen(false)} 
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Enter License Key to Query Database:</label>
                <input
                  type="text"
                  placeholder="e.g. AUTON-9F39A-SOL"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {isVerifying ? (
                  <>
                    <span className="animate-spin text-xs">🌀</span>
                    <span>Querying Supabase Registry...</span>
                  </>
                ) : (
                  <span>Verify Status</span>
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

      {/* MULTI-WALLET MODAL */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1222] border border-slate-800 rounded-2xl max-w-xs w-full p-4 space-y-3 font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white">Select Solana Wallet</span>
              <button 
                type="button" 
                onClick={() => setShowWalletModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => connectToWallet('phantom')}
                className="w-full bg-slate-900 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-600 p-2.5 rounded-xl flex items-center gap-2.5 text-left transition"
              >
                <span className="text-base">👻</span>
                <span className="font-bold text-white">Phantom</span>
              </button>

              <button
                type="button"
                onClick={() => connectToWallet('solflare')}
                className="w-full bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-600 p-2.5 rounded-xl flex items-center gap-2.5 text-left transition"
              >
                <span className="text-base">🔥</span>
                <span className="font-bold text-white">Solflare</span>
              </button>

              <button
                type="button"
                onClick={() => connectToWallet('backpack')}
                className="w-full bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-600 p-2.5 rounded-xl flex items-center gap-2.5 text-left transition"
              >
                <span className="text-base">🎒</span>
                <span className="font-bold text-white">Backpack</span>
              </button>

              <button
                type="button"
                onClick={() => connectToWallet('browser')}
                className="w-full bg-slate-900 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-600 p-2.5 rounded-xl flex items-center gap-2.5 text-left transition"
              >
                <span className="text-base">🦊</span>
                <span className="font-bold text-white">MetaMask / Browser</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />

      <MeteoraLaunchModal
  isOpen={isMeteoraModalOpen}
  onClose={() => setIsMeteoraModalOpen(false)}
  vendorWallet={walletAddress}
  provider={connectedProvider}
/>

    </div>
  );
}