"""
Tests pour les endpoints de prédictions IA (version simplifiée)
Couvre : /models, /predict, /generate, routes CRUD
"""
import pytest
from httpx import AsyncClient


class TestPredictionsAPI:
    """Tests des endpoints de prédictions"""

    @pytest.mark.asyncio
    async def test_get_models_info(self, client: AsyncClient):
        """Test de récupération des informations sur les modèles ML"""
        response = await client.get("/api/predictions/models")
        
        assert response.status_code == 200
        data = response.json()
        
        # Vérifier la structure de la réponse
        assert "models" in data
        assert "technologies" in data
        assert "version" in data
        assert "last_training" in data
        
        # Vérifier les modèles
        models = data["models"]
        assert len(models) >= 3  # Random Forest, XGBoost, RF_XGB_Ensemble
        
        model_names = [model["name"] for model in models]
        assert "Random Forest" in model_names
        assert "XGBoost" in model_names
        assert "RF_XGB_Ensemble" in model_names
        
        # Vérifier la structure d'un modèle
        for model in models:
            assert "name" in model
            assert "type" in model
            assert "description" in model
            assert "metrics" in model
            assert "input_features" in model
            assert "output" in model

    @pytest.mark.asyncio
    async def test_get_models_info_structure(self, client: AsyncClient):
        """Test de la structure détaillée des informations modèles"""
        response = await client.get("/api/predictions/models")
        data = response.json()
        
        # Vérifier les technologies
        technologies = data["technologies"]
        expected_tech = ["scikit-learn", "pandas", "numpy"]
        for tech in expected_tech:
            assert tech in technologies
        
        # Vérifier le modèle ensemble
        ensemble_model = next(
            (m for m in data["models"] if m["name"] == "RF_XGB_Ensemble"), 
            None
        )
        assert ensemble_model is not None
        assert "indicators" in ensemble_model
        expected_indicators = ["new_cases", "new_deaths", "countries_reporting"]
        for indicator in expected_indicators:
            assert indicator in ensemble_model["indicators"]

    @pytest.mark.asyncio
    async def test_predictions_content_type(self, client: AsyncClient):
        """Test des content-types des réponses"""
        response = await client.get("/api/predictions/models")
        
        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")


class TestPredictionsValidation:
    """Tests de validation des endpoints de prédictions"""

    @pytest.mark.asyncio
    async def test_get_predictions_invalid_year_format(self, client: AsyncClient):
        """Test avec format d'année invalide"""
        response = await client.get("/api/predictions/all-predictions/invalid_year")
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_get_predictions_negative_year(self, client: AsyncClient):
        """Test avec année négative"""
        response = await client.get("/api/predictions/all-predictions/-2025")
        
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_pagination_negative_values(self, client: AsyncClient):
        """Test de pagination avec valeurs négatives"""
        response = await client.get("/api/predictions/?skip=-1&limit=-1")
        
        # FastAPI devrait valider automatiquement
        assert response.status_code == 422
