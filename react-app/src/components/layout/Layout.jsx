// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT BASIQUE POUR LES ROUTES PROTÉGÉES
// ==========================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * 🏗️ LAYOUT SIMPLE AVEC SIDEBAR ET CONTENU PRINCIPAL
 */
const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        
        {/* Sidebar simple */}
        <motion.aside 
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 min-h-screen"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Synergia</h2>
            
            {/* Navigation simple */}
            <nav className="space-y-2">
              {[
                { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
                { path: '/tasks', label: 'Tâches', icon: '✅' },
                { path: '/projects', label: 'Projets', icon: '📁' },
                { path: '/analytics', label: 'Analytics', icon: '📊' },
                { path: '/team', label: 'Équipe', icon: '👥' },
                { path: '/gamification', label: 'Gamification', icon: '🎮' }
              ].map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </motion.aside>

        {/* Contenu principal */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            <Outlet />
          </motion.div>
        </main>
        
      </div>
    </div>
  );
};

export default Layout;
