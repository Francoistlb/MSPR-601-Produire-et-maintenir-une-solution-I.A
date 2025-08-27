# =============================================================================
# Script de test de restauration PostgreSQL pour MSPR Data Science (PowerShell)
# =============================================================================

# Configuration
$CONTAINER_NAME = "mspr_data_science_601s-db-1"
$DB_NAME = "msprdatascience"
$DB_USER = "postgres"
$BACKUP_DIR = ".\backups\daily"
$TEST_DB = "test_restore_db"

Write-Host "Test de restauration PostgreSQL - $(Get-Date)" -ForegroundColor Green
Write-Host "Container: $CONTAINER_NAME" -ForegroundColor Yellow
Write-Host "Base de donnees de test: $TEST_DB" -ForegroundColor Yellow
Write-Host $("-" * 50) -ForegroundColor Gray

# Verifier que le conteneur est en marche
$containerRunning = docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}" | Select-String $CONTAINER_NAME

if (-not $containerRunning) {
    Write-Host "ERREUR: Le conteneur $CONTAINER_NAME n'est pas en cours d'execution!" -ForegroundColor Red
    exit 1
}

# Trouver le fichier de sauvegarde le plus recent
$latestBackup = Get-ChildItem "$BACKUP_DIR\backup_${DB_NAME}_*.sql" | Sort-Object CreationTime -Descending | Select-Object -First 1

if (-not $latestBackup) {
    Write-Host "ERREUR: Aucune sauvegarde trouvee dans $BACKUP_DIR" -ForegroundColor Red
    exit 1
}

Write-Host "Utilisation de la sauvegarde: $($latestBackup.Name)" -ForegroundColor Yellow
$fileSizeFormatted = "{0:N2} KB" -f ($latestBackup.Length / 1KB)
Write-Host "Taille du fichier: $fileSizeFormatted" -ForegroundColor Yellow

# Creer une base de donnees de test
Write-Host "Creation de la base de donnees de test..." -ForegroundColor Blue

try {
    docker exec $CONTAINER_NAME psql -U $DB_USER -c "DROP DATABASE IF EXISTS $TEST_DB;" postgres | Out-Null
    docker exec $CONTAINER_NAME psql -U $DB_USER -c "CREATE DATABASE $TEST_DB;" postgres | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        throw "Erreur lors de la creation de la base de donnees"
    }
    
    # Restaurer la sauvegarde dans la base de test
    Write-Host "Restauration de la sauvegarde..." -ForegroundColor Blue
    
    Get-Content $latestBackup.FullName | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $TEST_DB
    
    if ($LASTEXITCODE -ne 0) {
        throw "Erreur lors de la restauration"
    }
    
    # Verifier les tables restaurees
    Write-Host "Verification des tables restaurees..." -ForegroundColor Blue
    
    $tablesResult = docker exec $CONTAINER_NAME psql -U $DB_USER -d $TEST_DB -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
    $tablesCount = ($tablesResult | Out-String).Trim()
    
    if ($tablesCount -and [int]$tablesCount -gt 0) {
        Write-Host "Restauration reussie!" -ForegroundColor Green
        Write-Host "Nombre de tables restaurees: $tablesCount" -ForegroundColor Yellow
        
        # Lister les tables
        Write-Host "Tables disponibles:" -ForegroundColor Yellow
        docker exec $CONTAINER_NAME psql -U $DB_USER -d $TEST_DB -c "\dt"
        
        Write-Host "Test de restauration termine avec succes!" -ForegroundColor Green
    } else {
        Write-Host "ERREUR: Aucune table trouvee dans la base restauree!" -ForegroundColor Red
        docker exec $CONTAINER_NAME psql -U $DB_USER -c "DROP DATABASE IF EXISTS $TEST_DB;" postgres | Out-Null
        exit 1
    }
    
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    docker exec $CONTAINER_NAME psql -U $DB_USER -c "DROP DATABASE IF EXISTS $TEST_DB;" postgres | Out-Null
    exit 1
}

# Nettoyer la base de test
Write-Host "Nettoyage de la base de donnees de test..." -ForegroundColor Blue
docker exec $CONTAINER_NAME psql -U $DB_USER -c "DROP DATABASE IF EXISTS $TEST_DB;" postgres | Out-Null

Write-Host "Test de restauration termine - $(Get-Date)" -ForegroundColor Green
