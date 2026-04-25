import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

    .doc-card{background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:14px;transition:all .2s}
    .doc-card:hover{border-color:#93c5fd;background:#f0f7ff}

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
    .range-btns{display:flex;justify-content:space-between;margin-top:6px;flex-wrap:wrap;gap:4px}

    /* stepper button shared style */
    .step-btn{width:36px;height:36px;border-radius:9px;border:1.5px solid #e2e8f0;background:#f8fafc;font-size:18px;font-weight:700;cursor:pointer;color:#475569;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
    .step-btn:hover{background:#e0f2fe;border-color:#7dd3fc}
  `}</style>
);

/* ── Mock Data ── */
const H = {
  name:"AIIMS Patna",type:"Government",regNo:"BR-HOSP-2009-00142",year:2012,website:"https://aiimspatna.edu.in",
  street:"Phulwari Sharif",area:"Phulwari Sharif",city:"Patna",state:"Bihar",pincode:"801505",landmark:"Near Bailey Road",lat:"25.5605",lng:"85.1048",
  contact:"Dr. Sanjay Verma",role:"Medical Superintendent",phone:"9876543210",altPhone:"0612-2345678",email:"admin@aiimspatna.edu.in",
  beds:962,icuBeds:120,hasBloodBank:true,is24x7:true,bbLicense:"BB-BR-2012-AIIMS",completion:82,
};
const HOURS=[{day:"Monday",open:true},{day:"Tuesday",open:true},{day:"Wednesday",open:true},{day:"Thursday",open:true},{day:"Friday",open:true},{day:"Saturday",open:true},{day:"Sunday",open:true}];
const DOCS=[
  {id:1,name:"Hospital License Certificate",icon:"📋",status:"verified",date:"2024-01-10",size:"1.2 MB"},
  {id:2,name:"Government Approval Document",icon:"🏛️",status:"verified",date:"2024-01-10",size:"870 KB"},
  {id:3,name:"Blood Bank Certification",icon:"🩸",status:"pending",date:"2024-03-05",size:"640 KB"},
];
const STATS=[
  {icon:"🛏️",label:"Total Beds",value:"962",sub:"Operational",color:"#1d6fb8",bg:"#eff6ff"},
  {icon:"🚨",label:"ICU / Emergency",value:"120",sub:"Critical care",color:"#dc2626",bg:"#fef2f2"},
  {icon:"🩸",label:"Blood Bank",value:"Active",sub:"Licensed",color:"#0f766e",bg:"#f0fdfa"},
  {icon:"📅",label:"Est. Year",value:"2012",sub:"13 yrs active",color:"#7c3aed",bg:"#f5f3ff"},
];
const BLOOD_GROUPS=["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const URGENCY_LEVELS=[
  {key:"normal",label:"Normal",color:"#15803d",bg:"#dcfce7",desc:"Standard request, within 24 hrs"},
  {key:"urgent",label:"Urgent",color:"#a16207",bg:"#fef9c3",desc:"Required within 6–12 hours"},
  {key:"critical",label:"Critical",color:"#dc2626",bg:"#fee2e2",desc:"Immediate — all nearby donors alerted"},
];
const INIT_REQUESTS=[
  {id:1,blood:"B+",units:2,donorsNeeded:5,urgency:"critical",distance:5,date:"2025-04-24",sent:42,accepted:7,declined:5,pending:30,status:"active",patient:"Rahul Verma",notes:"Post-surgery",escalation:2},
  {id:2,blood:"O-",units:4,donorsNeeded:8,urgency:"urgent",distance:15,date:"2025-04-22",sent:118,accepted:23,declined:41,pending:54,status:"active",patient:"Priya Mehta",notes:"Accident victim",escalation:3},
  {id:3,blood:"AB+",units:1,donorsNeeded:3,urgency:"normal",distance:10,date:"2025-04-18",sent:31,accepted:4,declined:18,pending:9,status:"fulfilled",patient:"Suresh Das",notes:"Scheduled surgery",escalation:1},
  {id:4,blood:"A+",units:3,donorsNeeded:6,urgency:"urgent",distance:20,date:"2025-04-15",sent:87,accepted:12,declined:33,pending:42,status:"fulfilled",patient:"Anjali Singh",notes:"Thalassemia patient",escalation:2},
];

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

/* ── SIDEBAR ── */
function Sidebar({active,setActive,onLogout,open,onClose}){
  const nav=[
    {key:"dashboard",label:"Overview",icon:Ico.dashboard},
    {key:"profile",label:"Hospital Profile",icon:Ico.profile},
    {key:"broadcast",label:"Send Blood Request",icon:Ico.broadcast},
    {key:"docs",label:"Documents",icon:Ico.docs},
    {key:"facility",label:"Facilities",icon:Ico.facility},
    {key:"contact",label:"Contact Info",icon:Ico.contact},
    {key:"hours",label:"Operating Hours",icon:Ico.clock},
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
          <div style={{marginTop:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9.5,color:"#94a3b8",marginBottom:3}}><span>Profile completion</span><span style={{fontWeight:700,color:"#1d6fb8"}}>{H.completion}%</span></div>
            <div className="prog-track" style={{height:5}}><div className="prog-fill" style={{width:`${H.completion}%`,background:"linear-gradient(90deg,#1d6fb8,#0ea5e9)"}}/></div>
          </div>
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
  const labels={dashboard:"Dashboard",profile:"Hospital Profile",broadcast:"Blood Request",docs:"Documents",facility:"Facilities",contact:"Contact Info",hours:"Operating Hours",settings:"Settings"};
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
          {H.contact.split(" ").map(w=>w[0]).join("").slice(0,2)}
        </div>
      </div>
    </header>
  );
}

/* ── DASHBOARD ── */
function DashboardPage({setPage}){
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
            {H.hasBloodBank&&<span style={{background:"#ffffff20",border:"1px solid #ffffff30",borderRadius:999,padding:"2px 10px",fontSize:11,fontWeight:600}}>🩸 Blood Bank Active</span>}
          </div>
        </div>
      </div>
      <div className="stat-grid">
        {STATS.map((s,i)=>(
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
          {[{l:"Registration No.",v:H.regNo},{l:"Year Established",v:H.year},{l:"Website",v:H.website},{l:"Operating",v:"24 × 7 (All days)"}].map(r=>(
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
        <div className="card fu d4">
          <SectionHead title="Document Status" icon="📄" onEdit={()=>setPage("docs")} editLabel="View all"/>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {DOCS.map(d=>(
              <div key={d.id} className="doc-card">
                <span style={{fontSize:18,flexShrink:0}}>{d.icon}</span>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"#1a2332",marginBottom:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.name}</div><div style={{fontSize:10.5,color:"#94a3b8"}}>{new Date(d.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div></div>
                <StatusBadge status={d.status}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PROFILE ── */
function ProfilePage(){
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({...H});
  const [saved,setSaved]=useState(false);
  function save(){setEditing(false);setSaved(true);setTimeout(()=>setSaved(false),3000);}
  const types=["Government","Private","NGO / Trust","Blood Bank Only","Multi-Specialty"];
  const F=({label,id,type="text",children})=>(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <span style={lbl}>{label}</span>
      {children?editing?children:<span style={val}>{form[id]||"—"}</span>:editing?<input type={type} className="inp-plain" value={form[id]||""} onChange={e=>setForm(f=>({...f,[id]:e.target.value}))}/>:<span style={val}>{form[id]||"—"}</span>}
    </div>
  );
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
          <F label="Hospital Name" id="name"/><F label="Registration / License ID" id="regNo"/>
          <F label="Hospital Type" id="type">{editing&&<select className="inp-plain" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{types.map(t=><option key={t}>{t}</option>)}</select>}</F>
          <F label="Year Established" id="year" type="number"/><F label="Website URL" id="website"/>
        </div>
      </div>
      <div className="card fu d1">
        <SectionHead title="Address Details" icon="📍"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:14}}>
          <div style={{gridColumn:"1/-1"}}><F label="Street Address" id="street"/></div>
          <F label="Area / Locality" id="area"/><F label="City" id="city"/><F label="State" id="state"/><F label="Pincode" id="pincode"/><F label="Landmark" id="landmark"/><F label="Latitude" id="lat"/><F label="Longitude" id="lng"/>
        </div>
        <MapPreview city={form.city} state={form.state} lat={form.lat} lng={form.lng}/>
      </div>
    </div>
  );
}

/* ── DOCUMENTS ── */
function DocsPage(){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div className="card fu">
        <SectionHead title="Documents & Verification" icon="📄"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12}}>
          {DOCS.map((d,i)=>(
            <div key={d.id} className={`fu d${i+1}`} style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:13,padding:16}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
                <div style={{width:40,height:40,background:d.status==="verified"?"#dcfce7":d.status==="rejected"?"#fee2e2":"#fef9c3",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{d.icon}</div>
                <div style={{minWidth:0}}><div style={{fontSize:12.5,fontWeight:700,color:"#1a2332",marginBottom:2,wordBreak:"break-word"}}>{d.name}</div><div style={{fontSize:10.5,color:"#94a3b8"}}>Uploaded {new Date(d.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} · {d.size}</div></div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <StatusBadge status={d.status}/>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn-ghost" style={{padding:"4px 10px",fontSize:11.5,display:"flex",alignItems:"center",gap:4}}>{Ico.eye} View</button>
                  <button className="btn-ghost" style={{padding:"4px 10px",fontSize:11.5,display:"flex",alignItems:"center",gap:4}}>{Ico.download}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card fu d2">
        <SectionHead title="Upload New Document" icon="⬆️"/>
        <div style={{border:"2px dashed #bfdbfe",borderRadius:12,padding:"28px 16px",textAlign:"center",background:"#f0f7ff",cursor:"pointer"}}>
          <div style={{fontSize:30,marginBottom:7}}>📂</div>
          <div style={{fontSize:13.5,fontWeight:600,color:"#1d6fb8",marginBottom:3}}>Drop file here or browse</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>PDF, JPG, PNG · Max 5MB</div>
        </div>
      </div>
    </div>
  );
}

/* ── FACILITIES ── */
function FacilityPage(){
  const [form,setForm]=useState({beds:H.beds,icuBeds:H.icuBeds,hasBloodBank:H.hasBloodBank,bbLicense:H.bbLicense});
  const [editing,setEditing]=useState(false);
  const [saved,setSaved]=useState(false);
  function save(){setEditing(false);setSaved(true);setTimeout(()=>setSaved(false),3000);}
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {saved&&<div className="fu" style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#15803d",fontWeight:600}}>✅ Facilities updated!</div>}
      <div className="card fu">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:17}}>🏥</span><span style={{fontSize:15,fontWeight:700,fontFamily:"'Lora',serif"}}>Capacity</span></div>
          <div style={{display:"flex",gap:8}}>{editing?<><button className="btn-ghost" onClick={()=>setEditing(false)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>:<button className="btn-ghost" onClick={()=>setEditing(true)} style={{display:"flex",alignItems:"center",gap:5}}>{Ico.edit} Edit</button>}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14}}>
          {[{label:"Total Beds",key:"beds",icon:"🛏️",color:"#1d6fb8",bg:"#eff6ff"},{label:"ICU / Emergency",key:"icuBeds",icon:"🚨",color:"#dc2626",bg:"#fef2f2"}].map(f=>(
            <div key={f.key} style={{background:f.bg,borderRadius:11,padding:"14px 16px",border:"1.5px solid #e2e8f0"}}>
              <div style={{fontSize:20,marginBottom:7}}>{f.icon}</div>
              <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:4}}>{f.label}</div>
              {editing?<input type="number" className="inp-plain" value={form[f.key]} style={{fontSize:20,fontWeight:800,color:f.color,background:"#fff",padding:"5px 8px"}} onChange={e=>setForm(x=>({...x,[f.key]:e.target.value}))}/>:<div style={{fontSize:26,fontWeight:800,color:f.color,fontFamily:"'Lora',serif"}}>{form[f.key]}</div>}
            </div>
          ))}
          <div style={{background:"#f5f3ff",borderRadius:11,padding:"14px 16px",border:"1.5px solid #e2e8f0"}}>
            <div style={{fontSize:20,marginBottom:7}}>📊</div>
            <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:4}}>ICU % of Total</div>
            <div style={{fontSize:26,fontWeight:800,color:"#7c3aed",fontFamily:"'Lora',serif"}}>{Math.round((form.icuBeds/form.beds)*100)}%</div>
            <div className="prog-track" style={{marginTop:7}}><div className="prog-fill" style={{width:`${Math.round((form.icuBeds/form.beds)*100)}%`,background:"linear-gradient(90deg,#7c3aed,#a78bfa)"}}/></div>
          </div>
        </div>
      </div>
      <div className="card fu d1">
        <SectionHead title="Blood Bank" icon="🩸"/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,cursor:editing?"pointer":"default"}} onClick={()=>editing&&setForm(f=>({...f,hasBloodBank:!f.hasBloodBank}))}>
          <div style={{width:46,height:24,background:form.hasBloodBank?"#10b981":"#e2e8f0",borderRadius:999,position:"relative",transition:"background .25s",flexShrink:0}}>
            <div style={{position:"absolute",width:18,height:18,background:"#fff",borderRadius:"50%",top:3,left:form.hasBloodBank?24:3,transition:"left .25s"}}/>
          </div>
          <div><div style={{fontSize:13,fontWeight:600,color:"#1a2332"}}>Blood Bank {form.hasBloodBank?"Available":"Not Available"}</div><div style={{fontSize:11,color:"#94a3b8"}}>{form.hasBloodBank?"Licensed and operational":"Not registered"}</div></div>
          {form.hasBloodBank&&<span className="badge badge-teal" style={{marginLeft:"auto"}}>✓ Active</span>}
        </div>
        {form.hasBloodBank&&<div><span style={lbl}>Blood Bank License No.</span>{editing?<input className="inp-plain" value={form.bbLicense||""} onChange={e=>setForm(f=>({...f,bbLicense:e.target.value}))}/>:<span style={val}>{form.bbLicense}</span>}</div>}
      </div>
    </div>
  );
}

/* ── CONTACT ── */
function ContactPage(){
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({contact:H.contact,role:H.role,phone:H.phone,altPhone:H.altPhone,email:H.email});
  const [saved,setSaved]=useState(false);
  function save(){setEditing(false);setSaved(true);setTimeout(()=>setSaved(false),3000);}
  const F=({label,id,type="text"})=>(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <span style={lbl}>{label}</span>
      {editing?<input type={type} className="inp-plain" value={form[id]||""} onChange={e=>setForm(f=>({...f,[id]:e.target.value}))}/>:<span style={val}>{form[id]||"—"}</span>}
    </div>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {saved&&<div className="fu" style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#15803d",fontWeight:600}}>✅ Contact info saved!</div>}
      <div className="card fu">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:17}}>📞</span><span style={{fontSize:15,fontWeight:700,fontFamily:"'Lora',serif"}}>Contact Information</span></div>
          <div style={{display:"flex",gap:8}}>{editing?<><button className="btn-ghost" onClick={()=>{setEditing(false);setForm({contact:H.contact,role:H.role,phone:H.phone,altPhone:H.altPhone,email:H.email});}}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></>:<button className="btn-ghost" onClick={()=>setEditing(true)} style={{display:"flex",alignItems:"center",gap:5}}>{Ico.edit} Edit</button>}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
          <F label="Primary Contact Person" id="contact"/><F label="Role / Designation" id="role"/>
          <F label="Primary Phone Number" id="phone"/><F label="Alternate Phone" id="altPhone"/>
          <div style={{gridColumn:"1/-1"}}><F label="Email Address" id="email" type="email"/></div>
        </div>
      </div>
    </div>
  );
}

/* ── HOURS ── */
function HoursPage(){
  const [is24x7,setIs24x7]=useState(H.is24x7);
  const [hours,setHours]=useState(HOURS.map(h=>({...h})));
  const [saved,setSaved]=useState(false);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {saved&&<div className="fu" style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#15803d",fontWeight:600}}>✅ Hours saved!</div>}
      <div className="card fu">
        <SectionHead title="Operating Hours" icon="🕐"/>
        <div style={{display:"flex",alignItems:"center",gap:10,background:"#f0fdfa",border:"1.5px solid #ccfbf1",borderRadius:11,padding:"11px 14px",marginBottom:18,cursor:"pointer"}} onClick={()=>setIs24x7(v=>!v)}>
          <div style={{width:46,height:24,background:is24x7?"#10b981":"#e2e8f0",borderRadius:999,position:"relative",transition:"background .25s",flexShrink:0}}><div style={{position:"absolute",width:18,height:18,background:"#fff",borderRadius:"50%",top:3,left:is24x7?24:3,transition:"left .25s"}}/></div>
          <div><div style={{fontSize:13,fontWeight:700,color:"#0f766e"}}>24 × 7 Operations</div><div style={{fontSize:11,color:"#5eead4"}}>Hospital operates round the clock</div></div>
          {is24x7&&<span className="badge badge-teal" style={{marginLeft:"auto"}}>Active</span>}
        </div>
        {hours.map((h,i)=>(
          <div key={h.day} className="hour-row">
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,background:h.open?"#eff6ff":"#f1f5f9",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9.5,fontWeight:700,color:h.open?"#1d6fb8":"#94a3b8",flexShrink:0}}>{h.day.slice(0,2).toUpperCase()}</div>
              <span style={{fontSize:13,fontWeight:500,color:"#1a2332"}}>{h.day}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {is24x7?<span className="badge badge-teal">24 × 7</span>:h.open?<div style={{display:"flex",alignItems:"center",gap:5}}><input type="time" className="inp-plain" defaultValue="09:00" style={{width:90,padding:"4px 7px",fontSize:12}}/><span style={{fontSize:11,color:"#94a3b8"}}>to</span><input type="time" className="inp-plain" defaultValue="21:00" style={{width:90,padding:"4px 7px",fontSize:12}}/></div>:<span className="badge badge-gray">Closed</span>}
              <div style={{width:38,height:22,background:h.open?"#22c55e":"#e2e8f0",borderRadius:999,position:"relative",cursor:"pointer",transition:"background .25s",flexShrink:0}} onClick={()=>setHours(hrs=>hrs.map((x,j)=>j===i?{...x,open:!x.open}:x))}>
                <div style={{position:"absolute",width:16,height:16,background:"#fff",borderRadius:"50%",top:3,left:h.open?19:3,transition:"left .25s"}}/>
              </div>
            </div>
          </div>
        ))}
        <div style={{marginTop:16}}><button className="btn-primary" onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),3000);}}>Save Schedule</button></div>
      </div>
    </div>
  );
}

/* ── SETTINGS ── */
function SettingsPage(){
  const [pw,setPw]=useState({cur:"",next:"",confirm:""});
  const [showPw,setShowPw]=useState({cur:false,next:false,confirm:false});
  const [saved,setSaved]=useState(false);
  const [notif,setNotif]=useState({requests:true,updates:true,email:false});
  const [pwErr,setPwErr]=useState("");
  function changePw(){
    if(!pw.cur){setPwErr("Current password required");return;}
    if(pw.next.length<6){setPwErr("New password must be at least 6 characters");return;}
    if(pw.next!==pw.confirm){setPwErr("Passwords do not match");return;}
    setPwErr("");setSaved(true);setPw({cur:"",next:"",confirm:""});setTimeout(()=>setSaved(false),3000);
  }
  const strength=(()=>{let s=0,p=pw.next;if(p.length>=8)s++;if(/[A-Z]/.test(p))s++;if(/[0-9]/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return s;})();
  const strColor=["#e2e8f0","#ef4444","#f59e0b","#22c55e","#16a34a"][strength];
  const strLabel=["","Weak","Fair","Good","Strong"][strength];
  const PwField=({label,k})=>(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <span style={lbl}>{label}</span>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94a3b8"}}>{Ico.lock}</span>
        <input type={showPw[k]?"text":"password"} className="inp" value={pw[k]} onChange={e=>{setPw(p=>({...p,[k]:e.target.value}));setPwErr("");}} style={{paddingRight:36}} placeholder="••••••••"/>
        <button type="button" onClick={()=>setShowPw(s=>({...s,[k]:!s[k]}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:13}}>{showPw[k]?"🙈":"👁️"}</button>
      </div>
    </div>
  );
  const Toggle=({label,sub,k})=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #f1f5f9",gap:12}}>
      <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:"#1a2332"}}>{label}</div>{sub&&<div style={{fontSize:11.5,color:"#94a3b8",marginTop:1}}>{sub}</div>}</div>
      <div onClick={()=>setNotif(n=>({...n,[k]:!n[k]}))} style={{width:42,height:24,background:notif[k]?"#1d6fb8":"#e2e8f0",borderRadius:999,position:"relative",cursor:"pointer",transition:"background .25s",flexShrink:0}}>
        <div style={{position:"absolute",width:18,height:18,background:"#fff",borderRadius:"50%",top:3,left:notif[k]?20:3,transition:"left .25s"}}/>
      </div>
    </div>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {saved&&<div className="fu" style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#15803d",fontWeight:600}}>✅ Password changed!</div>}
      <div className="card fu">
        <SectionHead title="Change Password" icon="🔐"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
          <PwField label="Current Password" k="cur"/><PwField label="New Password" k="next"/><PwField label="Confirm New Password" k="confirm"/>
        </div>
        {pw.next.length>0&&<div style={{marginTop:10}}><div style={{display:"flex",gap:4,marginBottom:4}}>{[1,2,3,4].map(i=><div key={i} style={{flex:1,height:4,borderRadius:999,background:i<=strength?strColor:"#e2e8f0",transition:"background .3s"}}/>)}</div><span style={{fontSize:11,fontWeight:600,color:strColor}}>{strLabel} password</span></div>}
        {pwErr&&<p style={{fontSize:12,color:"#ef4444",marginTop:7,fontWeight:500}}>⚠ {pwErr}</p>}
        <div style={{marginTop:14}}><button className="btn-primary" onClick={changePw}>Update Password</button></div>
      </div>
      <div className="card fu d1">
        <SectionHead title="Notifications" icon="🔔"/>
        <Toggle label="Email Notifications" sub="Receive alerts via email" k="email"/>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   BLOOD REQUEST PAGE  — full rewrite with new field
   ════════════════════════════════════════════════ */
function BloodRequestPage(){
  /* form state */
  const [bloodGroup,   setBloodGroup]   = useState("");
  const [units,        setUnits]        = useState(1);
  const [donorsNeeded, setDonorsNeeded] = useState(2);   // must stay > units
  const [urgency,      setUrgency]      = useState("urgent");
  const [distance,     setDistance]     = useState(10);
  const [patientName,  setPatientName]  = useState("");
  const [notes,        setNotes]        = useState("");
  const [errors,       setErrors]       = useState({});

  /* send state */
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [sentCount, setSentCount] = useState(0);

  /* request list */
  const [requests,  setRequests]  = useState(INIT_REQUESTS);
  const [tab,       setTab]       = useState("new");
  const [cancelId,  setCancelId]  = useState(null);

  /* keep donorsNeeded always > units */
  function changeUnits(newUnits){
    setUnits(newUnits);
    if(donorsNeeded <= newUnits) setDonorsNeeded(newUnits + 1);
  }

  const estimatedDonors = bloodGroup
    ? Math.floor((distance * 3.2) + (BLOOD_GROUPS.indexOf(bloodGroup) * 4) + 8)
    : 0;

  function validate(){
    const e={};
    if(!bloodGroup)           e.bloodGroup   = "Please select a blood group";
    if(!units||units<1)       e.units        = "At least 1 unit required";
    if(donorsNeeded<=units)   e.donorsNeeded = `Must be greater than ${units} (units required)`;
    if(!patientName.trim())   e.patientName  = "Patient name is required";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function handleSend(){
    if(!validate()) return;
    setSending(true);
    setTimeout(()=>{
      const newReq={
        id:Date.now(), blood:bloodGroup, units, donorsNeeded, urgency, distance,
        date:new Date().toISOString().split("T")[0],
        sent:estimatedDonors, accepted:0, declined:0, pending:estimatedDonors,
        status:"active", patient:patientName, notes, escalation:1,
      };
      setRequests(r=>[newReq,...r]);
      setSentCount(estimatedDonors);
      setSending(false); setSent(true);
      setBloodGroup(""); setUnits(1); setDonorsNeeded(2);
      setUrgency("urgent"); setDistance(10); setPatientName(""); setNotes(""); setErrors({});
    }, 2000);
  }

  function cancelRequest(id){ setRequests(r=>r.map(x=>x.id===id?{...x,status:"cancelled"}:x)); setCancelId(null); }

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
    <div style={{display:"flex",flexDirection:"column",gap:18}}>

      {/* ── Tabs ── */}
      <div className="fu" style={{display:"flex",background:"#f1f5f9",borderRadius:11,padding:4,gap:0}}>
        {[{key:"new",label:"📢 New Request"},{key:"history",label:"📋 History"}].map(t=>(
          <button key={t.key} onClick={()=>{setSent(false);setTab(t.key);}}
            style={{flex:1,padding:"8px 12px",borderRadius:8,border:"none",background:tab===t.key?"#fff":"transparent",color:tab===t.key?"#1d6fb8":"#64748b",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:tab===t.key?"0 1px 6px #00000012":"none",transition:"all .2s",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ NEW REQUEST ══════════ */}
      {tab==="new" && <>

        {/* Success banner */}
        {sent&&(
          <div className="fu" style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"2px solid #86efac",borderRadius:13,padding:"16px 18px"}}>
            <div style={{display:"flex",gap:12}}>
              <div style={{fontSize:32,flexShrink:0}}>✅</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#15803d",marginBottom:3}}>Blood request sent successfully!</div>
                <div style={{fontSize:12.5,color:"#166534"}}><strong>{sentCount} donors</strong> within <strong>{distance} km</strong> have been notified.</div>
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

          {/* ── Right: Urgency + Range ── */}
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

            {/* Range */}
            <div className="card fu d3">
              <div style={{fontSize:14,fontWeight:700,fontFamily:"'Lora',serif",color:"#1a2332",marginBottom:4}}>📡 Notification Range</div>
              <div style={{fontSize:11.5,color:"#94a3b8",marginBottom:12}}>All eligible donors within this radius will be alerted</div>
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:"#94a3b8"}}>1 km</span>
                  <span style={{fontSize:15,fontWeight:800,color:"#1d6fb8",fontFamily:"'Lora',serif"}}>{distance} km</span>
                  <span style={{fontSize:12,color:"#94a3b8"}}>100 km</span>
                </div>
                <input type="range" min={1} max={100} step={1} value={distance} onChange={e=>setDistance(Number(e.target.value))} style={{width:"100%",accentColor:"#1d6fb8",height:6,cursor:"pointer"}}/>
                <div className="range-btns">
                  {[1,10,25,50,100].map(d=>(
                    <button key={d} type="button" onClick={()=>setDistance(d)}
                      style={{fontSize:11,fontWeight:600,padding:"3px 7px",borderRadius:6,border:`1.5px solid ${distance===d?"#1d6fb8":"#e2e8f0"}`,background:distance===d?"#eff6ff":"#f8fafc",color:distance===d?"#1d6fb8":"#94a3b8",cursor:"pointer",transition:"all .2s"}}>
                      {d}km
                    </button>
                  ))}
                </div>
              </div>
              <div style={{background:"linear-gradient(135deg,#eff6ff,#f0fdfa)",border:"1.5px solid #bfdbfe",borderRadius:10,padding:"11px 14px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:10.5,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px"}}>Est. donors to notify</div>
                    <div style={{fontSize:24,fontWeight:800,color:"#1d6fb8",fontFamily:"'Lora',serif",marginTop:2}}>{bloodGroup?estimatedDonors:"—"}</div>
                    {bloodGroup?<div style={{fontSize:11,color:"#64748b",marginTop:1}}>with <strong>{bloodGroup}</strong> within <strong>{distance} km</strong></div>:<div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>Select a blood group to estimate</div>}
                  </div>
                  <div style={{fontSize:32,opacity:.7}}>👥</div>
                </div>
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
                    {units} unit{units>1?"s":""} · <span style={{fontWeight:600,color:urgencyColor[urgency]}}>{urgency.charAt(0).toUpperCase()+urgency.slice(1)}</span> · {distance} km
                    · <span style={{color:"#0f766e",fontWeight:600}}>{donorsNeeded} donors to accept</span>
                    · ~<strong style={{color:"#1d6fb8"}}>{estimatedDonors}</strong> notified
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

      {/* ══════════ HISTORY ══════════ */}
      {tab==="history"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Summary */}
          <div className="hist-grid fu">
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
          </div>

          {/* Per-request cards */}
          {requests.map((r,i)=>(
            <div key={r.id} className={`fu d${Math.min(i+1,5)}`}
              style={{background:"#fff",border:`1.5px solid ${urgencyBg[r.urgency]}`,borderLeft:`4px solid ${urgencyColor[r.urgency]}`,borderRadius:14,overflow:"hidden"}}>

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
                      <span>📡 {r.distance} km</span>
                      <span>📅 {new Date(r.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                      {r.notes&&<span>📝 {r.notes}</span>}
                      <span style={{color:"#7c3aed",fontWeight:600}}>🔺 Escalation level {r.escalation}</span>
                    </div>
                  </div>
                </div>
                {r.status==="active"&&<button className="btn-danger" style={{padding:"5px 12px",fontSize:12,flexShrink:0}} onClick={()=>setCancelId(r.id)}>Cancel</button>}
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

                {/* Donor goal bar */}
                <div style={{marginTop:12,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:12}}>
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
              <button className="btn-ghost" onClick={()=>setCancelId(null)} style={{flex:1}}>Keep Active</button>
              <button onClick={()=>cancelRequest(cancelId)} style={{flex:1,background:"#dc2626",color:"#fff",border:"none",borderRadius:9,padding:"9px 16px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Yes, Cancel</button>
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

  useEffect(()=>{setTimeout(()=>setLoading(false),800);},[]);

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

  return(
    <><G/>
      <div className="layout">
        <Sidebar active={page} setActive={navigate} onLogout={()=>{setSidebarOpen(false);setShowLogout(true);}} open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>
        <div className="main">
          <TopBar page={page} setPage={navigate} onMenuClick={()=>setSidebarOpen(o=>!o)}/>
          <main className="content">
            {page==="dashboard" && <DashboardPage setPage={navigate}/>}
            {page==="profile"   && <ProfilePage/>}
            {page==="broadcast" && <BloodRequestPage/>}
            {page==="docs"      && <DocsPage/>}
            {page==="facility"  && <FacilityPage/>}
            {page==="contact"   && <ContactPage/>}
            {page==="hours"     && <HoursPage/>}
            {page==="settings"  && <SettingsPage/>}
          </main>
        </div>
        {showLogout&&<LogoutModal onConfirm={()=>setLoggedOut(true)} onCancel={()=>setShowLogout(false)}/>}
      </div>
    </>
  );
}