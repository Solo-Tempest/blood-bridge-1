// src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Root component.  Sets up React Router with a shared layout (Navbar + Footer)
// wrapping all page routes.
//
// Route map:
//   /              → Home (Hero + Modules)
//   /donor         → DonorPortal
//   /hospital      → HospitalPortal
//   /eligibility   → EligibilityChecker
//   /chatbot       → Chatbot
//   /admin         → AdminDashboard
// ─────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, ScrollRestoration } from 'react-router-dom';

import Navbar          from './components/layout/Navbar';
import Footer          from './components/layout/Footer';

import Home            from './pages/Home';
import DonorPortal     from './pages/DonorPortal';
import HospitalPortal  from './pages/HospitalPortal';
import EligibilityChecker from './pages/EligibilityChecker';
import Chatbot         from './pages/Chatbot';
import AdminDashboard  from './pages/AdminDashboard';

function Layout() {
  return (
    <>
      <Navbar />
      {/* Each page is responsible for its own top padding (pt-[60px] for the fixed nav) */}
      <main>
        <Routes>
          <Route path="/"            element={<Home />}             />
          <Route path="/donor"       element={<DonorPortal />}      />
          <Route path="/hospital"    element={<HospitalPortal />}   />
          <Route path="/eligibility" element={<EligibilityChecker />} />
          <Route path="/chatbot"     element={<Chatbot />}          />
          <Route path="/admin"       element={<AdminDashboard />}   />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
