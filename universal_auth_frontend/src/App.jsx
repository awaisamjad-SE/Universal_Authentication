import { Routes, Route } from 'react-router-dom'

import { AuthProvider } from './context/AuthProvider';
import Header from './components/Header';
import Loader from './components/Loader';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import OTPVerification from './pages/OTPVerification';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import TwoFASetup from './pages/2FASetup';
import TwoFAManagement from './pages/TwoFAManagement';
import EnhancedLogin from './pages/EnhancedLogin';
import TwoFARecovery from './pages/TwoFARecovery';
import TwoFATestPage from './pages/TwoFATestPage';
import TwoFADemo from './pages/TwoFADemo';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<EnhancedLogin />} />
            <Route path="/enhanced-login" element={<EnhancedLogin />} />
            <Route path="/basic-login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/password-reset-confirm" element={<PasswordResetConfirm />} />
            
            {/* 2FA Routes */}
            <Route path="/2fa-setup" element={<ProtectedRoute requireVerified={true}><TwoFASetup /></ProtectedRoute>} />
            <Route path="/2fa-management" element={<ProtectedRoute requireVerified={true}><TwoFAManagement /></ProtectedRoute>} />
            <Route path="/2fa-recovery" element={<TwoFARecovery />} />
            <Route path="/2fa-test" element={<ProtectedRoute requireVerified={true}><TwoFATestPage /></ProtectedRoute>} />
            <Route path="/2fa-demo" element={<TwoFADemo />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/customer" element={<ProtectedRoute role="customer" requireVerified={true} require2FA={false}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute role="admin" requireVerified={true} require2FA={false}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute requireVerified={true}><Profile /></ProtectedRoute>} />
          </Routes>
        </main>
        </div>
  {/* CartProvider removed */}
    </AuthProvider>
  )
}

export default App
