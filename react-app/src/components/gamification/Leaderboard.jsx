// ==========================================
// 📁 react-app/src/components/gamification/Leaderboard.jsx
// Classement avec VRAIES données Firebase - IMPORTS CORRIGÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../core/firebase.js'; // 🔧 CORRECTION: Chemin absolu
import LoadingSpinner from '../ui/LoadingSpinner';

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('xp');
  const [timeFrame, setTimeFrame] = useState('all-time');

  // 🧹 FONCTION DE NETTOYAGE DES NOMS
  const cleanDisplayName = (userData) => {
    let cleanName = userData.displayName || userData.email;
    
    // Nettoyer les URLs Google
    if (cleanName.includes('googleusercontent.com')) {
      console.log('🧹 Nettoyage URL Google pour:', userData.email);
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
        console.log('🔍 Chargement classement avec nettoyage des noms...');

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
          const userDocData = doc.data();
          if (userDocData.email && userDocData.gamification) {
            // 🔧 CORRECTION: Utiliser la fonction de nettoyage
            const cleanedName = cleanDisplayName(userDocData);
            
            realUsers.push({
              id: doc.id,
              rank: index + 1,
              name: cleanedName, // 🔧 NOM NETTOYÉ
              email: userDocData.email,
              role: userDocData.profile?.role || 'Membre',
              level: userDocData.gamification.level || 1,
              totalXp: userDocData.gamification.totalXp || 0,
              tasksCompleted: userDocData.gamification.tasksCompleted || 0,
              badges: userDocData.gamification.badges || [],
              avatar: userDocData.photoURL || '👤',
              isCurrentUser: doc.id === user?.uid,
              streak: userDocData.gamification.loginStreak || 0,
              lastActivity: userDocData.gamification.lastLoginDate
            });
          }
        });

        // Ajouter l'utilisateur actuel s'il n'est pas dans le top
        if (user && !realUsers.find(u => u.id === user.uid)) {
          try {
            const currentUserQuery = query(
              collection(db, 'users'),
              where('email', '==', user.email),
              limit(1)
            );
            
            const currentUserSnapshot = await getDocs(currentUserQuery);
            
            if (!currentUserSnapshot.empty) {
              const currentUserDoc = currentUserSnapshot.docs[0];
              const currentUserData = currentUserDoc.data();
              const cleanedCurrentName = cleanDisplayName(currentUserData);
              
              realUsers.push({
                id: currentUserDoc.id,
                rank: realUsers.length + 1,
                name: cleanedCurrentName, // 🔧 NOM NETTOYÉ
                email: currentUserData.email,
                role: currentUserData.profile?.role || 'Membre',
                level: currentUserData.gamification?.level || 1,
                totalXp: currentUserData.gamification?.totalXp || 0,
                tasksCompleted: currentUserData.gamification?.tasksCompleted || 0,
                badges: currentUserData.gamification?.badges || [],
                avatar: currentUserData.photoURL || '👤',
                isCurrentUser: true,
                streak: currentUserData.gamification?.loginStreak || 0,
                lastActivity: currentUserData.gamification?.lastLoginDate,
                isOutOfTop: true
              });
            }
          } catch (error) {
            console.log('ℹ️ Utilisateur non trouvé dans classement');
          }
        }

        setLeaderboardData(realUsers);
        console.log('✅ Classement réel chargé:', realUsers.length, 'utilisateurs avec noms nettoyés');

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
  const getDisplayValue = (userInfo) => {
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
            📊 Statistiques {activeTab === 'xp' ? 'XP' : activeTab === 'tasks' ? 'Tâches' : 'Niveaux'}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {leaderboardData.length}
              </div>
              <div className="text-gray-400 text-sm">Participants</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {leaderboardData.reduce((sum, user) => sum + user.totalXp, 0).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">XP Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {leaderboardData.reduce((sum, user) => sum + user.tasksCompleted, 0)}
              </div>
              <div className="text-gray-400 text-sm">Tâches Complétées</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round(leaderboardData.reduce((sum, user) => sum + user.level, 0) / leaderboardData.length) || 1}
              </div>
              <div className="text-gray-400 text-sm">Niveau Moyen</div>
            </div>
          </div>
        </div>

        {/* Liste du classement */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              🏆 Top Performers - {activeTab === 'xp' ? 'Points XP' : activeTab === 'tasks' ? 'Tâches' : 'Niveaux'}
            </h3>
          </div>

          <div className="divide-y divide-gray-700">
            {leaderboardData.map((userInfo, index) => (
              <div
                key={userInfo.id}
                className={`p-4 hover:bg-gray-750 transition-colors ${
                  userInfo.isCurrentUser ? 'bg-blue-900/30 border-l-4 border-blue-500' : ''
                } ${userInfo.isOutOfTop ? 'border-t-2 border-orange-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  {/* Rang et utilisateur */}
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${getRankColor(userInfo.rank)}`}>
                      {getRankIcon(userInfo.rank)}
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {userInfo.avatar === '👤' ? 
                        userInfo.name.charAt(0).toUpperCase() : 
                        userInfo.avatar
                      }
                    </div>
                    
                    <div>
                      <span className={`font-semibold text-lg ${userInfo.isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
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
