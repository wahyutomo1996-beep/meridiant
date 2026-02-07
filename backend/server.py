from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError

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

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

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

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class WalletConnectRequest(BaseModel):
    wallet_id: str
    wallet_name: str

class WalletResponse(BaseModel):
    wallet_address: str
    wallet_name: str
    connected: bool

class TransactionCreate(BaseModel):
    type: str  # transfer or withdraw
    from_currency: str
    from_amount: str
    to_currency: str
    to_amount: str
    method_or_dest: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    type: str
    from_currency: str
    from_amount: str
    to_currency: str
    to_amount: str
    method_or_dest: Optional[str]
    status: str
    created_at: str

# ============ HELPERS ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

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
        "created_at": datetime.utcnow().isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id)

    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user_id, name=data.name, email=data.email.lower(),
            wallet_connected=False
        )
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
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return UserResponse(
        id=user["_id"], name=user["name"], email=user["email"],
        wallet_connected=user.get("wallet_connected", False),
        wallet_address=user.get("wallet_address"),
        wallet_name=user.get("wallet_name"),
    )

# ============ WALLET ROUTES ============

@api_router.post("/wallet/connect", response_model=WalletResponse)
async def connect_wallet(data: WalletConnectRequest, user=Depends(get_current_user)):
    # Generate mock wallet address
    import random
    addr = "0x" + "".join(random.choices("0123456789abcdef", k=40))

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "wallet_connected": True,
            "wallet_address": addr,
            "wallet_name": data.wallet_name,
        }}
    )
    return WalletResponse(wallet_address=addr, wallet_name=data.wallet_name, connected=True)

@api_router.delete("/wallet/disconnect")
async def disconnect_wallet(user=Depends(get_current_user)):
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "wallet_connected": False,
            "wallet_address": None,
            "wallet_name": None,
        }}
    )
    return {"disconnected": True}

# ============ TRANSACTION ROUTES ============

@api_router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(data: TransactionCreate, user=Depends(get_current_user)):
    if not user.get("wallet_connected"):
        raise HTTPException(status_code=400, detail="Wallet not connected")

    tx_id = "MRD-" + str(uuid.uuid4())[:8].upper()
    tx_doc = {
        "_id": tx_id,
        "user_id": user["_id"],
        "type": data.type,
        "from_currency": data.from_currency,
        "from_amount": data.from_amount,
        "to_currency": data.to_currency,
        "to_amount": data.to_amount,
        "method_or_dest": data.method_or_dest,
        "status": "completed",
        "created_at": datetime.utcnow().isoformat(),
    }
    await db.transactions.insert_one(tx_doc)

    return TransactionResponse(
        id=tx_id, type=data.type,
        from_currency=data.from_currency, from_amount=data.from_amount,
        to_currency=data.to_currency, to_amount=data.to_amount,
        method_or_dest=data.method_or_dest, status="completed",
        created_at=tx_doc["created_at"]
    )

@api_router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(user=Depends(get_current_user)):
    txs = await db.transactions.find({"user_id": user["_id"]}).sort("created_at", -1).to_list(100)
    return [
        TransactionResponse(
            id=t["_id"], type=t["type"],
            from_currency=t["from_currency"], from_amount=t["from_amount"],
            to_currency=t["to_currency"], to_amount=t["to_amount"],
            method_or_dest=t.get("method_or_dest"), status=t["status"],
            created_at=t["created_at"]
        ) for t in txs
    ]

# ============ EXCHANGE RATES ============

@api_router.get("/exchange-rates")
async def get_exchange_rates():
    return {
        "rates": {
            "IDR_IDRT": 1,
            "IDR_ETH": 0.0000000384,
            "IDR_BTC": 0.0000000023,
            "IDR_USDT": 0.0000609,
            "IDR_USDC": 0.0000609,
            "IDR_BNB": 0.00000155,
            "IDR_MATIC": 0.00155,
            "IDR_SOL": 0.0000043,
            "IDRT_IDR": 1,
            "ETH_IDR": 26000000,
            "BTC_IDR": 435000000,
            "USDT_IDR": 16400,
            "USDC_IDR": 16400,
            "BNB_IDR": 645000,
            "SOL_IDR": 232000,
            "MATIC_IDR": 645,
        }
    }

# ============ HEALTH ============
@api_router.get("/")
async def root():
    return {"message": "Meridiant API v1.0.0"}

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
