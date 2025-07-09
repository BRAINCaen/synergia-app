// ==========================================
// 📁 react-app/src/core/services/dataSyncService.js
// SERVICE DE SYNCHRONISATION COMPLÈTE - RÉPARATION TOTALE
// ==========================================

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  updateDoc,
  setDoc,
  query, 
  where, 
  orderBy,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

class DataSyncService {
  constructor() {
    this.syncResults = {
      usersFixed: 0,
      projectsFixed: 0,
      tasksFixed: 0,
      teamsFixed: 0,
      totalIssues: 0,
      report: []
    };
  }

  /**
   * 🔍 ANALYSE COMPLÈTE DES DONNÉES DU SITE
   */
  async analyzeAllData() {
    try {
      console.log('🔍 DÉBUT ANALYSE COMPLÈTE DES DONNÉES');
      
      const analysis = {
        users: await this.analyzeUsersData(),
        projects: await this.analyzeProjectsData(),
        tasks: await this.analyzeTasksData(),
        teams: await this.analyzeTeamsData(),
        userStats: await this.analyzeUserStatsData()
      };

      console.log('📊 ANALYSE TERMINÉE:', analysis);
      return analysis;
      
    } catch (error) {
      console.error('❌ Erreur analyse complète:', error);
      return null;
    }
  }

  /**
   * 👥 ANALYSE DES UTILISATEURS
   */
  async analyzeUsersData() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      const issues = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const userId = doc.id;
        
        // Vérifications de cohérence
        const userIssues = [];
        
        if (!userData.email) userIssues.push('Email manquant');
        if (!userData.displayName) userIssues.push('DisplayName manquant');
        if (!userData.createdAt) userIssues.push('CreatedAt manquant');
        if (!userData.gamification) userIssues.push('Données gamification manquantes');
        if (!userData.profile) userIssues.push('Profil manquant');
        if (!userData.lastActivity) userIssues.push('LastActivity manquante');
        
        // Vérifier la cohérence des XP
        const gamificationXP = userData.gamification?.totalXp || 0;
        const directXP = userData.totalXp || 0;
        if (gamificationXP !== directXP) {
          userIssues.push(`XP incohérents: gamification=${gamificationXP}, direct=${directXP}`);
        }
        
        users.push({
          id: userId,
          email: userData.email,
          displayName: userData.displayName,
          level: userData.gamification?.level || userData.level || 1,
          xp: userData.gamification?.totalXp || userData.totalXp || 0,
          tasksCompleted: userData.gamification?.tasksCompleted || 0,
          projects: userData.projects || [],
          issues: userIssues,
          lastActivity: userData.lastActivity,
          createdAt: userData.createdAt
        });
        
        if (userIssues.length > 0) {
          issues.push({
            userId,
            email: userData.email,
            issues: userIssues
          });
        }
      });
      
      return {
        total: users.length,
        withIssues: issues.length,
        users: users,
        issues: issues
      };
      
    } catch (error) {
      console.error('❌ Erreur analyse utilisateurs:', error);
      return { total: 0, withIssues: 0, users: [], issues: [] };
    }
  }

  /**
   * 📂 ANALYSE DES PROJETS
   */
  async analyzeProjectsData() {
    try {
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const projects = [];
      const issues = [];
      
      projectsSnapshot.forEach(doc => {
        const projectData = doc.data();
        const projectId = doc.id;
        
        const projectIssues = [];
        
        if (!projectData.name) projectIssues.push('Nom manquant');
        if (!projectData.ownerId) projectIssues.push('OwnerId manquant');
        if (!projectData.team) projectIssues.push('Team manquante');
        if (!projectData.createdAt) projectIssues.push('CreatedAt manquant');
        
        // Vérifier la cohérence de l'équipe
        const team = projectData.team || [];
        const teamIssues = [];
        
        team.forEach((member, index) => {
          if (!member.userId) teamIssues.push(`Membre ${index}: userId manquant`);
          if (!member.email) teamIssues.push(`Membre ${index}: email manquant`);
          if (!member.role) teamIssues.push(`Membre ${index}: role manquant`);
        });
        
        projects.push({
          id: projectId,
          name: projectData.name,
          ownerId: projectData.ownerId,
          team: team,
          teamSize: team.length,
          issues: [...projectIssues, ...teamIssues],
          createdAt: projectData.createdAt
        });
        
        if (projectIssues.length > 0 || teamIssues.length > 0) {
          issues.push({
            projectId,
            name: projectData.name,
            issues: [...projectIssues, ...teamIssues]
          });
        }
      });
      
      return {
        total: projects.length,
        withIssues: issues.length,
        projects: projects,
        issues: issues
      };
      
    } catch (error) {
      console.error('❌ Erreur analyse projets:', error);
      return { total: 0, withIssues: 0, projects: [], issues: [] };
    }
  }

  /**
   * 📝 ANALYSE DES TÂCHES
   */
  async analyzeTasksData() {
    try {
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const tasks = [];
      const issues = [];
      
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        const taskId = doc.id;
        
        const taskIssues = [];
        
        if (!taskData.title) taskIssues.push('Titre manquant');
        if (!taskData.userId) taskIssues.push('UserId manquant');
        if (!taskData.createdAt) taskIssues.push('CreatedAt manquant');
        if (!taskData.status) taskIssues.push('Status manquant');
        
        tasks.push({
          id: taskId,
          title: taskData.title,
          userId: taskData.userId,
          projectId: taskData.projectId,
          status: taskData.status,
          difficulty: taskData.difficulty,
          issues: taskIssues,
          createdAt: taskData.createdAt
        });
        
        if (taskIssues.length > 0) {
          issues.push({
            taskId,
            title: taskData.title,
            issues: taskIssues
          });
        }
      });
      
      return {
        total: tasks.length,
        withIssues: issues.length,
        tasks: tasks,
        issues: issues
      };
      
    } catch (error) {
      console.error('❌ Erreur analyse tâches:', error);
      return { total: 0, withIssues: 0, tasks: [], issues: [] };
    }
  }

  /**
   * 👥 ANALYSE DES ÉQUIPES
   */
  async analyzeTeamsData() {
    try {
      // Récupérer tous les utilisateurs connectés
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allUsers = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.email) {
          allUsers.push({
            id: doc.id,
            email: userData.email,
            displayName: userData.displayName,
            lastActivity: userData.lastActivity,
            createdAt: userData.createdAt
          });
        }
      });
      
      // Récupérer tous les projets pour vérifier les équipes
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const teamMemberships = new Map();
      const orphanedUsers = [];
      
      // Analyser les équipes dans les projets
      projectsSnapshot.forEach(doc => {
        const projectData = doc.data();
        const team = projectData.team || [];
        
        team.forEach(member => {
          if (!teamMemberships.has(member.userId)) {
            teamMemberships.set(member.userId, []);
          }
          teamMemberships.get(member.userId).push({
            projectId: doc.id,
            projectName: projectData.name,
            role: member.role
          });
        });
      });
      
      // Identifier les utilisateurs orphelins
      allUsers.forEach(user => {
        if (!teamMemberships.has(user.id)) {
          orphanedUsers.push(user);
        }
      });
      
      return {
        totalUsers: allUsers.length,
        usersInTeams: teamMemberships.size,
        orphanedUsers: orphanedUsers.length,
        orphanedUsersList: orphanedUsers,
        teamMemberships: Array.from(teamMemberships.entries()).map(([userId, projects]) => ({
          userId,
          projectCount: projects.length,
          projects
        }))
      };
      
    } catch (error) {
      console.error('❌ Erreur analyse équipes:', error);
      return { totalUsers: 0, usersInTeams: 0, orphanedUsers: 0, orphanedUsersList: [] };
    }
  }

  /**
   * 📊 ANALYSE DES STATS UTILISATEUR
   */
  async analyzeUserStatsData() {
    try {
      // Vérifier s'il y a une collection userStats séparée
      const userStatsSnapshot = await getDocs(collection(db, 'userStats'));
      const userStats = [];
      
      userStatsSnapshot.forEach(doc => {
        userStats.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        hasUserStatsCollection: userStats.length > 0,
        userStatsCount: userStats.length,
        userStats: userStats
      };
      
    } catch (error) {
      console.error('❌ Erreur analyse userStats:', error);
      return { hasUserStatsCollection: false, userStatsCount: 0, userStats: [] };
    }
  }

  /**
   * 🔧 SYNCHRONISATION COMPLÈTE ET RÉPARATION
   */
  async synchronizeAllData() {
    try {
      console.log('🔧 DÉBUT SYNCHRONISATION COMPLÈTE');
      
      const analysis = await this.analyzeAllData();
      
      if (!analysis) {
        throw new Error('Impossible d\'analyser les données');
      }
      
      // Réparation des utilisateurs
      await this.repairUsersData(analysis.users);
      
      // Réparation des projets
      await this.repairProjectsData(analysis.projects);
      
      // Réparation des tâches
      await this.repairTasksData(analysis.tasks);
      
      // Synchronisation des équipes
      await this.synchronizeTeamsData(analysis.teams);
      
      console.log('✅ SYNCHRONISATION TERMINÉE:', this.syncResults);
      
      return {
        success: true,
        results: this.syncResults,
        analysis: analysis
      };
      
    } catch (error) {
      console.error('❌ Erreur synchronisation complète:', error);
      return {
        success: false,
        error: error.message,
        results: this.syncResults
      };
    }
  }

  /**
   * 👥 RÉPARATION DES DONNÉES UTILISATEUR
   */
  async repairUsersData(usersAnalysis) {
    try {
      console.log('🔧 Réparation des utilisateurs...');
      
      const batch = writeBatch(db);
      let fixedCount = 0;
      
      for (const user of usersAnalysis.users) {
        if (user.issues.length > 0) {
          const userRef = doc(db, 'users', user.id);
          
          // Structure standardisée pour tous les utilisateurs
          const standardUserData = {
            email: user.email || 'user@example.com',
            displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
            
            // Profil utilisateur
            profile: {
              firstName: user.displayName?.split(' ')[0] || 'Utilisateur',
              lastName: user.displayName?.split(' ')[1] || '',
              role: 'user',
              department: 'Équipe',
              avatar: user.email ? this.generateAvatar(user.email) : '👤'
            },
            
            // Gamification
            gamification: {
              level: user.level || 1,
              totalXp: user.xp || 0,
              currentXp: user.xp || 0,
              tasksCompleted: user.tasksCompleted || 0,
              tasksCreated: 0,
              projectsCreated: 0,
              badges: [],
              achievements: []
            },
            
            // Compatibilité directe
            level: user.level || 1,
            totalXp: user.xp || 0,
            xpTotal: user.xp || 0,
            
            // Activité
            lastActivity: user.lastActivity || new Date().toISOString(),
            isActive: true,
            
            // Projets
            projects: user.projects || [],
            
            // Métadonnées
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // Préférences
            preferences: {
              theme: 'light',
              notifications: true,
              language: 'fr'
            }
          };
          
          batch.set(userRef, standardUserData, { merge: true });
          fixedCount++;
        }
      }
      
      if (fixedCount > 0) {
        await batch.commit();
        console.log(`✅ ${fixedCount} utilisateurs réparés`);
      }
      
      this.syncResults.usersFixed = fixedCount;
      
    } catch (error) {
      console.error('❌ Erreur réparation utilisateurs:', error);
    }
  }

  /**
   * 📂 RÉPARATION DES DONNÉES PROJET
   */
  async repairProjectsData(projectsAnalysis) {
    try {
      console.log('🔧 Réparation des projets...');
      
      const batch = writeBatch(db);
      let fixedCount = 0;
      
      for (const project of projectsAnalysis.projects) {
        if (project.issues.length > 0) {
          const projectRef = doc(db, 'projects', project.id);
          
          // Réparer l'équipe du projet
          const repairedTeam = project.team.map(member => ({
            userId: member.userId,
            email: member.email || 'user@example.com',
            displayName: member.displayName || member.email?.split('@')[0] || 'Utilisateur',
            role: member.role || 'contributor',
            permissions: this.getRolePermissions(member.role || 'contributor'),
            joinedAt: member.joinedAt || new Date().toISOString(),
            isActive: true
          }));
          
          const repairedProjectData = {
            name: project.name || 'Projet sans nom',
            ownerId: project.ownerId,
            team: repairedTeam,
            status: 'active',
            createdAt: project.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          batch.set(projectRef, repairedProjectData, { merge: true });
          fixedCount++;
        }
      }
      
      if (fixedCount > 0) {
        await batch.commit();
        console.log(`✅ ${fixedCount} projets réparés`);
      }
      
      this.syncResults.projectsFixed = fixedCount;
      
    } catch (error) {
      console.error('❌ Erreur réparation projets:', error);
    }
  }

  /**
   * 📝 RÉPARATION DES DONNÉES TÂCHE
   */
  async repairTasksData(tasksAnalysis) {
    try {
      console.log('🔧 Réparation des tâches...');
      
      const batch = writeBatch(db);
      let fixedCount = 0;
      
      for (const task of tasksAnalysis.tasks) {
        if (task.issues.length > 0) {
          const taskRef = doc(db, 'tasks', task.id);
          
          const repairedTaskData = {
            title: task.title || 'Tâche sans titre',
            userId: task.userId,
            projectId: task.projectId || null,
            status: task.status || 'todo',
            difficulty: task.difficulty || 'normal',
            createdAt: task.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          batch.set(taskRef, repairedTaskData, { merge: true });
          fixedCount++;
        }
      }
      
      if (fixedCount > 0) {
        await batch.commit();
        console.log(`✅ ${fixedCount} tâches réparées`);
      }
      
      this.syncResults.tasksFixed = fixedCount;
      
    } catch (error) {
      console.error('❌ Erreur réparation tâches:', error);
    }
  }

  /**
   * 👥 SYNCHRONISATION DES ÉQUIPES
   */
  async synchronizeTeamsData(teamsAnalysis) {
    try {
      console.log('🔧 Synchronisation des équipes...');
      
      // Ajouter les utilisateurs orphelins à un projet par défaut
      if (teamsAnalysis.orphanedUsers > 0) {
        await this.addOrphanedUsersToDefaultProject(teamsAnalysis.orphanedUsersList);
      }
      
      this.syncResults.teamsFixed = teamsAnalysis.orphanedUsers;
      
    } catch (error) {
      console.error('❌ Erreur synchronisation équipes:', error);
    }
  }

  /**
   * 🏠 AJOUTER LES UTILISATEURS ORPHELINS AU PROJET PAR DÉFAUT
   */
  async addOrphanedUsersToDefaultProject(orphanedUsers) {
    try {
      // Créer ou récupérer le projet par défaut
      const defaultProjectRef = doc(db, 'projects', 'default-team');
      const defaultProject = await getDoc(defaultProjectRef);
      
      let currentTeam = [];
      
      if (defaultProject.exists()) {
        currentTeam = defaultProject.data().team || [];
      } else {
        // Créer le projet par défaut
        await setDoc(defaultProjectRef, {
          name: 'Équipe Synergia',
          description: 'Équipe principale de tous les utilisateurs',
          ownerId: 'system',
          status: 'active',
          team: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Ajouter les utilisateurs orphelins
      for (const user of orphanedUsers) {
        const isAlreadyMember = currentTeam.some(member => member.userId === user.id);
        
        if (!isAlreadyMember) {
          currentTeam.push({
            userId: user.id,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            role: 'contributor',
            permissions: this.getRolePermissions('contributor'),
            joinedAt: new Date().toISOString(),
            isActive: true
          });
        }
      }
      
      // Mettre à jour le projet avec la nouvelle équipe
      await updateDoc(defaultProjectRef, {
        team: currentTeam,
        updatedAt: serverTimestamp()
      });
      
      // Mettre à jour les projets des utilisateurs
      const batch = writeBatch(db);
      for (const user of orphanedUsers) {
        const userRef = doc(db, 'users', user.id);
        batch.update(userRef, {
          projects: ['default-team'],
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      
      console.log(`✅ ${orphanedUsers.length} utilisateurs ajoutés au projet par défaut`);
      
    } catch (error) {
      console.error('❌ Erreur ajout utilisateurs orphelins:', error);
    }
  }

  /**
   * 🎨 GÉNÉRER UN AVATAR BASÉ SUR L'EMAIL
   */
  generateAvatar(email) {
    const avatars = ['👤', '👨', '👩', '🧑', '👱', '👨‍💻', '👩‍💻', '🧑‍💻'];
    const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatars.length;
    return avatars[index];
  }

  /**
   * 🔐 OBTENIR LES PERMISSIONS D'UN RÔLE
   */
  getRolePermissions(role) {
    const permissions = {
      'owner': ['manage_team', 'manage_tasks', 'manage_projects', 'view_analytics'],
      'manager': ['manage_team', 'manage_tasks', 'view_analytics'],
      'lead': ['manage_tasks', 'view_analytics'],
      'contributor': ['manage_tasks'],
      'observer': []
    };
    
    return permissions[role] || permissions['contributor'];
  }

  /**
   * 📊 GÉNÉRER UN RAPPORT DE SYNCHRONISATION
   */
  generateSyncReport() {
    return {
      timestamp: new Date().toISOString(),
      results: this.syncResults,
      summary: {
        totalFixedItems: this.syncResults.usersFixed + this.syncResults.projectsFixed + this.syncResults.tasksFixed + this.syncResults.teamsFixed,
        recommendation: this.syncResults.totalIssues > 0 ? 'Surveillance continue recommandée' : 'Données cohérentes'
      }
    };
  }
}

// Export de l'instance
const dataSyncService = new DataSyncService();
export default dataSyncService;
export { dataSyncService };
