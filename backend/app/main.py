from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router

app = FastAPI(
    title="API COVID-19 & Mpox",
    description="API pour accéder aux données COVID-19 et Mpox - Projet MSPR Data Science",
    version="1.0.0"
)

# Configuration CORS pour le développement
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permet toutes les origines en développement
    allow_credentials=False,  # Doit être False quand allow_origins=["*"]
    allow_methods=["*"],  # Permet toutes les méthodes
    allow_headers=["*"],  # Permet tous les headers
)

# Page d'accueil
@app.get("/")
async def accueil():
    return {
        "message": "Bienvenue sur l'API COVID-19 & Mpox !",
        "documentation": "/docs",
        "sources_de_donnees": ["COVID-19: Our World in Data", "Mpox: Kaggle Dataset"],
        "aide": "Utilisez la documentation interactive pour explorer les endpoints disponibles."
    }

# Inclusion des routes de l'API
app.include_router(api_router, prefix="/api")
