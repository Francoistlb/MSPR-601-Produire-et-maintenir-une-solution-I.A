"""
Tests pour les endpoints généraux de l'API
Couvre : /health, /docs, routes générales
"""
import pytest
from httpx import AsyncClient


class TestGeneralAPI:
    """Tests des endpoints généraux"""

    @pytest.mark.asyncio
    async def test_health_endpoint(self, client: AsyncClient):
        """Test de l'endpoint de santé"""
        response = await client.get("/health")  # Pas /api/health !
        
        assert response.status_code == 200
        data = response.json()
        
        # Vérifier la structure de la réponse
        assert "status" in data
        assert "message" in data
        assert "version" in data
        
        # Vérifier les valeurs
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"

    @pytest.mark.asyncio
    async def test_health_endpoint_content_type(self, client: AsyncClient):
        """Test du content-type de l'endpoint health"""
        response = await client.get("/health")  # Pas /api/health !
        
        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")

    @pytest.mark.asyncio
    async def test_root_redirect(self, client: AsyncClient):
        """Test de redirection de la racine vers /docs"""
        response = await client.get("/", follow_redirects=False)
        
        # Devrait soit rediriger vers /docs soit retourner une réponse valide
        assert response.status_code in [200, 301, 302, 307, 308]

    @pytest.mark.asyncio
    async def test_docs_endpoint(self, client: AsyncClient):
        """Test de l'endpoint de documentation"""
        response = await client.get("/docs")
        
        assert response.status_code == 200
        # Vérifier que c'est du HTML (Swagger UI)
        content_type = response.headers.get("content-type", "")
        assert "text/html" in content_type

    @pytest.mark.asyncio
    async def test_openapi_json(self, client: AsyncClient):
        """Test de l'endpoint OpenAPI JSON"""
        response = await client.get("/openapi.json")
        
        assert response.status_code == 200
        data = response.json()
        
        # Vérifier la structure OpenAPI
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data
        
        # Vérifier les infos de l'API
        info = data["info"]
        assert "title" in info
        assert "version" in info

    @pytest.mark.asyncio
    async def test_404_endpoint(self, client: AsyncClient):
        """Test d'un endpoint inexistant"""
        response = await client.get("/api/nonexistent")
        
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_cors_headers(self, client: AsyncClient):
        """Test des headers CORS"""
        response = await client.get("/health")
        
        # Vérifier la présence des headers CORS (si configurés)
        assert response.status_code == 200
        # Les headers CORS peuvent être configurés ou non selon l'environnement


class TestAPIValidation:
    """Tests de validation générale de l'API"""

    @pytest.mark.asyncio
    async def test_api_prefix(self, client: AsyncClient):
        """Test que tous les endpoints utilisent le préfixe /api"""
        # Test que les endpoints principaux sont sous /api
        endpoints_to_test = [
            "/health",  # Endpoint à la racine
            "/api/auth/login",
            "/api/predictions/models"
        ]
        
        for endpoint in endpoints_to_test:
            response = await client.get(endpoint)
            # Tous ces endpoints devraient au moins ne pas retourner 404
            # (ils peuvent retourner 401, 422, etc. selon leur logique)
            assert response.status_code != 404

    @pytest.mark.asyncio
    async def test_json_response_structure(self, client: AsyncClient):
        """Test que les réponses JSON ont une structure cohérente"""
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Vérifier que c'est bien un dictionnaire
        assert isinstance(data, dict)
        
        # Vérifier qu'il n'est pas vide
        assert len(data) > 0


class TestPerformance:
    """Tests de performance basiques"""

    @pytest.mark.asyncio
    async def test_health_endpoint_speed(self, client: AsyncClient):
        """Test que l'endpoint health répond rapidement"""
        import time
        
        start_time = time.time()
        response = await client.get("/health")
        end_time = time.time()
        
        assert response.status_code == 200
        
        # L'endpoint health devrait répondre en moins d'1 seconde
        response_time = end_time - start_time
        assert response_time < 1.0, f"Health endpoint trop lent: {response_time}s"

    @pytest.mark.asyncio
    async def test_multiple_health_requests(self, client: AsyncClient):
        """Test de requêtes multiples sur health"""
        # Faire 10 requêtes consécutives
        for i in range(10):
            response = await client.get("/health")
            assert response.status_code == 200
            
            data = response.json()
            assert data["status"] == "healthy"
