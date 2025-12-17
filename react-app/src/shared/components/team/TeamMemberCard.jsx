import React from 'react';
import { User, Award, TrendingUp, Clock } from 'lucide-react';
import { BoostButton } from '../../../components/boost';

const TeamMemberCard = ({ member, currentUser, onBoostSent }) => {
  const getLevelColor = (level) => {
    if (level >= 10) return 'text-purple-400 bg-purple-900/20';
    if (level >= 5) return 'text-blue-400 bg-blue-900/20';
    return 'text-green-400 bg-green-900/20';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
            {member.displayName?.charAt(0) || member.email?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="text-white font-medium">{member.displayName || member.email}</h3>
            <p className="text-gray-400 text-sm">{member.role || 'Membre'}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          member.isOnline ? 'bg-green-900/20 text-green-400' : 'bg-gray-700 text-gray-400'
        }`}>
          {member.isOnline ? '🟢 En ligne' : '⚫ Hors ligne'}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm flex items-center">
            <Award size={14} className="mr-1" />
            XP Total
          </span>
          <span className="text-blue-400 font-semibold">{member.totalXP || 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm flex items-center">
            <TrendingUp size={14} className="mr-1" />
            Niveau
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(member.level || 1)}`}>
            Niveau {member.level || 1}
          </span>
        </div>

        {member.lastActive && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm flex items-center">
              <Clock size={14} className="mr-1" />
              Dernière activité
            </span>
            <span className="text-gray-300 text-xs">
              {new Date(member.lastActive.toMillis()).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}

        {member.currentProjects && member.currentProjects.length > 0 && (
          <div className="mt-4">
            <span className="text-gray-400 text-sm">Projets actifs:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {member.currentProjects.slice(0, 2).map((project, index) => (
                <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  {project}
                </span>
              ))}
              {member.currentProjects.length > 2 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                  +{member.currentProjects.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bouton Boost - ne s'affiche que si currentUser est fourni et different du membre */}
        {currentUser && currentUser.uid !== member.uid && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <BoostButton
              targetUser={member}
              currentUser={currentUser}
              variant="small"
              onBoostSent={onBoostSent}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberCard;
