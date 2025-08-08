// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// VERSION COMPLÈTE CORRIGÉE - SOLUTION API REST FIREBASE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookOpen,
  MessageSquare,
  Brain,
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  Shield,
  Cloud,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';

// 🔥 IMPORT MINIMAL FIREBASE (JUSTE POUR AUTH)
import { getAuth } from 'firebase/auth';

// 🛡️ SERVICE REST API FIREBASE - CONTOURNEMENT DU BUG SDK + SYNC DASHBOARD
const firebaseRestService = {
  PROJECT_ID: 'synergia-app-f27e7',
  // 🔧 CORRECTION: URL corrigée avec le bon endpoint
  BASE_URL: `https://firestore.googleapis.com/v1/projects/synergia-app-f27e7/databases/(default)/documents`,
  
  // 🔑 OBTENIR TOKEN D'AUTHENTIFICATION
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
  
  // 💾 SAUVEGARDE VIA API REST
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
      
      // 🔧 CORRECTION: URL complète avec le bon endpoint
      const url = `${this.BASE_URL}/onboardingProgress/${userId}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(document)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      const result = await response.json();
      console.log('✅ [REST] Sauvegarde API REST réussie');
      
      // 🔧 CORRECTION: Vérifier que showNotification existe avant utilisation
      if (typeof this.showNotification === 'function') {
        this.showNotification('Sauvegardé via API REST !', 'success');
      }
      
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ [REST] Erreur sauvegarde API REST:', error);
      throw error;
    }
  },
  
  // 📥 CHARGEMENT VIA API REST
  async loadProgressRest(userId) {
    try {
      console.log('📥 [REST] Chargement via API REST Firebase...');
      
      const token = await this.getAuthToken();
      // 🔧 CORRECTION: URL complète avec le bon endpoint
      const url = `${this.BASE_URL}/onboardingProgress/${userId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 404) {
        console.log('📝 [REST] Aucune progression trouvée');
        return { success: false, error: 'Document non trouvé' };
      }
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      const result = await response.json();
      
      // 🔧 CORRECTION: Vérification sécurisée des champs
      if (!result.fields || !result.fields.formationData) {
        throw new Error('Structure de document invalide');
      }
      
      // Extraire les données du format Firestore REST
      const formationData = JSON.parse(result.fields.formationData.stringValue);
      const lastUpdated = result.fields.lastUpdated.stringValue;
      
      console.log('✅ [REST] Chargement API REST réussi');
      
      // 🔧 CORRECTION: Vérifier que showNotification existe avant utilisation
      if (typeof this.showNotification === 'function') {
        this.showNotification('Progression chargée via API REST', 'success');
      }
      
      return { 
        success: true, 
        data: formationData,
        lastUpdated: lastUpdated
      };
      
    } catch (error) {
      console.error('❌ [REST] Erreur chargement API REST:', error);
      throw error;
    }
  },
  
  // 🔄 SYNCHRONISATION XP VIA API REST - VERSION CORRIGÉE
  async syncXpRest(userId, earnedXp, completedTasks) {
    try {
      console.log(`🔄 [REST] Synchronisation ${earnedXp} XP via API REST...`);
      
      const token = await this.getAuthToken();
      
      // D'abord lire les données actuelles
      const currentUserUrl = `${this.BASE_URL}/users/${userId}`;
      const currentResponse = await fetch(currentUserUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let currentXp = 0;
      let currentLevel = 1;
      let currentWeeklyXp = 0;
      let currentMonthlyXp = 0;
      let currentTasksCompleted = 0;
      
      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        const gamification = currentData.fields?.gamification?.mapValue?.fields || {};
        
        currentXp = parseInt(gamification?.totalXp?.integerValue || '0');
        currentLevel = parseInt(gamification?.level?.integerValue || '1');
        currentWeeklyXp = parseInt(gamification?.weeklyXp?.integerValue || '0');
        currentMonthlyXp = parseInt(gamification?.monthlyXp?.integerValue || '0');
        currentTasksCompleted = parseInt(gamification?.tasksCompleted?.integerValue || '0');
      }
      
      // Calculer les nouveaux totaux
      const newXp = currentXp + earnedXp;
      const newLevel = Math.floor(newXp / 100) + 1;
      const newWeeklyXp = currentWeeklyXp + earnedXp;
      const newMonthlyXp = currentMonthlyXp + earnedXp;
      const timestamp = new Date().toISOString();
      
      // 🔧 STRUCTURE GAMIFICATION COMPLÈTE
      const gamificationData = {
        mapValue: {
          fields: {
            totalXp: { integerValue: newXp.toString() },
            weeklyXp: { integerValue: newWeeklyXp.toString() },
            monthlyXp: { integerValue: newMonthlyXp.toString() },
            level: { integerValue: newLevel.toString() },
            tasksCompleted: { integerValue: completedTasks.toString() },
            loginStreak: { integerValue: "1" },
            currentStreak: { integerValue: "0" },
            maxStreak: { integerValue: "1" },
            badgesUnlocked: { integerValue: "0" },
            lastActivityAt: { stringValue: timestamp },
            // 🎯 AJOUT XP HISTORY POUR TRAÇABILITÉ
            xpHistory: {
              arrayValue: {
                values: [
                  {
                    mapValue: {
                      fields: {
                        amount: { integerValue: earnedXp.toString() },
                        source: { stringValue: "onboarding_completion" },
                        timestamp: { stringValue: timestamp },
                        totalAfter: { integerValue: newXp.toString() }
                      }
                    }
                  }
                ]
              }
            },
            // 🏆 BADGES ARRAY VIDE POUR COMMENCER
            badges: {
              arrayValue: {
                values: []
              }
            }
          }
        }
      };
      
      // Mettre à jour via API REST
      const updateDocument = {
        fields: {
          gamification: gamificationData,
          lastXpUpdate: { timestampValue: timestamp },
          completedOnboardingTasks: { integerValue: completedTasks.toString() },
          // 🔧 METADATA DE SYNCHRONISATION
          syncMetadata: {
            mapValue: {
              fields: {
                lastDashboardSync: { timestampValue: timestamp },
                lastSyncSource: { stringValue: "onboarding_api_rest" },
                integrationCompleted: { booleanValue: true },
                lastSyncReason: { stringValue: "xp_gain_from_onboarding" }
              }
            }
          },
          updatedAt: { timestampValue: timestamp }
        }
      };
      
      const updateResponse = await fetch(currentUserUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateDocument)
      });
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Erreur sync XP: ${updateResponse.status} - ${errorText}`);
      }
      
      console.log(`✅ [REST] XP synchronisé: ${currentXp} → ${newXp} (+${earnedXp})`);
      console.log(`🎯 [REST] Level: ${currentLevel} → ${newLevel}`);
      console.log(`📋 [REST] Tâches: ${completedTasks} complétées`);
      
      // 🔔 NOTIFICATION DE SUCCÈS
      this.showNotification(`+${earnedXp} XP gagné ! (Total: ${newXp}) 🎉`, 'success');
      
      // 🔄 FORCER LE RAFRAÎCHISSEMENT DU DASHBOARD
      this.notifyDashboardUpdate(userId, {
        totalXp: newXp,
        level: newLevel,
        weeklyXp: newWeeklyXp,
        monthlyXp: newMonthlyXp,
        tasksCompleted: completedTasks,
        lastUpdate: timestamp
      });
      
      return { 
        success: true, 
        newXp, 
        newLevel, 
        earnedXp,
        weeklyXp: newWeeklyXp,
        monthlyXp: newMonthlyXp,
        tasksCompleted: completedTasks
      };
      
    } catch (error) {
      console.error('❌ [REST] Erreur sync XP:', error);
      this.showNotification('Erreur de synchronisation XP', 'error');
      throw error;
    }
  },

  // 🔔 NOUVELLE MÉTHODE: Notifier le dashboard des changements
  notifyDashboardUpdate(userId, gamificationData) {
    // Émettre un événement global pour que le dashboard se mette à jour
    const updateEvent = new CustomEvent('onboardingXpUpdate', {
      detail: {
        userId,
        gamificationData,
        source: 'onboarding_completion',
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(updateEvent);
    
    console.log('📢 [REST] Événement dashboard émis:', {
      userId,
      totalXp: gamificationData.totalXp,
      level: gamificationData.level,
      tasksCompleted: gamificationData.tasksCompleted
    });
    
    // Également déclencher un refresh forcé des données
    setTimeout(() => {
      const refreshEvent = new CustomEvent('forceDashboardRefresh', {
        detail: { userId, reason: 'onboarding_xp_sync' }
      });
      window.dispatchEvent(refreshEvent);
    }, 1000);
  },

  // 🔧 CORRECTION: Méthode showNotification avec meilleur design
  showNotification(message, type = 'info') {
    console.log(`📢 [${type.toUpperCase()}] ${message}`);
    
    // Supprimer les notifications existantes
    const existing = document.querySelectorAll('.onboarding-notification');
    existing.forEach(el => el.remove());
    
    // Créer une notification visuelle
    const notification = document.createElement('div');
    notification.className = 'onboarding-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      z-index: 10000;
      font-family: system-ui;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 400px;
      font-size: 14px;
      border: 1px solid rgba(255,255,255,0.2);
    `;
    
    // Ajouter une icône selon le type
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${icon}</span>
        <span>${message}</span>
      </div>
    `;
    
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

// 📚 DONNÉES DE FORMATION BRAIN COMPLÈTES - 78 TÂCHES
const BRAIN_FORMATION_DATA = {
  // Phase 1: Découverte de Brain & de l'équipe (20 tâches)
  decouverte_brain: {
    id: 'decouverte_brain',
    title: '🧠 Découverte de Brain & de l\'équipe',
    description: 'Bienvenue ! Voici tes premières étapes pour te sentir chez toi et découvrir l\'esprit Brain.',
    category: 'introduction',
    order: 1,
    estimatedTime: '3 jours',
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
    id: 'formation_technique',
    title: '🎮 Formation technique escape game',
    description: 'Maîtrise les aspects techniques de nos escape games : mécaniques, énigmes, scénarios.',
    category: 'technical',
    order: 2,
    estimatedTime: '1 semaine',
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
      { id: 'indices_progressifs', label: 'Système d\'indices progressifs', description: 'Comment donner des indices adaptés', xp: 30, category: 'guidance' },
      { id: 'gestion_temps', label: 'Gestion du temps de jeu', description: 'Optimisation des sessions selon le temps', xp: 20, category: 'timing' },
      { id: 'surveillance_cameras', label: 'Surveillance par caméras', description: 'Utilisation du système de monitoring', xp: 20, category: 'monitoring' },
      { id: 'audio_ambiance', label: 'Gestion audio et ambiance', description: 'Contrôle des effets sonores et lumières', xp: 20, category: 'atmosphere' },
      { id: 'reset_rapide', label: 'Procédure de reset rapide', description: 'Remise en état entre les sessions', xp: 25, category: 'operations' },
      { id: 'maintenance_preventive', label: 'Maintenance préventive quotidienne', description: 'Vérifications et entretien régulier', xp: 20, category: 'maintenance' },
      { id: 'gestion_pannes', label: 'Gestion des pannes courantes', description: 'Résolution des problèmes fréquents', xp: 30, category: 'troubleshooting' },
      { id: 'communication_technique', label: 'Communication avec l\'équipe technique', description: 'Remontée des incidents et demandes', xp: 15, category: 'communication' },
      { id: 'documentation_technique', label: 'Lecture documentation technique', description: 'Maîtrise des guides et procédures', xp: 20, category: 'documentation' },
      { id: 'outils_diagnostic', label: 'Utilisation des outils de diagnostic', description: 'Test et vérification des équipements', xp: 25, category: 'tools' },
      { id: 'backup_scenarios', label: 'Scénarios de backup', description: 'Solutions alternatives en cas de panne', xp: 20, category: 'contingency' },
      { id: 'test_tous_mecanismes', label: 'Test de tous les mécanismes', description: 'Vérification complète avant ouverture', xp: 25, category: 'testing' },
      { id: 'protocole_securite_technique', label: 'Protocoles de sécurité technique', description: 'Règles de sécurité pour les équipements', xp: 20, category: 'safety' },
      { id: 'mise_jour_systemes', label: 'Mise à jour des systèmes', description: 'Procédures de mise à jour logicielle', xp: 15, category: 'updates' },
      { id: 'gestion_eclairage', label: 'Gestion de l\'éclairage dramatique', description: 'Contrôle des ambiances lumineuses', xp: 15, category: 'lighting' },
      { id: 'effets_speciaux', label: 'Déclenchement des effets spéciaux', description: 'Timing et contrôle des effets', xp: 20, category: 'effects' },
      { id: 'integration_complete', label: 'Intégration technique complète', description: 'Maîtrise globale de tous les systèmes', xp: 35, category: 'mastery' }
    ]
  },

  // Phase 3: Accueil et gestion client + Quiz Game (25 tâches)
  accueil_client: {
    id: 'accueil_client',
    title: '👥 Accueil et gestion client + Quiz Game',
    description: 'Apprends à créer une expérience client exceptionnelle du premier contact à la sortie + maîtrise du Quiz Game.',
    category: 'customer',
    order: 3,
    estimatedTime: '4 jours',
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
    id: 'entretiens_referent',
    title: '🎯 Entretiens avec le référent',
    description: 'Suivi personnalisé de ta progression avec ton référent tout au long du mois.',
    category: 'mentoring',
    order: 4,
    estimatedTime: '1 mois',
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
    
    window.addEventListener('forceDashboardRefresh', handleDashboardRefresh);
    
    return () => {
      window.removeEventListener('forceDashboardRefresh', handleDashboardRefresh);
    };
  }, [user]);

  // 💾 SAUVEGARDE AUTOMATIQUE
  useEffect(() => {
    if (user?.uid && completedTasks.size > 0) {
      scheduleAutoSave();
    }
  }, [completedTasks, user]);

  // 📥 CHARGEMENT PROGRESSION
  const loadProgress = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setSyncStatus('syncing');
    
    try {
      // Essayer d'abord localStorage
      const localData = localStorage.getItem(`onboarding_${user.uid}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        setCompletedTasks(new Set(parsed.completedTasks || []));
        setCompletedTasksHistory(new Set(parsed.completedTasksHistory || [])); // 🔒 CHARGER L'HISTORIQUE
        console.log('📱 Progression chargée depuis localStorage');
      }
      
      // Ensuite tenter Firebase REST
      try {
        const result = await firebaseRestService.loadProgressRest(user.uid);
        if (result.success && result.data) {
          setCompletedTasks(new Set(result.data.completedTasks || []));
          setCompletedTasksHistory(new Set(result.data.completedTasksHistory || [])); // 🔒 CHARGER L'HISTORIQUE FIREBASE
          setLastSaved(new Date(result.lastUpdated));
          setSyncStatus('online');
          console.log('☁️ Progression synchronisée depuis Firebase');
        } else {
          setSyncStatus('offline');
        }
      } catch (firebaseError) {
        console.warn('⚠️ Firebase indisponible, mode hors ligne');
        setSyncStatus('offline');
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement progression:', error);
      setSyncStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  // 💾 SAUVEGARDE DIFFÉRÉE
  const scheduleAutoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 2000); // Sauvegarde après 2 secondes d'inactivité
  };

  // 💾 SAUVEGARDE PROGRESSION
  const saveProgress = async () => {
    if (!user?.uid || saving) return;
    
    setSaving(true);
    setSyncStatus('syncing');
    
    const progressData = {
      completedTasks: Array.from(completedTasks),
      completedTasksHistory: Array.from(completedTasksHistory), // 🔒 SAUVEGARDER L'HISTORIQUE
      lastUpdated: new Date().toISOString(),
      userId: user.uid,
      version: '3.5.3'
    };
    
    try {
      // Sauvegarde locale immédiate
      localStorage.setItem(`onboarding_${user.uid}`, JSON.stringify(progressData));
      
      // Tentative sauvegarde Firebase
      try {
        await firebaseRestService.saveProgressRest(user.uid, progressData);
        setSyncStatus('online');
        setLastSaved(new Date());
        console.log('☁️ Progression sauvegardée sur Firebase');
      } catch (firebaseError) {
        console.warn('⚠️ Sauvegarde Firebase échouée, données locales conservées');
        setSyncStatus('offline');
      }
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      firebaseRestService.showNotification('Erreur de sauvegarde', 'error');
      setSyncStatus('offline');
    } finally {
      setSaving(false);
    }
  };

  // ✅ MARQUER TÂCHE COMME TERMINÉE - AVEC PROTECTION ANTI-FARMING XP
  const toggleTask = async (sectionId, taskId) => {
    const task = formationData[sectionId]?.tasks?.find(t => t.id === taskId);
    if (!task) return;
    
    const newCompleted = new Set(completedTasks);
    const wasCompleted = newCompleted.has(taskId);
    
    if (wasCompleted) {
      // DÉCOCHER LA TÂCHE
      newCompleted.delete(taskId);
      console.log(`🔄 Tâche décochée: ${task.label} (pas de perte d'XP)`);
    } else {
      // COCHER LA TÂCHE
      newCompleted.add(taskId);
      
      // 🔒 VÉRIFIER SI C'EST LA PREMIÈRE FOIS QUE CETTE TÂCHE EST COMPLÉTÉE
      const isFirstTimeCompleted = !completedTasksHistory.has(taskId);
      
      if (isFirstTimeCompleted && user?.uid) {
        // PREMIÈRE FOIS → GAGNER XP
        try {
          await firebaseRestService.syncXpRest(user.uid, task.xp, newCompleted.size);
          
          // 🔒 AJOUTER À L'HISTORIQUE POUR ÉVITER LE DOUBLE COMPTAGE
          const newHistory = new Set(completedTasksHistory);
          newHistory.add(taskId);
          setCompletedTasksHistory(newHistory);
          
          console.log(`✅ Première completion: ${task.label} → +${task.xp} XP`);
        } catch (error) {
          console.warn('⚠️ Sync XP échoué, progression locale conservée');
        }
      } else if (!isFirstTimeCompleted) {
        // DÉJÀ COMPLÉTÉE AVANT → PAS D'XP
        console.log(`🔒 Tâche déjà récompensée: ${task.label} → 0 XP (anti-farming)`);
        firebaseRestService.showNotification(
          `✅ ${task.label} - Déjà récompensée (pas de XP supplémentaire)`, 
          'info'
        );
      }
    }
    
    setCompletedTasks(newCompleted);
  };

  // 📊 CALCULS STATISTIQUES
  const totalTasks = Object.values(formationData).reduce((sum, section) => sum + section.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  
  // 🔒 XP CALCULÉS UNIQUEMENT SUR LES TÂCHES DANS L'HISTORIQUE (RÉELLEMENT RÉCOMPENSÉES)
  const earnedXp = Object.values(formationData)
    .flatMap(section => section.tasks)
    .filter(task => completedTasksHistory.has(task.id)) // 🔒 SEULEMENT LES TÂCHES DÉJÀ RÉCOMPENSÉES
    .reduce((sum, task) => sum + task.xp, 0);

  console.log(`📊 Statistiques: ${completedCount}/${totalTasks} tâches (${Math.round(progressPercentage)}%) - ${earnedXp} XP (réellement gagnés)`);

  // 🎨 ICÔNE STATUT SYNC
  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'online': return <Cloud className="w-4 h-4 text-green-500" />;
      case 'syncing': return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-gray-500" />;
      default: return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  // 📱 INTERFACE
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* 🎯 HEADER AVEC PROGRESSION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                🧠 Intégration Brain
              </h1>
              <p className="text-gray-400 mt-2">
                Bienvenue ! Voici tes premières étapes pour te sentir chez toi et découvrir l'esprit Brain.
              </p>
            </div>
            
            {/* 💾 STATUT SYNC */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {getSyncIcon()}
                <span>
                  {syncStatus === 'online' && lastSaved && `Sauvegardé ${lastSaved.toLocaleTimeString()}`}
                  {syncStatus === 'syncing' && 'Synchronisation...'}
                  {syncStatus === 'offline' && 'Hors ligne'}
                </span>
              </div>
              
              {saving && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Save className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Sauvegarde...</span>
                </div>
              )}
            </div>
          </div>

          {/* 📊 BARRE DE PROGRESSION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{completedCount} / {totalTasks} tâches terminées</span>
              <span>⭐ {earnedXp} XP gagnés</span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            
            <div className="text-center">
              <span className="text-lg font-semibold text-white">
                {Math.round(progressPercentage)}% terminé
              </span>
            </div>
          </div>
        </motion.div>

        {/* 📚 SECTIONS DE FORMATION */}
        <div className="space-y-6">
          {Object.values(formationData).map((section, sectionIndex) => {
            const sectionCompleted = section.tasks.every(task => completedTasks.has(task.id));
            const sectionProgress = section.tasks.filter(task => completedTasks.has(task.id)).length;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
                  sectionCompleted 
                    ? 'border-green-500/50 bg-green-900/20' 
                    : 'border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                {/* 📋 HEADER SECTION */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => {
                    const newExpanded = new Set(expandedSections);
                    if (isExpanded) {
                      newExpanded.delete(section.id);
                    } else {
                      newExpanded.add(section.id);
                    }
                    setExpandedSections(newExpanded);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        sectionCompleted 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {sectionCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {section.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {section.description} • {section.estimatedTime}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{sectionProgress} / {section.tasks.length} tâches</span>
                          <span>⭐ {section.tasks.reduce((sum, task) => sum + (completedTasks.has(task.id) ? task.xp : 0), 0)} XP</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {sectionCompleted && (
                        <Award className="w-6 h-6 text-yellow-400" />
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 📋 TÂCHES */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-3">
                        {section.tasks.map((task, taskIndex) => {
                          const isCompleted = completedTasks.has(task.id);
                          
                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: taskIndex * 0.05 }}
                              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                isCompleted
                                  ? 'bg-green-900/30 border-green-500/30 text-green-100'
                                  : 'bg-gray-700/30 border-gray-600/30 text-gray-100 hover:bg-gray-700/50 hover:border-gray-500/50'
                              }`}
                              onClick={() => toggleTask(section.id, task.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {isCompleted ? (
                                    <CheckSquare className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <Square className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-medium ${isCompleted ? 'line-through text-green-300' : ''}`}>
                                      {task.label}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <Star className="w-4 h-4 text-yellow-400" />
                                      <span className="text-sm font-medium">+{task.xp} XP</span>
                                    </div>
                                  </div>
                                  
                                  <p className={`text-sm ${isCompleted ? 'text-green-400/80' : 'text-gray-400'}`}>
                                    {task.description}
                                  </p>
                                  
                                  {isCompleted && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>
                                        {completedTasksHistory.has(task.id) 
                                          ? `Tâche terminée (+${task.xp} XP)` 
                                          : 'Tâche terminée (déjà récompensée)'
                                        }
                                      </span>
                                    </div>
                                  )}
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

        {/* 🎉 MESSAGE DE FÉLICITATIONS */}
        {progressPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Félicitations ! Intégration terminée !
              </h2>
              <p className="text-gray-300 mb-4">
                Tu as terminé toutes les étapes d'intégration chez Brain. 
                Bienvenue officiellement dans l'équipe !
              </p>
              <div className="flex items-center justify-center gap-4 text-lg">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">{earnedXp} XP total</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">Badge "Nouveau Brainy" débloqué</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 📱 DEBUG (MODE DEV) */}
        {import.meta.env.DEV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="mt-8 bg-gray-900/50 rounded-lg p-4 text-xs text-gray-400"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Debug Info:</strong>
                <div>User: {user?.email}</div>
                <div>Completed: {Array.from(completedTasks).join(', ')}</div>
                <div>Progress: {Math.round(progressPercentage)}%</div>
              </div>
              <div>
                <strong>Sync Status:</strong>
                <div>Mode: {syncStatus}</div>
                <div>Saving: {saving ? 'Yes' : 'No'}</div>
                <div>Last Saved: {lastSaved?.toLocaleString() || 'Never'}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
