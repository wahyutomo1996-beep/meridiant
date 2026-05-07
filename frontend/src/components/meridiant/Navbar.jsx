import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet, LogOut, ChevronDown, ChevronRight,
  CreditCard, History, UserCircle, Menu, X, LayoutDashboard, Sun, Moon
} from 'lucide-react';

const Navbar = ({
  isLoggedIn, user, walletConnected, connectedWallet,
  walletAddress, onConnectWallet, onDisconnectWallet,
  onSignIn, onSignUp, onSignOut, onNavigate, theme, onToggleTheme,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const dropdownRef = useRef(null);
  const authRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (authRef.current && !authRef.current.contains(e.target)) setShowAuthMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = (page) => {
    setShowMobileMenu(false);
    setShowDropdown(false);
    onNavigate && onNavigate(page);
  };

  const truncAddr = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  const isDark = theme === 'dark';

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4 relative z-50" data-testid="navbar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('home')} data-testid="navbar-logo">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
          <span className="text-white font-bold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>M</span>
        </div>
        <span className="font-semibold text-xl tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
          Meridiant
        </span>
      </div>

      {/* Desktop Right Side */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          data-testid="theme-toggle"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {!isLoggedIn ? (
          <div className="relative" ref={authRef}>
            <button
              onClick={() => setShowAuthMenu(!showAuthMenu)}
              data-testid="auth-toggle-btn"
              className="flex items-center gap-2 px-5 h-9 rounded-xl text-sm font-medium transition-all bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
            >
              Login / Sign up
              <ChevronDown className={`w-3 h-3 transition-transform ${showAuthMenu ? 'rotate-180' : ''}`} />
            </button>
            {showAuthMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-2xl border anim-scale-in"
                style={{ background: 'var(--dropdown-bg)', borderColor: isDark ? 'rgba(55,65,81,0.4)' : 'rgba(203,213,225,0.5)' }}
              >
                <button
                  onClick={() => { setShowAuthMenu(false); onSignIn(); }}
                  data-testid="signin-btn"
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:bg-emerald-500/10"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <UserCircle className="w-4 h-4 text-emerald-400" />
                  Sign In
                </button>
                <div style={{ borderTop: '1px solid', borderColor: isDark ? 'rgba(55,65,81,0.3)' : 'rgba(203,213,225,0.3)' }} />
                <button
                  onClick={() => { setShowAuthMenu(false); onSignUp(); }}
                  data-testid="signup-btn"
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:bg-emerald-500/10"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Sign Up
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              data-testid="profile-dropdown-btn"
              className="flex items-center gap-3 rounded-2xl px-4 py-2 transition-all"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                <p className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                  {walletConnected ? truncAddr(walletAddress) : 'Not connected'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 top-full mt-2 w-[300px] rounded-2xl overflow-hidden shadow-2xl anim-scale-in"
                style={{ background: 'var(--dropdown-bg)', border: '1px solid', borderColor: isDark ? 'rgba(55,65,81,0.4)' : 'rgba(203,213,225,0.5)' }}
              >
                <div className="p-4" style={{ borderBottom: '1px solid', borderColor: isDark ? 'rgba(55,65,81,0.4)' : 'rgba(203,213,225,0.3)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {walletConnected ? truncAddr(walletAddress) : 'Please connect wallet'}
                      </p>
                    </div>
                  </div>
                </div>

                {!walletConnected ? (
                  <div className="p-5 text-center" style={{ borderBottom: '1px solid', borderColor: isDark ? 'rgba(55,65,81,0.4)' : 'rgba(203,213,225,0.3)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: isDark ? 'rgba(31,41,55,0.6)' : 'rgba(241,245,249,1)' }}>
                      <Wallet className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Connect Your Wallet</p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Connect wallet to access all features.</p>
                    <button
                      onClick={() => { setShowDropdown(false); onConnectWallet(); }}
                      data-testid="dropdown-connect-wallet-btn"
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors btn-press"
                    >
                      Connect wallet
                    </button>
                  </div>
                ) : (
                  <div className="p-4" style={{ borderBottom: '1px solid', borderColor: isDark ? 'rgba(55,65,81,0.4)' : 'rgba(203,213,225,0.3)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: (connectedWallet?.color || '#34d399') + '25' }}>
                        <Wallet className="w-4 h-4" style={{ color: connectedWallet?.color === '#000000' ? (isDark ? '#fff' : '#000') : connectedWallet?.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{connectedWallet?.name}</p>
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
                  {user?.is_admin && (
                    <button
                      onClick={() => { setShowDropdown(false); navigate('admin'); }}
                      data-testid="nav-admin"
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-emerald-500/10 transition-colors mb-1"
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
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors"
                      style={{ background: 'var(--card-inner)' }}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowDropdown(false); onSignOut(); }}
                    data-testid="signout-btn"
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors"
                    style={{ background: 'var(--card-inner)' }}
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign out</span>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>

                <div className="px-4 py-3" style={{ borderTop: '1px solid', borderColor: isDark ? 'rgba(55,65,81,0.4)' : 'rgba(203,213,225,0.3)' }}>
                  <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Meridiant v2.1.0</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile: Theme + Menu Button */}
      <div className="flex sm:hidden items-center gap-2">
        <button
          onClick={onToggleTheme}
          data-testid="mobile-theme-toggle"
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          data-testid="mobile-menu-btn"
          style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
        >
          {showMobileMenu ? <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} /> : <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 top-[60px] z-40 anim-fade-in" style={{ background: isDark ? 'rgba(8,13,24,0.97)' : 'rgba(240,244,248,0.97)', backdropFilter: 'blur(20px)' }}>
          <div className="p-5 space-y-4">
            {!isLoggedIn ? (
              <div className="space-y-3">
                <button
                  onClick={() => { setShowMobileMenu(false); onSignIn(); }}
                  data-testid="mobile-signin-btn"
                  className="w-full py-3 rounded-xl font-medium text-sm transition-all btn-press"
                  style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: 'var(--text-primary)', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
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
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: isDark ? 'rgba(21,28,44,0.8)' : 'rgba(255,255,255,0.8)' }}>
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{walletConnected ? truncAddr(walletAddress) : 'Wallet not connected'}</p>
                  </div>
                </div>

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

                <div className="space-y-2">
                  {user?.is_admin && (
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
                      style={{ background: isDark ? 'rgba(21,28,44,0.6)' : 'rgba(255,255,255,0.8)' }}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { setShowMobileMenu(false); onSignOut(); }}
                  className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                  style={{ color: 'var(--text-secondary)', border: '1px solid', borderColor: isDark ? 'rgba(55,65,81,0.4)' : 'rgba(203,213,225,0.5)' }}
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
