import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../utils/api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProfile().then(r => {
      setUser(r.data);
      setUsername(r.data.username || '');
      setFirstName(r.data.first_name || '');
      setLastName(r.data.last_name || '');
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    try {
      const res = await updateProfile({ username, first_name: firstName, last_name: lastName });
      setMsg('Profile updated successfully.');
      setUser(res.data);
    } catch (err) {
      if (err.response?.data?.username?.[0]) {
        setError(err.response.data.username[0]);
      } else {
        setError('Save failed');
      }
    }
  };

  if (!user) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="bg-white shadow rounded-lg px-8 py-6 text-center text-lg font-medium text-gray-700">Loading profile...</div>
    </div>
  );

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-xl bg-white border border-gray-200 shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Profile</h2>
        <p className="mb-6 text-gray-500">Manage your account details and security settings.</p>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-900">{user.email}</span></div>
          <div><span className="font-semibold text-gray-700">Email Verified:</span> <span className={user.is_email_verified ? 'text-green-600' : 'text-red-500'}>{user.is_email_verified ? 'Yes' : 'No'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">2FA Enabled:</span> <span className={user.is_2fa_enabled ? 'text-green-600' : 'text-red-500'}>{user.is_2fa_enabled ? 'Yes' : 'No'}</span>
            {!user.is_2fa_enabled && (
              <Link to="/2fa-setup" className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">Enable 2FA</Link>
            )}
          </div>
        </div>
        {msg && <div className="mb-4 text-sm text-green-600 font-medium">{msg}</div>}
        {error && <div className="mb-4 text-sm text-red-600 font-medium">{error}</div>}
        <form onSubmit={save} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 rounded border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-3 rounded border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-3 rounded border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold text-lg transition">Save changes</button>
        </form>
      </div>
    </div>
  );
}
