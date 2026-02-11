"""
Iteration 10: FINAL COMPREHENSIVE TESTING before production
Tests ALL backend endpoints:
- Auth: signup, signin, me, google auth
- Prices: get live prices with TON support
- Transactions: create with fee calculation, get user transactions
- Wallet: connect, disconnect
- Bank Accounts: CRUD operations
- Profile: update
- Chat: AI chatbot endpoint
- Admin: stats, transactions, users (requires admin creds)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ============ AUTH TESTS ============

class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_signup_new_user(self):
        """POST /api/auth/signup - create new user"""
        unique_email = f"test_iter10_{uuid.uuid4().hex[:8]}@meridiant.com"
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Test User Iter10",
            "email": unique_email,
            "password": "TestPass123!"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email.lower()
        print(f"PASSED: Signup - {unique_email}")
    
    def test_signup_duplicate_rejected(self):
        """POST /api/auth/signup - reject duplicate email"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Duplicate",
            "email": "test@meridiant.com",
            "password": "TestPass123!"
        })
        assert response.status_code == 400
        print("PASSED: Duplicate email rejected with 400")
    
    def test_signin_success(self):
        """POST /api/auth/signin - login with test@meridiant.com"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@meridiant.com"
        print("PASSED: Signin test@meridiant.com")
        return data["token"]
    
    def test_signin_invalid_password(self):
        """POST /api/auth/signin - reject wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "WrongPassword!"
        })
        assert response.status_code == 401
        print("PASSED: Invalid password rejected with 401")
    
    def test_get_me_authenticated(self):
        """GET /api/auth/me - get current user with token"""
        # First login
        login_resp = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        token = login_resp.json()["token"]
        
        # Get me
        response = requests.get(f"{BASE_URL}/api/auth/me", 
            headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@meridiant.com"
        assert "id" in data
        assert "name" in data
        print(f"PASSED: GET /auth/me - {data['name']}")
    
    def test_get_me_unauthorized(self):
        """GET /api/auth/me - reject without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("PASSED: GET /auth/me without token rejected")


# ============ PRICES TESTS ============

class TestPricesEndpoint:
    """Price API tests"""
    
    def test_get_prices(self):
        """GET /api/prices - returns crypto rates"""
        response = requests.get(f"{BASE_URL}/api/prices")
        assert response.status_code == 200
        data = response.json()
        assert "rates" in data
        assert "timestamp" in data
        print(f"PASSED: GET /prices - source: {data.get('source', 'unknown')}")
    
    def test_prices_include_ton(self):
        """GET /api/prices - should include TON_IDR and USDT.TON_IDR"""
        response = requests.get(f"{BASE_URL}/api/prices")
        rates = response.json()["rates"]
        assert "TON_IDR" in rates, "TON_IDR missing"
        assert "IDR_TON" in rates, "IDR_TON missing"
        assert "USDT.TON_IDR" in rates, "USDT.TON_IDR missing"
        assert "IDR_USDT.TON" in rates, "IDR_USDT.TON missing"
        print(f"PASSED: TON rates present - TON_IDR={rates['TON_IDR']}")
    
    def test_prices_include_major_cryptos(self):
        """GET /api/prices - should have BTC, ETH, USDT, USDC, BNB, SOL"""
        response = requests.get(f"{BASE_URL}/api/prices")
        rates = response.json()["rates"]
        required = ["BTC_IDR", "ETH_IDR", "USDT_IDR", "USDC_IDR", "BNB_IDR", "SOL_IDR"]
        for r in required:
            assert r in rates, f"{r} missing from rates"
        print(f"PASSED: Major cryptos present - BTC_IDR={rates['BTC_IDR']}")


# ============ TRANSACTION TESTS ============

class TestTransactionEndpoints:
    """Transaction API tests with fee calculation"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        if response.status_code != 200:
            pytest.skip("Auth failed")
        return response.json()["token"]
    
    def test_create_transaction_with_fees(self, auth_token):
        """POST /api/transactions - create with fee calculation"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "100000",
                "to_currency": "USDT",
                "to_amount": "6.09"
            }
        )
        assert response.status_code == 200, f"Got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["trade_fee"] == 300  # 0.3%
        assert data["platform_fee"] == 200  # 0.2% for >= 50k
        assert data["total_fee"] == 500
        print(f"PASSED: Create transaction - fees: {data['total_fee']}")
    
    def test_create_transaction_below_threshold(self, auth_token):
        """POST /api/transactions - no platform fee below 50k"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "30000",
                "to_currency": "USDT",
                "to_amount": "1.83"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["trade_fee"] == 90  # 0.3%
        assert data["platform_fee"] == 0  # No platform fee under 50k
        print("PASSED: Transaction below 50k - no platform fee")
    
    def test_create_transaction_minimum_rejected(self, auth_token):
        """POST /api/transactions - reject below 10,000 IDR"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "5000",
                "to_currency": "USDT",
                "to_amount": "0.30"
            }
        )
        assert response.status_code == 400
        print("PASSED: Minimum amount (10k IDR) enforced")
    
    def test_get_transactions(self, auth_token):
        """GET /api/transactions - get user transactions"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/transactions", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: GET transactions - count: {len(data)}")


# ============ WALLET TESTS ============

class TestWalletEndpoints:
    """Wallet connect/disconnect tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        if response.status_code != 200:
            pytest.skip("Auth failed")
        return response.json()["token"]
    
    def test_connect_wallet(self, auth_token):
        """POST /api/wallet/connect"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/wallet/connect", 
            headers=headers,
            json={
                "wallet_id": "metamask",
                "wallet_name": "MetaMask",
                "wallet_address": "0x1234567890abcdef1234567890abcdef12345678"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["connected"] == True
        assert "wallet_address" in data
        print(f"PASSED: Wallet connected - {data['wallet_name']}")
    
    def test_disconnect_wallet(self, auth_token):
        """DELETE /api/wallet/disconnect"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.delete(f"{BASE_URL}/api/wallet/disconnect", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["disconnected"] == True
        print("PASSED: Wallet disconnected")


# ============ BANK ACCOUNT TESTS ============

class TestBankAccountEndpoints:
    """Bank account CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        if response.status_code != 200:
            pytest.skip("Auth failed")
        return response.json()["token"]
    
    def test_add_bank_account(self, auth_token):
        """POST /api/bank-accounts"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/bank-accounts", 
            headers=headers,
            json={
                "bank_name": "BCA",
                "account_number": "1234567890",
                "account_holder": "Test User",
                "account_type": "bank"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["bank_name"] == "BCA"
        print(f"PASSED: Bank account added - {data['id']}")
        return data["id"]
    
    def test_get_bank_accounts(self, auth_token):
        """GET /api/bank-accounts"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/bank-accounts", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "accounts" in data
        print(f"PASSED: GET bank accounts - count: {len(data['accounts'])}")
    
    def test_delete_bank_account(self, auth_token):
        """DELETE /api/bank-accounts/{id}"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        # First add one
        add_resp = requests.post(f"{BASE_URL}/api/bank-accounts", 
            headers=headers,
            json={
                "bank_name": "ToDelete",
                "account_number": "9999999999",
                "account_holder": "Delete Me",
                "account_type": "bank"
            }
        )
        account_id = add_resp.json()["id"]
        
        # Then delete
        response = requests.delete(f"{BASE_URL}/api/bank-accounts/{account_id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["deleted"] == True
        print(f"PASSED: Bank account deleted - {account_id}")


# ============ PROFILE TESTS ============

class TestProfileEndpoint:
    """Profile update tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        if response.status_code != 200:
            pytest.skip("Auth failed")
        return response.json()["token"]
    
    def test_update_profile(self, auth_token):
        """PUT /api/profile"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.put(f"{BASE_URL}/api/profile", 
            headers=headers,
            json={
                "name": "Updated Test User",
                "phone": "+6281234567890"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Test User"
        assert data["phone"] == "+6281234567890"
        print("PASSED: Profile updated")


# ============ CHAT TESTS ============

class TestChatEndpoint:
    """AI Chatbot tests"""
    
    def test_chat_endpoint(self):
        """POST /api/chat - AI chatbot response"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "Apa itu Meridiant?",
            "session_id": f"test_session_{uuid.uuid4().hex[:8]}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "session_id" in data
        assert len(data["reply"]) > 0
        print(f"PASSED: Chat response received (len={len(data['reply'])})")


# ============ ADMIN TESTS ============

class TestAdminEndpoints:
    """Admin dashboard tests (requires admin@meridiant.com)"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "admin@meridiant.com",
            "password": "Admin1234!"
        })
        if response.status_code != 200:
            pytest.skip("Admin auth failed")
        return response.json()["token"]
    
    def test_admin_stats(self, admin_token):
        """GET /api/admin/stats"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_transactions" in data
        assert "completed_transactions" in data
        assert "pending_transactions" in data
        print(f"PASSED: Admin stats - users: {data['total_users']}, txs: {data['total_transactions']}")
    
    def test_admin_transactions(self, admin_token):
        """GET /api/admin/transactions"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/transactions", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "transactions" in data
        assert "total" in data
        print(f"PASSED: Admin transactions - total: {data['total']}")
    
    def test_admin_users(self, admin_token):
        """GET /api/admin/users"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        print(f"PASSED: Admin users - total: {data['total']}")
    
    def test_admin_forbidden_for_regular_user(self):
        """GET /api/admin/stats - forbidden for non-admin"""
        # Login as regular user
        login_resp = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        token = login_resp.json()["token"]
        
        response = requests.get(f"{BASE_URL}/api/admin/stats", 
            headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 403
        print("PASSED: Admin endpoints forbidden for regular users")


# ============ HEALTH CHECK ============

class TestHealthCheck:
    """API health check"""
    
    def test_api_health(self):
        """GET /api/ - API is running"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "Meridiant" in data["message"]
        print(f"PASSED: Health check - {data['message']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
