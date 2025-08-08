// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// VERSION CORRIGÉE POUR LE BUILD - SYNTAXE JAVASCRIPT VALIDE
// ==========================================

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

// 🔥 IMPORT MINIMAL FIREBASE (JUSTE POUR AUTH)
import { getAuth } from 'firebase/auth';

// ==========================================
// 📊 DONNÉES DE FORMATION BRAIN COMPLÈTES - 88 TÂCHES
// ==========================================
const BRAIN_FORMATION_DATA = {
  title: "Formation Game Master Brain - Parcours Complet",
  description: "Escape & Quiz Game – 1 mois – coche chaque tâche, gagne des XP et débloque des badges",
  totalXP: 2550,
  estimatedDuration: "3-4 semaines",
  sections: {
    // Phase 1: Découverte de Brain & de l'équipe (20 tâches)
    decouverte_brain: {
      title: '🧠 Découverte de Brain & de l\'équipe',
      description: 'Bienvenue ! Voici tes premières étapes pour te sentir chez toi et découvrir l\'esprit Brain.',
      tasks: [
        { id: 'visite_bureau', label: 'Tour des bureaux avec ton référent', description: 'Découverte physique des espaces, présentation équipes', xp: 20, category: 'discovery' },
        { id: 'presentation_equipe', label: 'Présentation à l\'équipe', description: 'Rencontrer tes futurs collègues et te présenter', xp: 25, category: 'social' },
        { id: 'acces_outils', label: 'Accès aux outils Brain (PC, badgeuse, etc.)', description: 'Configuration de ton poste de travail', xp: 30, category: 'tools' },
        { id: 'presentation_culture', label: 'Présentation de la culture et des valeurs Brain', description: 'Découvrir l\'ADN de l\'entreprise', xp: 25, category: 'culture' },
        { id: 'questions_generales', label: 'Temps pour poser tes questions générales', description: 'Moment d\'échange libre avec ton référent', xp: 20, category: 'social' },
        { id: 'visite_locaux_complete', label: 'Visite complète des locaux Brain', description: 'Tour détaillé de tous les espaces', xp: 15, category: 'discovery' },
        { id: 'rencontre_direction', label: 'Rencontre avec la direction', description: 'Présentation officielle à l\'équipe dirigeante', xp: 20, category: 'social' },
        { id: 'comprendre_missions', label: 'Comprendre les missions de Brain', description: 'Vue d\'ensemble des activités et projets', xp: 25, category: 'knowledge' },
        { id: 'decouverte_clients', label: 'Découverte des principaux clients', description: 'Présentation du portefeuille client', xp: 20, category: 'business' },
        { id: 'formation_securite', label: 'Formation sécurité et procédures d\'urgence', description: 'Règles de sécurité et évacuation', xp: 15, category: 'safety' },
        { id: 'reglement_interieur', label: 'Lecture du règlement intérieur', description: 'Prise de connaissance des règles internes', xp: 10, category: 'legal' },
        { id: 'horaires_pauses', label: 'Informations horaires et pauses', description: 'Organisation du temps de travail', xp: 10, category: 'organization' },
        { id: 'materiel_fourni', label: 'Remise du matériel et équipements', description: 'Attribution des outils de travail', xp: 15, category: 'tools' },
        { id: 'badge_acces', label: 'Création du badge d\'accès', description: 'Configuration des droits d\'accès', xp: 10, category: 'security' },
        { id: 'comptes_numeriques', label: 'Création des comptes numériques', description: 'Accès aux plateformes et outils', xp: 20, category: 'digital' },
        { id: 'formation_synergia', label: 'Formation à Synergia', description: 'Maîtrise de la plateforme principale', xp: 30, category: 'platform' },
        { id: 'test_connexions', label: 'Test de toutes les connexions', description: 'Vérification des accès systèmes', xp: 15, category: 'technical' },
        { id: 'premier_pointage', label: 'Premier pointage badgeuse', description: 'Test du système de pointage', xp: 10, category: 'routine' },
        { id: 'photo_trombi', label: 'Photo pour le trombinoscope', description: 'Photo officielle pour les documents', xp: 5, category: 'admin' },
        { id: 'contact_urgence', label: 'Coordonnées de contact d\'urgence', description: 'Information des contacts en cas d\'urgence', xp: 5, category: 'safety' }
      ]
    },

    // Phase 2: Formation technique escape game (28 tâches)
    formation_technique: {
      title: '🎮 Formation technique escape game',
      description: 'Maîtrise les aspects techniques de nos escape games : mécaniques, énigmes, scénarios.',
      tasks: [
        { id: 'mecaniques_jeu', label: 'Comprendre les mécaniques de jeu de chaque escape', description: 'Étude détaillée de chaque salle et ses mécanismes', xp: 35, category: 'gameplay' },
        { id: 'scenarios_enigmes', label: 'Mémoriser les scénarios et énigmes', description: 'Apprentissage des histoires et solutions', xp: 40, category: 'content' },
        { id: 'manipulation_objets', label: 'Savoir manipuler et réinitialiser les objets/mécanismes', description: 'Formation pratique sur la réinitialisation', xp: 35, category: 'technical' },
        { id: 'troubleshooting', label: 'Troubleshooting : que faire si quelque chose ne marche pas', description: 'Procédures de dépannage et contact support', xp: 40, category: 'support' },
        
        // 🏥 SALLE PSYCHIATRIC (7 tâches)
        { id: 'psychiatric_scenario', label: '🏥 Psychiatric - Scénario et histoire', description: 'Maîtriser l\'univers psychiatrique et l\'intrigue principale', xp: 30, category: 'psychiatric' },
        { id: 'psychiatric_enigmes', label: '🏥 Psychiatric - Énigmes et puzzles', description: 'Connaître toutes les énigmes et leurs solutions', xp: 35, category: 'psychiatric' },
        { id: 'psychiatric_camera', label: '🏥 Psychiatric - Surveillance caméra', description: 'Maîtriser les angles de vue et le monitoring', xp: 20, category: 'psychiatric' },
        { id: 'psychiatric_audio', label: '🏥 Psychiatric - Effets sonores et ambiance', description: 'Gérer l\'atmosphère sonore de la salle', xp: 25, category: 'psychiatric' },
        { id: 'psychiatric_indices', label: '🏥 Psychiatric - Système d\'indices', description: 'Savoir donner les bons indices au bon moment', xp: 30, category: 'psychiatric' },
        { id: 'psychiatric_reset', label: '🏥 Psychiatric - Procédure de reset', description: 'Remettre la salle en état initial rapidement', xp: 25, category: 'psychiatric' },
        { id: 'psychiatric_urgence', label: '🏥 Psychiatric - Gestion situations d\'urgence', description: 'Protocoles en cas de panique ou problème', xp: 35, category: 'psychiatric' },
        
        // 🔒 SALLE PRISON (7 tâches)  
        { id: 'prison_scenario', label: '🔒 Prison - Scénario et histoire', description: 'Maîtriser l\'univers carcéral et l\'intrigue d\'évasion', xp: 30, category: 'prison' },
        { id: 'prison_enigmes', label: '🔒 Prison - Énigmes et mécanismes', description: 'Connaître tous les puzzles et serrures', xp: 35, category: 'prison' },
        { id: 'prison_camera', label: '🔒 Prison - Surveillance et monitoring', description: 'Contrôler les caméras comme un gardien', xp: 20, category: 'prison' },
        { id: 'prison_alerte', label: '🔒 Prison - Système d\'alerte', description: 'Gérer les alarmes et effets d\'urgence', xp: 25, category: 'prison' },
        { id: 'prison_cellules', label: '🔒 Prison - Mécanismes des cellules', description: 'Ouverture/fermeture des cellules et passages', xp: 30, category: 'prison' },
        { id: 'prison_evasion', label: '🔒 Prison - Scénario d\'évasion', description: 'Orchestrer le timing de l\'évasion', xp: 35, category: 'prison' },
        { id: 'prison_reset', label: '🔒 Prison - Remise en état', description: 'Reset complet de tous les mécanismes', xp: 25, category: 'prison' },
        
        // 🕺 SALLE BACK TO THE 80'S (7 tâches)
        { id: 'back80s_scenario', label: '🕺 Back to 80\'s - Scénario et époque', description: 'Immersion complète dans les années 80', xp: 30, category: 'back80s' },
        { id: 'back80s_musique', label: '🕺 Back to 80\'s - Playlist et ambiance musicale', description: 'Gérer la bande son et l\'ambiance rétro', xp: 25, category: 'back80s' },
        { id: 'back80s_objets', label: '🕺 Back to 80\'s - Objets et accessoires vintage', description: 'Connaître tous les objets et leur utilisation', xp: 30, category: 'back80s' },
        { id: 'back80s_enigmes', label: '🕺 Back to 80\'s - Énigmes rétro', description: 'Maîtriser les puzzles inspirés des années 80', xp: 35, category: 'back80s' },
        { id: 'back80s_culture', label: '🕺 Back to 80\'s - Culture et références', description: 'Connaître les références culturelles de l\'époque', xp: 20, category: 'back80s' },
        { id: 'back80s_disco', label: '🕺 Back to 80\'s - Animation disco et fun', description: 'Créer l\'ambiance festive des années 80', xp: 25, category: 'back80s' },
        { id: 'back80s_nostalgie', label: '🕺 Back to 80\'s - Immersion nostalgique', description: 'Faire vivre l\'époque aux participants', xp: 35, category: 'back80s' },
        
        // 🛠️ FORMATION TECHNIQUE GÉNÉRALE (6 tâches)
        { id: 'surveillance_cameras', label: 'Surveillance par caméras', description: 'Utilisation du système de monitoring', xp: 20, category: 'monitoring' },
        { id: 'audio_ambiance', label: 'Gestion audio et ambiance', description: 'Contrôle des effets sonores et lumières', xp: 20, category: 'atmosphere' },
        { id: 'reset_rapide', label: 'Procédure de reset rapide', description: 'Remise en état entre les sessions', xp: 25, category: 'operations' },
        { id: 'maintenance_preventive', label: 'Maintenance préventive quotidienne', description: 'Vérifications et entretien régulier', xp: 20, category: 'maintenance' },
        { id: 'gestion_pannes', label: 'Gestion des pannes courantes', description: 'Résolution des problèmes fréquents', xp: 30, category: 'troubleshooting' },
        { id: 'integration_complete', label: 'Intégration technique complète', description: 'Maîtrise globale de tous les systèmes', xp: 35, category: 'mastery' }
      ]
    },

    // Phase 3: Accueil et gestion client + Quiz Game (25 tâches)
    accueil_client: {
      title: '👥 Accueil et gestion client + Quiz Game',
      description: 'Apprends à créer une expérience client exceptionnelle du premier contact à la sortie + maîtrise du Quiz Game.',
      tasks: [
        { id: 'accueil_telephonique', label: 'Maîtriser l\'accueil téléphonique', description: 'Techniques de réception et information client', xp: 25, category: 'phone' },
        { id: 'presentation_activites', label: 'Présenter les activités Brain', description: 'Pitch commercial des différentes offres', xp: 30, category: 'presentation' },
        { id: 'gestion_reservations', label: 'Gérer les réservations et plannings', description: 'Système de booking et disponibilités', xp: 35, category: 'booking' },
        { id: 'briefing_equipes', label: 'Briefing des équipes avant le jeu', description: 'Explication des règles et immersion', xp: 40, category: 'briefing' },
        { id: 'gestion_conflits', label: 'Gérer les conflits et réclamations', description: 'Résolution diplomatique des problèmes', xp: 35, category: 'conflict' },
        { id: 'animations_attente', label: 'Animer les temps d\'attente', description: 'Divertir les clients en cas de retard', xp: 20, category: 'entertainment' },
        { id: 'debriefing_post_jeu', label: 'Debriefing post-jeu', description: 'Retour d\'expérience avec les participants', xp: 30, category: 'debrief' },
        { id: 'vente_additionnelle', label: 'Techniques de vente additionnelle', description: 'Proposition de services complémentaires', xp: 25, category: 'sales' },
        { id: 'photos_souvenirs', label: 'Gestion photos souvenirs', description: 'Prise de photos et proposition d\'achat', xp: 15, category: 'memories' },
        { id: 'accueil_groupes_enfants', label: 'Accueil spécifique groupes d\'enfants', description: 'Adaptation pour le jeune public', xp: 25, category: 'children' },
        { id: 'accueil_entreprises', label: 'Accueil des groupes d\'entreprises', description: 'Team building et événements corporate', xp: 30, category: 'corporate' },
        { id: 'gestion_celebrations', label: 'Gestion des célébrations (anniversaires, etc.)', description: 'Événements spéciaux et animations', xp: 20, category: 'events' },
        { id: 'protocole_urgence_client', label: 'Protocoles d\'urgence avec clients', description: 'Gestion des situations d\'urgence', xp: 30, category: 'emergency' },
        
        // 🧠 QUIZ GAME (12 tâches)
        { id: 'quiz_regles', label: '🧠 Quiz Game - Règles et fonctionnement', description: 'Maîtriser toutes les règles du quiz interactif', xp: 30, category: 'quiz' },
        { id: 'quiz_categories', label: '🧠 Quiz Game - Catégories et thèmes', description: 'Connaître toutes les catégories de questions', xp: 25, category: 'quiz' },
        { id: 'quiz_difficultes', label: '🧠 Quiz Game - Niveaux de difficulté', description: 'Adapter la difficulté selon les groupes', xp: 25, category: 'quiz' },
        { id: 'quiz_animation', label: '🧠 Quiz Game - Animation et énergie', description: 'Créer une ambiance dynamique et fun', xp: 35, category: 'quiz' },
        { id: 'quiz_technique', label: '🧠 Quiz Game - Système technique', description: 'Maîtriser les buzzers et l\'interface', xp: 30, category: 'quiz' },
        { id: 'quiz_scoring', label: '🧠 Quiz Game - Système de points', description: 'Gérer les scores et classements', xp: 20, category: 'quiz' },
        { id: 'quiz_equipes', label: '🧠 Quiz Game - Formation des équipes', description: 'Équilibrer les équipes pour plus de fun', xp: 25, category: 'quiz' },
        { id: 'quiz_final', label: '🧠 Quiz Game - Manche finale épique', description: 'Orchestrer un final mémorable', xp: 35, category: 'quiz' },
        { id: 'quiz_ambiance', label: '🧠 Quiz Game - Musique et effets', description: 'Gérer l\'ambiance sonore et visuelle', xp: 25, category: 'quiz' },
        { id: 'quiz_podium', label: '🧠 Quiz Game - Cérémonie de remise des prix', description: 'Créer un moment de célébration', xp: 30, category: 'quiz' },
        { id: 'quiz_personnalisation', label: '🧠 Quiz Game - Personnalisation selon événement', description: 'Adapter le quiz selon l\'occasion', xp: 25, category: 'quiz' },
        { id: 'quiz_improvisation', label: '🧠 Quiz Game - Improvisation et rebondissements', description: 'Gérer les imprévus avec humour', xp: 35, category: 'quiz' }
      ]
    },

    // Phase 4: Entretiens avec le référent (15 tâches)
    entretiens_referent: {
      title: '🎯 Entretiens avec le référent',
      description: 'Suivi personnalisé de ta progression avec ton référent tout au long du mois.',
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
        { id: 'points_forts', label: 'Identification des points forts', description: 'Reconnaissance de tes talents naturels', xp: 15, category: 'strengths' },
        { id: 'axes_amelioration', label: 'Axes d\'amélioration', description: 'Zones de développement prioritaires', xp: 20, category: 'improvement' },
        { id: 'projection_carriere', label: 'Projection de carrière chez Brain', description: 'Évolution possible et ambitions', xp: 25, category: 'career' },
        { id: 'validation_competences', label: 'Validation finale des compétences', description: 'Certification de tes acquis', xp: 30, category: 'certification' },
        { id: 'integration_reussie', label: 'Validation intégration réussie', description: 'Confirmation de la réussite du parcours', xp: 40, category: 'success' }
      ]
    }
  }
};

// 🛡️ SERVICE REST API FIREBASE - VERSION SIMPLIFIÉE POUR LE BUILD
const createFirebaseRestService = () => {
  return {
    PROJECT_ID: 'synergia-app-f27e7',
    BASE_URL: 'https://firestore.googleapis.com/v1/projects/synergia-app-f27e7/databases/(default)/documents',
    
    async getAuthToken() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Utilisateur non authentifié');
        
        const token = await user.getIdToken();
        return token;
      } catch (error) {
        console.error('❌ [REST] Erreur récupération token:', error);
        throw error;
      }
    },
    
    async saveProgressRest(userId, formationData) {
      try {
        console.log('💾 [REST] Sauvegarde via API REST Firebase...');
        
        const token = await this.getAuthToken();
        const timestamp = new Date().toISOString();
        
        const document = {
          fields: {
            userId: { stringValue: userId },
            formationData: { stringValue: JSON.stringify(formationData) },
            lastUpdated: { stringValue: timestamp },
            savedAt: { timestampValue: timestamp },
            version: { stringValue: '3.5.3' },
            syncId: { integerValue: Date.now().toString() }
          }
        };
        
        const url = this.BASE_URL + '/onboardingProgress/' + userId;
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(document)
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error('HTTP ' + response.status + ': ' + errorData);
        }
        
        const result = await response.json();
        console.log('✅ [REST] Sauvegarde API REST réussie');
        
        return { success: true, data: result };
        
      } catch (error) {
        console.error('❌ [REST] Erreur sauvegarde API REST:', error);
        throw error;
      }
    },
    
    showNotification(message, type) {
      console.log('[' + type.toUpperCase() + '] ' + message);
      
      // Supprimer les notifications existantes
      const existing = document.querySelectorAll('.onboarding-notification');
      existing.forEach(el => el.remove());
      
      // Créer une notification visuelle
      const notification = document.createElement('div');
      notification.className = 'onboarding-notification';
      notification.style.cssText = 
        'position: fixed;' +
        'top: 20px;' +
        'right: 20px;' +
        'background: ' + (type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6') + ';' +
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
      
      // Ajouter une icône selon le type
      const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
      notification.innerHTML = 
        '<div style="display: flex; align-items: center; gap: 8px;">' +
        '<span style="font-size: 16px;">' + icon + '</span>' +
        '<span>' + message + '</span>' +
        '</div>';
      
      document.body.appendChild(notification);
      
      // Animation d'entrée
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);
      
      // Suppression automatique
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, type === 'success' ? 4000 : 6000);
    }
  };
};

// ==========================================
// 🎯 COMPOSANT PRINCIPAL
// ==========================================
const OnboardingPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [formationData, setFormationData] = useState(BRAIN_FORMATION_DATA);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [completedTasksHistory, setCompletedTasksHistory] = useState(new Set()); // 🔒 HISTORIQUE DES TÂCHES DÉJÀ RÉCOMPENSÉES
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState('offline'); // offline, online, syncing
  const [lastSaved, setLastSaved] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['decouverte_brain']));
  
  // Références
  const saveTimeoutRef = useRef(null);
  const firebaseRestService = useRef(createFirebaseRestService()).current;

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
    
    window.addEventListener('forceDashboardRefresh', handleDashboardRefresh);
    
    return () => {
      window.removeEventListener('forceDashboardRefresh', handleDashboardRefresh);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [user?.uid]);

  // 📚 CHARGEMENT DES DONNÉES SAUVEGARDÉES
  const loadProgress = async () => {
    try {
      console.log('🔄 [REST] Chargement progression via stockage local...');
      
      const savedData = localStorage.getItem('onboarding_' + user.uid);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setCompletedTasks(new Set(parsed.completedTasks || []));
        setCompletedTasksHistory(new Set(parsed.completedTasksHistory || [])); // 🔒 CHARGER L'HISTORIQUE
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
      completedTasksHistory: Array.from(completedTasksHistory), // 🔒 SAUVEGARDER L'HISTORIQUE
      lastSaved: Date.now(),
      userId: user.uid
    };
    
    localStorage.setItem('onboarding_' + user.uid, JSON.stringify(progressData));
    setLastSaved(new Date());
    
    // 🔄 DÉCLENCHER ACTUALISATION DASHBOARD
    console.log('🚀 [ONBOARDING] Déclenchement actualisation dashboard...');
    
    const totalXP = calculateEarnedXP(completedTasksHistory); // 🔒 CALCULER AVEC L'HISTORIQUE
    
    // Événement custom pour le dashboard
    const dashboardEvent = new CustomEvent('onboarding-progress-updated', {
      detail: {
        userId: user.uid,
        completedTasks: Array.from(tasks),
        completedTasksHistory: Array.from(completedTasksHistory), // 🔒 ENVOYER L'HISTORIQUE
        earnedXP: totalXP,
        timestamp: Date.now(),
        source: 'onboarding'
      }
    });
    
    window.dispatchEvent(dashboardEvent);
    console.log('📊 [ONBOARDING] Événement dispatché - XP: ' + totalXP + ' (réellement gagnés)');
  };

  // 🎯 CALCULER XP GAGNÉ - AVEC PROTECTION ANTI-FARMING
  const calculateEarnedXP = (tasksSet = completedTasksHistory) => { // 🔒 PAR DÉFAUT UTILISER L'HISTORIQUE
    let totalXP = 0;
    
    Object.values(formationData.sections).forEach(section => {
      section.tasks.forEach(task => {
        if (tasksSet.has(task.id)) {
          totalXP += task.xp;
        }
      });
    });
    
    return totalXP;
  };

  // ✅ MARQUER UNE TÂCHE COMME TERMINÉE - AVEC PROTECTION ANTI-FARMING XP
  const completeTask = (taskId) => {
    const newCompletedTasks = new Set(completedTasks);
    const wasCompleted = newCompletedTasks.has(taskId);
    
    if (wasCompleted) {
      // DÉCOCHER LA TÂCHE
      newCompletedTasks.delete(taskId);
      console.log('🔄 Tâche décochée: ' + taskId + ' (pas de perte d\'XP)');
    } else {
      // COCHER LA TÂCHE
      newCompletedTasks.add(taskId);
      
      // 🔒 VÉRIFIER SI C'EST LA PREMIÈRE FOIS QUE CETTE TÂCHE EST COMPLÉTÉE
      const isFirstTimeCompleted = !completedTasksHistory.has(taskId);
      
      if (isFirstTimeCompleted) {
        // PREMIÈRE FOIS → AJOUTER À L'HISTORIQUE ET GAGNER XP
        const newHistory = new Set(completedTasksHistory);
        newHistory.add(taskId);
        setCompletedTasksHistory(newHistory);
        
        // Trouver la tâche pour afficher les XP gagnés
        const task = Object.values(formationData.sections)
          .flatMap(section => section.tasks)
          .find(t => t.id === taskId);
        
        if (task) {
          console.log('✅ Première completion: ' + task.label + ' → +' + task.xp + ' XP');
          // Afficher notification
          setTimeout(() => {
            firebaseRestService.showNotification('✅ +' + task.xp + ' XP - ' + task.label, 'success');
          }, 100);
        }
      } else {
        // DÉJÀ COMPLÉTÉE AVANT → PAS D'XP
        console.log('🔒 Tâche déjà récompensée: ' + taskId + ' → 0 XP (anti-farming)');
        // Afficher notification anti-farming
        setTimeout(() => {
          firebaseRestService.showNotification('ℹ️ Tâche déjà récompensée (pas de XP supplémentaire)', 'info');
        }, 100);
      }
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
  const earnedXP = calculateEarnedXP(); // 🔒 UTILISE L'HISTORIQUE PAR DÉFAUT

  console.log('📊 Statistiques: ' + completedCount + '/' + totalTasks + ' tâches (' + Math.round(progressPercentage) + '%) - ' + earnedXP + ' XP (réellement gagnés)');

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
              <div className={'flex items-center gap-2 px-3 py-2 rounded-lg ' + (
                syncStatus === 'online' ? 'bg-green-500/20 text-green-300' :
                syncStatus === 'syncing' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-gray-500/20 text-gray-300'
              )}>
                {syncStatus === 'online' ? React.createElement(Wifi, { className: "w-4 h-4" }) :
                 syncStatus === 'syncing' ? React.createElement(RefreshCw, { className: "w-4 h-4 animate-spin" }) :
                 React.createElement(WifiOff, { className: "w-4 h-4" })}
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
                animate={{ width: progressPercentage + '%' }}
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
                          style={{ width: sectionProgress + '%' }}
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
                              className={'p-4 rounded-lg border transition-all cursor-pointer ' + (
                                isCompleted
                                  ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                              )}
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
                                  <h4 className={'font-medium ' + (
                                    isCompleted ? 'text-green-300' : 'text-white'
                                  )}>
                                    {task.label}
                                  </h4>
                                  <p className="text-gray-400 text-sm mt-1">
                                    {task.description}
                                  </p>
                                  {/* 🔒 AFFICHAGE STATUT XP */}
                                  {isCompleted && (
                                    <div className="flex items-center gap-2 mt-2 text-xs">
                                      <CheckCircle className="w-3 h-3" />
                                      <span className={
                                        completedTasksHistory.has(task.id) 
                                          ? 'text-green-400' 
                                          : 'text-blue-400'
                                      }>
                                        {completedTasksHistory.has(task.id) 
                                          ? 'Tâche terminée (+' + task.xp + ' XP)' 
                                          : 'Tâche terminée (déjà récompensée)'
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right">
                                  <div className={'text-lg font-bold ' + (
                                    isCompleted ? 'text-green-400' : 'text-purple-400'
                                  )}>
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
