// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// VRAIE PAGE DE VALIDATION DES QUÊTES - FIREBASE + CHARTE SYNERGIA
// ✅ CORRIGÉ : HISTORIQUE GODMOD + POOL ÉQUIPE
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
  addDoc,  // ✅ AJOUTÉ pour créer les entrées task_validations
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
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de validation
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  
  // Modal Force XP
  const [showForceXpModal, setShowForceXpModal] = useState(false);
  const [editedXp, setEditedXp] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    validated: 0,
    rejected: 0,
    totalXpDistributed: 0
  });

  /**
   * 🔄 CHARGER LES QUÊTES EN ATTENTE
   */
  const loadPendingQuests = async () => {
    try {
      setLoading(true);
      console.log('📋 Chargement quêtes en attente...');
      
      const q = query(
        collection(db, 'tasks'),
        where('status', '==', 'validation_pending'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const quests = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Récupérer infos utilisateur
        let userName = 'Utilisateur inconnu';
        let userEmail = '';
        const userId = data.assignedTo?.[0] || data.createdBy;
        
        if (userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userName = userData.displayName || userData.name || userData.email || 'Utilisateur';
              userEmail = userData.email || '';
            }
          } catch (e) {
            console.warn('Erreur récupération user:', e);
          }
        }
        
        quests.push({
          id: docSnap.id,
          ...data,
          userName,
          userEmail,
          userId
        });
      }
      
      setPendingQuests(quests);
      setStats(prev => ({ ...prev, pending: quests.length }));
      console.log(`✅ ${quests.length} quêtes en attente chargées`);
      
    } catch (error) {
      console.error('❌ Erreur chargement quêtes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔄 CHARGER LES QUÊTES VALIDÉES
   */
  const loadValidatedQuests = async () => {
    try {
      setLoading(true);
      console.log('📋 Chargement quêtes validées...');
      
      const q = query(
        collection(db, 'tasks'),
        where('status', '==', 'completed'),
        orderBy('validatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const quests = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Récupérer infos utilisateur
        let userName = 'Utilisateur inconnu';
        let userEmail = '';
        const userId = data.assignedTo?.[0] || data.createdBy;
        
        if (userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userName = userData.displayName || userData.name || userData.email || 'Utilisateur';
              userEmail = userData.email || '';
            }
          } catch (e) {
            console.warn('Erreur récupération user:', e);
          }
        }
        
        quests.push({
          id: docSnap.id,
          ...data,
          userName,
          userEmail,
          userId
        });
      }
      
      setValidatedQuests(quests);
      setStats(prev => ({ ...prev, validated: quests.length }));
      console.log(`✅ ${quests.length} quêtes validées chargées`);
      
    } catch (error) {
      console.error('❌ Erreur chargement quêtes validées:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingQuests();
    } else {
      loadValidatedQuests();
    }
  }, [activeTab]);

  // Écoute temps réel
  useEffect(() => {
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
   * ✅ VALIDER UNE QUÊTE - VERSION CORRIGÉE
   * ✅ Crée l'entrée dans task_validations pour l'historique GodMod
   * ✅ Émet les événements pour le pool équipe
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
          const currentWeeklyXp = gamification.weeklyXp || 0;
          const currentMonthlyXp = gamification.monthlyXp || 0;
          
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
            'gamification.weeklyXp': currentWeeklyXp + xpToAdd,
            'gamification.monthlyXp': currentMonthlyXp + xpToAdd,
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
      await addDoc(collection(db, 'task_validations'), {
        taskId: selectedQuest.id,
        taskTitle: selectedQuest.title || 'Sans titre',
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
            level: newLevel,
            tasksCompleted: (selectedQuest.gamification?.tasksCompleted || 0) + 1
          },
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(xpUpdateEvent);
      console.log('✅ Événement userXPUpdated émis');
      
      // ✅ 5. ÉMETTRE L'ÉVÉNEMENT taskValidated POUR LE POOL ÉQUIPE
      console.log('📢 Émission événement taskValidated...');
      const taskValidatedEvent = new CustomEvent('taskValidated', {
        detail: {
          userId: userId,
          taskData: {
            id: selectedQuest.id,
            title: selectedQuest.title,
            xpReward: xpToAdd
          },
          xpAwarded: xpToAdd,
          userEmail: userEmail,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(taskValidatedEvent);
      console.log('✅ Événement taskValidated émis');
      
      // ✅ 6. CONTRIBUTION DIRECTE AU POOL ÉQUIPE (BACKUP)
      try {
        console.log('💰 Contribution directe au pool équipe...');
        const poolResult = await teamPoolService.contributeToPool(
          userId,
          userEmail,
          xpToAdd,
          'task_validation',
          false // contribution automatique
        );
        if (poolResult.success && poolResult.contributed > 0) {
          console.log(`✅ Pool équipe: +${poolResult.contributed} XP (Total: ${poolResult.newPoolTotal})`);
        }
      } catch (poolError) {
        console.warn('⚠️ Erreur contribution pool (non bloquante):', poolError);
      }
      
      // ✅ 7. ÉMETTRE L'ÉVÉNEMENT DE SYNCHRONISATION GÉNÉRALE
      const syncEvent = new CustomEvent('userDataSynced', {
        detail: {
          userId: userId,
          gamificationData: {
            totalXp: newTotalXP,
            level: newLevel
          },
          source: 'admin_task_validation',
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(syncEvent);
      
      // 8. Fermer le modal et recharger
      setShowValidationModal(false);
      setSelectedQuest(null);
      setAdminComment('');
      await loadPendingQuests();
      
      console.log('✅ Quête validée avec succès !');
      alert(`✅ Quête validée !\n🏆 ${xpToAdd} XP attribués\n💰 Contribution au pool équipe effectuée`);
      
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      alert('Erreur lors de la validation: ' + error.message);
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
      
      // Mettre à jour la tâche
      await updateDoc(doc(db, 'tasks', selectedQuest.id), {
        status: 'todo',
        validatedAt: serverTimestamp(),
        validatedBy: user.uid,
        adminComment: adminComment || 'Quête non validée',
        validationStatus: 'rejected'
      });
      
      // ✅ CRÉER L'ENTRÉE DANS task_validations POUR L'HISTORIQUE
      await addDoc(collection(db, 'task_validations'), {
        taskId: selectedQuest.id,
        taskTitle: selectedQuest.title || 'Sans titre',
        userId: userId,
        userName: selectedQuest.userName || 'Utilisateur inconnu',
        xpAmount: selectedQuest.xpReward || 0,
        status: 'rejected',
        submittedAt: selectedQuest.createdAt || serverTimestamp(),
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
        adminComment: adminComment || 'Quête rejetée',
        type: 'standard'
      });
      
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
   * 🔄 RÉACTIVER UNE QUÊTE (remettre en disponible)
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
   * 💎 FORCER L'ATTRIBUTION DES XP - VERSION CORRIGÉE
   */
  const handleForceXp = async () => {
    if (!selectedQuest || !editedXp) return;
    
    setProcessing(true);
    try {
      console.log('💎 Force attribution XP:', editedXp, 'pour quête:', selectedQuest.id);
      
      const userId = selectedQuest.userId || selectedQuest.assignedTo?.[0] || selectedQuest.createdBy;
      
      if (!userId) {
        alert('❌ Utilisateur introuvable pour cette quête');
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
        
        // Mettre à jour la quête pour indiquer que les XP ont été forcés
        await updateDoc(doc(db, 'tasks', selectedQuest.id), {
          xpForcedAt: serverTimestamp(),
          xpForcedBy: user.uid,
          xpForcedAmount: xpToAdd
        });
        
        // ✅ CRÉER L'ENTRÉE DANS task_validations
        await addDoc(collection(db, 'task_validations'), {
          taskId: selectedQuest.id,
          taskTitle: selectedQuest.title || 'Sans titre',
          userId: userId,
          userName: selectedQuest.userName || userData.displayName || 'Utilisateur',
          xpAmount: xpToAdd,
          status: 'approved',
          submittedAt: selectedQuest.validatedAt || serverTimestamp(),
          reviewedAt: serverTimestamp(),
          reviewedBy: user.uid,
          adminComment: `XP forcés: ${xpToAdd}`,
          type: 'force_xp'
        });
        
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
          await teamPoolService.contributeToPool(
            userId,
            userEmail,
            xpToAdd,
            'admin_force_xp',
            false
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
    quest.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quest.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quest.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatter la date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Couleur selon la difficulté
  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-500/20 text-green-400 border-green-500/30',
      normal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      expert: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[difficulty] || colors.normal;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-400" />
              Validation des Quêtes
            </h1>
            <p className="text-gray-400 mt-2">
              Validez les quêtes terminées et attribuez les XP aux membres de l'équipe
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="En attente"
              value={stats.pending}
              icon={Clock}
              color="orange"
            />
            <StatCard
              title="Validées"
              value={stats.validated}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Rejetées"
              value={stats.rejected}
              icon={XCircle}
              color="purple"
            />
            <StatCard
              title="XP distribués"
              value={stats.totalXpDistributed}
              icon={Trophy}
              color="blue"
            />
          </div>

          {/* Onglets */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Clock className="w-5 h-5 inline mr-2" />
              En attente ({pendingQuests.length})
            </button>
            <button
              onClick={() => setActiveTab('validated')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'validated'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Validées ({validatedQuests.length})
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par titre, utilisateur..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Liste des quêtes */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
              <p className="text-gray-400 mt-4">Chargement...</p>
            </div>
          ) : filteredQuests.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune quête trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuests.map((quest) => (
                <GlassCard key={quest.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {quest.title || 'Sans titre'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(quest.difficulty)}`}>
                          {quest.difficulty || 'normal'}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">
                        {quest.description || 'Pas de description'}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {quest.userName}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(quest.createdAt)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-500 font-semibold">
                            {quest.xpReward || 25} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      {activeTab === 'pending' ? (
                        <button
                          onClick={() => openValidationModal(quest)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Examiner
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => openForceXpModal(quest)}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                          >
                            <Coins className="w-4 h-4" />
                            XP
                          </button>
                          <button
                            onClick={() => handleReactivate(quest)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Réactiver
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Modal de validation */}
        <AnimatePresence>
          {showValidationModal && selectedQuest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowValidationModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Shield className="w-6 h-6 text-purple-400" />
                      Validation de Quête
                    </h2>
                    <button
                      onClick={() => setShowValidationModal(false)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <CloseIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6 space-y-6">
                  {/* Info quête */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {selectedQuest.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {selectedQuest.description || 'Pas de description'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Utilisateur:</span>
                        <span className="text-white ml-2">{selectedQuest.userName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">XP:</span>
                        <span className="text-yellow-500 font-semibold ml-2">
                          {selectedQuest.xpReward || 25} XP
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulté:</span>
                        <span className="text-white ml-2">{selectedQuest.difficulty || 'normal'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <span className="text-white ml-2">{formatDate(selectedQuest.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preuve photo/vidéo */}
                  {(selectedQuest.validationPhoto || selectedQuest.validationVideo) && (
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Preuves fournies
                      </h4>
                      {selectedQuest.validationPhoto && (
                        <img
                          src={selectedQuest.validationPhoto}
                          alt="Preuve"
                          className="w-full rounded-lg"
                        />
                      )}
                    </div>
                  )}

                  {/* Commentaire admin */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Ajouter un commentaire pour l'utilisateur..."
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-700 flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Rejeter
                  </button>
                  <button
                    onClick={handleValidate}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Valider (+{selectedQuest.xpReward || 25} XP)
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Force XP */}
        <AnimatePresence>
          {showForceXpModal && selectedQuest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowForceXpModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <Coins className="w-6 h-6 text-yellow-500" />
                  Forcer Attribution XP
                </h2>

                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">
                    Quête: <span className="text-white">{selectedQuest.title}</span>
                  </p>
                  <p className="text-gray-400 text-sm">
                    Utilisateur: <span className="text-white">{selectedQuest.userName}</span>
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Montant XP à attribuer
                  </label>
                  <input
                    type="number"
                    value={editedXp}
                    onChange={(e) => setEditedXp(e.target.value)}
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForceXpModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleForceXp}
                    disabled={processing || !editedXp}
                    className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Attribuer {editedXp} XP
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default AdminTaskValidationPage;
