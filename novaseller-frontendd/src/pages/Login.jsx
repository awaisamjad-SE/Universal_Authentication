import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, twoFALogin } from '../utils/api';
import Loader from '../components/Loader';
import AuthContext from '../context/authContext';

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState(null)
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { login } = useContext(AuthContext)

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const [twoFARequired, setTwoFARequired] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError('Please fill all fields');
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      if (!twoFARequired) {
        // First step: try normal login
        const res = await loginApi({ email, password });
        if (res.data.detail === '2FA code required') {
          setTwoFARequired(true);
          setError('2FA code required. Please use your authenticator app.');
        } else {
          const tokens = { access: res.data.access, refresh: res.data.refresh };
          const userData = res.data.user || res.data;
          login(tokens, userData);
          setError(null);
          setTimeout(() => navigate('/dashboard'), 300);
        }
      } else {
        // Second step: submit 2FA code
        if (!twoFACode) {
          setError('Please enter your 2FA code.');
          setSubmitting(false);
          return;
        }
        const res = await twoFALogin({ email, password, code: twoFACode });
        if (res.data.detail === 'Invalid 2FA code.') {
          setError('Invalid 2FA code.');
        } else {
          const tokens = { access: res.data.access, refresh: res.data.refresh };
          const userData = res.data.user || res.data;
          login(tokens, userData);
          setError(null);
          setTimeout(() => navigate('/dashboard'), 300);
        }
      }
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Welcome back</h2>
  <p className="text-sm text-gray-500 mb-4">Sign in to continue to Universal Auth</p>
        {error && <div role="alert" className="text-red-500 text-sm mt-1 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <input value={email} onChange={e => { setEmail(e.target.value); setEmailError(null) }} placeholder="you@domain.com" aria-invalid={!!emailError} className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            {emailError && <div className="text-sm text-red-500 mt-1">{emailError}</div>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Password</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" type={showPassword ? 'text' : 'password'} className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-2 top-2 text-sm text-indigo-600 hover:text-indigo-700">{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          {twoFARequired && (
            <div>
              <label className="block text-sm text-gray-500 mb-1">2FA Code</label>
              <input
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value)}
                placeholder="Enter 2FA code"
                maxLength={6}
                className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <a className="text-indigo-600 hover:text-indigo-700" href="/forgot-password">Forgot password?</a>
            <button type="submit" disabled={submitting} className="ml-4 inline-flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-60">
              {submitting ? <Loader /> : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">No account? <a href="/signup" className="text-indigo-600 hover:text-indigo-700">Create one</a></div>
      </div>
    </div>
  )
}
