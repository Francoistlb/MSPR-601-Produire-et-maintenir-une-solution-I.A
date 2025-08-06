from pydantic import BaseModel, ConfigDict, Field, validator, EmailStr
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

# ----------- Enums et Constantes -----------#
class IndicateurType(str, Enum):
    NEW_CASES = "new_cases"
    NEW_DEATHS = "new_deaths"
    COUNTRIES_REPORTING = "countries_reporting"

# ----------- d_location -----------#
class DLocationBase(BaseModel):
    location_name: str

class DLocationCreate(DLocationBase):
    pass

class DLocationRead(DLocationBase):
    location_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------- f_covid -----------#
class FCovidBase(BaseModel):
    date: date
    location_id: int
    total_cases: Optional[float] = None
    new_cases: Optional[float] = None
    total_deaths: Optional[float] = None
    new_deaths: Optional[float] = None
    icu_patients: Optional[float] = None
    hosp_patients: Optional[float] = None
    total_vaccinations: Optional[float] = None
    people_vaccinated: Optional[float] = None

class FCovidCreate(FCovidBase):
    pass

class FCovidRead(FCovidBase):
    covid_fact_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------- f_mpox -----------#
class FMpoxBase(BaseModel):
    date: date
    location_id: int
    total_cases: Optional[float] = None
    total_deaths: Optional[float] = None
    new_cases: Optional[float] = None
    new_deaths: Optional[float] = None
    new_cases_smoothed: Optional[float] = None
    new_deaths_smoothed: Optional[float] = None
    new_cases_per_million: Optional[float] = None
    total_cases_per_million: Optional[float] = None
    new_cases_smoothed_per_million: Optional[float] = None
    new_deaths_per_million: Optional[float] = None
    total_deaths_per_million: Optional[float] = None
    new_deaths_smoothed_per_million: Optional[float] = None

class FMpoxCreate(FMpoxBase):
    pass

class FMpoxRead(FMpoxBase):
    mpox_fact_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------- f_predi_covid -----------#
class FPrediCovidBase(BaseModel):
    date_predite: date
    date_generation: Optional[datetime] = None
    location_id: int
    indicateur: IndicateurType
    valeur_predite: float = Field(..., ge=0, description="Valeur prédite (doit être positive)")
    model_name: str

    @validator('date_predite')
    def validate_date_predite(cls, v):
        if v < date(2020, 1, 1):
            raise ValueError("La date de prédiction doit être postérieure à 2020")
        return v

class FPrediCovidCreate(FPrediCovidBase):
    pass

class FPrediCovidRead(FPrediCovidBase):
    pred_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------- Request Models -----------#
class PredictionFilters(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(100, gt=0, le=1000)
    location_id: Optional[int] = None
    indicateur: Optional[IndicateurType] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    pays: Optional[str] = None

    @validator('date_fin')
    def validate_dates(cls, v, values):
        if v and 'date_debut' in values and values['date_debut']:
            if v < values['date_debut']:
                raise ValueError("La date de fin doit être postérieure à la date de début")
        return v

    @validator('limit')
    def validate_limit(cls, v):
        if v > 1000:
            raise ValueError("La limite maximale est de 1000 enregistrements")
        return v


# ----------- Authentication Schemas -----------#
class UserBase(BaseModel):
    """Schéma de base pour les utilisateurs"""
    username: str = Field(..., min_length=3, max_length=50, description="Nom d'utilisateur (3-50 caractères)")
    email: EmailStr = Field(..., description="Adresse email valide")

    @validator('username')
    def validate_username(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError("Le nom d'utilisateur ne peut contenir que des lettres, chiffres, _ et -")
        return v.lower()


class UserCreate(UserBase):
    """Schéma pour la création d'un utilisateur"""
    password: str = Field(..., min_length=6, max_length=100, description="Mot de passe (6-100 caractères)")

    @validator('password')
    def validate_password(cls, v):
        if not any(c.isdigit() for c in v):
            raise ValueError("Le mot de passe doit contenir au moins un chiffre")
        if not any(c.isalpha() for c in v):
            raise ValueError("Le mot de passe doit contenir au moins une lettre")
        return v


class UserRead(UserBase):
    """Schéma pour la lecture d'un utilisateur (sans mot de passe)"""
    user_id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Schéma pour la mise à jour d'un utilisateur"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None


class LoginRequest(BaseModel):
    """Schéma pour les données de connexion"""
    email: EmailStr = Field(..., description="Adresse email")
    password: str = Field(..., description="Mot de passe")


class Token(BaseModel):
    """Schéma pour le token JWT"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Durée de validité du token en secondes")


class TokenData(BaseModel):
    """Schéma pour les données contenues dans le token"""
    username: Optional[str] = None


class AuthResponse(BaseModel):
    """Schéma pour la réponse d'authentification réussie"""
    user: UserRead
    token: Token
    message: str = "Connexion réussie"


class MessageResponse(BaseModel):
    """Schéma pour les réponses avec message"""
    message: str
    detail: Optional[str] = None