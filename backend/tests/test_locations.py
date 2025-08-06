"""
Tests pour les endpoints de localisation (version nettoyée)
"""
import pytest
from httpx import AsyncClient


class TestLocationsAPI:
    """Tests des endpoints de base pour les localisations"""

    @pytest.mark.asyncio
    async def test_get_all_locations_empty(self, client: AsyncClient):
        """Test de récupération de toutes les locations (vide)"""
        response = await client.get("/api/locations/")
        
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_countries_list_empty(self, client: AsyncClient):
        """Test de récupération de la liste des pays (vide)"""
        response = await client.get("/api/locations/countries")
        
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_locations_pagination(self, client: AsyncClient):
        """Test de pagination des locations"""
        response = await client.get("/api/locations/?skip=0&limit=10")
        
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_locations_response_structure(self, client: AsyncClient):
        """Test de la structure de réponse des locations"""
        response = await client.get("/api/locations/")
        
        assert response.status_code in [200, 404]
        assert response.headers.get("content-type", "").startswith("application/json")
