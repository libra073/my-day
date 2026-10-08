import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { AiPlannerProvider } from './context/AiPlannerContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BudgetWidget from './components/BudgetWidget';
import AIFloatingButton from './components/AIFloatingButton';
import HomePage from './pages/HomePage';
import AIChatPage from './pages/AIChatPage';
import WeddingProfilePage from './pages/WeddingProfilePage';
import MarketplacePage from './pages/MarketplacePage';
import VendorDetailPage from './pages/VendorDetailPage';
import WeddingDashboardPage from './pages/WeddingDashboardPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BecomeVendorPage from './pages/BecomeVendorPage';
import ContactUsPage from './pages/ContactUsPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  const { role } = useAppContext();

  // Guard routes based on active role
  const ProtectedRoute = ({ allowedRoles, children }) => {
    return allowedRoles.includes(role) ? children : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <AiPlannerProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/planner" element={<AIChatPage />} />
              <Route path="/wedding" element={<WeddingProfilePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/vendor/:category/:id" element={<VendorDetailPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/become-vendor" element={<BecomeVendorPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
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
          </main>
          <BudgetWidget />
          <AIFloatingButton />
          <Footer />
        </div>
      </AiPlannerProvider>
    </Router>
  );
}

export default App;

