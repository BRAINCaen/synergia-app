// ==========================================
// react-app/src/pages/AdminRolePermissionsPage.jsx
// PAGE ADMINISTRATION DES PERMISSIONS PAR ROLE SYNERGIA V3.0
// DESIGN GLASSMORPHISM + NOUVELLES FONCTIONNALITES
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Settings,
  Lock,
  Unlock,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Crown,
  Zap,
  Target,
  Award,
  Clock,
  Calendar,
  FileText,
  BarChart3,
  UserPlus,
  Layers,
  Database,
  Monitor,
  BookOpen,
  Search,
  Filter,
  Download,
  Upload,
  History,
  TrendingUp,
  Flag,
  Gamepad2,
  Trophy,
  Gift,
  MessageSquare,
  PieChart,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

// Firebase
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, query, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';

// Layout
import Layout from '../components/layout/Layout.jsx';

// Notifications
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-[10000] px-4 py-3 rounded-xl text-white font-medium max-w-md transform transition-all duration-300 translate-x-full ${
    type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
    type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
    'bg-gradient-to-r from-blue-500 to-indigo-600'
  } shadow-lg backdrop-blur-xl border border-white/20`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

// ROLES SYNERGIA AVEC PERMISSIONS DEFINIES
const SYNERGIA_ROLES = {
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/20',
    description: 'Formation et accompagnement des equipes',
    defaultPermissions: ['onboarding_admin', 'training_access', 'mentoring_rights'],
    adminSections: ['Onboarding', 'Formation'],
    priority: 1
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-500/20',
    description: 'Coordination et organisation des equipes',
    defaultPermissions: ['planning_admin', 'timetrack_admin', 'tasks_admin', 'projects_admin'],
    adminSections: ['Planning', 'Pointeuse', 'Taches', 'Projets'],
    priority: 2
  },
  gamemaster: {
    id: 'gamemaster',
    name: 'Game Master',
    icon: '🎮',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-500/20',
    description: 'Animation des sessions et management general',
    defaultPermissions: ['session_admin', 'user_management', 'analytics_admin', 'full_access'],
    adminSections: ['Sessions', 'Utilisateurs', 'Analytics', 'Systeme'],
    priority: 3
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Reputation',
    icon: '⭐',
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-500/20',
    description: 'Gestion de l\'image et communication',
    defaultPermissions: ['reviews_admin', 'communication_admin', 'social_media_admin'],
    adminSections: ['Avis', 'Communication', 'Reseaux Sociaux'],
    priority: 4
  },
  content: {
    id: 'content',
    name: 'Creation de Contenu & Affichages',
    icon: '🎨',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/20',
    description: 'Creation de contenu et design',
    defaultPermissions: ['content_admin', 'design_admin', 'media_admin'],
    adminSections: ['Contenu', 'Design', 'Medias'],
    priority: 5
  },
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-500/20',
    description: 'Maintenance technique et materiel',
    defaultPermissions: ['maintenance_admin', 'equipment_admin', 'technical_admin'],
    adminSections: ['Maintenance', 'Equipement', 'Technique'],
    priority: 6
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Materiel',
    icon: '📦',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/20',
    description: 'Inventaires et approvisionnements',
    defaultPermissions: ['inventory_admin', 'stock_admin', 'suppliers_admin'],
    adminSections: ['Inventaire', 'Stock', 'Fournisseurs'],
    priority: 7
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Referencement',
    icon: '🤝',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-500/20',
    description: 'Relations externes et partenariats',
    defaultPermissions: ['partnerships_admin', 'external_relations_admin', 'marketing_admin'],
    adminSections: ['Partenariats', 'Relations Externes', 'Marketing'],
    priority: 8
  }
};

// NOUVELLES PERMISSIONS POUR MODULES RECENTS
const MODULE_PERMISSIONS = {
  'Campagnes & Quetes': [
    { id: 'campaigns_view', name: 'Consulter campagnes', icon: Flag, level: 'view' },
    { id: 'campaigns_create', name: 'Creer campagnes', icon: Plus, level: 'create' },
    { id: 'campaigns_edit', name: 'Modifier campagnes', icon: Edit, level: 'edit' },
    { id: 'campaigns_admin', name: 'Administration campagnes', icon: Crown, level: 'admin' },
    { id: 'quests_assign', name: 'Assigner des quetes', icon: Target, level: 'edit' }
  ],
  'Cagnotte Equipe': [
    { id: 'teampool_view', name: 'Consulter cagnotte', icon: Eye, level: 'view' },
    { id: 'teampool_contribute', name: 'Contribuer manuellement', icon: Plus, level: 'create' },
    { id: 'teampool_purchase', name: 'Acheter recompenses', icon: Gift, level: 'admin' },
    { id: 'teampool_rate', name: 'Modifier taux contribution', icon: Settings, level: 'admin' }
  ],
  'Pulse & Sondages': [
    { id: 'pulse_view', name: 'Consulter sondages', icon: MessageSquare, level: 'view' },
    { id: 'pulse_create', name: 'Creer sondages', icon: Plus, level: 'create' },
    { id: 'pulse_results', name: 'Voir resultats complets', icon: PieChart, level: 'edit' },
    { id: 'pulse_admin', name: 'Administration sondages', icon: Crown, level: 'admin' }
  ],
  'Checkpoints & Objectifs': [
    { id: 'checkpoints_view', name: 'Consulter checkpoints', icon: Target, level: 'view' },
    { id: 'checkpoints_validate', name: 'Valider objectifs', icon: CheckCircle, level: 'edit' },
    { id: 'checkpoints_create', name: 'Creer checkpoints', icon: Plus, level: 'create' },
    { id: 'checkpoints_admin', name: 'Administration checkpoints', icon: Crown, level: 'admin' }
  ],
  'Boosts & Bonus': [
    { id: 'boosts_view', name: 'Consulter boosts', icon: Zap, level: 'view' },
    { id: 'boosts_activate', name: 'Activer boosts', icon: Zap, level: 'create' },
    { id: 'boosts_create', name: 'Creer nouveaux boosts', icon: Plus, level: 'admin' },
    { id: 'boosts_admin', name: 'Administration boosts', icon: Crown, level: 'admin' }
  ],
  'Gamification': [
    { id: 'gamification_view', name: 'Consulter stats', icon: TrendingUp, level: 'view' },
    { id: 'gamification_xp', name: 'Attribuer XP manuellement', icon: Award, level: 'edit' },
    { id: 'gamification_badges', name: 'Gerer badges', icon: Trophy, level: 'admin' },
    { id: 'gamification_admin', name: 'Administration complete', icon: Crown, level: 'admin' }
  ],
  'Escape Progression': [
    { id: 'escape_view', name: 'Consulter progression', icon: Gamepad2, level: 'view' },
    { id: 'escape_validate', name: 'Valider etapes', icon: CheckCircle, level: 'edit' },
    { id: 'escape_admin', name: 'Administration escape', icon: Crown, level: 'admin' }
  ],
  'Onboarding': [
    { id: 'onboarding_view', name: 'Consulter onboarding', icon: Eye, level: 'view' },
    { id: 'onboarding_edit', name: 'Modifier contenu onboarding', icon: Edit, level: 'edit' },
    { id: 'onboarding_admin', name: 'Administration complete onboarding', icon: Crown, level: 'admin' }
  ],
  'Planning': [
    { id: 'planning_view', name: 'Consulter planning', icon: Calendar, level: 'view' },
    { id: 'planning_edit', name: 'Modifier planning', icon: Edit, level: 'edit' },
    { id: 'planning_admin', name: 'Administration planning', icon: Crown, level: 'admin' }
  ],
  'Taches': [
    { id: 'tasks_view', name: 'Consulter taches', icon: CheckCircle, level: 'view' },
    { id: 'tasks_edit', name: 'Modifier taches', icon: Edit, level: 'edit' },
    { id: 'tasks_admin', name: 'Administration taches', icon: Crown, level: 'admin' }
  ],
  'Analytics': [
    { id: 'analytics_view', name: 'Consulter analytics', icon: BarChart3, level: 'view' },
    { id: 'analytics_export', name: 'Exporter donnees', icon: Download, level: 'edit' },
    { id: 'analytics_admin', name: 'Administration analytics', icon: Crown, level: 'admin' }
  ],
  'Utilisateurs': [
    { id: 'users_view', name: 'Consulter utilisateurs', icon: Users, level: 'view' },
    { id: 'users_edit', name: 'Modifier utilisateurs', icon: Edit, level: 'edit' },
    { id: 'user_management', name: 'Gestion complete utilisateurs', icon: Crown, level: 'admin' }
  ]
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

/**
 * PAGE ADMINISTRATION DES PERMISSIONS PAR ROLE
 */
const AdminRolePermissionsPage = () => {
  const { user } = useAuthStore();

  // Etats principaux
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [editingRole, setEditingRole] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  // Etats pour gestion des roles utilisateurs
  const [editingMember, setEditingMember] = useState(null);
  const [showEditRolesModal, setShowEditRolesModal] = useState(false);
  const [memberRolesEditing, setMemberRolesEditing] = useState([]);
  const [savingMemberRoles, setSavingMemberRoles] = useState(false);

  // Etats pour l'historique
  const [permissionHistory, setPermissionHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Etats pour les statistiques
  const [stats, setStats] = useState({
    totalPermissions: 0,
    activeRoles: 0,
    usersWithRoles: 0,
    recentChanges: 0
  });

  /**
   * CHARGER LES DONNEES
   */
  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les membres avec leurs roles
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const teamMembers = [];
      let usersWithRolesCount = 0;

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        teamMembers.push({
          id: doc.id,
          ...userData,
          synergiaRoles: userData.synergiaRoles || []
        });
        if (userData.synergiaRoles?.length > 0) usersWithRolesCount++;
      });

      setMembers(teamMembers);

      // Charger les permissions par role depuis Firebase
      const permissionsRef = collection(db, 'rolePermissions');
      const permissionsSnapshot = await getDocs(permissionsRef);

      const permissions = {};
      let totalPerms = 0;

      permissionsSnapshot.forEach((doc) => {
        permissions[doc.id] = doc.data();
        totalPerms += (doc.data().permissions || []).length;
      });

      // Initialiser les permissions par defaut si elles n'existent pas
      for (const [roleId, roleData] of Object.entries(SYNERGIA_ROLES)) {
        if (!permissions[roleId]) {
          permissions[roleId] = {
            roleId,
            permissions: roleData.defaultPermissions,
            adminSections: roleData.adminSections,
            updatedAt: new Date().toISOString(),
            updatedBy: 'system'
          };
        }
      }

      setRolePermissions(permissions);

      // Charger l'historique des modifications
      try {
        const historyRef = collection(db, 'permissionHistory');
        const historyQuery = query(historyRef, orderBy('timestamp', 'desc'), limit(50));
        const historySnapshot = await getDocs(historyQuery);

        const history = [];
        historySnapshot.forEach((doc) => {
          history.push({ id: doc.id, ...doc.data() });
        });
        setPermissionHistory(history);
      } catch {
        // Collection peut ne pas exister
        setPermissionHistory([]);
      }

      // Calculer les stats
      setStats({
        totalPermissions: totalPerms,
        activeRoles: Object.keys(permissions).length,
        usersWithRoles: usersWithRolesCount,
        recentChanges: permissionHistory.filter(h => {
          const date = new Date(h.timestamp?.seconds * 1000 || h.timestamp);
          const now = new Date();
          return (now - date) < 7 * 24 * 60 * 60 * 1000; // 7 jours
        }).length
      });

    } catch (error) {
      console.error('Erreur chargement donnees:', error);
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ENREGISTRER MODIFICATION DANS L'HISTORIQUE
   */
  const logPermissionChange = async (action, roleId, details) => {
    try {
      const historyRef = collection(db, 'permissionHistory');
      await addDoc(historyRef, {
        action,
        roleId,
        details,
        userId: user.uid,
        userEmail: user.email,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur log historique:', error);
    }
  };

  /**
   * SAUVEGARDER LES PERMISSIONS D'UN ROLE
   */
  const saveRolePermissions = async (roleId, newPermissions) => {
    try {
      const rolePermissionRef = doc(db, 'rolePermissions', roleId);

      const permissionData = {
        roleId,
        permissions: newPermissions,
        adminSections: SYNERGIA_ROLES[roleId]?.adminSections || [],
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      };

      await setDoc(rolePermissionRef, permissionData);

      // Log dans l'historique
      await logPermissionChange('UPDATE_PERMISSIONS', roleId, {
        permissionsCount: newPermissions.length,
        permissions: newPermissions
      });

      setRolePermissions(prev => ({
        ...prev,
        [roleId]: permissionData
      }));

      showNotification('Permissions mises a jour avec succes', 'success');
      setEditingRole(null);

    } catch (error) {
      console.error('Erreur sauvegarde permissions:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  /**
   * TOGGLE MODULE EXPAND
   */
  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  /**
   * TOGGLE PERMISSION
   */
  const togglePermission = (roleId, permissionId) => {
    setRolePermissions(prev => {
      const currentPermissions = prev[roleId]?.permissions || [];
      const newPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions.filter(p => p !== permissionId)
        : [...currentPermissions, permissionId];

      return {
        ...prev,
        [roleId]: {
          ...prev[roleId],
          permissions: newPermissions
        }
      };
    });
  };

  /**
   * OUVRIR MODAL GESTION ROLES UTILISATEUR
   */
  const openEditMemberRoles = (member) => {
    setEditingMember(member);
    const currentRoleIds = (member.synergiaRoles || []).map(role => role.roleId);
    setMemberRolesEditing(currentRoleIds);
    setShowEditRolesModal(true);
  };

  /**
   * TOGGLE UN ROLE POUR UN MEMBRE
   */
  const toggleMemberRole = (roleId) => {
    setMemberRolesEditing(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  /**
   * SAUVEGARDER LES ROLES D'UN MEMBRE
   */
  const saveMemberRoles = async () => {
    if (!editingMember) return;

    try {
      setSavingMemberRoles(true);

      const newSynergiaRoles = memberRolesEditing.map(roleId => {
        const existingRole = editingMember.synergiaRoles?.find(r => r.roleId === roleId);

        if (existingRole) {
          return existingRole;
        } else {
          const roleData = SYNERGIA_ROLES[roleId];
          return {
            roleId: roleId,
            roleName: roleData.name,
            assignedAt: new Date().toISOString(),
            assignedBy: user.uid,
            xpInRole: 0,
            tasksCompleted: 0,
            level: 'debutant',
            permissions: roleData.defaultPermissions || [],
            lastActivity: new Date().toISOString(),
            isActive: true,
            roleIcon: roleData.icon,
            roleColor: roleData.color
          };
        }
      });

      const userRef = doc(db, 'users', editingMember.id);
      await updateDoc(userRef, {
        synergiaRoles: newSynergiaRoles,
        lastRoleUpdate: new Date().toISOString()
      });

      // Log dans l'historique
      await logPermissionChange('UPDATE_USER_ROLES', 'user_' + editingMember.id, {
        userId: editingMember.id,
        userEmail: editingMember.email,
        rolesCount: newSynergiaRoles.length,
        roles: newSynergiaRoles.map(r => r.roleId)
      });

      setMembers(prev => prev.map(m =>
        m.id === editingMember.id
          ? { ...m, synergiaRoles: newSynergiaRoles }
          : m
      ));

      showNotification('Roles mis a jour avec succes', 'success');
      setShowEditRolesModal(false);
      setEditingMember(null);

    } catch (error) {
      console.error('Erreur sauvegarde roles membre:', error);
      showNotification('Erreur lors de la sauvegarde des roles', 'error');
    } finally {
      setSavingMemberRoles(false);
    }
  };

  /**
   * OBTENIR LES MEMBRES PAR ROLE
   */
  const getMembersByRole = (roleId) => {
    return members.filter(member =>
      member.synergiaRoles?.some(role => role.roleId === roleId)
    );
  };

  /**
   * FILTRER LES MEMBRES
   */
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    const search = searchTerm.toLowerCase();
    return members.filter(m =>
      m.displayName?.toLowerCase().includes(search) ||
      m.email?.toLowerCase().includes(search)
    );
  }, [members, searchTerm]);

  // Charger les donnees au montage
  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/30 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
            </motion.div>
            <p className="text-gray-400 text-sm sm:text-lg">Chargement des permissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto"
        >
          {/* HEADER */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500/30 to-purple-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
                >
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    Permissions & Roles
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                    Administration des acces Synergia
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHistoryModal(true)}
                  className="px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Historique</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadData}
                  className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* STATS CARDS */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {[
              { label: 'Roles actifs', value: stats.activeRoles, icon: Shield, color: 'from-blue-500 to-cyan-500' },
              { label: 'Utilisateurs', value: stats.usersWithRoles, icon: Users, color: 'from-green-500 to-emerald-500' },
              { label: 'Permissions', value: stats.totalPermissions, icon: Lock, color: 'from-purple-500 to-pink-500' },
              { label: 'Modifs recentes', value: stats.recentChanges, icon: History, color: 'from-orange-500 to-amber-500' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-gray-400 text-xs sm:text-sm">{stat.label}</span>
                </div>
                <div className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ONGLETS */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
            <div className="flex gap-1 bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-xl">
              {[
                { id: 'roles', label: 'Permissions par Role', icon: Shield },
                { id: 'members', label: 'Membres et Acces', icon: Users },
                { id: 'modules', label: 'Modules', icon: Layers }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg transition-all text-xs sm:text-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* CONTENU PERMISSIONS PAR ROLE */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(SYNERGIA_ROLES)
                .sort(([,a], [,b]) => a.priority - b.priority)
                .map(([roleId, roleData]) => {
                  const roleMembers = getMembersByRole(roleId);
                  const permissions = rolePermissions[roleId] || {};
                  const isEditing = editingRole === roleId;

                  return (
                    <motion.div
                      key={roleId}
                      variants={itemVariants}
                      whileHover={{ scale: isEditing ? 1 : 1.01 }}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                    >
                      {/* En-tete du role */}
                      <div className={`p-4 sm:p-6 ${roleData.bgColor} border-b border-white/10`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-2xl sm:text-3xl">{roleData.icon}</span>
                            <div>
                              <h3 className="text-base sm:text-lg font-semibold text-white">{roleData.name}</h3>
                              <p className="text-gray-300 text-xs sm:text-sm">{roleData.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl sm:text-2xl font-bold text-white">{roleMembers.length}</div>
                            <div className="text-xs text-gray-400">membre{roleMembers.length > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      </div>

                      {/* Sections d'administration */}
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h4 className="text-white font-medium text-sm sm:text-base">Permissions actives</h4>
                          {!isEditing ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditingRole(roleId)}
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span>Modifier</span>
                            </motion.button>
                          ) : (
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => saveRolePermissions(roleId, permissions.permissions || [])}
                                className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs sm:text-sm"
                              >
                                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Sauver</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setEditingRole(null)}
                                className="flex items-center gap-1 text-gray-400 hover:text-gray-300 text-xs sm:text-sm"
                              >
                                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Annuler</span>
                              </motion.button>
                            </div>
                          )}
                        </div>

                        {/* Permissions actuelles */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                          {(permissions.permissions || []).slice(0, isEditing ? undefined : 5).map(permission => (
                            <span
                              key={permission}
                              className={`px-2 py-1 rounded-lg text-xs ${
                                isEditing
                                  ? 'bg-green-500/20 text-green-300 cursor-pointer hover:bg-red-500/20 hover:text-red-300'
                                  : 'bg-white/10 text-gray-300'
                              }`}
                              onClick={() => isEditing && togglePermission(roleId, permission)}
                            >
                              {permission.replace(/_/g, ' ')}
                              {isEditing && <X className="w-3 h-3 inline ml-1" />}
                            </span>
                          ))}
                          {!isEditing && (permissions.permissions || []).length > 5 && (
                            <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400">
                              +{(permissions.permissions || []).length - 5} autres
                            </span>
                          )}
                        </div>

                        {/* Mode edition - Ajouter permissions */}
                        {isEditing && (
                          <div className="space-y-2 mb-3 sm:mb-4">
                            <p className="text-gray-400 text-xs">Cliquez pour ajouter des permissions:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(MODULE_PERMISSIONS).slice(0, 3).flatMap(([, perms]) =>
                                perms.filter(p => !(permissions.permissions || []).includes(p.id)).slice(0, 2)
                              ).map(perm => (
                                <span
                                  key={perm.id}
                                  onClick={() => togglePermission(roleId, perm.id)}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs cursor-pointer hover:bg-blue-500/30"
                                >
                                  + {perm.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Membres ayant ce role */}
                        {roleMembers.length > 0 && (
                          <div className="pt-3 sm:pt-4 border-t border-white/10">
                            <h5 className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Membres</h5>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {roleMembers.slice(0, 4).map(member => (
                                <div key={member.id} className="flex items-center gap-1.5 bg-white/5 rounded-full px-2 py-1">
                                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {(member.displayName?.[0] || member.email?.[0] || '?').toUpperCase()}
                                  </div>
                                  <span className="text-gray-300 text-xs truncate max-w-[80px]">
                                    {member.displayName || member.email?.split('@')[0]}
                                  </span>
                                </div>
                              ))}
                              {roleMembers.length > 4 && (
                                <span className="text-gray-400 text-xs px-2 py-1">
                                  +{roleMembers.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}

          {/* CONTENU MEMBRES ET ACCES */}
          {activeTab === 'members' && (
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Membres de l'equipe</h3>
                    <p className="text-gray-400 text-sm">Vue d'ensemble des acces par membre</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 text-sm w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {filteredMembers.map(member => {
                    const memberRoles = member.synergiaRoles || [];
                    const allPermissions = new Set();

                    memberRoles.forEach(memberRole => {
                      const rolePermissionData = rolePermissions[memberRole.roleId];
                      if (rolePermissionData?.permissions) {
                        rolePermissionData.permissions.forEach(permission =>
                          allPermissions.add(permission)
                        );
                      }
                    });

                    return (
                      <motion.div
                        key={member.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {(member.displayName?.[0] || member.email?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-white font-medium text-sm sm:text-base">
                                {member.displayName || member.email}
                              </h4>
                              <p className="text-gray-400 text-xs sm:text-sm">
                                {memberRoles.length} role{memberRoles.length > 1 ? 's' : ''} - {allPermissions.size} permission{allPermissions.size > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openEditMemberRoles(member)}
                              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Gerer</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedMember(member);
                                setShowMemberModal(true);
                              }}
                              className="flex items-center gap-1.5 bg-white/10 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Roles du membre */}
                        {memberRoles.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {memberRoles.map(memberRole => {
                              const roleData = SYNERGIA_ROLES[memberRole.roleId];
                              if (!roleData) return null;

                              return (
                                <div key={memberRole.roleId} className={`flex items-center gap-1 ${roleData.bgColor} rounded-lg px-2 py-1`}>
                                  <span className="text-sm">{roleData.icon}</span>
                                  <span className="text-gray-200 text-xs">{roleData.name.split(' ')[0]}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-3 text-gray-500 text-xs italic">
                            Aucun role assigne
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* CONTENU MODULES */}
          {activeTab === 'modules' && (
            <motion.div variants={itemVariants} className="space-y-3">
              {Object.entries(MODULE_PERMISSIONS).map(([moduleName, permissions]) => (
                <div key={moduleName} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleModule(moduleName)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500/30 to-purple-500/20 rounded-lg">
                        <Layers className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm sm:text-base">{moduleName}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">{permissions.length} permissions disponibles</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedModules[moduleName] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedModules[moduleName] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {permissions.map(perm => (
                            <div key={perm.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                              <div className={`p-2 rounded-lg ${
                                perm.level === 'admin' ? 'bg-red-500/20' :
                                perm.level === 'edit' ? 'bg-yellow-500/20' :
                                perm.level === 'create' ? 'bg-blue-500/20' :
                                'bg-green-500/20'
                              }`}>
                                <perm.icon className={`w-4 h-4 ${
                                  perm.level === 'admin' ? 'text-red-400' :
                                  perm.level === 'edit' ? 'text-yellow-400' :
                                  perm.level === 'create' ? 'text-blue-400' :
                                  'text-green-400'
                                }`} />
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{perm.name}</p>
                                <p className="text-gray-500 text-xs">{perm.id}</p>
                              </div>
                              <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                                perm.level === 'admin' ? 'bg-red-500/20 text-red-300' :
                                perm.level === 'edit' ? 'bg-yellow-500/20 text-yellow-300' :
                                perm.level === 'create' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-green-500/20 text-green-300'
                              }`}>
                                {perm.level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* MODAL GESTION DES ROLES D'UN MEMBRE */}
        <AnimatePresence>
          {showEditRolesModal && editingMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
              onClick={() => setShowEditRolesModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Gerer les roles de {editingMember.displayName || editingMember.email?.split('@')[0]}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                      Cochez les roles a assigner
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditRolesModal(false)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {Object.entries(SYNERGIA_ROLES)
                    .sort(([,a], [,b]) => a.priority - b.priority)
                    .map(([roleId, roleData]) => {
                      const isChecked = memberRolesEditing.includes(roleId);

                      return (
                        <label
                          key={roleId}
                          className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMemberRole(roleId)}
                            className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                          />
                          <span className="text-xl sm:text-2xl">{roleData.icon}</span>
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm sm:text-base">{roleData.name}</h4>
                            <p className="text-gray-400 text-xs sm:text-sm">{roleData.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {roleData.adminSections.map(section => (
                                <span key={section} className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded">
                                  {section}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                </div>

                <div className="flex justify-end gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowEditRolesModal(false)}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors text-sm"
                    disabled={savingMemberRoles}
                  >
                    Annuler
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveMemberRoles}
                    disabled={savingMemberRoles}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {savingMemberRoles ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sauvegarde...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Sauvegarder</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL DETAILS MEMBRE */}
        <AnimatePresence>
          {showMemberModal && selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
              onClick={() => setShowMemberModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Permissions de {selectedMember.displayName || selectedMember.email?.split('@')[0]}
                  </h3>
                  <button
                    onClick={() => setShowMemberModal(false)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {selectedMember.synergiaRoles && selectedMember.synergiaRoles.length > 0 ? (
                    selectedMember.synergiaRoles.map(memberRole => {
                      const roleData = SYNERGIA_ROLES[memberRole.roleId];
                      const rolePermissionData = rolePermissions[memberRole.roleId];

                      if (!roleData) return null;

                      return (
                        <div key={memberRole.roleId} className={`${roleData.bgColor} border border-white/10 rounded-xl p-4`}>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{roleData.icon}</span>
                            <div>
                              <h4 className="text-white font-medium">{roleData.name}</h4>
                              <p className="text-gray-400 text-xs sm:text-sm">
                                Assigne le {memberRole.assignedAt ? new Date(memberRole.assignedAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                              </p>
                            </div>
                          </div>

                          {rolePermissionData?.permissions && (
                            <div className="space-y-2">
                              <h5 className="text-gray-300 text-sm font-medium">Permissions:</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {rolePermissionData.permissions.map(permission => (
                                  <span key={permission} className="bg-white/10 text-white text-xs px-2 py-1 rounded-lg">
                                    {permission.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun role assigne a ce membre</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL HISTORIQUE */}
        <AnimatePresence>
          {showHistoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
              onClick={() => setShowHistoryModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500/30 to-purple-500/20 rounded-lg">
                      <History className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Historique des modifications</h3>
                  </div>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {permissionHistory.length > 0 ? (
                    permissionHistory.map((entry, index) => (
                      <div key={entry.id || index} className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                entry.action === 'UPDATE_PERMISSIONS' ? 'bg-blue-500/20 text-blue-300' :
                                entry.action === 'UPDATE_USER_ROLES' ? 'bg-purple-500/20 text-purple-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {entry.action?.replace(/_/g, ' ')}
                              </span>
                              <span className="text-gray-400 text-xs">{entry.roleId}</span>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">{entry.userEmail}</p>
                          </div>
                          <span className="text-gray-500 text-xs">
                            {entry.timestamp?.seconds
                              ? new Date(entry.timestamp.seconds * 1000).toLocaleString('fr-FR')
                              : 'Date inconnue'
                            }
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun historique disponible</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default AdminRolePermissionsPage;
