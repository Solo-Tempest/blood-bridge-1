import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── Google Fonts ── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *, *::before, *::after { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.45} }
    @keyframes spin     { to { transform:rotate(360deg); } }
    @keyframes loadBar  { from{width:0} to{width:100%} }
    @keyframes heartBeat{ 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.1)} 70%{transform:scale(1)} }
    @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
    .fade-up  { animation: fadeUp  .38s cubic-bezier(.22,.68,0,1.1) both; }
    .fade-in  { animation: fadeIn  .3s ease both; }
    .spin     { animation: spin    .75s linear infinite; }
    .pulse    { animation: pulse   1.4s ease-in-out infinite; }
    .heart    { animation: heartBeat 1.3s ease-in-out infinite; }
    .loadbar  { animation: loadBar 2.6s linear forwards; }
    .blink    { animation: blink   1s step-end infinite; }
    input[type=date]::-webkit-calendar-picker-indicator { opacity:.4; cursor:pointer; }
    input[type=time]::-webkit-calendar-picker-indicator { opacity:.4; cursor:pointer; }
    ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:#fca5a5; border-radius:4px; }
  `}</style>
);

/* ── constants ── */
const HOSPITAL_TYPES = ["Government", "Private", "NGO / Trust", "Blood Bank Only", "Multi-Specialty", "Clinic"];
const INDIAN_STATES  = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir"];
const STEPS = [
  { id:1, label:"Basic Info",   icon:"🏥" },
  { id:2, label:"Location",     icon:"📍" },
  { id:3, label:"Contact",      icon:"📞" },
  { id:4, label:"Facilities",   icon:"🩸" },
  { id:5, label:"Account",      icon:"🔐" },
  { id:6, label:"Documents",    icon:"📄" },
  { id:7, label:"Verify",       icon:"✅" },
];

/* ── shared UI atoms ── */
const lbl  = "block text-[10.5px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";
const inp  = (err) => `w-full bg-white border ${err?"border-red-300 focus:ring-red-200":"border-rose-100 focus:ring-red-200 hover:border-red-200"} rounded-xl px-4 py-3 pl-11 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md`;
const inpR = (err) => `w-full bg-white border ${err?"border-red-300 focus:ring-red-200":"border-rose-100 focus:ring-red-200 hover:border-red-200"} rounded-xl px-4 py-3 pl-11 pr-28 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md`;
const inpPlain = (err) => `w-full bg-white border ${err?"border-red-300 focus:ring-red-200":"border-rose-100 focus:ring-red-200 hover:border-red-200"} rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md`;

function Li({ children }) {
  return <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-300 pointer-events-none group-focus-within:text-red-500 transition-colors duration-200">{children}</span>;
}
function Err({ msg }) {
  if (!msg) return null;
  return <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium mt-1"><span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />{msg}</p>;
}
function Field({ label, hint, error, children }) {
  return (
    <div>
      {label && <label className={lbl}>{label}</label>}
      <div className="relative group">{children}</div>
      {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      <Err msg={error} />
    </div>
  );
}
function RedBtn({ children, onClick, disabled, type="button", className="" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white
        bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600
        disabled:from-gray-200 disabled:to-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
        shadow-md hover:shadow-lg shadow-red-100 active:scale-[.98] transition-all duration-250 ${className}`}>
      {children}
    </button>
  );
}
function GhostBtn({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex items-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm border-2 border-red-200
        text-red-600 hover:bg-red-50 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
        transition-all duration-250 active:scale-[.98]">
      {children}
    </button>
  );
}
function Spinner() {
  return <svg className="spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity=".25"/><path fill="white" fillOpacity=".75" d="M4 12a8 8 0 018-8v8z"/></svg>;
}

/* ── stepper ── */
function Stepper({ current }) {
  return (
    <div className="flex items-start justify-between mb-6 overflow-x-auto pb-1 gap-0">
      {STEPS.map((s, i) => {
        const done   = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center min-w-[48px]">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500
                ${active ? "bg-red-600 text-white ring-4 ring-red-100 scale-110 shadow-md shadow-red-200"
                  : done  ? "bg-red-100 text-red-600 border-2 border-red-300"
                  : "bg-gray-100 text-gray-400 border-2 border-gray-200"}`}>
                {done ? "✓" : s.icon}
              </div>
              <span className={`mt-1 text-[9px] font-semibold uppercase tracking-wider text-center hidden sm:block leading-tight max-w-[52px]
                ${active ? "text-red-600" : done ? "text-red-400" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 sm:w-10 mx-0.5 mt-[-14px] rounded-full transition-all duration-700
                ${s.id < current ? "bg-red-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ current }) {
  const pct = ((current - 1) / (STEPS.length - 1)) * 100;
  return (
    <div className="w-full h-1.5 bg-red-50 rounded-full mb-5 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ── Step 1: Basic Info ── */
function Step1({ d, set, errors }) {
  return (
    <div className="space-y-5 fade-up">
      <Hd title="Basic Hospital Information" sub="Used to verify hospital authenticity on Blood Bridge" />
      <Field label="Hospital Name" error={errors.name}>
        <Li>🏥</Li>
        <input className={inp(errors.name)} placeholder="e.g. AIIMS New Delhi" value={d.name}
          onChange={e => set({ ...d, name: e.target.value })} />
      </Field>
      <Field label="Registration / License ID" error={errors.regNo} hint="Your hospital's official registration number">
        <Li>🪪</Li>
        <input className={inp(errors.regNo)} placeholder="e.g. MH-HOSP-2024-XXXXX" value={d.regNo}
          onChange={e => set({ ...d, regNo: e.target.value })} />
      </Field>
      <Field label="Hospital Type" error={errors.type}>
        <Li>🏷️</Li>
        <select className={inp(errors.type)} value={d.type} onChange={e => set({ ...d, type: e.target.value })}>
          <option value="">Select type</option>
          {HOSPITAL_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Year of Establishment" error={errors.year}>
          <Li>📅</Li>
          <input type="number" className={inp(errors.year)} placeholder="e.g. 1998" min={1900} max={new Date().getFullYear()}
            value={d.year} onChange={e => set({ ...d, year: e.target.value })} />
        </Field>
        <Field label="Website URL (optional)">
          <Li>🌐</Li>
          <input className={inp(false)} placeholder="https://hospital.org" value={d.website}
            onChange={e => set({ ...d, website: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

/* ── Step 2: Location ── */
function Step2({ d, set, errors }) {
  const [gpsStatus, setGpsStatus] = useState("idle");
  const detectGPS = () => {
    setGpsStatus("loading");
    navigator.geolocation?.getCurrentPosition(
      pos => { set({ ...d, lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) }); setGpsStatus("done"); },
      ()  => setGpsStatus("error")
    );
  };
  return (
    <div className="space-y-5 fade-up">
      <Hd title="Location & Address" sub="Help donors and patients locate your hospital easily" />
      <Field label="Street Address" error={errors.street}>
        <Li>🏠</Li>
        <input className={inp(errors.street)} placeholder="Building no., Street name" value={d.street}
          onChange={e => set({ ...d, street: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Area / Locality" error={errors.area}>
          <Li>🗺️</Li>
          <input className={inp(errors.area)} placeholder="e.g. Ashok Nagar" value={d.area}
            onChange={e => set({ ...d, area: e.target.value })} />
        </Field>
        <Field label="City" error={errors.city}>
          <Li>🏙️</Li>
          <input className={inp(errors.city)} placeholder="e.g. Patna" value={d.city}
            onChange={e => set({ ...d, city: e.target.value })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="State" error={errors.state}>
          <Li>📌</Li>
          <select className={inp(errors.state)} value={d.state} onChange={e => set({ ...d, state: e.target.value })}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Pincode" error={errors.pincode}>
          <Li>🔢</Li>
          <input className={inp(errors.pincode)} placeholder="6-digit pincode" maxLength={6}
            value={d.pincode} onChange={e => set({ ...d, pincode: e.target.value.replace(/\D/g,"") })} />
        </Field>
      </div>
      <Field label="Landmark (optional)">
        <Li>⚑</Li>
        <input className={inp(false)} placeholder="e.g. Near Gandhi Maidan" value={d.landmark}
          onChange={e => set({ ...d, landmark: e.target.value })} />
      </Field>
      {/* GPS + map preview */}
      <div>
        <label className={lbl}>GPS Coordinates (optional)</label>
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1 group">
            <Li>📡</Li>
            <input className={inp(false)} placeholder="Latitude" value={d.lat} readOnly />
          </div>
          <div className="relative flex-1 group">
            <Li>📡</Li>
            <input className={inp(false)} placeholder="Longitude" value={d.lng} readOnly />
          </div>
        </div>
        <button type="button" onClick={detectGPS}
          className={`w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300
            ${gpsStatus==="done"    ? "border-green-400 bg-green-50 text-green-600"
              : gpsStatus==="error" ? "border-red-300 bg-red-50 text-red-500"
              : gpsStatus==="loading" ? "border-amber-300 bg-amber-50 text-amber-600 pulse"
              : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"}`}>
          {gpsStatus==="idle"    && <><span>📡</span> Detect My Location</>}
          {gpsStatus==="loading" && <><span>⏳</span> Detecting…</>}
          {gpsStatus==="done"    && <><span>✅</span> Location Detected — {d.lat}, {d.lng}</>}
          {gpsStatus==="error"   && <><span>❌</span> Permission denied</>}
        </button>
        {/* Map preview placeholder */}
        <div className="mt-3 rounded-2xl overflow-hidden border border-rose-100 h-32 bg-gradient-to-br from-rose-50 to-red-50 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:"repeating-linear-gradient(0deg,#d32f2f 0,#d32f2f 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#d32f2f 0,#d32f2f 1px,transparent 1px,transparent 40px)"}} />
          <div className="text-center z-10">
            <span className="text-3xl">🗺️</span>
            <p className="text-xs text-red-400 font-semibold mt-1">Map Preview</p>
            <p className="text-[10px] text-gray-400">{d.lat && d.lng ? `${d.lat}, ${d.lng}` : "Detect location to preview"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Contact ── */
function Step3({ d, set, errors }) {
  const [otpSent, setOtpSent]   = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const timerRef = useRef(null);
  const startTimer = () => { setOtpTimer(30); clearInterval(timerRef.current); timerRef.current = setInterval(() => setOtpTimer(t => { if (t<=1){clearInterval(timerRef.current);return 0;} return t-1; }), 1000); };

  return (
    <div className="space-y-5 fade-up">
      <Hd title="Contact Information" sub="Primary point of contact for Blood Bridge communications" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Contact Person Name" error={errors.contactName}>
          <Li>👤</Li>
          <input className={inp(errors.contactName)} placeholder="Full name" value={d.contactName}
            onChange={e => set({ ...d, contactName: e.target.value })} />
        </Field>
        <Field label="Role / Designation" error={errors.role}>
          <Li>🪪</Li>
          <input className={inp(errors.role)} placeholder="e.g. Admin, Director" value={d.role}
            onChange={e => set({ ...d, role: e.target.value })} />
        </Field>
      </div>

      {/* Phone + OTP */}
      <Field label="Primary Phone Number" error={errors.phone}>
        <div className="relative group">
          <Li>📱</Li>
          <input className={inpR(errors.phone)} placeholder="10-digit mobile number" maxLength={10}
            value={d.phone} onChange={e => set({ ...d, phone: e.target.value.replace(/\D/g,""), phoneVerified: false })}
            inputMode="numeric" />
          <button type="button" onClick={() => { if(d.phone.length===10){ setOtpSent(true); startTimer(); set({...d, otp:""}); }}}
            disabled={d.phone.length!==10 || d.phoneVerified}
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-200
              ${d.phoneVerified ? "bg-green-100 text-green-600" : "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"}`}>
            {d.phoneVerified ? "✓ Verified" : "Send OTP"}
          </button>
        </div>
      </Field>

      {otpSent && !d.phoneVerified && (
        <div className="fade-up space-y-2">
          <p className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 font-medium">
            ✅ OTP sent! Use <code className="bg-green-100 px-1 rounded font-mono">123456</code> (demo)
          </p>
          <OtpBoxes value={d.otp||""} onChange={v => {
            set({ ...d, otp: v, phoneVerified: v==="123456" });
          }} error={d.otp?.length===6 && d.otp!=="123456" ? "Invalid OTP" : ""} />
          <div className="flex justify-between items-center">
            {d.otp==="123456" && <span className="text-xs text-green-600 font-semibold">✅ Phone verified!</span>}
            <button type="button" disabled={otpTimer>0} onClick={() => { startTimer(); set({...d,otp:""}); }}
              className="text-xs font-semibold text-red-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors ml-auto">
              {otpTimer>0 ? `Resend in ${otpTimer}s` : "Resend OTP →"}
            </button>
          </div>
        </div>
      )}

      <Field label="Alternate Phone (optional)">
        <Li>📞</Li>
        <input className={inp(false)} placeholder="10-digit number" maxLength={10}
          value={d.altPhone} onChange={e => set({ ...d, altPhone: e.target.value.replace(/\D/g,"") })} inputMode="numeric" />
      </Field>

      {/* Email */}
      <Field label="Email Address" error={errors.email}>
        <div className="relative group">
          <Li>✉️</Li>
          <input className={inpR(errors.email)} type="email" placeholder="hospital@example.com"
            value={d.email} onChange={e => set({ ...d, email: e.target.value, emailVerified: false })} />
          <button type="button"
            onClick={() => { if(/\S+@\S+\.\S+/.test(d.email)){ setEmailSent(true); setTimeout(()=>set(prev=>({...prev,emailVerified:true})),1500); }}}
            disabled={!/\S+@\S+\.\S+/.test(d.email) || d.emailVerified}
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-200
              ${d.emailVerified ? "bg-green-100 text-green-600" : "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"}`}>
            {d.emailVerified ? "✓ Verified" : emailSent ? "Verifying…" : "Verify"}
          </button>
        </div>
      </Field>
      {emailSent && !d.emailVerified && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 fade-up">
          📨 Verification link sent to your email. Auto-verifying for demo…
        </p>
      )}
      {d.emailVerified && (
        <p className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 fade-up">
          ✅ Email verified successfully!
        </p>
      )}
    </div>
  );
}

/* ── OTP boxes ── */
function OtpBoxes({ value, onChange, error }) {
  const ref = useRef(null);
  const digits = value.padEnd(6," ").split("");
  return (
    <div className="space-y-1">
      <div className="flex gap-2 justify-center cursor-text" onClick={() => ref.current?.focus()}>
        {digits.map((d,i) => (
          <div key={i} className={`w-10 h-11 rounded-xl border-2 flex items-center justify-center text-base font-bold transition-all duration-200
            ${i<value.length ? "border-red-400 bg-red-50 text-red-700" : "border-rose-100 bg-white"}
            ${i===value.length ? "border-red-400 ring-2 ring-red-200 scale-105" : ""}`}>
            {d.trim() ? d : i===value.length ? <span className="w-0.5 h-4 bg-red-400 blink inline-block"/> : ""}
          </div>
        ))}
        <input ref={ref} value={value} onChange={e=>/^\d{0,6}$/.test(e.target.value)&&onChange(e.target.value)}
          maxLength={6} className="absolute opacity-0 w-0 h-0" />
      </div>
      <Err msg={error} />
    </div>
  );
}

/* ── Step 4: Facilities ── */
function Step4({ d, set, errors }) {
  return (
    <div className="space-y-6 fade-up">
      <Hd title="Facilities & Operations" sub="Tell us about your hospital's blood-related capabilities" />

      {/* Blood bank toggle */}
      <div>
        <label className={lbl}>Does your hospital have a blood bank?</label>
        <div className="flex gap-3">
          {["Yes","No"].map(opt => (
            <button key={opt} type="button"
              onClick={() => set({ ...d, hasBloodBank: opt==="Yes" })}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200
                ${(d.hasBloodBank?"Yes":"No")===opt
                  ? "border-red-500 bg-red-50 text-red-600 shadow-md shadow-red-100"
                  : "border-gray-200 bg-white text-gray-500 hover:border-red-200"}`}>
              {opt==="Yes" ? "✅ Yes" : "❌ No"}
            </button>
          ))}
        </div>
        {d.hasBloodBank && (
          <div className="mt-3 fade-up">
            <Field label="Blood Bank License No." error={errors.bbLicense}>
              <Li>🩸</Li>
              <input className={inp(errors.bbLicense)} placeholder="e.g. BB-MH-2024-XXXX"
                value={d.bbLicense||""} onChange={e => set({ ...d, bbLicense: e.target.value })} />
            </Field>
          </div>
        )}
      </div>

      {/* Operating hours */}
      <div>
        <label className={lbl}>Operating Hours</label>
        <div className="flex items-center gap-3 mb-3 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 cursor-pointer"
          onClick={() => set({ ...d, is24x7: !d.is24x7 })}>
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
            ${d.is24x7 ? "bg-red-600 border-red-600" : "border-gray-300"}`}>
            {d.is24x7 && <span className="text-white text-[10px] font-black">✓</span>}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">24 × 7 Operations</p>
            <p className="text-[11px] text-gray-500">Hospital / blood bank is available round the clock</p>
          </div>
        </div>
        {!d.is24x7 && (
          <div className="grid grid-cols-2 gap-4 fade-up">
            <Field label="Opening Time" error={errors.openTime}>
              <Li>🕐</Li>
              <input type="time" className={inp(errors.openTime)} value={d.openTime||""}
                onChange={e => set({ ...d, openTime: e.target.value })} />
            </Field>
            <Field label="Closing Time" error={errors.closeTime}>
              <Li>🕐</Li>
              <input type="time" className={inp(errors.closeTime)} value={d.closeTime||""}
                onChange={e => set({ ...d, closeTime: e.target.value })} />
            </Field>
          </div>
        )}
      </div>

      {/* Beds */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Total Beds (approx.)">
          <Li>🛏️</Li>
          <input type="number" className={inp(false)} placeholder="e.g. 200" min={1}
            value={d.beds||""} onChange={e => set({ ...d, beds: e.target.value })} />
        </Field>
        <Field label="ICU / Emergency Beds">
          <Li>🚑</Li>
          <input type="number" className={inp(false)} placeholder="e.g. 20" min={0}
            value={d.icuBeds||""} onChange={e => set({ ...d, icuBeds: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

/* ── Step 5: Account Setup ── */
function Step5({ d, set, errors }) {
  const [showPw, setShowPw]   = useState(false);
  const [showCp, setShowCp]   = useState(false);

  const strength = (() => {
    const p = d.password||"";
    let s = 0;
    if(p.length>=8) s++;
    if(/[A-Z]/.test(p)) s++;
    if(/[0-9]/.test(p)) s++;
    if(/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["","Weak","Fair","Good","Strong"][strength];
  const strengthColor = ["bg-gray-200","bg-red-400","bg-amber-400","bg-yellow-400","bg-green-500"][strength];

  return (
    <div className="space-y-5 fade-up">
      <Hd title="Account Setup" sub="Create secure login credentials for your hospital account" />

      <Field label="Password" error={errors.password}>
        <Li>🔐</Li>
        <input type={showPw?"text":"password"} className={`${inp(errors.password)} pr-11`}
          placeholder="Min. 8 characters" value={d.password||""}
          onChange={e => set({ ...d, password: e.target.value })} />
        <button type="button" onClick={()=>setShowPw(v=>!v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors">
          {showPw ? "🙈" : "👁️"}
        </button>
      </Field>

      {/* strength bar */}
      {(d.password||"").length > 0 && (
        <div className="fade-up space-y-1.5">
          <div className="flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-400 ${i<=strength ? strengthColor : "bg-gray-100"}`} />
            ))}
          </div>
          <p className={`text-[11px] font-semibold ${["","text-red-500","text-amber-500","text-yellow-600","text-green-600"][strength]}`}>
            {strengthLabel} password
          </p>
          <ul className="text-[11px] text-gray-400 space-y-0.5 pl-3">
            {[
              [/[A-Z]/.test(d.password||""), "Uppercase letter"],
              [(d.password||"").length>=8,    "At least 8 characters"],
              [/[0-9]/.test(d.password||""),  "Number"],
              [/[^A-Za-z0-9]/.test(d.password||""), "Special character"],
            ].map(([ok,t]) => (
              <li key={t} className={`flex items-center gap-1.5 ${ok?"text-green-600":""}`}>
                <span>{ok?"✓":"·"}</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Field label="Confirm Password" error={errors.confirmPassword}>
        <Li>🔑</Li>
        <input type={showCp?"text":"password"} className={`${inp(errors.confirmPassword)} pr-11`}
          placeholder="Re-enter password" value={d.confirmPassword||""}
          onChange={e => set({ ...d, confirmPassword: e.target.value })} />
        <button type="button" onClick={()=>setShowCp(v=>!v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors">
          {showCp ? "🙈" : "👁️"}
        </button>
      </Field>
      {(d.confirmPassword||"").length>0 && d.password===d.confirmPassword && (
        <p className="text-xs text-green-600 font-semibold fade-up">✅ Passwords match!</p>
      )}
    </div>
  );
}

/* ── Step 6: Documents ── */
function Step6({ d, set, errors, hasBloodBank }) {
  const docs = [
    { key:"license",  label:"Hospital License Certificate",  icon:"📋", required:true },
    { key:"govApproval", label:"Government Approval Document", icon:"🏛️", required:true },
    ...(hasBloodBank ? [{ key:"bbCert", label:"Blood Bank Certification", icon:"🩸", required:true }] : []),
  ];
  return (
    <div className="space-y-5 fade-up">
      <Hd title="Document Upload" sub="Upload official documents for verification. PDF or image files accepted." />
      {docs.map(doc => (
        <DocUpload key={doc.key} label={doc.label} icon={doc.icon} required={doc.required}
          file={d[doc.key]||null} error={errors[doc.key]}
          onChange={f => set({ ...d, [doc.key]: f })} />
      ))}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
        <p className="font-semibold mb-0.5">📌 Document Guidelines</p>
        <p>Accepted formats: PDF, JPG, PNG · Max size: 5MB per file · Files must be clearly legible</p>
      </div>
    </div>
  );
}

function DocUpload({ label, icon, required, file, error, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 5*1024*1024) { alert("File too large (max 5MB)"); return; }
    onChange(f);
  };

  return (
    <div>
      <label className={lbl}>{icon} {label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {file ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 fade-in">
          <span className="text-2xl">{file.type?.includes("pdf") ? "📄" : "🖼️"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">{file.name}</p>
            <p className="text-[11px] text-gray-400">{(file.size/1024).toFixed(1)} KB</p>
          </div>
          <button type="button" onClick={() => onChange(null)}
            className="text-xs text-red-500 font-bold hover:text-red-700 flex-shrink-0">Remove</button>
        </div>
      ) : (
        <div
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200
            ${dragOver ? "border-red-400 bg-red-50" : error ? "border-red-300 bg-red-50" : "border-rose-200 bg-rose-50/40 hover:border-red-300 hover:bg-red-50"}`}>
          <span className="text-3xl">{dragOver ? "📂" : "⬆️"}</span>
          <p className="text-sm font-semibold text-gray-600">Drop file here or <span className="text-red-600">browse</span></p>
          <p className="text-[11px] text-gray-400">PDF, JPG, PNG · Max 5MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}
      <Err msg={error} />
    </div>
  );
}

/* ── Step 7: Verification / Review ── */
function Step7({ allData }) {
  const { basic, location, contact, facilities } = allData;
  const rows = [
    ["Hospital",    basic.name,       "🏥"],
    ["Type",        basic.type,       "🏷️"],
    ["Reg. No.",    basic.regNo,      "🪪"],
    ["City",        `${location.city}, ${location.state}`, "📍"],
    ["Pincode",     location.pincode, "🔢"],
    ["Contact",     contact.contactName, "👤"],
    ["Phone",       contact.phone + (contact.phoneVerified?" ✅":""), "📱"],
    ["Email",       contact.email  + (contact.emailVerified?" ✅":""), "✉️"],
    ["Blood Bank",  facilities.hasBloodBank?"Yes":"No", "🩸"],
    ["Hours",       facilities.is24x7 ? "24×7" : `${facilities.openTime||"—"} – ${facilities.closeTime||"—"}`, "🕐"],
  ];
  return (
    <div className="space-y-5 fade-up">
      <Hd title="Final Verification" sub="Review your registration details before submitting" />
      <div className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-sm">
        {rows.map(([k,v,ic], i) => (
          <div key={k} className={`flex items-center gap-3 px-4 py-3 text-sm ${i%2===0?"bg-rose-50/40":""}`}>
            <span className="text-base w-6 text-center flex-shrink-0">{ic}</span>
            <span className="text-gray-500 font-medium w-28 flex-shrink-0">{k}</span>
            <span className="text-gray-800 font-semibold truncate">{v||"—"}</span>
          </div>
        ))}
      </div>
      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3.5 flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">📋</span>
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-gray-700 mb-1">By submitting, you confirm:</p>
          <ul className="space-y-0.5 list-disc pl-3 text-gray-500">
            <li>All details above are accurate and up to date</li>
            <li>Uploaded documents are authentic and valid</li>
            <li>You agree to Blood Bridge's <span className="text-red-600 font-semibold">Terms of Service</span> &amp; <span className="text-red-600 font-semibold">Privacy Policy</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── shared heading ── */
function Hd({ title, sub }) {
  return (
    <div className="mb-1">
      <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily:"'Playfair Display', serif" }}>{title}</h2>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── validation ── */
function validate(step, fd) {
  const e = {};
  const { basic, location, contact, facilities, account, docs } = fd;
  if(step===1){
    if(!basic.name?.trim())  e.name="Hospital name is required";
    if(!basic.regNo?.trim()) e.regNo="Registration number is required";
    if(!basic.type)          e.type="Please select hospital type";
    if(!basic.year)          e.year="Year of establishment is required";
    else if(basic.year<1900||basic.year>new Date().getFullYear()) e.year="Enter a valid year";
  }
  if(step===2){
    if(!location.street?.trim()) e.street="Street address is required";
    if(!location.area?.trim())   e.area="Area / locality is required";
    if(!location.city?.trim())   e.city="City is required";
    if(!location.state)          e.state="State is required";
    if(!location.pincode||location.pincode.length!==6) e.pincode="Enter a valid 6-digit pincode";
  }
  if(step===3){
    if(!contact.contactName?.trim()) e.contactName="Contact person name is required";
    if(!contact.role?.trim())        e.role="Role / designation is required";
    if(!contact.phone||contact.phone.length!==10) e.phone="Enter a valid 10-digit phone number";
    else if(!contact.phoneVerified)  e.phone="Please verify your phone number";
    if(!contact.email?.trim())       e.email="Email address is required";
    else if(!/\S+@\S+\.\S+/.test(contact.email)) e.email="Enter a valid email address";
    else if(!contact.emailVerified)  e.email="Please verify your email address";
  }
  if(step===4){
    if(!facilities.is24x7){
      if(!facilities.openTime)  e.openTime="Opening time required";
      if(!facilities.closeTime) e.closeTime="Closing time required";
    }
    if(facilities.hasBloodBank && !facilities.bbLicense?.trim()) e.bbLicense="Blood bank license is required";
  }
  if(step===5){
    const pw = account.password||"";
    if(!pw)              e.password="Password is required";
    else if(pw.length<8) e.password="Password must be at least 8 characters";
    else if(!/[A-Z]/.test(pw))         e.password="Include at least one uppercase letter";
    else if(!/[0-9]/.test(pw))         e.password="Include at least one number";
    if(!account.confirmPassword)       e.confirmPassword="Please confirm your password";
    else if(account.password!==account.confirmPassword) e.confirmPassword="Passwords do not match";
  }
  if(step===6){
    if(!docs.license)    e.license="Hospital license certificate is required";
    if(!docs.govApproval) e.govApproval="Government approval document is required";
    if(facilities.hasBloodBank && !docs.bbCert) e.bbCert="Blood bank certification is required";
  }
  return e;
}

/* ── main app ── */
export default function HospitalRegistration() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [basic,      setBasic]      = useState({ name:"", regNo:"", type:"", year:"", website:"" });
  const [location,   setLocation]   = useState({ street:"", area:"", city:"", state:"", pincode:"", landmark:"", lat:"", lng:"" });
  const [contact,    setContact]    = useState({ contactName:"", role:"", phone:"", phoneVerified:false, otp:"", altPhone:"", email:"", emailVerified:false });
  const [facilities, setFacilities] = useState({ hasBloodBank:false, bbLicense:"", is24x7:false, openTime:"", closeTime:"", beds:"", icuBeds:"" });
  const [account,    setAccount]    = useState({ password:"", confirmPassword:"" });
  const [docs,       setDocs]       = useState({ license:null, govApproval:null, bbCert:null });

  const fd = { basic, location, contact, facilities, account, docs };

  const next = () => {
    if(step===7){ submit(); return; }
    const e = validate(step, fd);
    setErrors(e);
    if(!Object.keys(e).length) setStep(s => s+1);
  };
  const back = () => { setErrors({}); setStep(s => s-1); };

  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 2200);
  };

  /* success */
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate("/hospital"), 2600);
    return () => clearTimeout(t);
  }, [success]);

  if(success) return (
    <>
      <GlobalStyles />
      <div className="min-h-screen flex items-center justify-center px-4 pt-[80px]" style={BG}>
        <div className="text-center space-y-5 fade-up max-w-sm w-full">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-200 text-5xl heart">🏥</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily:"'Playfair Display', serif" }}>Registration Submitted!</h2>
            <p className="text-sm text-gray-500 mt-2">Your hospital has been registered on Blood Bridge.<br/>Our team will verify your documents within 24–48 hours.</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-red-100 px-6 py-5 shadow-lg shadow-red-50 space-y-3 text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-red-400">What happens next?</p>
            {["Document verification (1–2 days)","Account activation email","Access to hospital dashboard"].map((t,i)=>(
              <div key={t} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</div>
                <p className="text-sm text-gray-600">{t}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/70 rounded-xl border border-red-100 px-4 py-3">
            <p className="text-xs text-red-400 font-semibold uppercase tracking-widest mb-1.5">Redirecting to dashboard…</p>
            <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full loadbar" />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen flex items-center justify-center px-4 pt-[80px] pb-10" style={BG}>
        {/* bg blobs */}
        <div className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{background:"radial-gradient(circle, #ff808020, transparent)",transform:"translate(-40%,-40%)"}} />
        <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{background:"radial-gradient(circle, #ffb3b315, transparent)",transform:"translate(40%,40%)"}} />

        <div className="w-full max-w-2xl">
          {/* brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-red-200">🩸</div>
              <span className="text-2xl font-extrabold text-red-600" style={{ fontFamily:"'Playfair Display', serif" }}>Blood Bridge</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Hospital Registration Portal</p>
          </div>

          {/* card */}
          <div className="bg-white/75 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-100/50 border border-white/80 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-rose-50 opacity-60 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-rose-100 to-transparent opacity-50 pointer-events-none" />

            <div className="relative">
              <Stepper current={step} />
              <ProgressBar current={step} />

              <div className="min-h-[340px]">
                {step===1 && <Step1 d={basic}      set={setBasic}      errors={errors} />}
                {step===2 && <Step2 d={location}   set={setLocation}   errors={errors} />}
                {step===3 && <Step3 d={contact}    set={setContact}    errors={errors} />}
                {step===4 && <Step4 d={facilities} set={setFacilities} errors={errors} />}
                {step===5 && <Step5 d={account}    set={setAccount}    errors={errors} />}
                {step===6 && <Step6 d={docs}       set={setDocs}       errors={errors} hasBloodBank={facilities.hasBloodBank} />}
                {step===7 && <Step7 allData={fd} />}
              </div>

              {/* nav */}
              <div className="flex gap-3 mt-7 pt-5 border-t border-rose-50">
                {step>1 && <GhostBtn onClick={back}>← Back</GhostBtn>}
                <div className="flex-1" />
                {step<7
                  ? <RedBtn onClick={next}>Next →</RedBtn>
                  : <RedBtn onClick={next} disabled={loading} className="min-w-[180px]">
                      {loading ? <><Spinner /> Submitting…</> : "🎉 Submit Registration"}
                    </RedBtn>
                }
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Already registered? <a href="#" className="text-red-500 font-semibold hover:underline">Login here →</a>
            &nbsp;·&nbsp;
            <a href="#" className="hover:text-red-400 transition-colors">Terms</a>
            &nbsp;·&nbsp;
            <a href="#" className="hover:text-red-400 transition-colors">Privacy</a>
          </p>
        </div>
      </div>
    </>
  );
}

const BG = { background:"linear-gradient(145deg,#fff8f8 0%,#fef5f0 45%,#fff0f0 100%)" };
