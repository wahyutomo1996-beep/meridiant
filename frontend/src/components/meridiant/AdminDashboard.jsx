import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, ArrowUpDown, BarChart3, Bell, RefreshCw, Search, ExternalLink, Settings } from 'lucide-react';
import api from '@/lib/api';
import { smartFormat } from '@/lib/smart-format';

const StatCard = ({ label, value, icon: Icon, accent = false }) => (
  <div className="glass-card rounded-xl p-4 sm:p-5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-xs uppercase tracking-wide">{label}</span>
      <Icon className={`w-4 h-4 ${accent ? 'text-emerald-400' : 'text-gray-500'}`} />
    </div>
    <p className={`text-xl sm:text-2xl font-bold ${accent ? 'text-emerald-400' : 'text-white'}`}>
      {typeof value === 'number' ? smartFormat(value) : value}
    </p>
  </div>
);

const AdminDashboard = ({ onBack, token }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalTxs, setTotalTxs] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [txSearch, setTxSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [telegramConfig, setTelegramConfig] = useState({ configured: false });
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [tgSaving, setTgSaving] = useState(false);
  const [tgMessage, setTgMessage] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, txRes, usersRes, tgRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/transactions?limit=50'),
        api.get('/admin/users?limit=50'),
        api.get('/admin/telegram-config').catch(() => ({ data: { configured: false } })),
      ]);
      setStats(statsRes.data);
      setTransactions(txRes.data.transactions);
      setTotalTxs(txRes.data.total);
      setUsers(usersRes.data.users);
      setTotalUsers(usersRes.data.total);
      setTelegramConfig(tgRes.data);
      if (tgRes.data.chat_id) setTgChatId(tgRes.data.chat_id);
    } catch (err) {
      console.error('Admin fetch error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveTelegram = async () => {
    if (!tgBotToken || !tgChatId) return;
    setTgSaving(true);
    setTgMessage('');
    try {
      await api.post('/admin/telegram-config', { bot_token: tgBotToken, chat_id: tgChatId });
      setTgMessage('Telegram berhasil terhubung!');
      setTelegramConfig({ configured: true, chat_id: tgChatId });
      setTgBotToken('');
    } catch (err) {
      setTgMessage(err.response?.data?.detail || 'Gagal menghubungkan Telegram');
    }
    setTgSaving(false);
  };

  const filteredTxs = transactions.filter(t =>
    !txSearch || t.user_email?.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.id?.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.from_currency?.toLowerCase().includes(txSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transaksi', icon: ArrowUpDown },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-1" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors btn-press" data-testid="admin-back-btn">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-white text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Dashboard</h1>
            <p className="text-gray-500 text-xs">Meridiant Management</p>
          </div>
        </div>
        <button onClick={fetchData} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors btn-press" data-testid="admin-refresh-btn">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            data-testid={`admin-tab-${t.id}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === t.id ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && !stats && (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6 page-enter">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Users" value={stats.total_users} icon={Users} />
            <StatCard label="Total Transaksi" value={stats.total_transactions} icon={ArrowUpDown} />
            <StatCard label="24h Transaksi" value={stats.recent_24h_transactions} icon={BarChart3} accent />
            <StatCard label="24h Users Baru" value={stats.recent_24h_users} icon={Users} accent />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Status Transaksi</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Completed</span>
                  <span className="text-emerald-400 font-semibold">{stats.completed_transactions}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-800">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${stats.total_transactions > 0 ? (stats.completed_transactions / stats.total_transactions * 100) : 0}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Pending</span>
                  <span className="text-yellow-400 font-semibold">{stats.pending_transactions}</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Volume by Token</p>
              <div className="space-y-2.5">
                {stats.volume_by_token.length > 0 ? stats.volume_by_token.map((v, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">{v.token}</span>
                    <div className="text-right">
                      <span className="text-gray-300 text-sm">{smartFormat(v.total)}</span>
                      <span className="text-gray-500 text-xs ml-2">({v.count} tx)</span>
                    </div>
                  </div>
                )) : <p className="text-gray-500 text-sm">Belum ada data</p>}
              </div>
            </div>
          </div>

          {/* Telegram Status */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <p className="text-gray-400 text-xs uppercase tracking-wide">Notifikasi Telegram</p>
            </div>
            <p className={`text-sm ${telegramConfig.configured ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {telegramConfig.configured ? `Aktif (Chat ID: ${telegramConfig.chat_id})` : 'Belum dikonfigurasi. Buka tab Settings untuk setup.'}
            </p>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4 page-enter">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Cari email, ID, atau token..."
                className="w-full bg-gray-800/60 border border-gray-700/40 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/40"
                data-testid="admin-tx-search"
              />
            </div>
            <span className="text-gray-500 text-sm whitespace-nowrap">{totalTxs} total</span>
          </div>

          <div className="space-y-2">
            {filteredTxs.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-10">Tidak ada transaksi ditemukan</p>
            ) : filteredTxs.map((tx) => (
              <div key={tx.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3" data-testid={`admin-tx-${tx.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm font-medium">{tx.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'
                    }`}>{tx.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{tx.user_email} - {tx.user_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm">{smartFormat(parseFloat(tx.from_amount))} {tx.from_currency}</p>
                  <p className="text-gray-500 text-xs">{smartFormat(parseFloat(tx.to_amount))} {tx.to_currency}</p>
                </div>
                <div className="text-right flex-shrink-0 hidden md:block">
                  <p className="text-gray-500 text-xs">{new Date(tx.created_at).toLocaleString('id-ID')}</p>
                  {tx.tx_hash && (
                    <a href="#" className="text-emerald-400 text-xs inline-flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Explorer
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4 page-enter">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full bg-gray-800/60 border border-gray-700/40 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/40"
                data-testid="admin-user-search"
              />
            </div>
            <span className="text-gray-500 text-sm whitespace-nowrap">{totalUsers} total</span>
          </div>

          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-10">Tidak ada user ditemukan</p>
            ) : filteredUsers.map((u) => (
              <div key={u.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3" data-testid={`admin-user-${u.id}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{u.name?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{u.name}</p>
                  <p className="text-gray-400 text-xs truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${u.auth_type === 'google' ? 'bg-blue-500/15 text-blue-400' : 'bg-gray-500/15 text-gray-400'}`}>
                    {u.auth_type}
                  </span>
                  <span className="text-gray-500">{u.transaction_count} tx</span>
                  {u.wallet_connected && <span className="text-emerald-400">Wallet</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab - Telegram */}
      {activeTab === 'settings' && (
        <div className="space-y-6 page-enter max-w-lg">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-medium">Notifikasi Telegram</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Hubungkan bot Telegram untuk menerima notifikasi setiap ada transaksi baru.
            </p>

            {telegramConfig.configured && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4">
                <p className="text-emerald-400 text-sm">Telegram terhubung (Chat ID: {telegramConfig.chat_id})</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Bot Token</label>
                <input
                  type="password"
                  value={tgBotToken}
                  onChange={(e) => setTgBotToken(e.target.value)}
                  placeholder="123456789:ABCdef..."
                  className="w-full bg-gray-800/60 border border-gray-700/40 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/40"
                  data-testid="admin-tg-token"
                />
                <p className="text-gray-500 text-xs mt-1">Buat bot via @BotFather di Telegram</p>
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Chat ID</label>
                <input
                  type="text"
                  value={tgChatId}
                  onChange={(e) => setTgChatId(e.target.value)}
                  placeholder="123456789"
                  className="w-full bg-gray-800/60 border border-gray-700/40 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/40"
                  data-testid="admin-tg-chatid"
                />
                <p className="text-gray-500 text-xs mt-1">Dapatkan via @userinfobot</p>
              </div>

              {tgMessage && (
                <p className={`text-sm ${tgMessage.includes('berhasil') ? 'text-emerald-400' : 'text-red-400'}`}>{tgMessage}</p>
              )}

              <button
                onClick={saveTelegram}
                disabled={!tgBotToken || !tgChatId || tgSaving}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-medium text-sm transition-colors btn-press"
                data-testid="admin-tg-save"
              >
                {tgSaving ? 'Menghubungkan...' : 'Hubungkan Telegram'}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <h3 className="text-white font-medium mb-2">Cara Setup Telegram Bot</h3>
            <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
              <li>Buka Telegram, cari <span className="text-emerald-400">@BotFather</span></li>
              <li>Kirim <code className="text-emerald-400 bg-gray-800 px-1.5 py-0.5 rounded">/newbot</code> dan ikuti instruksi</li>
              <li>Salin Bot Token yang diberikan</li>
              <li>Cari <span className="text-emerald-400">@userinfobot</span> untuk mendapatkan Chat ID</li>
              <li>Masukkan keduanya di form di atas</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
