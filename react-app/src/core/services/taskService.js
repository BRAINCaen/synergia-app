// taskService.js - Service de gestion des tâches avec imports corrigés
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore'

// 🔧 CORRECTION : Import Firebase sans isFirebaseConfigured
import { db } from '../firebase.js'

// Vérification simple si db existe
const isFirebaseConfigured = !!db

// Configuration des tâches
export const TASK_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
}

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const TASK_DIFFICULTIES = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  EXPERT: 'expert'
}

// Récompenses XP par difficulté
export const XP_REWARDS = {
  easy: 20,
  normal: 40,
  hard: 60,
  expert: 100
}

class TaskService {
  constructor() {
    this.listeners = new Map()
    this.cache = new Map()
  }

  // Créer une nouvelle tâche
  async createTask(userId, taskData) {
    if (!isFirebaseConfigured || !userId) {
      console.log('🔧 [MOCK] Création tâche:', taskData.title)
      return { 
        id: `mock-${Date.now()}`, 
        ...taskData, 
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    try {
      const task = {
        ...taskData,
        userId,
        status: taskData.status || TASK_STATUS.TODO,
        priority: taskData.priority || TASK_PRIORITIES.NORMAL,
        difficulty: taskData.difficulty || TASK_DIFFICULTIES.NORMAL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      }

      const docRef = await addDoc(collection(db, 'tasks'), task)
      return { id: docRef.id, ...task }
    } catch (error) {
      console.error('Erreur création tâche:', error)
      throw new Error(`Erreur création tâche: ${error.message}`)
    }
  }

  // Récupérer toutes les tâches d'un utilisateur
  async getUserTasks(userId) {
    if (!isFirebaseConfigured || !userId) {
      return this.getMockTasks()
    }

    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const tasks = []
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() })
      })
      
      return tasks
    } catch (error) {
      console.error('Erreur récupération tâches:', error)
      return this.getMockTasks()
    }
  }

  // Données mock pour le développement
  getMockTasks() {
    return [
      {
        id: 'mock-1',
        title: 'Implémenter authentification Firebase',
        description: 'Configurer et intégrer Firebase Auth dans l\'application',
        status: TASK_STATUS.COMPLETED,
        priority: TASK_PRIORITIES.HIGH,
        difficulty: TASK_DIFFICULTIES.HARD,
        projectId: 'proj-1',
        dueDate: '2024-01-15',
        completedAt: '2024-01-14T10:30:00Z',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-14T10:30:00Z'
      },
      {
        id: 'mock-2',
        title: 'Créer composants UI réutilisables',
        description: 'Développer la librairie de composants avec Tailwind CSS',
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITIES.NORMAL,
        difficulty: TASK_DIFFICULTIES.NORMAL,
        projectId: 'proj-1',
        dueDate: '2024-01-20',
        completedAt: null,
        createdAt: '2024-01-12T14:00:00Z',
        updatedAt: '2024-01-16T16:20:00Z'
      },
      {
        id: 'mock-3',
        title: 'Optimiser performance application',
        description: 'Analyser et améliorer les temps de chargement',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITIES.LOW,
        difficulty: TASK_DIFFICULTIES.EXPERT,
        projectId: 'proj-2',
        dueDate: '2024-02-01',
        completedAt: null,
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z'
      },
      {
        id: 'mock-4',
        title: 'Tests unitaires gamification',
        description: 'Écrire des tests pour le système XP et badges',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITIES.NORMAL,
        difficulty: TASK_DIFFICULTIES.EASY,
        projectId: 'proj-1',
        dueDate: '2024-01-25',
        completedAt: null,
        createdAt: '2024-01-16T13:30:00Z',
        updatedAt: '2024-01-16T13:30:00Z'
      }
    ]
  }

  // Mettre à jour une tâche
  async updateTask(taskId, updates) {
    if (!isFirebaseConfigured || !taskId) {
      console.log('🔧 [MOCK] Mise à jour tâche:', taskId, updates)
      return { success: true, taskId, updates }
    }

    try {
      const taskRef = doc(db, 'tasks', taskId)
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }

      // Si la tâche est marquée comme complétée, ajouter completedAt
      if (updates.status === TASK_STATUS.COMPLETED) {
        updateData.completedAt = new Date().toISOString()
      }

      await updateDoc(taskRef, updateData)
      return { success: true, taskId, updates: updateData }
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error)
      throw new Error(`Erreur mise à jour tâche: ${error.message}`)
    }
  }

  // Marquer une tâche comme complétée
  async completeTask(taskId, userId) {
    const result = await this.updateTask(taskId, { 
      status: TASK_STATUS.COMPLETED 
    })

    // Déclencher l'attribution d'XP (sera géré par gamificationService)
    if (result.success) {
      // Émettre un événement pour que gamificationService puisse réagir
      this.emitTaskCompleted(taskId, userId)
    }

    return result
  }

  // Supprimer une tâche
  async deleteTask(taskId) {
    if (!isFirebaseConfigured || !taskId) {
      console.log('🔧 [MOCK] Suppression tâche:', taskId)
      return { success: true, taskId }
    }

    try {
      await deleteDoc(doc(db, 'tasks', taskId))
      return { success: true, taskId }
    } catch (error) {
      console.error('Erreur suppression tâche:', error)
      throw new Error(`Erreur suppression tâche: ${error.message}`)
    }
  }

  // Écouter les changements en temps réel
  subscribeToUserTasks(userId, callback) {
    if (!isFirebaseConfigured || !userId) {
      // Mode mock - simuler des données
      callback(this.getMockTasks())
      return () => {}
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasks = []
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() })
      })
      callback(tasks)
    })

    this.listeners.set(userId, unsubscribe)
    return unsubscribe
  }

  // Filtrer les tâches
  filterTasks(tasks, filters = {}) {
    let filteredTasks = [...tasks]

    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status)
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority)
    }

    if (filters.projectId) {
      filteredTasks = filteredTasks.filter(task => task.projectId === filters.projectId)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      )
    }

    return filteredTasks
  }

  // Statistiques des tâches
  getTaskStats(tasks) {
    const total = tasks.length
    const completed = tasks.filter(task => task.status === TASK_STATUS.COMPLETED).length
    const inProgress = tasks.filter(task => task.status === TASK_STATUS.IN_PROGRESS).length
    const todo = tasks.filter(task => task.status === TASK_STATUS.TODO).length

    return {
      total,
      completed,
      inProgress,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  // Émettre événement de tâche complétée
  emitTaskCompleted(taskId, userId) {
    // Événement personnalisé pour intégration avec gamificationService
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('taskCompleted', {
        detail: { taskId, userId }
      }))
    }
  }

  // Nettoyer les listeners
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }
}

// Instance singleton
export const taskService = new TaskService()

// Mock projectService simple pour éviter l'erreur d'import
export const projectService = {
  // Données mock pour les projets
  getMockProjects() {
    return [
      {
        id: 'proj-1',
        title: 'Synergia v3.3',
        description: 'Développement de la plateforme collaborative',
        status: 'in_progress',
        progress: 75,
        tasksTotal: 20,
        tasksCompleted: 15,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'proj-2',
        title: 'Optimisation Performance',
        description: 'Amélioration des temps de chargement',
        status: 'planning',
        progress: 30,
        tasksTotal: 8,
        tasksCompleted: 2,
        createdAt: '2024-01-15T00:00:00Z'
      }
    ]
  },

  async getUserProjects(userId) {
    console.log('🔧 [MOCK] Récupération projets pour:', userId)
    return this.getMockProjects()
  },

  async createProject(userId, projectData) {
    console.log('🔧 [MOCK] Création projet:', projectData.title)
    return { 
      id: `proj-${Date.now()}`, 
      ...projectData, 
      userId,
      createdAt: new Date().toISOString()
    }
  },

  subscribeToUserProjects(userId, callback) {
    console.log('👂 [MOCK] Abonnement aux projets pour:', userId)
    callback(this.getMockProjects())
    return () => {}
  }
}

export default taskService
