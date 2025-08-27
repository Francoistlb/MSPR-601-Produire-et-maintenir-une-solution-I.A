# =============================================================================
# Script de sauvegarde PostgreSQL pour MSPR Data Science (PowerShell)
# =============================================================================

# Configuration
$CONTAINER_NAME = "mspr_data_science_601s-db-1"
$DB_NAME = "msprdatascience"
$DB_USER = "postgres"
$BACKUP_DIR = ".\backups\daily"
$DATE = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BACKUP_FILE = "backup_${DB_NAME}_${DATE}.sql"

Write-Host "Debut de la sauvegarde PostgreSQL - $(Get-Date)" -ForegroundColor Green
Write-Host "Container: $CONTAINER_NAME" -ForegroundColor Yellow
Write-Host "Base de donnees: $DB_NAME" -ForegroundColor Yellow
Write-Host "Destination: $BACKUP_DIR\$BACKUP_FILE" -ForegroundColor Yellow
Write-Host $("-" * 50) -ForegroundColor Gray

# Verifier que le conteneur est en marche
$containerRunning = docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}" | Select-String $CONTAINER_NAME

if (-not $containerRunning) {
    Write-Host "ERREUR: Le conteneur $CONTAINER_NAME n'est pas en cours d'execution!" -ForegroundColor Red
    exit 1
}

# Creer le dossier de sauvegarde s'il n'existe pas
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

# Executer pg_dump dans le conteneur PostgreSQL
Write-Host "Creation du dump..." -ForegroundColor Blue

$dumpCommand = "pg_dump -U $DB_USER -d $DB_NAME --verbose --no-owner --no-acl --clean --if-exists"

try {
    docker exec $CONTAINER_NAME bash -c $dumpCommand | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Encoding UTF8
    
    # Verifier le resultat
    if (Test-Path "$BACKUP_DIR\$BACKUP_FILE") {
        $fileSize = (Get-Item "$BACKUP_DIR\$BACKUP_FILE").Length
        if ($fileSize -gt 0) {
            $fileSizeFormatted = "{0:N2} KB" -f ($fileSize / 1KB)
            Write-Host "Sauvegarde reussie!" -ForegroundColor Green
            Write-Host "Taille du fichier: $fileSizeFormatted" -ForegroundColor Yellow
            Write-Host "Fichier cree: $BACKUP_DIR\$BACKUP_FILE" -ForegroundColor Yellow
            
            # Nettoyer les anciennes sauvegardes (garder les 7 dernieres)
            Write-Host "Nettoyage des anciennes sauvegardes..." -ForegroundColor Blue
            $oldBackups = Get-ChildItem "$BACKUP_DIR\backup_${DB_NAME}_*.sql" | Sort-Object CreationTime | Select-Object -SkipLast 7
            if ($oldBackups) {
                $oldBackups | Remove-Item
                Write-Host "Supprime $($oldBackups.Count) anciennes sauvegardes" -ForegroundColor Gray
            }
            
            Write-Host "Sauvegarde terminee avec succes - $(Get-Date)" -ForegroundColor Green
        } else {
            Write-Host "ERREUR: Le fichier de sauvegarde est vide!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "ERREUR: Le fichier de sauvegarde n'a pas ete cree!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERREUR: La sauvegarde a echoue - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
