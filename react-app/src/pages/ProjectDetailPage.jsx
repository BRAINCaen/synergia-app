// ==========================================
// 📁 react-app/src/pages/ProjectDetailPage.jsx
// PAGE DÉTAILS DE PROJET - DESIGN SYNERGIA + TERMINOLOGIE QUÊTES
// ==========================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Users,
  Target,
  Calendar,
  Clock,
  Settings,
  Edit,
  Trash2,
  Plus,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Heart,
  Star,
  MessageSquare,
  FileText,
  BarChart3,
  Link as LinkIcon,
  Unlink,
  Search,
  Sword,
  Trophy,
  Flag
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT SYNERGIA
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 📊 CONSTANTES
const PROJECT_STATUS = {
  planning: { 
    label: 'Planification', 
    color: 'yellow', 
    icon: '📋', 
    bgColor: 'bg-yellow-900/20', 
    textColor: 'text-yellow-400', 
    borderColor: 'border-yellow-500/30'
  },
  active: { 
    label: 'En cours', 
    color: 'blue', 
    icon: '🚀', 
    bgColor: 'bg-blue-900/20', 
    textColor: 'text-blue-400', 
    borderColor: 'border-blue-500/30'
  },
  completed: { 
    label: 'Terminé', 
    color: 'green', 
    icon: '✅', 
    bgColor: 'bg-green-900/20', 
    textColor: 'text-green-400', 
    borderColor: 'border-green-500/30'
  },
  on_hold: { 
    label: 'En pause', 
    color: 'orange', 
    icon: '⏸️', 
    bgColor: 'bg-orange-900/20', 
    textColor: 'text-orange-400', 
    borderColor: 'border-orange-500/30'
  },
  cancelled: { 
    label: 'Annulé', 
    color: 'red', 
    icon: '❌', 
    bgColor: 'bg-red-900/20', 
    textColor: 'text-red-400', 
    borderColor: 'border-red-500/30'
  }
};

/**
 * 📁 PAGE DÉTAILS DE PROJET
 */
const ProjectDetailPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // États
  const [project, setProject] = useState(null);
  const [projectQuests, setProjectQuests] = useState([]);
  const [allQuests, setAllQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLinkQuestModal, setShowLinkQuestModal] = useState(false);
  const [searchQuestTerm, setSearchQuestTerm] = useState('');

  // 🔥 CHARGEMENT DES DONNÉES
  useEffect(() => {
    if (!projectId || !user?.uid) return;

    console.log('🔄 [PROJECT-DETAIL] Chargement projet:', projectId);

    let unsubProject;
    let unsubQuests;

    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Écouter le projet
        const projectRef = doc(db, 'projects', projectId);
        unsubProject = onSnapshot(projectRef, (snapshot) => {
          if (snapshot.exists()) {
            const projectData = {
              id: snapshot.id,
              ...snapshot.data(),
              createdAt: snapshot.data().createdAt?.toDate(),
              updatedAt: snapshot.data().updatedAt?.toDate()
            };
            console.log('✅ [PROJECT-DETAIL] Projet chargé:', projectData.title);
            setProject(projectData);
          } else {
            console.error('❌ [PROJECT-DETAIL] Projet non trouvé');
            setError('Projet introuvable');
          }
          setLoading(false);
        });

        // 2. Écouter les quêtes du projet
        const questsQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        );

        unsubQuests = onSnapshot(questsQuery, (snapshot) => {
          const questsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          }));
          console.log('✅ [PROJECT-DETAIL] Quêtes chargées:', questsData.length);
          setProjectQuests(questsData);
        });

        // 3. Charger toutes les quêtes pour la liaison
        const allQuestsQuery = query(
          collection(db, 'tasks'),
          orderBy('createdAt', 'desc')
        );

        const allQuestsSnapshot = await getDocs(allQuestsQuery);
        const allQuestsData = allQuestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllQuests(allQuestsData);

      } catch (error) {
        console.error('❌ [PROJECT-DETAIL] Erreur chargement:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubProject) unsubProject();
      if (unsubQuests) unsubQuests();
    };
  }, [projectId, user?.uid]);

  // 📊 CALCUL DES STATISTIQUES
  const stats = {
    totalQuests: projectQuests.length,
    completedQuests: projectQuests.filter(q => q.status === 'completed').length,
    inProgressQuests: projectQuests.filter(q => q.status === 'in_progress').length,
    todoQuests: projectQuests.filter(q => q.status === 'todo').length,
    progress: projectQuests.length > 0 
      ? Math.round((projectQuests.filter(q => q.status === 'completed').length / projectQuests.length) * 100) 
      : 0
  };

  // 🔗 LIER UNE QUÊTE AU PROJET
  const handleLinkQuest = async (questId) => {
    try {
      console.log('🔗 [LINK] Liaison quête au projet:', questId, '→', projectId);
      
      const questRef = doc(db, 'tasks', questId);
      await updateDoc(questRef, {
        projectId: projectId,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [LINK] Quête liée avec succès');
      setShowLinkQuestModal(false);
      setSearchQuestTerm('');
      
    } catch (error) {
      console.error('❌ [LINK] Erreur liaison quête:', error);
      alert('Erreur lors de la liaison de la quête');
    }
  };

  // 🔓 DÉLIER UNE QUÊTE DU PROJET
  const handleUnlinkQuest = async (questId) => {
    if (!confirm('Êtes-vous sûr de vouloir délier cette quête du projet ?')) return;

    try {
      console.log('🔓 [UNLINK] Déliaison quête du projet:', questId);
      
      const questRef = doc(db, 'tasks', questId);
      await updateDoc(questRef, {
        projectId: null,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [UNLINK] Quête déliée avec succès');
      
    } catch (error) {
      console.error('❌ [UNLINK] Erreur déliaison quête:', error);
      alert('Erreur lors de la déliaison de la quête');
    }
  };

  // 🗑️ SUPPRIMER LE PROJET
  const handleDeleteProject = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Les quêtes liées seront déliées mais pas supprimées.')) return;

    try {
      console.log('🗑️ [DELETE] Suppression projet:', projectId);
      
      // Délier toutes les quêtes
      const batch = [];
      for (const quest of projectQuests) {
        const questRef = doc(db, 'tasks', quest.id);
        batch.push(updateDoc(questRef, { projectId: null }));
      }
      await Promise.all(batch);

      // Supprimer le projet
      await deleteDoc(doc(db, 'projects', projectId));
      
      console.log('✅ [DELETE] Projet supprimé avec succès');
      navigate('/projects');
      
    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression projet:', error);
      alert('Erreur lors de la suppression du projet');
    }
  };

  // 🔍 FILTRER LES QUÊTES DISPONIBLES
  const availableQuests = allQuests.filter(quest => 
    !quest.projectId && 
    (quest.title?.toLowerCase().includes(searchQuestTerm.toLowerCase()) ||
     quest.description?.toLowerCase().includes(searchQuestTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Chargement du projet...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">
              {error || 'Projet introuvable'}
            </h2>
            <button
              onClick={() => navigate('/projects')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux projets
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const statusConfig = PROJECT_STATUS[project.status] || PROJECT_STATUS.active;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* 📊 HEADER DU PROJET */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <button 
                onClick={() => navigate('/projects')}
                className="hover:text-white transition-colors"
              >
                Projets
              </button>
              <span>/</span>
              <span className="text-white">{project.title}</span>
            </div>

            {/* Titre et actions */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${statusConfig.bgColor}`}>
                  {project.icon || '📁'}
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {project.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                    {project.priority && (
                      <span className="text-sm text-gray-400">
                        Priorité: {project.priority}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-400 mt-3 max-w-2xl">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/projects')}
                  className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>
                <button
                  onClick={() => {/* TODO: Édition */}}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stats.totalQuests}</div>
                <div className="text-gray-400 text-sm">Quêtes totales</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.completedQuests}</div>
                <div className="text-gray-400 text-sm">Accomplies</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: `${(stats.completedQuests / stats.totalQuests) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-blue-400 mb-1">{stats.inProgressQuests}</div>
                <div className="text-gray-400 text-sm">En cours</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${(stats.inProgressQuests / stats.totalQuests) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.todoQuests}</div>
                <div className="text-gray-400 text-sm">À faire</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${(stats.todoQuests / stats.totalQuests) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-purple-400 mb-1">{stats.progress}%</div>
                <div className="text-gray-400 text-sm">Progression</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${stats.progress}%` }}></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 📑 ONGLETS */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 border-b border-gray-700/50 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'quests'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Sword className="h-4 w-4 inline mr-2" />
              Quêtes ({stats.totalQuests})
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Équipe
            </button>
          </div>

          {/* 📊 CONTENU DES ONGLETS */}
          <div className="pb-12">
            {/* Onglet Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <motion.div 
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    Progression du projet
                  </h3>
                  
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400">Progression globale</span>
                      <span className="text-2xl font-bold text-white">{stats.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${stats.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="text-sm text-gray-400 mb-2">Quêtes accomplies</div>
                      <div className="text-3xl font-bold text-green-400">{stats.completedQuests}</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="text-sm text-gray-400 mb-2">Quêtes en cours</div>
                      <div className="text-3xl font-bold text-blue-400">{stats.inProgressQuests}</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="text-sm text-gray-400 mb-2">Quêtes à faire</div>
                      <div className="text-3xl font-bold text-yellow-400">{stats.todoQuests}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Métadonnées */}
                <motion.div 
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-xl font-bold text-white mb-6">📋 Informations du projet</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Date de création</div>
                      <div className="text-white">
                        {project.createdAt 
                          ? project.createdAt.toLocaleDateString('fr-FR', { dateStyle: 'long' })
                          : 'Non définie'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Dernière mise à jour</div>
                      <div className="text-white">
                        {project.updatedAt 
                          ? project.updatedAt.toLocaleDateString('fr-FR', { dateStyle: 'long' })
                          : 'Non définie'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Créé par</div>
                      <div className="text-white font-mono text-sm">{project.createdBy}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Membres de l'équipe</div>
                      <div className="text-white">{project.members?.length || 0} membre(s)</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Onglet Quêtes */}
            {activeTab === 'quests' && (
              <div className="space-y-6">
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Sword className="h-6 w-6 text-blue-400" />
                    Quêtes du projet
                  </h3>
                  <button
                    onClick={() => setShowLinkQuestModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Lier une quête existante
                  </button>
                </div>

                {/* Liste des quêtes */}
                {projectQuests.length === 0 ? (
                  <motion.div 
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Sword className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Aucune quête liée</h4>
                    <p className="text-gray-400 mb-6">
                      Liez des quêtes existantes à ce projet pour organiser votre travail
                    </p>
                    <button
                      onClick={() => setShowLinkQuestModal(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Lier une quête
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {projectQuests.map((quest, index) => (
                      <motion.div
                        key={quest.id}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold text-white">{quest.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                quest.status === 'completed' ? 'bg-green-900/20 text-green-400 border border-green-500/30' :
                                quest.status === 'in_progress' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30' :
                                'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {quest.status === 'completed' ? '✅ Accomplie' :
                                 quest.status === 'in_progress' ? '⚔️ En cours' :
                                 '📋 À faire'}
                              </span>
                            </div>
                            {quest.description && (
                              <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {quest.createdAt?.toLocaleDateString('fr-FR')}
                              </span>
                              {quest.xpReward && (
                                <span className="flex items-center gap-1 text-yellow-400">
                                  <Star className="h-3 w-3" />
                                  {quest.xpReward} XP
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlinkQuest(quest.id)}
                            className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            title="Délier du projet"
                          >
                            <Unlink className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Onglet Équipe */}
            {activeTab === 'team' && (
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-400" />
                  Membres de l'équipe
                </h3>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Fonctionnalité de gestion d'équipe à venir</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 🔗 MODAL LIAISON QUÊTE */}
        <AnimatePresence>
          {showLinkQuestModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinkQuestModal(false)}
            >
              <motion.div
                className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <LinkIcon className="h-6 w-6 text-blue-400" />
                    Lier une quête existante
                  </h2>
                  <button
                    onClick={() => setShowLinkQuestModal(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Recherche */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Rechercher une quête..."
                      value={searchQuestTerm}
                      onChange={(e) => setSearchQuestTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Liste des quêtes disponibles */}
                <div className="space-y-3">
                  {availableQuests.length === 0 ? (
                    <div className="text-center py-12">
                      <Sword className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">
                        {searchQuestTerm 
                          ? 'Aucune quête trouvée'
                          : 'Aucune quête disponible (toutes sont déjà liées à des projets)'
                        }
                      </p>
                    </div>
                  ) : (
                    availableQuests.slice(0, 10).map((quest) => (
                      <div
                        key={quest.id}
                        className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                        onClick={() => handleLinkQuest(quest.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1">{quest.title}</h4>
                            {quest.description && (
                              <p className="text-sm text-gray-400 line-clamp-2">{quest.description}</p>
                            )}
                          </div>
                          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {availableQuests.length > 10 && (
                  <p className="text-center text-sm text-gray-400 mt-4">
                    Et {availableQuests.length - 10} autres quêtes... Affinez votre recherche
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ProjectDetailPage;
