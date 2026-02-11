"""
Iteration 6 Backend Tests - Minimum Amount Validation & Transaction API
Tests: POST /api/transactions with MIN_AMOUNT_IDR validation (10,000 IDR)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMinimumAmountValidation:
    """Test minimum purchase validation for IDR transfers"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        assert response.status_code == 200, f"Auth failed: {response.text}"
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_reject_amount_below_minimum(self):
        """POST /api/transactions rejects amount below Rp 10,000 for IDR transfers"""
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=self.headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "5000",  # Below minimum
                "to_currency": "IDRT",
                "to_amount": "5000"
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "Minimum" in data.get("detail", "") or "10" in data.get("detail", ""), f"Expected minimum error message, got: {data}"
        print("PASSED: Amount below 10000 IDR correctly rejected with 400")
    
    def test_accept_amount_at_minimum(self):
        """POST /api/transactions accepts amount Rp 10,000 for IDR transfers"""
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=self.headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "10000",  # At minimum
                "to_currency": "IDRT",
                "to_amount": "10000"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data, "Transaction ID should be in response"
        assert data["from_amount"] == "10000"
        print(f"PASSED: Transaction created with ID {data['id']}")
    
    def test_accept_amount_above_minimum(self):
        """POST /api/transactions accepts amount Rp 50,000 for IDR transfers"""
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=self.headers,
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "50000",  # Above minimum
                "to_currency": "USDT",
                "to_amount": "3.05"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["type"] == "transfer"
        assert data["from_currency"] == "IDR"
        print(f"PASSED: Transaction created for 50000 IDR")
    
    def test_non_idr_transfer_no_minimum(self):
        """POST /api/transactions allows non-IDR transfers without minimum check"""
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=self.headers,
            json={
                "type": "transfer",
                "from_currency": "USDT",  # Not IDR
                "from_amount": "1",  # Low amount
                "to_currency": "IDR",
                "to_amount": "16400"
            }
        )
        # Should succeed since from_currency is not IDR
        assert response.status_code == 200, f"Expected 200 for non-IDR transfer, got {response.status_code}: {response.text}"
        print("PASSED: Non-IDR transfer with low amount allowed")
    
    def test_withdraw_no_idr_minimum_check(self):
        """Withdraw type should not trigger IDR minimum for from_currency=crypto"""
        response = requests.post(f"{BASE_URL}/api/transactions", 
            headers=self.headers,
            json={
                "type": "withdraw",  # Withdraw type
                "from_currency": "IDRT",
                "from_amount": "1000",  # Low amount, but from_currency is crypto
                "to_currency": "IDR",
                "to_amount": "1000"
            }
        )
        assert response.status_code == 200, f"Expected 200 for withdraw, got {response.status_code}: {response.text}"
        print("PASSED: Withdraw with low crypto amount allowed")


class TestAuthEndpoints:
    """Test existing auth endpoints still work"""
    
    def test_signin_success(self):
        """POST /api/auth/signin works with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@meridiant.com"
        print("PASSED: signin endpoint working")
    
    def test_signin_invalid_credentials(self):
        """POST /api/auth/signin rejects invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("PASSED: Invalid credentials correctly rejected")
    
    def test_signup_duplicate_email(self):
        """POST /api/auth/signup rejects duplicate email"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Test",
            "email": "test@meridiant.com",  # Already exists
            "password": "Test1234!"
        })
        assert response.status_code == 400
        print("PASSED: Duplicate email correctly rejected")


class TestHealthAndPrices:
    """Test health and price endpoints"""
    
    def test_api_root(self):
        """GET /api/ returns health check"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("PASSED: API health check working")
    
    def test_prices_endpoint(self):
        """GET /api/prices returns exchange rates"""
        response = requests.get(f"{BASE_URL}/api/prices")
        assert response.status_code == 200
        data = response.json()
        assert "rates" in data
        assert "IDR_IDRT" in data["rates"]
        print(f"PASSED: Prices endpoint working, source: {data.get('source', 'unknown')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
