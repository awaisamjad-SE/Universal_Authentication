import { useState } from 'react';
import { passwordReset } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setSubmitting(true);
    try {
      await passwordReset({ email });
    } catch {
      // Always show generic message for security
    }
    setMsg('If this email exists, an OTP has been sent for password reset.');
    setTimeout(() => navigate('/password-reset-confirm', { state: { email } }), 1200);
    setSubmitting(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-2 text-white">Reset password</h2>
        <p className="text-sm text-gray-300 mb-4">Enter your email and we'll send a reset OTP.</p>
        {msg && <div className="mb-3 text-sm text-green-400">{msg}</div>}
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" className="w-full p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white">{submitting ? 'Sending...' : 'Send reset OTP'}</button>
        </form>
      </div>
    </div>
  );
}
