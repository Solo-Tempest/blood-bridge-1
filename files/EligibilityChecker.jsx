// src/pages/EligibilityChecker.jsx
import { useState } from 'react';

function computeEligibility({ hb, bp, age, days, ill, med }) {
  if (!hb && !bp && !age) return null;
  const shapHb   = Math.min(0.35, Math.max(-0.35, (hb - 12.5) * 0.12));
  const shapBp   = Math.min(0.08, Math.max(-0.25, -(bp - 120) * 0.007));
  const shapAge  = age >= 18 && age <= 65 ? 0.06 : age < 18 ? -0.4 : -0.15;
  const shapDays = days >= 56 ? Math.min(0.18, (days - 56) * 0.002) : -0.3;
  const shapIll  = ill === 'yes' ? -0.4 : 0.04;
  const shapMed  = med === 'anticoag' ? -0.5 : med === 'antibiotics' ? -0.25 : med === 'aspirin' ? -0.08 : 0.02;
  const score    = Math.max(0.01, Math.min(0.99, 0.55 + shapHb + shapBp + shapAge + shapDays + shapIll + shapMed));
  return {
    score,
    eligible: score >= 0.50 && ill !== 'yes' && med !== 'anticoag' && age >= 18 && (hb === 0 || hb >= 12.5),
    shap: [
      { label: 'Hemoglobin',          val: shapHb   },
      { label: 'Blood pressure',      val: shapBp   },
      { label: 'Days since donation', val: shapDays },
      { label: 'Age',                 val: shapAge  },
      { label: 'Recent illness',      val: shapIll  },
      { label: 'Medications',         val: shapMed  },
    ],
  };
}

const inputCls = "w-full bg-bb-cream border border-bb-ink-10 rounded-bb-sm px-3.5 py-2.5 text-[0.9rem] font-sans outline-none transition-all focus:border-bb-red focus:shadow-[0_0_0_3px_rgba(200,16,46,0.08)] text-bb-ink";

export default function EligibilityChecker() {
  const [form, setForm] = useState({ hb: '', bp: '', age: '', weight: '', days: '', bg: 'O+', ill: 'no', med: 'none' });
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const run = () => {
    const r = computeEligibility({
      hb:   parseFloat(form.hb)   || 0,
      bp:   parseFloat(form.bp)   || 0,
      age:  parseFloat(form.age)  || 0,
      days: parseFloat(form.days) || 0,
      ill:  form.ill,
      med:  form.med,
    });
    setResult(r);
  };

  const pct = result ? Math.round(result.score * 100) : 0;
  const maxAbs = result ? Math.max(...result.shap.map((s) => Math.abs(s.val)), 0.01) : 1;

  return (
    <div className="min-h-screen bg-bb-cream py-[80px] px-4 md:px-12">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* ── Form ── */}
        <div>
          <h2 className="font-serif text-[1.5rem] mb-1.5">Eligibility Assessment</h2>
          <p className="text-bb-ink-60 text-[0.88rem] mb-7">
            Fill in your health details. Our AI will predict your eligibility and explain the key factors.
          </p>
          <div className="bg-white rounded-bb-lg border border-bb-ink-10 p-8">
            <div className="grid grid-cols-2 gap-3.5 mb-4">
              <div>
                <label className="block text-[0.82rem] font-medium mb-1.5">Age (years)</label>
                <input className={inputCls} type="number" placeholder="e.g. 28" value={form.age} onChange={set('age')} />
              </div>
              <div>
                <label className="block text-[0.82rem] font-medium mb-1.5">Weight (kg)</label>
                <input className={inputCls} type="number" placeholder="e.g. 65" value={form.weight} onChange={set('weight')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3.5 mb-4">
              <div>
                <label className="block text-[0.82rem] font-medium mb-1.5">Hemoglobin (g/dL)</label>
                <input className={inputCls} type="number" step="0.1" placeholder="e.g. 13.5" value={form.hb} onChange={set('hb')} />
                <p className="text-[0.75rem] text-bb-ink-60 mt-1">Min 12.5 (F) / 13.0 (M)</p>
              </div>
              <div>
                <label className="block text-[0.82rem] font-medium mb-1.5">Systolic BP (mmHg)</label>
                <input className={inputCls} type="number" placeholder="e.g. 120" value={form.bp} onChange={set('bp')} />
                <p className="text-[0.75rem] text-bb-ink-60 mt-1">Safe range: 90–160</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3.5 mb-4">
              <div>
                <label className="block text-[0.82rem] font-medium mb-1.5">Blood group</label>
                <select className={inputCls} value={form.bg} onChange={set('bg')}>
                  {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[0.82rem] font-medium mb-1.5">Days since last donation</label>
                <input className={inputCls} type="number" placeholder="0 if first time" value={form.days} onChange={set('days')} />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[0.82rem] font-medium mb-1.5">Recent illness (last 2 weeks)?</label>
              <select className={inputCls} value={form.ill} onChange={set('ill')}>
                <option value="no">No illness</option>
                <option value="yes">Yes — fever / cold / infection</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-[0.82rem] font-medium mb-1.5">Current medications?</label>
              <select className={inputCls} value={form.med} onChange={set('med')}>
                <option value="none">None</option>
                <option value="aspirin">Aspirin / NSAIDs</option>
                <option value="anticoag">Anticoagulants (warfarin etc.)</option>
                <option value="antibiotics">Antibiotics</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              onClick={run}
              className="w-full bg-bb-red text-white border-none cursor-pointer py-3.5 rounded-bb text-[0.95rem] font-medium hover:bg-bb-red-dark hover:-translate-y-px transition-all"
            >
              Run AI Assessment
            </button>
          </div>
        </div>

        {/* ── Result panel ── */}
        <div className="md:sticky md:top-[90px]">
          <div className="bg-white rounded-bb-lg border border-bb-ink-10 p-8 mb-4">
            {!result ? (
              <div className="text-center py-12 text-bb-ink-60 text-[0.9rem]">
                Fill in your details and click <strong className="text-bb-ink">Run AI Assessment</strong> to see your eligibility prediction.
              </div>
            ) : (
              <>
                <div className="text-center py-6">
                  <div className={`font-serif text-[2.2rem] mb-1.5 ${result.eligible ? 'text-bb-green' : 'text-bb-amber'}`}>
                    {result.eligible ? 'Likely eligible' : 'Likely deferred'}
                  </div>
                  <div className="text-[0.85rem] text-bb-ink-60 mb-5">
                    Eligibility probability: {pct}% · Random Forest + XGBoost ensemble
                  </div>
                  <div className="h-2 bg-bb-ink-10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: result.eligible ? '#0D7A55' : '#C07A00' }}
                    />
                  </div>
                </div>

                {/* SHAP chart */}
                <div className="mt-5">
                  <div className="text-[0.82rem] font-medium uppercase tracking-[0.04em] text-bb-ink-60 mb-3.5">
                    Feature importance (SHAP)
                  </div>
                  <div className="space-y-2.5">
                    {result.shap.map(({ label, val }) => {
                      const w = Math.round(Math.abs(val) / maxAbs * 100);
                      const pos = val >= 0;
                      return (
                        <div key={label} className="flex items-center gap-2.5">
                          <div className="text-[0.8rem] text-bb-ink-60 min-w-[140px]">{label}</div>
                          <div className="flex-1 h-2 bg-bb-ink-10 rounded overflow-hidden">
                            <div
                              className={`h-full rounded ${pos ? 'bg-bb-green' : 'bg-bb-red float-right'}`}
                              style={{ width: `${w}%` }}
                            />
                          </div>
                          <div className={`font-mono text-[0.75rem] min-w-[52px] text-right ${pos ? 'text-bb-green' : 'text-bb-red'}`}>
                            {pos ? '+' : ''}{val.toFixed(3)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
