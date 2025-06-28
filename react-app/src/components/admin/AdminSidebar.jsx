// ==========================================
// 📁 react-app/src/components/admin/AdminSidebar.jsx
// SIDEBAR ADMIN AVEC LIEN VALIDATION DES TÂCHES
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Trophy, 
  Users, 
  BarChart3, 
  Settings, 
  Award,
  CheckSquare,
  Clock,
  Home
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/**
 * 🛡️ SIDEBAR NAVIGATION ADMIN
 */
const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard Admin',
      href: '/admin',
      icon: Home,
      description: 'Vue d\'ensemble admin'
    },
    {
      title: 'Gestion des Badges',
      href: '/admin/badges',
      icon: Trophy,
      description: 'Créer et gérer les badges'
    },
    {
      title: 'Validation des Tâches',
      href: '/admin/task-validation',
      icon: CheckSquare,
      description: 'Valider les soumissions',
      badge: 'Nouveau'
    },
    {
      title: 'Gestion Utilisateurs',
      href: '/admin/users',
      icon: Users,
      description: 'Profils et permissions'
    },
    {
      title: 'Statistiques',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Métriques et rapports'
    },
    {
      title: 'Paramètres',
      href: '/admin/settings',
      icon: Settings,
      description: 'Configuration système'
    }
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Panel Admin</h2>
            <p className="text-sm text-gray-600">SYNERGIA v3.5</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`block relative group`}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </motion.div>
                
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-r"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action rapide */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Actions rapides</span>
          </div>
          <div className="space-y-2">
            <Link
              to="/admin/task-validation"
              className="block text-xs text-blue-700 hover:text-blue-800 transition-colors"
            >
              → Valider les tâches en attente
            </Link>
            <Link
              to="/admin/badges"
              className="block text-xs text-blue-700 hover:text-blue-800 transition-colors"
            >
              → Créer un nouveau badge
            </Link>
            <Link
              to="/admin/users"
              className="block text-xs text-blue-700 hover:text-blue-800 transition-colors"
            >
              → Attribuer des récompenses
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
