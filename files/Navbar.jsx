// src/components/layout/Navbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixed top navigation bar.
// Uses React Router's <NavLink> for active-state styling.
// Props: none (reads NAV_LINKS from constants)
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants/tokens';

export default function Navbar() {
  return (
    <nav className="
      fixed top-0 left-0 right-0 z-50
      bg-bb-cream/90 backdrop-blur-md
      border-b border-bb-ink-10
      h-[60px] flex items-center
      px-4 md:px-12
      gap-0
    ">
      {/* ── Logo ── */}
      <NavLink
        to="/"
        className="flex items-center gap-2.5 font-serif text-[1.15rem] text-bb-ink no-underline flex-shrink-0"
      >
        {/* Blood drop SVG */}
        <span className="relative w-7 h-7 flex-shrink-0">
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="14" cy="12" r="9" fill="#C8102E" />
            <path d="M11 20 Q14 26 17 20" fill="#C8102E" />
          </svg>
        </span>
        Blood Bridge
      </NavLink>

      {/* ── Nav links ── */}
      <ul className="hidden md:flex items-center gap-1 ml-auto list-none">
        {NAV_LINKS.map(({ label, to }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `text-[0.88rem] font-normal px-3.5 py-1.5 rounded-full transition-all duration-200 no-underline
                ${isActive
                  ? 'text-bb-red font-medium'
                  : 'text-bb-ink-60 hover:text-bb-ink hover:bg-bb-ink-10'
                }`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* ── CTA ── */}
      <NavLink
        to="/eligibility"
        className="
          inline-flex items-center gap-1.5
          bg-bb-red text-white
          px-5 py-2 rounded-full
          text-[0.88rem] font-medium
          no-underline ml-3
          transition-all duration-200
          hover:bg-bb-red-dark hover:-translate-y-px
        "
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Donate Now
      </NavLink>
    </nav>
  );
}
