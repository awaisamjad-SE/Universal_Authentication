import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  login as loginApi, 
  twoFALogin, 
  recoveryLogin,
  requestRecovery 
} from '../utils/api';
import Loader from '../components/Loader';
import AuthContext from '../context/authContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EnhancedLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { login } = useContext(AuthContext);

  // 2FA states
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  
  // Recovery states
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showRecoveryOptions, setShowRecoveryOptions] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
    document.title = 'Login - Universal Auth';
  }, [user, navigate]);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleNormalLogin = async () => {
    try {
      const res = await loginApi({ email, password });
      
      // Check if 2FA is required
      if (res.data.detail === '2FA code required') {
        setTwoFARequired(true);
        toast.info('2FA is required. Enter your authenticator code or use a backup recovery code.');
        return;
      }
      
      // Normal login success
      const tokens = { access: res.data.access, refresh: res.data.refresh };
      const userData = res.data.user || res.data;
      login(tokens, userData);
      setError(null);
      toast.success('Login successful!');
      setTimeout(() => navigate('/dashboard'), 300);
      
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed';
      
      // Check if 2FA is required from error message
      if (errorMsg.includes('2FA') || errorMsg.includes('Two-factor') || errorMsg.includes('authenticator')) {
        setTwoFARequired(true);
        setError('Two-factor authentication required. Use your authenticator app or backup recovery codes.');
        toast.info('2FA Required: Use authenticator app or backup codes below');
      } else {
        setError(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  const handle2FALogin = async () => {
    if (!twoFACode) {
      toast.error('Please enter your 2FA code.');
      return;
    }
    
    try {
      const res = await twoFALogin({ email, password, code: twoFACode });
      const tokens = { access: res.data.access, refresh: res.data.refresh };
      const userData = res.data.user || res.data;
      login(tokens, userData);
      setError(null);
      toast.success('Login successful!');
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid 2FA code');
    }
  };

  const handleRecoveryLogin = async () => {
    if (!recoveryCode) {
      toast.error('Please enter your recovery code.');
      return;
    }
    
    try {
      const res = await recoveryLogin({ email, password, recovery_code: recoveryCode });
      const tokens = { access: res.data.access, refresh: res.data.refresh };
      const userData = res.data.user || res.data;
      login(tokens, userData);
      setError(null);
      toast.success(`Login successful! ${res.data.remaining_codes} recovery codes remaining.`);
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid recovery code');
    }
  };

  const handleRequestRecovery = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    
    try {
      await requestRecovery({ email });
      toast.success('Recovery instructions sent to your email!');
      setShowRecoveryOptions(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send recovery email');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }
    
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (showRecovery) {
        await handleRecoveryLogin();
      } else if (twoFARequired) {
        await handle2FALogin();
      } else {
        await handleNormalLogin();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTwoFARequired(false);
    setTwoFACode('');
    setShowRecovery(false);
    setRecoveryCode('');
    setShowRecoveryOptions(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-500">
            {showRecovery ? 'Login with recovery code' :
             twoFARequired ? 'Enter your 2FA code' :
             'Sign in to continue to Universal Auth'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
        
        <form onSubmit={submit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <input 
              value={email} 
              onChange={e => { setEmail(e.target.value); setEmailError(null); }} 
              placeholder="you@domain.com" 
              type="email"
              disabled={twoFARequired || showRecovery}
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100" 
            />
            {emailError && <div className="text-sm text-red-500 mt-1">{emailError}</div>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Password</label>
            <div className="relative">
              <input 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••" 
                type={showPassword ? 'text' : 'password'} 
                disabled={twoFARequired || showRecovery}
                className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(s => !s)} 
                className="absolute right-2 top-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* 2FA Code Field */}
          {twoFARequired && !showRecovery && (
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                2FA Code from Authenticator App
              </label>
              <input
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code from Google Authenticator or similar app
              </p>
              
              {/* Can't access authenticator warning */}
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-yellow-800">
                    <strong>Can't access your authenticator app?</strong> Use the recovery options below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recovery Code Field */}
          {showRecovery && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <h3 className="text-sm font-medium text-green-900 mb-1">🔐 Using Backup Recovery Code</h3>
                <p className="text-xs text-green-700">
                  Enter any of your saved 8-character backup codes. Each code can only be used once.
                </p>
              </div>
              
              <label className="block text-sm text-gray-500 mb-1">Recovery Code</label>
              <input
                value={recoveryCode}
                onChange={e => setRecoveryCode(e.target.value)}
                placeholder="A1B2C3D4"
                maxLength={8}
                className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: Q7MRO7CX, SEL70MFD, QOFI7978, etc.
              </p>
              
              {/* Go back to 2FA option */}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => { setShowRecovery(false); setRecoveryCode(''); }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  ← Back to authenticator app
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={submitting} 
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader /> : 
             showRecovery ? 'Login with Recovery Code' :
             twoFARequired ? 'Verify 2FA Code' :
             'Sign in'}
          </button>
        </form>

        {/* Recovery Options */}
        {twoFARequired && !showRecovery && (
          <div className="mt-6">
            {/* Primary Recovery Option */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">🔑 Lost access to your authenticator app?</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setShowRecovery(true); setTwoFACode(''); }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Use Backup Recovery Code
                </button>
                <p className="text-xs text-blue-700">
                  Enter one of your saved 8-character backup codes (e.g., A1B2C3D4)
                </p>
              </div>
            </div>
            
            {/* Secondary Recovery Option */}
            <div className="text-center border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Still can't access your account?</p>
              <button
                onClick={handleRequestRecovery}
                className="text-sm text-indigo-600 hover:text-indigo-700 underline"
              >
                Get emergency recovery help via email
              </button>
            </div>
          </div>
        )}

        {/* Recovery Options Info */}
        {showRecoveryOptions && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Recovery options sent to your email:
            </p>
            <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
              <li>Use backup recovery codes</li>
              <li>Emergency disable 2FA</li>
            </ul>
          </div>
        )}

        {/* Back to Normal Login */}
        {(twoFARequired || showRecovery) && (
          <div className="mt-4 text-center">
            <button
              onClick={resetForm}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              ← Back to normal login
            </button>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-6 space-y-2">
          <div className="text-center text-sm">
            <a 
              href="/forgot-password" 
              className="text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </a>
          </div>
          <div className="text-center text-sm text-gray-500">
            No account?{' '}
            <a href="/signup" className="text-indigo-600 hover:text-indigo-700">
              Create one
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}