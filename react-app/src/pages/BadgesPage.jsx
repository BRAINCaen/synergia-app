// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// Page dédiée à la galerie des badges avec fonctionnalités avancées
// ==========================================

import React, { useState } from 'react';
import BadgeGallery from '../components/gamification/BadgeGallery.jsx';
import { useBadges } from '../shared/hooks/useBadges.js';
import BadgeIntegrationService from '../core/services/badgeIntegrationService.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useToast } from '../shared/components/ui/Toast.jsx';

/**
 * 🏆 PAGE BADGES
 * 
 * Page complète pour la gestion des badges avec :
 * - Galerie interactive des badges
 * - Statistiques détaillées
 * - Badges proches du déblocage
 * - Action de vérification manuelle
 * - Conseils pour débloquer les badges
 */
const BadgesPage = () => {
  const { user } = useAuthStore();
  const { success, error, info } = useToast();
  const { 
    badges, 
    userBadges, 
    stats, 
    loading, 
    checking,
    checkBadges 
  } = useBadges();

  const [nearCompletionBadges, setNearCompletionBadges] = useState([]);
  const [loadingNearCompletion, setLoadingNearCompletion] = useState(false);

  // Charger les badges proches du déblocage
  const loadNearCompletionBadges = async () => {
    if (!user?.uid) return;

    setLoadingNearCompletion(true);
    try {
      const nearBadges = await BadgeIntegrationService.getNearCompletionBadges(user.uid, 70);
      setNearCompletionBadges(nearBadges);
    } catch (error) {
      console.error('Erreur chargement badges proches:', error);
    } finally {
      setLoadingNearCompletion(false);
    }
  };

  // Vérification manuelle des badges
  const handleManualCheck = async () => {
    try {
      info('Vérification des badges en cours...');
      const newBadges = await checkBadges();
      
      if (newBadges.length > 0) {
        success(`${newBadges.length} nouveaux badges débloqués !`);
        // Recharger les badges proches du déblocage
        await loadNearCompletionBadges();
      } else {
        info('Aucun nouveau badge débloqué');
      }
    } catch (err) {
      console.error('Erreur vérification manuelle:', err);
      error('Erreur lors de la vérification des badges');
    }
  };

  // Charger les badges proches au montage
  React.useEffect(() => {
    loadNearCompletionBadges();
  }, [user?.uid]);

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-lg text-gray-600">Chargement des badges...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 🎯 En-tête avec statistiques */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🏆 Collection de Badges
              </h1>
              <p className="text-gray-600">
                Débloquez des badges en accomplissant des défis et atteignez de nouveaux sommets !
              </p>
            </div>
            
            <button
              onClick={handleManualCheck}
              disabled={checking}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                checking 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {checking ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Vérification...
                </span>
              ) : (
                '🔍 Vérifier les badges'
              )}
            </button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userBadges?.length || 0}
              </div>
              <div className="text-sm text-blue-700">Badges obtenus</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {badges?.length || 0}
              </div>
              <div className="text-sm text-green-700">Badges disponibles</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats?.percentage || 0}%
              </div>
              <div className="text-sm text-purple-700">Progression</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats?.totalXpFromBadges || 0}
              </div>
              <div className="text-sm text-orange-700">XP des badges</div>
            </div>
          </div>
        </div>

        {/* 🎯 Badges proches du déblocage */}
        {nearCompletionBadges.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Badges proches du déblocage
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearCompletionBadges.map((badge) => (
                <div 
                  key={badge.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{badge.name}</h4>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${badge.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {badge.progress}% complété
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 💡 Conseils pour débloquer les badges */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Conseils pour débloquer des badges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span className="text-gray-300">
                  <strong>Soyez actif</strong> - Connectez-vous quotidiennement pour "Streak Master"
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-400">•</span>
                <span className="text-gray-300">
                  <strong>Terminez vos tâches</strong> - Complétez des tâches pour "Task Master"
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-400">•</span>
                <span className="text-gray-300">
                  <strong>Soyez constant</strong> - Maintenez une streak quotidienne pour "Consistency King"
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400">•</span>
                <span className="text-gray-300">
                  <strong>Sprintez</strong> - Complétez beaucoup de tâches en une journée pour "Sprint Master"
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-400">•</span>
                <span className="text-gray-300">
                  <strong>Finissez vos projets</strong> - Terminez des projets à 100% pour "Project Finisher"
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-orange-400">•</span>
                <span className="text-gray-300">
                  <strong>Diversifiez</strong> - Travaillez sur plusieurs projets pour "Multitasker"
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Galerie principale des badges */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <BadgeGallery />
        </div>
      </div>
    </div>
  );
};

export default BadgesPage;
