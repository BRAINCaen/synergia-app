// ==========================================
// 📁 react-app/src/pages/admin/DemoDataCleanerPage.jsx
// PAGE ADMIN POUR NETTOYER LES DONNÉES DE DÉMONSTRATION
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { scanDemoData, cleanAllDemoData, generateDemoReport } from '../../core/services/demoDataCleaner.js';
import { isAdmin } from '../../core/services/adminService.js';

const DemoDataCleanerPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [cleaningResults, setCleaningResults] = useState(null);
  const [report, setReport] = useState(null);
  const [step, setStep] = useState('scan'); // scan, confirm, clean, done

  // Vérifier les permissions admin
  useEffect(() => {
    if (!isAdmin(user)) {
      window.location.href = '/dashboard';
      return;
    }
  }, [user]);

  /**
   * 🔍 SCANNER LES DONNÉES DÉMO
   */
  const handleScan = async () => {
    try {
      setLoading(true);
      console.log('🔍 Début du scan des données démo...');
      
      const results = await scanDemoData();
      setScanResults(results);
      
      if (results.stats.totalDemoItems > 0) {
        setStep('confirm');
      } else {
        setStep('done');
        setCleaningResults({
          success: true,
          message: 'Aucune donnée de démonstration trouvée. Votre base de données est propre !'
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur scan:', error);
      setCleaningResults({
        success: false,
        message: `Erreur lors du scan: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🧹 NETTOYER LES DONNÉES DÉMO
   */
  const handleClean = async () => {
    try {
      setLoading(true);
      setStep('clean');
      console.log('🧹 Début du nettoyage...');
      
      const results = await cleanAllDemoData();
      setCleaningResults(results);
      setStep('done');
      
      // Générer un rapport final
      try {
        const finalReport = await generateDemoReport();
        setReport(finalReport);
      } catch (reportError) {
        console.warn('⚠️ Erreur génération rapport final:', reportError);
      }
      
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      setCleaningResults({
        success: false,
        message: `Erreur lors du nettoyage: ${error.message}`
      });
      setStep('done');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔄 RECOMMENCER LE PROCESSUS
   */
  const handleRestart = () => {
    setScanResults(null);
    setCleaningResults(null);
    setReport(null);
    setStep('scan');
  };

  // Protection admin
  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Accès refusé</h1>
          <p className="text-gray-600">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🧹</span>
            <h1 className="text-2xl font-bold text-gray-900">
              Nettoyage des données de démonstration
            </h1>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Attention - Opération irréversible</h3>
                <p className="text-yellow-700 text-sm">
                  Cet outil va supprimer définitivement toutes les données de démonstration de votre base de données. 
                  Seules les vraies données créées par les utilisateurs seront conservées.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 1: Scanner */}
        {step === 'scan' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🔍</span> Étape 1 : Scanner les données
            </h2>
            
            <p className="text-gray-600 mb-6">
              Commençons par identifier toutes les données de démonstration présentes dans votre système.
            </p>
            
            <button
              onClick={handleScan}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? '🔍 Scan en cours...' : '🔍 Scanner les données démo'}
            </button>
          </div>
        )}

        {/* Étape 2: Résultats du scan */}
        {step === 'confirm' && scanResults && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📊</span> Résultats du scan
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{scanResults.stats.totalDemoTasks}</div>
                <div className="text-sm text-red-800">Tâches démo</div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{scanResults.stats.totalDemoProjects}</div>
                <div className="text-sm text-orange-800">Projets démo</div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{scanResults.stats.totalDemoUsers}</div>
                <div className="text-sm text-purple-800">Utilisateurs démo</div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-600">{scanResults.stats.totalDemoBadges}</div>
                <div className="text-sm text-gray-800">Badges démo</div>
              </div>
            </div>

            {/* Détails des données trouvées */}
            {scanResults.tasks.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-red-700">📋 Tâches de démonstration à supprimer :</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {scanResults.tasks.slice(0, 10).map(task => (
                    <div key={task.id} className="text-sm text-red-800 mb-1">
                      • {task.title} {task.assignedTo && task.assignedTo.length > 1 && (
                        <span className="text-red-600 font-medium">
                          (assignée à {task.assignedTo.length} personnes)
                        </span>
                      )}
                    </div>
                  ))}
                  {scanResults.tasks.length > 10 && (
                    <div className="text-sm text-red-600 font-medium mt-2">
                      ... et {scanResults.tasks.length - 10} autres tâches
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">
                🗑️ Total à supprimer : {scanResults.stats.totalDemoItems} éléments
              </h3>
              <p className="text-yellow-700 text-sm">
                Ces données seront supprimées définitivement. Les vraies données créées par les utilisateurs seront conservées.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleClean}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? '🧹 Nettoyage...' : '🗑️ Supprimer les données démo'}
              </button>
              
              <button
                onClick={handleRestart}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🔄 Annuler
              </button>
            </div>
          </div>
        )}

        {/* Étape 3: Nettoyage en cours */}
        {step === 'clean' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">🧹</div>
              <h2 className="text-xl font-semibold mb-2">Nettoyage en cours...</h2>
              <p className="text-gray-600">
                Suppression des données de démonstration. Veuillez patienter.
              </p>
            </div>
          </div>
        )}

        {/* Étape 4: Résultats finaux */}
        {step === 'done' && cleaningResults && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">
                {cleaningResults.success ? '✅' : '❌'}
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {cleaningResults.success ? 'Nettoyage terminé !' : 'Erreur lors du nettoyage'}
              </h2>
              <p className={`${cleaningResults.success ? 'text-green-600' : 'text-red-600'}`}>
                {cleaningResults.message}
              </p>
            </div>

            {cleaningResults.success && cleaningResults.cleaned > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">
                  🎉 Nettoyage réussi !
                </h3>
                <div className="text-green-700 text-sm">
                  <p>✅ {cleaningResults.cleaned} éléments de démonstration supprimés</p>
                  <p>✅ Références utilisateur nettoyées</p>
                  <p>✅ Statistiques réinitialisées</p>
                  <p>✅ Base de données propre</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Prochaines étapes recommandées :</h3>
              <div className="text-blue-700 text-sm space-y-1">
                <p>1. ✅ Vérifier que les vraies tâches utilisateur sont toujours présentes</p>
                <p>2. ✅ Tester toutes les fonctionnalités de l'application</p>
                <p>3. ✅ Informer les utilisateurs du nettoyage effectué</p>
                <p>4. ✅ Surveiller les performances de l'application</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🔍 Nouveau scan
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🏠 Retour au Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner Global */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin text-3xl mb-3">⚙️</div>
              <p className="font-medium">Traitement en cours...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoDataCleanerPage;
