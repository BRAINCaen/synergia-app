import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, ArrowLeft, RefreshCw, Plus, Edit, Trash2, BarChart3, Activity } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const AdminBadgesPage = () => {
  const { user } = useAuthStore();
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBadgeSelector, setShowBadgeSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    type: 'achievement',
    xpReward: 10,
    isActive: true
  });

  const loadData = async () => {
    console.log('🔄 Chargement des données...');
    setLoading(true);
    
    try {
      const badgesSnapshot = await getDocs(collection(db, 'badges'));
      const badgesList = [];
      badgesSnapshot.forEach((doc) => {
        badgesList.push({ id: doc.id, ...doc.data() });
      });
      setBadges(badgesList);
      console.log('✅ Badges chargés:', badgesList.length);

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = [];
      usersSnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
      console.log('✅ Utilisateurs chargés:', usersList.length);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur de chargement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    console.log('💾 Sauvegarde badge...');
    
    if (!badgeForm.name.trim()) {
      alert('Le nom est requis');
      return;
    }
    
    try {
      const badgeData = {
        ...badgeForm,
        updatedAt: new Date(),
        updatedBy: user.uid,
        ...(editingBadge ? {} : { 
          createdAt: new Date(),
          createdBy: user.uid,
          earnedCount: 0
        })
      };
      
      if (editingBadge) {
        await updateDoc(doc(db, 'badges', editingBadge.id), badgeData);
        alert('Badge modifié avec succès');
      } else {
        await addDoc(collection(db, 'badges'), badgeData);
        alert('Badge créé avec succès');
      }
      
      setBadgeForm({ name: '', description: '', icon: '🏆', type: 'achievement', xpReward: 10, isActive: true });
      setShowModal(false);
      setEditingBadge(null);
      await loadData();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleDelete = async (badgeId) => {
    if (!confirm('Supprimer ce badge ?')) return;
    
    console.log('🗑️ Suppression:', badgeId);
    
    try {
      await deleteDoc(doc(db, 'badges', badgeId));
      alert('Badge supprimé');
      await loadData();
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = (badge) => {
    console.log('✏️ Édition:', badge.name);
    setBadgeForm({
      name: badge.name || '',
      description: badge.description || '',
      icon: badge.icon || '🏆',
      type: badge.type || 'achievement',
      xpReward: badge.xpReward || 10,
      isActive: badge.isActive !== false
    });
    setEditingBadge(badge);
    setShowModal(true);
  };

  const handleCreate = () => {
    console.log('➕ Création');
    setBadgeForm({ name: '', description: '', icon: '🏆', type: 'achievement', xpReward: 10, isActive: true });
    setEditingBadge(null);
    setShowModal(true);
  };

  const handleAwardBadge = (userId, badgeId) => {
    const user = users.find(u => u.id === userId);
    const badge = badges.find(b => b.id === badgeId);
    
    if (user && badge) {
      console.log('✅ Attribution:', { user: user.email, badge: badge.name });
      alert(`Badge "${badge.name}" attribué à ${user.displayName || user.email} !`);
      
      // TODO: Ici vous pourriez ajouter la logique Firebase pour sauvegarder l'attribution
      // Par exemple : await addDoc(collection(db, 'user_badges'), { userId, badgeId, awardedAt: new Date() });
    }
    
    setShowBadgeSelector(false);
    setSelectedUser(null);
  };

  // Vérification admin
  if (user?.email !== 'alan.boehme61@gmail.com' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès Refusé</h3>
          <p className="text-gray-600 mb-4">Permissions insuffisantes</p>
          <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Retour</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec boutons */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-7 h-7 text-yellow-600" />
                Administration des Badges
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  console.log('🔄 Actualisation');
                  loadData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Créer Badge
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{badges.length}</div>
            <div className="text-sm text-gray-600">Total Badges</div>
          </div>
          <div className="bg-white rounded-lg border p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-600">Utilisateurs</div>
          </div>
          <div className="bg-white rounded-lg border p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{badges.filter(b => b.isActive !== false).length}</div>
            <div className="text-sm text-gray-600">Badges Actifs</div>
          </div>
          <div className="bg-white rounded-lg border p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {badges.length > 0 ? Math.round(badges.reduce((sum, b) => sum + (b.xpReward || 0), 0) / badges.length) : 0}
            </div>
            <div className="text-sm text-gray-600">XP Moyen</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg border mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'badges' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Badges ({badges.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Utilisateurs ({users.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Badges Récents
                    </h3>
                    <div className="space-y-3">
                      {badges.slice(0, 5).map((badge) => (
                        <div key={badge.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <div className="text-2xl">{badge.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{badge.name}</p>
                            <p className="text-sm text-gray-600">{badge.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Actions Rapides
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleCreate}
                        className="w-full p-3 bg-white rounded-lg border hover:bg-blue-50 text-left"
                      >
                        <Plus className="w-5 h-5 inline mr-2 text-blue-600" />
                        Créer un badge
                      </button>
                      <button
                        onClick={() => loadData()}
                        className="w-full p-3 bg-white rounded-lg border hover:bg-green-50 text-left"
                      >
                        <RefreshCw className="w-5 h-5 inline mr-2 text-green-600" />
                        Actualiser les données
                      </button>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="w-full p-3 bg-white rounded-lg border hover:bg-purple-50 text-left"
                      >
                        <Users className="w-5 h-5 inline mr-2 text-purple-600" />
                        Gérer les utilisateurs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gestion badges */}
            {activeTab === 'badges' && (
              <div>
                {badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((badge) => (
                      <div key={badge.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{badge.icon}</div>
                            <div>
                              <h4 className="font-medium text-gray-900">{badge.name}</h4>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{badge.type}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(badge)} className="text-green-600 hover:text-green-700">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(badge.id)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{badge.xpReward} XP</span>
                          <span className={`${badge.isActive !== false ? 'text-green-600' : 'text-red-600'}`}>
                            {badge.isActive !== false ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge</h3>
                    <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      Créer le premier badge
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Gestion utilisateurs */}
            {activeTab === 'users' && (
              <div>
                {users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((userData) => (
                      <div key={userData.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {userData.displayName || userData.email || 'Utilisateur'}
                            </h4>
                            <p className="text-sm text-gray-600">{userData.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rôle:</span>
                            <span className={userData.role === 'admin' ? 'text-red-600' : 'text-gray-900'}>
                              {userData.role === 'admin' ? '👑 Admin' : '👤 Utilisateur'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">XP:</span>
                            <span className="font-medium">{userData.totalXP || 0}</span>
                          </div>
                        </div>
                        
                        {/* BOUTONS D'ATTRIBUTION */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              console.log('👁️ Voir profil:', userData.email);
                              alert('Profil de ' + (userData.displayName || userData.email));
                            }}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Voir Profil
                          </button>
                          <button
                            onClick={() => {
                              console.log('🏆 Attribuer badge à:', userData.email);
                              
                              if (badges.length === 0) {
                                alert('Aucun badge disponible. Créez d\'abord un badge !');
                                return;
                              }
                              
                              setSelectedUser(userData);
                              setShowBadgeSelector(true);
                            }}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-2"
                          >
                            <Trophy className="w-4 h-4" />
                            Attribuer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de sélection de badge */}
      {showBadgeSelector && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attribuer un badge à {selectedUser.displayName || selectedUser.email}
            </h3>
            
            <div className="space-y-3 mb-6">
              {badges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => handleAwardBadge(selectedUser.id, badge.id)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left flex items-center gap-3"
                >
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{badge.name}</h4>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{badge.type}</span>
                      <span className="text-xs text-gray-500">{badge.xpReward} XP</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('❌ Annulation attribution');
                  setShowBadgeSelector(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal simple */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingBadge ? 'Modifier le Badge' : 'Créer un Badge'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={badgeForm.name}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Nom du badge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={badgeForm.description}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Description du badge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                <div className="grid grid-cols-8 gap-2">
                  {['🏆', '⭐', '🎖️', '👑', '💎', '🔥', '⚡', '🎯'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setBadgeForm(prev => ({ ...prev, icon }))}
                      className={`text-2xl p-2 rounded border-2 ${
                        badgeForm.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={badgeForm.type}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="achievement">Accomplissement</option>
                  <option value="skill">Compétence</option>
                  <option value="milestone">Étape</option>
                  <option value="special">Spécial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Récompense XP</label>
                <input
                  type="number"
                  value={badgeForm.xpReward}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={badgeForm.isActive}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Badge actif</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  console.log('❌ Fermeture modal');
                  setShowModal(false);
                  setEditingBadge(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingBadge ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadgesPage;
