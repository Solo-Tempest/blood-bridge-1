import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../../constants/tokens';

export default function Footer() {
  return (
    <footer className="bg-bb-ink text-white px-4 md:px-20 pt-12 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
        <div>
          <h3 className="text-white text-[1.2rem] mb-2.5 font-serif">Blood Bridge</h3>
          <p className="text-bb-ink-30 text-[0.85rem] leading-relaxed max-w-[280px]">
            An AI-powered smart blood donation and management system. Connecting donors,
            hospitals, and blood banks through intelligent technology.
          </p>
          <div className="mt-4 text-[0.78rem] text-bb-ink-30 font-mono leading-relaxed">
            Final Year Project · Computer Science &amp; Engineering
            <br />
            Built with FastAPI · React · PyTorch · Rasa
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h5 className="text-[0.78rem] uppercase tracking-[0.06em] text-bb-ink-30 mb-3.5">
              {heading}
            </h5>
            <ul className="list-none space-y-2">
              {links.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-bb-ink-30 no-underline text-[0.88rem] transition-colors duration-200 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.08] pt-6 flex justify-between items-center flex-wrap gap-2">
        <p className="text-[0.78rem] text-bb-ink-30">
          © 2025 Blood Bridge. Built for academic demonstration.
        </p>
        <p className="font-mono text-[0.72rem] text-bb-ink-30">
          v1.0.0 · Jharkhand, India
        </p>
      </div>
    </footer>
  );
}
