import os
from typing import List, Dict

class CountryConfig:
    def __init__(self, technical_api: bool = True, rgpd: bool = False, multi_language: bool = False, languages: List[str] = None):
        self.technical_api_enabled = technical_api
        self.rgpd_mode = rgpd
        self.multi_language = multi_language
        self.supported_languages = languages or ["en"]

class Settings:
    # Configuration de base
    PROJECT_NAME: str = "API COVID-19 & Mpox"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Configuration fixe par pays
    COUNTRY_CONFIGS: Dict[str, CountryConfig] = {
        "usa": CountryConfig(
            technical_api=True,
            rgpd=False,
            multi_language=False,
            languages=["en"]
        ),
        "france": CountryConfig(
            technical_api=False,
            rgpd=True,
            multi_language=False,
            languages=["fr"]
        ),
        "switzerland": CountryConfig(
            technical_api=False,
            rgpd=False,
            multi_language=True,
            languages=["fr", "de", "it"]
        )
    }
    
    # Configuration du pays actuel
    COUNTRY: str = os.getenv("COUNTRY")
    if not COUNTRY:
        raise ValueError("❌ COUNTRY environment variable is required")
    COUNTRY = COUNTRY.lower()
    
    @property
    def current_config(self) -> CountryConfig:
        if self.COUNTRY not in self.COUNTRY_CONFIGS:
            raise ValueError(f"❌ Invalid country: {self.COUNTRY}. Must be one of: {', '.join(self.COUNTRY_CONFIGS.keys())}")
        return self.COUNTRY_CONFIGS[self.COUNTRY]
    
    @property
    def TECHNICAL_API_ENABLED(self) -> bool:
        return self.current_config.technical_api_enabled
    
    @property
    def RGPD_MODE(self) -> bool:
        return self.current_config.rgpd_mode
    
    @property
    def MULTI_LANGUAGE(self) -> bool:
        return self.current_config.multi_language
    
    @property
    def SUPPORTED_LANGUAGES(self) -> List[str]:
        return self.current_config.supported_languages
    
    # Configuration de la base de données
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@db:5432/msprdatascience")
    
    # Configuration de sécurité
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Configuration CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

settings = Settings()