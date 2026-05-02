"""
test_api.py — Vérifie que le Space hysts/StyleGAN2 répond correctement
avant de déployer le proxy sur Railway.

Usage :
    pip install gradio_client pillow
    python test_api.py
"""

import os, io, base64
from gradio_client import Client
from PIL import Image

SPACE = "hysts/StyleGAN2"

print(f"\nConnexion à {SPACE}...")
client = Client(SPACE)

print("\nParamètres disponibles :")
client.view_api()

print("\nTest de génération...")
result = client.predict(
    model_name     = "FFHQ-256",
    seed           = 42.0,
    randomize_seed = False,
    truncation_psi = 0.7,
    class_index    = 0,
    api_name       = "/predict",
)

print(f"\nType retourné : {type(result)}")
print(f"Longueur du tuple : {len(result)}")
print(f"result[0] (image) : {result[0]}")
print(f"result[1] (seed)  : {result[1]}")

# Vérifier que le fichier image existe
assert os.path.exists(result[0]), "Le fichier image n'existe pas !"

# Convertir en base64
img = Image.open(result[0]).convert("RGB")
buf = io.BytesIO()
img.save(buf, "PNG")
b64 = base64.b64encode(buf.getvalue()).decode()

print(f"\nBase64 (60 premiers chars) : {b64[:60]}...")
print(f"Taille image : {img.size}")
print(f"\nSUCCES — Le proxy est prêt à être déployé.")
