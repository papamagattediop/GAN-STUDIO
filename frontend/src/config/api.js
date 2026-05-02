/* ──────────────────────────────────────────────────────────────
   config/api.js
   Centralize les URLs des 3 APIs RunPod.
   Pour déployer sur Vercel, créer un fichier .env.local avec :
     VITE_PROGAN_URL=https://xxxxx-5002.proxy.runpod.net
     VITE_STYLEGAN_URL=https://xxxxx-5001.proxy.runpod.net
     VITE_DCGAN_URL=https://xxxxx-5003.proxy.runpod.net
────────────────────────────────────────────────────────────── */

export const MODELS = {
  ProGAN: {
    id:          'ProGAN',
    label:       'ProGAN',
    description: 'Entraînement progressif : la résolution croît de 4×4 jusqu\'à 256×256 px, permettant une stabilité d\'apprentissage et des détails fins.',
    tag:         'Progressive',
    tagColor:    'tag--green',
    fid:         42.3,
    is:          3.4,
    resolution:  '256×256',
    url:         import.meta.env.VITE_PROGAN_URL || 'http://localhost:5002',
    color:       '#4A7B5A',
  },
  StyleGAN2: {
    id:          'StyleGAN2',
    label:       'StyleGAN2',
    description: 'Style mapping et Adaptive Instance Normalization pour un contrôle fin du style visuel. Meilleure qualité de génération.',
    tag:         'État de l\'art',
    tagColor:    'tag--green',
    fid:         28.1,
    is:          4.1,
    resolution:  '256×256',
    url:         import.meta.env.VITE_STYLEGAN_URL || 'http://localhost:5001',
    color:       '#3A7A6A',
  },
  DCGAN: {
    id:          'DCGAN',
    label:       'DCGAN',
    description: 'Architecture de référence fondée sur des convolutions profondes. Base historique des GANs modernes, rapide à entraîner.',
    tag:         'Référence',
    tagColor:    'tag--pale',
    fid:         95.2,
    is:          2.1,
    resolution:  '64×64',
    url:         import.meta.env.VITE_DCGAN_URL || 'http://localhost:5003',
    color:       '#8A7060',
  },
}

export const MODEL_KEYS = Object.keys(MODELS)

/* ── API calls ──────────────────────────────────────────── */

export async function generateImages(modelId, n = 1) {
  const model = MODELS[modelId]
  if (!model) throw new Error(`Modèle inconnu : ${modelId}`)

  const res = await fetch(`${model.url}/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ n }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Erreur ${res.status}${text ? ` — ${text}` : ''}`)
  }

  return res.json()
  // Retourne { images: ["base64..."], model: "ProGAN", resolution: "256px" }
}

export async function checkHealth(modelId) {
  const model = MODELS[modelId]
  try {
    const res = await fetch(`${model.url}/health`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

export async function checkAllHealth() {
  const results = await Promise.all(
    MODEL_KEYS.map(async (id) => [id, await checkHealth(id)])
  )
  return Object.fromEntries(results)
}
