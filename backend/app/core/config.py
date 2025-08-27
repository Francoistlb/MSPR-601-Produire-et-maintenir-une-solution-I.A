"""
Configuration par environnement et par pays
"""
import os
from enum import Enum
from typing import Optional, List
from pydantic import BaseSettings


class CountryConfig(str, Enum):
    USA = "usa"
    FRANCE = "france" 
    SWITZERLAND = "switzerland"


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Configuration générale de l'application"""
    
    # Environnement
    ENV: Environment = Environment.DEVELOPMENT
    COUNTRY: CountryConfig = CountryConfig.USA
    
    # Base de données
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/mspr_db"
    
    # Sécurité
    SECRET_KEY: str = "dev-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API externe
    COVID_DATA_URL: str = ""
    MPOX_KAGGLE_DATASET: str = ""
    
    # Monitoring
    ENABLE_METRICS: bool = True
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"


class CountrySpecificSettings:
    """Configuration spécifique par pays selon les exigences"""
    
    @staticmethod
    def get_enabled_services(country: CountryConfig) -> dict:
        """Retourne les services activés selon le pays"""
        
        services = {
            "api_core": True,          # API principale (toujours activée)
            "api_technical": True,     # API technique
            "dataviz": True,          # Visualisation de données
            "frontend": True,         # Interface utilisateur
            "pgadmin": False,         # Administration DB (dev uniquement)
        }
        
        if country == CountryConfig.USA:
            # États-Unis : Tous les services activés
            services.update({
                "api_technical": True,
                "dataviz": True,
                "high_volume_processing": True,  # Gestion gros volumes
            })
            
        elif country == CountryConfig.FRANCE:
            # France : Pas d'API technique, focus RGPD
            services.update({
                "api_technical": False,  # Pas de spécialiste
                "dataviz": True,
                "rgpd_compliance": True,
                "mobile_optimized": True,
            })
            
        elif country == CountryConfig.SWITZERLAND:
            # Suisse : Pas de Dataviz ni API technique, multi-langues
            services.update({
                "api_technical": False,
                "dataviz": False,
                "multi_language": True,  # FR, DE, IT
            })
        
        return services
    
    @staticmethod
    def get_supported_languages(country: CountryConfig) -> List[str]:
        """Retourne les langues supportées par pays"""
        
        language_mapping = {
            CountryConfig.USA: ["en"],
            CountryConfig.FRANCE: ["fr"],
            CountryConfig.SWITZERLAND: ["fr", "de", "it"]
        }
        
        return language_mapping.get(country, ["en"])
    
    @staticmethod
    def get_compliance_requirements(country: CountryConfig) -> dict:
        """Retourne les exigences de conformité par pays"""
        
        compliance = {
            CountryConfig.USA: {
                "data_retention_days": 2555,  # 7 ans
                "encryption_required": True,
                "audit_logs": True,
            },
            CountryConfig.FRANCE: {
                "rgpd_compliance": True,
                "data_retention_days": 1095,  # 3 ans max RGPD
                "encryption_required": True,
                "audit_logs": True,
                "right_to_be_forgotten": True,
                "data_portability": True,
            },
            CountryConfig.SWITZERLAND: {
                "data_retention_days": 1825,  # 5 ans
                "encryption_required": True,
                "audit_logs": True,
                "multi_language_privacy_policy": True,
            }
        }
        
        return compliance.get(country, {})


# Instance globale des paramètres
settings = Settings()

# Configuration spécifique au pays sélectionné
country_config = CountrySpecificSettings.get_enabled_services(settings.COUNTRY)
supported_languages = CountrySpecificSettings.get_supported_languages(settings.COUNTRY)
compliance_requirements = CountrySpecificSettings.get_compliance_requirements(settings.COUNTRY)
