// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION ENRICHIE - AVEC SYSTÈME DE BADGES COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
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
  Plus,
  PlayCircle,
  Settings
} from 'lucide-react';

// Import des nouveaux composants de badges
import BadgeGallery from '../components/gamification/BadgeGallery.jsx';
import { BadgeNotificationTester } from '../components/gamification/BadgeNotification.jsx';
import { badgeEngine, checkBadges, getBadgeStats } from '../core/services/badgeEngine.js';

// Import des hooks existants
import { useAuthStore } from '../shared/stores/authStore.js';

const GamificationPage = () => {
  // Hooks existants fonctionnels
  const { user } = useAuthStore();
  
  // États pour la gamification enrichie
  const [activeTab, setActiveTab] = useState('overview');
  const [testingBadges, setTestingBadges] = useState(false);
  const [badgeStats, setBadgeStats] = useState({ earned: 0, total: 0, completion: 0 });
  
  // Données simulées pour l'affichage (en attendant la synchronisation Firebase)
  const level = 4;
  const totalXp = 175;
  const loginStreak = 1;
  const tasksCompleted = 6;
  const completionRate = 85;

  // Calculs XP pour l'affichage
  const xpProgress = {
    progressXP: totalXp % 100,
    progressPercent: (totalXp % 100),
    xpToNext: 100 - (totalXp % 100)
  };

  // Charger les statistiques de badges
  useEffect(() => {
    if (user) {
      const userBadges = user.badges || [];
      const userRole = user.role || 'Général';
      const stats = getBadgeStats(userBadges, userRole);
      setBadgeStats(stats);
    }
  }, [user]);

  // Test du système de badges
  const handleTestBadgeSystem = async () => {
    if (!user?.uid) return;
    
    setTestingBadges(true);
    try {
      console.log('🧪 Test du système de badges...');
      
      // Simuler différentes activités pour déclencher des badges
      const testActivities = [
        { type: 'login', timestamp: new Date() },
        { type: 'task_completed', count: 1 },
        { type: 'early_login', hour: 8 },
        { type: 'project_completed', projectId: 'test_project' }
      ];

      for (const activity of testActivities) {
        const newBadges = await checkBadges(user.uid, activity);
        if (newBadges.length > 0) {
          console.log('🎉 Nouveaux badges:', newBadges);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur test badges:', error);
    } finally {
      setTestingBadges(false);
    }
  };

  // Données mockées pour les badges récents
  const recentBadges = [
    {
      id: 'first_task',
      name: 'Premier Pas',
      description: 'Première tâche créée',
      icon: '🎯',
      category: 'Découverte',
      earnedAt: new Date(),
      xpReward: 50
    },
    {
      id: 'early_bird',
      name: 'Lève-tôt',
      description: '5 tâches créées avant 9h',
      icon: '🌅',
      category: 'Productivité',
      earnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      xpReward: 75
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

  return (
    <div className="space-y-8">
      {/* Header principal avec badge stats */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🎮 Gamification</h1>
            <p className="opacity-90">Votre progression et vos achievements dans Synergia</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{badgeStats.earned}/{badgeStats.total}</div>
            <div className="text-sm opacity-90">Badges collectés</div>
            <div className="mt-2">
              <div className="bg-white/20 rounded-full h-2 w-32">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${badgeStats.completion}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">{badgeStats.completion}% complété</div>
            </div>
          </div>
        </div>
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
              <p className="text-3xl font-bold">{badgeStats.earned}</p>
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
            { id: 'achievements', label: '🎯 Achievements', icon: '🎯' },
            { id: 'testing', label: '🧪 Zone de Test', icon: '🧪' }
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
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800`}>
                          {badge.category}
                        </span>
                        <span className="text-xs text-green-600 font-medium">+{badge.xpReward} XP</span>
                      </div>
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
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <BadgeGallery />
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Système d'Achievements</h3>
            <p className="text-gray-600 mb-6">
              Les achievements sont des défis long-terme qui récompensent votre progression continue.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg">{achievement.name}</h4>
                    <span className="text-2xl">🎯</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{achievement.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span className="font-medium">{achievement.progress}/{achievement.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{achievement.category}</span>
                      <span className="text-sm font-bold text-purple-600">+{achievement.reward} XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="space-y-6">
            {/* Zone de test du moteur de badges */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-amber-600" />
                Test du Moteur de Badges
              </h3>
              
              <p className="text-amber-700 mb-6">
                Zone de développement pour tester le système de badges automatiques avec vos 500+ badges organisés par rôles.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-amber-800 mb-3">Actions de Test</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleTestBadgeSystem}
                      disabled={testingBadges}
                      className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{testingBadges ? 'Test en cours...' : 'Tester le Moteur de Badges'}</span>
                    </button>
                    
                    <div className="text-xs text-amber-600 mt-2">
                      <strong>Ce test va :</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Simuler différentes activités utilisateur</li>
                        <li>Vérifier les conditions de badges automatiquement</li>
                        <li>Déclencher les notifications de nouveaux badges</li>
                        <li>Mettre à jour les statistiques en temps réel</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-amber-800 mb-3">Informations Système</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rôle utilisateur :</span>
                      <span className="font-medium">{user?.role || 'Général'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Badges disponibles :</span>
                      <span className="font-medium">{badgeStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Badges gagnés :</span>
                      <span className="font-medium">{badgeStats.earned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progression :</span>
                      <span className="font-medium">{badgeStats.completion}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testeur de notifications */}
            <BadgeNotificationTester />

            {/* Statistiques développeur */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-4">📊 Statistiques Développeur</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{badgeStats.total}</div>
                  <div className="text-sm text-blue-700">Total Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{badgeStats.earned}</div>
                  <div className="text-sm text-green-700">Gagnés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{badgeStats.remaining}</div>
                  <div className="text-sm text-orange-700">Restants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{badgeStats.completion}%</div>
                  <div className="text-sm text-purple-700">Complété</div>
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
