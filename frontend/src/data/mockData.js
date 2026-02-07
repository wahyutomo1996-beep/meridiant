// Fiat currencies - Indonesia market only
export const fiatCurrencies = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flagColors: ['#FF0000', '#FFFFFF'] },
];

// Crypto currencies - include IDRT stablecoin
export const cryptoCurrencies = [
  { code: 'IDRT', name: 'Rupiah Token', color: '#2ECC71' },
  { code: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { code: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { code: 'USDT', name: 'Tether', color: '#26A17B' },
  { code: 'USDC', name: 'USD Coin', color: '#2775CA' },
  { code: 'BNB', name: 'BNB', color: '#F0B90B' },
  { code: 'SOL', name: 'Solana', color: '#9945FF' },
  { code: 'MATIC', name: 'Polygon', color: '#8247E5' },
];

// Wallets with chain support
export const wallets = [
  { id: 'metamask', name: 'MetaMask', color: '#E2761B', bgColor: '#1a1a1a', chains: ['EVM'] },
  { id: 'okx', name: 'OKX Wallet', color: '#FFFFFF', bgColor: '#000000', chains: ['EVM', 'SOL'] },
  { id: 'phantom', name: 'Phantom', color: '#AB9FF2', bgColor: '#1C1136', chains: ['EVM', 'SOL'] },
  { id: 'solflare', name: 'Solflare', color: '#FC7227', bgColor: '#1A0F00', chains: ['SOL'] },
];

// Transfer methods - grouped
export const transferMethodGroups = [
  {
    category: 'Bank Transfer',
    items: [
      { id: 'bca', name: 'BCA', desc: 'Bank Central Asia' },
      { id: 'bni', name: 'BNI', desc: 'Bank Negara Indonesia' },
      { id: 'mandiri', name: 'Mandiri', desc: 'Bank Mandiri' },
      { id: 'bri', name: 'BRI', desc: 'Bank Rakyat Indonesia' },
      { id: 'cimb', name: 'CIMB Niaga', desc: 'CIMB Niaga' },
    ]
  },
  {
    category: 'E-Wallet',
    items: [
      { id: 'gopay', name: 'GoPay', desc: 'Gojek Payment' },
      { id: 'ovo', name: 'OVO', desc: 'OVO E-Wallet' },
      { id: 'dana', name: 'DANA', desc: 'DANA E-Wallet' },
      { id: 'shopeepay', name: 'ShopeePay', desc: 'Shopee Payment' },
      { id: 'linkaja', name: 'LinkAja', desc: 'LinkAja Payment' },
    ]
  },
  {
    category: 'QRIS',
    items: [
      { id: 'qris', name: 'QRIS', desc: 'Scan QR code to pay at any merchant' },
    ]
  },
];

// Withdraw destinations - grouped
export const withdrawDestGroups = [
  {
    category: 'Bank',
    items: [
      { id: 'bank_bca', name: 'Bank Central Asia (BCA)' },
      { id: 'bank_bni', name: 'Bank Negara Indonesia (BNI)' },
      { id: 'bank_mandiri', name: 'Bank Mandiri' },
      { id: 'bank_bri', name: 'Bank Rakyat Indonesia (BRI)' },
      { id: 'bank_cimb', name: 'CIMB Niaga' },
      { id: 'bank_permata', name: 'Bank Permata' },
    ]
  },
  {
    category: 'E-Wallet',
    items: [
      { id: 'gopay', name: 'GoPay' },
      { id: 'ovo', name: 'OVO' },
      { id: 'dana', name: 'DANA' },
      { id: 'shopeepay', name: 'ShopeePay' },
      { id: 'linkaja', name: 'LinkAja' },
    ]
  },
  {
    category: 'QRIS',
    items: [
      { id: 'qris_withdraw', name: 'QRIS Withdrawal' },
    ]
  },
];

// Exchange rates (IDR market)
export const exchangeRates = {
  IDR_IDRT: 1,
  IDR_ETH: 0.0000000384,
  IDR_BTC: 0.0000000023,
  IDR_USDT: 0.0000609,
  IDR_USDC: 0.0000609,
  IDR_BNB: 0.00000155,
  IDR_MATIC: 0.00155,
  IDR_SOL: 0.0000043,
  IDRT_IDR: 1,
  ETH_IDR: 26000000,
  BTC_IDR: 435000000,
  USDT_IDR: 16400,
  USDC_IDR: 16400,
  BNB_IDR: 645000,
  SOL_IDR: 232000,
  MATIC_IDR: 645,
};
