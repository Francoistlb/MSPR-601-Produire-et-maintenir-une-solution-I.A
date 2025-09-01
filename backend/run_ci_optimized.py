#!/usr/bin/env python3
"""
Script de tests optimisé pour la CI - Version Pytest mais simplifiée
"""
import os
import subprocess
import sys
from pathlib import Path

# Configuration environnement de test AVANT TOUT
os.environ.setdefault("ENV", "test")
os.environ.setdefault("COUNTRY", "usa")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-ci-only")
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

def run_pytest_ci():
    """Exécute une version allégée de pytest pour la CI"""
    print("🧪 Lancement des tests Pytest CI...")
    
    # Tests spécifiques et stables uniquement
    test_files = [
        "tests/test_core.py",  # Tests de configuration (sans DB)
        "tests/test_auth.py",  # Tests d'authentification (simples)
    ]
    
    # Options pytest optimisées pour CI
    cmd = [
        "python", "-m", "pytest",
        "-v",                          # Verbose
        "--tb=short",                  # Traceback court
        "--disable-warnings",          # Pas de warnings pour la CI
        "--maxfail=3",                 # Arrêter après 3 échecs
        "--no-cov",                    # Pas de coverage pour la CI
        "--durations=10",              # Top 10 des tests les plus lents
    ] + test_files
    
    print(f"🔧 Commande: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=False, text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Erreur pytest: {e}")
        return False

def run_simple_health_test():
    """Test simple sans pytest - juste pour vérifier l'API"""
    print("🏥 Test de santé de l'API...")
    
    try:
        # Import et test basique de l'app
        from app.main import app
        from app.core.config import settings
        
        # Vérifications de base
        assert app is not None, "App FastAPI non créée"
        assert settings.project_name is not None, "Settings non chargés"
        
        print("✅ App et configuration OK")
        return True
        
    except Exception as e:
        print(f"❌ Échec test santé: {e}")
        return False

def main():
    """Point d'entrée principal"""
    print("=" * 50)
    print("🚀 TESTS CI BACKEND - Version Optimisée")
    print("=" * 50)
    
    # Test 1: Santé de base (toujours exécuté)
    health_ok = run_simple_health_test()
    
    if not health_ok:
        print("❌ Tests de santé échoués - ARRÊT")
        return False
    
    # Test 2: Pytest sur tests sélectionnés
    pytest_ok = run_pytest_ci()
    
    # Résumé final
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ FINAL CI")
    print("=" * 50)
    
    tests_results = {
        "Santé API": health_ok,
        "Tests Pytest": pytest_ok,
    }
    
    for name, result in tests_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {name}: {status}")
    
    all_passed = all(tests_results.values())
    overall_status = "✅ SUCCÈS" if all_passed else "❌ ÉCHEC"
    
    print(f"\n🎯 STATUT GLOBAL: {overall_status}")
    
    if all_passed:
        print("🎉 CI BACKEND PRÊT POUR LE DÉPLOIEMENT!")
    else:
        print("⚠️  Corrections nécessaires avant déploiement")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    exit_code = 0 if success else 1
    print(f"\n🔚 Code de sortie: {exit_code}")
    sys.exit(exit_code)
