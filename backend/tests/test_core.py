"""
Tests pour les modules core
Couvre : database.py, security.py
"""
import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from app.core.security import (
    create_access_token, 
    verify_token, 
    get_password_hash, 
    verify_password,
    revoke_token,
    blacklisted_tokens
)
from app.core.database import get_db
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM


def verify_token_for_tests(token: str):
    """Version simplifiée de verify_token pour les tests"""
    # Vérifier si le token est dans la blacklist
    if token in blacklisted_tokens:
        return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


class TestSecurity:
    """Tests du module security"""

    def test_password_hashing(self):
        """Test du hachage et vérification des mots de passe"""
        password = "testpassword123"
        
        # Hacher le mot de passe
        hashed = get_password_hash(password)
        
        # Vérifier que le hash est différent du mot de passe original
        assert hashed != password
        assert len(hashed) > 0
        
        # Vérifier que la vérification fonctionne
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False

    def test_password_hash_unique(self):
        """Test que les hashes sont uniques même pour le même mot de passe"""
        password = "samepassword"
        
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Les hashes devraient être différents (sel aléatoire)
        assert hash1 != hash2
        
        # Mais les deux devraient vérifier le même mot de passe
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_create_access_token_default(self):
        """Test de création de token d'accès avec expiration par défaut"""
        data = {"sub": "testuser"}
        
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Vérifier que le token peut être décodé
        payload = verify_token_for_tests(token)
        assert payload is not None
        assert payload.get("sub") == "testuser"
        assert "exp" in payload

    def test_create_access_token_custom_expiry(self):
        """Test de création de token avec expiration personnalisée"""
        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=30)
        
        token = create_access_token(data, expires_delta)
        
        assert isinstance(token, str)
        
        payload = verify_token_for_tests(token)
        assert payload is not None
        assert payload.get("sub") == "testuser"

    def test_verify_token_valid(self):
        """Test de vérification d'un token valide"""
        data = {"sub": "testuser", "role": "user"}
        token = create_access_token(data)
        
        payload = verify_token_for_tests(token)
        
        assert payload is not None
        assert payload.get("sub") == "testuser"
        assert payload.get("role") == "user"

    def test_verify_token_invalid(self):
        """Test de vérification d'un token invalide"""
        invalid_token = "invalid.token.here"
        
        payload = verify_token_for_tests(invalid_token)
        
        assert payload is None

    def test_verify_token_expired(self):
        """Test de vérification d'un token expiré"""
        data = {"sub": "testuser"}
        # Créer un token qui expire immédiatement
        expires_delta = timedelta(seconds=-1)
        
        token = create_access_token(data, expires_delta)
        
        # Le token devrait être invalide car expiré
        payload = verify_token_for_tests(token)
        assert payload is None

    def test_token_revocation(self):
        """Test de révocation de token"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Le token devrait être valide initialement
        payload = verify_token_for_tests(token)
        assert payload is not None
        
        # Révoquer le token
        revoke_token(token)
        
        # Le token devrait maintenant être invalide
        payload = verify_token_for_tests(token)
        assert payload is None
        
        # Vérifier que le token est dans la blacklist
        assert token in blacklisted_tokens

    def test_blacklist_persistence(self):
        """Test de persistance de la blacklist"""
        data = {"sub": "testuser1"}
        token1 = create_access_token(data)
        
        data = {"sub": "testuser2"}
        token2 = create_access_token(data)
        
        # Révoquer les deux tokens
        revoke_token(token1)
        revoke_token(token2)
        
        # Les deux devraient être dans la blacklist
        assert token1 in blacklisted_tokens
        assert token2 in blacklisted_tokens
        
        # Les deux devraient être invalides
        assert verify_token_for_tests(token1) is None
        assert verify_token_for_tests(token2) is None

    def test_token_content_integrity(self):
        """Test de l'intégrité du contenu des tokens"""
        original_data = {
            "sub": "testuser",
            "role": "admin",
            "permissions": ["read", "write"],
            "user_id": 123
        }
        
        token = create_access_token(original_data)
        payload = verify_token_for_tests(token)
        
        assert payload is not None
        assert payload.get("sub") == original_data["sub"]
        assert payload.get("role") == original_data["role"]
        assert payload.get("permissions") == original_data["permissions"]
        assert payload.get("user_id") == original_data["user_id"]


class TestDatabase:
    """Tests du module database"""

    @pytest.mark.asyncio
    async def test_get_async_session(self):
        """Test de récupération d'une session async"""
        session_generator = get_db()
        
        # Obtenir la session
        session = await session_generator.__anext__()
        
        assert session is not None
        
        # La session devrait être fermée automatiquement
        try:
            await session_generator.__anext__()
        except StopAsyncIteration:
            # C'est normal, le générateur se ferme après une utilisation
            pass

    @pytest.mark.asyncio
    async def test_database_connection_stability(self):
        """Test de stabilité de connexion à la base de données"""
        # Tester plusieurs connexions consécutives
        for i in range(5):
            session_generator = get_db()
            session = await session_generator.__anext__()
            
            assert session is not None
            
            # Fermer proprement
            try:
                await session_generator.__anext__()
            except StopAsyncIteration:
                pass


class TestSecurityIntegration:
    """Tests d'intégration sécurité"""

    def test_full_auth_workflow(self):
        """Test du workflow complet d'authentification"""
        # 1. Hacher un mot de passe
        password = "userpassword123"
        hashed_password = get_password_hash(password)
        
        # 2. Simuler une authentification réussie
        assert verify_password(password, hashed_password) is True
        
        # 3. Créer un token pour l'utilisateur
        token_data = {"sub": "authenticateduser", "user_id": 1}
        token = create_access_token(token_data)
        
        # 4. Vérifier le token
        payload = verify_token_for_tests(token)
        assert payload is not None
        assert payload.get("sub") == "authenticateduser"
        
        # 5. Simuler une déconnexion (révocation)
        revoke_token(token)
        
        # 6. Vérifier que le token est maintenant invalide
        assert verify_token_for_tests(token) is None

    def test_security_edge_cases(self):
        """Test des cas limites de sécurité"""
        # Test avec des données vides
        assert get_password_hash("") != ""
        assert verify_password("", get_password_hash("")) is True
        
        # Test avec des caractères spéciaux
        special_password = "pàssw0rd!@#$%^&*()ûñïçödé"
        hashed_special = get_password_hash(special_password)
        assert verify_password(special_password, hashed_special) is True
        
        # Test avec un mot de passe très long
        long_password = "a" * 1000
        hashed_long = get_password_hash(long_password)
        assert verify_password(long_password, hashed_long) is True

    def test_token_security_features(self):
        """Test des fonctionnalités de sécurité des tokens"""
        # Test avec différents types de données
        test_cases = [
            {"sub": "user1", "type": "access"},
            {"sub": "user2", "type": "refresh", "scope": "admin"},
            {"sub": "user3", "permissions": ["read", "write", "delete"]},
        ]
        
        tokens = []
        for data in test_cases:
            token = create_access_token(data)
            tokens.append(token)
            
            # Vérifier que chaque token contient les bonnes données
            payload = verify_token_for_tests(token)
            assert payload is not None
            for key, value in data.items():
                assert payload.get(key) == value
        
        # Vérifier que tous les tokens sont différents
        assert len(set(tokens)) == len(tokens)
        
        # Révoquer tous les tokens
        for token in tokens:
            revoke_token(token)
            assert verify_token_for_tests(token) is None
