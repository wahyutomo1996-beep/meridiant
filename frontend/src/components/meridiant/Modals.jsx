import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Eye, EyeOff, Loader2, Check, Search, Wallet2, Hexagon, Shield, Flame, Layers } from 'lucide-react';
import { wallets } from '@/data/mockData';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

// ========== WALLET CONNECT MODAL ==========
export const WalletConnectModal = ({ open, onClose, onConnect }) => {
  const [connecting, setConnecting] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = wallets.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = (wallet) => {
    setConnecting(wallet.id);
    setTimeout(() => { onConnect(wallet); setConnecting(null); setSearch(''); }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setSearch(''); onClose(v); }}>
      <DialogContent className="sm:max-w-md border-gray-700/50 p-0 overflow-hidden" style={{ background: '#111827' }}>
        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl border-2 border-gray-600/40 flex items-center justify-center mx-auto mb-5" style={{ background: '#1a2235' }}>
            <Wallet2 className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-1">Select your wallet</h2>
          <p className="text-gray-400 text-sm">Connect a wallet to your Meridiant account</p>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-700/50" style={{ background: '#0c1120' }}>
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text" placeholder={`Search through ${wallets.length} wallets...`} value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-white text-sm outline-none placeholder:text-gray-500 w-full"
            />
          </div>
        </div>

        {/* Wallet list */}
        <div className="px-3 pb-2 max-h-[320px] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">No wallets found</p>
          )}
          {filtered.map(w => {
            const cfg = walletIcons[w.id];
            const isConn = connecting === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleConnect(w)}
                disabled={!!connecting}
                className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all disabled:opacity-40 group"
              >
                {/* Wallet icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ background: w.bgColor || (w.color + '20') }}
                  >
                    {isConn ? (
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    ) : (
                      cfg?.Icon && <cfg.Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    )}
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111827]" />
                </div>

                {/* Name */}
                <span className="text-white text-sm font-medium flex-1 text-left">{w.name}</span>

                {/* Chain badges */}
                <div className="flex items-center gap-1.5">
                  {w.chains.map(c => <ChainBadge key={c} chain={c} />)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/30 text-center">
          <p className="text-gray-500 text-xs">
            By logging in I agree to the <span className="text-emerald-400 cursor-pointer hover:underline">Terms</span> & <span className="text-emerald-400 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
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
    try {
      await onSignIn(email, password);
      setEmail(''); setPassword('');
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
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
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                className="w-full rounded-xl px-4 py-3 pr-10 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
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
        <button onClick={() => { setLoading(true); setTimeout(() => { onSignIn('google-user@gmail.com', 'google'); setLoading(false); }, 800); }}
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
    try {
      await onSignUp(name, email, password);
      setName(''); setEmail(''); setPassword(''); setConfirmPwd('');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
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
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name"
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password"
                className="w-full rounded-xl px-4 py-3 pr-10 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Confirm Password</label>
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Confirm your password"
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/50" style={{ background: '#0c1120' }} />
          </div>
          <button type="submit" disabled={loading}
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
        <button onClick={() => { setLoading(true); setTimeout(() => { onSignUp('Google User', 'google-user@gmail.com', 'google'); setLoading(false); }, 800); }}
          className="w-full py-3 rounded-xl border border-gray-600/50 text-white font-medium text-sm transition-colors hover:bg-white/5 flex items-center justify-center gap-3">
          <GoogleIcon /> Continue with Google
        </button>
      </DialogContent>
    </Dialog>
  );
};

// ========== CHECKOUT MODAL ==========
export const CheckoutModal = ({ open, onClose, data, onConfirm }) => {
  if (!data) return null;
  const txId = 'MRD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  return (
    <Dialog open={open} onOpenChange={onClose}>
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
            <div className="flex justify-between text-sm"><span className="text-gray-400">Amount to send</span><span className="text-white">{data.from?.amount} {data.from?.currency?.code}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">You'll receive</span><span className="text-emerald-400">{data.to?.amount} {data.to?.currency?.code}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Fee</span><span className="text-white">0.5%</span></div>
            <div className="border-t border-gray-700/40 pt-3 flex justify-between text-sm"><span className="text-gray-400">Total transfer</span><span className="text-white font-medium">{data.from?.amount} {data.from?.currency?.code}</span></div>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#0c1120' }}>
            <h4 className="text-gray-400 text-sm font-medium mb-2">How to pay</h4>
            <p className="text-white text-sm">{data.method?.name || data.destination?.name || 'Bank Transfer'}</p>
          </div>
          <button onClick={onConfirm} className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors">Confirm and pay</button>
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
        <h3 className="text-white text-lg font-medium mb-2">Transaction in progress</h3>
        <p className="text-gray-400 text-sm">Please wait while we process your transaction...</p>
        <div className="text-amber-400 font-mono text-2xl mt-4">00:10:00</div>
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
        <h3 className="text-white text-lg font-medium mb-6">Yay! Your {data?.type === 'transfer' ? 'transfer' : 'withdrawal'} is completed!</h3>
        {data && (
          <div className="rounded-xl p-4 text-left mb-5" style={{ background: '#0c1120' }}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Sent</span><span className="text-white">{data.from?.amount} {data.from?.currency?.code}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Received</span><span className="text-emerald-400">{data.to?.amount} {data.to?.currency?.code}</span></div>
            </div>
          </div>
        )}
        <button onClick={onClose} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors">Done</button>
      </div>
    </DialogContent>
  </Dialog>
);
