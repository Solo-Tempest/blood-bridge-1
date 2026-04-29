import { Link } from 'react-router-dom';
import './TermsAndConditions.css';

export default function TermsAndConditions() {
  return (
    <div className="tc-page">

      <div className="tc-hero">
        <span className="tc-label">Legal document</span>
        <h1>Terms &amp; Conditions</h1>
        <div className="tc-meta">
          <span>Effective date: January 1, 2025</span>
          <span>Last updated: April 2025</span>
        </div>
      </div>

      <div className="tc-body">

        <aside className="tc-toc">
          <p className="tc-toc-title">On this page</p>
          <ul className="tc-toc-list">
            <li><a href="#acceptance">Acceptance</a></li>
            <li><a href="#eligibility">Eligibility</a></li>
            <li><a href="#donor-terms">Donor obligations</a></li>
            <li><a href="#hospital-terms">Hospital obligations</a></li>
            <li><a href="#prohibited">Prohibited conduct</a></li>
            <li><a href="#liability">Liability</a></li>
            <li><a href="#termination">Termination</a></li>
            <li><a href="#governing">Governing law</a></li>
          </ul>
        </aside>

        <div className="tc-content">

          <section id="acceptance">
            <p className="tc-section-num">01</p>
            <h2>Acceptance of terms</h2>
            <p>By registering on or using Blood Bridge (the "Platform"), you agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, please do not use the Platform.</p>
            <p>Blood Bridge is an academic project developed by a student team as part of a final year B.Tech program. It is not a licensed medical service provider.</p>
            <div className="tc-highlight">
              <p>"These terms constitute a binding agreement between you and the Blood Bridge team. Please read them carefully before creating an account."</p>
            </div>
          </section>

          <section id="eligibility">
            <p className="tc-section-num">02</p>
            <h2>Eligibility</h2>
            <p>To use Blood Bridge, you must meet the following requirements:</p>
            <p className="tc-sub-label">Donors</p>
            <ul>
              <li>Must be at least 18 years of age</li>
              <li>Must be medically eligible to donate blood as per standard Indian health guidelines</li>
              <li>Must provide accurate blood group and health information</li>
              <li>Must not have donated blood within the last 90 days (or 120 days for platelets)</li>
            </ul>
            <p className="tc-sub-label">Hospitals</p>
            <ul>
              <li>Must be a registered medical institution in India</li>
              <li>Must register using an official hospital email and provide a valid registration number</li>
              <li>Must designate an authorised representative responsible for all activity on the account</li>
            </ul>
          </section>

          <section id="donor-terms">
            <p className="tc-section-num">03</p>
            <h2>Donor obligations</h2>
            <p>As a registered donor on Blood Bridge, you agree to:</p>
            <ul>
              <li>Provide truthful and accurate personal and medical information at all times</li>
              <li>Update your profile promptly if your health status or eligibility changes</li>
              <li>Respond to blood requests in good faith — acceptance implies genuine intent to donate</li>
              <li>Notify the hospital as early as possible if you are unable to fulfil a confirmed donation</li>
              <li>Not use the platform if you are knowingly ineligible to donate at the time of responding</li>
            </ul>
            <div className="tc-warning">
              <p><strong>Important:</strong> Blood Bridge does not conduct medical screening. Donors are solely responsible for ensuring their own eligibility before responding to any request.</p>
            </div>
          </section>

          <section id="hospital-terms">
            <p className="tc-section-num">04</p>
            <h2>Hospital obligations</h2>
            <p>As a registered hospital on Blood Bridge, you agree to:</p>
            <ul>
              <li>Post only genuine, verified blood requests with accurate blood type and urgency details</li>
              <li>Not post duplicate or fraudulent requests to manipulate donor availability</li>
              <li>Handle donor contact information with care and use it solely for coordinating the donation</li>
              <li>Provide a safe, hygienic, and standard-compliant blood collection environment</li>
              <li>Mark requests as fulfilled or cancelled promptly once resolved</li>
              <li>Not share donor data with any third party outside the scope of the donation</li>
            </ul>
          </section>

          <section id="prohibited">
            <p className="tc-section-num">05</p>
            <h2>Prohibited conduct</h2>
            <p>The following actions are strictly prohibited on Blood Bridge:</p>
            <ul>
              <li>Registering with false identity, fabricated credentials, or someone else's information</li>
              <li>Posting blood requests for commercial sale or resale of blood</li>
              <li>Contacting donors or hospitals outside the platform for unrelated purposes</li>
              <li>Attempting to reverse-engineer, hack, or exploit any part of the platform</li>
              <li>Using the platform to collect or harvest other users' data</li>
              <li>Misrepresenting yourself as a medical professional or licensed institution</li>
              <li>Any form of harassment, discrimination, or abuse toward other users</li>
            </ul>
            <p>Violation of any of these terms may result in immediate account suspension or permanent removal from the platform.</p>
          </section>

          <section id="liability">
            <p className="tc-section-num">06</p>
            <h2>Limitation of liability</h2>
            <p>Blood Bridge is a facilitating platform. We do not provide medical advice, conduct health screenings, or guarantee the outcome of any blood donation interaction.</p>
            <ul>
              <li>We are not liable for any health complications arising from a donation facilitated through the platform</li>
              <li>We are not responsible if a donor fails to fulfil an accepted request</li>
              <li>We are not liable for the accuracy of blood type or health information provided by users</li>
              <li>We do not guarantee continuous availability or uptime of the platform</li>
            </ul>
            <div className="tc-warning">
              <p><strong>Disclaimer:</strong> In all medical matters, please consult a qualified healthcare professional. Blood Bridge does not replace professional medical judgement.</p>
            </div>
          </section>

          <section id="termination">
            <p className="tc-section-num">07</p>
            <h2>Termination</h2>
            <p>We reserve the right to suspend or terminate any account — donor or hospital — that:</p>
            <ul>
              <li>Violates any provision of these Terms &amp; Conditions</li>
              <li>Provides false or misleading information during or after registration</li>
              <li>Engages in behaviour that harms or endangers other users</li>
              <li>Is found to be misusing the platform for non-donation purposes</li>
            </ul>
            <p>Users may request deletion of their own account at any time by contacting <strong>support@bloodbridge.in</strong>. Upon deletion, all personal data will be removed within 30 days, except where retention is required by law.</p>
          </section>

          <section id="governing">
            <p className="tc-section-num">08</p>
            <h2>Governing law</h2>
            <p>These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of India, including but not limited to:</p>
            <ul>
              <li>The Information Technology Act, 2000 and its amendments</li>
              <li>The Digital Personal Data Protection Act, 2023</li>
              <li>The Drugs and Cosmetics Act, 1940 (as applicable to blood banks)</li>
            </ul>
            <p>Any disputes arising from the use of Blood Bridge shall be subject to the jurisdiction of courts in India. For queries, write to us at <strong>support@bloodbridge.in</strong>.</p>
          </section>

        </div>
      </div>

    </div>
  );
}
