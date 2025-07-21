// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING COMPLÈTE - IMPORT AUTHSTORE CORRIGÉ
// ==========================================

import React, { useState, useCallback, useEffect } from 'react';
import { 
  BookOpen,
  Target,
  MessageSquare,
  Users,
  Trophy,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  Award,
  RefreshCw,
  Play,
  Loader,
  Bug,
  XCircle,
  CheckCircle2,
  Building,
  Heart,
  Key,
  Coffee,
  Lightbulb,
  UserCheck,
  Eye,
  FileText,
  Shield,
  Gamepad2,
  Settings,
  Wrench,
  Sparkles,
  Circle,
  ChevronRight,
  ChevronDown,
  Plus,
  Pause,
  RotateCcw,
  Badge as BadgeIcon,
  Zap,
  AlertCircle,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  ChevronUp
} from 'lucide-react';

// 🔧 CORRECTION: Import authStore avec chemin correct
import { useAuthStore } from '../shared/stores/authStore.js';
import { onboardingService, ONBOARDING_PHASES } from '../core/services/onboardingService.js';

// Imports Firebase pour les entretiens
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 RÔLES SYNERGIA POUR LES COMPÉTENCES
const SYNERGIA_ROLES = {
  GAME_MASTER: {
    id: 'game_master',
    name: 'Game Master',
    icon: '🎮',
    color: 'from-purple-500 to-purple-600',
    description: 'Animation des sessions et expérience client',
    competences: [
      'Animation de sessions',
      'Gestion des groupes',
      'Techniques de game mastering',
      'Improvisation et créativité',
      'Communication client'
    ]
  },
  MAINTENANCE: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'from-orange-500 to-orange-600',
    description: 'Responsable de la maintenance et des réparations',
    competences: [
      'Maintenance préventive',
      'Réparations techniques',
      'Gestion des équipements',
      'Sécurité et normes',
      'Diagnostics techniques'
    ]
  },
  ACCUEIL: {
    id: 'accueil',
    name: 'Accueil & Relations Client',
    icon: '👋',
    color: 'from-blue-500 to-blue-600',
    description: 'Premier contact et satisfaction client',
    competences: [
      'Accueil chaleureux',
      'Service client',
      'Gestion des réservations',
      'Communication interpersonnelle',
      'Résolution de problèmes'
    ]
  },
  CUISINE: {
    id: 'cuisine',
    name: 'Cuisine & Restauration',
    icon: '👨‍🍳',
    color: 'from-red-500 to-red-600',
    description: 'Préparation culinaire et service',
    competences: [
      'Préparation alimentaire',
      'Hygiène et sécurité alimentaire',
      'Service en salle',
      'Gestion des stocks alimentaires',
      'Créativité culinaire'
    ]
  },
  BOUTIQUE: {
    id: 'boutique',
    name: 'Boutique & Merchandising',
    icon: '🛍️',
    color: 'from-green-500 to-green-600',
    description: 'Vente et gestion de la boutique',
    competences: [
      'Techniques de vente',
      'Merchandising',
      'Gestion d\'inventaire',
      'Encaissement',
      'Conseil client'
    ]
  },
  EVENEMENTIEL: {
    id: 'evenementiel',
    name: 'Événementiel & Organisation',
    icon: '🎉',
    color: 'from-pink-500 to-pink-600',
    description: 'Coordination d\'événements spéciaux',
    competences: [
      'Planification d\'événements',
      'Coordination d\'équipes',
      'Logistique événementielle',
      'Gestion de projet',
      'Animation de groupes'
    ]
  },
  SOCIAL_MEDIA: {
    id: 'social_media',
    name: 'Communication & Réseaux',
    icon: '📱',
    color: 'from-indigo-500 to-indigo-600',
    description: 'Gestion de la présence numérique',
    competences: [
      'Création de contenu',
      'Gestion des réseaux sociaux',
      'Photographie/vidéo',
      'Community management',
      'Stratégie digitale'
    ]
  },
  ADMINISTRATION: {
    id: 'administration',
    name: 'Administration & Gestion',
    icon: '📊',
    color: 'from-gray-500 to-gray-600',
    description: 'Support administratif et organisationnel',
    competences: [
      'Gestion administrative',
      'Suivi financier',
      'Planification',
      'Documentation',
      'Support opérationnel'
    ]
  }
};

/**
 * 🚀 PAGE D'ONBOARDING COMPLÈTE SYNERGIA
 * Guide interactif pour nouveaux employés
 */
const OnboardingPage = () => {
  const { user } = useAuthStore();

  // États principaux
  const [currentPhase, setCurrentPhase] = useState('welcome');
  const [completedPhases, setCompletedPhases] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    startDate: '',
    previousExperience: '',
    interests: [],
    availability: {
      fullTime: true,
      partTime: false,
      weekends: false,
      evenings: false
    }
  });

  // États UI
  const [showRoleDetails, setShowRoleDetails] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [interviewScheduled, setInterviewScheduled] = useState(false);

  /**
   * 📋 CHARGER LE PROGRÈS UTILISATEUR
   */
  useEffect(() => {
    if (user?.uid) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    setLoading(true);
    try {
      const progress = await onboardingService.getUserProgress(user.uid);
      setUserProgress(progress);
      setCurrentPhase(progress.currentPhase || 'welcome');
      setCompletedPhases(progress.completedPhases || []);
      
      if (progress.selectedRoles) {
        setSelectedRoles(progress.selectedRoles);
      }
      
      if (progress.userInfo) {
        setUserInfo({ ...userInfo, ...progress.userInfo });
      }
    } catch (error) {
      console.error('❌ Erreur chargement progrès:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ COMPLÉTER UNE PHASE
   */
  const completePhase = useCallback(async (phase) => {
    try {
      setLoading(true);
      
      const newCompletedPhases = [...completedPhases, phase];
      setCompletedPhases(newCompletedPhases);
      
      // Déterminer la phase suivante
      const phases = Object.keys(ONBOARDING_PHASES);
      const currentIndex = phases.indexOf(phase);
      const nextPhase = currentIndex < phases.length - 1 ? phases[currentIndex + 1] : 'completed';
      
      setCurrentPhase(nextPhase);
      
      // Sauvegarder en Firebase
      await onboardingService.updateUserProgress(user.uid, {
        currentPhase: nextPhase,
        completedPhases: newCompletedPhases,
        selectedRoles,
        userInfo,
        lastUpdated: new Date().toISOString()
      });
      
      console.log('✅ Phase complétée:', phase);
    } catch (error) {
      console.error('❌ Erreur complétion phase:', error);
    } finally {
      setLoading(false);
    }
  }, [completedPhases, selectedRoles, userInfo, user?.uid]);

  /**
   * 🎯 SÉLECTIONNER/DÉSÉLECTIONNER UN RÔLE
   */
  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  /**
   * 📅 PLANIFIER UN ENTRETIEN
   */
  const scheduleInterview = async (selectedDate, selectedTime) => {
    try {
      setLoading(true);
      
      await addDoc(collection(db, 'interviews'), {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        selectedRoles: selectedRoles,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        notes: `Entretien onboarding - Rôles sélectionnés: ${selectedRoles.map(id => SYNERGIA_ROLES[id]?.name).join(', ')}`
      });
      
      setInterviewScheduled(true);
      console.log('✅ Entretien planifié');
      
    } catch (error) {
      console.error('❌ Erreur planification entretien:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎨 RENDU DE LA PHASE WELCOME
   */
  const renderWelcomePhase = () => (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Bienvenue chez Synergia ! 🎉
        </h1>
        
        <p className="text-xl text-purple-300 mb-8 max-w-2xl mx-auto">
          Nous sommes ravis de t'accueillir dans notre équipe ! 
          Ce guide va t'accompagner pour découvrir ton futur rôle et t'intégrer parfaitement.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <Target className="w-8 h-8 text-blue-400 mb-4 mx-auto" />
          <h3 className="font-semibold text-white mb-2">Découverte</h3>
          <p className="text-gray-400 text-sm">
            Explore nos différents rôles et trouve celui qui te correspond
          </p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <Users className="w-8 h-8 text-green-400 mb-4 mx-auto" />
          <h3 className="font-semibold text-white mb-2">Rencontre</h3>
          <p className="text-gray-400 text-sm">
            Fais connaissance avec ton équipe et ton manager
          </p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <Trophy className="w-8 h-8 text-yellow-400 mb-4 mx-auto" />
          <h3 className="font-semibold text-white mb-2">Évolution</h3>
          <p className="text-gray-400 text-sm">
            Développe tes compétences et progresse dans ta carrière
          </p>
        </div>
      </div>

      <button
        onClick={() => completePhase('welcome')}
        disabled={loading}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Chargement...</span>
          </div>
        ) : (
          <>
            Commencer mon parcours <ChevronRight className="w-4 h-4 ml-2 inline" />
          </>
        )}
      </button>
    </div>
  );

  /**
   * 🎯 RENDU DE LA PHASE ROLE SELECTION
   */
  const renderRoleSelectionPhase = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Choisis tes rôles préférés 🎯
        </h2>
        <p className="text-purple-300 text-lg max-w-3xl mx-auto">
          Sélectionne les rôles qui t'intéressent le plus. Tu pourras en choisir plusieurs et nous discuterons ensemble de tes préférences lors de ton entretien.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(SYNERGIA_ROLES).map(([roleId, role]) => (
          <motion.div
            key={roleId}
            whileHover={{ scale: 1.02 }}
            className={`relative bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 cursor-pointer transition-all duration-300 ${
              selectedRoles.includes(roleId)
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => toggleRole(roleId)}
          >
            {/* Badge de sélection */}
            {selectedRoles.includes(roleId) && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="text-center">
              <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl">{role.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{role.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{role.description}</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRoleDetails(showRoleDetails === roleId ? null : roleId);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {showRoleDetails === roleId ? 'Moins de détails' : 'Voir les compétences'}
              </button>
            </div>

            {/* Détails expandus */}
            <AnimatePresence>
              {showRoleDetails === roleId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-700"
                >
                  <h4 className="text-sm font-semibold text-white mb-2">Compétences développées :</h4>
                  <ul className="space-y-1">
                    {role.competences.map((competence, index) => (
                      <li key={index} className="text-xs text-gray-400 flex items-center">
                        <Star className="w-3 h-3 mr-2 text-yellow-400" />
                        {competence}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-gray-400 mb-4">
          {selectedRoles.length > 0 
            ? `${selectedRoles.length} rôle(s) sélectionné(s)`
            : 'Sélectionne au moins un rôle pour continuer'
          }
        </p>
        
        <button
          onClick={() => completePhase('role_selection')}
          disabled={loading || selectedRoles.length === 0}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Sauvegarde...</span>
            </div>
          ) : (
            <>
              Continuer avec mes choix <ChevronRight className="w-4 h-4 ml-2 inline" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  /**
   * 📅 RENDU DE LA PHASE INTERVIEW SCHEDULING
   */
  const renderInterviewPhase = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Planifions ton entretien ! 📅
        </h2>
        <p className="text-purple-300 text-lg">
          Super ! Maintenant, planifions un entretien pour discuter de tes rôles préférés et de ton intégration.
        </p>
      </div>

      {!interviewScheduled ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-white mb-6">Informations de contact</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ton nom complet"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={userInfo.phone}
                onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ton numéro de téléphone"
              />
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">Tes rôles sélectionnés :</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedRoles.map(roleId => {
                const role = SYNERGIA_ROLES[roleId];
                return (
                  <div key={roleId} className="flex items-center space-x-3 bg-gray-700/50 rounded-lg p-3">
                    <span className="text-xl">{role.icon}</span>
                    <div>
                      <div className="font-medium text-white">{role.name}</div>
                      <div className="text-xs text-gray-400">{role.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => scheduleInterview(new Date(), '14:00')}
              disabled={loading || !userInfo.name || !userInfo.phone}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Planification...</span>
                </div>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2 inline" />
                  Demander un entretien
                </>
              )}
            </button>
            
            <p className="text-gray-400 text-sm mt-3">
              Notre équipe RH te recontactera sous 24h pour fixer le créneau
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Demande envoyée ! ✅</h3>
          <p className="text-green-300 mb-6">
            Parfait ! Notre équipe RH a reçu ta demande d'entretien et te recontactera rapidement pour planifier un créneau.
          </p>
          
          <button
            onClick={() => completePhase('interview_scheduling')}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Continuer <ChevronRight className="w-4 h-4 ml-2 inline" />
          </button>
        </div>
      )}
    </div>
  );

  /**
   * 🏁 RENDU DE LA PHASE COMPLETION
   */
  const renderCompletionPhase = () => (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-16 h-16 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Onboarding terminé ! 🎉
        </h1>
        
        <p className="text-xl text-green-300 mb-8 max-w-2xl mx-auto">
          Félicitations ! Tu as terminé ton parcours d'onboarding. 
          Tu es maintenant prêt(e) à rejoindre officiellement l'équipe Synergia !
        </p>
      </motion.div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-6">Récapitulatif de ton parcours</h3>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-white font-medium">Accueil et présentation</span>
            </div>
            <span className="text-green-400">✓ Terminé</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-white font-medium">Sélection des rôles</span>
            </div>
            <span className="text-green-400">✓ {selectedRoles.length} rôle(s)</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-white font-medium">Entretien planifié</span>
            </div>
            <span className="text-green-400">✓ Demande envoyée</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-3">Prochaines étapes :</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300">Entretien avec ton manager</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-purple-300">Formation spécialisée pour tes rôles</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-300">Intégration dans l'équipe</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-purple-300 font-medium">
            💪 Tu fais partie de l'équipe dès maintenant !
          </p>
        </div>
      </div>
    </div>
  );

  // Interface de chargement
  if (loading && !currentPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Chargement de ton parcours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        {/* Indicateur de progression */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {Object.keys(ONBOARDING_PHASES).map((phase, index) => (
              <div key={phase} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  completedPhases.includes(phase)
                    ? 'bg-green-500 text-white'
                    : currentPhase === phase
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {completedPhases.includes(phase) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                {index < Object.keys(ONBOARDING_PHASES).length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    completedPhases.includes(phase) ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <p className="text-center text-gray-400">
            Étape {Math.max(1, Object.keys(ONBOARDING_PHASES).indexOf(currentPhase) + 1)} sur {Object.keys(ONBOARDING_PHASES).length}
          </p>
        </div>

        {/* Contenu principal selon la phase */}
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentPhase === 'welcome' && renderWelcomePhase()}
          {currentPhase === 'role_selection' && renderRoleSelectionPhase()}
          {currentPhase === 'interview_scheduling' && renderInterviewPhase()}
          {currentPhase === 'completed' && renderCompletionPhase()}
        </motion.div>
      </div>
    </div>
  );
};

// 🚀 EXPORT DEFAULT POUR NETLIFY BUILD
export default OnboardingPage;
