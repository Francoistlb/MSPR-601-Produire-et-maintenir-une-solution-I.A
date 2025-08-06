from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, and_
from typing import List, Optional
from datetime import datetime, date

from app.core.database import get_db, engine
from app.crud import predi_covid as crud_predi_covid
from app.crud import location as crud_location
from app.schemas.schemas import (
    FPrediCovidCreate,
    FPrediCovidRead,
    PredictionFilters,
    IndicateurType
)
from app.models.models import FPrediCovid, Base

router = APIRouter()

async def check_and_create_tables():
    """
    Vérifie si les tables existent et les crée si nécessaire
    """
    try:
        async with engine.begin() as conn:
            # Vérifier si la table f_predi_covid existe
            result = await conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'f_predi_covid'
                );
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("🔧 Table f_predi_covid n'existe pas, création en cours...")
                await conn.run_sync(Base.metadata.create_all)
                print("✅ Tables créées avec succès")
            else:
                print("✅ Table f_predi_covid existe déjà")
                
    except Exception as e:
        print(f"❌ Erreur lors de la vérification/création des tables: {str(e)}")
        raise

@router.get("/countries", response_model=List[str], tags=["Prédictions"])
async def get_countries_with_predictions(
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère la liste des pays qui ont des prédictions de nouveaux cas (new_cases)
    """
    try:
        # Utiliser SQLAlchemy de manière asynchrone
        from sqlalchemy import select, distinct
        from app.models.models import DLocation, FPrediCovid
        
        query = select(distinct(DLocation.location_name))\
            .join(FPrediCovid, DLocation.location_id == FPrediCovid.location_id)\
            .where(FPrediCovid.indicateur == 'new_cases')\
            .order_by(DLocation.location_name)
        
        result = await db.execute(query)
        countries = [row[0] for row in result.fetchall()]
        
        if not countries:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aucun pays trouvé avec des prédictions de nouveaux cas"
            )
            
        return countries

    except Exception as e:
        print(f"Erreur lors de la récupération des pays: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des pays: {str(e)}"
        )

@router.get("/all-predictions/{year}")
async def get_all_predictions_by_year(
    year: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère toutes les prédictions pour tous les pays pour une année spécifique
    """
    try:
        # Construire les dates de début et fin d'année
        date_debut = date(year, 1, 1)
        date_fin = date(year, 12, 31)
        
        # Utiliser une requête SQL directe pour plus d'efficacité
        query = text("""
            WITH predictions_by_type AS (
                -- Récupérer les nouveaux cas
                SELECT 
                    dl.location_name as pays,
                    fpc.date_predite,
                    fpc.valeur_predite as valeur,
                    fpc.indicateur,
                    fpc.model_name
                FROM d_location dl
                JOIN f_predi_covid fpc ON dl.location_id = fpc.location_id
                WHERE fpc.date_predite BETWEEN :date_debut AND :date_fin
                AND fpc.indicateur IN ('new_cases', 'new_deaths', 'countries_reporting')
            )
            SELECT 
                pays,
                date_predite,
                MAX(CASE WHEN indicateur = 'new_cases' THEN valeur END) as nouveaux_cas,
                MAX(CASE WHEN indicateur = 'new_deaths' THEN valeur END) as deces,
                MAX(CASE WHEN indicateur = 'countries_reporting' THEN valeur END) as countries_reporting_pred,
                MAX(CASE WHEN indicateur = 'new_cases' THEN model_name END) as model_name
            FROM predictions_by_type
            GROUP BY pays, date_predite
            ORDER BY pays, date_predite;
        """)
        
        result = await db.execute(
            query,
            {"date_debut": date_debut, "date_fin": date_fin}
        )
        
        # Organiser les prédictions par pays
        predictions_par_pays = {}
        for row in result:
            pays = row.pays
            if pays not in predictions_par_pays:
                predictions_par_pays[pays] = []
                
            predictions_par_pays[pays].append({
                "date": row.date_predite.strftime("%Y-%m-%d"),
                "nouveaux_cas": float(row.nouveaux_cas or 0),
                "deces": float(row.deces or 0),
                "countries_reporting_pred": float(row.countries_reporting_pred or 0),
                "modele": row.model_name
            })
        
        if not predictions_par_pays:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Aucune prédiction trouvée pour l'année {year}"
            )
            
        return predictions_par_pays

    except Exception as e:
        print(f"Erreur lors de la récupération des prédictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des prédictions: {str(e)}"
        )

@router.get("/predictions-by-country/{year}")
async def get_predictions_by_country_and_year(
    year: int,
    pays: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère toutes les prédictions de nouveaux cas pour un pays et une année spécifique
    """
    try:
        # Construire les dates de début et fin d'année
        date_debut = f"{year}-01-01"
        date_fin = f"{year}-12-31"
        
        # Utiliser une requête SQL directe pour plus d'efficacité
        query = text("""
            SELECT 
                dl.location_name as pays,
                fpc.date_predite,
                fpc.valeur_predite as nouveaux_cas,
                fpc.model_name
            FROM d_location dl
            JOIN f_predi_covid fpc ON dl.location_id = fpc.location_id
            WHERE dl.location_name = :pays
            AND fpc.indicateur = 'new_cases'
            AND fpc.date_predite BETWEEN :date_debut AND :date_fin
            ORDER BY fpc.date_predite;
        """)
        
        result = await db.execute(
            query,
            {"pays": pays, "date_debut": date_debut, "date_fin": date_fin}
        )
        
        predictions = []
        for row in result:
            predictions.append({
                "pays": row.pays,
                "date": row.date_predite.strftime("%Y-%m-%d"),
                "nouveaux_cas": float(row.nouveaux_cas),
                "modele": row.model_name
            })
        
        if not predictions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Aucune prédiction trouvée pour {pays} en {year}"
            )
            
        return predictions

    except Exception as e:
        print(f"Erreur lors de la récupération des prédictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des prédictions: {str(e)}"
        )

@router.get("/", response_model=List[FPrediCovidRead])
async def get_predictions(
    filters: PredictionFilters = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère les prédictions avec filtres optionnels
    """
    try:
        all_predictions = []
        
        # Si un nom de pays est fourni
        if filters.pays:
            location = await crud_location.obtenir_pays_par_nom(db, filters.pays)
            if location:
                predictions = await crud_predi_covid.liste_predictions_covid(
                    db, 
                    skip=filters.skip, 
                    limit=filters.limit,
                    location_id=location.location_id,
                    indicateur=filters.indicateur.value if filters.indicateur else None,
                    date_debut=filters.date_debut,
                    date_fin=filters.date_fin
                )
                all_predictions.extend(predictions)
            else:
                print(f"Pays non trouvé: {filters.pays}")
        else:
            # Si aucun pays n'est spécifié, récupérer toutes les prédictions
            predictions = await crud_predi_covid.liste_predictions_covid(
                db, 
                skip=filters.skip, 
                limit=filters.limit,
                location_id=filters.location_id,
                indicateur=filters.indicateur.value if filters.indicateur else None,
                date_debut=filters.date_debut,
                date_fin=filters.date_fin
            )
            all_predictions.extend(predictions)
        
        return all_predictions

    except Exception as e:
        print(f"Erreur lors de la récupération des prédictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des prédictions: {str(e)}"
        )

@router.get("/{pred_id}", response_model=FPrediCovidRead)
async def get_prediction_by_id(
    pred_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère une prédiction par son ID
    """
    prediction = await crud_predi_covid.obtenir_prediction_covid_par_id(db, pred_id)
    if prediction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prédiction non trouvée"
        )
    return prediction

@router.post("/generate/{year}", response_model=List[FPrediCovidRead])
async def generate_predictions_for_year(
    year: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Génère des prédictions pour une année donnée
    """
    try:
        # 1. Vérifier et créer les tables si nécessaire
        print("🔍 Vérification des tables...")
        await check_and_create_tables()
        
        # 2. Import dynamique du script de génération
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '../../../scripts'))
        from generate_predictions import generate_predictions
        
        print(f"🎯 Génération des prédictions pour {year}...")
        
        # 3. Générer les prédictions
        predictions_data = generate_predictions(year)
        print(f"📊 {len(predictions_data)} prédictions générées par le script")
        
        # 4. Sauvegarder en base de données
        saved_predictions = []
        print("💾 Sauvegarde en base de données...")
        
        for i, pred_data in enumerate(predictions_data):
            if i % 1000 == 0:  # Afficher le progrès tous les 1000 enregistrements
                print(f"   Traitement: {i}/{len(predictions_data)} ({i/len(predictions_data)*100:.1f}%)")
            
            # Récupérer ou créer la location
            location = await crud_location.obtenir_ou_creer_pays(db, pred_data["location"])
            
            # Créer les prédictions pour chaque indicateur
            for indicateur, valeur in [
                ("new_cases", pred_data["new_cases_pred"]),
                ("new_deaths", pred_data["new_deaths_pred"]),
                ("countries_reporting", pred_data["countries_reporting_pred"])
            ]:
                pred_create = FPrediCovidCreate(
                    date_predite=pred_data["date"],
                    location_id=location.location_id,
                    indicateur=indicateur,
                    valeur_predite=float(valeur),
                    model_name="RF_XGB_Ensemble"  # Nom du modèle utilisé
                )
                
                saved_pred = await crud_predi_covid.creer_prediction_covid(db, pred_create)
                saved_predictions.append(saved_pred)
        
        print(f"✅ {len(saved_predictions)} enregistrements sauvegardés en base")
        return saved_predictions
        
    except ImportError as e:
        print(f"❌ Erreur d'import du script: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur d'import du script de génération: {str(e)}"
        )
    except Exception as e:
        print(f"❌ Erreur lors de la génération des prédictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération des prédictions: {str(e)}"
        )

@router.delete("/{pred_id}")
async def delete_prediction(
    pred_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Supprime une prédiction par son ID
    """
    success = await crud_predi_covid.supprimer_prediction_covid(db, pred_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prédiction non trouvée"
        )
    return {"message": "Prédiction supprimée avec succès"} 
