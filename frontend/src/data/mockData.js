export const fiatCurrencies = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flagColors: ['#FF0000', '#FFFFFF'] },
  { code: 'USD', name: 'US Dollar', symbol: '$', flagColors: ['#3C3B6E', '#FFFFFF'] },
  { code: 'EUR', name: 'Euro', symbol: '€', flagColors: ['#003399', '#FFD700'] },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flagColors: ['#EF3340', '#FFFFFF'] },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flagColors: ['#010066', '#CC0001'] },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flagColors: ['#A51931', '#F4F5F8'] },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flagColors: ['#DA251D', '#FFCD00'] },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flagColors: ['#0038A8', '#CE1126'] },
];

export const cryptoCurrencies = [
  { code: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { code: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { code: 'USDT', name: 'Tether', color: '#26A17B' },
  { code: 'USDC', name: 'USD Coin', color: '#2775CA' },
  { code: 'BNB', name: 'BNB', color: '#F0B90B' },
  { code: 'MATIC', name: 'Polygon', color: '#8247E5' },
  { code: 'SOL', name: 'Solana', color: '#9945FF' },
  { code: 'AVAX', name: 'Avalanche', color: '#E84142' },
];

export const wallets = [
  { id: 'metamask', name: 'MetaMask', color: '#E2761B' },
  { id: 'okx', name: 'OKX Wallet', color: '#000000', textColor: '#FFFFFF' },
  { id: 'phantom', name: 'Phantom', color: '#AB9FF2' },
  { id: 'solflare', name: 'Solflare', color: '#FC7227' },
];

export const transferMethods = [
  { id: 'bank_transfer', name: 'Bank Transfer', desc: 'Direct bank transfer via BCA, BNI, Mandiri' },
  { id: 'virtual_account', name: 'Virtual Account', desc: 'Pay via virtual account' },
  { id: 'ewallet', name: 'E-Wallet', desc: 'GoPay, OVO, Dana, ShopeePay' },
  { id: 'qris', name: 'QRIS', desc: 'Scan QR code to pay' },
];

export const withdrawDestinations = [
  { id: 'bank_bca', name: 'Bank Central Asia (BCA)', type: 'bank' },
  { id: 'bank_bni', name: 'Bank Negara Indonesia (BNI)', type: 'bank' },
  { id: 'bank_mandiri', name: 'Bank Mandiri', type: 'bank' },
  { id: 'bank_bri', name: 'Bank Rakyat Indonesia (BRI)', type: 'bank' },
  { id: 'dana', name: 'DANA', type: 'ewallet' },
  { id: 'gopay', name: 'GoPay', type: 'ewallet' },
  { id: 'ovo', name: 'OVO', type: 'ewallet' },
  { id: 'shopeepay', name: 'ShopeePay', type: 'ewallet' },
];

export const networks = [
  { id: 'ethereum', name: 'Ethereum', color: '#627EEA' },
  { id: 'bsc', name: 'BNB Smart Chain', color: '#F0B90B' },
  { id: 'polygon', name: 'Polygon', color: '#8247E5' },
  { id: 'arbitrum', name: 'Arbitrum', color: '#28A0F0' },
  { id: 'optimism', name: 'Optimism', color: '#FF0420' },
  { id: 'base', name: 'Base', color: '#0052FF' },
  { id: 'solana', name: 'Solana', color: '#9945FF' },
];

export const exchangeRates = {
  IDR_ETH: 0.0000000384,
  IDR_BTC: 0.0000000023,
  IDR_USDT: 0.0000609,
  IDR_USDC: 0.0000609,
  IDR_BNB: 0.00000155,
  IDR_MATIC: 0.00155,
  IDR_SOL: 0.0000043,
  IDR_AVAX: 0.0000229,
  USD_ETH: 0.000385,
  USD_BTC: 0.0000146,
  EUR_ETH: 0.000418,
  ETH_IDR: 26000000,
  BTC_IDR: 435000000,
  USDT_IDR: 16400,
  USDC_IDR: 16400,
  BNB_IDR: 645000,
  SOL_IDR: 232000,
  MATIC_IDR: 645,
  AVAX_IDR: 43700,
  ETH_USD: 2600,
  BTC_USD: 43500,
};
