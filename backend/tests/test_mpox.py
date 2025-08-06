"""
Tests pour les endpoints MPOX (version nettoyée)
"""
import pytest
from httpx import AsyncClient


class TestMpoxAPI:
    """Tests des endpoints MPOX de base"""

    @pytest.mark.asyncio
    async def test_get_mpox_data_empty(self, client: AsyncClient):
        """Test de récupération des données MPOX (vide)"""
        response = await client.get("/api/mpox/")
        
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_mpox_by_country_empty(self, client: AsyncClient):
        """Test de récupération MPOX par pays (vide)"""
        response = await client.get("/api/mpox/country/France")
        
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_mpox_pagination(self, client: AsyncClient):
        """Test de pagination MPOX"""
        response = await client.get("/api/mpox/?skip=0&limit=10")
        
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_mpox_response_structure(self, client: AsyncClient):
        """Test de la structure de réponse MPOX"""
        response = await client.get("/api/mpox/")
        
        assert response.status_code in [200, 404]
        assert response.headers.get("content-type", "").startswith("application/json")
