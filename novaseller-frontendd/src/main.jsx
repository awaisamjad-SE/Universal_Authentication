import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'

// Create a simple router and opt into v7 future flags to avoid warnings in dev
const router = createBrowserRouter([
  { path: '/*', element: <App /> },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
