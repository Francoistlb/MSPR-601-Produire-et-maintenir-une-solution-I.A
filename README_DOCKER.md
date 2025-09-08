# Commandes Docker par pays

## France
```bash
# Démarrer les services (France)
docker-compose --env-file .env.france up -d --build

# Voir les logs (France)
docker-compose --env-file .env.france logs
```

## USA
```bash
# Démarrer les services (USA)
docker-compose --env-file .env.usa up -d --build

# Voir les logs (USA)
docker-compose --env-file .env.usa logs
```

## Suisse
```bash
# Démarrer les services (Suisse)
docker-compose --env-file .env.switzerland up -d --build

# Voir les logs (Suisse)
docker-compose --env-file .env.switzerland logs
```

## Italie
```bash
# Démarrer les services (Italie)
docker-compose --env-file env.italy up -d --build

# Voir les logs (Italie)
docker-compose --env-file env.italy logs
```

## Commandes générales
```bash
# Arrêter tous les services
docker-compose down

# Nettoyer complètement Docker (si changement de pays)
docker system prune -a --volumes
```

## Première installation uniquement
```bash
# Initialiser la base de données (une seule fois)
docker-compose exec backend python3 scripts/create_database.py
docker-compose exec backend bash -c "PYTHONPATH=/app python3 scripts/init_db.py"

# Importer les données (une seule fois)
docker-compose exec backend python3 scripts/import_db.py importCovid
docker-compose exec backend python3 scripts/import_db.py importMpox
```

## Accès aux services
- Frontend : http://localhost:8080/
- API Documentation : http://localhost:8080/docs
- PgAdmin (si activé) : http://localhost:8080/pgadmin/
  - Email : admin@exemple.com
  - Mot de passe : adminTest123

## Fonctionnalités par pays
- **France** : RGPD activé, API technique désactivée, Français uniquement
- **USA** : Toutes les fonctionnalités activées, Anglais uniquement
- **Suisse** : Multi-langues activé (fr, de, it), API technique désactivée
- **Italie** : RGPD activé, API technique désactivée, Italien uniquement
