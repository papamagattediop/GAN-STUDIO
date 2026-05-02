import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">

        <Link to="/" className="footer__brand">
          <div className="footer__brand-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2"  y="2"  width="5" height="5" rx="1" fill="white" opacity="0.95"/>
              <rect x="9"  y="2"  width="5" height="5" rx="1" fill="white" opacity="0.55"/>
              <rect x="2"  y="9"  width="5" height="5" rx="1" fill="white" opacity="0.55"/>
              <rect x="9"  y="9"  width="5" height="5" rx="1" fill="white" opacity="0.95"/>
            </svg>
          </div>
          <span className="footer__brand-name">GAN Studio</span>
        </Link>

        <p className="footer__academic">
          Projet académique · 2025/2026 · AS3 Deep Learning
        </p>

      </div>
    </footer>
  )
}
