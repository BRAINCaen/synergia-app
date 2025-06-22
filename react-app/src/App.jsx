import React, { useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './core/firebase.js'
import './index.css'

// Google Provider
const googleProvider = new GoogleAuthProvider()

// Composant Login intégré
function Login({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      let userCredential
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await createUserIfNotExists(userCredential.user)
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      }
      onLogin(userCredential.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const res = await signInWithPopup(auth, googleProvider)
      await createUserIfNotExists(res.user)
      onLogin(res.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createUserIfNotExists = async (user) => {
    const ref = doc(db, "users", user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: user.displayName || "",
        email: user.email,
        photoURL: user.photoURL || "",
        role: "employee",
        status: "active",
        createdAt: new Date(),
        lastLoginAt: new Date(),
        gamification: {
          xp: 0,
          level: 1,
          totalXp: 0,
          badges: [],
          achievements: [],
          streakDays: 0,
          lastActivityAt: new Date(),
          joinedAt: new Date()
        }
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <h1 className="text-3xl font-bold">⚡ Synergia</h1>
          </div>
          <h2 className="text-xl text-gray-300 mb-2">
            {isRegister ? "Créer un compte" : "Connexion"}
          </h2>
          <p className="text-gray-500 text-sm">v2.0 - Architecture Modulaire</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <input
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              className="bg-blue-600 hover:bg-blue-700 rounded-lg p-3 mt-2 font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "⏳ Chargement..." : (isRegister ? "Créer le compte" : "Se connecter")}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">ou</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          <button
            className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg p-3 font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
            onClick={handleGoogle}
            type="button"
            disabled={loading}
          >
            <span>🔗</span> Connexion avec Google
          </button>

          <div className="mt-6 text-center">
            <button
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
              onClick={() => {
                setIsRegister(!isRegister)
                setError("")
              }}
              disabled={loading}
            >
              {isRegister ? "Déjà inscrit ? Se connecter" : "Créer un compte"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            Synergia v2.0 • Architecture Modulaire • 2025
          </p>
        </div>
      </div>
    </div>
  )
}

// Composant Dashboard intégré
function Dashboard({ user, onLogout }) {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setUserProfile(userSnap.data())
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      onLogout()
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bon matin"
    if (hour < 18) return "Bon après-midi"
    return "Bonsoir"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement du profil...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Synergia</h1>
                <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-blue-600 text-white text-xs rounded-full font-medium">
                  v2.0 • Modulaire
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-lg"
                />
                <div className="hidden md:block text-right">
                  <p className="text-white font-medium">
                    {userProfile?.displayName || user.displayName || user.email}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {userProfile?.role === 'admin' ? '👑 Admin' : 
                     userProfile?.role === 'manager' ? '⭐ Manager' : 
                     '👤 Membre'}
                  </p>
                </div>
                <button
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-3">
                {getGreeting()}, {userProfile?.displayName || user.displayName || 'Équipier'} ! 👋
              </h2>
              <p className="text-blue-100 text-lg mb-4">
                Félicitations ! Synergia v2.0 est maintenant déployé avec succès ! 🎉
              </p>
              <div className="flex flex-wrap gap-4 text-blue-200">
                <span className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>✅</span>
                  <span className="text-sm">Build réussi</span>
                </span>
                <span className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>🚀</span>
                  <span className="text-sm">Phase 2 active</span>
                </span>
                <span className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>⭐</span>
                  <span className="text-sm">Niveau {userProfile?.gamification?.level || 1}</span>
                </span>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  En ligne
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Statut Build</p>
                <p className="text-2xl font-bold text-green-400">Réussi ✅</p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Niveau</p>
                <p className="text-2xl font-bold text-blue-400">
                  {userProfile?.gamification?.level || 1}
                </p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Expérience</p>
                <p className="text-2xl font-bold text-purple-400">
                  {userProfile?.gamification?.xp || 0} XP
                </p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">🎉 Synergia v2.0 déployé avec succès !</h3>
            <p className="text-gray-300 mb-4">
              Architecture modulaire opérationnelle. Prêt pour le développement de la Phase 2.4 Gamification.
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-400">
              <span>✨ Interface moderne</span>
              <span>•</span>
              <span>🔧 Architecture évolutive</span>
              <span>•</span>
              <span>🚀 Firebase intégré</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// App principal
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
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-white">Chargement de Synergia...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />
}

export default App
