from functools import wraps
from fastapi import HTTPException, status
from app.core.config import settings

def check_technical_api():
    """
    Décorateur pour vérifier si l'API technique est activée pour le pays actuel
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not settings.TECHNICAL_API_ENABLED:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Technical API is not enabled for country: {settings.COUNTRY}"
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def check_rgpd_compliance():
    """
    Décorateur pour vérifier la conformité RGPD
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if settings.RGPD_MODE:
                # Ajouter ici la logique de conformité RGPD
                pass
            return await func(*args, **kwargs)
        return wrapper
    return decorator
