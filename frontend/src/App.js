import React, { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter } from "react-router-dom";
import Background from "@/components/meridiant/Background";
import Navbar from "@/components/meridiant/Navbar";
import TransferForm from "@/components/meridiant/TransferForm";
import {
  WalletConnectModal,
  SignInModal,
  SignUpModal,
  CheckoutModal,
  ProcessingModal,
  CompleteModal,
} from "@/components/meridiant/Modals";
import { MyProfilePage, WalletAccountPage, WithdrawalAccountPage, HistoryTransactionsPage } from "@/components/meridiant/ProfilePages";
import { authAPI, walletAPI, pricesAPI } from "@/lib/api";
import { chainNetworks, exchangeRates as fallbackRates } from "@/data/mockData";
import { Shield, Zap, Globe, ChevronDown, ChevronUp, Sun, Moon } from "lucide-react";
import ChatbotWidget from "@/components/meridiant/ChatbotWidget";
import AdminDashboard from "@/components/meridiant/AdminDashboard";
import ChainLogo from "@/components/meridiant/ChainLogo";

// ========== HERO SECTION ==========
const HeroSection = ({ onGetStarted }) => {
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-10 max-w-xl mx-auto px-3 sm:px-4">
      <h1 className="anim-fade-up text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight tracking-tight mb-3 sm:mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
        Transfer Crypto<br />
        <span className="gradient-text">Instan & Aman</span>
      </h1>
      <p className="anim-fade-up-d1 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Kirim dan terima aset digital di berbagai blockchain. Cepat, transparan, dan tanpa ribet.
      </p>
      <div className="anim-fade-up-d2 flex items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> Instan</span>
        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> Aman</span>
        <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> Multi-Chain</span>
      </div>
      <div className="anim-fade-up-d3 mt-4 flex items-center justify-center gap-2 flex-wrap" aria-label="Supported blockchain networks">
        {chainNetworks.map(chain => (
          <span key={chain.id} className="chain-pill inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] sm:text-xs" style={{ color: 'var(--text-secondary)' }}>
            <ChainLogo chain={chain.id} size={16} showAlt={false} />
            {chain.shortName}
          </span>
        ))}
      </div>
    </div>
  );
};

// ========== FAQ PAGE ==========
const FAQPage = ({ onBack }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const faqs = [
    {
      q: "Apa itu Meridiant?",
      a: "Meridiant adalah platform pertukaran crypto yang memungkinkan Anda mengirim dan menerima aset digital di berbagai blockchain seperti BNB Chain, Polygon, Solana, dan lainnya."
    },
    {
      q: "Bagaimana cara melakukan transfer?",
      a: "Cukup hubungkan wallet Anda (MetaMask, Phantom, dll), pilih token dan jumlah yang ingin dikirim, lalu konfirmasi transaksi. Semua transaksi dilakukan langsung di blockchain (on-chain)."
    },
    {
      q: "Blockchain apa saja yang didukung?",
      a: "Transfer on-chain langsung saat ini tersedia untuk Ethereum, Base, Arbitrum, Optimism, BNB Smart Chain (BSC), Polygon, dan SOL di Solana. TON/Toncoin tersedia sebagai aset dan jaringan tujuan; direct signing TON akan dibuka bertahap."
    },
    {
      q: "Token apa saja yang bisa ditransfer?",
      a: "Kami mendukung berbagai token populer termasuk IDRT, USDT, USDC, ETH, BNB, SOL, MATIC, dan banyak lagi. Setiap token tersedia di berbagai jaringan blockchain."
    },
    {
      q: "Apakah transaksi aman?",
      a: "Ya. Semua transaksi dilakukan langsung di blockchain melalui wallet Anda sendiri. Kami tidak pernah menyimpan private key Anda. Setiap transaksi dapat diverifikasi di block explorer."
    },
    {
      q: "Berapa biaya transaksi?",
      a: "Biaya terdiri dari gas fee jaringan untuk transaksi on-chain, trade fee 0.3% untuk pembelian IDR ke crypto, dan platform fee 0.2% untuk transaksi IDR mulai Rp 50.000. Biaya metode withdraw ditampilkan sebelum konfirmasi."
    },
    {
      q: "Wallet apa yang didukung?",
      a: "Kami mendukung MetaMask dan OKX Wallet untuk jaringan EVM (BSC, Polygon, dll), serta Phantom dan Solflare untuk jaringan Solana."
    },
    {
      q: "Bagaimana cara withdraw ke rupiah (IDR)?",
      a: "Gunakan tab 'Withdraw' di halaman utama, pilih token crypto yang ingin dikonversi, pilih tujuan penarikan (bank transfer atau e-wallet), lalu konfirmasi transaksi."
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 page-enter" data-testid="faq-page">
      <button onClick={onBack} className="text-emerald-400 text-sm hover:text-emerald-300 mb-6 flex items-center gap-1 btn-press" data-testid="faq-back-btn">
        ← Kembali
      </button>
      <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
        Pertanyaan Umum
      </h2>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Jawaban untuk pertanyaan yang sering ditanyakan.</p>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i}
            className="rounded-xl overflow-hidden transition-all duration-200 glass-card"
            data-testid={`faq-item-${i}`}
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="flex items-center justify-between w-full px-5 py-4 text-left"
            >
              <span className="text-sm font-medium pr-4" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
              {openIdx === i
                ? <ChevronUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              }
            </button>
            {openIdx === i && (
              <div className="px-5 pb-4 anim-fade-in">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ========== MAIN APP ==========
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [theme, setTheme] = useState(() => localStorage.getItem('mrd-theme') || 'dark');
  const [liveRates, setLiveRates] = useState(fallbackRates);
  const [realBalances, setRealBalances] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mrd-theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleAuthSuccess = useCallback((u) => {
    setUser({ name: u.name, email: u.email, picture: u.picture, is_admin: !!u.is_admin });
    setIsLoggedIn(true);
    if (u.wallet_connected) {
      setWalletConnected(true);
      setWalletAddress(u.wallet_address || "");
      setConnectedWallet({ name: u.wallet_name || "Wallet" });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("meridiant_token");
    if (!token) return;
    (async () => {
      try {
        const res = await authAPI.getMe();
        handleAuthSuccess(res.data);
      } catch {
        localStorage.removeItem("meridiant_token");
      }
    })();
  }, [handleAuthSuccess]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await pricesAPI.get();
        if (res.data?.rates && Object.keys(res.data.rates).length > 0) {
          setLiveRates(res.data.rates);
        }
      } catch { /* keep fallback */ }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!walletAddress || !walletConnected) return;
    (async () => {
      try {
        const res = await walletAPI.balances(walletAddress);
        if (res.data?.balances) setRealBalances(res.data.balances);
      } catch { /* keep mocked */ }
    })();
  }, [walletAddress, walletConnected]);

  const handleGoogleCredential = async (credential) => {
    try {
      const res = await authAPI.googleAuth(credential);
      const { token, user: u } = res.data;
      localStorage.setItem("meridiant_token", token);
      handleAuthSuccess(u);
      setActiveModal(null);
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Google sign in failed");
    }
  };

  const handleSignIn = async (email, password) => {
    try {
      const res = await authAPI.signin(email, password);
      const { token, user: u } = res.data;
      localStorage.setItem("meridiant_token", token);
      handleAuthSuccess(u);
      setActiveModal(null);
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Sign in failed");
    }
  };

  const handleSignUp = async (name, email, password) => {
    try {
      const res = await authAPI.signup(name, email, password);
      const { token, user: u } = res.data;
      localStorage.setItem("meridiant_token", token);
      handleAuthSuccess(u);
      setActiveModal(null);
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Sign up failed");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("meridiant_token");
    setUser(null);
    setIsLoggedIn(false);
    setConnectedWallet(null);
    setWalletAddress("");
    setWalletConnected(false);
    setRealBalances(null);
  };

  const handleConnectWallet = async (wallet, address) => {
    try {
      const res = await walletAPI.connect(wallet.id, wallet.name, address);
      setConnectedWallet({ ...wallet, name: res.data.wallet_name });
      setWalletAddress(address || res.data.wallet_address);
      setWalletConnected(true);
      setActiveModal(null);
    } catch {
      setConnectedWallet(wallet);
      setWalletAddress(address);
      setWalletConnected(true);
      setActiveModal(null);
    }
  };

  const handleDisconnectWallet = async () => {
    try { await walletAPI.disconnect(); } catch { /* ignore */ }
    setConnectedWallet(null);
    setWalletAddress("");
    setWalletConnected(false);
    setRealBalances(null);
  };

  const handleTransfer = (data) => {
    if (!isLoggedIn) { setActiveModal("signin"); return; }
    if (!walletConnected) { setActiveModal("wallet"); return; }
    if (!data.from.amount || parseFloat(data.from.amount) <= 0) return;
    setCheckoutError('');
    setTransactionData(data);
    setActiveModal("checkout");
  };

  const handleConfirmTransaction = async (onChainResult) => {
    setCheckoutError('');
    try {
      if (transactionData) {
        const { transactionAPI } = await import("@/lib/api");
        await transactionAPI.create({
          type: transactionData.type,
          from_currency: transactionData.from.currency.displayCode || transactionData.from.currency.code,
          from_amount: transactionData.from.amount,
          to_currency: transactionData.to.currency.displayCode || transactionData.to.currency.code,
          to_amount: transactionData.to.amount,
          method_or_dest: transactionData.method?.name || transactionData.destination?.name || null,
          tx_hash: onChainResult?.txHash || null,
          chain: onChainResult?.chain || null,
        });
      }
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to save transaction. Please try again.';
      setCheckoutError(message);
      setActiveModal("checkout");
      throw err;
    }
    setActiveModal("processing");
    setTimeout(() => setActiveModal("complete"), onChainResult ? 500 : 3000);
  };

  const handleTransactionComplete = () => {
    setActiveModal(null);
    setTransactionData(null);
    setCheckoutError('');
  };

  const isHomePage = currentPage === 'home';

  return (
    <>
      <Background />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar
          isLoggedIn={isLoggedIn} user={user}
          walletConnected={walletConnected} connectedWallet={connectedWallet}
          walletAddress={walletAddress}
          onConnectWallet={() => setActiveModal("wallet")}
          onDisconnectWallet={handleDisconnectWallet}
          onSignIn={() => setActiveModal("signin")}
          onSignUp={() => setActiveModal("signup")}
          onSignOut={handleSignOut}
          onNavigate={setCurrentPage}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className={`flex-1 flex flex-col ${isHomePage ? 'items-center justify-center' : 'items-start pt-4 sm:pt-6'} px-3 sm:px-4 pb-20`}>
          {isHomePage && (
            <>
              {!isLoggedIn && <HeroSection onGetStarted={() => setActiveModal("signup")} />}
              <div className="anim-fade-up-d2 w-full">
                <TransferForm
                  isLoggedIn={isLoggedIn}
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                  connectedWallet={connectedWallet}
                  liveRates={liveRates}
                  realBalances={realBalances}
                  onTransfer={handleTransfer}
                />
              </div>
            </>
          )}
          {currentPage === 'profile' && (
            <div className="w-full page-enter">
              <MyProfilePage user={user} onBack={() => setCurrentPage('home')} onUpdate={(u) => setUser(prev => ({ ...prev, ...u }))} />
            </div>
          )}
          {currentPage === 'wallet-account' && (
            <div className="w-full page-enter">
              <WalletAccountPage
                walletConnected={walletConnected} connectedWallet={connectedWallet} walletAddress={walletAddress}
                onConnectWallet={() => setActiveModal("wallet")} onDisconnectWallet={handleDisconnectWallet}
                onBack={() => setCurrentPage('home')}
              />
            </div>
          )}
          {currentPage === 'withdrawal-account' && <div className="w-full page-enter"><WithdrawalAccountPage onBack={() => setCurrentPage('home')} /></div>}
          {currentPage === 'history' && <div className="w-full page-enter"><HistoryTransactionsPage onBack={() => setCurrentPage('home')} /></div>}
          {currentPage === 'faq' && <FAQPage onBack={() => setCurrentPage('home')} />}
          {currentPage === 'admin' && <AdminDashboard onBack={() => setCurrentPage('home')} />}
        </main>
        <footer className="px-3 sm:px-6 lg:px-10 py-4 flex flex-col items-center gap-2 sm:gap-3 text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--footer-border)' }}>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="cursor-pointer transition-colors hover:opacity-70" onClick={() => setCurrentPage('faq')}>FAQ</span>
            <span className="cursor-pointer transition-colors hover:opacity-70">Support</span>
            <span className="hidden sm:inline" style={{ color: 'var(--footer-border)' }}>|</span>
            <span className="cursor-pointer transition-colors hover:opacity-70 hidden sm:inline">Privacy Policy</span>
            <span className="hidden sm:inline" style={{ color: 'var(--footer-border)' }}>|</span>
            <span className="cursor-pointer transition-colors hover:opacity-70 hidden sm:inline">Terms and Information</span>
          </div>
          <span>&copy; 2025 Meridiant. All rights reserved.</span>
        </footer>
      </div>

      <ChatbotWidget />
      <WalletConnectModal open={activeModal === "wallet"} onClose={() => setActiveModal(null)} onConnect={handleConnectWallet} />
      <SignInModal open={activeModal === "signin"} onClose={() => setActiveModal(null)} onSignIn={handleSignIn} onGoogleCredential={handleGoogleCredential} onSwitchToSignUp={() => setActiveModal("signup")} />
      <SignUpModal open={activeModal === "signup"} onClose={() => setActiveModal(null)} onSignUp={handleSignUp} onGoogleCredential={handleGoogleCredential} onSwitchToSignIn={() => setActiveModal("signin")} />
      <CheckoutModal
        open={activeModal === "checkout"} onClose={() => setActiveModal(null)}
        data={transactionData} onConfirm={handleConfirmTransaction}
        walletAddress={walletAddress} connectedWallet={connectedWallet}
        externalError={checkoutError}
      />
      <ProcessingModal open={activeModal === "processing"} />
      <CompleteModal open={activeModal === "complete"} onClose={handleTransactionComplete} data={transactionData} />
    </>
  );
}

function App() {
  return (
    <div className="App dark">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;
