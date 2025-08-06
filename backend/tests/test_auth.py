"""
Tests pour les endpoints d'authentification
Couvre : login, logout, register, routes protégées
"""
import pytest
from httpx import AsyncClient
from app.models.models import User


class TestAuthentication:
    """Tests des endpoints d'authentification"""

    @pytest.mark.asyncio
    async def test_register_user_success(self, client: AsyncClient):
        """Test d'inscription réussie d'un nouvel utilisateur"""
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword123"
        }
        
        response = await client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert data["is_active"] is True
        assert data["is_admin"] is False
        assert "password" not in data  # Pas de mot de passe dans la réponse

    @pytest.mark.asyncio
    async def test_register_user_duplicate_email(self, client: AsyncClient, test_user: User):
        """Test d'inscription avec email déjà existant"""
        user_data = {
            "username": "anotheruser",
            "email": test_user.email,  # Email déjà utilisé
            "password": "password123"
        }
        
        response = await client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "email" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_user_duplicate_username(self, client: AsyncClient, test_user: User):
        """Test d'inscription avec username déjà existant"""
        user_data = {
            "username": test_user.username,  # Username déjà utilisé
            "email": "different@example.com",
            "password": "password123"
        }
        
        response = await client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "username" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_user: User):
        """Test de connexion réussie"""
        login_data = {
            "email": test_user.email,
            "password": "testpassword123"
        }
        
        response = await client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert isinstance(data["expires_in"], int)

    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client: AsyncClient, test_user: User):
        """Test de connexion avec des identifiants invalides"""
        login_data = {
            "email": test_user.email,
            "password": "wrongpassword"
        }
        
        response = await client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test de connexion avec un utilisateur inexistant"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        
        response = await client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user(self, client: AsyncClient, auth_headers: dict, test_user: User):
        """Test de récupération des informations utilisateur connecté"""
        response = await client.get("/api/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user.username
        assert data["email"] == test_user.email
        assert data["user_id"] == test_user.user_id

    @pytest.mark.asyncio
    async def test_get_current_user_without_token(self, client: AsyncClient):
        """Test d'accès aux informations utilisateur sans token"""
        response = await client.get("/api/auth/me")
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test d'accès avec un token invalide"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_logout_success(self, client: AsyncClient, auth_headers: dict):
        """Test de déconnexion réussie"""
        response = await client.post("/api/auth/logout", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "Déconnexion réussie" in data["message"]
        assert "révoqué" in data["detail"]

    @pytest.mark.asyncio
    async def test_logout_without_token(self, client: AsyncClient):
        """Test de déconnexion sans token"""
        response = await client.post("/api/auth/logout")
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_token_revocation_after_logout(self, client: AsyncClient, auth_headers: dict):
        """Test que le token est bien révoqué après logout"""
        # D'abord, vérifier que le token fonctionne
        response = await client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        
        # Se déconnecter
        response = await client.post("/api/auth/logout", headers=auth_headers)
        assert response.status_code == 200
        
        # Vérifier que le token ne fonctionne plus
        response = await client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 401
        data = response.json()
        assert "revoked" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_protected_route_access(self, client: AsyncClient, auth_headers: dict):
        """Test d'accès à une route protégée"""
        response = await client.get("/api/auth/test-protected", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "Hello" in data["message"]
        assert "protected route" in data["message"]

    @pytest.mark.asyncio
    async def test_protected_route_without_auth(self, client: AsyncClient):
        """Test d'accès à une route protégée sans authentification"""
        response = await client.get("/api/auth/test-protected")
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_test_login_endpoint(self, client: AsyncClient):
        """Test de l'endpoint de test simple"""
        response = await client.get("/api/auth/test-login")
        
        assert response.status_code == 200
        data = response.json()
        assert "opérationnelle" in data["message"]


class TestAuthenticationEdgeCases:
    """Tests des cas limites pour l'authentification"""

    @pytest.mark.asyncio
    async def test_register_invalid_email_format(self, client: AsyncClient):
        """Test d'inscription avec format d'email invalide"""
        user_data = {
            "username": "testuser",
            "email": "invalid-email",
            "password": "password123"
        }
        
        response = await client.post("/api/auth/register", json=user_data)
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_register_short_password(self, client: AsyncClient):
        """Test d'inscription avec mot de passe trop court"""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "123"  # Trop court
        }
        
        response = await client.post("/api/auth/register", json=user_data)
        # Selon votre validation, cela peut être 422 ou 400
        assert response.status_code in [400, 422]

    @pytest.mark.asyncio
    async def test_register_missing_fields(self, client: AsyncClient):
        """Test d'inscription avec des champs manquants"""
        user_data = {
            "username": "testuser"
            # email et password manquants
        }
        
        response = await client.post("/api/auth/register", json=user_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_login_missing_fields(self, client: AsyncClient):
        """Test de connexion avec des champs manquants"""
        login_data = {
            "email": "test@example.com"
            # password manquant
        }
        
        response = await client.post("/api/auth/login", json=login_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_multiple_logout_same_token(self, client: AsyncClient, auth_headers: dict):
        """Test de déconnexion multiple avec le même token"""
        # Premier logout
        response = await client.post("/api/auth/logout", headers=auth_headers)
        assert response.status_code == 200
        
        # Deuxième logout avec le même token (déjà révoqué)
        response = await client.post("/api/auth/logout", headers=auth_headers)
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_token_format_validation(self, client: AsyncClient):
        """Test de validation du format du token"""
        test_cases = [
            {"Authorization": "Bearer"},  # Token vide
            {"Authorization": "Invalid token_format"},  # Format incorrect
            {"Authorization": "Bearer "},  # Token espace vide
        ]
        
        for headers in test_cases:
            response = await client.get("/api/auth/me", headers=headers)
            assert response.status_code == 401
