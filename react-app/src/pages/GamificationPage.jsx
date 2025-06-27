// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// Page Gamification avec intégration BadgeGallery - VERSION CORRIGÉE
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
    setTimeout(() => document.body.removeChild(notification), 4000);
  };

  // Affichage loading pendant le chargement 
  if (loading || !isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Chargement des données de gamification...</span>
      </div>
    );
  }

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
              <p className="text-3xl font-bold">{userBadges.length}</p>
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
              { id: 'badges', name: '🏆 Galerie de Badges', icon: Award },
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
              
              {/* Progression niveau */}
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

              {/* Bouton test XP */}
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

          {/* Onglet Badges avec BadgeGallery */}
          {activeTab === 'badges' && (
            <div>
              <BadgeGallery />
            </div>
          )}

          {/* Onglet Statistiques */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800">Statistiques Détaillées</h3>
              
              {/* Stats depuis Firebase */}
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
                      <span className="font-medium">{userBadges.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (userBadges.length / 20) * 100)}%` }}
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

                {/* Évolution XP */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Évolution XP
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">XP cette semaine</span>
                      <span className="font-medium text-green-600">+125</span>
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
                <div className="bg-gray-50 rounded-lg p-6">
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
    </div>
  );
};

export default GamificationPage;
