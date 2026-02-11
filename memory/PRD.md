# Meridiant - Crypto On-Chain/Off-Chain Platform

## Original Problem Statement
Build a crypto on-chain/off-chain platform named "Meridiant" for Indonesian market. Features include Transfer (on-chain crypto-to-crypto) and Withdraw (off-chain crypto-to-fiat) with wallet connectivity, real-time prices, and Google OAuth. Model bisnis: OTC/Centralized (user kirim crypto ke alamat deposit platform).

## Tech Stack
- Frontend: React.js (CRA + craco), ethers.js, @solana/web3.js
- Backend: FastAPI (Python) with httpx for CoinGecko API
- Database: MongoDB (Motor async driver)
- UI: Tailwind CSS + Shadcn/UI
- Auth: Direct Google OAuth 2.0 (@react-oauth/google)
- RPC: Alchemy (BSC, Polygon, Solana)
- Prices: CoinGecko API with fallback
- Deployment: Docker + Nginx + Let's Encrypt SSL

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

### On-Chain Transactions (BSC + Polygon + Solana)
- ERC-20 token transfers on BSC (IDRT, USDT, USDC)
- ERC-20 token transfers on Polygon (IDRT, USDT, USDC)
- Native transfers (BNB, MATIC, SOL)
- Real deposit address: 0xdf32c54583b4d83939b93aa2ca23487d4eb853da

### Real Wallet Balances
- Alchemy RPC integration for BSC and Polygon
- Backend /api/wallet/balances/{address} fetches real on-chain data

### Deployment Files (NEW)
- Docker multi-stage builds (backend + frontend)
- docker-compose.yml (MongoDB + Backend + Frontend + Nginx)
- Nginx reverse proxy with SSL (Let's Encrypt)
- Automated deploy.sh script for VPS
- Production environment template (.env.production.example)
- Complete DEPLOYMENT.md guide

## API Endpoints
- POST /api/auth/signup, POST /api/auth/signin, GET /api/auth/me
- POST /api/auth/google
- GET /api/prices
- POST /api/wallet/connect, DELETE /api/wallet/disconnect
- GET /api/wallet/balances/{address}
- POST /api/transactions, GET /api/transactions
- PUT /api/profile
- POST /api/bank-accounts, GET /api/bank-accounts, DELETE /api/bank-accounts/:id

## Testing Status
- iteration_1.json: 100% passed
- iteration_2.json: 100% passed
- iteration_3.json: 100% passed (25/25 backend, all frontend)

## Upcoming Tasks
- P1: Setup SSL Certificate (HTTPS via Let's Encrypt) - instruksi sudah ada di deploy.sh
- P2: Security Audit for smart contract interactions
- P2: SPL token transfers di Solana (USDT, USDC)
