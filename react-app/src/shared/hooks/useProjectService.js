// useProjectService.js - Version simplifiée pour éviter les erreurs d'import
import { useState, useEffect } from 'react'

// Mock service simple pour les projets
const mockProjectService = {
  async getUserProjects(userId) {
    console.log('🔧 [MOCK] Récupération projets pour:', userId)
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
    // Simuler des données immédiatement
    setTimeout(() => {
      callback(this.getUserProjects(userId))
    }, 100)
    return () => {} // Fonction de nettoyage vide
  }
}

export const useProjectService = (userId = 'demo-user') => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const userProjects = await mockProjectService.getUserProjects(userId)
        setProjects(userProjects)
        
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
        console.error('Erreur chargement projets:', err)
      }
    }

    if (userId) {
      loadProjects()
    }
  }, [userId])

  const createProject = async (projectData) => {
    try {
      const newProject = await mockProjectService.createProject(userId, projectData)
      setProjects(prev => [newProject, ...prev])
      return { success: true, project: newProject }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    refreshProjects: () => {
      const loadProjects = async () => {
        const userProjects = await mockProjectService.getUserProjects(userId)
        setProjects(userProjects)
      }
      loadProjects()
    }
  }
}

// Export de classe vide pour compatibilité
export class ProjectService {
  constructor() {
    console.log('🔧 [MOCK] ProjectService initialisé')
  }

  async getUserProjects(userId) {
    return mockProjectService.getUserProjects(userId)
  }

  async createProject(userId, projectData) {
    return mockProjectService.createProject(userId, projectData)
  }

  subscribeToUserProjects(userId, callback) {
    return mockProjectService.subscribeToUserProjects(userId, callback)
  }
}

export default mockProjectService
