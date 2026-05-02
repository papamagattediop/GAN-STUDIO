import { Link } from 'react-router-dom'
import { MODELS, MODEL_KEYS } from '../../config/api'
import './Home.css'

/* ── Données statiques ──────────────────────────────────── */

const HERO_STATS = [
  { value: '70 000',  label: 'Portraits FFHQ' },
  { value: '3',       label: 'Architectures GAN' },
  { value: '256 px',  label: 'Résolution maximale' },
  { value: 'FID 28',  label: 'Meilleur score obtenu' },
]

const OBJECTIVES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.9"/>
        <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.45"/>
        <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.45"/>
        <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.9"/>
      </svg>
    ),
    title: 'Implémenter trois architectures',
    desc:  'DCGAN, ProGAN et StyleGAN2, chacune représentant une étape clé dans l\'évolution des réseaux antagonistes génératifs.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Entraîner sur FFHQ',
    desc:  '70 000 portraits haute résolution issus du dataset Flickr-Faces-HQ, avec augmentation de données et normalisation adaptée.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 14l4-5 3 3 3-4 4 6H3z" fill="currentColor" opacity="0.7"/>
        <path d="M3 14l4-5 3 3 3-4 4 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    title: 'Évaluer avec FID et IS',
    desc:  'Mesurer la qualité et la diversité des images générées via le Fréchet Inception Distance et l\'Inception Score.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Déployer via API RunPod',
    desc:  'Chaque modèle expose une API Flask servie sur GPU RunPod, accessible en temps réel depuis cette interface web.',
  },
]

const USE_CASES = [
  {
    label:  'FaceStyle AI',
    sector: 'Publicité',
    desc:   'Génération de portraits synthétiques pour des campagnes publicitaires sans avoir recours à des modèles humains réels.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M3 19c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    label:  'FashionGAN',
    sector: 'Mode',
    desc:   'Création d\'images de vêtements et d\'accessoires virtuels pour les catalogues e-commerce et les cabines d\'essayage digitales.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M8 3l-4 4 3 1v10h8V8l3-1-4-4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
        <path d="M8 3c0 1.7 1.3 3 3 3s3-1.3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
  },
  {
    label:  'CIFAR Vision Labs',
    sector: 'Vision par ordinateur',
    desc:   'Augmentation de données synthétiques pour enrichir les jeux d\'entraînement et améliorer la robustesse des classifieurs.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <rect x="12" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <rect x="3" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <rect x="12" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
  },
  {
    label:  'AnimeGAN Studio',
    sector: 'Animation',
    desc:   'Génération de personnages animés stylisés pour les studios créatifs et les plateformes de contenu interactif.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M7 13c1 1.5 2.3 2.5 4 2.5s3-1 4-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        <circle cx="8.5"  cy="9.5" r="1" fill="currentColor"/>
        <circle cx="13.5" cy="9.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
]

const HOW_IT_WORKS = [
  {
    n:     '01',
    title: 'Choisir une architecture',
    desc:  'Sélectionnez ProGAN, StyleGAN2 ou DCGAN selon vos critères : qualité, vitesse ou dimension de sortie.',
  },
  {
    n:     '02',
    title: 'Lancer la génération',
    desc:  'Un vecteur latent aléatoire est transmis à l\'API GPU RunPod. Le réseau produit l\'image en quelques secondes.',
  },
  {
    n:     '03',
    title: 'Analyser et comparer',
    desc:  'Visualisez côte à côte les résultats des trois architectures et consultez leurs métriques FID et IS détaillées.',
  },
]

/* ── Icône modèle ────────────────────────────────────────── */
function ModelIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2"  y="2"  width="6" height="6" rx="1.5" fill={color} opacity="0.9"/>
      <rect x="10" y="2"  width="6" height="6" rx="1.5" fill={color} opacity="0.4"/>
      <rect x="2"  y="10" width="6" height="6" rx="1.5" fill={color} opacity="0.4"/>
      <rect x="10" y="10" width="6" height="6" rx="1.5" fill={color} opacity="0.9"/>
    </svg>
  )
}

/* ── Composant principal ─────────────────────────────────── */
export default function Home() {
  return (
    <>
      {/* ════════ HERO ════════════════════════════════════ */}
      <section className="hero">
        <div className="soft-blob soft-blob--1" />
        <div className="soft-blob soft-blob--2" />
        <div className="soft-blob soft-blob--3" />
        <div className="hero__grid-bg grid-dots" />

        <div className="container hero__content">

          <div className="hero__badge anim-fade-up delay-1">
            <span className="tag tag--green">
              <span className="tag__dot" />
              Deep Learning · Architectures Avancées · AS3
            </span>
          </div>

          <h1 className="hero__title text-hero anim-fade-up delay-2">
            Génération d'images<br />
            <span className="gradient-text">synthétiques par GANs</span>
          </h1>

          <p className="hero__subtitle text-base anim-fade-up delay-3">
            Trois architectures de réseaux antagonistes génératifs entraînées sur
            70 000 visages haute résolution. Observez, comparez et explorez la
            synthèse d'images en temps réel.
          </p>

          <div className="hero__cta anim-fade-up delay-4">
            <Link to="/generator" className="btn btn--primary btn--lg">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1.5v12M2.5 7.5l5-5 5 5"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Générer des images
            </Link>
            <Link to="/compare" className="btn btn--ghost btn--lg">
              Comparer les modèles
            </Link>
          </div>

          <div className="hero__stats anim-fade-up delay-5">
            {HERO_STATS.map(({ value, label }) => (
              <div key={label} className="hero__stat">
                <div className="hero__stat-value">{value}</div>
                <div className="hero__stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__scroll">
          <span>Défiler</span>
          <div className="hero__scroll-track">
            <div className="hero__scroll-dot" />
          </div>
        </div>
      </section>

      {/* ════════ OBJECTIFS ═══════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-header">
            <span className="tag tag--green">Objectifs du projet</span>
            <h2 className="section-header__title text-4xl">
              Un projet, quatre ambitions
            </h2>
            <p className="section-header__sub">
              GANs — Génération d'Images Synthétiques explore la frontière entre
              apprentissage profond et création visuelle assistée par intelligence artificielle.
            </p>
          </div>

          <div className="grid-auto-2 objectives-grid">
            {OBJECTIVES.map(({ icon, title, desc }) => (
              <div key={title} className="glass-card glass-card--hover objective-card">
                <div className="objective-card__icon">{icon}</div>
                <div>
                  <h3 className="objective-card__title">{title}</h3>
                  <p className="objective-card__desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ MODÈLES ════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="tag tag--pale">Architectures</span>
            <h2 className="section-header__title text-4xl">
              Trois approches, une même finalité
            </h2>
            <p className="section-header__sub">
              De la référence historique au modèle de pointe, chaque architecture
              révèle une facette différente de la génération d'images par apprentissage.
            </p>
          </div>

          <div className="grid-auto-3">
            {MODEL_KEYS.map((key) => {
              const m = MODELS[key]
              return (
                <article
                  key={key}
                  className="glass-card glass-card--hover model-card"
                >
                  <div
                    className="model-card__icon"
                    style={{
                      background: `${m.color}14`,
                      borderColor: `${m.color}30`,
                    }}
                  >
                    <ModelIcon color={m.color} />
                  </div>

                  <span className="tag tag--pale model-card__tag">{m.tag}</span>

                  <h3 className="model-card__title">{m.label}</h3>
                  <p className="model-card__desc">{m.description}</p>

                  <div className="model-card__stats">
                    {[
                      { label: 'FID',        value: m.fid,        color: m.color },
                      { label: 'IS',         value: m.is,         color: 'var(--color-text-primary)' },
                      { label: 'Résolution', value: m.resolution, color: 'var(--color-text-primary)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="model-card__stat">
                        <div className="model-card__stat-label">{label}</div>
                        <div className="model-card__stat-value" style={{ color }}>{value}</div>
                      </div>
                    ))}
                  </div>

                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════ FONCTIONNEMENT ═════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-header">
            <span className="tag tag--pale">Fonctionnement</span>
            <h2 className="section-header__title text-4xl">
              De la latence à l'image
            </h2>
          </div>

          <div className="grid-auto-3">
            {HOW_IT_WORKS.map(({ n, title, desc }) => (
              <div key={n} className="glass-card step-card">
                <div className="step-card__number">{n}</div>
                <h3 className="step-card__title">{title}</h3>
                <p className="step-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CAS D'USAGE ════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="tag tag--green">Applications concrètes</span>
            <h2 className="section-header__title text-4xl">
              Ce que les GANs rendent possible
            </h2>
            <p className="section-header__sub">
              Quatre cas d'usage réels qui illustrent le potentiel industriel
              et créatif de la génération d'images synthétiques.
            </p>
          </div>

          <div className="grid-auto-2 usecases-grid">
            {USE_CASES.map(({ label, sector, desc, icon }) => (
              <div key={label} className="glass-card glass-card--hover usecase-card">
                <div className="usecase-card__top">
                  <div className="usecase-card__icon">{icon}</div>
                  <span className="tag tag--pale usecase-card__sector">{sector}</span>
                </div>
                <h3 className="usecase-card__title">{label}</h3>
                <p className="usecase-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA FINAL ══════════════════════════════ */}
      <section className="section--sm home-cta">
        <div className="container">
          <div className="home-cta__inner glass-card">
            <div className="soft-blob soft-blob--3" style={{ opacity: 0.5 }} />
            <div className="home-cta__content">
              <span className="tag tag--green">Prêt à explorer ?</span>
              <h2 className="home-cta__title text-3xl">
                Lancez la génération maintenant
              </h2>
              <p className="home-cta__sub">
                Choisissez votre architecture et observez en direct la puissance
                des réseaux antagonistes génératifs.
              </p>
              <div className="home-cta__actions">
                <Link to="/generator" className="btn btn--primary btn--lg">
                  Ouvrir le générateur
                </Link>
                <Link to="/metrics" className="btn btn--ghost btn--lg">
                  Explorer les métriques
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
