// src/pages/DonorPortal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Full Donor Portal page.
// Layout: sticky sidebar (user card + nav) + scrollable main content area.
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';

const HISTORY = [
  { date: '12 Jan 2025', desc: 'Whole blood · O+',       status: 'Donated',  deferred: false },
  { date: '08 Oct 2024', desc: 'Whole blood · O+',       status: 'Donated',  deferred: false },
  { date: '14 Jul 2024', desc: 'Deferred — low Hb (12.1)', status: 'Deferred', deferred: true },
  { date: '02 Apr 2024', desc: 'Whole blood · O+',       status: 'Donated',  deferred: false },
];

const STATS = [
  { label: 'Lifetime donations', value: '7',      sub: 'Gold tier — 2 more to Platinum', highlight: true },
  { label: 'Blood credits',      value: '1,420',  sub: 'Redeemable for priority access' },
  { label: 'Next eligible date', value: 'Apr 12', sub: '68 days since last donation',    small: true },
  { label: 'Hemoglobin trend',   value: '14.2',   sub: '↑ 0.4 from last check',         green: true },
];

const TIERS = [
  { label: 'Bronze',   mark: '✓', req: '3 donations',  achieved: true,  current: false },
  { label: 'Silver',   mark: '✓', req: '5 donations',  achieved: true,  current: false },
  { label: 'Gold',     mark: '★', req: '7 donations',  achieved: true,  current: true  },
  { label: 'Platinum', mark: '○', req: '10 donations', achieved: false, current: false },
];

const SIDEBAR_LINKS = [
  { label: 'Dashboard',        to: '#',            active: true },
  { label: 'Health Passport',  to: '#'                         },
  { label: 'Donation History', to: '#'                         },
  { label: 'Book Appointment', to: '#'                         },
  { label: 'Blood Credits',    to: '#'                         },
  { label: 'Eligibility Check',to: '/eligibility'              },
  { label: 'AI Assistant',     to: '/chatbot'                  },
  { label: 'Settings',         to: '#'                         },
];

export default function DonorPortal() {
  return (
    <div className="min-h-screen pt-[80px] pb-10 px-4 md:px-12 bg-bb-cream">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">

        {/* ── SIDEBAR ── */}
        <aside className="md:sticky md:top-[80px] h-fit">
          <div className="bg-white rounded-bb-lg border border-bb-ink-10 p-5 mb-4 text-center">
            <div className="w-14 h-14 rounded-full bg-bb-red-light flex items-center justify-center font-serif text-[1.3rem] text-bb-red mx-auto mb-3">
              AK
            </div>
            <h4 className="font-serif text-[1rem] mb-0.5">Amit Kumar</h4>
            <p className="text-[0.8rem] text-bb-ink-60">Bokaro Steel City</p>
            <span className="inline-block bg-bb-red text-white font-serif text-[1.1rem] px-4 py-1 rounded-full mt-2.5">O+</span>
            <div className="mt-3">
              <span className="inline-block text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full bg-[#E6F9F1] text-bb-green">
                Eligible to donate
              </span>
            </div>
          </div>

          <ul className="list-none space-y-0.5">
            {SIDEBAR_LINKS.map(({ label, to, active }) => (
              <li key={label}>
                <Link
                  to={to}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-bb-sm text-[0.88rem] no-underline transition-all duration-150
                    ${active ? 'bg-bb-red-light text-bb-red font-medium' : 'text-bb-ink-60 hover:bg-bb-red-light hover:text-bb-red'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── MAIN ── */}
        <main>
          <div className="mb-7">
            <h2 className="font-serif text-[1.8rem]">Good morning, Amit</h2>
            <p className="text-bb-ink-60 text-[0.9rem]">
              You are eligible to donate. Next camp:{' '}
              <strong className="text-bb-ink">Bokaro Steel City Hospital</strong> — Thursday, 10am–3pm
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
            {STATS.map(({ label, value, sub, highlight, small, green }) => (
              <div key={label} className={`rounded-bb border p-4 ${highlight ? 'bg-bb-red border-bb-red' : 'bg-white border-bb-ink-10'}`}>
                <div className={`text-[0.75rem] uppercase tracking-[0.04em] mb-1.5 ${highlight ? 'text-white/80' : 'text-bb-ink-60'}`}>{label}</div>
                <div className={`font-serif leading-none mb-1 ${small ? 'text-[1.1rem] pt-1' : 'text-[1.8rem]'} ${highlight ? 'text-white' : 'text-bb-ink'}`}>{value}</div>
                <div className={`text-[0.75rem] ${highlight ? 'text-white/70' : green ? 'text-bb-green' : 'text-bb-ink-60'}`}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
            {/* History */}
            <div className="bg-white rounded-bb-lg border border-bb-ink-10 p-6">
              <div className="flex justify-between items-center mb-5">
                <h4 className="font-serif text-[0.95rem]">Donation history</h4>
                <a href="#" className="text-[0.78rem] text-bb-red no-underline">View all</a>
              </div>
              {HISTORY.map(({ date, desc, status, deferred }) => (
                <div key={date} className="flex items-center gap-3.5 py-2.5 border-b border-bb-ink-10 last:border-0">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${deferred ? 'bg-bb-amber' : 'bg-bb-green'}`} />
                  <div className="flex-1">
                    <div className="text-[0.78rem] text-bb-ink-60">{date}</div>
                    <div className="text-[0.88rem] font-medium">{desc}</div>
                  </div>
                  <span className={`text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full ${deferred ? 'bg-[#FFF4E0] text-bb-amber' : 'bg-[#E6F9F1] text-bb-green'}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-bb-lg border border-bb-ink-10 p-6">
              <div className="flex justify-between items-center mb-5">
                <h4 className="font-serif text-[0.95rem]">Current eligibility</h4>
                <span className="text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full bg-[#E6F9F1] text-bb-green">92% confidence</span>
              </div>
              <div className="flex items-center justify-center w-[100px] h-[100px] rounded-full border-[6px] border-bb-green font-serif text-[1.8rem] text-bb-green mx-auto mb-2">92</div>
              <p className="text-center text-[0.82rem] text-bb-ink-60">Eligibility score</p>
              <ul className="list-none space-y-1.5 mt-3.5">
                {[
                  { text: 'Hemoglobin 14.2 g/dL — within range', good: true },
                  { text: 'Blood pressure 118/76 — optimal',       good: true },
                  { text: '68 days since last donation',           good: true },
                  { text: 'Slightly elevated pulse — borderline',  good: false },
                ].map(({ text, good }) => (
                  <li key={text} className="flex items-center gap-2 text-[0.82rem]">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${good ? 'bg-bb-green' : 'bg-bb-amber'}`} />
                    {text}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link to="/eligibility" className="flex items-center justify-center w-full bg-bb-red text-white no-underline text-[0.88rem] font-medium py-2.5 rounded-bb hover:bg-bb-red-dark transition-colors">
                  Run full assessment
                </Link>
              </div>
            </div>
          </div>

          {/* Tier progress */}
          <div className="bg-white rounded-bb-lg border border-bb-ink-10 p-6">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-serif text-[0.95rem]">Blood credit progress</h4>
              <span className="text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full bg-[#E6EFFF] text-bb-blue">Gold tier</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {TIERS.map(({ label, mark, req, current, achieved }) => (
                <div key={label} className={`text-center p-3 rounded-bb-sm ${current ? 'bg-[#FFF4E0] border-[1.5px] border-bb-amber' : achieved ? 'bg-bb-cream border border-bb-ink-10' : 'bg-bb-ink-10 border border-bb-ink-10'}`}>
                  <div className={`text-[0.7rem] mb-1 ${current ? 'text-bb-amber font-medium' : 'text-bb-ink-60'}`}>{current ? `${label} ← You` : label}</div>
                  <div className={`font-serif text-[1.2rem] ${current ? 'text-bb-amber' : 'text-bb-ink-30'}`}>{mark}</div>
                  <div className={`text-[0.7rem] ${current ? 'text-bb-amber' : 'text-bb-ink-30'}`}>{req}</div>
                </div>
              ))}
            </div>
            <div className="h-2 bg-bb-ink-10 rounded-full overflow-hidden">
              <div className="h-full w-[70%] bg-bb-amber rounded-full" />
            </div>
            <p className="text-[0.78rem] text-bb-ink-60 mt-1.5">2 donations to Platinum — unlock priority blood access for your family</p>
          </div>
        </main>
      </div>
    </div>
  );
}
