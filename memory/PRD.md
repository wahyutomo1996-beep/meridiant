# Meridiant - Crypto On-Chain/Off-Chain Platform

## Original Problem Statement
Build a crypto on-chain/off-chain platform named "Meridiant" for Indonesian market. Features include Transfer (on-chain crypto-to-crypto) and Withdraw (off-chain crypto-to-fiat) with wallet connectivity, real-time prices, and Google OAuth. Model bisnis: OTC/Centralized.

## Tech Stack
- Frontend: React.js (CRA + craco), ethers.js, @solana/web3.js, Space Grotesk font
- Backend: FastAPI (Python) with httpx for CoinGecko API
- Database: MongoDB (Motor async driver)
- UI: Tailwind CSS + Shadcn/UI
- Auth: Direct Google OAuth 2.0 (@react-oauth/google)
- RPC: Alchemy (BSC, Polygon, Solana)
- Prices: CoinGecko API with fallback
- Deployment: Docker + Nginx + Let's Encrypt SSL

## What's Implemented

### Core Features
- Email/password Sign In & Sign Up with JWT tokens
- Direct Google OAuth via @react-oauth/google
- Real-time CoinGecko price feeds (66 rate pairs)
- On-chain transactions (BSC, Polygon, Solana)
- Real wallet balances via Alchemy RPC
- Real deposit address: 0xdf32c54583b4d83939b93aa2ca23487d4eb853da

### UI/UX (Optimized)
- Hero section: "Transfer Crypto Instan & Aman" with gradient text
- Supported chain pills (BNB Chain, Polygon, Solana, Ethereum, Avalanche)
- Feature badges (Instan, Aman, Multi-Chain)
- Mobile-first responsive design with hamburger menu
- Micro-animations (fade-up, scale-in, glass cards, button press)
- FAQ page in Indonesian (8 items, expandable)
- Smart number formatting (thousand separators, no trailing zeros)
- Token selector fullscreen on mobile
- Profile pages with responsive layout

### Deployment Files
- Docker multi-stage builds (backend + frontend)
- docker-compose.yml (MongoDB + Backend + Frontend + Nginx)
- Nginx reverse proxy with SSL (Let's Encrypt)
- Automated deploy.sh script for VPS
- DEPLOYMENT.md guide

## Testing Status
- iteration_1.json: 100% passed
- iteration_2.json: 100% passed  
- iteration_3.json: 100% passed (25/25 backend, all frontend)
- iteration_4.json: 100% passed (19/19 UI/UX + 3/3 backend)

## Upcoming Tasks
- P0: Deploy ke VPS (menunggu user)
- P1: Admin Dashboard (monitor transaksi OTC)
- P1: Notifikasi transaksi (Email/Telegram)
- P2: SPL token transfers Solana (USDT, USDC)
- P2: Rate limit & security hardening
- P3: Multi-language (ID/EN toggle)
- P3: Referral system, KYC integration
