import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../utils/api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    api.get(`/api/v1/products/?search=${encodeURIComponent(q)}`).then(r => setProducts(r.data.results || r.data)).finally(() => setLoading(false))
  }, [q])

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <input defaultValue={q} onBlur={e => setSearchParams({ q: e.target.value })} placeholder="Search products" className="flex-1 p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      {loading ? <div className="text-center py-8">Loading...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <Link key={p.id} to={`/products/${p.id}`} className="block bg-white/5 border border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-44 bg-gray-800 flex items-center justify-center text-gray-400">Image</div>
              <div className="p-4">
                <h3 className="font-medium text-white mb-1">{p.name}</h3>
                <p className="text-sm text-gray-300 mb-2">{p.description ? p.description.slice(0, 80) + '...' : ''}</p>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-green-400">${p.price}</div>
                  <div className="text-sm text-gray-400">View</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
