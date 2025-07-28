// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// VERSION ULTRA SIMPLE - SANS BUGS
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Eye,
  Users, 
  Target,
  Folder
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { projectService } from '../core/services/projectService.js';

const ProjectsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // États simples
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger les projets
  useEffect(() => {
    if (user?.uid) {
      loadProjects();
    }
  }, [user?.uid]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement projets...');
      
      const allProjects = await projectService.getAllProjects();
      setProjects(allProjects || []);
      
      console.log('✅ Projets chargés:', allProjects.length);
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Actions simples
  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleViewProject = (project) => {
    navigate(`/projects/${project.id}`);
  };

  // Modal de création simple
  const CreateModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.title.trim()) {
        alert('Le titre est requis');
        return;
      }

      try {
        console.log('🚀 Création projet:', formData);
        
        // CORRECTION : Ordre des paramètres correct
        await projectService.createProject(formData, user.uid);
        
        setShowCreateModal(false);
        setFormData({ title: '', description: '', status: 'planning', priority: 'medium' });
        await loadProjects();
        
        console.log('✅ Projet créé avec succès');
        
      } catch (error) {
        console.error('❌ Erreur création:', error);
        alert('Erreur: ' + error.message);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Nouveau projet</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nom du projet"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
                placeholder="Description du projet"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Folder className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Mes Projets</h1>
            </div>
            
            <button 
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau projet
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {project.description || 'Aucune description'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{project.teamMembers?.length || 0} membres</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{project.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {project.createdAt ? 
                      new Date(project.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 
                      'N/A'
                    }
                  </div>
                  
                  <button 
                    onClick={() => handleViewProject(project)}
                    className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
            <p className="text-gray-600 mb-6">Créez votre premier projet pour commencer.</p>
            <button 
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer mon premier projet
            </button>
          </div>
        )}

        {/* Statistiques simples */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {projects.length}
            </div>
            <div className="text-gray-600 text-sm">Total projets</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <div className="text-gray-600 text-sm">Projets actifs</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-gray-600 text-sm">Projets terminés</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {projects.filter(p => p.status === 'planning').length}
            </div>
            <div className="text-gray-600 text-sm">En planification</div>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      <CreateModal />
    </div>
  );
};

export default ProjectsPage;
