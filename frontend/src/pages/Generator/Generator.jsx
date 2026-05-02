import { useState } from 'react'
import { MODELS, MODEL_KEYS, generateImages } from '../../config/api'
import './Generator.css'

const COUNTS = [1, 4, 9, 16]

function CheckIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="gen-model-btn__check">
      <path d="M2.5 7l3 3 6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

function ImageCard({ src, index }) {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${src}`
    a.download = `gan_face_${index + 1}.png`
    a.click()
  }

  return (
    <div className="img-card" onClick={handleDownload} title="Cliquer pour télécharger">
      <img
        className="img-card__img"
        src={`data:image/png;base64,${src}`}
        alt={`Visage généré ${index + 1}`}
        loading="lazy"
      />
      <div className="img-card__overlay">
        <button className="btn btn--ghost btn--sm" style={{ backdropFilter: 'blur(8px)' }}>
          <DownloadIcon /> Télécharger
        </button>
      </div>
    </div>
  )
}

function ShimmerCard() {
  return (
    <div
      className="shimmer"
      style={{
        aspectRatio: '1',
        borderRadius: 'var(--radius-md)',
        border: '0.5px solid var(--color-border)',
      }}
    />
  )
}

export default function Generator() {
  const [activeModel, setActiveModel] = useState('ProGAN')
  const [count,       setCount]       = useState(4)
  const [images,      setImages]      = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [genTime,     setGenTime]     = useState(null)

  const gridClass = count === 1 ? 'gen-grid--1'
                  : count <= 4  ? 'gen-grid--2'
                  : count <= 9  ? 'gen-grid--3'
                  :               'gen-grid--4'

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setImages([])
    setGenTime(null)
    const t0 = Date.now()
    try {
      const data = await generateImages(activeModel, count)
      setImages(data.images ?? [])
      setGenTime(((Date.now() - t0) / 1000).toFixed(2))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadAll = () => {
    images.forEach((img, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = `data:image/png;base64,${img}`
        a.download = `gan_face_${i + 1}.png`
        a.click()
      }, i * 120)
    })
  }

  const m = MODELS[activeModel]

  return (
    <div className="page-wrapper">
      <div className="container generator">

        {/* Header */}
        <header className="generator__header">
          <div className="generator__tag">
            <span className="tag tag--green">Générateur</span>
          </div>
          <h1 className="generator__title text-4xl">Générer des visages</h1>
          <p className="generator__sub">
            Sélectionnez un modèle, configurez et lancez la génération.
          </p>
        </header>

        <div className="generator__layout">

          {/* ── Controls ──────────────────────────────── */}
          <aside>

            {/* Model selector */}
            <div className="glass-card gen-panel">
              <p className="gen-panel__label">Modèle</p>
              {MODEL_KEYS.map((key) => {
                const mod    = MODELS[key]
                const active = activeModel === key
                return (
                  <button
                    key={key}
                    className={`gen-model-btn${active ? ' gen-model-btn--active' : ''}`}
                    style={{
                      background:   active ? `${mod.color}14` : 'transparent',
                      borderColor:  active ? `${mod.color}45` : 'transparent',
                    }}
                    onClick={() => { setActiveModel(key); setImages([]); setError(null) }}
                  >
                    <span
                      className="gen-model-btn__dot"
                      style={{ background: active ? mod.color : 'var(--color-text-muted)' }}
                    />
                    <span>
                      <div className="gen-model-btn__name">{mod.label}</div>
                      <div className="gen-model-btn__meta">{mod.resolution}</div>
                    </span>
                    {active && <CheckIcon color={mod.color} />}
                  </button>
                )
              })}
            </div>

            {/* Count */}
            <div className="glass-card gen-panel">
              <p className="gen-panel__label">Nombre d'images</p>
              <div className="gen-count-grid">
                {COUNTS.map((n) => (
                  <button
                    key={n}
                    className={`gen-count-btn${count === n ? ' gen-count-btn--active' : ''}`}
                    onClick={() => { setCount(n); setImages([]) }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Model info */}
            <div className="glass-card gen-panel">
              <p className="gen-panel__label">Infos modèle</p>
              {[
                { label: 'FID Score',       value: m.fid        },
                { label: 'Inception Score', value: m.is         },
                { label: 'Résolution',      value: m.resolution },
              ].map(({ label, value }) => (
                <div className="gen-info-row" key={label}>
                  <span className="gen-info-row__label">{label}</span>
                  <span className="gen-info-row__value">{value}</span>
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              className="btn btn--primary gen-submit"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner spinner--sm" /> Génération...</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1v13M1 7.5h13"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Générer {count} image{count > 1 ? 's' : ''}
                </>
              )}
            </button>

            {genTime && (
              <p className="gen-time">
                Généré en {genTime}s · {m.label} · {m.resolution}
              </p>
            )}
          </aside>

          {/* ── Results ───────────────────────────────── */}
          <section className="glass-card gen-results">
            <div className="gen-results__header">
              <div>
                <div className="gen-results__title">
                  {images.length > 0
                    ? `${images.length} image${images.length > 1 ? 's' : ''} générée${images.length > 1 ? 's' : ''}`
                    : 'Résultats'}
                </div>
                {images.length > 0 && (
                  <div className="gen-results__sub">
                    {m.label} · {m.resolution}
                  </div>
                )}
              </div>
              {images.length > 0 && (
                <button className="btn btn--ghost btn--sm" onClick={handleDownloadAll}>
                  <DownloadIcon /> Tout télécharger
                </button>
              )}
            </div>

            {error && (
              <div className="alert alert--error" style={{ marginBottom: 16 }}>
                <strong>Erreur :</strong> {error}
                <br />
                <span style={{ fontSize: 12, opacity: 0.75 }}>
                  Vérifiez que le proxy est bien démarré.
                </span>
              </div>
            )}

            {loading ? (
              <div className={`gen-grid ${gridClass}`}>
                {Array.from({ length: count }).map((_, i) => <ShimmerCard key={i} />)}
              </div>
            ) : images.length > 0 ? (
              <div className={`gen-grid ${gridClass}`}>
                {images.map((img, i) => <ImageCard key={i} src={img} index={i} />)}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3"  y="3"  width="7" height="7" rx="1.5" stroke="rgba(74,123,90,0.35)" strokeWidth="1.4" fill="none"/>
                    <rect x="12" y="3"  width="7" height="7" rx="1.5" stroke="rgba(74,123,90,0.35)" strokeWidth="1.4" fill="none"/>
                    <rect x="3"  y="12" width="7" height="7" rx="1.5" stroke="rgba(74,123,90,0.35)" strokeWidth="1.4" fill="none"/>
                    <rect x="12" y="12" width="7" height="7" rx="1.5" stroke="rgba(74,123,90,0.35)" strokeWidth="1.4" fill="none"/>
                  </svg>
                </div>
                <div className="empty-state__title">Prêt à générer</div>
                <div className="empty-state__sub">Configurez et cliquez sur le bouton</div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
