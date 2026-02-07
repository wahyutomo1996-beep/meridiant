import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Building2, Smartphone, QrCode } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  fiatCurrencies, cryptoCurrencies, transferMethodGroups,
  withdrawDestGroups, exchangeRates
} from '@/data/mockData';

const FlagIcon = ({ colors }) => (
  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gray-600/40">
    <div className="h-1/2 w-full" style={{ background: colors[0] }} />
    <div className="h-1/2 w-full" style={{ background: colors[1] }} />
  </div>
);

const CryptoIcon = ({ color, code }) => (
  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: color }}>
    <span className="text-white text-[9px] font-bold">{code[0]}</span>
  </div>
);

const categoryIcons = {
  'Bank Transfer': Building2,
  'Bank': Building2,
  'E-Wallet': Smartphone,
  'QRIS': QrCode,
};

const CurrencyPicker = ({ currencies, selected, onSelect, type }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-600/30 transition-colors flex-shrink-0" style={{ background: 'rgba(75,85,99,0.3)' }}>
          {type === 'fiat' ? <FlagIcon colors={selected.flagColors} /> : <CryptoIcon color={selected.color} code={selected.code} />}
          <span className="text-white text-sm font-medium">{selected.displayCode || selected.code}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 border-gray-700/50" style={{ background: '#1a2235' }} align="start">
        <div className="p-2.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#0c1120' }}>
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search currency..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-white text-sm outline-none placeholder:text-gray-500 w-full" />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto custom-scrollbar">
          {filtered.map((c, i) => {
            const key = c.displayCode || c.code;
            const isSelected = (selected.displayCode || selected.code) === key;
            return (
              <button key={key + i} onClick={() => { onSelect(c); setOpen(false); setSearch(''); }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 hover:bg-white/5 transition-colors ${isSelected ? 'bg-emerald-500/10' : ''}`}>
                {type === 'fiat' ? <FlagIcon colors={c.flagColors} /> : <CryptoIcon color={c.color} code={c.code} />}
                <div className="text-left flex-1">
                  <p className="text-white text-sm font-medium">{c.displayCode || c.code}</p>
                  <p className="text-gray-400 text-xs">{c.name}</p>
                </div>
                {c.chain && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-700/60 text-gray-400">{c.chain}</span>}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Grouped popover for transfer methods and withdraw destinations
const GroupedPicker = ({ groups, selected, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm" style={{ background: '#0c1120' }}>
          <span className={selected ? 'text-white' : 'text-gray-500'}>
            {selected ? selected.name : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 border-gray-700/50 max-h-[320px] overflow-y-auto custom-scrollbar"
        style={{ background: '#1a2235' }}
      >
        {groups.map((group, gi) => {
          const CatIcon = categoryIcons[group.category] || Building2;
          return (
            <div key={group.category}>
              {gi > 0 && <div className="border-t border-gray-700/30 mx-3" />}
              <div className="flex items-center gap-2 px-4 py-2.5 sticky top-0" style={{ background: '#1a2235' }}>
                <CatIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">{group.category}</span>
              </div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); setOpen(false); }}
                  className={`flex flex-col w-full px-4 py-2.5 pl-10 hover:bg-white/5 transition-colors text-left ${selected?.id === item.id ? 'bg-emerald-500/10' : ''}`}
                >
                  <span className="text-white text-sm">{item.name}</span>
                  {item.desc && <span className="text-gray-500 text-xs">{item.desc}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

const TransferForm = ({ isLoggedIn, walletConnected, onTransfer }) => {
  const [activeTab, setActiveTab] = useState('transfer');
  const [fromCurrency, setFromCurrency] = useState(fiatCurrencies[0]);
  const [toCurrency, setToCurrency] = useState(cryptoCurrencies[0]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [quoteTimer, setQuoteTimer] = useState(10);

  useEffect(() => {
    const t = setInterval(() => setQuoteTimer(p => p <= 0 ? 10 : p - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) { setToAmount(''); return; }
    const fromKey = fromCurrency.displayCode || fromCurrency.code;
    const toKey = toCurrency.displayCode || toCurrency.code;
    const key = `${fromKey}_${toKey}`;
    const rate = exchangeRates[key];
    if (rate) {
      const result = parseFloat(fromAmount) * rate;
      setToAmount(activeTab === 'transfer' ? result.toFixed(8) : result.toLocaleString('id-ID'));
    } else {
      setToAmount('0');
    }
  }, [fromAmount, fromCurrency, toCurrency, activeTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setFromAmount(''); setToAmount('');
    setSelectedMethod(null); setSelectedDest(null);
    if (tab === 'transfer') { setFromCurrency(fiatCurrencies[0]); setToCurrency(cryptoCurrencies[0]); }
    else { setFromCurrency(cryptoCurrencies[0]); setToCurrency(fiatCurrencies[0]); }
  };

  const handleSubmit = () => {
    onTransfer({
      type: activeTab,
      from: { currency: fromCurrency, amount: fromAmount },
      to: { currency: toCurrency, amount: toAmount },
      method: selectedMethod,
      destination: selectedDest,
    });
  };

  const fromType = activeTab === 'transfer' ? 'fiat' : 'crypto';
  const toType = activeTab === 'transfer' ? 'crypto' : 'fiat';
  const fromList = activeTab === 'transfer' ? fiatCurrencies : cryptoCurrencies;
  const toList = activeTab === 'transfer' ? cryptoCurrencies : fiatCurrencies;

  const btnText = !isLoggedIn
    ? 'Sign in to continue'
    : !walletConnected
      ? 'Connect wallet'
      : (activeTab === 'transfer' ? 'Transfer now' : 'Withdraw now');

  return (
    <div className="w-full max-w-[500px] mx-auto">
      <div className="rounded-2xl p-6 md:p-7" style={{ background: 'rgba(21, 28, 44, 0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(52, 211, 153, 0.06)' }}>
        {/* Tabs */}
        <div className="flex gap-8 mb-6">
          {['transfer', 'withdraw'].map(tab => (
            <button key={tab} onClick={() => handleTabSwitch(tab)}
              className={`relative pb-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <span className="capitalize">{tab === 'transfer' ? 'Transfer' : 'Withdraw'}</span>
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-700/40 text-gray-500'}`}>
                {tab === 'transfer' ? 'On Chain' : 'Off Chain'}
              </span>
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />}
            </button>
          ))}
        </div>

        {/* From */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Transfer</label>
          <div className="flex items-center gap-2 rounded-xl px-3 py-3" style={{ background: '#0c1120' }}>
            <CurrencyPicker currencies={fromList} selected={fromCurrency} onSelect={setFromCurrency} type={fromType} />
            <input type="number" placeholder="0" value={fromAmount} onChange={e => setFromAmount(e.target.value)}
              className="flex-1 bg-transparent text-white text-right text-base outline-none placeholder:text-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          </div>
        </div>

        {/* To */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Receive</label>
          <div className="flex items-center gap-2 rounded-xl px-3 py-3" style={{ background: '#0c1120' }}>
            <CurrencyPicker currencies={toList} selected={toCurrency} onSelect={setToCurrency} type={toType} />
            <input type="text" placeholder="0" value={toAmount} readOnly
              className="flex-1 bg-transparent text-white text-right text-base outline-none placeholder:text-gray-600" />
          </div>
        </div>

        {/* Transfer method / Withdraw destination - GROUPED */}
        {activeTab === 'transfer' ? (
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Transfer method</label>
            <GroupedPicker groups={transferMethodGroups} selected={selectedMethod} onSelect={setSelectedMethod} placeholder="Choose transfer method" />
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Withdraw destination</label>
            <GroupedPicker groups={withdrawDestGroups} selected={selectedDest} onSelect={setSelectedDest} placeholder="Choose withdraw destination" />
          </div>
        )}

        {/* Estimate */}
        <div className="mb-4 rounded-xl px-4 py-3" style={{ background: '#0c1120' }}>
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              You'll receive an estimate of <span className="text-emerald-400 font-medium">{toAmount || '0'}</span> for <span className="text-emerald-400 font-medium">{fromAmount || '0'} {toCurrency.code}</span>
            </p>
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mb-5">Quote updates in {quoteTimer}s</p>

        <button onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors active:scale-[0.98]">
          {btnText}
        </button>
      </div>
    </div>
  );
};

export default TransferForm;
