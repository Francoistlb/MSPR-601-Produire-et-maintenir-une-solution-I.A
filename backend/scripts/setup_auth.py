"""
Script pour créer les tables et un utilisateur test
"""
import asyncio
import sys
import os

# Ajouter le chemin parent pour les imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.app.models.models import Base
from backend.app.core.database import engine, get_db
from backend.app.crud.user import create_user
from backend.app.schemas.schemas import UserCreate

async def create_tables_and_user():
    """Crée toutes les tables et un utilisateur test"""
    try:
        # Créer les tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables créées avec succès !")
        
        # Créer un utilisateur test
        async for db in get_db():
            try:
                test_user = UserCreate(
                    username="testuser",
                    email="test@gmail.com",
                    password="test123",
                    full_name="Utilisateur Test"
                )
                
                user = await create_user(db, test_user)
                print(f"✅ Utilisateur test créé avec succès !")
                print(f"   Email: {user.email}")
                print(f"   Username: {user.username}")
                print(f"   Password: test123")
                
            except ValueError as e:
                print(f"ℹ️  Utilisateur test existe déjà: {e}")
            break
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    asyncio.run(create_tables_and_user())
