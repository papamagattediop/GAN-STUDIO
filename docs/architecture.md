# Architecture technique

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     Utilisateur (navigateur)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│               Frontend — React + Vite                        │
│               Hébergé sur Railway                            │
│                                                             │
│  / Accueil     Présentation du projet, objectifs            │
│  /generator    Génération d'images par modèle                │
│  /compare      Comparaison côte à côte des 3 modèles         │
│  /metrics      FID, Inception Score, détails d'entraînement  │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /generate   GET /health
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
  /progan/...       /stylegan/...      /dcgan/...
┌─────────────────────────────────────────────────────────────┐
│               Backend — Proxy Flask                          │
│               Hébergé sur Railway                            │
└──────┬──────────────────┬──────────────────┬───────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
  HF Space           HF Space           HF Space
  StyleGAN2          StyleGAN2          StyleGAN2
  (FFHQ, t=1.0)      (FFHQ, t=0.7)      (AFHQ, t=0.5)
  → ProGAN sim.      → StyleGAN2        → DCGAN sim.
```

> Phase test : le proxy appelle Hugging Face Spaces.
> Phase production : le proxy est remplacé par les vraies APIs Flask sur RunPod (même format de réponse).

---

## Frontend

### Stack technique

| Technologie     | Version | Rôle                              |
|-----------------|---------|-----------------------------------|
| React           | 18      | Bibliothèque UI                   |
| Vite            | 5       | Bundler et serveur de développement|
| React Router    | v6      | Navigation SPA                    |
| CSS Modules     | —       | Styles isolés par composant       |
| Google Fonts    | —       | Inter (corps) + Space Grotesk (titres) |

### Architecture des fichiers

```
frontend/src/
├── main.jsx                Point d'entrée, import des styles globaux
├── App.jsx                 Routeur React
├── config/
│   └── api.js              URLs des modèles, fonctions fetch
├── styles/                 Système de design global
│   ├── tokens.css          Variables CSS (couleurs, typographie, ombres)
│   ├── base.css            Reset et styles fondamentaux
│   ├── typography.css      Classes texte
│   ├── animations.css      Keyframes et utilitaires d'animation
│   ├── components.css      Boutons, tags, cards, spinner...
│   └── layout.css          Grilles, conteneurs, espacement
├── components/
│   ├── Navbar/             Navbar.jsx + Navbar.css
│   └── Footer/             Footer.jsx + Footer.css
└── pages/
    ├── Home/               Home.jsx + Home.css
    ├── Generator/          Generator.jsx + Generator.css
    ├── Compare/            Compare.jsx + Compare.css
    └── Metrics/            Metrics.jsx + Metrics.css
```

### Flux de génération d'image

```
1. Utilisateur clique "Générer"
2. Generator.jsx appelle generateImages(modelId, n)  [config/api.js]
3. POST ${model.url}/generate  →  body: { n: 4 }
4. Proxy reçoit, appelle HF Space via gradio_client
5. Proxy retourne { images: ["base64...", ...], model: "StyleGAN2", resolution: "256px" }
6. Generator.jsx affiche les images : src="data:image/png;base64,{img}"
```

---

## Backend

### Stack technique

| Technologie      | Rôle                                         |
|------------------|----------------------------------------------|
| Flask 3          | Serveur HTTP                                 |
| flask-cors       | Headers CORS (autoriser le frontend)         |
| gradio_client    | Appels aux Spaces Hugging Face               |
| Pillow           | Conversion image → base64                    |
| Gunicorn         | Serveur WSGI pour la production              |

### Routes exposées

```
GET  /                    Infos sur le proxy (sanity check)
GET  /progan/health       Statut ProGAN
POST /progan/generate     Génération ProGAN
GET  /stylegan/health     Statut StyleGAN2
POST /stylegan/generate   Génération StyleGAN2
GET  /dcgan/health        Statut DCGAN
POST /dcgan/generate      Génération DCGAN
```

### Spaces Hugging Face utilisés

Tous les trois utilisent `hysts/StyleGAN2` avec des configurations différentes pour simuler les architectures pendant la phase de test :

| Modèle    | Space            | Dataset | Truncation | Effet               |
|-----------|------------------|---------|------------|---------------------|
| ProGAN    | hysts/StyleGAN2  | FFHQ    | 1.0        | Plus de diversité   |
| StyleGAN2 | hysts/StyleGAN2  | FFHQ    | 0.7        | Qualité optimale    |
| DCGAN     | hysts/StyleGAN2  | AFHQ-v2 | 0.5        | Style différent     |

En production, ces appels sont remplacés par les vraies APIs RunPod (aucune modification du frontend nécessaire).

---

## Design system

La palette graphique repose sur un vert sauge naturel (#4A7B5A) associé à du blanc (#FFFFFF) et des gris naturels.

Toutes les valeurs sont centralisées dans `frontend/src/styles/tokens.css` sous forme de variables CSS custom properties, ce qui permet de modifier l'ensemble du design en changeant une seule source.
