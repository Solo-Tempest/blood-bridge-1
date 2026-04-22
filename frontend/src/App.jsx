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

function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"            element={<Home />}              />
          <Route path="/donor"       element={<DonorPortal />}       />
          <Route path="/hospital"    element={<HospitalPortal />}    />
          <Route path="/eligibility" element={<EligibilityChecker />}/>
          <Route path="/chatbot"     element={<Chatbot />}           />
          <Route path="/admin"       element={<AdminDashboard />}    />
          <Route path="/donor-register" element={<DonorRegistration />} />
          <Route path="/donor-login"    element={<DonorLogin />}        />
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
      <Layout />
    </BrowserRouter>
  );
}
