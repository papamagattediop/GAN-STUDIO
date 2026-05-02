import { useEffect, useState } from 'react'
import { MODELS, MODEL_KEYS } from '../../config/api'
import './Metrics.css'

const TRAINING = {
  ProGAN: {
    Dataset:    'FFHQ-256 (70k images)',
    Epochs:     '30 par résolution',
    Optimizer:  'Adam (β₁=0, β₂=0.99)',
    Loss:       'WGAN (Wasserstein)',
    Latent:     '512 dimensions',
    Device:     'CUDA — RunPod',
    Technique:  'Progressive growing',
  },
  StyleGAN2: {
    Dataset:    'FFHQ-256 (70k images)',
    Epochs:     '50',
    Optimizer:  'Adam (β₁=0, β₂=0.99)',
    Loss:       'Non-saturating + R1',
    Latent:     '512 dimensions',
    Device:     'CUDA — RunPod',
    Technique:  'Style mapping + AdaIN',
  },
  DCGAN: {
    Dataset:    'FFHQ-64 (70k images)',
    Epochs:     '80',
    Optimizer:  'Adam (β₁=0.5, β₂=0.999)',
    Loss:       'BCE standard',
    Latent:     '100 dimensions',
    Device:     'CUDA — RunPod',
    Technique:  'Conv. transposées',
  },
}

const INTERP = [
  { range: 'FID < 50',    label: 'Excellent',   desc: 'Images quasi indiscernables des visages réels.',    color: '#3A7A6A' },
  { range: 'FID 50–150',  label: 'Acceptable',  desc: 'Qualité correcte, quelques artefacts visibles.',   color: '#8A7060' },
  { range: 'FID > 150',   label: 'Insuffisant', desc: 'Mode collapse ou entraînement insuffisant.',       color: 'var(--color-error-text)'  },
]

function MetricBar({ value, max, color, animate }) {
  const pct = Math.min(100, (value / max) * 100).toFixed(1)
  return (
    <div className="metric-bar">
      <div
        className="metric-bar__fill"
        style={{
          width: animate ? `${pct}%` : '0%',
          background: `linear-gradient(90deg, ${color}AA, ${color})`,
        }}
      />
    </div>
  )
}

export default function Metrics() {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 250)
    return () => clearTimeout(t)
  }, [])

  const maxFID = Math.max(...MODEL_KEYS.map(k => MODELS[k].fid))
  const maxIS  = Math.max(...MODEL_KEYS.map(k => MODELS[k].is))

  const bestFID = MODEL_KEYS.reduce((a, b) => MODELS[a].fid < MODELS[b].fid ? a : b)
  const bestIS  = MODEL_KEYS.reduce((a, b) => MODELS[a].is  > MODELS[b].is  ? a : b)

  const sortedByFID = [...MODEL_KEYS].sort((a, b) => MODELS[a].fid - MODELS[b].fid)
  const sortedByIS  = [...MODEL_KEYS].sort((a, b) => MODELS[b].is  - MODELS[a].is)

  return (
    <div className="page-wrapper">
      <div className="container metrics">

        {/* Header */}
        <header className="metrics__header">
          <div className="metrics__tag">
            <span className="tag tag--pale">Métriques</span>
          </div>
          <h1 className="metrics__title text-4xl">Évaluation des modèles</h1>
          <p className="metrics__sub">
            FID, Inception Score et détails d'entraînement pour les trois architectures.
          </p>
        </header>

        {/* Summary */}
        <div className="metrics__summary">
          {[
            { label: 'Meilleur FID',  value: MODELS[bestFID].fid,  sub: MODELS[bestFID].label,  color: MODELS[bestFID].color  },
            { label: 'Meilleur IS',   value: MODELS[bestIS].is,    sub: MODELS[bestIS].label,   color: MODELS[bestIS].color   },
            { label: 'Images FFHQ',   value: '70 000',             sub: 'Dataset complet',      color: 'var(--color-green)'       },
            { label: 'Résolutions',   value: '4 à 256 px',         sub: 'ProGAN progressif',    color: 'var(--color-green-mid)'   },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="summary-card">
              <div className="summary-card__label">{label}</div>
              <div className="summary-card__value" style={{ color }}>{value}</div>
              <div className="summary-card__sub">{sub}</div>
            </div>
          ))}
        </div>

        {/* FID chart */}
        <div className="glass-card chart-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">FID Score</div>
              <div className="chart-card__sub">Fréchet Inception Distance · ↓ plus bas = meilleur</div>
            </div>
            <span className="tag tag--pale">Métrique principale</span>
          </div>

          {sortedByFID.map(key => {
            const m = MODELS[key]
            return (
              <div key={key} className="chart-row">
                <div className="chart-row__meta">
                  <div className="chart-row__name">
                    {m.label}
                    {key === bestFID && <span className="chart-row__best-badge">Best</span>}
                  </div>
                  <MetricBar value={m.fid} max={maxFID} color={m.color} animate={animate} />
                  <div className="chart-row__value" style={{ color: m.color }}>{m.fid}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* IS chart */}
        <div className="glass-card chart-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Inception Score</div>
              <div className="chart-card__sub">Qualité + diversité · ↑ plus haut = meilleur</div>
            </div>
            <span className="tag tag--gray">Métrique secondaire</span>
          </div>

          {sortedByIS.map(key => {
            const m = MODELS[key]
            return (
              <div key={key} className="chart-row">
                <div className="chart-row__meta">
                  <div className="chart-row__name">
                    {m.label}
                    {key === bestIS && <span className="chart-row__best-badge">Best</span>}
                  </div>
                  <MetricBar value={m.is} max={maxIS} color={m.color} animate={animate} />
                  <div className="chart-row__value" style={{ color: m.color }}>{m.is}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Training details */}
        <h2 className="metrics__section-title">Détails d'entraînement</h2>
        <div className="training-grid">
          {MODEL_KEYS.map(key => {
            const m = MODELS[key]
            return (
              <div key={key} className="glass-card training-card">
                <div className="training-card__header">
                  <span className="training-card__dot" style={{ background: m.color }} />
                  <span className="training-card__title">{m.label}</span>
                </div>
                <hr className="divider" style={{ marginBottom: 14 }} />
                {Object.entries(TRAINING[key]).map(([k, v]) => (
                  <div key={k} className="training-card__row">
                    <span className="training-card__key">{k}</span>
                    <span className="training-card__val">{v}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Interpretation */}
        <div className="interpretation">
          <div className="interpretation__title">Interprétation des résultats</div>
          <div className="interpretation__grid">
            {INTERP.map(({ range, label, desc, color }) => (
              <div key={range} className="interp-item">
                <div className="interp-item__bar" style={{ background: color }} />
                <div>
                  <div className="interp-item__range" style={{ color }}>{range} — {label}</div>
                  <div className="interp-item__desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
