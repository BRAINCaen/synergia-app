// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// CORRECTIF - Synchroniser le widget Progression avec Firebase
// ==========================================

// Dans votre DashboardLayout.jsx existant, REMPLACER la section "Progression" 
// qui se trouve vers la ligne 200-250 par ce code :

// ✅ NOUVEAU: Import du hook unifié
import { useUnifiedUser } from '../shared/hooks/useUnifiedUser.js';

// Dans le composant DashboardLayout, AJOUTER ce hook :
const DashboardLayout = ({ children }) => {
  // ... autres imports et code existant ...

  // ✅ NOUVEAU: Hook unifié pour données Firebase
  const { 
    stats, 
    xpProgress, 
    badges, 
    loading: userLoading, 
    isReady 
  } = useUnifiedUser();

  // ... reste du code existant ...

  // ✅ NOUVEAU: Remplacer la section Progression par ceci :
  const renderProgressionWidget = () => {
    if (!isReady || userLoading) {
      return (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      );
    }

    return (
      <div className="p-4 border-b border-gray-200">
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Progression</h3>
          
          {/* ✅ NOUVEAU: Données depuis Firebase */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Niveau {stats.level}</span>
              <span className="text-gray-600">{stats.totalXp} XP</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${xpProgress.progressPercent}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
              <span>🎯 {stats.tasksCompleted} tâches</span>
              <span>🏆 {badges.count} badges</span>
              <span>📁 {stats.projectsCreated} projets</span>
              <span>🔥 {stats.loginStreak} jour(s)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}>
        
        {/* ... header sidebar existant ... */}
        
        {/* Navigation existante */}
        {/* ... navigation sections existantes ... */}
        
        {/* ✅ NOUVEAU: Widget Progression synchronisé Firebase */}
        {renderProgressionWidget()}
        
        {/* ... reste du sidebar existant ... */}
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ... header et contenu existants ... */}
      </div>
    </div>
  );
};
