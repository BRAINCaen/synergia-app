// ==========================================
// CORRECTIFS POUR LES BOUTONS DE VOLONTARIAT
// À intégrer dans vos composants de tâches existants
// ==========================================

// 🔥 IMPORT DU SERVICE (à ajouter en haut de vos fichiers)
import { taskVolunteerService } from '../../core/services/taskVolunteerService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

// 📋 EXEMPLE D'INTÉGRATION DANS UNE CARTE DE TÂCHE
const TaskCardWithVolunteer = ({ task, onTaskUpdate }) => {
  const { user } = useAuthStore();
  const [volunteering, setVolunteering] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);

  // Vérifier le statut d'assignation
  useEffect(() => {
    const checkStatus = async () => {
      if (!task?.id || !user?.uid) return;
      
      try {
        const status = await taskVolunteerService.checkAssignmentStatus(task.id, user.uid);
        setIsAssigned(status.assigned);
      } catch (error) {
        console.error('Erreur vérification statut:', error);
      }
    };

    checkStatus();
  }, [task?.id, user?.uid]);

  // 🙋‍♂️ FONCTION SE PORTER VOLONTAIRE
  const handleVolunteer = async () => {
    if (!user?.uid || !task?.id || volunteering) return;

    setVolunteering(true);
    try {
      if (isAssigned) {
        // Se désassigner
        await taskVolunteerService.unassignFromTask(task.id, user.uid);
        setIsAssigned(false);
      } else {
        // Se porter volontaire
        await taskVolunteerService.volunteerForTask(task.id, user.uid);
        setIsAssigned(true);
      }
      
      // Optionnel : notifier le parent pour rafraîchir la liste
      if (onTaskUpdate) {
        onTaskUpdate(task.id);
      }
      
    } catch (error) {
      console.error('Erreur volontariat:', error);
      // L'erreur est déjà affichée par le service
    } finally {
      setVolunteering(false);
    }
  };

  return (
    <div className="task-card bg-gray-800 rounded-lg p-4">
      {/* Contenu de la tâche */}
      <h3 className="text-white font-semibold">{task.title}</h3>
      <p className="text-gray-300 text-sm">{task.description}</p>
      
      {/* Section boutons */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Détails
          </button>
          <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
            Modifier
          </button>
        </div>
        
        {/* 🔥 BOUTON VOLONTARIAT CORRIGÉ */}
        <button
          onClick={handleVolunteer}
          disabled={volunteering || !user}
          className={`px-3 py-1 text-sm rounded border transition-colors disabled:opacity-50 ${
            isAssigned
              ? 'border-red-600 text-red-400 hover:bg-red-900/20'
              : 'border-green-600 text-green-400 hover:bg-green-900/20'
          }`}
        >
          {volunteering ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Traitement...
            </div>
          ) : isAssigned ? (
            'Se désassigner'
          ) : (
            'Se porter volontaire'
          )}
        </button>
      </div>
      
      {/* Indicateur d'assignation */}
      {isAssigned && (
        <div className="mt-2 px-2 py-1 bg-green-900/30 border border-green-600/50 rounded text-green-300 text-xs">
          ✅ Vous êtes assigné à cette tâche
        </div>
      )}
    </div>
  );
};

// 📋 EXEMPLE D'INTÉGRATION DANS LA LISTE DES TÂCHES
const TasksPageWithVolunteer = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  // Fonction pour rafraîchir les tâches après volontariat
  const handleTaskUpdate = async (taskId) => {
    try {
      // Recharger la tâche mise à jour
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (taskDoc.exists()) {
        const updatedTask = { id: taskDoc.id, ...taskDoc.data() };
        
        // Mettre à jour dans la liste générale
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? updatedTask : task
          )
        );
        
        // Mettre à jour la liste "Mes tâches"
        const isAssignedToMe = (updatedTask.assignedTo || updatedTask.assignedUsers || []).includes(user?.uid);
        
        if (isAssignedToMe) {
          // Ajouter à mes tâches
          setMyTasks(prevMyTasks => {
            const exists = prevMyTasks.some(task => task.id === taskId);
            return exists ? prevMyTasks.map(task => task.id === taskId ? updatedTask : task) : [...prevMyTasks, updatedTask];
          });
        } else {
          // Retirer de mes tâches
          setMyTasks(prevMyTasks => prevMyTasks.filter(task => task.id !== taskId));
        }
      }
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
    }
  };

  return (
    <div className="tasks-page">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Colonne Toutes les tâches */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Toutes les tâches</h2>
          <div className="space-y-4">
            {tasks.map(task => (
              <TaskCardWithVolunteer
                key={task.id}
                task={task}
                onTaskUpdate={handleTaskUpdate}
              />
            ))}
          </div>
        </div>
        
        {/* Colonne Mes tâches */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            Mes tâches ({myTasks.length})
          </h2>
          <div className="space-y-4">
            {myTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Vous n'avez aucune tâche assignée</p>
                <p className="text-sm mt-1">Portez-vous volontaire pour des tâches !</p>
              </div>
            ) : (
              myTasks.map(task => (
                <TaskCardWithVolunteer
                  key={task.id}
                  task={task}
                  onTaskUpdate={handleTaskUpdate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔥 HOOK PERSONNALISÉ POUR VOLONTARIAT
export const useTaskVolunteer = (taskId) => {
  const { user } = useAuthStore();
  const [isAssigned, setIsAssigned] = useState(false);
  const [volunteering, setVolunteering] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérifier le statut initial
  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!taskId || !user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const status = await taskVolunteerService.checkAssignmentStatus(taskId, user.uid);
        setIsAssigned(status.assigned);
      } catch (error) {
        console.error('Erreur vérification statut initial:', error);
      } finally {
        setLoading(false);
      }
    };

    checkInitialStatus();
  }, [taskId, user?.uid]);

  // Fonction de volontariat
  const toggleVolunteer = async () => {
    if (!user?.uid || !taskId || volunteering) return;

    setVolunteering(true);
    try {
      if (isAssigned) {
        await taskVolunteerService.unassignFromTask(taskId, user.uid);
        setIsAssigned(false);
      } else {
        await taskVolunteerService.volunteerForTask(taskId, user.uid);
        setIsAssigned(true);
      }
    } catch (error) {
      console.error('Erreur toggle volontariat:', error);
    } finally {
      setVolunteering(false);
    }
  };

  return {
    isAssigned,
    volunteering,
    loading,
    toggleVolunteer,
    canVolunteer: !!user?.uid && !!taskId
  };
};

// 🎯 BOUTON VOLONTAIRE RÉUTILISABLE
export const VolunteerButton = ({ taskId, className = '', size = 'sm' }) => {
  const { isAssigned, volunteering, toggleVolunteer, canVolunteer } = useTaskVolunteer(taskId);

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={toggleVolunteer}
      disabled={!canVolunteer || volunteering}
      className={`
        ${sizeClasses[size]}
        rounded border transition-colors disabled:opacity-50
        ${isAssigned
          ? 'border-red-600 text-red-400 hover:bg-red-900/20'
          : 'border-green-600 text-green-400 hover:bg-green-900/20'
        }
        ${className}
      `}
    >
      {volunteering ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          Traitement...
        </div>
      ) : isAssigned ? (
        'Se désassigner'
      ) : (
        'Se porter volontaire'
      )}
    </button>
  );
};

export default TaskCardWithVolunteer;
