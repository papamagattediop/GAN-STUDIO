import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/',               label: 'Accueil',        end: true  },
  { to: '/generator',      label: 'Générateur',     end: false },
  { to: '/compare',        label: 'Comparer',       end: false },
  { to: '/metrics',        label: 'Métriques',      end: false },
  { to: '/text-to-image',  label: 'Texte → Image',  end: false },
]

function LogoIcon() {
  return (
    <div className="navbar__logo-icon">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2"  y="2"  width="5" height="5" rx="1" fill="white" opacity="0.95"/>
        <rect x="9"  y="2"  width="5" height="5" rx="1" fill="white" opacity="0.55"/>
        <rect x="2"  y="9"  width="5" height="5" rx="1" fill="white" opacity="0.55"/>
        <rect x="9"  y="9"  width="5" height="5" rx="1" fill="white" opacity="0.95"/>
      </svg>
    </div>
  )
}

function BurgerIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {open ? (
        <path d="M5 5l12 12M17 5 5 17"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      ) : (
        <>
          <line x1="4" y1="7"  x2="18" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="4" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="4" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      )}
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">

        <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
          <LogoIcon />
          <span className="navbar__logo-text">GAN Studio</span>
        </Link>

        <div className="navbar__links">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <Link to="/generator" className="btn btn--primary navbar__cta">
          Générer <ArrowIcon />
        </Link>

        <button
          className="navbar__burger"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <BurgerIcon open={open} />
        </button>
      </div>

      {open && (
        <div className="navbar__mobile">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/generator"
            className="btn btn--primary navbar__mobile-cta"
            onClick={() => setOpen(false)}
          >
            Générer maintenant
          </Link>
        </div>
      )}
    </nav>
  )
}
