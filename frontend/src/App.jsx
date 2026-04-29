import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar           from './components/layout/Navbar';
import Footer           from './components/layout/Footer';

import Home             from './pages/Home';
import DonorPortal      from './pages/DonorPortal';
import HospitalPortal   from './pages/HospitalPortal';
import EligibilityChecker from './pages/EligibilityChecker';
import Chatbot          from './pages/Chatbot';
import AdminDashboard   from './pages/AdminDashboard';
import DonorRegistration from './pages/DonorRegistration';
import DonorLogin        from './pages/DonorLogin';
import HospitalRegistration from './pages/HospitalRegistration';
import HospitalLogin        from './pages/HospitalLogin';
import HospitalDashboard    from './pages/HospitalDashboard';
import PrivacyPolicy        from './pages/PrivacyPolicy';
import TermsAndConditions   from './pages/TermsAndConditions';

function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"            element={<Home />}              />
          <Route path="/hospital"    element={<HospitalPortal />}    />
          <Route path="/eligibility" element={<EligibilityChecker />}/>
          <Route path="/chatbot"     element={<Chatbot />}           />
          <Route path="/admin"       element={<AdminDashboard />}    />
          <Route path="/donor-register" element={<DonorRegistration />} />
          <Route path="/donor-login"    element={<DonorLogin />}        />
          <Route path="/hospital-register" element={<HospitalRegistration />} />
          <Route path="/hospital-login"    element={<HospitalLogin />}        />
          <Route path="/privacy"           element={<PrivacyPolicy />}        />
          <Route path="/terms"             element={<TermsAndConditions />}   />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Portals have their own full-screen layout — no global Navbar/Footer */}
        <Route path="/donor"               element={<DonorPortal />}       />
        <Route path="/hospital-dashboard"  element={<HospitalDashboard />} />
        <Route path="/*"                   element={<Layout />}             />
      </Routes>
    </BrowserRouter>
  );
}
