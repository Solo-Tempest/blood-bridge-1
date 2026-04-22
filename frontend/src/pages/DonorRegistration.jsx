import { useState, useRef } from "react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir"
];

const steps = [
  { id: 1, label: "Personal Info", icon: "👤" },
  { id: 2, label: "Medical Info", icon: "🩸" },
  { id: 3, label: "Location", icon: "📍" },
  { id: 4, label: "OTP Verify", icon: "🔐" },
];

const inputBase =
  "w-full bg-white border border-rose-100 rounded-xl px-4 py-3 pl-11 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md";
const labelBase = "block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5";
const errorBase = "text-xs text-red-500 mt-1 flex items-center gap-1";

function FieldIcon({ children }) {
  return (
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none select-none">
      {children}
    </span>
  );
}

function InputField({ label, icon, error, children, hint }) {
  return (
    <div>
      <label className={labelBase}>{label}</label>
      <div className="relative">{children}</div>
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && (
        <p className={errorBase}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-md
                  ${active ? "bg-red-600 text-white scale-110 ring-4 ring-red-200" : ""}
                  ${done ? "bg-red-100 text-red-600 border-2 border-red-400" : ""}
                  ${!active && !done ? "bg-white text-gray-400 border-2 border-gray-200" : ""}
                `}
              >
                {done ? "✓" : step.icon}
              </div>
              <span
                className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wider hidden sm:block
                  ${active ? "text-red-600" : done ? "text-red-400" : "text-gray-400"}`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-1 transition-all duration-700 mt-[-14px]
                  ${step.id < current ? "bg-red-400" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = ((current - 1) / (total - 1)) * 100;
  return (
    <div className="w-full h-1.5 bg-red-100 rounded-full mb-6 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Step1({ data, setData, errors }) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Personal Information
        </h2>
        <p className="text-sm text-gray-500 mt-1">Tell us a little about yourself</p>
      </div>

      <InputField label="Full Name" error={errors.name}>
        <FieldIcon>🧑</FieldIcon>
        <input
          className={inputBase}
          placeholder="e.g. Arjun Sharma"
          value={data.name}
          onChange={e => setData({ ...data, name: e.target.value })}
        />
      </InputField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Date of Birth" error={errors.dob}>
          <FieldIcon>🎂</FieldIcon>
          <input
            type="date"
            className={inputBase}
            value={data.dob}
            onChange={e => setData({ ...data, dob: e.target.value })}
          />
        </InputField>
        <InputField label="Gender" error={errors.gender}>
          <FieldIcon>⚧</FieldIcon>
          <select
            className={inputBase}
            value={data.gender}
            onChange={e => setData({ ...data, gender: e.target.value })}
          >
            <option value="">Select</option>
            {GENDERS.map(g => <option key={g}>{g}</option>)}
          </select>
        </InputField>
      </div>

      <InputField label="Phone Number" error={errors.phone} hint="We'll send OTP to this number">
        <FieldIcon>📱</FieldIcon>
        <input
          className={inputBase}
          placeholder="+91 98765 43210"
          value={data.phone}
          maxLength={13}
          onChange={e => setData({ ...data, phone: e.target.value })}
        />
      </InputField>

      <InputField label="Email Address" error={errors.email}>
        <FieldIcon>✉️</FieldIcon>
        <input
          type="email"
          className={inputBase}
          placeholder="you@example.com"
          value={data.email}
          onChange={e => setData({ ...data, email: e.target.value })}
        />
      </InputField>

      <PasswordField data={data} setData={setData} errors={errors} />
    </div>
  );
}

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function PasswordField({ data, setData, errors }) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <InputField label="Password" error={errors.password} hint="Min. 8 characters">
        <FieldIcon>🔒</FieldIcon>
        <input
          type={showPw ? "text" : "password"}
          className={`${inputBase} pr-10`}
          placeholder="Create password"
          value={data.password}
          onChange={e => setData({ ...data, password: e.target.value })}
        />
        <button
          type="button"
          onClick={() => setShowPw(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors duration-200"
        >
          {showPw ? <IconEyeOff /> : <IconEye />}
        </button>
      </InputField>
      <InputField label="Confirm Password" error={errors.confirmPassword}>
        <FieldIcon>🔒</FieldIcon>
        <input
          type={showConfirm ? "text" : "password"}
          className={`${inputBase} pr-10`}
          placeholder="Repeat password"
          value={data.confirmPassword}
          onChange={e => setData({ ...data, confirmPassword: e.target.value })}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors duration-200"
        >
          {showConfirm ? <IconEyeOff /> : <IconEye />}
        </button>
      </InputField>
    </div>
  );
}

function Step2({ data, setData, errors }) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Medical Information
        </h2>
        <p className="text-sm text-gray-500 mt-1">Help us understand your health profile</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Blood Group" error={errors.bloodGroup}>
          <FieldIcon>🩸</FieldIcon>
          <select
            className={inputBase}
            value={data.bloodGroup}
            onChange={e => setData({ ...data, bloodGroup: e.target.value })}
          >
            <option value="">Select</option>
            {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
          </select>
        </InputField>
        <InputField label="Weight (kg)" error={errors.weight}>
          <FieldIcon>⚖️</FieldIcon>
          <input
            type="number"
            className={inputBase}
            placeholder="e.g. 65"
            min={45}
            value={data.weight}
            onChange={e => setData({ ...data, weight: e.target.value })}
          />
        </InputField>
      </div>

      <div>
        <div
          className="flex items-center gap-3 mb-2.5 cursor-pointer select-none w-fit"
          onClick={() => setData({ ...data, neverDonated: !data.neverDonated, lastDonation: "" })}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
            ${data.neverDonated ? "bg-red-600 border-red-600" : "border-gray-300 bg-white hover:border-red-300"}`}>
            {data.neverDonated && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-sm font-medium text-gray-600">I have never donated blood before</span>
        </div>
        {!data.neverDonated && (
          <InputField label="Last Donation Date" error={errors.lastDonation}>
            <FieldIcon>📅</FieldIcon>
            <input
              type="date"
              className={inputBase}
              value={data.lastDonation}
              onChange={e => setData({ ...data, lastDonation: e.target.value })}
            />
          </InputField>
        )}
      </div>

      <div>
        <label className={labelBase}>Any Existing Diseases?</label>
        <div className="flex gap-3 mb-2">
          {["No", "Yes"].map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setData({ ...data, hasDisease: opt === "Yes", disease: opt === "No" ? "" : data.disease })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200
                ${(data.hasDisease ? "Yes" : "No") === opt
                  ? "border-red-500 bg-red-50 text-red-600"
                  : "border-gray-200 bg-white text-gray-500 hover:border-red-200"}`}
            >
              {opt}
            </button>
          ))}
        </div>
        {data.hasDisease && (
          <div className="relative">
            <FieldIcon>🏥</FieldIcon>
            <input
              className={inputBase}
              placeholder="Please describe your condition"
              value={data.disease}
              onChange={e => setData({ ...data, disease: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 cursor-pointer"
        onClick={() => setData({ ...data, isHealthy: !data.isHealthy })}>
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200
          ${data.isHealthy ? "bg-red-600 border-red-600" : "border-gray-300 bg-white"}`}>
          {data.isHealthy && <span className="text-white text-xs font-bold">✓</span>}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">I am currently in good health</p>
          <p className="text-xs text-gray-500 mt-0.5">I confirm I feel well and have no fever, cold, or active illness</p>
        </div>
      </div>
      {errors.isHealthy && <p className={errorBase}><span>⚠</span> {errors.isHealthy}</p>}
    </div>
  );
}

function Step3({ data, setData, errors }) {
  const [gpsStatus, setGpsStatus] = useState("idle");

  const handleGPS = () => {
    setGpsStatus("loading");
    navigator.geolocation?.getCurrentPosition(
      () => setGpsStatus("success"),
      () => setGpsStatus("error")
    );
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your Location
        </h2>
        <p className="text-sm text-gray-500 mt-1">Help donors and recipients find you</p>
      </div>

      <InputField label="City" error={errors.city}>
        <FieldIcon>🏙️</FieldIcon>
        <input
          className={inputBase}
          placeholder="e.g. Patna"
          value={data.city}
          onChange={e => setData({ ...data, city: e.target.value })}
        />
      </InputField>

      <InputField label="State" error={errors.state}>
        <FieldIcon>🗺️</FieldIcon>
        <select
          className={inputBase}
          value={data.state}
          onChange={e => setData({ ...data, state: e.target.value })}
        >
          <option value="">Select State</option>
          {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
        </select>
      </InputField>

      <InputField label="Pincode" error={errors.pincode}>
        <FieldIcon>🔢</FieldIcon>
        <input
          className={inputBase}
          placeholder="6-digit pincode"
          maxLength={6}
          value={data.pincode}
          onChange={e => setData({ ...data, pincode: e.target.value.replace(/\D/g, "") })}
        />
      </InputField>

      <div>
        <label className={labelBase}>GPS Location (Optional)</label>
        <button
          type="button"
          onClick={handleGPS}
          className={`w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300
            ${gpsStatus === "success" ? "border-green-400 bg-green-50 text-green-600" : ""}
            ${gpsStatus === "error" ? "border-red-300 bg-red-50 text-red-500" : ""}
            ${gpsStatus === "loading" ? "border-amber-300 bg-amber-50 text-amber-600 animate-pulse" : ""}
            ${gpsStatus === "idle" ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100" : ""}
          `}
        >
          {gpsStatus === "idle" && <><span>📡</span> Detect My Location</>}
          {gpsStatus === "loading" && <><span>⏳</span> Detecting…</>}
          {gpsStatus === "success" && <><span>✅</span> Location Detected!</>}
          {gpsStatus === "error" && <><span>❌</span> Permission Denied</>}
        </button>
      </div>
    </div>
  );
}

function Step4({ data, setData, errors, otpSent, setOtpSent, verified, setVerified, phone }) {
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    setResendTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const sendOTP = () => {
    setOtpSent(true);
    startTimer();
  };

  const verify = () => {
    if (data.otp === "123456") setVerified(true);
    else setData({ ...data, otpError: "Invalid OTP. Try 123456 for demo." });
  };

  if (verified) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl animate-bounce">✅</div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Verified!
        </h2>
        <p className="text-sm text-gray-500 text-center">Your phone number has been verified successfully.<br/>You're all set to save lives!</p>
        <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-5 w-full text-center">
          <p className="text-xs text-red-400 uppercase tracking-wider font-semibold mb-1">Registration Complete</p>
          <p className="text-sm text-gray-600">Welcome to <span className="font-bold text-red-600">Blood Bridge</span> 🩸</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Verify Your Number
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          We'll send a 6-digit OTP to <span className="font-semibold text-red-600">{phone || "+91 XXXXX XXXXX"}</span>
        </p>
      </div>

      {!otpSent ? (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-2xl p-6 text-center space-y-4">
          <div className="text-5xl">📲</div>
          <p className="text-sm text-gray-600">Click below to receive your OTP via SMS</p>
          <button
            type="button"
            onClick={sendOTP}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            Send OTP
          </button>
        </div>
      ) : (
        <>
          <div className="text-center text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            💡 <strong>Demo:</strong> Use <code className="bg-amber-100 px-1 rounded font-mono">123456</code> as OTP
          </div>
          <InputField label="Enter OTP" error={data.otpError || errors.otp}>
            <FieldIcon>🔑</FieldIcon>
            <input
              className={`${inputBase} tracking-[0.4em] text-center font-bold text-lg`}
              placeholder="• • • • • •"
              maxLength={6}
              value={data.otp}
              onChange={e => setData({ ...data, otp: e.target.value.replace(/\D/g, ""), otpError: "" })}
            />
          </InputField>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={verify}
              disabled={data.otp.length !== 6}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={resendTimer === 0 ? sendOTP : undefined}
              disabled={resendTimer > 0}
              className="flex-1 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all duration-200"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function validate(step, formData) {
  const errs = {};
  if (step === 1) {
    if (!formData.personal.name.trim()) errs.name = "Full name is required";
    if (!formData.personal.dob) errs.dob = "Date of birth is required";
    else {
      const age = Math.floor((Date.now() - new Date(formData.personal.dob)) / 31557600000);
      if (age < 18) errs.dob = "You must be at least 18 years old";
      if (age > 65) errs.dob = "Age must be 65 or below to donate";
    }
    if (!formData.personal.gender) errs.gender = "Please select a gender";
    if (!formData.personal.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[+\d][\d\s]{9,12}$/.test(formData.personal.phone)) errs.phone = "Enter a valid phone number";
    if (!formData.personal.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.personal.email)) errs.email = "Enter a valid email";
    if (!formData.personal.password) errs.password = "Password is required";
    else if (formData.personal.password.length < 8) errs.password = "Minimum 8 characters";
    if (!formData.personal.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (formData.personal.password !== formData.personal.confirmPassword) errs.confirmPassword = "Passwords do not match";
  }
  if (step === 2) {
    if (!formData.medical.bloodGroup) errs.bloodGroup = "Blood group is required";
    if (!formData.medical.weight) errs.weight = "Weight is required";
    else if (Number(formData.medical.weight) < 45) errs.weight = "Minimum weight is 45 kg to donate";
    if (!formData.medical.isHealthy) errs.isHealthy = "Please confirm you are currently healthy";
  }
  if (step === 3) {
    if (!formData.location.city.trim()) errs.city = "City is required";
    if (!formData.location.state) errs.state = "State is required";
    if (!formData.location.pincode || formData.location.pincode.length !== 6) errs.pincode = "Enter a valid 6-digit pincode";
  }
  return errs;
}

export default function DonorRegistration() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const [personal, setPersonal] = useState({ name: "", dob: "", gender: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [medical, setMedical] = useState({ bloodGroup: "", weight: "", hasDisease: false, disease: "", lastDonation: "", neverDonated: false, isHealthy: false });
  const [location, setLocation] = useState({ city: "", state: "", pincode: "" });
  const [otpData, setOtpData] = useState({ otp: "", otpError: "" });

  const formData = { personal, medical, location };

  const next = () => {
    if (step === 4) return;
    const errs = validate(step, formData);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(s => s + 1);
  };

  const back = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease forwards; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .animate-bounce { animation: bounce 0.8s ease-in-out 3; }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear { display: none; }
        input[type="password"]::-webkit-credentials-auto-fill-button { visibility: hidden; }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center py-10 px-4 pt-[80px]"
        style={{ background: "linear-gradient(135deg, #fff5f5 0%, #fef9f5 50%, #fff0f0 100%)" }}
      >
        <div className="fixed top-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #ff8080, transparent)", transform: "translate(-30%, -30%)" }} />
        <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, #ffb3b3, transparent)", transform: "translate(30%, 30%)" }} />

        <div className="w-full max-w-lg relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-xl shadow-lg">🩸</div>
              <span className="text-2xl font-bold text-red-600" style={{ fontFamily: "'Playfair Display', serif" }}>
                Blood Bridge
              </span>
            </div>
            <p className="text-sm text-gray-500">Donor Registration</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-red-100 border border-red-50 p-7 sm:p-9">
            <StepIndicator current={step} />
            <ProgressBar current={step} total={4} />

            {step === 1 && <Step1 data={personal} setData={setPersonal} errors={errors} />}
            {step === 2 && <Step2 data={medical} setData={setMedical} errors={errors} />}
            {step === 3 && <Step3 data={location} setData={setLocation} errors={errors} />}
            {step === 4 && (
              <Step4
                data={otpData}
                setData={setOtpData}
                errors={errors}
                otpSent={otpSent}
                setOtpSent={setOtpSent}
                verified={verified}
                setVerified={setVerified}
                phone={personal.phone}
              />
            )}

            {!verified && (
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={back}
                    className="flex-1 py-3.5 border-2 border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all duration-200 active:scale-95"
                  >
                    ← Back
                  </button>
                )}
                {step < 4 && (
                  <button
                    type="button"
                    onClick={next}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    Next →
                  </button>
                )}
                {step === 4 && !otpSent && <div className="flex-1" />}
              </div>
            )}

            {verified && (
              <button
                type="button"
                className="w-full mt-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                🎉 Complete Registration
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            By registering, you agree to our{" "}
            <span className="text-red-500 cursor-pointer hover:underline">Terms of Service</span>{" "}
            &amp;{" "}
            <span className="text-red-500 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </>
  );
}
