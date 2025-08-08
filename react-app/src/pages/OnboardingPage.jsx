// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING COMPLÈTE AVEC CORRECTION BUILD
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../shared/stores/authStore.js';
import InterviewIntegration from '../components/onboarding/InterviewIntegration.jsx';

import { 
  CheckSquare, 
  Square, 
  Award, 
  Star, 
  Target, 
  Clock, 
  Users, 
  ChevronDown, 
  ChevronRight,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Book,
  User,
  MessageSquare,
  Calendar,
  Wifi,
  WifiOff,
  Gamepad2,
  Crown,
  UserCheck,
  Briefcase,
  ShieldCheck
} from 'lucide-react';

// Services Firebase
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Service REST Firebase de secours
const createFirebaseRestService = () => {
  const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
  const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  
  if (!API_KEY || !PROJECT_ID) {
    console.warn('⚠️ Configuration Firebase REST manquante');
    return null;
  }
  
  return {
    async saveDocument(collection, docId, data) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
        
        const firestoreData = Object.keys(data).reduce((acc, key) => {
          const value = data[key];
          if (typeof value === 'string') {
            acc[key] = { stringValue: value };
          } else if (typeof value === 'number') {
            acc[key] = { doubleValue: value };
          } else if (typeof value === 'boolean') {
            acc[key] = { booleanValue: value };
          } else if (Array.isArray(value)) {
            acc[key] = { arrayValue: { values: value.map(v => ({ stringValue: v })) } };
          } else if (typeof value === 'object' && value !== null) {
            acc[key] = { mapValue: { fields: Object.keys(value).reduce((subAcc, subKey) => {
              subAcc[subKey] = { stringValue: String(value[subKey]) };
              return subAcc;
            }, {}) } };
          }
          return acc;
        }, {});
        
        const response = await fetch(url + `?key=${API_KEY}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: firestoreData })
        });
        
        return response.ok;
      } catch (error) {
        console.error('❌ Erreur sauvegarde REST:', error);
        return false;
      }
    }
  };
};

// Données de formation Brain
const BRAIN_FORMATION_DATA = {
  title: '🧠 Formation Brain - Escape Game Master',
  description: 'Deviens un véritable maître du jeu et guide nos aventuriers vers des expériences inoubliables !',
  totalXP: 1500,
  estimatedDuration: '4 semaines intensives',
  
  sections: {
    // Phase 1: Découverte de Brain & de l'équipe (15 tâches)
    decouverte_brain: {
      title: '🧠 Découverte de Brain & de l\'équipe',
      description: 'Bienvenue ! Voici tes premières étapes pour te sentir chez toi et découvrir l\'esprit Brain.',
      color: 'from-blue-500 to-cyan-500',
      order: 1,
      xp: 190,
      tasks: [
        { id: 'visite_bureau', label: 'Tour des bureaux avec ton référent', description: 'Découverte physique des espaces, présentation équipes', xp: 15, category: 'welcome' },
        { id: 'presentation_equipe', label: 'Présentation à l\'équipe', description: 'Rencontrer tes futurs collègues et te présenter', xp: 10, category: 'social' },
        { id: 'historique_brain', label: 'Histoire et valeurs de Brain', description: 'Comprendre notre vision et notre mission', xp: 15, category: 'culture' },
        { id: 'organisation_equipe', label: 'Organisation de l\'équipe et rôles', description: 'Qui fait quoi et comment on travaille ensemble', xp: 15, category: 'organization' },
        { id: 'clients_brain', label: 'Présentation du portefeuille client', description: 'Nos partenaires et types de clientèle', xp: 20, category: 'business' },
        { id: 'formation_securite', label: 'Formation sécurité et procédures d\'urgence', description: 'Règles de sécurité et évacuation', xp: 15, category: 'safety' },
        { id: 'reglement_interieur', label: 'Lecture du règlement intérieur', description: 'Prise de connaissance des règles internes', xp: 10, category: 'legal' },
        { id: 'horaires_pauses', label: 'Informations horaires et pauses', description: 'Organisation du temps de travail', xp: 10, category: 'organization' },
        { id: 'materiel_fourni', label: 'Remise du matériel et équipements', description: 'Attribution des outils de travail', xp: 15, category: 'tools' },
        { id: 'badge_acces', label: 'Création du badge d\'accès', description: 'Configuration des droits d\'accès', xp: 10, category: 'security' },
        { id: 'comptes_numeriques', label: 'Création des comptes numériques', description: 'Accès aux plateformes et outils', xp: 20, category: 'digital' },
        { id: 'formation_synergia', label: 'Formation à Synergia', description: 'Maîtrise de la plateforme principale', xp: 30, category: 'platform' },
        { id: 'test_connexions', label: 'Test de toutes les connexions', description: 'Vérification des accès systèmes', xp: 15, category: 'technical' }
      ]
    },

    // Phase 2: Formation technique escape game (28 tâches)
    formation_technique: {
      title: '🎮 Formation technique escape game',
      description: 'Maîtrise les aspects techniques de nos escape games : mécaniques, énigmes, scénarios.',
      color: 'from-purple-500 to-pink-500',
      order: 2,
      xp: 420,
      tasks: [
        { id: 'salles_disponibles', label: 'Visite de toutes les salles d\'escape game', description: 'Tour complet des espaces de jeu', xp: 20, category: 'discovery' },
        { id: 'scenarios_complets', label: 'Apprentissage des scénarios complets', description: 'Histoires, objectifs, et déroulement', xp: 25, category: 'scenarios' },
        { id: 'enigmes_classiques', label: 'Maîtrise des énigmes classiques', description: 'Logiques, codes, fouilles, manipulations', xp: 20, category: 'puzzles' },
        { id: 'systemes_audio', label: 'Formation aux systèmes audio', description: 'Micros, enceintes, ambiances sonores', xp: 15, category: 'technical' },
        { id: 'systemes_video', label: 'Formation aux systèmes vidéo', description: 'Caméras, écrans, projections', xp: 15, category: 'technical' },
        { id: 'systemes_lumieres', label: 'Gestion de l\'éclairage et effets', description: 'Ambiances, spots, effets spéciaux', xp: 15, category: 'technical' },
        { id: 'mecanismes_salles', label: 'Compréhension des mécanismes des salles', description: 'Portes, tiroirs, capteurs, vérins', xp: 20, category: 'mechanics' },
        { id: 'reset_salles', label: 'Procédures de reset des salles', description: 'Remise en état entre les sessions', xp: 15, category: 'operations' },
        { id: 'indices_progressifs', label: 'Système d\'indices progressifs', description: 'Quand et comment donner des indices', xp: 20, category: 'guidance' },
        { id: 'gestion_temps', label: 'Gestion du timing et du chrono', description: 'Rythme du jeu et gestion des 60 minutes', xp: 15, category: 'timing' },
        { id: 'situations_blocage', label: 'Gestion des situations de blocage', description: 'Débloquer sans casser l\'immersion', xp: 20, category: 'problem_solving' },
        { id: 'maintenance_base', label: 'Maintenance de base des équipements', description: 'Entretien quotidien et petites réparations', xp: 15, category: 'maintenance' },
        { id: 'protocoles_securite', label: 'Protocoles de sécurité en salle', description: 'Surveillance et intervention d\'urgence', xp: 20, category: 'safety' },
        { id: 'outils_monitoring', label: 'Utilisation des outils de monitoring', description: 'Écrans de contrôle et interfaces de pilotage', xp: 15, category: 'monitoring' },
        { id: 'personnalisation_experience', label: 'Personnalisation de l\'expérience client', description: 'Adapter selon le groupe et l\'occasion', xp: 25, category: 'customization' },
        { id: 'test_complet_game_master', label: '🎯 Test pratique Game Master', description: 'Validation complète de tes compétences techniques', xp: 30, category: 'validation' }
      ]
    },

    // Phase 3: Relation client et animation (12 tâches)
    relation_client: {
      title: '👥 Relation client et animation',
      description: 'Développe tes compétences relationnelles pour créer des moments inoubliables.',
      color: 'from-green-500 to-emerald-500',
      order: 3,
      xp: 300,
      tasks: [
        { id: 'accueil_chaleureux', label: 'Techniques d\'accueil chaleureux et professionnel', description: 'Art de recevoir et mettre à l\'aise', xp: 25, category: 'hospitality' },
        { id: 'briefing_equipes', label: 'Briefing des équipes avant le jeu', description: 'Présentation des règles et mise en contexte', xp: 30, category: 'briefing' },
        { id: 'gestion_stress', label: 'Gestion du stress des participants', description: 'Techniques pour rassurer et motiver', xp: 25, category: 'psychology' },
        { id: 'animation_groupe', label: 'Techniques d\'animation de groupe', description: 'Dynamiser et fédérer les équipes', xp: 30, category: 'animation' },
        { id: 'communication_non_verbale', label: 'Maîtrise de la communication non-verbale', description: 'Gestuelle, posture, présence scénique', xp: 20, category: 'communication' },
        { id: 'gestion_conflits', label: 'Gestion des conflits et tensions', description: 'Désamorcer les situations difficiles', xp: 25, category: 'conflict_resolution' },
        { id: 'debriefing_final', label: 'Debriefing et feedback après la session', description: 'Conclure sur une note positive et constructive', xp: 25, category: 'closure' },
        { id: 'satisfaction_client', label: 'Mesure et amélioration de la satisfaction', description: 'Recueil et analyse des retours clients', xp: 20, category: 'feedback' },
        { id: 'vente_additionnelle', label: 'Techniques de vente additionnelle', description: 'Proposer des services complémentaires', xp: 25, category: 'sales' },
        { id: 'gestion_planning', label: 'Gestion du planning et des rotations', description: 'Organisation des créneaux et optimisation', xp: 20, category: 'planning' },
        { id: 'evenements_speciaux', label: 'Animation d\'événements spéciaux', description: 'Anniversaires, team building, événements corporate', xp: 25, category: 'events' },
        { id: 'test_complet_animation', label: '🎯 Test pratique Animation', description: 'Validation de tes compétences relationnelles', xp: 30, category: 'validation' }
      ]
    },

    // Phase 4: Entretiens avec le référent (15 tâches)
    entretiens_referent: {
      title: '🎯 Entretiens avec le référent',
      description: 'Suivi personnalisé de ta progression avec ton référent tout au long du mois.',
      color: 'from-orange-500 to-red-500',
      order: 4,
      xp: 375,
      tasks: [
        { id: 'entretien_j1', label: 'Entretien J+1 : Premières impressions', description: 'Bilan du premier jour et ressentis', xp: 20, category: 'feedback' },
        { id: 'entretien_j3', label: 'Entretien J+3 : Adaptation équipe', description: 'Intégration dans l\'équipe et premiers contacts', xp: 20, category: 'integration' },
        { id: 'entretien_s1', label: 'Entretien Semaine 1 : Bilan technique', description: 'Évaluation des acquis techniques', xp: 25, category: 'technical' },
        { id: 'entretien_s2', label: 'Entretien Semaine 2 : Autonomie progressive', description: 'Développement de l\'autonomie', xp: 25, category: 'autonomy' },
        { id: 'entretien_s3', label: 'Entretien Semaine 3 : Maîtrise client', description: 'Compétences en relation client', xp: 30, category: 'customer' },
        { id: 'entretien_s4', label: 'Entretien Semaine 4 : Bilan final', description: 'Évaluation complète et perspectives', xp: 35, category: 'evaluation' },
        { id: 'objectifs_personnalises', label: 'Définition d\'objectifs personnalisés', description: 'Objectifs adaptés à ton profil', xp: 20, category: 'goals' },
        { id: 'plan_developpement', label: 'Plan de développement personnel', description: 'Axes d\'amélioration et formation', xp: 25, category: 'development' },
        { id: 'feedback_360', label: 'Feedback 360° équipe', description: 'Retours de tous les membres de l\'équipe', xp: 30, category: 'feedback' },
        { id: 'auto_evaluation', label: 'Auto-évaluation des compétences', description: 'Analyse personnelle de ta progression', xp: 20, category: 'self-assessment' },
        { id: 'points_forts', label: 'Identification des points forts', description: 'Reconnaissance de tes talents naturels', xp: 25, category: 'strengths' },
        { id: 'axes_amelioration', label: 'Définition des axes d\'amélioration', description: 'Points à travailler pour progresser', xp: 25, category: 'improvement' },
        { id: 'plan_carriere', label: 'Discussion sur ton plan de carrière', description: 'Perspectives d\'évolution chez Brain', xp: 30, category: 'career' },
        { id: 'engagement_equipe', label: 'Engagement et motivation équipe', description: 'Ton rôle dans la dynamique collective', xp: 25, category: 'engagement' },
        { id: 'bilan_final_formation', label: 'Bilan final de formation', description: 'Synthèse complète et certification', xp: 40, category: 'certification' }
      ]
    },

    // Phase 5: Spécialisations avancées (18 tâches)
    specialisations: {
      title: '🏆 Spécialisations avancées',
      description: 'Deviens expert dans des domaines spécialisés selon tes affinités.',
      color: 'from-yellow-500 to-orange-500',
      order: 5,
      xp: 540,
      tasks: [
        // 🧠 LASER GAME (6 tâches)
        { id: 'laser_regles', label: '🔫 Laser Game - Règles et équipements', description: 'Maîtriser le matériel et les règles du laser game', xp: 30, category: 'laser' },
        { id: 'laser_scenarios', label: '🔫 Laser Game - Scénarios et modes de jeu', description: 'Différents modes : élimination, capture, VIP, etc.', xp: 30, category: 'laser' },
        { id: 'laser_animation', label: '🔫 Laser Game - Animation et coaching', description: 'Motiver les équipes et créer une ambiance épique', xp: 35, category: 'laser' },
        { id: 'laser_arbitrage', label: '🔫 Laser Game - Arbitrage et fair-play', description: 'Gérer les conflits et assurer l\'équité', xp: 30, category: 'laser' },
        { id: 'laser_technique', label: '🔫 Laser Game - Maintenance technique', description: 'Entretien des équipements et résolution des pannes', xp: 25, category: 'laser' },
        { id: 'laser_evenements', label: '🔫 Laser Game - Événements et tournois', description: 'Organisation de compétitions et événements spéciaux', xp: 35, category: 'laser' },
        
        // 🏹 ARCHERY GAME (6 tâches) 
        { id: 'archery_securite', label: '🏹 Archery Game - Sécurité et protection', description: 'Protocoles de sécurité stricts avec les arcs', xp: 35, category: 'archery' },
        { id: 'archery_technique', label: '🏹 Archery Game - Technique de tir', description: 'Enseigner la posture et la visée correctes', xp: 30, category: 'archery' },
        { id: 'archery_jeux', label: '🏹 Archery Game - Jeux et défis', description: 'Variété de jeux : cibles, ballons, combat, précision', xp: 35, category: 'archery' },
        { id: 'archery_animation', label: '🏹 Archery Game - Animation de groupe', description: 'Créer une ambiance médiévale et épique', xp: 30, category: 'archery' },
        { id: 'archery_materiel', label: '🏹 Archery Game - Gestion du matériel', description: 'Entretien des arcs, flèches et équipements', xp: 25, category: 'archery' },
        { id: 'archery_evenements', label: '🏹 Archery Game - Événements spéciaux', description: 'Tournois médiévaux et animations thématiques', xp: 30, category: 'archery' },
        
        // 🎪 ÉVÉNEMENTS SPÉCIAUX (6 tâches)
        { id: 'events_planification', label: '🎪 Événements - Planification et logistique', description: 'Organiser des événements de A à Z', xp: 35, category: 'events' },
        { id: 'events_animation', label: '🎪 Événements - Animation et spectacle', description: 'Créer du spectacle et de l\'émerveillement', xp: 40, category: 'events' },
        { id: 'events_technique', label: '🎪 Événements - Setup technique avancé', description: 'Installation sono, éclairage, décors', xp: 30, category: 'events' },
        { id: 'events_coordination', label: '🎪 Événements - Coordination équipes', description: 'Manager une équipe lors d\'événements', xp: 35, category: 'events' },
        { id: 'events_client', label: '🎪 Événements - Relation client premium', description: 'Gérer les clients VIP et entreprises', xp: 35, category: 'events' },
        { id: 'events_urgence', label: '🎪 Événements - Gestion d\'urgence', description: 'Protocoles d\'urgence spécifiques aux grands événements', xp: 40, category: 'events' }
      ]
    }
  }
};

// ==========================================
// 🛠️ FONCTIONS UTILITAIRES
// ==========================================

const showNotification = (message, type = 'info') => {
  // Créer une notification moderne
  const notification = document.createElement('div');
  notification.style.cssText = 
    'position: fixed;' +
    'top: 20px;' +
    'right: 20px;' +
    'background: linear-gradient(135deg, ' + (type === 'success' ? '#10b981, #059669' : type === 'error' ? '#ef4444, #dc2626' : '#3b82f6, #1d4ed8') + ');' +
    'color: white;' +
    'padding: 16px 24px;' +
    'border-radius: 12px;' +
    'z-index: 10000;' +
    'font-family: system-ui;' +
    'font-weight: 600;' +
    'box-shadow: 0 8px 32px rgba(0,0,0,0.3);' +
    'transform: translateX(100%);' +
    'transition: transform 0.3s ease;' +
    'max-width: 400px;' +
    'font-size: 14px;' +
    'border: 1px solid rgba(255,255,255,0.2);';
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  notification.innerHTML = 
    '<div style="display: flex; align-items: center; gap: 8px;">' +
    '<span style="font-size: 16px;">' + icon + '</span>' +
    '<span>' + message + '</span>' +
    '</div>';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, type === 'success' ? 4000 : 6000);
};

// ==========================================
// 🎯 COMPOSANT PRINCIPAL
// ==========================================
const OnboardingPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [formationData, setFormationData] = useState(BRAIN_FORMATION_DATA);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [completedTasksHistory, setCompletedTasksHistory] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState('offline');
  const [lastSaved, setLastSaved] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['decouverte_brain']));
  const [activeTab, setActiveTab] = useState('formation');
  
  // Références
  const saveTimeoutRef = useRef(null);
  const firebaseRestService = useRef(createFirebaseRestService()).current;

  // 📥 CHARGEMENT INITIAL
  useEffect(() => {
    if (user?.uid) {
      loadProgress();
    }
    
    const handleDashboardRefresh = (event) => {
      console.log('📢 [ONBOARDING] Événement dashboard refresh reçu:', event.detail);
      if (event.detail?.userId === user?.uid) {
        setTimeout(loadProgress, 1000);
      }
    };
    
    window.addEventListener('forceDashboardRefresh', handleDashboardRefresh);
    
    return () => {
      window.removeEventListener('forceDashboardRefresh', handleDashboardRefresh);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [user?.uid]);

  // 📖 CHARGER LA PROGRESSION
  const loadProgress = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setSyncStatus('syncing');
      
      console.log('📖 [ONBOARDING] Chargement progression pour:', user.uid);
      
      const userProgressRef = doc(db, 'userProgress', user.uid);
      const progressDoc = await getDoc(userProgressRef);
      
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        console.log('✅ [ONBOARDING] Données chargées:', data);
        
        if (data.onboardingTasks) {
          const completedTasksSet = new Set(Object.keys(data.onboardingTasks).filter(taskId => data.onboardingTasks[taskId]?.completed));
          setCompletedTasks(completedTasksSet);
          setCompletedTasksHistory(completedTasksSet);
          console.log('📋 [ONBOARDING] Tâches complétées:', Array.from(completedTasksSet));
        }
        
        setSyncStatus('online');
        setLastSaved(new Date());
      } else {
        console.log('📝 [ONBOARDING] Aucune progression trouvée, création...');
        await saveProgressToFirebase();
      }
      
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur chargement:', error);
      setSyncStatus('offline');
      showNotification('Erreur de connexion, mode hors ligne activé', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 💾 SAUVEGARDER LA PROGRESSION
  const saveProgressToFirebase = async () => {
    if (!user?.uid || saving) return;

    try {
      setSaving(true);
      setSyncStatus('syncing');
      
      console.log('💾 [ONBOARDING] Sauvegarde...');
      
      const allTasks = Object.values(formationData.sections).flatMap(section => section.tasks);
      const earnedXP = Array.from(completedTasks).reduce((total, taskId) => {
        const task = allTasks.find(t => t.id === taskId);
        return total + (task?.xp || 0);
      }, 0);
      
      const progressData = {
        onboardingTasks: Object.fromEntries(
          allTasks.map(task => [
            task.id, 
            {
              id: task.id,
              completed: completedTasks.has(task.id),
              completedAt: completedTasks.has(task.id) ? new Date().toISOString() : null,
              xp: task.xp
            }
          ])
        ),
        onboardingStats: {
          totalTasks: allTasks.length,
          completedTasks: completedTasks.size,
          earnedXP,
          progressPercentage: Math.round((completedTasks.size / allTasks.length) * 100),
          lastUpdate: new Date().toISOString()
        }
      };

      // Tentative sauvegarde Firebase SDK
      try {
        const userProgressRef = doc(db, 'userProgress', user.uid);
        await updateDoc(userProgressRef, progressData);
        console.log('✅ [ONBOARDING] Sauvegarde SDK réussie');
        setSyncStatus('online');
        setLastSaved(new Date());
      } catch (sdkError) {
        console.warn('⚠️ [ONBOARDING] SDK failed, trying REST...', sdkError);
        
        if (firebaseRestService) {
          const restSuccess = await firebaseRestService.saveDocument('userProgress', user.uid, progressData);
          if (restSuccess) {
            console.log('✅ [ONBOARDING] Sauvegarde REST réussie');
            setSyncStatus('online');
            setLastSaved(new Date());
          } else {
            throw new Error('REST API failed');
          }
        } else {
          throw new Error('No REST service available');
        }
      }

      // Émettre événement pour le dashboard
      window.dispatchEvent(new CustomEvent('onboardingProgressUpdate', {
        detail: { userId: user.uid, progress: progressData }
      }));
      
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur sauvegarde complète:', error);
      setSyncStatus('offline');
      showNotification('Sauvegarde impossible, vos données sont conservées localement', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 🔄 BASCULER UNE TÂCHE
  const toggleTaskCompletion = (taskId) => {
    console.log('🔄 [ONBOARDING] Toggle task:', taskId);
    
    const newCompletedTasks = new Set(completedTasks);
    const wasCompleted = completedTasks.has(taskId);
    
    if (wasCompleted) {
      newCompletedTasks.delete(taskId);
      showNotification('Tâche décochée', 'info');
    } else {
      newCompletedTasks.add(taskId);
      
      const allTasks = Object.values(formationData.sections).flatMap(section => section.tasks);
      const task = allTasks.find(t => t.id === taskId);
      
      if (task) {
        setCompletedTasksHistory(prev => new Set([...prev, taskId]));
        showNotification(`🎉 +${task.xp} XP - ${task.label}`, 'success');
      }
    }
    
    setCompletedTasks(newCompletedTasks);
    
    // Sauvegarde différée
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(saveProgressToFirebase, 1000);
  };

  // 📊 CALCULS DE PROGRESSION
  const allTasks = Object.values(formationData.sections).flatMap(section => section.tasks);
  const totalTasks = allTasks.length;
  const completedCount = completedTasks.size;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const earnedXP = Array.from(completedTasksHistory).reduce((total, taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    return total + (task?.xp || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement de votre formation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 🏢 EN-TÊTE PRINCIPAL */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              {formationData.title}
            </h1>
            <p className="text-gray-300 text-xl mb-6 max-w-2xl mx-auto">
              {formationData.description}
            </p>
            
            {/* Statut de synchronisation */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                syncStatus === 'online' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                syncStatus === 'syncing' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                'bg-gray-500/20 text-gray-300 border-gray-500/30'
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

            {/* 📊 NAVIGATION PAR ONGLETS */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2">
                <div className="flex space-x-2">
                  {[
                    { id: 'formation', name: 'Ma Formation', icon: Book },
                    { id: 'competences', name: 'Compétences', icon: Target },
                    { id: 'entretiens', name: 'Entretiens', icon: Users }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>
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
                  animate={{ width: progressPercentage + '%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>{progressPercentage.toFixed(1)}% terminé</span>
                <span>Durée estimée: {formationData.estimatedDuration}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 📋 CONTENU SELON L'ONGLET ACTIF */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'formation' && (
            <div className="space-y-6">
              {Object.entries(formationData.sections).map(([sectionId, section]) => {
                const sectionCompleted = section.tasks.filter(task => completedTasks.has(task.id)).length;
                const sectionTotal = section.tasks.length;
                const sectionProgress = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0;
                const isExpanded = expandedSections.has(sectionId);

                return (
                  <motion.div
                    key={sectionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: section.order * 0.1 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
                  >
                    {/* En-tête de section */}
                    <div 
                      className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-700/20 rounded-lg p-3 -m-3 transition-colors"
                      onClick={() => {
                        const newExpanded = new Set(expandedSections);
                        if (isExpanded) {
                          newExpanded.delete(sectionId);
                        } else {
                          newExpanded.add(sectionId);
                        }
                        setExpandedSections(newExpanded);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                          <span className="text-2xl">{section.title.match(/🧠|🎮|👥|🎯|🏆/)?.[0] || '📋'}</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">{section.title}</h4>
                          <p className="text-gray-400 text-sm">{section.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">{sectionProgress}%</div>
                          <div className="text-gray-400 text-sm">{sectionCompleted}/{sectionTotal} tâches</div>
                        </div>
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="bg-gray-700/50 rounded-full h-2 mb-4">
                      <div 
                        className={`bg-gradient-to-r ${section.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${sectionProgress}%` }}
                      />
                    </div>

                    {/* Badge et XP */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-400">{section.xp} XP total</span>
                      </div>
                    </div>

                    {/* Liste des tâches */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          {section.tasks.map((task) => {
                            const isCompleted = completedTasks.has(task.id);
                            return (
                              <motion.div
                                key={task.id}
                                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                                  isCompleted 
                                    ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                                    : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                                }`}
                                onClick={() => toggleTaskCompletion(task.id)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="flex-shrink-0">
                                    {isCompleted ? (
                                      <CheckSquare className="w-6 h-6 text-green-400" />
                                    ) : (
                                      <Square className="w-6 h-6 text-gray-400 hover:text-white" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h5 className={`font-medium transition-colors ${
                                      isCompleted ? 'text-green-300 line-through' : 'text-white'
                                    }`}>
                                      {task.label}
                                    </h5>
                                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-yellow-400" />
                                      <span className="text-yellow-400 font-medium">{task.xp} XP</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'competences' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              <div className="text-center mb-8">
                <Target className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">🎯 Tes Compétences</h2>
                <p className="text-gray-400 mb-6">
                  Évaluation de tes compétences développées au cours de ta formation.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {[
                    { 
                      title: 'Maîtrise technique', 
                      icon: '🛠️', 
                      progress: Math.floor((completedTasksHistory.size / totalTasks) * 100),
                      description: 'Systèmes, caméras, audio, reset des salles'
                    },
                    { 
                      title: 'Animation client', 
                      icon: '🎭', 
                      progress: Math.floor((completedTasksHistory.size / totalTasks) * 70),
                      description: 'Accueil, briefing, gestion de groupe'
                    },
                    { 
                      title: 'Gestion d\'urgence', 
                      icon: '🚨', 
                      progress: Math.floor((completedTasksHistory.size / totalTasks) * 50),
                      description: 'Protocoles de sécurité et situations critiques'
                    }
                  ].map((skill, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
                      <div className="text-3xl mb-3">{skill.icon}</div>
                      <h3 className="text-lg font-semibold text-white mb-2">{skill.title}</h3>
                      <p className="text-sm text-gray-400 mb-4">{skill.description}</p>
                      
                      <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: skill.progress + '%' }}
                        />
                      </div>
                      <div className="text-sm text-gray-400">{skill.progress}% maîtrisé</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entretiens' && (
            <InterviewIntegration />
          )}
        </div>

        {/* Bouton de sauvegarde manuelle */}
        <motion.div
          className="fixed bottom-6 right-6"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button
            onClick={saveProgressToFirebase}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white p-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
            title="Sauvegarder maintenant"
          >
            {saving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;
