import React from 'react';
import { useState, useEffect } from 'react';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import TranslationForm from './components/TranslationForm';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiesPolicy from './components/CookiesPolicy';
import Chatbot from './components/Chatbot';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import VerificationPage from './components/VerificationPage';

// Admin wrapper component to handle admin routing
function AdminWrapper() {
  const { isAuthenticated } = useAdmin();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const checkAdminRoute = () => {
      const isAdminRoute = window.location.pathname.startsWith('/admin') || 
                          window.location.hash.includes('admin');
      if (isAdminRoute) {
        setShowAdminLogin(true);
      }
    };

    checkAdminRoute();
    
    // Listen for admin route navigation
    const handleAdminNavigation = () => {
      setShowAdminLogin(true);
    };

    window.addEventListener('showAdminPanel', handleAdminNavigation);
    
    return () => {
      window.removeEventListener('showAdminPanel', handleAdminNavigation);
    };
  }, []);

  // Show admin panel if authenticated
  if (showAdminLogin && isAuthenticated) {
    return <AdminPanel />;
  }

  // Show admin login if trying to access admin
  if (showAdminLogin) {
    return <AdminLogin onBack={() => setShowAdminLogin(false)} />;
  }

  return null;
}

// Main app content component
function App() {
  const [showTranslationForm, setShowTranslationForm] = useState(false);
  const [currentLegalPage, setCurrentLegalPage] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  // Check if we should show admin interface
  const shouldShowAdmin = window.location.pathname.startsWith('/admin') || 
                         window.location.hash.includes('admin');

  useEffect(() => {
    // Check for verification token in URL
    const checkForVerificationToken = () => {
      const path = window.location.pathname;
      const verifyMatch = path.match(/^\/verify\/(.+)$/);
      if (verifyMatch) {
        setVerificationToken(verifyMatch[1]);
        return;
      }
    };

    checkForVerificationToken();

    const handleShowTranslationForm = () => {
      setShowTranslationForm(true);
    };

    const handleShowLegalPage = (event: CustomEvent) => {
      setCurrentLegalPage(event.detail);
    };

    window.addEventListener('showTranslationForm', handleShowTranslationForm);
    window.addEventListener('showLegalPage', handleShowLegalPage as EventListener);
    
    // Admin navigation handler
    const handleShowAdminPanel = () => {
      // This will be handled by AdminWrapper
    };

    window.addEventListener('showAdminPanel', handleShowAdminPanel);
    
    return () => {
      window.removeEventListener('showTranslationForm', handleShowTranslationForm);
      window.removeEventListener('showLegalPage', handleShowLegalPage as EventListener);
      window.removeEventListener('showAdminPanel', handleShowAdminPanel);
    };
  }, []);

  if (verificationToken) {
    return <VerificationPage 
      verificationToken={verificationToken} 
      onBack={() => {
        setVerificationToken(null);
        window.history.pushState({}, '', '/');
      }} 
    />;
  }

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
    <AdminProvider>
      <AdminWrapper />
      {!shouldShowAdmin && <MainContent />}
    </AdminProvider>
  );
}

// Main site content component
function MainContent() {
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
      <Testimonials />
      <Contact />
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;