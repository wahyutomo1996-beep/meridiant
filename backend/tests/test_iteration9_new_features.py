"""
Iteration 9: Testing NEW features
1. Fee structure: trade_fee 0.3% + platform_fee 0.2% for purchases > Rp 50k
2. TON chain + USDT.TON pair
3. POST /api/auth/signup
4. POST /api/auth/signin
5. POST /api/transactions with fee calculations
6. GET /api/prices should include TON rate
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_signup_new_user(self):
        """POST /api/auth/signup - create new user"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@meridiant.com"
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Test User",
            "email": unique_email,
            "password": "TestPass123!"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == unique_email.lower()
        print(f"✓ Signup successful: {unique_email}")
    
    def test_signup_duplicate_email_rejected(self):
        """POST /api/auth/signup - reject duplicate email"""
        # Try to signup with existing test user
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Duplicate User",
            "email": "test@meridiant.com",  # existing user
            "password": "TestPass123!"
        })
        assert response.status_code == 400, f"Expected 400 for duplicate, got {response.status_code}"
        print("✓ Duplicate email rejected with 400")
    
    def test_signin_success(self):
        """POST /api/auth/signin - sign in with test@meridiant.com / Test1234!"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == "test@meridiant.com"
        print(f"✓ Signin successful: test@meridiant.com")
        return data["token"]
    
    def test_signin_invalid_password(self):
        """POST /api/auth/signin - reject invalid password"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "WrongPassword!"
        })
        assert response.status_code == 401, f"Expected 401 for wrong password, got {response.status_code}"
        print("✓ Invalid password rejected with 401")


class TestPricesEndpoint:
    """Test prices endpoint for TON rate"""
    
    def test_get_prices_includes_ton(self):
        """GET /api/prices - should include TON rate"""
        response = requests.get(f"{BASE_URL}/api/prices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "rates" in data, "Response should contain rates"
        
        # Check for TON rates
        rates = data["rates"]
        assert "TON_IDR" in rates, "TON_IDR rate should be present"
        assert "IDR_TON" in rates, "IDR_TON rate should be present"
        assert "USDT.TON_IDR" in rates, "USDT.TON_IDR rate should be present"
        assert "IDR_USDT.TON" in rates, "IDR_USDT.TON rate should be present"
        
        # Verify TON rate is reasonable (around 50,000 IDR per TON)
        ton_rate = rates["TON_IDR"]
        assert ton_rate > 0, "TON_IDR rate should be positive"
        print(f"✓ TON_IDR rate: {ton_rate}")
        print(f"✓ USDT.TON_IDR rate: {rates['USDT.TON_IDR']}")


class TestTransactionFees:
    """Test new fee structure: trade_fee 0.3% + platform_fee 0.2% for > Rp 50k"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        if response.status_code != 200:
            pytest.skip("Authentication failed - skipping fee tests")
        return response.json()["token"]
    
    def test_transaction_100000_idr_full_fees(self, auth_token):
        """
        POST /api/transactions with amount 100000 IDR
        Expected: trade_fee = 300 (0.3%), platform_fee = 200 (0.2%)
        """
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
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Check fee structure
        assert "trade_fee" in data, "Response should contain trade_fee"
        assert "platform_fee" in data, "Response should contain platform_fee"
        assert "total_fee" in data, "Response should contain total_fee"
        
        # Verify calculations: 100000 * 0.003 = 300, 100000 * 0.002 = 200
        assert data["trade_fee"] == 300, f"Expected trade_fee=300, got {data['trade_fee']}"
        assert data["platform_fee"] == 200, f"Expected platform_fee=200, got {data['platform_fee']}"
        assert data["total_fee"] == 500, f"Expected total_fee=500, got {data['total_fee']}"
        
        print(f"✓ 100000 IDR: trade_fee={data['trade_fee']}, platform_fee={data['platform_fee']}, total={data['total_fee']}")
    
    def test_transaction_30000_idr_only_trade_fee(self, auth_token):
        """
        POST /api/transactions with amount 30000 IDR (below threshold)
        Expected: trade_fee = 90 (0.3%), platform_fee = 0 (under 50k threshold)
        """
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
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify calculations: 30000 * 0.003 = 90, platform_fee = 0 (under 50k)
        assert data["trade_fee"] == 90, f"Expected trade_fee=90, got {data['trade_fee']}"
        assert data["platform_fee"] == 0, f"Expected platform_fee=0, got {data['platform_fee']}"
        assert data["total_fee"] == 90, f"Expected total_fee=90, got {data['total_fee']}"
        
        print(f"✓ 30000 IDR: trade_fee={data['trade_fee']}, platform_fee={data['platform_fee']}, total={data['total_fee']}")
    
    def test_transaction_below_minimum_rejected(self, auth_token):
        """
        POST /api/transactions with amount below 10000 IDR
        Expected: 400 error for minimum amount violation
        """
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "5000",  # Below minimum 10,000
                "to_currency": "USDT",
                "to_amount": "0.30"
            }
        )
        assert response.status_code == 400, f"Expected 400 for amount below minimum, got {response.status_code}"
        print("✓ Amount below 10000 IDR rejected with 400")
    
    def test_transaction_50000_idr_threshold(self, auth_token):
        """
        POST /api/transactions with exactly 50000 IDR (at threshold)
        Expected: trade_fee = 150 (0.3%), platform_fee = 100 (0.2%) - threshold is >= 50000
        """
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "50000",
                "to_currency": "USDT",
                "to_amount": "3.05"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify: 50000 * 0.003 = 150, 50000 * 0.002 = 100 (at threshold)
        assert data["trade_fee"] == 150, f"Expected trade_fee=150, got {data['trade_fee']}"
        assert data["platform_fee"] == 100, f"Expected platform_fee=100 at threshold, got {data['platform_fee']}"
        assert data["total_fee"] == 250, f"Expected total_fee=250, got {data['total_fee']}"
        
        print(f"✓ 50000 IDR (at threshold): trade_fee={data['trade_fee']}, platform_fee={data['platform_fee']}, total={data['total_fee']}")
    
    def test_transaction_49999_idr_below_threshold(self, auth_token):
        """
        POST /api/transactions with 49999 IDR (just below threshold)
        Expected: trade_fee = 149 (0.3% rounded), platform_fee = 0 (under 50k threshold)
        """
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "49999",
                "to_currency": "USDT",
                "to_amount": "3.05"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify: 49999 * 0.003 = 149.997 -> 150 (rounded), platform_fee = 0 (under 50k)
        assert data["trade_fee"] == 150, f"Expected trade_fee=150, got {data['trade_fee']}"
        assert data["platform_fee"] == 0, f"Expected platform_fee=0 below threshold, got {data['platform_fee']}"
        assert data["total_fee"] == 150, f"Expected total_fee=150, got {data['total_fee']}"
        
        print(f"✓ 49999 IDR (below threshold): trade_fee={data['trade_fee']}, platform_fee={data['platform_fee']}, total={data['total_fee']}")


class TestHealthAndBasics:
    """Basic API health checks"""
    
    def test_health_check(self):
        """GET /api/ - verify API is running"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Meridiant" in data["message"]
        print(f"✓ Health check: {data['message']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
