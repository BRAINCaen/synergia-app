import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, ArrowLeft, RefreshCw, Plus, Edit, Trash2, BarChart3, Activity } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { adminBadgeService } from '../core/services/adminBadgeService.js';

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
  const [awarding, setAwarding] = useState(false);
  
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

  // 🔧 FONCTION CORRIGÉE - Attribution badge avec Firebase
  const handleAwardBadge = async (userId, badgeId) => {
    const targetUser = users.find(u => u.id === userId);
    const badge = badges.find(b => b.id === badgeId);
    
    if (!targetUser || !badge) {
      alert('Utilisateur ou badge non trouvé');
      return;
    }

    setAwarding(true);
    
    try {
      console.log('🏆 Attribution badge:', { 
        userId: targetUser.id, 
        userEmail: targetUser.email, 
        badgeId: badge.id,
        badgeName: badge.name 
      });

      // Utiliser le service adminBadgeService pour attribuer le badge
      const result = await adminBadgeService.awardBadgeToUser(
        targetUser.id, 
        badge.id, 
        `Badge "${badge.name}" attribué par admin`
      );

      if (result.success) {
        alert(`✅ Badge "${badge.name}" attribué avec succès à ${targetUser.displayName || targetUser.email}!`);
        
        // Recharger les données pour voir les changements
        await loadData();
        
        console.log('✅ Attribution réussie:', result);
      } else {
        alert('❌ Erreur: ' + (result.message || 'Impossible d\'attribuer le badge'));
        console.error('❌ Échec attribution:', result);
      }
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      alert('❌ Erreur lors de l\'attribution: ' + error.message);
    } finally {
      setAwarding(false);
      setShowBadgeSelector(false);
      setSelectedUser(null);
    }
  };

  // Vérification admin
  if (user?.email !== 'alan.boehme61@gmail.com' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès Restreint</h2>
            <p className="text-gray-600 mb-6">
              Vous devez être administrateur pour accéder à cette page.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <Trophy className="h-8 w-8 text-yellow-500 ml-4 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Administration des Badges</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer Badge
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Badges</p>
                <p className="text-2xl font-bold text-gray-900">{badges.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{badges.filter(b => b.isActive).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">XP Moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {badges.length > 0 ? Math.round(badges.reduce((sum, b) => sum + (b.xpReward || 0), 0) / badges.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'badges'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Badges ({badges.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Utilisateurs ({users.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Vue d'ensemble</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Badges récents</h4>
                    {badges.slice(0, 5).map((badge) => (
                      <div key={badge.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl mr-3">{badge.icon}</div>
                        <div>
                          <p className="font-medium text-gray-900">{badge.name}</p>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Utilisateurs actifs</h4>
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                          {(user.displayName || user.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.displayName || user.email}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Gestion des Badges</h3>
                  <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Badge
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => (
                    <div key={badge.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-3xl">{badge.icon}</div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(badge)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(badge.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{badge.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          badge.type === 'achievement' ? 'bg-blue-100 text-blue-800' :
                          badge.type === 'progress' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {badge.type}
                        </span>
                        <span className="text-gray-500">{badge.xpReward} XP</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          badge.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {badge.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Utilisateurs ({users.length})</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-4">
                          {(user.displayName || user.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.displayName || 'Utilisateur'}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="text-gray-500">Rôle:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role || 'Utilisateur'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="text-gray-500">XP:</span>
                        <span className="font-medium text-gray-900">{user.xp || 0}</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBadgeSelector(true);
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Voir Profil
                      </button>
                    </div>
                  ))}
                </div>
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
                  disabled={awarding}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={awarding}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={badgeForm.name}
                  onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom du badge"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={badgeForm.description}
                  onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description du badge"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
                <input
                  type="text"
                  value={badgeForm.icon}
                  onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="🏆"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={badgeForm.type}
                  onChange={(e) => setBadgeForm({...badgeForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="achievement">Achievement</option>
                  <option value="progress">Progress</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Récompense XP</label>
                <input
                  type="number"
                  value={badgeForm.xpReward}
                  onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={badgeForm.isActive}
                  onChange={(e) => setBadgeForm({...badgeForm, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Badge actif</label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
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

      {/* Indicateur de chargement global */}
      {awarding && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-700">Attribution du badge en cours...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadgesPage;
