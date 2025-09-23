import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function Addresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/users/addresses/').then(r => setAddresses(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto bg-white/5 border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Addresses</h2>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {addresses.length === 0 ? <div className="text-gray-300">No addresses found</div> : (
            addresses.map(a => (
              <div key={a.id} className="p-3 bg-gray-900/30 rounded">
                <div className="font-medium text-white">{a.label || 'Address'}</div>
                <div className="text-sm text-gray-300">{a.address_line}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
