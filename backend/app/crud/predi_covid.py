from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date

from app.models.models import FPrediCovid
from app.schemas.schemas import FPrediCovidCreate

async def liste_predictions_covid(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    location_id: Optional[int] = None,
    indicateur: Optional[str] = None,
    date_debut: Optional[date] = None,
    date_fin: Optional[date] = None
) -> List[FPrediCovid]:
    """
    Récupère la liste des prédictions avec filtres optionnels
    """
    query = select(FPrediCovid)
    
    # Appliquer les filtres
    conditions = []
    
    if location_id is not None:
        conditions.append(FPrediCovid.location_id == location_id)
    
    if indicateur is not None:
        conditions.append(FPrediCovid.indicateur == indicateur)
    
    if date_debut is not None:
        conditions.append(FPrediCovid.date_predite >= date_debut)
    
    if date_fin is not None:
        conditions.append(FPrediCovid.date_predite <= date_fin)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

async def obtenir_prediction_covid_par_id(
    db: AsyncSession,
    pred_id: int
) -> Optional[FPrediCovid]:
    """
    Récupère une prédiction par son ID
    """
    query = select(FPrediCovid).where(FPrediCovid.pred_id == pred_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def creer_prediction_covid(
    db: AsyncSession,
    prediction: FPrediCovidCreate
) -> FPrediCovid:
    """
    Crée une nouvelle prédiction
    """
    db_prediction = FPrediCovid(**prediction.dict())
    db.add(db_prediction)
    await db.commit()
    await db.refresh(db_prediction)
    return db_prediction

async def supprimer_prediction_covid(
    db: AsyncSession,
    pred_id: int
) -> bool:
    """
    Supprime une prédiction par son ID
    """
    prediction = await obtenir_prediction_covid_par_id(db, pred_id)
    if prediction is None:
        return False
    
    await db.delete(prediction)
    await db.commit()
    return True