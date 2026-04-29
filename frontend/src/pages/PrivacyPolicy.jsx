import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <div className="pp-page">

      <div className="pp-hero">
        <span className="pp-label">Legal document</span>
        <h1>Privacy <em>Policy</em></h1>
        <div className="pp-meta">
          <span>Effective date: January 1, 2025</span>
          <span>Last updated: April 2025</span>
        </div>
      </div>

      <div className="pp-body">

        <aside className="pp-toc">
          <p className="pp-toc-title">On this page</p>
          <ul className="pp-toc-list">
            <li><a href="#overview">Overview</a></li>
            <li><a href="#data-collected">Data we collect</a></li>
            <li><a href="#how-we-use">How we use it</a></li>
            <li><a href="#sharing">Data sharing</a></li>
            <li><a href="#storage">Storage &amp; security</a></li>
            <li><a href="#rights">Your rights</a></li>
            <li><a href="#contact">Contact us</a></li>
          </ul>
        </aside>

        <div className="pp-content">

          <section id="overview">
            <p className="pp-section-num">01</p>
            <h2>Overview</h2>
            <p>Blood Bridge ("we", "our", or "the platform") is a final year academic project developed to connect blood donors with hospitals in need. We are committed to protecting the personal information of every user — donor or hospital — who interacts with our platform.</p>
            <p>This Privacy Policy explains what data we collect, why we collect it, how it is used, and what rights you have over your information.</p>
            <div className="pp-highlight">
              <p>"Your data is used only to facilitate blood donation connections. We do not sell, rent, or share your personal information with advertisers or third parties for commercial purposes."</p>
            </div>
          </section>

          <section id="data-collected">
            <p className="pp-section-num">02</p>
            <h2>Data we collect</h2>
            <p>We collect the following information when you register or use Blood Bridge:</p>

            <p className="pp-sub-label">For donors</p>
            <ul>
              <li>Full name and contact number</li>
              <li>Blood group and Rh factor</li>
              <li>City / locality for proximity matching</li>
              <li>Last donation date (to ensure donor eligibility)</li>
              <li>Account credentials (email and hashed password)</li>
            </ul>

            <p className="pp-sub-label">For hospitals</p>
            <ul>
              <li>Hospital name and registration number</li>
              <li>Authorised contact person name and designation</li>
              <li>Official email address and phone number</li>
              <li>Hospital address and city</li>
              <li>Account credentials (email and hashed password)</li>
            </ul>

            <p className="pp-sub-label">Usage data</p>
            <ul>
              <li>Request history (blood type requested, date, status)</li>
              <li>Donor response history (accepted / declined)</li>
              <li>Login timestamps and approximate session duration</li>
            </ul>
          </section>

          <section id="how-we-use">
            <p className="pp-section-num">03</p>
            <h2>How we use your data</h2>
            <p>Your data is used strictly for the following purposes:</p>
            <ul>
              <li>Matching blood requests from hospitals to eligible nearby donors</li>
              <li>Sending real-time notifications to donors about active requests</li>
              <li>Verifying hospital identity before allowing request posting</li>
              <li>Maintaining donation history to enforce safe donation intervals</li>
              <li>Improving platform performance and resolving technical issues</li>
              <li>Communicating important account or safety-related updates</li>
            </ul>
            <p>We do not use your data for advertising, profiling, or any purpose unrelated to blood donation facilitation.</p>
          </section>

          <section id="sharing">
            <p className="pp-section-num">04</p>
            <h2>Data sharing</h2>
            <p>We do not sell or trade your personal information. Limited sharing occurs only in the following situations:</p>
            <ul>
              <li><strong>Hospital ↔ Donor:</strong> When a donor accepts a request, their name and contact number are shared with the requesting hospital — and vice versa — solely to coordinate the donation.</li>
              <li><strong>Academic supervisors:</strong> Anonymised, aggregated platform data may be reviewed by our college faculty as part of project evaluation.</li>
              <li><strong>Legal obligations:</strong> We may disclose information if required by Indian law or a valid legal process.</li>
            </ul>
          </section>

          <section id="storage">
            <p className="pp-section-num">05</p>
            <h2>Storage &amp; security</h2>
            <p>All data is stored on secured servers. We implement the following measures to protect your information:</p>
            <ul>
              <li>Passwords are hashed using bcrypt — never stored in plain text</li>
              <li>All data transmission occurs over HTTPS (TLS encryption)</li>
              <li>Database access is restricted to authorised team members only</li>
              <li>We do not store payment information of any kind</li>
            </ul>
            <p>As a student project, Blood Bridge does not yet hold a formal ISO or SOC 2 certification. We follow best practices appropriate to our scale.</p>
          </section>

          <section id="rights">
            <p className="pp-section-num">06</p>
            <h2>Your rights</h2>
            <p>Under India's Digital Personal Data Protection Act (DPDP), 2023, you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate or outdated information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for data processing at any time</li>
              <li>Nominate a person to exercise your rights in case of incapacity</li>
            </ul>
            <p>To exercise any of these rights, write to us at <strong>support@bloodbridge.in</strong> with the subject line "Data Rights Request".</p>
          </section>

          <section id="contact">
            <p className="pp-section-num">07</p>
            <h2>Contact us</h2>
            <p>If you have questions, concerns, or grievances about this Privacy Policy or how your data is handled, please reach out to us:</p>
            <ul>
              <li>Email: <strong>support@bloodbridge.in</strong></li>
              <li>Response time: within 3–5 working days</li>
            </ul>
            <p>We reserve the right to update this policy as the platform evolves. Any material changes will be communicated via email or an in-app notification.</p>
          </section>

        </div>
      </div>

    </div>
  );
}
