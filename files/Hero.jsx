// src/components/home/Hero.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Landing page hero: left content column + right animated blood-ring visual.
// Responsive: ring visual hidden on mobile (md:flex).
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { HERO_STATS, ORBIT_BLOOD_TYPES } from '../../constants/tokens';

// Orbit dot positions (top / bottom / left / right of the ring)
const ORBIT_POSITIONS = [
  'top-[-24px] left-1/2 -translate-x-1/2',
  'bottom-[-24px] left-1/2 -translate-x-1/2',
  'left-[-24px] top-1/2 -translate-y-1/2',
  'right-[-24px] top-1/2 -translate-y-1/2',
];

export default function Hero() {
  return (
    <section className="
      min-h-screen
      pt-[100px] pb-[60px]
      px-4 md:px-[clamp(16px,6vw,80px)]
      grid grid-cols-1 md:grid-cols-2
      gap-[60px] items-center
      relative overflow-hidden
    ">
      {/* Radial background glow */}
      <div
        className="absolute top-[-120px] right-[-120px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,16,46,0.07) 0%, transparent 70%)' }}
      />

      {/* ── LEFT — Content ── */}
      <div className="hero-content">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 bg-bb-red-light text-bb-red-dark px-3.5 py-1 rounded-full text-[0.78rem] font-medium tracking-[0.04em] uppercase mb-5">
          <span className="w-1.5 h-1.5 bg-bb-red rounded-full animate-bb-pulse" />
          AI-Powered Blood Management System
        </div>

        {/* Headline */}
        <h1 className="mb-5 font-serif">
          Connecting <em className="italic text-bb-red not-italic" style={{ fontStyle: 'italic' }}>Life</em>
          <br />Dynamically Through
          <br />Smart Technology
        </h1>

        {/* Sub-text */}
        <p className="text-bb-ink-60 text-[1.05rem] max-w-[480px] mb-9 leading-[1.7]">
          Blood Bridge uses machine learning, real-time geo-matching, and predictive analytics
          to eliminate blood shortages — connecting the right donor to the right patient in minutes.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/eligibility"
            className="
              inline-flex items-center gap-2
              bg-bb-red text-white
              px-7 py-3.5 rounded-bb
              text-[0.95rem] font-medium no-underline
              transition-all duration-200
              hover:bg-bb-red-dark hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,16,46,0.25)]
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Check Eligibility
          </Link>
          <Link
            to="/hospital"
            className="
              inline-flex items-center gap-2
              bg-transparent text-bb-ink
              px-7 py-[13px] rounded-bb
              text-[0.95rem] font-medium no-underline
              border border-[1.5px] border-bb-ink-30
              transition-all duration-200
              hover:border-bb-ink hover:bg-bb-ink-10
            "
          >
            Request Blood
          </Link>
        </div>

        {/* Stats bar */}
        <div className="flex gap-8 mt-12 pt-8 border-t border-bb-ink-10">
          {HERO_STATS.map(({ value, label }) => (
            <div key={label}>
              <span className="font-serif text-[2rem] text-bb-red block">{value}</span>
              <span className="text-[0.8rem] text-bb-ink-60">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — Animated ring visual ── */}
      <div className="hidden md:flex items-center justify-center">
        {/* Rotating dashed ring */}
        <div className="w-[380px] h-[380px] rounded-full border-2 border-dashed border-bb-red-mid relative animate-bb-rotate">

          {/* Orbit dots — counter-rotate to stay upright */}
          {ORBIT_BLOOD_TYPES.map((type, i) => (
            <div
              key={type}
              className={`absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(14,12,13,0.1)] text-[0.65rem] font-medium text-bb-ink orbit-label ${ORBIT_POSITIONS[i]}`}
            >
              {type}
            </div>
          ))}

          {/* Centre card — pinned, does NOT rotate */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-bb-lg p-6 w-[220px] shadow-[0_20px_60px_rgba(14,12,13,0.12)]"
            style={{ animation: 'none' }}
          >
            <div className="text-[0.72rem] text-bb-ink-60 uppercase tracking-[0.05em] mb-1.5">
              Best match found
            </div>
            <div className="font-serif text-[2.4rem] text-bb-red leading-none">O+</div>
            <div className="text-[0.78rem] text-bb-ink-60 mt-1.5">Rahul M. · 3.2 km</div>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-bb-green mt-2">
              <span className="w-1.5 h-1.5 bg-bb-green rounded-full inline-block" />
              Eligible · 91% willingness
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-bb-ink-10 rounded-full overflow-hidden">
              <div className="h-full w-[91%] bg-bb-green rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
