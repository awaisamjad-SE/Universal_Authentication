import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function Payments() {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/users/payments/').then(r => setMethods(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto bg-white/5 border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Payment methods</h2>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {methods.length === 0 ? <div className="text-gray-300">No payment methods</div> : (
            methods.map(m => (
              <div key={m.id} className="p-3 bg-gray-900/30 rounded flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{m.card_brand || m.type}</div>
                  <div className="text-sm text-gray-300">**** **** **** {m.last4}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
