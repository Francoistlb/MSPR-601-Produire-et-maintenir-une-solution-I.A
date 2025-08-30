from fastapi import APIRouter
from app.api.endpoints import locations, covid, mpox, predictions, auth
from app.core.config import settings

api_router = APIRouter()

# Routes d'authentification (toujours activées)
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

# Routes de base (toujours activées)
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

# Routes conditionnelles selon la configuration du pays
if settings.TECHNICAL_API_ENABLED:
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