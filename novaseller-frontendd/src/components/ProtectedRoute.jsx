import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/authContext';

export default function ProtectedRoute({ children, role, requireVerified = true, require2FA = false }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  if (requireVerified && user.is_email_verified === false) return <Navigate to="/otp-verification" replace />;
  if (require2FA && user.is_2fa_enabled === false) return <Navigate to="/2fa-setup" replace />;
  return children;
}
