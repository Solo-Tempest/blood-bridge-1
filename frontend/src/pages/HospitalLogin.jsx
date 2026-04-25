import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { hospitalLogin, sendHospitalOtp, verifyHospitalOtp } from "../api/auth";

/* ─── Global Styles ───────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *, *::before, *::after { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }

    @keyframes slideUp   { from { opacity:0; transform:translateY(32px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
    @keyframes spin      { to { transform:rotate(360deg); } }
    @keyframes loadBar   { from { width:0%; } to { width:100%; } }
    @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes heartBeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.1)} 70%{transform:scale(1)} }
    @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    .slide-up  { animation: slideUp  .55s cubic-bezier(.22,.68,0,1.1) both; }
    .fade-in   { animation: fadeIn   .35s ease both; }
    .spin      { animation: spin     .75s linear infinite; }
    .pulse     { animation: pulse    1.5s ease-in-out infinite; }
    .heart     { animation: heartBeat 1.3s ease-in-out infinite; }
    .loadbar   { animation: loadBar  2.8s linear forwards; }
    .blink     { animation: blink    1s step-end infinite; }

    .shimmer-btn {
      background: linear-gradient(90deg, #b91c1c, #e11d48, #b91c1c);
      background-size: 200% 100%;
      animation: shimmer 2.5s linear infinite;
    }
    input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px white inset !important; }
    input[type="password"]::-ms-reveal,
    input[type="password"]::-ms-clear,
    input[type="password"]::-webkit-credentials-auto-fill-button,
    input[type="password"]::-webkit-strong-password-auto-fill-button { display: none !important; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-thumb { background:#fca5a5; border-radius:4px; }
  `}</style>
);

/* ─── SVG Icons ───────────────────────────────────────────────────────── */
const IcoMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/>
  </svg>
);
const IcoPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
    <path d="M22 16.92v3a2 2 0 01-2.18 2A19.8 19.8 0 013.07 9.81 19.8 19.8 0 012 2.18 2 2 0 014 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92v2z"/>
  </svg>
);
const IcoLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IcoEye = ({ off }) => off ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
    <path d="M17.94 17.94A10 10 0 0112 20C5 20 1 12 1 12a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcoArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
  </svg>
);
const IcoShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
/* ─── Helpers ─────────────────────────────────────────────────────────── */
const isEmail = v => /\S+@\S+\.\S+/.test(v);
const isPhone = v => /^\d{10}$/.test(v.trim());
const isOtpNum = v => /^\d{0,6}$/.test(v);


/* ─── Field wrapper ───────────────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10.5px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
      <div className="relative group">{children}</div>
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err) =>
  `w-full bg-white/90 backdrop-blur-sm border rounded-xl px-4 py-3.5 pl-11 text-sm text-gray-700
   placeholder-gray-300 focus:outline-none transition-all duration-200 shadow-sm
   ${err
     ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400"
     : "border-slate-200 focus:ring-2 focus:ring-red-200 focus:border-red-300 hover:border-red-200 hover:shadow-md"}`;

const LeadIcon = ({ children }) => (
  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-red-500 transition-colors duration-200">
    {children}
  </span>
);

/* ─── OTP input boxes ─────────────────────────────────────────────────── */
function OtpBoxes({ value, onChange, error }) {
  const ref = useRef(null);
  const digits = value.padEnd(6, " ").split("");
  return (
    <div className="space-y-2">
      <label className="block text-[10.5px] font-bold uppercase tracking-widest text-gray-500">Enter OTP</label>
      <div className="flex gap-2 justify-center cursor-text" onClick={() => ref.current?.focus()}>
        {digits.map((d, i) => (
          <div key={i}
            className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-base font-bold transition-all duration-200
              ${i < value.length ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200 bg-white"}
              ${i === value.length ? "border-red-500 ring-2 ring-red-200 scale-105" : ""}`}>
            {d.trim() ? d : i === value.length ? <span className="w-0.5 h-5 bg-red-400 blink inline-block" /> : ""}
          </div>
        ))}
        <input ref={ref} value={value}
          onChange={e => isOtpNum(e.target.value) && onChange(e.target.value)}
          maxLength={6} className="absolute opacity-0 w-0 h-0" />
      </div>
      {error && <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium justify-center"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{error}</p>}
    </div>
  );
}

/* ─── Spinner ─────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg className="spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity=".25"/>
      <path fill="white" fillOpacity=".8" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}

/* ─── Divider ─────────────────────────────────────────────────────────── */
function Divider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200" />
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200" />
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */
export default function HospitalLogin() {
  const navigate = useNavigate();
  const [mode,       setMode]       = useState("password");
  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [remember,   setRemember]   = useState(false);
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState("");
  const [success,    setSuccess]    = useState(false);
  const [cardIn,     setCardIn]     = useState(false);

  // OTP mode
  const [phone,        setPhone]        = useState("");
  const [otpSent,      setOtpSent]      = useState(false);
  const [otp,          setOtp]          = useState("");
  const [receivedOtp,  setReceivedOtp]  = useState("");
  const [resend,       setResend]       = useState(0);
  const [otpError,     setOtpError]     = useState("");

  useEffect(() => { requestAnimationFrame(() => setCardIn(true)); }, []);

  // Resend countdown
  useEffect(() => {
    if (!resend) return;
    const t = setTimeout(() => setResend(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  async function startResend() {
    setOtp(""); setOtpError(""); setResend(30);
    try {
      const data = await sendHospitalOtp(phone);
      setReceivedOtp(data.otp);
    } catch (err) {
      setOtpError(err.message);
    }
  }

  /* identifier icon */
  const idIcon = isPhone(identifier) ? <IcoPhone /> : <IcoMail />;

  /* validation */
  function validate() {
    const e = {};
    if (!identifier.trim()) {
      e.identifier = "Email or phone number is required";
    } else if (!isEmail(identifier) && !isPhone(identifier)) {
      e.identifier = "Enter a valid email address or 10-digit phone number";
    }
    if (mode === "password") {
      if (!password) e.password = "Password is required";
      else if (password.length < 6) e.password = "Password must be at least 6 characters";
    }
    setErrors(e);
    return !Object.keys(e).length;
  }

  function validateOtpPhone() {
    if (!phone) { setErrors({ phone: "Phone number is required" }); return false; }
    if (!isPhone(phone)) { setErrors({ phone: "Enter a valid 10-digit phone number" }); return false; }
    setErrors({});
    return true;
  }

  /* handlers */
  async function handleSendOtp() {
    if (!validateOtpPhone()) return;
    setLoading(true);
    setApiError("");
    try {
      const data = await sendHospitalOtp(phone);
      setReceivedOtp(data.otp);
      setOtpSent(true);
      setResend(30);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (mode === "otp" && otpSent) {
      if (otp.length !== 6) { setOtpError("Enter the 6-digit OTP"); return; }
      setLoading(true);
      setApiError("");
      try {
        const data = await verifyHospitalOtp(phone, otp);
        localStorage.setItem("bb_token", data.token);
        localStorage.setItem("bb_user", JSON.stringify({ userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }));
        setSuccess(true);
      } catch (err) {
        setOtpError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const data = await hospitalLogin(identifier, password);
      localStorage.setItem("bb_token", data.token);
      localStorage.setItem("bb_user", JSON.stringify({ userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }));
      setSuccess(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canSubmitPassword = (isEmail(identifier) || isPhone(identifier)) && password.length >= 6;
  const canSubmitOtp      = otpSent ? otp.length === 6 : isPhone(phone);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate("/hospital-dashboard"), 2500);
    return () => clearTimeout(t);
  }, [success]);

  /* ── Success Screen ─────────────────────────────────────────────── */
  if (success) return (
    <>
      <GlobalStyles />
      <div className="min-h-screen flex items-center justify-center px-4 pt-[80px] pb-12" style={BG}>
        <div className="text-center space-y-5 fade-in max-w-sm w-full">
          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-200 text-5xl heart">🏥</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Welcome back!
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              Logged in as <span className="font-semibold text-red-600">Hospital Admin</span>
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl px-6 py-5 shadow-lg text-left space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Redirecting to Dashboard…</p>
            {["Loading hospital profile","Syncing blood inventory","Fetching active requests"].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 border border-green-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-[10px] font-black">✓</span>
                </div>
                {t}
              </div>
            ))}
            <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full loadbar" />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  /* ── Login Card ─────────────────────────────────────────────────── */
  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen flex items-center justify-center px-4 pt-[80px] pb-12" style={BG}>

        <div className="w-full max-w-md transition-all duration-700"
          style={{ opacity: cardIn ? 1 : 0, transform: cardIn ? "none" : "translateY(28px) scale(.97)" }}>

          {/* Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-red-200">🩸</div>
              <span className="text-2xl font-extrabold text-red-600" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Blood Bridge
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-100/60 border border-white/70 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-red-50 to-rose-100 opacity-80 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-rose-50 opacity-60 pointer-events-none" />

            <div className="relative">
              {/* Heading */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Hospital Login
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Admin</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Access your hospital dashboard and manage donation requests
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-1 gap-1 mb-6">
                {[{ key: "password", label: "Password Login" }, { key: "otp", label: "OTP Login" }].map(opt => (
                  <button key={opt.key} type="button"
                    onClick={() => { setMode(opt.key); setErrors({}); setOtpSent(false); setOtp(""); setPhone(""); setOtpError(""); }}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-250
                      ${mode === opt.key
                        ? "bg-white text-red-600 shadow-md shadow-red-50 border border-red-100"
                        : "text-gray-400 hover:text-gray-600"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {/* ── Password mode ── */}
                {mode === "password" && (
                  <>
                    <Field label="Email or Phone" error={errors.identifier}>
                      <LeadIcon>{idIcon}</LeadIcon>
                      <input className={inputCls(errors.identifier)}
                        placeholder="admin@hospital.com or 9XXXXXXXXX"
                        value={identifier}
                        onChange={e => { setIdentifier(e.target.value); setErrors(err => ({ ...err, identifier: "" })); }}
                        autoComplete="username" />
                    </Field>

                    <Field label="Password" error={errors.password}>
                      <LeadIcon><IcoLock /></LeadIcon>
                      <input type={showPw ? "text" : "password"}
                        className={`${inputCls(errors.password)} pr-12`}
                        placeholder="Your secure password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(err => ({ ...err, password: "" })); }}
                        autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors p-1">
                        <IcoEye off={showPw} />
                      </button>
                    </Field>

                    {/* Remember + Forgot */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none group"
                        onClick={() => setRemember(v => !v)}>
                        <div className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                          ${remember ? "bg-red-600 border-red-600" : "border-slate-300 group-hover:border-red-300"}`}>
                          {remember && <span className="text-white text-[10px] font-black leading-none">✓</span>}
                        </div>
                        <span className="text-xs text-gray-500">Remember this device</span>
                      </label>
                      <a href="#" className="text-xs text-red-500 font-semibold hover:text-red-700 hover:underline transition-colors">
                        Forgot password?
                      </a>
                    </div>

                    {apiError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                        ⚠ {apiError}
                      </p>
                    )}

                    <button type="button" onClick={handleSubmit} disabled={!canSubmitPassword || loading}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-1
                        transition-all duration-300 shadow-md active:scale-[.98]
                        ${canSubmitPassword && !loading
                          ? "shimmer-btn hover:shadow-xl hover:shadow-red-200"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}`}>
                      {loading ? <><Spinner /> Authenticating…</> : <><span>Login to Dashboard</span><IcoArrow /></>}
                    </button>
                  </>
                )}

                {/* ── OTP mode ── */}
                {mode === "otp" && !otpSent && (
                  <>
                    <Field label="Registered Phone Number" error={errors.phone}>
                      <LeadIcon><IcoPhone /></LeadIcon>
                      <input className={inputCls(errors.phone)}
                        placeholder="10-digit registered mobile"
                        value={phone} maxLength={10} inputMode="numeric"
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setErrors({}); }} />
                    </Field>
                    <p className="text-[11px] text-gray-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5">📲</span>
                      A 6-digit OTP will be sent via SMS to your hospital's registered phone number.
                    </p>
                    <button type="button" onClick={handleSendOtp} disabled={!isPhone(phone) || loading}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                        transition-all duration-300 shadow-md active:scale-[.98]
                        ${isPhone(phone) && !loading
                          ? "shimmer-btn hover:shadow-xl hover:shadow-red-200"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}`}>
                      {loading ? <><Spinner /> Sending OTP…</> : <><span>Send OTP</span><IcoArrow /></>}
                    </button>
                  </>
                )}

                {mode === "otp" && otpSent && (
                  <>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <span className="text-slate-400"><IcoPhone /></span>
                      <span className="text-sm font-semibold text-gray-700 flex-1">{phone}</span>
                      <button type="button" onClick={() => { setOtpSent(false); setOtp(""); setOtpError(""); }}
                        className="text-xs text-red-500 font-bold hover:text-red-700 transition-colors">
                        Change
                      </button>
                    </div>

                    {receivedOtp && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                        <p className="text-[11px] text-amber-600 font-bold uppercase tracking-widest mb-1">Your OTP (demo)</p>
                        <p className="text-2xl font-bold text-amber-700 tracking-[0.4em] font-mono">{receivedOtp}</p>
                        <p className="text-[10px] text-amber-500 mt-1">Valid for 5 minutes</p>
                      </div>
                    )}

                    <OtpBoxes value={otp} onChange={v => { setOtp(v); setOtpError(""); }} error={otpError} />

                    <div className="flex items-center justify-between">
                      <button type="button" disabled={resend > 0} onClick={startResend}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                        {resend > 0 ? `Resend in ${resend}s` : "Resend OTP →"}
                      </button>
                    </div>

                    <button type="button" onClick={handleSubmit} disabled={otp.length !== 6 || loading}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                        transition-all duration-300 shadow-md active:scale-[.98]
                        ${otp.length === 6 && !loading
                          ? "shimmer-btn hover:shadow-xl hover:shadow-red-200"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}`}>
                      {loading ? <><Spinner /> Verifying…</> : <><span>Verify & Login</span><IcoArrow /></>}
                    </button>
                  </>
                )}
              </div>

              {/* Register link */}
              <p className="text-center text-xs text-gray-500 mt-6">
                New hospital?{" "}
                <Link to="/hospital-register" className="text-red-600 font-bold hover:text-red-800 hover:underline transition-colors">
                  Register here →
                </Link>
              </p>

              <div className="mt-5">
                <Divider label="Secure access" />
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                {[
                  { ico: <IcoShield />, txt: "SSL Encrypted" },
                  { ico: "🏥", txt: "HIPAA Safe" },
                  { ico: "🇮🇳", txt: "Data in India" },
                ].map(b => (
                  <div key={b.txt} className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                    <span className="text-slate-400 flex-shrink-0">{b.ico}</span>
                    {b.txt}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-5">
            © 2024 Blood Bridge &nbsp;·&nbsp;
            <a href="#" className="hover:text-red-400 transition-colors">Privacy Policy</a>
            &nbsp;·&nbsp;
            <a href="#" className="hover:text-red-400 transition-colors">Terms of Service</a>
            &nbsp;·&nbsp;
            <a href="#" className="hover:text-red-400 transition-colors">Support</a>
          </p>
        </div>
      </div>
    </>
  );
}

const BG = { background: "linear-gradient(145deg, #fafafa 0%, #fef5f0 40%, #fff8f8 100%)" };
