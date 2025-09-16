import { Link } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/authContext'

export default function Header() {
  const { user, logout } = useContext(AuthContext)

  return (
    <header className="flex items-center justify-between mb-6 py-4">
  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Universal Auth</h1>
      <nav className="flex items-center gap-4">
        <Link to="/" className="text-sm text-gray-700 dark:text-gray-200">Home</Link>
        {user ? (
          <>
            <Link to={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/'} className="text-sm text-indigo-600 hover:text-indigo-700">Dashboard</Link>
            <button onClick={logout} className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 py-1 px-3 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-700">Login</Link>
            <Link to="/signup" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded">Signup</Link>
          </>
        )}
      </nav>
    </header>
  )
}
