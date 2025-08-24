// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN VALIDATION TÂCHES - DESIGN HARMONISÉ AVEC MENU
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

// 🎯 IMPORT DU LAYOUT STANDARD AVEC MENU HAMBURGER (comme les autres pages)
import Layout from '../components/layout/Layout.jsx';

// 🎨 IMPORT DES COMPOSANTS PREMIUM POUR HARMONISER LE DESIGN
import { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Firebase imports
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🛡️ PAGE ADMIN - VALIDATION DES TÂCHES
 */
const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  
  // États de base
  const [tasksToValidate, setTasksToValidate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    pending: 0,
    validated: 0,
    rejected: 0,
    totalXpAwarded: 0
  });

  // Charger les tâches en attente de validation
  useEffect(() => {
    if (!user) return;
    
    const loadTasksToValidate = () => {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('status', '==', 'completed'),
        where('needsValidation', '==', true),
        orderBy('completedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = [];
        snapshot.forEach((doc) => {
          tasks.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setTasksToValidate(tasks);
        
        // Calculer les stats
        const pending = tasks.filter(t => !t.validatedAt).length;
        const validated = tasks.filter(t => t.validatedAt && t.validationStatus === 'approved').length;
        const rejected = tasks.filter(t => t.validatedAt && t.validationStatus === 'rejected').length;
        const totalXp = tasks.reduce((sum, t) => sum + (t.xpAwarded || 0), 0);
        
        setStats({
          pending,
          validated,
          rejected,
          totalXpAwarded: totalXp
        });
        
        setLoading(false);
      });
      
      return unsubscribe;
    };
    
    const unsubscribe = loadTasksToValidate();
    return () => unsubscribe && unsubscribe();
  }, [user]);

  // Valider/Rejeter une tâche
  const validateTask = async (taskId, approved, xpAmount = 0, notes = '') => {
    if (!user || validating) return;
    
    setValidating(true);
    
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const validationData = {
        validatedAt: new Date(),
        validatedBy: user.uid,
        validatorName: user.displayName || user.email,
        validationStatus: approved ? 'approved' : 'rejected',
        validationNotes: notes,
        needsValidation: false
      };
      
      if (approved && xpAmount > 0) {
        validationData.xpAwarded = xpAmount;
      }
      
      await updateDoc(taskRef, validationData);
      
      console.log(`✅ Tâche ${approved ? 'validée' : 'rejetée'}:`, taskId);
      
    } catch (error) {
      console.error('❌ Erreur validation tâche:', error);
      alert('Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  };

  // Filtrer les tâches selon les critères
  const filteredTasks = tasksToValidate.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'pending' && !task.validatedAt) ||
                         (filterStatus === 'validated' && task.validatedAt);
    
    return matchesSearch && matchesFilter;
  });

  // Formatage de date
  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', {
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Administration Synergia
                </h1>
                <p className="text-gray-400 text-lg">
                  Panneau de contrôle administrateur - Bienvenue {user?.displayName || user?.email?.split('@')[0] || 'Admin'} ⚡
                </p>
              </div>
            </div>
            
            <PremiumButton
              variant="secondary"
              icon={RefreshCw}
              onClick={() => window.location.reload()}
            >
              Actualiser
            </PremiumButton>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="En Attente"
            value={stats.pending}
            icon={Clock}
            color="yellow"
            trend="Nécessite validation"
          />
          <StatCard
            title="Validées"
            value={stats.validated}
            icon={CheckCircle}
            color="green"
            trend="Approuvées"
          />
          <StatCard
            title="Rejetées" 
            value={stats.rejected}
            icon={XCircle}
            color="red"
            trend="Non approuvées"
          />
          <StatCard
            title="XP Attribués"
            value={stats.totalXpAwarded}
            icon={Trophy}
            color="purple"
            trend="Points d'expérience"
          />
        </motion.div>

        {/* Alerte pour les validations en attente */}
        {stats.pending > 0 && (
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
                    {stats.pending} validation(s) en attente
                  </h3>
                  <p className="text-gray-300">
                    Des tâches nécessitent votre validation pour débloquer les utilisateurs.
                  </p>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* Outils d'Administration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <PremiumCard>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              Outils d'Administration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Validation Tâches */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer hover:scale-105">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Validation Tâches</h3>
                    <p className="text-sm text-gray-400">Approuver les tâches terminées</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-400">{stats.pending}</span>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full">
                    En attente
                  </span>
                </div>
              </div>

              {/* Validation Objectifs */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer hover:scale-105"
                   onClick={() => window.location.href = '/admin/objective-validation'}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Validation Objectifs</h3>
                    <p className="text-sm text-gray-400">Validation des objectifs utilisateur</p>
                  </div>
                </div>
              </div>

              {/* Gestion Utilisateurs */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-indigo-500/50 transition-all cursor-pointer hover:scale-105"
                   onClick={() => window.location.href = '/admin/users'}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Gestion Utilisateurs</h3>
                    <p className="text-sm text-gray-400">Administration des comptes</p>
                  </div>
                </div>
              </div>

              {/* Gestion Badges */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all cursor-pointer hover:scale-105"
                   onClick={() => window.location.href = '/admin/badges'}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Gestion Badges</h3>
                    <p className="text-sm text-gray-400">Configuration du système de badges</p>
                  </div>
                </div>
              </div>

              {/* Permissions & Rôles */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all cursor-pointer hover:scale-105"
                   onClick={() => window.location.href = '/admin/roles'}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Permissions & Rôles</h3>
                    <p className="text-sm text-gray-400">Gestion des droits utilisateur</p>
                  </div>
                </div>
              </div>

              {/* Test Complet */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all cursor-pointer hover:scale-105"
                   onClick={() => window.location.href = '/admin/complete-test'}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Test Complet</h3>
                    <p className="text-sm text-gray-400">Test de tous les systèmes</p>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Filtrages et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <PremiumCard>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes les tâches</option>
                  <option value="pending">En attente</option>
                  <option value="validated">Validées</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-400">
                {filteredTasks.length} tâche(s) trouvée(s)
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Liste des tâches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <PremiumCard>
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-400">Chargement des tâches...</p>
              </div>
            </PremiumCard>
          ) : filteredTasks.length === 0 ? (
            <PremiumCard>
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'Aucun résultat' : 'Tout est à jour !'}
                </h3>
                <p className="text-gray-400">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Aucune tâche ne correspond aux critères de recherche.' 
                    : 'Aucune tâche en attente de validation.'}
                </p>
              </div>
            </PremiumCard>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <PremiumCard className={`${!task.validatedAt ? 'border-l-4 border-l-yellow-500' : ''}`}>
                    <div className="flex items-start justify-between gap-6">
                      
                      {/* Informations de la tâche */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            !task.validatedAt ? 'bg-yellow-500/20' : 
                            task.validationStatus === 'approved' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {!task.validatedAt ? (
                              <Clock className="w-6 h-6 text-yellow-400" />
                            ) : task.validationStatus === 'approved' ? (
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-400" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">{task.title}</h3>
                            <p className="text-gray-400 mb-3">{task.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-300">
                                <User className="w-4 h-4 text-blue-400" />
                                <span>Par {task.assignedUserName || 'Inconnu'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <span>Terminé le {formatDate(task.completedAt)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <Trophy className="w-4 h-4 text-yellow-400" />
                                <span>{task.xpValue || 0} XP</span>
                              </div>
                              {task.validatedAt && (
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Shield className="w-4 h-4 text-green-400" />
                                  <span>Validé le {formatDate(task.validatedAt)}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Preuve fournie */}
                            {task.evidence && (
                              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4 text-blue-400" />
                                  <span className="font-medium text-blue-300">Preuve fournie:</span>
                                </div>
                                <p className="text-gray-300 text-sm">{task.evidence}</p>
                              </div>
                            )}
                            
                            {/* Notes de validation */}
                            {task.validationNotes && (
                              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Shield className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-300">Notes de validation:</span>
                                </div>
                                <p className="text-gray-400 text-sm">{task.validationNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions de validation */}
                      {!task.validatedAt && (
                        <div className="flex gap-2">
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
                            onClick={() => validateTask(task.id, true, task.xpValue || 10)}
                            disabled={validating}
                          >
                            Valider
                          </PremiumButton>
                          <PremiumButton
                            variant="danger"
                            icon={XCircle}
                            size="sm"
                            onClick={() => validateTask(task.id, false)}
                            disabled={validating}
                          >
                            Rejeter
                          </PremiumButton>
                        </div>
                      )}
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminTaskValidationPage;
