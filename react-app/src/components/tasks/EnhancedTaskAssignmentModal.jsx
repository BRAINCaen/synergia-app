// ==========================================
// 📁 react-app/src/components/tasks/EnhancedTaskAssignmentModal.jsx
// MODAL D'ASSIGNATION CORRIGÉ - BUG UPDATEDOC RÉSOLU
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Check, 
  User, 
  Trophy,
  Percent,
  UserPlus,
  AlertTriangle,
  Info,
  Loader,
  Search,
  Settings,
  ChevronDown,
  ChevronUp,
  Send,
  Target,
  Zap,
  Star,
  Award,
  Brain,
  Code,
  Palette,
  BarChart3,
  Megaphone,
  Building,
  Shield,
  HeartHandshake,
  Briefcase,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// ✅ DOMAINES DE COMPÉTENCES COMPLETS
const SKILL_DOMAINS = {
  TECHNICAL: {
    id: 'technical',
    name: 'Technique & Développement',
    icon: Code,
    color: 'bg-blue-500',
    description: 'Développement, programmation, systèmes',
    skills: ['React', 'JavaScript', 'Python', 'Database', 'DevOps', 'API', 'Security'],
    xpMultiplier: 1.2
  },
  DESIGN: {
    id: 'design',
    name: 'Design & Créativité',
    icon: Palette,
    color: 'bg-purple-500',
    description: 'UI/UX, graphisme, créativité',
    skills: ['UI/UX', 'Photoshop', 'Figma', 'Branding', 'Animation', 'Illustration'],
    xpMultiplier: 1.1
  },
  ANALYTICS: {
    id: 'analytics',
    name: 'Analyse & Data',
    icon: BarChart3,
    color: 'bg-green-500',
    description: 'Analyse de données, métriques, reporting',
    skills: ['Analytics', 'SQL', 'Excel', 'PowerBI', 'Tableau', 'Statistics'],
    xpMultiplier: 1.15
  },
  MARKETING: {
    id: 'marketing',
    name: 'Marketing & Communication',
    icon: Megaphone,
    color: 'bg-orange-500',
    description: 'Marketing digital, communication, réseaux sociaux',
    skills: ['SEO', 'Social Media', 'Content', 'Ads', 'Email Marketing', 'Analytics'],
    xpMultiplier: 1.1
  },
  BUSINESS: {
    id: 'business',
    name: 'Business & Management',
    icon: Building,
    color: 'bg-indigo-500',
    description: 'Gestion, stratégie, business development',
    skills: ['Strategy', 'Management', 'Finance', 'Sales', 'Operations', 'Leadership'],
    xpMultiplier: 1.25
  },
  SUPPORT: {
    id: 'support',
    name: 'Support & Service Client',
    icon: HeartHandshake,
    color: 'bg-teal-500',
    description: 'Support client, service, relations',
    skills: ['Customer Service', 'Ticketing', 'Phone Support', 'Live Chat', 'Training'],
    xpMultiplier: 1.0
  }
};

// ✅ RÔLES SYNERGIA COMPLETS
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Maintenance technique et réparations',
    baseXP: 30
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires',
    baseXP: 25
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation',
    baseXP: 35
  },
  content: {
    id: 'content',
    name: 'Création de Contenu',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création visuelle et communication',
    baseXP: 30
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation des équipes',
    baseXP: 40
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement partenariats',
    baseXP: 45
  },
  communication: {
    id: 'communication',
    name: 'Communication',
    icon: '📢',
    color: 'bg-cyan-500',
    description: 'Communication digitale',
    baseXP: 30
  }
};

// ✅ NIVEAUX DE DIFFICULTÉ
const DIFFICULTY_LEVELS = {
  simple: { 
    name: 'Simple', 
    multiplier: 0.8, 
    color: 'text-green-600 bg-green-100',
    description: 'Tâche basique, rapide à réaliser' 
  },
  normal: { 
    name: 'Normal', 
    multiplier: 1.0, 
    color: 'text-blue-600 bg-blue-100',
    description: 'Tâche standard, niveau intermédiaire' 
  },
  complex: { 
    name: 'Complexe', 
    multiplier: 1.5, 
    color: 'text-orange-600 bg-orange-100',
    description: 'Tâche complexe, expertise requise' 
  },
  expert: { 
    name: 'Expert', 
    multiplier: 2.0, 
    color: 'text-red-600 bg-red-100',
    description: 'Tâche très complexe, haut niveau requis' 
  }
};

/**
 * 🛠️ FONCTION UTILITAIRE - NETTOYER LES VALEURS UNDEFINED
 */
const cleanObjectForFirebase = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
        const cleanedNested = cleanObjectForFirebase(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

/**
 * 🎯 MODAL D'ASSIGNATION AVANCÉ COMPLET
 */
const EnhancedTaskAssignmentModal = ({ 
  isOpen, 
  onClose, 
  task, 
  onAssignmentSuccess 
}) => {
  const { user } = useAuthStore();
  
  // États principaux
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [contributions, setContributions] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // États de configuration avancée
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [taskDifficulty, setTaskDifficulty] = useState('normal');
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [xpCalculation, setXpCalculation] = useState({});

  // États de filtrage
  const [searchMember, setSearchMember] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterMinLevel, setFilterMinLevel] = useState('');

  // ✅ CHARGEMENT DES MEMBRES
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
            avatar: userData.profile?.avatar || userData.photoURL || null,
            department: userData.profile?.department || 'Non défini',
            level: userData.profile?.level || 1,
            totalXP: userData.profile?.totalXP || 0,
            isActive: userData.profile?.isActive !== false,
            skills: userData.profile?.skills || [],
            completedTasks: userData.stats?.completedTasks || 0,
            successRate: userData.stats?.successRate || 100,
            lastActivity: userData.profile?.lastActivity || new Date().toISOString()
          });
        }
      });
      
      // Trier par niveau et activité
      members.sort((a, b) => {
        if (a.isActive !== b.isActive) return b.isActive - a.isActive;
        return b.level - a.level;
      });
      
      setAvailableMembers(members);
      console.log('✅ Membres chargés:', members.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement membres:', error);
      setError('Impossible de charger les membres');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CALCUL XP POUR UN MEMBRE
  const calculateXPForMember = (member, contributionPercent) => {
    const baseXP = 20;
    const difficultyMultiplier = DIFFICULTY_LEVELS[taskDifficulty]?.multiplier || 1;
    const domainMultiplier = selectedDomain ? SKILL_DOMAINS[selectedDomain]?.xpMultiplier || 1 : 1;
    const roleBonus = selectedRole ? SYNERGIA_ROLES[selectedRole]?.baseXP || 0 : 0;
    const timeMultiplier = Math.max(0.5, Math.min(3, estimatedHours / 2));
    const contributionMultiplier = contributionPercent / 100;
    
    const calculatedXP = Math.round(
      (baseXP + roleBonus) * 
      difficultyMultiplier * 
      domainMultiplier * 
      timeMultiplier * 
      contributionMultiplier
    );

    return {
      baseXP,
      roleBonus,
      difficultyMultiplier,
      domainMultiplier,
      timeMultiplier,
      contributionMultiplier,
      totalXP: Math.max(5, calculatedXP),
      factors: {
        difficulty: taskDifficulty,
        domain: selectedDomain,
        role: selectedRole,
        hours: estimatedHours,
        contribution: contributionPercent
      }
    };
  };

  // ✅ SÉLECTION MEMBRE
  const handleMemberSelect = (member) => {
    const isSelected = selectedMembers.find(m => m.id === member.id);
    
    if (isSelected) {
      // Retirer
      setSelectedMembers(prev => prev.filter(m => m.id !== member.id));
      setContributions(prev => {
        const newContrib = { ...prev };
        delete newContrib[member.id];
        return newContrib;
      });
    } else {
      // Ajouter
      setSelectedMembers(prev => [...prev, member]);
      
      // Calculer contribution équitable
      const newMemberCount = selectedMembers.length + 1;
      const equalContribution = Math.floor(100 / newMemberCount);
      
      setContributions(prev => {
        const newContrib = { ...prev };
        
        // Répartir équitablement
        [...selectedMembers, member].forEach(m => {
          newContrib[m.id] = equalContribution;
        });
        
        // Ajuster pour arriver à 100%
        const total = Object.values(newContrib).reduce((sum, val) => sum + val, 0);
        const diff = 100 - total;
        if (diff !== 0) {
          newContrib[member.id] += diff;
        }
        
        return newContrib;
      });
    }
  };

  // ✅ METTRE À JOUR CONTRIBUTION
  const updateContribution = (memberId, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setContributions(prev => ({
      ...prev,
      [memberId]: numValue
    }));
  };

  // ✅ CALCUL XP EN TEMPS RÉEL
  useEffect(() => {
    if (selectedMembers.length > 0) {
      const calculations = {};
      selectedMembers.forEach(member => {
        const contribution = contributions[member.id] || 0;
        calculations[member.id] = calculateXPForMember(member, contribution);
      });
      setXpCalculation(calculations);
    }
  }, [selectedMembers, contributions, taskDifficulty, selectedDomain, selectedRole, estimatedHours]);

  // ✅ CHARGER MEMBRES AU MONTAGE
  useEffect(() => {
    if (isOpen) {
      loadAvailableMembers();
    }
  }, [isOpen]);

  // ✅ SOUMISSION ASSIGNATION AVANCÉE (CORRECTION BUG)
  const submitAdvancedAssignment = async () => {
    try {
      setSubmitting(true);
      setError('');

      // Validations
      if (selectedMembers.length === 0) {
        throw new Error('Sélectionnez au moins un membre');
      }

      const totalContribution = Object.values(contributions).reduce((sum, val) => sum + val, 0);
      if (selectedMembers.length > 1 && Math.abs(totalContribution - 100) > 5) {
        throw new Error('Les contributions doivent totaliser 100%');
      }

      // ✅ PRÉPARER DONNÉES ASSIGNATION
      const assignmentData = selectedMembers.map(member => {
        const contribution = selectedMembers.length > 1 ? (contributions[member.id] || 0) : 100;
        const xpCalc = calculateXPForMember(member, contribution);
        
        // ✅ NETTOYER LES DONNÉES POUR ÉVITER LES undefined
        return cleanObjectForFirebase({
          userId: member.id,
          userName: member.name,
          userEmail: member.email,
          userAvatar: member.avatar,
          userLevel: member.level,
          userDepartment: member.department,
          userSkills: member.skills,
          assignedAt: new Date().toISOString(),
          assignedBy: user.uid,
          assignedByName: user.displayName || user.email,
          status: 'assigned',
          contributionPercentage: contribution,
          
          // Calcul XP
          xpCalculation: xpCalc,
          expectedXP: xpCalc.totalXP,
          xpFactors: xpCalc.factors,
          
          // Domaine et rôle
          assignedDomain: selectedDomain || null,
          domainName: selectedDomain ? SKILL_DOMAINS[selectedDomain]?.name : null,
          assignedRole: selectedRole || null,
          roleName: selectedRole ? SYNERGIA_ROLES[selectedRole]?.name : null,
          
          // Métadonnées
          taskDifficulty: taskDifficulty,
          estimatedHours: estimatedHours,
          
          // États de suivi
          hasSubmitted: false,
          submissionDate: null,
          submissionData: null,
          validationStatus: 'pending',
          actualHours: null,
          notes: ''
        });
      });

      console.log('🎯 Données assignation préparées:', assignmentData);

      // ✅ TRANSACTION AVEC DONNÉES NETTOYÉES
      const batch = writeBatch(db);

      // ✅ METTRE À JOUR LA TÂCHE (DONNÉES NETTOYÉES)
      const taskRef = doc(db, 'tasks', task.id);
      const taskUpdateData = cleanObjectForFirebase({
        // Assignation de base
        assignedTo: selectedMembers.map(m => m.id),
        assignedMembers: selectedMembers.map(m => cleanObjectForFirebase({
          id: m.id,
          name: m.name,
          email: m.email,
          avatar: m.avatar,
          level: m.level,
          department: m.department,
          skills: m.skills
        })),
        
        // Données enrichies
        assignments: assignmentData,
        
        // Configuration
        difficulty: taskDifficulty,
        estimatedHours: estimatedHours,
        skillDomain: selectedDomain || null,
        synergiaRole: selectedRole || null,
        
        // Calculs XP
        totalExpectedXP: assignmentData.reduce((sum, a) => sum + a.expectedXP, 0),
        xpDistribution: assignmentData.reduce((acc, a) => {
          acc[a.userId] = a.expectedXP;
          return acc;
        }, {}),
        
        // Métadonnées
        isMultipleAssignment: selectedMembers.length > 1,
        assignmentCount: selectedMembers.length,
        assignmentType: selectedMembers.length > 1 ? 'collaborative' : 'individual',
        
        // Statut
        status: 'assigned',
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      batch.update(taskRef, taskUpdateData);

      // ✅ CRÉER NOTIFICATIONS POUR CHAQUE MEMBRE
      assignmentData.forEach(assignment => {
        const notificationRef = doc(collection(db, 'notifications'));
        const notificationData = cleanObjectForFirebase({
          userId: assignment.userId,
          type: 'task_assigned',
          title: 'Nouvelle tâche assignée',
          message: `Vous avez été assigné à la tâche "${task.title}"`,
          taskId: task.id,
          taskTitle: task.title,
          assignedBy: user.uid,
          assignedByName: user.displayName || user.email,
          
          expectedXP: assignment.expectedXP,
          contribution: assignment.contributionPercentage,
          difficulty: taskDifficulty,
          estimatedHours: estimatedHours,
          
          skillDomain: selectedDomain || null,
          domainName: selectedDomain ? SKILL_DOMAINS[selectedDomain]?.name : null,
          synergiaRole: selectedRole || null,
          roleName: selectedRole ? SYNERGIA_ROLES[selectedRole]?.name : null,
          
          isMultiple: selectedMembers.length > 1,
          priority: task.priority || 'medium',
          
          createdAt: serverTimestamp(),
          read: false,
          actionRequired: true
        });
        
        batch.set(notificationRef, notificationData);
      });
      
      await batch.commit();

      console.log('✅ Assignation avancée réussie avec calcul XP complet');
      
      // ✅ NOTIFIER LE PARENT
      if (onAssignmentSuccess) {
        onAssignmentSuccess({
          success: true,
          assignedMembers: selectedMembers,
          taskId: task.id,
          assignmentCount: selectedMembers.length,
          assignmentType: selectedMembers.length > 1 ? 'collaborative' : 'individual',
          contributions: selectedMembers.length > 1 ? contributions : null,
          
          // Données XP
          xpDistribution: assignmentData.reduce((acc, a) => {
            acc[a.userId] = {
              expectedXP: a.expectedXP,
              factors: a.xpFactors
            };
            return acc;
          }, {}),
          totalExpectedXP: assignmentData.reduce((sum, a) => sum + a.expectedXP, 0),
          
          // Configuration
          difficulty: taskDifficulty,
          domain: selectedDomain,
          role: selectedRole,
          estimatedHours: estimatedHours,
          
          // Métriques
          metrics: {
            totalLevel: selectedMembers.reduce((sum, m) => sum + m.level, 0),
            averageLevel: Math.round(selectedMembers.reduce((sum, m) => sum + m.level, 0) / selectedMembers.length),
            departments: [...new Set(selectedMembers.map(m => m.department))],
            skills: selectedDomain ? SKILL_DOMAINS[selectedDomain]?.skills : []
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
    setSelectedDomain('');
    setSelectedRole('');
    setShowAdvanced(false);
    onClose();
  };

  // Filtrer les membres
  const filteredMembers = availableMembers.filter(member => {
    if (searchMember && !member.name.toLowerCase().includes(searchMember.toLowerCase()) && 
        !member.email.toLowerCase().includes(searchMember.toLowerCase())) {
      return false;
    }
    if (filterDepartment && member.department !== filterDepartment) {
      return false;
    }
    if (filterMinLevel && member.level < parseInt(filterMinLevel)) {
      return false;
    }
    return true;
  });

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
          className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-7 h-7 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Assignation Avancée avec Calcul XP
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tâche: <span className="font-medium">{task?.title}</span>
                      {selectedMembers.length > 0 && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {Object.values(xpCalculation).reduce((sum, calc) => sum + calc.totalXP, 0)} XP total
                        </span>
                      )}
                    </p>
                  </div>
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

          {/* Contenu */}
          <div className="flex h-[calc(95vh-180px)]">
            {/* Panel de gauche - Configuration */}
            <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Configuration de base */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuration
                  </h3>
                  
                  {/* Difficulté */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulté
                    </label>
                    <select
                      value={taskDifficulty}
                      onChange={(e) => setTaskDifficulty(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(DIFFICULTY_LEVELS).map(([key, diff]) => (
                        <option key={key} value={key}>
                          {diff.name} (x{diff.multiplier})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Heures estimées */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heures estimées
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="40"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Domaine de compétence */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domaine de compétence
                    </label>
                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un domaine</option>
                      {Object.entries(SKILL_DOMAINS).map(([key, domain]) => (
                        <option key={key} value={key}>
                          {domain.name} (x{domain.xpMultiplier})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rôle Synergia */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle Synergia
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un rôle</option>
                      {Object.entries(SYNERGIA_ROLES).map(([key, role]) => (
                        <option key={key} value={key}>
                          {role.name} (+{role.baseXP} XP)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Membres sélectionnés */}
                {selectedMembers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Membres sélectionnés ({selectedMembers.length})
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedMembers.map(member => (
                        <div key={member.id} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{member.name}</span>
                            <button
                              onClick={() => handleMemberSelect(member)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {selectedMembers.length > 1 && (
                            <div className="mb-2">
                              <label className="block text-xs text-gray-600 mb-1">
                                Contribution (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={contributions[member.id] || 0}
                                onChange={(e) => updateContribution(member.id, e.target.value)}
                                className="w-full p-1 text-sm border border-gray-300 rounded"
                              />
                            </div>
                          )}
                          
                          {xpCalculation[member.id] && (
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="font-medium text-green-600">
                                XP attendu: {xpCalculation[member.id].totalXP}
                              </div>
                              <div>Base: {xpCalculation[member.id].baseXP}</div>
                              <div>Difficulté: x{xpCalculation[member.id].difficultyMultiplier}</div>
                              <div>Temps: x{xpCalculation[member.id].timeMultiplier.toFixed(1)}</div>
                              {selectedMembers.length > 1 && (
                                <div>Contribution: x{xpCalculation[member.id].contributionMultiplier.toFixed(2)}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Total XP */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-700">
                          {Object.values(xpCalculation).reduce((sum, calc) => sum + calc.totalXP, 0)} XP
                        </div>
                        <div className="text-sm text-gray-600">XP total attendu</div>
                      </div>
                    </div>
                    
                    {/* Validation contributions */}
                    {selectedMembers.length > 1 && (
                      <div className="mt-2">
                        <div className="text-xs text-center">
                          Total: {Object.values(contributions).reduce((sum, val) => sum + val, 0)}%
                          {Math.abs(Object.values(contributions).reduce((sum, val) => sum + val, 0) - 100) > 5 && (
                            <span className="text-red-500 ml-1">⚠️</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Panel de droite - Sélection membres */}
            <div className="w-2/3 p-6 flex flex-col">
              {/* Recherche et filtres */}
              <div className="mb-4">
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un membre..."
                      value={searchMember}
                      onChange={(e) => setSearchMember(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les départements</option>
                    {[...new Set(availableMembers.map(m => m.department))].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Liste des membres */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2">Chargement des membres...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredMembers.map(member => {
                      const isSelected = selectedMembers.find(m => m.id === member.id);
                      
                      return (
                        <div
                          key={member.id}
                          onClick={() => handleMemberSelect(member)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {member.email}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  <Star className="w-3 h-3" />
                                  Niveau {member.level}
                                </span>
                                
                                {member.totalXP > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    <Trophy className="w-3 h-3" />
                                    {member.totalXP} XP
                                  </span>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500 mt-1">
                                {member.department}
                              </div>
                              
                              {!member.isActive && (
                                <div className="text-xs text-orange-500 mt-1">
                                  ⚠️ Inactif
                                </div>
                              )}
                            </div>
                            
                            {isSelected && (
                              <div className="text-blue-500">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedMembers.length > 0 ? (
                  <span>
                    {selectedMembers.length} membre{selectedMembers.length > 1 ? 's' : ''} sélectionné{selectedMembers.length > 1 ? 's' : ''}
                    {Object.values(xpCalculation).length > 0 && (
                      <span className="ml-2 font-medium text-green-600">
                        • {Object.values(xpCalculation).reduce((sum, calc) => sum + calc.totalXP, 0)} XP total
                      </span>
                    )}
                  </span>
                ) : (
                  'Sélectionnez des membres pour commencer'
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={submitAdvancedAssignment}
                  disabled={selectedMembers.length === 0 || submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Assignation...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Assigner la tâche
                    </>
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

export default EnhancedTaskAssignmentModal;
