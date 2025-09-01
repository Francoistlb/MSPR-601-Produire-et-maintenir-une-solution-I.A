# Guide d'Authentification - Analyze IT 2

## 🔐 Intégration de l'Authentification avec le Backend

L'authentification a été intégrée entre le frontend React et le backend FastAPI. Voici comment tout fonctionne :

## 📋 Endpoints d'Authentification

### Backend Routes (FastAPI)
- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Connexion et génération du token JWT
- `GET /api/auth/me` - Récupération des informations utilisateur
- `POST /api/auth/logout` - Déconnexion et révocation du token
- `GET /api/auth/test-protected` - Route de test protégée

### Frontend API (React)
- `loginUser(email, password)` - Connexion utilisateur
- `registerUser(username, email, password)` - Inscription utilisateur
- `getCurrentUser()` - Récupération des données utilisateur
- `logoutUser()` - Déconnexion utilisateur
- `testProtectedRoute()` - Test de route protégée

## 🚀 Comment Tester l'Authentification

### 1. Lancer l'Application
```bash
docker-compose up --build
```

### 2. Accéder à l'Application
- URL: http://localhost:8080
- L'application affiche automatiquement la page de login/inscription

### 3. Inscription d'un Nouvel Utilisateur
1. Cliquer sur l'onglet "Inscription"
2. Remplir les champs :
   - **Email** : exemple@email.com
   - **Nom d'utilisateur** : monusername (3-50 caractères)
   - **Mot de passe** : motdepasse123 (au moins 6 caractères avec chiffres et lettres)
   - **Confirmer le mot de passe** : motdepasse123
3. Cliquer sur "S'inscrire"
4. Un message de succès s'affiche et vous êtes redirigé vers la connexion

### 4. Connexion
1. Sur l'onglet "Connexion"
2. Saisir l'email et le mot de passe
3. Cliquer sur "Se connecter"
4. Vous êtes automatiquement redirigé vers la sélection de pays

### 5. Sélection de Pays
1. Choisir une région : France, Suisse, ou États-Unis
2. Cliquer sur la carte du pays
3. Vous accédez au tableau de bord principal

### 6. Navigation Authentifiée
- Le header affiche l'email de l'utilisateur et la région sélectionnée
- Bouton "Déconnexion" disponible dans le header
- Accès aux pages : Prédictions, Archives, Comparaisons

## 🔧 Fonctionnalités Techniques

### Gestion des Tokens JWT
- Token stocké automatiquement dans `localStorage`
- Headers d'authentification ajoutés automatiquement aux requêtes API
- Vérification de la validité du token au chargement de l'application
- Nettoyage automatique en cas de token invalide

### Validation Côté Client
- Email valide requis
- Nom d'utilisateur : 3-50 caractères, lettres/chiffres/tirets/underscores
- Mot de passe : minimum 6 caractères avec chiffres et lettres
- Confirmation de mot de passe obligatoire pour l'inscription

### Validation Côté Serveur
- Vérification de l'unicité de l'email et du nom d'utilisateur
- Hachage sécurisé des mots de passe
- Génération et validation des tokens JWT
- Gestion des erreurs d'authentification

## 🐛 Débogage

### Logs Frontend
Ouvrir la console du navigateur (F12) pour voir :
- `🔐 Login attempt for: [email]`
- `📝 Register attempt for: [email]` 
- `👤 User authenticated from stored token`
- `🌍 Country selected: [country]`

### Logs Backend
Les logs du backend s'affichent dans la console Docker :
- Requêtes d'authentification
- Erreurs de validation
- Génération de tokens

### Résolution de Problèmes Courants

1. **Erreur "Email ou mot de passe incorrect"**
   - Vérifier que l'utilisateur est bien inscrit
   - Vérifier la saisie de l'email et du mot de passe

2. **Erreur "Email déjà existant"**
   - L'email est déjà utilisé par un autre compte
   - Utiliser un email différent ou se connecter

3. **Token invalide après rafraîchissement**
   - Le token a expiré (durée de vie configurable)
   - Se reconnecter pour obtenir un nouveau token

4. **Page blanche ou erreur de chargement**
   - Vérifier que le backend est bien lancé
   - Vérifier les logs Docker pour les erreurs

## 📊 Structure des Données

### Utilisateur (UserRead)
```json
{
  "user_id": 1,
  "username": "monusername",
  "email": "exemple@email.com",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-01-07T10:30:00",
  "last_login": "2025-01-07T10:30:00"
}
```

### Token JWT
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 43200
}
```

## 🔐 Sécurité

- Mots de passe hachés avec bcrypt
- Tokens JWT avec expiration
- Validation stricte des entrées
- Protection CORS configurée
- Headers d'authentification sécurisés

## 🎯 Tests Recommandés

1. **Test d'inscription** - Créer plusieurs comptes
2. **Test de connexion** - Se connecter/déconnecter
3. **Test de persistance** - Rafraîchir la page en étant connecté
4. **Test de sécurité** - Essayer d'accéder aux pages sans être connecté
5. **Test d'expiration** - Attendre l'expiration du token
6. **Test de déconnexion** - Vérifier le nettoyage des données

L'authentification est maintenant complètement intégrée et fonctionnelle ! 🎉
