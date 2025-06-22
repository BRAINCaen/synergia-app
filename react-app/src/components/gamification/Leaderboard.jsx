// ===================================================================
// 📊 LEADERBOARD AVEC DONNÉES FIREBASE RÉELLES
// Fichier: react-app/src/components/gamification/Leaderboard.jsx
// ===================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  where 
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('totalXp');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Charger les données depuis Firebase
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Construire la requête Firebase
      let q = query(
        collection(db, 'users'),
        orderBy(`gamification.${categoryFilter}`, 'desc'),
        limit(50)
      );

      // Filtrer par département si nécessaire
      if (departmentFilter !== 'all') {
        q = query(
          collection(db, 'users'),
          where('profile.department', '==', departmentFilter),
          orderBy(`gamification.${categoryFilter}`, 'desc'),
          limit(50)
        );
      }

      // Écouter les changements en temps réel
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = [];
        snapshot.forEach((doc, index) => {
          const userData = doc.data();
          
          // Calculer la valeur selon le filtre temporel
          let displayValue = userData.gamification?.[categoryFilter] || 0;
          
          if (timeFilter === 'week') {
            displayValue = userData.gamification?.weeklyXp || 0;
          } else if (timeFilter === 'month') {
            displayValue = userData.gamification?.monthlyXp || 0;
          }

          users.push({
            rank: index + 1,
            uid: doc.id,
            displayName: userData.displayName || 'Utilisateur',
            email: userData.email,
            photoURL: userData.photoURL,
            department: userData.profile?.department || 'Non défini',
            totalXp: userData.gamification?.totalXp || 0,
            weeklyXp: userData.gamification?.weeklyXp || 0,
            monthlyXp: userData.gamification?.monthlyXp || 0,
            level: userData.gamification?.level || 1,
            badges: userData.gamification?.badges?.length || 0,
            tasksCompleted: userData.gamification?.tasksCompleted || 0,
            loginStreak: userData.gamification?.loginStreak || 0,
            displayValue,
            lastLoginAt: userData.lastLoginAt
          });
        });

        console.log(`📊 Leaderboard mis à jour: ${users.length} utilisateurs réels`);
        setLeaderboard(users);
        setLoading(false);
      }, (err) => {
        console.error('❌ Erreur chargement leaderboard:', err);
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('❌ Erreur configuration leaderboard:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [user, categoryFilter, departmentFilter, timeFilter]);

  // Obtenir la valeur affichée selon le filtre
  const getDisplayValue = (userData) => {
    switch (categoryFilter) {
      case 'weeklyXp':
        return `${userData.weeklyXp} XP`;
      case 'monthlyXp':
        return `${userData.monthlyXp} XP`;
      case 'badges':
        return `${userData.badges} badges`;
      case 'tasksCompleted':
        return `${userData.tasksCompleted} tâches`;
      case 'loginStreak':
        return `${userData.loginStreak} jours`;
      default:
        return `${userData.totalXp} XP`;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500';
      case 2: return 'bg-gradient-to-br from-gray-400/20 to-gray-500/20 border-gray-400';
      case 3: return 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500';
      default: return 'bg-gray-800 border-gray-700';
    }
  };

  const timeOptions = [
    { value: 'all', label: 'Tout temps' },
    { value: 'month', label: 'Ce mois' },
    { value: 'week', label: 'Cette semaine' }
  ];

  const categoryOptions = [
    { value: 'totalXp', label: 'Points d\'expérience' },
    { value: 'badges', label: 'Badges' },
    { value: 'tasksCompleted', label: 'Tâches terminées' },
    { value: 'loginStreak', label: 'Jours streak' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'Tous les départements' },
    { value: 'Développement', label: 'Développement' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'RH', label: 'Ressources Humaines' }
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-64"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-gray-700 rounded"></div>
              ))}
            </div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="bg-red-600/20 border border-red-500 rounded-lg p-4 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-white mb-2">
              Erreur de chargement
            </h3>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Réessayer
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              🏆 Classement Synergia
            </h1>
            <p className="text-gray-400 mt-1">
              Découvrez les top performers de l'équipe ({leaderboard.length} participants)
            </p>
          </div>
          
          <Link
            to="/profile"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>⚡</span>
            <span>Mes Badges</span>
          </Link>
        </div>

        {/* Filtres */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Période
              </label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                {timeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Classé par
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                {departmentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Podium Top 3 */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((userData) => (
              <div
                key={userData.uid}
                className={`
                  text-center p-6 rounded-xl border-2 relative overflow-hidden
                  ${getRankStyle(userData.rank)}
                  hover:scale-105 transition-transform duration-200
                `}
              >
                <div className="text-4xl mb-3">{getRankIcon(userData.rank)}</div>
                
                <div className="w-20 h-20 rounded-full bg-gray-600 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {userData.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                
                <h3 className="font-bold text-white text-lg mb-1 truncate">
                  {userData.displayName}
                  {userData.uid === user?.uid && (
                    <span className="block text-xs bg-blue-600 px-2 py-1 rounded mt-1">
                      C'est vous !
                    </span>
                  )}
                </h3>
                
                <p className="text-sm text-gray-400 mb-3">{userData.department}</p>
                
                <div className="space-y-1">
                  <p className="font-bold text-2xl text-white">
                    {getDisplayValue(userData)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Niveau {userData.level} • {userData.badges} badges
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Classement complet */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              Classement complet
            </h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {leaderboard.map((userData) => (
              <div
                key={userData.uid}
                className={`
                  flex items-center p-4 transition-colors
                  ${userData.uid === user?.uid 
                    ? 'bg-blue-600/10 border-l-4 border-l-blue-500' 
                    : 'hover:bg-gray-750'
                  }
                `}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-12 text-center mr-4">
                    <span className="text-xl font-bold text-gray-300">
                      {getRankIcon(userData.rank)}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gray-600 mr-4 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {userData.photoURL ? (
                      <img
                        src={userData.photoURL}
                        alt={userData.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-white truncate">
                        {userData.displayName}
                        {userData.uid === user?.uid && (
                          <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                            Vous
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {userData.department} • Niveau {userData.level}
                    </p>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="font-bold text-lg text-white">
                    {getDisplayValue(userData)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {userData.badges} badges
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* État vide */}
        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-white mb-2">
              Aucun participant trouvé
            </h3>
            <p className="text-gray-400 mb-6">
              Commencez à utiliser l'application pour apparaître dans le classement !
            </p>
            <Link
              to="/tasks"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
            >
              <span>🎯</span>
              <span>Créer ma première tâche</span>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Leaderboard;
