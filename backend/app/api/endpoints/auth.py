"""
Endpoints d'authentification
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    create_access_token, 
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    revoke_token
)
from app.crud.user import authenticate_user, create_user
from app.schemas.schemas import Token, UserCreate, UserRead, LoginRequest, MessageResponse

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Inscription d'un nouvel utilisateur
    """
    try:
        db_user = await create_user(db=db, user=user)
        return db_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
async def login_for_access_token(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Connexion avec email et mot de passe - génération du token JWT
    """
    user = await authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Compte utilisateur désactivé",
        )
    
    # Créer le token d'accès (utiliser l'email comme subject)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # en secondes
    }


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user = Depends(get_current_active_user)):
    """
    Récupère les informations de l'utilisateur connecté
    """
    return current_user


@router.get("/test-protected", response_model=MessageResponse)
async def test_protected_route(current_user = Depends(get_current_active_user)):
    """
    Route de test pour vérifier l'authentification
    """
    return MessageResponse(
        message=f"Hello {current_user.username}! This is a protected route.",
        detail=f"User ID: {current_user.user_id}, Admin: {current_user.is_admin}"
    )


@router.post("/logout", response_model=MessageResponse)
async def logout_user(request: Request, current_user = Depends(get_current_active_user)):
    """
    Déconnexion de l'utilisateur
    Révoque le token JWT côté serveur
    """
    # Extraire le token de l'header Authorization
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token manquant",
        )
    
    token = authorization.replace("Bearer ", "")
    
    # Révoquer le token
    revoke_token(token)
    
    return MessageResponse(
        message=f"Déconnexion réussie pour {current_user.username}",
        detail="Token révoqué côté serveur. Vous êtes maintenant déconnecté."
    )


@router.get("/test-login", response_model=MessageResponse)
async def test_login_simple():
    """
    Route de test simple pour vérifier que l'API fonctionne
    """
    return MessageResponse(
        message="API d'authentification opérationnelle",
        detail="Utilisez /login pour vous connecter"
    )
