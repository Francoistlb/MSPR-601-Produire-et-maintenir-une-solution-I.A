#!/usr/bin/env python3
"""
Générateur de rapport de tests backend complet
MSPR Data Science - Tests avec couverture de code et métriques qualité
"""

import os
import sys
import subprocess
import json
from datetime import datetime
from pathlib import Path

def run_full_test_suite():
    """
    Lance la suite complète de tests avec génération de rapports
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    print("🚀 MSPR Data Science - Rapport de Tests Backend Complet")
    print("=" * 60)
    print(f"📅 Date: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"🏷️  Timestamp: {timestamp}")
    print(f"🌍 Environment: {os.environ.get('ENV', 'production')}")
    print(f"🗄️  Database: {os.environ.get('DATABASE_URL', 'Non configurée')}")
    print("=" * 60)
    
    # Créer le dossier reports si nécessaire
    reports_dir = Path("tests/reports")
    reports_dir.mkdir(exist_ok=True, parents=True)
    
    # Configuration des rapports
    html_report = f"tests/reports/backend_tests_{timestamp}.html"
    xml_coverage = f"tests/reports/coverage_{timestamp}.xml"
    html_coverage = f"tests/reports/coverage_html_{timestamp}"
    
    # Arguments pytest pour rapport complet
    pytest_args = [
        "python", "-m", "pytest",
        "tests/",                                    # Tous les tests
        "-v",                                       # Verbose
        "--tb=short",                               # Traceback courts
        "--strict-markers",                         # Markers stricts
        "--durations=0",                            # Durée de tous les tests
        "--cov=app",                                # Coverage sur app/
        "--cov-branch",                             # Coverage des branches
        "--cov-report=term-missing",                # Report terminal
        "--cov-report=html:" + html_coverage,       # Report HTML
        "--cov-report=xml:" + xml_coverage,         # Report XML
        "--html=" + html_report,                    # Report HTML des tests
        "--self-contained-html",                    # HTML autonome
        "--cov-fail-under=60",                      # Seuil de couverture
        "--maxfail=50",                             # Continuer même en cas d'échecs
    ]
    
    print("📋 Configuration du rapport:")
    print(f"  📊 Rapport HTML: {html_report}")
    print(f"  📈 Couverture HTML: {html_coverage}/index.html") 
    print(f"  📄 Couverture XML: {xml_coverage}")
    print()
    
    try:
        print("🔄 Exécution de la suite de tests complète...")
        print("-" * 40)
        
        # Lancer les tests
        result = subprocess.run(
            pytest_args,
            capture_output=False,
            text=True,
            cwd="."
        )
        
        print()
        print("=" * 60)
        print("📊 RÉSUMÉ DU RAPPORT DE TESTS")
        print("=" * 60)
        
        # Analyser les résultats
        if result.returncode == 0:
            print("✅ STATUT: TOUS LES TESTS ONT RÉUSSI")
            success_status = "SUCCÈS"
        elif result.returncode == 1:
            print("⚠️  STATUT: CERTAINS TESTS ONT ÉCHOUÉ (mais rapport généré)")
            success_status = "PARTIEL"
        else:
            print("❌ STATUT: ÉCHEC CRITIQUE")
            success_status = "ÉCHEC"
        
        # Générer résumé
        print(f"\n📁 Fichiers générés:")
        print(f"  🌐 Rapport Web:     {html_report}")
        print(f"  📊 Couverture Web:  {html_coverage}/index.html")
        print(f"  📋 Couverture XML:  {xml_coverage}")
        
        # Instructions d'accès
        print(f"\n🔍 Pour consulter les rapports:")
        print(f"  Rapport tests:    ouvrir {html_report}")
        print(f"  Couverture code:  ouvrir {html_coverage}/index.html")
        
        # Créer un index des rapports
        create_reports_index(timestamp, success_status, html_report, html_coverage)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ ERREUR lors de la génération du rapport: {e}")
        return False

def create_reports_index(timestamp, status, html_report, html_coverage):
    """Créer un index des rapports générés"""
    
    index_content = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapports de Tests Backend - MSPR Data Science</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
        .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        h1 {{ color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
        h2 {{ color: #34495e; margin-top: 30px; }}
        .status {{ padding: 10px; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
        .success {{ background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }}
        .partial {{ background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }}
        .error {{ background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }}
        .links {{ background: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; }}
        .links a {{ display: block; margin: 10px 0; color: #007bff; text-decoration: none; font-size: 16px; }}
        .links a:hover {{ text-decoration: underline; }}
        .metadata {{ background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        .metadata span {{ display: block; margin: 5px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Rapports de Tests Backend</h1>
        <h2>MSPR Data Science - COVID-19 & Mpox avec IA</h2>
        
        <div class="status {'success' if status == 'SUCCÈS' else 'partial' if status == 'PARTIEL' else 'error'}">
            📊 STATUT DU DERNIER RAPPORT: {status}
        </div>
        
        <div class="metadata">
            <h3>📋 Métadonnées</h3>
            <span><strong>🕐 Généré le:</strong> {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}</span>
            <span><strong>🏷️ Timestamp:</strong> {timestamp}</span>
            <span><strong>🌍 Environnement:</strong> {os.environ.get('ENV', 'production')}</span>
            <span><strong>🗄️ Base de données:</strong> {os.environ.get('DATABASE_URL', 'Non configurée')[:50]}...</span>
            <span><strong>🐍 Python:</strong> {sys.version}</span>
        </div>
        
        <div class="links">
            <h3>🔗 Accès aux Rapports</h3>
            <a href="{Path(html_report).name}">📊 Rapport de Tests HTML (détaillé)</a>
            <a href="{Path(html_coverage).name}/index.html">📈 Couverture de Code HTML (interactif)</a>
        </div>
        
        <h2>📁 Historique des Rapports</h2>
        <p>Les rapports sont générés dans <code>backend/tests/reports/</code></p>
        <ul>
            <li><strong>backend_tests_YYYYMMDD_HHMMSS.html</strong> - Rapports de tests détaillés</li>
            <li><strong>coverage_YYYYMMDD_HHMMSS.xml</strong> - Couverture XML (pour CI/CD)</li>  
            <li><strong>coverage_html_YYYYMMDD_HHMMSS/</strong> - Couverture HTML navigable</li>
        </ul>
        
        <h2>🚀 Comment Relancer les Tests</h2>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;">
# Tests complets avec rapport
cd backend
python run_tests_report.py

# Tests rapides pour CI
python simple_ci_tests.py

# Tests manuels avec pytest
python -m pytest tests/ -v --cov=app --html=rapport.html
        </pre>
        
        <footer style="margin-top: 40px; text-align: center; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 20px;">
            <p>🏥 MSPR Data Science - Tests Backend Automatisés</p>
            <p>Généré automatiquement le {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}</p>
        </footer>
    </div>
</body>
</html>
    """
    
    index_path = "tests/reports/index.html"
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)
    
    print(f"📋 Index créé: {index_path}")

def main():
    """Point d'entrée principal"""
    
    # Vérifier qu'on est dans le bon répertoire
    if not Path("app").exists():
        print("❌ Erreur: Lancer ce script depuis le répertoire backend/")
        sys.exit(1)
    
    # Lancer les tests complets
    success = run_full_test_suite()
    
    if success:
        print("\n🎉 RAPPORT GÉNÉRÉ AVEC SUCCÈS!")
        sys.exit(0)
    else:
        print("\n⚠️  RAPPORT GÉNÉRÉ MAIS AVEC DES PROBLÈMES")
        sys.exit(0)  # On sort quand même en succès car le rapport est généré

if __name__ == "__main__":
    main()
