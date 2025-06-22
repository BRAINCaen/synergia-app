// ==========================================
// 📁 react-app/src/components/gamification/Leaderboard.jsx
// Interface complète du leaderboard avec animations
// ==========================================

import React, { useState, useEffect } from 'react';
import Card from '../../shared/components/ui/Card.jsx';
import leaderboardService from '../../services/leaderboardService.js';
import useUserStore from '../../shared/stores/userStore.js';

const Leaderboard = () => {
  const { profile } = useUserStore();
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedRanks, setAnimatedRanks] = useState(new Set());

  const tabs = [
    { id: 'global', name: 'Global', icon: '🌍' },
    { id: 'weekly', name: 'Hebdomadaire', icon: '📅' },
    { id: 'department', name: 'Département', icon: '🏢' }
  ];

  useEffect(() => {
    loadLeaderboardData();
    if (profile) {
      loadUserData();
    }
  }, [activeTab, profile]);

  const loadLeaderboardData = async () => {
    setLoading(true);
    
    try {
      if (activeTab === 'global') {
        const result = await leaderboardService.getGlobalLeaderboard(50);
        if (!result.error) {
          setLeaderboardData(result.data);
          animateRankChanges(result.data);
        }
      } else if (activeTab === 'weekly') {
        const result = await leaderboardService.getWeeklyLeaderboard(20);
        if (!result.error) {
          setWeeklyData(result.data);
        }
      } else if (activeTab === 'department' && profile?.profile?.department) {
        const result = await leaderboardService.getDepartmentLeaderboard(
          profile.profile.department, 20
        );
        if (!result.error) {
          setLeaderboardData(result.data);
        }
      }
    } catch (error) {
      console.error('Erreur chargement leaderboard:', error);
    }
    
    setLoading(false);
  };

  const loadUserData = async () => {
    if (!profile) return;
    
    // Charger le rang de l'utilisateur
    const rankResult = await leaderboardService.getUserRank(profile.uid);
    if (!rankResult.error) {
      setUserRank(rankResult.rank);
    }
    
    // Charger les stats de comparaison
    const statsResult = await leaderboardService.getComparisonStats(profile.uid);
    if (!statsResult.error) {
      setUserStats(statsResult.stats);
    }
  };

  const animateRankChanges = (newData) => {
    const newAnimated = new Set();
    newData.slice(0, 10).forEach(user => {
      if (Math.random() > 0.7) { // Simuler des changements
        newAnimated.add(user.uid);
      }
    });
    setAnimatedRanks(newAnimated);
    
    // Retirer l'animation après 2 secondes
    setTimeout(() => setAnimatedRanks(new Set()), 2000);
  };

  const getCurrentData = () => {
    return activeTab === 'weekly' ? weeklyData : leaderboardData;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-orange-500';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <Card.Content>
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 mb-2">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </Card.Content>
        </Card>
      </div
