// ==========================================
// 📁 react-app/src/components/gamification/Leaderboard.jsx
// Classement avec VRAIES données Firebase
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../core/firebase';
import LoadingSpinner from '../ui/LoadingSpinner';

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('xp');
  const [timeFrame, setTimeFrame] = useState('all-time');

  // ✅ VRAIES DONNÉES : Charger le classement depuis Firebase
  useEffect(() => {
    const loadRealLeaderboard = async () => {
      if (!db) {
        console.log('🔧 Mode déconnecté - Données par défaut');
        setLeaderboardData(getMockLeaderboard());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // ✅ Requête pour récupérer les vrais utilisateurs triés par XP
        let usersQuery;
        
        if (activeTab === 'xp') {
          usersQuery = query(
            collection(db, 'users'),
            orderBy('gamification.totalXp', 'desc'),
            limit(20)
          );
        } else if (activeTab === 'tasks') {
          usersQuery = query(
            collection(db, 'users'),
            orderBy('gamification.tasksCompleted', 'desc'),
            limit(20)
          );
        } else if (activeTab === 'level') {
          usersQuery = query(
            collection(db, 'users'),
            orderBy('gamification.level', 'desc'),
            limit(20)
          );
        }

        const querySnapshot = await getDocs(usersQuery);
        const realUsers = [];

        querySnapshot.forEach((doc, index) => {
          const userData = doc.data();
          if (userData.email && userData.gamification) {
            realUsers.push({
              id: doc.id,
              rank: index + 1,
              name: userData.displayName || userData.email.split('@')[0],
              email: userData.email,
              role: userData.role || 'Membre',
              level: userData.gamification.level || 1,
              totalXp: userData.gamification.totalXp || 0,
              tasksCompleted: userData.gamification.tasksCompleted || 0,
              badges: userData.gamification.badges || [],
              avatar: userData.photoURL || getAvatarFromName(userData.displayName || userData.email),
              isCurrentUser: doc.id === user?.uid,
              streak: userData.gamification.loginStreak || 0,
              lastActivity: userData.lastActivity
            });
          }
        });

        // ✅ Si l'utilisateur connecté n'est pas dans le top, l'ajouter
        if (user && !realUsers.find(u => u.id === user.uid)) {
          try {
            const currentUserQuery = query(
              collection(db, 'users'),
              where('email', '==', user.email),
              limit(1)
            );
            const currentUserSnap = await getDocs(currentUserQuery);
            
            if (!currentUserSnap.empty) {
              const currentUserData = currentUserSnap.docs[0].data();
              const currentUserRank = await calculateUserRank(user.uid, activeTab);
              
              realUsers.push({
                id: user.uid,
                rank: currentUserRank,
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                role: currentUserData.role || 'Membre',
                level: currentUserData.gamification?.level || 1,
                totalXp: currentUserData.gamification?.totalXp || 0,
                tasksCompleted: currentUserData.gamification?.tasksCompleted || 0,
                badges: currentUserData.gamification?.badges || [],
                avatar: user.photoURL || getAvatarFromName(user.displayName || user.email),
                isCurrentUser: true,
                streak: currentUserData.gamification?.loginStreak || 0,
                lastActivity: currentUserData.lastActivity,
                isOutOfTop: true
              });
            }
          } catch (error) {
            console.log('ℹ️ Utilisateur non trouvé dans classement');
          }
        }

        setLeaderboardData(realUsers);
        console.log('✅ Classement réel chargé:', realUsers.length, 'utilisateurs');

      } catch (error) {
        console.error('❌ Erreur chargement classement:', error);
        setLeaderboardData(getMockLeaderboard());
      } finally {
        setLoading(false);
      }
    };

    loadRealLeaderboard();
  }, [activeTab, timeFrame, user]);

  // ✅ Calculer le rang d'un utilisateur
  const calculateUserRank = async (userId, category) => {
    if (!db) return 0;

    try {
      let field = 'gamification.totalXp';
      if (category === 'tasks') field = 'gamification.tasksCompleted';
      if (category === 'level') field = 'gamification.level';

      const usersQuery = query(
        collection(db, 'users'),
        orderBy(field, 'desc')
      );
      
      const snapshot = await getDocs(usersQuery);
      let rank = 1;
      
      snapshot.forEach((doc) => {
        if (doc.id === userId) {
          return;
        }
        rank++;
      });

      return rank;
    } catch (error) {
      return 0;
    }
  };

  // ✅ Générer avatar depuis le nom
  const getAvatarFromName = (name) => {
    if (!name) return '👤';
    
    const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍📊', '👩‍📊', '🧑‍🔧', '👩‍🔧'];
    const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return avatars[index % avatars.length];
  };

  // ✅ Données mock si pas de Firebase
  const getMockLeaderboard = () => [
    {
      id: user?.uid || 'current-user',
      rank: 1,
      name: user?.displayName || user?.email?.split('@')[0] || 'Vous',
      email: user?.email || 'user@example.com',
      role: 'Utilisateur connecté',
      level: 1,
      totalXp: 0,
      tasksCompleted: 0,
      badges: [],
      avatar: user?.photoURL || '👤',
      isCurrentUser: true,
      streak: 0
    }
  ];

  // ✅ Obtenir la valeur selon l'onglet actif
  const getDisplayValue = (userData) => {
    switch (activeTab) {
      case 'xp':
        return `${userData.totalXp.toLocaleString()} XP`;
      case 'tasks':
        return `${userData.tasksCompleted} tâches`;
      case 'level':
        return `Niveau ${userData.level}`;
      default:
        return `${userData.totalXp.toLocaleString()} XP`;
    }
  };

  // ✅ Obtenir la couleur du rang
  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400'; // Or
    if (rank === 2) return 'text-gray-300';   // Argent
    if (rank === 3) return 'text-orange-400'; // Bronze
    return 'text-gray-400';
  };

  // ✅ Obtenir l'icône du rang
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <LoadingSpinner />
        <div className="ml-4 text-white">Chargement du classement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 Classement Équipe
          </h1>
          <p className="text-gray-400">
            Performance et achievements en temps réel
          </p>
        </div>

        {/* Onglets de catégories */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 border border-gray-700">
            {[
              { id: 'xp', label: '⭐ Points XP', icon: '⭐' },
              { id: 'tasks', label: '✅ Tâches', icon: '✅' },
              { id: 'level', label: '📈 Niveau', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium (Top 3) */}
        {leaderboardData.length >= 3 && (
          <div className="mb-8">
            <div className="flex justify-center items-end gap-4 mb-6">
              {/* 2ème place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-2xl mb-2">
                  {leaderboardData[1]?.avatar || '🥈'}
                </div>
                <div className="bg-gray-700 rounded-lg p-3 border-2 border-gray-500">
                  <div className="text-gray-300 font-medium">{leaderboardData[1]?.name}</div>
                  <div className="text-gray-400 text-sm">{getDisplayValue(leaderboardData[1])}</div>
                </div>
              </div>

              {/* 1ère place */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-3xl mb-2 border-4 border-yellow-300">
                  {leaderboardData[0]?.avatar || '🥇'}
                </div>
                <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4 border-2 border-yellow-400">
                  <div className="text-white font-bold">{leaderboardData[0]?.name}</div>
                  <div className="text-yellow-100 text-sm">{getDisplayValue(leaderboardData[0])}</div>
                </div>
              </div>

              {/* 3ème place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-2xl mb-2">
                  {leaderboardData[2]?.avatar || '🥉'}
                </div>
                <div className="bg-gray-700 rounded-lg p-3 border-2 border-orange-500">
                  <div className="text-orange-300 font-medium">{leaderboardData[2]?.name}</div>
                  <div className="text-gray-400 text-sm">{getDisplayValue(leaderboardData[2])}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste complète du classement */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              📊 Classement Complet
            </h2>
            <p className="text-gray-400 text-sm">
              {leaderboardData.length} participant{leaderboardData.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="divide-y divide-gray-700">
            {leaderboardData.map((userData) => (
              <div 
                key={userData.id} 
                className={`p-6 flex items-center justify-between transition-colors ${
                  userData.isCurrentUser 
                    ? 'bg-blue-900/20 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-700/50'
                } ${userData.isOutOfTop ? 'border-t-2 border-dashed border-gray-600' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rang */}
                  <div className={`text-2xl font-bold ${getRankColor(userData.rank)} min-w-[3rem]`}>
                    {getRankIcon(userData.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                      {userData.avatar}
                    </div>
                    {userData.isCurrentUser && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  
                  {/* Infos utilisateur */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${userData.isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                        {userData.name}
                      </span>
                      {userData.isCurrentUser && (
                        <span className="bg-blue-600 text-xs px-2 py-1 rounded-full text-white">
                          Vous
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">{userData.role}</div>
                    {userData.badges.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {userData.badges.slice(0, 3).map((badge, index) => (
                          <span key={index} className="text-xs">🏆</span>
                        ))}
                        {userData.badges.length > 3 && (
                          <span className="text-xs text-gray-500">+{userData.badges.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${userData.isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                    {getDisplayValue(userData)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Niveau {userData.level}
                  </div>
                  {userData.streak > 0 && (
                    <div className="text-orange-400 text-xs">
                      🔥 {userData.streak} jours
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {userData.isOutOfTop && (
            <div className="p-4 bg-gray-750 text-center text-gray-400 text-sm">
              ... autres participants ...
            </div>
          )}
        </div>

        {/* Message encourageant */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-2">
              🚀 Continuez vos efforts !
            </h3>
            <p className="text-blue-100 text-sm">
              Complétez des tâches, collaborez en équipe et montez dans le classement !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
