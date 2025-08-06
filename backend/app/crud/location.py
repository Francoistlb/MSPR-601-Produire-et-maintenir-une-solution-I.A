from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.models.models import DLocation
from app.schemas.schemas import DLocationCreate

async def creer_pays(
    db: AsyncSession,
    location: DLocationCreate
) -> DLocation:
    """
    Crée un nouveau pays
    """
    db_location = DLocation(**location.dict())
    db.add(db_location)
    await db.commit()
    await db.refresh(db_location)
    return db_location

async def obtenir_pays_par_id(
    db: AsyncSession,
    location_id: int
) -> Optional[DLocation]:
    """
    Récupère un pays par son ID
    """
    query = select(DLocation).where(DLocation.location_id == location_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def obtenir_pays_par_nom(
    db: AsyncSession,
    location_name: str
) -> Optional[DLocation]:
    """
    Récupère un pays par son nom
    """
    query = select(DLocation).where(DLocation.location_name == location_name)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def liste_pays(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100
) -> List[DLocation]:
    """
    Récupère la liste des pays
    """
    query = select(DLocation).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def obtenir_ou_creer_pays(
    db: AsyncSession,
    location_name: str
) -> DLocation:
    """
    Récupère un pays par son nom ou le crée s'il n'existe pas
    """
    location = await obtenir_pays_par_nom(db, location_name)
    if location is None:
        location = await creer_pays(db, DLocationCreate(location_name=location_name))
    return location


async def supprimer_pays(db: AsyncSession, location_id: int) -> bool:
    """Supprimer un pays par son ID"""
    db_location = await obtenir_pays_par_id(db, location_id)
    if db_location is None:
        return False
    
    db.delete(db_location)
    await db.commit()
    return True


# Alias pour assurer la compatibilité avec le code existant
create_location = creer_pays
get_location = obtenir_pays_par_id
get_location_by_name = obtenir_pays_par_nom
get_locations = liste_pays
get_or_create_location = obtenir_ou_creer_pays
delete_location = supprimer_pays 