#!/bin/bash

# =============================================================================
# Script de sauvegarde PostgreSQL pour MSPR Data Science
# =============================================================================

# Configuration
CONTAINER_NAME="mspr_data_science_601s-db-1"
DB_NAME="msprdatascience"
DB_USER="postgres"
BACKUP_DIR="/backups/daily"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="backup_${DB_NAME}_${DATE}.sql"

echo "🔄 Début de la sauvegarde PostgreSQL - $(date)"
echo "📦 Container: $CONTAINER_NAME"
echo "🗃️  Base de données: $DB_NAME"
echo "📁 Destination: $BACKUP_DIR/$BACKUP_FILE"
echo "=" | tr '=' '-' | head -c 50; echo

# Vérifier que le conteneur est en marche
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ ERREUR: Le conteneur $CONTAINER_NAME n'est pas en cours d'exécution!"
    exit 1
fi

# Créer le dossier de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Exécuter pg_dump dans le conteneur PostgreSQL
echo "📤 Création du dump..."
docker exec "$CONTAINER_NAME" pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists > "$BACKUP_DIR/$BACKUP_FILE"

# Vérifier le résultat
if [ $? -eq 0 ] && [ -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
    FILE_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo "✅ Sauvegarde réussie!"
    echo "📊 Taille du fichier: $FILE_SIZE"
    echo "📁 Fichier créé: $BACKUP_DIR/$BACKUP_FILE"
    
    # Nettoyer les anciennes sauvegardes (garder les 7 dernières)
    echo "🧹 Nettoyage des anciennes sauvegardes..."
    find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql" -type f | sort | head -n -7 | xargs -r rm
    
    echo "🎉 Sauvegarde terminée avec succès - $(date)"
else
    echo "❌ ERREUR: La sauvegarde a échoué!"
    exit 1
fi
