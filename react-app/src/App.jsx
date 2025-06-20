// App.jsx - Version debug avec gestion des routes
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Import direct des composants
import Dashboard from './modules/dashboard/Dashboard';
import GamificationDashboard from './modules/gamification/GamificationDashboard';

// Composant pour afficher la route actuelle
const RouteDebugger = () => {
  const location = useLocation();
  return (
    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-4">
      <h1 className="text-blue-400 font-bold">🔧 MODE DEBUG ACTIF</h1>
      <p className="text-blue-300 text-sm">
        Route actuelle: <strong>{location.pathname}</strong>
      </p>
      <p className="text-blue-200 text-xs">
        App.jsx bypass l'authentification temporairement
      </p>
    </div>
  );
};

// Composant principal avec routes
const AppContent = () => {
  return (
    <MainLayout>
      <RouteDebugger />
      <Routes>
        {/* Route Dashboard */}
        <Route 
          path="/dashboard" 
          element={<Dashboard />} 
        />
        
        {/* Route Gamification */}
        <Route 
          path="/gamification" 
          element={
            <div>
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-4">
                <p className="text-green-400 font-medium">
                  ✅ Page Gamification chargée !
                </p>
              </div>
              <GamificationDashboard />
            </div>
          } 
        />
        
        {/* Route par défaut */}
        <Route path="/" element={<Dashboard />} />
        
        {/* 404 */}
        <Route 
          path="*" 
          element={
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
              <h2 className="text-red-400 text-xl font-bold mb-2">Page non trouvée</h2>
              <p className="text-red-300">Cette route n'existe pas.</p>
            </div>
          } 
        />
      </Routes>
    </MainLayout>
  );
};

function App() {
  console.log('🚀 App component rendering with routes...');

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
