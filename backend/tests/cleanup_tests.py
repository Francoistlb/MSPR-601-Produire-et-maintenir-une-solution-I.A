#!/usr/bin/env python3
"""
Script de nettoyage intelligent des tests
Supprime les fichiers de tests redondants ou inutiles
"""

import os
import shutil
from pathlib import Path

def main():
    """Nettoie les fichiers de tests en toute sécurité"""
    test_dir = Path(__file__).parent
    
    print("🧹 NETTOYAGE DES TESTS - MSPR Data Science")
    print("=" * 50)
    
    # Fichiers à supprimer (redondants ou obsolètes)
    files_to_remove = []
    
    # Les fichiers "simple" sont redondants avec les vrais tests
    simple_files = [
        "test_auth_simple.py",
        "test_core_simple.py", 
        "test_predictions_simple.py"
    ]
    
    # Vérifier quels fichiers existent
    for file_name in simple_files:
        file_path = test_dir / file_name
        if file_path.exists():
            files_to_remove.append(file_path)
    
    # Fichiers de cache Python obsolètes
    pycache_dirs = [
        test_dir / "__pycache__"
    ]
    
    # Afficher ce qui va être supprimé
    if files_to_remove:
        print("\n📁 FICHIERS DE TESTS À SUPPRIMER :")
        for file_path in files_to_remove:
            size = file_path.stat().st_size if file_path.exists() else 0
            print(f"  ❌ {file_path.name} ({size} bytes)")
    
    if any(d.exists() for d in pycache_dirs):
        print("\n📁 DOSSIERS DE CACHE À NETTOYER :")
        for cache_dir in pycache_dirs:
            if cache_dir.exists():
                cache_size = sum(f.stat().st_size for f in cache_dir.rglob('*') if f.is_file())
                print(f"  🗑️ {cache_dir.name}/ ({cache_size} bytes)")
    
    if not files_to_remove and not any(d.exists() for d in pycache_dirs):
        print("\n✅ Aucun fichier à nettoyer trouvé !")
        return
    
    # Confirmation
    print(f"\n⚠️  Voulez-vous supprimer ces {len(files_to_remove)} fichiers + caches ? (y/N): ", end="")
    confirmation = input().lower().strip()
    
    if confirmation != 'y':
        print("❌ Nettoyage annulé.")
        return
    
    # Suppression effective
    removed_count = 0
    
    # Supprimer les fichiers
    for file_path in files_to_remove:
        try:
            if file_path.exists():
                file_path.unlink()
                print(f"✅ Supprimé: {file_path.name}")
                removed_count += 1
        except Exception as e:
            print(f"❌ Erreur lors de la suppression de {file_path.name}: {e}")
    
    # Supprimer les caches
    for cache_dir in pycache_dirs:
        try:
            if cache_dir.exists():
                shutil.rmtree(cache_dir)
                print(f"✅ Cache supprimé: {cache_dir.name}/")
                removed_count += 1
        except Exception as e:
            print(f"❌ Erreur lors de la suppression du cache {cache_dir.name}: {e}")
    
    print(f"\n🎉 NETTOYAGE TERMINÉ ! {removed_count} éléments supprimés.")
    
    # Vérification finale
    print("\n📊 ÉTAT FINAL DES TESTS :")
    test_files = list(test_dir.glob("test_*.py"))
    print(f"  📋 {len(test_files)} fichiers de tests restants")
    
    for test_file in sorted(test_files):
        print(f"  ✅ {test_file.name}")

if __name__ == "__main__":
    main()
