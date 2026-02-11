# Meridiant - Crypto On-Chain/Off-Chain Platform

## Original Problem Statement
Build a crypto on-chain/off-chain platform named "Meridiant" for Indonesian market. Features include Transfer (on-chain crypto-to-crypto) and Withdraw (off-chain crypto-to-fiat) with wallet connectivity and user profiles.

## Tech Stack
- Frontend: React.js (CRA + craco)
- Backend: Node.js/Express → FastAPI (Python)
- Database: MongoDB
- UI: Tailwind CSS + Shadcn/UI

## Core Requirements
- Authentication (Sign Up/Sign In with email/password, mocked Google Sign-In)
- Dual-tab form: Transfer (On-Chain) / Withdraw (Off-Chain)
- Token selector modal with search, network filters, real logos
- Wallet connectivity (MetaMask, OKX, Phantom, Solflare)
- User profile pages (My Profile, Wallet Account, Withdrawal Account, History)
- Payment methods: Bank Transfer, E-Wallet, QRIS

## What's Implemented (Complete)
- Full authentication flow (Sign In, Sign Up, Sign Out)
- Transfer/Withdraw form with clean number formatting
- Advanced token selector with network filters and real CoinGecko logos
- IDRT on Ethereum, BSC (contract: 0x66207e39bb77e6b99aab56795c7c340c08520d83), Polygon (contract: 0x554cd6bdD03214b10AafA3e0D4D42De0C5D2937b)
- USDT on Ethereum, BSC, Arbitrum, Base, Solana, Polygon, Optimism, Avalanche
- USDC on Ethereum, Base, Arbitrum, Solana, BSC, Polygon, Optimism, Avalanche
- ETH on Ethereum, Base, Arbitrum, Optimism
- Smart number formatting (no trailing zeros, thousand separators)
- Percentage buttons (25%, 50%, 75%, 100%) on Withdraw tab
- Real wallet detection (MetaMask, OKX, Phantom, Solflare)
- Profile pages (My Profile, Wallet Account, Withdrawal Account, History Transactions)
- QRIS payment method
- Estimate text with correct currency labels

## What's Mocked
- Google Sign-In (mock only)
- All exchange rates (hardcoded in mockData.js)
- Wallet balances (hardcoded in mockData.js)
- Transaction execution (no real blockchain interaction)

## Pending/Upcoming Tasks
- P1: Implement Real Google OAuth Sign-In (needs API keys)
- P2: Real-time price feeds from CoinGecko API
- P2: Real transaction processing (blockchain integration)
- P3: State management optimization (App.js refactoring)

## Test Credentials
- Email: test@meridiant.com
- Password: Test1234!

## Key Files
- `/app/frontend/src/components/meridiant/TransferForm.jsx` - Main form
- `/app/frontend/src/data/mockData.js` - Currency data, rates, balances
- `/app/frontend/src/App.js` - Main app component
- `/app/backend/server.py` - Backend API
