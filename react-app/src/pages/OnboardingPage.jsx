// 🚨 CORRECTION URGENTE OnboardingPage.jsx - ERREUR LIGNE 312
// react-app/src/pages/OnboardingPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Clock,
  Target,
  Trophy,
  Brain,
  Rocket,
  Star,
  ChevronRight,
  ChevronDown,
  Wifi,
  WifiOff,
  Save,
  RefreshCw,
  Award,
  Book,
  Users,
  Settings,
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';

// ==========================================
// 📊 DONNÉES DE FORMATION BRAIN
// ==========================================
const BRAIN_FORMATION_DATA = {
  title: "Formation Générale Brain",
  description: "Parcours d'intégration personnalisé pour tes débuts chez Brain",
  totalXP: 500,
  estimatedDuration: "2-3 semaines",
  sections: {
    welcome: {
      title: "🎯 Bienvenue chez Brain",
      description: "Découverte de l'entreprise et premiers pas",
      tasks: [
        { id: 'presentation_brain', label: 'Présentation générale de Brain', description: 'Histoire, valeurs et mission de l\'entreprise', xp: 10, category: 'discovery' },
        { id: 'tour_locaux', label: 'Tour des locaux et sécurité', description: 'Visite guidée et consignes de sécurité', xp: 15, category: 'practical' },
        { id: 'rencontre_equipe', label: 'Rencontre avec l\'équipe', description: 'Présentation des collègues et managers', xp: 20, category: 'social' },
        { id: 'materiel_attribution', label: 'Attribution du matériel', description: 'Récupération ordinateur, badges, etc.', xp: 10, category: 'practical' }
      ]
    },
    formation_metier: {
      title: "💼 Formation Métier",
      description: "Acquisition des compétences spécifiques à ton poste",
      tasks: [
        { id: 'procedure_specifiques', label: 'Procédures spécifiques au poste', description: 'Méthodes de travail et processus', xp: 25, category: 'skills' },
        { id: 'outils_metier', label: 'Maîtrise des outils métier', description: 'Logiciels et équipements spécialisés', xp: 30, category: 'technical' },
        { id: 'reglementation', label: 'Réglementation et normes', description: 'Aspects légaux et conformité', xp: 20, category: 'compliance' },
        { id: 'cas_pratiques', label: 'Exercices et cas pratiques', description: 'Mise en application des connaissances', xp: 35, category: 'practice' }
      ]
    },
    integration_sociale: {
      title: "🤝 Intégration Sociale",
      description: "Création de liens et intégration dans l'équipe",
      tasks: [
        { id: 'dejeuner_equipe', label: 'Déjeuner avec l\'équipe', description: 'Moment convivial de partage', xp: 15, category: 'social' },
        { id: 'parrainage', label: 'Rencontre avec ton parrain/marraine', description: 'Accompagnement personnalisé', xp: 20, category: 'mentoring' },
        { id: 'projets_collaboration', label: 'Participation aux projets collaboratifs', description: 'Travail en équipe sur des missions', xp: 25, category: 'teamwork' },
        { id: 'culture_entreprise', label: 'Immersion dans la culture Brain', description: 'Valeurs et façons de travailler', xp: 15, category: 'culture' }
      ]
    },
    evaluation_progres: {
      title: "📈 Évaluation et Progression",
      description: "Bilan de ton intégration et perspectives d'évolution",
      tasks: [
        { id: 'bilan_1_semaine', label: 'Bilan de fin de première semaine', description: 'Point sur l\'adaptation et les premiers acquis', xp: 15, category: 'evaluation' },
        { id: 'retours_manager', label: 'Retours du manager', description: 'Feedback sur tes performances', xp: 20, category: 'feedback' },
        { id: 'auto_evaluation', label: 'Auto-évaluation de tes compétences', description: 'Analyse personnelle de ton évolution', xp: 15, category: 'self_assessment' },
        { id: 'plan_developpement', label: 'Plan de développement personnel', description: 'Objectifs et axes d\'amélioration', xp: 20, category: 'improvement' },
        { id: 'projection_carriere', label: 'Projection de carrière chez Brain', description: 'Évolution possible et ambitions', xp: 25, category: 'career' },
        { id: 'validation_competences', label: 'Validation finale des compétences', description: 'Certification de tes acquis', xp: 30, category: 'certification' },
        { id: 'integration_reussie', label: 'Validation intégration réussie', description: 'Confirmation de la réussite du parcours', xp: 40, category: 'success' }
      ]
    }
  }
};

// ==========================================
// 🎯 COMPOSANT PRINCIPAL
// ==========================================
const OnboardingPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [formationData, setFormationData] = useState(BRAIN_FORMATION_DATA);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState('offline'); // offline, online, syncing
  const [lastSaved, setLastSaved] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['welcome']));
  
  // Références
  const saveTimeoutRef = useRef(null);
  const lastSyncRef = useRef(0);

  // 📥 CHARGEMENT INITIAL + ÉCOUTE ÉVÉNEMENTS DASHBOARD
  useEffect(() => {
    if (user?.uid) {
      loadProgress();
    }
    
    // 🔄 ÉCOUTER LES ÉVÉNEMENTS DE SYNCHRONISATION DASHBOARD
    const handleDashboardRefresh = (event) => {
      console.log('📢 [ONBOARDING] Événement dashboard refresh reçu:', event.detail);
      // Optionnel: recharger les données locales aussi
      if (event.detail?.userId === user?.uid) {
        setTimeout(loadProgress, 1000);
      }
    };
    
    window.addEventListener('force-dashboard-refresh', handleDashboardRefresh);
    
    return () => {
      window.removeEventListener('force-dashboard-refresh', handleDashboardRefresh);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [user?.uid]);

  // 📚 CHARGEMENT DES DONNÉES SAUVEGARDÉES
  const loadProgress = async () => {
    // ✅ CORRECTION LIGNE 312 : Fonction séparée au lieu d'objet mal formé
    try {
      console.log(`🔄 [REST] Chargement progression via stockage local...`);
      
      const savedData = localStorage.getItem(`onboarding_${user.uid}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setCompletedTasks(new Set(parsed.completedTasks || []));
        setLastSaved(new Date(parsed.lastSaved || Date.now()));
        setSyncStatus('offline');
        console.log('📁 Données chargées depuis localStorage');
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    }
  };

  // 💾 SAUVEGARDE AUTOMATIQUE
  const saveProgress = async (tasks = completedTasks) => {
    if (!user?.uid) return;
    
    // Sauvegarde locale immédiate
    const progressData = {
      completedTasks: Array.from(tasks),
      lastSaved: Date.now(),
      userId: user.uid
    };
    
    localStorage.setItem(`onboarding_${user.uid}`, JSON.stringify(progressData));
    setLastSaved(new Date());
    
    // 🔄 DÉCLENCHER ACTUALISATION DASHBOARD
    console.log('🚀 [ONBOARDING] Déclenchement actualisation dashboard...');
    
    const totalXP = calculateEarnedXP(tasks);
    
    // Événement custom pour le dashboard
    const dashboardEvent = new CustomEvent('onboarding-progress-updated', {
      detail: {
        userId: user.uid,
        completedTasks: Array.from(tasks),
        earnedXP: totalXP,
        timestamp: Date.now(),
        source: 'onboarding'
      }
    });
    
    window.dispatchEvent(dashboardEvent);
    console.log(`📊 [ONBOARDING] Événement dispatché - XP: ${totalXP}`);
  };

  // 🎯 CALCULER XP GAGNÉ
  const calculateEarnedXP = (tasks = completedTasks) => {
    let totalXP = 0;
    
    Object.values(formationData.sections).forEach(section => {
      section.tasks.forEach(task => {
        if (tasks.has(task.id)) {
          totalXP += task.xp;
        }
      });
    });
    
    return totalXP;
  };

  // ✅ MARQUER UNE TÂCHE COMME TERMINÉE
  const completeTask = (taskId) => {
    const newCompletedTasks = new Set(completedTasks);
    
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
    } else {
      newCompletedTasks.add(taskId);
    }
    
    setCompletedTasks(newCompletedTasks);
    
    // Sauvegarde automatique avec délai
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress(newCompletedTasks);
    }, 500);
  };

  // 🔄 BASCULER SECTION ÉTENDUE
  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // 📊 CALCULER PROGRESSION GLOBALE
  const totalTasks = Object.values(formationData.sections).reduce(
    (sum, section) => sum + section.tasks.length, 0
  );
  const completedCount = completedTasks.size;
  const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  const earnedXP = calculateEarnedXP();

  // 🎨 RENDU PRINCIPAL
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        
        {/* EN-TÊTE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {formationData.title}
              </h1>
              <p className="text-gray-400 text-lg">
                {formationData.description}
              </p>
            </div>
            
            {/* Statut de synchronisation */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                syncStatus === 'online' ? 'bg-green-500/20 text-green-300' :
                syncStatus === 'syncing' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {syncStatus === 'online' ? <Wifi className="w-4 h-4" /> :
                 syncStatus === 'syncing' ? <RefreshCw className="w-4 h-4 animate-spin" /> :
                 <WifiOff className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {syncStatus === 'online' ? 'Synchronisé' :
                   syncStatus === 'syncing' ? 'Synchronisation...' :
                   'Mode hors ligne'}
                </span>
              </div>
              
              {lastSaved && (
                <div className="text-xs text-gray-500">
                  Sauvegardé {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* BARRE DE PROGRESSION GLOBALE */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Progression Globale</h3>
                <p className="text-gray-400">
                  {completedCount} sur {totalTasks} tâches terminées
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{earnedXP} XP</div>
                <div className="text-sm text-gray-400">sur {formationData.totalXP} XP</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-400">
              <span>{progressPercentage.toFixed(1)}% terminé</span>
              <span>Durée estimée: {formationData.estimatedDuration}</span>
            </div>
          </div>
        </div>

        {/* SECTIONS DE FORMATION */}
        <div className="space-y-6">
          {Object.entries(formationData.sections).map(([sectionId, section]) => {
            const sectionCompleted = section.tasks.filter(task => completedTasks.has(task.id)).length;
            const sectionTotal = section.tasks.length;
            const sectionProgress = sectionTotal > 0 ? (sectionCompleted / sectionTotal) * 100 : 0;
            const isExpanded = expandedSections.has(sectionId);

            return (
              <motion.div
                key={sectionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
              >
                {/* EN-TÊTE DE SECTION */}
                <button
                  onClick={() => toggleSection(sectionId)}
                  className="w-full p-6 text-left hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {section.title}
                      </h3>
                      <p className="text-gray-400 mb-3">
                        {section.description}
                      </p>
                      
                      {/* Barre de progression de section */}
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${sectionProgress}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{sectionCompleted}/{sectionTotal} tâches</span>
                        <span>{sectionProgress.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center gap-3">
                      {sectionProgress === 100 && (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Terminé</span>
                        </div>
                      )}
                      
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* CONTENU DE SECTION */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-700"
                    >
                      <div className="p-6 space-y-4">
                        {section.tasks.map((task) => {
                          const isCompleted = completedTasks.has(task.id);
                          
                          return (
                            <motion.div
                              key={task.id}
                              layout
                              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                                isCompleted
                                  ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                              }`}
                              onClick={() => completeTask(task.id)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                  ) : (
                                    <Circle className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <h4 className={`font-medium ${
                                    isCompleted ? 'text-green-300' : 'text-white'
                                  }`}>
                                    {task.label}
                                  </h4>
                                  <p className="text-gray-400 text-sm mt-1">
                                    {task.description}
                                  </p>
                                </div>
                                
                                <div className="text-right">
                                  <div className={`text-lg font-bold ${
                                    isCompleted ? 'text-green-400' : 'text-purple-400'
                                  }`}>
                                    +{task.xp} XP
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize">
                                    {task.category}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* RÉSUMÉ FINAL */}
        {progressPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-8 text-center"
          >
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 Félicitations !
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Tu as terminé ta formation d'intégration chez Brain avec succès !
            </p>
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{earnedXP} XP</div>
                <div className="text-sm text-gray-400">XP Gagné</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{totalTasks}</div>
                <div className="text-sm text-gray-400">Tâches Accomplies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">100%</div>
                <div className="text-sm text-gray-400">Formation Terminée</div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default OnboardingPage;
