# GAN Studio — Guide de démarrage & déploiement

## Démarrage local

```bash
cd frontend

# 1. Installer les dépendances
npm install

# 2. Configurer les URLs des APIs
cp .env.example .env.local
# → Éditer .env.local avec vos vraies URLs RunPod

# 3. Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

---

## Configuration des APIs RunPod

Dans `.env.local` :
```
VITE_PROGAN_URL=https://<pod-id>-5002.proxy.runpod.net
VITE_STYLEGAN_URL=https://<pod-id>-5001.proxy.runpod.net
VITE_DCGAN_URL=https://<pod-id>-5003.proxy.runpod.net
```

### Activer le CORS dans chaque serve.py

Ajouter dans chaque `api/serve.py` :

```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # ← ajouter cette ligne
```

Et dans requirements.txt :
```
flask-cors>=4.0.0
```

---

## Déploiement sur Vercel (recommandé)

```bash
# 1. Pousser le dossier frontend sur GitHub
git init && git add . && git commit -m "frontend GAN Studio"
git remote add origin https://github.com/VOUS/gan-studio.git
git push -u origin main

# 2. Sur vercel.com :
#    → Import project → Sélectionner le repo
#    → Framework Preset : Vite
#    → Root Directory : frontend
#    → Environment Variables : ajouter les 3 VITE_*_URL
#    → Deploy
```

---

## Build de production

```bash
npm run build
# → Génère le dossier dist/ prêt pour n'importe quel hébergeur statique
```

---

## Structure des fichiers

```
frontend/
├── index.html                  ← Google Fonts + entry point
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── App.jsx                 ← Router principal
│   ├── index.css               ← Design system (variables, animations)
│   ├── config/
│   │   └── api.js              ← URLs des 3 APIs + fonctions fetch
│   ├── components/
│   │   ├── Navbar.jsx          ← Navigation fixe responsive
│   │   └── Footer.jsx
│   └── pages/
│       ├── Home.jsx            ← Hero + modèles + équipe
│       ├── Generator.jsx       ← Génération interactive
│       ├── Compare.jsx         ← Comparaison côte à côte
│       └── Metrics.jsx         ← FID, IS, détails entraînement
```
