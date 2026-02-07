# Meridiant API Contracts

## a) API Contracts

### Auth
- `POST /api/auth/signup` → `{ name, email, password }` → `{ token, user: { id, name, email } }`
- `POST /api/auth/signin` → `{ email, password }` → `{ token, user: { id, name, email } }`
- `GET /api/auth/me` → (JWT header) → `{ user: { id, name, email, wallet_connected, wallet_address, wallet_name } }`

### Wallet
- `POST /api/wallet/connect` → `{ wallet_id, wallet_name }` → `{ wallet_address, wallet_name, connected: true }`
- `DELETE /api/wallet/disconnect` → `{ disconnected: true }`

### Transactions
- `POST /api/transactions` → `{ type, from_currency, from_amount, to_currency, to_amount, method_or_dest }` → `{ transaction_id, status, ... }`
- `GET /api/transactions` → `{ transactions: [...] }`

### Exchange Rates
- `GET /api/exchange-rates` → `{ rates: { IDR_IDRT: 1, IDR_ETH: ... } }`

## b) Mocked Data to Replace
- `mockData.js` exchange rates → `/api/exchange-rates`
- Sign in/up mock logic → `/api/auth/signin`, `/api/auth/signup`
- Wallet connect mock → `/api/wallet/connect`
- Transaction submit mock → `/api/transactions`

## c) Backend Implementation
- MongoDB models: User (with hashed password, wallet info), Transaction
- JWT auth middleware
- Password hashing with passlib
- Exchange rates served from DB (seeded)

## d) Frontend-Backend Integration
- Create `api.js` utility with axios + JWT interceptor
- Replace mock auth in App.js with API calls
- Replace mock wallet connect with API calls
- Replace mock transactions with API calls
- Store JWT in localStorage, auto-attach to requests
