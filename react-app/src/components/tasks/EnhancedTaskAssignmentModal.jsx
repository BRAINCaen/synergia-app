// ==========================================
// 📁 react-app/src/components/tasks/EnhancedTaskAssignmentModal.jsx
// MODAL D'ASSIGNATION COMPLET AVEC TOUTES LES FONCTIONNALITÉS RESTAURÉES
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

// ✅ DOMAINES DE COMPÉTENCES COMPLETS RESTAURÉS
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
    skills: ['SEO', 'Content', 'Social Media', 'Email Marketing', 'PPC', 'Copywriting'],
    xpMultiplier: 1.0
  },
  MANAGEMENT: {
    id: 'management',
    name: 'Management & Leadership',
    icon: Building,
    color: 'bg-indigo-500',
    description: 'Gestion d\'équipe, leadership, stratégie',
    skills: ['Leadership', 'Strategy', 'Planning', 'Coaching', 'Decision Making'],
    xpMultiplier: 1.3
  },
  QUALITY: {
    id: 'quality',
    name: 'Qualité & Conformité',
    icon: Shield,
    color: 'bg-red-500',
    description: 'Contrôle qualité, tests, conformité',
    skills: ['Testing', 'QA', 'Compliance', 'Audit', 'Documentation'],
    xpMultiplier: 1.1
  },
  CUSTOMER: {
    id: 'customer',
    name: 'Relation Client',
    icon: HeartHandshake,
    color: 'bg-pink-500',
    description: 'Service client, support, satisfaction',
    skills: ['Customer Service', 'Support', 'CRM', 'Communication', 'Problem Solving'],
    xpMultiplier: 1.05
  },
  BUSINESS: {
    id: 'business',
    name: 'Business & Ventes',
    icon: Briefcase,
    color: 'bg-yellow-500',
    description: 'Développement commercial, ventes, partenariats',
    skills: ['Sales', 'Business Dev', 'Partnerships', 'Negotiation', 'Market Analysis'],
    xpMultiplier: 1.25
  }
};

// ✅ RÔLES SYNERGIA COMPLETS RESTAURÉS
const SYNERGIA_ROLES = {
  MAINTENANCE: {
    id: 'MAINTENANCE',
    name: 'Maintenance & Propreté',
    icon: '🔧',
    color: 'bg-gray-500',
    description: 'Entretien des locaux et équipements',
    xpBase: 15,
    skills: ['Maintenance', 'Cleaning', 'Equipment', 'Safety']
  },
  REPUTATION: {
    id: 'REPUTATION',
    name: 'Image & Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Gestion de l\'image de marque',
    xpBase: 25,
    skills: ['Branding', 'PR', 'Reputation Management', 'Social Media']
  },
  STOCK: {
    id: 'STOCK',
    name: 'Gestion des Stocks',
    icon: '📦',
    color: 'bg-orange-500',
    description: 'Approvisionnement et inventaire',
    xpBase: 20,
    skills: ['Inventory', 'Supply Chain', 'Logistics', 'Planning']
  },
  ORGANIZATION: {
    id: 'ORGANIZATION',
    name: 'Organisation & Planning',
    icon: '📋',
    color: 'bg-blue-500',
    description: 'Planification et coordination',
    xpBase: 30,
    skills: ['Planning', 'Organization', 'Coordination', 'Process']
  },
  CONTENT: {
    id: 'CONTENT',
    name: 'Création de Contenu',
    icon: '✍️',
    color: 'bg-purple-500',
    description: 'Rédaction et création de contenu',
    xpBase: 25,
    skills: ['Writing', 'Content Creation', 'Storytelling', 'SEO']
  },
  MENTORING: {
    id: 'MENTORING',
    name: 'Formation & Mentorat',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement',
    xpBase: 35,
    skills: ['Teaching', 'Mentoring', 'Training', 'Coaching']
  },
  PARTNERSHIPS: {
    id: 'PARTNERSHIPS',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement des partenariats',
    xpBase: 30,
    skills: ['Partnerships', 'Networking', 'Business Dev', 'Relations']
  },
  COMMUNICATION: {
    id: 'COMMUNICATION',
    name: 'Communication & Réseaux Sociaux',
    icon: '📱',
    color: 'bg-cyan-500',
    description: 'Communication digitale',
    xpBase: 20,
    skills: ['Social Media', 'Communication', 'Community', 'Digital']
  },
  B2B: {
    id: 'B2B',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Relations professionnelles',
    xpBase: 35,
    skills: ['B2B Sales', 'Quotes', 'Professional Relations', 'Negotiation']
  }
};

// ✅ NIVEAUX DE DIFFICULTÉ AVEC CALCUL XP
const DIFFICULTY_LEVELS = {
  easy: { 
    name: 'Facile', 
    multiplier: 0.8, 
    color: 'text-green-600 bg-green-100',
    description: 'Tâche simple, peu de temps requis' 
  },
  normal: { 
    name: 'Normal', 
    multiplier: 1.0, 
    color: 'text-blue-600 bg-blue-100',
    description: 'Tâche standard, difficulté moyenne' 
  },
  hard: { 
    name: 'Difficile', 
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

  // ✅ CHARGEMENT DES MEMBRES AVEC DONNÉES ENRICHIES
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
            synergiaRoles: userData.synergiaRoles || [],
            tasksCompleted: userData.gamification?.tasksCompleted || 0,
            averageRating: userData.profile?.averageRating || 0,
            specialties: userData.profile?.specialties || [],
            availability: userData.profile?.availability || 'available',
            lastActivity: userData.gamification?.lastActivityDate
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
      setSelectedDomain('');
      setSelectedRole('');
      setTaskDifficulty(task?.difficulty || 'normal');
      setEstimatedHours(task?.estimatedHours || 1);
    }
  }, [isOpen, task]);

  // ✅ CALCUL XP AUTOMATIQUE AVEC TOUS LES FACTEURS
  const calculateXPForMember = (member, contributionPercentage = 100) => {
    let baseXP = 20; // XP de base

    // Facteur difficulté
    const difficultyMultiplier = DIFFICULTY_LEVELS[taskDifficulty]?.multiplier || 1.0;
    
    // Facteur domaine de compétence
    const domainMultiplier = selectedDomain ? 
      (SKILL_DOMAINS[selectedDomain]?.xpMultiplier || 1.0) : 1.0;
    
    // Facteur rôle Synergia
    const roleMultiplier = selectedRole ? 
      (SYNERGIA_ROLES[selectedRole]?.xpBase / 20 || 1.0) : 1.0;
    
    // Facteur temps estimé
    const timeMultiplier = Math.max(0.5, Math.min(3.0, estimatedHours / 2));
    
    // Facteur niveau du membre (bonus pour niveau élevé)
    const levelBonus = 1 + (member.level * 0.02);
    
    // Calcul final
    const totalXP = Math.round(
      baseXP * 
      difficultyMultiplier * 
      domainMultiplier * 
      roleMultiplier * 
      timeMultiplier * 
      levelBonus * 
      (contributionPercentage / 100)
    );
    
    return {
      baseXP,
      totalXP,
      factors: {
        difficulty: difficultyMultiplier,
        domain: domainMultiplier,
        role: roleMultiplier,
        time: timeMultiplier,
        level: levelBonus,
        contribution: contributionPercentage / 100
      }
    };
  };

  // Recalculer XP quand les paramètres changent
  useEffect(() => {
    if (selectedMembers.length > 0) {
      const newXpCalculation = {};
      selectedMembers.forEach(member => {
        const contribution = contributions[member.id] || (100 / selectedMembers.length);
        newXpCalculation[member.id] = calculateXPForMember(member, contribution);
      });
      setXpCalculation(newXpCalculation);
    }
  }, [selectedMembers, contributions, taskDifficulty, selectedDomain, selectedRole, estimatedHours]);

  // Filtrer les membres
  const filteredMembers = availableMembers.filter(member => {
    // Recherche textuelle
    if (searchMember) {
      const term = searchMember.toLowerCase();
      const matchesSearch = 
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.department.toLowerCase().includes(term) ||
        member.skills.some(skill => skill.toLowerCase().includes(term));
      if (!matchesSearch) return false;
    }

    // Filtre département
    if (filterDepartment && member.department !== filterDepartment) {
      return false;
    }

    // Filtre niveau minimum
    if (filterMinLevel && member.level < parseInt(filterMinLevel)) {
      return false;
    }

    // Filtre par domaine sélectionné (compétences compatibles)
    if (selectedDomain) {
      const domainSkills = SKILL_DOMAINS[selectedDomain]?.skills || [];
      const hasCompatibleSkill = member.skills.some(skill => 
        domainSkills.some(domainSkill => 
          skill.toLowerCase().includes(domainSkill.toLowerCase()) ||
          domainSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasCompatibleSkill) return false;
    }

    return true;
  });

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

  // Distribution basée sur le niveau
  const distributeByLevel = () => {
    if (selectedMembers.length === 0) return;
    
    const totalLevels = selectedMembers.reduce((sum, member) => sum + member.level, 0);
    const newContributions = {};
    
    selectedMembers.forEach(member => {
      const percentage = Math.round((member.level / totalLevels) * 100);
      newContributions[member.id] = percentage;
    });
    
    // Ajuster pour que le total soit exactement 100%
    const currentTotal = Object.values(newContributions).reduce((sum, val) => sum + val, 0);
    if (currentTotal !== 100) {
      const highest = selectedMembers.reduce((prev, current) => 
        (prev.level > current.level) ? prev : current
      );
      newContributions[highest.id] += (100 - currentTotal);
    }
    
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

  // ✅ ASSIGNATION COMPLÈTE AVEC CALCUL XP ET NOTIFICATIONS
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
      // ✅ PRÉPARER LES DONNÉES D'ASSIGNATION COMPLÈTES
      const assignmentData = selectedMembers.map(member => {
        const contribution = selectedMembers.length > 1 ? 
          (contributions[member.id] || 0) : 100;
        const xpCalc = calculateXPForMember(member, contribution);
        
        return {
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
          
          // ✅ CALCUL XP COMPLET
          xpCalculation: xpCalc,
          expectedXP: xpCalc.totalXP,
          xpFactors: xpCalc.factors,
          
          // ✅ DONNÉES DE DOMAINE ET RÔLE
          assignedDomain: selectedDomain,
          domainName: selectedDomain ? SKILL_DOMAINS[selectedDomain]?.name : null,
          assignedRole: selectedRole,
          roleName: selectedRole ? SYNERGIA_ROLES[selectedRole]?.name : null,
          
          // ✅ MÉTADONNÉES DE TÂCHE
          taskDifficulty: taskDifficulty,
          estimatedHours: estimatedHours,
          
          // États de suivi
          hasSubmitted: false,
          submissionDate: null,
          submissionData: null,
          validationStatus: 'pending',
          actualHours: null,
          notes: ''
        };
      });

      // ✅ METTRE À JOUR LA TÂCHE AVEC TOUTES LES DONNÉES
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
          department: m.department,
          skills: m.skills
        })),
        
        // ✅ DONNÉES D'ASSIGNATION ENRICHIES
        assignments: assignmentData,
        
        // ✅ CONFIGURATION DE LA TÂCHE
        difficulty: taskDifficulty,
        estimatedHours: estimatedHours,
        skillDomain: selectedDomain,
        synergiaRole: selectedRole,
        
        // ✅ CALCULS XP TOTAUX
        totalExpectedXP: assignmentData.reduce((sum, a) => sum + a.expectedXP, 0),
        xpDistribution: assignmentData.reduce((acc, a) => {
          acc[a.userId] = a.expectedXP;
          return acc;
        }, {}),
        
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
        
        // ✅ MÉTRIQUES AVANCÉES
        assignmentMetrics: {
          assignedMembersCount: selectedMembers.length,
          totalLevelAssigned: selectedMembers.reduce((sum, m) => sum + m.level, 0),
          averageLevelAssigned: Math.round(selectedMembers.reduce((sum, m) => sum + m.level, 0) / selectedMembers.length),
          departmentsInvolved: [...new Set(selectedMembers.map(m => m.department))],
          skillsRequired: selectedDomain ? SKILL_DOMAINS[selectedDomain]?.skills : [],
          assignmentComplexity: selectedMembers.length > 3 ? 'high' : selectedMembers.length > 1 ? 'medium' : 'low',
          expectedTotalXP: assignmentData.reduce((sum, a) => sum + a.expectedXP, 0)
        }
      });

      // ✅ CRÉER LES NOTIFICATIONS ENRICHIES
      const batch = writeBatch(db);
      
      selectedMembers.forEach(member => {
        const memberAssignment = assignmentData.find(a => a.userId === member.id);
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
          
          // ✅ DONNÉES XP ET RÉCOMPENSES
          expectedXP: memberAssignment.expectedXP,
          contributionPercentage: memberAssignment.contributionPercentage,
          difficulty: taskDifficulty,
          skillDomain: selectedDomain,
          domainName: selectedDomain ? SKILL_DOMAINS[selectedDomain]?.name : null,
          synergiaRole: selectedRole,
          roleName: selectedRole ? SYNERGIA_ROLES[selectedRole]?.name : null,
          
          isMultiple: selectedMembers.length > 1,
          priority: task.priority || 'medium',
          estimatedHours: estimatedHours,
          
          createdAt: serverTimestamp(),
          read: false,
          actionRequired: true
        });
      });
      
      await batch.commit();

      console.log('✅ Assignation avancée réussie avec calcul XP complet');
      
      // ✅ NOTIFIER LE PARENT AVEC DONNÉES COMPLÈTES
      if (onAssignmentSuccess) {
        onAssignmentSuccess({
          success: true,
          assignedMembers: selectedMembers,
          taskId: task.id,
          assignmentCount: selectedMembers.length,
          assignmentType: selectedMembers.length > 1 ? 'collaborative' : 'individual',
          contributions: selectedMembers.length > 1 ? contributions : null,
          
          // ✅ DONNÉES XP CALCULÉES
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
    setContributions([]);
    setStep(1);
    setError('');
    setSearchMember('');
    setSelectedDomain('');
    setSelectedRole('');
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
          className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
        >
          {/* Header Ultra-Avancé */}
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
                
                {/* Indicateur d'étapes */}
                <div className="flex items-center gap-2 ml-6">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </span>
                  <span className="text-sm text-gray-600">Configuration</span>
                  
                  <div className="w-8 h-px bg-gray-300"></div>
                  
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </span>
                  <span className="text-sm text-gray-600">Répartition XP</span>
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
          <div className="overflow-y-auto max-h-[75vh]">
            
            {/* Affichage des erreurs */}
            {error && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Erreur</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {/* Étape 1: Configuration et Sélection */}
            {step === 1 && (
              <div className="p-6 space-y-6">
                
                {/* ✅ SECTION CONFIGURATION DE LA TÂCHE */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuration de la Tâche
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Difficulté */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulté
                      </label>
                      <select
                        value={taskDifficulty}
                        onChange={(e) => setTaskDifficulty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(DIFFICULTY_LEVELS).map(([key, diff]) => (
                          <option key={key} value={key}>{diff.name} (x{diff.multiplier})</option>
                        ))}
                      </select>
                    </div>

                    {/* Domaine de compétence */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domaine de Compétence
                      </label>
                      <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un domaine</option>
                        {Object.entries(SKILL_DOMAINS).map(([key, domain]) => (
                          <option key={key} value={key}>{domain.name} (x{domain.xpMultiplier})</option>
                        ))}
                      </select>
                    </div>

                    {/* Rôle Synergia */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle Synergia
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un rôle</option>
                        {Object.entries(SYNERGIA_ROLES).map(([key, role]) => (
                          <option key={key} value={key}>{role.name} ({role.xpBase} XP base)</option>
                        ))}
                      </select>
                    </div>

                    {/* Heures estimées */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heures Estimées
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        max="40"
                        step="0.5"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Aperçu des facteurs XP */}
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Aperçu du Calcul XP</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">Base</div>
                        <div className="text-gray-600">20 XP</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">Difficulté</div>
                        <div className="text-gray-600">x{DIFFICULTY_LEVELS[taskDifficulty]?.multiplier}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">Domaine</div>
                        <div className="text-gray-600">x{selectedDomain ? SKILL_DOMAINS[selectedDomain]?.xpMultiplier : 1.0}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">Rôle</div>
                        <div className="text-gray-600">x{selectedRole ? (SYNERGIA_ROLES[selectedRole]?.xpBase / 20).toFixed(1) : 1.0}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">Temps</div>
                        <div className="text-gray-600">x{Math.max(0.5, Math.min(3.0, estimatedHours / 2)).toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre de recherche et filtres */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchMember}
                        onChange={(e) => setSearchMember(e.target.value)}
                        placeholder="Rechercher par nom, email, compétences..."
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
                        <select 
                          value={filterDepartment}
                          onChange={(e) => setFilterDepartment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Tous les départements</option>
                          <option value="tech">Tech</option>
                          <option value="design">Design</option>
                          <option value="marketing">Marketing</option>
                          <option value="sales">Ventes</option>
                          <option value="general">Général</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Niveau minimum
                        </label>
                        <select 
                          value={filterMinLevel}
                          onChange={(e) => setFilterMinLevel(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Tous niveaux</option>
                          <option value="1">Niveau 1+</option>
                          <option value="5">Niveau 5+</option>
                          <option value="10">Niveau 10+</option>
                          <option value="15">Niveau 15+</option>
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

                {/* Membres sélectionnés avec aperçu XP */}
                {selectedMembers.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Membres sélectionnés ({selectedMembers.length}) - {Object.values(xpCalculation).reduce((sum, calc) => sum + calc.totalXP, 0)} XP total
                    </h3>
                    <div className="space-y-2">
                      {selectedMembers.map(member => {
                        const xpCalc = xpCalculation[member.id];
                        return (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-blue-900">{member.name}</div>
                                <div className="text-xs text-blue-700">Niv. {member.level} • {member.department}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-blue-900">{xpCalc?.totalXP || 0} XP</div>
                              <button
                                onClick={() => toggleMemberSelection(member)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Retirer
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Liste des membres avec XP en temps réel */}
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
                        {searchMember || selectedDomain || filterDepartment || filterMinLevel ? 
                          'Aucun membre trouvé' : 'Aucun membre disponible'}
                      </h3>
                      <p className="text-gray-500">
                        {searchMember || selectedDomain || filterDepartment || filterMinLevel ? 
                          'Essayez d\'ajuster vos filtres' : 'Vérifiez votre connexion'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {filteredMembers.map(member => {
                        const isSelected = selectedMembers.find(m => m.id === member.id);
                        const xpPreview = calculateXPForMember(member, 100);
                        
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
                                  </div>
                                  
                                  {/* XP potentiel */}
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-green-600">
                                      +{xpPreview.totalXP} XP
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      potentiel
                                    </div>
                                  </div>
                                </div>

                                {/* Compétences compatibles */}
                                {selectedDomain && member.skills.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {member.skills.slice(0, 3).map((skill, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                                          {skill}
                                        </span>
                                      ))}
                                      {member.skills.length > 3 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                          +{member.skills.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
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

            {/* Étape 2: Répartition XP Avancée */}
            {step === 2 && (
              <div className="p-6 space-y-6">
                
                {/* Header répartition avec calculs */}
                <div className="text-center bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Répartition des Contributions et Calcul XP
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Définissez les pourcentages de contribution pour le calcul précis des XP
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getTotalPercentage()}%
                      </div>
                      <div className="text-sm text-gray-600">Total Répartition</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(xpCalculation).reduce((sum, calc) => sum + calc.totalXP, 0)} XP
                      </div>
                      <div className="text-sm text-gray-600">XP Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedMembers.length}
                      </div>
                      <div className="text-sm text-gray-600">Collaborateurs</div>
                    </div>
                  </div>
                </div>

                {/* Actions de répartition intelligente */}
                <div className="flex justify-center gap-3 flex-wrap">
                  <button
                    onClick={distributeEqually}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Percent className="w-4 h-4" />
                    Répartition égale
                  </button>
                  
                  <button
                    onClick={distributeByLevel}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Selon le niveau
                  </button>
                </div>

                {/* Répartition par membre avec calculs XP détaillés */}
                <div className="space-y-4">
                  {selectedMembers.map(member => {
                    const contribution = contributions[member.id] || (100 / selectedMembers.length);
                    const xpCalc = xpCalculation[member.id] || { totalXP: 0, factors: {} };
                    
                    return (
                      <motion.div 
                        key={member.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          
                          {/* Infos membre */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.email}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span>Niv. {member.level}</span>
                                <span>{member.totalXp} XP</span>
                                <span className="px-2 py-0.5 bg-gray-100 rounded">
                                  {member.department}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Contrôle de pourcentage */}
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => updateContribution(member.id, contribution - 5)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-bold"
                            >
                              -
                            </button>
                            
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={contribution}
                              onChange={(e) => updateContribution(member.id, e.target.value)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            />
                            
                            <button
                              onClick={() => updateContribution(member.id, contribution + 5)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-bold"
                            >
                              +
                            </button>
                            
                            <span className="text-gray-600 font-medium ml-1">%</span>
                          </div>
                          
                          {/* Calcul XP détaillé */}
                          <div className="text-right space-y-1">
                            <div className="text-2xl font-bold text-green-600">
                              {xpCalc.totalXP} XP
                            </div>
                            <div className="text-xs text-gray-500 space-y-0.5">
                              <div>Base: {xpCalc.baseXP || 20} XP</div>
                              <div>Facteurs: 
                                {Object.entries(xpCalc.factors || {}).map(([key, value]) => (
                                  <span key={key} className="ml-1">
                                    {key}: x{typeof value === 'number' ? value.toFixed(2) : value}
                                  </span>
                                )).slice(0, 2)}
                              </div>
                              <div>Contribution: {contribution}%</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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

                {/* Résumé final de l'assignation */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Résumé de l'Assignation Complète</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedMembers.length}</div>
                      <div className="text-sm text-gray-600">Membres</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(xpCalculation).reduce((sum, calc) => sum + calc.totalXP, 0)}
                      </div>
                      <div className="text-sm text-gray-600">XP Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{estimatedHours}h</div>
                      <div className="text-sm text-gray-600">Temps Estimé</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {DIFFICULTY_LEVELS[taskDifficulty]?.name}
                      </div>
                      <div className="text-sm text-gray-600">Difficulté</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {selectedDomain ? SKILL_DOMAINS[selectedDomain]?.name?.split(' ')[0] : 'Général'}
                      </div>
                      <div className="text-sm text-gray-600">Domaine</div>
                    </div>
                  </div>
                  
                  {/* Détails de configuration */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDomain && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Domaine de Compétence</h5>
                        <p className="text-sm text-blue-800">{SKILL_DOMAINS[selectedDomain]?.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {SKILL_DOMAINS[selectedDomain]?.skills?.slice(0, 4).map(skill => (
                            <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedRole && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900 mb-2">Rôle Synergia</h5>
                        <p className="text-sm text-purple-800">{SYNERGIA_ROLES[selectedRole]?.description}</p>
                        <div className="mt-2 text-xs text-purple-700">
                          XP de base: {SYNERGIA_ROLES[selectedRole]?.xpBase} • Icône: {SYNERGIA_ROLES[selectedRole]?.icon}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer avec actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              
              {/* Informations de progression */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {step === 1 && (
                  <>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedMembers.length} sélectionnés
                    </span>
                    {selectedMembers.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {Object.values(xpCalculation).reduce((sum, calc) => sum + calc.totalXP, 0)} XP total
                      </span>
                    )}
                  </>
                )}
                
                {step === 2 && (
                  <>
                    <span className="flex items-center gap-1">
                      <Percent className="w-4 h-4" />
                      {getTotalPercentage()}% répartis
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {Object.values(xpCalculation).reduce((sum, calc) => sum + calc.totalXP, 0)} XP total
                    </span>
                  </>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-3">
                
                {/* Bouton précédent (étape 2 seulement) */}
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    disabled={submitting}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    ← Précédent
                  </button>
                )}
                
                {/* Bouton annuler */}
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                
                {/* Bouton principal */}
                <button
                  onClick={handleSubmitAssignment}
                  disabled={
                    submitting || 
                    selectedMembers.length === 0 || 
                    (step === 2 && getTotalPercentage() !== 100)
                  }
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Attribution...
                    </>
                  ) : step === 1 ? (
                    selectedMembers.length > 1 ? (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Répartir XP
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Assigner
                      </>
                    )
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Finaliser
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <span>Progression:</span>
                <span className="font-medium">
                  {step === 1 ? 'Configuration & Sélection' : 'Répartition XP & Finalisation'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 2) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Aide contextuelle */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  {step === 1 ? (
                    <div>
                      <p className="font-medium mb-1">💡 Conseils pour l'assignation :</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Configurez la difficulté et le domaine pour un calcul XP précis</li>
                        <li>• Utilisez les filtres pour trouver les membres les plus adaptés</li>
                        <li>• Les membres avec des compétences compatibles sont mis en avant</li>
                        <li>• Le calcul XP tient compte du niveau, domaine, rôle et temps estimé</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-1">⚖️ Répartition des contributions :</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Le total doit être exactement 100% pour valider</li>
                        <li>• Les XP sont calculés proportionnellement à la contribution</li>
                        <li>• Utilisez "Répartition égale" ou "Selon le niveau" pour automatiser</li>
                        <li>• Chaque membre recevra des notifications détaillées</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedTaskAssignmentModal;
