// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// CORRECTION GESTIONNAIRES onEdit DANS TASKCARD
// ==========================================

// DANS LA SECTION "Mes Tâches" - Corriger le gestionnaire onEdit
{getFilteredTasks(myTasks).length === 0 ? (
  <div className="bg-white rounded-lg shadow p-12 text-center">
    <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {myTasks.length === 0 ? 'Aucune tâche assignée' : 'Aucune tâche ne correspond aux filtres'}
    </h3>
    <p className="text-gray-500">
      {myTasks.length === 0 
        ? 'Prenez une tâche disponible ou demandez une assignation !'
        : 'Essayez de modifier vos filtres de recherche.'
      }
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {getFilteredTasks(myTasks).map(task => (
      <TaskCard 
        key={task.id} 
        task={task} 
        isMyTask={true}
        // ✅ CORRECTION : Gestionnaire onEdit amélioré
        onEdit={(task) => {
          console.log('📝 [EDIT] Ouverture modal édition pour:', task.title);
          console.log('📝 [EDIT] Données tâche:', task);
          setSelectedTask(task);
          setShowCreateModal(true);
        }}
        onDelete={async (task) => {
          console.log('🗑️ [DELETE] Suppression tâche:', task.id);
          if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
            await handleDeleteTask(task.id);
          }
        }}
        onViewDetails={handleViewDetails}
        onSubmit={handleSubmitTask}
      />
    ))}
  </div>
)}

// DANS LA SECTION "Tâches Disponibles" - S'assurer qu'il n'y a pas d'onEdit
{getFilteredTasks(availableTasks).length === 0 ? (
  <div className="bg-white rounded-lg shadow p-12 text-center">
    <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {availableTasks.length === 0 ? 'Aucune tâche disponible' : 'Aucune tâche ne correspond aux filtres'}
    </h3>
    <p className="text-gray-500">
      {availableTasks.length === 0 
        ? 'Toutes les tâches sont assignées ou créez-en une nouvelle !'
        : 'Essayez de modifier vos filtres de recherche.'
      }
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {getFilteredTasks(availableTasks).map(task => (
      <TaskCard 
        key={task.id} 
        task={task} 
        isMyTask={false}
        showVolunteerButton={true}
        // ✅ PAS d'onEdit pour les tâches disponibles (pas le propriétaire)
        onViewDetails={handleViewDetails}
      />
    ))}
  </div>
)}

// DANS LA SECTION "Autres Tâches" - onEdit seulement si propriétaire
{getFilteredTasks(otherTasks).length === 0 ? (
  <div className="bg-white rounded-lg shadow p-12 text-center">
    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {otherTasks.length === 0 ? 'Aucune autre tâche assignée' : 'Aucune tâche ne correspond aux filtres'}
    </h3>
    <p className="text-gray-500">
      {otherTasks.length === 0 
        ? 'Toutes les tâches sont soit disponibles, soit vous sont assignées.'
        : 'Essayez de modifier vos filtres de recherche.'
      }
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {getFilteredTasks(otherTasks).map(task => (
      <TaskCard 
        key={task.id} 
        task={task} 
        isMyTask={false}
        // ✅ CORRECTION : onEdit seulement si créateur de la tâche
        onEdit={task.createdBy === user?.uid ? ((task) => {
          console.log('📝 [EDIT] Ouverture modal édition pour tâche créée par moi:', task.title);
          setSelectedTask(task);
          setShowCreateModal(true);
        }) : undefined}
        onViewDetails={handleViewDetails}
      />
    ))}
  </div>
)}
