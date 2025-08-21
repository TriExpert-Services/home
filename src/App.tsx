import React from 'react';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import TranslationForm from './components/TranslationForm';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiesPolicy from './components/CookiesPolicy';

function App() {
  const [showTranslationForm, setShowTranslationForm] = useState(false);
  const [currentLegalPage, setCurrentLegalPage] = useState<string | null>(null);

  useEffect(() => {
    const handleShowTranslationForm = () => {
      setShowTranslationForm(true);
    };

    const handleShowLegalPage = (event: CustomEvent) => {
      setCurrentLegalPage(event.detail);
    };

    window.addEventListener('showTranslationForm', handleShowTranslationForm);
    window.addEventListener('showLegalPage', handleShowLegalPage as EventListener);
    
    return () => {
      window.removeEventListener('showTranslationForm', handleShowTranslationForm);
      window.removeEventListener('showLegalPage', handleShowLegalPage as EventListener);
    };
  }, []);

  if (showTranslationForm) {
    return <TranslationForm onBack={() => setShowTranslationForm(false)} />;
  }

  if (currentLegalPage === 'terms') {
    return <TermsOfService onBack={() => setCurrentLegalPage(null)} />;
  }

  if (currentLegalPage === 'privacy') {
    return <PrivacyPolicy onBack={() => setCurrentLegalPage(null)} />;
  }

  if (currentLegalPage === 'cookies') {
    return <CookiesPolicy onBack={() => setCurrentLegalPage(null)} />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;