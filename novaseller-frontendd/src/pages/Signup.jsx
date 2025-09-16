import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../utils/api';
import Loader from '../components/Loader';
import AuthContext from '../context/authContext';

export default function Signup() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !username || !password || !password2 || !firstName || !lastName) return setError('Please fill all fields');
    if (password !== password2) return setError('Passwords do not match');
    setSubmitting(true);
    try {
      await register({ email, username, first_name: firstName, last_name: lastName, password });
      navigate('/otp-verification', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || 'Signup failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Create an account</h2>
  <p className="text-sm text-gray-500 mb-4">Join Universal Auth to access your account</p>
        {error && <div role="alert" className="text-red-500 text-sm mt-1 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">First Name</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Last Name</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Confirm password</label>
            <input value={password2} onChange={e => setPassword2(e.target.value)} placeholder="Confirm password" type="password" className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-60">
              {submitting ? <Loader /> : 'Create account'}
            </button>
            <a href="/login" className="text-sm text-gray-300 hover:underline">Already have an account?</a>
          </div>
        </form>
      </div>
    </div>
  )
}
