import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../shared/stores/authStore';
import { useGameStore } from '../shared/stores/gameStore';
import { gamificationService } from '../core/services/gamificationService';

// Icônes
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Folder, 
  Users, 
  Calendar, 
  Target, 
  Edit3, 
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Star
} from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const { user } = useAuthStore();
  const { userStats } = useGameStore();

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    deadline: '',
    tags: [],
    isPublic: false
  });

  // Écouter les projets en temps réel depuis Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(projectsQuery, async (snapshot) => {
      const projectsData = await Promise.all(
        snapshot.docs.map(async (projectDoc) => {
          const projectData = {
            id: projectDoc.id,
            ...projectDoc.data(),
            createdAt: projectDoc.data().createdAt?.toDate(),
            updatedAt: projectDoc.data().updatedAt?.toDate(),
            deadline: projectDoc.data().deadline?.toDate()
          };

          // Récupérer les tâches associées pour calculer le progrès
          const tasksQuery = query(
            collection(db, 'tasks'),
            where('projectId', '==', projectDoc.id)
          );
          
          try {
            const tasksSnapshot = await getDocs(tasksQuery);
            const tasks = tasksSnapshot.docs.map(doc => doc.data());
            
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return {
              ...projectData,
              taskCount: totalTasks,
              completedTaskCount: completedTasks,
              progress
            };
          } catch (error) {
            console.error('Erreur récupération tâches projet:', error);
            return {
              ...projectData,
              taskCount: 0,
              completedTaskCount: 0,
              progress: 0
            };
          }
        })
      );
      
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error('Erreur écoute projets:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Filtrer les projets
  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, filterStatus]);

  // Créer ou modifier un projet
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const projectData = {
        ...formData,
        ownerId: user.uid,
        members: [user.uid],
        status: 'active',
        deadline: formData.deadline ? new Date(formData.deadline) : null,
        tags: formData.tags.filter(tag => tag.trim()),
        settings: {
          isPublic: formData.isPublic,
          allowJoin: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingProject) {
        // Modifier projet existant
        await updateDoc(doc(db, 'projects', editingProject.id), {
          ...projectData,
          createdAt: editingProject.createdAt, // Garder date création originale
          ownerId: editingProject.ownerId, // Garder propriétaire original
          members: editingProject.members // Garder membres existants
        });
      } else {
        // Créer nouveau projet
        await addDoc(collection(db, 'projects'), projectData);
        
        // Ajouter XP pour création de projet
        await gamificationService.addXP(user.uid, 25, 'Nouveau projet créé');
      }

      // Reset formulaire
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        deadline: '',
        tags: [],
        isPublic: false
      });
      setShowProjectForm(false);
      setEditingProject(null);

    } catch (error) {
      console.error('Erreur sauvegarde projet:', error);
      alert('Erreur lors de la sauvegarde du projet');
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un projet
  const deleteProject = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Toutes les tâches associées seront également supprimées.')) {
      try {
        // Supprimer toutes les tâches du projet
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', projectId)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        
        const deletePromises = tasksSnapshot.docs.map(taskDoc => 
          deleteDoc(doc(db, 'tasks', taskDoc.id))
        );
        await Promise.all(deletePromises);

        // Supprimer le projet
        await deleteDoc(doc(db, 'projects', projectId));
        
      } catch (error) {
        console.error('Erreur suppression projet:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Modifier un projet
  const startEditProject = (project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      priority: project.priority || 'medium',
      deadline: project.deadline ? project.deadline.toISOString().split('T')[0] : '',
      tags: project.tags || [],
      isPublic: project.settings?.isPublic || false
    });
    setEditingProject(project);
    setShowProjectForm(true);
  };

  // Ajouter un tag
  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // Supprimer un tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Fonctions utilitaires
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'active': return 'text-blue-400 bg-blue-400/10';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10';
      case 'archived': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `En retard de ${Math.abs(diffDays)} jour(s)`;
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    return `Dans ${diffDays} jour(s)`;
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const paused = projects.filter(p => p.status === 'paused').length;
    
    return { total, active, completed, paused };
  };

  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          Chargement des projets...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Folder className="w-8 h-8 text-purple-400" />
                Mes Projets
              </h1>
              <p className="text-gray-400 mt-2">
                Organisez et suivez l'avancement de tous vos projets
              </p>
            </div>
            <button
              onClick={() => setShowProjectForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Nouveau projet
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Folder className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Actifs</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Complétés</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">En pause</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.paused}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des projets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filtres */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="completed">Complétés</option>
            <option value="paused">En pause</option>
            <option value="archived">Archivés</option>
          </select>
        </div>

        {/* Grille des projets */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {projects.length === 0 ? 'Aucun projet' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500 mb-6">
              {projects.length === 0 
                ? 'Commencez par créer votre premier projet'
                : 'Essayez de modifier vos filtres de recherche'
              }
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => setShowProjectForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Créer mon premier projet
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all duration-200 hover:shadow-lg"
              >
                {/* Header projet */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {project.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status === 'active' ? 'Actif' : 
                       project.status === 'completed' ? 'Complété' :
                       project.status === 'paused' ? 'En pause' : 'Archivé'}
                    </span>
                  </div>
                  
                  {/* Menu actions */}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEditProject(project)}
                      className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded transition-colors"
                      title="Modifier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                )}

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Progression</span>
                    <span className="text-white font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Métadonnées */}
                <div className="space-y-3">
                  {/* Tâches */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Tâches
                    </span>
                    <span className="text-white">
                      {project.completedTaskCount || 0}/{project.taskCount || 0}
                    </span>
                  </div>

                  {/* Priorité */}
                  {project.priority && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Priorité
                      </span>
                      <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority === 'high' ? 'Haute' : project.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                  )}

                  {/* Date échéance */}
                  {project.deadline && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Échéance
                      </span>
                      <span className="text-white">
                        {formatDate(project.deadline)}
                      </span>
                    </div>
                  )}

                  {/* Membres */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Équipe
                    </span>
                    <span className="text-white">
                      {project.members?.length || 1} membre{(project.members?.length || 1) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal formulaire projet */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
              </h2>

              <form onSubmit={handleSubmitProject} className="space-y-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nom du projet"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Description du projet (optionnel)"
                  />
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>

                {/* Date échéance */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Ajouter un tag et appuyer sur Entrée"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                </div>

                {/* Paramètres */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Projet public (visible par les autres utilisateurs)</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProjectForm(false);
                      setEditingProject(null);
                      setFormData({
                        name: '',
                        description: '',
                        priority: 'medium',
                        deadline: '',
                        tags: [],
                        isPublic: false
                      });
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.name.trim()}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {editingProject ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails projet */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.name}</h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status === 'active' ? 'Actif' : 
                     selectedProject.status === 'completed' ? 'Complété' :
                     selectedProject.status === 'paused' ? 'En pause' : 'Archivé'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              {selectedProject.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300">{selectedProject.description}</p>
                </div>
              )}

              {/* Progression détaillée */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Progression</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{selectedProject.taskCount || 0}</div>
                    <div className="text-sm text-gray-400">Tâches totales</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{selectedProject.completedTaskCount || 0}</div>
                    <div className="text-sm text-gray-400">Tâches complétées</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{selectedProject.progress}%</div>
                    <div className="text-sm text-gray-400">Progression</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedProject.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">INFORMATIONS</h4>
                  <div className="space-y-3">
                    {selectedProject.priority && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Priorité</span>
                        <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getPriorityColor(selectedProject.priority)}`}>
                          {selectedProject.priority === 'high' ? 'Haute' : selectedProject.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </div>
                    )}
                    
                    {selectedProject.deadline && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Échéance</span>
                        <span className="text-white">{formatDate(selectedProject.deadline)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Équipe</span>
                      <span className="text-white">{selectedProject.members?.length || 1} membre{(selectedProject.members?.length || 1) > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Créé le</span>
                      <span className="text-white">
                        {selectedProject.createdAt?.toLocaleDateString('fr-FR') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">PARAMÈTRES</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Visibilité</span>
                      <span className="text-white">
                        {selectedProject.settings?.isPublic ? 'Public' : 'Privé'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Propriétaire</span>
                      <span className="text-white">
                        {selectedProject.ownerId === user?.uid ? 'Vous' : 'Autre'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedProject.tags && selectedProject.tags.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">TAGS</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    startEditProject(selectedProject);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
