import { Link } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/authContext'

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext)

  return (
    <div className="max-w-3xl mx-auto bg-white/5 border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-2">Welcome{user ? `, ${user.username}` : ''}</h2>
      <p className="text-sm text-gray-500 mb-4">Manage your account and orders</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/orders" className="p-4 bg-gray-800/40 rounded hover:shadow">My Orders</Link>
        <Link to="/profile" className="p-4 bg-gray-800/40 rounded hover:shadow">Profile</Link>
        <Link to="/addresses" className="p-4 bg-gray-800/40 rounded hover:shadow">Addresses</Link>
        <Link to="/payments" className="p-4 bg-gray-800/40 rounded hover:shadow">Payment methods</Link>
      </div>
    </div>
  )
}
