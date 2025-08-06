"""
CRUD operations pour les utilisateurs (version asynchrone)
"""
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.models.models import User
from app.schemas.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


async def get_user(db: AsyncSession, user_id: int) -> Optional[User]:
    """Récupère un utilisateur par ID"""
    result = await db.execute(select(User).filter(User.user_id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Récupère un utilisateur par nom d'utilisateur"""
    result = await db.execute(select(User).filter(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Récupère un utilisateur par email"""
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalar_one_or_none()


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Récupère une liste d'utilisateurs"""
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()


async def create_user(db: AsyncSession, user: UserCreate) -> User:
    """Crée un nouvel utilisateur"""
    # Vérifier si l'utilisateur existe déjà
    existing_user = await get_user_by_username(db, user.username)
    if existing_user:
        raise ValueError(f"Username '{user.username}' already exists")
    
    existing_email = await get_user_by_email(db, user.email)
    if existing_email:
        raise ValueError(f"Email '{user.email}' already exists")
    
    # Créer l'utilisateur
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        is_active=True,
        is_admin=False
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_user(db: AsyncSession, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """Met à jour un utilisateur"""
    db_user = await get_user(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    await db.commit()
    await db.refresh(db_user)
    return db_user



async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """Authentifie un utilisateur avec email et mot de passe"""
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def delete_user(db: AsyncSession, user_id: int) -> bool:
    """Supprime un utilisateur"""
    db_user = await get_user(db, user_id)
    if db_user:
        await db.delete(db_user)
        await db.commit()
        return True
    return False
