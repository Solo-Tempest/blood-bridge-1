const METRICS = [
  { label: 'Donors registered', value: '12,847', trend: '+214 this week',     up: true  },
  { label: 'Donations MTD',     value: '1,203',  trend: '+18% vs last month', up: true  },
  { label: 'Forecast accuracy', value: '94.2%',  trend: '+1.1% from baseline',up: true  },
  { label: 'Avg match time',    value: '2.3s',   trend: '-0.4s vs last week', up: true  },
  { label: 'Active alerts',     value: '3',      trend: '2 critical',         up: false },
];

const ACTIVITY = [
  { icon: '🩸', cls: 'bg-[#E6F9F1]',    text: 'Emergency fulfilled', sub: 'O- · AIIMS Delhi · 8 min ago'            },
  { icon: '📈', cls: 'bg-bb-red-light', text: 'Drift alert raised',  sub: 'AB- inventory · Evidently AI'            },
  { icon: '🎯', cls: 'bg-[#E6EFFF]',    text: 'Campaign dispatched', sub: '47 O- donors notified · 12 confirmed'    },
  { icon: '🩸', cls: 'bg-[#E6F9F1]',    text: 'New donor registered',sub: 'Sunita R. O- · 2 hr ago'                 },
  { icon: '📈', cls: 'bg-bb-red-light', text: 'Drift cleared',       sub: 'O+ pattern normalised · 3 hr ago'        },
  { icon: '🎯', cls: 'bg-[#E6EFFF]',    text: 'Campaign sent',       sub: '47 O- donors · 4 hr ago'                 },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-bb-cream py-[80px] px-4 md:px-12">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <h2 className="font-serif text-[1.8rem]">Analytics Dashboard</h2>
            <p className="text-bb-ink-60 text-[0.88rem]">Blood Bridge · System overview · Live</p>
          </div>
          <div className="flex bg-bb-ink-10 rounded-bb p-1 gap-0 w-full sm:w-auto">
            {['Overview', 'Forecasting', 'Model Health'].map((t, i) => (
              <button key={t} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-bb-sm text-[0.82rem] sm:text-[0.85rem] border-none cursor-pointer font-sans transition-all ${i === 0 ? 'bg-white text-bb-ink font-medium shadow-sm' : 'bg-transparent text-bb-ink-60 hover:text-bb-ink'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
          {METRICS.map(({ label, value, trend, up }) => (
            <div key={label} className="bg-white rounded-bb border border-bb-ink-10 px-4 py-4">
              <div className="text-[0.72rem] text-bb-ink-60 uppercase tracking-[0.04em] mb-2">{label}</div>
              <div className="font-serif text-[1.8rem] leading-none mb-1">{value}</div>
              <div className={`text-[0.75rem] flex items-center gap-1 ${up ? 'text-bb-green' : 'text-bb-red'}`}>
                <span>{up ? '↑' : '↓'}</span>{trend}
              </div>
            </div>
          ))}
        </div>

        {/* Main 2-col */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5 mb-5">

          {/* Forecast chart */}
          <div className="bg-white rounded-bb-lg border border-bb-ink-10 overflow-hidden">
            <div className="px-5 py-4 border-b border-bb-ink-10 flex justify-between items-center">
              <h4 className="font-serif text-[0.92rem]">Blood supply forecast — next 30 days</h4>
              <span className="text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full bg-[#E6EFFF] text-bb-blue">ARIMA + Prophet + LSTM</span>
            </div>
            <div className="p-5">
              <svg viewBox="0 0 500 160" className="w-full h-[160px]">
                <line x1="0" y1="120" x2="500" y2="120" stroke="#F0ECEE" strokeWidth="1"/>
                <line x1="0" y1="80"  x2="500" y2="80"  stroke="#F0ECEE" strokeWidth="1"/>
                <line x1="0" y1="40"  x2="500" y2="40"  stroke="#F0ECEE" strokeWidth="1"/>
                <line x1="0" y1="130" x2="500" y2="130" stroke="#C8102E" strokeWidth="1" strokeDasharray="5 4"/>
                <polygon fill="rgba(13,122,85,0.08)" points="0,60 50,55 100,50 150,58 200,70 250,85 300,95 350,100 400,108 450,112 500,115 500,155 450,150 400,145 350,138 300,132 250,122 200,108 150,96 100,88 50,92 0,98"/>
                <polyline fill="none" stroke="#0D7A55" strokeWidth="2.5" points="0,60 50,55 100,50 150,58 200,70 250,85 300,95 350,100 400,108 450,112 500,115"/>
                <text x="4" y="127" fontSize="8" fill="#C8102E" fontFamily="JetBrains Mono">critical threshold</text>
              </svg>
              <div className="flex gap-5 mt-3 text-[0.78rem] text-bb-ink-60">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-bb-green rounded"/>Forecast</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-bb-green opacity-30 rounded"/>Confidence band</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-bb-red rounded"/>Critical threshold</span>
              </div>
            </div>
          </div>

          {/* SHAP importance */}
          <div className="bg-white rounded-bb-lg border border-bb-ink-10 overflow-hidden">
            <div className="px-5 py-4 border-b border-bb-ink-10">
              <h4 className="font-serif text-[0.92rem]">Eligibility model — SHAP importance</h4>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Hemoglobin',      val: 0.31,  pos: true  },
                { label: 'Days since last', val: 0.24,  pos: true  },
                { label: 'Blood pressure',  val: 0.18,  pos: true  },
                { label: 'Age',             val: 0.12,  pos: true  },
                { label: 'Recent illness',  val: -0.28, pos: false },
                { label: 'Anticoagulants',  val: -0.35, pos: false },
              ].map(({ label, val, pos }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="text-[0.8rem] text-bb-ink-60 min-w-[120px]">{label}</div>
                  <div className="flex-1 h-2 bg-bb-ink-10 rounded overflow-hidden">
                    <div className={`h-full rounded ${pos ? 'bg-bb-green' : 'bg-bb-red float-right'}`} style={{ width: `${Math.abs(val) / 0.35 * 100}%` }} />
                  </div>
                  <div className={`font-mono text-[0.75rem] min-w-[48px] text-right ${pos ? 'text-bb-green' : 'text-bb-red'}`}>
                    {pos ? '+' : ''}{val.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-bb-lg border border-bb-ink-10 overflow-hidden">
          <div className="px-5 py-4 border-b border-bb-ink-10">
            <h4 className="font-serif text-[0.92rem]">Recent system activity</h4>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-0">
            {ACTIVITY.map(({ icon, cls, text, sub }, i) => (
              <div key={i} className="flex gap-3 py-2.5 border-b border-bb-ink-10 last:border-0">
                <div className={`w-8 h-8 rounded-bb-sm flex items-center justify-center text-[0.9rem] flex-shrink-0 ${cls}`}>{icon}</div>
                <div>
                  <div className="text-[0.83rem] font-medium">{text}</div>
                  <div className="text-[0.72rem] text-bb-ink-60 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
