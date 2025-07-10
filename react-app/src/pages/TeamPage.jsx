// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// CORRECTION IMPORT/EXPORT - VERSION STABLE
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
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Shield,
  TrendingUp,
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';

// ✅ Imports Firebase directs pour éviter les erreurs
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// Rôles Synergia (données locales)
const SYNERGIA_ROLES = {
  direction: {
    id: 'direction',
    name: 'Direction & Management',
    icon: '👑',
    color: 'bg-yellow-500',
    description: 'Direction générale et prise de décisions stratégiques',
    difficulty: 'Expert',
    permissions: ['all_access']
  },
  commercial: {
    id: 'commercial',
    name: 'Commercial & Vente',
    icon: '💰',
    color: 'bg-emerald-500',
    description: 'Développement commercial et relation client',
    difficulty: 'Moyen',
    permissions: ['sales_access', 'client_management']
  },
  finance: {
    id: 'finance',
    name: 'Finance & Comptabilité',
    icon: '📊',
    color: 'bg-blue-500',
    description: 'Gestion financière et comptabilité',
    difficulty: 'Avancé',
    permissions: ['finance_access', 'accounting']
  },
  rh: {
    id: 'rh',
    name: 'Ressources Humaines',
    icon: '👥',
    color: 'bg-orange-500',
    description: 'Gestion RH et recrutement',
    difficulty: 'Avancé',
    permissions: ['hr_access', 'recruitment']
  },
  technique: {
    id: 'technique',
    name: 'Technique & Maintenance',
    icon: '🔧',
    color: 'bg-gray-500',
    description: 'Support technique et maintenance',
    difficulty: 'Moyen',
    permissions: ['technical_access', 'maintenance']
  },
  logistique: {
    id: 'logistique',
    name: 'Logistique & Stock',
    icon: '📦',
    color: 'bg-teal-500',
    description: 'Gestion logistique et stocks',
    difficulty: 'Facile',
    permissions: ['inventory_management', 'stock_access']
  }
};

/**
 * 🏠 COMPOSANT PAGE ÉQUIPE - VERSION STABLE
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  
  // États locaux
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedMember, setSelectedMember] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * 🔄 RÉCUPÉRATION DIRECTE DEPUIS FIREBASE
   * Solution temporaire pour éviter les erreurs d'import
   */
  const loadAllMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement direct depuis Firebase...');
      
      const membersMap = new Map();
      
      // 1️⃣ Récupérer depuis la collection USERS
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        let usersCount = 0;
        
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.email) {
            const member = {
              id: doc.id,
              email: userData.email,
              displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
              photoURL: userData.photoURL || null,
              role: userData.role || 'Membre',
              department: userData.department || 'Non spécifié',
              isActive: userData.isActive !== false,
              level: userData.level || 1,
              xp: userData.totalXp || 0,
              tasksCompleted: 0,
              projects: [],
              lastActivity: userData.lastActivity || userData.createdAt,
              joinedAt: userData.createdAt,
              source: 'users',
              status: 'active'
            };
            membersMap.set(doc.id, member);
            usersCount++;
          }
        });
        
        console.log(`✅ Users: ${usersCount} membres ajoutés`);
        
      } catch (userError) {
        console.warn('⚠️ Erreur chargement users:', userError);
      }

      // 2️⃣ Enrichir depuis USERSTATS
      try {
        const statsSnapshot = await getDocs(collection(db, 'userStats'));
        let statsCount = 0;
        
        statsSnapshot.forEach((doc) => {
          const statsData = doc.data();
          const existingMember = membersMap.get(doc.id);
          
          if (existingMember && statsData.email) {
            // Enrichir membre existant
            existingMember.level = Math.max(existingMember.level, statsData.level || 1);
            existingMember.xp = Math.max(existingMember.xp, statsData.totalXp || 0);
            existingMember.tasksCompleted = statsData.tasksCompleted || 0;
            existingMember.tasksCreated = statsData.tasksCreated || 0;
            existingMember.projectsCreated = statsData.projectsCreated || 0;
            existingMember.badges = statsData.badges || [];
            
            if (statsData.lastLoginDate) {
              existingMember.lastActivity = statsData.lastLoginDate;
            }
            statsCount++;
          } else if (statsData.email && !existingMember) {
            // Créer nouveau membre depuis stats
            const member = {
              id: doc.id,
              email: statsData.email,
              displayName: statsData.displayName || statsData.email?.split('@')[0] || 'Utilisateur',
              photoURL: null,
              role: 'Membre',
              department: 'Non spécifié',
              isActive: true,
              level: statsData.level || 1,
              xp: statsData.totalXp || 0,
              tasksCompleted: statsData.tasksCompleted || 0,
              tasksCreated: statsData.tasksCreated || 0,
              projectsCreated: statsData.projectsCreated || 0,
              badges: statsData.badges || [],
              projects: [],
              lastActivity: statsData.lastLoginDate || statsData.updatedAt,
              joinedAt: statsData.createdAt,
              source: 'userStats',
              status: 'active'
            };
            membersMap.set(doc.id, member);
            statsCount++;
          }
        });
        
        console.log(`✅ UserStats: ${statsCount} membres enrichis/ajoutés`);
        
      } catch (statsError) {
        console.warn('⚠️ Erreur chargement userStats:', statsError);
      }

      // 3️⃣ Enrichir depuis TEAMMEMBERS
      try {
        const teamSnapshot = await getDocs(collection(db, 'teamMembers'));
        let teamCount = 0;
        
        teamSnapshot.forEach((doc) => {
          const teamData = doc.data();
          const existingMember = membersMap.get(doc.id);
          
          if (existingMember) {
            // Enrichir membre existant
            if (teamData.synergiaRoles) {
              existingMember.synergiaRoles = teamData.synergiaRoles;
            }
            if (teamData.department) {
              existingMember.department = teamData.department;
            }
            if (teamData.status) {
              existingMember.isActive = teamData.status !== 'inactive';
              existingMember.status = teamData.status;
            }
            teamCount++;
          } else if (teamData.email || teamData.displayName) {
            // Créer membre depuis données équipe
            const member = {
              id: doc.id,
              email: teamData.email || 'email@inconnu.com',
              displayName: teamData.displayName || 'Utilisateur',
              photoURL: teamData.photoURL || null,
              role: teamData.role || 'Membre',
              department: teamData.department || 'Non spécifié',
              isActive: teamData.status !== 'inactive',
              level: teamData.teamStats?.level || 1,
              xp: teamData.teamStats?.totalXp || 0,
              tasksCompleted: teamData.teamStats?.tasksCompleted || 0,
              synergiaRoles: teamData.synergiaRoles || [],
              projects: [],
              lastActivity: teamData.updatedAt,
              joinedAt: teamData.createdAt,
              source: 'teamMembers',
              status: teamData.status || 'active'
            };
            membersMap.set(doc.id, member);
            teamCount++;
          }
        });
        
        console.log(`✅ TeamMembers: ${teamCount} membres enrichis/ajoutés`);
        
      } catch (teamError) {
        console.warn('⚠️ Erreur chargement teamMembers:', teamError);
      }

      // 4️⃣ Ajouter membres depuis PROJETS
      try {
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        let projectMembersCount = 0;
        
        projectsSnapshot.forEach((doc) => {
          const projectData = doc.data();
          
          if (projectData.team && Array.isArray(projectData.team)) {
            projectData.team.forEach((teamMember) => {
              if (teamMember.userId) {
                const existingMember = membersMap.get(teamMember.userId);
                
                if (existingMember) {
                  // Ajouter info projet
                  if (!existingMember.projects) existingMember.projects = [];
                  existingMember.projects.push({
                    id: doc.id,
                    title: projectData.title,
                    role: teamMember.role
                  });
                } else {
                  // Créer membre minimal depuis projet
                  const member = {
                    id: teamMember.userId,
                    email: teamMember.email || 'email@projet.com',
                    displayName: teamMember.displayName || 'Membre Projet',
                    photoURL: null,
                    role: teamMember.role || 'Contributeur',
                    department: 'Projet',
                    isActive: true,
                    level: 1,
                    xp: 0,
                    tasksCompleted: 0,
                    projects: [{
                      id: doc.id,
                      title: projectData.title,
                      role: teamMember.role
                    }],
                    lastActivity: teamMember.joinedAt,
                    joinedAt: teamMember.joinedAt,
                    source: 'projects',
                    status: 'active'
                  };
                  membersMap.set(teamMember.userId, member);
                  projectMembersCount++;
                }
              }
            });
          }
        });
        
        console.log(`✅ Projects: ${projectMembersCount} membres ajoutés`);
        
      } catch (projectError) {
        console.warn('⚠️ Erreur chargement projets:', projectError);
      }

      // 5️⃣ Convertir en tableau et trier
      const allMembers = Array.from(membersMap.values())
        .sort((a, b) => {
          // Prioriser les membres actifs
          if (a.isActive !== b.isActive) {
            return b.isActive ? 1 : -1;
          }
          // Puis par niveau/XP
          return (b.level || 0) - (a.level || 0);
        });

      setTeamMembers(allMembers);
      setLastUpdated(new Date());
      
      console.log(`✅ ${allMembers.length} membres uniques chargés`);
      console.log('📊 Sources:', {
        users: allMembers.filter(m => m.source === 'users').length,
        userStats: allMembers.filter(m => m.source === 'userStats').length,
        teamMembers: allMembers.filter(m => m.source === 'teamMembers').length,
        projects: allMembers.filter(m => m.source === 'projects').length
      });
      
    } catch (err) {
      console.error('❌ Erreur chargement équipe:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    if (user) {
      loadAllMembers();
    }
  }, [user]);

  // Détecter la connectivité
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filtrer les membres
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = (member.displayName || member.email || '')
      .toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = member.isActive;
    } else if (statusFilter === 'inactive') {
      matchesStatus = !member.isActive;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.isActive).length,
    inactive: teamMembers.filter(m => !m.isActive).length,
    avgLevel: teamMembers.length > 0 ? 
      Math.round(teamMembers.reduce((sum, m) => sum + (m.level || 1), 0) / teamMembers.length) : 1,
    totalXp: teamMembers.reduce((sum, m) => sum + (m.xp || 0), 0),
    sources: {
      users: teamMembers.filter(m => m.source === 'users').length,
      userStats: teamMembers.filter(m => m.source === 'userStats').length,
      teamMembers: teamMembers.filter(m => m.source === 'teamMembers').length,
      projects: teamMembers.filter(m => m.source === 'projects').length
    }
  };

  // Interface des onglets
  const tabs = [
    { 
      id: 'members', 
      label: 'Membres', 
      icon: Users, 
      count: filteredMembers.length,
      color: 'text-blue-400'
    },
    { 
      id: 'stats', 
      label: 'Statistiques', 
      icon: BarChart3,
      color: 'text-green-400'
    },
    { 
      id: 'roles', 
      label: 'Rôles Synergia', 
      icon: Award, 
      count: Object.keys(SYNERGIA_ROLES).length,
      color: 'text-purple-400'
    }
  ];

  // Filtres de statut
  const statusFilters = [
    { value: 'all', label: 'Tous', count: stats.total },
    { value: 'active', label: 'Actifs', count: stats.active },
    { value: 'inactive', label: 'Inactifs', count: stats.inactive }
  ];

  // Affichage de l'état de chargement initial
  if (loading && teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement exhaustif des membres...</p>
          <p className="text-gray-400 text-sm mt-2">
            Récupération depuis toutes les sources Firebase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header avec statut Firebase */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gestion d'Équipe
            </h1>
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            
            {/* Indicateur de connectivité */}
            <div className="flex items-center gap-2 ml-4">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">En ligne</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs">Hors ligne</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Statistiques en header */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-green-400">{stats.active}</div>
              <div className="text-xs text-gray-400">Actifs</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-red-400">{stats.inactive}</div>
              <div className="text-xs text-gray-400">Inactifs</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-purple-400">{stats.avgLevel}</div>
              <div className="text-xs text-gray-400">Niveau Moy.</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-yellow-400">{stats.totalXp.toLocaleString()}</div>
              <div className="text-xs text-gray-400">XP Total</div>
            </div>
          </div>

          {/* Debug sources */}
          <div className="text-xs text-gray-500 flex items-center justify-center gap-4">
            <span>Sources: </span>
            {Object.entries(stats.sources).map(([source, count]) => (
              <span key={source} className="bg-gray-800/30 px-2 py-1 rounded">
                {source}: {count}
              </span>
            ))}
            {lastUpdated && (
              <span className="text-gray-600">
                MAJ: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Barre de contrôles */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filtres de statut */}
            <div className="flex gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    statusFilter === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Bouton actualiser */}
            <button
              onClick={loadAllMembers}
              className="px-4 py-2 bg-purple-600 border border-purple-500 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white border border-gray-600'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${tab.color || 'text-current'}`} />
              {tab.label}
              {tab.count !== undefined && (
                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenu principal */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          
          {/* ONGLET MEMBRES */}
          {activeTab === 'members' && (
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Erreur de chargement</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              )}

              {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/70 transition-colors"
                    >
                      {/* Header membre */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {member.displayName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {member.displayName || 'Nom inconnu'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400 truncate">
                              {member.email || 'Email non disponible'}
                            </span>
                          </div>
                        </div>

                        {/* Statut */}
                        <div className="flex items-center gap-1">
                          {member.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>

                      {/* Informations membre */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Rôle:</span>
                          <span className="text-gray-300">{member.role || 'Non défini'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Département:</span>
                          <span className="text-gray-300">{member.department || 'Non spécifié'}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Niveau:</span>
                          <span className="text-blue-400 font-medium">
                            Niv. {member.level || 1} ({member.xp || 0} XP)
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Source:</span>
                          <span className="text-purple-400">{member.source}</span>
                        </div>

                        {/* Rôles Synergia */}
                        {member.synergiaRoles && member.synergiaRoles.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-400">Rôles Synergia:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.synergiaRoles.slice(0, 2).map((role, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30"
                                >
                                  {typeof role === 'string' ? role : role.name}
                                </span>
                              ))}
                              {member.synergiaRoles.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{member.synergiaRoles.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Projets */}
                        {member.projects && member.projects.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-400">Projets:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.projects.slice(0, 2).map((project, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded border border-green-600/30"
                                >
                                  {project.title || project.id}
                                </span>
                              ))}
                              {member.projects.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{member.projects.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 rounded text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-3 h-3" />
                          Voir détails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    {searchTerm ? 'Aucun membre trouvé' : 'Aucun membre dans l\'équipe'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? 'Essayez de modifier vos critères de recherche' 
                      : 'L\'équipe semble vide pour le moment'
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={loadAllMembers}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Rafraîchir les données
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ONGLET STATISTIQUES */}
          {activeTab === 'stats' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Statistiques de l'Équipe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Statistiques générales */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Vue d'ensemble
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total membres:</span>
                      <span className="text-white font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actifs:</span>
                      <span className="text-green-400 font-medium">{stats.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inactifs:</span>
                      <span className="text-red-400 font-medium">{stats.inactive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Niveau moyen:</span>
                      <span className="text-purple-400 font-medium">{stats.avgLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">XP totale:</span>
                      <span className="text-yellow-400 font-medium">{stats.totalXp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Sources de données */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    Sources de données
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(stats.sources).map(([source, count]) => (
                      <div key={source} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{source}:</span>
                        <span className="text-blue-400 font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3">Actions rapides</h4>
                  <div className="space-y-2">
                    <button
                      onClick={loadAllMembers}
                      className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 rounded text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Actualiser données
                    </button>
                    
                    <button
                      onClick={() => {
                        console.log('📊 Export membres:', teamMembers);
                        console.log('📈 Statistiques:', stats);
                      }}
                      className="w-full px-3 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/30 text-gray-400 rounded text-sm transition-colors"
                    >
                      Exporter en console
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET RÔLES SYNERGIA */}
          {activeTab === 'roles' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Rôles Synergia Disponibles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(SYNERGIA_ROLES).map((role) => (
                  <div
                    key={role.id}
                    className={`${role.color} bg-opacity-20 border border-opacity-30 rounded-lg p-4 hover:bg-opacity-30 transition-colors`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{role.icon}</span>
                      <div>
                        <h4 className="font-medium text-white">{role.name}</h4>
                        <span className="text-xs text-gray-400">{role.difficulty}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{role.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Permissions:</span>
                      <span className="text-gray-300">{role.permissions.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal détails membre */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Détails de {selectedMember.displayName}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white ml-2">{selectedMember.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rôle:</span>
                  <span className="text-white ml-2">{selectedMember.role}</span>
                </div>
                <div>
                  <span className="text-gray-400">Département:</span>
                  <span className="text-white ml-2">{selectedMember.department}</span>
                </div>
                <div>
                  <span className="text-gray-400">Niveau:</span>
                  <span className="text-white ml-2">{selectedMember.level} ({selectedMember.xp} XP)</span>
                </div>
                <div>
                  <span className="text-gray-400">Source:</span>
                  <span className="text-white ml-2">{selectedMember.source}</span>
                </div>
                <div>
                  <span className="text-gray-400">Statut:</span>
                  <span className={`ml-2 ${selectedMember.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedMember.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {selectedMember.lastActivity && (
                  <div>
                    <span className="text-gray-400">Dernière activité:</span>
                    <span className="text-white ml-2">
                      {new Date(selectedMember.lastActivity).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedMember(null)}
                className="mt-4 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ EXPORT PAR DÉFAUT OBLIGATOIRE
export default TeamPage;
