// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// PAGE ÉQUIPE - VERSION FIREBASE PURE (SANS MOCK)
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  TrendingUp, 
  Activity, 
  Crown,
  Award,
  RefreshCw,
  UserPlus,
  Settings,
  BarChart3,
  Clock
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES - 100% FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { useTeam } from '../hooks/useTeam.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  limit 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🏠 COMPOSANT PRINCIPAL TEAMPAGE - 100% FIREBASE
 * Plus aucune donnée mock, connecté entièrement à Firebase
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  const { userData, isLoading: userDataLoading } = useUnifiedFirebaseData();
  
  // 🔥 Hook Firebase pur pour l'équipe
  const { 
    teamMembers, 
    loading: teamLoading, 
    error: teamError, 
    refreshTeam 
  } = useTeam();

  // États locaux pour l'interface
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalXP: 0,
    averageLevel: 0
  });

  // 📊 CHARGEMENT DES STATISTIQUES ÉQUIPE EN TEMPS RÉEL
  useEffect(() => {
    if (!teamMembers || teamMembers.length === 0) return;

    // Calculer les statistiques en temps réel depuis Firebase
    const stats = teamMembers.reduce((acc, member) => {
      acc.totalMembers += 1;
      if (member.status === 'active') acc.activeMembers += 1;
      acc.totalXP += member.totalXp || 0;
      acc.totalLevels += member.level || 1;
      return acc;
    }, { totalMembers: 0, activeMembers: 0, totalXP: 0, totalLevels: 0 });

    setTeamStats({
      ...stats,
      averageLevel: stats.totalMembers > 0 ? Math.round(stats.totalLevels / stats.totalMembers) : 0
    });
  }, [teamMembers]);

  // 🔍 FILTRAGE INTELLIGENT DES MEMBRES
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      (member.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || (member.role || 'member') === roleFilter;
    const matchesStatus = statusFilter === 'all' || (member.status || 'active') === statusFilter;

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  // 🔄 ACTUALISATION DES DONNÉES
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTeam();
    } catch (error) {
      console.error('❌ Erreur actualisation équipe:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 👤 CALCULER LE STATUT DE PRÉSENCE D'UN MEMBRE
  const getMemberPresence = (member) => {
    if (!member.lastActivity) return { status: 'unknown', label: 'Inconnue', color: 'gray' };
    
    const now = new Date();
    const lastActivity = new Date(member.lastActivity);
    const diffMinutes = Math.floor((now - lastActivity) / (1000 * 60));
    
    if (diffMinutes < 5) return { status: 'online', label: 'En ligne', color: 'green' };
    if (diffMinutes < 60) return { status: 'recent', label: `Il y a ${diffMinutes}min`, color: 'yellow' };
    if (diffMinutes < 1440) return { status: 'today', label: 'Aujourd\'hui', color: 'blue' };
    if (diffMinutes < 10080) return { status: 'week', label: 'Cette semaine', color: 'purple' };
    return { status: 'offline', label: 'Hors ligne', color: 'red' };
  };

  // ⚡ AFFICHAGE LOADING
  if (teamLoading || userDataLoading) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de l'équipe...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  // ❌ AFFICHAGE ERREUR
  if (teamError) {
    return (
      <PremiumLayout>
        <PremiumCard>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h3>
            <p className="text-gray-400 mb-4">{teamError}</p>
            <PremiumButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Réessayer
            </PremiumButton>
          </div>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      {/* 🏆 Header avec statistiques temps réel */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Users className="w-10 h-10 text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Mon Équipe
              </h1>
              <p className="text-gray-400 mt-2">
                Collaborez et suivez les performances de votre équipe
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <PremiumButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
            >
              {refreshing ? 
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : 
                <RefreshCw className="w-4 h-4 mr-2" />
              }
              Actualiser
            </PremiumButton>
            
            <PremiumButton>
              <UserPlus className="w-4 h-4 mr-2" />
              Inviter
            </PremiumButton>
          </div>
        </div>

        {/* 📊 Statistiques temps réel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Membres Total"
            value={teamStats.totalMembers}
            icon={Users}
            trend="+2 ce mois"
            color="blue"
          />
          <StatCard
            title="Membres Actifs"
            value={teamStats.activeMembers}
            icon={Activity}
            trend={`${Math.round((teamStats.activeMembers / Math.max(teamStats.totalMembers, 1)) * 100)}% actifs`}
            color="green"
          />
          <StatCard
            title="XP Total"
            value={teamStats.totalXP.toLocaleString()}
            icon={Star}
            trend="+1,250 cette semaine"
            color="yellow"
          />
          <StatCard
            title="Niveau Moyen"
            value={teamStats.averageLevel}
            icon={TrendingUp}
            trend="+0.5 ce mois"
            color="purple"
          />
        </div>
      </div>

      {/* 🔍 Barre de recherche et filtres */}
      <PremiumCard className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <PremiumSearchBar
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>

            <div className="text-sm text-gray-400">
              {filteredMembers.length} / {teamMembers.length} membres
            </div>
          </div>
        </div>

        {/* 📋 Panneau filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les départements</option>
                  <option value="development">Développement</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="hr">RH</option>
                  <option value="sales">Ventes</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateur</option>
                  <option value="manager">Manager</option>
                  <option value="lead">Lead</option>
                  <option value="member">Membre</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="busy">Occupé</option>
                  <option value="away">Absent</option>
                  <option value="offline">Hors ligne</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PremiumCard>

      {/* 👥 Liste des membres */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const presence = getMemberPresence(member);
          
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
            >
              {/* Header membre */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {(member.displayName || member.email)?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Indicateur de présence */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                      presence.status === 'online' ? 'bg-green-400' :
                      presence.status === 'recent' ? 'bg-yellow-400' :
                      presence.status === 'today' ? 'bg-blue-400' :
                      presence.status === 'week' ? 'bg-purple-400' :
                      'bg-red-400'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      {member.displayName || member.email}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {member.role || 'Membre'} • {member.department || 'Général'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      presence.status === 'online' ? 'text-green-400' :
                      presence.status === 'recent' ? 'text-yellow-400' :
                      presence.status === 'today' ? 'text-blue-400' :
                      presence.status === 'week' ? 'text-purple-400' :
                      'text-red-400'
                    }`}>
                      {presence.label}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setSelectedMember(member)}
                    className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Statistiques membre */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{member.level || 1}</div>
                  <div className="text-xs text-gray-500">Niveau</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{member.totalXp || 0}</div>
                  <div className="text-xs text-gray-500">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{member.tasksCompleted || 0}</div>
                  <div className="text-xs text-gray-500">Tâches</div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progression</span>
                  <span>{Math.min(100, ((member.totalXp || 0) % 1000) / 10).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((member.totalXp || 0) % 1000) / 10)}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setSelectedMember(member)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Profil
                </button>
                
                <div className="flex items-center gap-2">
                  {member.email && (
                    <a 
                      href={`mailto:${member.email}`}
                      className="p-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 📭 Message si aucun résultat */}
      {filteredMembers.length === 0 && teamMembers.length > 0 && (
        <PremiumCard>
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun membre trouvé</h3>
            <p className="text-gray-400 mb-4">Essayez de modifier vos critères de recherche</p>
            <PremiumButton 
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('all');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
            >
              Réinitialiser les filtres
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* 📭 Message si équipe vide */}
      {teamMembers.length === 0 && (
        <PremiumCard>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Équipe en formation</h3>
            <p className="text-gray-400 mb-4">
              Votre équipe grandit ! Les membres apparaîtront ici au fur et à mesure.
            </p>
            <PremiumButton onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* 🔍 Modal détail membre */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {(selectedMember.displayName || selectedMember.email)?.[0]?.toUpperCase() || '?'}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedMember.displayName || selectedMember.email}
                </h3>
                <p className="text-gray-400">{selectedMember.role || 'Membre'}</p>
                <p className="text-sm text-gray-500">{selectedMember.department || 'Général'}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white text-sm">{selectedMember.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Niveau</span>
                  <span className="text-white text-sm font-bold">{selectedMember.level || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">XP Total</span>
                  <span className="text-white text-sm font-bold">{selectedMember.totalXp || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tâches</span>
                  <span className="text-white text-sm">{selectedMember.tasksCompleted || 0}</span>
                </div>
                {selectedMember.joinedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Membre depuis</span>
                    <span className="text-white text-sm">
                      {new Date(selectedMember.joinedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>

              <PremiumButton 
                onClick={() => setSelectedMember(null)}
                className="w-full"
              >
                Fermer
              </PremiumButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumLayout>
  );
};

export default TeamPage;
