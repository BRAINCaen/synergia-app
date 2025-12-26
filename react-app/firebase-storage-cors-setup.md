# Configuration CORS pour Firebase Storage

## Problème
Les uploads de photos/vidéos échouent avec l'erreur CORS :
```
Access to XMLHttpRequest blocked by CORS policy: Response to preflight request doesn't pass access control check
```

## Solution

### Option 1 : Via Google Cloud Console (Recommandé)

1. **Aller sur Google Cloud Console** :
   - https://console.cloud.google.com/storage/browser/synergia-app-f27e7.appspot.com

2. **Ouvrir Cloud Shell** (icône terminal en haut à droite)

3. **Créer le fichier cors.json** :
   ```bash
   cat > cors.json << 'EOF'
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-meta-*", "x-goog-resumable"]
     }
   ]
   EOF
   ```

4. **Appliquer la configuration CORS** :
   ```bash
   gsutil cors set cors.json gs://synergia-app-f27e7.appspot.com
   ```

5. **Vérifier la configuration** :
   ```bash
   gsutil cors get gs://synergia-app-f27e7.appspot.com
   ```

### Option 2 : Via gcloud CLI local

1. **Installer Google Cloud SDK** : https://cloud.google.com/sdk/docs/install

2. **Se connecter** :
   ```bash
   gcloud auth login
   gcloud config set project synergia-app-f27e7
   ```

3. **Appliquer le CORS** (depuis le dossier react-app/src) :
   ```bash
   gsutil cors set cors.json gs://synergia-app-f27e7.appspot.com
   ```

### Option 3 : Via Firebase Console

1. Aller sur https://console.firebase.google.com/project/synergia-app-f27e7/storage
2. Cliquer sur "Rules" et s'assurer que les règles permettent les uploads
3. Note: Les règles Firebase ne gèrent pas le CORS directement, il faut utiliser gsutil

## Règles Firebase Storage recommandées

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Vérification

Après avoir appliqué le CORS, tester un upload depuis l'application. L'erreur CORS devrait disparaître.
