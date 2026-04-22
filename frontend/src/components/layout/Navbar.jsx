import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants/tokens';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="
      fixed top-0 left-0 right-0 z-50
      bg-bb-cream/90 backdrop-blur-md
      border-b border-bb-ink-10
    ">
      {/* Main bar */}
      <div className="h-[60px] flex items-center px-4 md:px-12 gap-0">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 font-serif text-[1.15rem] text-bb-ink no-underline flex-shrink-0"
        >
          <span className="relative w-7 h-7 flex-shrink-0">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="14" cy="12" r="9" fill="#C8102E" />
              <path d="M11 20 Q14 26 17 20" fill="#C8102E" />
            </svg>
          </span>
          Blood Bridge
        </NavLink>

        {/* Desktop nav links */}
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

        {/* Desktop login buttons */}
        <div className="hidden md:flex items-center gap-2 ml-3">
          <NavLink
            to="/donor-login"
            className="inline-flex items-center bg-bb-red text-white px-5 py-2 rounded-full text-[0.88rem] font-medium no-underline transition-all duration-200 hover:bg-bb-red-dark hover:-translate-y-px"
          >
            Donor Login
          </NavLink>
          <NavLink
            to="/hospital-login"
            className="inline-flex items-center bg-bb-red text-white px-5 py-2 rounded-full text-[0.88rem] font-medium no-underline transition-all duration-200 hover:bg-bb-red-dark hover:-translate-y-px"
          >
            Hospital Login
          </NavLink>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden ml-auto p-2 rounded-bb text-bb-ink-60 hover:bg-bb-ink-10 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-bb-cream/95 backdrop-blur-md border-t border-bb-ink-10 px-4 py-4 flex flex-col gap-2">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-[0.9rem] px-3 py-2 rounded-bb no-underline transition-colors
                ${isActive ? 'text-bb-red font-medium bg-bb-red-light' : 'text-bb-ink-60 hover:text-bb-ink hover:bg-bb-ink-10'}`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-bb-ink-10">
            <NavLink
              to="/donor-login"
              onClick={() => setMenuOpen(false)}
              className="inline-flex justify-center items-center bg-bb-red text-white px-5 py-2.5 rounded-full text-[0.9rem] font-medium no-underline hover:bg-bb-red-dark transition-colors"
            >
              Donor Login
            </NavLink>
            <NavLink
              to="/hospital-login"
              onClick={() => setMenuOpen(false)}
              className="inline-flex justify-center items-center bg-bb-red text-white px-5 py-2.5 rounded-full text-[0.9rem] font-medium no-underline hover:bg-bb-red-dark transition-colors"
            >
              Hospital Login
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}
