// ==========================================
// 🔧 CORRECTION DU FILTRAGE DES TÂCHES COLLABORATIVES
// Fichier: react-app/src/pages/TasksPage.jsx
// Lignes à modifier: 220-235 (availableTasksList)
// ==========================================

// ✅ CORRECTION 2: Tâches disponibles - NOUVELLE LOGIQUE
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

// ✅ CORRECTION 3: Tâches des autres - LOGIQUE MISE À JOUR
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

// ✅ CORRECTION 3: Tâches des autres - LOGIQUE MISE À JOUR
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
// 📝 RÉSUMÉ DES CHANGEMENTS:
//
// AVANT:
// - Tâches collaboratives (openToVolunteers: true) → LES AUTRES TACHES
// - Utilisateur ne pouvait pas les voir facilement pour se porter volontaire
//
// APRÈS:
// - Tâches collaboratives (openToVolunteers: true) → TACHES DISPONIBLES
// - Tâches réservées (assignées + !openToVolunteers) → LES AUTRES TACHES
// - Utilisateur peut maintenant rejoindre les tâches collaboratives
//
// ==========================================
