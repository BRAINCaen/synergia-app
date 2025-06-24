// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// Page dédiée à la galerie des badges avec fonctionnalités avancées
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BadgeGallery from '../components/gamification/BadgeGallery.jsx';
import { useBadges } from '../shared/hooks/useBadges.js';
import BadgeIntegrationService from '../core/services/badgeIntegrationService.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { toast } from 'react-hot-toast';

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
      const newBadges = await checkBadges();
      if (newBadges.length > 0) {
        // Recharger les badges proches du déblocage
        await loadNearCompletionBadges();
      }
    } catch (error) {
      console.error('Erreur vérification manuelle:', error);
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
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🏆 Mes Badges
            </h1>
            <p className="text-gray-400">
              Débloquez des badges en accomplissant des défis et atteignez de nouveaux niveaux !
            </p>
          </div>

          <button
            onClick={handleManualCheck}
            disabled={checking}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all duration-200
              ${checking 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {checking ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Vérification...
              </span>
            ) : (
              <span className="flex items-center">
                🔍 Vérifier les badges
              </span>
            )}
          </button>
        </div>

        {/* Résumé des stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white text-center"
            >
              <div className="text-2xl font-bold">{stats.unlocked}</div>
              <div className="text-sm opacity-90">Badges débloqués</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white text-center"
            >
              <div className="text-2xl font-bold">{stats.completion}%</div>
              <div className="text-sm opacity-90">Progression</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg p-4 text-white text-center"
            >
              <div className="text-2xl font-bold">{stats.totalXpFromBadges}</div>
              <div className="text-sm opacity-90">XP des badges</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white text-center"
            >
              <div className="text-2xl font-bold">{badges.length - stats.unlocked}</div>
              <div className="text-sm opacity-90">Restants</div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Badges proches du déblocage */}
      {nearCompletionBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              🎯 Presque là !
              <span className="ml-2 text-sm bg-orange-500 text-white px-2 py-1 rounded-full">
                {nearCompletionBadges.length}
              </span>
            </h2>
            
            <button
              onClick={loadNearCompletionBadges}
              disabled={loadingNearCompletion}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {loadingNearCompletion ? '🔄' : '↻'} Actualiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearCompletionBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700/50 rounded-lg p-4 border border-orange-500/50"
              >
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">{badge.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{badge.name}</h3>
                    <div className={`
                      text-xs px-2 py-1 rounded-full
                      bg-gradient-to-r ${rarityColors[badge.rarity]}
                      text-white inline-block mt-1
                    `}>
                      {badge.rarity}
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progression</span>
                    <span>{badge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${badge.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]}`}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2">
                  {badge.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Conseils pour débloquer des badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/20"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          💡 Conseils pour débloquer des badges
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-green-400">•</span>
              <span className="text-gray-300">
                <strong>Soyez actif</strong> - Complétez des tâches régulièrement pour déclencher "Early Bird" et "Night Owl"
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-400">•</span>
              <span className="text-gray-300">
                <strong>Travaillez vite</strong> - Terminez des tâches rapidement pour "Speed Demon"
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
      </motion.div>

      {/* Galerie principale des badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <BadgeGallery />
      </motion.div>
    </div>
  );
};

export default BadgesPage;
