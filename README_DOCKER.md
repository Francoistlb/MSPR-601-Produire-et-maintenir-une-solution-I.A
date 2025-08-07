# Commande Docker : 

## Run les services :
docker-compose up -d --build 

## Stop les services : 
docker-compose down

## Voir les logs : 
docker-compmose logs

## Créer la bdd : 
docker-compose exec backend python3 scripts/create_database.py

## Init la bdd : 
docker-compose exec backend bash -c "PYTHONPATH=/app python3 scripts/init_db.py"

## Importer les données : 
docker-compose exec backend python3 scripts/import_db.py importCovid
docker-compose exec backend python3 scripts/import_db.py importMpox

## Accéder aux services :
http://localhost:8080/ -> Frontend react
http://localhost:8080/docs -> Swagger api
http://localhost:8080/pgadmin/ -> PgAdmin

