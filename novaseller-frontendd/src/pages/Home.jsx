import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    api.get('/api/v1/products/?featured=true').then(r => setFeatured(r.data.results || r.data))
  }, [])

  return (
    <div className="space-y-10">
      <section className="bg-gradient-to-r from-indigo-900 via-gray-900 to-black rounded-lg p-10 mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-3">Universal Auth — secure authentication</h1>
          <p className="text-gray-300 mb-6">Shop products, manage your profile, addresses and payment methods. Fast, simple, and secure.</p>
          <div className="flex items-center justify-center gap-3">
            <a href="/profile" className="py-3 px-6 bg-green-500 hover:bg-green-600 rounded text-black font-semibold">Profile</a>
            <a href="/signup" className="py-3 px-6 border border-gray-600 rounded text-gray-200">Create account</a>
          </div>
        </div>
      </section>


    </div>
  )
}
