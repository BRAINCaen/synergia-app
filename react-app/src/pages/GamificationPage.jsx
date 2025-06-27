// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION CORRIGÉE - SANS DOUBLON MENU
// ==========================================

import React, { useState } from 'react';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap, 
  TrendingUp, 
  Calendar, 
  Clock,
  Flame,
  Shield,
  Crown,
  Gem,
  CheckCircle,
  Plus
} from 'lucide-react';

// ❌ SUPPRIMÉ: Import DashboardLayout (déjà dans App.jsx)
// import DashboardLayout from '../layouts/DashboardLayout.jsx';

// Import de la BadgeGallery
import BadgeGallery from '../components/gamification/BadgeGallery.jsx';

// Import des hooks existants
import { useAuthStore } from '../shared/stores/authStore.js';
import { useBadges } from '../shared/hooks/useBadges.js';

const GamificationPage = () => {
  // Hooks existants fonctionnels
  const { user } = useAuthStore();
  const { badges, userBadges, loading: badgeLoading } = useBadges();
  
  // Données simulées pour l'affichage
  const level = 4;
  const totalXp = 175;
  const loginStreak = 1;
  const tasksCompleted = 6;
  const completionRate = 85;
  const loading = badgeLoading;
  const isReady = !loading;

  // Calculs XP simulés pour l'affichage
  const xpProgress = {
    progressXP: totalXp % 100,
    progressPercent: (totalXp % 100),
    xpToNext: 100 - (totalXp % 100)
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [testingXP, setTestingXP] = useState(false);

  // Simulation: Test d'ajout XP
  const handleTestXP = async () => {
    try {
      setTestingXP(true);
      console.log('🎮 Test XP simulation - +50 XP');
      showXPNotification(50);
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      showErrorNotification('Erreur lors de l\'ajout d\'XP');
    } finally {
      setTestingXP(false);
    }
  };

  // Mock functions pour les notifications
  const showXPNotification = (xp) => {
    console.log(`🎉 +${xp} XP gagné !`);
  };

  const showErrorNotification = (message) => {
    console.error('❌', message);
  };

  // Données mockées pour les badges récents
  const recentBadges = [
    {
      id: 'first_task',
      name: 'Premier Pas',
      description: 'Première tâche créée',
      icon: '🎯',
      category: 'Découverte',
      unlockedAt: new Date(),
      rarity: 'common'
    },
    {
      id: 'early_bird',
      name: 'Lève-tôt',
      description: '5 tâches créées avant 9h',
      icon: '🌅',
      category: 'Productivité',
      unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      rarity: 'rare'
    }
  ];

  // Données mockées pour les achievements
  const achievements = [
    {
      id: 'task_master',
      name: 'Maître des Tâches',
      description: 'Compléter 100 tâches',
      progress: tasksCompleted,
      target: 100,
      reward: 500,
      category: 'Productivité'
    },
    {
      id: 'streak_champion',
      name: 'Champion de la Régularité',
      description: '30 jours consécutifs',
      progress: loginStreak,
      target: 30,
      reward: 1000,
      category: 'Engagement'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <span className="text-gray-500">Chargement des données de gamification...</span>
        </div>
      </div>
    );
  }

  // ✅ RETURN SANS DashboardLayout (déjà appliqué dans App.jsx)
  return (
    <div className="space-y-8">
      {/* Header principal */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎮 Gamification</h1>
        <p className="text-gray-600">Votre progression et vos achievements dans Synergia</p>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Niveau */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Niveau</p>
              <p className="text-3xl font-bold">{level}</p>
              <p className="text-purple-100 text-xs mt-1">
                {xpProgress.progressXP}/100 XP
              </p>
            </div>
            <Crown className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        {/* XP total */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">XP Total</p>
              <p className="text-3xl font-bold">{totalXp}</p>
              <p className="text-blue-100 text-xs mt-1">Points d'expérience totaux</p>
            </div>
            <Star className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        {/* Série */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Série</p>
              <p className="text-3xl font-bold">{loginStreak}</p>
              <p className="text-orange-100 text-xs mt-1">Jours consécutifs actif</p>
            </div>
            <Flame className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        {/* Badges */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Badges</p>
              <p className="text-3xl font-bold">{recentBadges.length}</p>
              <p className="text-yellow-100 text-xs mt-1">Badges débloqués</p>
            </div>
            <Award className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble', icon: '📊' },
            { id: 'badges', label: '🏆 Galerie de Badges', icon: '🏆' },
            { id: 'stats', label: '📈 Statistiques', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Progression de niveau */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Progression de Niveau
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Niveau {level}</span>
                  <span className="text-sm text-gray-500">{totalXp} XP Total</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress.progressPercent}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Niveau {level}</span>
                  <span className="text-sm font-medium text-purple-600">
                    {xpProgress.xpToNext} XP restants
                  </span>
                  <span className="text-sm text-gray-600">Niveau {level + 1}</span>
                </div>
              </div>
            </div>

            {/* Badges récents */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Badges Récents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentBadges.map((badge) => (
                  <div 
                    key={badge.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{badge.name}</h4>
                      <p className="text-sm text-gray-500">{badge.description}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        badge.rarity === 'rare' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {badge.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements en cours */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Achievements en cours
              </h3>
              
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                      </div>
                      <span className="text-sm font-medium text-purple-600">
                        +{achievement.reward} XP
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-medium">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone de test */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                <Gem className="w-5 h-5 mr-2 text-amber-600" />
                Test de Gamification
              </h3>
              
              <p className="text-amber-700 mb-4">
                Zone de développement pour tester les fonctionnalités de gamification.
              </p>
              
              <button
                onClick={handleTestXP}
                disabled={testingXP}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{testingXP ? 'Test en cours...' : 'Tester +50 XP'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <BadgeGallery />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statistiques d'activité */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Activité
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tâches complétées</span>
                    <span className="font-medium">{tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taux de réussite</span>
                    <span className="font-medium text-green-600">{completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">XP ce mois</span>
                    <span className="font-medium text-blue-600">+{totalXp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Moyenne quotidienne</span>
                    <span className="font-medium text-purple-600">18 XP</span>
                  </div>
                </div>
              </div>

              {/* Badges par catégorie */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-500" />
                  Badges par catégorie
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Productivité</span>
                    <span className="font-medium">3/8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collaboration</span>
                    <span className="font-medium">2/6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Apprentissage</span>
                    <span className="font-medium">1/4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationPage;
