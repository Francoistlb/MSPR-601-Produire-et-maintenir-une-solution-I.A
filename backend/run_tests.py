#!/usr/bin/env python3
"""
Script pour exécuter les tests backend avec génération de rapports
Usage: python run_tests.py
"""
import subprocess
import sys
import os
from datetime import datetime


def run_tests():
    """Exécute les tests avec génération de rapports HTML et couverture"""
    
    print("🧪 Lancement des tests backend...")
    print("=" * 50)
    
    # Créer le dossier reports s'il n'existe pas
    reports_dir = "reports"
    if not os.path.exists(reports_dir):
        os.makedirs(reports_dir)
    
    # Timestamp pour les rapports
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Configuration des rapports
    html_report = f"{reports_dir}/backend_tests_{timestamp}.html"
    coverage_html_dir = f"{reports_dir}/coverage_html_{timestamp}"
    coverage_xml = f"{reports_dir}/coverage_{timestamp}.xml"
    
    # Commande pytest avec tous les rapports
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/",                           # Dossier des tests
        "-v",                               # Mode verbose
        "--tb=short",                       # Traceback court
        f"--html={html_report}",            # Rapport HTML
        "--self-contained-html",            # HTML autonome
        "--cov=app",                        # Couverture du module app
        "--cov-report=html:" + coverage_html_dir,  # Rapport couverture HTML
        "--cov-report=xml:" + coverage_xml, # Rapport couverture XML
        "--cov-report=term-missing",        # Affichage terminal avec lignes manquantes
        "--cov-fail-under=70",              # Minimum 70% de couverture
        "--asyncio-mode=auto"               # Mode asyncio automatique
    ]
    
    print(f"📝 Commande: {' '.join(cmd)}")
    print()
    
    try:
        # Exécuter les tests
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Afficher la sortie
        print("📊 RÉSULTATS DES TESTS:")
        print("=" * 50)
        print(result.stdout)
        
        if result.stderr:
            print("⚠️  ERREURS:")
            print(result.stderr)
        
        # Résumé
        print("=" * 50)
        print("📈 RAPPORTS GÉNÉRÉS:")
        print(f"  - Tests HTML: {html_report}")
        print(f"  - Couverture HTML: {coverage_html_dir}/index.html")
        print(f"  - Couverture XML: {coverage_xml}")
        
        if result.returncode == 0:
            print("✅ Tous les tests sont passés!")
        else:
            print(f"❌ Échec des tests (code: {result.returncode})")
            
        return result.returncode
        
    except Exception as e:
        print(f"💥 Erreur lors de l'exécution: {e}")
        return 1


def main():
    """Point d'entrée principal"""
    print("🚀 BACKEND TESTS - MSPR Data Science")
    print("=" * 50)
    
    # Vérifier qu'on est dans le bon dossier
    if not os.path.exists("tests"):
        print("❌ Dossier 'tests' non trouvé. Exécutez depuis le dossier backend.")
        return 1
    
    # Exécuter les tests
    exit_code = run_tests()
    
    print("\n" + "=" * 50)
    if exit_code == 0:
        print("🎉 Tests terminés avec succès!")
    else:
        print("🔥 Des tests ont échoué. Vérifiez les rapports.")
    
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
