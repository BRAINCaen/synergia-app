// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// COMPOSANT TASK CARD - CORRECTION BOUTON VOLONTAIRE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Users, 
  Trophy, 
  Heart, 
  MessageCircle, 
  Clock, 
  AlertCircle,
  UserPlus,
  UserMinus,
  Bell,
  CheckCircle,
  Play
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import SubmitTaskButton from '../../components/tasks/SubmitTaskButton.jsx';

/**
 * 💬 COMPOSANT BADGE DE COMMENTAIRES AVEC NOTIFICATION
 */
const CommentNotificationBadge = ({ taskId, onClick, className = '' }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [hasNewComments, setHasNewComments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommentData = async () => {
      if (!taskId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // 📖 IMPORT FIREBASE DIRECT
        const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
        const { db } = await import('../../core/firebase.js');

        // 📊 COMPTER LES COMMENTAIRES
        const commentsRef = collection(db, 'task_comments');
        const commentsQuery = query(
          commentsRef,
          where('taskId', '==', taskId),
          orderBy('createdAt', 'desc')
        );
        
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setCommentCount(commentsData.length);
        
        // 🔍 VÉRIFIER S'IL Y A DE NOUVEAUX COMMENTAIRES (dernières 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentComments = commentsData.filter(comment => {
          const commentDate = comment.createdAt?.toDate?.() || new Date(comment.createdAt);
          return commentDate > oneDayAgo;
        });

        setHasNewComments(recentComments.length > 0);

      } catch (error) {
        console.warn('⚠️ Erreur chargement commentaires:', error);
        setCommentCount(0);
        setHasNewComments(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommentData();
  }, [taskId]);

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all transform hover:scale-105 ${
        isLoading
          ? 'bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30'
          : hasNewComments
            ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50 hover:bg-blue-500/40 animate-pulse'
            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
      } ${className}`}
      title={
        commentCount === 0 
          ? "Aucun commentaire - Cliquer pour ajouter"
          : `${commentCount} commentaire${commentCount > 1 ? 's' : ''} - ${hasNewComments ? 'Nouveaux messages !' : 'Cliquer pour voir'}`
      }
    >
      <MessageCircle className="w-3 h-3" />
      <span>{commentCount}</span>
      
      {/* 🚨 INDICATEUR VISUEL POUR NOUVEAUX COMMENTAIRES */}
      {hasNewComments && commentCount > 0 && (
        <>
          {/* Point rouge animé */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-gray-800">
            <div className="w-full h-full bg-red-500 rounded-full animate-ping" />
          </div>
          
          {/* Icône de notification */}
          <Bell className="w-2 h-2 text-yellow-400 animate-bounce ml-1" />
        </>
      )}
    </button>
  );
};

/**
 * 🏷️ COMPOSANT BADGE DE PRIORITÉ
 */
const PriorityBadge = ({ priority }) => {
  const priorityConfigs = {
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Basse', icon: Clock },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moyenne', icon: AlertCircle },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Haute', icon: AlertCircle },
    urgent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgente', icon: AlertCircle }
  };

  const config = priorityConfigs[priority] || priorityConfigs.medium;
  const IconComponent = config.icon;

  return (
    <span className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/**
 * 🎯 COMPOSANT TASKCARD AVEC NOMS UTILISATEURS RÉSOLUS ET BOUTON VOLONTAIRE CORRIGÉ
 */
const TaskCard = ({ 
  task, 
  currentUser,
  onEdit, 
  onDelete, 
  onViewDetails, 
  onSubmit,
  onVolunteer,
  onUnvolunteer,
  onTaskUpdate,
  isMyTask = false
}) => {
  const { user } = useAuthStore();
  const [isVolunteering, setIsVolunteering] = useState(false);
  
  // ✅ NOUVEAUX ÉTATS POUR LES NOMS D'UTILISATEURS
  const [creatorName, setCreatorName] = useState('Chargement...');
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [loadingUserNames, setLoadingUserNames] = useState(true);

  // ✅ Vérifications de statut CORRIGÉES
  const isTaskOwner = user && task && task.createdBy === user.uid;
  const isAssignedToMe = Array.isArray(task.assignedTo) 
    ? task.assignedTo.includes(user.uid)
    : task.assignedTo === user.uid;
  
  // 🔥 CORRECTION : Condition simple pour le bouton volontaire
  const canVolunteer = user && 
    task && 
    !isAssignedToMe &&
    !isTaskOwner &&
    (task.status === 'todo' || task.openToVolunteers) &&
    task.openToVolunteers === true &&
    onVolunteer; // S'assurer que la fonction est disponible

  // ✅ NOUVEAU useEffect POUR CHARGER LES NOMS D'UTILISATEURS
  useEffect(() => {
    const loadUserNames = async () => {
      if (!task) {
        setLoadingUserNames(false);
        return;
      }

      try {
        setLoadingUserNames(true);
        
        // 📖 IMPORT FIREBASE DIRECT
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../core/firebase.js');

        // 👤 CHARGER LE NOM DU CRÉATEUR
        if (task.createdBy) {
          try {
            const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
            if (creatorDoc.exists()) {
              const creatorData = creatorDoc.data();
              setCreatorName(creatorData.displayName || creatorData.name || creatorData.email || 'Utilisateur anonyme');
            } else {
              setCreatorName('Utilisateur anonyme');
            }
          } catch (error) {
            console.warn('Erreur chargement créateur:', error);
            setCreatorName('Utilisateur anonyme');
          }
        } else {
          setCreatorName('Utilisateur anonyme');
        }

        // 👥 CHARGER LES NOMS DES ASSIGNÉS
        if (task.assignedTo && task.assignedTo.length > 0) {
          const assignedArray = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
          const names = [];

          for (const userId of assignedArray) {
            if (userId) {
              try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  names.push(userData.displayName || userData.name || userData.email || 'Utilisateur anonyme');
                } else {
                  names.push('Utilisateur anonyme');
                }
              } catch (error) {
                console.warn('Erreur chargement assigné:', userId, error);
                names.push('Utilisateur anonyme');
              }
            }
          }

          setAssigneeNames(names);
        } else {
          setAssigneeNames([]);
        }

      } catch (error) {
        console.error('Erreur chargement données utilisateurs:', error);
        setCreatorName('Erreur chargement');
        setAssigneeNames([]);
      } finally {
        setLoadingUserNames(false);
      }
    };

    loadUserNames();
  }, [task]);

  // Fonction pour devenir volontaire
  const handleVolunteer = async () => {
    if (!onVolunteer || !user || !task) return;
    
    try {
      setIsVolunteering(true);
      console.log('🙋 Volontariat pour tâche:', task.title);
      
      await onVolunteer(task);
      
      if (onTaskUpdate) {
        onTaskUpdate();
      }

    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
    } finally {
      setIsVolunteering(false);
    }
  };

  // Fonction pour ne plus être volontaire
  const handleUnvolunteer = async () => {
    if (!onUnvolunteer) return;
    
    try {
      await onUnvolunteer(task);
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('❌ Erreur désengagement:', error);
    }
  };

  // 💬 GESTIONNAIRE CLIC COMMENTAIRES
  const handleCommentsClick = () => {
    console.log('💬 Ouverture commentaires pour tâche:', task.id);
    if (onViewDetails) {
      onViewDetails(task, 'comments'); // Ouvrir directement sur l'onglet commentaires
    }
  };

  // ✅ VALIDATION OBLIGATOIRE
  if (!task) {
    console.warn('⚠️ TaskCard: task manquant');
    return null;
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-all duration-200 shadow-lg relative">
      
      {/* 💬 BADGE COMMENTAIRES - POSITION ABSOLUE TOP-RIGHT TRÈS VISIBLE */}
      <div className="absolute top-3 right-3 z-20">
        <CommentNotificationBadge
          taskId={task.id}
          onClick={handleCommentsClick}
        />
      </div>

      {/* En-tête avec titre et statut */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg leading-tight pr-20">
            {task.title}
          </h3>
        </div>

        {/* Badge de statut */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            task.status === 'completed' ? 'bg-green-100 text-green-700' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
            task.status === 'validation_pending' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {task.status === 'completed' ? 'Terminée' :
             task.status === 'in_progress' ? 'En cours' :
             task.status === 'validation_pending' ? 'En validation' :
             'En attente'}
          </span>
          
          {/* Badge de priorité */}
          {task.priority && <PriorityBadge priority={task.priority} />}
        </div>
      </div>

      {/* Description courte */}
      {task.description && (
        <div className="mb-3">
          <p className="text-gray-300 text-sm line-clamp-2">
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...`
              : task.description}
          </p>
        </div>
      )}

      {/* Métadonnées avec noms résolus */}
      <div className="space-y-2 mb-4 text-sm text-gray-400">
        {/* Créateur avec nom résolu */}
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span>
            Créé par: {loadingUserNames ? (
              <span className="text-gray-500">Chargement...</span>
            ) : (
              <span className="text-white font-medium">{creatorName}</span>
            )}
          </span>
        </div>

        {/* Assignés avec noms résolus */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              Assigné à: {loadingUserNames ? (
                <span className="text-gray-500">Chargement...</span>
              ) : assigneeNames.length > 0 ? (
                assigneeNames.map((name, index) => (
                  <span key={index} className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs mr-1 mb-1 font-medium">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Utilisateurs anonymes</span>
              )}
            </span>
          </div>
        )}

        {/* Échéance */}
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
          </div>
        )}

        {/* Récompense XP */}
        {task.xpReward && (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">+{task.xpReward} XP</span>
          </div>
        )}

        {/* Ouvert aux volontaires */}
        {task.openToVolunteers && (
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-green-400">Ouvert aux volontaires</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* Voir détails */}
        <button
          onClick={() => onViewDetails && onViewDetails(task)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Détails
        </button>

        {/* Bouton de soumission */}
        {isAssignedToMe && task.status !== 'completed' && task.status !== 'validation_pending' && (
          <SubmitTaskButton
            task={task}
            onSubmit={onSubmit}
            onTaskUpdate={onTaskUpdate}
          />
        )}

        {/* 🔥 DEVENIR VOLONTAIRE - BOUTON CORRIGÉ */}
        {canVolunteer && (
          <button
            onClick={handleVolunteer}
            disabled={isVolunteering}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {isVolunteering ? 'En cours...' : 'Volontaire'}
          </button>
        )}

        {/* Ne plus être volontaire */}
        {isAssignedToMe && !isTaskOwner && onUnvolunteer && (
          <button
            onClick={handleUnvolunteer}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
          >
            <UserMinus className="w-4 h-4" />
            Se désengager
          </button>
        )}

        {/* Actions propriétaire */}
        {(isTaskOwner || isMyTask) && (
          <>
            <button
              onClick={() => onEdit && onEdit(task)}
              className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            
            <button
              onClick={() => onDelete && onDelete(task.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </>
        )}
      </div>

      {/* Indicateur de nouveaux commentaires au bas de la carte */}
      <div className="mt-3 pt-3 border-t border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {task.id.slice(-8)}</span>
          <div className="flex items-center gap-2">
            <span>💬 Cliquez sur le badge pour voir les commentaires</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
