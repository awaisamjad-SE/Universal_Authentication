import { useState } from 'react'
import CartContext from './cartContext'

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const add = (product, qty = 1) => {
    setItems(prev => {
      const found = prev.find(i => i.product.id === product.id)
      if (found) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { product, qty }]
    })
  }

  const remove = (productId) => setItems(prev => prev.filter(i => i.product.id !== productId))
  const clear = () => setItems([])

  return (
    <CartContext.Provider value={{ items, add, remove, clear }}>
      {children}
    </CartContext.Provider>
  )
}
