// ==========================================
// 📁 react-app/src/pages/AdminRolePermissionsPage.jsx
// PAGE ADMINISTRATION DES PERMISSIONS PAR RÔLE SYNERGIA
// ==========================================

import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';

// Firebase
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// Notifications
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    max-width: 400px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

// ✅ RÔLES SYNERGIA AVEC PERMISSIONS DÉFINIES
const SYNERGIA_ROLES = {
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement des équipes',
    defaultPermissions: ['onboarding_admin', 'training_access', 'mentoring_rights'],
    adminSections: ['Onboarding', 'Formation'],
    priority: 1
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation des équipes',
    defaultPermissions: ['planning_admin', 'timetrack_admin', 'tasks_admin', 'projects_admin'],
    adminSections: ['Planning', 'Pointeuse', 'Tâches', 'Projets'],
    priority: 2
  },
  gamemaster: {
    id: 'gamemaster',
    name: 'Game Master',
    icon: '🎮',
    color: 'bg-red-500',
    description: 'Animation des sessions et management général',
    defaultPermissions: ['session_admin', 'user_management', 'analytics_admin', 'full_access'],
    adminSections: ['Sessions', 'Utilisateurs', 'Analytics', 'Système'],
    priority: 3
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Gestion de l\'image et communication',
    defaultPermissions: ['reviews_admin', 'communication_admin', 'social_media_admin'],
    adminSections: ['Avis', 'Communication', 'Réseaux Sociaux'],
    priority: 4
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de contenu et design',
    defaultPermissions: ['content_admin', 'design_admin', 'media_admin'],
    adminSections: ['Contenu', 'Design', 'Médias'],
    priority: 5
  },
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Maintenance technique et matériel',
    defaultPermissions: ['maintenance_admin', 'equipment_admin', 'technical_admin'],
    adminSections: ['Maintenance', 'Équipement', 'Technique'],
    priority: 6
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Inventaires et approvisionnements',
    defaultPermissions: ['inventory_admin', 'stock_admin', 'suppliers_admin'],
    adminSections: ['Inventaire', 'Stock', 'Fournisseurs'],
    priority: 7
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Relations externes et partenariats',
    defaultPermissions: ['partnerships_admin', 'external_relations_admin', 'marketing_admin'],
    adminSections: ['Partenariats', 'Relations Externes', 'Marketing'],
    priority: 8
  }
};

// 🔐 PERMISSIONS DISPONIBLES PAR SECTION
const SECTION_PERMISSIONS = {
  'Onboarding': [
    { id: 'onboarding_view', name: 'Consulter onboarding', icon: Eye },
    { id: 'onboarding_edit', name: 'Modifier contenu onboarding', icon: Edit },
    { id: 'onboarding_admin', name: 'Administration complète onboarding', icon: Crown }
  ],
  'Planning': [
    { id: 'planning_view', name: 'Consulter planning', icon: Calendar },
    { id: 'planning_edit', name: 'Modifier planning', icon: Edit },
    { id: 'planning_admin', name: 'Administration planning', icon: Crown }
  ],
  'Pointeuse': [
    { id: 'timetrack_view', name: 'Consulter pointages', icon: Clock },
    { id: 'timetrack_edit', name: 'Modifier pointages', icon: Edit },
    { id: 'timetrack_admin', name: 'Administration pointeuse', icon: Crown }
  ],
  'Tâches': [
    { id: 'tasks_view', name: 'Consulter tâches', icon: CheckCircle },
    { id: 'tasks_edit', name: 'Modifier tâches', icon: Edit },
    { id: 'tasks_admin', name: 'Administration tâches', icon: Crown }
  ],
  'Projets': [
    { id: 'projects_view', name: 'Consulter projets', icon: FileText },
    { id: 'projects_edit', name: 'Modifier projets', icon: Edit },
    { id: 'projects_admin', name: 'Administration projets', icon: Crown }
  ],
  'Analytics': [
    { id: 'analytics_view', name: 'Consulter analytics', icon: BarChart3 },
    { id: 'analytics_admin', name: 'Administration analytics', icon: Crown }
  ],
  'Utilisateurs': [
    { id: 'users_view', name: 'Consulter utilisateurs', icon: Users },
    { id: 'users_edit', name: 'Modifier utilisateurs', icon: Edit },
    { id: 'user_management', name: 'Gestion complète utilisateurs', icon: Crown }
  ]
};

/**
 * 🛡️ PAGE ADMINISTRATION DES PERMISSIONS PAR RÔLE
 */
const AdminRolePermissionsPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [editingRole, setEditingRole] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');
  
  // 🆕 NOUVEAUX ÉTATS POUR GESTION DES RÔLES UTILISATEURS
  const [editingMember, setEditingMember] = useState(null);
  const [showEditRolesModal, setShowEditRolesModal] = useState(false);
  const [memberRolesEditing, setMemberRolesEditing] = useState([]);
  const [savingMemberRoles, setSavingMemberRoles] = useState(false);

  /**
   * 📊 CHARGER LES DONNÉES
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les membres avec leurs rôles
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const teamMembers = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        teamMembers.push({
          id: doc.id,
          ...userData,
          synergiaRoles: userData.synergiaRoles || []
        });
      });
      
      setMembers(teamMembers);
      
      // Charger les permissions par rôle depuis Firebase
      const permissionsRef = collection(db, 'rolePermissions');
      const permissionsSnapshot = await getDocs(permissionsRef);
      
      const permissions = {};
      permissionsSnapshot.forEach((doc) => {
        permissions[doc.id] = doc.data();
      });
      
      // Initialiser les permissions par défaut si elles n'existent pas
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
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      setError('Erreur lors du chargement des données');
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 💾 SAUVEGARDER LES PERMISSIONS D'UN RÔLE
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
      
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: permissionData
      }));
      
      showNotification('Permissions mises à jour avec succès', 'success');
      setEditingRole(null);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde permissions:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  /**
   * 🆕 OUVRIR MODAL GESTION RÔLES UTILISATEUR
   */
  const openEditMemberRoles = (member) => {
    setEditingMember(member);
    // Initialiser avec les rôles actuels (juste les IDs)
    const currentRoleIds = (member.synergiaRoles || []).map(role => role.roleId);
    setMemberRolesEditing(currentRoleIds);
    setShowEditRolesModal(true);
  };

  /**
   * 🆕 TOGGLE UN RÔLE POUR UN MEMBRE
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
   * 🆕 SAUVEGARDER LES RÔLES D'UN MEMBRE
   */
  const saveMemberRoles = async () => {
    if (!editingMember) return;
    
    try {
      setSavingMemberRoles(true);
      
      // Construire le nouveau tableau de rôles
      const newSynergiaRoles = memberRolesEditing.map(roleId => {
        // Vérifier si le rôle existait déjà
        const existingRole = editingMember.synergiaRoles?.find(r => r.roleId === roleId);
        
        if (existingRole) {
          // Conserver les données existantes
          return existingRole;
        } else {
          // Créer un nouveau rôle
          const roleData = SYNERGIA_ROLES[roleId];
          return {
            roleId: roleId,
            roleName: roleData.name,
            assignedAt: new Date().toISOString(),
            assignedBy: user.uid,
            xpInRole: 0,
            tasksCompleted: 0,
            level: 'débutant',
            permissions: roleData.defaultPermissions || [],
            lastActivity: new Date().toISOString(),
            isActive: true,
            roleIcon: roleData.icon,
            roleColor: roleData.color
          };
        }
      });
      
      // Mettre à jour dans Firebase
      const userRef = doc(db, 'users', editingMember.id);
      await updateDoc(userRef, {
        synergiaRoles: newSynergiaRoles,
        lastRoleUpdate: new Date().toISOString()
      });
      
      // Mettre à jour l'état local
      setMembers(prev => prev.map(m => 
        m.id === editingMember.id 
          ? { ...m, synergiaRoles: newSynergiaRoles }
          : m
      ));
      
      showNotification('Rôles mis à jour avec succès', 'success');
      setShowEditRolesModal(false);
      setEditingMember(null);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde rôles membre:', error);
      showNotification('Erreur lors de la sauvegarde des rôles', 'error');
    } finally {
      setSavingMemberRoles(false);
    }
  };

  /**
   * 🎭 OBTENIR LES MEMBRES PAR RÔLE
   */
  const getMembersByRole = (roleId) => {
    return members.filter(member => 
      member.synergiaRoles?.some(role => role.roleId === roleId)
    );
  };

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des permissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 📊 Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Shield className="w-10 h-10 text-blue-400" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Administration des Rôles
                  </h1>
                  <p className="text-gray-400 mt-2">
                    Gérer les permissions d'administration par rôle Synergia
                  </p>
                </div>
              </div>
              
              <button 
                onClick={loadData}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>Actualiser</span>
              </button>
            </div>
          </div>

          {/* 📋 Onglets */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('roles')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                  activeTab === 'roles'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Permissions par Rôle</span>
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                  activeTab === 'members'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Membres et Accès</span>
              </button>
            </div>
          </div>

          {/* 🛡️ Contenu Permissions par Rôle */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(SYNERGIA_ROLES)
                .sort(([,a], [,b]) => a.priority - b.priority)
                .map(([roleId, roleData]) => {
                  const roleMembers = getMembersByRole(roleId);
                  const permissions = rolePermissions[roleId] || {};
                  const isEditing = editingRole === roleId;
                  
                  return (
                    <motion.div
                      key={roleId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                    >
                      {/* En-tête du rôle */}
                      <div className={`p-6 ${roleData.color} bg-opacity-20 border-b border-gray-700`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{roleData.icon}</span>
                            <div>
                              <h3 className="text-xl font-semibold text-white">{roleData.name}</h3>
                              <p className="text-gray-300 text-sm">{roleData.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{roleMembers.length}</div>
                            <div className="text-xs text-gray-400">membre{roleMembers.length > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      </div>

                      {/* Sections d'administration */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-medium">Sections d'administration</h4>
                          {!isEditing ? (
                            <button
                              onClick={() => setEditingRole(roleId)}
                              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Modifier</span>
                            </button>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveRolePermissions(roleId, permissions.permissions || [])}
                                className="flex items-center space-x-1 text-green-400 hover:text-green-300 text-sm"
                              >
                                <Save className="w-4 h-4" />
                                <span>Sauver</span>
                              </button>
                              <button
                                onClick={() => setEditingRole(null)}
                                className="flex items-center space-x-1 text-gray-400 hover:text-gray-300 text-sm"
                              >
                                <X className="w-4 h-4" />
                                <span>Annuler</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Liste des sections */}
                        <div className="space-y-3">
                          {roleData.adminSections.map(section => {
                            const sectionPermissions = SECTION_PERMISSIONS[section] || [];
                            
                            return (
                              <div key={section} className="bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-white font-medium">{section}</h5>
                                  <div className="flex items-center space-x-2">
                                    {sectionPermissions.map(permission => {
                                      const hasPermission = permissions.permissions?.includes(permission.id);
                                      const PermissionIcon = permission.icon;
                                      
                                      return (
                                        <div
                                          key={permission.id}
                                          className={`p-2 rounded transition-colors ${
                                            hasPermission 
                                              ? 'bg-green-500 text-white' 
                                              : 'bg-gray-600 text-gray-400'
                                          }`}
                                          title={permission.name}
                                        >
                                          <PermissionIcon className="w-4 h-4" />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                
                                {isEditing && (
                                  <div className="space-y-2">
                                    {sectionPermissions.map(permission => {
                                      const hasPermission = permissions.permissions?.includes(permission.id);
                                      
                                      return (
                                        <label key={permission.id} className="flex items-center space-x-3 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={hasPermission}
                                            onChange={(e) => {
                                              const currentPermissions = permissions.permissions || [];
                                              const newPermissions = e.target.checked
                                                ? [...currentPermissions, permission.id]
                                                : currentPermissions.filter(p => p !== permission.id);
                                              
                                              setRolePermissions(prev => ({
                                                ...prev,
                                                [roleId]: {
                                                  ...prev[roleId],
                                                  permissions: newPermissions
                                                }
                                              }));
                                            }}
                                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                          />
                                          <span className="text-gray-300 text-sm">{permission.name}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Membres ayant ce rôle */}
                        {roleMembers.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <h5 className="text-gray-300 text-sm font-medium mb-2">Membres avec ce rôle</h5>
                            <div className="flex flex-wrap gap-2">
                              {roleMembers.map(member => (
                                <div key={member.id} className="flex items-center space-x-2 bg-gray-700 rounded-full px-3 py-1">
                                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {(member.displayName?.[0] || member.email?.[0] || '?').toUpperCase()}
                                  </div>
                                  <span className="text-gray-300 text-xs">
                                    {member.displayName || member.email}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}

          {/* 👥 Contenu Membres et Accès */}
          {activeTab === 'members' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Membres de l'équipe et leurs accès</h3>
                <p className="text-gray-400">Vue d'ensemble des permissions par membre</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {members.map(member => {
                    const memberRoles = member.synergiaRoles || [];
                    const allPermissions = new Set();
                    
                    // Collecter toutes les permissions du membre
                    memberRoles.forEach(memberRole => {
                      const rolePermissionData = rolePermissions[memberRole.roleId];
                      if (rolePermissionData?.permissions) {
                        rolePermissionData.permissions.forEach(permission => 
                          allPermissions.add(permission)
                        );
                      }
                    });
                    
                    return (
                      <div key={member.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {(member.displayName?.[0] || member.email?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">
                                {member.displayName || member.email}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {memberRoles.length} rôle{memberRoles.length > 1 ? 's' : ''} • {allPermissions.size} permission{allPermissions.size > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {/* 🆕 BOUTON GÉRER LES RÔLES */}
                            <button
                              onClick={() => openEditMemberRoles(member)}
                              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Gérer rôles</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowMemberModal(true);
                              }}
                              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Détails</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Rôles du membre */}
                        {memberRoles.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {memberRoles.map(memberRole => {
                              const roleData = SYNERGIA_ROLES[memberRole.roleId];
                              if (!roleData) return null;
                              
                              return (
                                <div key={memberRole.roleId} className="flex items-center space-x-1 bg-gray-600 rounded px-2 py-1">
                                  <span className="text-sm">{roleData.icon}</span>
                                  <span className="text-gray-300 text-xs">{roleData.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-3 text-gray-500 text-sm italic">
                            Aucun rôle assigné
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 🆕 MODAL GESTION DES RÔLES D'UN MEMBRE */}
          <AnimatePresence>
            {showEditRolesModal && editingMember && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Gérer les rôles de {editingMember.displayName || editingMember.email}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Cochez les rôles à assigner à ce membre
                      </p>
                    </div>
                    <button
                      onClick={() => setShowEditRolesModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Liste des rôles disponibles */}
                  <div className="space-y-3 mb-6">
                    {Object.entries(SYNERGIA_ROLES)
                      .sort(([,a], [,b]) => a.priority - b.priority)
                      .map(([roleId, roleData]) => {
                        const isChecked = memberRolesEditing.includes(roleId);
                        
                        return (
                          <label
                            key={roleId}
                            className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isChecked
                                ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMemberRole(roleId)}
                              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-2xl">{roleData.icon}</span>
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{roleData.name}</h4>
                              <p className="text-gray-400 text-sm">{roleData.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {roleData.adminSections.map(section => (
                                  <span key={section} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                                    {section}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowEditRolesModal(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      disabled={savingMemberRoles}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={saveMemberRoles}
                      disabled={savingMemberRoles}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingMemberRoles ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sauvegarde...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Sauvegarder</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🔍 Modal détails membre */}
          <AnimatePresence>
            {showMemberModal && selectedMember && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Permissions de {selectedMember.displayName || selectedMember.email}
                    </h3>
                    <button
                      onClick={() => setShowMemberModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedMember.synergiaRoles && selectedMember.synergiaRoles.length > 0 ? (
                      selectedMember.synergiaRoles.map(memberRole => {
                        const roleData = SYNERGIA_ROLES[memberRole.roleId];
                        const rolePermissionData = rolePermissions[memberRole.roleId];
                        
                        if (!roleData) return null;
                        
                        return (
                          <div key={memberRole.roleId} className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="text-2xl">{roleData.icon}</span>
                              <div>
                                <h4 className="text-white font-medium">{roleData.name}</h4>
                                <p className="text-gray-400 text-sm">
                                  Assigné le {memberRole.assignedAt ? new Date(memberRole.assignedAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Sections accessibles */}
                            <div className="space-y-2">
                              <h5 className="text-gray-300 text-sm font-medium">Sections accessibles:</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {roleData.adminSections.map(section => (
                                  <div key={section} className="bg-gray-600 rounded px-3 py-2">
                                    <span className="text-gray-300 text-sm">{section}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Permissions détaillées */}
                            {rolePermissionData?.permissions && (
                              <div className="mt-3 space-y-2">
                                <h5 className="text-gray-300 text-sm font-medium">Permissions:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {rolePermissionData.permissions.map(permission => (
                                    <span key={permission} className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
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
                        <p>Aucun rôle assigné à ce membre</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default AdminRolePermissionsPage;
