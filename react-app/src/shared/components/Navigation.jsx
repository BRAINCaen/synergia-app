// src/shared/components/Navigation.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useGameStore } from '../stores/gameStore.js';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  Trophy, 
  User, 
  LogOut, 
  Menu, 
  X,
  Star
} from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { level, totalXP, calculateLevel } = useGameStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculer le niveau actuel
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = Math.pow(currentLevel + 1, 2) * 100;
  const currentLevelXP = Math.pow(currentLevel, 2) * 100;
  const progressXP = totalXP - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.round((progressXP / neededXP) * 100);

  // Navigation items
  const navItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      description: 'Vue d\'ensemble'
    },
    {
      path: '/tasks',
      icon: CheckSquare,
      label: 'Tâches',
      description: 'Gérer vos tâches'
    },
    {
      path: '/projects',
      icon: FolderOpen,
      label: 'Projets',
      description: 'Vos projets'
    },
    {
      path: '/progress',
      icon: Trophy,
      label: 'Progression',
      description: 'Niveaux et badges'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Navigation desktop */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo et nom */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Synergia</span>
              </Link>
            </div>

            {/* Navigation principale - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={item.description}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Partie droite - XP et profil */}
            <div className="flex items-center gap-4">
              {/* Progression XP - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span>Niveau {currentLevel}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {totalXP} XP total
                  </div>
                </div>
                
                <div className="w-24">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{progressXP}</span>
                    <span>{neededXP}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Menu utilisateur - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut size={18} />
                </button>
              </div>

              {/* Bouton menu mobile */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* Progression mobile */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Niveau {currentLevel} • {totalXP} XP
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre de progression mobile */}
              <div className="px-3 py-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progression vers niveau {currentLevel + 1}</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Navigation mobile */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}

              {/* Déconnexion mobile */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <div>
                  <div className="font-medium">Se déconnecter</div>
                  <div className="text-sm text-red-500">Quitter l'application</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
