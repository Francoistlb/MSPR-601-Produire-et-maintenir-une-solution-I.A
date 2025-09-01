import os
import sys

# Ajouter le dossier scripts au PYTHONPATH
scripts_dir = os.path.join(os.path.dirname(__file__), 'scripts')
sys.path.append(scripts_dir)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run.py [etl|init|createdb|importCovid|importMpox|predictions]")
        print("  createdb   - Crée la base de données")
        print("  init       - Crée toutes les tables")
        print("  importCovid - Importe les données COVID (nécessite init)")
        print("  importMpox  - Importe les données Mpox (nécessite init)")
        sys.exit(1)

    command = sys.argv[1]
    
    if command == "etl":
        import etl_script
        etl_script.main()
    elif command == "createdb":
        import create_database
    elif command == "initdb":
        import init_db
        import asyncio
        asyncio.run(init_db.init_db())
    elif command == "importCovid":
        import import_db
        import_db.insert_f_covid()
    elif command == "importMpox":
        import import_db
        import_db.insert_f_mpox()
    elif command == "importPrediCovid":
        import import_db
        import_db.insert_f_predi_covid()
    elif command == "predictions":
        import generate_predictions
        year = int(sys.argv[2]) if len(sys.argv) > 2 else 2025
        print(f"🎯 Génération des prédictions pour {year}...")
        predictions = generate_predictions.generate_predictions(year)
        print(f"✅ {len(predictions)} prédictions générées avec succès!")
    else:
        print("Commande non reconnue. Utilisez 'etl', 'createdb', 'init', 'importCovid', 'importMpox' ou 'predictions'.")
        sys.exit(1)