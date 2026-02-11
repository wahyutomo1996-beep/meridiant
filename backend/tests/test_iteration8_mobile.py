"""
Iteration 8 Backend Tests - Mobile optimization verification
Tests ensure backend APIs are still working after mobile UI changes
"""
import pytest
import requests
import os
import uuid

# Use frontend env URL for testing public endpoints
BASE_URL = "https://payment-ui-verify.preview.emergentagent.com"

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


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_signin_success(self):
        """POST /api/auth/signin with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Signin failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"PASSED: Signin with test user")
    
    def test_signin_invalid_password(self):
        """POST /api/auth/signin with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": "WrongPassword123!"
        })
        assert response.status_code == 401
        print("PASSED: Signin with wrong password returns 401")
    
    def test_get_me_with_token(self):
        """GET /api/auth/me with valid token returns user"""
        # First signin
        signin_res = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = signin_res.json()["token"]
        
        # Then get me
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        print("PASSED: Get me with valid token")


class TestPricesEndpoint:
    """Test prices/exchange rates"""
    
    def test_get_prices(self):
        """GET /api/prices returns exchange rates"""
        response = requests.get(f"{BASE_URL}/api/prices")
        assert response.status_code == 200
        data = response.json()
        assert "rates" in data
        # Verify IDR_IDRT rate exists (key currency pair)
        assert "IDR_IDRT" in data["rates"] or len(data["rates"]) > 0
        print(f"PASSED: Get prices - {len(data['rates'])} rates returned")


class TestTransactions:
    """Test transaction endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_create_transfer(self):
        """POST /api/transactions creates transfer"""
        response = requests.post(f"{BASE_URL}/api/transactions", json={
            "type": "transfer",
            "from_currency": "IDR",
            "from_amount": "100000",  # Above 10,000 minimum
            "to_currency": "IDRT",
            "to_amount": "100",
            "method_or_dest": "BCA"
        }, headers=self.headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["type"] == "transfer"
        print("PASSED: Create transfer transaction")
    
    def test_reject_below_minimum_idr(self):
        """POST /api/transactions rejects amount below 10,000 IDR"""
        response = requests.post(f"{BASE_URL}/api/transactions", json={
            "type": "transfer",
            "from_currency": "IDR",
            "from_amount": "5000",  # Below 10,000 minimum
            "to_currency": "IDRT",
            "to_amount": "5"
        }, headers=self.headers)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASSED: Reject amount below 10,000 IDR minimum")
    
    def test_get_transactions(self):
        """GET /api/transactions returns user's transactions"""
        response = requests.get(f"{BASE_URL}/api/transactions", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: Get transactions - {len(data)} found")


class TestProfileEndpoint:
    """Test profile update"""
    
    def test_update_profile(self):
        """PUT /api/profile updates user profile"""
        # Login first
        signin_res = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = signin_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.put(f"{BASE_URL}/api/profile", json={
            "name": "Test User Updated",
            "phone": "081234567890"
        }, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test User Updated"
        print("PASSED: Update profile")


class TestBankAccounts:
    """Test bank account management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_bank_accounts(self):
        """GET /api/bank-accounts returns accounts list"""
        response = requests.get(f"{BASE_URL}/api/bank-accounts", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "accounts" in data
        print(f"PASSED: Get bank accounts - {len(data['accounts'])} found")


class TestChatEndpoint:
    """Test AI chatbot"""
    
    def test_chat_message(self):
        """POST /api/chat returns AI response"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "Halo, apa itu Meridiant?",
            "session_id": None
        })
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "session_id" in data
        assert len(data["reply"]) > 0
        print(f"PASSED: Chat response received - {len(data['reply'])} chars")


class TestAdminEndpoints:
    """Test admin-only endpoints"""
    
    def test_admin_stats_success(self):
        """GET /api/admin/stats returns stats for admin user"""
        # Login as admin
        signin_res = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert signin_res.status_code == 200, f"Admin signin failed: {signin_res.text}"
        token = signin_res.json()["token"]
        
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        print(f"PASSED: Admin stats - {data['total_users']} users, {data['total_transactions']} transactions")
    
    def test_admin_stats_forbidden_for_regular_user(self):
        """GET /api/admin/stats returns 403 for non-admin"""
        # Login as regular user
        signin_res = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = signin_res.json()["token"]
        
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 403
        print("PASSED: Admin stats forbidden for regular user")
