from app.models.models import FPrediMpox
from app.schemas.schemas import FPrediMpoxCreate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

async def creer_prediction_mpox(db: AsyncSession, pred_data: FPrediMpoxCreate) -> FPrediMpox:
    db_pred = FPrediMpox(**pred_data.model_dump())
    db.add(db_pred)
    await db.commit()
    await db.refresh(db_pred)
    return db_pred

async def obtenir_prediction_mpox_par_id(db: AsyncSession, pred_id: int) -> Optional[FPrediMpox]:
    result = await db.execute(select(FPrediMpox).where(FPrediMpox.pred_id == pred_id))
    return result.scalars().first()

async def liste_predictions_mpox(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    location_id: Optional[int] = None,
    indicateur: Optional[str] = None,
    horizon: Optional[int] = None
) -> List[FPrediMpox]:
    query = select(FPrediMpox)
    filters = []
    if location_id:
        filters.append(FPrediMpox.location_id == location_id)
    if indicateur:
        filters.append(FPrediMpox.indicateur == indicateur)
    if horizon:
        filters.append(FPrediMpox.horizon == horizon)
    if filters:
        query = query.where(*filters)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def supprimer_prediction_mpox(db: AsyncSession, pred_id: int) -> bool:
    db_pred = await obtenir_prediction_mpox_par_id(db, pred_id)
    if db_pred is None:
        return False
    await db.delete(db_pred)
    await db.commit()
    return True