// src/core/services/initializeFirebaseData.js
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '../firebase.js';

/**
 * Initialise les données Firebase pour un nouvel utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} userEmail - Email de l'utilisateur
 * @param {string} displayName - Nom d'affichage de l'utilisateur
 */
export const initializeUserData = async (userId, userEmail, displayName = null) => {
  if (!firebaseDb) {
    console.warn('⚠️ Firebase non configuré - Initialisation ignorée');
    return false;
  }

  try {
    console.log('🔧 Initialisation des données Firebase pour:', userEmail);

    // 1. Vérifier si les statistiques utilisateur existent déjà
    const userStatsRef = doc(firebaseDb, 'userStats', userId);
    const userStatsSnap = await getDoc(userStatsRef);

    if (!userStatsSnap.exists()) {
      // Créer les statistiques initiales
      const initialStats = {
        userId,
        email: userEmail,
        displayName: displayName || userEmail.split('@')[0],
        totalXp: 0,
        level: 1,
        tasksCreated: 0,
        tasksCompleted: 0,
        projectsCreated: 0,
        projectsJoined: 0,
        badges: [],
        loginStreak: 1,
        lastLoginDate: serverTimestamp(),
        completionRate: 0,
        maxTasksPerDay: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userStatsRef, initialStats);
      console.log('✅ Statistiques utilisateur créées');
    }

    // 2. Créer/mettre à jour l'entrée du leaderboard
    const leaderboardRef = doc(firebaseDb, 'leaderboard', userId);
    const leaderboardData = {
      userId,
      email: userEmail,
      displayName: displayName || userEmail.split('@')[0],
      totalXp: 0,
      level: 1,
      updatedAt: serverTimestamp()
    };

    await setDoc(leaderboardRef, leaderboardData, { merge: true });
    console.log('✅ Entrée leaderboard créée/mise à jour');

    // 3. Créer un profil utilisateur optionnel
    const userProfileRef = doc(firebaseDb, 'users', userId);
    const userProfileSnap = await getDoc(userProfileRef);

    if (!userProfileSnap.exists()) {
      const initialProfile = {
        userId,
        email: userEmail,
        displayName: displayName || userEmail.split('@')[0],
        photoURL: null,
        bio: '',
        preferences: {
          notifications: true,
          publicProfile: false,
          theme: 'dark'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userProfileRef, initialProfile);
      console.log('✅ Profil utilisateur créé');
    }

    console.log('🎉 Initialisation Firebase terminée avec succès');
    return true;

  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
    return false;
  }
};

/**
 * Créer un projet de démonstration pour les nouveaux utilisateurs
 * @param {string} userId - ID de l'utilisateur
 */
export const createDemoProject = async (userId) => {
  if (!firebaseDb) {
    return false;
  }

  try {
    // Créer un projet de bienvenue
    const demoProject = {
      name: '🎯 Bienvenue dans Synergia',
      description: 'Votre premier projet pour découvrir les fonctionnalités de Synergia. Complétez les tâches pour gagner de l\'XP et débloquer des badges !',
      ownerId: userId,
      members: [userId],
      status: 'active',
      priority: 'medium',
      progress: 0,
      taskCount: 0,
      completedTaskCount: 0,
      tags: ['démonstration', 'bienvenue'],
      settings: {
        isPublic: false,
        allowJoin: false
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const projectRef = doc(collection(firebaseDb, 'projects'));
    await setDoc(projectRef, demoProject);
    
    // Créer des tâches de démonstration
    const demoTasks = [
      {
        title: '✨ Découvrir l\'interface',
        description: 'Explorez le tableau de bord et familiarisez-vous avec l\'interface de Synergia.',
        userId,
        projectId: projectRef.id,
        status: 'todo',
        priority: 'high',
        complexity: 'low',
        xpReward: 15,
        tags: ['découverte'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: '🎯 Créer votre première tâche',
        description: 'Cliquez sur "Nouvelle tâche" et créez votre première tâche personnalisée.',
        userId,
        projectId: projectRef.id,
        status: 'todo',
        priority: 'medium',
        complexity: 'low',
        xpReward: 20,
        tags: ['création'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: '🏆 Compléter une tâche',
        description: 'Marquez cette tâche comme complétée pour gagner vos premiers points XP !',
        userId,
        projectId: projectRef.id,
        status: 'todo',
        priority: 'medium',
        complexity: 'medium',
        xpReward: 25,
        tags: ['gamification'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: '🚀 Explorer la gamification',
        description: 'Consultez votre profil pour voir vos statistiques, badges et progression.',
        userId,
        projectId: projectRef.id,
        status: 'todo',
        priority: 'low',
        complexity: 'low',
        xpReward: 15,
        tags: ['exploration'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Créer toutes les tâches de démonstration
    for (const task of demoTasks) {
      const taskRef = doc(collection(firebaseDb, 'tasks'));
      await setDoc(taskRef, task);
    }

    console.log('✅ Projet et tâches de démonstration créés');
    return projectRef.id;

  } catch (error) {
    console.error('❌ Erreur création projet démo:', error);
    return false;
  }
};

/**
 * Vérifier et réparer la structure des données utilisateur
 * @param {string} userId - ID de l'utilisateur
 */
export const verifyUserDataIntegrity = async (userId) => {
  if (!firebaseDb) {
    return false;
  }

  try {
    console.log('🔍 Vérification de l\'intégrité des données pour:', userId);

    // Vérifier les statistiques utilisateur
    const userStatsRef = doc(firebaseDb, 'userStats', userId);
    const userStatsSnap = await getDoc(userStatsRef);

    if (!userStatsSnap.exists()) {
      console.warn('⚠️ Statistiques utilisateur manquantes - Recréation...');
      // Recréer les statistiques avec des valeurs par défaut
      const defaultStats = {
        userId,
        email: 'utilisateur@exemple.com',
        totalXp: 0,
        level: 1,
        tasksCreated: 0,
        tasksCompleted: 0,
        projectsCreated: 0,
        projectsJoined: 0,
        badges: [],
        loginStreak: 1,
        lastLoginDate: serverTimestamp(),
        completionRate: 0,
        maxTasksPerDay: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userStatsRef, defaultStats);
    }

    // Vérifier l'entrée du leaderboard
    const leaderboardRef = doc(firebaseDb, 'leaderboard', userId);
    const leaderboardSnap = await getDoc(leaderboardRef);

    if (!leaderboardSnap.exists()) {
      console.warn('⚠️ Entrée leaderboard manquante - Recréation...');
      const stats = userStatsSnap.exists() ? userStatsSnap.data() : {};
      
      const leaderboardData = {
        userId,
        email: stats.email || 'utilisateur@exemple.com',
        totalXp: stats.totalXp || 0,
        level: stats.level || 1,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(leaderboardRef, leaderboardData);
    }

    console.log('✅ Intégrité des données vérifiée');
    return true;

  } catch (error) {
    console.error('❌ Erreur vérification intégrité:', error);
    return false;
  }
};

/**
 * Nettoyer les données obsolètes ou corrompues
 * @param {string} userId - ID de l'utilisateur
 */
export const cleanupUserData = async (userId) => {
  if (!firebaseDb) {
    return false;
  }

  try {
    console.log('🧹 Nettoyage des données pour:', userId);

    // Logique de nettoyage à implémenter selon les besoins
    // Par exemple : supprimer les tâches sans projet, corriger les statistiques incohérentes, etc.

    console.log('✅ Nettoyage terminé');
    return true;

  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
    return false;
  }
};

export default {
  initializeUserData,
  createDemoProject,
  verifyUserDataIntegrity,
  cleanupUserData
};
