import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, sendOtp } from '../utils/api';
import Loader from '../components/Loader';

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) return <div className="p-6">No email provided.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyOtp({ email, otp });
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResent(false);
    try {
      await sendOtp({ email });
      setResent(true);
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-2">Verify your email</h2>
        <p className="text-sm text-gray-500 mb-4">Enter the OTP sent to <b>{email}</b></p>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {resent && <div className="text-green-500 text-sm mb-2">OTP resent!</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="Enter OTP" className="w-full p-3 rounded-md border border-gray-300" />
          <button type="submit" disabled={submitting} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">
            {submitting ? <Loader /> : 'Verify'}
          </button>
        </form>
        <button onClick={handleResend} className="mt-3 text-sm text-indigo-600 hover:underline">Resend OTP</button>
      </div>
    </div>
  );
}
