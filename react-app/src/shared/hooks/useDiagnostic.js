// ==========================================
// 📁 react-app/src/shared/hooks/useDiagnostic.js
// Hook de diagnostic pour identifier les problèmes
// ==========================================

import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    auth: 'checking',
    firebase: 'checking',
    routes: 'checking',
    modules: 'checking',
    errors: []
  });

  const { user, loading } = useAuthStore();

  useEffect(() => {
    const runDiagnostics = async () => {
      const results = {
        auth: 'unknown',
        firebase: 'unknown',
        routes: 'unknown',
        modules: 'unknown',
        errors: []
      };

      try {
        // ✅ Test Auth
        if (user) {
          results.auth = 'connected';
        } else if (loading) {
          results.auth = 'loading';
        } else {
          results.auth = 'disconnected';
        }

        // ✅ Test Firebase
        try {
          // Vérifier si Firebase est initialisé
          if (window.firebase || (typeof firebase !== 'undefined')) {
            results.firebase = 'available';
          } else {
            results.firebase = 'missing';
            results.errors.push('Firebase SDK non disponible');
          }
        } catch (error) {
          results.firebase = 'error';
          results.errors.push(`Firebase Error: ${error.message}`);
        }

        // ✅ Test Routes
        try {
          const currentPath = window.location.pathname;
          if (currentPath) {
            results.routes = 'working';
          } else {
            results.routes = 'error';
            results.errors.push('Problème de routage détecté');
          }
        } catch (error) {
          results.routes = 'error';
          results.errors.push(`Routes Error: ${error.message}`);
        }

        // ✅ Test Modules
        try {
          // Vérifier que les modules principaux sont accessibles
          const requiredModules = [
            'react',
            'react-dom',
            'react-router-dom'
          ];
          
          let moduleErrors = 0;
          requiredModules.forEach(module => {
            try {
              require.resolve(module);
            } catch {
              moduleErrors++;
              results.errors.push(`Module manquant: ${module}`);
            }
          });

          results.modules = moduleErrors === 0 ? 'loaded' : 'missing';
        } catch (error) {
          results.modules = 'error';
          results.errors.push(`Modules Error: ${error.message}`);
        }

      } catch (error) {
        results.errors.push(`Diagnostic Error: ${error.message}`);
      }

      setDiagnostics(results);
    };

    runDiagnostics();
  }, [user, loading]);

  // ✅ Fonction pour obtenir le statut global
  const getOverallStatus = () => {
    const { auth, firebase, routes, modules, errors } = diagnostics;
    
    if (errors.length > 0) return 'error';
    if ([auth, firebase, routes, modules].includes('checking')) return 'checking';
    if ([auth, firebase, routes, modules].includes('error')) return 'error';
    if (auth === 'connected' && firebase === 'available' && routes === 'working' && modules === 'loaded') {
      return 'healthy';
    }
    return 'warning';
  };

  // ✅ Fonction pour obtenir des recommandations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (diagnostics.auth === 'disconnected') {
      recommendations.push('Connectez-vous pour accéder au dashboard');
    }
    
    if (diagnostics.firebase === 'missing') {
      recommendations.push('Vérifiez la configuration Firebase');
    }
    
    if (diagnostics.routes === 'error') {
      recommendations.push('Vérifiez la configuration des routes React Router');
    }
    
    if (diagnostics.modules === 'missing') {
      recommendations.push('Installez les dépendances manquantes avec npm install');
    }
    
    if (diagnostics.errors.length > 0) {
      recommendations.push('Consultez la console pour plus de détails sur les erreurs');
    }

    return recommendations;
  };

  return {
    diagnostics,
    overallStatus: getOverallStatus(),
    recommendations: getRecommendations(),
    isHealthy: getOverallStatus() === 'healthy',
    hasErrors: diagnostics.errors.length > 0
  };
};

export default useDiagnostic;
