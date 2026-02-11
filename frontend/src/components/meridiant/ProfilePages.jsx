import React, { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, Save, Wallet, Plus, Trash2, Building2, Smartphone, Clock, ArrowDownUp, CheckCircle2, Copy, ExternalLink, Check } from 'lucide-react';
import { authAPI, walletAPI, transactionAPI } from '@/lib/api';
import api from '@/lib/api';

const getExplorerUrl = (chain, txHash) => {
  const explorers = {
    'BSC': 'https://bscscan.com/tx/',
    'Polygon': 'https://polygonscan.com/tx/',
    'Ethereum': 'https://etherscan.io/tx/',
    'Arbitrum': 'https://arbiscan.io/tx/',
    'Optimism': 'https://optimistic.etherscan.io/tx/',
    'Base': 'https://basescan.org/tx/',
    'Avalanche': 'https://snowtrace.io/tx/',
    'Solana': 'https://solscan.io/tx/',
  };
  return (explorers[chain] || 'https://etherscan.io/tx/') + txHash;
};

const PageShell = ({ title, onBack, children }) => (
  <div className="w-full max-w-2xl mx-auto px-1">
    <div className="mb-6 flex items-center gap-3">
      <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors btn-press" data-testid="page-back-btn">
        <ArrowLeft className="w-5 h-5 text-gray-400" />
      </button>
      <h1 className="text-white text-lg sm:text-xl font-semibold">{title}</h1>
    </div>
    {children}
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl p-4 sm:p-5 md:p-6 glass-card ${className}`}>
    {children}
  </div>
);

const InputField = ({ label, value, onChange, placeholder, readOnly, type = 'text' }) => (
  <div>
    <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      className={`w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 ${readOnly ? 'opacity-60 cursor-not-allowed' : 'focus:ring-1 focus:ring-emerald-500/50'}`}
      style={{ background: '#0c1120' }} />
  </div>
);

// ========== MY PROFILE ==========
export const MyProfilePage = ({ user, onBack, onUpdate }) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    authAPI.getMe().then(r => { setPhone(r.data.phone || ''); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await api.put('/profile', { name, phone });
      onUpdate({ name: res.data.name, email: res.data.email });
      setEditing(false);
      setMsg('Profile updated successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Failed to update'); }
    setSaving(false);
  };

  return (
    <PageShell title="My Profile" onBack={onBack}>
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
              <Pencil className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
        {msg && <div className="mb-4 text-emerald-400 text-sm bg-emerald-500/10 rounded-lg px-3 py-2">{msg}</div>}
        <div className="space-y-4">
          <InputField label="Full Name" value={name} onChange={e => setName(e.target.value)} readOnly={!editing} />
          <InputField label="Email" value={user?.email || ''} readOnly={true} placeholder="Email" />
          <InputField label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} readOnly={!editing} placeholder="Enter phone number" />
        </div>
        {editing && (
          <div className="flex gap-3 mt-5">
            <button onClick={() => { setEditing(false); setName(user?.name || ''); }} className="flex-1 py-2.5 rounded-xl border border-gray-600/50 text-gray-300 text-sm hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </Card>
    </PageShell>
  );
};

// ========== WALLET ACCOUNT ==========
export const WalletAccountPage = ({ walletConnected, connectedWallet, walletAddress, onConnectWallet, onDisconnectWallet, onBack }) => {
  const [copied, setCopied] = useState(false);
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <PageShell title="Wallet Account" onBack={onBack}>
      <Card>
        {walletConnected ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: (connectedWallet?.color === '#000000' ? '#333' : connectedWallet?.color || '#34d399') + '20' }}>
                <Wallet className="w-6 h-6" style={{ color: connectedWallet?.color === '#000000' ? '#fff' : connectedWallet?.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold">{connectedWallet?.name || 'Wallet'}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-emerald-400 text-xs sm:text-sm font-mono break-all">{walletAddress}</p>
                  <button onClick={copyAddress} className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" data-testid="copy-wallet-btn">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4 mb-4" style={{ background: '#0c1120' }}>
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Status</span><span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Connected</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Network</span><span className="text-white">{connectedWallet?.chains?.join(', ') || 'EVM'}</span></div>
            </div>
            <button onClick={onDisconnectWallet} className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors">Disconnect Wallet</button>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-2xl bg-gray-800/60 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No Wallet Connected</h3>
            <p className="text-gray-400 text-sm mb-6">Connect your crypto wallet to start trading.</p>
            <button onClick={onConnectWallet} className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors">Connect Wallet</button>
          </div>
        )}
      </Card>
    </PageShell>
  );
};

// ========== WITHDRAWAL ACCOUNT ==========
export const WithdrawalAccountPage = ({ onBack }) => {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bank_name: '', account_number: '', account_holder: '', account_type: 'bank' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const r = await api.get('/bank-accounts'); setAccounts(r.data.accounts || []); }
    catch { /* */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    try {
      await api.post('/bank-accounts', form);
      setShowForm(false); setForm({ bank_name: '', account_number: '', account_holder: '', account_type: 'bank' });
      load();
    } catch { /* */ }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/bank-accounts/${id}`); load(); } catch { /* */ }
  };

  const TypeIcon = ({ type }) => type === 'ewallet' ? <Smartphone className="w-4 h-4 text-emerald-400" /> : <Building2 className="w-4 h-4 text-emerald-400" />;

  return (
    <PageShell title="Withdrawal Account" onBack={onBack}>
      <Card>
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-400 text-sm">Manage your withdrawal destinations</p>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: '#0c1120' }}>
            <div className="flex gap-2">
              {['bank', 'ewallet'].map(t => (
                <button key={t} onClick={() => setForm({ ...form, account_type: t })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.account_type === t ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700/40 text-gray-500'}`}>
                  {t === 'bank' ? 'Bank' : 'E-Wallet'}
                </button>
              ))}
            </div>
            <InputField label={form.account_type === 'bank' ? 'Bank Name' : 'E-Wallet Name'} value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. BCA" />
            <InputField label="Account Number" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} placeholder="e.g. 1234567890" />
            <InputField label="Account Holder Name" value={form.account_holder} onChange={e => setForm({ ...form, account_holder: e.target.value })} placeholder="Full name" />
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-gray-600/50 text-gray-300 text-sm">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium">Save</button>
            </div>
          </div>
        )}

        {loading ? <p className="text-gray-500 text-sm text-center py-8">Loading...</p> : accounts.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No withdrawal accounts added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map(a => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: '#0c1120' }}>
                <TypeIcon type={a.account_type} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{a.bank_name}</p>
                  <p className="text-gray-400 text-xs">{a.account_number} - {a.account_holder}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
};

// ========== HISTORY TRANSACTIONS ==========
export const HistoryTransactionsPage = ({ onBack }) => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionAPI.list().then(r => setTxs(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="History Transactions" onBack={onBack}>
      <Card>
        {loading ? <p className="text-gray-500 text-sm text-center py-8">Loading...</p> : txs.length === 0 ? (
          <div className="text-center py-10">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-1">No Transactions Yet</h3>
            <p className="text-gray-400 text-sm">Your transaction history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {txs.map(tx => (
              <div key={tx.id} className="flex items-center gap-2 sm:gap-3 rounded-xl px-3 sm:px-4 py-3.5" style={{ background: '#0c1120' }}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'transfer' ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                  <ArrowDownUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tx.type === 'transfer' ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-white text-xs sm:text-sm font-medium capitalize truncate">{tx.type}</p>
                    <p className="text-emerald-400 text-xs sm:text-sm font-medium whitespace-nowrap">{tx.to_amount} {tx.to_currency}</p>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-gray-500 text-[10px] sm:text-xs truncate">{new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">-{tx.from_amount} {tx.from_currency}</p>
                  </div>
                </div>
                <div className={`text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {tx.status}
                </div>
                {tx.tx_hash && (
                  <a href={getExplorerUrl(tx.chain, tx.tx_hash)} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0" data-testid={`tx-explorer-${tx.id}`}>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
};
