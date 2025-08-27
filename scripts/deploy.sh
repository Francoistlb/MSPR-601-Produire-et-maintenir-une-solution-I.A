#!/bin/bash

# Script de déploiement automatisé pour différents pays
# Usage: ./scripts/deploy.sh [usa|france|switzerland] [staging|production]

set -e  # Arrêter en cas d'erreur

COUNTRY=${1:-usa}
ENVIRONMENT=${2:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Déploiement pour $COUNTRY en environnement $ENVIRONMENT"
echo "=================================================="

# Validation des paramètres
if [[ ! "$COUNTRY" =~ ^(usa|france|switzerland)$ ]]; then
    echo "❌ Pays invalide. Utilisez: usa, france, ou switzerland"
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "❌ Environnement invalide. Utilisez: staging ou production"
    exit 1
fi

# Fonction de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction de vérification des prérequis
check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker n'est pas installé"
        exit 1
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose n'est pas installé"
        exit 1
    fi
    
    # Vérifier les fichiers de configuration
    if [[ ! -f "$PROJECT_ROOT/.env.$COUNTRY" ]]; then
        echo "❌ Fichier de configuration .env.$COUNTRY manquant"
        exit 1
    fi
    
    if [[ ! -f "$PROJECT_ROOT/docker-compose.$COUNTRY.yml" ]]; then
        echo "❌ Fichier docker-compose.$COUNTRY.yml manquant"
        exit 1
    fi
    
    log "✅ Prérequis validés"
}

# Fonction de backup avant déploiement
backup_data() {
    log "💾 Sauvegarde des données avant déploiement..."
    
    BACKUP_DIR="$PROJECT_ROOT/backups/$(date +'%Y%m%d_%H%M%S')_$COUNTRY"
    mkdir -p "$BACKUP_DIR"
    
    # Backup de la base de données
    if docker-compose -f "docker-compose.$COUNTRY.yml" ps db | grep -q "Up"; then
        log "📊 Sauvegarde de la base de données..."
        docker-compose -f "docker-compose.$COUNTRY.yml" exec -T db pg_dump \
            -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > "$BACKUP_DIR/database_backup.sql"
        
        # Backup des volumes
        log "📁 Sauvegarde des volumes..."
        docker run --rm \
            -v "$(basename "$PROJECT_ROOT")_postgres-data-$COUNTRY":/data \
            -v "$BACKUP_DIR":/backup \
            alpine tar czf /backup/postgres_volume.tar.gz -C /data .
    fi
    
    log "✅ Sauvegarde terminée: $BACKUP_DIR"
    echo "$BACKUP_DIR" > "$PROJECT_ROOT/.last_backup_path"
}

# Fonction de tests avant déploiement
run_tests() {
    log "🧪 Exécution des tests..."
    
    # Tests backend
    cd "$PROJECT_ROOT/backend"
    if [[ -f "requirements.txt" ]]; then
        python -m pytest tests/ -v --tb=short
    fi
    
    # Tests frontend
    cd "$PROJECT_ROOT/frontend"
    if [[ -f "package.json" ]]; then
        npm test -- --watchAll=false
    fi
    
    cd "$PROJECT_ROOT"
    log "✅ Tests réussis"
}

# Fonction de déploiement
deploy() {
    log "🔧 Démarrage du déploiement..."
    
    # Charger les variables d'environnement
    set -a
    source ".env.$COUNTRY"
    set +a
    
    # Arrêter les services existants
    log "⏹️  Arrêt des services existants..."
    docker-compose -f "docker-compose.$COUNTRY.yml" down --remove-orphans
    
    # Nettoyer les images obsolètes
    log "🧹 Nettoyage des images obsolètes..."
    docker system prune -f
    
    # Construire les nouvelles images
    log "🏗️  Construction des images..."
    docker-compose -f "docker-compose.$COUNTRY.yml" build --no-cache
    
    # Démarrer les services
    log "▶️  Démarrage des services..."
    docker-compose -f "docker-compose.$COUNTRY.yml" up -d
    
    # Attendre que les services soient prêts
    log "⏳ Attente de la disponibilité des services..."
    sleep 30
    
    # Vérifier la santé des services
    check_health
}

# Fonction de vérification de santé
check_health() {
    log "🏥 Vérification de la santé des services..."
    
    # Vérifier le backend
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://localhost/health" > /dev/null; then
            log "✅ Backend opérationnel"
            break
        fi
        
        log "⏳ Tentative $attempt/$max_attempts - Backend pas encore prêt"
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log "❌ Échec de vérification de santé du backend"
        rollback
        exit 1
    fi
    
    # Vérifier la base de données
    if docker-compose -f "docker-compose.$COUNTRY.yml" exec -T db pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"; then
        log "✅ Base de données opérationnelle"
    else
        log "❌ Problème avec la base de données"
        rollback
        exit 1
    fi
}

# Fonction de rollback
rollback() {
    log "🔄 Rollback en cours..."
    
    if [[ -f "$PROJECT_ROOT/.last_backup_path" ]]; then
        BACKUP_PATH=$(cat "$PROJECT_ROOT/.last_backup_path")
        
        # Arrêter les services
        docker-compose -f "docker-compose.$COUNTRY.yml" down
        
        # Restaurer la base de données
        if [[ -f "$BACKUP_PATH/database_backup.sql" ]]; then
            log "📊 Restauration de la base de données..."
            docker-compose -f "docker-compose.$COUNTRY.yml" up -d db
            sleep 10
            docker-compose -f "docker-compose.$COUNTRY.yml" exec -T db psql \
                -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" < "$BACKUP_PATH/database_backup.sql"
        fi
        
        log "✅ Rollback terminé"
    else
        log "⚠️  Aucune sauvegarde trouvée pour le rollback"
    fi
}

# Fonction de nettoyage post-déploiement
cleanup() {
    log "🧹 Nettoyage post-déploiement..."
    
    # Nettoyer les images non utilisées
    docker image prune -f
    
    # Supprimer les anciens backups (garder les 5 derniers)
    find "$PROJECT_ROOT/backups" -type d -name "*_$COUNTRY" | sort -r | tail -n +6 | xargs -r rm -rf
    
    log "✅ Nettoyage terminé"
}

# Fonction principale
main() {
    cd "$PROJECT_ROOT"
    
    # Charger les variables d'environnement
    if [[ -f ".env.$COUNTRY" ]]; then
        set -a
        source ".env.$COUNTRY"
        set +a
    fi
    
    check_prerequisites
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        backup_data
        run_tests
    fi
    
    deploy
    cleanup
    
    log "🎉 Déploiement réussi pour $COUNTRY en $ENVIRONMENT !"
    log "📊 URL: http://localhost (ou votre domaine de production)"
    
    # Afficher les informations de monitoring
    if [[ "$COUNTRY" == "usa" ]]; then
        log "📈 Monitoring: http://localhost:3000 (Grafana)"
        log "🔍 Métriques: http://localhost:9090 (Prometheus)"
    fi
}

# Gestion des signaux pour cleanup
trap cleanup EXIT

# Exécution
main "$@"
