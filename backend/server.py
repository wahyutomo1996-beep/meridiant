from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
import time
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'meridiant_db')]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET', 'meridiant-secret-key-2025-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Google OAuth Config
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
ALCHEMY_API_KEY = os.environ.get('ALCHEMY_API_KEY')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@meridiant.com')
MIN_AMOUNT_IDR = 10000
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserSignUp(BaseModel):
    name: str
    email: str
    password: str

class UserSignIn(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    wallet_connected: bool = False
    wallet_address: Optional[str] = None
    wallet_name: Optional[str] = None
    picture: Optional[str] = None
    auth_type: Optional[str] = "email"

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class WalletConnectRequest(BaseModel):
    wallet_id: str
    wallet_name: str
    wallet_address: Optional[str] = None

class TransactionCreate(BaseModel):
    type: str
    from_currency: str
    from_amount: str
    to_currency: str
    to_amount: str
    method_or_dest: Optional[str] = None
    tx_hash: Optional[str] = None
    chain: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    type: str
    from_currency: str
    from_amount: str
    to_currency: str
    to_amount: str
    method_or_dest: Optional[str] = None
    status: str
    tx_hash: Optional[str] = None
    chain: Optional[str] = None
    created_at: str

class GoogleAuthRequest(BaseModel):
    credential: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class BankAccountCreate(BaseModel):
    bank_name: str
    account_number: str
    account_holder: str
    account_type: str = "bank"

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class TelegramConfig(BaseModel):
    bot_token: str
    chat_id: str

# ============ HELPERS ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(request: Request):
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ============ COINGECKO PRICE CACHE ============

price_cache = {"data": None, "timestamp": 0}
CACHE_TTL = 60

COINGECKO_MAP = {
    "ethereum": "ETH",
    "bitcoin": "BTC",
    "tether": "USDT",
    "usd-coin": "USDC",
    "binancecoin": "BNB",
    "solana": "SOL",
    "matic-network": "MATIC",
    "avalanche-2": "AVAX",
    "arbitrum": "ARB",
    "optimism": "OP",
    "chainlink": "LINK",
    "uniswap": "UNI",
    "wrapped-bitcoin": "WBTC",
}

CHAIN_SUFFIXES = {
    "ETH": [".Base", ".Arb", ".OP"],
    "USDT": [".BSC", ".Arb", ".Base", ".Sol", ".Poly", ".OP", ".Avax"],
    "USDC": [".Base", ".Arb", ".Sol", ".BSC", ".Poly", ".OP", ".Avax"],
}

# Fallback rates when CoinGecko is unavailable
FALLBACK_IDR_PRICES = {
    "ETH": 26000000, "BTC": 435000000, "USDT": 16400, "USDC": 16400,
    "BNB": 9700000, "SOL": 2400000, "MATIC": 6500, "AVAX": 437000,
    "ARB": 18200, "OP": 25600, "LINK": 230000, "UNI": 160000, "WBTC": 435000000,
}

def build_rates(price_map):
    """Build full rate table from IDR prices"""
    rates = {}
    for suffix in ["", ".BSC", ".Poly"]:
        rates[f"IDR_IDRT{suffix}"] = 1
        rates[f"IDRT{suffix}_IDR"] = 1
    for symbol, idr_price in price_map.items():
        rates[f"{symbol}_IDR"] = idr_price
        rates[f"IDR_{symbol}"] = 1 / idr_price if idr_price else 0
        for chain_suffix in CHAIN_SUFFIXES.get(symbol, []):
            rates[f"{symbol}{chain_suffix}_IDR"] = idr_price
            rates[f"IDR_{symbol}{chain_suffix}"] = 1 / idr_price if idr_price else 0
    return rates

@api_router.get("/prices")
async def get_live_prices():
    now = time.time()
    if price_cache["data"] and (now - price_cache["timestamp"]) < CACHE_TTL:
        return price_cache["data"]

    try:
        ids = ",".join(COINGECKO_MAP.keys())
        async with httpx.AsyncClient() as http:
            resp = await http.get(
                f"https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=idr",
                timeout=10
            )
            if resp.status_code != 200:
                raise Exception(f"CoinGecko returned {resp.status_code}")
            data = resp.json()
            if "status" in data and "error_code" in data.get("status", {}):
                raise Exception(f"CoinGecko error: {data['status'].get('error_message')}")

        price_map = {}
        for cg_id, symbol in COINGECKO_MAP.items():
            if cg_id in data and "idr" in data[cg_id]:
                price_map[symbol] = data[cg_id]["idr"]

        if len(price_map) < 3:
            raise Exception("Too few prices returned")

        rates = build_rates(price_map)
        result = {"rates": rates, "timestamp": now, "source": "coingecko"}
        price_cache["data"] = result
        price_cache["timestamp"] = now
        return result

    except Exception as e:
        logger.warning(f"CoinGecko fetch failed: {e}, using fallback")
        if price_cache["data"]:
            return price_cache["data"]
        rates = build_rates(FALLBACK_IDR_PRICES)
        result = {"rates": rates, "timestamp": now, "source": "fallback"}
        price_cache["data"] = result
        price_cache["timestamp"] = now
        return result

# ============ AUTH ROUTES ============

@api_router.post("/auth/signup", response_model=AuthResponse)
async def signup(data: UserSignUp):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "name": data.name,
        "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "wallet_connected": False,
        "wallet_address": None,
        "wallet_name": None,
        "auth_type": "email",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    return AuthResponse(
        token=token,
        user=UserResponse(id=user_id, name=data.name, email=data.email.lower())
    )

@api_router.post("/auth/signin", response_model=AuthResponse)
async def signin(data: UserSignIn):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["_id"])
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user["_id"], name=user["name"], email=user["email"],
            wallet_connected=user.get("wallet_connected", False),
            wallet_address=user.get("wallet_address"),
            wallet_name=user.get("wallet_name"),
            auth_type=user.get("auth_type", "email"),
            picture=user.get("picture"),
        )
    )

@api_router.post("/auth/google")
async def google_auth(data: GoogleAuthRequest):
    """Verify Google ID token and return JWT"""
    async with httpx.AsyncClient() as http:
        resp = await http.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={data.credential}",
            timeout=10
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    info = resp.json()
    if info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Invalid client ID")

    email = info["email"].lower()
    name = info.get("name", email.split("@")[0])
    picture = info.get("picture", "")

    existing = await db.users.find_one({"email": email})
    if existing:
        user_id = existing["_id"]
        await db.users.update_one(
            {"_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
        wallet_connected = existing.get("wallet_connected", False)
        wallet_address = existing.get("wallet_address")
        wallet_name = existing.get("wallet_name")
    else:
        user_id = str(uuid.uuid4())
        await db.users.insert_one({
            "_id": user_id,
            "name": name,
            "email": email,
            "password_hash": "",
            "wallet_connected": False,
            "wallet_address": None,
            "wallet_name": None,
            "auth_type": "google",
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        wallet_connected = False
        wallet_address = None
        wallet_name = None

    token = create_token(user_id)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "wallet_connected": wallet_connected,
            "wallet_address": wallet_address,
            "wallet_name": wallet_name,
            "auth_type": "google",
            "picture": picture,
        }
    }

# Real wallet balance endpoint
@api_router.get("/wallet/balances/{address}")
async def get_wallet_balances(address: str):
    """Fetch real token balances from blockchain"""
    balances = {}
    alchemy_key = ALCHEMY_API_KEY

    async with httpx.AsyncClient(timeout=10) as http:
        # BSC native (BNB)
        try:
            resp = await http.post(
                f"https://bnb-mainnet.g.alchemy.com/v2/{alchemy_key}",
                json={"jsonrpc": "2.0", "method": "eth_getBalance", "params": [address, "latest"], "id": 1}
            )
            result = resp.json().get("result", "0x0")
            balances["BNB"] = str(int(result, 16) / 1e18)
        except Exception as e:
            logger.warning(f"BNB balance error: {e}")

        # ERC-20 balances on BSC
        erc20_tokens = {
            "IDRT.BSC": "0x66207e39bb77e6b99aab56795c7c340c08520d83",
            "USDT.BSC": "0x55d398326f99059fF775485246999027B3197955",
            "USDC.BSC": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        }
        balance_of_sig = "0x70a08231000000000000000000000000"
        padded_addr = address[2:].lower().zfill(64)

        for token_key, contract in erc20_tokens.items():
            try:
                resp = await http.post(
                    f"https://bnb-mainnet.g.alchemy.com/v2/{alchemy_key}",
                    json={
                        "jsonrpc": "2.0", "method": "eth_call",
                        "params": [{"to": contract, "data": balance_of_sig + padded_addr}, "latest"],
                        "id": 1
                    }
                )
                result = resp.json().get("result", "0x0")
                raw = int(result, 16)
                decimals = 2 if "IDRT" in token_key else 18
                balances[token_key] = str(raw / (10 ** decimals))
            except Exception as e:
                logger.warning(f"{token_key} balance error: {e}")

        # Polygon balances
        poly_tokens = {
            "IDRT.Poly": "0x554cd6bdD03214b10AafA3e0D4D42De0C5D2937b",
            "USDT.Poly": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            "USDC.Poly": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        }
        for token_key, contract in poly_tokens.items():
            try:
                resp = await http.post(
                    f"https://polygon-mainnet.g.alchemy.com/v2/{alchemy_key}",
                    json={
                        "jsonrpc": "2.0", "method": "eth_call",
                        "params": [{"to": contract, "data": balance_of_sig + padded_addr}, "latest"],
                        "id": 1
                    }
                )
                result = resp.json().get("result", "0x0")
                raw = int(result, 16)
                decimals = 2 if "IDRT" in token_key else 6
                balances[token_key] = str(raw / (10 ** decimals))
            except Exception as e:
                logger.warning(f"{token_key} balance error: {e}")

    return {"address": address, "balances": balances}

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "id": user["_id"], "name": user["name"], "email": user["email"],
        "wallet_connected": user.get("wallet_connected", False),
        "wallet_address": user.get("wallet_address"),
        "wallet_name": user.get("wallet_name"),
        "auth_type": user.get("auth_type", "email"),
        "picture": user.get("picture"),
    }

# ============ WALLET ROUTES ============

@api_router.post("/wallet/connect")
async def connect_wallet(data: WalletConnectRequest, user=Depends(get_current_user)):
    addr = data.wallet_address or "0x" + uuid.uuid4().hex[:40]
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "wallet_connected": True,
            "wallet_address": addr,
            "wallet_name": data.wallet_name,
        }}
    )
    return {"wallet_address": addr, "wallet_name": data.wallet_name, "connected": True}

@api_router.delete("/wallet/disconnect")
async def disconnect_wallet(user=Depends(get_current_user)):
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"wallet_connected": False, "wallet_address": None, "wallet_name": None}}
    )
    return {"disconnected": True}

# ============ TRANSACTION ROUTES ============

@api_router.post("/transactions")
async def create_transaction(data: TransactionCreate, user=Depends(get_current_user)):
    # Validate minimum amount for IDR transfers
    if data.type == 'transfer' and data.from_currency == 'IDR':
        try:
            amt = float(data.from_amount)
            if amt < MIN_AMOUNT_IDR:
                raise HTTPException(status_code=400, detail=f"Minimum pembelian Rp {MIN_AMOUNT_IDR:,}")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid amount")

    tx_id = "MRD-" + uuid.uuid4().hex[:8].upper()
    tx_doc = {
        "_id": tx_id,
        "user_id": user["_id"],
        "type": data.type,
        "from_currency": data.from_currency,
        "from_amount": data.from_amount,
        "to_currency": data.to_currency,
        "to_amount": data.to_amount,
        "method_or_dest": data.method_or_dest,
        "tx_hash": data.tx_hash,
        "chain": data.chain,
        "status": "completed" if data.tx_hash else "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.transactions.insert_one(tx_doc)

    # Send Telegram notification
    tg_config = await db.settings.find_one({"_id": "telegram"})
    if tg_config:
        emoji = "🔄" if data.type == "transfer" else "💸"
        msg = (
            f"{emoji} <b>Transaksi Baru - {tx_id}</b>\n"
            f"User: {user['email']}\n"
            f"Tipe: {data.type.upper()}\n"
            f"Dari: {data.from_amount} {data.from_currency}\n"
            f"Ke: {data.to_amount} {data.to_currency}\n"
            f"Status: {tx_doc['status']}"
        )
        if data.tx_hash:
            msg += f"\nTx Hash: <code>{data.tx_hash[:20]}...</code>"
        try:
            async with httpx.AsyncClient(timeout=10) as http:
                await http.post(
                    f"https://api.telegram.org/bot{tg_config['bot_token']}/sendMessage",
                    json={"chat_id": tg_config['chat_id'], "text": msg, "parse_mode": "HTML"}
                )
        except Exception as e:
            logger.warning(f"Telegram tx notification failed: {e}")

    return {
        "id": tx_id, "type": data.type,
        "from_currency": data.from_currency, "from_amount": data.from_amount,
        "to_currency": data.to_currency, "to_amount": data.to_amount,
        "method_or_dest": data.method_or_dest, "status": tx_doc["status"],
        "tx_hash": data.tx_hash, "chain": data.chain,
        "created_at": tx_doc["created_at"]
    }

@api_router.get("/transactions")
async def get_transactions(user=Depends(get_current_user)):
    txs = await db.transactions.find({"user_id": user["_id"]}).sort("created_at", -1).to_list(100)
    return [
        {
            "id": t["_id"], "type": t["type"],
            "from_currency": t["from_currency"], "from_amount": t["from_amount"],
            "to_currency": t["to_currency"], "to_amount": t["to_amount"],
            "method_or_dest": t.get("method_or_dest"), "status": t["status"],
            "tx_hash": t.get("tx_hash"), "chain": t.get("chain"),
            "created_at": t["created_at"]
        } for t in txs
    ]

# ============ PROFILE ROUTES ============

@api_router.put("/profile")
async def update_profile(data: ProfileUpdate, user=Depends(get_current_user)):
    updates = {}
    if data.name: updates["name"] = data.name
    if data.phone is not None: updates["phone"] = data.phone
    if updates:
        await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
    updated = await db.users.find_one({"_id": user["_id"]})
    return {
        "id": updated["_id"], "name": updated["name"], "email": updated["email"],
        "phone": updated.get("phone", ""),
        "wallet_connected": updated.get("wallet_connected", False),
        "wallet_address": updated.get("wallet_address"),
        "wallet_name": updated.get("wallet_name"),
        "created_at": updated.get("created_at", ""),
    }

# ============ BANK ACCOUNT ROUTES ============

@api_router.post("/bank-accounts")
async def add_bank_account(data: BankAccountCreate, user=Depends(get_current_user)):
    account = {
        "id": str(uuid.uuid4())[:8],
        "bank_name": data.bank_name,
        "account_number": data.account_number,
        "account_holder": data.account_holder,
        "account_type": data.account_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.update_one({"_id": user["_id"]}, {"$push": {"bank_accounts": account}})
    return account

@api_router.get("/bank-accounts")
async def get_bank_accounts(user=Depends(get_current_user)):
    u = await db.users.find_one({"_id": user["_id"]})
    return {"accounts": u.get("bank_accounts", [])}

@api_router.delete("/bank-accounts/{account_id}")
async def delete_bank_account(account_id: str, user=Depends(get_current_user)):
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$pull": {"bank_accounts": {"id": account_id}}}
    )
    return {"deleted": True}

# ============ CHATBOT (AI Customer Service) ============

CHATBOT_SYSTEM = """Kamu adalah asisten customer service Meridiant, platform transfer dan pertukaran crypto untuk pasar Indonesia.

Informasi tentang Meridiant:
- Platform transfer crypto on-chain dan withdraw off-chain (crypto ke fiat)
- Mendukung blockchain: BNB Chain (BSC), Polygon, Solana, Ethereum, Arbitrum, Optimism, Base, Avalanche
- Token yang didukung: IDRT, USDT, USDC, ETH, BNB, SOL, MATIC, dan lainnya
- Wallet yang didukung: MetaMask, OKX Wallet, Phantom, Solflare
- Login via email/password atau Google OAuth
- Biaya: Hanya gas fee jaringan blockchain, Meridiant tidak mengenakan biaya tambahan
- Transfer dilakukan langsung di blockchain (on-chain), aman dan transparan
- Setiap transaksi bisa diverifikasi di block explorer

Panduan menjawab:
- Jawab dalam Bahasa Indonesia kecuali user berbicara bahasa lain
- Jawab singkat, ramah, dan informatif (maksimal 3 paragraf)
- Jika tidak tahu jawabannya, arahkan user untuk menghubungi support@meridiant.com
- Jangan pernah minta private key atau seed phrase user
- Jangan memberikan saran investasi"""

@api_router.post("/chat")
async def chat_endpoint(data: ChatMessage):
    session_id = data.session_id or str(uuid.uuid4())
    try:
        # Load chat history from DB
        history_doc = await db.chat_sessions.find_one({"_id": session_id})
        messages = history_doc.get("messages", []) if history_doc else []

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=CHATBOT_SYSTEM
        ).with_model("openai", "gpt-4.1-mini")

        # Replay history into chat context
        for msg in messages[-10:]:  # Last 10 messages for context
            if msg["role"] == "user":
                await chat.send_message(UserMessage(text=msg["content"]))
            # Assistant messages are automatically tracked by LlmChat

        # Send new message
        response = await chat.send_message(UserMessage(text=data.message))

        # Save to DB
        messages.append({"role": "user", "content": data.message, "ts": datetime.now(timezone.utc).isoformat()})
        messages.append({"role": "assistant", "content": response, "ts": datetime.now(timezone.utc).isoformat()})
        await db.chat_sessions.update_one(
            {"_id": session_id},
            {"$set": {"messages": messages, "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )

        return {"reply": response, "session_id": session_id}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"reply": "Maaf, terjadi gangguan pada sistem kami. Silakan coba lagi atau hubungi support@meridiant.com", "session_id": session_id}

# ============ ADMIN DASHBOARD ============

async def get_admin_user(request: Request):
    user = await get_current_user(request)
    if user.get("email") != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@api_router.get("/admin/stats")
async def admin_stats(user=Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    total_txs = await db.transactions.count_documents({})
    completed_txs = await db.transactions.count_documents({"status": "completed"})
    pending_txs = await db.transactions.count_documents({"status": "pending"})

    # Recent 24h stats
    day_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    recent_txs = await db.transactions.count_documents({"created_at": {"$gte": day_ago}})
    recent_users = await db.users.count_documents({"created_at": {"$gte": day_ago}})

    # Volume by token (top 5)
    pipeline = [
        {"$group": {"_id": "$from_currency", "count": {"$sum": 1}, "total": {"$sum": {"$toDouble": "$from_amount"}}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    volume_by_token = []
    async for doc in db.transactions.aggregate(pipeline):
        volume_by_token.append({"token": doc["_id"], "count": doc["count"], "total": doc["total"]})

    return {
        "total_users": total_users,
        "total_transactions": total_txs,
        "completed_transactions": completed_txs,
        "pending_transactions": pending_txs,
        "recent_24h_transactions": recent_txs,
        "recent_24h_users": recent_users,
        "volume_by_token": volume_by_token,
    }

@api_router.get("/admin/transactions")
async def admin_transactions(user=Depends(get_admin_user), limit: int = 50, skip: int = 0):
    txs = await db.transactions.find().sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    result = []
    for t in txs:
        # Get user info
        tx_user = await db.users.find_one({"_id": t.get("user_id")})
        result.append({
            "id": t["_id"],
            "user_email": tx_user["email"] if tx_user else "unknown",
            "user_name": tx_user["name"] if tx_user else "unknown",
            "type": t["type"],
            "from_currency": t["from_currency"],
            "from_amount": t["from_amount"],
            "to_currency": t["to_currency"],
            "to_amount": t["to_amount"],
            "status": t["status"],
            "tx_hash": t.get("tx_hash"),
            "chain": t.get("chain"),
            "created_at": t["created_at"],
        })
    total = await db.transactions.count_documents({})
    return {"transactions": result, "total": total}

@api_router.get("/admin/users")
async def admin_users(user=Depends(get_admin_user), limit: int = 50, skip: int = 0):
    users = await db.users.find().sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    result = []
    for u in users:
        tx_count = await db.transactions.count_documents({"user_id": u["_id"]})
        result.append({
            "id": u["_id"],
            "name": u["name"],
            "email": u["email"],
            "auth_type": u.get("auth_type", "email"),
            "wallet_connected": u.get("wallet_connected", False),
            "wallet_address": u.get("wallet_address"),
            "created_at": u.get("created_at", ""),
            "transaction_count": tx_count,
        })
    total = await db.users.count_documents({})
    return {"users": result, "total": total}

# ============ TELEGRAM NOTIFICATIONS ============

async def send_telegram_notification(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            await http.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
            )
    except Exception as e:
        logger.warning(f"Telegram notification failed: {e}")

@api_router.post("/admin/telegram-config")
async def set_telegram_config(data: TelegramConfig, user=Depends(get_admin_user)):
    """Save Telegram bot config to DB"""
    await db.settings.update_one(
        {"_id": "telegram"},
        {"$set": {"bot_token": data.bot_token, "chat_id": data.chat_id}},
        upsert=True
    )
    # Test the connection
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            resp = await http.post(
                f"https://api.telegram.org/bot{data.bot_token}/sendMessage",
                json={"chat_id": data.chat_id, "text": "Meridiant notification connected! You will receive transaction alerts here."}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to send test message. Check bot token and chat ID.")
    except httpx.HTTPError:
        raise HTTPException(status_code=400, detail="Failed to connect to Telegram.")
    return {"status": "connected"}

@api_router.get("/admin/telegram-config")
async def get_telegram_config(user=Depends(get_admin_user)):
    config = await db.settings.find_one({"_id": "telegram"})
    if not config:
        return {"configured": False}
    return {"configured": True, "chat_id": config.get("chat_id", "")}

# ============ HEALTH ============

@api_router.get("/")
async def root():
    return {"message": "Meridiant API v2.0.0"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def seed_test_user():
    existing = await db.users.find_one({"email": "test@meridiant.com"})
    if not existing:
        user_id = str(uuid.uuid4())
        await db.users.insert_one({
            "_id": user_id,
            "name": "Meridiant Tester",
            "email": "test@meridiant.com",
            "password_hash": hash_password("Test1234!"),
            "wallet_connected": False,
            "wallet_address": None,
            "wallet_name": None,
            "auth_type": "email",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded test user: test@meridiant.com / Test1234!")
    # Seed admin user
    admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if not admin:
        admin_id = str(uuid.uuid4())
        await db.users.insert_one({
            "_id": admin_id,
            "name": "Admin Meridiant",
            "email": ADMIN_EMAIL,
            "password_hash": hash_password("Admin1234!"),
            "wallet_connected": False,
            "wallet_address": None,
            "wallet_name": None,
            "auth_type": "email",
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user: {ADMIN_EMAIL} / Admin1234!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
