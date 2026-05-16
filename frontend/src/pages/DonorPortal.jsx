import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDonorProfile, updateDonorProfile, getDonorNotifications, respondToNotification } from "../api/auth";
import L from "leaflet";

/* ── Global Styles ─────────────────────────────────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    body { margin:0; background:#faf7f5; font-family:'Sora',sans-serif; }
    ::-webkit-scrollbar { width:4px; height:4px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:#e5c5c5; border-radius:4px; }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
    @keyframes ping     { 75%,100%{transform:scale(2);opacity:0} }
    @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes slideIn  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }

    .fu  { animation: fadeUp  .4s cubic-bezier(.22,.68,0,1.1) both; }
    .fi  { animation: fadeIn  .3s ease both; }
    .si  { animation: slideIn .35s cubic-bezier(.22,.68,0,1.1) both; }
    .delay-1 { animation-delay:.08s; }
    .delay-2 { animation-delay:.16s; }
    .delay-3 { animation-delay:.24s; }
    .delay-4 { animation-delay:.32s; }
    .delay-5 { animation-delay:.4s; }
    .ping { animation: ping 1.2s cubic-bezier(0,0,.2,1) infinite; }
    .spin { animation: spin .7s linear infinite; }
    .skeleton { background:linear-gradient(90deg,#f0e8e8 25%,#f7efef 50%,#f0e8e8 75%); background-size:400px 100%; animation:shimmer 1.3s ease-in-out infinite; border-radius:8px; }

    .sidebar-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:12px; cursor:pointer; font-size:13px; font-weight:500; color:#6b5c5c; transition:all .2s; border:none; background:transparent; width:100%; text-align:left; }
    .sidebar-item:hover { background:#fff0f0; color:#c62828; }
    .sidebar-item.active { background:linear-gradient(135deg,#c62828,#e53935); color:#fff; box-shadow:0 4px 16px #c6282840; }
    .sidebar-item.active svg { color:#fff; }

    .card { background:#fff; border-radius:20px; border:1px solid #f5e5e5; box-shadow:0 2px 12px #c6282810; padding:20px; }
    .stat-card { background:#fff; border-radius:18px; border:1px solid #f5e5e5; box-shadow:0 2px 16px #c6282812; padding:20px 20px 16px; cursor:default; transition:transform .2s, box-shadow .2s; }
    .stat-card:hover { transform:translateY(-3px); box-shadow:0 8px 28px #c6282820; }

    .inp { width:100%; background:#fdf8f8; border:1.5px solid #f0dede; border-radius:12px; padding:10px 14px 10px 38px; font-size:13px; color:#3d2c2c; font-family:'Sora',sans-serif; outline:none; transition:border .2s, box-shadow .2s; }
    .inp:focus { border-color:#e53935; box-shadow:0 0 0 3px #e5393520; }
    .inp-plain { width:100%; background:#fdf8f8; border:1.5px solid #f0dede; border-radius:12px; padding:10px 14px; font-size:13px; color:#3d2c2c; font-family:'Sora',sans-serif; outline:none; transition:border .2s; }
    .inp-plain:focus { border-color:#e53935; box-shadow:0 0 0 3px #e5393520; }

    .btn-red { background:linear-gradient(135deg,#c62828,#e53935); color:#fff; border:none; border-radius:12px; padding:11px 22px; font-size:13px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; transition:all .2s; box-shadow:0 4px 14px #c6282830; letter-spacing:.3px; }
    .btn-red:hover { transform:translateY(-1px); box-shadow:0 6px 20px #c6282840; }
    .btn-red:active { transform:translateY(0); }
    .btn-outline { background:#fff; color:#c62828; border:1.5px solid #e5393540; border-radius:12px; padding:10px 20px; font-size:13px; font-weight:600; font-family:'Sora',sans-serif; cursor:pointer; transition:all .2s; }
    .btn-outline:hover { background:#fff0f0; border-color:#e53935; }

    .badge { display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.3px; }
    .badge-red    { background:#ffebeb; color:#c62828; }
    .badge-green  { background:#e8f5e9; color:#2e7d32; }
    .badge-amber  { background:#fff8e1; color:#f57f17; }
    .badge-gray   { background:#f5f5f5; color:#757575; }
    .badge-blood  { background:linear-gradient(135deg,#c62828,#e53935); color:#fff; font-size:16px; font-weight:800; padding:8px 20px; border-radius:14px; letter-spacing:1px; }

    .request-card { background:#fff; border:1.5px solid #f5e5e5; border-radius:18px; padding:18px; transition:all .2s; box-shadow:0 2px 10px #c6282808; }
    .request-card:hover { border-color:#e5393540; box-shadow:0 6px 24px #c6282818; transform:translateY(-2px); }
    .request-card.urgent  { border-left:4px solid #e53935; }
    .request-card.critical { border-left:4px solid #b71c1c; background:#fffafA; }
    .request-card.normal  { border-left:4px solid #66bb6a; }

    .tab { padding:8px 18px; border-radius:10px; font-size:12.5px; font-weight:600; cursor:pointer; border:none; background:transparent; font-family:'Sora',sans-serif; color:#9e8080; transition:all .2s; }
    .tab.active { background:#fff; color:#c62828; box-shadow:0 2px 10px #c6282820; }

    .notif { display:flex; align-items:flex-start; gap:12px; padding:14px; border-radius:14px; background:#fff; border:1.5px solid #f5e5e5; }
    .notif.alert { border-color:#e5393530; background:#fffbfb; }
    .notif.info  { border-color:#42a5f530; background:#fafcff; }

    .overlay { position:fixed; inset:0; background:#0006; z-index:100; display:flex; align-items:center; justify-content:center; animation:fadeIn .2s ease; }
    .modal   { background:#fff; border-radius:24px; padding:32px; max-width:420px; width:90%; box-shadow:0 20px 60px #0002; animation:fadeUp .3s ease; }

    @media (max-width:768px) {
      .desktop-sidebar { display:none !important; }
      .mobile-nav { display:flex !important; }
    }
    @media (min-width:769px) {
      .mobile-nav { display:none !important; }
    }
  `}</style>
);

/* ── Lookup maps ───────────────────────────────────────────────────────── */
const BLOOD_DISPLAY = {
  A_POSITIVE:"A+", A_NEGATIVE:"A-", B_POSITIVE:"B+", B_NEGATIVE:"B-",
  AB_POSITIVE:"AB+", AB_NEGATIVE:"AB-", O_POSITIVE:"O+", O_NEGATIVE:"O-",
};
const GENDER_DISPLAY = { MALE:"Male", FEMALE:"Female", OTHER:"Other" };

const BLOOD_TO_ENUM = {
  "A+":"A_POSITIVE","A-":"A_NEGATIVE","B+":"B_POSITIVE","B-":"B_NEGATIVE",
  "AB+":"AB_POSITIVE","AB-":"AB_NEGATIVE","O+":"O_POSITIVE","O-":"O_NEGATIVE",
};
const GENDER_TO_ENUM = { "Male":"MALE","Female":"FEMALE","Other":"OTHER","Prefer not to say":"OTHER" };

function normalizeDonor(d) {
  return {
    name:           d.fullName,
    blood:          BLOOD_DISPLAY[d.bloodGroup] || d.bloodGroup,
    city:           d.city        || "",
    state:          d.state       || "",
    phone:          d.phone       || "",
    email:          d.email       || "",
    dob:            d.dateOfBirth || "",
    gender:         GENDER_DISPLAY[d.gender] || d.gender || "",
    weight:         d.weight != null ? String(d.weight) : "",
    pincode:        d.pincode     || "",
    lastDonation:   d.lastDonationDate || null,
    totalDonations: d.totalDonations   || 0,
    available:      d.available,
  };
}

// REQUESTS array removed — now loaded from backend via getDonorNotifications

/* ── Icons ─────────────────────────────────────────────────────────────── */
const I = {
  home:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17}}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  profile:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17}}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  requests: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17}}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17}}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  drop:     <svg viewBox="0 0 24 24" fill="currentColor" style={{width:17,height:17}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8l5 5-3 3z"/></svg>,
  phone:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M22 16.92v3a2 2 0 01-2.18 2A19.8 19.8 0 013.07 9.81 19.8 19.8 0 012 2.18 2 2 0 014 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92v2z"/></svg>,
  loc:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  cal:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  bell:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17}}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><polyline points="20,6 9,17 4,12"/></svg>,
  edit:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  search:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  filter:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/></svg>,
  drop2:    <svg viewBox="0 0 24 24" fill="currentColor" style={{width:13,height:13}}><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
};

/* ── Helpers ───────────────────────────────────────────────────────────── */
function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}
function formatDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  const date = dt.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  const time = dt.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
  return `${date}, ${time}`;
}
function isEligible(lastDonation) { return daysSince(lastDonation) >= 90; }

const URGENCY = {
  critical: { label:"Critical", cls:"badge-red",   cardCls:"critical" },
  urgent:   { label:"Urgent",   cls:"badge-amber",  cardCls:"urgent" },
  normal:   { label:"Normal",   cls:"badge-green",  cardCls:"normal" },
};

/* ── SIDEBAR ────────────────────────────────────────────────────────── */
function Sidebar({ active, setActive, onLogout, donor }) {
  const nav = [
    { key:"home",     label:"Dashboard",         icon:I.home },
    { key:"profile",  label:"My Profile",        icon:I.profile },
    { key:"requests", label:"Donation Requests",  icon:I.requests },
    { key:"settings", label:"Settings",           icon:I.settings },
  ];
  return (
    <aside style={{ width:228, flexShrink:0, background:"#fff", borderRight:"1px solid #f5e5e5", height:"100vh", position:"sticky", top:0, display:"flex", flexDirection:"column", padding:"24px 14px" }} className="desktop-sidebar">
      {/* Brand */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 6px", marginBottom:28 }}>
        <div style={{ width:34, height:34, background:"linear-gradient(135deg,#c62828,#e53935)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0, boxShadow:"0 4px 12px #c6282840" }}>🩸</div>
        <div>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:17, fontWeight:700, color:"#c62828", letterSpacing:".3px", lineHeight:1.1 }}>Blood Bridge</div>
          <div style={{ fontSize:9.5, color:"#b8a0a0", fontWeight:500, letterSpacing:".5px", textTransform:"uppercase" }}>Donor Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
        {nav.map(n => (
          <button key={n.key} className={`sidebar-item${active===n.key?" active":""}`} onClick={() => setActive(n.key)}>
            {n.icon} {n.label}
          </button>
        ))}
      </nav>

      {/* Donor quick info */}
      <div style={{ background:"#fdf8f8", borderRadius:14, padding:"12px 14px", marginBottom:14, border:"1px solid #f0dede" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#c62828,#e53935)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14, flexShrink:0 }}>
            {donor.name.split(" ").map(w=>w[0]).join("")}
          </div>
          <div>
            <div style={{ fontSize:12.5, fontWeight:600, color:"#3d2c2c" }}>{donor.name}</div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:11.5, fontWeight:800, color:"#c62828" }}>{donor.blood}</span>
              <span style={{ fontSize:10, color:"#b8a0a0" }}>· {donor.city}</span>
            </div>
          </div>
        </div>
      </div>

      <button className="sidebar-item" onClick={onLogout} style={{ color:"#c62828", background:"#fff5f5", border:"1.5px solid #ffcdd2" }}>
        {I.logout} Logout
      </button>
    </aside>
  );
}

/* ── MOBILE NAV ─────────────────────────────────────────────────────── */
function MobileNav({ active, setActive }) {
  const nav = [
    { key:"home", icon:I.home },
    { key:"profile", icon:I.profile },
    { key:"requests", icon:I.requests },
    { key:"settings", icon:I.settings },
  ];
  return (
    <div className="mobile-nav" style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid #f5e5e5", zIndex:50, justifyContent:"space-around", padding:"10px 0 14px", boxShadow:"0 -4px 20px #c6282812" }}>
      {nav.map(n => (
        <button key={n.key} onClick={() => setActive(n.key)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"transparent", border:"none", cursor:"pointer", color: active===n.key?"#c62828":"#b8a0a0", padding:"4px 12px", borderRadius:10, transition:"all .2s" }}>
          <div style={{ transform: active===n.key ? "scale(1.2)" : "scale(1)", transition:"transform .2s" }}>{n.icon}</div>
          <span style={{ fontSize:9, fontWeight:600, letterSpacing:".3px", textTransform:"capitalize" }}>{n.key}</span>
        </button>
      ))}
    </div>
  );
}

/* ── TOPBAR ─────────────────────────────────────────────────────────── */
function TopBar({ page, onLogout, pendingCount, notifications, onRespond, onViewAll }) {
  const [showDrop,   setShowDrop]   = useState(false);
  const [responding, setResponding] = useState(null);
  const pending = (notifications || []).filter(n => n.status === "PENDING").slice(0, 5);

  async function handleClick(id, action) {
    setResponding(id + action);
    await onRespond(id, action);
    setResponding(null);
  }

  return (
    <header style={{ background:"#fff", borderBottom:"1px solid #f5e5e5", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40, backdropFilter:"blur(8px)" }}>
      <div>
        <div style={{ fontSize:18, fontWeight:700, color:"#3d2c2c", fontFamily:"'Crimson Pro',serif", letterSpacing:".2px", textTransform:"capitalize" }}>
          {page === "home" ? "Dashboard" : page === "requests" ? "Donation Requests" : page.charAt(0).toUpperCase()+page.slice(1)}
        </div>
        <div style={{ fontSize:11, color:"#b8a0a0", marginTop:1 }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>

        {/* Bell + dropdown */}
        <div style={{ position:"relative" }}>
          <button
            onClick={() => setShowDrop(v => !v)}
            style={{ position:"relative", background: showDrop ? "#fff0f0" : "#fdf8f8", border:"1.5px solid #f0dede", borderRadius:11, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#8d6e6e" }}
          >
            {I.bell}
            {pendingCount > 0 && (
              <span style={{ position:"absolute", top:7, right:7, width:7, height:7, background:"#e53935", borderRadius:"50%", border:"1.5px solid #fff" }}>
                <span className="ping" style={{ position:"absolute", inset:0, background:"#e53935", borderRadius:"50%", display:"block" }} />
              </span>
            )}
          </button>

          {showDrop && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:99 }} onClick={() => setShowDrop(false)} />
              <div className="fi" style={{ position:"absolute", right:0, top:46, width:320, background:"#fff", borderRadius:16, border:"1.5px solid #f5e5e5", boxShadow:"0 16px 48px #00000018", zIndex:100, overflow:"hidden" }}>
                {/* Header */}
                <div style={{ padding:"14px 16px", borderBottom:"1px solid #f5eded", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#2d1f1f", display:"flex", alignItems:"center", gap:6 }}>{I.bell} Notifications</span>
                  {pendingCount > 0 && <span className="badge badge-red">{pendingCount} new</span>}
                </div>

                {/* Items */}
                {pending.length === 0 ? (
                  <div style={{ padding:"28px 16px", textAlign:"center", color:"#b8a0a0" }}>
                    <div style={{ fontSize:26, marginBottom:6 }}>🩺</div>
                    <div style={{ fontSize:12.5, fontWeight:500 }}>No pending requests</div>
                  </div>
                ) : (
                  <div>
                    {pending.map(n => {
                      const blood = BLOOD_DISPLAY[n.bloodGroup] || n.bloodGroup;
                      const urg   = URGENCY_MAP[n.urgency] || URGENCY_MAP.NORMAL;
                      const key   = n.id;
                      return (
                        <div key={key} style={{ padding:"11px 14px", borderBottom:"1px solid #f5eded", display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#c62828,#e53935)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:12, flexShrink:0 }}>
                            {blood}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12.5, fontWeight:600, color:"#2d1f1f", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Hospital in {n.hospitalCity}</div>
                            <div style={{ fontSize:11, color:"#9e8080", marginTop:1 }}>
                              <span className={`badge ${urg.cls}`} style={{ fontSize:10, padding:"2px 7px" }}>{urg.label}</span>
                            </div>
                          </div>
                          <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                            <button
                              style={{ width:28, height:28, border:"1.5px solid #e0d0d0", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:13, color:"#9e8080", display:"flex", alignItems:"center", justifyContent:"center" }}
                              disabled={!!responding}
                              onClick={() => handleClick(n.id, "DECLINE")}
                              title="Decline"
                            >✗</button>
                            <button
                              style={{ width:28, height:28, border:"none", borderRadius:8, background:"linear-gradient(135deg,#c62828,#e53935)", cursor:"pointer", fontSize:13, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px #c6282830" }}
                              disabled={!!responding}
                              onClick={() => handleClick(n.id, "ACCEPT")}
                              title="Accept"
                            >{responding === n.id+"ACCEPT" ? "…" : "✓"}</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                <div style={{ padding:"11px 14px", borderTop:"1px solid #f5eded" }}>
                  <button
                    className="btn-outline"
                    style={{ width:"100%", fontSize:12, padding:"8px" }}
                    onClick={() => { setShowDrop(false); onViewAll(); }}
                  >
                    View all requests →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={onLogout} style={{ background:"#fff5f5", border:"1.5px solid #ffcdd2", borderRadius:11, padding:"7px 14px", fontSize:12, fontWeight:600, color:"#c62828", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"'Sora',sans-serif" }} className="mobile-nav">
          {I.logout} Logout
        </button>
      </div>
    </header>
  );
}

/* ── HOME PAGE ──────────────────────────────────────────────────────── */
function HomePage({ setPage, donor, pendingCount }) {
  const eligible = isEligible(donor.lastDonation);
  const days = daysSince(donor.lastDonation);
  const daysLeft = Math.max(0, 90 - days);
  const urgentNearby = pendingCount;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      {/* Welcome */}
      <div className="fu" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:"#b8a0a0", textTransform:"uppercase", letterSpacing:".8px", marginBottom:4 }}>Good to see you 👋</div>
          <h1 style={{ margin:0, fontSize:26, fontWeight:700, fontFamily:"'Crimson Pro',serif", color:"#2d1f1f", letterSpacing:".2px" }}>Welcome, {donor.name.split(" ")[0]}</h1>
          <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:8 }}>
            <span className="badge badge-blood">{donor.blood}</span>
            <span style={{ fontSize:12.5, color:"#9e8080", display:"flex", alignItems:"center", gap:4 }}>{I.loc}{donor.city}, {donor.state}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(eligible || urgentNearby > 0) && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }} className="fu delay-1">
          {eligible && (
            <div className="notif alert">
              <span style={{ fontSize:20, flexShrink:0 }}>✅</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#2e7d32" }}>You are eligible to donate!</div>
                <div style={{ fontSize:11.5, color:"#6e9e72", marginTop:2 }}>It has been {days} days since your last donation. Minimum gap is 90 days.</div>
              </div>
            </div>
          )}
          {urgentNearby > 0 && (
            <div className="notif alert">
              <span style={{ fontSize:20, flexShrink:0 }}>🚨</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#c62828" }}>{urgentNearby} urgent request{urgentNearby>1?"s":""} near you</div>
                <div style={{ fontSize:11.5, color:"#b8a0a0", marginTop:2 }}>
                  Patients nearby need your blood group.{" "}
                  <span style={{ color:"#c62828", cursor:"pointer", fontWeight:600 }} onClick={() => setPage("requests")}>View requests →</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:14 }}>
        {[
          {
            icon:"🩸", label:"Total Donations", value:donor.totalDonations,
            sub:"lifetime donations", color:"#c62828", bg:"#fff5f5", delay:"delay-1"
          },
          {
            icon:"📅", label:"Last Donation", value:donor.lastDonation ? formatDate(donor.lastDonation) : "Never",
            sub: donor.lastDonation ? `${days} days ago` : "First time donor", color:"#6d4c41", bg:"#fdf8f5", delay:"delay-2"
          },
          {
            icon: eligible ? "✅" : "⏳",
            label:"Eligibility",
            value: eligible ? "Eligible" : "Not yet",
            sub: eligible ? "Ready to donate!" : `${daysLeft} days left`,
            color: eligible ? "#2e7d32" : "#f57f17",
            bg: eligible ? "#f1f8f1" : "#fffde7",
            delay:"delay-3"
          },
        ].map(c => (
          <div key={c.label} className={`stat-card fu ${c.delay}`} style={{ background:c.bg }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{c.icon}</div>
            <div style={{ fontSize:11, fontWeight:600, color:"#9e8080", textTransform:"uppercase", letterSpacing:".5px", marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:c.color, fontFamily:"'Crimson Pro',serif" }}>{c.value}</div>
            <div style={{ fontSize:11, color:"#b8a0a0", marginTop:2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Eligibility bar */}
      <div className="card fu delay-3">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:600, color:"#3d2c2c" }}>Donation Eligibility Progress</span>
          <span style={{ fontSize:12, color: eligible?"#2e7d32":"#f57f17", fontWeight:600 }}>
            {eligible ? "✅ Ready!" : donor.lastDonation ? `${daysLeft} days to go` : "First time donor — eligible!"}
          </span>
        </div>
        <div style={{ background:"#f5e5e5", borderRadius:999, height:8, overflow:"hidden" }}>
          <div style={{ width:`${Math.min(100,(days/90)*100)}%`, height:"100%", background: days>=90?"linear-gradient(90deg,#66bb6a,#43a047)":"linear-gradient(90deg,#e53935,#ef9a9a)", borderRadius:999, transition:"width .7s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10.5, color:"#b8a0a0" }}>
          <span>Last donation: {donor.lastDonation ? formatDate(donor.lastDonation) : "Never"}</span>
          <span>90-day requirement</span>
        </div>
      </div>

      {/* Pending requests preview */}
      <div className="card fu delay-4">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontSize:14, fontWeight:700, color:"#3d2c2c", fontFamily:"'Crimson Pro',serif" }}>New Requests For You</span>
          <button className="btn-outline" style={{ padding:"6px 14px", fontSize:12 }} onClick={() => setPage("requests")}>View all</button>
        </div>
        {urgentNearby === 0 ? (
          <div style={{ textAlign:"center", padding:"20px 0", color:"#b8a0a0" }}>
            <div style={{ fontSize:28, marginBottom:6 }}>🩺</div>
            <div style={{ fontSize:13, fontWeight:500 }}>No pending requests right now</div>
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"14px 0" }}>
            <div style={{ fontSize:28, marginBottom:6 }}>🚨</div>
            <div style={{ fontSize:13, fontWeight:600, color:"#c62828" }}>{urgentNearby} pending request{urgentNearby>1?"s":""} waiting for you</div>
            <button className="btn-red" style={{ marginTop:12, padding:"8px 20px", fontSize:12 }} onClick={()=>setPage("requests")}>Respond Now →</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PROFILE FIELD (defined outside to avoid remount on every keystroke) ── */
function ProfileField({ label, icon, id, type="text", children, error, form, setForm, editing, setErrors }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:10.5, fontWeight:700, color:"#9e8080", textTransform:"uppercase", letterSpacing:".6px" }}>{label}</label>
      {children ? (
        editing ? children : <div style={{ fontSize:13.5, color:"#3d2c2c", fontWeight:500, padding:"9px 0" }}>{form[id] || "—"}</div>
      ) : editing ? (
        <div style={{ position:"relative" }}>
          {icon && <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#c8a0a0", pointerEvents:"none" }}>{icon}</span>}
          <input
            type={type}
            className={icon ? "inp" : "inp-plain"}
            value={form[id] || ""}
            maxLength={id === "phone" || id === "pincode" ? 10 : undefined}
            onChange={e => {
              const val = id === "phone" || id === "pincode"
                ? e.target.value.replace(/\D/g, "")
                : e.target.value;
              setForm(f => ({ ...f, [id]: val }));
              setErrors(er => ({ ...er, [id]: "" }));
            }}
          />
        </div>
      ) : (
        <div style={{ fontSize:13.5, color:"#3d2c2c", fontWeight:500, padding:"9px 0" }}>{form[id] || "—"}</div>
      )}
      {error && <span style={{ fontSize:11, color:"#e53935", fontWeight:500 }}>⚠ {error}</span>}
    </div>
  );
}

/* ── PROFILE PAGE ───────────────────────────────────────────────────── */
function ProfilePage({ donor, onProfileUpdated }) {
  const [form, setForm]         = useState({ ...donor });
  const [editing, setEditing]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");
  const [errors, setErrors]     = useState({});
  const [neverDonated, setNeverDonated] = useState(!donor.lastDonation);

  const bloodGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
  const genders     = ["Male","Female","Other","Prefer not to say"];
  const states      = ["Bihar","Delhi","Maharashtra","Uttar Pradesh","West Bengal","Tamil Nadu","Karnataka","Gujarat","Rajasthan","Madhya Pradesh"];

  function validate() {
    const e = {};
    if (!form.name?.trim())                             e.name="Name is required";
    if (!form.phone || !/^\d{10}$/.test(form.phone))   e.phone="Valid 10-digit number required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email="Valid email required";
    if (!form.weight || isNaN(form.weight) || form.weight<40) e.weight="Weight must be ≥ 40 kg";
    if (!form.pincode || form.pincode.length!==6)       e.pincode="6-digit pincode required";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    try {
      const token = localStorage.getItem("bb_token");
      const body = {
        fullName:        form.name,
        dateOfBirth:     form.dob,
        gender:          GENDER_TO_ENUM[form.gender] || form.gender,
        bloodGroup:      BLOOD_TO_ENUM[form.blood]   || form.blood,
        weight:          Number(form.weight),
        lastDonationDate: neverDonated ? null : (form.lastDonation || null),
        city:            form.city,
        state:           form.state,
        pincode:         form.pincode,
        phone:           form.phone,
      };
      const updated = await updateDonorProfile(token, body);
      onProfileUpdated(normalizeDonor(updated));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const fp = { form, setForm, editing, setErrors };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Header */}
      <div className="fu" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:58, height:58, background:"linear-gradient(135deg,#c62828,#e53935)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:22, boxShadow:"0 6px 20px #c6282840" }}>
            {donor.name.split(" ").map(w=>w[0]).join("")}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Crimson Pro',serif", color:"#2d1f1f" }}>{donor.name}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
              <span className="badge badge-blood" style={{ fontSize:12 }}>{donor.blood}</span>
              <span className={`badge ${isEligible(donor.lastDonation)?"badge-green":"badge-amber"}`}>
                {isEligible(donor.lastDonation)?"✓ Eligible":"Not eligible"}
              </span>
            </div>
          </div>
        </div>
        {!editing
          ? <button className="btn-outline" onClick={()=>setEditing(true)} style={{ display:"flex", alignItems:"center", gap:6 }}>{I.edit} Edit Profile</button>
          : <div style={{ display:"flex", gap:10 }}>
              <button className="btn-outline" disabled={saving} onClick={()=>{setEditing(false);setForm({...donor});setErrors({});setSaveError("");}}>Cancel</button>
              <button className="btn-red" onClick={save} disabled={saving} style={{ display:"flex", alignItems:"center", gap:6 }}>
                {saving ? <><svg style={{width:14,height:14,animation:"spin .7s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/><path opacity=".75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg> Saving…</> : <>{I.check} Save Changes</>}
              </button>
            </div>
        }
      </div>

      {saved     && <div className="fu" style={{ background:"#e8f5e9", border:"1.5px solid #a5d6a7", borderRadius:12, padding:"12px 16px", fontSize:13, color:"#2e7d32", fontWeight:600 }}>✅ Profile updated successfully!</div>}
      {saveError && <div className="fu" style={{ background:"#ffebee", border:"1.5px solid #ef9a9a", borderRadius:12, padding:"12px 16px", fontSize:13, color:"#c62828", fontWeight:500 }}>⚠ {saveError}</div>}

      {/* Personal */}
      <div className="card fu delay-1">
        <div style={{ fontSize:14, fontWeight:700, color:"#3d2c2c", marginBottom:16, fontFamily:"'Crimson Pro',serif", display:"flex", alignItems:"center", gap:7 }}>👤 Personal Information</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16 }}>
          <ProfileField {...fp} label="Full Name" icon="🧑" id="name" error={errors.name} />
          <ProfileField {...fp} label="Date of Birth" icon="🎂" id="dob" type="date" />
          <ProfileField {...fp} label="Gender" id="gender">
            {editing && <select className="inp-plain" value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} style={{ paddingLeft:14 }}>
              {genders.map(g=><option key={g}>{g}</option>)}
            </select>}
          </ProfileField>
          <ProfileField {...fp} label="Weight (kg)" icon="⚖️" id="weight" type="number" error={errors.weight} />
          <ProfileField {...fp} label="Blood Group" id="blood">
            {editing && <select className="inp-plain" value={form.blood} onChange={e=>setForm(f=>({...f,blood:e.target.value}))} style={{ paddingLeft:14 }}>
              {bloodGroups.map(b=><option key={b}>{b}</option>)}
            </select>}
          </ProfileField>
        </div>
      </div>

      {/* Contact */}
      <div className="card fu delay-2">
        <div style={{ fontSize:14, fontWeight:700, color:"#3d2c2c", marginBottom:16, fontFamily:"'Crimson Pro',serif" }}>📞 Contact Details</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
          <ProfileField {...fp} label="Phone Number" icon="📱" id="phone" error={errors.phone} />
          <ProfileField {...fp} label="Email Address" icon="✉️" id="email" error={errors.email} />
        </div>
      </div>

      {/* Location */}
      <div className="card fu delay-3">
        <div style={{ fontSize:14, fontWeight:700, color:"#3d2c2c", marginBottom:16, fontFamily:"'Crimson Pro',serif" }}>📍 Location</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:16 }}>
          <ProfileField {...fp} label="City" icon="🏙️" id="city" />
          <ProfileField {...fp} label="State" id="state">
            {editing && <select className="inp-plain" value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))} style={{ paddingLeft:14 }}>
              {states.map(s=><option key={s}>{s}</option>)}
            </select>}
          </ProfileField>
          <ProfileField {...fp} label="Pincode" icon="🔢" id="pincode" error={errors.pincode} />
        </div>
        {/* Map placeholder */}
        <div style={{ borderRadius:14, overflow:"hidden", border:"1.5px solid #f0dede", height:120, background:"linear-gradient(135deg,#fdf0f0,#fff5f5)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, opacity:.07, backgroundImage:"repeating-linear-gradient(0deg,#c62828 0,#c62828 1px,transparent 1px,transparent 36px),repeating-linear-gradient(90deg,#c62828 0,#c62828 1px,transparent 1px,transparent 36px)" }} />
          <div style={{ textAlign:"center", zIndex:1 }}>
            <div style={{ fontSize:28 }}>🗺️</div>
            <div style={{ fontSize:12, color:"#c62828", fontWeight:600, marginTop:4 }}>{form.city}, {form.state}</div>
            <div style={{ fontSize:10.5, color:"#b8a0a0" }}>PIN: {form.pincode}</div>
          </div>
        </div>
      </div>

      {/* Donation */}
      <div className="card fu delay-4">
        <div style={{ fontSize:14, fontWeight:700, color:"#3d2c2c", marginBottom:16, fontFamily:"'Crimson Pro',serif" }}>🩸 Donation Record</div>
        <div style={{ cursor:editing?"pointer":"default", display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          {editing && (
            <div style={{ width:18, height:18, borderRadius:5, border:"2px solid", borderColor:neverDonated?"#c62828":"#ddd", background:neverDonated?"#c62828":"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer" }} onClick={()=>setNeverDonated(v=>!v)}>
              {neverDonated && <span style={{ color:"#fff", fontSize:10, fontWeight:900 }}>✓</span>}
            </div>
          )}
          <span style={{ fontSize:13, color:"#9e8080" }}>I have never donated before</span>
        </div>
        {!neverDonated && <ProfileField {...fp} label="Last Donation Date" icon="📅" id="lastDonation" type="date" />}
      </div>
    </div>
  );
}

/* ── NOTIF MAP ──────────────────────────────────────────────────────── */
function NotifMap({ lat, lng, isApprox }) {
  const divRef = useRef(null);

  useEffect(() => {
    if (!divRef.current || lat == null || lng == null) return;

    // Inject Leaflet CSS once
    if (!document.getElementById("leaflet-css-portal")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css-portal";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const map = L.map(divRef.current, { zoomControl: true, attributionControl: false })
      .setView([lat, lng], isApprox ? 13 : 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    if (isApprox) {
      L.circle([lat, lng], {
        radius: 1500,
        color: "#c62828",
        fillColor: "#e53935",
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "6 4",
      }).addTo(map);
      L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="width:14px;height:14px;background:#c62828;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(198,40,40,.5)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          className: "",
        }),
      }).addTo(map).bindPopup("Approximate area").openPopup();
    } else {
      const icon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#c62828;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 10px rgba(198,40,40,.6)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: "",
      });
      L.marker([lat, lng], { icon }).addTo(map).bindPopup("Hospital Location").openPopup();
    }

    return () => { map.remove(); };
  }, [lat, lng, isApprox]);

  if (lat == null || lng == null) return (
    <div style={{ height: 180, borderRadius: 12, background: "#f5eded", display: "flex", alignItems: "center", justifyContent: "center", color: "#b8a0a0", fontSize: 12 }}>
      📍 Location not available
    </div>
  );

  return <div ref={divRef} style={{ height: 200, borderRadius: 12, overflow: "hidden", border: "1.5px solid #f0dede" }} />;
}

/* ── REQUESTS PAGE ──────────────────────────────────────────────────── */
const URGENCY_MAP = {
  CRITICAL: { label:"Critical", cls:"badge-red",   cardCls:"critical" },
  URGENT:   { label:"Urgent",   cls:"badge-amber",  cardCls:"urgent" },
  NORMAL:   { label:"Normal",   cls:"badge-green",  cardCls:"normal" },
};

function RequestsPage({ notifications = [], onRespond }) {
  const [tab,        setTab]        = useState("PENDING");
  const [responding, setResponding] = useState(null);
  const [filter,     setFilter]     = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  async function respond(id, action) {
    setResponding(id);
    try {
      await onRespond(id, action);
    } finally {
      setResponding(null);
    }
  }

  const tabs = [
    { key:"PENDING",  label:"New Requests" },
    { key:"ACCEPTED", label:"Accepted" },
    { key:"DECLINED", label:"Declined" },
  ];

  const list = notifications.filter(n => {
    const matchTab    = n.status === tab;
    const matchFilter = filter === "all" || n.urgency === filter.toUpperCase();
    return matchTab && matchFilter;
  });

  const pendingCount = notifications.filter(n => n.status === "PENDING").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* Tabs */}
      <div className="fu" style={{ background:"#f5eded", borderRadius:14, padding:5, display:"inline-flex", gap:4 }}>
        {tabs.map(t => (
          <button key={t.key} className={`tab${tab===t.key?" active":""}`} onClick={()=>setTab(t.key)}>
            {t.label}
            {t.key==="PENDING" && pendingCount > 0 && (
              <span style={{ marginLeft:6, background:"#c62828", color:"#fff", borderRadius:999, fontSize:10, fontWeight:700, padding:"1px 6px" }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="fu delay-1" style={{ display:"flex", gap:10 }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#c8a0a0" }}>{I.filter}</span>
          <select className="inp" style={{ paddingLeft:34, minWidth:140, cursor:"pointer" }} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All urgency</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      {list.length === 0 ? (
        <div className="card fu" style={{ textAlign:"center", padding:"40px 20px", color:"#b8a0a0" }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🩺</div>
          <div style={{ fontSize:15, fontWeight:600, color:"#9e8080" }}>
            {tab === "PENDING" ? "No new requests for you right now" : `No ${tab.toLowerCase()} requests`}
          </div>
          <div style={{ fontSize:12.5, marginTop:4 }}>Check back soon — you'll be notified when a matching request comes in.</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {list.map((n, i) => {
            const urg        = URGENCY_MAP[n.urgency] || URGENCY_MAP.NORMAL;
            const blood      = BLOOD_DISPLAY[n.bloodGroup] || n.bloodGroup;
            const isResponding = responding === n.id;
            const isExpanded = expandedId === n.id;

            const urgencyDesc = {
              CRITICAL: "Immediate life-threatening situation — please respond ASAP.",
              URGENT:   "Patient needs blood within a few hours.",
              NORMAL:   "Scheduled or non-emergency donation request.",
            }[n.urgency] || "";

            return (
              <div key={n.id} className={`request-card ${urg.cardCls} fu`} style={{ animationDelay:`${i*0.06}s`, padding:0, overflow:"hidden" }}>

                {/* ── Card header row ── */}
                <div
                  style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap", padding:"16px 18px", cursor:"pointer" }}
                  onClick={() => setExpandedId(isExpanded ? null : n.id)}
                >
                  {/* Left */}
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:46, height:46, background:"linear-gradient(135deg,#c62828,#e53935)", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:15, flexShrink:0, boxShadow:"0 4px 12px #c6282840" }}>
                      {blood}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:"#2d1f1f" }}>
                        {n.status === "ACCEPTED" ? n.hospitalName : `Hospital in ${n.hospitalCity}`}
                      </div>
                      <div style={{ fontSize:11.5, color:"#9e8080", marginTop:3, display:"flex", flexWrap:"wrap", gap:8 }}>
                        <span style={{ display:"flex", alignItems:"center", gap:3 }}>{I.loc}{n.hospitalCity}</span>
                        {n.distanceKm != null && <span style={{ display:"flex", alignItems:"center", gap:3 }}>~{n.distanceKm} km away</span>}
                        <span style={{ display:"flex", alignItems:"center", gap:3 }}>{I.cal}{formatDateTime(n.sentAt)}</span>
                      </div>
                      {n.status === "ACCEPTED" && n.hospitalStreet && (
                        <div style={{ fontSize:11, color:"#9e8080", marginTop:2 }}>{n.hospitalStreet}{n.hospitalArea ? `, ${n.hospitalArea}` : ""}</div>
                      )}
                      {n.status === "ACCEPTED" && (n.contactPhone1 || n.contactPhone2) && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:5 }}>
                          {n.contactPhone1 && (
                            <a href={`tel:${n.contactPhone1}`} onClick={e=>e.stopPropagation()} style={{ display:"flex", alignItems:"center", gap:5, background:"#e8f5e9", border:"1px solid #a5d6a7", borderRadius:8, padding:"4px 10px", textDecoration:"none" }}>
                              <span style={{ fontSize:12 }}>📞</span>
                              <span style={{ fontSize:12, fontWeight:700, color:"#2e7d32" }}>{n.contactPhone1}</span>
                            </a>
                          )}
                          {n.contactPhone2 && (
                            <a href={`tel:${n.contactPhone2}`} onClick={e=>e.stopPropagation()} style={{ display:"flex", alignItems:"center", gap:5, background:"#e3f2fd", border:"1px solid #90caf9", borderRadius:8, padding:"4px 10px", textDecoration:"none" }}>
                              <span style={{ fontSize:12 }}>📞</span>
                              <span style={{ fontSize:12, fontWeight:700, color:"#1565c0" }}>{n.contactPhone2}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Right */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }} onClick={e=>e.stopPropagation()}>
                    <span className={`badge ${urg.cls}`}>{urg.label}</span>
                    <span style={{ fontSize:16, color:"#b8a0a0", cursor:"pointer", padding:"0 4px" }} onClick={()=>setExpandedId(isExpanded?null:n.id)}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                    {n.status === "PENDING" && (
                      <>
                        <button className="btn-outline" style={{ padding:"7px 14px", fontSize:12 }} disabled={isResponding} onClick={()=>respond(n.id,"DECLINE")}>Decline</button>
                        <button className="btn-red"     style={{ padding:"8px 16px", fontSize:12 }} disabled={isResponding} onClick={()=>respond(n.id,"ACCEPT")}>{isResponding?"…":"Accept"}</button>
                      </>
                    )}
                    {n.status === "ACCEPTED" && n.hospitalLat && n.hospitalLng && (
                      <a href={`https://www.openstreetmap.org/?mlat=${n.hospitalLat}&mlon=${n.hospitalLng}&zoom=16`} target="_blank" rel="noopener noreferrer" className="btn-red" style={{ padding:"8px 16px", fontSize:12, display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
                        {I.loc} View Map
                      </a>
                    )}
                    {n.status === "ACCEPTED" && <span className="badge badge-green">✓ Accepted</span>}
                    {n.status === "DECLINED" && <span className="badge badge-gray">Declined</span>}
                  </div>
                </div>

                {/* ── Expanded detail panel ── */}
                {isExpanded && (
                  <div className="fi" style={{ borderTop:"1px solid #f5eded", padding:"18px 18px 20px", background:"#fdf9f9", display:"flex", flexDirection:"column", gap:16 }}>

                    {/* Map */}
                    <NotifMap lat={n.hospitalLat} lng={n.hospitalLng} isApprox={false} />

                    {/* Key stats */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>
                      {[
                        { icon:"🩸", label:"Blood Group", value: blood },
                        { icon:"⚠️", label:"Urgency",     value: urg.label },
                        { icon:"💧", label:"Units Needed", value: n.units != null ? `${n.units} unit${n.units>1?"s":""}` : "—" },
                        { icon:"👥", label:"Donors Needed", value: n.donorsNeeded != null ? `${n.donorsNeeded} donor${n.donorsNeeded>1?"s":""}` : "—" },
                        ...(n.distanceKm != null ? [{ icon:"📍", label:"Distance", value:`~${n.distanceKm} km` }] : []),
                      ].map(s => (
                        <div key={s.label} style={{ background:"#fff", borderRadius:12, border:"1px solid #f0dede", padding:"10px 12px" }}>
                          <div style={{ fontSize:16, marginBottom:4 }}>{s.icon}</div>
                          <div style={{ fontSize:10, fontWeight:600, color:"#b8a0a0", textTransform:"uppercase", letterSpacing:".4px", marginBottom:2 }}>{s.label}</div>
                          <div style={{ fontSize:13.5, fontWeight:700, color:"#2d1f1f" }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Urgency description */}
                    {urgencyDesc && (
                      <div style={{ background: n.urgency==="CRITICAL"?"#fff5f5": n.urgency==="URGENT"?"#fffde7":"#f1f8f1", borderRadius:10, padding:"10px 14px", fontSize:12.5, color:"#5d4037", border:"1px solid", borderColor: n.urgency==="CRITICAL"?"#ffcdd2":n.urgency==="URGENT"?"#fff9c4":"#c8e6c9", display:"flex", gap:8, alignItems:"flex-start" }}>
                        <span style={{ fontSize:16, flexShrink:0 }}>{n.urgency==="CRITICAL"?"🚨":n.urgency==="URGENT"?"⚡":"ℹ️"}</span>
                        <span>{urgencyDesc}</span>
                      </div>
                    )}

                    {/* Eligibility checklist */}
                    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0dede", padding:"14px 16px" }}>
                      <div style={{ fontSize:12.5, fontWeight:700, color:"#3d2c2c", marginBottom:10 }}>✅ Before you accept, make sure you:</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                        {[
                          "Are between 18 and 65 years old",
                          "Weigh at least 50 kg",
                          "Have not donated blood in the last 90 days",
                          "Are not currently sick, feverish, or on antibiotics",
                          "Have eaten a light meal and are well hydrated",
                          "Can travel to the hospital within a reasonable time",
                        ].map(item => (
                          <div key={item} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12.5, color:"#5d4037" }}>
                            <span style={{ width:18, height:18, background:"#e8f5e9", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#2e7d32", flexShrink:0, fontWeight:700 }}>✓</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hospital notes */}
                    {n.notes && n.notes.trim() && (
                      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0dede", padding:"12px 14px" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#b8a0a0", textTransform:"uppercase", letterSpacing:".4px", marginBottom:6 }}>📝 Hospital Note</div>
                        <div style={{ fontSize:13, color:"#5d4037", lineHeight:1.5 }}>{n.notes}</div>
                      </div>
                    )}

                    {/* Contact phones — shown only when ACCEPTED */}
                    {n.status === "ACCEPTED" && (n.contactPhone1 || n.contactPhone2) && (
                      <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:12, padding:"14px 16px" }}>
                        <div style={{ fontSize:12.5, fontWeight:700, color:"#15803d", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                          📞 Hospital Contact Numbers
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {n.contactPhone1 && (
                            <a href={`tel:${n.contactPhone1}`} style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
                              <div style={{ width:34, height:34, background:"linear-gradient(135deg,#16a34a,#22c55e)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                {I.phone}
                              </div>
                              <div>
                                <div style={{ fontSize:10.5, fontWeight:600, color:"#64748b", letterSpacing:".4px", textTransform:"uppercase" }}>Primary</div>
                                <div style={{ fontSize:14, fontWeight:700, color:"#15803d" }}>{n.contactPhone1}</div>
                              </div>
                            </a>
                          )}
                          {n.contactPhone2 && (
                            <a href={`tel:${n.contactPhone2}`} style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
                              <div style={{ width:34, height:34, background:"linear-gradient(135deg,#0891b2,#06b6d4)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                {I.phone}
                              </div>
                              <div>
                                <div style={{ fontSize:10.5, fontWeight:600, color:"#64748b", letterSpacing:".4px", textTransform:"uppercase" }}>Secondary</div>
                                <div style={{ fontSize:14, fontWeight:700, color:"#0e7490" }}>{n.contactPhone2}</div>
                              </div>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons at bottom of detail */}
                    {n.status === "PENDING" && (
                      <div style={{ display:"flex", gap:10 }}>
                        <button className="btn-outline" style={{ flex:1, padding:"10px" }} disabled={isResponding} onClick={()=>respond(n.id,"DECLINE")}>Decline</button>
                        <button className="btn-red"     style={{ flex:2, padding:"10px" }} disabled={isResponding} onClick={()=>respond(n.id,"ACCEPT")}>{isResponding?"Processing…":"✓ Accept & Proceed"}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── SETTINGS PAGE ──────────────────────────────────────────────────── */
function SettingsPage() {
  const [notifDonation, setNotifDonation] = useState(true);
  const [notifUrgent,   setNotifUrgent]   = useState(true);
  const [notifSMS,      setNotifSMS]      = useState(false);
  const Toggle = ({ val, set, label, sub }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #f5eded" }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:"#3d2c2c" }}>{label}</div>
        {sub && <div style={{ fontSize:11.5, color:"#b8a0a0", marginTop:1 }}>{sub}</div>}
      </div>
      <div onClick={()=>set(!val)} style={{ width:44, height:24, background:val?"#e53935":"#e0d0d0", borderRadius:999, position:"relative", cursor:"pointer", transition:"background .25s", flexShrink:0 }}>
        <div style={{ position:"absolute", width:18, height:18, background:"#fff", borderRadius:"50%", top:3, left:val?22:3, transition:"left .25s", boxShadow:"0 1px 4px #0002" }} />
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div className="card fu">
        <div style={{ fontSize:14, fontWeight:700, color:"#3d2c2c", marginBottom:14, fontFamily:"'Crimson Pro',serif" }}>🔔 Notifications</div>
        <Toggle val={notifDonation} set={setNotifDonation} label="Donation Eligibility Alerts" sub="Notify when 90-day gap is complete" />
        <Toggle val={notifUrgent}   set={setNotifUrgent}   label="Urgent Requests Near Me"     sub="Get alerted for critical requests" />
        <Toggle val={notifSMS}      set={setNotifSMS}       label="SMS Notifications"           sub="Receive alerts via text message" />
      </div>
    </div>
  );
}

/* ── LOGOUT MODAL ───────────────────────────────────────────────────── */
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:44, marginBottom:10 }}>👋</div>
          <h3 style={{ margin:0, fontSize:20, fontFamily:"'Crimson Pro',serif", color:"#2d1f1f" }}>Log out of Blood Bridge?</h3>
          <p style={{ fontSize:13, color:"#9e8080", marginTop:8, lineHeight:1.5 }}>You'll need to log in again to access your donor dashboard.</p>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <button className="btn-outline" onClick={onCancel} style={{ flex:1 }}>Cancel</button>
          <button className="btn-red" onClick={onConfirm} style={{ flex:1 }}>Yes, Logout</button>
        </div>
      </div>
    </div>
  );
}

/* ── ROOT ───────────────────────────────────────────────────────────── */
export default function DonorPortal() {
  const navigate = useNavigate();
  const [page,          setPage]          = useState("home");
  const [showLogout,    setShowLogout]    = useState(false);
  const [loggedOut,     setLoggedOut]     = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [donor,         setDonor]         = useState(null);
  const [fetchError,    setFetchError]    = useState("");
  const [notifications, setNotifications] = useState([]);
  const [pendingCount,  setPendingCount]  = useState(0);

  function loadNotifications(token) {
    getDonorNotifications(token)
      .then(data => {
        setNotifications(data);
        setPendingCount(data.filter(n => n.status === "PENDING").length);
      })
      .catch(() => {});
  }

  useEffect(() => {
    const token = localStorage.getItem("bb_token");
    if (!token) { navigate("/donor-login"); return; }
    getDonorProfile(token)
      .then(data => { setDonor(normalizeDonor(data)); setLoading(false); })
      .catch(err  => { setFetchError(err.message);    setLoading(false); });
    loadNotifications(token);
    const interval = setInterval(() => loadNotifications(token), 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleRespond(id, action) {
    try {
      const token = localStorage.getItem("bb_token");
      const updated = await respondToNotification(token, id, action);
      setNotifications(prev => prev.map(n => n.id === id ? updated : n));
      setPendingCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("bb_token");
    localStorage.removeItem("bb_user");
    setLoggedOut(true);
  }

  if (loggedOut) return (
    <>
      <G />
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#faf7f5" }}>
        <div className="fi" style={{ textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:14 }}>🩸</div>
          <div style={{ fontSize:24, fontFamily:"'Crimson Pro',serif", fontWeight:700, color:"#2d1f1f", marginBottom:6 }}>See you soon!</div>
          <div style={{ fontSize:13.5, color:"#9e8080", marginBottom:24 }}>You've been logged out of Blood Bridge.</div>
          <button className="btn-red" onClick={()=>navigate("/donor-login")}>← Back to Login</button>
        </div>
      </div>
    </>
  );

  if (fetchError) return (
    <>
      <G />
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#faf7f5" }}>
        <div className="fi" style={{ textAlign:"center", maxWidth:340 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
          <div style={{ fontSize:16, fontWeight:700, color:"#c62828", marginBottom:8 }}>Failed to load profile</div>
          <div style={{ fontSize:13, color:"#9e8080", marginBottom:24 }}>{fetchError}</div>
          <button className="btn-red" onClick={() => navigate("/donor-login")}>Back to Login</button>
        </div>
      </div>
    </>
  );

  if (loading) return (
    <>
      <G />
      <div style={{ minHeight:"100vh", display:"flex" }}>
        <div style={{ width:228, background:"#fff", borderRight:"1px solid #f5e5e5", padding:"24px 14px" }} className="desktop-sidebar">
          {[80,60,60,60,60,60].map((w,i)=><div key={i} className="skeleton" style={{ width:`${w}%`, height:16, marginBottom:16 }}/>)}
        </div>
        <div style={{ flex:1, padding:"24px" }}>
          <div className="skeleton" style={{ width:"50%", height:28, marginBottom:12 }}/>
          <div className="skeleton" style={{ width:"30%", height:16, marginBottom:28 }}/>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14 }}>
            {[0,1,2].map(i=><div key={i} className="skeleton" style={{ height:100 }}/>)}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <G />
      <div style={{ minHeight:"100vh", display:"flex", background:"#faf7f5" }}>
        <Sidebar active={page} setActive={setPage} onLogout={()=>setShowLogout(true)} donor={donor} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, paddingBottom:70 }}>
          <TopBar page={page} onLogout={()=>setShowLogout(true)} pendingCount={pendingCount} notifications={notifications} onRespond={handleRespond} onViewAll={()=>setPage("requests")} />
          <main style={{ flex:1, padding:"24px 20px", maxWidth:860, width:"100%" }}>
            {page==="home"     && <HomePage     setPage={setPage} donor={donor} pendingCount={pendingCount} />}
            {page==="profile"  && <ProfilePage  donor={donor} onProfileUpdated={setDonor} />}
            {page==="requests" && <RequestsPage notifications={notifications} onRespond={handleRespond} />}
            {page==="settings" && <SettingsPage />}
          </main>
        </div>
        <MobileNav active={page} setActive={setPage} />
        {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={()=>setShowLogout(false)} />}
      </div>
    </>
  );
}
