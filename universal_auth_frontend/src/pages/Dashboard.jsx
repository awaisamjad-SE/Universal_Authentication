import { useContext } from 'react'
import AuthContext from '../context/authContext'

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading...</div>;
  if (!user) {
    window.location = '/login';
    return null;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl px-8 py-10 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome, {user.first_name} {user.last_name}!</h1>
        <p className="text-gray-600 text-lg">You are logged in to your dashboard.</p>
        {user.is_2fa_enabled && (
          <div className="mt-6 text-green-600 font-semibold">2FA is enabled on your account.</div>
        )}
      </div>
    </div>
  );
}
