// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// VERSION COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
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
  Plus,
  Edit,
  Trash2,
  Star,
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

// 🎭 RÔLES SYNERGIA COMPLETS
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
  technique: {
    id: 'technique',
    name: 'Technique & Maintenance',
    icon: '🔧',
    color: 'bg-gray-500',
    description: 'Support technique et maintenance',
    difficulty: 'Moyen',
    permissions: ['technical_access', 'maintenance', 'system_admin']
  },
  logistique: {
    id: 'logistique',
    name: 'Logistique & Stock',
    icon: '📦',
    color: 'bg-teal-500',
    description: 'Gestion logistique et stocks',
    difficulty: 'Facile',
    permissions: ['inventory_management', 'stock_access', 'supply_chain']
  },
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Réparations',
    icon: '🔧',
    color: 'bg-orange-600',
    description: 'Maintenance et réparations',
    difficulty: 'Facile',
    permissions: ['maintenance_access', 'repair_management']
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks',
    icon: '📦',
    color: 'bg-blue-600',
    description: 'Gestion des inventaires',
    difficulty: 'Facile',
    permissions: ['stock_management', 'inventory_control']
  },
  organization: {
    id: 'organization',
    name: 'Organisation du Travail',
    icon: '📋',
    color: 'bg-purple-600',
    description: 'Coordination et organisation',
    difficulty: 'Avancé',
    permissions: ['workflow_management', 'team_coordination']
  },
  content: {
    id: 'content',
    name: 'Création de Contenu',
    icon: '🎨',
    color: 'bg-pink-600',
    description: 'Création de contenu visuel',
    difficulty: 'Moyen',
    permissions: ['content_creation', 'design_access']
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '🎓',
    color: 'bg-green-600',
    description: 'Formation et accompagnement',
    difficulty: 'Avancé',
    permissions: ['training_access', 'mentoring_rights']
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats',
    icon: '🤝',
    color: 'bg-indigo-600',
    description: 'Développement de partenariats',
    difficulty: 'Expert',
    permissions: ['partnership_management', 'networking_access']
  },
  communication: {
    id: 'communication',
    name: 'Communication',
    icon: '📢',
    color: 'bg-cyan-600',
    description: 'Gestion de la communication',
    difficulty: 'Moyen',
    permissions: ['communication_rights', 'social_media_access']
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B',
    icon: '💼',
    color: 'bg-slate-600',
    description: 'Gestion B2B et devis',
    difficulty: 'Expert',
    permissions: ['b2b_access', 'quote_management']
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification',
    icon: '🎮',
    color: 'bg-red-600',
    description: 'Système de gamification',
    difficulty: 'Expert',
    permissions: ['gamification_admin', 'xp_management']
  }
};

const TeamPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diagnostic, setDiagnostic] = useState({});
  const [error, setError] = useState(null);
  
  // États UI
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);

  /**
   * 🔍 DIAGNOSTIC COMPLET ET CHARGEMENT
   */
  const runDiagnosticAndLoad = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 === DIAGNOSTIC ÉQUIPE COMPLET ===');
      
      const collections = ['users', 'userStats', 'teamMembers', 'projects'];
      const diagnosticResults = {};
      const allMembers = new Map();
      
      // 1️⃣ ANALYSER USERS
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersResult = { total: usersSnapshot.size, valid: 0, samples: [] };
        
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.email) {
            usersResult.valid++;
            allMembers.set(doc.id, {
              id: doc.id,
              email: data.email,
              displayName: data.displayName || data.email.split('@')[0],
              photoURL: data.photoURL,
              role: data.role || 'Membre',
              department: data.department || 'Non spécifié',
              isActive: data.isActive !== false,
              level: data.level || 1,
              xp: data.totalXp || 0,
              tasksCompleted: 0,
              synergiaRoles: [],
              projects: [],
              joinedAt: data.createdAt,
              lastActivity: data.lastActivity || data.createdAt,
              source: 'users',
              sourceColor: 'text-blue-400'
            });
          }
        });
        
        diagnosticResults.users = usersResult;
        console.log(`📊 Users: ${usersResult.valid}/${usersResult.total} valides`);
        
      } catch (error) {
        console.error('❌ Erreur users:', error);
        diagnosticResults.users = { error: error.message };
      }

      // 2️⃣ ENRICHIR AVEC USERSTATS
      try {
        const statsSnapshot = await getDocs(collection(db, 'userStats'));
        const statsResult = { total: statsSnapshot.size, valid: 0, enriched: 0 };
        
        statsSnapshot.forEach((doc) => {
          const data = doc.data();
          const existingMember = allMembers.get(doc.id);
          
          if (existingMember && data.email) {
            statsResult.enriched++;
            existingMember.level = Math.max(existingMember.level, data.level || 1);
            existingMember.xp = Math.max(existingMember.xp, data.totalXp || 0);
            existingMember.tasksCompleted = data.tasksCompleted || 0;
            existingMember.tasksCreated = data.tasksCreated || 0;
            existingMember.projectsCreated = data.projectsCreated || 0;
            existingMember.badges = data.badges || [];
            if (data.lastLoginDate) {
              existingMember.lastActivity = data.lastLoginDate;
            }
          } else if (data.email && !existingMember) {
            statsResult.valid++;
            allMembers.set(doc.id, {
              id: doc.id,
              email: data.email,
              displayName: data.displayName || data.email.split('@')[0],
              photoURL: null,
              role: 'Membre',
              department: 'Non spécifié',
              isActive: true,
              level: data.level || 1,
              xp: data.totalXp || 0,
              tasksCompleted: data.tasksCompleted || 0,
              synergiaRoles: [],
              projects: [],
              joinedAt: data.createdAt,
              lastActivity: data.lastLoginDate,
              source: 'userStats',
              sourceColor: 'text-green-400'
            });
          }
        });
        
        diagnosticResults.userStats = statsResult;
        console.log(`📊 UserStats: ${statsResult.enriched} enrichis, ${statsResult.valid} nouveaux`);
        
      } catch (error) {
        console.error('❌ Erreur userStats:', error);
        diagnosticResults.userStats = { error: error.message };
      }

      // 3️⃣ ENRICHIR AVEC TEAMMEMBERS
      try {
        const teamSnapshot = await getDocs(collection(db, 'teamMembers'));
        const teamResult = { total: teamSnapshot.size, valid: 0, enriched: 0 };
        
        teamSnapshot.forEach((doc) => {
          const data = doc.data();
          const existingMember = allMembers.get(doc.id);
          
          if (existingMember) {
            teamResult.enriched++;
            if (data.synergiaRoles && Array.isArray(data.synergiaRoles)) {
              existingMember.synergiaRoles = data.synergiaRoles;
            }
            if (data.department) {
              existingMember.department = data.department;
            }
            if (data.status) {
              existingMember.isActive = data.status !== 'inactive';
            }
          } else if (data.email || data.displayName) {
            teamResult.valid++;
            allMembers.set(doc.id, {
              id: doc.id,
              email: data.email || 'email@equipe.com',
              displayName: data.displayName || 'Membre Équipe',
              photoURL: data.photoURL,
              role: data.role || 'Membre',
              department: data.department || 'Non spécifié',
              isActive: data.status !== 'inactive',
              level: data.teamStats?.level || 1,
              xp: data.teamStats?.totalXp || 0,
              tasksCompleted: 0,
              synergiaRoles: data.synergiaRoles || [],
              projects: [],
              joinedAt: data.createdAt,
              lastActivity: data.updatedAt,
              source: 'teamMembers',
              sourceColor: 'text-purple-400'
            });
          }
        });
        
        diagnosticResults.teamMembers = teamResult;
        console.log(`📊 TeamMembers: ${teamResult.enriched} enrichis, ${teamResult.valid} nouveaux`);
        
      } catch (error) {
        console.error('❌ Erreur teamMembers:', error);
        diagnosticResults.teamMembers = { error: error.message };
      }

      // 4️⃣ ANALYSER PROJETS
      try {
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsResult = { total: projectsSnapshot.size, withTeam: 0, membersAdded: 0 };
        
        projectsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.team && Array.isArray(data.team)) {
            projectsResult.withTeam++;
            
            data.team.forEach((teamMember) => {
              const existingMember = allMembers.get(teamMember.userId);
              if (existingMember) {
                if (!existingMember.projects) existingMember.projects = [];
                existingMember.projects.push({
                  id: doc.id,
                  title: data.title,
                  role: teamMember.role
                });
              } else if (teamMember.userId) {
                projectsResult.membersAdded++;
                allMembers.set(teamMember.userId, {
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
                  synergiaRoles: [],
                  projects: [{ id: doc.id, title: data.title, role: teamMember.role }],
                  joinedAt: teamMember.joinedAt,
                  lastActivity: teamMember.joinedAt,
                  source: 'projects',
                  sourceColor: 'text-orange-400'
                });
              }
            });
          }
        });
        
        diagnosticResults.projects = projectsResult;
        console.log(`📊 Projects: ${projectsResult.withTeam} avec équipe, ${projectsResult.membersAdded} membres ajoutés`);
        
      } catch (error) {
        console.error('❌ Erreur projects:', error);
        diagnosticResults.projects = { error: error.message };
      }

      // 5️⃣ FINALISER
      const finalMembers = Array.from(allMembers.values())
        .sort((a, b) => {
          if (a.isActive !== b.isActive) return b.isActive ? 1 : -1;
          return (b.level || 0) - (a.level || 0);
        });

      setMembers(finalMembers);
      setFilteredMembers(finalMembers);
      setDiagnostic(diagnosticResults);
      
      console.log(`🎉 RÉSULTAT FINAL: ${finalMembers.length} membres uniques chargés`);
      
    } catch (error) {
      console.error('❌ Erreur diagnostic complet:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎭 ASSIGNER UN RÔLE SYNERGIA
   */
  const assignSynergiaRole = async (memberId, roleId) => {
    try {
      console.log('🎭 Attribution rôle:', { memberId, roleId });
      
      const role = SYNERGIA_ROLES[roleId];
      if (!role) {
        throw new Error('Rôle invalide');
      }

      // Importer setDoc pour créer le document
      const { setDoc } = await import('firebase/firestore');
      
      const memberRef = doc(db, 'teamMembers', memberId);
      
      // Vérifier si le document existe
      const memberDoc = await getDoc(memberRef);
      const memberData = members.find(m => m.id === memberId);
      
      if (!memberData) {
        throw new Error('Membre introuvable dans les données locales');
      }
      
      const newRole = {
        id: roleId,
        name: role.name,
        assignedAt: new Date().toISOString(),
        assignedBy: user.uid
      };
      
      if (memberDoc.exists()) {
        // Document existe - ajouter le rôle
        const currentData = memberDoc.data();
        const currentRoles = currentData.synergiaRoles || [];
        
        // Vérifier si le rôle n'est pas déjà assigné
        const roleExists = currentRoles.some(r => 
          (typeof r === 'string' ? r : r.id) === roleId
        );
        
        if (roleExists) {
          console.log('⚠️ Rôle déjà assigné');
          return { success: true, message: 'Rôle déjà assigné' };
        }
        
        // Ajouter le nouveau rôle
        await updateDoc(memberRef, {
          synergiaRoles: arrayUnion(newRole),
          updatedAt: serverTimestamp()
        });
        
      } else {
        // Document n'existe pas - le créer
        console.log('📝 Création du document teamMember pour:', memberId);
        
        await setDoc(memberRef, {
          id: memberId,
          email: memberData.email,
          displayName: memberData.displayName,
          role: memberData.role,
          department: memberData.department,
          synergiaRoles: [newRole],
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          teamStats: {
            level: memberData.level || 1,
            totalXp: memberData.xp || 0,
            tasksCompleted: memberData.tasksCompleted || 0
          }
        });
      }

      console.log('✅ Rôle assigné avec succès');
      
      // Rafraîchir les données
      await runDiagnosticAndLoad();
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      throw error;
    }
  };

  /**
   * 🗑️ RETIRER UN RÔLE SYNERGIA
   */
  const removeSynergiaRole = async (memberId, roleId) => {
    try {
      console.log('🗑️ Retrait rôle:', { memberId, roleId });
      
      const memberRef = doc(db, 'teamMembers', memberId);
      const memberDoc = await getDoc(memberRef);
      
      if (memberDoc.exists()) {
        const data = memberDoc.data();
        const updatedRoles = (data.synergiaRoles || []).filter(role => 
          (typeof role === 'string' ? role : role.id) !== roleId
        );
        
        await updateDoc(memberRef, {
          synergiaRoles: updatedRoles,
          updatedAt: serverTimestamp()
        });
        
        console.log('✅ Rôle retiré avec succès');
        
        // Rafraîchir les données
        await runDiagnosticAndLoad();
        
        return { success: true };
      }
      
    } catch (error) {
      console.error('❌ Erreur retrait rôle:', error);
      throw error;
    }
  };

  // Charger au montage
  useEffect(() => {
    if (user) {
      console.log('🚀 TeamPage complète initialisée pour:', user.email);
      runDiagnosticAndLoad();
    }
  }, [user]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...members];
    
    // Filtre de recherche
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        (member.displayName || '').toLowerCase().includes(search) ||
        (member.email || '').toLowerCase().includes(search) ||
        (member.role || '').toLowerCase().includes(search) ||
        (member.department || '').toLowerCase().includes(search) ||
        (member.synergiaRoles || []).some(role => 
          (typeof role === 'string' ? role : role.name || '').toLowerCase().includes(search)
        )
      );
    }
    
    // Filtre de statut
    if (statusFilter === 'active') {
      filtered = filtered.filter(m => m.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(m => !m.isActive);
    } else if (statusFilter === 'with-roles') {
      filtered = filtered.filter(m => m.synergiaRoles && m.synergiaRoles.length > 0);
    } else if (statusFilter === 'no-roles') {
      filtered = filtered.filter(m => !m.synergiaRoles || m.synergiaRoles.length === 0);
    }
    
    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter]);

  // Statistiques
  const stats = {
    total: members.length,
    active: members.filter(m => m.isActive).length,
    inactive: members.filter(m => !m.isActive).length,
    withRoles: members.filter(m => m.synergiaRoles && m.synergiaRoles.length > 0).length,
    avgLevel: members.length > 0 ? 
      Math.round(members.reduce((sum, m) => sum + (m.level || 1), 0) / members.length) : 1,
    totalXp: members.reduce((sum, m) => sum + (m.xp || 0), 0),
    sources: {
      users: members.filter(m => m.source === 'users').length,
      userStats: members.filter(m => m.source === 'userStats').length,
      teamMembers: members.filter(m => m.source === 'teamMembers').length,
      projects: members.filter(m => m.source === 'projects').length
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
      id: 'roles', 
      label: 'Rôles Synergia', 
      icon: Award, 
      count: Object.keys(SYNERGIA_ROLES).length,
      color: 'text-purple-400'
    },
    { 
      id: 'stats', 
      label: 'Statistiques', 
      icon: BarChart3,
      color: 'text-green-400'
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Settings,
      color: 'text-gray-400'
    }
  ];

  // Filtres de statut
  const statusFilters = [
    { value: 'all', label: 'Tous', count: stats.total },
    { value: 'active', label: 'Actifs', count: stats.active },
    { value: 'inactive', label: 'Inactifs', count: stats.inactive },
    { value: 'with-roles', label: 'Avec rôles', count: stats.withRoles },
    { value: 'no-roles', label: 'Sans rôles', count: stats.total - stats.withRoles }
  ];

  // Affichage de l'état de chargement initial
  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement complet de l'équipe...</p>
          <p className="text-gray-400 text-sm mt-2">
            Diagnostic et récupération depuis toutes les sources Firebase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header avec statistiques */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gestion d'Équipe Complète
            </h1>
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          
          {/* Statistiques principales */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-4xl mx-auto mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-green-400">{stats.active}</div>
              <div className="text-xs text-gray-400">Actifs</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-purple-400">{stats.withRoles}</div>
              <div className="text-xs text-gray-400">Avec Rôles</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-yellow-400">{stats.avgLevel}</div>
              <div className="text-xs text-gray-400">Niveau Moy.</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-orange-400">{stats.totalXp.toLocaleString()}</div>
              <div className="text-xs text-gray-400">XP Total</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-cyan-400">{Object.keys(SYNERGIA_ROLES).length}</div>
              <div className="text-xs text-gray-400">Rôles Dispo</div>
            </div>
          </div>

          {/* Debug sources */}
          <div className="text-xs text-gray-500 flex items-center justify-center gap-4 flex-wrap">
            <span>Sources Firebase: </span>
            {Object.entries(stats.sources).map(([source, count]) => (
              <span key={source} className="bg-gray-800/30 px-2 py-1 rounded">
                {source}: {count}
              </span>
            ))}
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
                placeholder="Rechercher membre, rôle, département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
              
              <button
                onClick={runDiagnosticAndLoad}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 border border-purple-500 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Filtres de statut */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      statusFilter === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          )}
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
                    <span className="font-medium">Erreur</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              )}

              {filteredMembers.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Membres de l'équipe ({filteredMembers.length})
                    </h3>
                    {searchTerm && (
                      <span className="text-sm text-gray-400">
                        Filtré sur: "{searchTerm}"
                      </span>
                    )}
                  </div>
                  
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
                            <span className={member.sourceColor}>
                              {member.source}
                            </span>
                          </div>

                          {/* Rôles Synergia */}
                          {member.synergiaRoles && member.synergiaRoles.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-400">Rôles Synergia:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.synergiaRoles.slice(0, 3).map((role, index) => {
                                  const roleName = typeof role === 'string' ? role : role.name;
                                  const roleId = typeof role === 'string' ? role : role.id;
                                  const synergiaRole = SYNERGIA_ROLES[roleId];
                                  
                                  return (
                                    <div key={index} className="relative group">
                                      <span
                                        className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30 cursor-pointer hover:bg-purple-600/30 transition-colors"
                                      >
                                        {synergiaRole?.icon || '🎭'} {roleName}
                                      </span>
                                      <button
                                        onClick={() => removeSynergiaRole(member.id, roleId)}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                                {member.synergiaRoles.length > 3 && (
                                  <span className="text-xs text-gray-400">
                                    +{member.synergiaRoles.length - 3}
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
                        <div className="mt-3 pt-3 border-t border-gray-600 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowRoleAssignment(true);
                            }}
                            className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 text-purple-400 rounded text-xs transition-colors flex items-center justify-center gap-2"
                          >
                            <Award className="w-3 h-3" />
                            Assigner Rôle
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowMemberDetails(true);
                            }}
                            className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 rounded text-xs transition-colors flex items-center justify-center gap-2"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                </div>
              )}
            </div>
          )}

          {/* ONGLET RÔLES SYNERGIA */}
          {activeTab === 'roles' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Rôles Synergia Disponibles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(SYNERGIA_ROLES).map((role) => {
                  const assignedCount = members.filter(m => 
                    m.synergiaRoles && m.synergiaRoles.some(r => 
                      (typeof r === 'string' ? r : r.id) === role.id
                    )
                  ).length;
                  
                  return (
                    <div
                      key={role.id}
                      className={`${role.color} bg-opacity-20 border border-opacity-30 rounded-lg p-4 hover:bg-opacity-30 transition-colors`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{role.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{role.name}</h4>
                          <span className="text-xs text-gray-400">{role.difficulty}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">{assignedCount}</div>
                          <div className="text-xs text-gray-400">assigné{assignedCount !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">{role.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Permissions:</span>
                          <span className="text-gray-300">{role.permissions.length}</span>
                        </div>
                        
                        {role.permissions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permission, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-600/30 text-gray-300 px-2 py-1 rounded"
                              >
                                {permission.replace('_', ' ')}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{role.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
                      <span className="text-gray-400">Avec rôles:</span>
                      <span className="text-purple-400 font-medium">{stats.withRoles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Niveau moyen:</span>
                      <span className="text-yellow-400 font-medium">{stats.avgLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">XP totale:</span>
                      <span className="text-orange-400 font-medium">{stats.totalXp.toLocaleString()}</span>
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

                {/* Diagnostic des collections */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3">Diagnostic collections</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(diagnostic).map(([collection, data]) => (
                      <div key={collection} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{collection}:</span>
                        <span className="text-green-400 font-medium">
                          {data.error ? 'Erreur' : `${data.valid || data.enriched || 0}/${data.total || 0}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET PARAMÈTRES */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Paramètres de l'Équipe</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3">Actions rapides</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={runDiagnosticAndLoad}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Synchroniser maintenant
                    </button>
                    
                    <button 
                      onClick={() => {
                        console.log('📊 Export équipe:', { members, stats, diagnostic });
                        console.log('📈 Rôles Synergia:', SYNERGIA_ROLES);
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Exporter en console
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL ASSIGNATION DE RÔLE */}
        {showRoleAssignment && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Assigner un rôle à {selectedMember.displayName}
                </h3>
                <button
                  onClick={() => setShowRoleAssignment(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.values(SYNERGIA_ROLES).map((role) => {
                  const isAssigned = selectedMember.synergiaRoles?.some(r => 
                    (typeof r === 'string' ? r : r.id) === role.id
                  );
                  
                  return (
                    <div
                      key={role.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isAssigned 
                          ? 'bg-green-600/20 border-green-600/30' 
                          : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{role.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{role.name}</h4>
                          <p className="text-xs text-gray-400">{role.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (isAssigned) {
                              removeSynergiaRole(selectedMember.id, role.id);
                            } else {
                              assignSynergiaRole(selectedMember.id, role.id);
                            }
                          }}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            isAssigned
                              ? 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30'
                              : 'bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30'
                          }`}
                        >
                          {isAssigned ? 'Retirer' : 'Assigner'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={() => setShowRoleAssignment(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* MODAL DÉTAILS MEMBRE */}
        {showMemberDetails && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Détails de {selectedMember.displayName}
                </h3>
                <button
                  onClick={() => setShowMemberDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
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
                {selectedMember.tasksCompleted !== undefined && (
                  <div>
                    <span className="text-gray-400">Tâches complétées:</span>
                    <span className="text-white ml-2">{selectedMember.tasksCompleted}</span>
                  </div>
                )}
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
                onClick={() => setShowMemberDetails(false)}
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

export default TeamPage;
