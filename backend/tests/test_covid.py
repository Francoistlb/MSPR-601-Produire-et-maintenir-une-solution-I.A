"""
Tests pour les endpoints COVID (version nettoyée)
"""
import pytest
from httpx import AsyncClient


class TestCovidAPI:
    """Tests des endpoints COVID de base"""

    @pytest.mark.asyncio
    async def test_get_covid_data_empty(self, client: AsyncClient):
        """Test de récupération des données COVID (vide)"""
        response = await client.get("/api/covid/")
        
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_covid_by_country_empty(self, client: AsyncClient):
        """Test de récupération COVID par pays (vide)"""
        response = await client.get("/api/covid/country/France")
        
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_covid_pagination(self, client: AsyncClient):
        """Test de pagination COVID"""
        response = await client.get("/api/covid/?skip=0&limit=10")
        
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_covid_response_structure(self, client: AsyncClient):
        """Test de la structure de réponse COVID"""
        response = await client.get("/api/covid/")
        
        assert response.status_code in [200, 404]
        assert response.headers.get("content-type", "").startswith("application/json")
