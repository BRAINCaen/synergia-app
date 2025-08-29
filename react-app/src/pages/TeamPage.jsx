// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// PAGE ÉQUIPE COMPLÈTE AVEC MENU HAMBURGER IDENTIQUE AU DASHBOARD
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Search,
  Filter,
  Mail,
  MessageCircle,
  Star,
  Trophy,
  Zap,
  TrendingUp,
  Eye,
  Target,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  MapPin,
  Phone
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AU DASHBOARD)
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const TeamPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);
  
  // 📊 ÉTATS TEAM PAGE
  const [teamMembers, setTeamMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeView, setActiveView] = useState('grid'); // grid, list, stats
  
  // 📊 CHARGEMENT DES DONNÉES ÉQUIPE DEPUIS FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [TEAM] Chargement des membres de l\'équipe...');
    setLoading(true);

    // Charger tous les utilisateurs
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('displayName', 'asc')
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          uid: doc.id,
          name: userData.displayName || userData.email || 'Utilisateur',
          email: userData.email || '',
          role: userData.role || 'member',
          department: userData.department || 'Non défini',
          status: userData.isOnline ? 'actif' : 'inactif',
          isOnline: userData.isOnline || false,
          avatar: userData.photoURL || '',
          totalXp: userData.totalXp || 0,
          level: userData.level || 1,
          badges: userData.badges || [],
          tasksCompleted: userData.tasksCompleted || 0,
          projectsCreated: userData.projectsCreated || 0,
          completionRate: userData.completionRate || 0,
          lastActivity: userData.lastActivity || new Date(),
          joinDate: userData.createdAt || new Date(),
          bio: userData.bio || '',
          skills: userData.skills || [],
          location: userData.location || '',
          phone: userData.phone || ''
        });
      });
      
      console.log(`✅ [TEAM] ${users.length} membres chargés`);
      setTeamMembers(users);
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid]);

  // 📨 CHARGEMENT DES MESSAGES (SIMULATION)
  useEffect(() => {
    // Simulation de messages pour l'affichage
    setMessages([
      {
        id: 1,
        from: 'Alan Boehme',
        subject: 'Réunion équipe',
        preview: 'Prochaine réunion prévue pour demain...',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        from: 'Leo Mercier',
        subject: 'Nouveau projet',
        preview: 'J\'ai une idée pour améliorer...',
        timestamp: new Date(Date.now() - 3600000),
        read: true
      }
    ]);
  }, []);

  /**
   * 🎯 NOTIFICATION SYSTÈME
   */
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 999999;
      padding: 12px 24px; border-radius: 8px; color: white;
      font-size: 14px; font-weight: 500; opacity: 1;
      transition: opacity 0.3s ease;
    `;
    notification.className = `notification ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  /**
   * 🔍 FILTRER LES MEMBRES
   */
  const filteredMembers = teamMembers.filter(member => {
    // Filtre recherche
    const matchesSearch = !searchTerm || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre département
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    
    // Filtre rôle
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase().includes(roleFilter.toLowerCase());
    
    // Filtre statut
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  /**
   * 📊 STATISTIQUES D'ÉQUIPE
   */
  const teamStats = {
    totalMembers: teamMembers.length,
    activeMembers: teamMembers.filter(m => m.status === 'actif').length,
    totalXP: teamMembers.reduce((sum, m) => sum + (m.totalXp || 0), 0),
    averageLevel: teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.level || 0), 0) / teamMembers.length)
      : 0,
    onlineMembers: teamMembers.filter(m => m.isOnline).length,
    completionRate: teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.completionRate || 0), 0) / teamMembers.length)
      : 0
  };

  // Départements uniques pour les filtres
  const departments = ['all', ...new Set(teamMembers.map(m => m.department).filter(Boolean))];
  const roles = ['all', ...new Set(teamMembers.map(m => m.role).filter(Boolean))];
  const unreadCount = messages.filter(m => !m.read).length;

  // Statistiques header
  const headerStats = [
    { 
      label: "Membres Total", 
      value: teamStats.totalMembers, 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Membres Actifs", 
      value: teamStats.activeMembers, 
      icon: TrendingUp, 
      color: "text-green-400" 
    },
    { 
      label: "XP Total", 
      value: teamStats.totalXP.toLocaleString(), 
      icon: Zap, 
      color: "text-yellow-400" 
    },
    { 
      label: "Messages", 
      value: `${unreadCount}/${messages.length}`, 
      icon: MessageCircle, 
      color: unreadCount > 0 ? "text-red-400" : "text-gray-400" 
    }
  ];

  /**
   * 📤 GESTION ACTIONS ÉQUIPE
   */
  const handleContactMember = (member) => {
    if (member.email) {
      window.location.href = `mailto:${member.email}`;
      showNotification(`Email envoyé à ${member.name}`, 'success');
    }
  };

  const handleViewProfile = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white text-lg">Chargement de l'équipe...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 🏆 EN-TÊTE TEAM PAGE AVEC STATS */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Users className="w-8 h-8 text-purple-400" />
                  Mon Équipe
                </h1>
                <p className="text-gray-300">
                  Collaborez et suivez les performances de votre équipe ({teamStats.totalMembers} membres)
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView(activeView === 'grid' ? 'list' : 'grid')}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {activeView === 'grid' ? 'Vue Liste' : 'Vue Grille'}
                </motion.button>
                
                {userIsAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Inviter
                  </motion.button>
                )}
              </div>
            </div>

            {/* 📊 STATISTIQUES ÉQUIPE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {headerStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {stat.label}
                      </div>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 🔍 FILTRES ET RECHERCHE */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un membre..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Filtre Département */}
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'Tous les départements' : dept}
                    </option>
                  ))}
                </select>

                {/* Filtre Rôle */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role === 'all' ? 'Tous les rôles' : role}
                    </option>
                  ))}
                </select>

                {/* Filtre Statut */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actifs</option>
                  <option value="inactif">Inactifs</option>
                </select>
              </div>
            </div>
          </div>

          {/* 👥 LISTE DES MEMBRES */}
          <div className="mb-8">
            {activeView === 'grid' ? (
              // Vue Grille
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 group"
                  >
                    {/* Avatar et statut */}
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                          member.isOnline ? 'bg-green-400' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-sm text-gray-400">{member.role}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{member.totalXp}</div>
                        <div className="text-xs text-gray-400">XP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">Niv.{member.level}</div>
                        <div className="text-xs text-gray-400">Niveau</div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center justify-center mb-4">
                      <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-300">{member.badges.length} badges</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(member)}
                        className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Profil
                      </button>
                      <button
                        onClick={() => handleContactMember(member)}
                        className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        Contact
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // Vue Liste
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Membre</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rôle</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">XP</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Niveau</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Statut</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                                  member.isOnline ? 'bg-green-400' : 'bg-gray-500'
                                }`} />
                              </div>
                              <div className="ml-3">
                                <div className="font-semibold text-white">{member.name}</div>
                                <div className="text-sm text-gray-400">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{member.role}</td>
                          <td className="px-6 py-4 text-yellow-400 font-semibold">{member.totalXp}</td>
                          <td className="px-6 py-4 text-purple-400 font-semibold">Niv.{member.level}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.status === 'actif' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleViewProfile(member)}
                                className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleContactMember(member)}
                                className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className="text-center text-gray-400">
            Affichage de {filteredMembers.length} membre(s) sur {teamMembers.length}
          </div>
        </div>
      </div>

      {/* 🔍 MODAL PROFIL MEMBRE */}
      <AnimatePresence>
        {showMemberModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMemberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                    {selectedMember.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedMember.name}</h2>
                  <p className="text-gray-400">{selectedMember.role} - {selectedMember.department}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{selectedMember.totalXp}</div>
                    <div className="text-sm text-gray-400">XP Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">Niv.{selectedMember.level}</div>
                    <div className="text-sm text-gray-400">Niveau</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{selectedMember.badges.length}</div>
                    <div className="text-sm text-gray-400">Badges</div>
                  </div>
                </div>

                {/* Informations */}
                <div className="space-y-4 mb-6">
                  {selectedMember.bio && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Bio</h3>
                      <p className="text-white">{selectedMember.bio}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Tâches terminées</h3>
                      <p className="text-white">{selectedMember.tasksCompleted}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Projets créés</h3>
                      <p className="text-white">{selectedMember.projectsCreated}</p>
                    </div>
                  </div>
                  
                  {selectedMember.location && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Localisation</h3>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="w-4 h-4" />
                        {selectedMember.location}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowMemberModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                  {selectedMember.email && (
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h4 className="text-gray-400 font-mono text-sm mb-2">Debug Info:</h4>
          <pre className="text-xs text-gray-500">
            {JSON.stringify({ 
              totalUsers: teamMembers.length,
              filteredUsers: filteredMembers.length,
              messagesCount: messages.length,
              unreadCount,
              departments: departments.length - 1, // -1 pour "all"
              roles: roles.length - 1
            }, null, 2)}
          </pre>
        </div>
      )}
    </Layout>
  );
};

export default TeamPage;
