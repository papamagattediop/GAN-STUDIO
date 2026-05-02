# Référence API

Tous les endpoints suivent le même format, identique pour le proxy (phase test) et les vraies APIs RunPod (phase production).

## Format commun

### Requête de génération

```http
POST /{model}/generate
Content-Type: application/json

{ "n": 4 }
```

| Paramètre | Type    | Défaut | Max | Description              |
|-----------|---------|--------|-----|--------------------------|
| `n`       | integer | 1      | 8   | Nombre d'images à générer|

### Réponse de génération

```json
{
  "images":     ["base64string...", "base64string..."],
  "model":      "StyleGAN2",
  "resolution": "256px",
  "count":      4
}
```

> Les chaînes `images` sont du base64 PNG pur, sans préfixe `data:image/png;base64,`.
> Le frontend ajoute ce préfixe lui-même lors de l'affichage.

### Réponse santé

```http
GET /{model}/health
```

```json
{
  "status": "ok",
  "model":  "StyleGAN2"
}
```

---

## Endpoints ProGAN

### GET /progan/health

Vérifie que le service ProGAN est opérationnel.

**Exemple de réponse**
```json
{ "status": "ok", "model": "ProGAN" }
```

### POST /progan/generate

Génère des visages via ProGAN (256×256 px).

**Exemple de requête**
```bash
curl -X POST https://VOTRE_SERVICE.railway.app/progan/generate \
  -H "Content-Type: application/json" \
  -d '{"n": 2}'
```

**Exemple de réponse**
```json
{
  "images":     ["iVBORw0KGgoAAAANS...", "iVBORw0KGgoAAAANS..."],
  "model":      "ProGAN",
  "resolution": "256px",
  "count":      2
}
```

---

## Endpoints StyleGAN2

### GET /stylegan/health

### POST /stylegan/generate

Génère des visages via StyleGAN2 (256×256 px). Meilleure qualité (FID 28.1).

---

## Endpoints DCGAN

### GET /dcgan/health

### POST /dcgan/generate

Génère des visages via DCGAN (64×64 px). Architecture de référence baseline.

---

## Codes d'erreur

| Code | Signification                                      |
|------|---------------------------------------------------|
| 200  | Succès                                            |
| 500  | Erreur interne (Space HF inaccessible, timeout)   |
| 503  | Service non disponible (client non initialisé)    |

**Exemple d'erreur**
```json
{ "error": "Space HF hysts/StyleGAN2 non disponible" }
```

---

## Tester l'API localement

```bash
# Démarrer le proxy
cd backend
python proxy.py

# Tester la santé
curl http://localhost:8000/stylegan/health

# Générer une image
curl -X POST http://localhost:8000/stylegan/generate \
  -H "Content-Type: application/json" \
  -d '{"n": 1}' | python -m json.tool
```

---

## Variables d'environnement du proxy

| Variable  | Défaut | Description                               |
|-----------|--------|-------------------------------------------|
| `PORT`    | 8000   | Port d'écoute (injecté automatiquement par Railway) |
| `HF_TOKEN`| —      | Token Hugging Face (optionnel, pour Spaces privés)  |
