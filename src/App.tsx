import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
// Homepage-critical, kept eager:
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Everything below ships as its own chunk and only loads on the matching route,
// so a homepage visitor no longer downloads the admin panel, blog, translate
// form, legal pages, DOMPurify, etc. (the main bundle was ~557 KB).
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const CookiesPolicy = lazy(() => import('./components/CookiesPolicy'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const VerificationPage = lazy(() => import('./components/VerificationPage'));
const TranslatePage = lazy(() => import('./components/TranslatePage'));
const Blog = lazy(() => import('./components/Blog'));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

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
    return <Suspense fallback={<PageLoader />}><AdminPanel /></Suspense>;
  }

  // Show admin login if trying to access admin
  if (showAdminLogin) {
    return <Suspense fallback={<PageLoader />}><AdminLogin onBack={() => setShowAdminLogin(false)} /></Suspense>;
  }

  return null;
}

// Main app content component
function App() {
  const [currentLegalPage, setCurrentLegalPage] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  // Check if we should show admin interface
  const shouldShowAdmin = window.location.pathname.startsWith('/admin') ||
                         window.location.hash.includes('admin');

  useEffect(() => {
    // Handle browser navigation
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

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


    const handleShowLegalPage = (event: CustomEvent) => {
      setCurrentLegalPage(event.detail);
    };

    window.addEventListener('showLegalPage', handleShowLegalPage as EventListener);

    // Admin navigation handler
    const handleShowAdminPanel = () => {
      // This will be handled by AdminWrapper
    };

    window.addEventListener('showAdminPanel', handleShowAdminPanel);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('showLegalPage', handleShowLegalPage as EventListener);
      window.removeEventListener('showAdminPanel', handleShowAdminPanel);
    };
  }, []);

  if (verificationToken) {
    return (
      <Suspense fallback={<PageLoader />}>
        <VerificationPage
          verificationToken={verificationToken}
          onBack={() => {
            setVerificationToken(null);
            window.history.pushState({}, '', '/');
            setCurrentRoute('/');
          }}
        />
      </Suspense>
    );
  }

  if (currentRoute === '/translate') {
    return <Suspense fallback={<PageLoader />}><TranslatePage /></Suspense>;
  }

  if (currentRoute === '/blog') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Blog onBack={() => {
          window.history.pushState({}, '', '/');
          setCurrentRoute('/');
        }} />
      </Suspense>
    );
  }

  if (currentLegalPage === 'terms') {
    return <Suspense fallback={<PageLoader />}><TermsOfService onBack={() => setCurrentLegalPage(null)} /></Suspense>;
  }

  if (currentLegalPage === 'privacy') {
    return <Suspense fallback={<PageLoader />}><PrivacyPolicy onBack={() => setCurrentLegalPage(null)} /></Suspense>;
  }

  if (currentLegalPage === 'cookies') {
    return <Suspense fallback={<PageLoader />}><CookiesPolicy onBack={() => setCurrentLegalPage(null)} /></Suspense>;
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
  const [currentLegalPage, setCurrentLegalPage] = useState<string | null>(null);

  useEffect(() => {

    const handleShowLegalPage = (event: CustomEvent) => {
      setCurrentLegalPage(event.detail);
    };

    window.addEventListener('showLegalPage', handleShowLegalPage as EventListener);

    return () => {
      window.removeEventListener('showLegalPage', handleShowLegalPage as EventListener);
    };
  }, []);


  if (currentLegalPage === 'terms') {
    return <Suspense fallback={<PageLoader />}><TermsOfService onBack={() => setCurrentLegalPage(null)} /></Suspense>;
  }

  if (currentLegalPage === 'privacy') {
    return <Suspense fallback={<PageLoader />}><PrivacyPolicy onBack={() => setCurrentLegalPage(null)} /></Suspense>;
  }

  if (currentLegalPage === 'cookies') {
    return <Suspense fallback={<PageLoader />}><CookiesPolicy onBack={() => setCurrentLegalPage(null)} /></Suspense>;
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
      <Suspense fallback={null}><Chatbot /></Suspense>
    </div>
  );
}

export default App;
