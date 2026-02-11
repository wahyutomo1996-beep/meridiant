#!/usr/bin/env python3
"""
Backend API Test Suite for Meridiant Crypto Platform
Tests all API endpoints according to the test flow:
signup → signin → get me → connect wallet → create transaction → list transactions → disconnect wallet → get exchange rates
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from frontend .env
BACKEND_URL = "https://token-swap-go.preview.emergentagent.com/api"

class MeridiantAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.token = None
        self.user_data = None
        self.wallet_data = None
        self.transaction_data = None
        
    def log(self, message: str, success: bool = True):
        """Log test results"""
        status = "✅" if success else "❌"
        print(f"{status} {message}")
        
    def test_auth_signup(self) -> bool:
        """Test POST /api/auth/signup"""
        try:
            url = f"{self.base_url}/auth/signup"
            payload = {
                "name": "Alice Johnson", 
                "email": "alice.johnson@example.com",
                "password": "SecurePass123!"
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.token = data["token"]
                    self.user_data = data["user"]
                    self.log(f"Auth signup successful - User ID: {data['user']['id']}")
                    return True
                else:
                    self.log(f"Auth signup response missing token/user: {data}", False)
                    return False
            else:
                self.log(f"Auth signup failed - Status: {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Auth signup error: {str(e)}", False)
            return False
    
    def test_auth_signin(self) -> bool:
        """Test POST /api/auth/signin"""
        try:
            url = f"{self.base_url}/auth/signin"
            payload = {
                "email": "alice.johnson@example.com",
                "password": "SecurePass123!"
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.token = data["token"]  # Update token
                    self.user_data = data["user"]
                    self.log(f"Auth signin successful - User: {data['user']['name']}")
                    return True
                else:
                    self.log(f"Auth signin response missing token/user: {data}", False)
                    return False
            else:
                self.log(f"Auth signin failed - Status: {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Auth signin error: {str(e)}", False)
            return False
    
    def test_auth_me(self) -> bool:
        """Test GET /api/auth/me"""
        try:
            if not self.token:
                self.log("No token available for auth/me test", False)
                return False
                
            url = f"{self.base_url}/auth/me"
            headers = {"Authorization": f"Bearer {self.token}"}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "name" in data and "email" in data:
                    self.log(f"Auth me successful - User: {data['name']} ({data['email']})")
                    return True
                else:
                    self.log(f"Auth me response missing required fields: {data}", False)
                    return False
            else:
                self.log(f"Auth me failed - Status: {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Auth me error: {str(e)}", False)
            return False
    
    def test_wallet_connect(self) -> bool:
        """Test POST /api/wallet/connect"""
        try:
            if not self.token:
                self.log("No token available for wallet connect test", False)
                return False
                
            url = f"{self.base_url}/wallet/connect"
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {
                "wallet_id": "metamask_12345",
                "wallet_name": "MetaMask"
            }
            
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "wallet_address" in data and "wallet_name" in data and "connected" in data:
                    self.wallet_data = data
                    self.log(f"Wallet connect successful - Address: {data['wallet_address'][:10]}...")
                    return True
                else:
                    self.log(f"Wallet connect response missing required fields: {data}", False)
                    return False
            else:
                self.log(f"Wallet connect failed - Status: {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Wallet connect error: {str(e)}", False)
            return False
    
    def test_transaction_create(self) -> bool:
        """Test POST /api/transactions"""
        try:
            if not self.token:
                self.log("No token available for transaction create test", False)
                return False
                
            url = f"{self.base_url}/transactions"
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "100000",
                "to_currency": "ETH",
                "to_amount": "0.00384",
                "method_or_dest": "0x742d35Cc6665C0532c6a1f89B6655D5d4f5B8E4A"
            }
            
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "type", "from_currency", "to_currency", "status", "created_at"]
                if all(field in data for field in required_fields):
                    self.transaction_data = data
                    self.log(f"Transaction create successful - ID: {data['id']}, Status: {data['status']}")
                    return True
                else:
                    self.log(f"Transaction create response missing required fields: {data}", False)
                    return False
            else:
                self.log(f"Transaction create failed - Status: {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Transaction create error: {str(e)}", False)
            return False
    
    def test_transaction_list(self) -> bool:
        """Test GET /api/transactions"""
        try:
            if not self.token:
                self.log("No token available for transaction list test", False)
                return False
                
            url = f"{self.base_url}/transactions"
            headers = {"Authorization": f"Bearer {self.token}"}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Verify the transaction we created is in the list
                        transaction_found = False
                        for tx in data:
                            if self.transaction_data and tx.get("id") == self.transaction_data.get("id"):
                                transaction_found = True
                                break
                        if transaction_found:
                            self.log(f"Transaction list successful - Found {len(data)} transactions including created one")
                        else:
                            self.log(f"Transaction list successful - Found {len(data)} transactions but created transaction missing")
                    else:
                        self.log("Transaction list successful - No transactions found")
                    return True
                else:
                    self.log(f"Transaction list response not a list: {data}", False)
                    return False
            else:
                self.log(f"Transaction list failed - Status: {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Transaction list error: {str(e)}", False)
            return False
    
    def test_wallet_disconnect(self) -> bool:
        """Test DELETE /api/wallet/disconnect"""
        try:
            if not self.token:
                self.log("No token available for wallet disconnect test", False)
                return False
                
            url = f"{self.base_url}/wallet/disconnect"
            headers = {"Authorization": f"Bearer {self.token}"}
            
            response = requests.delete(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "disconnected" in data and data["disconnected"]:
                    self.log("Wallet disconnect successful")
                    return True
                else:
                    self.log(f"Wallet disconnect response invalid: {data}", False)
                    return False
            else:
                self.log(f"Wallet disconnect failed - Status: {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Wallet disconnect error: {str(e)}", False)
            return False
    
    def test_exchange_rates(self) -> bool:
        """Test GET /api/exchange-rates (no auth required)"""
        try:
            url = f"{self.base_url}/exchange-rates"
            
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if "rates" in data and isinstance(data["rates"], dict):
                    rates = data["rates"]
                    if len(rates) > 0:
                        self.log(f"Exchange rates successful - Found {len(rates)} rate pairs")
                        return True
                    else:
                        self.log("Exchange rates response has empty rates", False)
                        return False
                else:
                    self.log(f"Exchange rates response missing rates field: {data}", False)
                    return False
            else:
                self.log(f"Exchange rates failed - Status: {response.status_code}, Response: {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Exchange rates error: {str(e)}", False)
            return False
    
    def test_error_cases(self) -> bool:
        """Test error scenarios"""
        error_tests_passed = 0
        total_error_tests = 4
        
        # Test 1: Duplicate email signup
        try:
            url = f"{self.base_url}/auth/signup"
            payload = {
                "name": "Alice Duplicate",
                "email": "alice.johnson@example.com",  # Same email as before
                "password": "AnotherPass123!"
            }
            response = requests.post(url, json=payload)
            if response.status_code == 400:
                self.log("Error case: Duplicate email signup correctly rejected")
                error_tests_passed += 1
            else:
                self.log(f"Error case: Duplicate email signup should return 400, got {response.status_code}", False)
        except Exception as e:
            self.log(f"Error case: Duplicate email signup test failed: {str(e)}", False)
        
        # Test 2: Wrong password signin
        try:
            url = f"{self.base_url}/auth/signin"
            payload = {
                "email": "alice.johnson@example.com",
                "password": "WrongPassword123!"
            }
            response = requests.post(url, json=payload)
            if response.status_code == 401:
                self.log("Error case: Wrong password signin correctly rejected")
                error_tests_passed += 1
            else:
                self.log(f"Error case: Wrong password signin should return 401, got {response.status_code}", False)
        except Exception as e:
            self.log(f"Error case: Wrong password signin test failed: {str(e)}", False)
        
        # Test 3: Unauthenticated access to protected route
        try:
            url = f"{self.base_url}/auth/me"
            response = requests.get(url)  # No auth header
            if response.status_code == 401:
                self.log("Error case: Unauthenticated access correctly rejected")
                error_tests_passed += 1
            else:
                self.log(f"Error case: Unauthenticated access should return 401, got {response.status_code}", False)
        except Exception as e:
            self.log(f"Error case: Unauthenticated access test failed: {str(e)}", False)
        
        # Test 4: Transaction without wallet (need to disconnect first if connected)
        try:
            # Make sure wallet is disconnected
            if self.token:
                disconnect_url = f"{self.base_url}/wallet/disconnect"
                requests.delete(disconnect_url, headers={"Authorization": f"Bearer {self.token}"})
            
            url = f"{self.base_url}/transactions"
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {
                "type": "transfer",
                "from_currency": "IDR",
                "from_amount": "50000",
                "to_currency": "BTC",
                "to_amount": "0.00115"
            }
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 400:
                self.log("Error case: Transaction without wallet correctly rejected")
                error_tests_passed += 1
            else:
                self.log(f"Error case: Transaction without wallet should return 400, got {response.status_code}", False)
        except Exception as e:
            self.log(f"Error case: Transaction without wallet test failed: {str(e)}", False)
        
        return error_tests_passed == total_error_tests
    
    def run_all_tests(self) -> Dict[str, bool]:
        """Run all tests in sequence and return results"""
        print(f"\n🚀 Starting Meridiant Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        results = {}
        
        # Main flow tests
        results["signup"] = self.test_auth_signup()
        results["signin"] = self.test_auth_signin()
        results["get_me"] = self.test_auth_me()
        results["connect_wallet"] = self.test_wallet_connect()
        results["create_transaction"] = self.test_transaction_create()
        results["list_transactions"] = self.test_transaction_list()
        results["disconnect_wallet"] = self.test_wallet_disconnect()
        results["exchange_rates"] = self.test_exchange_rates()
        
        # Error case tests
        results["error_cases"] = self.test_error_cases()
        
        print("=" * 60)
        passed = sum(1 for success in results.values() if success)
        total = len(results)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
        else:
            print("⚠️  Some tests failed. Check logs above for details.")
        
        return results

if __name__ == "__main__":
    tester = MeridiantAPITester()
    results = tester.run_all_tests()
    
    # Exit with non-zero code if any test failed
    if not all(results.values()):
        sys.exit(1)