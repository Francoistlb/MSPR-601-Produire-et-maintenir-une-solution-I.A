# backend/tests/conftest.py
"""
Configuration des tests pour l'API COVID-19 & Mpox
"""
import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import get_db, Base
from app.models.models import User, DLocation
from app.core.security import get_password_hash

# DB de test (sqlite async)
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    # connect_args peut être omis avec aiosqlite ; on le garde par sécurité
    connect_args={"check_same_thread": False}
)

TestSessionLocal = sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 👉 Si tu utilises pytest-asyncio récent, tu peux supprimer complètement cette fixture event_loop.
@pytest.fixture(scope="session")
def event_loop() -> Generator:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    # Création du schéma pour chaque test
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    # Cleanup du schéma après chaque test
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    # ⚠️ override get_db doit YIELD la session dans un générateur async
    async def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    # httpx >= 0.28 : passer par ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
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

@pytest_asyncio.fixture
async def test_admin_user(db_session: AsyncSession) -> User:
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

@pytest_asyncio.fixture
async def test_location(db_session: AsyncSession) -> DLocation:
    location = DLocation(location_name="France")
    db_session.add(location)
    await db_session.commit()
    await db_session.refresh(location)
    return location

@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient, test_user: User) -> dict:
    login_data = {"email": test_user.email, "password": "testpassword123"}
    resp = await client.post("/api/auth/login", json=login_data)
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture
async def admin_auth_headers(client: AsyncClient, test_admin_user: User) -> dict:
    login_data = {"email": test_admin_user.email, "password": "adminpassword123"}
    resp = await client.post("/api/auth/login", json=login_data)
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# Données réutilisables (inchangé)
TEST_USER_DATA = {
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "newpassword123"
}
TEST_LOGIN_DATA = {"email": "test@example.com", "password": "testpassword123"}
TEST_INVALID_LOGIN_DATA = {"email": "test@example.com", "password": "wrongpassword"}
