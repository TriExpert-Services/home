import React from 'react';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import TranslationForm from './components/TranslationForm';

function App() {
  const [showTranslationForm, setShowTranslationForm] = useState(false);

  useEffect(() => {
    const handleShowTranslationForm = () => {
      setShowTranslationForm(true);
    };

    window.addEventListener('showTranslationForm', handleShowTranslationForm);
    return () => {
      window.removeEventListener('showTranslationForm', handleShowTranslationForm);
    };
  }, []);

  if (showTranslationForm) {
    return <TranslationForm onBack={() => setShowTranslationForm(false)} />;
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