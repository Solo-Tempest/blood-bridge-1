// src/components/home/ModulesSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// "Intelligence at every layer" — 5 AI module cards on a white background.
// Each card is clickable and routes to the relevant portal page.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom';
import { AI_MODULES } from '../../constants/tokens';

function ModuleCard({ num, icon, iconBg, title, desc, tags, to }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(to)}
      className="
        relative bg-white rounded-bb-lg p-7
        border border-bb-ink-10 cursor-pointer
        overflow-hidden
        transition-all duration-[250ms]
        hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(14,12,13,0.1)] hover:border-bb-ink-30
        group
      "
    >
      {/* Top accent line — slides in on hover */}
      <div className="
        absolute top-0 left-0 right-0 h-[3px] bg-bb-red
        scale-x-0 origin-left transition-transform duration-300
        group-hover:scale-x-100
      " />

      <div className="font-mono text-[0.72rem] text-bb-ink-30 mb-4">{num}</div>

      <div
        className="w-11 h-11 rounded-bb-sm flex items-center justify-center mb-4 text-xl"
        style={{ background: iconBg }}
      >
        {icon}
      </div>

      <h4 className="mb-2 font-serif">{title}</h4>
      <p className="text-[0.88rem] text-bb-ink-60 leading-relaxed mb-4">{desc}</p>

      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-block bg-bb-ink-10 text-bb-ink-60 text-[0.72rem] px-2.5 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ModulesSection() {
  return (
    <section className="bg-white py-20 px-4 md:px-[clamp(16px,6vw,80px)]">
      {/* Section header */}
      <div className="flex items-center gap-2.5 text-[0.78rem] font-medium tracking-[0.06em] uppercase text-bb-red mb-3.5 eyebrow-line">
        Five AI Modules
      </div>
      <h2 className="font-serif mb-2.5">Intelligence at every layer</h2>
      <p className="text-bb-ink-60 max-w-[540px] mb-12 text-[1rem]">
        Each module solves a distinct problem, feeding outputs into the next — forming a unified decision pipeline.
      </p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {AI_MODULES.map((mod) => (
          <ModuleCard key={mod.title} {...mod} />
        ))}
      </div>
    </section>
  );
}
