# Guide de déploiement

## Architecture cible

```
GitHub (repo)
    │
    ├── Railway Service 1 : backend/   → https://gan-proxy.railway.app
    └── Railway Service 2 : frontend/  → https://gan-studio.railway.app
```

Tout est sur Railway. Gratuit jusqu'à 5$/mois de compute (largement suffisant pour un projet étudiant).

---

## Étape 1 — Préparer le repo GitHub

Pousser le dossier `GAN_Studio/` sur GitHub :

```bash
cd GAN_Studio
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/gan-studio.git
git push -u origin main
```

> Le `.gitignore` doit exclure `frontend/node_modules/`, `frontend/.env.local`, et `backend/__pycache__/`.

**`.gitignore` recommandé** (à placer à la racine de `GAN_Studio/`) :
```
# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env.local

# Backend
backend/__pycache__/
backend/*.pyc
backend/.env

# OS
.DS_Store
```

---

## Étape 2 — Déployer le backend (proxy)

1. Aller sur [railway.app](https://railway.app) et se connecter avec GitHub
2. Cliquer **"New Project"** → **"Deploy from GitHub repo"**
3. Sélectionner le repo `gan-studio`
4. Cliquer sur le service créé → **Settings**
5. Définir le **Root Directory** : `backend`
6. Railway détecte le `Dockerfile` automatiquement et lance le build
7. Une fois déployé, copier l'URL publique : `https://xxxx.railway.app`

**Variables d'environnement à ajouter (optionnel) :**

| Variable   | Valeur                  |
|------------|-------------------------|
| `HF_TOKEN` | Token Hugging Face      |

---

## Étape 3 — Déployer le frontend

Dans le même projet Railway :

1. Cliquer **"New Service"** → **"GitHub repo"** → même repo
2. Settings → **Root Directory** : `frontend`
3. Ajouter les variables d'environnement :

| Variable            | Valeur                                    |
|---------------------|-------------------------------------------|
| `VITE_PROGAN_URL`   | `https://xxxx.railway.app/progan`         |
| `VITE_STYLEGAN_URL` | `https://xxxx.railway.app/stylegan`       |
| `VITE_DCGAN_URL`    | `https://xxxx.railway.app/dcgan`          |
| `VITE_T2I_URL`      | `https://xxxx.railway.app`                |

4. Définir les commandes :
   - **Build command** : `npm install && npm run build`
   - **Start command** : `npx serve dist -l $PORT`

5. Déployer.

---

## Étape 4 — Vérifier le déploiement

```bash
# Vérifier le proxy
curl https://xxxx.railway.app/stylegan/health
# Attendu : { "status": "ok", "model": "StyleGAN2" }

# Vérifier une génération
curl -X POST https://xxxx.railway.app/stylegan/generate \
  -H "Content-Type: application/json" \
  -d '{"n": 1}'
```

Ouvrir l'URL du frontend dans le navigateur et cliquer sur "Générer des images".

---

## Passage en production (APIs RunPod)

Quand les vraies APIs Flask sont prêtes sur RunPod, aucune modification du code n'est nécessaire. Il suffit de mettre à jour les variables d'environnement du service frontend sur Railway :

| Variable            | Nouvelle valeur                                  |
|---------------------|--------------------------------------------------|
| `VITE_PROGAN_URL`   | `https://VOTRE_POD_ID-5002.proxy.runpod.net`     |
| `VITE_STYLEGAN_URL` | `https://VOTRE_POD_ID-5001.proxy.runpod.net`     |
| `VITE_DCGAN_URL`    | `https://VOTRE_POD_ID-5003.proxy.runpod.net`     |

Railway redéploie automatiquement dès que les variables changent.

---

## Résolution de problèmes fréquents

**Erreur CORS au lancement**
Le proxy Flask intègre `flask-cors`. Si l'erreur persiste, vérifier que les URLs dans les variables d'environnement ne contiennent pas de `/` final.

**Space HF lent (15+ secondes)**
Normal. Les Spaces Hugging Face gratuits se mettent en veille après inactivité. La première requête réveille le Space, les suivantes sont rapides.

**Build Railway échoue sur le frontend**
Vérifier que `node_modules/` est bien dans le `.gitignore` et non poussé sur GitHub.

**Port déjà utilisé en local**
Railway injecte automatiquement la variable `PORT`. En local, le proxy écoute sur `8000` par défaut. Modifier avec `PORT=9000 python proxy.py`.
