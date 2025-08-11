// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// CORRECTION GESTIONNAIRE CRÉATION TÂCHES - FIX CREATEDBY
// ==========================================

// À REMPLACER dans le fichier TasksPage.jsx existant :

/**
 * 📝 GESTIONNAIRE CRÉATION TÂCHE CORRIGÉ
 */
const handleCreateTask = async (taskData) => {
  setSubmitting(true);
  setError('');
  
  try {
    console.log('📝 [TASKS_PAGE] Création tâche demandée...');
    console.log('📝 [TASKS_PAGE] Données reçues:', taskData);
    console.log('📝 [TASKS_PAGE] Utilisateur:', user?.uid);
    
    // ✅ VÉRIFICATION UTILISATEUR OBLIGATOIRE
    if (!user || !user.uid) {
      throw new Error('Utilisateur non connecté. Veuillez vous reconnecter.');
    }
    
    // ✅ IMPORT DYNAMIQUE DU SERVICE CORRIGÉ
    const { createTaskSafely } = await import('../core/services/taskCreationFix.js');
    
    // ✅ UTILISER LE SERVICE CORRIGÉ
    const result = await createTaskSafely(taskData, user);
    
    if (result.success) {
      console.log('✅ [TASKS_PAGE] Tâche créée avec succès:', result.id);
      
      // Fermer le modal
      setShowCreateModal(false);
      
      // Recharger les tâches
      await loadTasks();
      
      // Notification de succès
      console.log('✅ Tâche créée:', result.task.title);
      
    } else {
      console.error('❌ [TASKS_PAGE] Erreur création:', result.error);
      setError(result.message || 'Erreur lors de la création');
    }
    
  } catch (error) {
    console.error('❌ [TASKS_PAGE] Erreur gestionnaire:', error);
    setError('Erreur lors de la création: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};

/**
 * 📝 GESTIONNAIRE ÉDITION TÂCHE CORRIGÉ
 */
const handleEditTask = async (taskData) => {
  if (!selectedTask) return;
  
  setSubmitting(true);
  setError('');
  
  try {
    console.log('📝 [TASKS_PAGE] Édition tâche demandée...');
    console.log('📝 [TASKS_PAGE] Tâche ID:', selectedTask.id);
    console.log('📝 [TASKS_PAGE] Nouvelles données:', taskData);
    
    // ✅ VÉRIFICATION UTILISATEUR
    if (!user || !user.uid) {
      throw new Error('Utilisateur non connecté. Veuillez vous reconnecter.');
    }
    
    // ✅ UTILISER LE SERVICE STANDARD POUR L'ÉDITION
    await taskService.updateTask(selectedTask.id, {
      ...taskData,
      updatedAt: new Date(),
      updatedBy: user.uid // Ajouter qui a modifié
    });
    
    console.log('✅ [TASKS_PAGE] Tâche modifiée avec succès');
    
    // Fermer le modal
    setShowCreateModal(false);
    setSelectedTask(null);
    
    // Recharger les tâches
    await loadTasks();
    
  } catch (error) {
    console.error('❌ [TASKS_PAGE] Erreur édition:', error);
    setError('Erreur lors de la modification: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};

/**
 * 📝 GESTIONNAIRE SUPPRESSION TÂCHE CORRIGÉ
 */
const handleDeleteTask = async (taskId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
  
  try {
    console.log('🗑️ [TASKS_PAGE] Suppression tâche:', taskId);
    
    // ✅ VÉRIFICATION UTILISATEUR
    if (!user || !user.uid) {
      throw new Error('Utilisateur non connecté. Veuillez vous reconnecter.');
    }
    
    await taskService.deleteTask(taskId);
    
    console.log('✅ [TASKS_PAGE] Tâche supprimée avec succès');
    
    // Recharger les tâches
    await loadTasks();
    
  } catch (error) {
    console.error('❌ [TASKS_PAGE] Erreur suppression:', error);
    setError('Erreur lors de la suppression: ' + error.message);
  }
};

// ==========================================
// 📝 CODE COMPLET À AJOUTER DANS LE COMPOSANT TASKPAGE
// ==========================================

// À placer dans le JSX, remplacer la modal existante :

{/* 📝 MODAL CRÉATION/ÉDITION CORRIGÉE */}
{showCreateModal && (
  <React.Suspense fallback={
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Chargement du formulaire...</span>
        </div>
      </div>
    </div>
  }>
    <NewTaskModal
      isOpen={showCreateModal}
      onClose={() => {
        setShowCreateModal(false);
        setSelectedTask(null);
        setError('');
      }}
      onSuccess={handleCreateTask}
      initialData={selectedTask}
      mode={selectedTask ? 'edit' : 'create'}
    />
  </React.Suspense>
)}

// ==========================================
// 📝 IMPORT NÉCESSAIRE À AJOUTER EN HAUT DU FICHIER
// ==========================================

import React, { useState, useEffect, Suspense } from 'react';
// ... autres imports existants ...

// ✅ IMPORT CONDITIONNEL DU MODAL CORRIGÉ
const NewTaskModal = React.lazy(() => import('../components/tasks/NewTaskModal.jsx'));

console.log('📝 TasksPage gestionnaires corrigés - Fix createdBy undefined');
