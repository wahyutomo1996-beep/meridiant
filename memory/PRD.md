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
- Real-time CoinGecko price feeds (66 rate pairs)
- On-chain transactions (BSC, Polygon, Solana)
- Real wallet balances via Alchemy RPC
- Smart number formatting (thousand separators, no trailing zeros)

### AI Chatbot (NEW)
- Floating widget at bottom-right corner
- OpenAI GPT-4.1-mini via Emergent LLM key
- System prompt in Indonesian about Meridiant platform
- Chat history stored in MongoDB (chat_sessions collection)
- Session continuity across messages

### Admin Dashboard (NEW)
- Protected by admin email check (admin@meridiant.com)
- Overview tab: Stats cards, transaction status, volume by token
- Transactions tab: Searchable list with user info, status, explorer links
- Users tab: Searchable list with auth type, wallet status, tx count
- Settings tab: Telegram bot configuration

### Telegram Notifications (NEW)
- Config form in admin Settings tab
- Bot token + Chat ID setup with connection test
- Auto-sends notification on every new transaction
- HTML formatted messages with transaction details

### UI/UX
- Hero section: "Transfer Crypto Instan & Aman" (chain pills removed)
- Mobile-first responsive with hamburger menu
- Micro-animations (fade-up, scale-in, glass cards)
- FAQ page (8 items in Indonesian)

### Deployment Files
- Docker multi-stage builds, docker-compose.yml, Nginx SSL, deploy.sh

## API Endpoints
- POST /api/auth/signup, POST /api/auth/signin, GET /api/auth/me
- POST /api/auth/google
- GET /api/prices
- POST /api/wallet/connect, DELETE /api/wallet/disconnect
- GET /api/wallet/balances/{address}
- POST /api/transactions, GET /api/transactions
- PUT /api/profile
- POST /api/bank-accounts, GET /api/bank-accounts, DELETE /api/bank-accounts/:id
- POST /api/chat (AI chatbot)
- GET /api/admin/stats, GET /api/admin/transactions, GET /api/admin/users
- POST /api/admin/telegram-config, GET /api/admin/telegram-config

## Credentials
- Admin: admin@meridiant.com / Admin1234!
- Test user: test@meridiant.com / Test1234!

## Testing Status
- iteration_1-4: 100% passed (previous features)
- iteration_5: 100% passed (16/16 backend, all frontend - chatbot, admin, telegram)

## Upcoming Tasks
- P0: Deploy ke VPS
- P2: SPL token transfers Solana (USDT, USDC)
- P2: Rate limit & security hardening
- P3: Multi-language (ID/EN), Referral system, KYC
