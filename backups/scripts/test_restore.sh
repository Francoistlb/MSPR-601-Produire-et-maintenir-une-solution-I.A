#!/bin/bash
# =============================================================================
# Script de test de restauration PostgreSQL pour MSPR Data Science
# =============================================================================

# Configuration
CONTAINER_NAME="mspr_data_science_601s-db-1"
DB_NAME="msprdatascience"
DB_USER="postgres"
BACKUP_DIR="./backups/daily"
TEST_DB="test_restore_db"

echo "🧪 Test de restauration PostgreSQL - $(date)"
echo "📦 Container: $CONTAINER_NAME"
echo "🗃️  Base de données de test: $TEST_DB"
echo "$(printf '%50s' | tr ' ' '-')"

# Vérifier que le conteneur est en marche
if ! docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
    echo "❌ ERREUR: Le conteneur $CONTAINER_NAME n'est pas en cours d'exécution!"
    exit 1
fi

# Trouver le fichier de sauvegarde le plus récent
LATEST_BACKUP=$(find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql" -type f -exec ls -t {} + | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ ERREUR: Aucune sauvegarde trouvée dans $BACKUP_DIR"
    exit 1
fi

echo "📂 Utilisation de la sauvegarde: $(basename "$LATEST_BACKUP")"
echo "📊 Taille du fichier: $(du -h "$LATEST_BACKUP" | cut -f1)"

# Créer une base de données de test
echo "🏗️  Création de la base de données de test..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $TEST_DB;" postgres
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -c "CREATE DATABASE $TEST_DB;" postgres

if [ $? -ne 0 ]; then
    echo "❌ ERREUR: Impossible de créer la base de données de test!"
    exit 1
fi

# Restaurer la sauvegarde dans la base de test
echo "♻️  Restauration de la sauvegarde..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$TEST_DB" < "$LATEST_BACKUP"

if [ $? -ne 0 ]; then
    echo "❌ ERREUR: La restauration a échoué!"
    # Nettoyer la base de test
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $TEST_DB;" postgres
    exit 1
fi

# Vérifier les tables restaurées
echo "🔍 Vérification des tables restaurées..."
TABLES_COUNT=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$TEST_DB" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")

if [ -n "$TABLES_COUNT" ] && [ "$TABLES_COUNT" -gt 0 ]; then
    echo "✅ Restauration réussie!"
    echo "📊 Nombre de tables restaurées: $TABLES_COUNT"
    
    # Lister les tables
    echo "📋 Tables disponibles:"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$TEST_DB" -c "\dt"
    
    echo "🎉 Test de restauration terminé avec succès!"
else
    echo "❌ ERREUR: Aucune table trouvée dans la base restaurée!"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $TEST_DB;" postgres
    exit 1
fi

# Nettoyer la base de test
echo "🧹 Nettoyage de la base de données de test..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $TEST_DB;" postgres

echo "✅ Test de restauration terminé - $(date)"
