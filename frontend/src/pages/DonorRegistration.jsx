import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { donorRegister, sendDonorOtp, verifyDonorOtp } from "../api/auth";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons broken by Vite's asset bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function cleanPhone(phone) {
  const raw = phone.replace(/\D/g, "");
  return raw.startsWith("91") && raw.length === 12 ? raw.slice(2) : raw.slice(-10);
}

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
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState(data.address || "");
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [locating, setLocating] = useState(false);
  const [geoErr, setGeoErr] = useState("");

  // Initialize Leaflet map on mount
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const center = data.lat && data.lng
      ? [Number(data.lat), Number(data.lng)]
      : [20.5937, 78.9629];

    const map = L.map(mapDivRef.current, {
      center,
      zoom: data.lat ? 14 : 5,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", e => {
      const { lat, lng } = e.latlng;
      placeOrMoveMarker(lat, lng, map);
      reverseGeocode(lat, lng);
    });

    if (data.lat && data.lng) {
      placeOrMoveMarker(Number(data.lat), Number(data.lng), map);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const placeOrMoveMarker = (lat, lng, mapInstance) => {
    const map = mapInstance || mapRef.current;
    if (!map) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });
      markerRef.current = marker;
    }
    map.flyTo([lat, lng], Math.max(map.getZoom(), 14));
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "User-Agent": "BloodBridge/1.0" } }
      );
      const json = await res.json();
      if (json.address) {
        const a = json.address;
        const city = a.city || a.town || a.village || a.county || "";
        const rawState = a.state || "";
        const state = INDIAN_STATES.find(
          s => s.toLowerCase() === rawState.toLowerCase()
        ) || "";
        const pincode = a.postcode || "";
        const address = json.display_name || "";
        setData(d => ({
          ...d,
          lat: String(lat).includes(".") ? String(Number(lat).toFixed(6)) : lat,
          lng: String(lng).includes(".") ? String(Number(lng).toFixed(6)) : lng,
          address,
          city: city || d.city,
          state: state || d.state,
          pincode: pincode || d.pincode,
        }));
        setSearchQuery(address);
      } else {
        setData(d => ({ ...d, lat: Number(lat).toFixed(6), lng: Number(lng).toFixed(6) }));
      }
    } catch {
      setData(d => ({ ...d, lat: Number(lat).toFixed(6), lng: Number(lng).toFixed(6) }));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchErr("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&countrycodes=in&limit=1`,
        { headers: { "User-Agent": "BloodBridge/1.0" } }
      );
      const results = await res.json();
      if (results.length > 0) {
        const lat = Number(results[0].lat);
        const lng = Number(results[0].lon);
        placeOrMoveMarker(lat, lng);
        reverseGeocode(lat, lng);
      } else {
        setSearchErr("Location not found. Try a more specific name.");
      }
    } catch {
      setSearchErr("Search failed. Please click directly on the map instead.");
    } finally {
      setSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoErr("Your browser doesn't support location access.");
      return;
    }
    setLocating(true);
    setGeoErr("");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        placeOrMoveMarker(lat, lng);
        reverseGeocode(lat, lng);
        setLocating(false);
      },
      err => {
        setLocating(false);
        if (err.code === 1) setGeoErr("Location permission denied. Please allow access in your browser.");
        else setGeoErr("Could not get your location. Try searching instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your Location
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Search your area or click the map to pin your exact spot
        </p>
      </div>

      {/* Address search */}
      <div>
        <label className={labelBase}>Search Address</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FieldIcon>🔍</FieldIcon>
            <input
              type="text"
              className={inputBase}
              placeholder="e.g. Rajendra Nagar, Patna, Bihar"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchErr(""); }}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all duration-200 flex-shrink-0 active:scale-95"
          >
            {searching ? "…" : "Go"}
          </button>
        </div>
        {searchErr && <p className={errorBase}><span>⚠</span> {searchErr}</p>}
        {errors.address && !searchErr && <p className={errorBase}><span>⚠</span> {errors.address}</p>}
      </div>

      {/* Current location button */}
      <button
        type="button"
        onClick={handleCurrentLocation}
        disabled={locating}
        className={`w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300
          ${locating
            ? "border-amber-300 bg-amber-50 text-amber-600 animate-pulse cursor-wait"
            : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300 active:scale-95"
          }`}
      >
        {locating ? <><span>⏳</span> Detecting your location…</> : <><span>📡</span> Use My Current Location</>}
      </button>
      {geoErr && <p className={`${errorBase} -mt-2`}><span>⚠</span> {geoErr}</p>}

      {/* Leaflet map */}
      <div className="rounded-2xl overflow-hidden border border-red-100 shadow-sm">
        <div ref={mapDivRef} style={{ width: "100%", height: 280 }} />
      </div>

      <p className="text-xs text-gray-400 text-center">
        Click anywhere on the map or drag the pin to fine-tune your location
      </p>

      {/* Coordinates badge */}
      {data.lat && data.lng && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
          <span className="text-base">📍</span>
          <span className="text-xs font-mono text-green-700">
            {Number(data.lat).toFixed(5)}, {Number(data.lng).toFixed(5)}
          </span>
          <span className="ml-auto text-xs text-green-600 font-semibold">Location set ✓</span>
        </div>
      )}

      {/* Selected address — read-only */}
      {data.address && (
        <InputField label="Selected Address">
          <FieldIcon>📍</FieldIcon>
          <input
            className={`${inputBase} bg-gray-50 text-gray-500 cursor-default`}
            value={data.address}
            readOnly
          />
        </InputField>
      )}

      {/* Auto-filled from reverse geocode — still manually editable */}
      <div className="grid grid-cols-2 gap-4">
        <InputField label="City" error={errors.city}>
          <FieldIcon>🏙️</FieldIcon>
          <input
            className={inputBase}
            placeholder="e.g. Patna"
            value={data.city}
            onChange={e => setData({ ...data, city: e.target.value })}
          />
        </InputField>
        <InputField label="Pincode" error={errors.pincode}>
          <FieldIcon>🔢</FieldIcon>
          <input
            className={inputBase}
            placeholder="6-digit"
            maxLength={6}
            value={data.pincode}
            onChange={e => setData({ ...data, pincode: e.target.value.replace(/\D/g, "") })}
          />
        </InputField>
      </div>

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
    </div>
  );
}

function Step4({ data, setData, otpSent, loading, apiError, resendTimer, onSendOtp, onResend, onVerifyOtp, verified, email }) {
  if (verified) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl animate-bounce">✅</div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Verified!
        </h2>
        <p className="text-sm text-gray-500 text-center">Email verified successfully.<br/>Completing your registration…</p>
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
          Verify Your Email
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          We'll send a 6-digit OTP to <span className="font-semibold text-red-600">{email || "your email"}</span>
        </p>
      </div>

      {!otpSent ? (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-2xl p-6 text-center space-y-4">
          <div className="text-5xl">📧</div>
          <p className="text-sm text-gray-600">Click below to receive your OTP via Email</p>
          {apiError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">⚠ {apiError}</p>
          )}
          <button
            type="button"
            onClick={onSendOtp}
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg> Registering &amp; Sending OTP…</>
            ) : "Send OTP to Email"}
          </button>
        </div>
      ) : (
        <>
          {(
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              <p className="text-[11px] text-green-700 font-bold uppercase tracking-widest mb-1">OTP Sent to Your Email</p>
              <p className="text-sm text-green-800 font-medium">Check your inbox for the 6-digit code</p>
              <p className="text-[10px] text-green-600 mt-1">Valid for 5 minutes · Do not share it</p>
            </div>
          )}

          <InputField label="Enter OTP" error={data.otpError}>
            <FieldIcon>🔑</FieldIcon>
            <input
              className={`${inputBase} tracking-[0.4em] text-center font-bold text-lg`}
              placeholder="• • • • • •"
              maxLength={6}
              value={data.otp}
              onChange={e => setData({ ...data, otp: e.target.value.replace(/\D/g, ""), otpError: "" })}
            />
          </InputField>

          {apiError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">⚠ {apiError}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onVerifyOtp}
              disabled={data.otp.length !== 6 || loading}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg> Verifying…</>
              ) : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={resendTimer === 0 ? onResend : undefined}
              disabled={resendTimer > 0 || loading}
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
    if (!formData.location.address && !formData.location.city.trim())
      errs.address = "Please search or click the map to set your location";
    if (!formData.location.city.trim()) errs.city = "City is required";
    if (!formData.location.state) errs.state = "State is required";
    if (!formData.location.pincode || formData.location.pincode.length !== 6)
      errs.pincode = "Enter a valid 6-digit pincode";
  }
  return errs;
}

export default function DonorRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpApiError, setOtpApiError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [personal, setPersonal] = useState({ name: "", dob: "", gender: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [medical, setMedical] = useState({ bloodGroup: "", weight: "", hasDisease: false, disease: "", lastDonation: "", neverDonated: false, isHealthy: false });
  const [location, setLocation] = useState({ city: "", state: "", pincode: "", address: "", lat: "", lng: "" });
  const [otpData, setOtpData] = useState({ otp: "", otpError: "" });

  const formData = { personal, medical, location };

  useEffect(() => {
    if (!resendTimer) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);


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

  // Step 4: register account first, then send OTP to email
  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpApiError("");
    try {
      await donorRegister({ personal, medical, location });
    } catch (err) {
      const msg = err.message.toLowerCase();
      if (!msg.includes("already") && !msg.includes("exist") && !msg.includes("registered")) {
        setOtpApiError(err.message);
        setOtpLoading(false);
        return;
      }
    }
    try {
      await sendDonorOtp(personal.email);
      setOtpSent(true);
      setResendTimer(60);
    } catch (err) {
      setOtpApiError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpApiError("");
    setOtpData({ otp: "", otpError: "" });
    setResendTimer(60);
    try {
      await sendDonorOtp(personal.email);
    } catch (err) {
      setOtpApiError(err.message || "Failed to resend OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otpData.otp.length !== 6) {
      setOtpData(d => ({ ...d, otpError: "Enter the 6-digit OTP" }));
      return;
    }
    setOtpLoading(true);
    setOtpApiError("");
    try {
      const data = await verifyDonorOtp(personal.email, otpData.otp);
      localStorage.setItem("bb_token", data.token);
      localStorage.setItem("bb_user", JSON.stringify({ userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }));
      setVerified(true);
      setTimeout(() => navigate("/donor"), 1500);
    } catch (err) {
      setOtpData(d => ({ ...d, otpError: err.message || "Verification failed." }));
    } finally {
      setOtpLoading(false);
    }
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
                otpSent={otpSent}
                loading={otpLoading}
                apiError={otpApiError}
                resendTimer={resendTimer}
                onSendOtp={handleSendOtp}
                onResend={handleResendOtp}
                onVerifyOtp={handleVerifyOtp}
                verified={verified}
                email={personal.email}
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
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Already registered?{" "}
            <Link to="/donor-login" className="text-red-500 font-semibold hover:underline">Login here →</Link>
            &nbsp;·&nbsp;
            <span className="cursor-pointer hover:text-red-400 transition-colors">Terms</span>
            &nbsp;·&nbsp;
            <span className="cursor-pointer hover:text-red-400 transition-colors">Privacy</span>
          </p>
        </div>
      </div>
    </>
  );
}
