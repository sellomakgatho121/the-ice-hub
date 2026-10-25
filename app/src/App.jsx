import React from "react";
import SkipLink from "./components/SkipLink.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import OccasionSection from "./components/OccasionSection.jsx";
import AboutSection from "./components/AboutSection.jsx";
import SupplyProcess from "./components/SupplyProcess.jsx";
import ContactSection from "./components/ContactSection.jsx";
import Footer from "./components/Footer.jsx";
import MobileBar from "./components/MobileBar.jsx";

export default function App() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main">
        <Hero />
        <OccasionSection />
        <AboutSection />
        <SupplyProcess />
        <ContactSection />
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
