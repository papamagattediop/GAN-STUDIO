import { useState } from 'react'
import './TextToImage.css'

const EXAMPLES = [
  'Portrait d\'une jeune femme aux yeux verts, éclairage doux',
  'Un homme âgé avec une barbe blanche, photoréaliste',
  'Un visage futuriste aux yeux bleus lumineux',
  'Un enfant souriant sous la lumière dorée du soleil couchant',
]

const SIZES = [
  { label: '512 × 512',  w: 512,  h: 512  },
  { label: '768 × 512',  w: 768,  h: 512  },
  { label: '512 × 768',  w: 512,  h: 768  },
  { label: '1024 × 1024', w: 1024, h: 1024 },
]

const API_URL = import.meta.env.VITE_T2I_URL || 'http://localhost:8000'

async function generateFromPrompt(prompt, width, height) {
  const res = await fetch(`${API_URL}/texttoimage/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ prompt, width, height }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Erreur ${res.status}`)
  }
  return res.json()
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1v13M2 6l5.5-5.5L13 6"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v9M3.5 7 7 10.5 10.5 7M1.5 12.5h11"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function TextToImage() {
  const [prompt,  setPrompt]  = useState('')
  const [size,    setSize]    = useState(SIZES[0])
  const [image,   setImage]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [genTime, setGenTime] = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setImage(null)
    setGenTime(null)
    const t0 = Date.now()
    try {
      const data = await generateFromPrompt(prompt.trim(), size.w, size.h)
      setImage(data.image)
      setGenTime(((Date.now() - t0) / 1000).toFixed(1))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${image}`
    a.download = 'generated_image.png'
    a.click()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate()
  }

  return (
    <div className="page-wrapper">
      <div className="container t2i">

        {/* ── Header ──────────────────────────────────── */}
        <header className="t2i__header">
          <h1 className="t2i__title text-4xl">Génération par prompt</h1>
          <p className="t2i__sub">
            Décrivez une image en texte. Propulsé par{' '}
            <span className="t2i__model-name">FLUX.1-schnell</span>{' '}
            via Hugging Face.
          </p>
        </header>

        {/* ── Layout ──────────────────────────────────── */}
        <div className="t2i__layout">

          {/* ── Panel gauche ────────────────────────── */}
          <aside className="t2i__controls">

            {/* Prompt */}
            <div className="glass-card t2i__prompt-card">
              <label className="t2i__label" htmlFor="prompt">
                Votre prompt
              </label>
              <textarea
                id="prompt"
                className="t2i__textarea"
                placeholder="Ex : Portrait d'une femme aux yeux verts, éclairage doux..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKey}
                rows={5}
              />
              <p className="t2i__hint">Ctrl + Entrée pour générer</p>
            </div>

            {/* Exemples */}
            <div className="glass-card t2i__examples-card">
              <p className="t2i__label">Exemples</p>
              <div className="t2i__examples">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    className="t2i__example-btn"
                    onClick={() => setPrompt(ex)}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Taille */}
            <div className="glass-card t2i__size-card">
              <p className="t2i__label">Dimensions</p>
              <div className="t2i__sizes">
                {SIZES.map((s) => (
                  <button
                    key={s.label}
                    className={`t2i__size-btn${size.label === s.label ? ' t2i__size-btn--active' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton */}
            <button
              className="btn btn--primary btn--full t2i__submit"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
            >
              {loading
                ? <><div className="spinner spinner--sm" /> Génération en cours...</>
                : <><SendIcon /> Générer l'image</>
              }
            </button>

            {genTime && (
              <p className="t2i__time">Généré en {genTime}s · FLUX.1-schnell</p>
            )}

            {error && (
              <div className="alert alert--error">{error}</div>
            )}

          </aside>

          {/* ── Résultat ────────────────────────────── */}
          <section className="glass-card t2i__result">
            {image ? (
              <div className="t2i__output">
                <img
                  src={`data:image/png;base64,${image}`}
                  alt="Image générée"
                  className="t2i__image"
                />
                <div className="t2i__output-footer">
                  <p className="t2i__output-prompt">"{prompt}"</p>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={handleDownload}
                  >
                    <DownloadIcon /> Télécharger
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="2" y="2" width="8" height="8" rx="2"
                          stroke="rgba(74,123,90,0.4)" strokeWidth="1.4" fill="none"/>
                    <rect x="12" y="2" width="8" height="8" rx="2"
                          stroke="rgba(74,123,90,0.4)" strokeWidth="1.4" fill="none"/>
                    <rect x="2" y="12" width="8" height="8" rx="2"
                          stroke="rgba(74,123,90,0.4)" strokeWidth="1.4" fill="none"/>
                    <rect x="12" y="12" width="8" height="8" rx="2"
                          stroke="rgba(74,123,90,0.4)" strokeWidth="1.4" fill="none"/>
                  </svg>
                </div>
                <div className="empty-state__title">Entrez une description</div>
                <div className="empty-state__sub">
                  {loading ? 'Génération en cours…' : "L'image apparaîtra ici"}
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
