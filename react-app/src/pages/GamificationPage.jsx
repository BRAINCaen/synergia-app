// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// GAMIFICATION PAGE - VUE D'ENSEMBLE AVEC VRAIES DONNÉES FIREBASE
// ==========================================

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
  RefreshCw,
  CheckCircle2,
  Calendar,
  BarChart3,
  Users,
  ArrowUp,
  Gift,
  Clock
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const GamificationPage = () => {
  const { user } = useAuthStore();
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 UTILISER LES VRAIES DONNÉES FIREBASE
  const {
    gamification,
    isLoading: firebaseLoading,
    isReady,
    error: firebaseError,
    actions
  } = useUnifiedFirebaseData();

  /**
   * 🔥 CHARGER LES ACTIVITÉS RÉCENTES RÉELLES
   */
  const loadRecentActivities = async () => {
    if (!user?.uid || !isReady) return;

    try {
      console.log('📊 Chargement activités récentes pour:', user.uid);

      // Récupérer les tâches récemment complétées
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        where('status', '==', 'completed'),
        orderBy('updatedAt', 'desc'),
        limit(5)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const activities = [];
      tasksSnapshot.forEach(doc => {
        const task = doc.data();
        activities.push({
          id: doc.id,
          type: 'task_completed',
          title: task.title,
          xpGained: task.xpReward || 0,
          date: task.updatedAt?.toDate?.() || new Date(task.updatedAt),
          icon: CheckCircle2,
          color: 'text-green-400'
        });
      });

      // Récupérer les projets récents
      const projectsQuery = query(
        collection(db, 'projects'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      
      projectsSnapshot.forEach(doc => {
        const project = doc.data();
        activities.push({
          id: doc.id,
          type: 'project_created',
          title: `Projet créé: ${project.title}`,
          xpGained: 50, // XP pour création projet
          date: project.createdAt?.toDate?.() || new Date(project.createdAt),
          icon: Target,
          color: 'text-blue-400'
        });
      });

      // Trier par date
      activities.sort((a, b) => b.date - a.date);
      setRecentActivities(activities.slice(0, 8));

    } catch (error) {
      console.error('❌ Erreur chargement activités:', error);
    }
  };

  /**
   * 🔄 ACTUALISER LES DONNÉES
   */
  const refreshData = async () => {
    setLoading(true);
    await loadRecentActivities();
    if (actions?.refreshData) {
      await actions.refreshData();
    }
    setLoading(false);
  };

  // Charger les données au montage
  useEffect(() => {
    if (isReady && user?.uid) {
      loadRecentActivities();
      setLoading(false);
    }
  }, [isReady, user?.uid]);

  // ✅ UTILISER LES VRAIES DONNÉES DE GAMIFICATION
  const totalXp = gamification.totalXp || 0;
  const level = gamification.level || 1;
  const weeklyXp = gamification.weeklyXp || 0;
  const monthlyXp = gamification.monthlyXp || 0;
  const tasksCompleted = gamification.tasksCompleted || 0;
  const tasksCreated = gamification.tasksCreated || 0;
  const projectsCreated = gamification.projectsCreated || 0;
  const badges = gamification.badges || [];
  const loginStreak = gamification.loginStreak || 0;
  const currentStreak = gamification.currentStreak || 0;
  
  // Calculs dérivés
  const currentLevelXp = totalXp % 100;
  const nextLevelXpRequired = 100;
  const xpProgress = (currentLevelXp / nextLevelXpRequired) * 100;
  const nextLevel = level + 1;
  const xpToNextLevel = nextLevelXpRequired - currentLevelXp;
  const completionRate = tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;

  const headerStats = [
    { 
      label: "XP Total", 
      value: totalXp.toLocaleString(), 
      icon: Star, 
      color: "text-yellow-400" 
    },
    { 
      label: "Niveau", 
      value: level.toString(), 
      icon: Crown, 
      color: "text-purple-400" 
    },
    { 
      label: "Badges", 
      value: badges.length.toString(), 
      icon: Award, 
      color: "text-blue-400" 
    },
    { 
      label: "Série", 
      value: `${loginStreak} jours`, 
      icon: Flame, 
      color: "text-orange-400" 
    }
  ];

  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton variant="secondary" onClick={() => window.location.href = '/badges'}>
        <Award className="w-4 h-4 mr-2" />
        Mes badges
      </PremiumButton>
      <PremiumButton variant="primary" icon={RefreshCw} onClick={refreshData}>
        Actualiser
      </PremiumButton>
    </div>
  );

  if (firebaseLoading || loading) {
    return (
      <PremiumLayout
        title="🎮 Gamification"
        subtitle="Votre progression et réalisations"
        headerStats={[]}
        headerActions={<div className="animate-pulse bg-gray-700 h-10 w-32 rounded"></div>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <PremiumCard key={i}>
              <div className="animate-pulse">
                <div className="bg-gray-700 h-16 w-16 rounded-full mx-auto mb-4"></div>
                <div className="bg-gray-700 h-8 w-20 rounded mx-auto mb-2"></div>
                <div className="bg-gray-700 h-4 w-24 rounded mx-auto"></div>
              </div>
            </PremiumCard>
          ))}
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="🎮 Gamification"
      subtitle="Votre progression et réalisations"
      headerStats={headerStats}
      headerActions={headerActions}
    >
      {/* Section Niveau et Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Progression vers le niveau suivant */}
        <PremiumCard>
          <div className="text-center">
            <Crown className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-2">Niveau {level}</h3>
            <p className="text-gray-400 mb-4">Progression vers le niveau {nextLevel}</p>
            
            {/* Barre de progression XP */}
            <div className="relative">
              <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-300 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-400">{currentLevelXp} XP</span>
                <span className="text-gray-400">{nextLevelXpRequired} XP</span>
              </div>
            </div>
            
            <p className="text-purple-300 mt-2">
              <strong>{xpToNextLevel} XP</strong> pour atteindre le niveau {nextLevel}
            </p>
          </div>
        </PremiumCard>

        {/* Statistiques XP */}
        <PremiumCard>
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
            Statistiques XP
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-400 mr-3" />
                <div>
                  <p className="text-white font-medium">XP Total</p>
                  <p className="text-gray-400 text-sm">Depuis le début</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{totalXp.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-400 mr-3" />
                <div>
                  <p className="text-white font-medium">XP cette semaine</p>
                  <p className="text-gray-400 text-sm">7 derniers jours</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-400">{weeklyXp}</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-400 mr-3" />
                <div>
                  <p className="text-white font-medium">XP ce mois</p>
                  <p className="text-gray-400 text-sm">30 derniers jours</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-400">{monthlyXp}</p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Tâches complétées */}
        <PremiumCard>
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-1">{tasksCompleted}</h3>
            <p className="text-gray-400 text-sm mb-2">Tâches terminées</p>
            <div className="flex items-center justify-center text-green-400">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+{Math.round(tasksCompleted / Math.max(1, (Date.now() - new Date().setHours(0,0,0,0)) / (1000*60*60*24)))} par jour</span>
            </div>
          </div>
        </PremiumCard>

        {/* Projets créés */}
        <PremiumCard>
          <div className="text-center">
            <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-1">{projectsCreated}</h3>
            <p className="text-gray-400 text-sm mb-2">Projets créés</p>
            <p className="text-blue-400 text-sm">Leadership actif</p>
          </div>
        </PremiumCard>

        {/* Taux de completion */}
        <PremiumCard>
          <div className="text-center">
            <Activity className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-1">{completionRate}%</h3>
            <p className="text-gray-400 text-sm mb-2">Taux de réussite</p>
            <p className="text-purple-400 text-sm">
              {completionRate >= 80 ? 'Excellent' : completionRate >= 60 ? 'Très bien' : 'En progression'}
            </p>
          </div>
        </PremiumCard>

        {/* Série de connexion */}
        <PremiumCard>
          <div className="text-center">
            <Flame className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-1">{loginStreak}</h3>
            <p className="text-gray-400 text-sm mb-2">Jours consécutifs</p>
            <div className="flex items-center justify-center text-orange-400">
              <Zap className="w-4 h-4 mr-1" />
              <span className="text-sm">Série active!</span>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Badges récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Mes badges */}
        <PremiumCard>
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-blue-400" />
            Mes Badges ({badges.length})
          </h3>
          <div className="space-y-3">
            {badges.length > 0 ? (
              badges.slice(0, 5).map((badge, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{badge.name || badge.title || 'Badge'}</p>
                      <p className="text-gray-400 text-sm">{badge.description || 'Badge débloqué'}</p>
                    </div>
                  </div>
                  <div className="text-yellow-400">
                    <Star className="w-5 h-5" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Aucun badge débloqué</p>
                <p className="text-gray-500 text-sm">Complétez des tâches pour gagner des badges !</p>
              </div>
            )}
            {badges.length > 5 && (
              <div className="text-center pt-2">
                <PremiumButton variant="secondary" onClick={() => window.location.href = '/badges'}>
                  Voir tous les badges
                </PremiumButton>
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Activité récente */}
        <PremiumCard>
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-400" />
            Activité Récente
          </h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <activity.icon className={`w-8 h-8 ${activity.color} mr-3`} />
                    <div>
                      <p className="text-white font-medium">{activity.title}</p>
                      <p className="text-gray-400 text-sm">
                        {activity.date.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-yellow-400 font-medium">
                    +{activity.xpGained} XP
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Aucune activité récente</p>
                <p className="text-gray-500 text-sm">Vos actions apparaîtront ici</p>
              </div>
            )}
          </div>
        </PremiumCard>
      </div>

      {/* Actions rapides */}
      <PremiumCard>
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-purple-400" />
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumButton 
            variant="primary" 
            className="flex-col h-20"
            onClick={() => window.location.href = '/tasks'}
          >
            <CheckCircle2 className="w-6 h-6 mb-2" />
            Créer une tâche
          </PremiumButton>
          
          <PremiumButton 
            variant="secondary" 
            className="flex-col h-20"
            onClick={() => window.location.href = '/projects'}
          >
            <Target className="w-6 h-6 mb-2" />
            Nouveau projet
          </PremiumButton>
          
          <PremiumButton 
            variant="secondary" 
            className="flex-col h-20"
            onClick={() => window.location.href = '/badges'}
          >
            <Award className="w-6 h-6 mb-2" />
            Voir mes badges
          </PremiumButton>
          
          <PremiumButton 
            variant="secondary" 
            className="flex-col h-20"
            onClick={() => window.location.href = '/leaderboard'}
          >
            <Trophy className="w-6 h-6 mb-2" />
            Classement
          </PremiumButton>
        </div>
      </PremiumCard>

      {/* Message d'encouragement */}
      {totalXp === 0 && (
        <PremiumCard>
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Bienvenue dans la gamification !</h3>
            <p className="text-gray-400 mb-6">
              Commencez à gagner de l'XP en complétant des tâches et en créant des projets.
            </p>
            <div className="flex justify-center space-x-4">
              <PremiumButton variant="primary" onClick={() => window.location.href = '/tasks'}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Ma première tâche
              </PremiumButton>
              <PremiumButton variant="secondary" onClick={() => window.location.href = '/projects'}>
                <Target className="w-4 h-4 mr-2" />
                Mon premier projet
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}
    </PremiumLayout>
  );
};

export default GamificationPage;
