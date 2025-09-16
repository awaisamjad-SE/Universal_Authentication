import { useContext, useState, useEffect } from 'react';
import { setup2FA, verify2FA } from '../utils/api';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext';

export default function TwoFASetup() {
  const { user, loading } = useContext(AuthContext);
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && user.is_2fa_enabled) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSetup = async () => {
    setError(null);
    setMsg(null);
    try {
      const res = await setup2FA();
      setQr(res.data.qr_code_url);
      setSecret(res.data.secret);
    } catch {
      setError('Failed to start 2FA setup');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMsg(null);
    try {
      await verify2FA({ code });
      setMsg('2FA enabled successfully.');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid 2FA code.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-2">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-500 mb-4">Add extra security to your account.</p>
        {msg && <div className="text-green-500 text-sm mb-2">{msg}</div>}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {!qr ? (
          <button onClick={handleSetup} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Start 2FA Setup</button>
        ) : (
          <>
            <div className="mb-4">
              <div className="mb-2">Scan this QR code in your authenticator app:</div>
              {qr && qr.startsWith('otpauth://') ? (
                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=180x180`}
                    alt="2FA QR Code"
                    className="mx-auto"
                  />
                </div>
              ) : (
                <img src={qr} alt="2FA QR Code" className="mx-auto" />
              )}
              <div className="mt-2 text-xs text-gray-500">Or enter secret: <b>{secret}</b></div>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <input value={code} onChange={e => setCode(e.target.value)} maxLength={6} placeholder="Enter 2FA code" className="w-full p-3 rounded-md border border-gray-300" />
              <button type="submit" disabled={submitting} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">
                {submitting ? <Loader /> : 'Verify & Enable'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
