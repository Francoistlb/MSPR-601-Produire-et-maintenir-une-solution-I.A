import sys
sys.stdout.reconfigure(encoding='utf-8')

import asyncio
from app.core.database import Base, engine
from app.models import models 

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Création des tables terminée.")

if __name__ == "__main__":
    try:
        asyncio.run(init_db())
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation de la base : {e}")
