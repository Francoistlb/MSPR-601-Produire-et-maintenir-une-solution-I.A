# 🔄 Procédure de restauration - MSPR Data Science

Cette procédure détaille comment restaurer le système d'analyse COVID-19 et Mpox avec IA prédictive à partir de sauvegardes.

## 📋 Vue d'ensemble

La restauration peut être nécessaire dans les cas suivants :
- **Corruption de la base de données**
- **Perte de données accidentelle**
- **Migration vers un nouveau serveur**
- **Retour à un état antérieur stable**
- **Récupération après incident**

## 🎯 Types de restauration

### 1. Restauration complète de la base de données
### 2. Restauration sélective de tables
### 3. Restauration des modèles ML
### 4. Restauration de configuration

## 📁 Structure des sauvegardes

```
backups/
├── daily/                          # Sauvegardes quotidiennes automatiques
│   ├── backup_msprdatascience_2025-01-15_03-00-00.sql
│   ├── backup_msprdatascience_2025-01-16_03-00-00.sql
│   └── ...
├── scripts/                        # Scripts de sauvegarde/restauration
│   ├── postgres_backup.ps1         # Sauvegarde PostgreSQL
│   ├── test_restore.ps1            # Test de restauration
│   └── backup_manager.ps1          # Gestionnaire de sauvegardes
└── README.md                       # Documentation des sauvegardes
```

## 🛑 Arrêt préalable du système

**⚠️ IMPORTANT : Toujours arrêter les services avant une restauration**

```powershell
# Arrêt de tous les services
docker-compose down

# Vérifier que tous les conteneurs sont arrêtés
docker-compose ps
```

## 🗄️ Restauration complète de la base de données

### Étape 1 : Préparation de l'environnement

```powershell
# Se placer dans le répertoire du projet
cd c:\Users\franc\EPSI\B3\MSPR\mspr_data_science_601s

# Démarrer uniquement la base de données
docker-compose up -d db

# Attendre que PostgreSQL soit prêt
Start-Sleep -Seconds 10
docker-compose exec db pg_isready -U mspr_user
```

### Étape 2 : Choix et vérification de la sauvegarde

```powershell
# Lister les sauvegardes disponibles
Get-ChildItem -Path ".\backups\daily\" -Name "*.sql" | Sort-Object -Descending

# Exemple de sortie :
# backup_msprdatascience_2025-01-16_03-00-00.sql
# backup_msprdatascience_2025-01-15_03-00-00.sql
# backup_msprdatascience_2025-01-14_03-00-00.sql
```

```powershell
# Vérifier l'intégrité d'une sauvegarde (optionnel)
$backupFile = ".\backups\daily\backup_msprdatascience_2025-01-16_03-00-00.sql"
Get-FileHash $backupFile -Algorithm SHA256

# Vérifier la taille du fichier
(Get-Item $backupFile).Length / 1MB
# Doit être > 1MB pour une sauvegarde valide
```

### Étape 3 : Restauration de la base

```powershell
# Définir le fichier de sauvegarde à restaurer
$BACKUP_FILE = "backup_msprdatascience_2025-01-16_03-00-00.sql"
$BACKUP_PATH = ".\backups\daily\$BACKUP_FILE"

# Vérifier que le fichier existe
if (Test-Path $BACKUP_PATH) {
    Write-Host "✅ Fichier de sauvegarde trouvé : $BACKUP_PATH" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier de sauvegarde introuvable : $BACKUP_PATH" -ForegroundColor Red
    exit 1
}
```

```powershell
# Option 1 : Restauration avec suppression complète de la DB
# ⚠️ ATTENTION : Cette méthode supprime toutes les données existantes

# Supprimer la base existante
docker-compose exec db dropdb -U mspr_user msprdatascience

# Recréer la base vide
docker-compose exec db createdb -U mspr_user msprdatascience

# Restaurer à partir du fichier SQL
Get-Content $BACKUP_PATH | docker-compose exec -T db psql -U mspr_user -d msprdatascience
```

```powershell
# Option 2 : Restauration avec script PowerShell automatisé
.\backups\scripts\test_restore.ps1 -BackupFile $BACKUP_FILE

# Le script gère automatiquement :
# - Vérification de l'intégrité
# - Sauvegarde de sécurité avant restauration
# - Restauration propre
# - Tests de cohérence post-restauration
```

### Étape 4 : Vérification post-restauration

```powershell
# Vérifier la connexion à la base
docker-compose exec db psql -U mspr_user -d msprdatascience -c "SELECT 1;"

# Vérifier les tables principales
docker-compose exec db psql -U mspr_user -d msprdatascience -c "
SELECT 
    schemaname, 
    tablename, 
    n_tup_ins as total_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

# Vérifier les données COVID et Mpox
docker-compose exec db psql -U mspr_user -d msprdatascience -c "
SELECT 
    'covid_cases' as table_name, COUNT(*) as row_count, MAX(date) as latest_date
FROM covid_cases
UNION ALL
SELECT 
    'mpox_cases' as table_name, COUNT(*) as row_count, MAX(date) as latest_date
FROM mpox_cases;
"
```

## 📊 Restauration sélective de données

### Restauration d'une table spécifique

```powershell
# Exemple : Restaurer uniquement la table covid_cases
$TABLE_NAME = "covid_cases"

# Extraire les données de la table depuis la sauvegarde
$tempFile = "temp_$TABLE_NAME.sql"
Select-String -Path $BACKUP_PATH -Pattern "COPY public\.$TABLE_NAME" -Context 0,1000 | 
    Out-File $tempFile

# Supprimer les données actuelles de la table
docker-compose exec db psql -U mspr_user -d msprdatascience -c "DELETE FROM $TABLE_NAME;"

# Restaurer les données de la table
Get-Content $tempFile | docker-compose exec -T db psql -U mspr_user -d msprdatascience

# Nettoyer le fichier temporaire
Remove-Item $tempFile
```

### Restauration des prédictions ML

```powershell
# Restaurer les prédictions COVID et Mpox
$PREDICTION_TABLES = @("covid_predictions", "mpox_predictions")

foreach ($table in $PREDICTION_TABLES) {
    Write-Host "Restauration de la table : $table" -ForegroundColor Yellow
    
    # Nettoyer la table existante
    docker-compose exec db psql -U mspr_user -d msprdatascience -c "TRUNCATE TABLE $table CASCADE;"
    
    # Extraire et restaurer les données
    $tempFile = "temp_$table.sql"
    Select-String -Path $BACKUP_PATH -Pattern "COPY public\.$table" -Context 0,500 | 
        Out-File $tempFile
    
    Get-Content $tempFile | docker-compose exec -T db psql -U mspr_user -d msprdatascience
    Remove-Item $tempFile
}
```

## 🤖 Restauration des modèles ML

Les modèles de Machine Learning sont stockés dans le système de fichiers :

```powershell
# Les modèles sont dans backend/app/ml/
# Structure :
# backend/app/ml/
# ├── death/
# │   ├── xgboost_death_model.pkl
# │   └── scaler_death.pkl
# ├── new_case/
# │   ├── rf_new_case_model.pkl
# │   └── scaler_new_case.pkl
# └── geographic_spread/
#     ├── rf_geographic_model.pkl
#     └── scaler_geographic.pkl
```

### Sauvegarde manuelle des modèles

```powershell
# Créer une archive des modèles actuels
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$modelsBackup = "models_backup_$timestamp.zip"

# Compresser les modèles
Compress-Archive -Path ".\backend\app\ml\*" -DestinationPath ".\backups\$modelsBackup"

Write-Host "✅ Modèles sauvegardés dans : .\backups\$modelsBackup" -ForegroundColor Green
```

### Restauration des modèles

```powershell
# Restaurer des modèles depuis une archive
$modelsArchive = ".\backups\models_backup_2025-01-15_10-30-00.zip"

if (Test-Path $modelsArchive) {
    # Supprimer les modèles actuels
    Remove-Item -Path ".\backend\app\ml\*\*.pkl" -Force -Recurse
    
    # Extraire les modèles de sauvegarde
    Expand-Archive -Path $modelsArchive -DestinationPath ".\backend\app\ml\" -Force
    
    Write-Host "✅ Modèles ML restaurés" -ForegroundColor Green
} else {
    Write-Host "❌ Archive de modèles introuvable" -ForegroundColor Red
}
```

## 🔄 Redémarrage complet du système

### Après restauration de la base de données

```powershell
# 1. Arrêter tous les services
docker-compose down

# 2. Redémarrer tous les services
docker-compose up -d

# 3. Attendre la stabilisation
Start-Sleep -Seconds 30

# 4. Vérifier l'état des services
docker-compose ps

# 5. Vérifier les logs
docker-compose logs backend | Select-String -Pattern "error|failed" -Context 2
```

### Tests de fonctionnement post-restauration

```powershell
# Test de l'API
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET
    Write-Host "✅ API Health Check : $($healthCheck.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur API Health Check : $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'interface web
try {
    $webCheck = Invoke-WebRequest -Uri "http://localhost:8080" -Method HEAD
    if ($webCheck.StatusCode -eq 200) {
        Write-Host "✅ Interface web accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Interface web inaccessible" -ForegroundColor Red
}
```

## 🧪 Restauration de test (sandbox)

Pour tester une restauration sans affecter la production :

```powershell
# 1. Dupliquer le docker-compose pour les tests
Copy-Item docker-compose.yml docker-compose.test.yml

# 2. Modifier les ports dans docker-compose.test.yml
# nginx: ports: ["8081:80"]
# db: ports: ["5435:5432"]

# 3. Créer un environnement de test
Copy-Item .env .env.test

# 4. Modifier les variables dans .env.test
# POSTGRES_DB=msprdatascience_test
# ... autres modifications

# 5. Lancer l'environnement de test
docker-compose -f docker-compose.test.yml --env-file .env.test up -d

# 6. Tester la restauration sur cet environnement
# ... procédures de restauration ...

# 7. Nettoyer après les tests
docker-compose -f docker-compose.test.yml down -v
```

## 📈 Monitoring de la restauration

### Script de vérification automatique

```powershell
# Créer un script de vérification post-restauration
$verificationScript = @"
# Vérification post-restauration
Write-Host "=== VÉRIFICATION POST-RESTAURATION ===" -ForegroundColor Cyan

# 1. Services Docker
Write-Host "`n1. État des services Docker :" -ForegroundColor Yellow
docker-compose ps

# 2. Santé de la base de données
Write-Host "`n2. Santé de la base de données :" -ForegroundColor Yellow
docker-compose exec db pg_isready -U mspr_user

# 3. Nombre de lignes par table
Write-Host "`n3. Statistiques des tables :" -ForegroundColor Yellow
docker-compose exec db psql -U mspr_user -d msprdatascience -c "
SELECT 
    schemaname, 
    tablename, 
    n_tup_ins as rows,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_tup_ins DESC;
"

# 4. Test API
Write-Host "`n4. Test API :" -ForegroundColor Yellow
try {
    `$health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET
    Write-Host "API Status: `$(`$health.status)" -ForegroundColor Green
} catch {
    Write-Host "API Error: `$(`$_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== VÉRIFICATION TERMINÉE ===" -ForegroundColor Cyan
"@

$verificationScript | Out-File -FilePath ".\backups\scripts\verify_restore.ps1" -Encoding UTF8
```

```powershell
# Exécuter la vérification
.\backups\scripts\verify_restore.ps1
```

## ⚠️ Bonnes pratiques

### Avant toute restauration
1. **Créer une sauvegarde de sécurité** de l'état actuel
2. **Documenter** la raison de la restauration
3. **Informer** les utilisateurs de l'indisponibilité temporaire
4. **Tester** la procédure sur un environnement de développement

### Pendant la restauration
1. **Surveiller** les logs en temps réel
2. **Garder** une trace des commandes exécutées
3. **Vérifier** chaque étape avant de passer à la suivante

### Après la restauration
1. **Valider** l'intégrité des données
2. **Tester** toutes les fonctionnalités principales
3. **Régénérer** les prédictions ML si nécessaire
4. **Documenter** les actions effectuées

## 🆘 Dépannage des problèmes de restauration

### Erreur "database is being accessed by other users"

```powershell
# Forcer la déconnexion de tous les utilisateurs
docker-compose exec db psql -U mspr_user -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'msprdatascience' AND pid <> pg_backend_pid();
"

# Puis recommencer la restauration
```

### Erreur de permissions

```powershell
# Vérifier les permissions du fichier de sauvegarde
icacls $BACKUP_PATH

# Donner les permissions au conteneur Docker
# (généralement résolu en utilisant -T avec docker-compose exec)
```

### Erreur d'espace disque

```powershell
# Vérifier l'espace disponible
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="FreeSpace(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}}

# Nettoyer Docker si nécessaire
docker system prune -f
docker volume prune -f
```

### Base de données corrompue

```powershell
# Vérifier l'intégrité de la base
docker-compose exec db pg_dump -U mspr_user --schema-only msprdatascience > schema_check.sql

# Si la structure est OK, problème au niveau des données
# Restaurer avec l'option --ignore-errors si disponible
```

---

**🎯 Cette procédure garantit une restauration sûre et vérifiée du système MSPR Data Science.**
