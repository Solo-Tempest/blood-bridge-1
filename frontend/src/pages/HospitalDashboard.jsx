import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getHospitalProfile, getBloodRequests, createBloodRequest, cancelBloodRequest, updateHospitalPassword, getRequestDonors } from "../api/auth";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const HCtx = createContext(null);
const useH = () => useContext(HCtx);

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    body { font-family:'Plus Jakarta Sans',sans-serif; background:#f0f4f8; color:#1a2332; }
    ::-webkit-scrollbar { width:5px; height:5px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }

    @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes ping    { 75%,100%{transform:scale(2.2);opacity:0} }
    @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
    @keyframes spin    { to{transform:rotate(360deg)} }

    .fu{animation:fadeUp .45s cubic-bezier(.22,.68,0,1.1) both}
    .fi{animation:fadeIn .3s ease both}
    .d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
    .d4{animation-delay:.24s}.d5{animation-delay:.30s}
    .ping-dot{animation:ping 1.4s cubic-bezier(0,0,.2,1) infinite}
    .spin{animation:spin .75s linear infinite}
    .skeleton{background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:600px 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:8px}

    .layout{display:flex;min-height:100vh}

    /* DESKTOP: sidebar sticky in normal flow */
    .sidebar{width:240px;flex-shrink:0;background:#fff;border-right:1px solid #e8edf5;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;z-index:100}
    /* MOBILE: fixed drawer */
    @media(max-width:900px){
      .sidebar{position:fixed;top:0;left:0;height:100vh;transition:transform .3s cubic-bezier(.22,.68,0,1.1)}
      .sidebar.open{transform:translateX(0)}
      .sidebar.closed{transform:translateX(-100%)}
    }
    .sidebar-overlay{display:none;position:fixed;inset:0;background:#00000055;z-index:99;animation:fadeIn .2s ease}
    .sidebar-overlay.show{display:block}
    @media(min-width:901px){.sidebar-overlay{display:none !important}}

    .main{flex:1;display:flex;flex-direction:column;min-width:0}
    .topbar{background:#fff;border-bottom:1px solid #e8edf5;padding:0 20px;height:62px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:40}
    .content{flex:1;padding:24px 20px;overflow-y:auto}
    @media(max-width:640px){.content{padding:14px 12px}.topbar{padding:0 12px;gap:8px}}

    .nav-item{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;color:#64748b;transition:all .2s;border:none;background:transparent;width:100%;text-align:left;font-family:'Plus Jakarta Sans',sans-serif}
    .nav-item:hover{background:#f0f7ff;color:#1d6fb8}
    .nav-item.active{background:linear-gradient(135deg,#1d6fb8,#0ea5e9);color:#fff;box-shadow:0 4px 14px #1d6fb830}
    .nav-icon{flex-shrink:0;color:#94a3b8;transition:color .2s}
    .nav-item:hover .nav-icon,.nav-item.active .nav-icon{color:inherit}

    .card{background:#fff;border-radius:14px;border:1px solid #e8edf5;box-shadow:0 1px 8px #1d2d4410;padding:20px}
    .stat{background:#fff;border-radius:14px;border:1px solid #e8edf5;padding:16px 18px;box-shadow:0 1px 8px #1d2d4410;transition:all .2s;cursor:default}
    .stat:hover{transform:translateY(-3px);box-shadow:0 8px 24px #1d6fb820}

    .inp{width:100%;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;padding:9px 13px 9px 36px;font-size:13px;color:#1a2332;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all .2s}
    .inp:focus{border-color:#1d6fb8;box-shadow:0 0 0 3px #1d6fb815;background:#fff}
    .inp-plain{width:100%;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;padding:9px 13px;font-size:13px;color:#1a2332;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all .2s}
    .inp-plain:focus{border-color:#1d6fb8;box-shadow:0 0 0 3px #1d6fb815;background:#fff}

    .btn-primary{background:linear-gradient(135deg,#1d6fb8,#0ea5e9);color:#fff;border:none;border-radius:9px;padding:9px 20px;font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s;box-shadow:0 3px 12px #1d6fb828}
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 18px #1d6fb838}
    .btn-ghost{background:#f0f7ff;color:#1d6fb8;border:1.5px solid #bfdbfe;border-radius:9px;padding:8px 16px;font-size:12.5px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}
    .btn-ghost:hover{background:#dbeafe;border-color:#93c5fd}
    .btn-danger{background:#fff0f0;color:#dc2626;border:1.5px solid #fecaca;border-radius:9px;padding:8px 16px;font-size:12.5px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s}

    .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:11.5px;font-weight:700;letter-spacing:.2px}
    .badge-green{background:#dcfce7;color:#15803d}
    .badge-blue{background:#dbeafe;color:#1d4ed8}
    .badge-red{background:#fee2e2;color:#dc2626}
    .badge-amber{background:#fef9c3;color:#a16207}
    .badge-gray{background:#f1f5f9;color:#64748b}
    .badge-teal{background:#ccfbf1;color:#0f766e}

    .sec-label{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px}
    .prog-track{background:#e2e8f0;border-radius:999px;height:7px;overflow:hidden}
    .prog-fill{height:100%;border-radius:999px;transition:width .8s cubic-bezier(.22,.68,0,1.1)}

.hour-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;flex-wrap:wrap;gap:8px}
    .hour-row:last-child{border-bottom:none}

    .overlay{position:fixed;inset:0;background:#00000055;z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease;backdrop-filter:blur(2px)}
    .modal{background:#fff;border-radius:18px;padding:24px;max-width:400px;width:90%;box-shadow:0 24px 64px #00000020;animation:fadeUp .3s ease}



    .hamburger{display:none;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9px;background:#f0f7ff;border:1.5px solid #bfdbfe;cursor:pointer;color:#1d6fb8;flex-shrink:0}
    @media(max-width:900px){.hamburger{display:flex}}
    .sidebar-close-btn{display:none}
    @media(max-width:900px){.sidebar-close-btn{display:flex}}

    .bg-grid{display:flex;flex-wrap:wrap;gap:8px}
    .bg-btn{width:54px;height:42px;border-radius:10px;font-weight:700;font-size:13.5px;cursor:pointer;transition:all .2s}
    @media(max-width:400px){.bg-btn{width:46px;height:38px;font-size:12.5px}}

    .req-card-inner{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px}
    .req-stats{display:flex;align-items:center;gap:14px;flex-shrink:0}
    @media(max-width:540px){.req-stats{width:100%;justify-content:flex-start;border-top:1px solid #f1f5f9;padding-top:10px}}

    .hist-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}
    .form-grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px}
    @media(max-width:660px){.form-grid-2{grid-template-columns:1fr}}
    .dash-2col{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
    .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
    @media(max-width:480px){.stat-grid{grid-template-columns:1fr 1fr}}
    /* stepper button shared style */
    .step-btn{width:36px;height:36px;border-radius:9px;border:1.5px solid #e2e8f0;background:#f8fafc;font-size:18px;font-weight:700;cursor:pointer;color:#475569;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
    .step-btn:hover{background:#e0f2fe;border-color:#7dd3fc}
  `}</style>
);

/* ── Fallback data (shown while loading) ── */
const MOCK_H = {
  name:"",type:"",regNo:"",year:"",website:"",
  street:"",area:"",city:"",state:"",pincode:"",landmark:"",lat:"",lng:"",
  contact:"",role:"",phone:"",altPhone:"",email:"",
  is24x7:false,
};
function makeStats(H){
  const age = H.year ? `${new Date().getFullYear() - H.year} yrs active` : "";
  return [
    {icon:"📅",label:"Est. Year",value:H.year?String(H.year):"—",sub:age,color:"#7c3aed",bg:"#f5f3ff"},
  ];
}
const BLOOD_GROUPS=["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const URGENCY_LEVELS=[
  {key:"normal",label:"Normal",color:"#15803d",bg:"#dcfce7",desc:"Standard request, within 24 hrs"},
  {key:"urgent",label:"Urgent",color:"#a16207",bg:"#fef9c3",desc:"Required within 6–12 hours"},
  {key:"critical",label:"Critical",color:"#dc2626",bg:"#fee2e2",desc:"Immediate — all nearby donors alerted"},
];
const BG_MAP = {"A+":"A_POSITIVE","A-":"A_NEGATIVE","B+":"B_POSITIVE","B-":"B_NEGATIVE","AB+":"AB_POSITIVE","AB-":"AB_NEGATIVE","O+":"O_POSITIVE","O-":"O_NEGATIVE"};
const BG_LABEL = Object.fromEntries(Object.entries(BG_MAP).map(([k,v])=>[v,k]));

/* ── Icons ── */
const Ico = {
  dashboard:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  profile:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  docs:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  facility:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  contact:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.8 19.8 0 013.07 9.81 19.8 19.8 0 012 2.18 2 2 0 014 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92v2z"/></svg>,
  clock:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  settings:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  bell:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  search:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  edit:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  check:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><polyline points="20,6 9,17 4,12"/></svg>,
  download:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  eye:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  loc:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  lock:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  broadcast:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92v2z"/></svg>,
  menu:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="18" height="18"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  back:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>,
};

const lbl={fontSize:10.5,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".6px",marginBottom:5,display:"block"};
const val={fontSize:14,fontWeight:500,color:"#1a2332"};

/* Stable field component — defined at module level so React never remounts it on re-render */
function EditableField({label,id,type="text",editing,form,setForm,children}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <span style={lbl}>{label}</span>
      {children
        ? editing?children:<span style={val}>{form[id]||"—"}</span>
        : editing
          ? <input type={type} className="inp-plain" value={form[id]||""} onChange={e=>setForm(f=>({...f,[id]:e.target.value}))}/>
          : <span style={val}>{form[id]||"—"}</span>
      }
    </div>
  );
}

const urgencyColor={normal:"#15803d",urgent:"#a16207",critical:"#dc2626"};
const urgencyBg={normal:"#dcfce7",urgent:"#fef9c3",critical:"#fee2e2"};
const urgencyBadge={normal:"badge-green",urgent:"badge-amber",critical:"badge-red"};

/* ── Shared atoms ── */
function SectionHead({title,icon,onEdit,editLabel="Edit"}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:17}}>{icon}</span><span style={{fontSize:15,fontWeight:700,color:"#1a2332",fontFamily:"'Lora',serif"}}>{title}</span></div>
      {onEdit&&<button className="btn-ghost" onClick={onEdit} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",fontSize:12}}>{Ico.edit} {editLabel}</button>}
    </div>
  );
}
function StatusBadge({status}){
  const m={verified:{cls:"badge-green",text:"✓ Verified"},pending:{cls:"badge-amber",text:"⏳ Pending"},rejected:{cls:"badge-red",text:"✗ Rejected"}}[status]||{cls:"badge-amber",text:"⏳ Pending"};
  return <span className={`badge ${m.cls}`}>{m.text}</span>;
}
function MapPreview({city,state,lat,lng}){
  return(
    <div style={{borderRadius:12,overflow:"hidden",border:"1.5px solid #e2e8f0",height:100,background:"linear-gradient(135deg,#eff6ff,#f0fdfa)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
      <div style={{position:"absolute",inset:0,opacity:.06,backgroundImage:"repeating-linear-gradient(0deg,#1d6fb8 0,#1d6fb8 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,#1d6fb8 0,#1d6fb8 1px,transparent 1px,transparent 32px)"}}/>
      <div style={{textAlign:"center",zIndex:1}}><div style={{fontSize:24}}>🗺️</div><div style={{fontSize:12,color:"#1d6fb8",fontWeight:700,marginTop:3}}>{city}, {state}</div>{lat&&<div style={{fontSize:10.5,color:"#94a3b8",marginTop:1}}>{lat}, {lng}</div>}</div>
    </div>
  );
}

/* ── Interactive Location Map Picker ── */
function LocationMapPicker({ lat, lng, onChange }) {
  const mapDivRef = useRef(null);
  const mapRef    = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching,   setSearching]   = useState(false);
  const [searchErr,   setSearchErr]   = useState("");
  const [locating,    setLocating]    = useState(false);
  const [geoErr,      setGeoErr]      = useState("");

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const center = lat && lng ? [Number(lat), Number(lng)] : [20.5937, 78.9629];
    const map = L.map(mapDivRef.current, { center, zoom: lat ? 14 : 5 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    map.on("click", e => {
      placeOrMoveMarker(e.latlng.lat, e.latlng.lng, map);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
    if (lat && lng) placeOrMoveMarker(Number(lat), Number(lng), map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
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
      const a = json.address || {};
      onChange({
        lat: String(lat), lng: String(lng),
        city:    a.city || a.town || a.village || a.county || "",
        state:   a.state || "",
        pincode: a.postcode || "",
      });
      setSearchQuery(json.display_name || "");
    } catch {
      onChange({ lat: String(lat), lng: String(lng) });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true); setSearchErr("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=in`,
        { headers: { "User-Agent": "BloodBridge/1.0" } }
      );
      const json = await res.json();
      if (!json.length) { setSearchErr("Location not found."); return; }
      const { lat: la, lon } = json[0];
      placeOrMoveMarker(Number(la), Number(lon));
      reverseGeocode(Number(la), Number(lon));
    } catch { setSearchErr("Search failed."); }
    finally { setSearching(false); }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { setGeoErr("Geolocation not supported."); return; }
    setLocating(true); setGeoErr("");
    navigator.geolocation.getCurrentPosition(
      pos => {
        placeOrMoveMarker(pos.coords.latitude, pos.coords.longitude);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      err => {
        setLocating(false);
        setGeoErr(err.code === 1 ? "Permission denied. Allow location in browser settings." : "Could not get location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
      <div style={{display:"flex",gap:8}}>
        <input className="inp-plain" style={{flex:1}} placeholder="Search address or area…"
          value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleSearch()} />
        <button type="button" className="btn-primary" onClick={handleSearch} disabled={searching}
          style={{flexShrink:0,padding:"8px 18px"}}>
          {searching?"…":"Go"}
        </button>
      </div>
      {searchErr&&<span style={{fontSize:11.5,color:"#dc2626"}}>{searchErr}</span>}
      <button type="button" onClick={handleCurrentLocation} disabled={locating}
        style={{width:"100%",padding:"9px 16px",borderRadius:9,border:"1.5px dashed",borderColor:locating?"#fbbf24":"#93c5fd",background:locating?"#fef9c3":"#f0f7ff",color:locating?"#a16207":"#1d6fb8",fontSize:13,fontWeight:600,cursor:locating?"not-allowed":"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        {locating?"⏳ Detecting location…":"📡 Use My Current Location"}
      </button>
      {geoErr&&<span style={{fontSize:11.5,color:"#dc2626"}}>{geoErr}</span>}
      <div ref={mapDivRef} style={{height:280,borderRadius:12,overflow:"hidden",border:"1.5px solid #e2e8f0"}} />
      {lat&&lng&&(
        <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:9,padding:"8px 12px",fontSize:12.5,color:"#15803d",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
          📍 {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
          <span style={{color:"#16a34a",marginLeft:"auto"}}>Location pinned ✓</span>
        </div>
      )}
    </div>
  );
}

/* ── SIDEBAR ── */
function Sidebar({active,setActive,onLogout,open,onClose}){
  const H = useH();
  const nav=[
    {key:"dashboard",label:"Overview",icon:Ico.dashboard},
    {key:"profile",label:"Hospital Profile",icon:Ico.profile},
    {key:"broadcast",label:"Send Blood Request",icon:Ico.broadcast},
    {key:"contact",label:"Contact Info",icon:Ico.contact},
    {key:"settings",label:"Settings",icon:Ico.settings},
  ];
  function go(k){setActive(k);onClose();}
  return(
    <>
      <div className={`sidebar-overlay${open?" show":""}`} onClick={onClose}/>
      <aside className={`sidebar${open?" open":" closed"}`}>
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,background:"linear-gradient(135deg,#1d6fb8,#0ea5e9)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🩸</div>
            <div><div style={{fontSize:13.5,fontWeight:800,color:"#1a2332",fontFamily:"'Lora',serif"}}>Blood Bridge</div><div style={{fontSize:9,color:"#94a3b8",fontWeight:600,letterSpacing:".5px",textTransform:"uppercase"}}>Hospital Portal</div></div>
          </div>
          <button onClick={onClose} className="sidebar-close-btn" style={{background:"transparent",border:"none",cursor:"pointer",color:"#94a3b8",padding:4}}>{Ico.close}</button>
        </div>
        <div style={{margin:"12px 12px 4px",background:"linear-gradient(135deg,#eff6ff,#f0fdfa)",border:"1px solid #bfdbfe",borderRadius:10,padding:"10px 12px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1a2332",marginBottom:1}}>{H.name}</div>
          <div style={{fontSize:10.5,color:"#64748b"}}>{H.type} · {H.city}</div>
        </div>
        <nav style={{flex:1,padding:"8px 8px",display:"flex",flexDirection:"column",gap:2}}>
          <div className="sec-label" style={{padding:"6px 6px 3px",fontSize:9.5}}>Navigation</div>
          {nav.map(n=><button key={n.key} className={`nav-item${active===n.key?" active":""}`} onClick={()=>go(n.key)}><span className="nav-icon">{n.icon}</span>{n.label}</button>)}
        </nav>
        <div style={{padding:"10px 8px",borderTop:"1px solid #f1f5f9"}}>
          <button className="nav-item" onClick={onLogout} style={{color:"#dc2626"}}><span style={{fontSize:15}}>🚪</span>Logout</button>
        </div>
      </aside>
    </>
  );
}

/* ── TOPBAR ── */
function TopBar({page,setPage,onMenuClick}){
  const H = useH();
  const labels={dashboard:"Dashboard",profile:"Hospital Profile",broadcast:"Blood Request",contact:"Contact Info",settings:"Settings"};
  return(
    <header className="topbar">
      <button className="hamburger" onClick={onMenuClick}>{Ico.menu}</button>
      <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
        {page!=="dashboard"&&<button onClick={()=>setPage("dashboard")} style={{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,background:"#f0f7ff",border:"1.5px solid #bfdbfe",cursor:"pointer",color:"#1d6fb8",flexShrink:0}}>{Ico.back}</button>}
        <div style={{minWidth:0}}>
          <div style={{fontSize:15,fontWeight:700,color:"#1a2332",fontFamily:"'Lora',serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{labels[page]}</div>
          {page!=="dashboard"&&<div style={{fontSize:10.5,color:"#94a3b8"}}><span style={{color:"#1d6fb8",cursor:"pointer"}} onClick={()=>setPage("dashboard")}>Dashboard</span> › {labels[page]}</div>}
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <button style={{position:"relative",background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:9,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b"}}>
          {Ico.bell}
          <span style={{position:"absolute",top:7,right:7,width:7,height:7,background:"#ef4444",borderRadius:"50%",border:"1.5px solid #fff"}}><span className="ping-dot" style={{position:"absolute",inset:0,background:"#ef4444",borderRadius:"50%",display:"block"}}/></span>
        </button>
        <div style={{width:34,height:34,background:"linear-gradient(135deg,#1d6fb8,#0ea5e9)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12,flexShrink:0}}>
          {(H.contact||H.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2)}
        </div>
      </div>
    </header>
  );
}

/* ── DASHBOARD ── */
function DashboardPage({setPage}){
  const H = useH();
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div className="fu" style={{background:"linear-gradient(135deg,#1d6fb8,#0284c7,#0ea5e9)",borderRadius:16,padding:"20px 22px",color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,background:"#ffffff12",borderRadius:"50%"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:10.5,fontWeight:700,letterSpacing:".8px",textTransform:"uppercase",color:"#bae6fd",marginBottom:3}}>Welcome back 👋</div>
          <div style={{fontSize:19,fontWeight:700,fontFamily:"'Lora',serif",marginBottom:6}}>{H.name}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"#ffffff25",border:"1px solid #ffffff30",borderRadius:999,padding:"2px 10px",fontSize:11,fontWeight:600}}>{H.type}</span>
            <span style={{fontSize:11.5,color:"#bae6fd",display:"flex",alignItems:"center",gap:4}}>{Ico.loc}{H.city}, {H.state}</span>
            </div>
        </div>
      </div>
      <div className="stat-grid">
        {makeStats(H).map((s,i)=>(
          <div key={s.label} className={`stat fu d${i+1}`} style={{background:s.bg}}>
            <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:3}}>{s.label}</div>
            <div style={{fontSize:19,fontWeight:800,color:s.color,fontFamily:"'Lora',serif"}}>{s.value}</div>
            <div style={{fontSize:10.5,color:"#94a3b8",marginTop:1}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="dash-2col">
        <div className="card fu d2">
          <SectionHead title="Quick Information" icon="🏥" onEdit={()=>setPage("profile")} editLabel="View"/>
          {[{l:"Registration No.",v:H.regNo},{l:"Year Established",v:H.year},{l:"Website",v:H.website}].map(r=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"1px solid #f1f5f9",paddingBottom:10,marginBottom:10}}>
              <span style={{fontSize:11.5,color:"#94a3b8",fontWeight:500,flexShrink:0,marginRight:8}}>{r.l}</span>
              <span style={{fontSize:12,color:"#1a2332",fontWeight:600,textAlign:"right",wordBreak:"break-all"}}>{r.v}</span>
            </div>
          ))}
        </div>
        <div className="card fu d3">
          <SectionHead title="Location" icon="📍" onEdit={()=>setPage("profile")} editLabel="View"/>
          <div style={{marginBottom:12}}><div style={{fontSize:13,fontWeight:600,color:"#1a2332",marginBottom:2}}>{H.street}, {H.area}</div><div style={{fontSize:12,color:"#64748b"}}>{H.city}, {H.state} — {H.pincode}</div><div style={{fontSize:11.5,color:"#94a3b8",marginTop:2}}>Near {H.landmark}</div></div>
          <MapPreview city={H.city} state={H.state} lat={H.lat} lng={H.lng}/>
        </div>
        <div className="card fu d3">
          <SectionHead title="Contact Summary" icon="📞" onEdit={()=>setPage("contact")} editLabel="View"/>
          {[{l:"Primary Contact",v:H.contact},{l:"Role",v:H.role},{l:"Phone",v:H.phone},{l:"Email",v:H.email}].map(r=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #f1f5f9",paddingBottom:9,marginBottom:9}}>
              <span style={{fontSize:11.5,color:"#94a3b8",flexShrink:0,marginRight:8}}>{r.l}</span>
              <span style={{fontSize:12,color:"#1a2332",fontWeight:600,textAlign:"right",wordBreak:"break-all"}}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── PROFILE ── */
function ProfilePage(){
  const H = useH();
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({...H});
  const [saved,setSaved]=useState(false);
  function save(){setEditing(false);setSaved(true);setTimeout(()=>setSaved(false),3000);}
  const types=["Government","Private","NGO / Trust","Blood Bank Only","Multi-Specialty"];
  const fp={editing,form,setForm};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {saved&&<div className="fu" style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#15803d",fontWeight:600}}>✅ Profile saved!</div>}
      <div className="card fu">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:17}}>🏥</span><span style={{fontSize:15,fontWeight:700,fontFamily:"'Lora',serif"}}>Basic Information</span></div>
          <div style={{display:"flex",gap:8}}>
            {editing?<><button className="btn-ghost" onClick={()=>{setEditing(false);setForm({...H});}}>Cancel</button><button className="btn-primary" onClick={save}>{Ico.check} Save</button></>:<button className="btn-ghost" onClick={()=>setEditing(true)} style={{display:"flex",alignItems:"center",gap:5}}>{Ico.edit} Edit</button>}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
          <EditableField label="Hospital Name" id="name" {...fp}/>
          <EditableField label="Registration / License ID" id="regNo" {...fp}/>
          <EditableField label="Hospital Type" id="type" {...fp}>{editing&&<select className="inp-plain" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{types.map(t=><option key={t}>{t}</option>)}</select>}</EditableField>
          <EditableField label="Year Established" id="year" type="number" {...fp}/>
          <EditableField label="Website URL" id="website" {...fp}/>
        </div>
      </div>
      <div className="card fu d1">
        <SectionHead title="Address Details" icon="📍"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:14}}>
          <div style={{gridColumn:"1/-1"}}><EditableField label="Street Address" id="street" {...fp}/></div>
          <EditableField label="Area / Locality" id="area" {...fp}/>
          <EditableField label="City" id="city" {...fp}/>
          <EditableField label="State" id="state" {...fp}/>
          <EditableField label="Pincode" id="pincode" {...fp}/>
          <EditableField label="Landmark" id="landmark" {...fp}/>
          {!editing&&<EditableField label="Latitude" id="lat" {...fp}/>}
          {!editing&&<EditableField label="Longitude" id="lng" {...fp}/>}
        </div>
        {editing ? (
          <LocationMapPicker
            lat={form.lat}
            lng={form.lng}
            onChange={({lat,lng,city,state,pincode})=>setForm(f=>({
              ...f,
              lat: lat||f.lat,
              lng: lng||f.lng,
              city: city||f.city,
              state: state||f.state,
              pincode: pincode||f.pincode,
            }))}
          />
        ) : (
          <MapPreview city={form.city} state={form.state} lat={form.lat} lng={form.lng}/>
        )}
      </div>
    </div>
  );
}

/* ── CONTACT ── */
function ContactPage(){
  const H = useH();
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({contact:H.contact,role:H.role,phone:H.phone,altPhone:H.altPhone,email:H.email});
  const [saved,setSaved]=useState(false);
  function save(){setEditing(false);setSaved(true);setTimeout(()=>setSaved(false),3000);}
  const fp={editing,form,setForm};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {saved&&<div className="fu" style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#15803d",fontWeight:600}}>✅ Contact info saved!</div>}
      <div className="card fu">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:17}}>📞</span><span style={{fontSize:15,fontWeight:700,fontFamily:"'Lora',serif"}}>Contact Information</span></div>
          <div style={{display:"flex",gap:8}}>{editing?<><button className="btn-ghost" onClick={()=>{setEditing(false);setForm({contact:H.contact,role:H.role,phone:H.phone,altPhone:H.altPhone,email:H.email});}}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>:<button className="btn-ghost" onClick={()=>setEditing(true)} style={{display:"flex",alignItems:"center",gap:5}}>{Ico.edit} Edit</button>}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
          <EditableField label="Primary Contact Person" id="contact" {...fp}/>
          <EditableField label="Role / Designation" id="role" {...fp}/>
          <EditableField label="Primary Phone Number" id="phone" {...fp}/>
          <EditableField label="Alternate Phone" id="altPhone" {...fp}/>
          <div style={{gridColumn:"1/-1"}}><EditableField label="Email Address" id="email" type="email" {...fp}/></div>
        </div>
      </div>
    </div>
  );
}

/* ── SETTINGS helpers (module-level so React never remounts inputs) ── */
function PwField({label,k,pw,setPw,setPwErr,showPw,setShowPw}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <span style={lbl}>{label}</span>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94a3b8"}}>{Ico.lock}</span>
        <input type={showPw[k]?"text":"password"} className="inp" value={pw[k]} onChange={e=>{setPw(p=>({...p,[k]:e.target.value}));setPwErr("");}} style={{paddingRight:36}} placeholder="••••••••"/>
        <button type="button" onClick={()=>setShowPw(s=>({...s,[k]:!s[k]}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:13}}>{showPw[k]?"🙈":"👁️"}</button>
      </div>
    </div>
  );
}
function NotifToggle({label,sub,k,notif,setNotif}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #f1f5f9",gap:12}}>
      <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:"#1a2332"}}>{label}</div>{sub&&<div style={{fontSize:11.5,color:"#94a3b8",marginTop:1}}>{sub}</div>}</div>
      <div onClick={()=>setNotif(n=>({...n,[k]:!n[k]}))} style={{width:42,height:24,background:notif[k]?"#1d6fb8":"#e2e8f0",borderRadius:999,position:"relative",cursor:"pointer",transition:"background .25s",flexShrink:0}}>
        <div style={{position:"absolute",width:18,height:18,background:"#fff",borderRadius:"50%",top:3,left:notif[k]?20:3,transition:"left .25s"}}/>
      </div>
    </div>
  );
}

/* ── SETTINGS ── */
function SettingsPage(){
  const [pw,setPw]=useState({cur:"",next:"",confirm:""});
  const [showPw,setShowPw]=useState({cur:false,next:false,confirm:false});
  const [saved,setSaved]=useState(false);
  const [loading,setLoading]=useState(false);
  const [notif,setNotif]=useState({requests:true,updates:true,email:false});
  const [pwErr,setPwErr]=useState("");
  async function changePw(){
    if(!pw.cur){setPwErr("Current password required");return;}
    if(pw.next.length<6){setPwErr("New password must be at least 6 characters");return;}
    if(pw.next!==pw.confirm){setPwErr("Passwords do not match");return;}
    const token=localStorage.getItem("bb_token");
    setLoading(true);setPwErr("");
    try{
      await updateHospitalPassword(token,pw.cur,pw.next);
      setSaved(true);setPw({cur:"",next:"",confirm:""});setTimeout(()=>setSaved(false),3000);
    }catch(err){setPwErr(err.message);}
    finally{setLoading(false);}
  }
  const strength=(()=>{let s=0,p=pw.next;if(p.length>=8)s++;if(/[A-Z]/.test(p))s++;if(/[0-9]/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return s;})();
  const strColor=["#e2e8f0","#ef4444","#f59e0b","#22c55e","#16a34a"][strength];
  const strLabel=["","Weak","Fair","Good","Strong"][strength];
  const fp={pw,setPw,setPwErr,showPw,setShowPw};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {saved&&<div className="fu" style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#15803d",fontWeight:600}}>✅ Password changed!</div>}
      <div className="card fu">
        <SectionHead title="Change Password" icon="🔐"/>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <PwField label="Current Password" k="cur" {...fp}/>
          <PwField label="New Password" k="next" {...fp}/>
          <PwField label="Confirm New Password" k="confirm" {...fp}/>
        </div>
        {pw.next.length>0&&<div style={{marginTop:10}}><div style={{display:"flex",gap:4,marginBottom:4}}>{[1,2,3,4].map(i=><div key={i} style={{flex:1,height:4,borderRadius:999,background:i<=strength?strColor:"#e2e8f0",transition:"background .3s"}}/>)}</div><span style={{fontSize:11,fontWeight:600,color:strColor}}>{strLabel} password</span></div>}
        {pwErr&&<p style={{fontSize:12,color:"#ef4444",marginTop:7,fontWeight:500}}>⚠ {pwErr}</p>}
        <div style={{marginTop:14}}><button className="btn-primary" onClick={changePw} disabled={loading}>{loading?"Updating…":"Update Password"}</button></div>
      </div>
      <div className="card fu d1">
        <SectionHead title="Notifications" icon="🔔"/>
        <NotifToggle label="Email Notifications" sub="Receive alerts via email" k="email" notif={notif} setNotif={setNotif}/>
      </div>
    </div>
  );
}

/* ── helpers ── */
const BLOOD_DISPLAY_H = {
  A_POSITIVE:"A+",A_NEGATIVE:"A-",B_POSITIVE:"B+",B_NEGATIVE:"B-",
  AB_POSITIVE:"AB+",AB_NEGATIVE:"AB-",O_POSITIVE:"O+",O_NEGATIVE:"O-",
};
function fmtDT(d){
  if(!d) return "—";
  const dt=new Date(d);
  return dt.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})+", "+dt.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
}
function calcAge(dob){
  if(!dob) return "—";
  const today=new Date(), b=new Date(dob);
  let age=today.getFullYear()-b.getFullYear();
  if(today.getMonth()-b.getMonth()<0||(today.getMonth()===b.getMonth()&&today.getDate()<b.getDate())) age--;
  return age+" yrs";
}

/* ── REQUEST DETAIL VIEW ── */
function RequestDetailView({ request: r, donors, loading, error, onBack }){
  const accepted = donors.filter(d=>d.status==="ACCEPTED");
  const others   = donors.filter(d=>d.status!=="ACCEPTED");

  const statusStyle={
    ACCEPTED:{ label:"Accepted", bg:"#dcfce7", color:"#15803d", border:"#86efac" },
    DECLINED:{ label:"Declined", bg:"#fee2e2", color:"#dc2626", border:"#fca5a5" },
    PENDING: { label:"Pending",  bg:"#fef9c3", color:"#a16207", border:"#fde68a" },
  };

  // Build rank map: sort all donors by mlScore desc, assign rank 1,2,3...
  const hasMlScores = donors.some(d => d.mlScore != null);
  const allByScore  = hasMlScores
    ? [...donors].sort((a,b) => (b.mlScore||0) - (a.mlScore||0))
    : [];
  const rankMap = {};
  allByScore.forEach((d,i) => { rankMap[d.notificationId] = i + 1; });

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}} className="fu">

      {/* ── Back + title ── */}
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <button onClick={onBack} className="btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:13,padding:"7px 14px"}}>
          ← Back to History
        </button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".6px"}}>Request Detail</div>
          <div style={{fontSize:17,fontWeight:700,color:"#1a2332",fontFamily:"'Lora',serif",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            {r.patient}
            <span style={{fontSize:13,fontWeight:800,background:`linear-gradient(135deg,${urgencyColor[r.urgency]}22,${urgencyBg[r.urgency]})`,color:urgencyColor[r.urgency],padding:"2px 10px",borderRadius:999,border:`1px solid ${urgencyColor[r.urgency]}40`}}>
              {r.urgency.charAt(0).toUpperCase()+r.urgency.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Request summary card ── */}
      <div className="card" style={{display:"flex",flexWrap:"wrap",gap:14}}>
        {[
          {icon:"🩸",label:"Blood Group",  value:r.blood},
          {icon:"💧",label:"Units",        value:`${r.units} unit${r.units>1?"s":""}`},
          {icon:"👥",label:"Donors Needed",value:r.donorsNeeded},
          {icon:"📤",label:"Notified",     value:r.sent},
          {icon:"✅",label:"Accepted",     value:r.accepted},
          {icon:"❌",label:"Declined",     value:r.declined},
          {icon:"⏳",label:"Pending",      value:r.pending},
        ].map(s=>(
          <div key={s.label} style={{background:"#f8fafc",borderRadius:10,padding:"9px 14px",minWidth:90,border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:15,marginBottom:2}}>{s.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".4px"}}>{s.label}</div>
            <div style={{fontSize:16,fontWeight:800,color:"#1a2332",fontFamily:"'Lora',serif"}}>{s.value}</div>
          </div>
        ))}
        <div style={{width:"100%",borderTop:"1px solid #f1f5f9",paddingTop:10,display:"flex",flexWrap:"wrap",gap:12,fontSize:12.5,color:"#64748b"}}>
          <span>📅 {fmtDT(r.date)}</span>
          {r.notes&&<span>📝 {r.notes}</span>}
          {r.contactPhone1&&<span>📞 {r.contactPhone1}{r.contactPhone2&&` · ${r.contactPhone2}`}</span>}
        </div>
      </div>

      {/* ── ML Ranking info banner ── */}
      {hasMlScores&&(
        <div style={{background:"linear-gradient(135deg,#eff6ff,#f0fdf4)",border:"1.5px solid #93c5fd",borderRadius:12,padding:"12px 16px",display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:200}}>
            <span style={{fontSize:20}}>🤖</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#1d4ed8"}}>Donors ranked by AI · Random Forest (AUC 0.876)</div>
              <div style={{fontSize:11.5,color:"#475569",marginTop:2}}>
                Score = Blood Match × P(Show Up) × Proximity &nbsp;·&nbsp; Higher score → notified first
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[
              {label:"Blood Match",desc:"How closely blood types match (1.0 = exact)"},
              {label:"P(Show Up)",desc:"ML-predicted chance the donor will respond"},
              {label:"Proximity",desc:"How close the donor is to the hospital"},
            ].map(f=>(
              <div key={f.label} style={{background:"#fff",border:"1px solid #bfdbfe",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:600,color:"#1d4ed8",cursor:"default"}} title={f.desc}>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading / error ── */}
      {loading&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[0,1,2].map(i=><div key={i} className="skeleton" style={{height:80,borderRadius:12}}/>)}
        </div>
      )}
      {error&&<div style={{background:"#fef2f2",border:"1.5px solid #fca5a5",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#dc2626"}}>⚠ {error}</div>}

      {!loading&&!error&&donors.length===0&&(
        <div style={{textAlign:"center",padding:"36px 16px",color:"#94a3b8"}}>
          <div style={{fontSize:36,marginBottom:8}}>📭</div>
          <div style={{fontSize:13,fontWeight:600}}>No donors notified yet</div>
          <div style={{fontSize:12,marginTop:4}}>Matching may still be in progress.</div>
        </div>
      )}

      {/* ══ ACCEPTED DONORS ══ */}
      {!loading&&accepted.length>0&&(
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#15803d",marginBottom:12,display:"flex",alignItems:"center",gap:7,fontFamily:"'Lora',serif"}}>
            ✅ Accepted Donors <span style={{fontSize:13,background:"#dcfce7",color:"#15803d",borderRadius:999,padding:"1px 9px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{accepted.length}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {accepted.map(d=>(
              <div key={d.notificationId} style={{background:"#fff",border:"1.5px solid #86efac",borderRadius:14,padding:"16px 18px",display:"flex",flexDirection:"column",gap:12}}>
                {/* Top row */}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:44,height:44,background:"linear-gradient(135deg,#16a34a,#22c55e)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0}}>
                      {BLOOD_DISPLAY_H[d.bloodGroup]||d.bloodGroup}
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:"#1a2332"}}>{d.name}</div>
                      <div style={{fontSize:11.5,color:"#64748b",marginTop:2}}>{d.city}{d.state?`, ${d.state}`:""}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <span style={{background:"#dcfce7",color:"#15803d",border:"1px solid #86efac",borderRadius:999,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>✓ Accepted</span>
                    {rankMap[d.notificationId]&&<span style={{background:"#dbeafe",color:"#1d4ed8",border:"1px solid #93c5fd",borderRadius:999,padding:"2px 8px",fontSize:10.5,fontWeight:700}}>🤖 Rank #{rankMap[d.notificationId]}{d.mlScore!=null?` · ${(d.mlScore*100).toFixed(0)}%`:""}</span>}
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8}}>
                  {[
                    {icon:"🩸",label:"Blood Group",value:BLOOD_DISPLAY_H[d.bloodGroup]||d.bloodGroup},
                    {icon:"⚖️",label:"Weight",     value:d.weight?`${d.weight} kg`:"—"},
                    {icon:"🎂",label:"Age",         value:calcAge(d.dateOfBirth)},
                    {icon:"📍",label:"Distance",    value:d.distanceKm!=null?`~${d.distanceKm} km`:"—"},
                    {icon:"💉",label:"Last Donated",value:d.lastDonationDate?new Date(d.lastDonationDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"Never"},
                    {icon:"🏅",label:"Total Donations",value:d.totalDonations??0},
                  ].map(s=>(
                    <div key={s.label} style={{background:"#f0fdf4",borderRadius:9,padding:"8px 11px",border:"1px solid #bbf7d0"}}>
                      <div style={{fontSize:13,marginBottom:2}}>{s.icon}</div>
                      <div style={{fontSize:9.5,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".4px"}}>{s.label}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#15803d"}}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Action row */}
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {d.phone&&(
                    <a href={`tel:${d.phone}`} className="btn-primary" style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",fontSize:13,textDecoration:"none",background:"linear-gradient(135deg,#16a34a,#22c55e)",boxShadow:"0 3px 12px #16a34a28"}}>
                      📞 Call {d.phone}
                    </a>
                  )}
                  {d.latitude&&d.longitude&&(
                    <a href={`https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}&zoom=15`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,padding:"7px 14px",textDecoration:"none"}}>
                      🗺 View on Map
                    </a>
                  )}
                  <div style={{marginLeft:"auto",fontSize:11.5,color:"#94a3b8",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                    <span>Notified: {fmtDT(d.sentAt)}</span>
                    {d.respondedAt&&<span>Accepted: {fmtDT(d.respondedAt)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ ALL NOTIFIED DONORS ══ */}
      {!loading&&others.length>0&&(
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#1a2332",marginBottom:12,fontFamily:"'Lora',serif"}}>
            📋 All Notified Donors <span style={{fontSize:13,background:"#f1f5f9",color:"#64748b",borderRadius:999,padding:"1px 9px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{others.length}</span>
          </div>
          <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e8edf5",overflow:"hidden"}}>
            {others.map((d,i)=>{
              const st=statusStyle[d.status]||statusStyle.PENDING;
              const rank=rankMap[d.notificationId];
              const scorePct=d.mlScore!=null?Math.round(d.mlScore*100):null;
              return(
                <div key={d.notificationId} style={{padding:"12px 16px",borderBottom:i<others.length-1?"1px solid #f1f5f9":"none",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  {/* Rank badge */}
                  {rank&&<div style={{width:28,height:28,background:rank===1?"linear-gradient(135deg,#1d4ed8,#3b82f6)":rank===2?"linear-gradient(135deg,#6366f1,#818cf8)":rank===3?"linear-gradient(135deg,#7c3aed,#a78bfa)":"linear-gradient(135deg,#64748b,#94a3b8)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:10,flexShrink:0,letterSpacing:"-0.5px"}}>#{rank}</div>}
                  <div style={{width:36,height:36,background:"linear-gradient(135deg,#e2e8f0,#f1f5f9)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#475569",flexShrink:0}}>
                    {BLOOD_DISPLAY_H[d.bloodGroup]||d.bloodGroup}
                  </div>
                  <div style={{flex:1,minWidth:110}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#1a2332"}}>{d.name}</div>
                    <div style={{fontSize:11.5,color:"#94a3b8",marginTop:1}}>{d.city}{d.state?`, ${d.state}`:""} {d.distanceKm!=null?`· ~${d.distanceKm} km`:""}</div>
                  </div>
                  {/* ML score bar */}
                  {scorePct!=null&&(
                    <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:80,flexShrink:0}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#64748b",textAlign:"right"}}>AI Score</div>
                      <div style={{height:6,background:"#e2e8f0",borderRadius:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${scorePct}%`,background:scorePct>=70?"#22c55e":scorePct>=45?"#f59e0b":"#ef4444",borderRadius:4,transition:"width .4s"}}/>
                      </div>
                      <div style={{fontSize:10.5,fontWeight:700,color:scorePct>=70?"#15803d":scorePct>=45?"#a16207":"#dc2626",textAlign:"right"}}>{scorePct}%</div>
                    </div>
                  )}
                  <span style={{background:st.bg,color:st.color,border:`1px solid ${st.border}`,borderRadius:999,padding:"3px 10px",fontSize:11.5,fontWeight:700,flexShrink:0}}>{st.label}</span>
                  <div style={{fontSize:11,color:"#94a3b8",textAlign:"right",flexShrink:0}}>
                    <div>Sent: {fmtDT(d.sentAt)}</div>
                    {d.respondedAt&&<div>Responded: {fmtDT(d.respondedAt)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   BLOOD REQUEST PAGE  — full rewrite with new field
   ════════════════════════════════════════════════ */
function normalizeRequest(r){
  return {
    ...r,
    blood:      BG_LABEL[r.bloodGroup] || r.bloodGroup,
    urgency:    (r.urgency||"").toLowerCase(),
    patient:    r.patientName,
    escalation: r.escalationLevel,
    date:       r.createdAt || "",
    status:     (r.status||"").toLowerCase(),
  };
}

function BloodRequestPage(){
  const token = localStorage.getItem("bb_token");
  const topRef = useRef(null);

  /* form state */
  const [bloodGroup,   setBloodGroup]   = useState("");
  const [units,        setUnits]        = useState(1);
  const [donorsNeeded, setDonorsNeeded] = useState(2);
  const [urgency,      setUrgency]      = useState("urgent");
  const [patientName,  setPatientName]  = useState("");
  const [notes,        setNotes]        = useState("");
  const [contactPhone1, setContactPhone1] = useState("");
  const [contactPhone2, setContactPhone2] = useState("");
  const [errors,       setErrors]       = useState({});

  /* send state */
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [sentCount, setSentCount] = useState(0);

  /* request list */
  const [requests,    setRequests]    = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tab,         setTab]         = useState("new");
  const [cancelId,    setCancelId]    = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  /* detail view */
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donorDetails,    setDonorDetails]    = useState([]);
  const [loadingDonors,   setLoadingDonors]   = useState(false);
  const [donorError,      setDonorError]      = useState("");

  function openDetail(r) {
    setSelectedRequest(r);
    setDonorDetails([]);
    setDonorError("");
    setLoadingDonors(true);
    getRequestDonors(token, r.id)
      .then(data => setDonorDetails(data))
      .catch(e  => setDonorError(e.message))
      .finally(()=> setLoadingDonors(false));
  }

  function closeDetail() {
    setSelectedRequest(null);
    setDonorDetails([]);
    setDonorError("");
  }

  function loadRequests(showSpinner = false) {
    if (showSpinner) setRefreshing(true);
    getBloodRequests(token)
      .then(data => { setRequests(data.map(normalizeRequest)); setLastUpdated(new Date()); })
      .catch(()=>{})
      .finally(()=>{ setLoadingReqs(false); setRefreshing(false); });
  }

  useEffect(()=>{
    loadRequests();
    const interval = setInterval(() => loadRequests(), 30000);
    return () => clearInterval(interval);
  },[]);

  function changeUnits(newUnits){
    setUnits(newUnits);
    if(donorsNeeded <= newUnits) setDonorsNeeded(newUnits + 1);
  }

  function validate(){
    const e={};
    if(!bloodGroup)           e.bloodGroup   = "Please select a blood group";
    if(!units||units<1)       e.units        = "At least 1 unit required";
    if(donorsNeeded<=units)   e.donorsNeeded = `Must be greater than ${units} (units required)`;
    if(!patientName.trim())   e.patientName    = "Patient name is required";
    if(!contactPhone1.trim()) e.contactPhone1  = "Primary contact number is required";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSend(){
    if(!validate()) return;
    setSending(true);
    try{
      const created = await createBloodRequest(token, {
        bloodGroup:   BG_MAP[bloodGroup],
        units,
        donorsNeeded,
        urgency:      urgency.toUpperCase(),
        patientName,
        notes,
        contactPhone1: contactPhone1.trim() || null,
        contactPhone2: contactPhone2.trim() || null,
      });
      const norm = normalizeRequest(created);
      setRequests(r=>[norm,...r]);
      setSentCount(norm.sent);
      setSent(true);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      setBloodGroup(""); setUnits(1); setDonorsNeeded(2);
      setUrgency("urgent"); setPatientName(""); setNotes("");
      setContactPhone1(""); setContactPhone2(""); setErrors({});
    }catch(e){ setErrors({submit: e.message}); }
    finally{ setSending(false); }
  }

  async function cancelRequest(id){
    setCancelLoading(true);
    try{
      const updated = normalizeRequest(await cancelBloodRequest(token, id));
      setRequests(r=>r.map(x=>x.id===id?updated:x));
      setCancelId(null);
    }catch(e){ alert(e.message); }
    finally{ setCancelLoading(false); }
  }

  /* ── Stepper component ── */
  const Stepper=({value, onDec, onInc, min=1, max=50, color="#1d6fb8", suffix=""})=>(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <button type="button" className="step-btn" onClick={onDec}>−</button>
      <div style={{flex:1,textAlign:"center",fontSize:22,fontWeight:800,color,fontFamily:"'Lora',serif"}}>{value}</div>
      <button type="button" className="step-btn" onClick={onInc}>+</button>
      {suffix&&<span style={{fontSize:12,color:"#94a3b8",fontWeight:500,whiteSpace:"nowrap"}}>{suffix}</span>}
    </div>
  );

  return(
    <div ref={topRef} style={{display:"flex",flexDirection:"column",gap:18}}>

      {/* ── Tabs ── */}
      <div className="fu" style={{display:"flex",background:"#f1f5f9",borderRadius:11,padding:4,gap:0}}>
        {[{key:"new",label:"📢 New Request"},{key:"history",label:"📋 History"}].map(t=>(
          <button key={t.key} onClick={()=>{setSent(false);setTab(t.key);closeDetail();}}
            style={{flex:1,padding:"8px 12px",borderRadius:8,border:"none",background:tab===t.key?"#fff":"transparent",color:tab===t.key?"#1d6fb8":"#64748b",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:tab===t.key?"0 1px 6px #00000012":"none",transition:"all .2s",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ NEW REQUEST ══════════ */}
      {tab==="new" && <>

        {errors.submit&&<div className="fu" style={{background:"#fef2f2",border:"1.5px solid #fca5a5",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#dc2626",fontWeight:500}}>⚠ {errors.submit}</div>}

        {/* Success banner */}
        {sent&&(
          <div className="fu" style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"2px solid #86efac",borderRadius:13,padding:"16px 18px"}}>
            <div style={{display:"flex",gap:12}}>
              <div style={{fontSize:32,flexShrink:0}}>✅</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#15803d",marginBottom:3}}>Blood request sent successfully!</div>
                <div style={{fontSize:12.5,color:"#166534",marginBottom:4}}>Donor matching is running in the background.</div>
                <div style={{fontSize:12,color:"#166534"}}>Go to <strong>History → click the request</strong> in a few seconds to see notified donors.</div>
                <button onClick={()=>setSent(false)} className="btn-ghost" style={{marginTop:8,padding:"5px 12px",fontSize:12}}>Send another</button>
              </div>
            </div>
          </div>
        )}

        <div className="form-grid-2">

          {/* ── Left: Request Details ── */}
          <div className="card fu d1" style={{display:"flex",flexDirection:"column",gap:18}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>🩸</span>
              <span style={{fontSize:15,fontWeight:700,fontFamily:"'Lora',serif",color:"#1a2332"}}>Request Details</span>
            </div>

            {/* Patient name */}
            <div>
              <label style={lbl}>Patient Name <span style={{color:"#dc2626"}}>*</span></label>
              <input className="inp-plain" placeholder="e.g. Rahul Verma" value={patientName}
                onChange={e=>{setPatientName(e.target.value);setErrors(er=>({...er,patientName:""}));}}/>
              {errors.patientName&&<p style={{fontSize:11.5,color:"#dc2626",marginTop:4}}>⚠ {errors.patientName}</p>}
            </div>

            {/* Blood group */}
            <div>
              <label style={lbl}>Blood Group Required <span style={{color:"#dc2626"}}>*</span></label>
              <div className="bg-grid">
                {BLOOD_GROUPS.map(bg=>(
                  <button key={bg} type="button" className="bg-btn"
                    onClick={()=>{setBloodGroup(bg);setErrors(er=>({...er,bloodGroup:""}));}}
                    style={{border:`2px solid ${bloodGroup===bg?"#1d6fb8":"#e2e8f0"}`,background:bloodGroup===bg?"linear-gradient(135deg,#1d6fb8,#0ea5e9)":"#f8fafc",color:bloodGroup===bg?"#fff":"#475569",boxShadow:bloodGroup===bg?"0 3px 10px #1d6fb830":"none"}}>
                    {bg}
                  </button>
                ))}
              </div>
              {errors.bloodGroup&&<p style={{fontSize:11.5,color:"#dc2626",marginTop:4}}>⚠ {errors.bloodGroup}</p>}
            </div>

            {/* Units needed */}
            <div>
              <label style={lbl}>Units Needed <span style={{color:"#dc2626"}}>*</span></label>
              <Stepper
                value={units}
                onDec={()=>changeUnits(Math.max(1,units-1))}
                onInc={()=>changeUnits(Math.min(10,units+1))}
                color="#1d6fb8"
                suffix={`unit${units>1?"s":""} of blood`}
              />
              {errors.units&&<p style={{fontSize:11.5,color:"#dc2626",marginTop:4}}>⚠ {errors.units}</p>}
            </div>

            {/* ── Donors to accept ── */}
            <div style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:12,padding:"14px 16px"}}>
              <label style={{...lbl,marginBottom:4}}>
                Donors to Accept <span style={{color:"#dc2626"}}>*</span>
              </label>
              <p style={{fontSize:11.5,color:"#94a3b8",marginBottom:10,lineHeight:1.5}}>
                Select how many donors should accept this request.
                Must be <strong style={{color:"#1d6fb8"}}>greater than {units} unit{units>1?"s":""}</strong> required — extras serve as backup.
              </p>
              <Stepper
                value={donorsNeeded}
                onDec={()=>setDonorsNeeded(d=>Math.max(units+1,d-1))}
                onInc={()=>setDonorsNeeded(d=>Math.min(50,d+1))}
                color={donorsNeeded>units?"#0f766e":"#dc2626"}
                suffix={`donor${donorsNeeded>1?"s":""}`}
              />
              {/* live validation pill */}
              <div style={{marginTop:10,display:"flex",alignItems:"center",gap:7,background:donorsNeeded>units?"#f0fdf4":"#fef2f2",border:`1px solid ${donorsNeeded>units?"#86efac":"#fca5a5"}`,borderRadius:8,padding:"7px 12px"}}>
                <span style={{fontSize:14}}>{donorsNeeded>units?"✅":"⚠️"}</span>
                <span style={{fontSize:12,fontWeight:600,color:donorsNeeded>units?"#15803d":"#dc2626",lineHeight:1.4}}>
                  {donorsNeeded>units
                    ? `${donorsNeeded} donors requested for ${units} unit${units>1?"s":""} — ${donorsNeeded-units} backup donor${donorsNeeded-units>1?"s":""} included`
                    : `Donors needed must be greater than ${units} unit${units>1?"s":""} required`}
                </span>
              </div>
              {errors.donorsNeeded&&<p style={{fontSize:11.5,color:"#dc2626",marginTop:6}}>⚠ {errors.donorsNeeded}</p>}
            </div>

            {/* Notes */}
            <div>
              <label style={lbl}>Additional Notes (optional)</label>
              <textarea className="inp-plain" placeholder="e.g. Post-surgery, accident victim…" rows={3} value={notes}
                onChange={e=>setNotes(e.target.value)} style={{resize:"vertical",minHeight:68}}/>
            </div>

          </div>

          {/* ── Right: Urgency + Contact Phones ── */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Urgency */}
            <div className="card fu d2">
              <div style={{fontSize:14,fontWeight:700,fontFamily:"'Lora',serif",color:"#1a2332",marginBottom:12}}>⚡ Urgency Level</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {URGENCY_LEVELS.map(u=>(
                  <div key={u.key} onClick={()=>setUrgency(u.key)}
                    style={{border:`2px solid ${urgency===u.key?u.color:"#e2e8f0"}`,borderRadius:11,padding:"10px 13px",cursor:"pointer",background:urgency===u.key?u.bg:"#fff",transition:"all .2s",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:13,height:13,borderRadius:"50%",border:`2px solid ${u.color}`,background:urgency===u.key?u.color:"transparent",flexShrink:0,transition:"all .2s"}}/>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:urgency===u.key?u.color:"#475569"}}>{u.label}</div>
                      <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>{u.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact phones — revealed to donor only after accept */}
            <div className="card fu" style={{background:"#f0f7ff",border:"1.5px solid #bfdbfe",display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:14,fontWeight:700,fontFamily:"'Lora',serif",color:"#1d4ed8",display:"flex",alignItems:"center",gap:6}}>
                📞 Contact Numbers for Donors
              </div>
              <div style={{fontSize:11.5,color:"#64748b",marginTop:-6,lineHeight:1.5}}>
                These numbers will only be shown to a donor <strong>after they accept</strong> this request.
              </div>
              <div>
                <label style={lbl}>Primary Contact Number <span style={{color:"#dc2626"}}>*</span></label>
                <input className="inp-plain" placeholder="e.g. 9876543210" maxLength={15} value={contactPhone1}
                  onChange={e=>{setContactPhone1(e.target.value.replace(/[^0-9+\-\s]/g,""));setErrors(er=>({...er,contactPhone1:""}));}}/>
                {errors.contactPhone1&&<p style={{fontSize:11.5,color:"#dc2626",marginTop:4}}>⚠ {errors.contactPhone1}</p>}
              </div>
              <div>
                <label style={lbl}>Secondary Contact Number (optional)</label>
                <input className="inp-plain" placeholder="e.g. 9876543211" maxLength={15} value={contactPhone2}
                  onChange={e=>setContactPhone2(e.target.value.replace(/[^0-9+\-\s]/g,""))}/>
              </div>
            </div>

          </div>
        </div>

        {/* Send button bar */}
        <div className="fu d4" style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:200}}>
              {bloodGroup
                ?<><div style={{fontSize:13,fontWeight:600,color:"#1a2332"}}>Ready to broadcast <span style={{color:"#1d6fb8"}}>{bloodGroup}</span>{patientName&&<> for <span style={{color:"#1d6fb8"}}>{patientName}</span></>}</div>
                  <div style={{fontSize:11.5,color:"#94a3b8",marginTop:2}}>
                    {units} unit{units>1?"s":""} · <span style={{fontWeight:600,color:urgencyColor[urgency]}}>{urgency.charAt(0).toUpperCase()+urgency.slice(1)}</span>
                    · <span style={{color:"#0f766e",fontWeight:600}}>{donorsNeeded} donors to accept</span>
                  </div></>
                :<div style={{fontSize:13,color:"#94a3b8"}}>Fill in the details above to send a blood request broadcast</div>}
            </div>
            <button className="btn-primary" onClick={handleSend} disabled={sending}
              style={{display:"flex",alignItems:"center",gap:8,minWidth:160,justifyContent:"center",opacity:sending?0.8:1,flexShrink:0}}>
              {sending?<><span className="spin" style={{width:16,height:16,border:"2px solid #fff5",borderTop:"2px solid #fff",borderRadius:"50%",display:"inline-block"}}/> Sending…</>:<><span style={{fontSize:15}}>📢</span> Send Blood Request</>}
            </button>
          </div>
        </div>
      </>}

      {/* ══════════ HISTORY — DETAIL VIEW ══════════ */}
      {tab==="history" && selectedRequest && (
        <RequestDetailView
          request={selectedRequest}
          donors={donorDetails}
          loading={loadingDonors}
          error={donorError}
          onBack={closeDetail}
        />
      )}

      {/* ══════════ HISTORY — LIST ══════════ */}
      {tab==="history" && !selectedRequest &&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Refresh bar */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
            <div style={{fontSize:12,color:"#94a3b8"}}>
              {lastUpdated?"Last updated: "+lastUpdated.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"Loading…"}
            </div>
            <button
              onClick={()=>loadRequests(true)}
              disabled={refreshing||loadingReqs}
              style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",background:"#fff",fontSize:12,fontWeight:600,color:"#1d6fb8",cursor:"pointer",opacity:(refreshing||loadingReqs)?0.6:1,transition:"opacity .2s"}}>
              {refreshing
                ?<><span style={{width:12,height:12,border:"2px solid #1d6fb866",borderTop:"2px solid #1d6fb8",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/> Refreshing…</>
                :<>↻ Refresh</>}
            </button>
          </div>
          {loadingReqs&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>{[0,1,2,3].map(i=><div key={i} className="skeleton" style={{height:80,borderRadius:12}}/>)}</div>}
          {/* Summary */}
          {!loadingReqs&&<div className="hist-grid fu">
            {[
              {label:"Total Requests",value:requests.length,color:"#1d6fb8",bg:"#eff6ff"},
              {label:"Active",value:requests.filter(r=>r.status==="active").length,color:"#a16207",bg:"#fef9c3"},
              {label:"Fulfilled",value:requests.filter(r=>r.status==="fulfilled").length,color:"#15803d",bg:"#dcfce7"},
              {label:"Total Notified",value:requests.reduce((a,r)=>a+r.sent,0),color:"#7c3aed",bg:"#f5f3ff"},
              {label:"Total Accepted",value:requests.reduce((a,r)=>a+r.accepted,0),color:"#0f766e",bg:"#f0fdfa"},
              {label:"Total Declined",value:requests.reduce((a,r)=>a+r.declined,0),color:"#dc2626",bg:"#fef2f2"},
            ].map(s=>(
              <div key={s.label} className="stat" style={{background:s.bg,padding:"12px 14px"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:3}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:800,color:s.color,fontFamily:"'Lora',serif"}}>{s.value}</div>
              </div>
            ))}
          </div>}
          {!loadingReqs&&requests.length===0&&<div style={{textAlign:"center",padding:"32px 16px",color:"#94a3b8"}}><div style={{fontSize:32,marginBottom:8}}>📋</div><div style={{fontSize:13,fontWeight:600}}>No blood requests sent yet</div></div>}

          {/* Per-request cards */}
          {requests.map((r,i)=>(
            <div key={r.id} className={`fu d${Math.min(i+1,5)}`}
              style={{background:"#fff",border:`1.5px solid ${urgencyBg[r.urgency]}`,borderLeft:`4px solid ${urgencyColor[r.urgency]}`,borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"box-shadow .2s"}}
              onClick={()=>openDetail(r)}>

              {/* Header */}
              <div style={{padding:"14px 16px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
                  <div style={{width:46,height:46,background:`linear-gradient(135deg,${urgencyColor[r.urgency]}22,${urgencyBg[r.urgency]})`,border:`2px solid ${urgencyColor[r.urgency]}40`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:urgencyColor[r.urgency],flexShrink:0}}>{r.blood}</div>
                  <div style={{minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:14,fontWeight:700,color:"#1a2332"}}>{r.patient}</span>
                      <span className={`badge ${urgencyBadge[r.urgency]}`}>{r.urgency.charAt(0).toUpperCase()+r.urgency.slice(1)}</span>
                      {r.status==="active"&&<span className="badge badge-blue">🔴 Live</span>}
                      {r.status==="fulfilled"&&<span className="badge badge-green">✓ Fulfilled</span>}
                      {r.status==="cancelled"&&<span className="badge badge-gray">Cancelled</span>}
                    </div>
                    <div style={{fontSize:11.5,color:"#64748b",display:"flex",flexWrap:"wrap",gap:8}}>
                      <span>🩸 {r.blood} · {r.units} unit{r.units>1?"s":""}</span>
                      <span>👥 {r.donorsNeeded} donors needed</span>
                      <span>📅 {r.date ? (() => { const dt = new Date(r.date); return dt.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) + ", " + dt.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}); })() : "—"}</span>
                      {r.notes&&<span>📝 {r.notes}</span>}
                      <span style={{color:"#7c3aed",fontWeight:600}}>🔺 Escalation level {r.escalation}</span>
                    </div>
                  </div>
                </div>
                {r.status==="active"&&<button className="btn-danger" style={{padding:"5px 12px",fontSize:12,flexShrink:0}} onClick={e=>{e.stopPropagation();setCancelId(r.id);}}>Cancel</button>}
              </div>

              {/* Tracker */}
              <div style={{background:"#f8fafc",borderTop:"1px solid #f1f5f9",padding:"14px 16px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".6px",marginBottom:12}}>📊 Notification Tracker</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(90px,1fr))",gap:10,marginBottom:14}}>
                  {[
                    {icon:"📤",label:"Notified", value:r.sent,     color:"#1d6fb8",bg:"#eff6ff"},
                    {icon:"✅",label:"Accepted", value:r.accepted,  color:"#15803d",bg:"#dcfce7"},
                    {icon:"❌",label:"Declined", value:r.declined,  color:"#dc2626",bg:"#fee2e2"},
                    {icon:"⏳",label:"Pending",  value:r.pending,   color:"#a16207",bg:"#fef9c3"},
                  ].map(s=>(
                    <div key={s.label} style={{background:s.bg,borderRadius:10,padding:"10px 12px",textAlign:"center",border:`1px solid ${s.color}18`}}>
                      <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                      <div style={{fontSize:20,fontWeight:800,color:s.color,fontFamily:"'Lora',serif",lineHeight:1}}>{s.value}</div>
                      <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".4px",marginTop:3}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Stacked bar */}
                {r.sent>0&&(()=>{
                  const accPct=Math.round((r.accepted/r.sent)*100);
                  const decPct=Math.round((r.declined/r.sent)*100);
                  const pendPct=100-accPct-decPct;
                  return(
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:"#94a3b8",marginBottom:5}}><span>Response breakdown</span><span style={{fontWeight:700,color:"#1a2332"}}>{accPct+decPct}% responded</span></div>
                      <div style={{display:"flex",height:10,borderRadius:999,overflow:"hidden",background:"#e2e8f0"}}>
                        {accPct>0&&<div style={{width:`${accPct}%`,background:"#22c55e",transition:"width .8s"}}/>}
                        {decPct>0&&<div style={{width:`${decPct}%`,background:"#ef4444",transition:"width .8s"}}/>}
                        {pendPct>0&&<div style={{width:`${pendPct}%`,background:"#fbbf24",transition:"width .8s"}}/>}
                      </div>
                      <div style={{display:"flex",gap:14,marginTop:7,flexWrap:"wrap"}}>
                        {[{color:"#22c55e",label:`Accepted ${accPct}%`},{color:"#ef4444",label:`Declined ${decPct}%`},{color:"#fbbf24",label:`Pending ${pendPct}%`}].map(l=>(
                          <div key={l.label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#64748b"}}>
                            <div style={{width:9,height:9,borderRadius:2,background:l.color,flexShrink:0}}/>{l.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Click hint */}
                <div style={{marginTop:10,fontSize:11.5,color:"#1d6fb8",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                  👥 Click to view donor details →
                </div>

                {/* Donor goal bar */}
                <div style={{marginTop:8,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:20}}>{r.accepted>=r.donorsNeeded?"🎯":"🔄"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#1a2332",marginBottom:3}}>
                      {r.accepted>=r.donorsNeeded
                        ?`✓ All ${r.donorsNeeded} required donors have accepted`
                        :`${r.accepted} of ${r.donorsNeeded} required donors accepted — ${r.donorsNeeded-r.accepted} more needed`}
                    </div>
                    <div className="prog-track" style={{height:6}}>
                      <div className="prog-fill" style={{width:`${Math.min(100,Math.round((r.accepted/r.donorsNeeded)*100))}%`,background:r.accepted>=r.donorsNeeded?"linear-gradient(90deg,#22c55e,#16a34a)":"linear-gradient(90deg,#f59e0b,#fbbf24)"}}/>
                    </div>
                  </div>
                  <div style={{fontSize:13,fontWeight:800,color:r.accepted>=r.donorsNeeded?"#15803d":"#a16207",fontFamily:"'Lora',serif",flexShrink:0}}>
                    {Math.min(100,Math.round((r.accepted/r.donorsNeeded)*100))}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel modal */}
      {cancelId&&(
        <div className="overlay" onClick={()=>setCancelId(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:18}}>
              <div style={{fontSize:38,marginBottom:8}}>⚠️</div>
              <h3 style={{margin:0,fontSize:16,fontFamily:"'Lora',serif",color:"#1a2332",marginBottom:7}}>Cancel this blood request?</h3>
              <p style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>Donors who haven't responded will no longer see this request.</p>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" onClick={()=>setCancelId(null)} style={{flex:1}} disabled={cancelLoading}>Keep Active</button>
              <button onClick={()=>cancelRequest(cancelId)} disabled={cancelLoading} style={{flex:1,background:"#dc2626",color:"#fff",border:"none",borderRadius:9,padding:"9px 16px",fontWeight:700,fontSize:13,cursor:"pointer",opacity:cancelLoading?0.7:1}}>
                {cancelLoading?"Cancelling…":"Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── LOGOUT MODAL ── */
function LogoutModal({onConfirm,onCancel}){
  return(
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:8}}>👋</div>
          <h3 style={{margin:0,fontSize:17,fontFamily:"'Lora',serif",color:"#1a2332",marginBottom:7}}>Log out of Blood Bridge?</h3>
          <p style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>You'll need to log in again to access the hospital dashboard.</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-ghost" onClick={onCancel} style={{flex:1}}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} style={{flex:1}}>Yes, Logout</button>
        </div>
      </div>
    </div>
  );
}

/* ── ROOT ── */
export default function HospitalDashboard(){
  const routerNav                    = useNavigate();
  const [page,setPage]               = useState("dashboard");
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [showLogout,setShowLogout]   = useState(false);
  const [loggedOut,setLoggedOut]     = useState(false);
  const [loading,setLoading]         = useState(true);
  const [hospital,setHospital]       = useState(MOCK_H);
  const [fetchError,setFetchError]   = useState("");

  useEffect(()=>{
    const token = localStorage.getItem("bb_token");
    if(!token){ routerNav("/hospital-login"); return; }
    getHospitalProfile(token)
      .then(data=>{ setHospital(data); setLoading(false); })
      .catch(err=>{ setFetchError(err.message); setLoading(false); });
  },[]);

  function navigate(p){setPage(p);setSidebarOpen(false);}

  if(loggedOut) return(
    <><G/>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f4f8"}}>
        <div className="fi" style={{textAlign:"center",padding:"0 20px"}}>
          <div style={{fontSize:50,marginBottom:12}}>🏥</div>
          <div style={{fontSize:20,fontFamily:"'Lora',serif",fontWeight:700,color:"#1a2332",marginBottom:5}}>See you soon!</div>
          <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>You've been logged out of Blood Bridge.</div>
          <button className="btn-primary" onClick={()=>routerNav("/hospital-login")}>← Back to Login</button>
        </div>
      </div>
    </>
  );

  if(loading) return(
    <><G/>
      <div style={{display:"flex",minHeight:"100vh"}}>
        <div style={{width:240,background:"#fff",borderRight:"1px solid #e8edf5",padding:20,display:"flex",flexDirection:"column",gap:12}}>
          {[100,70,70,70,70,70,70].map((w,i)=><div key={i} className="skeleton" style={{height:14,width:`${w}%`,marginBottom:4}}/>)}
        </div>
        <div style={{flex:1,padding:24}}>
          <div className="skeleton" style={{height:20,width:"40%",marginBottom:8}}/>
          <div className="skeleton" style={{height:13,width:"25%",marginBottom:24}}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>{[0,1,2,3].map(i=><div key={i} className="skeleton" style={{height:100}}/>)}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{[0,1,2,3].map(i=><div key={i} className="skeleton" style={{height:170}}/>)}</div>
        </div>
      </div>
    </>
  );

  if(fetchError) return(
    <><G/>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f4f8"}}>
        <div style={{textAlign:"center",padding:"0 20px"}}>
          <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
          <div style={{fontSize:16,fontFamily:"'Lora',serif",fontWeight:700,color:"#1a2332",marginBottom:6}}>Failed to load dashboard</div>
          <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>{fetchError}</div>
          <button className="btn-primary" onClick={()=>routerNav("/hospital-login")}>← Back to Login</button>
        </div>
      </div>
    </>
  );

  return(
    <HCtx.Provider value={hospital}>
    <><G/>
      <div className="layout">
        <Sidebar active={page} setActive={navigate} onLogout={()=>{setSidebarOpen(false);setShowLogout(true);}} open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>
        <div className="main">
          <TopBar page={page} setPage={navigate} onMenuClick={()=>setSidebarOpen(o=>!o)}/>
          <main className="content">
            {page==="dashboard" && <DashboardPage setPage={navigate}/>}
            {page==="profile"   && <ProfilePage/>}
            {page==="broadcast" && <BloodRequestPage/>}
            {page==="contact"   && <ContactPage/>}
            {page==="settings"  && <SettingsPage/>}
          </main>
        </div>
        {showLogout&&<LogoutModal onConfirm={()=>setLoggedOut(true)} onCancel={()=>setShowLogout(false)}/>}
      </div>
    </>
    </HCtx.Provider>
  );
}