// ==========================================
// 📁 react-app/src/pages/AdminTeamPoolPage.jsx
// PAGE ADMIN POUR GESTION CAGNOTTE COLLECTIVE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Users, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Award,
  Gift
} from 'lucide-react';
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';
import PremiumCard from '../components/ui/PremiumCard.jsx';
import PremiumButton from '../components/ui/PremiumButton.jsx';
import { useTeamPool } from '../shared/hooks/useTeamPool.js';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  where,
  getDocs 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { exportService } from '../core/services/exportService.js';

/**
 * ⚙️ PAGE ADMIN POUR GESTION DE LA CAGNOTTE COLLECTIVE
 * Permet aux admins de voir les statistiques détaillées et gérer le système
 */
const AdminTeamPoolPage = () => {
  // Hook de la cagnotte
  const {
    poolData,
    stats,
    loading,
    error,
    purchaseTeamReward,
    refreshPoolData,
    getAvailableRewards,
    autoContributionRate,
    poolLevels
  } = useTeamPool({
    autoInit: true,
    realTimeUpdates: true
  });

  // États pour les données admin
  const [contributions, setContributions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [contributorsStats, setContributorsStats] = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all
  const [showConfigModal, setShowConfigModal] = useState(false);

  // 📊 CHARGER LES DONNÉES ADMIN
  useEffect(() => {
    loadAdminData();
  }, [selectedPeriod]);

  const loadAdminData = async () => {
    setAdminLoading(true);
    
    try {
      // Charger les contributions récentes
      await loadRecentContributions();
      
      // Charger les achats récents
      await loadRecentPurchases();
      
      // Charger les stats des contributeurs
      await loadContributorsStats();
      
    } catch (error) {
      console.error('❌ [ADMIN-TEAM-POOL] Erreur chargement données:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  // 💰 CHARGER LES CONTRIBUTIONS RÉCENTES
  const loadRecentContributions = async () => {
    try {
      const contributionsQuery = query(
        collection(db, 'teamContributions'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(contributionsQuery);
      const contributionsData = [];
      
      snapshot.forEach(doc => {
        contributionsData.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        });
      });
      
      setContributions(contributionsData);
      console.log('✅ [ADMIN-TEAM-POOL] Contributions chargées:', contributionsData.length);
      
    } catch (error) {
      console.error('❌ [ADMIN-TEAM-POOL] Erreur contributions:', error);
    }
  };

  // 🏪 CHARGER LES ACHATS RÉCENTS
  const loadRecentPurchases = async () => {
    try {
      const purchasesQuery = query(
        collection(db, 'teamPurchases'),
        orderBy('purchasedAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(purchasesQuery);
      const purchasesData = [];
      
      snapshot.forEach(doc => {
        purchasesData.push({
          id: doc.id,
          ...doc.data(),
          purchasedAt: doc.data().purchasedAt?.toDate?.() || new Date()
        });
      });
      
      setPurchases(purchasesData);
      console.log('✅ [ADMIN-TEAM-POOL] Achats chargés:', purchasesData.length);
      
    } catch (error) {
      console.error('❌ [ADMIN-TEAM-POOL] Erreur achats:', error);
    }
  };

  // 👥 CHARGER LES STATS DES CONTRIBUTEURS
  const loadContributorsStats = async () => {
    try {
      // Grouper les contributions par utilisateur
      const userContributions = {};
      
      contributions.forEach(contrib => {
        if (!userContributions[contrib.userId]) {
          userContributions[contrib.userId] = {
            userId: contrib.userId,
            userEmail: contrib.userEmail,
            totalContributed: 0,
            contributionsCount: 0,
            lastContribution: null
          };
        }
        
        userContributions[contrib.userId].totalContributed += contrib.amount;
        userContributions[contrib.userId].contributionsCount += 1;
        
        if (!userContributions[contrib.userId].lastContribution || 
            contrib.timestamp > userContributions[contrib.userId].lastContribution) {
          userContributions[contrib.userId].lastContribution = contrib.timestamp;
        }
      });
      
      // Convertir en array et trier
      const contributorsArray = Object.values(userContributions)
        .sort((a, b) => b.totalContributed - a.totalContributed);
      
      setContributorsStats(contributorsArray);
      console.log('✅ [ADMIN-TEAM-POOL] Stats contributeurs chargées:', contributorsArray.length);
      
    } catch (error) {
      console.error('❌ [ADMIN-TEAM-POOL] Erreur stats contributeurs:', error);
    }
  };

  // 📊 CALCULER LES MÉTRIQUES
  const calculateMetrics = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const weeklyContributions = contributions.filter(c => c.timestamp >= weekAgo);
    const monthlyContributions = contributions.filter(c => c.timestamp >= monthAgo);
    
    return {
      totalContributors: contributorsStats.length,
      weeklyTotal: weeklyContributions.reduce((sum, c) => sum + c.amount, 0),
      monthlyTotal: monthlyContributions.reduce((sum, c) => sum + c.amount, 0),
      averageContribution: contributions.length > 0 ? 
        Math.round(contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length) : 0,
      topContributor: contributorsStats[0] || null,
      recentPurchases: purchases.filter(p => p.purchasedAt >= weekAgo).length
    };
  };

  const metrics = calculateMetrics();

  // 📊 STATISTIQUES HEADER
  const headerStats = [
    { 
      label: "Cagnotte totale", 
      value: stats.totalXP.toLocaleString(), 
      icon: Award, 
      color: "text-yellow-400" 
    },
    { 
      label: "Contributeurs actifs", 
      value: metrics.totalContributors.toString(), 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "XP cette semaine", 
      value: metrics.weeklyTotal.toLocaleString(), 
      icon: TrendingUp, 
      color: "text-green-400" 
    },
    { 
      label: "Achats récents", 
      value: metrics.recentPurchases.toString(), 
      icon: Gift, 
      color: "text-purple-400" 
    }
  ];

  // 🎮 ACTIONS HEADER
  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton 
        variant="secondary" 
        icon={Download}
        onClick={() => exportData()}
      >
        Exporter
      </PremiumButton>
      <PremiumButton 
        variant="secondary" 
        icon={Settings}
        onClick={() => setShowConfigModal(true)}
      >
        Configuration
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={RefreshCw}
        onClick={() => {
          refreshPoolData();
          loadAdminData();
        }}
        disabled={loading || adminLoading}
      >
        Actualiser
      </PremiumButton>
    </div>
  );

  // 📥 EXPORTER LES DONNÉES EN PDF
  const exportData = async () => {
    try {
      await exportService.exportTeamPoolToPDF({
        stats: {
          totalXP: stats?.totalXP || poolData?.totalXP || 0,
          contributionsCount: contributions.length,
          withdrawalsCount: purchases.length,
          challengesCompleted: stats?.challengesCompleted || 0,
          activeContributors: contributorsStats.length
        },
        contributions: contributions.slice(0, 100),
        withdrawals: purchases,
        challenges: []
      });
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
    }
  };

  if (loading || adminLoading) {
    return (
      <PremiumLayout title="Admin Cagnotte" subtitle="Chargement..." icon={Settings}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Chargement des données admin...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Administration Cagnotte"
      subtitle="Gestion et statistiques de la cagnotte collective"
      icon={Settings}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 📊 VUE D'ENSEMBLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Métriques principales */}
        <div className="lg:col-span-2">
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-6">📊 Métriques Cagnotte</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{metrics.weeklyTotal}</div>
                <div className="text-sm text-gray-400">XP cette semaine</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-lg">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{metrics.totalContributors}</div>
                <div className="text-sm text-gray-400">Contributeurs actifs</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg">
                <BarChart3 className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{metrics.averageContribution}</div>
                <div className="text-sm text-gray-400">XP moyen/contribution</div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">⚙️ Configuration actuelle</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Taux auto-contribution:</span>
                  <span className="text-white ml-2 font-semibold">{autoContributionRate}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Niveau actuel:</span>
                  <span className="text-white ml-2 font-semibold">{stats.currentLevel}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total contributions:</span>
                  <span className="text-white ml-2 font-semibold">{contributions.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total achats:</span>
                  <span className="text-white ml-2 font-semibold">{purchases.length}</span>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Top contributeurs */}
        <div>
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-6">🏆 Top Contributeurs</h3>
            
            <div className="space-y-3">
              {contributorsStats.slice(0, 5).map((contributor, index) => (
                <div key={contributor.userId} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {contributor.userEmail.split('@')[0]}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {contributor.contributionsCount} contributions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">
                      {contributor.totalContributed} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {contributorsStats.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune contribution encore</p>
              </div>
            )}
          </PremiumCard>
        </div>
      </div>

      {/* 📈 HISTORIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Contributions récentes */}
        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-6">💰 Contributions Récentes</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {contributions.slice(0, 20).map((contribution) => (
              <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    contribution.type === 'automatic' ? 'bg-blue-400' : 'bg-green-400'
                  }`} />
                  <div>
                    <div className="text-white text-sm font-medium">
                      {contribution.userEmail.split('@')[0]}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {contribution.source} • {contribution.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">
                    +{contribution.amount} XP
                  </div>
                  <div className="text-gray-400 text-xs">
                    {contribution.type === 'automatic' ? 'Auto' : 'Manuel'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {contributions.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune contribution encore</p>
            </div>
          )}
        </PremiumCard>

        {/* Achats récents */}
        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-6">🛒 Achats d'Équipe</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-medium">{purchase.rewardName}</div>
                    <div className="text-gray-400 text-sm">{purchase.rewardDescription}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    purchase.status === 'pending_delivery' ? 'bg-yellow-600/20 text-yellow-400' :
                    purchase.status === 'delivered' ? 'bg-green-600/20 text-green-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {purchase.status === 'pending_delivery' ? 'En attente' :
                     purchase.status === 'delivered' ? 'Livré' :
                     purchase.status}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-400">
                    {purchase.purchasedAt.toLocaleDateString()} • {purchase.purchasedBy}
                  </div>
                  <div className="text-red-400 font-semibold">
                    -{purchase.cost} XP
                  </div>
                </div>
              </div>
            ))}
          </div>

          {purchases.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucun achat encore</p>
            </div>
          )}
        </PremiumCard>
      </div>

      {/* 🎯 ACTIONS RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumCard>
          <div className="text-center p-4">
            <Eye className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">Voir la cagnotte publique</h4>
            <p className="text-gray-400 text-sm mb-4">
              Vue de la cagnotte côté utilisateurs
            </p>
            <PremiumButton 
              variant="secondary" 
              onClick={() => window.open('/team-pool', '_blank')}
              className="w-full"
            >
              Ouvrir
            </PremiumButton>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center p-4">
            <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">Rapports détaillés</h4>
            <p className="text-gray-400 text-sm mb-4">
              Analyses et graphiques avancés
            </p>
            <PremiumButton 
              variant="secondary" 
              disabled={true}
              className="w-full"
            >
              Bientôt disponible
            </PremiumButton>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center p-4">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">Alertes système</h4>
            <p className="text-gray-400 text-sm mb-4">
              Notifications et alertes automatiques
            </p>
            <PremiumButton 
              variant="secondary" 
              disabled={true}
              className="w-full"
            >
              Configurer
            </PremiumButton>
          </div>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
};

export default AdminTeamPoolPage;
