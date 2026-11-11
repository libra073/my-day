import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import { AiPlannerProvider } from './context/AiPlannerContext';
import LiquidGlassFilterDefs from './components/liquid-glass/LiquidGlassFilterDefs';
import LiquidGlassInteractionProvider from './components/liquid-glass/LiquidGlassInteractionProvider';
import LiquidAtmosphericCanvas from './components/liquid-glass/LiquidAtmosphericCanvas';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTitle from './lib/PageTitle';
import BudgetWidget from './components/BudgetWidget';
import AIFloatingButton from './components/AIFloatingButton';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';

const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));
const WeddingProfilePage = lazy(() => import('./pages/WeddingProfilePage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const VendorDetailPage = lazy(() => import('./pages/VendorDetailPage'));
const WeddingDashboardPage = lazy(() => import('./pages/WeddingDashboardPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const BecomeVendorPage = lazy(() => import('./pages/BecomeVendorPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const LabLensPage = lazy(() => import('./pages/LabLensPage'));
const ProviderDashboardPage = lazy(() => import('./pages/ProviderDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AcceptInvitationPage = lazy(() => import('./pages/AcceptInvitationPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

function PageRouteFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '3rem 1rem' }} aria-busy="true" />
  );
}

function AppContent() {
  const { role, language } = useAppContext();
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);

  // Supabase email links land here (confirmation + password recovery)
  if (location.pathname === '/auth/callback') {
    return (
      <>
        <PageTitle />
        <Suspense fallback={<PageRouteFallback />}>
          <AuthCallbackPage />
        </Suspense>
      </>
    );
  }

  // Dedicated standalone 3D Auth Pages
  if (isAuthPage) {
    let initialTab = 'login';
    if (location.pathname === '/register' || location.pathname === '/signup') initialTab = 'register';
    if (location.pathname === '/forgot-password') initialTab = 'forgot';
    if (location.pathname === '/reset-password') initialTab = 'reset';
    if (location.pathname === '/verify-email') initialTab = 'verify';
    return (
      <>
        <PageTitle />
        <Suspense fallback={<PageRouteFallback />}>
          <AuthPage initialTab={initialTab} />
        </Suspense>
      </>
    );
  }

  // Guard routes based on active role
  const ProtectedRoute = ({ allowedRoles, children }) => {
    // Admin has superuser access to view and verify all role workspaces
    const hasAccess = allowedRoles.includes(role) || role === 'admin';
    if (!hasAccess) {
      if (role === 'provider') return <Navigate to="/provider" replace />;
      if (role === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <ScrollToTop />
      <PageTitle />
      <LiquidAtmosphericCanvas />
      <a href="#main-content" className="skip-link">{language === 'sw' ? 'Ruka hadi maudhui' : 'Skip to content'}</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} style={{ flexGrow: 1 }} className="motion-page-container">
        <div key={location.pathname} className="motion-page-transition">
          <Suspense fallback={<PageRouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthPage initialTab="login" />} />
              <Route path="/register" element={<AuthPage initialTab="register" />} />
              <Route path="/signup" element={<AuthPage initialTab="register" />} />
              <Route path="/forgot-password" element={<AuthPage initialTab="forgot" />} />
              <Route path="/reset-password" element={<AuthPage initialTab="reset" />} />
              <Route path="/verify-email" element={<AuthPage initialTab="verify" />} />
              <Route path="/prototype" element={<Navigate to="/" replace />} />
              <Route path="/liquid-glass" element={<Navigate to="/" replace />} />
              <Route path="/planner" element={<AIChatPage />} />
              <Route path="/wedding" element={<WeddingProfilePage />} />
              <Route path="/invite/:token" element={<AcceptInvitationPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/vendor/:category/:id" element={<VendorDetailPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/become-vendor" element={<BecomeVendorPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              {import.meta.env.DEV && (
                <Route path="/lab/lens" element={<LabLensPage />} />
              )}
              <Route
                path="/dashboard"
                element={<ProtectedRoute allowedRoles={["customer"]}><WeddingDashboardPage /></ProtectedRoute>}
              />
              <Route
                path="/provider"
                element={<ProtectedRoute allowedRoles={["provider"]}><ProviderDashboardPage /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute>}
              />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
        <BudgetWidget />
        <BackToTop />
        <AIFloatingButton />
        <Footer />
      </div>
  );
}

// SPA navigation should always begin at the top of the new page.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <LiquidGlassInteractionProvider>
        <LiquidGlassFilterDefs />
        <AiPlannerProvider>
          <AppContent />
        </AiPlannerProvider>
      </LiquidGlassInteractionProvider>
    </Router>
  );
}

export default App;
