// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES SIMPLIFIÉE - CORRECTION PAGE BLANCHE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Users,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Trash2,
  Edit,
  Eye,
  ChevronDown,
  Calendar,
  Target,
  Zap,
  Trophy,
  Archive,
  Repeat
} from 'lucide-react';

// ✅ IMPORTS SIMPLIFIÉS
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 📋 PAGE TÂCHES SIMPLIFIÉE - CORRECTION PAGE BLANCHE
 */
const TasksPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // États simplifiés
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ✅ DONNÉES TÂCHES VIDES POUR ÉVITER LES ERREURS
  const filteredTasks = [];

  // ✅ FONCTIONS SIMPLIFIÉES
  const handleCreateTask = () => {
    setShowCreateModal(true);
  };

  const handleTaskClick = (task) => {
    console.log('Tâche cliquée:', task);
  };

  // ✅ FONCTION POUR LES BADGES DE STATUT
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Terminée',
          color: 'bg-green-100 text-green-700',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'in_progress':
        return {
          label: 'En cours',
          color: 'bg-blue-100 text-blue-700',
          icon: <Clock className="w-3 h-3" />
        };
      case 'validation_pending':
        return {
          label: 'En validation',
          color: 'bg-orange-100 text-orange-700',
          icon: <AlertCircle className="w-3 h-3" />
        };
      default:
        return {
          label: 'En attente',
          color: 'bg-gray-100 text-gray-700',
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  // Vérification d'authentification
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
          <p className="text-gray-400">Veuillez vous connecter pour accéder aux tâches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 📊 EN-TÊTE */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Gestion des Tâches</h1>
            <button
              onClick={handleCreateTask}
              className="ml-4 p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-gray-400 text-lg">Organisez et suivez vos tâches efficacement</p>
        </div>

        {/* 📈 STATISTIQUES RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">0</span>
            </div>
            <h3 className="text-blue-400 font-semibold mb-2">Mes Tâches</h3>
            <p className="text-gray-400 text-sm">Tâches assignées</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">0</span>
            </div>
            <h3 className="text-green-400 font-semibold mb-2">Terminées</h3>
            <p className="text-gray-400 text-sm">Cette semaine</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">0</span>
            </div>
            <h3 className="text-orange-400 font-semibold mb-2">En Cours</h3>
            <p className="text-gray-400 text-sm">À finaliser</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">0</span>
            </div>
            <h3 className="text-purple-400 font-semibold mb-2">Collaboratives</h3>
            <p className="text-gray-400 text-sm">Tâches d'équipe</p>
          </div>
        </div>

        {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                <Filter className="w-4 h-4" />
                Filtres
              </button>
              
              <button
                onClick={handleCreateTask}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Tâche
              </button>
            </div>
          </div>
        </div>

        {/* 🎯 ONGLETS NAVIGATION */}
        <div className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 flex gap-2">
            {[
              { id: 'my', label: 'Mes Tâches', icon: Target },
              { id: 'available', label: 'Disponibles', icon: Heart },
              { id: 'team', label: 'Équipe', icon: Users },
              { id: 'history', label: 'Historique', icon: Archive }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 📋 LISTE DES TÂCHES */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              {activeTab === 'my' && 'Mes Tâches Assignées'}
              {activeTab === 'available' && 'Tâches Disponibles'}
              {activeTab === 'team' && 'Tâches d\'Équipe'}
              {activeTab === 'history' && 'Historique des Tâches'}
            </h3>
            <p className="text-gray-400">
              {activeTab === 'my' && 'Tâches qui vous sont directement assignées'}
              {activeTab === 'available' && 'Tâches ouvertes au volontariat'}
              {activeTab === 'team' && 'Tâches collaboratives de votre équipe'}
              {activeTab === 'history' && 'Tâches terminées et archivées'}
            </p>
          </div>

          {/* Zone d'affichage des tâches */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'my' && <Target className="w-8 h-8 text-gray-500" />}
                  {activeTab === 'available' && <Heart className="w-8 h-8 text-gray-500" />}
                  {activeTab === 'team' && <Users className="w-8 h-8 text-gray-500" />}
                  {activeTab === 'history' && <Archive className="w-8 h-8 text-gray-500" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Aucune tâche trouvée
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'my' && 'Vous n\'avez aucune tâche assignée pour le moment.'}
                  {activeTab === 'available' && 'Aucune tâche disponible au volontariat actuellement.'}
                  {activeTab === 'team' && 'Aucune tâche d\'équipe en cours.'}
                  {activeTab === 'history' && 'Aucune tâche complétée dans votre historique.'}
                </p>
                <button
                  onClick={handleCreateTask}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Créer votre première tâche
                </button>
              </div>
            ) : (
              // Liste des tâches (vide pour l'instant)
              <div className="grid gap-4">
                {/* Les tâches s'afficheront ici quand les données seront connectées */}
              </div>
            )}
          </div>
        </div>

        {/* 🏆 SECTION MOTIVATION */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">Organisez Votre Travail !</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Créez, assignez et suivez vos tâches pour une productivité maximale. Collaborez avec votre équipe et atteignez vos objectifs ensemble.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-white text-sm font-medium">Créez des tâches</p>
                <p className="text-gray-400 text-xs">Organisez votre travail</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-white text-sm font-medium">Collaborez</p>
                <p className="text-gray-400 text-xs">Travaillez en équipe</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-white text-sm font-medium">Suivez les progrès</p>
                <p className="text-gray-400 text-xs">Mesurez vos performances</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎭 MODAL CRÉATION TÂCHE SIMULÉE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Nouvelle Tâche</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre de la tâche
                </label>
                <input
                  type="text"
                  placeholder="Entrez le titre..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Décrivez la tâche..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    console.log('Tâche créée (simulation)');
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
