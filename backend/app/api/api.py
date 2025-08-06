from fastapi import APIRouter
from app.api.endpoints import locations, covid, mpox, predictions, auth

api_router = APIRouter()

# Routes d'authentification
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

# Inclusion des différents routers pour chaque partie de l'API
api_router.include_router(
    predictions.router,
    prefix="/predictions",
    tags=["Prédictions COVID-19"]
)

api_router.include_router(
    locations.router,
    prefix="/pays",
    tags=["Pays et localisations"]
)

api_router.include_router(
    covid.router,
    prefix="/covid",
    tags=["Données COVID-19"]
)

api_router.include_router(
    mpox.router,
    prefix="/mpox",
    tags=["Données Mpox"]
)