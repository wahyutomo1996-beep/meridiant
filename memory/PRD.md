# Meridiant - Crypto On-Chain/Off-Chain Platform

## Original Problem Statement
Build a crypto on-chain/off-chain platform named "Meridiant" for Indonesian market. Features include Transfer (on-chain crypto-to-crypto) and Withdraw (off-chain crypto-to-fiat) with wallet connectivity, real-time prices, and Google OAuth.

## Tech Stack
- Frontend: React.js (CRA + craco), ethers.js, @solana/web3.js
- Backend: FastAPI (Python) with httpx for CoinGecko API
- Database: MongoDB (Motor async driver)
- UI: Tailwind CSS + Shadcn/UI

## What's Implemented

### Authentication
- Email/password Sign In & Sign Up with JWT tokens
- Google OAuth via Emergent Auth (real, not mocked)
- Session restoration on page load
- Test account: test@meridiant.com / Test1234!

### Real-time Price Feeds
- CoinGecko API integration with 60+ rate pairs
- 60-second cache with automatic fallback to hardcoded rates
- Supports all tokens: ETH, BTC, USDT, USDC, BNB, SOL, MATIC, AVAX, ARB, OP, LINK, UNI, WBTC
- Chain-specific rates (ETH.Base, USDT.BSC, USDC.Poly, etc.)

### On-Chain Transactions (BSC + Solana)
- ERC-20 token transfers on BSC (IDRT, USDT, USDC)
- ERC-20 token transfers on Polygon (IDRT, USDT, USDC)
- Native transfers (BNB, MATIC, SOL)
- Solana SOL transfers via Phantom wallet
- Automatic chain switching in MetaMask
- Transaction hash recording in database
- Block explorer links

### Token Support
- IDRT on Ethereum, BSC (0x6620...0d83), Polygon (0x554c...937b)
- USDT on Ethereum, BSC, Arbitrum, Base, Solana, Polygon, Optimism, Avalanche
- USDC on Ethereum, Base, Arbitrum, Solana, BSC, Polygon, Optimism, Avalanche
- ETH on Ethereum, Base, Arbitrum, Optimism
- BTC, WBTC, BNB, SOL, MATIC, AVAX, ARB, OP, LINK, UNI

### UI Features
- Smart number formatting (no trailing zeros, thousand separators)
- Token selector with search, network filters, real CoinGecko logos
- Percentage buttons (25%, 50%, 75%, 100%) on Withdraw tab
- Wallet connectivity (MetaMask, OKX, Phantom, Solflare)
- Profile pages (My Profile, Wallet Account, Withdrawal Account, History)
- QRIS payment method
- On-chain checkout with "Sign & Send" flow

## What's Mocked
- Wallet balances in withdraw tab (hardcoded in mockData.js)

## API Endpoints
- POST /api/auth/signup, POST /api/auth/signin, GET /api/auth/me
- POST /api/auth/google-session (Emergent Auth)
- GET /api/prices (CoinGecko real-time)
- POST /api/wallet/connect, DELETE /api/wallet/disconnect
- POST /api/transactions, GET /api/transactions
- PUT /api/profile
- POST /api/bank-accounts, GET /api/bank-accounts, DELETE /api/bank-accounts/:id

## Key Files
- `/app/backend/server.py` - All backend API endpoints
- `/app/frontend/src/components/meridiant/TransferForm.jsx` - Main form
- `/app/frontend/src/components/meridiant/Modals.jsx` - Auth, wallet, checkout modals
- `/app/frontend/src/lib/onchain.js` - Blockchain transaction utilities
- `/app/frontend/src/lib/api.js` - API client
- `/app/frontend/src/data/mockData.js` - Token data, mock balances
- `/app/frontend/src/App.js` - Main app with auth callback

## Future Tasks
- P2: Fetch real wallet balances from blockchain (replace mocked balances)
- P2: SPL token transfers on Solana (USDT, USDC)
- P3: State management optimization
- P3: Transaction history with explorer links
