import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { donorLogin, sendDonorOtp, verifyDonorOtp } from "../api/auth";

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
  </svg>
);

const isEmail  = v => /\S+@\S+\.\S+/.test(v);
const isOtpNum = v => /^\d{0,6}$/.test(v);

function Drops() {
  const drops = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    size: 18 + i * 8,
    left: `${8 + i * 13}%`,
    delay: i * 0.7,
    dur: 6 + i * 0.9,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {drops.map(d => (
        <div
          key={d.id}
          className="absolute rounded-full opacity-[0.07]"
          style={{
            width: d.size, height: d.size,
            left: d.left, top: "-10%",
            background: "#D32F2F",
            animation: `dropFall ${d.dur}s ${d.delay}s ease-in infinite`,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          }}
        />
      ))}
    </div>
  );
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-red-100" />
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-red-100" />
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
      <div className="relative group">{children}</div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium pl-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err) =>
  `w-full bg-white/80 backdrop-blur-sm border rounded-xl px-4 py-3.5 pl-11 pr-4 text-sm text-gray-700
   placeholder-gray-300 transition-all duration-250 outline-none
   ${err
     ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400"
     : "border-rose-100 focus:ring-2 focus:ring-red-200 focus:border-red-300 hover:border-red-200"
   }
   shadow-sm hover:shadow-md focus:shadow-md`;

const LeadIcon = ({ children }) => (
  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-300 pointer-events-none transition-colors duration-200 group-focus-within:text-red-500">
    {children}
  </span>
);

function OtpInput({ value, onChange, error }) {
  const inputRef = useRef(null);
  const digits = value.padEnd(6, " ").split("");
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500">Enter OTP</label>
      <div
        className="relative flex gap-2 justify-center cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {digits.map((d, i) => (
          <div
            key={i}
            className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all duration-200
              ${i < value.length ? "border-red-400 bg-red-50 text-red-700" : "border-rose-100 bg-white text-transparent"}
              ${i === value.length ? "border-red-400 ring-2 ring-red-200 scale-105" : ""}
            `}
          >
            {d.trim() ? d : i === value.length ? <span className="w-0.5 h-5 bg-red-400 animate-blink inline-block" /> : ""}
          </div>
        ))}
        <input
          ref={inputRef}
          value={value}
          onChange={e => isOtpNum(e.target.value) && onChange(e.target.value)}
          maxLength={6}
          className="absolute inset-0 opacity-0 cursor-text"
        />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium pl-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />{error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

const bgStyle = {
  background: "linear-gradient(145deg, #fff8f8 0%, #fef5f0 40%, #fff0f0 100%)",
};

export default function DonorLogin() {
  const navigate = useNavigate();
  const [mode, setMode]             = useState("password");
  const [identifier, setIdentifier] = useState("");
  const [otpEmail, setOtpEmail]     = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [remember, setRemember]     = useState(false);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState("");
  const [otpSent, setOtpSent]       = useState(false);
  const [otp, setOtp]               = useState("");
  const [resend, setResend]         = useState(0);
  const [cardIn, setCardIn]         = useState(false);

  useEffect(() => { requestAnimationFrame(() => setCardIn(true)); }, []);

  useEffect(() => {
    if (!resend) return;
    const t = setTimeout(() => setResend(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  function validate() {
    const e = {};
    if (mode === "password") {
      if (!identifier.trim()) {
        e.identifier = "Email or phone number is required";
      } else if (!isEmail(identifier) && !/^\d{10}$/.test(identifier.trim())) {
        e.identifier = "Enter a valid email or phone number";
      }
      if (!password) e.password = "Password is required";
      else if (password.length < 6) e.password = "Password must be at least 6 characters";
    } else {
      if (!otpEmail.trim()) {
        e.otpEmail = "Email is required";
      } else if (!isEmail(otpEmail)) {
        e.otpEmail = "Enter a valid email address";
      }
    }
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSendOtp() {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      await sendDonorOtp(otpEmail);
      setOtpSent(true);
      setResend(60);
    } catch (err) {
      setApiError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (mode === "otp" && otpSent) {
      if (otp.length !== 6) { setErrors({ otp: "Enter the 6-digit OTP" }); return; }
      setLoading(true);
      setApiError("");
      try {
        const data = await verifyDonorOtp(otpEmail, otp);
        localStorage.setItem("bb_token", data.token);
        localStorage.setItem("bb_user", JSON.stringify({ userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }));
        navigate("/donor");
      } catch (err) {
        setApiError(err.message || "Verification failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const data = await donorLogin(identifier, password);
      localStorage.setItem("bb_token", data.token);
      localStorage.setItem("bb_user", JSON.stringify({ userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }));
      navigate("/donor");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = mode === "password"
    ? identifier.trim() && password.length >= 6
    : otpSent
    ? otp.length === 6
    : isEmail(otpEmail);

  return (
    <>
      <PageStyles />
      <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-[80px]" style={bgStyle}>
        <Drops />

        <div
          className="w-full max-w-md transition-all duration-700"
          style={{
            opacity: cardIn ? 1 : 0,
            transform: cardIn ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
          }}
        >
          {/* brand */}
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex items-center gap-2.5 group no-underline">
              <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 group-hover:shadow-red-300 transition-shadow duration-300 text-white text-xl">
                🩸
              </div>
              <span className="text-2xl font-extrabold text-red-600 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Blood Bridge
              </span>
            </Link>
          </div>

          {/* card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-100/60 border border-white/80 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-red-100 to-rose-50 opacity-70" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-tr from-rose-100 to-transparent opacity-60" />

            <div className="relative">
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Donor Login
                </h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back! Please login to continue</p>
              </div>

              {/* mode toggle */}
              <div className="flex bg-rose-50 rounded-xl p-1 mb-7 gap-1">
                {[
                  { key: "password", label: "Password" },
                  { key: "otp",      label: "Login with OTP" },
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setMode(opt.key); setErrors({}); setOtpSent(false); setOtp(""); setOtpEmail(""); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-250
                      ${mode === opt.key
                        ? "bg-white text-red-600 shadow-md shadow-red-100"
                        : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                {mode === "password" && (
                  <Field label="Email or Phone" error={errors.identifier}>
                    <LeadIcon><IconMail /></LeadIcon>
                    <input
                      className={inputCls(errors.identifier)}
                      placeholder="you@example.com or 98765…"
                      value={identifier}
                      onChange={e => { setIdentifier(e.target.value); setErrors(err => ({ ...err, identifier: "" })); }}
                      autoComplete="username"
                    />
                  </Field>
                )}

                {mode === "otp" && !otpSent && (
                  <>
                    <Field label="Registered Email" error={errors.otpEmail}>
                      <LeadIcon><IconMail /></LeadIcon>
                      <input
                        className={inputCls(errors.otpEmail)}
                        placeholder="you@example.com"
                        value={otpEmail}
                        onChange={e => { setOtpEmail(e.target.value); setErrors(err => ({ ...err, otpEmail: "" })); }}
                        autoComplete="email"
                        type="email"
                      />
                    </Field>
                    <p className="text-xs text-gray-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                      📧 A 6-digit OTP will be sent to your registered email address.
                    </p>
                  </>
                )}

                {mode === "otp" && otpSent && (
                  <>
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                      <span className="text-red-400"><IconMail /></span>
                      <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{otpEmail}</span>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(""); setErrors({}); }}
                        className="text-xs text-red-500 font-semibold hover:text-red-700 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
                      <p className="text-[11px] text-green-700 font-bold uppercase tracking-widest mb-1">OTP Sent to Your Email</p>
                      <p className="text-sm text-green-800 font-medium">Check your inbox for the 6-digit code</p>
                      <p className="text-[10px] text-green-600 mt-1">Valid for 5 minutes · Do not share it</p>
                    </div>
                    <OtpInput value={otp} onChange={setOtp} error={errors.otp} />
                    <div className="text-right">
                      <button
                        type="button"
                        disabled={resend > 0}
                        onClick={() => { handleSendOtp(); setOtp(""); }}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {resend > 0 ? `Resend in ${resend}s` : "Resend OTP →"}
                      </button>
                    </div>
                  </>
                )}

                {mode === "password" && (
                  <Field label="Password" error={errors.password}>
                    <LeadIcon><IconLock /></LeadIcon>
                    <input
                      type={showPw ? "text" : "password"}
                      className={`${inputCls(errors.password)} pr-11`}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(err => ({ ...err, password: "" })); }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors duration-200 p-1"
                    >
                      {showPw ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </Field>
                )}

                {mode === "password" && (
                  <div className="flex items-center justify-between pt-0.5">
                    <label
                      className="flex items-center gap-2.5 cursor-pointer select-none group"
                      onClick={() => setRemember(v => !v)}
                    >
                      <div className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                        ${remember ? "bg-red-600 border-red-600" : "border-gray-300 group-hover:border-red-300"}`}>
                        {remember && <span className="text-white text-[10px] font-black leading-none">✓</span>}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Remember me</span>
                    </label>
                    <a href="#" className="text-xs text-red-500 font-semibold hover:text-red-700 transition-colors duration-200 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                )}

                {apiError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                    ⚠ {apiError}
                  </p>
                )}

                {mode === "otp" && !otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!isEmail(otpEmail) || loading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-rose-500
                      hover:from-red-700 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-200 disabled:text-gray-400
                      disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-red-200
                      hover:shadow-xl hover:shadow-red-200 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? <Spinner /> : <><span>Send OTP</span><IconArrow /></>}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-rose-500
                      hover:from-red-700 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-200 disabled:text-gray-400
                      disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-red-200
                      hover:shadow-xl hover:shadow-red-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-1"
                  >
                    {loading ? <Spinner /> : <><span>Login to Blood Bridge</span><IconArrow /></>}
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-gray-500 mt-7">
                Don't have an account?{" "}
                <Link to="/donor-register" className="text-red-600 font-bold hover:text-red-800 transition-colors duration-200 hover:underline">
                  Register as Donor →
                </Link>
              </p>

              <Divider label="Secure login" />

              <div className="flex items-center justify-center gap-5 mt-2">
                {["🔒 SSL Encrypted", "🏥 HIPAA Safe", "🇮🇳 Data in India"].map(b => (
                  <span key={b} className="text-[10px] text-gray-400 font-medium">{b}</span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-5">
            © 2024 Blood Bridge ·{" "}
            <a href="#" className="hover:text-red-400 transition-colors">Privacy</a> ·{" "}
            <a href="#" className="hover:text-red-400 transition-colors">Terms</a>
          </p>
        </div>
      </div>
    </>
  );
}

function PageStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

      @keyframes dropFall {
        0%   { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
        10%  { opacity: 0.07; }
        90%  { opacity: 0.05; }
        100% { transform: translateY(110vh) rotate(20deg); opacity: 0; }
      }
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(24px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .animate-cardIn { animation: cardIn 0.6s cubic-bezier(.22,.68,0,1.2) forwards; }
      @keyframes heartBeat {
        0%,100% { transform: scale(1); }
        14%     { transform: scale(1.15); }
        28%     { transform: scale(1); }
        42%     { transform: scale(1.1); }
        70%     { transform: scale(1); }
      }
      .animate-heartBeat { animation: heartBeat 1.3s ease-in-out infinite; }
      @keyframes loadBar {
        from { width: 0%; }
        to   { width: 100%; }
      }
      .animate-loadBar { animation: loadBar 2.5s linear forwards; }
      @keyframes blink {
        0%,100% { opacity: 1; }
        50%     { opacity: 0; }
      }
      .animate-blink { animation: blink 1s step-end infinite; }
    `}</style>
  );
}
