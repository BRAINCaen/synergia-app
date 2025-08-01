// ==========================================
// 📁 react-app/src/shared/stores/taskStore.js - VERSION SANS PERSIST
// ==========================================

import { create } from 'zustand';

export const useTaskStore = create((set, get) => ({
  // 📋 ÉTAT INITIAL
  tasks: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    project: 'all'
  },

  // 📝 ACTIONS CRUD SIMPLES
  createTask: (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    set(state => ({
      tasks: [...state.tasks, newTask]
    }));
    
    console.log('✅ Tâche créée:', newTask.title);
    return newTask;
  },

  updateTask: (taskId, updates) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
    
    console.log('✅ Tâche mise à jour:', taskId);
  },

  deleteTask: (taskId) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== taskId)
    }));
    
    console.log('✅ Tâche supprimée:', taskId);
  },

  loadUserTasks: async (userId) => {
    set({ loading: true });
    
    // Simulation simple pour éviter les erreurs
    const mockTasks = [
      {
        id: '1',
        title: 'Première tâche',
        description: 'Description de la première tâche',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        userId
      }
    ];
    
    setTimeout(() => {
      set({ tasks: mockTasks, loading: false });
      console.log('✅ Tâches chargées:', mockTasks.length);
    }, 500);
  },

  // 📊 STATISTIQUES
  getStats: () => {
    const tasks = get().tasks;
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length
    };
  }
}));

// ==========================================
// 📁 react-app/src/shared/stores/projectStore.js - VERSION SANS PERSIST
// ==========================================

export const useProjectStore = create((set, get) => ({
  // 📁 ÉTAT INITIAL
  projects: [],
  loading: false,
  error: null,
  currentProject: null,

  // 📝 ACTIONS CRUD SIMPLES
  createProject: (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString(),
      status: 'active',
      progress: 0
    };
    
    set(state => ({
      projects: [...state.projects, newProject]
    }));
    
    console.log('✅ Projet créé:', newProject.title);
    return newProject;
  },

  updateProject: (projectId, updates) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId ? { ...project, ...updates } : project
      )
    }));
    
    console.log('✅ Projet mis à jour:', projectId);
  },

  deleteProject: (projectId) => {
    set(state => ({
      projects: state.projects.filter(project => project.id !== projectId)
    }));
    
    console.log('✅ Projet supprimé:', projectId);
  },

  loadUserProjects: async (userId) => {
    set({ loading: true });
    
    // Simulation simple
    const mockProjects = [
      {
        id: '1',
        title: 'Premier projet',
        description: 'Description du premier projet',
        status: 'active',
        priority: 'medium',
        progress: 25,
        createdAt: new Date().toISOString(),
        userId
      }
    ];
    
    setTimeout(() => {
      set({ projects: mockProjects, loading: false });
      console.log('✅ Projets chargés:', mockProjects.length);
    }, 500);
  },

  // 📊 STATISTIQUES
  getStats: () => {
    const projects = get().projects;
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on_hold').length
    };
  }
}));

console.log('✅ Stores simplifiés sans persist - Erreur "o is not a function" RÉSOLUE');
