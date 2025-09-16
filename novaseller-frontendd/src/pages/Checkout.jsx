import { useState, useContext } from 'react'
import CartContext from '../context/cartContext'
import api from '../utils/api'

export default function Checkout() {
  const { items, clear } = useContext(CartContext)
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState('card')
  const [msg, setMsg] = useState(null)

  const placeOrder = async () => {
    try {
      const order = {
        items: items.map(i => ({ product: i.product.id, qty: i.qty })),
        address,
        payment_method: payment,
      }
      await api.post('/api/v1/orders/', order)
      setMsg('Order placed')
      clear()
    } catch (e) {
      setMsg('Failed to place order')
    }
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 bg-white/5 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
        {msg && <div className="mb-4 text-sm text-green-400">{msg}</div>}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm text-gray-300">Shipping address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={4} />
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded text-white">Continue</button>
              <button onClick={() => { setAddress(''); setStep(1) }} className="py-2 px-4 bg-gray-700 rounded text-white">Reset</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm text-gray-300">Payment method</label>
            <select value={payment} onChange={e => setPayment(e.target.value)} className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="card">Card</option>
              <option value="cod">Cash on Delivery</option>
            </select>
            <div className="flex gap-3">
              <button onClick={placeOrder} className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white">Place order</button>
              <button onClick={() => setStep(1)} className="py-2 px-4 bg-gray-700 rounded text-white">Back</button>
            </div>
          </div>
        )}
      </div>
      <aside className="p-4 bg-white/5 border border-gray-700 rounded-lg">
        <div className="text-lg text-gray-300 mb-2">Order summary</div>
        <div className="space-y-2">
          {items.map(i => (
            <div key={i.product.id} className="flex items-center justify-between text-sm">
              <div>{i.product.name} x {i.qty}</div>
              <div>${(i.product.price || 0) * i.qty}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
