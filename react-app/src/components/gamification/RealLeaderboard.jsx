// ==========================================
// 📁 react-app/src/components/gamification/RealLeaderboard.jsx
// Classement Firebase temps réel - NOMS NETTOYÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../core/firebase';

const RealLeaderboard = ({ maxResults = 20 }) => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('totalXp');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Données simulées pour les départements
  const departments = [
    'all',
    'Développement',
    'Marketing', 
    'Commercial',
    'RH',
    'Finance',
    'Direction'
  ];

  const categories = [
    { value: 'totalXp', label: 'XP Total' },
    { value: 'weeklyXp', label: 'XP Semaine' },
    { value: 'monthlyXp', label: 'XP Mois' },
    { value: 'badges', label: 'Badges' },
    { value: 'tasksCompleted', label: 'Tâches' },
    { value: 'loginStreak', label: 'Connexions' }
  ];

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

  // Charger le leaderboard depuis Firebase
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!db) {
        console.log('🔧 Mode déconnecté');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Chargement RealLeaderboard avec nettoyage des noms...');

        // Construire la requête selon la catégorie
        let orderField = 'gamification.totalXp';
        if (categoryFilter === 'weeklyXp') orderField = 'gamification.weeklyXp';
        if (categoryFilter === 'monthlyXp') orderField = 'gamification.monthlyXp';
        if (categoryFilter === 'badges') orderField = 'gamification.badges';
        if (categoryFilter === 'tasksCompleted') orderField = 'gamification.tasksCompleted';
        if (categoryFilter === 'loginStreak') orderField = 'gamification.loginStreak';

        let leaderboardQuery = query(
          collection(db, 'users'),
          orderBy(orderField, 'desc'),
          limit(maxResults)
        );

        // Filtrer par département si nécessaire
        if (departmentFilter !== 'all') {
          leaderboardQuery = query(
            collection(db, 'users'),
            where('profile.department', '==', departmentFilter),
            orderBy(orderField, 'desc'),
            limit(maxResults)
          );
        }

        const snapshot = await getDocs(leaderboardQuery);
        const leaderboardData = [];

        snapshot.forEach((doc, index) => {
          const docData = doc.data();
          if (docData.email && docData.gamification) {
            // 🔧 CORRECTION: Utiliser la fonction de nettoyage
            const cleanedName = cleanDisplayName(docData);
            
            leaderboardData.push({
              uid: doc.id,
              rank: index + 1,
              displayName: cleanedName, // 🔧 NOM NETTOYÉ
              email: docData.email,
              photoURL: docData.photoURL,
              department: docData.profile?.department || 'Non défini',
              level: docData.gamification.level || 1,
              totalXp: docData.gamification.totalXp || 0,
              weeklyXp: docData.gamification.weeklyXp || 0,
              monthlyXp: docData.gamification.monthlyXp || 0,
              tasksCompleted: docData.gamification.tasksCompleted || 0,
              badges: (docData.gamification.badges || []).length,
              loginStreak: docData.gamification.loginStreak || 0
            });
          }
        });

        setLeaderboard(leaderboardData);
        console.log(`✅ RealLeaderboard chargé: ${leaderboardData.length} utilisateurs avec noms nettoyés`);

      } catch (error) {
        console.error('❌ Erreur chargement leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [categoryFilter, departmentFilter, maxResults]);

  // Obtenir la valeur d'affichage selon la catégorie
  const getDisplayValue = (userInfo) => {
    switch (categoryFilter) {
      case 'totalXp':
        return `${userInfo.totalXp.toLocaleString()} XP`;
      case 'weeklyXp':
        return `${userInfo.weeklyXp.toLocaleString()} XP`;
      case 'monthlyXp':
        return `${userInfo.monthlyXp.toLocaleString()} XP`;
      case 'tasksCompleted':
        return `${userInfo.tasksCompleted} tâches`;
      case 'badges':
        return `${userInfo.badges} badges`;
      case 'loginStreak':
        return `${userInfo.loginStreak} jours`;
      default:
        return `${userInfo.totalXp.toLocaleString()} XP`;
    }
  };

  // Obtenir l'icône du rang
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Chargement du classement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Département
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'Tous les départements' : dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="bg-gray-700 px-4 py-2 rounded-md border border-gray-600">
              <div className="text-lg font-bold text-white">
                {leaderboard.length}
              </div>
              <div className="text-sm text-gray-400">
                Participants
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste du classement */}
      <div className="space-y-2">
        {leaderboard.map((userInfo, index) => (
          <div
            key={userInfo.uid}
            className={`
              p-4 rounded-lg border transition-colors
              ${userInfo.uid === user?.uid 
                ? 'bg-blue-600/20 border-blue-500' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
              }
            `}
          >
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-8 text-center mr-4">
                <span className="text-lg font-bold text-gray-300">
                  {getRankIcon(userInfo.rank)}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-gray-600 mr-4 flex-shrink-0 flex items-center justify-center">
                {userInfo.photoURL ? (
                  <img
                    src={userInfo.photoURL}
                    alt={userInfo.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-white truncate">
{userInfo.displayName}
                    {userInfo.uid === user?.uid && (
                      <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                        Vous
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-sm text-gray-400">
                  {userInfo.department} • Niveau {userInfo.level}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-white">
                {getDisplayValue(userInfo)}
              </div>
              <div className="text-sm text-gray-400">
                {userInfo.badges} badges
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
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
  );
};

export default RealLeaderboard;
