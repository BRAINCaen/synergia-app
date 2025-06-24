import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from './layouts/MainLayout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TeamPage from './pages/TeamPage'
import Analytics from './pages/Analytics'
import NotFound from './pages/NotFound'

// Modules
import ProjectDashboard from './modules/projects/ProjectDashboard'
import ProjectDetailView from './modules/projects/ProjectDetailView'
import TaskList from './modules/tasks/TaskList'
import Profile from './modules/profile/components/Profile'
import GamificationDashboard from './modules/gamification/GamificationDashboard'

// Mock d'authentification simple pour rebuild
const useAuth = () => {
  // TODO: Remplacer par vrai authStore une fois que Firebase est configuré
  const [user, setUser] = React.useState(null)
  
  React.useEffect(() => {
    // Simulation d'utilisateur connecté pour le développement
    const mockUser = localStorage.getItem('synergia-user')
    if (mockUser) {
      setUser(JSON.parse(mockUser))
    }
  }, [])
  
  return { user, loading: false }
}

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Routes>
          {/* Routes publiques */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          
          {/* Routes protégées */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ProjectDashboard />} />
            <Route path="projects/:projectId" element={<ProjectDetailView />} />
            <Route path="tasks" element={<TaskList />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="gamification" element={<GamificationDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
