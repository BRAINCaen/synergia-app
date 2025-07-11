// ==========================================
// 📁 react-app/src/components/gamification/Leaderboard.jsx
// Classement avec VRAIES données Firebase - CONFLIT VARIABLE CORRIGÉ
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
          const userDocData = doc.data(); // 🔧 CORRECTION: Renommé userData en userDocData
          if (userDocData.email && userDocData.gamification) {
            realUsers.push({
              id: doc.id,
              rank: index + 1,
              name: userDocData.displayName || userDocData.email.split('@')[0],
              email: userDocData.email,
              role: userDocData.role || 'Membre',
              level: userDocData.gamification.level || 1,
              totalXp: userDocData.gamification.totalXp || 0,
              tasksCompleted: userDocData.gamification.tasksCompleted || 0,
              badges: userDocData.gamification.badges || [],
              avatar: userDocData.photoURL || getAvatarFromName(userDocData.displayName || userDocData.email),
              isCurrentUser: doc.id === user?.uid,
              streak: userDocData.gamification.loginStreak || 0,
              lastActivity: userDocData.lastActivity
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
  const getDisplayValue = (userInfo) => { // 🔧 CORRECTION: Renommé userData en userInfo
    switch (activeTab) {
      case 'xp':
        return `${userInfo.totalXp.toLocaleString()} XP`;
      case 'tasks':
        return `${userInfo.tasksCompleted} tâches`;
      case 'level':
        return `Niveau ${userInfo.level}`;
      default:
        return `${userInfo.totalXp.toLocaleString()} XP`;
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
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            📊 Statistiques {activeTab === 'xp' ? 'XP' : activeTab === 'tasks' ? 'Tâches' : 'Niveau'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {leaderboardData.length}
              </div>
              <div className="text-gray-400">Participant{leaderboardData.length > 1 ? 's' : ''}</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-700">
            {leaderboardData.map((userInfo) => ( // 🔧 CORRECTION: Renommé userData en userInfo
              <div 
                key={userInfo.id} 
                className={`p-6 flex items-center justify-between transition-colors ${
                  userInfo.isCurrentUser 
                    ? 'bg-blue-900/20 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-700/50'
                } ${userInfo.isOutOfTop ? 'border-t-2 border-dashed border-gray-600' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rang */}
                  <div className={`text-2xl font-bold ${getRankColor(userInfo.rank)} min-w-[3rem]`}>
                    {getRankIcon(userInfo.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                      {userInfo.avatar}
                    </div>
                    {userInfo.isCurrentUser && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  
                  {/* Infos utilisateur */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${userInfo.isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                        {userInfo.name}
                      </span>
                      {userInfo.isCurrentUser && (
                        <span className="bg-blue-600 text-xs px-2 py-1 rounded-full text-white">
                          Vous
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">{userInfo.role}</div>
                    {userInfo.badges.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {userInfo.badges.slice(0, 3).map((badge, index) => (
                          <span key={index} className="text-xs">🏆</span>
                        ))}
                        {userInfo.badges.length > 3 && (
                          <span className="text-xs text-gray-500">+{userInfo.badges.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${userInfo.isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                    {getDisplayValue(userInfo)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Niveau {userInfo.level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {leaderboardData.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-white mb-2">
              Aucun participant trouvé
            </h3>
            <p className="text-gray-400">
              Commencez à utiliser l'application pour apparaître dans le classement !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
