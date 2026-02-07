import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Hexagon, Shield, Flame, Layers, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { wallets } from '../../data/mockData';

const walletIcons = {
  metamask: { Icon: Hexagon, color: '#E2761B' },
  okx: { Icon: Layers, color: '#FFFFFF', bg: '#000' },
  phantom: { Icon: Shield, color: '#AB9FF2' },
  solflare: { Icon: Flame, color: '#FC7227' },
};

// ========== WALLET CONNECT MODAL ==========
export const WalletConnectModal = ({ open, onClose, onConnect }) => {
  const [connecting, setConnecting] = useState(null);
  const handleConnect = (wallet) => {
    setConnecting(wallet.id);
    setTimeout(() => { onConnect(wallet); setConnecting(null); }, 1200);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-gray-700/50 p-0 overflow-hidden" style={{ background: '#1a2235' }}>
        <DialogHeader className="p-5 pb-2">
          <DialogTitle className="text-white text-lg">Connect to a wallet</DialogTitle>
          <p className="text-gray-400 text-sm mt-1">Choose your preferred wallet to continue</p>
        </DialogHeader>
        <div className="p-5 pt-3 grid grid-cols-2 gap-3">
          {wallets.map(w => {
            const cfg = walletIcons[w.id];
            const isConn = connecting === w.id;
            return (
              <button key={w.id} onClick={() => handleConnect(w)} disabled={!!connecting}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-700/40 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all disabled:opacity-50"
                style={{ background: '#0f1729' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: cfg?.bg || (w.color + '20') }}>
                  {isConn ? <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    : cfg?.Icon && <cfg.Icon className="w-6 h-6" style={{ color: cfg.color }} />}
                </div>
                <span className="text-white text-sm font-medium">{w.name}</span>
              </button>
            );
          })}
        </div>
        <div className="px-5 pb-4">
          <p className="text-gray-500 text-xs text-center">By connecting, you agree to Meridiant's Terms of Service</p>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    setTimeout(() => { onSignIn(email, password); setLoading(false); setEmail(''); setPassword(''); }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setError(''); } onClose(v); }}>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPwd) { setError('Please fill in all fields'); return; }
    if (password !== confirmPwd) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    setTimeout(() => { onSignUp(name, email, password); setLoading(false); setName(''); setEmail(''); setPassword(''); setConfirmPwd(''); }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setError(''); } onClose(v); }}>
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
export const ProcessingModal = ({ open }) => {
  return (
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
};

// ========== COMPLETE MODAL ==========
export const CompleteModal = ({ open, onClose, data }) => {
  return (
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
};
