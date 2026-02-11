// QRIS payment image
export const QRIS_IMAGE = 'https://customer-assets.emergentagent.com/job_chain-connect-6/artifacts/758bur2g_qris.png';

// Mock wallet balances (for percentage withdraw feature)
export const mockBalances = {
  'IDRT': 5000000,
  'IDRT.BSC': 2500000,
  'IDRT.Poly': 1800000,
  'ETH': 0.45,
  'ETH.Base': 0.12,
  'ETH.Arb': 0.08,
  'ETH.OP': 0.05,
  'BTC': 0.0025,
  'WBTC': 0.001,
  'USDT': 1250,
  'USDT.BSC': 800,
  'USDT.Arb': 350,
  'USDT.Base': 500,
  'USDT.Sol': 620,
  'USDT.Poly': 430,
  'USDT.OP': 290,
  'USDT.Avax': 180,
  'USDC': 980,
  'USDC.Base': 420,
  'USDC.Arb': 275,
  'USDC.Sol': 310,
  'USDC.BSC': 550,
  'USDC.Poly': 360,
  'USDC.OP': 210,
  'USDC.Avax': 145,
  'BNB': 0.85,
  'SOL': 3.2,
  'MATIC': 450,
  'AVAX': 2.5,
  'ARB': 120,
  'OP': 85,
  'LINK': 15,
  'UNI': 22,
};

// Fiat currencies - Indonesia market only
export const fiatCurrencies = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flagColors: ['#FF0000', '#FFFFFF'] },
];

// Crypto currencies with real logos from CoinGecko CDN
export const cryptoCurrencies = [
  { code: 'IDRT', name: 'Rupiah Token', color: '#C0392B', chain: 'Ethereum',
    logo: 'https://customer-assets.emergentagent.com/job_chain-connect-6/artifacts/6inghw1d_rupiahtoken.png' },
  { code: 'IDRT', name: 'Rupiah Token (BSC)', color: '#C0392B', chain: 'BSC', displayCode: 'IDRT.BSC',
    logo: 'https://customer-assets.emergentagent.com/job_chain-connect-6/artifacts/6inghw1d_rupiahtoken.png',
    contract: '0x66207e39bb77e6b99aab56795c7c340c08520d83' },
  { code: 'IDRT', name: 'Rupiah Token (Polygon)', color: '#C0392B', chain: 'Polygon', displayCode: 'IDRT.Poly',
    logo: 'https://customer-assets.emergentagent.com/job_chain-connect-6/artifacts/6inghw1d_rupiahtoken.png',
    contract: '0x554cd6bdD03214b10AafA3e0D4D42De0C5D2937b' },
  { code: 'ETH', name: 'Ethereum', color: '#627EEA', chain: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { code: 'ETH', name: 'Ethereum (Base)', color: '#0052FF', chain: 'Base', displayCode: 'ETH.Base',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { code: 'ETH', name: 'Ethereum (Arbitrum)', color: '#28A0F0', chain: 'Arbitrum', displayCode: 'ETH.Arb',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { code: 'ETH', name: 'Ethereum (Optimism)', color: '#FF0420', chain: 'Optimism', displayCode: 'ETH.OP',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { code: 'BTC', name: 'Bitcoin', color: '#F7931A', chain: 'Bitcoin',
    logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
  { code: 'WBTC', name: 'Wrapped BTC', color: '#F09242', chain: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png' },
  { code: 'USDT', name: 'Tether', color: '#26A17B', chain: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { code: 'USDT', name: 'Tether (BSC)', color: '#26A17B', chain: 'BSC', displayCode: 'USDT.BSC',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { code: 'USDT', name: 'Tether (Arbitrum)', color: '#26A17B', chain: 'Arbitrum', displayCode: 'USDT.Arb',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { code: 'USDT', name: 'Tether (Base)', color: '#26A17B', chain: 'Base', displayCode: 'USDT.Base',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { code: 'USDT', name: 'Tether (Solana)', color: '#26A17B', chain: 'Solana', displayCode: 'USDT.Sol',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { code: 'USDT', name: 'Tether (Polygon)', color: '#26A17B', chain: 'Polygon', displayCode: 'USDT.Poly',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { code: 'USDT', name: 'Tether (Optimism)', color: '#26A17B', chain: 'Optimism', displayCode: 'USDT.OP',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { code: 'USDT', name: 'Tether (Avalanche)', color: '#26A17B', chain: 'Avalanche', displayCode: 'USDT.Avax',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { code: 'USDC', name: 'USD Coin', color: '#2775CA', chain: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { code: 'USDC', name: 'USD Coin (Base)', color: '#2775CA', chain: 'Base', displayCode: 'USDC.Base',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { code: 'USDC', name: 'USD Coin (Arbitrum)', color: '#2775CA', chain: 'Arbitrum', displayCode: 'USDC.Arb',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { code: 'USDC', name: 'USD Coin (Solana)', color: '#2775CA', chain: 'Solana', displayCode: 'USDC.Sol',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { code: 'USDC', name: 'USD Coin (BSC)', color: '#2775CA', chain: 'BSC', displayCode: 'USDC.BSC',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { code: 'USDC', name: 'USD Coin (Polygon)', color: '#2775CA', chain: 'Polygon', displayCode: 'USDC.Poly',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { code: 'USDC', name: 'USD Coin (Optimism)', color: '#2775CA', chain: 'Optimism', displayCode: 'USDC.OP',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { code: 'USDC', name: 'USD Coin (Avalanche)', color: '#2775CA', chain: 'Avalanche', displayCode: 'USDC.Avax',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { code: 'BNB', name: 'BNB', color: '#F0B90B', chain: 'BSC',
    logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  { code: 'SOL', name: 'Solana', color: '#9945FF', chain: 'Solana',
    logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  { code: 'MATIC', name: 'Polygon', color: '#8247E5', chain: 'Polygon',
    logo: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png' },
  { code: 'AVAX', name: 'Avalanche', color: '#E84142', chain: 'Avalanche',
    logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
  { code: 'ARB', name: 'Arbitrum', color: '#28A0F0', chain: 'Arbitrum',
    logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg' },
  { code: 'OP', name: 'Optimism', color: '#FF0420', chain: 'Optimism',
    logo: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png' },
  { code: 'LINK', name: 'Chainlink', color: '#2A5ADA', chain: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
  { code: 'UNI', name: 'Uniswap', color: '#FF007A', chain: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-logo.png' },
];

// Chain logos
export const chainLogos = {
  'Ethereum': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  'Base': 'https://assets.coingecko.com/asset_platforms/images/131/small/base.jpeg',
  'Arbitrum': 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
  'Optimism': 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
  'BSC': 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  'Solana': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  'Polygon': 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
  'Avalanche': 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  'Bitcoin': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  'TON': 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png',
};

// Wallets with chain support
export const wallets = [
  { id: 'metamask', name: 'MetaMask', color: '#E2761B', bgColor: '#1a1a1a', chains: ['EVM'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg' },
  { id: 'okx', name: 'OKX Wallet', color: '#FFFFFF', bgColor: '#000000', chains: ['EVM', 'SOL'],
    logo: 'https://static.okx.com/cdn/assets/imgs/247/58E63B32A170B219.png' },
  { id: 'phantom', name: 'Phantom', color: '#AB9FF2', bgColor: '#1C1136', chains: ['EVM', 'SOL'],
    logo: 'https://assets.coingecko.com/markets/images/1472/small/phantom.png' },
  { id: 'solflare', name: 'Solflare', color: '#FC7227', bgColor: '#1A0F00', chains: ['SOL'],
    logo: 'https://assets.coingecko.com/markets/images/1370/small/solflare.png' },
];

// Transfer methods - grouped
// Payment method logos
export const paymentLogos = {
  bca: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/f06e2fdcbb995c3a8babd0758b107c68f08b15862784f4e0ba408972f66f0a8f.png',
  bni: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/ad27892fbf34cd1e3ac3645a7260e7d688a590f32c07c41d7e24a62776beb4f4.png',
  mandiri: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/87bf2f707c9f7553d7d172bf0a98af12950923c2e5b1ed4ce86527a524bf01a2.png',
  bri: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/1d2e71ec23a9319ac5e6c6698ec9c30caaa83ef510e40c62b1ac59067350b1d9.png',
  cimb: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/2838bdf722a6a7658845351831f9f7aa0dd4d3ce3f89778b491830bf21ce6092.png',
  permata: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/688270b9bf09ca12154736ea98d4333454bb51e9dd9e064a742bd1c798af3905.png',
  gopay: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/c2c190c7dbdc635df2ef7414ffabec0428dc0ddad5ac24d5f491c1d060a9daa2.png',
  ovo: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/c33fdfdba004aff5edd6c5534c330945e78b46c34d6bd6e62f73e9bd17c6c216.png',
  dana: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/ab59e80d4dff726d9510e9f5b1ad5958ce6c5b294c12714417bd2c57a6b6fc11.png',
  shopeepay: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/29f37bbc9d418453d0e4255cfd67b022c0de94da4cf27797b0f8dc6dd1e48a50.png',
  linkaja: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/9af7c3a814b1b005869a60489ff6ca462ffe691caff7bdef75a033594bed70c2.png',
  qris: 'https://static.prod-images.emergentagent.com/jobs/864659c7-a889-4d04-9f7b-12f745ce403e/images/3aa3a5fe80bcc4be0ea8a2ca25f6f47bb58ffa8a58b24192288cf79c7e84af7c.png',
};

// Minimum purchase amount in IDR
export const MIN_AMOUNT_IDR = 10000;

// Fee structure
export const TRADE_FEE_RATE = 0.003; // 0.3%
export const PLATFORM_FEE_RATE = 0.002; // 0.2%
export const PLATFORM_FEE_THRESHOLD = 50000; // Rp 50,000

export const transferMethodGroups = [
  {
    category: 'Bank Transfer',
    items: [
      { id: 'bca', name: 'BCA', desc: 'Bank Central Asia', logo: paymentLogos.bca, color: '#003399', fee: 0, eta: 'Instan' },
      { id: 'bni', name: 'BNI', desc: 'Bank Negara Indonesia', logo: paymentLogos.bni, color: '#EC6117', fee: 0, eta: 'Instan' },
      { id: 'mandiri', name: 'Mandiri', desc: 'Bank Mandiri', logo: paymentLogos.mandiri, color: '#003366', fee: 0, eta: 'Instan' },
      { id: 'bri', name: 'BRI', desc: 'Bank Rakyat Indonesia', logo: paymentLogos.bri, color: '#00529C', fee: 0, eta: 'Instan' },
      { id: 'cimb', name: 'CIMB Niaga', desc: 'CIMB Niaga', logo: paymentLogos.cimb, color: '#EC1C24', fee: 0, eta: '1-5 menit' },
      { id: 'permata', name: 'Permata', desc: 'Bank Permata', logo: paymentLogos.permata, color: '#006B3F', fee: 0, eta: '1-5 menit' },
    ]
  },
  {
    category: 'E-Wallet',
    items: [
      { id: 'gopay', name: 'GoPay', desc: 'Gojek Payment', logo: paymentLogos.gopay, color: '#00AA13', fee: 0, eta: 'Instan' },
      { id: 'ovo', name: 'OVO', desc: 'OVO E-Wallet', logo: paymentLogos.ovo, color: '#4C3494', fee: 0, eta: 'Instan' },
      { id: 'dana', name: 'DANA', desc: 'DANA E-Wallet', logo: paymentLogos.dana, color: '#108EE9', fee: 0, eta: 'Instan' },
      { id: 'shopeepay', name: 'ShopeePay', desc: 'Shopee Payment', logo: paymentLogos.shopeepay, color: '#EE4D2D', fee: 0, eta: 'Instan' },
      { id: 'linkaja', name: 'LinkAja', desc: 'LinkAja Payment', logo: paymentLogos.linkaja, color: '#E31937', fee: 0, eta: 'Instan' },
    ]
  },
  {
    category: 'QRIS',
    items: [
      { id: 'qris', name: 'QRIS', desc: 'Scan QR untuk bayar', logo: paymentLogos.qris, color: '#000000', fee: 0, eta: 'Instan' },
    ]
  },
];

// Withdraw destinations - grouped
export const withdrawDestGroups = [
  {
    category: 'Bank',
    items: [
      { id: 'bank_bca', name: 'BCA', desc: 'Bank Central Asia', logo: paymentLogos.bca, color: '#003399', fee: 2500, eta: '1-10 menit' },
      { id: 'bank_bni', name: 'BNI', desc: 'Bank Negara Indonesia', logo: paymentLogos.bni, color: '#EC6117', fee: 2500, eta: '1-10 menit' },
      { id: 'bank_mandiri', name: 'Mandiri', desc: 'Bank Mandiri', logo: paymentLogos.mandiri, color: '#003366', fee: 2500, eta: '1-10 menit' },
      { id: 'bank_bri', name: 'BRI', desc: 'Bank Rakyat Indonesia', logo: paymentLogos.bri, color: '#00529C', fee: 2500, eta: '1-10 menit' },
      { id: 'bank_cimb', name: 'CIMB Niaga', desc: 'CIMB Niaga', logo: paymentLogos.cimb, color: '#EC1C24', fee: 2500, eta: '5-30 menit' },
      { id: 'bank_permata', name: 'Permata', desc: 'Bank Permata', logo: paymentLogos.permata, color: '#006B3F', fee: 2500, eta: '5-30 menit' },
    ]
  },
  {
    category: 'E-Wallet',
    items: [
      { id: 'gopay', name: 'GoPay', desc: 'Gojek Payment', logo: paymentLogos.gopay, color: '#00AA13', fee: 1000, eta: 'Instan' },
      { id: 'ovo', name: 'OVO', desc: 'OVO E-Wallet', logo: paymentLogos.ovo, color: '#4C3494', fee: 1000, eta: 'Instan' },
      { id: 'dana', name: 'DANA', desc: 'DANA E-Wallet', logo: paymentLogos.dana, color: '#108EE9', fee: 1000, eta: 'Instan' },
      { id: 'shopeepay', name: 'ShopeePay', desc: 'Shopee Payment', logo: paymentLogos.shopeepay, color: '#EE4D2D', fee: 1000, eta: 'Instan' },
      { id: 'linkaja', name: 'LinkAja', desc: 'LinkAja Payment', logo: paymentLogos.linkaja, color: '#E31937', fee: 1000, eta: 'Instan' },
    ]
  },
  {
    category: 'QRIS',
    items: [
      { id: 'qris_withdraw', name: 'QRIS', desc: 'QRIS Withdrawal', logo: paymentLogos.qris, color: '#000000', fee: 0, eta: 'Instan' },
    ]
  },
];

// Exchange rates (IDR market)
export const exchangeRates = {
  IDR_IDRT: 1,
  'IDR_IDRT.BSC': 1,
  'IDR_IDRT.Poly': 1,
  IDR_ETH: 0.0000000384,
  'IDR_ETH.Base': 0.0000000384,
  'IDR_ETH.Arb': 0.0000000384,
  'IDR_ETH.OP': 0.0000000384,
  IDR_BTC: 0.0000000023,
  IDR_WBTC: 0.0000000023,
  IDR_USDT: 0.0000609,
  'IDR_USDT.BSC': 0.0000609,
  'IDR_USDT.Arb': 0.0000609,
  'IDR_USDT.Base': 0.0000609,
  'IDR_USDT.Sol': 0.0000609,
  'IDR_USDT.Poly': 0.0000609,
  'IDR_USDT.OP': 0.0000609,
  'IDR_USDT.Avax': 0.0000609,
  IDR_USDC: 0.0000609,
  'IDR_USDC.Base': 0.0000609,
  'IDR_USDC.Arb': 0.0000609,
  'IDR_USDC.Sol': 0.0000609,
  'IDR_USDC.BSC': 0.0000609,
  'IDR_USDC.Poly': 0.0000609,
  'IDR_USDC.OP': 0.0000609,
  'IDR_USDC.Avax': 0.0000609,
  IDR_BNB: 0.00000155,
  IDR_MATIC: 0.00155,
  IDR_SOL: 0.0000043,
  IDR_AVAX: 0.0000229,
  IDR_ARB: 0.000055,
  IDR_OP: 0.000039,
  IDR_LINK: 0.0000435,
  IDR_UNI: 0.0000625,
  IDRT_IDR: 1,
  'IDRT.BSC_IDR': 1,
  'IDRT.Poly_IDR': 1,
  ETH_IDR: 26000000,
  'ETH.Base_IDR': 26000000,
  'ETH.Arb_IDR': 26000000,
  'ETH.OP_IDR': 26000000,
  BTC_IDR: 435000000,
  WBTC_IDR: 435000000,
  USDT_IDR: 16400,
  'USDT.BSC_IDR': 16400,
  'USDT.Arb_IDR': 16400,
  'USDT.Base_IDR': 16400,
  'USDT.Sol_IDR': 16400,
  'USDT.Poly_IDR': 16400,
  'USDT.OP_IDR': 16400,
  'USDT.Avax_IDR': 16400,
  USDC_IDR: 16400,
  'USDC.Base_IDR': 16400,
  'USDC.Arb_IDR': 16400,
  'USDC.Sol_IDR': 16400,
  'USDC.BSC_IDR': 16400,
  'USDC.Poly_IDR': 16400,
  'USDC.OP_IDR': 16400,
  'USDC.Avax_IDR': 16400,
  BNB_IDR: 9700000,
  SOL_IDR: 2400000,
  MATIC_IDR: 6500,
  AVAX_IDR: 437000,
  ARB_IDR: 18200,
  OP_IDR: 25600,
  LINK_IDR: 230000,
  UNI_IDR: 160000,
};
