import { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import CartContext from '../context/cartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const { add } = useContext(CartContext)

  useEffect(() => {
    api.get(`/api/v1/products/${id}/`).then(r => setProduct(r.data))
  }, [id])

  if (!product) return <div className="card max-w-md mx-auto">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 bg-white/5 border border-gray-700 rounded-lg overflow-hidden">
        <div className="h-80 bg-gray-800 flex items-center justify-center text-gray-400">Product image</div>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-white mb-2">{product.name}</h2>
          <p className="text-gray-300">{product.description}</p>
        </div>
      </div>
      <aside className="p-6 bg-white/5 border border-gray-700 rounded-lg">
        <div className="text-2xl font-bold text-green-400 mb-4">${product.price}</div>
        <div className="mb-4 text-sm text-gray-300">Tax and shipping calculated at checkout.</div>
        <button onClick={() => add(product)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded text-white">Add to cart</button>
      </aside>
    </div>
  )
}
