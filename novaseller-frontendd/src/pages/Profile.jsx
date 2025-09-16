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
      setMsg('Saved');
      setUser(res.data);
    } catch (_err) {
      setError('Save failed');
    }
  };

  if (!user) return <div className="card max-w-md mx-auto">Loading...</div>;

  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4">
      <div className="w-full max-w-xl bg-white/5 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
        <div className="mb-4 text-sm text-gray-300">
          <div><b>User ID:</b> <span className="text-gray-400">{user.id}</span></div>
          <div><b>Email:</b> <span className="text-gray-400">{user.email}</span></div>
          <div><b>Email Verified:</b> <span className={user.is_email_verified ? 'text-green-400' : 'text-red-400'}>{user.is_email_verified ? 'Yes' : 'No'}</span></div>
          <div className="flex items-center gap-2"><b>2FA Enabled:</b> <span className={user.is_2fa_enabled ? 'text-green-400' : 'text-red-400'}>{user.is_2fa_enabled ? 'Yes' : 'No'}</span>
            {!user.is_2fa_enabled && (
              <Link to="/2fa-setup" className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">Enable 2FA</Link>
            )}
          </div>
        </div>
        {msg && <div className="mb-4 text-sm text-green-300">{msg}</div>}
        {error && <div className="mb-4 text-sm text-red-300">{error}</div>}
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">First Name</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Last Name</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded text-white">Save changes</button>
        </form>
      </div>
    </div>
  );
}
