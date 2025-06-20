// App.jsx - Version debug temporaire
import { BrowserRouter as Router } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Import direct des composants pour bypass les routes
import Dashboard from './modules/dashboard/Dashboard';

function App() {
  console.log('🚀 App component rendering...');

  return (
    <Router>
      <MainLayout>
        {/* Affichage direct du Dashboard pour debug */}
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <h1 className="text-blue-400 font-bold">🔧 MODE DEBUG ACTIF</h1>
            <p className="text-blue-300 text-sm">
              App.jsx bypass l'authentification temporairement
            </p>
          </div>
          
          {/* Dashboard direct */}
          <Dashboard />
        </div>
      </MainLayout>
    </Router>
  );
}

export default App;
