import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet, LogOut, ChevronDown, ChevronRight,
  CreditCard, History, UserCircle, CircleDot
} from 'lucide-react';
import { Button } from '../ui/button';

const Navbar = ({
  isLoggedIn, user, walletConnected, connectedWallet,
  walletAddress, onConnectWallet, onDisconnectWallet,
  onSignIn, onSignUp, onSignOut,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const truncAddr = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <nav className="flex items-center justify-between px-6 lg:px-10 py-4 relative z-50">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-white font-semibold text-xl tracking-tight">Meridiant</span>
      </div>

      <div className="flex items-center gap-3">
        {!isLoggedIn ? (
          <>
            <Button
              onClick={onSignIn}
              className="bg-white text-gray-900 hover:bg-gray-100 border-0 rounded-lg px-5 h-9 text-sm font-medium"
            >
              Sign in
            </Button>
            <Button
              onClick={onSignUp}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-lg px-5 h-9 text-sm font-medium"
            >
              Sign up
            </Button>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-2 hover:bg-emerald-500/25 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white text-sm font-medium leading-tight">{user?.name}</p>
                <p className="text-emerald-400/70 text-[11px] leading-tight">
                  {walletConnected ? truncAddr(walletAddress) : 'Not yet connected'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 top-full mt-2 w-[300px] rounded-xl overflow-hidden shadow-2xl border border-gray-700/40 animate-in fade-in slide-in-from-top-2 duration-200"
                style={{ background: '#1a2235' }}
              >
                <div className="p-4 border-b border-gray-700/40">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.name}</p>
                      <p className="text-gray-400 text-sm">
                        {walletConnected ? truncAddr(walletAddress) : 'Please connect wallet'}
                      </p>
                    </div>
                  </div>
                </div>

                {!walletConnected ? (
                  <div className="p-5 border-b border-gray-700/40 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-800/60 flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-white font-semibold mb-1">Connect Your Wallet</p>
                    <p className="text-gray-400 text-sm mb-4">Connect wallet to access all the details and features.</p>
                    <button
                      onClick={() => { setShowDropdown(false); onConnectWallet(); }}
                      className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors"
                    >
                      Connect wallet
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border-b border-gray-700/40">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: (connectedWallet?.color || '#34d399') + '25' }}>
                        <Wallet className="w-4 h-4" style={{ color: connectedWallet?.color === '#000000' ? '#fff' : connectedWallet?.color }} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{connectedWallet?.name}</p>
                        <p className="text-emerald-400 text-xs">{truncAddr(walletAddress)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowDropdown(false); onDisconnectWallet(); }}
                      className="w-full py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                    >
                      Disconnect wallet
                    </button>
                  </div>
                )}

                <div className="p-3 space-y-1">
                  {[
                    { icon: UserCircle, label: 'My profile' },
                    { icon: Wallet, label: 'Wallet account' },
                    { icon: CreditCard, label: 'Withdrawal account' },
                    { icon: History, label: 'History transactions' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                      style={{ background: '#0c1120' }}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-emerald-400" />
                        <span className="text-gray-300 text-sm">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowDropdown(false); onSignOut(); }}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ background: '#0c1120' }}
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-300 text-sm">Sign out</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="px-4 py-3 border-t border-gray-700/40">
                  <p className="text-gray-500 text-xs text-center">App: v1.0.0</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
