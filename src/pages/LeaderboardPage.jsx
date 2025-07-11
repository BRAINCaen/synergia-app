// ==========================================
// 📁 react-app/src/pages/LeaderboardPage.jsx
// Leaderboard TEMPORAIRE SANS GAMESTORE
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
// 🚨 GAMESTORE TEMPORAIREMENT DÉSACTIVÉ
// import { useGameStore } from '../shared/stores/gameStore.js';
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
  
  // 🚨 DONNÉES GAMESTORE TEMPORAIRES MOCKÉES
  const mockGameData = {
    leaderboard: [
      {
        id: '1',
        name: 'Alice Johnson',
        avatar: '👩',
        xp: 2450,
        level: 12,
        tasksCompleted: 89,
        badges: 15,
        streak: 7,
        rank: 1
      },
      {
        id: '2',
        name: 'Bob Smith',
        avatar: '👨',
        xp: 2120,
        level: 10,
        tasksCompleted: 76,
        badges: 12,
        streak: 5,
        rank: 2
      },
      {
        id: '3',
        name: 'Claire Davis',
        avatar: '👩‍💼',
        xp: 1890,
        level: 9,
        tasksCompleted: 68,
        badges: 10,
        streak: 4,
        rank: 3
      }
    ],
    loading: false,
    userStats: {
      level: 2,
      totalXp: 175,
      tasksCompleted: 12,
      badges: 3
    }
  };

  const { user } = useAuthStore();

  // Charger le leaderboard Firebase
  useEffect(() => {
    const loadFirebaseLeaderboard = async () => {
      if (!db) {
        console.log('🔧 Mode déconnecté - Pas de Firebase');
        setLoadingFirebase(false);
        return;
      }

      try {
        setLoadingFirebase(true);
        console.log('🔥 Chargement leaderboard Firebase...');
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('totalXp', 'desc'), limit(50));
        
        const snapshot = await getDocs(q);
        const firebaseUsers = [];
        
        snapshot.forEach((doc) => {
          const userData = doc.data();
          firebaseUsers.push({
            id: doc.id,
            name: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
            email: userData.email,
            avatar: userData.photoURL || '👤',
            xp: userData.totalXp || 0,
            level: userData.level || 1,
            tasksCompleted: userData.tasksCompleted || 0,
            badges: userData.badges?.length || 0,
            streak: userData.loginStreak || 0,
            lastActive: userData.lastLoginDate,
            rank: 0 // Sera calculé après tri
          });
        });

        // Calculer les rangs
        firebaseUsers.forEach((user, index) => {
          user.rank = index + 1;
        });

        setRealLeaderboard(firebaseUsers);
        console.log(`✅ ${firebaseUsers.length} utilisateurs chargés depuis Firebase`);
        
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
    return mockGameData.leaderboard;
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
            <span className="ml-3 text-sm bg-amber-600 px-3 py-1 rounded-full">
              DEBUG MODE
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-4">
            Compétition amicale et reconnaissance des contributions
          </p>
          
          {/* Stats utilisateur actuel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{mockGameData.userStats.level}</div>
              <div className="text-sm text-white/80">Votre niveau</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{mockGameData.userStats.totalXp}</div>
              <div className="text-sm text-white/80">Vos points XP</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{getCurrentUserRank() || '?'}</div>
              <div className="text-sm text-white/80">Votre position</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{mockGameData.userStats.badges}</div>
              <div className="text-sm text-white/80">Vos badges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Onglets */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? `bg-${tab.color}-500 text-white shadow-lg` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message d'info debug */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              <strong>Mode Debug :</strong> GameStore temporairement désactivé. 
              Affichage des données {realLeaderboard.length > 0 ? 'Firebase réelles' : 'simulées'}.
              {loadingFirebase && ' Chargement Firebase en cours...'}
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header du tableau */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Classement {tabs.find(t => t.id === activeTab)?.label}
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
                    <div className="flex items-center justify-center w-10 h-10">
                      {position <= 3 ? (
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                          ${position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-amber-600'}
                        `}>
                          {position}
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-500">{position}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {participant.avatar === '👤' ? 
                        participant.name.charAt(0).toUpperCase() : 
                        participant.avatar
                      }
                    </div>

                    {/* Info utilisateur */}
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center">
                        {participant.name}
                        {isCurrentUser && (
                          <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Niveau {participant.level} • {participant.tasksCompleted} tâches
                      </div>
                    </div>
                  </div>

                  {/* Métriques */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {activeTab === 'xp' && participant.xp}
                      {activeTab === 'tasks' && participant.tasksCompleted}
                      {activeTab === 'level' && participant.level}
                      {activeTab === 'badges' && participant.badges}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activeTab === 'xp' && 'points XP'}
                      {activeTab === 'tasks' && 'tâches'}
                      {activeTab === 'level' && 'niveau'}
                      {activeTab === 'badges' && 'badges'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
