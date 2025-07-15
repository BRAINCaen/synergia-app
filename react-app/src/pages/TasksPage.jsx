// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE COMPLET AVEC TOUTES FONCTIONNALITÉS - OPTIMISÉ POUR BUILD
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar,
  Users,
  Clock,
  Star,
  Play,
  CheckCircle,
  Edit,
  Trash2,
  Camera,
  UserPlus,
  Trophy,
  AlertTriangle,
  MoreVertical,
  X,
  Check,
  User,
  Percent,
  Info,
  Loader,
  Filter,
  Download,
  Upload,
  Tag,
  Archive,
  RefreshCw,
  Eye,
  MessageSquare,
  Zap,
  Target,
  Flag,
  Bell,
  Share,
  Copy,
  ExternalLink,
  FileText,
  Image,
  Video,
  Paperclip,
  Send,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Settings
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Store et Firebase
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// ✅ IMPORTS DES COMPOSANTS AVANCÉS RESTAURÉS
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';
import { taskValidationService } from '../core/services/taskValidationService.js';

/**
 * 🎯 MODAL D'ASSIGNATION AVANCÉ INTÉGRÉ - OPTIMISÉ
 */
const AdvancedAssignmentModal = ({ 
  isOpen, 
  onClose, 
  task, 
  onAssignmentSuccess 
}) => {
  const { user } = useAuthStore();
  
  // États
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [contributions, setContributions] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [searchMember, setSearchMember] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ✅ CHARGEMENT OPTIMISÉ DIRECT FIREBASE
  const loadAvailableMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const members = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.email) {
          members.push({
            id: doc.id,
            uid: doc.id,
            name: userData.profile?.displayName || 
                  userData.displayName || 
                  userData.email?.split('@')[0] || 
                  'Utilisateur',
            email: userData.email,
            avatar: userData.photoURL || userData.profile?.avatar,
            role: userData.profile?.role || 'member',
            level: userData.gamification?.level || 1,
            totalXp: userData.gamification?.totalXp || 0,
            isActive: userData.isActive !== false,
            department: userData.profile?.department || 'general',
            skills: userData.profile?.skills || [],
            tasksCompleted: userData.gamification?.tasksCompleted || 0
          });
        }
      });
      
      // Trier par niveau et XP
      members.sort((a, b) => {
        if (a.level !== b.level) return b.level - a.level;
        return b.totalXp - a.totalXp;
      });
      
      setAvailableMembers(members);
      
    } catch (error) {
      console.error('❌ Erreur chargement membres:', error);
      setError('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    if (isOpen) {
      loadAvailableMembers();
      setSelectedMembers([]);
      setContributions({});
      setStep(1);
      setError('');
      setSearchMember('');
    }
  }, [isOpen]);

  // Filtrer les membres par recherche
  const filteredMembers = availableMembers.filter(member =>
    member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    member.email.toLowerCase().includes(searchMember.toLowerCase()) ||
    member.department.toLowerCase().includes(searchMember.toLowerCase())
  );

  // Sélectionner/désélectionner un membre
  const toggleMemberSelection = (member) => {
    setSelectedMembers(prev => {
      const isSelected = prev.find(m => m.id === member.id);
      
      if (isSelected) {
        const updated = prev.filter(m => m.id !== member.id);
        setContributions(prevContrib => {
          const newContrib = { ...prevContrib };
          delete newContrib[member.id];
          return newContrib;
        });
        return updated;
      } else {
        return [...prev, member];
      }
    });
  };

  // Calculer le total des pourcentages
  const getTotalPercentage = () => {
    return Object.values(contributions).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  // Distribuer équitablement
  const distributeEqually = () => {
    if (selectedMembers.length === 0) return;
    
    const equalPercentage = Math.floor(100 / selectedMembers.length);
    const remainder = 100 - (equalPercentage * selectedMembers.length);
    
    const newContributions = {};
    selectedMembers.forEach((member, index) => {
      if (index === selectedMembers.length - 1) {
        newContributions[member.id] = equalPercentage + remainder;
      } else {
        newContributions[member.id] = equalPercentage;
      }
    });
    
    setContributions(newContributions);
  };

  // Mettre à jour une contribution
  const updateContribution = (memberId, value) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    
    setContributions(prev => ({
      ...prev,
      [memberId]: clampedValue
    }));
  };

  // ✅ ASSIGNATION AVANCÉE AVEC DONNÉES COMPLÈTES
  const handleSubmitAssignment = async () => {
    if (!task?.id || selectedMembers.length === 0) {
      setError('Paramètres invalides');
      return;
    }

    // Si étape 1 et sélection multiple, passer à l'étape 2
    if (step === 1 && selectedMembers.length > 1) {
      setStep(2);
      distributeEqually();
      return;
    }

    // Validation des pourcentages
    if (selectedMembers.length > 1 && getTotalPercentage() !== 100) {
      setError(`Les pourcentages doivent totaliser 100% (actuellement ${getTotalPercentage()}%)`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Préparer les données d'assignation complètes
      const assignmentData = selectedMembers.map(member => ({
        userId: member.id,
        userName: member.name,
        userEmail: member.email,
        userAvatar: member.avatar,
        userLevel: member.level,
        userDepartment: member.department,
        assignedAt: new Date().toISOString(),
        assignedBy: user.uid,
        assignedByName: user.displayName || user.email,
        status: 'assigned',
        contributionPercentage: selectedMembers.length > 1 ? 
          (contributions[member.id] || 0) : 100,
        hasSubmitted: false,
        submissionDate: null,
        submissionData: null,
        validationStatus: 'pending',
        estimatedHours: null,
        actualHours: null,
        notes: ''
      }));

      // Mettre à jour la tâche avec données enrichies
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        // Assignation de base
        assignedTo: selectedMembers.map(m => m.id),
        assignedMembers: selectedMembers.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          avatar: m.avatar,
          level: m.level,
          department: m.department
        })),
        
        // Données d'assignation détaillées
        assignments: assignmentData,
        
        // Métadonnées d'assignation
        isMultipleAssignment: selectedMembers.length > 1,
        assignmentCount: selectedMembers.length,
        assignmentType: selectedMembers.length > 1 ? 'collaborative' : 'individual',
        
        // Statut et timestamps
        status: 'assigned',
        assignedAt: serverTimestamp(),
        lastAssignedBy: user.uid,
        lastAssignedByName: user.displayName || user.email,
        updatedAt: serverTimestamp(),
        
        // Répartition des contributions
        hasContributionSplit: selectedMembers.length > 1,
        contributionPercentages: selectedMembers.length > 1 ? contributions : null,
        
        // Workflow et suivi
        workflowStep: 'assigned',
        requiresValidation: true,
        estimatedCompletionDate: null,
        priority: task.priority || 'medium',
        
        // Notifications
        notificationsEnabled: true,
        assignmentNotificationsSent: false,
        
        // Métriques de performance
        assignmentMetrics: {
          assignedMembersCount: selectedMembers.length,
          totalLevelAssigned: selectedMembers.reduce((sum, m) => sum + m.level, 0),
          averageLevelAssigned: Math.round(selectedMembers.reduce((sum, m) => sum + m.level, 0) / selectedMembers.length),
          departmentsInvolved: [...new Set(selectedMembers.map(m => m.department))],
          assignmentComplexity: selectedMembers.length > 3 ? 'high' : selectedMembers.length > 1 ? 'medium' : 'low'
        }
      });

      // ✅ CRÉER LES NOTIFICATIONS POUR LES ASSIGNÉS
      const batch = writeBatch(db);
      
      selectedMembers.forEach(member => {
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
          userId: member.id,
          type: 'task_assigned',
          title: 'Nouvelle tâche assignée',
          message: `Vous avez été assigné à la tâche: ${task.title}`,
          taskId: task.id,
          taskTitle: task.title,
          assignedBy: user.uid,
          assignedByName: user.displayName || user.email,
          contributionPercentage: selectedMembers.length > 1 ? (contributions[member.id] || 0) : 100,
          isMultiple: selectedMembers.length > 1,
          priority: task.priority || 'medium',
          createdAt: serverTimestamp(),
          read: false,
          actionRequired: true
        });
      });
      
      await batch.commit();

      console.log('✅ Assignation avancée réussie');
      
      // Notifier le parent avec données complètes
      if (onAssignmentSuccess) {
        onAssignmentSuccess({
          success: true,
          assignedMembers: selectedMembers,
          taskId: task.id,
          assignmentCount: selectedMembers.length,
          assignmentType: selectedMembers.length > 1 ? 'collaborative' : 'individual',
          contributions: selectedMembers.length > 1 ? contributions : null,
          metrics: {
            totalLevel: selectedMembers.reduce((sum, m) => sum + m.level, 0),
            averageLevel: Math.round(selectedMembers.reduce((sum, m) => sum + m.level, 0) / selectedMembers.length),
            departments: [...new Set(selectedMembers.map(m => m.department))]
          }
        });
      }
      
      handleClose();
      
    } catch (error) {
      console.error('❌ Erreur assignation avancée:', error);
      setError(`Erreur lors de l'assignation: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedMembers([]);
    setContributions({});
    setStep(1);
    setError('');
    setSearchMember('');
    setShowAdvanced(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        >
          {/* Header Avancé */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Assignation Avancée
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tâche: <span className="font-medium">{task?.title}</span>
                    </p>
                  </div>
                </div>
                
                {/* Indicateur d'étapes */}
                <div className="flex items-center gap-2 ml-6">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </span>
                  <span className="text-sm text-gray-600">Sélection</span>
                  
                  <div className="w-8 h-px bg-gray-300"></div>
                  
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </span>
                  <span className="text-sm text-gray-600">Répartition</span>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu Principal */}
          <div className="overflow-y-auto max-h-[65vh]">
            
            {/* Affichage des erreurs */}
            {error && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Erreur</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
                
                {error.includes('chargement') && (
                  <button
                    onClick={loadAvailableMembers}
                    disabled={loading}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    Réessayer
                  </button>
                )}
              </div>
            )}

            {/* Étape 1: Sélection Avancée */}
            {step === 1 && (
              <div className="p-6 space-y-6">
                
                {/* Barre de recherche et filtres */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchMember}
                        onChange={(e) => setSearchMember(e.target.value)}
                        placeholder="Rechercher par nom, email ou département..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {showAdvanced ? 'Masquer' : 'Filtres avancés'}
                  </button>
                </div>

                {/* Filtres avancés */}
                {showAdvanced && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Département
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Tous les départements</option>
                          <option value="tech">Tech</option>
                          <option value="design">Design</option>
                          <option value="marketing">Marketing</option>
                          <option value="sales">Ventes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Niveau minimum
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Tous niveaux</option>
                          <option value="1">Niveau 1+</option>
                          <option value="5">Niveau 5+</option>
                          <option value="10">Niveau 10+</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Disponibilité
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Tous</option>
                          <option value="available">Disponibles</option>
                          <option value="busy">Occupés</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Membres sélectionnés */}
                {selectedMembers.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Membres sélectionnés ({selectedMembers.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map(member => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm"
                        >
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{member.name}</span>
                          <span className="text-blue-600">•</span>
                          <span className="text-xs">Niv. {member.level}</span>
                          <button
                            onClick={() => toggleMemberSelection(member)}
                            className="hover:text-blue-600 ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    {/* Statistiques de sélection */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-900">
                            {Math.round(selectedMembers.reduce((sum, m) => sum + m.level, 0) / selectedMembers.length)}
                          </div>
                          <div className="text-xs text-blue-700">Niveau moyen</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-900">
                            {selectedMembers.reduce((sum, m) => sum + m.totalXp, 0)}
                          </div>
                          <div className="text-xs text-blue-700">XP total</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-900">
                            {[...new Set(selectedMembers.map(m => m.department))].length}
                          </div>
                          <div className="text-xs text-blue-700">Départements</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Liste des membres avec design avancé */}
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-3">Chargement des membres...</p>
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        {searchMember ? 'Aucun membre trouvé' : 'Aucun membre disponible'}
                      </h3>
                      <p className="text-gray-500">
                        {searchMember ? 'Essayez un autre terme de recherche' : 'Vérifiez votre connexion'}
                      </p>
                      {!searchMember && (
                        <button
                          onClick={loadAvailableMembers}
                          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Recharger
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {filteredMembers.map(member => {
                        const isSelected = selectedMembers.find(m => m.id === member.id);
                        
                        return (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => toggleMemberSelection(member)}
                            className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Avatar et statut */}
                              <div className="relative">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                  isSelected ? 'bg-blue-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'
                                }`}>
                                  {isSelected ? (
                                    <Check className="w-6 h-6" />
                                  ) : (
                                    member.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                  member.isActive ? 'bg-green-500' : 'bg-gray-400'
                                }`}></div>
                              </div>
                              
                              {/* Informations détaillées */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 truncate">
                                    {member.name}
                                  </h4>
                                  {member.level >= 10 && (
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-600 truncate mb-2">
                                  {member.email}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Target className="w-3 h-3" />
                                      Niv. {member.level}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Zap className="w-3 h-3" />
                                      {member.totalXp} XP
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      {member.tasksCompleted}
                                    </span>
                                  </div>
                                  
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    member.department === 'tech' ? 'bg-blue-100 text-blue-800' :
                                    member.department === 'design' ? 'bg-purple-100 text-purple-800' :
                                    member.department === 'marketing' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {member.department}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Indicateur de sélection */}
                              {isSelected && (
                                <div className="text-blue-600">
                                  <Check className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Étape 2: Répartition Avancée */}
            {step === 2 && (
              <div className="p-6 space-y-6">
                
                {/* Header répartition */}
                <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Définir la répartition des contributions
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Assignez des pourcentages de contribution pour chaque membre
                  </p>
                  <div className="text-2xl font-bold">
                    Total: <span className={`${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {getTotalPercentage()}%
                    </span>
                  </div>
                </div>

                {/* Actions de répartition */}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={distributeEqually}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Percent className="w-4 h-4" />
                    Distribuer équitablement
                  </button>
                  
                  <button
                    onClick={() => {
                      const newContributions = {};
                      selectedMembers.forEach(member => {
                        newContributions[member.id] = Math.round(member.level * 10);
                      });
                      setContributions(newContributions);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Selon le niveau
                  </button>
                </div>

                {/* Répartition par membre avec design avancé */}
                <div className="space-y-4">
                  {selectedMembers.map(member => (
                    <motion.div 
                      key={member.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm"
                    >
                      {/* Avatar et info */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Niveau {member.level}
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              {member.totalXp} XP
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              member.department === 'tech' ? 'bg-blue-100 text-blue-800' :
                              member.department === 'design' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {member.department}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Input de pourcentage avec contrôles */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateContribution(member.id, (contributions[member.id] || 0) - 5)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600"
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={contributions[member.id] || 0}
                          onChange={(e) => updateContribution(member.id, e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                        
                        <button
                          onClick={() => updateContribution(member.id, (contributions[member.id] || 0) + 5)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600"
                        >
                          +
                        </button>
                        
                        <span className="text-gray-600 font-medium">%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Validation pourcentages */}
                {getTotalPercentage() !== 100 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 text-orange-800 mb-2">
                      <Info className="w-5 h-5" />
                      <span className="font-medium">Ajustement nécessaire</span>
                    </div>
                    <p className="text-orange-700">
                      Le total doit être exactement 100%. Actuellement: {getTotalPercentage()}%
                      {getTotalPercentage() > 100 ? 
                        ` (${getTotalPercentage() - 100}% en trop)` : 
                        ` (${100 - getTotalPercentage()}% manquant)`
                      }
                    </p>
                  </motion.div>
                )}

                {/* Résumé de l'assignation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Résumé de l'assignation</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{selectedMembers.length}</div>
                      <div className="text-sm text-gray-600">Membres</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(selectedMembers.reduce((sum, m) => sum + m.level, 0) / selectedMembers.length)}
                      </div>
                      <div className="text-sm text-gray-600">Niveau moyen</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {[...new Set(selectedMembers.map(m => m.department))].length}
                      </div>
                      <div className="text-sm text-gray-600">Départements</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedMembers.reduce((sum, m) => sum + m.totalXp, 0)}
                      </div>
                      <div className="text-sm text-gray-600">XP total</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer avec actions avancées */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              
              {/* Info étape */}
              <div className="text-sm text-gray-600">
                {step === 1 ? (
                  selectedMembers.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{selectedMembers.length} membre{selectedMembers.length > 1 ? 's' : ''} sélectionné{selectedMembers.length > 1 ? 's' : ''}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>Sélectionnez au moins un membre</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-blue-600" />
                    <span>Répartition pour {selectedMembers.length} membre{selectedMembers.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3">
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    disabled={submitting}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Retour
                  </button>
                )}
                
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleSubmitAssignment}
                  disabled={submitting || selectedMembers.length === 0 || (step === 2 && getTotalPercentage() !== 100)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                  {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {step === 1 ? (
                    selectedMembers.length > 1 ? (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Définir la répartition
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Assigner
                      </>
                    )
                  ) : (
                    submitting ? (
                      'Assignation en cours...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Confirmer l'assignation
                      </>
                    )
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * 🎯 COMPOSANT PRINCIPAL TASKS PAGE COMPLET
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // États de filtrage et tri
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignment, setFilterAssignment] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState('grid'); // grid ou list

  // États des modals
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // États des actions
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Charger les tâches depuis Firebase avec écoute temps réel
  useEffect(() => {
    if (!user?.uid) return;

    const loadTasks = () => {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          tasksData.push({
            id: doc.id,
            ...data,
            // Convertir les timestamps Firestore en dates
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
            dueDate: data.dueDate?.toDate?.() || (data.dueDate ? new Date(data.dueDate) : null),
            assignedAt: data.assignedAt?.toDate?.() || (data.assignedAt ? new Date(data.assignedAt) : null)
          });
        });
        setTasks(tasksData);
        setLoading(false);
      }, (error) => {
        console.error('Erreur chargement tâches:', error);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = loadTasks();
    return () => unsubscribe();
  }, [user?.uid]);

  // Filtrer et trier les tâches
  useEffect(() => {
    let filtered = [...tasks];

    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.assignedMembers?.some(member => 
          member.name?.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term)
        )
      );
    }

    // Filtrer par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filtrer par priorité
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Filtrer par assignation
    if (filterAssignment !== 'all') {
      if (filterAssignment === 'assigned') {
        filtered = filtered.filter(task => task.assignedTo && task.assignedTo.length > 0);
      } else if (filterAssignment === 'unassigned') {
        filtered = filtered.filter(task => !task.assignedTo || task.assignedTo.length === 0);
      } else if (filterAssignment === 'multiple') {
        filtered = filtered.filter(task => task.assignedTo && task.assignedTo.length > 1);
      }
    }

    // Trier
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          const aDate = a.dueDate || new Date(0);
          const bDate = b.dueDate || new Date(0);
          return aDate - bDate;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'created':
          return b.createdAt - a.createdAt;
        case 'updated':
          return b.updatedAt - a.updatedAt;
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, filterPriority, filterAssignment, sortBy]);

  // Actions sur les tâches
  const handleCreateTask = async (taskData = null) => {
    const data = taskData || {
      title: newTaskTitle,
      description: '',
      status: 'todo',
      priority: 'medium'
    };

    if (!data.title?.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignedTo: [],
        assignedMembers: [],
        isMultipleAssignment: false,
        assignmentCount: 0
      });

      setNewTaskTitle('');
      setShowQuickCreate(false);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Erreur création tâche:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      await updateDoc(doc(db, 'tasks', taskId), {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur completion tâche:', error);
    }
  };

  // Gestion des assignations
  const handleTaskAssignment = (result) => {
    console.log('✅ Assignation terminée avec succès:', result);
    // Optionnel: afficher une notification toast
  };

  // Sélection en lot
  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const selectAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  // Actions en lot
  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      const batch = writeBatch(db);
      
      selectedTasks.forEach(taskId => {
        const taskRef = doc(db, 'tasks', taskId);
        batch.update(taskRef, {
          status: newStatus,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      setSelectedTasks([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Erreur mise à jour en lot:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedTasks.length} tâche(s) ?`)) return;

    try {
      const batch = writeBatch(db);
      
      selectedTasks.forEach(taskId => {
        const taskRef = doc(db, 'tasks', taskId);
        batch.delete(taskRef);
      });
      
      await batch.commit();
      setSelectedTasks([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Erreur suppression en lot:', error);
    }
  };

  // Statistiques avancées
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    assigned: tasks.filter(t => t.assignedTo?.length > 0).length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
    collaborative: tasks.filter(t => t.isMultipleAssignment).length,
    highPriority: tasks.filter(t => t.priority === 'high').length
  };

  // Composant Card de tâche avancé
  const TaskCard = ({ task, isSelected, onSelect }) => {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'text-green-600 bg-green-100';
        case 'in_progress': return 'text-blue-600 bg-blue-100';
        case 'assigned': return 'text-purple-600 bg-purple-100';
        case 'todo': return 'text-gray-600 bg-gray-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative ${
          viewMode === 'grid' ? '' : 'border-b border-gray-200 last:border-b-0'
        }`}
      >
        <PremiumCard className={`p-4 hover:shadow-lg transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
          
          {/* Header avec checkbox et actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              {/* Checkbox de sélection */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(task.id)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              
              {/* Titre et description */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium line-clamp-2 ${
                  task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Badges de priorité et statut */}
            <div className="flex items-center gap-2 ml-2">
              <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              
              {isOverdue && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  En retard
                </span>
              )}
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-4">
              {/* Date d'échéance */}
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              
              {/* Dernière mise à jour */}
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Mis à jour {new Date(task.updatedAt).toLocaleDateString()}
              </div>
            </div>
            
            {/* Assignation */}
            {task.assignedMembers?.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{task.assignedMembers.length} assigné{task.assignedMembers.length > 1 ? 's' : ''}</span>
                {task.isMultipleAssignment && (
                  <span className="ml-1 px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                    Collaboratif
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Membres assignés */}
          {task.assignedMembers?.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-700">Assigné à:</span>
                <div className="flex -space-x-1">
                  {task.assignedMembers.slice(0, 3).map((member, index) => (
                    <div
                      key={member.id}
                      className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      title={member.name}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {task.assignedMembers.length > 3 && (
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                      +{task.assignedMembers.length - 3}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contributions si assignation multiple */}
              {task.isMultipleAssignment && task.assignments && (
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {task.assignments.map(assignment => (
                    <div key={assignment.userId} className="flex justify-between">
                      <span className="truncate">{assignment.userName}</span>
                      <span className="font-medium">{assignment.contributionPercentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedTask(task);
                setShowSubmissionModal(true);
              }}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-3 h-3" />
              {task.status === 'completed' ? 'Complétée' : 'Terminer'}
            </button>
            
            <button
              onClick={() => {
                setSelectedTask(task);
                setShowAssignmentModal(true);
              }}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              title="Assigner des membres"
            >
              <UserPlus className="w-3 h-3" />
              {task.assignedMembers?.length > 0 ? 'Réassigner' : 'Assigner'}
            </button>
            
            <button
              onClick={() => {
                setEditingTask(task);
                setShowTaskForm(true);
              }}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Modifier la tâche"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Supprimer la tâche"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </PremiumCard>
      </motion.div>
    );
  };

  // Formulaire de création de tâche avancé
  const TaskFormModal = ({ isOpen, onClose, task, onSubmit }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      estimatedHours: '',
      tags: []
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          priority: task.priority || 'medium',
          status: task.status || 'todo',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          estimatedHours: task.estimatedHours || '',
          tags: task.tags || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          dueDate: '',
          estimatedHours: '',
          tags: []
        });
      }
      setErrors({});
    }, [task, isOpen]);

    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.title.trim()) {
        newErrors.title = 'Le titre est requis';
      }
      
      if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
        newErrors.dueDate = 'La date d\'échéance ne peut pas être dans le passé';
      }
      
      if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours <= 0)) {
        newErrors.estimatedHours = 'Les heures estimées doivent être un nombre positif';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null
      };

      if (task) {
        await handleUpdateTask(task.id, taskData);
      } else {
        await handleCreateTask(taskData);
      }

      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la tâche *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Entrez le titre de la tâche..."
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez la tâche..."
              />
            </div>

            {/* Priorité et Statut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminée</option>
                </select>
              </div>
            </div>

            {/* Date d'échéance et heures estimées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dueDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.dueDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heures estimées
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 2.5"
                />
                {errors.estimatedHours && (
                  <p className="text-red-600 text-sm mt-1">{errors.estimatedHours}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {task ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  return (
    <PremiumLayout title="Gestion des Tâches Avancée">
      
      {/* Header avec statistiques étendues */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <StatCard title="Total" value={stats.total} icon={CheckSquare} color="blue" />
        <StatCard title="Terminées" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard title="En cours" value={stats.inProgress} icon={Clock} color="yellow" />
        <StatCard title="En attente" value={stats.pending} icon={Star} color="gray" />
        <StatCard title="Assignées" value={stats.assigned} icon={Users} color="purple" />
        <StatCard title="En retard" value={stats.overdue} icon={AlertTriangle} color="red" />
        <StatCard title="Collaboratives" value={stats.collaborative} icon={Users} color="indigo" />
        <StatCard title="Priorité haute" value={stats.highPriority} icon={Flag} color="orange" />
      </div>

      {/* Barre d'outils avancée */}
      <PremiumCard className="p-4 mb-6">
        
        {/* Ligne 1: Recherche et actions principales */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
          
          {/* Recherche avancée */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher tâches, membres, descriptions..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions principales */}
          <div className="flex items-center gap-2">
            {/* Toggle vue */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <PremiumButton
              onClick={() => setShowQuickCreate(!showQuickCreate)}
              variant={showQuickCreate ? "secondary" : "primary"}
              icon={Plus}
            >
              Création rapide
            </PremiumButton>
            
            <PremiumButton
              onClick={() => setShowTaskForm(true)}
              icon={Plus}
            >
              Nouvelle tâche
            </PremiumButton>

            {/* Actions en lot */}
            {selectedTasks.length > 0 && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
                <span className="text-sm text-gray-600">
                  {selectedTasks.length} sélectionnée{selectedTasks.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ligne 2: Filtres et tri */}
        <div className="flex flex-wrap gap-3 items-center">
          
          {/* Filtres */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="assigned">Assignées</option>
            <option value="completed">Terminées</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          <select
            value={filterAssignment}
            onChange={(e) => setFilterAssignment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes assignations</option>
            <option value="assigned">Assignées</option>
            <option value="unassigned">Non assignées</option>
            <option value="multiple">Collaboratives</option>
          </select>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dueDate">Date d'échéance</option>
            <option value="priority">Priorité</option>
            <option value="created">Date de création</option>
            <option value="updated">Dernière mise à jour</option>
            <option value="status">Statut</option>
            <option value="title">Titre</option>
          </select>

          {/* Actions rapides */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={selectAllTasks}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedTasks.length === filteredTasks.length ? 'Désélectionner tout' : 'Sélectionner tout'}
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Création rapide */}
        {showQuickCreate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Titre de la tâche..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
              />
              <button
                onClick={() => handleCreateTask()}
                disabled={!newTaskTitle.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Créer
              </button>
            </div>
          </motion.div>
        )}

        {/* Actions en lot */}
        {showBulkActions && selectedTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Actions pour {selectedTasks.length} tâche{selectedTasks.length > 1 ? 's' : ''} :
              </span>
              
              <button
                onClick={() => handleBulkStatusUpdate('completed')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Marquer terminées
              </button>
              
              <button
                onClick={() => handleBulkStatusUpdate('in_progress')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                En cours
              </button>
              
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Supprimer
              </button>
              
              <button
                onClick={() => {
                  setShowBulkActions(false);
                  setSelectedTasks([]);
                }}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </PremiumCard>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg">Chargement des tâches...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="w-16 h-16 text-gray-500 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-400 mb-3">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignment !== 'all' 
                ? 'Aucune tâche ne correspond aux filtres' 
                : 'Aucune tâche créée'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignment !== 'all'
                ? 'Essayez de modifier vos critères de recherche ou filtres'
                : 'Créez votre première tâche pour commencer à organiser votre travail'
              }
            </p>
            {(!searchTerm && filterStatus === 'all' && filterPriority === 'all' && filterAssignment === 'all') && (
              <PremiumButton
                onClick={() => setShowTaskForm(true)}
                icon={Plus}
              >
                Créer ma première tâche
              </PremiumButton>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "space-y-2"
          }>
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                isSelected={selectedTasks.includes(task.id)}
                onSelect={toggleTaskSelection}
              />
            ))}
          </div>
        )}
      </div>

      {/* ✅ MODALS AVANCÉES */}
      
      {/* Modal de formulaire de tâche */}
      <TaskFormModal
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSubmit={editingTask ? 
          (data) => handleUpdateTask(editingTask.id, data) : 
          handleCreateTask
        }
      />

      {/* Modal de soumission avancée */}
      {showSubmissionModal && selectedTask && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          onSubmit={(submissionData) => {
            handleUpdateTask(selectedTask.id, { 
              status: 'completed', 
              completedAt: serverTimestamp(),
              submissionData: submissionData
            });
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
        />
      )}

      {/* ✅ MODAL D'ASSIGNATION AVANCÉ */}
      {showAssignmentModal && selectedTask && (
        <AdvancedAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedTask(null);
          }}
          onAssignmentSuccess={handleTaskAssignment}
          task={selectedTask}
        />
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
