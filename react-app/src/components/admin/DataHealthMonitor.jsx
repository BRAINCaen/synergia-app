// ==========================================
// 📁 react-app/src/components/admin/DataHealthMonitor.jsx
// Composant de surveillance et réparation des données
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Activity,
  Database,
  Users,
  TrendingUp,
  Zap,
  Tool,
  Shield
} from 'lucide-react';
import dataSyncService from '../../core/services/dataSyncService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useSynchronizedUser } from '../../shared/hooks/useSynchronizedUser.js';

/**
 * 🔍 MONITEUR DE SANTÉ DES DONNÉES
 * Interface pour diagnostiquer et réparer les incohérences
 */
const DataHealthMonitor = ({ isAdmin = false, showAdvanced = false }) => {
  const { user } = useAuthStore();
  const { syncStatus, isHealthy, forceSync, recalculateStats } = useSynchronizedUser();
  
  const [healthReport, setHealthReport] = useState(null);
  const [userDiagnostic, setUserDiagnostic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  // ✅ DIAGNOSTIC UTILISATEUR AU CHARGEMENT
  useEffect(() => {
    if (user?.uid) {
      checkUserHealth();
    }
  }, [user?.uid]);

  // 🔍 VÉRIFIER LA SANTÉ DE L'UTILISATEUR ACTUEL
  const checkUserHealth = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const diagnostic = await dataSyncService.diagnoseDataInconsistencies(user.uid);
      setUserDiagnostic(diagnostic);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Erreur diagnostic utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ RÉPARER LES DONNÉES UTILISATEUR
  const repairUserData = async () => {
    if (!user?.uid) return;
    
    try {
      setActionInProgress('repair');
      const result = await dataSyncService.repairUserData(user.uid, user);
      
      if (result.success) {
        await checkUserHealth(); // Re-vérifier après réparation
        await forceSync(); // Forcer la synchronisation
        
        // Notification de succès
        showNotification('✅ Données réparées avec succès !', 'success');
      } else {
        showNotification('❌ Échec de la réparation', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur réparation:', error);
      showNotification('❌ Erreur lors de la réparation', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // 📊 RECALCULER LES STATISTIQUES
  const handleRecalculateStats = async () => {
    try {
      setActionInProgress('recalculate');
      const result = await recalculateStats();
      
      if (result.success) {
        await checkUserHealth();
        showNotification('📊 Statistiques recalculées !', 'success');
      } else {
        showNotification('❌ Échec du recalcul', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur recalcul:', error);
      showNotification('❌ Erreur lors du recalcul', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // 🔄 SYNCHRONISATION FORCÉE
  const handleForceSync = async () => {
    try {
      setActionInProgress('sync');
      const result = await forceSync();
      
      if (result.success) {
        await checkUserHealth();
        showNotification('🔄 Synchronisation terminée !', 'success');
      } else {
        showNotification('❌ Échec de la synchronisation', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur sync forcée:', error);
      showNotification('❌ Erreur lors de la synchronisation', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // 📋 RAPPORT DE SANTÉ GLOBAL (ADMIN)
  const generateGlobalReport = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      const report = await dataSyncService.generateHealthReport();
      setHealthReport(report);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Erreur rapport global:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔔 SYSTÈME DE NOTIFICATIONS SIMPLE
  const showNotification = (message, type) => {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Suppression automatique
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // 🎨 ICÔNE DE STATUT
  const getStatusIcon = (status, severity) => {
    if (status === 'healthy') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (severity === 'critical') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  // 🎨 COULEUR DE STATUT
  const getStatusColor = (status, severity) => {
    if (status === 'healthy') return 'green';
    if (severity === 'critical') return 'red';
    return 'yellow';
  };

  return (
    <div className="space-y-6">
      {/* STATUT DE SYNCHRONISATION EN TEMPS RÉEL */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            État de Synchronisation
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              syncStatus === 'synchronized' ? 'bg-green-500' : 
              syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600 capitalize">{syncStatus}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium text-gray-700">État Global</div>
            <div className={`text-lg font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
              {isHealthy ? 'Sain' : 'Problème'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Database className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-sm font-medium text-gray-700">Dernière Vérif.</div>
            <div className="text-sm text-gray-600">{lastCheck || 'Jamais'}</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-sm font-medium text-gray-700">Synchronisation</div>
            <div className="text-sm text-gray-600">Temps réel</div>
          </div>
        </div>
      </div>

      {/* DIAGNOSTIC UTILISATEUR */}
      {userDiagnostic && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Diagnostic Utilisateur
            </h3>
            
            <button
              onClick={checkUserHealth}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Vérifier</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Statut global */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(userDiagnostic.status, userDiagnostic.severity)}
                <div>
                  <div className="font-medium text-gray-800">
                    État des Données
                  </div>
                  <div className="text-sm text-gray-600">
                    {userDiagnostic.status === 'healthy' ? 'Toutes les données sont cohérentes' : 
                     `${userDiagnostic.issues.length} problème(s) détecté(s)`}
                  </div>
                </div>
              </div>
              
              {userDiagnostic.status !== 'healthy' && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userDiagnostic.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  userDiagnostic.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {userDiagnostic.severity}
                </div>
              )}
            </div>

            {/* Liste des problèmes */}
            {userDiagnostic.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Problèmes détectés :</h4>
                {userDiagnostic.issues.map((issue, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions de réparation */}
            {userDiagnostic.status !== 'healthy' && (
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={repairUserData}
                  disabled={actionInProgress === 'repair'}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Tool className={`w-4 h-4 ${actionInProgress === 'repair' ? 'animate-spin' : ''}`} />
                  <span>Réparer</span>
                </button>
                
                <button
                  onClick={handleRecalculateStats}
                  disabled={actionInProgress === 'recalculate'}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <TrendingUp className={`w-4 h-4 ${actionInProgress === 'recalculate' ? 'animate-spin' : ''}`} />
                  <span>Recalculer</span>
                </button>
                
                <button
                  onClick={handleForceSync}
                  disabled={actionInProgress === 'sync'}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${actionInProgress === 'sync' ? 'animate-spin' : ''}`} />
                  <span>Synchroniser</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RAPPORT GLOBAL (ADMIN SEULEMENT) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Rapport Global de Santé
            </h3>
            
            <button
              onClick={generateGlobalReport}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Database className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Générer</span>
            </button>
          </div>

          {healthReport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{healthReport.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Utilisateurs</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{healthReport.healthyUsers}</div>
                <div className="text-sm text-gray-600">Sains</div>
              </div>
              
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{healthReport.usersWithIssues}</div>
                <div className="text-sm text-gray-600">Avec Problèmes</div>
              </div>
              
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{healthReport.criticalIssues}</div>
                <div className="text-sm text-gray-600">Critiques</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataHealthMonitor;
