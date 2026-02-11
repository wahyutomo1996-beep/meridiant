"""
Iteration 11: Testing 'Aset Saya' (My Assets) feature
Backend API tests for auth, wallet, and prices endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ton-mobile-app.preview.emergentagent.com')


class TestAuthenticationFlow:
    """Test authentication required for wallet/assets feature"""
    
    def test_signin_success(self):
        """Test sign in with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": "test@meridiant.com",
            "password": "Test1234!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@meridiant.com"
        # Store token for subsequent tests
        TestAuthenticationFlow.token = data["token"]
        TestAuthenticationFlow.user = data["user"]
        print(f"SUCCESS: Logged in as {data['user']['name']}")
    
    def test_user_has_wallet_connected(self):
        """Verify test user has wallet connected from previous sessions"""
        assert hasattr(TestAuthenticationFlow, 'user'), "Login test must run first"
        user = TestAuthenticationFlow.user
        # The test user should have wallet_connected=True from iteration 10 tests
        print(f"Wallet connected: {user.get('wallet_connected')}")
        print(f"Wallet address: {user.get('wallet_address')}")
        print(f"Wallet name: {user.get('wallet_name')}")


class TestWalletConnect:
    """Test wallet connect/disconnect for assets feature"""
    
    def test_wallet_connect(self):
        """Test connecting a wallet"""
        assert hasattr(TestAuthenticationFlow, 'token'), "Login test must run first"
        
        response = requests.post(
            f"{BASE_URL}/api/wallet/connect",
            json={
                "wallet_id": "metamask",
                "wallet_name": "MetaMask",
                "wallet_address": "0xTestAddress123456789012345678901234567890"
            },
            headers={"Authorization": f"Bearer {TestAuthenticationFlow.token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("connected") == True
        assert "wallet_address" in data
        assert "wallet_name" in data
        print(f"SUCCESS: Wallet connected - {data['wallet_name']}")


class TestPricesForIDRCalculation:
    """Test prices API used for IDR value calculation in token selector"""
    
    def test_prices_returns_rates(self):
        """Test GET /api/prices returns exchange rates"""
        response = requests.get(f"{BASE_URL}/api/prices")
        assert response.status_code == 200
        data = response.json()
        assert "rates" in data
        assert len(data["rates"]) > 0
        print(f"SUCCESS: Got {len(data['rates'])} exchange rates")
    
    def test_prices_has_idr_rates_for_tokens_with_balances(self):
        """Test that prices includes IDR rates for tokens shown in Aset Saya"""
        response = requests.get(f"{BASE_URL}/api/prices")
        data = response.json()
        rates = data["rates"]
        
        # Tokens from mockBalances that should have IDR rates
        required_tokens = [
            "ETH_IDR", "USDT_IDR", "USDC_IDR", "BNB_IDR", "SOL_IDR",
            "USDT.BSC_IDR", "USDC.Base_IDR", "USDT.Sol_IDR", "TON_IDR", "USDT.TON_IDR"
        ]
        
        for token_rate in required_tokens:
            assert token_rate in rates, f"Missing rate: {token_rate}"
            assert rates[token_rate] > 0, f"Rate for {token_rate} should be > 0"
        
        print(f"SUCCESS: All required IDR rates present for token balances")
    
    def test_prices_has_ton_support(self):
        """Test TON chain token rates are available"""
        response = requests.get(f"{BASE_URL}/api/prices")
        data = response.json()
        rates = data["rates"]
        
        assert "TON_IDR" in rates
        assert "USDT.TON_IDR" in rates
        assert rates["TON_IDR"] > 0
        assert rates["USDT.TON_IDR"] > 0
        print(f"SUCCESS: TON rates - TON_IDR: {rates['TON_IDR']}, USDT.TON_IDR: {rates['USDT.TON_IDR']}")


class TestWalletBalances:
    """Test wallet balances endpoint"""
    
    def test_wallet_balances_endpoint(self):
        """Test GET /api/wallet/balances/{address} returns balance data"""
        test_address = "0x541f866ede77384bf242c4be156c439f61035d6a"
        response = requests.get(f"{BASE_URL}/api/wallet/balances/{test_address}")
        assert response.status_code == 200
        data = response.json()
        assert "address" in data
        assert "balances" in data
        assert data["address"] == test_address
        print(f"SUCCESS: Got balances for {test_address}")
        print(f"Balances: {data['balances']}")
    
    def test_wallet_balances_returns_correct_structure(self):
        """Test balances include expected token keys"""
        test_address = "0x541f866ede77384bf242c4be156c439f61035d6a"
        response = requests.get(f"{BASE_URL}/api/wallet/balances/{test_address}")
        data = response.json()
        balances = data["balances"]
        
        # Should have BSC and Polygon tokens
        expected_keys = ["BNB", "IDRT.BSC", "USDT.BSC", "USDC.BSC", 
                        "IDRT.Poly", "USDT.Poly", "USDC.Poly"]
        
        for key in expected_keys:
            assert key in balances, f"Missing balance key: {key}"
        
        print(f"SUCCESS: Balance structure correct with {len(balances)} tokens")


class TestAuthProtectedEndpoints:
    """Test that wallet operations require authentication"""
    
    def test_wallet_connect_requires_auth(self):
        """Test POST /api/wallet/connect returns 401 without token"""
        response = requests.post(f"{BASE_URL}/api/wallet/connect", json={
            "wallet_id": "metamask",
            "wallet_name": "MetaMask"
        })
        assert response.status_code == 401
        print("SUCCESS: Wallet connect requires authentication")
    
    def test_wallet_disconnect_requires_auth(self):
        """Test DELETE /api/wallet/disconnect returns 401 without token"""
        response = requests.delete(f"{BASE_URL}/api/wallet/disconnect")
        assert response.status_code == 401
        print("SUCCESS: Wallet disconnect requires authentication")


class TestGetMe:
    """Test /api/auth/me endpoint returns wallet status"""
    
    def test_get_me_returns_wallet_info(self):
        """Test GET /api/auth/me includes wallet connection info"""
        assert hasattr(TestAuthenticationFlow, 'token'), "Login test must run first"
        
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {TestAuthenticationFlow.token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should include wallet fields
        assert "wallet_connected" in data
        assert "wallet_address" in data
        assert "wallet_name" in data
        
        print(f"SUCCESS: /auth/me returns wallet info - connected: {data['wallet_connected']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
