import { useState } from 'react'
import { MODELS, MODEL_KEYS, generateImages } from '../../config/api'
import './Compare.css'

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M12 7A5 5 0 1 1 7 2m5 0v3h-3"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function ModelColumn({ modelId, image, loading, error, onRegen }) {
  const m = MODELS[modelId]

  const handleDownload = () => {
    if (!image) return
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${image}`
    a.download = `${modelId.toLowerCase()}_generated.png`
    a.click()
  }

  return (
    <div className="compare-col">
      {/* Header */}
      <div className="glass-card compare-col__header">
        <span className="compare-col__dot" style={{ background: m.color }} />
        <div>
          <div className="compare-col__name">{m.label}</div>
          <div className="compare-col__meta">{m.resolution}</div>
        </div>
      </div>

      {/* Image */}
      <div
        className={`compare-col__img-area${loading ? ' compare-col__img-area--loading' : ''}`}
        style={{
          border: `0.5px solid ${(loading || image) ? m.color + '35' : 'var(--color-border)'}`,
        }}
      >
        {loading && (
          <div className="compare-col__placeholder">
            <div style={{
              width: 28, height: 28,
              border: `2px solid ${m.color}28`,
              borderTopColor: m.color,
              borderRadius: '50%',
              animation: 'spinCW 0.75s linear infinite',
            }} />
            <span className="compare-col__placeholder-text">Génération…</span>
          </div>
        )}

        {!loading && error && (
          <div className="compare-col__placeholder">
            <span style={{ fontSize: 12, color: 'var(--color-error-text)', textAlign: 'center', padding: '0 12px' }}>
              {error}
            </span>
          </div>
        )}

        {!loading && image && (
          <>
            <img className="compare-col__img" src={`data:image/png;base64,${image}`} alt={`${m.label} face`} />
            <div className="compare-col__overlay">
              <button
                className="btn btn--ghost btn--sm"
                onClick={handleDownload}
                style={{ backdropFilter: 'blur(8px)', width: '100%', justifyContent: 'center' }}
              >
                Télécharger
              </button>
            </div>
          </>
        )}

        {!loading && !image && !error && (
          <div className="compare-col__placeholder">
            <div
              className="compare-col__placeholder-icon"
              style={{ borderColor: `${m.color}35` }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 4v10M4 9h10" stroke={`${m.color}65`} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="compare-col__placeholder-text">En attente</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="glass-card compare-col__stats">
        {[
          { label: 'FID ↓',  value: m.fid, color: m.color },
          { label: 'IS ↑',   value: m.is,  color: 'var(--color-text-primary)' },
          { label: 'Résol.', value: m.resolution.split('×')[0] + 'px', color: 'var(--color-text-secondary)' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div className="compare-col__stat-label">{label}</div>
            <div className="compare-col__stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Regen */}
      <button
        className="compare-col__regen"
        disabled={loading}
        onClick={onRegen}
        style={{
          borderColor: `${m.color}28`,
          color: `${m.color}CC`,
          opacity: loading ? 0.45 : 1,
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = `${m.color}10` }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        Regénérer {m.label}
      </button>
    </div>
  )
}

export default function Compare() {
  const [images,       setImages]       = useState({})
  const [loading,      setLoading]      = useState({})
  const [errors,       setErrors]       = useState({})
  const [hasGenerated, setHasGenerated] = useState(false)

  const runOne = async (key) => {
    setImages(p  => ({ ...p,  [key]: null  }))
    setErrors(p  => ({ ...p,  [key]: null  }))
    setLoading(p => ({ ...p,  [key]: true  }))
    setHasGenerated(true)
    try {
      const data = await generateImages(key, 1)
      setImages(p => ({ ...p, [key]: data.images?.[0] ?? null }))
    } catch (err) {
      setErrors(p => ({ ...p, [key]: err.message }))
    } finally {
      setLoading(p => ({ ...p, [key]: false }))
    }
  }

  const runAll = () => Promise.all(MODEL_KEYS.map(runOne))

  const anyLoading = MODEL_KEYS.some(k => loading[k])
  const allDone    = !anyLoading && MODEL_KEYS.every(k => images[k])

  return (
    <div className="page-wrapper">
      <div className="container compare">

        {/* Header */}
        <header className="compare__header">
          <div>
            <div className="compare__tag">
              <span className="tag tag--pale">Comparaison</span>
            </div>
            <h1 className="compare__title text-4xl">Comparer les modèles</h1>
            <p className="compare__sub">Même seed — trois architectures côte à côte.</p>
          </div>

          <div className="compare__actions">
            <button className="btn btn--primary" onClick={runAll} disabled={anyLoading}>
              {anyLoading
                ? <><div className="spinner spinner--sm"/> Génération…</>
                : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg> Tout générer</>
              }
            </button>
            {hasGenerated && (
              <button className="btn btn--ghost" onClick={runAll} disabled={anyLoading}>
                <RefreshIcon /> Regénérer
              </button>
            )}
          </div>
        </header>

        {/* Best model banner */}
        {allDone && (
          <div className="compare__banner anim-fade-up">
            <span className="compare__banner-star">★</span>
            Meilleur FID : <strong>StyleGAN2</strong> (28.1) —
            plus le score FID est bas, plus les images sont réalistes.
          </div>
        )}

        {/* Columns */}
        <div className="compare__grid">
          {MODEL_KEYS.map(key => (
            <ModelColumn
              key={key}
              modelId={key}
              image={images[key]}
              loading={!!loading[key]}
              error={errors[key]}
              onRegen={() => runOne(key)}
            />
          ))}
        </div>

        {/* Legend */}
        <p className="compare__legend">
          <strong>Comment lire les métriques :</strong>{' '}
          Le <strong>FID</strong> mesure la distance entre distributions réelles et générées
          (↓ plus bas = meilleur). L'<strong>IS</strong> mesure qualité + diversité (↑ plus haut = meilleur).
        </p>
      </div>
    </div>
  )
}
