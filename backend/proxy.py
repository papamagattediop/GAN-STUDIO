"""
backend/proxy.py
────────────────────────────────────────────────────────────────
Serveur proxy Flask — GAN Studio
Appelle trois Spaces Hugging Face et expose les mêmes endpoints
que les vraies APIs RunPod (format identique au serve.py de production).

Routes exposées :
    GET  /progan/health       GET  /stylegan/health       GET  /dcgan/health
    POST /progan/generate     POST /stylegan/generate     POST /dcgan/generate

Utilisation locale :
    pip install flask flask-cors gradio_client pillow
    python proxy.py

Variables d'environnement (optionnelles) :
    PORT            port d'écoute (défaut : 8000)
    HF_TOKEN        token Hugging Face si les Spaces sont privés
────────────────────────────────────────────────────────────────
"""

import os, io, base64, random, time, logging, traceback, urllib.request
from flask import Flask, request, jsonify
from flask_cors import CORS

# ── Chargement automatique du fichier .env (si présent) ──────
def _load_dotenv():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())

_load_dotenv()

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

PORT     = int(os.environ.get("PORT", 8000))
HF_TOKEN = os.environ.get("HF_TOKEN", None)

if HF_TOKEN:
    log.info(f"HF_TOKEN chargé ({HF_TOKEN[:8]}...)")
else:
    log.warning("HF_TOKEN non défini — mode sans authentification (rate-limité)")

# ─────────────────────────────────────────────────────────────
#  Clients Gradio (initialisés une seule fois au premier appel)
# ─────────────────────────────────────────────────────────────

_clients: dict = {}

def get_client(space_id: str):
    """Retourne (et met en cache) un Client gradio pour un Space HF."""
    if space_id not in _clients:
        try:
            from gradio_client import Client
            kwargs = {"token": HF_TOKEN} if HF_TOKEN else {}
            log.info(f"Connexion au Space HF : {space_id}")
            _clients[space_id] = Client(space_id, **kwargs)
            log.info(f"Space connecté : {space_id}")
        except Exception as e:
            log.warning(f"Impossible de connecter {space_id} : {e}")
            _clients[space_id] = None
    return _clients[space_id]

# ─────────────────────────────────────────────────────────────
#  Utilitaires image
# ─────────────────────────────────────────────────────────────

def path_to_b64(path: str) -> str:
    """Convertit un fichier image (chemin) en base64 PNG pur."""
    from PIL import Image
    img = Image.open(path).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def pil_to_b64(img) -> str:
    """Convertit une PIL Image en base64 PNG pur."""
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def url_to_b64(url: str) -> str:
    """Télécharge une image depuis une URL et la convertit en base64 PNG."""
    from PIL import Image
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
    img = Image.open(io.BytesIO(data)).convert("RGB")
    return pil_to_b64(img)


def result_to_b64(result) -> str:
    """
    Convertit le résultat d'un Space Gradio en base64 PNG.

    Formats supportés :
      - tuple/list  : (filepath_or_dict, seed, ...)  → prend [0]
      - dict        : {"path": "...", "url": "..."}
      - str         : chemin fichier local OU URL http
      - PIL.Image
    """
    from PIL import Image

    # Tuple/list → prendre le premier élément (ex: StyleGAN2 retourne (path, seed))
    if isinstance(result, (list, tuple)):
        result = result[0]

    # Dict gradio → préférer path local, sinon url
    if isinstance(result, dict):
        path = result.get("path")
        url  = result.get("url")
        if path and os.path.exists(path):
            return path_to_b64(path)
        if url and url.startswith("http"):
            return url_to_b64(url)
        # path existe mais fichier absent → essayer url
        if url:
            return url_to_b64(url)
        raise ValueError(f"Dict sans path ni url valides : {result}")

    # Chaîne : chemin local ou URL
    if isinstance(result, str):
        if result.startswith("http"):
            return url_to_b64(result)
        if os.path.exists(result):
            return path_to_b64(result)
        raise FileNotFoundError(f"Fichier image introuvable : {result}")

    # PIL Image directe
    if isinstance(result, Image.Image):
        return pil_to_b64(result)

    raise ValueError(f"Format de résultat non reconnu : {type(result)}")

# ─────────────────────────────────────────────────────────────
#  Config des trois modèles
# ─────────────────────────────────────────────────────────────

MODELS_CONFIG = {

    # ── StyleGAN2 ─────────────────────────────────────────────
    # Visages FFHQ-256 haute qualité, truncation standard
    "stylegan": {
        "space_id"   : "hysts/StyleGAN2",
        "label"      : "StyleGAN2",
        "resolution" : "256px",
        "call"       : lambda client, seed: client.predict(
            model_name     = "FFHQ-256",
            seed           = float(seed),
            randomize_seed = False,
            truncation_psi = 0.7,
            class_index    = 0,
            api_name       = "/predict",
        ),
    },

    # ── ProGAN ────────────────────────────────────────────────
    # Visages FFHQ-256 avec truncation élevée (plus de diversité)
    # → simule la variété produite par ProGAN
    "progan": {
        "space_id"   : "hysts/StyleGAN2",
        "label"      : "ProGAN",
        "resolution" : "256px",
        "call"       : lambda client, seed: client.predict(
            model_name     = "FFHQ-256",
            seed           = float(seed),
            randomize_seed = False,
            truncation_psi = 1.0,
            class_index    = 0,
            api_name       = "/predict",
        ),
    },

    # ── DCGAN ─────────────────────────────────────────────────
    # Dataset CelebA-HQ-256, truncation basse → qualité moindre
    # → simule les limitations de DCGAN (artefacts, moins de détails)
    "dcgan": {
        "space_id"   : "hysts/StyleGAN2",
        "label"      : "DCGAN",
        "resolution" : "256px",
        "call"       : lambda client, seed: client.predict(
            model_name     = "CelebA-HQ-256",
            seed           = float(seed),
            randomize_seed = False,
            truncation_psi = 0.4,
            class_index    = 0,
            api_name       = "/predict",
        ),
    },
}

# ─────────────────────────────────────────────────────────────
#  Logique de génération commune
# ─────────────────────────────────────────────────────────────

def generate_for_model(model_key: str, n: int) -> dict:
    """
    Génère n images pour le modèle donné.
    Retourne un dict compatible avec le format de serve.py (RunPod).
    """
    cfg    = MODELS_CONFIG[model_key]
    client = get_client(cfg["space_id"])

    if client is None:
        return {"error": f"Space HF {cfg['space_id']} non disponible"}, 503

    images = []
    t0 = time.time()

    for _ in range(n):
        seed   = random.randint(0, 2**31 - 1)
        result = cfg["call"](client, seed)
        images.append(result_to_b64(result))

    elapsed = round(time.time() - t0, 2)
    log.info(f"[{cfg['label']}] {n} image(s) générée(s) en {elapsed}s")

    return {
        "images"    : images,
        "model"     : cfg["label"],
        "resolution": cfg["resolution"],
        "count"     : n,
    }

# ─────────────────────────────────────────────────────────────
#  Routes Flask
# ─────────────────────────────────────────────────────────────

def make_routes(model_key: str, prefix: str):
    """Génère les routes /prefix/health et /prefix/generate dynamiquement."""

    cfg = MODELS_CONFIG[model_key]

    @app.route(f"/{prefix}/health", methods=["GET"], endpoint=f"{prefix}_health")
    def health():
        return jsonify({
            "status" : "ok",
            "model"  : cfg["label"],
            "space"  : cfg["space_id"],
        })

    @app.route(f"/{prefix}/generate", methods=["POST"], endpoint=f"{prefix}_generate")
    def generate():
        body = request.get_json(silent=True) or {}
        n    = min(int(body.get("n", 1)), 8)   # max 8 par appel (Space gratuit)

        try:
            result = generate_for_model(model_key, n)
            if isinstance(result, tuple):          # cas d'erreur
                return jsonify(result[0]), result[1]
            return jsonify(result)
        except Exception as e:
            log.error(f"[{prefix}] Erreur génération :\n{traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500


# Enregistrement des 3 paires de routes GAN
make_routes("stylegan", "stylegan")
make_routes("progan",   "progan")
make_routes("dcgan",    "dcgan")

# ─────────────────────────────────────────────────────────────
#  Route Text-to-Image — HF Inference API (requests, sans gradio_client)
# ─────────────────────────────────────────────────────────────

import requests as _requests

# ── Modèles T2I ordonnés par priorité ─────────────────────────
_T2I_MODELS = [
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-xl-base-1.0",
    "stabilityai/stable-diffusion-2-1",
    "CompVis/stable-diffusion-v1-4",
]


def _call_hf_inference(model_id: str, prompt: str, width: int, height: int) -> str:
    """
    Utilise huggingface_hub.InferenceClient — gère automatiquement
    le nouveau système Inference Providers (2025).
    Retourne le base64 PNG pur ou lève une exception.
    """
    try:
        from huggingface_hub import InferenceClient
        from PIL import Image as _PILImage
    except ImportError:
        raise RuntimeError("huggingface_hub non installé : pip install huggingface_hub pillow")

    log.info(f"[T2I] InferenceClient → {model_id}  prompt={prompt[:50]!r}")
    client = InferenceClient(token=HF_TOKEN or None)

    # text_to_image retourne une PIL.Image directement
    image = client.text_to_image(
        prompt,
        model=model_id,
        width=width,
        height=height,
    )

    return pil_to_b64(image)


@app.route("/texttoimage/generate", methods=["POST"])
def t2i_generate():
    body   = request.get_json(silent=True) or {}
    prompt = body.get("prompt", "").strip()
    width  = int(body.get("width",  512))
    height = int(body.get("height", 512))

    if not prompt:
        return jsonify({"error": "Le prompt est requis"}), 400

    width  = min(max(width,  256), 1024)
    height = min(max(height, 256), 1024)

    t0     = time.time()
    errors = []

    for model_id in _T2I_MODELS:
        try:
            image_b64 = _call_hf_inference(model_id, prompt, width, height)
            elapsed   = round(time.time() - t0, 2)
            label     = model_id.split("/")[-1]
            log.info(f"[T2I] ✓ {model_id} — {elapsed}s")
            return jsonify({
                "image" : image_b64,
                "model" : label,
                "prompt": prompt,
            })
        except Exception as e:
            err_msg = str(e)[:200]
            errors.append(f"{model_id}: {err_msg}")
            log.warning(f"[T2I] ✗ {model_id} : {err_msg}")
            continue

    log.error("[T2I] Tous les modèles ont échoué :")
    for err in errors:
        log.error(f"       {err}")
    return jsonify({"error": "Aucun modèle disponible", "details": errors}), 500


@app.route("/texttoimage/health", methods=["GET"])
def t2i_health():
    return jsonify({
        "status" : "ok",
        "model"  : "FLUX.1-schnell (HF Inference API)",
        "backend": "HuggingFace Inference API",
        "models" : _T2I_MODELS,
    })


# ── Route racine ─────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "name"    : "GAN Studio Proxy",
        "version" : "1.0.0",
        "routes"  : [
            "/progan/health",       "/progan/generate",
            "/stylegan/health",     "/stylegan/generate",
            "/dcgan/health",        "/dcgan/generate",
            "/texttoimage/health",  "/texttoimage/generate",
        ],
    })

# ─────────────────────────────────────────────────────────────
#  Lancement
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    log.info("=" * 50)
    log.info("GAN Studio Proxy — démarrage")
    log.info(f"Port  : {PORT}")
    log.info(f"Spaces: hysts/StyleGAN2 (x3 configs)")
    log.info("Routes:")
    for key in MODELS_CONFIG:
        log.info(f"  POST /{key}/generate   GET /{key}/health")
    log.info("=" * 50)
    app.run(host="0.0.0.0", port=PORT, debug=False)
