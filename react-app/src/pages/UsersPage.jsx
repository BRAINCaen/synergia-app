// src/pages/UsersPage.jsx
// Version debug pour tester la récupération des utilisateurs
import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Database } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);

  // Fonction pour charger directement depuis Firebase
  const loadUsersDirectly = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement direct des utilisateurs depuis Firebase...');
      
      // Récupérer tous les documents de la collection users
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      console.log(`📊 ${snapshot.docs.length} documents trouvés dans Firebase`);
      
      const allUsers = [];
      const allRawData = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        
        // Stocker les données brutes pour debug
        allRawData.push({
          id: doc.id,
          ...data
        });
        
        // Traiter les données pour l'affichage
        const processedUser = {
          id: doc.id,
          displayName: data.displayName || 'Utilisateur sans nom',
          email: data.email || 'Email non défini',
          photoURL: data.photoURL || null,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
          lastLoginAt: data.lastLoginAt?.toDate?.() || null,
          profile: data.profile || {},
          gamification: data.gamification || {}
        };
        
        allUsers.push(processedUser);
        
        console.log('👤 Utilisateur trouvé:', {
          id: doc.id,
          email: data.email,
          displayName: data.displayName,
          hasGamification: !!data.gamification,
          hasProfile: !!data.profile
        });
      });
      
      setUsers(allUsers);
      setRawData(allRawData);
      
      console.log('✅ Utilisateurs chargés avec succès:', allUsers.length);
      
    } catch (err) {
      console.error('❌ Erreur chargement utilisateurs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger au démarrage
  useEffect(() => {
    loadUsersDirectly();
  }, []);

  // Formater la date
  const formatDate = (date) => {
    if (!date) return 'Non défini';
    try {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Chargement des utilisateurs depuis Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadUsersDirectly}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              Debug - Utilisateurs Firebase
            </h1>
            <p className="text-gray-400 mt-1">
              {users.length} utilisateur{users.length !== 1 ? 's' : ''} trouvé{users.length !== 1 ? 's' : ''} dans Firebase
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadUsersDirectly}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recharger
            </button>
            <button
              onClick={() => console.log('📊 Données brutes:', rawData)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Debug Console
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              Utilisateurs détectés
            </h3>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-500 mb-6">
                  Vérifiez que des utilisateurs sont bien présents dans Firebase
                </p>
                <button
                  onClick={loadUsersDirectly}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Recharger depuis Firebase
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="bg-gray-700 rounded-lg p-6 border border-gray-600"
                  >
                    {/* En-tête utilisateur */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {user.displayName}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Informations de base */}
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-400">ID: </span>
                        <span className="text-gray-300 font-mono text-xs">{user.id}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Créé le: </span>
                        <span className="text-gray-300">{formatDate(user.createdAt)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Dernière connexion: </span>
                        <span className="text-gray-300">{formatDate(user.lastLoginAt)}</span>
                      </div>
                    </div>

                    {/* Données de gamification */}
                    <div className="border-t border-gray-600 pt-4">
                      <h5 className="text-sm font-medium text-white mb-2">Gamification</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Niveau: </span>
                          <span className="text-blue-400 font-medium">
                            {user.gamification?.level || 1}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">XP: </span>
                          <span className="text-yellow-400 font-medium">
                            {user.gamification?.totalXp || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Tâches: </span>
                          <span className="text-green-400 font-medium">
                            {user.gamification?.tasksCompleted || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Série: </span>
                          <span className="text-orange-400 font-medium">
                            {user.gamification?.loginStreak || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profil */}
                    {user.profile?.department && (
                      <div className="border-t border-gray-600 pt-4 mt-4">
                        <h5 className="text-sm font-medium text-white mb-2">Profil</h5>
                        <div className="text-sm">
                          <span className="text-gray-400">Département: </span>
                          <span className="text-purple-400">{user.profile.department}</span>
                        </div>
                      </div>
                    )}

                    {/* Bouton pour voir les données brutes */}
                    <button
                      onClick={() => {
                        console.log('📊 Données utilisateur:', user);
                        const rawUser = rawData?.find(r => r.id === user.id);
                        console.log('📊 Données brutes:', rawUser);
                      }}
                      className="w-full mt-4 px-3 py-2 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                    >
                      Debug dans Console
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informations de debug */}
        <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Informations de Debug</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Collection Firebase: </span>
              <span className="text-blue-400 font-mono">users</span>
            </div>
            <div>
              <span className="text-gray-400">Documents trouvés: </span>
              <span className="text-green-400 font-medium">{users.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Dernière mise à jour: </span>
              <span className="text-yellow-400">{new Date().toLocaleTimeString('fr-FR')}</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            💡 Ouvrez la console développeur (F12) et cliquez sur "Debug Console" pour voir les données brutes
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
