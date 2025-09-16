import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { passwordResetConfirm } from '../utils/api';
import Loader from '../components/Loader';

export default function PasswordResetConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setSubmitting(true);
    try {
      await passwordResetConfirm({ email, otp, new_password: newPassword });
      setMsg('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
        <p className="text-sm text-gray-500 mb-4">Enter the OTP sent to your email and your new password.</p>
        {msg && <div className="text-green-500 text-sm mb-2">{msg}</div>}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="Enter OTP" className="w-full p-3 rounded-md border border-gray-300" />
          <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="New password" className="w-full p-3 rounded-md border border-gray-300" />
          <button type="submit" disabled={submitting} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">{submitting ? <Loader /> : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  );
}
