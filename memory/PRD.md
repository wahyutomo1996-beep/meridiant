# Meridiant - Crypto On-Chain/Off-Chain Platform

## Original Problem Statement
Build a crypto on-chain/off-chain platform named "Meridiant" for Indonesian market. OTC/Centralized model. Features include Transfer (on-chain), Withdraw (off-chain), wallet connectivity, real-time prices, Google OAuth, AI chatbot, admin dashboard, and Telegram notifications.

## Tech Stack
- Frontend: React.js (CRA + craco), ethers.js, @solana/web3.js, Tailwind CSS + Shadcn/UI
- Backend: FastAPI (Python), Motor (MongoDB async), emergentintegrations (LLM)
- Database: MongoDB
- Auth: Google OAuth 2.0 + Email/Password JWT
- RPC: Alchemy (BSC, Polygon, Solana)
- Prices: CoinGecko API with fallback
- AI: OpenAI GPT-4.1-mini via Emergent LLM key
- Deployment: Docker + Nginx + Let's Encrypt SSL

## What's Implemented

### Core Features
- Email/password Sign In & Sign Up with JWT
- Direct Google OAuth via @react-oauth/google
- Real-time CoinGecko price feeds (66+ rate pairs)
- On-chain transactions (BSC, Polygon, Solana, TON)
- Real wallet balances via Alchemy RPC

### Fee Structure (Feb 2026)
- Trade fee: 0.3% on all IDR→crypto transfers
- Platform fee: 0.2% for purchases >= Rp 50,000
- Below Rp 50,000: only trade fee applied
- Backend validates and returns trade_fee, platform_fee, total_fee

### TON Network Support (Feb 2026)
- Native TON (Toncoin) token
- USDT.TON (Tether on TON network)
- TON in popular quick-access pills (ETH, WBTC, USDT, USDC, SOL, TON)
- TON exchange rates (TON_IDR, IDR_TON, USDT.TON_IDR)
- TON network filter in token picker
- TON chain logo from CoinGecko CDN

### Dark/Light Mode (Feb 2026)
- Theme toggle in navbar (Sun/Moon icons)
- CSS variables for both themes in index.css
- data-theme attribute on documentElement
- Persisted in localStorage ('mrd-theme')
- Light mode: clean white/grey backgrounds, hidden space elements
- Smooth transitions between modes

### Auth Button Consolidation (Feb 2026)
- Single "Login / Sign up" button with dropdown
- Dropdown contains: Sign In and Sign Up options
- Mobile: separate buttons in hamburger menu

### AI Chatbot
- Floating widget (positioned above Emergent badge on mobile)
- OpenAI GPT-4.1-mini via Emergent LLM key
- Session continuity, MongoDB storage

### Admin Dashboard
- Protected by admin email check
- Tabs: Overview, Transactions, Users, Settings (Telegram)

### Transfer/Withdraw Flow
- Card-style payment method selector with Indonesian bank/e-wallet logos
- 6 banks, 5 e-wallets, QRIS support
- Fee estimation with trade fee + platform fee breakdown
- Min amount validation (Rp 10,000 IDR)
- Copy-to-clipboard for wallet addresses
- Explorer links for transaction history

### Mobile Optimization (Feb 2026)
- Fixed input overflow with min-w-0, w-0 flex-1, overflow-hidden
- iOS zoom prevention, responsive fonts
- Chatbot repositioned above Emergent badge

## API Endpoints
- POST /api/auth/signup, /signin, GET /api/auth/me, POST /api/auth/google
- GET /api/prices (includes TON rates)
- POST /api/wallet/connect, DELETE /api/wallet/disconnect
- GET /api/wallet/balances/{address}
- POST /api/transactions (with fee calculation), GET /api/transactions
- PUT /api/profile
- POST /api/bank-accounts, GET /api/bank-accounts, DELETE /api/bank-accounts/:id
- POST /api/chat
- GET /api/admin/stats, /admin/transactions, /admin/users
- POST /api/admin/telegram-config, GET /api/admin/telegram-config

## Testing Status
- iteration_7: 100% (22/22 backend, all frontend)
- iteration_8: 100% (13/13 backend, all mobile)
- iteration_9: 100% (11/11 backend, all frontend) - fee, TON, theme, auth verified

## Upcoming Tasks
- P1: Backlog document
- P2: Trust Indicators (blockchain logos, security badges)
- P2: SPL token transfers Solana (USDT, USDC)
- P2: Rate limit & security hardening
- P3: Gamification, Referral System
- P3: Multi-language (ID/EN), KYC
- P4: Educational Content, Advanced Charting
