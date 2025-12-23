// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// VRAIE PAGE DE VALIDATION DES QUÊTES - FIREBASE + CHARTE SYNERGIA
// ✅ CORRIGÉ : AFFICHAGE PREUVES (COMMENTAIRES, PHOTOS, VIDÉOS) DANS LE MODAL
// ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
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
  Coins,
  Maximize2,
  Image as ImageIcon
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
import { calculateLevel } from '../core/services/levelService.js';

// ✅ IMPORT DU SERVICE TEAM POOL POUR CONTRIBUTION AUTOMATIQUE
import teamPoolService from '../core/services/teamPoolService.js';

// 🌳 IMPORT DU SERVICE SKILLS POUR DISTRIBUTION XP COMPÉTENCES
import skillService from '../core/services/skillService.js';

/**
 * 🎨 COMPOSANT CARTE GLASSMORPHISM
 */
const GlassCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-6 hover:bg-gray-700/50 transition-all duration-300 ${className}`}
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
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-3 sm:p-6 text-white`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
        <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
        <h3 className="text-xs sm:text-sm font-medium opacity-90">{title}</h3>
      </div>
      <div className="text-xl sm:text-3xl font-bold mb-1">{value}</div>
      {trend && <div className="text-xs sm:text-sm opacity-75 hidden sm:block">{trend}</div>}
    </div>
  );
};

/**
 * 🛡️ VRAIE PAGE DE VALIDATION DES QUÊTES
 * ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
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
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);
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
        const odot = taskData.assignedTo?.[0] || taskData.createdBy;
        
        if (odot) {
          try {
            const userDoc = await getDoc(doc(db, 'users', odot));
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
          odot,
          userName: userData.displayName || userData.email || 'Anonyme',
          userEmail: userData.email || '',
          submittedAt: taskData.updatedAt || taskData.createdAt,
          questTitle: taskData.title || 'Quête sans titre',
          difficulty: taskData.difficulty || 'Normale',
          xpReward: taskData.xpReward || 25,
          // ✅ PREUVES DE VALIDATION
          validationComment: taskData.validationComment || taskData.comment || '',
          validationPhotoUrl: taskData.validationPhotoUrl || taskData.photoUrl || null,
          validationVideoUrl: taskData.validationVideoUrl || taskData.videoUrl || null,
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
        const odot = taskData.assignedTo?.[0] || taskData.createdBy;
        
        if (odot) {
          try {
            const userDoc = await getDoc(doc(db, 'users', odot));
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
          odot,
          userName: userData.displayName || userData.email || 'Anonyme',
          userEmail: userData.email || '',
          validatedAt: taskData.validatedAt,
          questTitle: taskData.title || 'Quête sans titre',
          difficulty: taskData.difficulty || 'Normale',
          xpReward: taskData.xpReward || 25,
          // ✅ PREUVES DE VALIDATION
          validationComment: taskData.validationComment || taskData.comment || '',
          validationPhotoUrl: taskData.validationPhotoUrl || taskData.photoUrl || null,
          validationVideoUrl: taskData.validationVideoUrl || taskData.videoUrl || null,
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
   * ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
   */
  const handleValidate = async () => {
    if (!selectedQuest) return;
    
    setProcessing(true);
    try {
      console.log('✅ Validation quête:', selectedQuest.id);
      
      const odot = selectedQuest.assignedTo?.[0] || selectedQuest.createdBy;
      const xpToAdd = selectedQuest.xpReward || 25;
      
      // 1. Mettre à jour le statut de la quête
      await updateDoc(doc(db, 'tasks', selectedQuest.id), {
        status: 'completed',
        validatedAt: serverTimestamp(),
        validatedBy: user.uid,
        adminComment: adminComment,
        validationStatus: 'approved'
      });
      
      // 2. Attribuer les XP à l'utilisateur (SYSTÈME 2 COMPTEURS)
      let newTotalXP = 0;
      let newSpendableXP = 0;
      let newLevel = 1;
      let userEmail = '';
      
      if (odot) {
        const userRef = doc(db, 'users', odot);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const gamification = userData.gamification || {};
          userEmail = userData.email || '';
          
          const currentXP = gamification.totalXp || 0;
          const currentSpendableXP = gamification.spendableXp || currentXP;
          newTotalXP = currentXP + xpToAdd;
          newSpendableXP = currentSpendableXP + xpToAdd;
          newLevel = calculateLevel(newTotalXP);
          const currentTasksCompleted = gamification.tasksCompleted || 0;
          
          console.log(`🎯 Attribution XP (2 compteurs):`, {
            odot,
            currentXP,
            currentSpendableXP,
            xpToAdd,
            newTotalXP,
            newSpendableXP,
            newLevel
          });
          
          // ✅ MISE À JOUR AVEC LES 2 COMPTEURS
          await updateDoc(userRef, {
            // ✅ XP DE PRESTIGE (classements, niveaux) - NE DIMINUE JAMAIS
            'gamification.totalXp': newTotalXP,
            // ✅ XP DÉPENSABLES (récompenses) - SE DÉDUIT À L'ACHAT
            'gamification.spendableXp': newSpendableXP,
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
          
          console.log(`💎 ${xpToAdd} XP attribués à ${odot} (totalXp + spendableXp)`);
          console.log(`✅ Nouveau total: ${newTotalXP} XP prestige, ${newSpendableXP} XP dépensables (Niveau ${newLevel})`);
        }
      }
      
      // ✅ 3. CRÉER L'ENTRÉE DANS task_validations POUR L'HISTORIQUE GODMOD
      console.log('📝 Création entrée task_validations pour historique...');
      try {
        await addDoc(collection(db, 'task_validations'), {
          taskId: selectedQuest.id,
          taskTitle: selectedQuest.title || selectedQuest.questTitle || 'Sans titre',
          odot: odot,
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
          odot: odot,
          xpGained: xpToAdd,
          source: 'task_validation',
          userEmail: userEmail,
          gamificationData: {
            totalXp: newTotalXP,
            spendableXp: newSpendableXP,
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
        const contributionAmount = Math.max(1, Math.round(xpToAdd * 0.2));
        console.log(`💰 Contribution calculée: ${contributionAmount} XP (20% de ${xpToAdd})`);
        
        const poolResult = await teamPoolService.contributeToPool(
          odot,
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

      // ✅ 6. DISTRIBUTION XP AUX COMPÉTENCES (SKILLS)
      try {
        const requiredSkills = selectedQuest.requiredSkills || selectedQuest.skills || [];

        if (requiredSkills.length > 0 && odot) {
          console.log('🌳 Distribution XP aux compétences...');
          console.log('🌳 Skills de la quête:', requiredSkills);

          // Distribuer 1 point de skill par compétence de la quête
          const skillResults = await skillService.distributeQuestSkillXP(
            odot,
            xpToAdd,
            requiredSkills
          );

          console.log('✅ XP compétences distribués:', skillResults);
        } else {
          console.log('ℹ️ Pas de compétences requises pour cette quête');
        }
      } catch (skillError) {
        console.warn('⚠️ Erreur distribution XP skills (non bloquante):', skillError);
      }

      // 7. Fermer le modal et recharger
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
      
      const odot = selectedQuest.assignedTo?.[0] || selectedQuest.createdBy;
      
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
          odot: odot,
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
   * ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
   */
  const handleForceXp = async () => {
    if (!selectedQuest || !editedXp) return;
    
    setProcessing(true);
    try {
      console.log('💎 Force attribution XP:', editedXp, 'pour quête:', selectedQuest.id);
      
      const odot = selectedQuest.odot || selectedQuest.assignedTo?.[0] || selectedQuest.createdBy;
      
      if (!odot) {
        alert('❌ Utilisateur introuvable pour cette quête');
        setProcessing(false);
        return;
      }
      
      const userRef = doc(db, 'users', odot);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const gamification = userData.gamification || {};
        const userEmail = userData.email || '';
        
        const currentXP = gamification.totalXp || 0;
        const currentSpendableXP = gamification.spendableXp || currentXP;
        const xpToAdd = parseInt(editedXp);
        const newTotalXP = currentXP + xpToAdd;
        const newSpendableXP = currentSpendableXP + xpToAdd;
        const newLevel = calculateLevel(newTotalXP);
        
        console.log(`🎯 Force XP (2 compteurs):`, {
          odot,
          currentXP,
          currentSpendableXP,
          xpToAdd,
          newTotalXP,
          newSpendableXP,
          newLevel
        });
        
        // ✅ MISE À JOUR AVEC LES 2 COMPTEURS
        await updateDoc(userRef, {
          // ✅ XP DE PRESTIGE (classements, niveaux) - NE DIMINUE JAMAIS
          'gamification.totalXp': newTotalXP,
          // ✅ XP DÉPENSABLES (récompenses) - SE DÉDUIT À L'ACHAT
          'gamification.spendableXp': newSpendableXP,
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
            odot: odot,
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
            odot: odot,
            xpGained: xpToAdd,
            source: 'admin_force_xp',
            userEmail: userEmail,
            gamificationData: {
              totalXp: newTotalXP,
              spendableXp: newSpendableXP,
              level: newLevel
            },
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(xpUpdateEvent);
        
        // ✅ CONTRIBUTION AU POOL ÉQUIPE
        try {
          const contributionAmount = Math.max(1, Math.round(xpToAdd * 0.2));
          console.log(`💰 Contribution forcée: ${contributionAmount} XP (20% de ${xpToAdd})`);
          
          await teamPoolService.contributeToPool(
            odot,
            userEmail,
            contributionAmount,
            'admin_force_xp',
            true
          );
        } catch (poolError) {
          console.warn('⚠️ Erreur contribution pool:', poolError);
        }
        
        alert(`✅ ${xpToAdd} XP attribués avec succès !\n\n💎 XP Prestige: ${newTotalXP}\n🛒 XP Dépensables: ${newSpendableXP}`);
        setShowForceXpModal(false);
        setEditedXp(0);
        await loadValidatedQuests();
        
        console.log(`💎 ${xpToAdd} XP forcés pour ${odot} (totalXp + spendableXp)`);
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

  // ✅ RÉCUPÉRER LES PREUVES DE VALIDATION
  const getValidationProof = (quest) => {
    return {
      comment: quest.validationComment || quest.comment || null,
      photoUrl: quest.validationPhotoUrl || quest.photoUrl || null,
      videoUrl: quest.validationVideoUrl || quest.videoUrl || null,
      hasProof: !!(quest.validationComment || quest.comment || quest.validationPhotoUrl || quest.photoUrl || quest.validationVideoUrl || quest.videoUrl)
    };
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">

          {/* 🎯 HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                  🛡️ Validation des Quêtes
                </h1>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
                  <span className="hidden sm:inline">Validez les quêtes terminées et attribuez les XP (système 2 compteurs) • </span>
                  <span className="sm:hidden">Validez les quêtes • </span>
                  Connecté : <span className="text-white font-semibold">{user?.displayName || user?.email}</span>
                </p>
              </div>

              <button
                onClick={() => activeTab === 'pending' ? loadPendingQuests() : loadValidatedQuests()}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
                <span className="sm:hidden">Rafraîchir</span>
              </button>
            </div>
          </motion.div>

          {/* 📊 STATISTIQUES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8"
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
            className="mb-4 sm:mb-6"
          >
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1 sm:p-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                  activeTab === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">En Attente</span>
                  <span className="sm:hidden">Attente</span>
                  ({stats.pending})
                </div>
              </button>

              <button
                onClick={() => setActiveTab('validated')}
                className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                  activeTab === 'validated'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Validées</span>
                  <span className="sm:hidden">Validées</span>
                  ({stats.validated})
                </div>
              </button>
            </div>
          </motion.div>

          {/* 🔍 BARRE DE RECHERCHE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
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
              {filteredQuests.map((quest, index) => {
                const proof = getValidationProof(quest);

                return (
                  <GlassCard key={quest.id}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      {/* Icône - hidden on mobile, shown in header instead */}
                      <div className={`hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 ${
                        activeTab === 'pending'
                          ? 'bg-orange-500/20'
                          : 'bg-green-500/20'
                      } rounded-xl items-center justify-center flex-shrink-0`}>
                        {activeTab === 'pending' ? (
                          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                        ) : (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {/* Mobile icon */}
                              <div className={`sm:hidden w-6 h-6 ${
                                activeTab === 'pending' ? 'bg-orange-500/20' : 'bg-green-500/20'
                              } rounded flex items-center justify-center flex-shrink-0`}>
                                {activeTab === 'pending' ? (
                                  <Clock className="w-3 h-3 text-orange-400" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                )}
                              </div>
                              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                                {quest.questTitle}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="truncate max-w-[100px] sm:max-w-none">{quest.userName}</span>
                              </span>
                              <span className="hidden sm:flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {activeTab === 'pending'
                                  ? quest.submittedAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'
                                  : quest.validatedAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                                {quest.xpReward} XP
                              </span>
                              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                                quest.difficulty === 'Facile' || quest.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                quest.difficulty === 'Normale' || quest.difficulty === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {quest.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Badge statut + preuves */}
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {/* ✅ INDICATEURS DE PREUVES */}
                            {proof.hasProof && (
                              <div className="flex items-center gap-1">
                                {proof.comment && (
                                  <span className="p-1 bg-blue-500/20 rounded" title="Commentaire">
                                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                                  </span>
                                )}
                                {proof.photoUrl && (
                                  <span className="p-1 bg-purple-500/20 rounded" title="Photo">
                                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                                  </span>
                                )}
                                {proof.videoUrl && (
                                  <span className="p-1 bg-pink-500/20 rounded" title="Vidéo">
                                    <Video className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                                  </span>
                                )}
                              </div>
                            )}

                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold border ${
                              activeTab === 'pending'
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                                : 'bg-green-500/20 text-green-400 border-green-500/50'
                            }`}>
                              <span className="hidden sm:inline">{activeTab === 'pending' ? 'En attente' : 'Validée'}</span>
                              <span className="sm:hidden">{activeTab === 'pending' ? 'Att.' : 'OK'}</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* Description/Commentaire */}
                        {proof.comment && (
                          <p className="text-gray-400 text-sm mb-3 bg-gray-900/30 rounded-lg p-2 border border-gray-700/50">
                            💬 {proof.comment}
                          </p>
                        )}
                        
                        {/* Commentaire admin (quêtes validées) */}
                        {activeTab === 'validated' && quest.adminComment && (
                          <p className="text-blue-400 text-sm mb-3 bg-blue-500/10 rounded-lg p-2 border border-blue-500/30">
                            🛡️ Admin : {quest.adminComment}
                          </p>
                        )}
                        
                        {/* ✅ APERÇU PHOTO */}
                        {proof.photoUrl && (
                          <div className="mb-3">
                            <img 
                              src={proof.photoUrl} 
                              alt="Preuve photo"
                              className="max-h-32 rounded-lg border border-gray-700/50 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(proof.photoUrl, '_blank')}
                            />
                          </div>
                        )}
                        
                        {/* ✅ APERÇU VIDÉO */}
                        {proof.videoUrl && (
                          <div className="mb-3">
                            <video 
                              src={proof.videoUrl} 
                              controls
                              className="max-h-32 rounded-lg border border-gray-700/50"
                            />
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {activeTab === 'pending' ? (
                            <button
                              onClick={() => openValidationModal(quest)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Examiner</span>
                              <span className="sm:hidden">Voir</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleReactivate(quest)}
                                disabled={processing}
                                className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                              >
                                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Réactiver</span>
                                <span className="sm:hidden">React.</span>
                              </button>

                              <button
                                onClick={() => openForceXpModal(quest)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                              >
                                <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Forcer XP</span>
                                <span className="sm:hidden">XP</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </motion.div>
          )}

          {/* 🎭 MODAL DE VALIDATION - AVEC PREUVES */}
          <AnimatePresence>
            {showValidationModal && selectedQuest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
                onClick={() => !processing && setShowValidationModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                >
                  {/* Header Modal */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        Validation de Quête
                      </h2>
                      <p className="text-gray-400 text-sm sm:text-base hidden sm:block">
                        Examinez les détails et validez ou rejetez cette quête
                      </p>
                    </div>
                    <button
                      onClick={() => !processing && setShowValidationModal(false)}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                      <CloseIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Détails de la quête */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div>
                      <label className="text-xs sm:text-sm text-gray-400 mb-1 block">Titre de la quête</label>
                      <p className="text-base sm:text-lg font-bold text-white">{selectedQuest.questTitle}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs sm:text-sm text-gray-400 mb-1 block">Utilisateur</label>
                        <p className="text-white text-sm sm:text-base">{selectedQuest.userName}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm text-gray-400 mb-1 block">Difficulté</label>
                        <p className="text-white text-sm sm:text-base">{selectedQuest.difficulty}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs sm:text-sm text-gray-400 mb-1 block">Récompense XP</label>
                        <p className="text-white font-bold text-lg sm:text-xl">{selectedQuest.xpReward} XP</p>
                        <p className="text-xs text-green-400">💎 Prestige + 🛒 Dépensables</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm text-gray-400 mb-1 block">Date soumission</label>
                        <p className="text-white text-sm sm:text-base">
                          {selectedQuest.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ SECTION PREUVES DE VALIDATION */}
                  {(() => {
                    const proof = getValidationProof(selectedQuest);

                    if (proof.hasProof) {
                      return (
                        <div className="mb-4 sm:mb-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-3 sm:p-5">
                          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                            <span className="hidden sm:inline">Preuves de validation de l'utilisateur</span>
                            <span className="sm:hidden">Preuves</span>
                          </h3>

                          {/* Commentaire utilisateur */}
                          {proof.comment && (
                            <div className="mb-3 sm:mb-4">
                              <label className="text-xs sm:text-sm text-purple-300 mb-1 sm:mb-2 block flex items-center gap-1 sm:gap-2">
                                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                                Commentaire
                              </label>
                              <div className="bg-gray-900/60 border border-purple-500/20 rounded-lg p-2 sm:p-4">
                                <p className="text-white text-sm sm:text-base whitespace-pre-wrap">{proof.comment}</p>
                              </div>
                            </div>
                          )}

                          {/* Photo jointe */}
                          {proof.photoUrl && (
                            <div className="mb-3 sm:mb-4">
                              <label className="text-xs sm:text-sm text-purple-300 mb-1 sm:mb-2 block flex items-center gap-1 sm:gap-2">
                                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                                Photo
                              </label>
                              <div className="relative group">
                                <img
                                  src={proof.photoUrl}
                                  alt="Preuve photo"
                                  className="w-full max-h-48 sm:max-h-80 object-contain rounded-lg border border-purple-500/30 bg-black/30 cursor-pointer"
                                  onClick={() => setShowImageFullscreen(true)}
                                />
                                <button
                                  onClick={() => setShowImageFullscreen(true)}
                                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                >
                                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Vidéo jointe */}
                          {proof.videoUrl && (
                            <div className="mb-3 sm:mb-4">
                              <label className="text-xs sm:text-sm text-purple-300 mb-1 sm:mb-2 block flex items-center gap-1 sm:gap-2">
                                <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                                Vidéo
                              </label>
                              <video
                                src={proof.videoUrl}
                                controls
                                className="w-full max-h-48 sm:max-h-80 rounded-lg border border-purple-500/30 bg-black/30"
                              />
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div className="mb-4 sm:mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 sm:p-5">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                            <div>
                              <h3 className="text-sm sm:text-lg font-bold text-yellow-400">Aucune preuve</h3>
                              <p className="text-yellow-300/70 text-xs sm:text-sm hidden sm:block">
                                L'utilisateur n'a pas ajouté de commentaire, photo ou vidéo pour cette validation.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}

                  {/* Commentaire admin */}
                  <div className="mb-4 sm:mb-6">
                    <label className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 block">
                      Commentaire admin (optionnel)
                    </label>
                    <textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Commentaire..."
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-2 sm:p-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors text-sm sm:text-base"
                    >
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      {processing ? '...' : 'Rejeter'}
                    </button>

                    <button
                      onClick={handleValidate}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors text-sm sm:text-base"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">{processing ? 'Traitement...' : 'Valider & Attribuer XP'}</span>
                      <span className="sm:hidden">{processing ? '...' : 'Valider'}</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🖼️ MODAL IMAGE PLEIN ÉCRAN */}
          <AnimatePresence>
            {showImageFullscreen && selectedQuest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4"
                onClick={() => setShowImageFullscreen(false)}
              >
                <button
                  onClick={() => setShowImageFullscreen(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white p-2 bg-black/50 rounded-lg transition-colors"
                >
                  <CloseIcon className="w-8 h-8" />
                </button>
                <img 
                  src={getValidationProof(selectedQuest).photoUrl} 
                  alt="Preuve photo plein écran"
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
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
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
                onClick={() => !processing && setShowForceXpModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-lg w-full"
                >
                  {/* Header Modal */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        💎 <span className="hidden sm:inline">Forcer l'Attribution d'</span>XP
                      </h2>
                      <p className="text-gray-400 text-sm hidden sm:block">
                        Attribuez manuellement des XP pour cette quête
                      </p>
                    </div>
                    <button
                      onClick={() => !processing && setShowForceXpModal(false)}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                      <CloseIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Détails */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div>
                      <label className="text-xs sm:text-sm text-gray-400 mb-1 block">Quête</label>
                      <p className="text-white font-bold text-sm sm:text-base truncate">{selectedQuest.questTitle}</p>
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm text-gray-400 mb-1 block">Utilisateur</label>
                      <p className="text-white text-sm sm:text-base">{selectedQuest.userName}</p>
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 block">
                        Montant d'XP
                      </label>
                      <input
                        type="number"
                        value={editedXp}
                        onChange={(e) => setEditedXp(e.target.value)}
                        placeholder="25"
                        min="1"
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-2 sm:p-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        XP de base : {selectedQuest.xpReward} XP
                      </p>
                      <p className="text-xs text-green-400 mt-1 hidden sm:block">
                        💎 Les XP seront ajoutés aux 2 compteurs : Prestige + Dépensables
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => !processing && setShowForceXpModal(false)}
                      disabled={processing}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-colors text-sm sm:text-base"
                    >
                      Annuler
                    </button>

                    <button
                      onClick={handleForceXp}
                      disabled={processing || !editedXp}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors text-sm sm:text-base"
                    >
                      <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                      {processing ? '...' : `${editedXp} XP`}
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
