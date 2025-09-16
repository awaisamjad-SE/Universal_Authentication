import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../context/authContext'

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext)
  const nav = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) return nav('/login')
      if (user.role === 'admin') return nav('/dashboard/admin')
      return nav('/dashboard/customer')
    }
  }, [user, loading, nav])

  return null
}
