<div align="center">

<br/>

```
  ██████╗  █████╗ ███╗   ██╗    ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗
 ██╔════╝ ██╔══██╗████╗  ██║    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
 ██║  ███╗███████║██╔██╗ ██║    ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
 ██║   ██║██╔══██║██║╚██╗██║    ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
 ╚██████╔╝██║  ██║██║ ╚████║    ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝
```

**Génération d'images synthétiques par réseaux antagonistes génératifs**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Inference_API-FFD21E?style=flat-square&logo=huggingface&logoColor=black)](https://huggingface.co)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.app)

<br/>

*Projet académique — Architectures Avancées · Deep Learning · AS3*

</div>

---

<br/>

## Vue d'ensemble

**GAN Studio** est une interface web complète dédiée à l'exploration et à la comparaison de trois architectures GAN entraînées sur le dataset FFHQ (70 000 portraits haute résolution). L'application permet de générer des visages synthétiques en temps réel, de comparer visuellement les architectures côte à côte, d'analyser leurs métriques d'évaluation, et de créer des images à partir de descriptions textuelles via le modèle FLUX.1-schnell.

<br/>

## Fonctionnalités

| Module | Description |
|--------|-------------|
| **Générateur** | Génération de 1 à 16 images par modèle en temps réel |
| **Comparaison** | Mise en parallèle des trois architectures sur le même seed |
| **Métriques** | Visualisation des scores FID, Inception Score et SSIM |
| **Texte → Image** | Génération guidée par prompt via FLUX.1-schnell |

<br/>

## Architectures GAN

| Modèle | Architecture | FID ↓ | Inception Score ↑ | Résolution |
|--------|-------------|-------|-------------------|------------|
| **ProGAN** | Progressive Growing of GANs | 42.3 | 3.8 | 256 × 256 px |
| **StyleGAN2** | Style-Based Generator v2 | 28.1 | 4.9 | 256 × 256 px |
| **DCGAN** | Deep Convolutional GAN | 95.2 | 2.4 | 64 × 64 px |

> FID (Fréchet Inception Distance) — plus la valeur est basse, meilleure est la qualité.

<br/>

## Structure du projet

```
GAN_Studio/
│
├── frontend/                   Interface utilisateur
│   ├── src/
│   │   ├── pages/              Home · Generator · Compare · Metrics · TextToImage
│   │   ├── components/         Navbar · Footer
│   │   ├── styles/             Tokens CSS · Typographie · Animations
│   │   └── config/api.js       Endpoints des trois modèles
│   └── vite.config.js
│
├── backend/                    Serveur proxy Flask
│   ├── proxy.py                Routes GANs (gradio_client) + T2I (HF Inference API)
│   ├── requirements.txt
│   └── Dockerfile
│
└── docs/                       Documentation technique
    ├── architecture.md
    ├── api.md
    └── deploy.md
```

<br/>

## Architecture de déploiement

```
                    ┌─────────────────────────────┐
                    │     Navigateur (HTTPS)       │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   Frontend React — Railway   │
                    └──┬───────────┬───────────┬──┘
                       │           │           │
               ┌───────▼──┐ ┌─────▼────┐ ┌───▼──────┐
               │  ProGAN  │ │StyleGAN2 │ │  DCGAN   │
               │  :5002   │ │  :5001   │ │  :5003   │
               └──────────┘ └──────────┘ └──────────┘
                       RunPod GPU · Flask APIs

                    ┌─────────────────────────────┐
                    │  FLUX.1-schnell (T2I)        │
                    │  HuggingFace Inference API   │
                    └─────────────────────────────┘
```

<br/>

## Variables d'environnement

Créer un fichier `backend/.env` (non versionné) :

```env
HF_TOKEN=hf_votre_token_huggingface
PORT=8000
```

Créer un fichier `frontend/.env.local` :

```env
VITE_PROGAN_URL=http://localhost:8000/progan
VITE_STYLEGAN_URL=http://localhost:8000/stylegan
VITE_DCGAN_URL=http://localhost:8000/dcgan
VITE_T2I_URL=http://localhost:8000
```

<br/>

## Lancement en local

```bash
# Backend
cd backend
pip install -r requirements.txt
python proxy.py

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

Application disponible sur `http://localhost:5173`

<br/>

## Documentation

| Document | Contenu |
|----------|---------|
| [docs/architecture.md](docs/architecture.md) | Architecture technique et flux de données |
| [docs/api.md](docs/api.md) | Référence complète des endpoints |
| [docs/deploy.md](docs/deploy.md) | Guide de déploiement Railway et RunPod |

<br/>

---

<br/>

<div align="center">

## Équipe

*Master Data Science · Architectures Avancées AS3 · 2025 — 2026*

<br/>

| | Membre | Rôle |
|---|--------|------|
| | **Clémence Josée JEAZE NGUEMEZI** | Data Scientist |
| | **Papa Magatte DIOP** | Data Scientist |
| | **TCHAPDA KOUADJO Wilfred Rod** | Data Scientist |
| | **Saer NDAO** | Data Scientist |

<br/>

---

<sub>Entraînement réalisé sur GPU RunPod · Dataset FFHQ 70k images · 2025–2026</sub>

</div>
