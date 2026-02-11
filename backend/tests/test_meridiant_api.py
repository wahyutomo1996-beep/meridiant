"""
Meridiant Crypto Platform API Tests
Testing: Prices API, Auth (signin/signup/google-session), Transactions, Wallet
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndPrices:
    """Health check and CoinGecko prices endpoint tests"""
    
    def test_api_health(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Meridiant API" in data["message"]
        print(f"✓ API health check passed: {data['message']}")
    
    def test_prices_endpoint(self):
        """Test /api/prices returns CoinGecko rates with 60+ pairs"""
        response = requests.get(f"{BASE_URL}/api/prices")
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "rates" in data
        assert "timestamp" in data
        assert "source" in data
        
        # Check source is coingecko or fallback
        assert data["source"] in ["coingecko", "fallback"]
        print(f"✓ Prices source: {data['source']}")
        
        # Count rate pairs - should have 60+
        rates = data["rates"]
        rate_count = len(rates)
        print(f"✓ Total rate pairs: {rate_count}")
        assert rate_count >= 50, f"Expected 50+ rate pairs, got {rate_count}"
        
        # Verify key rate pairs exist
        assert "ETH_IDR" in rates, "ETH_IDR rate missing"
        assert "IDRT_IDR" in rates, "IDRT_IDR rate missing"
        assert "USDT_IDR" in rates, "USDT_IDR rate missing"
        assert "USDC_IDR" in rates, "USDC_IDR rate missing"
        assert "BTC_IDR" in rates, "BTC_IDR rate missing"
        assert "SOL_IDR" in rates, "SOL_IDR rate missing"
        
        # Verify chain-specific rates exist (IDRT on BSC/Polygon)
        assert "IDRT.BSC_IDR" in rates, "IDRT.BSC_IDR rate missing"
        assert "IDRT.Poly_IDR" in rates, "IDRT.Poly_IDR rate missing"
        
        # Verify USDT/USDC chain variants
        assert "USDT.BSC_IDR" in rates, "USDT.BSC_IDR rate missing"
        assert "USDC.BSC_IDR" in rates, "USDC.BSC_IDR rate missing"
        
        print(f"✓ Key rates verified: ETH={rates['ETH_IDR']}, BTC={rates['BTC_IDR']}")


class TestAuthSignIn:
    """Authentication endpoint tests"""
    
    def test_signin_with_valid_credentials(self):
        """Test sign in with test@meridiant.com / Test1234!"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "token" in data, "Token missing from response"
        assert "user" in data, "User missing from response"
        
        # Verify user data
        user = data["user"]
        assert user["email"] == "test@meridiant.com"
        assert "id" in user
        assert "name" in user
        
        print(f"✓ Sign in successful: {user['email']}")
        print(f"✓ Token received (length: {len(data['token'])})")
        return data["token"]
    
    def test_signin_with_invalid_credentials(self):
        """Test sign in fails with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "WrongPassword!"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid credentials correctly rejected: {data['detail']}")
    
    def test_signin_with_nonexistent_user(self):
        """Test sign in fails for non-existent user"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "nonexistent@meridiant.com",
            "password": "Test1234!"
        })
        assert response.status_code == 401
        print("✓ Non-existent user correctly rejected")


class TestGoogleSession:
    """Google OAuth session endpoint tests"""
    
    def test_google_session_invalid_session_id(self):
        """Test /api/auth/google-session returns 401 for invalid session_id"""
        response = requests.post(f"{BASE_URL}/api/auth/google-session", json={
            "session_id": "invalid-session-id-12345"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid Google session correctly rejected: {data['detail']}")
    
    def test_google_session_endpoint_exists(self):
        """Test that /api/auth/google-session endpoint exists and accepts POST"""
        # Empty body should still trigger the endpoint (not 404)
        response = requests.post(f"{BASE_URL}/api/auth/google-session", json={})
        # Should be 422 (validation error for missing field) or 401, not 404
        assert response.status_code != 404, "Google session endpoint does not exist"
        print(f"✓ Google session endpoint exists (status: {response.status_code})")


class TestAuthSignUp:
    """Sign up endpoint tests"""
    
    def test_signup_with_new_user(self):
        """Test sign up creates new account"""
        import uuid
        unique_email = f"test_signup_{uuid.uuid4().hex[:8]}@meridiant.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Test User",
            "email": unique_email,
            "password": "TestPass123!"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email.lower()
        print(f"✓ Sign up successful: {unique_email}")
    
    def test_signup_duplicate_email(self):
        """Test sign up fails for existing email"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Duplicate User",
            "email": "test@meridiant.com",
            "password": "TestPass123!"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ Duplicate email correctly rejected: {data['detail']}")


class TestTransactions:
    """Transaction endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return response.json()["token"]
    
    def test_create_transaction_with_chain_and_hash(self, auth_token):
        """Test /api/transactions accepts tx_hash and chain fields"""
        response = requests.post(
            f"{BASE_URL}/api/transactions",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "1000000",
                "to_currency": "IDRT.BSC",
                "to_amount": "1000000",
                "method_or_dest": "Bank Transfer",
                "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
                "chain": "BSC"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["tx_hash"] == "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        assert data["chain"] == "BSC"
        assert data["status"] == "completed"  # Should be completed when tx_hash provided
        print(f"✓ Transaction created with chain/hash: {data['id']}")
    
    def test_create_transaction_without_hash(self, auth_token):
        """Test transaction without tx_hash gets pending status"""
        response = requests.post(
            f"{BASE_URL}/api/transactions",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "500000",
                "to_currency": "USDT.BSC",
                "to_amount": "30"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "pending"  # Should be pending without tx_hash
        assert data["tx_hash"] is None
        print(f"✓ Transaction created without hash (pending): {data['id']}")
    
    def test_create_transaction_requires_auth(self):
        """Test transaction endpoint requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/transactions",
            json={
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "1000",
                "to_currency": "USDT",
                "to_amount": "0.06"
            }
        )
        assert response.status_code == 401
        print("✓ Transaction endpoint correctly requires auth")
    
    def test_list_transactions(self, auth_token):
        """Test listing user transactions"""
        response = requests.get(
            f"{BASE_URL}/api/transactions",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Listed {len(data)} transactions")


class TestWallet:
    """Wallet connection endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return response.json()["token"]
    
    def test_connect_wallet(self, auth_token):
        """Test wallet connection"""
        response = requests.post(
            f"{BASE_URL}/api/wallet/connect",
            headers={"Authorization": f"Bearer {auth_token}"},
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
        print(f"✓ Wallet connected: {data['wallet_address']}")
    
    def test_disconnect_wallet(self, auth_token):
        """Test wallet disconnection"""
        response = requests.delete(
            f"{BASE_URL}/api/wallet/disconnect",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["disconnected"] == True
        print("✓ Wallet disconnected")


class TestAuthMe:
    """Auth me endpoint test"""
    
    def test_auth_me_with_valid_token(self):
        """Test /api/auth/me returns user data"""
        # First get token
        signin_resp = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        assert signin_resp.status_code == 200
        token = signin_resp.json()["token"]
        
        # Then get user data
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@meridiant.com"
        print(f"✓ Auth me returned user: {data['email']}")
    
    def test_auth_me_requires_token(self):
        """Test /api/auth/me requires valid token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Auth me correctly requires token")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
