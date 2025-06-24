// ==========================================
// 🔧 CORRECTION ANALYTICS - Gestion des valeurs NaN
// À appliquer dans AnalyticsPage.jsx
// ==========================================

// Fonction utilitaire à ajouter au début du fichier
const cleanNaNValues = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => {
      const cleaned = {};
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'number') {
          // Remplacer NaN, Infinity par 0
          cleaned[key] = (isNaN(value) || !isFinite(value)) ? 0 : value;
        } else {
          cleaned[key] = value;
        }
      }
      return cleaned;
    });
  }
  
  if (typeof data === 'object' && data !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number') {
        cleaned[key] = (isNaN(value) || !isFinite(value)) ? 0 : value;
      } else if (Array.isArray(value)) {
        cleaned[key] = cleanNaNValues(value);
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanNaNValues(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  
  // Pour les nombres simples
  if (typeof data === 'number') {
    return (isNaN(data) || !isFinite(data)) ? 0 : data;
  }
  
  return data;
};

// Dans la méthode qui calcule les analytics, avant de retourner les données :
const calculateAnalytics = () => {
  // ... calculs existants ...
  
  const rawAnalytics = {
    overview: {
      totalTasks: tasks.length || 0,
      completedTasks: completedTasks.length || 0,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      totalProjects: projects.length || 0,
      activeProjects: activeProjects.length || 0
    },
    charts: {
      tasksOverTime: tasksOverTimeData || [],
      projectProgress: projectProgressData || [],
      xpEvolution: xpEvolutionData || []
    }
  };
  
  // 🔧 NETTOYER TOUTES LES VALEURS NaN
  const cleanedAnalytics = cleanNaNValues(rawAnalytics);
  
  console.log('✅ Analytics nettoyés:', cleanedAnalytics);
  return cleanedAnalytics;
};

// Pour les composants de graphiques, ajouter une validation avant le rendu :
const SafeChart = ({ data, ...props }) => {
  // Vérifier que toutes les valeurs sont valides
  const isDataValid = data && data.every(item => 
    Object.values(item).every(value => 
      typeof value !== 'number' || (isFinite(value) && !isNaN(value))
    )
  );
  
  if (!isDataValid || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-500">Données insuffisantes</p>
          <p className="text-sm text-gray-400">Complétez quelques tâches pour voir les graphiques</p>
        </div>
      </div>
    );
  }
  
  return <OriginalChart data={cleanNaNValues(data)} {...props} />;
};

// Alternative plus simple : Wrapper pour tous les graphiques
const renderChart = (ChartComponent, data, props = {}) => {
  try {
    const cleanData = cleanNaNValues(data);
    
    // Vérifier que les données sont utilisables
    if (!cleanData || cleanData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">📊</div>
            <p className="text-gray-500">Aucune donnée disponible</p>
          </div>
        </div>
      );
    }
    
    return <ChartComponent data={cleanData} {...props} />;
  } catch (error) {
    console.error('❌ Erreur rendu graphique:', error);
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">⚠️</div>
          <p className="text-red-600">Erreur d'affichage</p>
          <p className="text-sm text-red-400">Vérifiez les données</p>
        </div>
      );
    }
  }
};

// Usage dans le JSX :
// {renderChart(LineChart, chartData, { width: 800, height: 300 })}
