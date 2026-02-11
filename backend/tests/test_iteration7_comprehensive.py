"""
Iteration 7 Comprehensive Backend Tests - All API Endpoints
Tests cover: Health, Auth, Wallet, Transactions, Prices, Bank Accounts, Chat, Admin
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials
TEST_EMAIL = "test@meridiant.com"
TEST_PASSWORD = "Test1234!"
ADMIN_EMAIL = "admin@meridiant.com"
ADMIN_PASSWORD = "Admin1234!"


class TestHealthEndpoint:
    """Test API health check"""
    
    def test_api_health_check(self):
        """GET /api/ returns health status"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Meridiant" in data["message"]
        print(f"PASSED: API health check - {data['message']}")


class TestUserSignup:
    """Test user registration"""
    
    def test_signup_new_user(self):
        """POST /api/auth/signup creates new user"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@meridiant.com"
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Test User",
            "email": unique_email,
            "password": "TestPass123!"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["name"] == "Test User"
        print(f"PASSED: Signup new user - {unique_email}")
    
    def test_signup_duplicate_email(self):
        """POST /api/auth/signup rejects duplicate email"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Test",
            "email": TEST_EMAIL,
            "password": "Test1234!"
        })
        assert response.status_code == 400
        print("PASSED: Duplicate email correctly rejected")


class TestUserSignin:
    """Test user authentication"""
    
    def test_signin_success(self):
        """POST /api/auth/signin with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"PASSED: Signin success for {TEST_EMAIL}")
    
    def test_signin_invalid_password(self):
        """POST /api/auth/signin with invalid password"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("PASSED: Invalid password correctly rejected")
    
    def test_signin_invalid_email(self):
        """POST /api/auth/signin with non-existent email"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "nonexistent@meridiant.com",
            "password": "Test1234!"
        })
        assert response.status_code == 401
        print("PASSED: Invalid email correctly rejected")


class TestGetMe:
    """Test GET /api/auth/me endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_me_success(self):
        """GET /api/auth/me returns current user"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        assert "id" in data
        assert "name" in data
        print(f"PASSED: GET /api/auth/me - user: {data['name']}")
    
    def test_get_me_no_token(self):
        """GET /api/auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("PASSED: GET /api/auth/me without token rejected")
    
    def test_get_me_invalid_token(self):
        """GET /api/auth/me with invalid token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me", 
            headers={"Authorization": "Bearer invalid_token"})
        assert response.status_code == 401
        print("PASSED: GET /api/auth/me with invalid token rejected")


class TestWalletConnect:
    """Test wallet connection endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_wallet_connect(self):
        """POST /api/wallet/connect connects a wallet"""
        response = requests.post(f"{BASE_URL}/api/wallet/connect", 
            headers=self.headers,
            json={
                "wallet_id": "metamask",
                "wallet_name": "MetaMask",
                "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f91234"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["connected"] == True
        assert "wallet_address" in data
        assert data["wallet_name"] == "MetaMask"
        print(f"PASSED: Wallet connected - {data['wallet_address']}")
    
    def test_wallet_disconnect(self):
        """DELETE /api/wallet/disconnect disconnects wallet"""
        # First connect
        requests.post(f"{BASE_URL}/api/wallet/connect", 
            headers=self.headers,
            json={"wallet_id": "metamask", "wallet_name": "MetaMask"})
        
        # Then disconnect
        response = requests.delete(f"{BASE_URL}/api/wallet/disconnect", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["disconnected"] == True
        print("PASSED: Wallet disconnected")


class TestPricesEndpoint:
    """Test live prices endpoint"""
    
    def test_get_prices(self):
        """GET /api/prices returns exchange rates"""
        response = requests.get(f"{BASE_URL}/api/prices")
        assert response.status_code == 200
        data = response.json()
        assert "rates" in data
        assert isinstance(data["rates"], dict)
        # Check for expected rate pairs
        assert any("IDR" in key for key in data["rates"].keys()), "Should have IDR rates"
        print(f"PASSED: GET /api/prices - source: {data.get('source', 'unknown')}, rates count: {len(data['rates'])}")


class TestTransactions:
    """Test transaction endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_create_transfer_transaction(self):
        """POST /api/transactions creates transfer transaction"""
        response = requests.post(f"{BASE_URL}/api/transactions",
            headers=self.headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "100000",
                "to_currency": "USDT",
                "to_amount": "6.10"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["type"] == "transfer"
        assert data["from_currency"] == "IDR"
        assert data["from_amount"] == "100000"
        print(f"PASSED: Transfer transaction created - {data['id']}")
    
    def test_reject_below_minimum_idr(self):
        """POST /api/transactions rejects amount below 10,000 IDR for transfer"""
        response = requests.post(f"{BASE_URL}/api/transactions",
            headers=self.headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "5000",  # Below 10,000 minimum
                "to_currency": "USDT",
                "to_amount": "0.30"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "Minimum" in data.get("detail", "") or "10" in str(data)
        print("PASSED: Below minimum IDR transfer rejected")
    
    def test_create_withdraw_transaction(self):
        """POST /api/transactions creates withdraw transaction"""
        response = requests.post(f"{BASE_URL}/api/transactions",
            headers=self.headers,
            json={
                "type": "withdraw",
                "from_currency": "USDT",
                "from_amount": "10",
                "to_currency": "IDR",
                "to_amount": "164000"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["type"] == "withdraw"
        print(f"PASSED: Withdraw transaction created - {data['id']}")
    
    def test_get_transactions_list(self):
        """GET /api/transactions returns user's transactions"""
        response = requests.get(f"{BASE_URL}/api/transactions", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: GET /api/transactions - count: {len(data)}")


class TestProfileUpdate:
    """Test profile update endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_update_profile(self):
        """PUT /api/profile updates user profile"""
        response = requests.put(f"{BASE_URL}/api/profile",
            headers=self.headers,
            json={
                "name": "Meridiant Tester Updated",
                "phone": "+62812345678"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "+62812345678"
        print(f"PASSED: Profile updated - name: {data['name']}")
        
        # Reset name back
        requests.put(f"{BASE_URL}/api/profile",
            headers=self.headers,
            json={"name": "Meridiant Tester"})


class TestBankAccounts:
    """Test bank account endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_add_bank_account(self):
        """POST /api/bank-accounts adds bank account"""
        response = requests.post(f"{BASE_URL}/api/bank-accounts",
            headers=self.headers,
            json={
                "bank_name": "BCA",
                "account_number": "1234567890",
                "account_holder": "Test User"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["bank_name"] == "BCA"
        assert data["account_number"] == "1234567890"
        print(f"PASSED: Bank account added - {data['bank_name']}")
    
    def test_get_bank_accounts(self):
        """GET /api/bank-accounts returns user's bank accounts"""
        response = requests.get(f"{BASE_URL}/api/bank-accounts", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "accounts" in data
        assert isinstance(data["accounts"], list)
        print(f"PASSED: GET /api/bank-accounts - count: {len(data['accounts'])}")


class TestChatEndpoint:
    """Test AI chatbot endpoint"""
    
    def test_chat_message(self):
        """POST /api/chat sends message to AI chatbot"""
        response = requests.post(f"{BASE_URL}/api/chat",
            json={
                "message": "Apa itu Meridiant?",
                "session_id": f"test_session_{uuid.uuid4().hex[:8]}"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "session_id" in data
        assert len(data["reply"]) > 0
        print(f"PASSED: Chat response received - {len(data['reply'])} chars")


class TestAdminEndpoints:
    """Test admin dashboard endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        self.admin_token = response.json()["token"]
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Also get regular user token for access tests
        response2 = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.user_token = response2.json()["token"]
        self.user_headers = {"Authorization": f"Bearer {self.user_token}"}
    
    def test_admin_stats(self):
        """GET /api/admin/stats returns dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_transactions" in data
        print(f"PASSED: Admin stats - users: {data['total_users']}, txs: {data['total_transactions']}")
    
    def test_admin_stats_forbidden_for_regular_user(self):
        """GET /api/admin/stats returns 403 for non-admin"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.user_headers)
        assert response.status_code == 403
        print("PASSED: Admin stats forbidden for regular user")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
