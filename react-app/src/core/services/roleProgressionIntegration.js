// ==========================================
// 📁 react-app/src/core/services/roleProgressionIntegration.js (VERSION FALLBACK)
// ==========================================

// Version simplifiée pour éviter les erreurs de build
class RoleProgressionIntegration {
  constructor() {
    this.isInitialized = false;
  }

  async initialize(userId) {
    try {
      console.log('🚀 [Fallback] Initialisation système progression:', userId);
      this.isInitialized = true;
      return { success: true, message: 'Système progression initialisé (mode fallback)' };
    } catch (error) {
      console.error('❌ Erreur initialisation progression:', error);
      return { success: false, error: error.message };
    }
  }

  async getCompleteProgressionStats(userId) {
    console.log('📊 [Fallback] Stats progression pour:', userId);
    return {
      roleProgression: {
        totalRoles: 0,
        totalXp: 0,
        byRole: {}
      },
      recommendations: [],
      nextUnlocks: {},
      badgeStats: {
        totalEarned: 0,
        totalAvailable: 0,
        completionPercentage: 0
      }
    };
  }

  cleanup(userId) {
    console.log('🧹 [Fallback] Nettoyage pour:', userId);
  }
}

const roleProgressionIntegration = new RoleProgressionIntegration();
export default roleProgressionIntegration;

// ==========================================
// 📁 react-app/src/core/services/roleUnlockService.js (VERSION FALLBACK)
// ==========================================

export const ROLE_LEVELS = {
  NOVICE: { id: 'novice', name: 'Novice', icon: '🌱', minXp: 0, maxXp: 499 },
  APPRENTI: { id: 'apprenti', name: 'Apprenti', icon: '📚', minXp: 500, maxXp: 1499 },
  COMPETENT: { id: 'competent', name: 'Compétent', icon: '⚡', minXp: 1500, maxXp: 2999 },
  EXPERT: { id: 'expert', name: 'Expert', icon: '🏆', minXp: 3000, maxXp: 4999 },
  MAITRE: { id: 'maitre', name: 'Maître', icon: '👑', minXp: 5000, maxXp: Infinity }
};

class RoleUnlockService {
  calculateRoleLevel(roleXp = 0) {
    for (const [levelId, levelData] of Object.entries(ROLE_LEVELS)) {
      if (roleXp >= levelData.minXp && roleXp <= levelData.maxXp) {
        return levelId;
      }
    }
    return 'NOVICE';
  }

  getUserUnlocks(userRoles = {}) {
    return {
      badges: [],
      tasks: [],
      projects: [],
      features: [],
      totalXpMultiplier: 1.0
    };
  }

  getProgressionStats(userRoles = {}) {
    return {
      totalRoles: Object.keys(userRoles).length,
      totalXp: 0,
      averageLevel: 0,
      completionPercentage: 0,
      unlockedContent: {
        badges: 0,
        tasks: 0,
        projects: 0,
        features: 0
      }
    };
  }

  getNextUnlocks(userRoles = {}) {
    return {};
  }
}

const roleUnlockService = new RoleUnlockService();
export default roleUnlockService;

// ==========================================
// 📁 react-app/src/core/services/roleTaskManager.js (VERSION FALLBACK)
// ==========================================

class RoleTaskManager {
  getAvailableTasksForUser(userRoles = {}) {
    return [];
  }

  async getRoleTaskStats(userId, roleId = null) {
    return {
      success: true,
      stats: {
        total: 0,
        completed: 0,
        inProgress: 0,
        totalXpEarned: 0,
        tasksByCategory: {},
        tasksByDifficulty: {}
      }
    };
  }

  getTaskRecommendations(userRoles = {}, targetRole = null) {
    return [];
  }

  async createTaskInstance(userId, taskTemplate, assignedBy = 'system') {
    console.log('📝 [Fallback] Création tâche:', taskTemplate.id);
    return { success: true, taskId: 'mock-task-id' };
  }

  async completeRoleTask(taskId, userId, completionData = {}) {
    console.log('✅ [Fallback] Completion tâche:', taskId);
    return { success: true, xpGained: 25, roleId: 'mock-role' };
  }
}

const roleTaskManager = new RoleTaskManager();
export default roleTaskManager;

// ==========================================
// 📁 react-app/src/core/services/roleBadgeSystem.js (VERSION FALLBACK)
// ==========================================

export const ROLE_EXCLUSIVE_BADGES = {};

class RoleBadgeSystem {
  checkRoleBadges(userId, userRoles = {}, userStats = {}) {
    return [];
  }

  getRoleBadgeStats(userRoles = {}, earnedBadges = []) {
    return {
      totalAvailable: 0,
      totalEarned: 0,
      byRole: {},
      byRarity: {},
      completionPercentage: 0
    };
  }

  getNextBadgesToUnlock(userId, userRoles = {}, userStats = {}, limit = 5) {
    return [];
  }

  getRarityStyles(rarity) {
    return {
      color: 'text-gray-400',
      bg: 'bg-gray-500/20',
      border: 'border-gray-500',
      glow: '',
      animation: ''
    };
  }

  async autoCheckRoleBadges(userId, userRoles = {}, userStats = {}) {
    return { success: true, awardedBadges: 0, badges: [] };
  }

  initialize() {
    console.log('🏆 [Fallback] Système badges rôle initialisé');
    return this;
  }
}

const roleBadgeSystem = new RoleBadgeSystem();
export default roleBadgeSystem;

// ==========================================
// 📁 react-app/src/components/roles/RoleProgressionDashboard.jsx (VERSION FALLBACK)
// ==========================================

import React from 'react';
import { TrendingUp, Trophy } from 'lucide-react';

const RoleProgressionDashboard = ({ userId }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-white font-semibold mb-2">Dashboard de Progression</h3>
        <p className="text-gray-400 text-sm">
          Système de progression par rôles en cours de développement
        </p>
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-white">0</div>
          <div className="text-gray-400 text-sm">Rôles actifs</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-white">0</div>
          <div className="text-gray-400 text-sm">XP total</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-white">0</div>
          <div className="text-gray-400 text-sm">Badges</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-white">0%</div>
          <div className="text-gray-400 text-sm">Progression</div>
        </div>
      </div>
    </div>
  );
};

export default RoleProgressionDashboard;

// ==========================================
// 📁 react-app/src/components/tasks/RoleTaskBoard.jsx (VERSION FALLBACK)
// ==========================================

import React from 'react';
import { Target, Lock } from 'lucide-react';

const RoleTaskBoard = ({ selectedRole = null, compact = false }) => {
  return (
    <div className="space-y-6">
      {!compact && (
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Tâches par Rôle</h3>
          <p className="text-gray-400 text-sm">
            Système de tâches spécialisées en cours de développement
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 opacity-50">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Tâche verrouillée #{i}</span>
            </div>
            <p className="text-gray-500 text-sm">
              Les tâches spécialisées seront bientôt disponibles
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleTaskBoard;
