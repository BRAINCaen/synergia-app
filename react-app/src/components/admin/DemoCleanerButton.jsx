// ==========================================
// 📁 react-app/src/components/admin/DemoCleanerButton.jsx
// BOUTON DE NETTOYAGE DES DONNÉES DÉMO POUR ADMIN
// ==========================================

import React, { useState } from 'react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';
import { cleanAllDemoDataNow } from '../../utils/immediateDataCleaner.js';

/**
 * 🧹 BOUTON DE NETTOYAGE DES DONNÉES DÉMO
 * Bouton simple pour les administrateurs pour nettoyer les données de démonstration
 */
const DemoCleanerButton = ({ className = '' }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Vérifier si l'utilisateur est admin
  if (!isAdmin(user)) {
    return null; // Ne pas afficher le bouton si pas admin
  }

  /**
   * 🧹 EXÉCUTER LE NETTOYAGE
   */
  const handleCleanDemo = async () => {
    try {
      setLoading(true);
      setShowConfirm(false);
      
      console.log('🧹 Début du nettoyage des données démo...');
      
      const result = await cleanAllDemoDataNow();
      setLastResult(result);
      
      if (result.success) {
        console.log('✅ Nettoyage terminé:', result);
        
        // Afficher une notification de succès
        const message = result.totalCleaned > 0 
          ? `Nettoyage réussi ! ${result.totalCleaned} éléments supprimés.`
          : 'Aucune donnée de démonstration trouvée. Votre base de données est déjà propre !';
          
        alert('🎉 ' + message);
        
        // Optionnel: recharger la page pour voir les changements
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } else {
        console.error('❌ Erreur nettoyage:', result);
        alert('❌ Erreur lors du nettoyage: ' + result.message);
      }
      
    } catch (error) {
      console.error('❌ Erreur critique:', error);
      alert('❌ Erreur critique: ' + error.message);
      setLastResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎯 AFFICHER LA CONFIRMATION
   */
  const showConfirmDialog = () => {
    setShowConfirm(true);
  };

  return (
    <div className={`demo-cleaner-section ${className}`}>
      
      {/* Bouton principal */}
      <div className="flex items-center gap-3">
        <button
          onClick={showConfirmDialog}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">🧹</span>
              Nettoyage...
            </>
          ) : (
            <>
              <span>🧹</span>
              Nettoyer données démo
            </>
          )}
        </button>
        
        {/* Info rapide */}
        <span className="text-sm text-gray-600">
          (Supprime les tâches assignées à 28 personnes, etc.)
        </span>
      </div>

      {/* Dialog de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-3">Confirmer le nettoyage</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Cette action va supprimer définitivement toutes les données de démonstration :
              </p>
              
              <div className="text-left bg-gray-50 rounded-lg p-3 mb-6 text-sm">
                <div className="font-medium mb-2">Sera supprimé :</div>
                <div className="space-y-1 text-gray-700">
                  <div>• Tâches avec titres "Gagner votre premier badge", etc.</div>
                  <div>• Tâches assignées à plus de 10 personnes</div>
                  <div>• Badges d'onboarding automatiques</div>
                  <div>• Noms inappropriés ("Allan le BOSS")</div>
                  <div>• Biographies inappropriées</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCleanDemo}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Résultat du dernier nettoyage */}
      {lastResult && !loading && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`font-medium ${lastResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {lastResult.success ? '✅ Nettoyage réussi' : '❌ Erreur'}
          </div>
          
          {lastResult.success && lastResult.details && (
            <div className="text-green-700 mt-1">
              <div>• Tâches supprimées: {lastResult.details.tasks?.deletedTasks || 0}</div>
              <div>• Utilisateurs nettoyés: {lastResult.details.users?.cleanedUsers || 0}</div>
              <div>• Badges supprimés: {lastResult.details.badges?.deletedBadges || 0}</div>
            </div>
          )}
          
          {!lastResult.success && (
            <div className="text-red-700 mt-1">
              {lastResult.message || 'Erreur inconnue'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DemoCleanerButton;
