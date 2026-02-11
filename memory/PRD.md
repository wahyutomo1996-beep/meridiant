# Meridiant - Crypto On-Chain/Off-Chain Platform

## Original Problem Statement
Build a crypto on-chain/off-chain platform named "Meridiant" for Indonesian market. Features include Transfer (on-chain crypto-to-crypto) and Withdraw (off-chain crypto-to-fiat) with wallet connectivity, real-time prices, and Google OAuth.

## Tech Stack
- Frontend: React.js (CRA + craco), ethers.js, @solana/web3.js
- Backend: FastAPI (Python) with httpx for CoinGecko API
- Database: MongoDB (Motor async driver)
- UI: Tailwind CSS + Shadcn/UI
- Auth: Direct Google OAuth 2.0 (@react-oauth/google)
- RPC: Alchemy (BSC, Polygon, Solana)
- Prices: CoinGecko API with fallback

## What's Implemented (Production-Ready)

### Authentication
- Email/password Sign In & Sign Up with JWT tokens
- Direct Google OAuth via @react-oauth/google (user's own Client ID)
- Backend token verification via Google tokeninfo API
- Session restoration on page load
- Test account: test@meridiant.com / Test1234!

### Real-time Price Feeds
- CoinGecko API integration with 66 rate pairs
- 60-second cache with automatic fallback to hardcoded rates
- Supports all tokens: ETH, BTC, USDT, USDC, BNB, SOL, MATIC, AVAX, ARB, OP, LINK, UNI, WBTC, IDRT

### On-Chain Transactions (BSC + Polygon + Solana)
- ERC-20 token transfers on BSC (IDRT, USDT, USDC)
- ERC-20 token transfers on Polygon (IDRT, USDT, USDC)
- Native transfers (BNB, MATIC, SOL)
- Solana SOL transfers via Phantom wallet
- Automatic chain switching in MetaMask
- Real deposit address: 0xdf32c54583b4d83939b93aa2ca23487d4eb853da

### Real Wallet Balances
- Alchemy RPC integration for BSC and Polygon
- Backend /api/wallet/balances/{address} fetches real on-chain data
- Frontend fetches balances when wallet is connected

### Token Support
- IDRT on Ethereum, BSC (0x6620...0d83), Polygon (0x554c...937b)
- USDT on Ethereum, BSC, Arbitrum, Base, Solana, Polygon, Optimism, Avalanche
- USDC on Ethereum, Base, Arbitrum, Solana, BSC, Polygon, Optimism, Avalanche
- ETH, BTC, BNB, SOL, MATIC, AVAX, ARB, OP, LINK, UNI, WBTC

### UI Features
- Smart number formatting (no trailing zeros, thousand separators)
- Token selector with search, network filters, real CoinGecko logos
- Percentage buttons (25%, 50%, 75%, 100%) on Withdraw tab
- Wallet connectivity (MetaMask, OKX, Phantom, Solflare)
- Profile pages (My Profile, Wallet Account, Withdrawal Account, History)
- QRIS payment method
- On-chain checkout with "Sign & Send" flow

## API Endpoints
- POST /api/auth/signup, POST /api/auth/signin, GET /api/auth/me
- POST /api/auth/google (Direct Google token verification)
- GET /api/prices (CoinGecko real-time)
- POST /api/wallet/connect, DELETE /api/wallet/disconnect
- GET /api/wallet/balances/{address} (Real Alchemy RPC)
- POST /api/transactions, GET /api/transactions
- PUT /api/profile
- POST /api/bank-accounts, GET /api/bank-accounts, DELETE /api/bank-accounts/:id

## Key Files
- `/app/backend/server.py` - All backend API endpoints
- `/app/frontend/src/App.js` - Main app with auth and balance fetching
- `/app/frontend/src/components/meridiant/TransferForm.jsx` - Main form
- `/app/frontend/src/components/meridiant/Modals.jsx` - Auth, wallet, checkout modals
- `/app/frontend/src/lib/onchain.js` - Blockchain transaction utilities (Alchemy RPCs)
- `/app/frontend/src/lib/api.js` - API client
- `/app/frontend/src/data/mockData.js` - Token data, fallback rates

## Testing Status
- iteration_1.json: 100% passed
- iteration_2.json: 100% passed
- iteration_3.json: 100% passed (25/25 backend, all frontend)

## Upcoming Tasks
- P0: VPS Deployment guidance (Docker, Nginx, SSL)
- P1: SSL Certificate setup (HTTPS via Let's Encrypt)
- P2: Security Audit for smart contract interactions
