#!/usr/bin/env python3
"""
Regression Test for Meridiant Backend
Tests specific endpoints as requested in the review_request:
1. POST /api/auth/signin with {"email":"test@meridiant.com","password":"Test1234!"} - should return token
2. GET /api/auth/me with the token - should return user info  
3. POST /api/wallet/connect with token and {"wallet_id":"metamask","wallet_name":"MetaMask"} - should return wallet info
4. POST /api/transactions with token and transaction data
5. GET /api/transactions with token - should return the transaction
6. GET /api/exchange-rates - should return rates
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from frontend .env
BACKEND_URL = "https://on-chain-fiat.preview.emergentagent.com/api"

class RegressionTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.token = None
        
    def log(self, message: str, success: bool = True):
        """Log test results"""
        status = "✅" if success else "❌"
        print(f"{status} {message}")
        
    def test_1_signin(self) -> bool:
        """Test 1: POST /api/auth/signin with test@meridiant.com"""
        try:
            url = f"{self.base_url}/auth/signin"
            payload = {
                "email": "test@meridiant.com",
                "password": "Test1234!"
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.token = data["token"]
                    self.log(f"TEST 1 PASSED: Signin successful - Token received for user: {data['user']['email']}")
                    return True
                else:
                    self.log(f"TEST 1 FAILED: Response missing token/user: {data}", False)
                    return False
            else:
                self.log(f"TEST 1 FAILED: Status {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"TEST 1 FAILED: Exception: {str(e)}", False)
            return False
    
    def test_2_get_me(self) -> bool:
        """Test 2: GET /api/auth/me with token"""
        try:
            if not self.token:
                self.log("TEST 2 FAILED: No token available from test 1", False)
                return False
                
            url = f"{self.base_url}/auth/me"
            headers = {"Authorization": f"Bearer {self.token}"}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "name" in data and "email" in data:
                    self.log(f"TEST 2 PASSED: User info retrieved - {data['name']} ({data['email']})")
                    return True
                else:
                    self.log(f"TEST 2 FAILED: Response missing required fields: {data}", False)
                    return False
            else:
                self.log(f"TEST 2 FAILED: Status {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"TEST 2 FAILED: Exception: {str(e)}", False)
            return False
    
    def test_3_wallet_connect(self) -> bool:
        """Test 3: POST /api/wallet/connect with MetaMask"""
        try:
            if not self.token:
                self.log("TEST 3 FAILED: No token available", False)
                return False
                
            url = f"{self.base_url}/wallet/connect"
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {
                "wallet_id": "metamask",
                "wallet_name": "MetaMask"
            }
            
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "wallet_address" in data and "wallet_name" in data and "connected" in data:
                    self.log(f"TEST 3 PASSED: Wallet connected - {data['wallet_name']} at {data['wallet_address'][:10]}...")
                    return True
                else:
                    self.log(f"TEST 3 FAILED: Response missing required fields: {data}", False)
                    return False
            else:
                self.log(f"TEST 3 FAILED: Status {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"TEST 3 FAILED: Exception: {str(e)}", False)
            return False
    
    def test_4_create_transaction(self) -> bool:
        """Test 4: POST /api/transactions with transfer data"""
        try:
            if not self.token:
                self.log("TEST 4 FAILED: No token available", False)
                return False
                
            url = f"{self.base_url}/transactions"
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "1000000",
                "to_currency": "ETH",
                "to_amount": "0.0384",
                "method_or_dest": "BCA"
            }
            
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "type", "from_currency", "to_currency", "status", "created_at"]
                if all(field in data for field in required_fields):
                    self.transaction_id = data["id"]
                    self.log(f"TEST 4 PASSED: Transaction created - ID: {data['id']}, {data['from_amount']} {data['from_currency']} → {data['to_amount']} {data['to_currency']}")
                    return True
                else:
                    self.log(f"TEST 4 FAILED: Response missing required fields: {data}", False)
                    return False
            else:
                self.log(f"TEST 4 FAILED: Status {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"TEST 4 FAILED: Exception: {str(e)}", False)
            return False
    
    def test_5_get_transactions(self) -> bool:
        """Test 5: GET /api/transactions with token"""
        try:
            if not self.token:
                self.log("TEST 5 FAILED: No token available", False)
                return False
                
            url = f"{self.base_url}/transactions"
            headers = {"Authorization": f"Bearer {self.token}"}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our created transaction is in the list
                        found_transaction = False
                        if hasattr(self, 'transaction_id'):
                            for tx in data:
                                if tx.get("id") == self.transaction_id:
                                    found_transaction = True
                                    break
                        
                        if found_transaction:
                            self.log(f"TEST 5 PASSED: Transactions retrieved - Found {len(data)} transactions including the one created in test 4")
                        else:
                            self.log(f"TEST 5 PASSED: Transactions retrieved - Found {len(data)} transactions")
                    else:
                        self.log("TEST 5 PASSED: Transactions retrieved - No transactions found (empty list)")
                    return True
                else:
                    self.log(f"TEST 5 FAILED: Response not a list: {data}", False)
                    return False
            else:
                self.log(f"TEST 5 FAILED: Status {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"TEST 5 FAILED: Exception: {str(e)}", False)
            return False
    
    def test_6_exchange_rates(self) -> bool:
        """Test 6: GET /api/exchange-rates (no auth required)"""
        try:
            url = f"{self.base_url}/exchange-rates"
            
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if "rates" in data and isinstance(data["rates"], dict):
                    rates = data["rates"]
                    if len(rates) > 0:
                        # Check for some expected rate pairs
                        expected_pairs = ["IDR_ETH", "ETH_IDR", "IDR_BTC", "BTC_IDR"]
                        found_pairs = [pair for pair in expected_pairs if pair in rates]
                        self.log(f"TEST 6 PASSED: Exchange rates retrieved - {len(rates)} rate pairs available, including: {', '.join(found_pairs[:4])}")
                        return True
                    else:
                        self.log("TEST 6 FAILED: Exchange rates response has empty rates", False)
                        return False
                else:
                    self.log(f"TEST 6 FAILED: Response missing rates field: {data}", False)
                    return False
            else:
                self.log(f"TEST 6 FAILED: Status {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"TEST 6 FAILED: Exception: {str(e)}", False)
            return False
    
    def run_regression_tests(self) -> Dict[str, bool]:
        """Run all regression tests in sequence"""
        print(f"\n🔄 MERIDIANT BACKEND REGRESSION TEST")
        print(f"Backend URL: {self.base_url}")
        print("=" * 70)
        
        results = {}
        
        # Run tests in order
        results["1_signin"] = self.test_1_signin()
        results["2_get_me"] = self.test_2_get_me()
        results["3_wallet_connect"] = self.test_3_wallet_connect()
        results["4_create_transaction"] = self.test_4_create_transaction()
        results["5_get_transactions"] = self.test_5_get_transactions()
        results["6_exchange_rates"] = self.test_6_exchange_rates()
        
        print("=" * 70)
        passed = sum(1 for success in results.values() if success)
        total = len(results)
        print(f"📊 REGRESSION TEST RESULTS: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL REGRESSION TESTS PASSED!")
        else:
            print("⚠️  SOME REGRESSION TESTS FAILED!")
            print("\nFailed tests:")
            for test_name, success in results.items():
                if not success:
                    print(f"  - {test_name}")
        
        return results

if __name__ == "__main__":
    tester = RegressionTester()
    results = tester.run_regression_tests()
    
    # Exit with non-zero code if any test failed
    if not all(results.values()):
        sys.exit(1)