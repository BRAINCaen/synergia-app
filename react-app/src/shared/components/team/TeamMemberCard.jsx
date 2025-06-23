import React from 'react';
import { 
  User, 
  Crown, 
  Star, 
  Clock, 
  Target, 
  Award, 
  MessageCircle,
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const TeamMemberCard = ({ member, currentUser }) => {
  // Fonction pour formater la dernière activité
  const formatLastActive = (lastActive) => {
    if (!lastActive) return 'Jamais connecté';
    
    const now = new Date();
    const lastActiveDate = lastActive.toDate ? lastActive.toDate() : new Date(lastActive);
    const diffMs = now - lastActiveDate;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 5) return 'En ligne';
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return lastActiveDate.toLocaleDateString('fr-FR');
  };

  // Obtenir le statut de connexion
  const getConnectionStatus = () => {
    if (!member.lastActive) return 'offline';
    const diffMs = Date.now() - (member.lastActive.toDate ? member.lastActive.toDate() : new Date(member.lastActive));
    return diffMs < 300000 ? 'online' : 'offline'; // 5 minutes
  };

  const connectionStatus = getConnectionStatus();

  // Obtenir la couleur du rôle
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-900/20 border-red-600';
      case 'manager': return 'text-blue-400 bg-blue-900/20 border-blue-600';
      case 'developer': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'designer': return 'text-purple-400 bg-purple-900/20 border-purple-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  // Icône du rôle
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3" />;
      case 'manager': return <Star className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  // Statistiques du membre (simulées - dans une vraie app, elles viendraient de la base de données)
  const memberStats = {
    tasksCompleted: member.stats?.tasksCompleted || Math.floor(Math.random() * 50) + 10,
    totalXP: member.stats?.totalXP || Math.floor(Math.random() * 1000) + 200,
    level: member.stats?.level || Math.floor((member.stats?.totalXP || 500) / 100) + 1,
    projectsAssigned: member.stats?.projectsAssigned || Math.floor(Math.random() * 5) + 1,
    averageTaskTime: member.stats?.averageTaskTime || `${Math.floor(Math.random() * 3) + 1}h`
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200">
      
      {/* En-tête avec avatar et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          
          {/* Avatar avec indicateur de statut */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {member.avatar ? (
                <img 
                  src={member.avatar} 
                  alt={member.displayName || member.email}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            
            {/* Indicateur de statut en ligne */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
              connectionStatus === 'online' ? 'bg-green-400' : 'bg-gray-500'
            }`}></div>
          </div>

          {/* Nom et infos */}
          <div>
            <h4 className="text-white font-semibold">
              {member.displayName || member.email}
              {member.id === currentUser?.uid && (
                <span className="text-blue-400 text-sm ml-2">(Vous)</span>
              )}
            </h4>
            <p className="text-gray-400 text-sm">{member.email}</p>
          </div>
        </div>

        {/* Badge rôle */}
        <div className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${getRoleColor(member.role)}`}>
          {getRoleIcon(member.role)}
          {member.role || 'member'}
        </div>
      </div>

      {/* Statut et dernière activité */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">Dernière activité</span>
          </div>
          <span className={`font-medium ${
            connectionStatus === 'online' ? 'text-green-400' : 'text-gray-400'
          }`}>
            {formatLastActive(member.lastActive)}
          </span>
        </div>
        
        {/* Statut personnalisé si disponible */}
        {member.status && (
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {member.status}
          </div>
        )}
      </div>

      {/* Statistiques du membre */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-700 rounded-lg">
          <div className="text-lg font-bold text-white">{memberStats.tasksCompleted}</div>
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Tâches
          </div>
        </div>
        
        <div className="text-center p-2 bg-gray-700 rounded-lg">
          <div className="text-lg font-bold text-yellow-400">{memberStats.totalXP}</div>
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Award className="w-3 h-3" />
            XP Total
          </div>
        </div>
        
        <div className="text-center p-2 bg-gray-700 rounded-lg">
          <div className="text-lg font-bold text-blue-400">Nv.{memberStats.level}</div>
          <div className="text-xs text-gray-400">Niveau</div>
        </div>
        
        <div className="text-center p-2 bg-gray-700 rounded-lg">
          <div className="text-lg font-bold text-purple-400">{memberStats.projectsAssigned}</div>
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Target className="w-3 h-3" />
            Projets
          </div>
        </div>
      </div>

      {/* Compétences/Tags si disponibles */}
      {member.skills && member.skills.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">Compétences :</div>
          <div className="flex flex-wrap gap-1">
            {member.skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-md"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-md">
                +{member.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions/Boutons */}
      <div className="flex gap-2">
        {/* Bouton voir profil */}
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1">
          <User className="w-3 h-3" />
          Profil
        </button>
        
        {/* Bouton message (si pas soi-même) */}
        {member.id !== currentUser?.uid && (
          <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1">
            <MessageCircle className="w-3 h-3" />
            Message
          </button>
        )}
        
        {/* Bouton admin actions (si admin) */}
        {currentUser?.role === 'admin' && member.id !== currentUser?.uid && (
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition-colors">
            <Crown className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Indicateur d'alerte si membre a besoin d'aide */}
      {member.needsHelp && (
        <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-600 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm">Demande de l'aide sur ses projets</span>
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;
