import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet, LogOut, ChevronDown, ChevronRight,
  CreditCard, History, UserCircle, Menu, X, LayoutDashboard
} from 'lucide-react';
import { Button } from '../ui/button';

const Navbar = ({
  isLoggedIn, user, walletConnected, connectedWallet,
  walletAddress, onConnectWallet, onDisconnectWallet,
  onSignIn, onSignUp, onSignOut, onNavigate,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  // Close mobile menu on navigation
  const navigate = (page) => {
    setShowMobileMenu(false);
    setShowDropdown(false);
    onNavigate && onNavigate(page);
  };

  const truncAddr = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4 relative z-50" data-testid="navbar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('home')} data-testid="navbar-logo">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
          <span className="text-white font-bold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>M</span>
        </div>
        <span className="text-white font-semibold text-xl tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Meridiant
        </span>
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden sm:flex items-center gap-3">
        {!isLoggedIn ? (
          <>
            <Button
              onClick={onSignIn}
              data-testid="signin-btn"
              className="bg-white/10 text-white hover:bg-white/20 border border-white/10 rounded-xl px-5 h-9 text-sm font-medium backdrop-blur-sm transition-all"
            >
              Sign in
            </Button>
            <Button
              onClick={onSignUp}
              data-testid="signup-btn"
              className="bg-emerald-500 hover:bg-emerald-400 text-white border-0 rounded-xl px-5 h-9 text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
            >
              Sign up
            </Button>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              data-testid="profile-dropdown-btn"
              className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2 hover:bg-emerald-500/20 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-white text-sm font-medium leading-tight">{user?.name}</p>
                <p className="text-emerald-400/70 text-[11px] leading-tight">
                  {walletConnected ? truncAddr(walletAddress) : 'Not connected'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 top-full mt-2 w-[300px] rounded-2xl overflow-hidden shadow-2xl border border-gray-700/40 anim-scale-in"
                style={{ background: '#1a2235' }}
              >
                <div className="p-4 border-b border-gray-700/40">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
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
                    <p className="text-gray-400 text-sm mb-4">Connect wallet to access all features.</p>
                    <button
                      onClick={() => { setShowDropdown(false); onConnectWallet(); }}
                      data-testid="dropdown-connect-wallet-btn"
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors btn-press"
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
                      className="w-full py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                    >
                      Disconnect wallet
                    </button>
                  </div>
                )}

                <div className="p-3 space-y-1">
                  {user?.email === 'admin@meridiant.com' && (
                    <button
                      onClick={() => { setShowDropdown(false); navigate('admin'); }}
                      data-testid="nav-admin"
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors mb-1"
                      style={{ background: 'rgba(52,211,153,0.08)' }}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-sm font-medium">Admin Dashboard</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                  {[
                    { icon: UserCircle, label: 'My profile', page: 'profile' },
                    { icon: Wallet, label: 'Wallet account', page: 'wallet-account' },
                    { icon: CreditCard, label: 'Withdrawal account', page: 'withdrawal-account' },
                    { icon: History, label: 'History transactions', page: 'history' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { setShowDropdown(false); navigate(item.page); }}
                      data-testid={`nav-${item.page}`}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
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
                    data-testid="signout-btn"
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
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
                  <p className="text-gray-500 text-xs text-center">Meridiant v2.0.0</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        data-testid="mobile-menu-btn"
      >
        {showMobileMenu ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 top-[60px] z-40 anim-fade-in" style={{ background: 'rgba(8, 13, 24, 0.97)', backdropFilter: 'blur(20px)' }}>
          <div className="p-5 space-y-4">
            {!isLoggedIn ? (
              <div className="space-y-3">
                <button
                  onClick={() => { setShowMobileMenu(false); onSignIn(); }}
                  data-testid="mobile-signin-btn"
                  className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium text-sm transition-all btn-press"
                >
                  Sign in
                </button>
                <button
                  onClick={() => { setShowMobileMenu(false); onSignUp(); }}
                  data-testid="mobile-signup-btn"
                  className="w-full py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 transition-all btn-press"
                >
                  Sign up
                </button>
              </div>
            ) : (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(21, 28, 44, 0.8)' }}>
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user?.name}</p>
                    <p className="text-gray-400 text-sm">{walletConnected ? truncAddr(walletAddress) : 'Wallet not connected'}</p>
                  </div>
                </div>

                {/* Wallet action */}
                {!walletConnected ? (
                  <button
                    onClick={() => { setShowMobileMenu(false); onConnectWallet(); }}
                    className="w-full py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-medium text-sm transition-all btn-press"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowMobileMenu(false); onDisconnectWallet(); }}
                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                  >
                    Disconnect {connectedWallet?.name}
                  </button>
                )}

                {/* Nav items */}
                <div className="space-y-2">
                  {user?.email === 'admin@meridiant.com' && (
                    <button
                      onClick={() => navigate('admin')}
                      data-testid="mobile-nav-admin"
                      className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-colors"
                      style={{ background: 'rgba(52,211,153,0.1)' }}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400 text-sm font-medium">Admin Dashboard</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                  {[
                    { icon: UserCircle, label: 'My profile', page: 'profile' },
                    { icon: Wallet, label: 'Wallet account', page: 'wallet-account' },
                    { icon: CreditCard, label: 'Withdrawal account', page: 'withdrawal-account' },
                    { icon: History, label: 'History transactions', page: 'history' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => navigate(item.page)}
                      data-testid={`mobile-nav-${item.page}`}
                      className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-colors"
                      style={{ background: 'rgba(21, 28, 44, 0.6)' }}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-emerald-400" />
                        <span className="text-white text-sm">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  ))}
                </div>

                {/* Sign out */}
                <button
                  onClick={() => { setShowMobileMenu(false); onSignOut(); }}
                  className="w-full py-3 rounded-xl border border-gray-700/40 text-gray-400 text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
