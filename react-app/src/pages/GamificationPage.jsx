import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Award, 
  TrendingUp, 
  Activity,
  Crown,
  Zap,
  RefreshCw
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useFirebaseGamification } from '../shared/hooks/useFirebaseGamification.js';

const GamificationPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Hook Firebase pour les données de gamification
  const {
    gamificationData,
    loading,
    refreshData,
    totalXp,
    level,
    xpToNextLevel,
    progressToNextLevel,
    badges,
    weeklyXp,
    loginStreak,
    recentActivities
  } = useFirebaseGamification(user?.uid);

  const headerStats = [
    { 
      label: "XP Total", 
      value: totalXp?.toLocaleString() || "0", 
      icon: Star, 
      color: "text-yellow-400" 
    },
    { 
      label: "Niveau", 
      value: level || "1", 
      icon: Crown, 
      color: "text-purple-400" 
    },
    { 
      label: "Badges", 
      value: badges?.length || "0", 
      icon: Award, 
      color: "text-blue-400" 
    },
    { 
      label: "Série", 
      value: `${loginStreak || 0} jours`, 
      icon: Flame, 
      color: "text-orange-400" 
    }
  ];

  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton variant="secondary" icon={Trophy}>
        Mes badges
      </PremiumButton>
      <PremiumButton variant="primary" icon={RefreshCw} onClick={refreshData}>
        Actualiser
      </PremiumButton>
    </div>
  );

  return (
    <PremiumLayout
      title="Gamification"
      subtitle="Votre progression et réalisations"
      icon={Trophy}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Onglets */}
      <div className="mb-6">
        <PremiumCard>
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
              { id: 'badges', label: 'Badges', icon: Award },
              { id: 'leaderboard', label: 'Classement', icon: Trophy },
              { id: 'rewards', label: 'Récompenses', icon: Star }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Progression niveau */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-semibold flex items-center">
                <Crown className="w-6 h-6 mr-2 text-purple-400" />
                Niveau {level}
              </h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{totalXp} XP</div>
                <div className="text-gray-400 text-sm">XP Total</div>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Progression vers le niveau {level + 1}</span>
                <span className="text-white font-medium">{xpToNextLevel} XP restants</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
              <div className="text-center">
                <span className="text-lg font-bold text-white">{Math.round(progressToNextLevel)}%</span>
              </div>
            </div>
          </PremiumCard>

          {/* Stats de la semaine */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <PremiumCard>
              <div className="text-center">
                <Target className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{gamificationData?.tasksCompleted || 0}</div>
                <div className="text-gray-400 text-sm">Tâches terminées</div>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="text-center">
                <Flame className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{loginStreak}</div>
                <div className="text-gray-400 text-sm">Jours consécutifs</div>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="text-center">
                <Award className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{badges?.length || 0}</div>
                <div className="text-gray-400 text-sm">Badges obtenus</div>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{weeklyXp}</div>
                <div className="text-gray-400 text-sm">XP cette semaine</div>
              </div>
            </PremiumCard>
          </div>

          {/* Activité récente */}
          <PremiumCard>
            <h3 className="text-white text-xl font-semibold mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-green-400" />
              Activité récente
            </h3>
            
            {recentActivities?.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(activity.timestamp).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-yellow-400 text-sm font-medium">+{activity.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune activité récente</p>
              </div>
            )}
          </PremiumCard>
        </div>
      )}

      {/* Autres onglets avec contenu basique */}
      {activeTab === 'badges' && (
        <PremiumCard>
          <div className="text-center py-8">
            <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Collection de badges</h3>
            <p className="text-gray-400">Consultez la page Badges pour voir votre collection complète</p>
            <div className="mt-6">
              <PremiumButton variant="primary" icon={Award}>
                Voir tous les badges
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}

      {activeTab === 'leaderboard' && (
        <PremiumCard>
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Classement</h3>
            <p className="text-gray-400">Consultez la page Classement pour voir votre position</p>
            <div className="mt-6">
              <PremiumButton variant="primary" icon={Trophy}>
                Voir le classement
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}

      {activeTab === 'rewards' && (
        <PremiumCard>
          <div className="text-center py-8">
            <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Récompenses</h3>
            <p className="text-gray-400">Consultez la page Récompenses pour échanger vos points</p>
            <div className="mt-6">
              <PremiumButton variant="primary" icon={Star}>
                Voir les récompenses
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}
    </PremiumLayout>
  );
};

export default GamificationPage;
