// src/pages/HospitalPortal.jsx

const INVENTORY = [
  { bg: 'O+',  units: 84, eds: '8.4d',   state: 'ok'       },
  { bg: 'O-',  units: 11, eds: '2.2d !', state: 'critical' },
  { bg: 'A+',  units: 62, eds: '6.9d',   state: 'ok'       },
  { bg: 'A-',  units: 18, eds: '4.5d',   state: 'ok'       },
  { bg: 'B+',  units: 29, eds: '2.9d',   state: 'warning'  },
  { bg: 'B-',  units: 7,  eds: '3.5d',   state: 'ok'       },
  { bg: 'AB+', units: 31, eds: '7.7d',   state: 'ok'       },
  { bg: 'AB-', units: 5,  eds: '5.0d',   state: 'ok'       },
];

const DONORS = [
  { rank: 1, name: 'Nikhil D.', meta: 'O- · eligible · 9.1 km',      score: '0.89', time: '22 min' },
  { rank: 2, name: 'Priya S.',  meta: 'O- · eligible · 5.8 km',      score: '0.74', time: '14 min' },
  { rank: 3, name: 'Sunita R.', meta: 'O+ → O- compat · 7.4 km',    score: '0.62', time: '19 min' },
];

const INV_CELL = {
  ok:       'border-bb-ink-10 bg-bb-cream',
  critical: 'border-bb-red bg-bb-red-light',
  warning:  'border-bb-amber bg-[#FFF8E6]',
};
const INV_UNIT = {
  ok:       'text-bb-ink',
  critical: 'text-bb-red',
  warning:  'text-bb-amber',
};

export default function HospitalPortal() {
  return (
    <div className="min-h-screen bg-bb-cream">
      {/* Header */}
      <div className="bg-bb-ink text-white px-4 md:px-12 py-4 mt-[60px] flex items-center gap-5">
        <div>
          <h3 className="font-serif text-[1.1rem] text-white">Hospital Command Portal</h3>
          <p className="text-[0.82rem] text-bb-ink-30">Bokaro General Hospital · Blood Bank Unit · Last sync 2 min ago</p>
        </div>
        <button className="ml-auto bg-bb-red text-white border-none cursor-pointer px-6 py-2.5 rounded-bb text-[0.9rem] font-medium flex items-center gap-2 hover:bg-bb-red-dark transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New Emergency Request
        </button>
      </div>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-4 md:px-12 py-6">

        {/* Inventory */}
        <div className="bg-white rounded-bb-lg border border-bb-ink-10 overflow-hidden">
          <div className="px-5 py-4 border-b border-bb-ink-10 flex justify-between items-center">
            <h4 className="font-serif text-[0.92rem]">Live inventory</h4>
            <span className="text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full bg-[#FFF4E0] text-bb-amber">2 critical groups</span>
          </div>
          <div className="p-4 grid grid-cols-4 gap-2">
            {INVENTORY.map(({ bg, units, eds, state }) => (
              <div key={bg} className={`rounded-bb-sm p-2.5 text-center border ${INV_CELL[state]}`}>
                <div className="font-serif text-[1rem] text-bb-red">{bg}</div>
                <div className={`text-[1.2rem] font-medium ${INV_UNIT[state]}`}>{units}</div>
                <div className="text-[0.68rem] text-bb-ink-60">{eds}</div>
              </div>
            ))}
          </div>
          <p className="px-4 pb-4 text-[0.78rem] text-bb-ink-60">EDS = Effective Days of Stock · Critical &lt;3d · Safe &gt;5d</p>
        </div>

        {/* Donors */}
        <div className="bg-white rounded-bb-lg border border-bb-ink-10 overflow-hidden">
          <div className="px-5 py-4 border-b border-bb-ink-10 flex justify-between items-center">
            <h4 className="font-serif text-[0.92rem]">Geo-matched donors</h4>
            <span className="text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full bg-[#E6EFFF] text-bb-blue">O- critical request</span>
          </div>
          <div className="p-4">
            {DONORS.map(({ rank, name, meta, score, time }) => (
              <div key={rank} className="flex items-center gap-3 py-2.5 border-b border-bb-ink-10 last:border-0">
                <div className="w-6 h-6 rounded-full bg-bb-red-light text-bb-red text-[0.72rem] font-medium flex items-center justify-center flex-shrink-0">{rank}</div>
                <div className="flex-1">
                  <div className="text-[0.88rem] font-medium">{name}</div>
                  <div className="text-[0.75rem] text-bb-ink-60">{meta}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[0.82rem] font-medium text-bb-green">{score}</div>
                  <div className="text-[0.75rem] text-bb-ink-60">{time}</div>
                </div>
              </div>
            ))}
            <p className="text-[0.78rem] text-bb-ink-60 pt-2">Coverage probability: <strong className="text-bb-green">94%</strong></p>
            <button className="w-full mt-3 bg-bb-red text-white border-none cursor-pointer py-2.5 rounded-bb text-[0.85rem] font-medium hover:bg-bb-red-dark transition-colors">
              Notify top 3 donors
            </button>
          </div>
        </div>

        {/* Forecast */}
        <div className="bg-white rounded-bb-lg border border-bb-ink-10 overflow-hidden">
          <div className="px-5 py-4 border-b border-bb-ink-10 flex justify-between items-center">
            <h4 className="font-serif text-[0.92rem]">14-day O- forecast</h4>
            <span className="text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full bg-bb-red-light text-bb-red">Shortage day 4</span>
          </div>
          <div className="p-4">
            <svg viewBox="0 0 280 90" className="w-full h-[90px] overflow-visible">
              <line x1="0" y1="70" x2="280" y2="70" stroke="#F0ECEE" strokeWidth="1"/>
              <line x1="0" y1="50" x2="280" y2="50" stroke="#F0ECEE" strokeWidth="1"/>
              <line x1="0" y1="75" x2="280" y2="75" stroke="#C8102E" strokeWidth="1" strokeDasharray="4 3"/>
              <polygon fill="rgba(13,122,85,0.08)" points="0,22 20,20 40,19 60,24 80,32 100,44 120,52 140,58 160,64 180,68 200,72 220,75 220,91 200,88 180,84 160,80 140,74 120,68 100,60 80,48 60,40 40,35 20,36 0,38"/>
              <polyline fill="none" stroke="#0D7A55" strokeWidth="2" points="0,30 20,28 40,27 60,32 80,40 100,52 120,60 140,66 160,72 180,76 200,80 220,83"/>
              <text x="4" y="72" fontSize="7" fill="#C8102E" fontFamily="JetBrains Mono">critical</text>
            </svg>
            <div className="flex gap-3 mt-3 text-[0.78rem] text-bb-ink-60">
              <span>Today: 11u</span><span>Day 7: 5u</span><span>Day 14: 2u</span>
            </div>
            <div className="mt-2.5 p-2.5 bg-bb-red-light rounded-bb-sm text-[0.8rem] text-bb-red-dark">
              Recommended: launch O- donor campaign now. 18 eligible donors identified in 15km radius.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
