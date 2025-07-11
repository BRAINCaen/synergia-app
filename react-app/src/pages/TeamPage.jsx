// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// VERSION COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS - SPARKLES CORRIGÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Award, 
  BarChart3, 
  Settings,
  RefreshCw,
  Filter,
  UserPlus,
  Star, // ✅ Remplace Sparkles par Star
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Shield,
  TrendingUp,
  AlertCircle,
  Eye,
  Plus,
  Edit,
  Trash2,
  Crown,
  Target,
  Zap
} from 'lucide-react';

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// 🎭 RÔLES SYNERGIA COMPLETS - VERSION SANS DOUBLONS
const SYNERGIA_ROLES = {
  direction: {
    id: 'direction',
    name: 'Direction & Management',
    icon: '👑',
    color: 'bg-yellow-500',
    description: 'Direction générale et prise de décisions stratégiques',
    difficulty: 'Expert',
    permissions: ['all_access', 'manage_team', 'financial_access']
  },
  commercial: {
    id: 'commercial',
    name: 'Commercial & Vente',
    icon: '💰',
    color: 'bg-emerald-500',
    description: 'Développement commercial et relation client',
    difficulty: 'Moyen',
    permissions: ['sales_access', 'client_management', 'crm_access']
  },
  finance: {
    id: 'finance',
    name: 'Finance & Comptabilité',
    icon: '📊',
    color: 'bg-blue-500',
    description: 'Gestion financière et comptabilité',
    difficulty: 'Avancé',
    permissions: ['finance_access', 'accounting', 'budget_management']
  },
  rh: {
    id: 'rh',
    name: 'Ressources Humaines',
    icon: '👥',
    color: 'bg-orange-500',
    description: 'Gestion RH et recrutement',
    difficulty: 'Avancé',
    permissions: ['hr_access', 'recruitment', 'employee_management']
  },
  maintenance: {
    id: 'maintenance',
    name: 'Technique & Maintenance',
    icon: '🔧',
    color: 'bg-gray-500',
    description: 'Support technique, maintenance et réparations',
    difficulty: 'Moyen',
    permissions: ['technical_access', 'maintenance', 'repair_management', 'system_access']
  },
  formation: {
    id: 'formation',
    name: 'Formation & Développement',
    icon: '📚',
    color: 'bg-purple-500',
    description: 'Formation des équipes et développement des compétences',
    difficulty: 'Avancé',
    permissions: ['training_access', 'skill_development', 'course_management']
  },
  innovation: {
    id: 'innovation',
    name: 'Innovation & R&D',
    icon: '🚀',
    color: 'bg-pink-500',
    description: 'Recherche, innovation et développement de nouveaux produits',
    difficulty: 'Expert',
    permissions: ['research_access', 'innovation_management', 'prototype_development']
  },
  logistique: {
    id: 'logistique',
    name: 'Logistique & Supply Chain',
    icon: '📦',
    color: 'bg-indigo-500',
    description: 'Gestion logistique et chaîne d\'approvisionnement',
    difficulty: 'Moyen',
    permissions: ['logistics_access', 'supply_management', 'inventory_control']
  }
};

/**
 * 🏢 COMPOSANT PRINCIPAL - PAGE ÉQUIPE
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    email: '',
    role: 'commercial',
    department: ''
  });

  // 📊 États pour les statistiques
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byRole: {},
    avgLevel: 0,
    totalXP: 0
  });

  // 🔄 Chargement des membres d'équipe
  useEffect(() => {
    loadTeamMembers();
  }, []);

  /**
   * 📥 CHARGEMENT DES MEMBRES
   */
  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des membres d\'équipe...');

      // Récupérer tous les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const teamData = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Enrichir avec les données de gamification
        let gamificationData = {};
        try {
          const gamificationDoc = await getDoc(doc(db, 'gamification', userId));
          if (gamificationDoc.exists()) {
            gamificationData = gamificationDoc.data();
          }
        } catch (error) {
          console.warn(`⚠️ Pas de données de gamification pour ${userId}`);
        }

        teamData.push({
          id: userId,
          ...userData,
          gamification: gamificationData,
          isOnline: userData.lastActive && 
            (new Date() - userData.lastActive.toDate()) < 15 * 60 * 1000, // 15 minutes
          role: userData.synergiaRole || 'commercial',
          level: gamificationData.level || 1,
          totalXP: gamificationData.totalXp || 0,
          badges: gamificationData.badges || []
        });
      }

      setMembers(teamData);
      calculateStats(teamData);
      console.log(`✅ ${teamData.length} membres chargés`);

    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 CALCUL DES STATISTIQUES
   */
  const calculateStats = (teamData) => {
    const stats = {
      total: teamData.length,
      active: teamData.filter(m => m.isOnline).length,
      byRole: {},
      avgLevel: 0,
      totalXP: 0
    };

    // Statistiques par rôle
    teamData.forEach(member => {
      const role = member.role || 'commercial';
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      stats.totalXP += member.totalXP || 0;
    });

    // Niveau moyen
    if (teamData.length > 0) {
      const totalLevels = teamData.reduce((sum, member) => sum + (member.level || 1), 0);
      stats.avgLevel = Math.round(totalLevels / teamData.length * 10) / 10;
    }

    setStats(stats);
  };

  /**
   * 🔍 FILTRAGE DES MEMBRES
   */
  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchTerm || 
      member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  /**
   * ➕ AJOUT D'UN NOUVEAU MEMBRE
   */
  const handleAddMember = async () => {
    try {
      if (!newMemberData.email) {
        alert('L\'email est obligatoire');
        return;
      }

      console.log('➕ Ajout membre:', newMemberData);

      // Créer le document utilisateur
      const userRef = doc(db, 'users', newMemberData.email.replace('@', '_at_'));
      await setDoc(userRef, {
        email: newMemberData.email,
        synergiaRole: newMemberData.role,
        department: newMemberData.department,
        createdAt: serverTimestamp(),
        isTeamMember: true,
        status: 'invited'
      });

      // Initialiser les données de gamification
      const gamificationRef = doc(db, 'gamification', userRef.id);
      await setDoc(gamificationRef, {
        userId: userRef.id,
        level: 1,
        totalXp: 0,
        badges: [],
        currentRole: newMemberData.role,
        joinedAt: serverTimestamp()
      });

      alert('✅ Membre ajouté avec succès!');
      setShowAddMember(false);
      setNewMemberData({ email: '', role: 'commercial', department: '' });
      loadTeamMembers(); // Recharger

    } catch (error) {
      console.error('❌ Erreur ajout membre:', error);
      alert('Erreur lors de l\'ajout: ' + error.message);
    }
  };

  /**
   * ✏️ MODIFICATION D'UN MEMBRE
   */
  const handleUpdateMember = async (memberId, updates) => {
    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Membre mis à jour:', memberId);
      loadTeamMembers(); // Recharger

    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      alert('Erreur lors de la mise à jour: ' + error.message);
    }
  };

  /**
   * 🎨 RENDU DE LA CARTE MEMBRE
   */
  const renderMemberCard = (member) => {
    const role = SYNERGIA_ROLES[member.role] || SYNERGIA_ROLES.commercial;
    
    return (
      <div key={member.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all">
        {/* Header avec avatar et statut */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {member.displayName?.[0] || member.email?.[0] || '?'}
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {member.displayName || member.email}
              </h3>
              <p className="text-gray-400 text-sm flex items-center">
                <span className="mr-2">{role.icon}</span>
                {role.name}
              </p>
            </div>
          </div>
          
          {/* Statut en ligne */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
            member.isOnline 
              ? 'bg-green-900/20 text-green-400 border border-green-500/20' 
              : 'bg-gray-700 text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
            {member.isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
        </div>

        {/* Statistiques de progression */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">{member.level || 1}</div>
            <div className="text-xs text-gray-400">Niveau</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">{member.totalXP || 0}</div>
            <div className="text-xs text-gray-400">XP Total</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">{member.badges?.length || 0}</div>
            <div className="text-xs text-gray-400">Badges</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progression actuelle</span>
            <span>{Math.min(100, ((member.totalXP || 0) % 1000) / 10)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, ((member.totalXP || 0) % 1000) / 10)}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              onClick={() => {/* Voir profil */}}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              title="Voir le profil"
            >
              <Eye size={16} className="text-white" />
            </button>
            <button 
              onClick={() => {/* Modifier */}}
              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit size={16} className="text-white" />
            </button>
          </div>
          
          {member.lastActive && (
            <div className="text-xs text-gray-400">
              Actif {new Date(member.lastActive.toDate()).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 🔄 Affichage du chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de l'équipe...</p>
          <p className="text-gray-400 text-sm">Récupération des données membres</p>
        </div>
      </div>
    );
  }

  // ❌ Affichage d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-red-300 font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-red-200 text-sm mb-4">{error}</p>
          <button 
            onClick={loadTeamMembers}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header avec titre et statistiques */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Users className="w-10 h-10 text-blue-400" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Gestion d'Équipe
                </h1>
                <p className="text-gray-400 mt-2">
                  Gérez votre équipe et suivez les performances
                </p>
              </div>
            </div>
            
            {/* Actions principales */}
            <div className="flex space-x-3">
              <button 
                onClick={loadTeamMembers}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                <span>Actualiser</span>
              </button>
              <button 
                onClick={() => setShowAddMember(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {/* Statistiques en header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-gray-400">Total membres</div>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                  <div className="text-sm text-gray-400">En ligne</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{stats.avgLevel}</div>
                  <div className="text-sm text-gray-400">Niveau moyen</div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.totalXP.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">XP Total</div>
                </div>
                <Star className="w-8 h-8 text-yellow-400" /> {/* ✅ Remplace Sparkles par Star */}
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {/* Filtre par rôle */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg text-white px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tous les rôles</option>
              {Object.values(SYNERGIA_ROLES).map(role => (
                <option key={role.id} value={role.id}>
                  {role.icon} {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille des membres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(renderMemberCard)}
        </div>

        {/* Message si aucun membre */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Aucun membre trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedRole !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter des membres à votre équipe'
              }
            </p>
          </div>
        )}

        {/* Modal d'ajout de membre */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">
                Ajouter un nouveau membre
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newMemberData.email}
                    onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="membre@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Rôle
                  </label>
                  <select
                    value={newMemberData.role}
                    onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    {Object.values(SYNERGIA_ROLES).map(role => (
                      <option key={role.id} value={role.id}>
                        {role.icon} {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Département
                  </label>
                  <input
                    type="text"
                    value={newMemberData.department}
                    onChange={(e) => setNewMemberData({...newMemberData, department: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ex: Développement, Marketing..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
