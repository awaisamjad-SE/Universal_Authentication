import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function Orders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.get('/api/v1/orders/').then(r => setOrders(r.data.results || r.data))
  }, [])

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-xl mb-4">My Orders</h2>
      {orders.map(o => (
        <div key={o.id} className="p-3 border-b border-white/10">Order #{o.id} - {o.total}</div>
      ))}
    </div>
  )
}
