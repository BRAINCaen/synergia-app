// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// VRAIE PAGE DE VALIDATION DES QUÊTES - FIREBASE + CHARTE SYNERGIA
// ✅ CORRIGÉ : HISTORIQUE GODMOD + POOL ÉQUIPE (SANS CHANGER LE DESIGN)
// ==========================================

console.log('🔄 [AdminValidationQuêtes] Rechargé à:', new Date().toLocaleTimeString());

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User,
  Calendar,
  FileText,
  Star,
  Trophy,
  RefreshCw,
  AlertTriangle,
  Filter,
  Search,
  Shield,
  MessageSquare,
  Target,
  Zap,
  TrendingUp,
  Award,
  Camera,
  Video,
  Send,
  X as CloseIcon,
  RotateCcw,
  Edit,
  Coins
} from 'lucide-react';

// 🎯 IMPORTS
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

// 🔥 FIREBASE
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// ✅ IMPORT DU SERVICE TEAM POOL POUR CONTRIBUTION AUTOMATIQUE
import teamPoolService from '../core/services/teamPoolService.js';

/**
 * 🎨 COMPOSANT CARTE GLASSMORPHISM
 */
const GlassCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

/**
 * 🎨 STAT CARD
 */
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
    purple: 'from-purple-500 to-pink-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 text-white`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6" />
        <h3 className="text-sm font-medium opacity-90">{title}</h3>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {trend && <div className="text-sm opacity-75">{trend}</div>}
    </div>
  );
};

/**
 * 🛡️ VRAIE PAGE DE VALIDATION DES QUÊTES
 */
const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [pendingQuests, setPendingQuests] = useState([]);
  const [validatedQuests, setValidatedQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    validated: 0,
    rejected: 0,
    total: 0
  });
  
  // États UI
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForceXpModal, setShowForceXpModal] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [editedXp, setEditedXp] = useState(0);

  /**
   * 📊 CHARGER LES QUÊTES EN ATTENTE
   */
  const loadPendingQuests = async () => {
    try {
      setLoading(true);
      console.log('📊 Chargement des quêtes en attente...');

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', 'validation_pending'),
        orderBy('updatedAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const questsData = [];
      
      for (const taskDoc of tasksSnapshot.docs) {
        const taskData = taskDoc.data();
        
        let userData = { displayName: 'Utilisateur inconnu', email: '' };
        const userId = taskData.assignedTo?.[0] || taskData.createdBy;
        
        if (userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              userData = userDoc.data();
            }
          } catch (err) {
            console.warn('⚠️ Erreur récupération user:', err);
          }
        }
        
        questsData.push({
          id: taskDoc.id,
          ...taskData,
          userId,
          userName: userData.displayName || userData.email || 'Anonyme',
          userEmail: userData.email || '',
          submittedAt: taskData.updatedAt || taskData.createdAt,
          questTitle: taskData.title || 'Quête sans titre',
          difficulty: taskData.difficulty || 'Normale',
          xpReward: taskData.xpReward || 25,
          comment: taskData.comment || '',
          photoUrl: taskData.photoUrl || null,
          videoUrl: taskData.videoUrl || null
        });
      }
      
      setPendingQuests(questsData);
      
      const totalTasks = await getDocs(collection(db, 'tasks'));
      const validatedTasks = await getDocs(
        query(collection(db, 'tasks'), where('status', '==', 'completed'))
      );
      
      setStats({
        pending: questsData.length,
        validated: validatedTasks.size,
        rejected: 0,
        total: totalTasks.size
      });
      
      console.log('✅ Quêtes chargées:', questsData.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement quêtes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 CHARGER LES QUÊTES VALIDÉES
   */
  const loadValidatedQuests = async () => {
    try {
      setLoading(true);
      console.log('📊 Chargement des quêtes validées...');

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', 'completed'),
        orderBy('validatedAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const questsData = [];
      
      for (const taskDoc of tasksSnapshot.docs) {
        const taskData = taskDoc.data();
        
        let userData = { displayName: 'Utilisateur inconnu', email: '' };
        const userId = taskData.assignedTo?.[0] || taskData.createdBy;
        
        if (userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              userData = userDoc.data();
            }
          } catch (err) {
            console.warn('⚠️ Erreur récupération user:', err);
          }
        }
        
        questsData.push({
          id: taskDoc.id,
          ...taskData,
          userId,
          userName: userData.displayName || userData.email || 'Anonyme',
          userEmail: userData.email || '',
          validatedAt: taskData.validatedAt,
          questTitle: taskData.title || 'Quête sans titre',
          difficulty: taskData.difficulty || 'Normale',
          xpReward: taskData.xpReward || 25,
          comment: taskData.comment || '',
          adminComment: taskData.adminComment || '',
          photoUrl: taskData.photoUrl || null,
          videoUrl: taskData.videoUrl || null
        });
      }
      
      setValidatedQuests(questsData);
      console.log('✅ Quêtes validées chargées:', questsData.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement quêtes validées:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔄 ÉCOUTER LES MISES À JOUR TEMPS RÉEL
   */
  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingQuests();
    } else {
      loadValidatedQuests();
    }
    
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'tasks'),
        where('status', '==', activeTab === 'pending' ? 'validation_pending' : 'completed')
      ),
      (snapshot) => {
        console.log('🔄 Mise à jour temps réel détectée');
        if (activeTab === 'pending') {
          loadPendingQuests();
        } else {
          loadValidatedQuests();
        }
      }
    );
    
    return () => unsubscribe();
  }, [activeTab]);

  /**
   * ✅ VALIDER UNE QUÊTE
   */
  const handleValidate = async () => {
    if (!selectedQuest) return;
    
    setProcessing(true);
    try {
      console.log('✅ Validation quête:', selectedQuest.id);
      
      const userId = selectedQuest.assignedTo?.[0] || selectedQuest.createdBy;
      const xpToAdd = selectedQuest.xpReward || 25;
      
      // 1. Mettre à jour le statut de la quête
      await updateDoc(doc(db, 'tasks', selectedQuest.id), {
        status: 'completed',
        validatedAt: serverTimestamp(),
        validatedBy: user.uid,
        adminComment: adminComment,
        validationStatus: 'approved'
      });
      
      // 2. Attribuer les XP à l'utilisateur
      let newTotalXP = 0;
      let newLevel = 1;
      let userEmail = '';
      
      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const gamification = userData.gamification || {};
          userEmail = userData.email || '';
          
          const currentXP = gamification.totalXp || 0;
          newTotalXP = currentXP + xpToAdd;
          newLevel = Math.floor(newTotalXP / 100) + 1;
          const currentTasksCompleted = gamification.tasksCompleted || 0;
          
          console.log(`🎯 Attribution XP:`, {
            userId,
            currentXP,
            xpToAdd,
            newTotalXP,
            newLevel
          });
          
          await updateDoc(userRef, {
            'gamification.totalXp': newTotalXP,
            'gamification.level': newLevel,
            'gamification.tasksCompleted': currentTasksCompleted + 1,
            'gamification.weeklyXp': (gamification.weeklyXp || 0) + xpToAdd,
            'gamification.monthlyXp': (gamification.monthlyXp || 0) + xpToAdd,
            'gamification.lastActivityAt': serverTimestamp(),
            'gamification.lastXpGain': {
              amount: xpToAdd,
              source: 'task_validation',
              taskId: selectedQuest.id,
              taskTitle: selectedQuest.title,
              timestamp: new Date().toISOString()
            },
            'syncMetadata.lastXpSync': serverTimestamp(),
            'syncMetadata.lastXpSource': 'admin_task_validation',
            'syncMetadata.lastXpAmount': xpToAdd,
            'syncMetadata.forceSync': true,
            updatedAt: serverTimestamp()
          });
          
          console.log(`💎 ${xpToAdd} XP attribués à ${userId}`);
          console.log(`✅ Nouveau total: ${newTotalXP} XP (Niveau ${newLevel})`);
        }
      }
      
      // ✅ 3. CRÉER L'ENTRÉE DANS task_validations POUR L'HISTORIQUE GODMOD
      console.log('📝 Création entrée task_validations pour historique...');
      try {
        await addDoc(collection(db, 'task_validations'), {
          taskId: selectedQuest.id,
          taskTitle: selectedQuest.title || selectedQuest.questTitle || 'Sans titre',
          userId: userId,
          userName: selectedQuest.userName || 'Utilisateur inconnu',
          userEmail: userEmail,
          xpAmount: xpToAdd,
          status: 'approved',
          submittedAt: selectedQuest.createdAt || serverTimestamp(),
          reviewedAt: serverTimestamp(),
          reviewedBy: user.uid,
          adminComment: adminComment || 'Quête validée',
          type: 'standard',
          difficulty: selectedQuest.difficulty || 'normal',
          projectId: selectedQuest.projectId || null,
          projectName: selectedQuest.projectName || null
        });
        console.log('✅ Entrée task_validations créée');
      } catch (taskValError) {
        console.warn('⚠️ Erreur création task_validations (non bloquante):', taskValError);
      }
      
      // ✅ 4. ÉMETTRE L'ÉVÉNEMENT userXPUpdated POUR LE POOL ÉQUIPE
      console.log('📢 Émission événement userXPUpdated pour pool équipe...');
      const xpUpdateEvent = new CustomEvent('userXPUpdated', {
        detail: {
          userId: userId,
          xpGained: xpToAdd,
          source: 'task_validation',
          userEmail: userEmail,
          gamificationData: {
            totalXp: newTotalXP,
            level: newLevel
          },
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(xpUpdateEvent);
      console.log('✅ Événement userXPUpdated émis');
      
      // ✅ 5. CONTRIBUTION DIRECTE AU POOL ÉQUIPE
      try {
        console.log('💰 Contribution directe au pool équipe...');
        const contributionAmount = Math.max(1, Math.round(xpToAdd * 0.05));
        console.log(`💰 Contribution calculée: ${contributionAmount} XP (5% de ${xpToAdd})`);
        
        const poolResult = await teamPoolService.contributeToPool(
          userId,
          userEmail,
          contributionAmount,
          'task_validation',
          true
        );
        
        if (poolResult.success && poolResult.contributed > 0) {
          console.log(`✅ Pool équipe: +${poolResult.contributed} XP (Total: ${poolResult.newPoolTotal})`);
        }
      } catch (poolError) {
        console.warn('⚠️ Erreur contribution pool (non bloquante):', poolError);
      }
      
      // 6. Fermer le modal et recharger
      setShowValidationModal(false);
      setSelectedQuest(null);
      setAdminComment('');
      await loadPendingQuests();
      
      console.log('✅ Quête validée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      alert('Erreur lors de la validation');
    } finally {
      setProcessing(false);
    }
  };

  /**
   * ❌ REJETER UNE QUÊTE
   */
  const handleReject = async () => {
    if (!selectedQuest) return;
    
    setProcessing(true);
    try {
      console.log('❌ Rejet quête:', selectedQuest.id);
      
      const userId = selectedQuest.assignedTo?.[0] || selectedQuest.createdBy;
      
      await updateDoc(doc(db, 'tasks', selectedQuest.id), {
        status: 'todo',
        validatedAt: serverTimestamp(),
        validatedBy: user.uid,
        adminComment: adminComment || 'Quête non validée',
        validationStatus: 'rejected'
      });
      
      // ✅ CRÉER L'ENTRÉE DANS task_validations POUR L'HISTORIQUE
      try {
        await addDoc(collection(db, 'task_validations'), {
          taskId: selectedQuest.id,
          taskTitle: selectedQuest.title || selectedQuest.questTitle || 'Sans titre',
          userId: userId,
          userName: selectedQuest.userName || 'Utilisateur inconnu',
          xpAmount: 0,
          status: 'rejected',
          submittedAt: selectedQuest.createdAt || serverTimestamp(),
          reviewedAt: serverTimestamp(),
          reviewedBy: user.uid,
          adminComment: adminComment || 'Quête rejetée',
          type: 'standard'
        });
        console.log('✅ Entrée task_validations (rejet) créée');
      } catch (taskValError) {
        console.warn('⚠️ Erreur création task_validations (non bloquante):', taskValError);
      }
      
      setShowValidationModal(false);
      setSelectedQuest(null);
      setAdminComment('');
      await loadPendingQuests();
      
      console.log('❌ Quête rejetée');
      
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
      alert('Erreur lors du rejet');
    } finally {
      setProcessing(false);
    }
  };

  /**
   * 🔄 RÉACTIVER UNE QUÊTE
   */
  const handleReactivate = async (quest) => {
    if (!confirm('Voulez-vous vraiment réactiver cette quête ? Elle sera remise en "disponible".')) {
      return;
    }
    
    setProcessing(true);
    try {
      console.log('🔄 Réactivation quête:', quest.id);
      
      await updateDoc(doc(db, 'tasks', quest.id), {
        status: 'available',
        validatedAt: null,
        validatedBy: null,
        validationStatus: 'reactivated',
        reactivatedAt: serverTimestamp(),
        reactivatedBy: user.uid
      });
      
      alert('✅ Quête réactivée avec succès !');
      await loadValidatedQuests();
      
    } catch (error) {
      console.error('❌ Erreur réactivation:', error);
      alert('Erreur lors de la réactivation');
    } finally {
      setProcessing(false);
    }
  };

  /**
   * 💎 FORCER L'ATTRIBUTION DES XP
   */
  const handleForceXp = async () => {
    if (!selectedQuest || !editedXp) return;
    
    setProcessing(true);
    try {
      console.log('💎 Force attribution XP:', editedXp, 'pour quête:', selectedQuest.id);
      
      const userId = selectedQuest.userId || selectedQuest.assignedTo?.[0] || selectedQuest.createdBy;
      
      if (!userId) {
        alert('❌ Utilisateur introuvable pour cette quête');
        setProcessing(false);
        return;
      }
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const gamification = userData.gamification || {};
        const userEmail = userData.email || '';
        
        const currentXP = gamification.totalXp || 0;
        const xpToAdd = parseInt(editedXp);
        const newTotalXP = currentXP + xpToAdd;
        const newLevel = Math.floor(newTotalXP / 100) + 1;
        
        console.log(`🎯 Force XP:`, {
          userId,
          currentXP,
          xpToAdd,
          newTotalXP,
          newLevel
        });
        
        await updateDoc(userRef, {
          'gamification.totalXp': newTotalXP,
          'gamification.level': newLevel,
          'gamification.weeklyXp': (gamification.weeklyXp || 0) + xpToAdd,
          'gamification.monthlyXp': (gamification.monthlyXp || 0) + xpToAdd,
          'gamification.lastActivityAt': serverTimestamp(),
          'syncMetadata.lastXpSync': serverTimestamp(),
          'syncMetadata.lastXpSource': 'admin_force_xp',
          'syncMetadata.forceSync': true,
          updatedAt: serverTimestamp()
        });
        
        await updateDoc(doc(db, 'tasks', selectedQuest.id), {
          xpForcedAt: serverTimestamp(),
          xpForcedBy: user.uid,
          xpForcedAmount: xpToAdd
        });
        
        // ✅ CRÉER L'ENTRÉE DANS task_validations
        try {
          await addDoc(collection(db, 'task_validations'), {
            taskId: selectedQuest.id,
            taskTitle: selectedQuest.title || selectedQuest.questTitle || 'Sans titre',
            userId: userId,
            userName: selectedQuest.userName || userData.displayName || 'Utilisateur',
            userEmail: userEmail,
            xpAmount: xpToAdd,
            status: 'approved',
            submittedAt: selectedQuest.validatedAt || serverTimestamp(),
            reviewedAt: serverTimestamp(),
            reviewedBy: user.uid,
            adminComment: `XP forcés: ${xpToAdd}`,
            type: 'force_xp'
          });
          console.log('✅ Entrée task_validations (force XP) créée');
        } catch (taskValError) {
          console.warn('⚠️ Erreur création task_validations (non bloquante):', taskValError);
        }
        
        // ✅ ÉMETTRE LES ÉVÉNEMENTS POUR LE POOL ÉQUIPE
        const xpUpdateEvent = new CustomEvent('userXPUpdated', {
          detail: {
            userId: userId,
            xpGained: xpToAdd,
            source: 'admin_force_xp',
            userEmail: userEmail,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(xpUpdateEvent);
        
        // ✅ CONTRIBUTION AU POOL ÉQUIPE
        try {
          const contributionAmount = Math.max(1, Math.round(xpToAdd * 0.05));
          console.log(`💰 Contribution forcée: ${contributionAmount} XP (5% de ${xpToAdd})`);
          
          await teamPoolService.contributeToPool(
            userId,
            userEmail,
            contributionAmount,
            'admin_force_xp',
            true
          );
        } catch (poolError) {
          console.warn('⚠️ Erreur contribution pool:', poolError);
        }
        
        alert(`✅ ${xpToAdd} XP attribués avec succès !`);
        setShowForceXpModal(false);
        setEditedXp(0);
        await loadValidatedQuests();
        
        console.log(`💎 ${xpToAdd} XP forcés pour ${userId}`);
      } else {
        alert('❌ Utilisateur introuvable');
      }
      
    } catch (error) {
      console.error('❌ Erreur force XP:', error);
      alert('Erreur lors de l\'attribution des XP');
    } finally {
      setProcessing(false);
    }
  };

  /**
   * 👁️ OUVRIR LE MODAL DE VALIDATION
   */
  const openValidationModal = (quest) => {
    setSelectedQuest(quest);
    setAdminComment('');
    setShowValidationModal(true);
  };

  /**
   * 💎 OUVRIR LE MODAL FORCE XP
   */
  const openForceXpModal = (quest) => {
    setSelectedQuest(quest);
    setEditedXp(quest.xpReward || 25);
    setShowForceXpModal(true);
  };

  // Filtrer les quêtes par recherche
  const filteredQuests = (activeTab === 'pending' ? pendingQuests : validatedQuests).filter(quest =>
    quest.questTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quest.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 🎯 HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  🛡️ Validation des Quêtes
                </h1>
                <p className="text-gray-400 text-lg">
                  Validez les quêtes terminées et attribuez les XP • Connecté en tant que <span className="text-white font-semibold">{user?.displayName || user?.email}</span>
                </p>
              </div>
              
              <button
                onClick={() => activeTab === 'pending' ? loadPendingQuests() : loadValidatedQuests()}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </motion.div>

          {/* 📊 STATISTIQUES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="En Attente"
              value={stats.pending}
              icon={Clock}
              color="orange"
              trend="Nécessitent validation"
            />
            <StatCard
              title="Validées"
              value={stats.validated}
              icon={CheckCircle}
              color="green"
              trend="XP distribués"
            />
            <StatCard
              title="Quêtes Totales"
              value={stats.total}
              icon={Target}
              color="blue"
              trend="Dans le système"
            />
            <StatCard
              title="Taux Validation"
              value={stats.total > 0 ? Math.round((stats.validated / stats.total) * 100) + '%' : '0%'}
              icon={TrendingUp}
              color="purple"
              trend="Performance globale"
            />
          </motion.div>

          {/* 🎯 ONGLETS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  En Attente ({stats.pending})
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('validated')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'validated'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Validées ({stats.validated})
                </div>
              </button>
            </div>
          </motion.div>

          {/* 🔍 BARRE DE RECHERCHE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une quête ou un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </motion.div>

          {/* ⚠️ ALERTE SI AUCUNE QUÊTE */}
          {!loading && filteredQuests.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6 text-center"
            >
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">
                {activeTab === 'pending' ? 'Aucune quête en attente' : 'Aucune quête validée'}
              </h3>
              <p className="text-gray-400">
                {activeTab === 'pending' 
                  ? 'Toutes les quêtes ont été traitées ! Revenez plus tard.'
                  : 'Aucune quête n\'a encore été validée.'}
              </p>
            </motion.div>
          )}

          {/* 📋 LISTE DES QUÊTES */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Chargement des quêtes...</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {filteredQuests.map((quest, index) => (
                <GlassCard key={quest.id}>
                  <div className="flex items-start gap-4">
                    {/* Icône */}
                    <div className={`w-12 h-12 ${
                      activeTab === 'pending' 
                        ? 'bg-orange-500/20' 
                        : 'bg-green-500/20'
                    } rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {activeTab === 'pending' ? (
                        <Clock className="w-6 h-6 text-orange-400" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {quest.questTitle}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {quest.userName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {activeTab === 'pending'
                                ? quest.submittedAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'
                                : quest.validatedAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              {quest.xpReward} XP
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              quest.difficulty === 'Facile' ? 'bg-green-500/20 text-green-400' :
                              quest.difficulty === 'Normale' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {quest.difficulty}
                            </span>
                          </div>
                        </div>
                        
                        {/* Badge statut */}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                          activeTab === 'pending'
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                            : 'bg-green-500/20 text-green-400 border-green-500/50'
                        }`}>
                          {activeTab === 'pending' ? 'En attente' : 'Validée'}
                        </span>
                      </div>
                      
                      {/* Description/Commentaire */}
                      {quest.comment && (
                        <p className="text-gray-400 text-sm mb-3">
                          💬 {quest.comment}
                        </p>
                      )}
                      
                      {/* Commentaire admin (quêtes validées) */}
                      {activeTab === 'validated' && quest.adminComment && (
                        <p className="text-blue-400 text-sm mb-3 bg-blue-500/10 rounded-lg p-2 border border-blue-500/30">
                          🛡️ Admin : {quest.adminComment}
                        </p>
                      )}
                      
                      {/* Médias */}
                      <div className="flex items-center gap-2 mb-3">
                        {quest.photoUrl && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Camera className="w-3 h-3" />
                            Photo jointe
                          </span>
                        )}
                        {quest.videoUrl && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Video className="w-3 h-3" />
                            Vidéo jointe
                          </span>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {activeTab === 'pending' ? (
                          <button
                            onClick={() => openValidationModal(quest)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Examiner
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleReactivate(quest)}
                              disabled={processing}
                              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Réactiver
                            </button>
                            
                            <button
                              onClick={() => openForceXpModal(quest)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <Coins className="w-4 h-4" />
                              Forcer XP
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {/* 🎭 MODAL DE VALIDATION */}
          <AnimatePresence>
            {showValidationModal && selectedQuest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => !processing && setShowValidationModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  {/* Header Modal */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Validation de Quête
                      </h2>
                      <p className="text-gray-400">
                        Examinez les détails et validez ou rejetez cette quête
                      </p>
                    </div>
                    <button
                      onClick={() => !processing && setShowValidationModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <CloseIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Détails de la quête */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Titre de la quête</label>
                      <p className="text-lg font-bold text-white">{selectedQuest.questTitle}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Utilisateur</label>
                        <p className="text-white">{selectedQuest.userName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Difficulté</label>
                        <p className="text-white">{selectedQuest.difficulty}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Récompense XP</label>
                        <p className="text-white font-bold text-xl">{selectedQuest.xpReward} XP</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Date soumission</label>
                        <p className="text-white">
                          {selectedQuest.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {selectedQuest.comment && (
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Commentaire utilisateur</label>
                        <p className="text-white bg-gray-900/50 rounded-lg p-3">
                          {selectedQuest.comment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Commentaire admin */}
                  <div className="mb-6">
                    <label className="text-sm text-gray-400 mb-2 block">
                      Commentaire admin (optionnel)
                    </label>
                    <textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Ajoutez un commentaire pour l'utilisateur..."
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      {processing ? 'Traitement...' : 'Rejeter'}
                    </button>
                    
                    <button
                      onClick={handleValidate}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processing ? 'Traitement...' : 'Valider & Attribuer XP'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 💎 MODAL FORCE XP */}
          <AnimatePresence>
            {showForceXpModal && selectedQuest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => !processing && setShowForceXpModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-lg w-full"
                >
                  {/* Header Modal */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        💎 Forcer l'Attribution d'XP
                      </h2>
                      <p className="text-gray-400">
                        Attribuez manuellement des XP pour cette quête
                      </p>
                    </div>
                    <button
                      onClick={() => !processing && setShowForceXpModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <CloseIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Détails */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Quête</label>
                      <p className="text-white font-bold">{selectedQuest.questTitle}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Utilisateur</label>
                      <p className="text-white">{selectedQuest.userName}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">
                        Montant d'XP à attribuer
                      </label>
                      <input
                        type="number"
                        value={editedXp}
                        onChange={(e) => setEditedXp(e.target.value)}
                        placeholder="25"
                        min="1"
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        XP de base de la quête : {selectedQuest.xpReward} XP
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => !processing && setShowForceXpModal(false)}
                      disabled={processing}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                    >
                      Annuler
                    </button>
                    
                    <button
                      onClick={handleForceXp}
                      disabled={processing || !editedXp}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors"
                    >
                      <Coins className="w-5 h-5" />
                      {processing ? 'Attribution...' : `Attribuer ${editedXp} XP`}
                    </button>
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

export default AdminTaskValidationPage;
