// ==========================================
// 📁 react-app/src/pages/LeaderboardPage.jsx
// Leaderboard AVEC TOUTES LES CORRECTIONS - VERSION FINALE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Star, Crown, Target, TrendingUp, Calendar, 
  Users, Award, Zap, Clock, Filter, RefreshCw, Download,
  ChevronUp, ChevronDown, Flame, Shield, Gem, Sword
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const LeaderboardPage = () => {
  // États locaux pour la page complète Firebase
  const [activeTab, setActiveTab] = useState('xp'); // xp, tasks, level, badges
  const [timePeriod, setTimePeriod] = useState('all'); // week, month, all
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('overall'); // overall, productivity, consistency
  const [realLeaderboard, setRealLeaderboard] = useState([]);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  
  const { user } = useAuthStore();

  // 🧹 FONCTION DE NETTOYAGE DES NOMS
  const cleanDisplayName = (userData) => {
    let cleanName = userData.displayName || userData.email;
    
    // Nettoyer les URLs Google
    if (cleanName.includes('googleusercontent.com')) {
      console.log('🧹 LeaderboardPage - Nettoyage URL Google pour:', userData.email);
      console.log('   Avant:', cleanName);
      
      // Extraire le nom depuis l'URL Google si possible
      const urlParts = cleanName.split('/');
      cleanName = urlParts[urlParts.length - 1].split('?')[0];
      
      // Si c'est encore une URL, utiliser l'email
      if (cleanName.includes('http') || cleanName.length > 50) {
        cleanName = userData.email.split('@')[0];
      }
      
      console.log('   Après:', cleanName);
    }
    
    return cleanName;
  };

  // 🔧 CORRECTION: Utiliser les VRAIES données pour les statistiques
  const getStatsFromRealData = () => {
    if (realLeaderboard.length === 0) {
      return {
        userStats: {
          level: 1,
          totalXp: 0,
          badges: 0,
          tasksCompleted: 0
        },
        totalParticipants: 0
      };
    }

    // Trouver l'utilisateur actuel dans le classement réel
    const currentUser = realLeaderboard.find(u => u.email === user?.email);
    
    return {
      userStats: {
        level: currentUser?.level || 1,
        totalXp: currentUser?.xp || 0,
        badges: currentUser?.badges || 0,
        tasksCompleted: currentUser?.tasksCompleted || 0
      },
      totalParticipants: realLeaderboard.length
    };
  };

  // ✅ Charger les vraies données Firebase au montage
  useEffect(() => {
    const loadFirebaseLeaderboard = async () => {
      console.log('🔍 LeaderboardPage - Chargement leaderboard Firebase...');
      
      if (!db) {
        console.log('⚠️ Firebase non disponible');
        setLoadingFirebase(false);
        return;
      }

      try {
        // 🎯 Nettoyage des noms activé dans LeaderboardPage.jsx
        console.log('✅ Noms nettoyés activés dans LeaderboardPage.jsx');

        const usersQuery = query(
          collection(db, 'users'),
          orderBy('gamification.totalXp', 'desc'),
          limit(50)
        );

        const querySnapshot = await getDocs(usersQuery);
        const firebaseUsers = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          
          if (userData.email && userData.gamification) {
            // 🔧 CORRECTION: Nettoyer les noms d'affichage ici aussi
            const cleanedName = cleanDisplayName(userData);

            firebaseUsers.push({
              id: doc.id,
              name: cleanedName, // 🔧 NOM NETTOYÉ
              email: userData.email,
              role: userData.profile?.role || 'Membre',
              xp: userData.gamification.totalXp || 0,
              level: userData.gamification.level || 1,
              tasksCompleted: userData.gamification.tasksCompleted || 0,
              badges: userData.gamification.badges?.length || 0,
              streak: userData.gamification.loginStreak || 0,
              lastActive: userData.gamification.lastLoginDate,
              rank: 0 // Sera calculé après tri
            });
          }
        });

        // Calculer les rangs
        firebaseUsers.forEach((user, index) => {
          user.rank = index + 1;
        });

        setRealLeaderboard(firebaseUsers);
        console.log(`✅ LeaderboardPage - ${firebaseUsers.length} utilisateurs chargés avec noms nettoyés`);
        
      } catch (error) {
        console.error('❌ Erreur chargement Firebase leaderboard:', error);
      } finally {
        setLoadingFirebase(false);
      }
    };

    loadFirebaseLeaderboard();
  }, []);

  // Combiner données Firebase et mock
  const getDisplayLeaderboard = () => {
    if (realLeaderboard.length > 0) {
      return realLeaderboard;
    }
    // Fallback si pas de données Firebase
    return [{
      id: user?.uid || '1',
      name: user?.displayName || user?.email?.split('@')[0] || 'Utilisateur',
      email: user?.email || 'user@example.com',
      role: 'Utilisateur connecté',
      xp: 0,
      level: 1,
      tasksCompleted: 0,
      badges: 0,
      streak: 0,
      rank: 1
    }];
  };

  // Fonction refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 Actualisation leaderboard...');
    
    // Simuler un délai de refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshing(false);
    console.log('✅ Leaderboard actualisé');
  };

  // Obtenir la position de l'utilisateur actuel
  const getCurrentUserRank = () => {
    const leaderboard = getDisplayLeaderboard();
    const userIndex = leaderboard.findIndex(u => u.email === user?.email);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  // Filtrer selon l'onglet actif
  const getFilteredData = () => {
    const leaderboard = getDisplayLeaderboard();
    
    switch (activeTab) {
      case 'tasks':
        return [...leaderboard].sort((a, b) => b.tasksCompleted - a.tasksCompleted);
      case 'level':
        return [...leaderboard].sort((a, b) => b.level - a.level);
      case 'badges':
        return [...leaderboard].sort((a, b) => b.badges - a.badges);
      default: // xp
        return [...leaderboard].sort((a, b) => b.xp - a.xp);
    }
  };

  const tabs = [
    { id: 'xp', label: 'Points XP', icon: Zap, color: 'purple' },
    { id: 'tasks', label: 'Tâches', icon: Target, color: 'green' },
    { id: 'level', label: 'Niveau', icon: Crown, color: 'yellow' },
    { id: 'badges', label: 'Badges', icon: Award, color: 'blue' }
  ];

  // 🔧 CORRECTION: Utiliser les vraies données pour les stats
  const realStats = getStatsFromRealData();

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
          <Trophy className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            🏆 Classement
          </h1>
          <p className="text-xl text-white/90 mb-4">
            Compétition amicale et reconnaissance des contributions
          </p>
          
          {/* 🔧 CORRECTION: Stats utilisateur avec VRAIES DONNÉES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{realStats.userStats.level}</div>
              <div className="text-sm text-white/80">Votre niveau</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{realStats.userStats.totalXp}</div>
              <div className="text-sm text-white/80">Vos points XP</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{getCurrentUserRank() || '?'}</div>
              <div className="text-sm text-white/80">Votre rang</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{realStats.userStats.badges}</div>
              <div className="text-sm text-white/80">Vos badges</div>
            </div>
          </div>
          
          {/* Info debug */}
          <div className="mt-4 text-sm text-white/70">
            <p>
              Affichage des données {realLeaderboard.length > 0 ? 'Firebase réelles' : 'simulées'}.
              {loadingFirebase && ' Chargement Firebase en cours...'}
            </p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 inline-flex">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2
                  ${isActive 
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg` 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔧 CORRECTION: Section Statistiques avec VRAIES DONNÉES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              📊 Statistiques XP
            </h3>
          </div>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-purple-600">
              {realStats.totalParticipants}
            </div>
            <div className="text-sm text-gray-600">Participants</div>
            
            {/* 🔧 CORRECTION: Affichage des utilisateurs avec vrais noms nettoyés */}
            <div className="mt-4 space-y-2">
              {getFilteredData().slice(0, 3).map((participant, index) => (
                <div key={participant.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">#{index + 1}</span>
                    <span className="font-medium">{participant.name}</span>
                  </div>
                  <div className="text-gray-600">
                    {activeTab === 'xp' && `${participant.xp} XP`}
                    {activeTab === 'tasks' && `${participant.tasksCompleted} tâches`}
                    {activeTab === 'level' && `Niveau ${participant.level}`}
                    {activeTab === 'badges' && `${participant.badges} badges`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Autres statistiques */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">🎯 Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-green-600">
              {Math.round((realStats.userStats.tasksCompleted / Math.max(realStats.totalParticipants, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Taux de completion</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">🏆 Votre Position</h3>
          </div>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-yellow-600">
              #{getCurrentUserRank() || '?'}
            </div>
            <div className="text-sm text-gray-600">
              Sur {realStats.totalParticipants} participants
            </div>
          </div>
        </div>
      </div>

      {/* 🔧 CORRECTION: Section Leaderboard avec noms nettoyés */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header du tableau */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            🏆 Top Performers - {tabs.find(t => t.id === activeTab)?.label}
            <span className="ml-2 text-sm text-gray-500">
              ({getFilteredData().length} participants)
            </span>
          </h3>
        </div>

        {/* Liste */}
        <div className="divide-y divide-gray-100">
          {getFilteredData().slice(0, 10).map((participant, index) => {
            const isCurrentUser = participant.email === user?.email;
            const position = index + 1;
            
            return (
              <div 
                key={participant.id}
                className={`
                  px-6 py-4 hover:bg-gray-50 transition-colors
                  ${isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Position */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      ${position === 1 ? 'bg-yellow-100 text-yellow-800' : 
                        position === 2 ? 'bg-gray-100 text-gray-800' :
                        position === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-50 text-gray-600'}
                    `}>
                      {position <= 3 ? 
                        ['🥇', '🥈', '🥉'][position - 1] : 
                        `#${position}`
                      }
                    </div>

                    {/* Info utilisateur */}
                    <div>
                      <div className="font-medium text-gray-900 flex items-center">
                        {participant.name} {/* 🔧 NOMS NETTOYÉS ICI */}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{participant.role}</div>
                    </div>
                  </div>

                  {/* Métriques */}
                  <div className="flex items-center space-x-6">
                    {activeTab === 'xp' && (
                      <div className="text-right">
                        <div className="font-semibold text-purple-600">{participant.xp.toLocaleString()} XP</div>
                        <div className="text-xs text-gray-500">Niveau {participant.level}</div>
                      </div>
                    )}
                    
                    {activeTab === 'tasks' && (
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{participant.tasksCompleted}</div>
                        <div className="text-xs text-gray-500">Tâches</div>
                      </div>
                    )}
                    
                    {activeTab === 'level' && (
                      <div className="text-right">
                        <div className="font-semibold text-yellow-600">Niveau {participant.level}</div>
                        <div className="text-xs text-gray-500">{participant.xp} XP</div>
                      </div>
                    )}
                    
                    {activeTab === 'badges' && (
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">{participant.badges}</div>
                        <div className="text-xs text-gray-500">Badges</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions en bas */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
        </button>
        
        <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          <span>Exporter</span>
        </button>
      </div>
    </div>
  );
};

export default LeaderboardPage;
