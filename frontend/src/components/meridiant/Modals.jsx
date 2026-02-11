import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Eye, EyeOff, Loader2, Check, Search, Wallet2, Hexagon, Shield, Flame, Layers, ExternalLink } from 'lucide-react';
import { wallets, QRIS_IMAGE } from '@/data/mockData';
import { sendERC20Transfer, sendNativeTransfer, sendSolanaTransfer, isOnChainSupported } from '@/lib/onchain';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Google Sign-In button component
const GoogleSignInButton = ({ onCredential }) => {
  const btnRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.google?.accounts?.id) { setScriptLoaded(true); return; }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) { existing.addEventListener('load', () => setScriptLoaded(true)); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  const initGoogle = useCallback(() => {
    if (!window.google?.accounts?.id || !btnRef.current) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => { if (response.credential) onCredential(response.credential); },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        width: btnRef.current.offsetWidth || 380,
        text: 'continue_with',
        shape: 'pill',
      });
    } catch (e) { console.error('Google init error:', e); }
  }, [onCredential]);

  useEffect(() => { if (scriptLoaded) initGoogle(); }, [scriptLoaded, initGoogle]);

  return <div ref={btnRef} className="w-full flex justify-center" data-testid="google-signin-btn" />;
};

const walletIcons = {
  metamask: { Icon: Hexagon, color: '#E2761B' },
  okx: { Icon: Layers, color: '#FFFFFF', bg: '#000' },
  phantom: { Icon: Shield, color: '#AB9FF2' },
  solflare: { Icon: Flame, color: '#FC7227' },
};

const ChainBadge = ({ chain }) => {
  const styles = {
    EVM: { bg: 'rgba(98,126,234,0.15)', color: '#627EEA', label: 'EVM' },
    SOL: { bg: 'rgba(153,69,255,0.15)', color: '#9945FF', label: 'SOL' },
  };
  const s = styles[chain];
  if (!s) return null;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
};

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const handleGoogleAuth = () => {
  const redirectUrl = window.location.origin + '/';
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

// ========== WALLET CONNECT MODAL ==========
export const WalletConnectModal = ({ open, onClose, onConnect }) => {
  const [connecting, setConnecting] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const filtered = wallets.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  const getProvider = (walletId) => {
    if (typeof window === 'undefined') return null;
    switch (walletId) {
      case 'metamask': return window.ethereum?.isMetaMask ? window.ethereum : null;
      case 'okx': return window.okxwallet || null;
      case 'phantom': return window.phantom?.ethereum || window.phantom?.solana || null;
      case 'solflare': return window.solflare || null;
      default: return window.ethereum || null;
    }
  };

  const handleConnect = async (wallet) => {
    setConnecting(wallet.id);
    setError('');
    try {
      const provider = getProvider(wallet.id);
      if (provider && (wallet.id === 'metamask' || wallet.id === 'okx')) {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts?.[0]) { onConnect(wallet, accounts[0]); setSearch(''); setConnecting(null); return; }
      } else if (provider && wallet.id === 'phantom') {
        // Try Solana first
        if (window.phantom?.solana) {
          try {
            const resp = await window.phantom.solana.connect();
            if (resp?.publicKey) { onConnect(wallet, resp.publicKey.toString()); setSearch(''); setConnecting(null); return; }
          } catch { /* try EVM */ }
        }
        if (window.phantom?.ethereum) {
          const accounts = await window.phantom.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts?.[0]) { onConnect(wallet, accounts[0]); setSearch(''); setConnecting(null); return; }
        }
      } else if (provider && wallet.id === 'solflare') {
        try {
          const resp = await provider.connect();
          if (resp?.publicKey) { onConnect(wallet, resp.publicKey.toString()); setSearch(''); setConnecting(null); return; }
        } catch { /* fallthrough */ }
      }
      // Mock fallback
      setError('Wallet not detected. Using demo mode.');
      const mockAddr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTimeout(() => { onConnect(wallet, mockAddr); setSearch(''); setError(''); }, 1500);
    } catch (err) {
      setError(err?.message?.includes('rejected') ? 'Connection rejected by user' : 'Connection failed. Using demo mode.');
      const mockAddr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTimeout(() => { onConnect(wallet, mockAddr); setSearch(''); setError(''); }, 1500);
    }
    setConnecting(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setSearch(''); onClose(v); }}>
      <DialogContent className="sm:max-w-md border-gray-700/50 p-0 overflow-hidden" style={{ background: '#111827' }}>
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl border-2 border-gray-600/40 flex items-center justify-center mx-auto mb-5" style={{ background: '#1a2235' }}>
            <Wallet2 className="w-7 h-7 text-gray-400" />
          </div>
          <DialogTitle className="text-white text-xl font-bold mb-1">Select your wallet</DialogTitle>
          <p className="text-gray-400 text-sm">Connect a wallet to your Meridiant account</p>
        </div>
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-700/50" style={{ background: '#0c1120' }}>
            <Search className="w-4 h-4 text-gray-500" />
            <input type="text" placeholder={`Search through ${wallets.length} wallets...`} value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-white text-sm outline-none placeholder:text-gray-500 w-full" data-testid="wallet-search-input" />
          </div>
        </div>
        <div className="px-3 pb-2 max-h-[320px] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No wallets found</p>}
          {filtered.map(w => {
            const cfg = walletIcons[w.id];
            const isConn = connecting === w.id;
            return (
              <button key={w.id} onClick={() => handleConnect(w)} disabled={!!connecting} data-testid={`wallet-${w.id}`}
                className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all disabled:opacity-40 group">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden"
                    style={{ background: w.bgColor || (w.color + '20') }}>
                    {isConn ? <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" /> :
                      w.logo ? <img src={w.logo} alt={w.name} className="w-7 h-7 object-contain" onError={(e) => { e.target.style.display = 'none'; }} /> :
                      cfg?.Icon && <cfg.Icon className="w-5 h-5" style={{ color: cfg.color }} />}
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111827]" />
                </div>
                <span className="text-white text-sm font-medium flex-1 text-left">{w.name}</span>
                <div className="flex items-center gap-1.5">{w.chains.map(c => <ChainBadge key={c} chain={c} />)}</div>
              </button>
            );
          })}
        </div>
        {error && <div className="px-5 pb-2"><p className="text-amber-400 text-xs text-center bg-amber-500/10 rounded-lg py-2 px-3">{error}</p></div>}
        <div className="px-6 py-4 border-t border-gray-700/30 text-center">
          <p className="text-gray-500 text-xs">By logging in I agree to the <span className="text-emerald-400 cursor-pointer hover:underline">Terms</span> & <span className="text-emerald-400 cursor-pointer hover:underline">Privacy Policy</span></p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ========== SIGN IN MODAL ==========
export const SignInModal = ({ open, onClose, onSignIn, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try { await onSignIn(email, password); setEmail(''); setPassword(''); }
    catch (err) { setError(err.message || 'Sign in failed'); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setError(''); onClose(v); }}>
      <DialogContent className="sm:max-w-md border-gray-700/50" style={{ background: '#1a2235' }}>
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Sign in to Meridiant</DialogTitle>
          <p className="text-gray-400 text-sm mt-1">Enter your credentials to continue</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" data-testid="signin-email"
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" data-testid="signin-password"
                className="w-full rounded-xl px-4 py-3 pr-10 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} data-testid="signin-submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
          </button>
          <p className="text-center text-gray-400 text-sm">
            Don't have an account? <button type="button" onClick={onSwitchToSignUp} className="text-emerald-400 hover:underline">Sign up</button>
          </p>
        </form>
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700/50" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 text-gray-500" style={{ background: '#1a2235' }}>OR</span></div>
        </div>
        <button onClick={handleGoogleAuth} data-testid="google-signin"
          className="w-full py-3 rounded-xl border border-gray-600/50 text-white font-medium text-sm transition-colors hover:bg-white/5 flex items-center justify-center gap-3">
          <GoogleIcon /> Continue with Google
        </button>
      </DialogContent>
    </Dialog>
  );
};

// ========== SIGN UP MODAL ==========
export const SignUpModal = ({ open, onClose, onSignUp, onSwitchToSignIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPwd) { setError('Please fill in all fields'); return; }
    if (password !== confirmPwd) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try { await onSignUp(name, email, password); setName(''); setEmail(''); setPassword(''); setConfirmPwd(''); }
    catch (err) { setError(err.message || 'Sign up failed'); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setError(''); onClose(v); }}>
      <DialogContent className="sm:max-w-md border-gray-700/50" style={{ background: '#1a2235' }}>
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Create your account</DialogTitle>
          <p className="text-gray-400 text-sm mt-1">Join Meridiant today</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" data-testid="signup-name"
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" data-testid="signup-email"
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" data-testid="signup-password"
                className="w-full rounded-xl px-4 py-3 pr-10 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Confirm Password</label>
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Confirm your password" data-testid="signup-confirm-password"
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
          </div>
          <button type="submit" disabled={loading} data-testid="signup-submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create account
          </button>
          <p className="text-center text-gray-400 text-sm">
            Already have an account? <button type="button" onClick={onSwitchToSignIn} className="text-emerald-400 hover:underline">Sign in</button>
          </p>
        </form>
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700/50" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 text-gray-500" style={{ background: '#1a2235' }}>OR</span></div>
        </div>
        <button onClick={handleGoogleAuth} data-testid="google-signup"
          className="w-full py-3 rounded-xl border border-gray-600/50 text-white font-medium text-sm transition-colors hover:bg-white/5 flex items-center justify-center gap-3">
          <GoogleIcon /> Continue with Google
        </button>
      </DialogContent>
    </Dialog>
  );
};

// ========== CHECKOUT MODAL (with on-chain support) ==========
export const CheckoutModal = ({ open, onClose, data, onConfirm, walletAddress, connectedWallet }) => {
  const [sending, setSending] = useState(false);
  const [txError, setTxError] = useState('');
  const [txResult, setTxResult] = useState(null);

  if (!data) return null;

  const txId = 'MRD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const fromCurrency = data.from?.currency;
  const chain = fromCurrency?.chain;
  const tokenCode = fromCurrency?.code;
  const canOnChain = chain && isOnChainSupported(chain, tokenCode);

  const handleOnChainTransfer = async () => {
    setSending(true); setTxError('');
    try {
      let result;
      if (chain === 'Solana') {
        result = await sendSolanaTransfer(tokenCode, data.from.amount);
      } else if (tokenCode === 'BNB' && chain === 'BSC') {
        result = await sendNativeTransfer(chain, data.from.amount);
      } else if (tokenCode === 'MATIC' && chain === 'Polygon') {
        result = await sendNativeTransfer(chain, data.from.amount);
      } else {
        result = await sendERC20Transfer(chain, tokenCode, data.from.amount);
      }
      setTxResult(result);
      onConfirm(result);
    } catch (err) {
      setTxError(err.message || 'Transaction failed');
    } finally {
      setSending(false);
    }
  };

  const handleRegularConfirm = () => {
    onConfirm(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!sending) { setTxError(''); setTxResult(null); onClose(v); } }}>
      <DialogContent className="sm:max-w-lg border-gray-700/50" style={{ background: '#1a2235' }}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg">Checkout</DialogTitle>
            <span className="text-amber-400 text-sm font-mono">00:10:00</span>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-xl p-4 space-y-3" style={{ background: '#0c1120' }}>
            <h4 className="text-gray-400 text-sm font-medium">Detail transaction</h4>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Transaction ID</span><span className="text-white font-mono text-xs">{txId}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Amount to send</span><span className="text-white">{data.from?.amount} {data.from?.currency?.displayCode || data.from?.currency?.code}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">You'll receive</span><span className="text-emerald-400">{data.to?.amount} {data.to?.currency?.displayCode || data.to?.currency?.code}</span></div>
            {chain && <div className="flex justify-between text-sm"><span className="text-gray-400">Network</span><span className="text-blue-400">{chain}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-gray-400">Fee</span><span className="text-white">0.5%</span></div>
            <div className="border-t border-gray-700/40 pt-3 flex justify-between text-sm"><span className="text-gray-400">Total</span><span className="text-white font-medium">{data.from?.amount} {data.from?.currency?.displayCode || data.from?.currency?.code}</span></div>
          </div>

          {canOnChain && (
            <div className="rounded-xl p-4 border border-emerald-500/20" style={{ background: 'rgba(16,185,129,0.05)' }}>
              <h4 className="text-emerald-400 text-sm font-medium mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> On-Chain Transfer
              </h4>
              <p className="text-gray-400 text-xs mb-1">This transaction will be executed on <span className="text-white">{chain}</span> blockchain.</p>
              <p className="text-gray-500 text-xs">Your wallet will prompt you to sign the transaction.</p>
            </div>
          )}

          {!canOnChain && (
            <div className="rounded-xl p-4" style={{ background: '#0c1120' }}>
              <h4 className="text-gray-400 text-sm font-medium mb-2">How to pay</h4>
              <p className="text-white text-sm">{data.method?.name || data.destination?.name || 'Bank Transfer'}</p>
              {(data.method?.id === 'qris' || data.destination?.id === 'qris_withdraw') && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="bg-white rounded-xl p-3 mb-3">
                    <img src={QRIS_IMAGE} alt="QRIS Payment" className="w-52 h-52 object-contain" />
                  </div>
                  <p className="text-gray-400 text-xs text-center">Scan QR code above using your banking or e-wallet app</p>
                </div>
              )}
            </div>
          )}

          {txError && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">{txError}</div>}

          {txResult && (
            <div className="rounded-xl p-4 border border-emerald-500/30" style={{ background: 'rgba(16,185,129,0.08)' }}>
              <p className="text-emerald-400 text-sm font-medium mb-2">Transaction submitted!</p>
              <a href={txResult.blockExplorer} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 text-xs hover:underline flex items-center gap-1">
                View on explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {canOnChain ? (
            <button onClick={handleOnChainTransfer} disabled={sending} data-testid="onchain-confirm"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing transaction...</> : 'Sign & Send On-Chain'}
            </button>
          ) : (
            <button onClick={handleRegularConfirm} data-testid="regular-confirm"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors">
              Confirm and pay
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ========== PROCESSING MODAL ==========
export const ProcessingModal = ({ open }) => (
  <Dialog open={open} onOpenChange={() => {}}>
    <DialogContent className="sm:max-w-md border-gray-700/50 [&>button]:hidden" style={{ background: '#1a2235' }}>
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto mb-6" />
        <DialogTitle className="text-white text-lg font-medium mb-2">Transaction in progress</DialogTitle>
        <p className="text-gray-400 text-sm">Please wait while we process your transaction...</p>
      </div>
    </DialogContent>
  </Dialog>
);

// ========== COMPLETE MODAL ==========
export const CompleteModal = ({ open, onClose, data }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md border-gray-700/50" style={{ background: '#1a2235' }}>
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-gray-400 text-sm mb-1">Transaction submitted</p>
        <DialogTitle className="text-white text-lg font-medium mb-6">Yay! Your {data?.type === 'transfer' ? 'transfer' : 'withdrawal'} is completed!</DialogTitle>
        {data && (
          <div className="rounded-xl p-4 text-left mb-5" style={{ background: '#0c1120' }}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Sent</span><span className="text-white">{data.from?.amount} {data.from?.currency?.displayCode || data.from?.currency?.code}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Received</span><span className="text-emerald-400">{data.to?.amount} {data.to?.currency?.displayCode || data.to?.currency?.code}</span></div>
            </div>
          </div>
        )}
        <button onClick={onClose} data-testid="transaction-done" className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors">Done</button>
      </div>
    </DialogContent>
  </Dialog>
);
