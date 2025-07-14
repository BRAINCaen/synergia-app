// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// GAMIFICATION PREMIUM AVEC DESIGN HARMONISÉ TEAM PAGE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Star,
  Award,
  Target,
  Zap,
  Users,
  TrendingUp,
  Calendar,
  Gift,
  Medal,
  Flame,
  Eye,
  ChevronRight,
  Play,
  Lock,
  CheckCircle,
  Clock
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { useBadgeStore } from '../shared/stores/badgeStore.js';

/**
 * 🎮 GAMIFICATION PREMIUM REDESIGN
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  const { badges, loadBadges } = useBadgeStore();
  
  const [activeTab, setActiveTab] = useState('overview'); // overview, badges, leaderboard, achievements
  const [userStats, setUserStats] = useState({
    level: 1,
    totalXP: 0,
    currentLevelXP: 0,
    nextLevelXP: 100,
    streakDays: 0,
    badgesEarned: 0,
    ranking: 0
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [recentBadges, setRecentBadges] = useState([]);

  // Calcul des statistiques utilisateur
  useEffect(() => {
    if (user) {
      const totalXP = user.totalXP || 0;
      const level = Math.floor(totalXP / 100) + 1;
      const currentLevelXP = totalXP % 100;
      const nextLevelXP = 100;
      
      setUserStats({
        level,
        totalXP,
        currentLevelXP,
        nextLevelXP,
        streakDays: user.streakDays || 0,
        badgesEarned: badges?.filter(b => b.earned)?.length || 0,
        ranking: 2 // Mock ranking
      });
    }
  }, [user, badges]);

  // Chargement initial
  useEffect(() => {
    if (loadBadges) {
      loadBadges();
    }
  }, [loadBadges]);

  // Statistiques pour le header
  const headerStats = [
    {
      label: "Niveau actuel",
      value: userStats.level,
      icon: Crown,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    },
    {
      label: "XP Total",
      value: userStats.totalXP,
      icon: Star,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      label: "Badges gagnés",
      value: userStats.badgesEarned,
      icon: Award,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    },
    {
      label: "Série actuelle",
      value: `${userStats.streakDays}j`,
      icon: Flame,
      color: "text-red-400",
      iconColor: "text-red-400"
    }
  ];

  // Onglets disponibles
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Trophy },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'leaderboard', label: 'Classement', icon: Users },
    { id: 'achievements', label: 'Succès', icon: Target }
  ];

  // Badges factices pour la démo
  const mockBadges = [
    { id: 1, name: 'Premier Pas', description: 'Première tâche complétée', icon: '🎯', earned: true, rarity: 'common' },
    { id: 2, name: 'Série de Feu', description: '7 jours consécutifs', icon: '🔥', earned: true, rarity: 'rare' },
    { id: 3, name: 'Collaborateur Expert', description: '50 collaborations', icon: '🤝', earned: true, rarity: 'epic' },
    { id: 4, name: 'Maître du Code', description: '100 commits', icon: '💻', earned: false, rarity: 'legendary' },
    { id: 5, name: 'Mentor', description: 'Aider 10 collègues', icon: '🎓', earned: false, rarity: 'rare' },
    { id: 6, name: 'Innovation', description: 'Proposer une amélioration', icon: '💡', earned: true, rarity: 'uncommon' }
  ];

  // Fonction pour obtenir la couleur de rareté
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'uncommon': return 'from-green-500 to-green-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Mock leaderboard
  const mockLeaderboard = [
    { rank: 1, name: 'Marie Dupont', level: 15, xp: 2850, avatar: '👩‍💼', change: '+2' },
    { rank: 2, name: 'Vous', level: userStats.level, xp: userStats.totalXP, avatar: '🧑‍💻', change: '0', isUser: true },
    { rank: 3, name: 'Alex Rodriguez', level: 12, xp: 2100, avatar: '👨‍🎨', change: '-1' },
    { rank: 4, name: 'Sophie Chen', level: 11, xp: 1950, avatar: '👩‍🔬', change: '+1' },
    { rank: 5, name: 'Thomas Martin', level: 10, xp: 1800, avatar: '👨‍💼', change: '+3' }
  ];

  return (
    <PremiumLayout
      title="Gamification"
      subtitle="Suivez votre progression et débloquez des récompenses"
      icon={Trophy}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🎯 Navigation des onglets */}
      <PremiumCard className="mb-8">
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </PremiumCard>

      {/* 📊 Contenu selon l'onglet actif */}
      <div className="space-y-8">
        
        {/* ONGLET VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Progression niveau */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Progression principale */}
              <div className="lg:col-span-2">
                <PremiumCard className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Niveau {userStats.level}</h3>
                        <p className="text-purple-200">Expert en progression</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{userStats.totalXP}</div>
                      <div className="text-purple-200 text-sm">Points d'expérience</div>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-purple-200 mb-2">
                      <span>Progression vers niveau {userStats.level + 1}</span>
                      <span>{userStats.currentLevelXP}/{userStats.nextLevelXP} XP</span>
                    </div>
                    <div className="w-full bg-purple-900/30 rounded-full h-4">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(userStats.currentLevelXP / userStats.nextLevelXP) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </motion.div>
                    </div>
                    <div className="text-center mt-2 text-purple-200 text-sm">
                      Plus que {userStats.nextLevelXP - userStats.currentLevelXP} XP pour le niveau suivant
                    </div>
                  </div>

                  {/* Récompenses du niveau suivant */}
                  <div className="bg-purple-900/20 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <Gift className="w-5 h-5 mr-2 text-yellow-400" />
                      Récompenses niveau {userStats.level + 1}
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-purple-200">Badge Elite</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-purple-200">+50 XP Bonus</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-purple-200">Titre Spécial</div>
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              </div>

              {/* Statistiques rapides */}
              <div className="space-y-6">
                <StatCard
                  title="Série actuelle"
                  value={`${userStats.streakDays} jours`}
                  icon={Flame}
                  color="red"
                  trend="🔥 Record personnel"
                />
                <StatCard
                  title="Rang équipe"
                  value={`#${userStats.ranking}`}
                  icon={Trophy}
                  color="yellow"
                  trend="🏆 Top 3"
                />
                <StatCard
                  title="Taux de réussite"
                  value="94%"
                  icon={Target}
                  color="green"
                  trend="📈 +5% ce mois"
                />
              </div>
            </div>

            {/* Badges récents et activité */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Badges récents */}
              <PremiumCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Badges récents</h3>
                  <PremiumButton variant="ghost" size="sm" icon={Eye}>
                    Voir tous
                  </PremiumButton>
                </div>
                
                <div className="space-y-4">
                  {mockBadges.filter(b => b.earned).slice(0, 3).map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-xl flex items-center justify-center text-xl`}>
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{badge.name}</div>
                        <div className="text-gray-400 text-sm">{badge.description}</div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                          badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                          badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                          badge.rarity === 'uncommon' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {badge.rarity}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>

              {/* Activité récente */}
              <PremiumCard>
                <h3 className="text-xl font-bold text-white mb-6">Activité récente</h3>
                
                <div className="space-y-4">
                  {[
                    { action: 'Badge débloqué', detail: 'Collaborateur Expert', xp: '+100 XP', time: 'il y a 2h', type: 'badge' },
                    { action: 'Niveau atteint', detail: `Niveau ${userStats.level}`, xp: '+50 XP', time: 'il y a 1j', type: 'level' },
                    { action: 'Série maintenue', detail: '7 jours consécutifs', xp: '+25 XP', time: 'il y a 2j', type: 'streak' },
                    { action: 'Défi complété', detail: 'Productivité hebdomadaire', xp: '+75 XP', time: 'il y a 3j', type: 'challenge' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.type === 'badge' ? 'bg-purple-400' :
                          activity.type === 'level' ? 'bg-yellow-400' :
                          activity.type === 'streak' ? 'bg-red-400' :
                          'bg-blue-400'
                        }`}></div>
                        <div>
                          <div className="text-white font-medium text-sm">{activity.action}</div>
                          <div className="text-gray-400 text-xs">{activity.detail}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium text-sm">{activity.xp}</div>
                        <div className="text-gray-500 text-xs">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </div>
          </div>
        )}

        {/* ONGLET BADGES */}
        {activeTab === 'badges' && (
          <div className="space-y-8">
            
            {/* Statistiques des badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total badges"
                value={mockBadges.length}
                icon={Award}
                color="blue"
              />
              <StatCard
                title="Gagnés"
                value={mockBadges.filter(b => b.earned).length}
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Restants"
                value={mockBadges.filter(b => !b.earned).length}
                icon={Lock}
                color="gray"
              />
              <StatCard
                title="Taux"
                value={`${Math.round((mockBadges.filter(b => b.earned).length / mockBadges.length) * 100)}%`}
                icon={Target}
                color="purple"
              />
            </div>

            {/* Grille des badges */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mockBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PremiumCard className={`text-center ${!badge.earned ? 'opacity-50' : ''}`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 relative`}>
                      {badge.earned ? badge.icon : '🔒'}
                      {badge.earned && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-white font-semibold mb-2">{badge.name}</h4>
                    <p className="text-gray-400 text-sm mb-3">{badge.description}</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                      badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                      badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                      badge.rarity === 'uncommon' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {badge.rarity}
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ONGLET CLASSEMENT */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-8">
            
            {/* Podium */}
            <PremiumCard className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
              <h3 className="text-xl font-bold text-white mb-6 text-center">🏆 Podium de la semaine</h3>
              
              <div className="flex justify-center items-end space-x-8">
                {/* 2ème place */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-2xl mb-2">
                    👩‍💼
                  </div>
                  <div className="w-20 h-16 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="text-white font-semibold mt-2">Marie D.</div>
                  <div className="text-gray-300 text-sm">2,850 XP</div>
                </div>

                {/* 1ère place */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl mb-2">
                    🧑‍💻
                  </div>
                  <div className="w-24 h-20 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-yellow-900">1</span>
                  </div>
                  <div className="text-white font-semibold mt-2">Vous</div>
                  <div className="text-gray-300 text-sm">{userStats.totalXP} XP</div>
                </div>

                {/* 3ème place */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-2xl mb-2">
                    👨‍🎨
                  </div>
                  <div className="w-20 h-12 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="text-white font-semibold mt-2">Alex R.</div>
                  <div className="text-gray-300 text-sm">2,100 XP</div>
                </div>
              </div>
            </PremiumCard>

            {/* Classement complet */}
            <PremiumCard>
              <h3 className="text-xl font-bold text-white mb-6">Classement général</h3>
              
              <div className="space-y-3">
                {mockLeaderboard.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      member.isUser ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        member.rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                        member.rank === 2 ? 'bg-gray-400 text-gray-900' :
                        member.rank === 3 ? 'bg-amber-600 text-amber-100' :
                        'bg-gray-600 text-white'
                      }`}>
                        {member.rank}
                      </div>
                      <div className="text-3xl">{member.avatar}</div>
                      <div>
                        <div className={`font-semibold ${member.isUser ? 'text-blue-400' : 'text-white'}`}>
                          {member.name}
                        </div>
                        <div className="text-gray-400 text-sm">Niveau {member.level}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-bold">{member.xp} XP</div>
                      <div className={`text-sm ${
                        member.change.startsWith('+') ? 'text-green-400' :
                        member.change.startsWith('-') ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {member.change !== '0' && (member.change.startsWith('+') ? '↗️' : '↘️')} {member.change}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </PremiumCard>
          </div>
        )}

        {/* ONGLET SUCCÈS */}
        {activeTab === 'achievements' && (
          <PremiumCard className="text-center py-12">
            <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Succès à venir</h3>
            <p className="text-gray-400">
              Cette section sera bientôt disponible avec des défis et objectifs personnalisés.
            </p>
          </PremiumCard>
        )}
      </div>
    </PremiumLayout>
  );
};

export default GamificationPage;
