import { useContext } from 'react'
import { Link } from 'react-router-dom'
import CartContext from '../context/cartContext'

export default function Cart() {
  const { items, remove } = useContext(CartContext)

  const total = items.reduce((s, i) => s + (i.product.price || 0) * i.qty, 0)

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white/5 border border-gray-700 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Your cart</h2>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-300">Your cart is empty</div>
        ) : (
          <div className="space-y-4">
            {items.map(i => (
              <div key={i.product.id} className="flex items-center gap-4 p-3 bg-gray-900/30 rounded">
                <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center text-gray-400">Img</div>
                <div className="flex-1">
                  <div className="font-medium text-white">{i.product.name}</div>
                  <div className="text-sm text-gray-400">Qty: {i.qty}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300">${(i.product.price || 0) * i.qty}</div>
                  <button onClick={() => remove(i.product.id)} className="text-red-400 text-sm mt-2">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <aside className="p-4 bg-white/5 border border-gray-700 rounded-lg">
        <div className="text-lg text-gray-300 mb-2">Summary</div>
        <div className="text-2xl font-bold text-green-400 mb-4">${total}</div>
        <Link to="/checkout" className="block w-full text-center py-3 bg-green-600 hover:bg-green-700 rounded text-white">Proceed to Checkout</Link>
      </aside>
    </div>
  )
}
