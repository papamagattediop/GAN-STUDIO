# GAN Studio

Interface web complète pour la génération et la comparaison d'images synthétiques par réseaux antagonistes génératifs (GANs).

Projet réalisé dans le cadre du cours **Architectures Avancées — Deep Learning AS3**.

---

## Aperçu

GAN Studio permet de générer des visages synthétiques en temps réel via trois architectures GAN entraînées sur le dataset FFHQ (70 000 portraits haute résolution), de les comparer visuellement et d'explorer leurs métriques d'évaluation (FID, Inception Score).

| Modèle     | Architecture       | FID   | Résolution |
|------------|--------------------|-------|------------|
| ProGAN     | Progressive Growing| 42.3  | 256×256 px |
| StyleGAN2  | Style Mapping      | 28.1  | 256×256 px |
| DCGAN      | Deep Convolutional | 95.2  | 64×64 px   |

---

## Structure du projet

```
GAN_Studio/
├── frontend/          Interface React + Vite
├── backend/           APIs Flask (déployées sur RunPod)
├── docs/              Documentation technique
│   ├── architecture.md
│   ├── api.md
│   └── deploy.md
└── README.md          Ce fichier
```

---

## Architecture de déploiement

```
Navigateur
    │  HTTPS
    ▼
Frontend React — Railway
    │  POST /generate   GET /health
    ├──────────────────────────────▶  API ProGAN    (RunPod GPU, port 5002)
    ├──────────────────────────────▶  API StyleGAN2 (RunPod GPU, port 5001)
    └──────────────────────────────▶  API DCGAN     (RunPod GPU, port 5003)
```

Chaque modèle est servi par une API Flask indépendante hébergée sur un pod GPU RunPod. L'entraînement et l'inférence s'exécutent sur GPU CUDA. Le frontend, déployé sur Railway, communique avec ces APIs via trois variables d'environnement.

Chaque API expose les endpoints suivants :

| Endpoint           | Méthode | Description                              |
|--------------------|---------|------------------------------------------|
| `/health`          | GET     | Statut du pod et de l'inférence          |
| `/generate`        | POST    | Génère n images (body : `{ "n": 4 }`)    |
| `/info`            | GET     | Infos sur le modèle chargé               |

La réponse de `/generate` retourne les images en base64 PNG :

```json
{
  "images":     ["base64string...", "..."],
  "model":      "StyleGAN2",
  "resolution": "256px",
  "count":      4
}
```

---

## Documentation

| Fichier                                          | Contenu                                  |
|--------------------------------------------------|------------------------------------------|
| [docs/architecture.md](docs/architecture.md)     | Architecture technique, flux de données  |
| [docs/api.md](docs/api.md)                       | Référence complète des endpoints         |
| [docs/deploy.md](docs/deploy.md)                 | Guide de déploiement Railway + RunPod    |
