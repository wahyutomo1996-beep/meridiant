"""
Meridiant Crypto Platform - Iteration 5 Tests
Testing NEW features: AI Chatbot, Admin Dashboard, Telegram Config
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@meridiant.com"
ADMIN_PASSWORD = "Admin1234!"

# Non-admin credentials
TEST_EMAIL = "test@meridiant.com"
TEST_PASSWORD = "Test1234!"


class TestChatbotEndpoint:
    """AI Chatbot /api/chat endpoint tests"""
    
    def test_chat_endpoint_exists(self):
        """Test POST /api/chat endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/chat", json={"message": "test"})
        assert response.status_code != 404, "Chat endpoint does not exist"
        print(f"✓ Chat endpoint exists (status: {response.status_code})")
    
    def test_chat_with_message(self):
        """Test /api/chat returns AI reply for a message"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "Halo, apa itu Meridiant?"
        })
        assert response.status_code == 200, f"Chat failed with status {response.status_code}"
        data = response.json()
        
        # Check response structure
        assert "reply" in data, "Reply missing from response"
        assert "session_id" in data, "Session ID missing from response"
        
        # Verify reply is not empty
        assert len(data["reply"]) > 0, "Reply is empty"
        
        print(f"✓ Chat response received (length: {len(data['reply'])})")
        print(f"✓ Session ID: {data['session_id']}")
        return data["session_id"]
    
    def test_chat_session_continuity(self):
        """Test /api/chat maintains conversation via session_id"""
        # First message - get session_id
        resp1 = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "Apa token yang didukung?"
        })
        assert resp1.status_code == 200
        session_id = resp1.json()["session_id"]
        
        # Second message - use same session_id
        resp2 = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "Bagaimana cara transfernya?",
            "session_id": session_id
        })
        assert resp2.status_code == 200
        data2 = resp2.json()
        
        # Session ID should remain the same
        assert data2["session_id"] == session_id, "Session ID changed unexpectedly"
        assert "reply" in data2, "Reply missing from continued conversation"
        
        print(f"✓ Session continuity maintained: {session_id}")
        print(f"✓ Reply for continued conversation received")
    
    def test_chat_empty_message(self):
        """Test /api/chat handles empty message gracefully"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": ""
        })
        # Should either reject with 422 or return a helpful response
        assert response.status_code in [200, 422], f"Unexpected status: {response.status_code}"
        print(f"✓ Empty message handled (status: {response.status_code})")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_signin(self):
        """Test admin can sign in"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin signin failed: {response.text}"
        data = response.json()
        
        assert "token" in data, "Token missing"
        assert data["user"]["email"] == ADMIN_EMAIL
        
        print(f"✓ Admin signin successful: {ADMIN_EMAIL}")
        return data["token"]


class TestAdminStats:
    """Admin stats endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate as admin")
        return response.json()["token"]
    
    @pytest.fixture
    def non_admin_token(self):
        """Get non-admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate as non-admin")
        return response.json()["token"]
    
    def test_admin_stats_requires_auth(self):
        """Test /api/admin/stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, "Should require auth"
        print("✓ Admin stats requires authentication")
    
    def test_admin_stats_requires_admin_role(self, non_admin_token):
        """Test /api/admin/stats returns 403 for non-admin user"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {non_admin_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Non-admin correctly rejected: {data['detail']}")
    
    def test_admin_stats_returns_data(self, admin_token):
        """Test /api/admin/stats returns all required fields"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Admin stats failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "total_users" in data, "total_users missing"
        assert "total_transactions" in data, "total_transactions missing"
        assert "volume_by_token" in data, "volume_by_token missing"
        assert "completed_transactions" in data, "completed_transactions missing"
        assert "pending_transactions" in data, "pending_transactions missing"
        assert "recent_24h_transactions" in data, "recent_24h_transactions missing"
        assert "recent_24h_users" in data, "recent_24h_users missing"
        
        # Verify data types
        assert isinstance(data["total_users"], int), "total_users should be int"
        assert isinstance(data["total_transactions"], int), "total_transactions should be int"
        assert isinstance(data["volume_by_token"], list), "volume_by_token should be list"
        
        print(f"✓ Admin stats: {data['total_users']} users, {data['total_transactions']} transactions")
        print(f"✓ Volume by token entries: {len(data['volume_by_token'])}")


class TestAdminTransactions:
    """Admin transactions endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate as admin")
        return response.json()["token"]
    
    @pytest.fixture
    def non_admin_token(self):
        """Get non-admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate as non-admin")
        return response.json()["token"]
    
    def test_admin_transactions_requires_admin(self, non_admin_token):
        """Test /api/admin/transactions returns 403 for non-admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/transactions",
            headers={"Authorization": f"Bearer {non_admin_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Admin transactions correctly rejects non-admin")
    
    def test_admin_transactions_returns_paginated_list(self, admin_token):
        """Test /api/admin/transactions returns paginated list with user info"""
        response = requests.get(
            f"{BASE_URL}/api/admin/transactions?limit=10&skip=0",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Admin transactions failed: {response.text}"
        data = response.json()
        
        # Verify structure
        assert "transactions" in data, "transactions array missing"
        assert "total" in data, "total count missing"
        assert isinstance(data["transactions"], list), "transactions should be list"
        assert isinstance(data["total"], int), "total should be int"
        
        # If transactions exist, verify they contain user info
        if len(data["transactions"]) > 0:
            tx = data["transactions"][0]
            assert "id" in tx, "Transaction ID missing"
            assert "user_email" in tx, "user_email missing"
            assert "user_name" in tx, "user_name missing"
            assert "status" in tx, "status missing"
            print(f"✓ Transaction sample: {tx['id']} - {tx['user_email']}")
        
        print(f"✓ Admin transactions: {len(data['transactions'])} items, {data['total']} total")


class TestAdminUsers:
    """Admin users endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate as admin")
        return response.json()["token"]
    
    @pytest.fixture
    def non_admin_token(self):
        """Get non-admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate as non-admin")
        return response.json()["token"]
    
    def test_admin_users_requires_admin(self, non_admin_token):
        """Test /api/admin/users returns 403 for non-admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {non_admin_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Admin users correctly rejects non-admin")
    
    def test_admin_users_returns_paginated_list(self, admin_token):
        """Test /api/admin/users returns paginated list with transaction counts"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users?limit=10&skip=0",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Admin users failed: {response.text}"
        data = response.json()
        
        # Verify structure
        assert "users" in data, "users array missing"
        assert "total" in data, "total count missing"
        assert isinstance(data["users"], list), "users should be list"
        
        # Verify user objects contain transaction_count
        if len(data["users"]) > 0:
            user = data["users"][0]
            assert "id" in user, "User ID missing"
            assert "email" in user, "email missing"
            assert "name" in user, "name missing"
            assert "transaction_count" in user, "transaction_count missing"
            assert "auth_type" in user, "auth_type missing"
            print(f"✓ User sample: {user['email']} - {user['transaction_count']} transactions")
        
        print(f"✓ Admin users: {len(data['users'])} items, {data['total']} total")


class TestTelegramConfig:
    """Telegram configuration endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate as admin")
        return response.json()["token"]
    
    @pytest.fixture
    def non_admin_token(self):
        """Get non-admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/signin", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate as non-admin")
        return response.json()["token"]
    
    def test_get_telegram_config_requires_admin(self, non_admin_token):
        """Test GET /api/admin/telegram-config returns 403 for non-admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/telegram-config",
            headers={"Authorization": f"Bearer {non_admin_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ GET telegram-config correctly rejects non-admin")
    
    def test_post_telegram_config_requires_admin(self, non_admin_token):
        """Test POST /api/admin/telegram-config returns 403 for non-admin"""
        response = requests.post(
            f"{BASE_URL}/api/admin/telegram-config",
            headers={"Authorization": f"Bearer {non_admin_token}"},
            json={"bot_token": "test", "chat_id": "123"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ POST telegram-config correctly rejects non-admin")
    
    def test_get_telegram_config_status(self, admin_token):
        """Test GET /api/admin/telegram-config returns config status"""
        response = requests.get(
            f"{BASE_URL}/api/admin/telegram-config",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Get telegram config failed: {response.text}"
        data = response.json()
        
        # Verify structure (either configured or not)
        assert "configured" in data, "configured field missing"
        assert isinstance(data["configured"], bool), "configured should be boolean"
        
        if data["configured"]:
            assert "chat_id" in data, "chat_id missing when configured"
            print(f"✓ Telegram configured: chat_id = {data['chat_id']}")
        else:
            print("✓ Telegram not configured yet (expected)")
    
    def test_post_telegram_config_validation(self, admin_token):
        """Test POST /api/admin/telegram-config validates inputs"""
        # Test with empty values
        response = requests.post(
            f"{BASE_URL}/api/admin/telegram-config",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={}
        )
        # Should reject with 422 for missing fields
        assert response.status_code == 422, f"Expected validation error, got {response.status_code}"
        print("✓ Telegram config validates required fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
