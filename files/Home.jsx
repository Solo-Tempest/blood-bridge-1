// src/pages/Home.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Landing page — composes Hero and ModulesSection.
// Rendered at route "/".
// ─────────────────────────────────────────────────────────────────────────────

import Hero from '../components/home/Hero';
import ModulesSection from '../components/home/ModulesSection';

export default function Home() {
  return (
    <>
      <Hero />
      <ModulesSection />
    </>
  );
}
