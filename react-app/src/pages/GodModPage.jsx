// ==========================================
// react-app/src/pages/GodModPage.jsx
// GODMOD - CONTROLE TOTAL SYSTEME SYNERGIA
// Accessible UNIQUEMENT par alan.boehme61@gmail.com
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Shield, Zap, Users, Award, Gift, Target, TrendingUp,
  X, Check, AlertTriangle, Edit, Trash2, RefreshCw, Search,
  Filter, Calendar, Clock, Database, Activity, FileText, Download,
  Eye, CheckCircle, XCircle, AlertCircle, Info, Plus, Save,
  BookOpen, MessageSquare, Star, Heart, Briefcase, GraduationCap,
  UserPlus, Settings, BarChart3, Layers, Flag, Medal, Coffee,
  Sparkles, ChevronDown, ChevronRight, Copy, MoreVertical
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import {
  collection, doc, getDocs, getDoc, updateDoc, deleteDoc, addDoc,
  query, where, orderBy, serverTimestamp, increment, limit as firestoreLimit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { BADGE_DEFINITIONS } from '../core/services/badgeDefinitions.js';

// ==========================================
// CONSTANTES
// ==========================================

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'purple' },
  { id: 'users', label: 'Utilisateurs', icon: Users, color: 'blue' },
  { id: 'quests', label: 'Quetes', icon: Target, color: 'green' },
  { id: 'badges', label: 'Badges', icon: Award, color: 'yellow' },
  { id: 'campaigns', label: 'Campagnes', icon: Flag, color: 'orange' },
  { id: 'formations', label: 'Formations', icon: GraduationCap, color: 'cyan' },
  { id: 'interviews', label: 'Entretiens 360', icon: MessageSquare, color: 'pink' },
  { id: 'rewards', label: 'Recompenses', icon: Gift, color: 'red' },
  { id: 'sponsorships', label: 'Parrainages', icon: UserPlus, color: 'indigo' },
  { id: 'history', label: 'Historique', icon: Clock, color: 'gray' },
  { id: 'settings', label: 'Parametres', icon: Settings, color: 'slate' }
];

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

const GodModPage = () => {
  const { user } = useAuthStore();

  // Etats principaux
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Donnees
  const [allUsers, setAllUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [allFormations, setAllFormations] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);
  const [allRewards, setAllRewards] = useState([]);
  const [allSponsorships, setAllSponsorships] = useState([]);
  const [allValidations, setAllValidations] = useState([]);
  const [historyEvents, setHistoryEvents] = useState([]);

  // Modals
  const [editModal, setEditModal] = useState({ open: false, type: null, data: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, data: null });

  // Verification GODMOD
  const isGodMode = user?.email === 'alan.boehme61@gmail.com';

  // ==========================================
  // CHARGEMENT DES DONNEES
  // ==========================================

  useEffect(() => {
    if (isGodMode) {
      loadAllData();
    }
  }, [isGodMode, refreshKey]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔄 [GODMOD] Chargement complet...');

      // Charger en parallele
      const [
        usersSnap, tasksSnap, campaignsSnap, formationsSnap,
        interviewsSnap, rewardsSnap, sponsorshipsSnap, validationsSnap
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), firestoreLimit(500))),
        getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'), firestoreLimit(200))),
        getDocs(query(collection(db, 'mentoring_sessions'), orderBy('createdAt', 'desc'), firestoreLimit(200))),
        getDocs(collection(db, 'interviews_360')),
        getDocs(collection(db, 'rewards')),
        getDocs(collection(db, 'sponsorships')),
        getDocs(query(collection(db, 'task_validations'), orderBy('submittedAt', 'desc'), firestoreLimit(500)))
      ]);

      setAllUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllTasks(tasksSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllCampaigns(campaignsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllFormations(formationsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllInterviews(interviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllRewards(rewardsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllSponsorships(sponsorshipsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllValidations(validationsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Charger historique
      await loadHistory();

      console.log('✅ [GODMOD] Donnees chargees');
    } catch (error) {
      console.error('❌ [GODMOD] Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const events = [];

      // Validations
      allValidations.forEach(v => {
        events.push({
          id: `val-${v.id}`,
          type: 'validation',
          action: v.status === 'approved' ? 'Quete validee' : v.status === 'rejected' ? 'Quete rejetee' : 'Quete en attente',
          user: v.userName || 'Inconnu',
          details: `${v.taskTitle || 'Sans titre'} - ${v.xpAmount || 0} XP`,
          timestamp: v.submittedAt,
          color: v.status === 'approved' ? 'green' : v.status === 'rejected' ? 'red' : 'yellow'
        });
      });

      // Trier par date
      events.sort((a, b) => {
        const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp) || new Date(0);
        const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp) || new Date(0);
        return dateB - dateA;
      });

      setHistoryEvents(events);
    } catch (error) {
      console.error('Erreur historique:', error);
    }
  };

  // ==========================================
  // STATS DASHBOARD
  // ==========================================

  const stats = useMemo(() => {
    const totalXp = allUsers.reduce((sum, u) => sum + (u.gamification?.totalXp || 0), 0);
    const totalBadges = allUsers.reduce((sum, u) => sum + (u.gamification?.badges?.length || 0), 0);
    const activeQuests = allTasks.filter(t => t.status === 'active' || !t.status).length;
    const pendingValidations = allValidations.filter(v => v.status === 'pending').length;
    const activeCampaigns = allCampaigns.filter(c => c.status === 'active').length;
    const activeFormations = allFormations.filter(f => f.status === 'in_progress' || f.status === 'scheduled').length;

    return {
      totalUsers: allUsers.length,
      totalXp,
      totalBadges,
      activeQuests,
      pendingValidations,
      activeCampaigns,
      activeFormations,
      totalInterviews: allInterviews.length,
      totalRewards: allRewards.length,
      totalSponsorships: allSponsorships.length
    };
  }, [allUsers, allTasks, allValidations, allCampaigns, allFormations, allInterviews, allRewards, allSponsorships]);

  // ==========================================
  // ACTIONS CRUD
  // ==========================================

  const handleEdit = (type, data) => {
    setEditModal({ open: true, type, data });
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Supprimer cet element ?')) return;

    try {
      const collectionMap = {
        user: 'users',
        quest: 'tasks',
        campaign: 'projects',
        formation: 'mentoring_sessions',
        interview: 'interviews_360',
        reward: 'rewards',
        sponsorship: 'sponsorships'
      };

      await deleteDoc(doc(db, collectionMap[type], id));
      alert('Supprime !');
      setRefreshKey(k => k + 1);
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleSave = async (type, data) => {
    try {
      const collectionMap = {
        user: 'users',
        quest: 'tasks',
        campaign: 'projects',
        formation: 'mentoring_sessions',
        interview: 'interviews_360',
        reward: 'rewards',
        sponsorship: 'sponsorships',
        badge: 'user_badges'
      };

      if (data.id) {
        // Update
        const { id, ...updateData } = data;
        await updateDoc(doc(db, collectionMap[type], id), {
          ...updateData,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid
        });
      } else {
        // Create
        await addDoc(collection(db, collectionMap[type]), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }

      setEditModal({ open: false, type: null, data: null });
      setRefreshKey(k => k + 1);
      alert('Enregistre !');
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // Modifier XP utilisateur
  const modifyUserXp = async (userId, amount, reason) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('Utilisateur non trouve');

      const userData = userSnap.data();
      const currentXp = userData.gamification?.totalXp || 0;

      await updateDoc(userRef, {
        'gamification.totalXp': currentXp + amount,
        'gamification.xp': (userData.gamification?.xp || 0) + amount,
        godModHistory: [...(userData.godModHistory || []), {
          type: 'xp_modification',
          amount,
          reason,
          adjustedBy: user.uid,
          adjustedAt: new Date().toISOString(),
          previousXp: currentXp
        }]
      });

      setRefreshKey(k => k + 1);
      return true;
    } catch (error) {
      alert('Erreur: ' + error.message);
      return false;
    }
  };

  // Attribuer un badge
  const assignBadge = async (userId, badgeId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('Utilisateur non trouve');

      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];

      // Verifier si deja attribue
      if (currentBadges.some(b => b.id === badgeId)) {
        alert('Badge deja attribue !');
        return false;
      }

      const badgeDef = BADGE_DEFINITIONS[badgeId];
      if (!badgeDef) {
        alert('Badge non trouve dans les definitions');
        return false;
      }

      const newBadge = {
        id: badgeId,
        name: badgeDef.name,
        icon: badgeDef.icon,
        xpReward: badgeDef.xpReward || 50,
        unlockedAt: new Date().toISOString(),
        assignedBy: 'GODMOD'
      };

      await updateDoc(userRef, {
        'gamification.badges': [...currentBadges, newBadge],
        'gamification.badgesUnlocked': currentBadges.length + 1,
        'gamification.totalXp': (userData.gamification?.totalXp || 0) + (badgeDef.xpReward || 50)
      });

      alert(`Badge "${badgeDef.name}" attribue !`);
      setRefreshKey(k => k + 1);
      return true;
    } catch (error) {
      alert('Erreur: ' + error.message);
      return false;
    }
  };

  // Retirer un badge
  const removeBadge = async (userId, badgeId) => {
    if (!confirm('Retirer ce badge ?')) return false;

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('Utilisateur non trouve');

      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];
      const badgeToRemove = currentBadges.find(b => b.id === badgeId);

      if (!badgeToRemove) {
        alert('Badge non trouve');
        return false;
      }

      const updatedBadges = currentBadges.filter(b => b.id !== badgeId);
      const xpToRemove = badgeToRemove.xpReward || 0;

      await updateDoc(userRef, {
        'gamification.badges': updatedBadges,
        'gamification.badgesUnlocked': updatedBadges.length,
        'gamification.totalXp': Math.max(0, (userData.gamification?.totalXp || 0) - xpToRemove)
      });

      alert('Badge retire !');
      setRefreshKey(k => k + 1);
      return true;
    } catch (error) {
      alert('Erreur: ' + error.message);
      return false;
    }
  };

  // ==========================================
  // ACCES REFUSE
  // ==========================================

  if (!isGodMode) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-gray-900 to-black">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-12 bg-red-900/20 backdrop-blur-xl rounded-3xl border border-red-500/30"
          >
            <Shield className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-red-500 mb-4">ACCES REFUSE</h1>
            <p className="text-gray-300">Zone reservee a l'administrateur principal.</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // CHARGEMENT
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black">
          <div className="text-center">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
            <p className="text-white text-xl">Chargement GODMOD...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // RENDU PRINCIPAL
  // ==========================================

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black p-4 sm:p-6">
        <div className="max-w-[1800px] mx-auto">

          {/* HEADER */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 mb-6"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">
                    GODMOD
                  </h1>
                  <p className="text-gray-400">Controle Total Synergia</p>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="flex flex-wrap gap-3">
                <StatBadge label="Users" value={stats.totalUsers} color="blue" />
                <StatBadge label="XP Total" value={stats.totalXp.toLocaleString()} color="yellow" />
                <StatBadge label="Badges" value={stats.totalBadges} color="purple" />
                <StatBadge label="En attente" value={stats.pendingValidations} color="orange" />
              </div>
            </div>
          </motion.div>

          {/* RECHERCHE */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700/50 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Actualiser
              </button>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 mb-6 overflow-hidden">
            <div className="flex overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CONTENU */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 p-6">
            <AnimatePresence mode="wait">
              {/* DASHBOARD */}
              {activeTab === 'dashboard' && (
                <TabContent key="dashboard">
                  <DashboardTab stats={stats} users={allUsers} />
                </TabContent>
              )}

              {/* UTILISATEURS */}
              {activeTab === 'users' && (
                <TabContent key="users">
                  <UsersTab
                    users={allUsers}
                    searchTerm={searchTerm}
                    onEdit={(u) => handleEdit('user', u)}
                    onModifyXp={modifyUserXp}
                    onAssignBadge={assignBadge}
                    onRemoveBadge={removeBadge}
                  />
                </TabContent>
              )}

              {/* QUETES */}
              {activeTab === 'quests' && (
                <TabContent key="quests">
                  <QuestsTab
                    quests={allTasks}
                    validations={allValidations}
                    users={allUsers}
                    searchTerm={searchTerm}
                    onEdit={(q) => handleEdit('quest', q)}
                    onDelete={(id) => handleDelete('quest', id)}
                    onRefresh={() => setRefreshKey(k => k + 1)}
                  />
                </TabContent>
              )}

              {/* BADGES */}
              {activeTab === 'badges' && (
                <TabContent key="badges">
                  <BadgesTab
                    users={allUsers}
                    searchTerm={searchTerm}
                    onAssignBadge={assignBadge}
                    onRemoveBadge={removeBadge}
                  />
                </TabContent>
              )}

              {/* CAMPAGNES */}
              {activeTab === 'campaigns' && (
                <TabContent key="campaigns">
                  <CampaignsTab
                    campaigns={allCampaigns}
                    users={allUsers}
                    searchTerm={searchTerm}
                    onEdit={(c) => handleEdit('campaign', c)}
                    onDelete={(id) => handleDelete('campaign', id)}
                    onSave={(data) => handleSave('campaign', data)}
                  />
                </TabContent>
              )}

              {/* FORMATIONS */}
              {activeTab === 'formations' && (
                <TabContent key="formations">
                  <FormationsTab
                    formations={allFormations}
                    users={allUsers}
                    searchTerm={searchTerm}
                    onEdit={(f) => handleEdit('formation', f)}
                    onDelete={(id) => handleDelete('formation', id)}
                    onSave={(data) => handleSave('formation', data)}
                  />
                </TabContent>
              )}

              {/* ENTRETIENS 360 */}
              {activeTab === 'interviews' && (
                <TabContent key="interviews">
                  <InterviewsTab
                    interviews={allInterviews}
                    users={allUsers}
                    searchTerm={searchTerm}
                    onEdit={(i) => handleEdit('interview', i)}
                    onDelete={(id) => handleDelete('interview', id)}
                    onSave={(data) => handleSave('interview', data)}
                  />
                </TabContent>
              )}

              {/* RECOMPENSES */}
              {activeTab === 'rewards' && (
                <TabContent key="rewards">
                  <RewardsTab
                    rewards={allRewards}
                    searchTerm={searchTerm}
                    onEdit={(r) => handleEdit('reward', r)}
                    onDelete={(id) => handleDelete('reward', id)}
                    onSave={(data) => handleSave('reward', data)}
                  />
                </TabContent>
              )}

              {/* PARRAINAGES */}
              {activeTab === 'sponsorships' && (
                <TabContent key="sponsorships">
                  <SponsorshipsTab
                    sponsorships={allSponsorships}
                    users={allUsers}
                    searchTerm={searchTerm}
                    onEdit={(s) => handleEdit('sponsorship', s)}
                    onDelete={(id) => handleDelete('sponsorship', id)}
                    onSave={(data) => handleSave('sponsorship', data)}
                  />
                </TabContent>
              )}

              {/* HISTORIQUE */}
              {activeTab === 'history' && (
                <TabContent key="history">
                  <HistoryTab
                    events={historyEvents}
                    users={allUsers}
                    searchTerm={searchTerm}
                  />
                </TabContent>
              )}

              {/* PARAMETRES */}
              {activeTab === 'settings' && (
                <TabContent key="settings">
                  <SettingsTab
                    users={allUsers}
                    onRefresh={() => setRefreshKey(k => k + 1)}
                  />
                </TabContent>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MODAL EDITION */}
        <EditModal
          {...editModal}
          onClose={() => setEditModal({ open: false, type: null, data: null })}
          onSave={handleSave}
          users={allUsers}
        />
      </div>
    </Layout>
  );
};

// ==========================================
// COMPOSANTS UTILITAIRES
// ==========================================

const StatBadge = ({ label, value, color }) => (
  <div className={`px-4 py-2 bg-${color}-500/20 border border-${color}-500/30 rounded-lg`}>
    <div className={`text-lg font-bold text-${color}-400`}>{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);

const TabContent = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title, count, action }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-white flex items-center gap-3">
      <Icon className="w-6 h-6 text-purple-400" />
      {title}
      {count !== undefined && (
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
          {count}
        </span>
      )}
    </h2>
    {action}
  </div>
);

const DataCard = ({ children, className = '' }) => (
  <div className={`bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all ${className}`}>
    {children}
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, color = 'purple', small = false }) => (
  <button
    onClick={onClick}
    className={`${small ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} bg-${color}-600 hover:bg-${color}-700 text-white rounded-lg font-medium flex items-center gap-1 transition-all`}
  >
    <Icon className={small ? 'w-3 h-3' : 'w-4 h-4'} />
    {label && <span>{label}</span>}
  </button>
);

// ==========================================
// TAB: DASHBOARD
// ==========================================

const DashboardTab = ({ stats, users }) => {
  // Top users par XP
  const topUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => (b.gamification?.totalXp || 0) - (a.gamification?.totalXp || 0))
      .slice(0, 10);
  }, [users]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={BarChart3} title="Vue d'ensemble" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers} color="blue" />
        <StatCard icon={Zap} label="XP Total" value={stats.totalXp.toLocaleString()} color="yellow" />
        <StatCard icon={Award} label="Badges" value={stats.totalBadges} color="purple" />
        <StatCard icon={Target} label="Quetes actives" value={stats.activeQuests} color="green" />
        <StatCard icon={Clock} label="En attente" value={stats.pendingValidations} color="orange" />
        <StatCard icon={Flag} label="Campagnes" value={stats.activeCampaigns} color="red" />
        <StatCard icon={GraduationCap} label="Formations" value={stats.activeFormations} color="cyan" />
        <StatCard icon={MessageSquare} label="Entretiens" value={stats.totalInterviews} color="pink" />
        <StatCard icon={Gift} label="Recompenses" value={stats.totalRewards} color="indigo" />
        <StatCard icon={UserPlus} label="Parrainages" value={stats.totalSponsorships} color="emerald" />
      </div>

      {/* Top Users */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-yellow-500" />
          Top 10 Utilisateurs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topUsers.map((u, idx) => (
            <DataCard key={u.id}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  idx === 0 ? 'bg-yellow-500 text-black' :
                  idx === 1 ? 'bg-gray-300 text-black' :
                  idx === 2 ? 'bg-orange-600 text-white' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{u.displayName || 'Sans nom'}</div>
                  <div className="text-sm text-gray-400">{u.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-500 font-bold">{(u.gamification?.totalXp || 0).toLocaleString()} XP</div>
                  <div className="text-xs text-gray-500">Niv. {u.gamification?.level || 1}</div>
                </div>
              </div>
            </DataCard>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`bg-${color}-500/10 border border-${color}-500/30 rounded-xl p-4`}>
    <Icon className={`w-6 h-6 text-${color}-400 mb-2`} />
    <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

// ==========================================
// TAB: UTILISATEURS
// ==========================================

const UsersTab = ({ users, searchTerm, onEdit, onModifyXp, onAssignBadge, onRemoveBadge }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [xpModal, setXpModal] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [xpReason, setXpReason] = useState('');
  const [badgeModal, setBadgeModal] = useState(false);

  const filtered = useMemo(() => {
    return users.filter(u =>
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleXpSubmit = async () => {
    if (!selectedUser || xpAmount === 0 || !xpReason) return;
    const success = await onModifyXp(selectedUser.id, xpAmount, xpReason);
    if (success) {
      setXpModal(false);
      setXpAmount(0);
      setXpReason('');
      setSelectedUser(null);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={Users}
        title="Gestion des Utilisateurs"
        count={filtered.length}
      />

      <div className="space-y-3">
        {filtered.map(u => (
          <DataCard key={u.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {u.displayName?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{u.displayName || 'Sans nom'}</div>
                  <div className="text-sm text-gray-400">{u.email}</div>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="text-yellow-500">{u.gamification?.totalXp || 0} XP</span>
                    <span className="text-gray-500">Niv. {u.gamification?.level || 1}</span>
                    <span className="text-purple-400">{u.gamification?.badges?.length || 0} badges</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      u.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ActionButton
                  icon={Zap}
                  label="XP"
                  small
                  color="yellow"
                  onClick={() => { setSelectedUser(u); setXpModal(true); }}
                />
                <ActionButton
                  icon={Award}
                  label="Badge"
                  small
                  color="purple"
                  onClick={() => { setSelectedUser(u); setBadgeModal(true); }}
                />
                <ActionButton
                  icon={Edit}
                  small
                  color="blue"
                  onClick={() => onEdit(u)}
                />
              </div>
            </div>

            {/* Badges de l'utilisateur */}
            {u.gamification?.badges?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {u.gamification.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs flex items-center gap-1 group"
                    >
                      {badge.icon || '🏆'} {badge.name}
                      <button
                        onClick={() => onRemoveBadge(u.id, badge.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </DataCard>
        ))}
      </div>

      {/* Modal XP */}
      <AnimatePresence>
        {xpModal && selectedUser && (
          <Modal onClose={() => setXpModal(false)} title="Modifier XP">
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-white font-medium">{selectedUser.displayName}</div>
                <div className="text-yellow-500">XP actuel: {selectedUser.gamification?.totalXp || 0}</div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Montant XP (+ ou -)</label>
                <input
                  type="number"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
                {xpAmount !== 0 && (
                  <p className={`mt-1 text-sm ${xpAmount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    Nouveau total: {(selectedUser.gamification?.totalXp || 0) + xpAmount} XP
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Raison</label>
                <textarea
                  value={xpReason}
                  onChange={(e) => setXpReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setXpModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={handleXpSubmit}
                  disabled={xpAmount === 0 || !xpReason}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                >
                  Valider
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal Badge */}
      <AnimatePresence>
        {badgeModal && selectedUser && (
          <Modal onClose={() => setBadgeModal(false)} title="Attribuer Badge">
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-white font-medium">{selectedUser.displayName}</div>
                <div className="text-purple-400">{selectedUser.gamification?.badges?.length || 0} badges</div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => {
                  const alreadyHas = selectedUser.gamification?.badges?.some(b => b.id === id);
                  return (
                    <div
                      key={id}
                      className={`p-3 rounded-lg border ${alreadyHas ? 'border-green-500/30 bg-green-500/10' : 'border-gray-700 bg-gray-800'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <div className="text-white font-medium">{badge.name}</div>
                            <div className="text-xs text-gray-400">{badge.description}</div>
                          </div>
                        </div>
                        {alreadyHas ? (
                          <span className="text-green-400 text-sm">Deja attribue</span>
                        ) : (
                          <button
                            onClick={() => { onAssignBadge(selectedUser.id, id); setBadgeModal(false); }}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                          >
                            Attribuer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// TAB: QUETES
// ==========================================

const QuestsTab = ({ quests, validations, users, searchTerm, onEdit, onDelete, onRefresh }) => {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = quests.filter(q =>
      q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filter === 'active') result = result.filter(q => q.status === 'active' || !q.status);
    if (filter === 'completed') result = result.filter(q => q.status === 'completed');

    return result;
  }, [quests, searchTerm, filter]);

  const pendingValidations = validations.filter(v => v.status === 'pending');

  return (
    <div>
      <SectionHeader
        icon={Target}
        title="Gestion des Quetes"
        count={filtered.length}
        action={
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">Toutes</option>
              <option value="active">Actives</option>
              <option value="completed">Terminees</option>
            </select>
          </div>
        }
      />

      {/* Validations en attente */}
      {pendingValidations.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {pendingValidations.length} validation(s) en attente
          </h3>
          <div className="space-y-2">
            {pendingValidations.slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                <div>
                  <div className="text-white">{v.taskTitle}</div>
                  <div className="text-sm text-gray-400">{v.userName}</div>
                </div>
                <span className="text-yellow-500 font-medium">+{v.xpAmount} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(q => (
          <DataCard key={q.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    q.difficulty === 'hard' || q.difficulty === 'legendary' ? 'bg-red-500/20 text-red-400' :
                    q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {q.difficulty || 'normal'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    q.status === 'completed' ? 'bg-gray-500/20 text-gray-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {q.status || 'active'}
                  </span>
                </div>
                <div className="text-white font-semibold">{q.title}</div>
                <div className="text-sm text-gray-400 line-clamp-1">{q.description}</div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-yellow-500">{q.xpReward || q.xp || 0} XP</span>
                  <span className="text-gray-500">Par: {q.createdByName || 'Systeme'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ActionButton icon={Edit} small onClick={() => onEdit(q)} />
                <ActionButton icon={Trash2} small color="red" onClick={() => onDelete(q.id)} />
              </div>
            </div>
          </DataCard>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// TAB: BADGES
// ==========================================

const BadgesTab = ({ users, searchTerm, onAssignBadge, onRemoveBadge }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Stats des badges
  const badgeStats = useMemo(() => {
    const stats = {};
    Object.keys(BADGE_DEFINITIONS).forEach(id => {
      stats[id] = users.filter(u => u.gamification?.badges?.some(b => b.id === id)).length;
    });
    return stats;
  }, [users]);

  // Utilisateurs par badge selectionne
  const usersWithBadge = useMemo(() => {
    if (!selectedBadge) return [];
    return users.filter(u => u.gamification?.badges?.some(b => b.id === selectedBadge));
  }, [users, selectedBadge]);

  return (
    <div>
      <SectionHeader
        icon={Award}
        title="Gestion des Badges"
        count={Object.keys(BADGE_DEFINITIONS).length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des badges */}
        <div>
          <h3 className="text-white font-bold mb-4">Tous les badges</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => (
              <div
                key={id}
                onClick={() => setSelectedBadge(id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBadge === id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{badge.icon}</span>
                    <div>
                      <div className="text-white font-medium">{badge.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-1">{badge.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400 font-bold">{badgeStats[id]}</div>
                    <div className="text-xs text-gray-500">utilisateurs</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail badge selectionne */}
        <div>
          {selectedBadge ? (
            <div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{BADGE_DEFINITIONS[selectedBadge].icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{BADGE_DEFINITIONS[selectedBadge].name}</h3>
                    <p className="text-gray-400">{BADGE_DEFINITIONS[selectedBadge].description}</p>
                    <div className="mt-2 text-yellow-500">+{BADGE_DEFINITIONS[selectedBadge].xpReward || 50} XP</div>
                  </div>
                </div>
              </div>

              <h4 className="text-white font-bold mb-3">
                Utilisateurs avec ce badge ({usersWithBadge.length})
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {usersWithBadge.map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div>
                      <div className="text-white">{u.displayName}</div>
                      <div className="text-sm text-gray-400">{u.email}</div>
                    </div>
                    <button
                      onClick={() => onRemoveBadge(u.id, selectedBadge)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>

              {/* Ajouter a un utilisateur */}
              <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
                <h4 className="text-white font-bold mb-3">Attribuer ce badge</h4>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onAssignBadge(e.target.value, selectedBadge);
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Selectionner un utilisateur...</option>
                  {users
                    .filter(u => !u.gamification?.badges?.some(b => b.id === selectedBadge))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.displayName || u.email}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selectionnez un badge pour voir les details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TAB: CAMPAGNES
// ==========================================

const CampaignsTab = ({ campaigns, users, searchTerm, onEdit, onDelete, onSave }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '', status: 'active' });

  const filtered = useMemo(() => {
    return campaigns.filter(c =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [campaigns, searchTerm]);

  const handleCreate = async () => {
    await onSave('campaign', newCampaign);
    setShowCreate(false);
    setNewCampaign({ title: '', description: '', status: 'active' });
  };

  return (
    <div>
      <SectionHeader
        icon={Flag}
        title="Gestion des Campagnes"
        count={filtered.length}
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Campagne
          </button>
        }
      />

      {/* Formulaire creation */}
      {showCreate && (
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <h3 className="text-white font-bold mb-4">Nouvelle Campagne</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Titre"
              value={newCampaign.title}
              onChange={(e) => setNewCampaign(c => ({ ...c, title: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
            <textarea
              placeholder="Description"
              value={newCampaign.description}
              onChange={(e) => setNewCampaign(c => ({ ...c, description: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                Annuler
              </button>
              <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                Creer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(c => (
          <DataCard key={c.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    c.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    c.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {c.status || 'active'}
                  </span>
                </div>
                <div className="text-white font-semibold">{c.title}</div>
                <div className="text-sm text-gray-400 line-clamp-2">{c.description}</div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{c.tasksCount || 0} quetes</span>
                  <span>Par: {c.createdByName || 'Systeme'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ActionButton icon={Edit} small onClick={() => onEdit(c)} />
                <ActionButton icon={Trash2} small color="red" onClick={() => onDelete(c.id)} />
              </div>
            </div>
          </DataCard>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Flag className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucune campagne</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TAB: FORMATIONS
// ==========================================

const FormationsTab = ({ formations, users, searchTerm, onEdit, onDelete, onSave }) => {
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return formations.filter(f =>
      f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.mentorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.menteeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formations, searchTerm]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div>
      <SectionHeader
        icon={GraduationCap}
        title="Gestion des Formations"
        count={filtered.length}
      />

      <div className="space-y-3">
        {filtered.map(f => (
          <DataCard key={f.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(f.status)}`}>
                    {f.status || 'scheduled'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">
                    {f.type || 'skill_transfer'}
                  </span>
                </div>
                <div className="text-white font-semibold">{f.title || 'Session de formation'}</div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-cyan-400">Mentor: {f.mentorName || 'N/A'}</span>
                  <span className="text-pink-400">Mentee: {f.menteeName || 'N/A'}</span>
                  <span className="text-gray-500">{f.duration || 30} min</span>
                </div>
                {/* Objectifs */}
                {f.objectives?.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Objectifs:</span>
                    <span className="text-green-400">
                      {Object.keys(f.objectivesProgress || {}).filter(k => f.objectivesProgress[k]?.completed).length}
                      /{f.objectives.length} valides
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ActionButton icon={Edit} small onClick={() => onEdit(f)} />
                <ActionButton icon={Trash2} small color="red" onClick={() => onDelete(f.id)} />
              </div>
            </div>
          </DataCard>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucune formation</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TAB: ENTRETIENS 360
// ==========================================

const InterviewsTab = ({ interviews, users, searchTerm, onEdit, onDelete, onSave }) => {
  const filtered = useMemo(() => {
    return interviews.filter(i =>
      i.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.createdByName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [interviews, searchTerm]);

  const getTypeLabel = (type) => {
    const types = {
      quarterly: 'Trimestriel',
      biannual: 'Semestriel',
      annual: 'Annuel',
      onboarding: 'Integration'
    };
    return types[type] || type;
  };

  return (
    <div>
      <SectionHeader
        icon={MessageSquare}
        title="Gestion des Entretiens 360"
        count={filtered.length}
      />

      <div className="space-y-3">
        {filtered.map(i => (
          <DataCard key={i.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    i.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    i.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {i.status || 'scheduled'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-400">
                    {getTypeLabel(i.interviewType)}
                  </span>
                </div>
                <div className="text-white font-semibold">
                  Entretien: {i.subjectName || 'N/A'}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-400">
                    Date: {i.scheduledDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </span>
                  <span className="text-gray-400">
                    Par: {i.createdByName || 'N/A'}
                  </span>
                  <span className="text-purple-400">
                    {i.feedbackRequests?.length || 0} evaluateurs
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ActionButton icon={Eye} small color="blue" onClick={() => onEdit(i)} />
                <ActionButton icon={Trash2} small color="red" onClick={() => onDelete(i.id)} />
              </div>
            </div>
          </DataCard>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucun entretien 360</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TAB: RECOMPENSES
// ==========================================

const RewardsTab = ({ rewards, searchTerm, onEdit, onDelete, onSave }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', description: '', xpCost: 100, stock: -1 });

  const filtered = useMemo(() => {
    return rewards.filter(r =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rewards, searchTerm]);

  const handleCreate = async () => {
    await onSave('reward', newReward);
    setShowCreate(false);
    setNewReward({ name: '', description: '', xpCost: 100, stock: -1 });
  };

  return (
    <div>
      <SectionHeader
        icon={Gift}
        title="Gestion des Recompenses"
        count={filtered.length}
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Recompense
          </button>
        }
      />

      {/* Formulaire creation */}
      {showCreate && (
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <h3 className="text-white font-bold mb-4">Nouvelle Recompense</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nom"
              value={newReward.name}
              onChange={(e) => setNewReward(r => ({ ...r, name: e.target.value }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
            <input
              type="number"
              placeholder="Cout XP"
              value={newReward.xpCost}
              onChange={(e) => setNewReward(r => ({ ...r, xpCost: parseInt(e.target.value) || 0 }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
            <textarea
              placeholder="Description"
              value={newReward.description}
              onChange={(e) => setNewReward(r => ({ ...r, description: e.target.value }))}
              className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none"
              rows={2}
            />
            <div className="col-span-2 flex gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                Annuler
              </button>
              <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                Creer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => (
          <DataCard key={r.id}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{r.icon || '🎁'}</span>
              <div className="flex gap-1">
                <ActionButton icon={Edit} small onClick={() => onEdit(r)} />
                <ActionButton icon={Trash2} small color="red" onClick={() => onDelete(r.id)} />
              </div>
            </div>
            <div className="text-white font-semibold">{r.name}</div>
            <div className="text-sm text-gray-400 line-clamp-2 mt-1">{r.description}</div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-yellow-500 font-bold">{r.xpCost || 0} XP</span>
              <span className="text-xs text-gray-500">
                Stock: {r.stock === -1 ? 'Illimite' : r.stock}
              </span>
            </div>
          </DataCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucune recompense</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// TAB: PARRAINAGES
// ==========================================

const SponsorshipsTab = ({ sponsorships, users, searchTerm, onEdit, onDelete, onSave }) => {
  const filtered = useMemo(() => {
    return sponsorships.filter(s =>
      s.sponsorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sponsoreeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sponsorships, searchTerm]);

  return (
    <div>
      <SectionHeader
        icon={UserPlus}
        title="Gestion des Parrainages"
        count={filtered.length}
      />

      <div className="space-y-3">
        {filtered.map(s => (
          <DataCard key={s.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    {s.sponsorName?.charAt(0) || '?'}
                  </div>
                  <div className="w-6 h-6 -ml-2 rounded-full bg-gray-800 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                    {s.sponsoreeName?.charAt(0) || '?'}
                  </div>
                </div>
                <div>
                  <div className="text-white">
                    <span className="text-cyan-400">{s.sponsorName || 'N/A'}</span>
                    {' '}parraine{' '}
                    <span className="text-pink-400">{s.sponsoreeName || 'N/A'}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Depuis: {s.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  s.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {s.status || 'active'}
                </span>
                <ActionButton icon={Trash2} small color="red" onClick={() => onDelete(s.id)} />
              </div>
            </div>
          </DataCard>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucun parrainage</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TAB: HISTORIQUE
// ==========================================

const HistoryTab = ({ events, users, searchTerm }) => {
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = events.filter(e =>
      e.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filter !== 'all') {
      result = result.filter(e => e.type === filter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      if (dateFilter === 'today') filterDate.setHours(0, 0, 0, 0);
      else if (dateFilter === 'week') filterDate.setDate(now.getDate() - 7);
      else if (dateFilter === 'month') filterDate.setMonth(now.getMonth() - 1);

      result = result.filter(e => {
        const eventDate = e.timestamp?.toDate?.() || new Date(e.timestamp);
        return eventDate >= filterDate;
      });
    }

    return result;
  }, [events, searchTerm, filter, dateFilter]);

  return (
    <div>
      <SectionHeader
        icon={Clock}
        title="Historique Complet"
        count={filtered.length}
      />

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">Tous les types</option>
          <option value="validation">Validations</option>
          <option value="task">Quetes</option>
          <option value="badge">Badges</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">7 derniers jours</option>
          <option value="month">30 derniers jours</option>
        </select>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {filtered.map(e => (
          <div key={e.id} className="flex items-start gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${e.color || 'gray'}-500/20`}>
              <Clock className={`w-5 h-5 text-${e.color || 'gray'}-400`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs bg-${e.color || 'gray'}-500/20 text-${e.color || 'gray'}-400`}>
                  {e.type}
                </span>
                <span className="text-xs text-gray-500">
                  {e.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="text-white font-medium mt-1">{e.action}</div>
              <div className="text-sm text-gray-400">
                {e.user} - {e.details}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucun evenement</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TAB: PARAMETRES
// ==========================================

const SettingsTab = ({ users, onRefresh }) => {
  const [recalculating, setRecalculating] = useState(false);

  const recalculateAllXp = async () => {
    if (!confirm('Recalculer tous les XP de tous les utilisateurs ?')) return;

    setRecalculating(true);
    try {
      // Implementation du recalcul
      alert('Fonctionnalite en developpement');
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div>
      <SectionHeader icon={Settings} title="Parametres Systeme" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions de maintenance */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Maintenance
          </h3>
          <div className="space-y-3">
            <button
              onClick={recalculateAllXp}
              disabled={recalculating}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              Recalculer tous les XP
            </button>
            <button
              onClick={() => alert('En developpement')}
              className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Verifier integrite donnees
            </button>
            <button
              onClick={() => alert('En developpement')}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Nettoyer donnees orphelines
            </button>
          </div>
        </div>

        {/* Stats systeme */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Statistiques Systeme
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Utilisateurs totaux</span>
              <span className="text-white">{users.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Admins</span>
              <span className="text-white">{users.filter(u => u.role === 'admin').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Managers</span>
              <span className="text-white">{users.filter(u => u.role === 'manager').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Users actifs (7j)</span>
              <span className="text-white">
                {users.filter(u => {
                  const lastSeen = u.lastSeen?.toDate?.() || u.lastLogin?.toDate?.();
                  if (!lastSeen) return false;
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return lastSeen > weekAgo;
                }).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODAL D'EDITION
// ==========================================

const Modal = ({ onClose, title, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

const EditModal = ({ open, type, data, onClose, onSave, users }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    } else {
      setFormData({});
    }
  }, [data]);

  if (!open) return null;

  const handleSubmit = () => {
    onSave(type, formData);
  };

  const titles = {
    user: 'Modifier Utilisateur',
    quest: 'Modifier Quete',
    campaign: 'Modifier Campagne',
    formation: 'Modifier Formation',
    interview: 'Modifier Entretien',
    reward: 'Modifier Recompense',
    sponsorship: 'Modifier Parrainage'
  };

  return (
    <AnimatePresence>
      <Modal onClose={onClose} title={titles[type] || 'Edition'}>
        <div className="space-y-4">
          {type === 'user' && (
            <>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.displayName || ''}
                  onChange={(e) => setFormData(f => ({ ...f, displayName: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Role</label>
                <select
                  value={formData.role || 'user'}
                  onChange={(e) => setFormData(f => ({ ...f, role: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          {type === 'quest' && (
            <>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Titre</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">XP</label>
                  <input
                    type="number"
                    value={formData.xpReward || formData.xp || 0}
                    onChange={(e) => setFormData(f => ({ ...f, xpReward: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Difficulte</label>
                  <select
                    value={formData.difficulty || 'normal'}
                    onChange={(e) => setFormData(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="easy">Facile</option>
                    <option value="normal">Normal</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                    <option value="legendary">Legendaire</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Statut</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="active">Active</option>
                  <option value="completed">Terminee</option>
                  <option value="archived">Archivee</option>
                </select>
              </div>
            </>
          )}

          {type === 'campaign' && (
            <>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Titre</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Statut</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="active">Active</option>
                  <option value="completed">Terminee</option>
                  <option value="paused">En pause</option>
                </select>
              </div>
            </>
          )}

          {type === 'reward' && (
            <>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Cout XP</label>
                  <input
                    type="number"
                    value={formData.xpCost || 0}
                    onChange={(e) => setFormData(f => ({ ...f, xpCost: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Stock (-1 = illimite)</label>
                  <input
                    type="number"
                    value={formData.stock ?? -1}
                    onChange={(e) => setFormData(f => ({ ...f, stock: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>
    </AnimatePresence>
  );
};

export default GodModPage;
