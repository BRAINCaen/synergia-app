import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './core/firebase.js'
import './index.css'

// Import dynamique pour éviter les erreurs de build
const Login = React.lazy(() => import('./pages/Login.jsx'))
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'))

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement de l'application...</div>
      </div>
    }>
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
    </React.Suspense>
  )
}

export default App
