// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN VALIDATION TÂCHES - VERSION COMPLÈTE AVEC MENU HAMBURGER
// REMPLACER COMPLÈTEMENT LE FICHIER EXISTANT PAR CE CODE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User,
  Calendar,
  FileText,
  Star,
  Trophy,
  RefreshCw,
  AlertTriangle,
  Filter,
  Search,
  Shield
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT STANDARD AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// Import authStore
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎨 COMPOSANT CARTE PREMIUM (intégré)
 */
const PremiumCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

/**
 * 🎨 COMPOSANT STAT CARD (intégré)
 */
const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => {
  const colorClasses = {
    yellow: 'from-yellow-500 to-orange-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-pink-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-violet-500'
  };

  return (
    <PremiumCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{trend}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </PremiumCard>
  );
};

/**
 * 🎨 COMPOSANT BOUTON PREMIUM (intégré)
 */
const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  onClick, 
  disabled = false,
  className = ""
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

/**
 * 🛡️ PAGE ADMIN - VALIDATION DES TÂCHES
 */
const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  
  // États de base
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  // Données simulées pour la démo
  const mockTasks = [
    {
      id: 1,
      title: 'Développer nouvelle feature',
      user: 'Thomas Dubois',
      userEmail: 'thomas.dubois@synergia.com',
      xpClaimed: 50,
      status: 'pending',
      description: 'Implémentation du système de badges avancé avec notifications temps réel',
      completedAt: new Date('2024-08-16T14:30:00'),
      evidence: 'Code committé sur GitHub avec tests unitaires et documentation technique complète',
      priority: 'high',
      category: 'Développement'
    },
    {
      id: 2,
      title: 'Design interface utilisateur',
      user: 'Sophie Laurent',
      userEmail: 'sophie.laurent@synergia.com',
      xpClaimed: 35,
      status: 'pending',
      description: 'Création de mockups et prototypes pour la nouvelle page analytics',
      completedAt: new Date('2024-08-15T16:45:00'),
      evidence: 'Fichiers Figma partagés avec équipe + présentation des wireframes',
      priority: 'medium',
      category: 'Design'
    },
    {
      id: 3,
      title: 'Optimisation base de données',
      user: 'Marc Rodriguez',
      userEmail: 'marc.rodriguez@synergia.com',
      xpClaimed: 75,
      status: 'pending',
      description: 'Amélioration des performances des requêtes Firebase et indexation',
      completedAt: new Date('2024-08-14T11:20:00'),
      evidence: 'Rapport de performance avec métriques avant/après et scripts d\'optimisation',
      priority: 'high',
      category: 'Backend'
    }
  ];

  // Initialiser les tâches simulées
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPendingTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  // Valider/Rejeter une tâche
  const validateTask = async (taskId, approved, notes = '') => {
    if (validating) return;
    
    setValidating(true);
    
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Retirer la tâche de la liste
      setPendingTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Afficher notification de succès
      const action = approved ? 'validée' : 'rejetée';
      alert(`✅ Tâche ${action} avec succès !`);
      
      console.log(`✅ Tâche ${action}:`, taskId, notes && `Notes: ${notes}`);
      
    } catch (error) {
      console.error('❌ Erreur validation tâche:', error);
      alert('❌ Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  };

  // Formatage de date français
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
        padding: '80px 20px 20px 20px' // Padding top pour éviter le bouton menu hamburger
      }}>
        
        {/* Header de la page */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Administration Synergia
              </h1>
              <p className="text-gray-400 text-lg">
                Validation des tâches - Bienvenue {user?.displayName || user?.email?.split('@')[0] || 'Admin'} ⚡
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <StatCard
            title="En Attente"
            value={pendingTasks.length}
            icon={Clock}
            color="yellow"
            trend="Nécessitent validation"
          />
          <StatCard
            title="Validées Aujourd'hui"
            value="12"
            icon={CheckCircle}
            color="green"
            trend="Approuvées"
          />
          <StatCard
            title="XP Distribués"
            value="840"
            icon={Trophy}
            color="purple"
            trend="Points attribués"
          />
        </motion.div>

        {/* Alerte pour les validations en attente */}
        {pendingTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PremiumCard className="mb-8 border-l-4 border-l-yellow-500 bg-yellow-500/10">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-1">
                    🚨 {pendingTasks.length} validation(s) en attente
                  </h3>
                  <p className="text-gray-300">
                    Des tâches nécessitent votre validation pour débloquer les utilisateurs et attribuer les XP.
                  </p>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* Liste des tâches à valider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <PremiumCard>
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-400">Chargement des tâches en attente...</p>
              </div>
            </PremiumCard>
          ) : pendingTasks.length === 0 ? (
            <PremiumCard>
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  🎉 Tout est à jour !
                </h3>
                <p className="text-gray-400">
                  Aucune tâche en attente de validation. Excellent travail d'équipe !
                </p>
              </div>
            </PremiumCard>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                📋 Tâches à valider ({pendingTasks.length})
              </h2>
              
              {pendingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <PremiumCard className="border-l-4 border-l-yellow-500">
                    <div className="flex items-start justify-between gap-6">
                      
                      {/* Informations de la tâche */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-400" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                              </span>
                              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                                {task.category}
                              </span>
                            </div>
                            
                            <p className="text-gray-400 mb-3">{task.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-300">
                                <User className="w-4 h-4 text-blue-400" />
                                <div>
                                  <span className="font-medium">{task.user}</span>
                                  <p className="text-xs text-gray-500">{task.userEmail}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <div>
                                  <span>Terminée le</span>
                                  <p className="text-xs text-gray-500">{formatDate(task.completedAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <Trophy className="w-4 h-4 text-yellow-400" />
                                <div>
                                  <span className="font-medium">{task.xpClaimed} XP</span>
                                  <p className="text-xs text-gray-500">Réclamés</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Preuve fournie */}
                            <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="font-medium text-blue-300">Preuve fournie :</span>
                              </div>
                              <p className="text-gray-300 text-sm">{task.evidence}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions de validation */}
                      <div className="flex flex-col gap-2">
                        <PremiumButton
                          variant="secondary"
                          icon={Eye}
                          size="sm"
                        >
                          Détails
                        </PremiumButton>
                        <PremiumButton
                          variant="success"
                          icon={CheckCircle}
                          size="sm"
                          onClick={() => validateTask(task.id, true, `Tâche approuvée - ${task.xpClaimed} XP attribués`)}
                          disabled={validating}
                        >
                          {validating ? 'Validation...' : 'Valider'}
                        </PremiumButton>
                        <PremiumButton
                          variant="danger"
                          icon={XCircle}
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Raison du rejet (obligatoire) :');
                            if (reason && reason.trim()) {
                              validateTask(task.id, false, reason.trim());
                            }
                          }}
                          disabled={validating}
                        >
                          Rejeter
                        </PremiumButton>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Actions supplémentaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center gap-4"
        >
          <PremiumButton
            variant="secondary"
            icon={RefreshCw}
            onClick={() => window.location.reload()}
          >
            Actualiser
          </PremiumButton>
          
          <PremiumButton
            variant="primary"
            icon={Shield}
            onClick={() => window.history.back()}
          >
            Retour Administration
          </PremiumButton>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminTaskValidationPage;
