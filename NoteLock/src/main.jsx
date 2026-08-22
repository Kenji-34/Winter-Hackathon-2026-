import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD:NoteLock/src/main.jsx
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
=======
import Homepage from './Homepage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Homepage />
>>>>>>> abb0e87 (home page ui):Note Lock/src/main.jsx
  </StrictMode>,
)
