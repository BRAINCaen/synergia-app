// ==========================================
// 🔧 CORRECTION COMPLÈTE DU FILTRAGE DES TÂCHES
// Fichier: react-app/src/pages/TasksPage.jsx
// Remplacer les logiques existantes (PAS ajouter de nouvelles variables)
// ==========================================

// ✅ CORRECTION 2: Tâches disponibles - REMPLACER LA LOGIQUE EXISTANTE
// Trouver cette ligne dans le fichier et remplacer uniquement le contenu du .filter()

const availableTasksList = allTasks.filter(task => {
  const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
  const isCreatedByMe = task.createdBy === user.uid;
  const hasAssignees = (task.assignedTo || []).length > 0;
  
  // ✅ NOUVELLE LOGIQUE: Disponible si :
  // 1. Pas assignée à moi ET pas créée par moi
  // 2. ET statut ouvert (pending, open, todo)
  // 3. ET (pas d'assignés OU ouverte aux volontaires)
  const isAvailableStatus = ['pending', 'open', 'todo'].includes(task.status);
  
  // ✅ CORRECTION CLÉE: Inclure les tâches collaboratives
  const isOpenForVolunteers = !hasAssignees || task.openToVolunteers === true;
  
  // ✅ CONDITION FINALE SIMPLIFIÉE
  const result = !isAssignedToMe && !isCreatedByMe && isAvailableStatus && isOpenForVolunteers;
  
  if (result) {
    console.log(`📊 [4] TÂCHE DISPONIBLE: "${task.title}" - Status: ${task.status}, OpenToVolunteers: ${task.openToVolunteers}, HasAssignees: ${hasAssignees}`);
  }
  
  return result;
});

// ✅ CORRECTION 3: Tâches des autres - REMPLACER LA LOGIQUE EXISTANTE
// Trouver cette ligne dans le fichier et remplacer uniquement le contenu du .filter()

const otherTasksList = allTasks.filter(task => {
  const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
  const isCreatedByMe = task.createdBy === user.uid;
  const hasAssignees = (task.assignedTo || []).length > 0;
  
  // ✅ NOUVELLES CONDITIONS: Autres tâches si :
  // 1. Assignées à d'autres personnes (pas à moi) ET PAS ouvertes aux volontaires
  // 2. OU créées par moi mais pas assignées à moi
  const isAssignedToOthersOnly = hasAssignees && !isAssignedToMe && !task.openToVolunteers;
  const isMyCreationNotAssignedToMe = isCreatedByMe && !isAssignedToMe;
  
  const result = isAssignedToOthersOnly || isMyCreationNotAssignedToMe;
  
  if (result) {
    console.log(`📊 [5] TÂCHE DES AUTRES: "${task.title}" - Assignés: ${task.assignedTo?.length || 0}, Créé par moi: ${isCreatedByMe}, OpenToVolunteers: ${task.openToVolunteers}`);
  }
  
  return result;
});

// ==========================================
// 🚨 IMPORTANT: SUPPRIMER LA DUPLICATION
// 
// Dans le fichier TasksPage.jsx, chercher s'il y a une DEUXIÈME déclaration
// de "const otherTasksList" ou "otherTasksList =" et la SUPPRIMER ENTIÈREMENT
// 
// La variable ne doit être déclarée qu'UNE SEULE FOIS dans le scope !
// ==========================================

// ==========================================
// 📝 RÉSUMÉ DES CHANGEMENTS:
//
// AVANT (PROBLÉMATIQUE):
// - availableTasksList: logique simple sans tâches collaboratives
// - otherTasksList: toutes les tâches assignées à d'autres (même collaboratives)
// - DUPLICATION: otherTasksList déclarée deux fois → ERREUR BUILD
//
// APRÈS (CORRIGÉ):
// - availableTasksList: inclut les tâches collaboratives (openToVolunteers: true)
// - otherTasksList: uniquement tâches fermées + mes créations non assignées
// - PAS DE DUPLICATION: variables déclarées une seule fois
//
// RÉSULTAT UTILISATEUR:
// - Tâches collaboratives → TACHES DISPONIBLES ✅
// - Tâches fermées → LES AUTRES TACHES ✅
// - Plus d'erreur de build ✅
// ==========================================
export default TasksPage;
