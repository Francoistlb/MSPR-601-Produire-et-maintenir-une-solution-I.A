#!/usr/bin/env python3
"""
Tests simplifiés pour la CI - Sans base de données complexe
"""
import os
import sys
from pathlib import Path

# Ajouter le répertoire app au PATH pour les imports
sys.path.insert(0, str(Path(__file__).parent.parent / "app"))

# Variables d'environnement pour les tests
os.environ.setdefault("ENV", "test")
os.environ.setdefault("COUNTRY", "usa") 
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("COVID_DATA_URL", "https://disease.sh/v3/covid-19/")
os.environ.setdefault("MPOX_KAGGLE_DATASET", "test-dataset")
os.environ.setdefault("ENABLE_TECHNICAL_API", "true")
os.environ.setdefault("ENABLE_DATAVIZ", "true")
os.environ.setdefault("RGPD_COMPLIANCE", "false")
os.environ.setdefault("MULTI_LANGUAGE", "false")
os.environ.setdefault("SUPPORTED_LANGUAGES", "en")

def test_basic_imports():
    """Test que les modules de base s'importent correctement"""
    try:
        from app.core.config import Settings
        settings = Settings()
        assert settings is not None
        print("✅ Settings importé et chargé")
        return True
    except Exception as e:
        print(f"❌ Erreur import Settings: {e}")
        return False

def test_app_creation():
    """Test que l'app FastAPI se crée correctement"""
    try:
        from app.main import app
        assert app is not None
        assert hasattr(app, 'routes')
        print("✅ App FastAPI créée")
        return True
    except Exception as e:
        print(f"❌ Erreur création app: {e}")
        return False

def test_security_functions():
    """Test des fonctions de sécurité de base"""
    try:
        from app.core.security import create_access_token
        
        # Test de création de token
        test_data = {"sub": "test@example.com"}
        token = create_access_token(test_data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 20
        
        print("✅ Sécurité JWT fonctionne")
        return True
    except Exception as e:
        print(f"❌ Erreur sécurité: {e}")
        return False

def run_basic_tests():
    """Exécute les tests de base"""
    print("🚀 Lancement des tests de base CI...")
    
    tests = [
        ("Configuration", test_basic_imports),
        ("Application", test_app_creation), 
        ("Sécurité", test_security_functions),
    ]
    
    results = {}
    for name, test_func in tests:
        print(f"\n🔍 Test {name}...")
        try:
            results[name] = test_func()
        except Exception as e:
            print(f"❌ Échec {name}: {e}")
            results[name] = False
    
    # Résumé
    print(f"\n📊 RÉSUMÉ DES TESTS:")
    total_tests = len(results)
    passed_tests = sum(1 for passed in results.values() if passed)
    
    for name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {name}: {status}")
    
    success_rate = (passed_tests / total_tests) * 100
    print(f"\n🎯 Score: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
    
    if passed_tests >= total_tests * 0.8:  # 80% minimum
        print("✅ Tests CI RÉUSSIS - Prêt pour le déploiement!")
        return True
    else:
        print("❌ Tests CI ÉCHOUÉS - Corrections nécessaires")
        return False

if __name__ == "__main__":
    success = run_basic_tests()
    sys.exit(0 if success else 1)
