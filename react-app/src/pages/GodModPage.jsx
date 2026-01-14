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
// Composants extraits
import {
  SectionHeader,
  StatCard,
  DataCard,
  TabContent,
  ActionButton,
  Badge as BadgeComponent,
  EmptyState,
  DashboardTab,
  UsersTab,
  QuestsTab,
  BadgesTab,
  CampaignsTab,
  FormationsTab,
  InterviewsTab,
  RewardsTab,
  SponsorshipsTab,
  HistoryTab,
  SettingsTab
} from '../components/godmod';
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
// COMPOSANTS UTILITAIRES LOCAUX
// ==========================================

const StatBadge = ({ label, value, color }) => (
  <div className={`px-4 py-2 bg-${color}-500/20 border border-${color}-500/30 rounded-lg`}>
    <div className={`text-lg font-bold text-${color}-400`}>{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);

// ==========================================
// TAB: UTILISATEURS
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
