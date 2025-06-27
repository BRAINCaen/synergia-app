// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// GAMIFICATION PAGE MIGRÉE - Firebase comme source unique
// REMPLACE COMPLÈTEMENT le GamificationPage.jsx existant
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

// ✅ NOUVEAU: Import du hook unifié Firebase
import { useUnifiedUser, useUnifiedGamification } from '../shared/hooks/useUnifiedUser.js';

const GamificationPage = () => {
  // ✅ NOUVEAU: Hook unifié - source unique Firebase
  const {
    level,
    totalXp,
    xpProgress,
    badges,
    tasksCompleted,
    completionRate,
    loginStreak,
    addXP,
    loading,
    isReady
  } = useUnifiedGamification();

  const [activeTab, setActiveTab] = useState('overview');
  const [testingXP, setTestingXP] = useState(false);

  // ✅ NOUVEAU: Test d'ajout XP avec Firebase
  const handleTestXP = async () => {
    try {
      setTestingXP(true);
      
      // Ajouter 50 XP - Firebase calcule automatiquement le nouveau niveau
      const result = await addXP(50, 'test_gamification');
      
      if (result.leveledUp) {
        showLevelUpNotification(result.newLevel);
      } else {
        showXPNotification(50);
      }
      
      console.log('✅ XP ajouté:', result);
      
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      showErrorNotification('Erreur lors de l\'ajout d\'XP');
    } finally {
      setTestingXP(false);
    }
  };

  // Notifications
  const showLevelUpNotification = (newLevel) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-lg shadow-lg';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">🎉</div>
        <div>
          <div class="font-bold">Félicitations !</div>
          <div class="text-sm">Vous êtes passé niveau ${newLevel} !</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 5000);
  };

  const showXPNotification = (xpAmount) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = `+${xpAmount} XP gagné !`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const showErrorNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  // Loading state
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Synchronisation gamification Firebase...</h2>
          <p className="text-gray-500 mt-2">Chargement des données unifiées</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            Gamification
          </h1>
          <p className="text-gray-600 mt-2">
            Suivez votre progression, débloquez des badges et montez de niveau !
          </p>
        </div>

        {/* ✅ NOUVEAU: Statistiques principales Firebase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Niveau */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Niveau</p>
                <p className="text-3xl font-bold">{level}</p>
                <p className="text-purple-100 text-xs mt-1">{(level - 1) * 100} XP pour niveau {level}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          {/* ✅ NOUVEAU: Expérience depuis Firebase */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Expérience</p>
                <p className="text-3xl font-bold">{totalXp}</p>
                <p className="text-blue-100 text-xs mt-1">Points d'expérience totaux</p>
              </div>
              <Star className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          {/* ✅ NOUVEAU: Série depuis Firebase */}
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

          {/* ✅ NOUVEAU: Badges depuis Firebase */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Badges</p>
                <p className="text-3xl font-bold">{badges.length}</p>
                <p className="text-yellow-100 text-xs mt-1">Badges débloqués</p>
              </div>
              <Award className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Navigation onglets */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: '📊 Vue d\'ensemble', icon: TrendingUp },
                { id: 'badges', name: '🏆 Badges', icon: Award },
                { id: 'statistics', name: '📈 Statistiques', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Onglet Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                
                {/* ✅ NOUVEAU: Progression niveau Firebase */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Progression de Niveau
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">Niveau {level}</h4>
                        <p className="text-gray-600">{xpProgress.progressXP}/100 XP vers le niveau {level + 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{totalXp}</p>
                        <p className="text-gray-500 text-sm">XP Total</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${xpProgress.progressPercent}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Niveau {level}</span>
                      <span>{xpProgress.xpToNext} XP restants</span>
                      <span>Niveau {level + 1}</span>
                    </div>
                  </div>
                </div>

                {/* ✅ NOUVEAU: Bouton test XP */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Test de Gamification</h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-800 mb-3">Testez le système d'XP avec Firebase :</p>
                    <button
                      onClick={handleTestXP}
                      disabled={testingXP}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{testingXP ? 'Ajout en cours...' : 'Ajouter 50 XP'}</span>
                    </button>
                  </div>
                </div>

                {/* Vérification de nouveaux badges */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-500" />
                    Vérifier nouveaux badges
                  </h3>
                  
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <p className="text-blue-800 mb-4">
                      Analysez votre activité récente pour débloquer de nouveaux badges.
                    </p>
                    
                    <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <CheckCircle className="w-5 h-5" />
                      <span>Vérifier maintenant</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Badges */}
            {activeTab === 'badges' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-6">Mes Badges ({badges.length})</h3>
                
                {badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((badge, index) => (
                      <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                        <div className="text-center">
                          <Award className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
                          <h4 className="font-bold text-gray-800 capitalize">
                            {badge.name || badge.type?.replace('_', ' ') || 'Badge Spécial'}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {badge.description || 'Badge débloqué'}
                          </p>
                          <div className="mt-3 flex items-center justify-center space-x-2 text-sm">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-700 font-medium">
                              +{badge.xpReward || 25} XP
                            </span>
                          </div>
                          {badge.unlockedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h4 className="text-xl font-medium text-gray-600 mb-2">Aucun badge encore</h4>
                    <p className="text-gray-500">
                      Complétez des tâches et restez actif pour débloquer vos premiers badges !
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Statistiques */}
            {activeTab === 'statistics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Statistiques Détaillées</h3>
                
                {/* ✅ NOUVEAU: Stats depuis Firebase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Progression générale */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                      Progression générale
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Badges débloqués</span>
                        <span className="font-medium">{badges.length}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (badges.length / 20) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Activité */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      Activité
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tâches complétées</span>
                        <span className="font-medium">{tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taux de réussite</span>
                        <span className="font-medium">{completionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Série actuelle</span>
                        <span className="font-medium">{loginStreak} jour(s)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;
