#!/usr/bin/env python3
"""
Tests backend optimisés pour CI/CD
Teste seulement les fonctionnalités critiques et stables
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    """Lance les tests critiques pour la CI"""
    
    print("🚀 Tests Backend CI - MSPR Data Science")
    print("=" * 50)
    
    # Changer vers le répertoire backend
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Tests critiques pour la CI (rapides et stables)
    critical_tests = [
        # Tests de base - INDISPENSABLES
        "tests/test_general.py",
        
        # Tests auth - critiques pour sécurité
        "tests/test_auth.py::TestAuth::test_create_access_token",
        "tests/test_auth.py::TestAuth::test_verify_access_token_valid", 
        
        # Tests API de base - sans dépendances externes
        "tests/test_locations.py::TestLocationsAPI::test_get_countries_endpoint",
        
        # Tests core - configuration
        "tests/test_core.py::TestCoreDatabase::test_database_connection",
        "tests/test_core.py::TestCoreSecurity::test_hash_password",
    ]
    
    # Configuration pytest pour CI
    pytest_args = [
        "python", "-m", "pytest"
    ] + critical_tests + [
        "-v",                      # Verbose mais pas trop
        "--tb=short",             # Traceback courts
        "--disable-warnings",     # Pas de warnings pour la CI
        "--maxfail=3",           # Arrêter après 3 échecs
        "--durations=10",        # Show 10 slowest tests
        "--cov=app",             # Coverage sur app/
        "--cov-report=term",     # Report terminal simple
        "--cov-fail-under=50",   # Seuil bas pour CI (50%)
        "--quiet",               # Mode silencieux
    ]
    
    print("📋 Tests sélectionnés pour la CI:")
    for test in critical_tests:
        print(f"  ✓ {test}")
    print()
    
    try:
        # Lancer les tests
        print("🔄 Exécution des tests...")
        result = subprocess.run(
            pytest_args, 
            capture_output=False,
            text=True,
            cwd=backend_dir
        )
        
        print("\n" + "=" * 50)
        
        if result.returncode == 0:
            print("✅ TOUS LES TESTS CI ONT RÉUSSI !")
            print("🚀 Build prêt pour le déploiement")
            return 0
        else:
            print("❌ CERTAINS TESTS CI ONT ÉCHOUÉ")
            print("🔧 Vérifier les logs ci-dessus")
            return 1
            
    except Exception as e:
        print(f"❌ ERREUR lors de l'exécution: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
