# Meridiant - Crypto Transfer Platform PRD

## Original Problem Statement
Web-based crypto transfer/swap interface for Indonesian market. Features include on-chain transfer (IDR to crypto), off-chain withdraw (crypto to fiat), multi-chain support, wallet integration, and AI chatbot customer service.

## Core Requirements
- Transfer form (IDR to crypto) with multi-chain support
- Withdraw form (crypto to fiat) with bank/e-wallet destinations
- Fee structure: 0.3% trade fee + 0.2% platform fee for transactions > 50k IDR
- TON chain network support (Toncoin + USDT.TON)
- Dark/Light theme toggle
- Auth: Email/Password + Google OAuth, consolidated Login/Sign up dropdown
- Wallet connect (MetaMask, OKX, Phantom, Solflare)
- AI Chatbot (Emergent LLM - GPT-4.1-mini)
- Admin dashboard with stats, transactions, users
- Telegram notifications for transactions
- Mobile responsive design

## Tech Stack
- Frontend: React.js + Tailwind CSS + Shadcn UI
- Backend: FastAPI + MongoDB
- AI: Emergent LLM integration (GPT-4.1-mini)
- Price Data: CoinGecko API with fallback rates

## What's Been Implemented (All DONE)
1. Core transfer/withdraw form with multi-chain token support
2. Fee structure (0.3% trade + 0.2% platform for >50k IDR)
3. TON chain integration (TON + USDT.TON tokens)
4. Dark/Light theme toggle (CSS variables, localStorage persistence)
5. Auth system (email/password + Google OAuth)
6. Consolidated Login/Sign up dropdown button
7. Wallet connect/disconnect with real balance fetching (Alchemy)
8. AI chatbot customer service (Indonesian language)
9. Admin dashboard (stats, transactions, users, telegram config)
10. Mobile responsive optimization (input overflow fix, iOS zoom prevention)
11. Transaction history page
12. Profile management + bank account CRUD
13. FAQ page
14. **"Aset Saya" (My Assets) priority in token selector** (Feb 11, 2026)
    - Tokens with balance > 0 shown in dedicated "ASET SAYA" section at top of token picker
    - Sorted by IDR value (highest first)
    - Shows balance amount + IDR equivalent for each token
    - Full token list also sorted by balance (owned tokens first)
    - Works in both Transfer and Withdraw tabs
    - Falls back to popular token pills when wallet not connected

## Testing Status
- Backend: 25/25 API tests passed (100%)
- Frontend: All features verified (100%)
- Mobile: Responsive design verified
- Status: PRODUCTION READY (Feb 11, 2026)

## Test Credentials
- Test user: test@meridiant.com / Test1234!
- Admin: admin@meridiant.com / Admin1234!

## Key API Endpoints
- POST /api/auth/signup, /api/auth/signin, /api/auth/google
- GET /api/auth/me, /api/prices
- POST /api/transactions, GET /api/transactions
- POST/DELETE /api/wallet/connect, /api/wallet/disconnect
- CRUD /api/bank-accounts
- PUT /api/profile
- POST /api/chat
- GET /api/admin/stats, /api/admin/transactions, /api/admin/users

## Notes
- Google OAuth shows 403 on preview domain (expected, will work on production domain)
- CoinGecko API has fallback prices when rate-limited
- User language: Indonesian
