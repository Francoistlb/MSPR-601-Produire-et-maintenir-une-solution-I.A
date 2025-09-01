# 🚀 Procédure de démarrage - MSPR Data Science

Cette procédure détaille comment démarrer le système d'analyse COVID-19 et Mpox avec IA prédictive.

## 📋 Prérequis

### Logiciels requis
- **Docker** >= 20.10.0
- **Docker Compose** >= 2.0.0
- **Git** >= 2.30.0
- **PowerShell** (Windows) ou **Bash** (Linux/Mac)

### Configuration système minimale
- **RAM** : 8 GB minimum, 16 GB recommandé
- **Stockage** : 20 GB d'espace libre
- **CPU** : 4 cœurs minimum
- **Réseau** : Connexion Internet pour téléchargement des données

## 🔧 Installation initiale

### 1. Clonage du projet
```powershell
# Clone du repository
git clone https://github.com/Francoistlb/MSPR-601-Produire-et-maintenir-une-solution-I.A..git
cd mspr_data_science_601s

# Basculer sur la branche develop
git checkout develop
git pull origin develop
```

### 2. Configuration des variables d'environnement

Créer le fichier `.env` à la racine du projet :

```powershell
# Copier le template d'environnement
Copy-Item .env.example .env
```

**Contenu du fichier `.env` (exemple)** :
```bash
# === CONFIGURATION BASE DE DONNÉES ===
POSTGRES_DB=msprdatascience
POSTGRES_USER=mspr_user
POSTGRES_PASSWORD=SecurePassword123!
DATABASE_URL=postgresql://mspr_user:SecurePassword123!@db:5432/msprdatascience

# === SÉCURITÉ API ===
SECRET_KEY=votre-clé-secrète-très-sécurisée-256-bits-minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# === PGADMIN (OPTIONNEL) ===
PGLADMIN_DEFAULT_EMAIL=admin@mspr.local
PGADMIN_DEFAULT_PASSWORD=AdminPassword123!

# === SOURCES DE DONNÉES ===
COVID_DATA_URL=https://disease.sh/v3/covid-19/
MPOX_KAGGLE_DATASET=kaggle://dataset/mpox

# === CONFIGURATION PAYS ===
COUNTRY=france
ENV=production

# === FONCTIONNALITÉS ===
ENABLE_TECHNICAL_API=true
ENABLE_DATAVIZ=true
RGPD_COMPLIANCE=true
MULTI_LANGUAGE=true
SUPPORTED_LANGUAGES=fr,en
DATA_RETENTION_DAYS=2555
```

## 🐳 Démarrage avec Docker

### 1. Construction des images
```powershell
# Construction de toutes les images Docker
docker-compose build --no-cache

# Vérifier que les images sont créées
docker images | Select-String "mspr"
```

### 2. Lancement des services
```powershell
# Démarrage en arrière-plan
docker-compose up -d

# Vérifier le statut des conteneurs
docker-compose ps
```

### 3. Vérification des services

Attendre que tous les services soient en état "healthy" :

```powershell
# Vérifier les logs en temps réel
docker-compose logs -f

# Vérifier spécifiquement chaque service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
docker-compose logs nginx
```

## 📊 Initialisation des données

### 1. Initialisation de la base de données

```powershell
# Créer les tables et structure
docker-compose exec backend python scripts/init_db.py

# Vérifier la création des tables
docker-compose exec db psql -U mspr_user -d msprdatascience -c "\dt"
```

### 2. Import des données historiques

```powershell
# Lancer l'ETL pour importer les données COVID et Mpox
docker-compose exec backend python scripts/etl_script.py

# Vérifier l'import des données
docker-compose exec db psql -U mspr_user -d msprdatascience -c "SELECT COUNT(*) FROM covid_cases;"
docker-compose exec db psql -U mspr_user -d msprdatascience -c "SELECT COUNT(*) FROM mpox_cases;"
```

### 3. Génération des prédictions ML

```powershell
# Entraîner les modèles et générer les prédictions
docker-compose exec backend python scripts/generate_predictions.py

# Vérifier les prédictions générées
docker-compose exec db psql -U mspr_user -d msprdatascience -c "SELECT COUNT(*) FROM covid_predictions;"
docker-compose exec db psql -U mspr_user -d msprdatascience -c "SELECT COUNT(*) FROM mpox_predictions;"
```

## ✅ Tests de fonctionnement

### 1. Vérification des endpoints API

```powershell
# Test du health check
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET

# Test des données COVID (nécessite authentification)
# D'abord, créer un utilisateur et s'authentifier via l'interface web
```

### 2. Vérification de l'interface web

1. **Ouvrir le navigateur** : `http://localhost:8080`
2. **Page d'accueil** : Vérifier que l'interface React se charge
3. **Dashboard** : Naviguer vers les visualisations COVID/Mpox
4. **Prédictions** : Consulter les graphiques de prédictions ML

### 3. Vérification de l'administration

Si PgAdmin est activé :
```powershell
# Activer PgAdmin (optionnel)
docker-compose --profile pgladmin up -d pgadmin

# Accéder à PgAdmin : http://localhost:8080/pgadmin
# Login avec les credentials définis dans .env
```

## 📈 Surveillance et logs

### Consultation des logs
```powershell
# Logs globaux
docker-compose logs -f --tail=100

# Logs par service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
docker-compose logs -f nginx
```

### Monitoring des ressources
```powershell
# Utilisation des ressources par conteneur
docker stats

# Informations détaillées sur les conteneurs
docker-compose ps
docker inspect $(docker-compose ps -q)
```

## 🛠️ Commandes utiles de gestion

### Redémarrage des services
```powershell
# Redémarrage complet
docker-compose down
docker-compose up -d

# Redémarrage d'un service spécifique
docker-compose restart backend
docker-compose restart frontend
```

### Mise à jour des données
```powershell
# Re-exécution de l'ETL
docker-compose exec backend python scripts/etl_script.py

# Régénération des prédictions
docker-compose exec backend python scripts/generate_predictions.py
```

### Sauvegarde manuelle
```powershell
# Sauvegarde de la base de données
docker-compose exec db pg_dump -U mspr_user -d msprdatascience > backup_$(Get-Date -Format "yyyy-MM-dd_HH-mm-ss").sql

# Sauvegarde avec le script automatisé
.\backups\scripts\postgres_backup.ps1
```

## 🚨 Dépannage courant

### Problème de ports occupés
```powershell
# Vérifier quels processus utilisent les ports 8080 et 5434
netstat -ano | Select-String "8080|5434"

# Arrêter le processus si nécessaire
Stop-Process -Id <PID>
```

### Problème de mémoire
```powershell
# Redimensionner la mémoire Docker (Windows)
# Docker Desktop > Settings > Resources > Advanced
# Allouer au moins 8GB de RAM

# Nettoyage des ressources Docker
docker system prune -f
docker volume prune -f
```

### Problème de connexion à la base de données
```powershell
# Vérifier la santé du conteneur DB
docker-compose ps db

# Tester la connexion directement
docker-compose exec db psql -U mspr_user -d msprdatascience -c "SELECT 1;"

# Réinitialiser la base si nécessaire
docker-compose down -v
docker-compose up -d db
# Puis relancer l'initialisation
```

### Problème de téléchargement des données
```powershell
# Vérifier la connectivité Internet
Test-NetConnection google.com -Port 80

# Tester manuellement les sources de données
Invoke-RestMethod -Uri "https://disease.sh/v3/covid-19/countries" | ConvertTo-Json
```

## 🎯 Ordre de démarrage recommandé

1. **Services de base** : `docker-compose up -d db`
2. **Backend** : `docker-compose up -d backend`
3. **Frontend** : `docker-compose up -d frontend`
4. **Proxy** : `docker-compose up -d nginx`
5. **Initialisation** : Scripts de données et ML
6. **Tests** : Vérification des endpoints et interface

## 📞 Support et contact

En cas de problème :
1. Consulter les logs avec `docker-compose logs -f`
2. Vérifier la documentation technique
3. Consulter les issues GitHub du projet
4. Contacter l'équipe de développement

---

**✨ Une fois tous ces étapes complétées, votre système d'analyse COVID-19/Mpox avec IA prédictive est opérationnel !**
