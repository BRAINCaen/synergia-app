import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Crown, 
  Star, 
  Target, 
  Activity, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Zap,
  RefreshCw
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

const TeamPage = () => {
  const { user } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Données d'équipe simulées
  const teamData = [
    {
      id: 1,
      name: 'Alice Martin',
      role: 'Chef de Projet',
      email: 'alice.martin@brain.com',
      avatar: '👩‍💼',
      level: 12,
      xp: 3420,
      badges: 15,
      tasksCompleted: 89,
      joinDate: '2024-01-15',
      status: 'online',
      department: 'Management',
      location: 'Paris',
      phone: '+33 1 23 45 67 89'
    },
    {
      id: 2,
      name: 'Thomas Dubois',
      role: 'Développeur Senior',
      email: 'thomas.dubois@brain.com',
      avatar: '👨‍💻',
      level: 10,
      xp: 2850,
      badges: 12,
      tasksCompleted: 76,
      joinDate: '2024-02-01',
      status: 'online',
      department: 'Développement',
      location: 'Lyon',
      phone: '+33 4 56 78 90 12'
    },
    {
      id: 3,
      name: 'Sophie Laurent',
      role: 'Designer UX/UI',
      email: 'sophie.laurent@brain.com',
      avatar: '🎨',
      level: 8,
      xp: 2100,
      badges: 9,
      tasksCompleted: 54,
      joinDate: '2024-03-10',
      status: 'away',
      department: 'Design',
      location: 'Marseille',
      phone: '+33 4 91 23 45 67'
    },
    {
      id: 4,
      name: 'Marc Rousseau',
      role: 'Analyste Données',
      email: 'marc.rousseau@brain.com',
      avatar: '📊',
      level: 9,
      xp: 2300,
      badges: 11,
      tasksCompleted: 67,
      joinDate: '2024-01-30',
      status: 'offline',
      department: 'Analytics',
      location: 'Toulouse',
      phone: '+33 5 34 56 78 90'
    },
    {
      id: 5,
      name: 'Emma Lefebvre',
      role: 'Responsable QA',
      email: 'emma.lefebvre@brain.com',
      avatar: '🔍',
      level: 7,
      xp: 1950,
      badges: 8,
      tasksCompleted: 45,
      joinDate: '2024-04-15',
      status: 'online',
      department: 'Qualité',
      location: 'Nantes',
      phone: '+33 2 40 12 34 56'
    }
  ];

  useEffect(() => {
    setTeamMembers(teamData);
  }, []);

  const teamStats = {
    totalMembers: teamData.length,
    activeMembers: teamData.filter(m => m.status === 'online').length,
    totalXp: teamData.reduce((sum, member) => sum + member.xp, 0),
    totalTasks: teamData.reduce((sum, member) => sum + member.tasksCompleted, 0),
    averageLevel: Math.round(teamData.reduce((sum, member) => sum + member.level, 0) / teamData.length)
  };

  const headerStats = [
    { label: "Membres", value: teamStats.totalMembers.toString(), icon: Users, color: "text-blue-400" },
    { label: "En ligne", value: teamStats.activeMembers.toString(), icon: Activity, color: "text-green-400" },
    { label: "XP Total", value: teamStats.totalXp.toLocaleString(), icon: Star, color: "text-yellow-400" },
    { label: "Niveau Moyen", value: teamStats.averageLevel.toString(), icon: TrendingUp, color: "text-purple-400" }
  ];

  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton variant="secondary" icon={RefreshCw}>
        Actualiser
      </PremiumButton>
      <PremiumButton variant="primary" icon={UserPlus}>
        Inviter membre
      </PremiumButton>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'away': return 'Absent';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  };

  return (
    <PremiumLayout
      title="Notre Équipe"
      subtitle="Collaboration et performance collective"
      icon={Users}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Performance d'équipe */}
      <div className="mb-6">
        <PremiumCard>
          <h3 className="text-white text-xl font-semibold mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
            Performance d'équipe
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{teamStats.totalTasks}</div>
              <div className="text-gray-400 text-sm">Tâches complétées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{teamStats.totalXp.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">XP accumulés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">{teamStats.averageLevel}</div>
              <div className="text-gray-400 text-sm">Niveau moyen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {Math.round((teamStats.activeMembers / teamStats.totalMembers) * 100)}%
              </div>
              <div className="text-gray-400 text-sm">Taux de présence</div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Liste des membres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/10"
          >
            {/* Header membre */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="text-4xl">{member.avatar}</div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{member.name}</h3>
                  <p className="text-gray-400 text-sm">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-yellow-400 mb-1">
                  <Crown className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Niveau {member.level}</span>
                </div>
                <div className="text-xs text-gray-400">{getStatusText(member.status)}</div>
              </div>
            </div>

            {/* Stats membre */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center bg-blue-500/20 rounded-lg p-2">
                <div className="text-sm font-bold text-white">{member.xp}</div>
                <div className="text-xs text-blue-300">XP</div>
              </div>
              <div className="text-center bg-purple-500/20 rounded-lg p-2">
                <div className="text-sm font-bold text-white">{member.badges}</div>
                <div className="text-xs text-purple-300">Badges</div>
              </div>
              <div className="text-center bg-green-500/20 rounded-lg p-2">
                <div className="text-sm font-bold text-white">{member.tasksCompleted}</div>
                <div className="text-xs text-green-300">Tâches</div>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span>{member.location}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>Depuis {new Date(member.joinDate).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setSelectedMember(member)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-lg transition-colors"
              >
                Voir profil
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-3 rounded-lg transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de détail membre */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{selectedMember.avatar}</div>
              <h3 className="text-xl font-bold text-white">{selectedMember.name}</h3>
              <p className="text-gray-400">{selectedMember.role}</p>
              <p className="text-sm text-gray-500">{selectedMember.department}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white text-sm">{selectedMember.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Téléphone</span>
                <span className="text-white text-sm">{selectedMember.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Localisation</span>
                <span className="text-white text-sm">{selectedMember.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Membre depuis</span>
                <span className="text-white text-sm">
                  {new Date(selectedMember.joinDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}
    </PremiumLayout>
  );
};

export default TeamPage;
