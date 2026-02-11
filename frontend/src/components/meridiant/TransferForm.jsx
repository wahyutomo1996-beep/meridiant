import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Building2, Smartphone, QrCode, X, TrendingUp, Clock, Check, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import {
  fiatCurrencies, cryptoCurrencies, transferMethodGroups,
  withdrawDestGroups, exchangeRates, chainLogos, mockBalances, MIN_AMOUNT_IDR,
  TRADE_FEE_RATE, PLATFORM_FEE_RATE, PLATFORM_FEE_THRESHOLD
} from '@/data/mockData';

const networks = [
  { id: 'all', name: 'All networks', color: null },
  { id: 'Ethereum', name: 'Ethereum', color: '#627EEA' },
  { id: 'Base', name: 'Base', color: '#0052FF' },
  { id: 'Arbitrum', name: 'Arbitrum', color: '#28A0F0' },
  { id: 'Optimism', name: 'Optimism', color: '#FF0420' },
  { id: 'BSC', name: 'BNB Chain', color: '#F0B90B' },
  { id: 'Solana', name: 'Solana', color: '#9945FF' },
  { id: 'Polygon', name: 'Polygon', color: '#8247E5' },
  { id: 'Avalanche', name: 'Avalanche', color: '#E84142' },
  { id: 'Bitcoin', name: 'Bitcoin', color: '#F7931A' },
  { id: 'TON', name: 'TON', color: '#0098EA' },
];

const popularTokenCodes = ['ETH', 'USDC', 'USDT', 'WBTC', 'SOL'];

const FlagIcon = ({ colors }) => (
  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gray-600/40">
    <div className="h-1/2 w-full" style={{ background: colors[0] }} />
    <div className="h-1/2 w-full" style={{ background: colors[1] }} />
  </div>
);

// Real crypto icon with logo image and fallback
const CryptoIcon = ({ token, size = 20 }) => {
  const [imgError, setImgError] = useState(false);
  if (token?.logo && !imgError) {
    return (
      <img
        src={token.logo}
        alt={token.code}
        width={size}
        height={size}
        className="rounded-full flex-shrink-0 object-cover"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: token?.color || '#555', width: size, height: size }}>
      <span className="text-white font-bold" style={{ fontSize: Math.max(8, size * 0.4) }}>{token?.code?.[0] || '?'}</span>
    </div>
  );
};

const categoryIcons = { 'Bank Transfer': Building2, 'Bank': Building2, 'E-Wallet': Smartphone, 'QRIS': QrCode };

// Smart number formatter - clean output without trailing zeros
const formatAmount = (value, isFiat = false) => {
  if (!value || isNaN(value)) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return '0';

  if (isFiat) {
    return Math.round(num).toLocaleString('en-US');
  }

  const abs = Math.abs(num);
  let maxDecimals;
  if (Number.isInteger(num)) maxDecimals = 0;
  else if (abs >= 1000) maxDecimals = 2;
  else if (abs >= 1) maxDecimals = 4;
  else if (abs >= 0.0001) maxDecimals = 6;
  else maxDecimals = 8;

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
};

const formatDisplayInput = (value) => {
  if (!value || isNaN(parseFloat(value))) return '';
  const num = parseFloat(value);
  if (Number.isInteger(num) && num >= 1000) return num.toLocaleString('en-US');
  return value;
};

// ========== TOKEN SELECTOR MODAL ==========
const TokenSelectorModal = ({ open, onClose, currencies, selected, onSelect, type }) => {
  const [search, setSearch] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [showNetworks, setShowNetworks] = useState(false);

  const popularTokens = useMemo(() =>
    currencies.filter(c => popularTokenCodes.includes(c.code) && !c.displayCode),
    [currencies]
  );

  const filtered = useMemo(() => {
    let list = currencies;
    if (selectedNetwork !== 'all') list = list.filter(c => c.chain === selectedNetwork);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.chain || '').toLowerCase().includes(q) ||
        (c.displayCode || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [currencies, selectedNetwork, search]);

  const handleSelect = (c) => { onSelect(c); onClose(); setSearch(''); setSelectedNetwork('all'); };
  const currentNet = networks.find(n => n.id === selectedNetwork);

  if (type === 'fiat') {
    return (
      <Dialog open={open} onOpenChange={() => { setSearch(''); onClose(); }}>
        <DialogContent className="sm:max-w-sm border-gray-700/50 p-0" style={{ background: '#111827' }}>
          <DialogTitle className="p-5 pb-3 text-white text-lg font-semibold">Select currency</DialogTitle>
          <div className="pb-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {currencies.map(c => (
              <button key={c.code} onClick={() => handleSelect(c)}
                className={`flex items-center gap-3 w-full px-5 py-3 hover:bg-white/5 ${selected.code === c.code ? 'bg-emerald-500/10' : ''}`}>
                <FlagIcon colors={c.flagColors} />
                <div className="text-left"><p className="text-white text-sm font-medium">{c.code}</p><p className="text-gray-400 text-xs">{c.name}</p></div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => { setSearch(''); setSelectedNetwork('all'); onClose(); }}>
      <DialogContent className="sm:max-w-md border-gray-700/50 p-0 gap-0 max-h-[85vh] sm:max-h-[85vh] h-[100dvh] sm:h-auto flex flex-col [&>button]:hidden sm:rounded-2xl rounded-none" style={{ background: '#111827' }}>
        <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
          <DialogTitle className="text-white text-lg font-semibold">Select a token</DialogTitle>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700/50" style={{ background: 'var(--card-inner)' }}>
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input type="text" placeholder="Search tokens..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-white text-sm outline-none placeholder:text-gray-500 w-full" />
            <div className="relative flex-shrink-0">
              <button onClick={() => setShowNetworks(!showNetworks)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                {currentNet?.id !== 'all' && chainLogos[currentNet?.id] ? (
                  <img src={chainLogos[currentNet.id]} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
                )}
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showNetworks ? 'rotate-180' : ''}`} />
              </button>
              {showNetworks && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-gray-700/50 shadow-2xl z-50 max-h-[300px] overflow-y-auto custom-scrollbar" style={{ background: '#1a2235' }}>
                  {networks.map(n => (
                    <button key={n.id} onClick={() => { setSelectedNetwork(n.id); setShowNetworks(false); }}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 hover:bg-white/5 text-sm ${selectedNetwork === n.id ? 'bg-emerald-500/10' : ''}`}>
                      {chainLogos[n.id] ? <img src={chainLogos[n.id]} alt="" className="w-5 h-5 rounded-full" />
                        : <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />}
                      <span className="text-white flex-1 text-left">{n.name}</span>
                      {selectedNetwork === n.id && <span className="text-emerald-400 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {popularTokens.length > 0 && selectedNetwork === 'all' && !search && (
          <div className="px-5 pb-3 flex gap-2 flex-wrap flex-shrink-0">
            {popularTokens.map((t, i) => {
              const isActive = (selected.displayCode || selected.code) === (t.displayCode || t.code);
              return (
                <button key={t.code + i} onClick={() => handleSelect(t)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${isActive ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-gray-700/40 hover:border-gray-600/60 bg-gray-800/40'}`}>
                  <CryptoIcon token={t} size={20} />
                  <span className="text-white text-xs font-medium">{t.code}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="px-5 py-2 flex items-center gap-2 text-gray-500 text-xs font-medium flex-shrink-0">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Tokens by 24H volume</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-3 min-h-0">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No tokens found</p>
          ) : (
            filtered.map((c, i) => {
              const key = c.displayCode || c.code;
              const isSelected = (selected.displayCode || selected.code) === key;
              const mockAddr = c.chain && c.chain !== 'Bitcoin' ? `0x${c.code.replace(/[^a-zA-Z]/g, '').slice(0, 4)}...${Math.random().toString(16).slice(2, 6)}` : null;
              return (
                <button key={key + i} onClick={() => handleSelect(c)}
                  className={`flex items-center gap-3.5 w-full px-5 py-3 hover:bg-white/5 transition-colors ${isSelected ? 'bg-emerald-500/8' : ''}`}>
                  <div className="relative flex-shrink-0">
                    <CryptoIcon token={c} size={36} />
                    {c.chain && chainLogos[c.chain] && (
                      <img src={chainLogos[c.chain]} alt="" className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#111827]" />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{c.name.split('(')[0].trim()}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">{c.displayCode || c.code}</span>
                      {mockAddr && <span className="text-gray-600 text-[11px] truncate">{mockAddr}</span>}
                    </div>
                  </div>
                  {c.chain && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-400 flex-shrink-0">{c.chain}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ========== CARD-STYLE METHOD/DESTINATION PICKER ==========
const MethodPickerModal = ({ open, onClose, groups, selected, onSelect, title }) => {
  const [imgErrors, setImgErrors] = useState({});

  const MethodLogo = ({ item }) => {
    if (item.logo && !imgErrors[item.id]) {
      return <img src={item.logo} alt={item.name} className="w-9 h-9 rounded-xl object-cover"
        onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))} />;
    }
    const CatIcon = categoryIcons[groups.find(g => g.items.some(i => i.id === item.id))?.category] || Building2;
    return (
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: (item.color || '#555') + '20' }}>
        <CatIcon className="w-4 h-4" style={{ color: item.color || '#888' }} />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-gray-700/50 p-0 gap-0 max-h-[85vh] sm:max-h-[85vh] h-[100dvh] sm:h-auto flex flex-col [&>button]:hidden sm:rounded-2xl rounded-none" style={{ background: '#111827' }}>
        <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
          <DialogTitle className="text-white text-lg font-semibold">{title}</DialogTitle>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5 custom-scrollbar">
          {groups.map((group) => {
            const CatIcon = categoryIcons[group.category] || Building2;
            return (
              <div key={group.category}>
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <CatIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">{group.category}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { onSelect(item); onClose(); }}
                      data-testid={`method-${item.id}`}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left ${
                        selected?.id === item.id
                          ? 'bg-emerald-500/10 border border-emerald-500/30 ring-1 ring-emerald-500/20'
                          : 'border border-gray-700/30 hover:border-gray-600/50 hover:bg-white/[0.02]'
                      }`}
                      style={{ background: selected?.id === item.id ? undefined : 'rgba(12,17,32,0.6)' }}
                    >
                      <MethodLogo item={item} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        {item.desc && <p className="text-gray-500 text-xs truncate">{item.desc}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        {item.fee !== undefined && (
                          <span className={`text-[11px] ${item.fee === 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                            {item.fee === 0 ? 'Gratis' : `Rp ${item.fee.toLocaleString()}`}
                          </span>
                        )}
                        {item.eta && (
                          <span className="text-gray-500 text-[10px] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />{item.eta}
                          </span>
                        )}
                      </div>
                      {selected?.id === item.id && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Selected method display card
const SelectedMethodCard = ({ item, onClick, placeholder }) => {
  const [imgError, setImgError] = useState(false);
  if (!item) {
    return (
      <button onClick={onClick} data-testid="method-picker-btn" className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm border border-gray-700/30 hover:border-gray-600/40 transition-colors" style={{ background: 'var(--card-inner)' }}>
        <span className="text-gray-500">{placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
    );
  }
  return (
    <button onClick={onClick} data-testid="method-picker-btn" className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm border border-emerald-500/20 hover:border-emerald-500/30 transition-colors" style={{ background: 'rgba(16,185,129,0.04)' }}>
      {item.logo && !imgError ? (
        <img src={item.logo} alt={item.name} className="w-8 h-8 rounded-lg object-cover" onError={() => setImgError(true)} />
      ) : (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: (item.color || '#555') + '20' }}>
          <span className="text-xs font-bold" style={{ color: item.color }}>{item.name[0]}</span>
        </div>
      )}
      <div className="flex-1 text-left">
        <p className="text-white text-sm font-medium">{item.name}</p>
        <div className="flex items-center gap-2 text-[11px]">
          <span className={item.fee === 0 ? 'text-emerald-400' : 'text-gray-400'}>{item.fee === 0 ? 'Gratis' : `Rp ${item.fee?.toLocaleString()}`}</span>
          {item.eta && <span className="text-gray-500">{item.eta}</span>}
        </div>
      </div>
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </button>
  );
};

// ========== MAIN TRANSFER FORM ==========
const TransferForm = ({ isLoggedIn, walletConnected, walletAddress, connectedWallet, liveRates, realBalances, onTransfer }) => {
  const [activeTab, setActiveTab] = useState('transfer');
  const [fromCurrency, setFromCurrency] = useState(fiatCurrencies[0]);
  const [toCurrency, setToCurrency] = useState(cryptoCurrencies[0]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [quoteTimer, setQuoteTimer] = useState(10);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    const t = setInterval(() => setQuoteTimer(p => p <= 0 ? 10 : p - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) { setToAmount(''); setAmountError(''); return; }
    const fromKey = fromCurrency.displayCode || fromCurrency.code;
    const toKey = toCurrency.displayCode || toCurrency.code;
    const rates = liveRates || exchangeRates;
    const rate = rates[`${fromKey}_${toKey}`];
    if (rate) {
      const result = parseFloat(fromAmount) * rate;
      const isFiatOutput = activeTab === 'withdraw';
      setToAmount(formatAmount(result, isFiatOutput));
    } else { setToAmount('0'); }

    // Validate minimum amount
    const amt = parseFloat(fromAmount);
    if (activeTab === 'transfer' && fromCurrency.code === 'IDR' && amt > 0 && amt < MIN_AMOUNT_IDR) {
      setAmountError(`Minimum pembelian Rp ${MIN_AMOUNT_IDR.toLocaleString()}`);
    } else {
      setAmountError('');
    }
  }, [fromAmount, fromCurrency, toCurrency, activeTab, liveRates]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab); setFromAmount(''); setToAmount('');
    setSelectedMethod(null); setSelectedDest(null); setAmountError('');
    if (tab === 'transfer') { setFromCurrency(fiatCurrencies[0]); setToCurrency(cryptoCurrencies[0]); }
    else { setFromCurrency(cryptoCurrencies[0]); setToCurrency(fiatCurrencies[0]); }
  };

  const handleSubmit = () => {
    // Validate minimum
    if (activeTab === 'transfer' && fromCurrency.code === 'IDR') {
      const amt = parseFloat(fromAmount);
      if (!amt || amt < MIN_AMOUNT_IDR) {
        setAmountError(`Minimum pembelian Rp ${MIN_AMOUNT_IDR.toLocaleString()}`);
        return;
      }
    }
    onTransfer({
      type: activeTab,
      from: { currency: fromCurrency, amount: fromAmount },
      to: { currency: toCurrency, amount: toAmount },
      method: selectedMethod, destination: selectedDest,
    });
  };

  const fromType = activeTab === 'transfer' ? 'fiat' : 'crypto';
  const toType = activeTab === 'transfer' ? 'crypto' : 'fiat';
  const fromList = activeTab === 'transfer' ? fiatCurrencies : cryptoCurrencies;
  const toList = activeTab === 'transfer' ? cryptoCurrencies : fiatCurrencies;

  const btnText = !isLoggedIn ? 'Sign in to continue' : !walletConnected ? 'Connect wallet' : (activeTab === 'transfer' ? 'Transfer now' : 'Withdraw now');

  // Fee estimation
  const currentSelection = activeTab === 'transfer' ? selectedMethod : selectedDest;
  const amt = parseFloat(fromAmount) || 0;
  const idrAmount = activeTab === 'transfer' ? amt : 0; // only apply trade/platform fee on transfer (IDR → crypto)
  const tradeFee = activeTab === 'transfer' ? Math.round(amt * TRADE_FEE_RATE) : 0;
  const platformFee = (activeTab === 'transfer' && amt >= PLATFORM_FEE_THRESHOLD) ? Math.round(amt * PLATFORM_FEE_RATE) : 0;
  const methodFee = currentSelection?.fee || 0;
  const totalFee = tradeFee + platformFee + methodFee;

  const CurrencyBtn = ({ currency, type, onClick }) => (
    <button onClick={onClick} className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-gray-600/30 transition-colors flex-shrink-0" style={{ background: 'rgba(75,85,99,0.3)' }}>
      {type === 'fiat' ? <FlagIcon colors={currency.flagColors} /> : <CryptoIcon token={currency} size={20} />}
      <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">{currency.displayCode || currency.code}</span>
      <ChevronDown className="w-3 h-3 text-gray-400" />
    </button>
  );

  return (
    <div className="w-full max-w-[500px] mx-auto px-0 sm:px-1">
      <div className="rounded-2xl p-4 sm:p-6 md:p-7 glass-card anim-pulse-glow card-lift">
        <div className="flex gap-8 mb-6">
          {['transfer', 'withdraw'].map(tab => (
            <button key={tab} onClick={() => handleTabSwitch(tab)}
              className={`relative pb-3 text-sm font-medium transition-colors ${activeTab === tab ? '' : 'hover:opacity-80'}`}
              style={{ color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              <span>{tab === 'transfer' ? 'Transfer' : 'Withdraw'}</span>
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-700/40 text-gray-500'}`}>
                {tab === 'transfer' ? 'On Chain' : 'Off Chain'}
              </span>
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>{activeTab === 'transfer' ? 'Transfer' : 'From'}</label>
          <div className={`flex items-center gap-2 rounded-xl px-3 py-3 border overflow-hidden ${amountError ? 'border-red-500/40' : 'border-transparent'}`} style={{ background: 'var(--card-inner)' }}>
            <CurrencyBtn currency={fromCurrency} type={fromType} onClick={() => setShowFromPicker(true)} />
            <input type="number" inputMode="decimal" placeholder="0" value={fromAmount} onChange={e => setFromAmount(e.target.value)}
              data-testid="from-amount-input"
              className="w-0 flex-1 min-w-0 bg-transparent text-right text-sm sm:text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ color: 'var(--text-primary)' }} />
          </div>
          {amountError && (
            <div className="flex items-center gap-1.5 mt-1.5 px-1" data-testid="amount-error">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-xs">{amountError}</span>
            </div>
          )}
          {activeTab === 'transfer' && !amountError && (
            <p className="text-gray-600 text-[11px] mt-1.5 px-1">Min. Rp {MIN_AMOUNT_IDR.toLocaleString()}</p>
          )}
          {activeTab === 'withdraw' && (() => {
            const balKey = fromCurrency.displayCode || fromCurrency.code;
            const realBal = realBalances?.[balKey];
            const bal = realBal !== undefined && realBal !== null ? parseFloat(realBal) : (mockBalances[balKey] || 0);
            const isReal = realBal !== undefined && realBal !== null;
            return (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-xs">Available: <span className="text-gray-300 font-medium">{formatAmount(bal)} {balKey}</span>{isReal && <span className="text-emerald-500 ml-1 text-[10px]">LIVE</span>}</span>
                </div>
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map(pct => {
                    const val = (bal * pct / 100);
                    const isActive = fromAmount && Math.abs(parseFloat(fromAmount) - val) < 0.000001;
                    return (
                      <button key={pct} onClick={() => setFromAmount(String(val))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                          ? 'bg-emerald-500 text-white'
                          : 'text-emerald-400 hover:bg-emerald-500/15'
                        }`}
                        style={!isActive ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' } : {}}>
                        {pct}%
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="mb-4">
          <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Receive</label>
          <div className="flex items-center gap-2 rounded-xl px-3 py-3 overflow-hidden" style={{ background: 'var(--card-inner)' }}>
            <CurrencyBtn currency={toCurrency} type={toType} onClick={() => setShowToPicker(true)} />
            <input type="text" placeholder="0" value={toAmount} readOnly
              data-testid="to-amount-input"
              className="w-0 flex-1 min-w-0 bg-transparent text-white text-right text-sm sm:text-base outline-none placeholder:text-gray-600" />
          </div>
        </div>

        {activeTab === 'transfer' ? (
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Transfer method</label>
            <SelectedMethodCard item={selectedMethod} onClick={() => setShowMethodPicker(true)} placeholder="Pilih metode transfer" />
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Withdraw destination</label>
            <SelectedMethodCard item={selectedDest} onClick={() => setShowMethodPicker(true)} placeholder="Pilih tujuan withdraw" />
          </div>
        )}

        {/* Fee estimation */}
        {fromAmount && parseFloat(fromAmount) > 0 && (
          <div className="mb-4 rounded-xl px-3 sm:px-4 py-3 space-y-2" style={{ background: 'var(--card-inner)' }} data-testid="fee-estimation">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">Estimasi yang diterima</span>
              <span className="text-emerald-400 text-xs sm:text-sm font-medium truncate ml-2">{toAmount || '0'} {toCurrency.displayCode || toCurrency.code}</span>
            </div>
            {activeTab === 'transfer' && tradeFee > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Trade fee (0.3%)</span>
                <span className="text-gray-400 text-xs">Rp {tradeFee.toLocaleString()}</span>
              </div>
            )}
            {activeTab === 'transfer' && platformFee > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Platform fee (0.2%)</span>
                <span className="text-gray-400 text-xs">Rp {platformFee.toLocaleString()}</span>
              </div>
            )}
            {methodFee > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Biaya {currentSelection?.name}</span>
                <span className="text-gray-400 text-xs">Rp {methodFee.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-700/30 pt-2 flex items-center justify-between">
              <span className="text-gray-400 text-xs font-medium">Total biaya</span>
              <span className={`text-xs font-medium ${totalFee === 0 ? 'text-emerald-400' : 'text-white'}`}>
                {totalFee === 0 ? 'Gratis' : `~Rp ${totalFee.toLocaleString()}`}
              </span>
            </div>
          </div>
        )}

        {/* Simple estimate when no amount */}
        {(!fromAmount || parseFloat(fromAmount) <= 0) && (
          <div className="mb-4 rounded-xl px-3 sm:px-4 py-3" style={{ background: 'var(--card-inner)' }}>
            <p className="text-gray-400 text-xs sm:text-sm">
              You'll receive an estimate of <span className="text-emerald-400 font-medium">0 {toCurrency.displayCode || toCurrency.code}</span> for <span className="text-emerald-400 font-medium">0 {fromCurrency.displayCode || fromCurrency.code}</span>
            </p>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mb-5">Quote updates in {quoteTimer}s</p>

        <button onClick={handleSubmit} data-testid="transfer-submit-btn"
          disabled={!!amountError}
          className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-medium text-sm transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 btn-press">
          {btnText}
        </button>
      </div>

      <TokenSelectorModal open={showFromPicker} onClose={() => setShowFromPicker(false)} currencies={fromList} selected={fromCurrency} onSelect={setFromCurrency} type={fromType} />
      <TokenSelectorModal open={showToPicker} onClose={() => setShowToPicker(false)} currencies={toList} selected={toCurrency} onSelect={setToCurrency} type={toType} />
      <MethodPickerModal
        open={showMethodPicker}
        onClose={() => setShowMethodPicker(false)}
        groups={activeTab === 'transfer' ? transferMethodGroups : withdrawDestGroups}
        selected={activeTab === 'transfer' ? selectedMethod : selectedDest}
        onSelect={activeTab === 'transfer' ? setSelectedMethod : setSelectedDest}
        title={activeTab === 'transfer' ? 'Pilih Metode Transfer' : 'Pilih Tujuan Withdraw'}
      />
    </div>
  );
};

export default TransferForm;
