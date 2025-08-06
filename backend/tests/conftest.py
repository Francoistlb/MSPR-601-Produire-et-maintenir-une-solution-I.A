"""
Configuration des tests pour l'API COVID-19 & Mpox
"""
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db, Base
from app.models.models import User, DLocation
from app.core.security import get_password_hash

# Base de données de test en mémoire
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Créer le moteur de test
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

# Session de test
TestSessionLocal = sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Créer une boucle d'événements pour les tests asynchrones"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Créer une session de base de données pour les tests"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestSessionLocal() as session:
        yield session
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Client HTTP de test"""
    def override_get_db():
        return db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def sync_client() -> Generator[TestClient, None, None]:
    """Client HTTP synchrone pour tests simples"""
    with TestClient(app) as client:
        yield client


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Créer un utilisateur de test"""
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("testpassword123"),
        is_active=True,
        is_admin=False
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_admin_user(db_session: AsyncSession) -> User:
    """Créer un utilisateur admin de test"""
    admin = User(
        username="adminuser",
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword123"),
        is_active=True,
        is_admin=True
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest.fixture
async def test_location(db_session: AsyncSession) -> DLocation:
    """Créer une localisation de test"""
    location = DLocation(location_name="France")
    db_session.add(location)
    await db_session.commit()
    await db_session.refresh(location)
    return location


@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: User) -> dict:
    """Générer les headers d'authentification pour les tests"""
    login_data = {
        "email": test_user.email,
        "password": "testpassword123"
    }
    response = await client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    token_data = response.json()
    
    return {
        "Authorization": f"Bearer {token_data['access_token']}"
    }


@pytest.fixture
async def admin_auth_headers(client: AsyncClient, test_admin_user: User) -> dict:
    """Générer les headers d'authentification admin pour les tests"""
    login_data = {
        "email": test_admin_user.email,
        "password": "adminpassword123"
    }
    response = await client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    token_data = response.json()
    
    return {
        "Authorization": f"Bearer {token_data['access_token']}"
    }


# Données de test réutilisables
TEST_USER_DATA = {
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "newpassword123"
}

TEST_LOGIN_DATA = {
    "email": "test@example.com",
    "password": "testpassword123"
}

TEST_INVALID_LOGIN_DATA = {
    "email": "test@example.com",
    "password": "wrongpassword"
}
