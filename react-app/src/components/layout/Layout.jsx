// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT ORIGINAL RESTAURÉ + MENU MOBILE CORRIGÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  BarChart3, 
  Trophy, 
  Users, 
  Settings, 
  Menu, 
  X, 
  User, 
  LogOut,
  Target,
  Award,
  Flame,
  Clock,
  BookOpen,
  UserCheck,
  Shield,
  Crown,
  TestTube,
  Lock,
  Gift,
  PieChart,
  Gamepad2,
  GraduationCap,
  Activity,
  Calendar,
  Zap,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🛡️ DÉTECTION ADMIN SIMPLE ET EFFICACE
 */
const isUserAdmin = (user) => {
  if (!user) return false;
  
  // Emails admin hardcodés pour test
  const adminEmails = [
    'alan.boehme61@gmail.com',
    'tanguy.caron@gmail.com',
    'admin@synergia.com'
  ];
  
  // Vérifications multiples
  const checks = [
    adminEmails.includes(user.email),
    user.role === 'admin',
    user.isAdmin === true,
    user.profile?.role === 'admin'
  ];
  
  const result = checks.some(check => check === true);
  console.log('🛡️ Admin check:', { email: user.email, isAdmin: result });
  
  return result;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // CORRECTION : Empêcher la fermeture automatique du menu
  useEffect(() => {
    // Ne fermer que lors du changement de page, pas à cause des re-renders
    console.log('📍 Page changée:', location.pathname);
    setSidebarOpen(false);
  }, [location.pathname]);

  // CORRECTION : Éviter la fermeture sur redimensionnement intempestif
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && sidebarOpen) {
        console.log('📱 Redimensionnement vers desktop, fermeture menu');
        setSidebarOpen(false);
      }
    };

    // Debounce le resize pour éviter les appels multiples
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [sidebarOpen]);

  // CORRECTION SIMPLE : Juste bloquer le scroll sans position fixed
  useEffect(() => {
    console.log('🔴 État sidebar changé:', sidebarOpen);
    
    if (sidebarOpen) {
      console.log('🔴 Menu ouvert - Bloquer le scroll seulement');
      document.body.style.overflow = 'hidden';
    } else {
      console.log('🔴 Menu fermé - Débloquer le scroll');
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // CORRECTION : Mémoriser la valeur admin pour éviter les re-renders
  const userIsAdmin = React.useMemo(() => isUserAdmin(user), [user?.email, user?.role, user?.isAdmin]);

  // NAVIGATION DE BASE - DESIGN ORIGINAL
  const navigationSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/tasks', label: 'Tâches', icon: CheckSquare },
        { path: '/projects', label: 'Projets', icon: FolderOpen },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'GAMIFICATION',
      items: [
        { path: '/gamification', label: 'Gamification', icon: Gamepad2 },
        { path: '/badges', label: 'Badges', icon: Award },
        { path: '/leaderboard', label: 'Classement', icon: Trophy },
        { path: '/rewards', label: 'Récompenses', icon: Gift }
      ]
    },
    {
      title: 'ÉQUIPE & SOCIAL',
      items: [
        { path: '/team', label: 'Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: UserCheck }
      ]
    },
    {
      title: 'OUTILS',
      items: [
        { path: '/onboarding', label: 'Intégration', icon: BookOpen },
        { path: '/timetrack', label: 'Pointeuse', icon: Clock },
        { path: '/profile', label: 'Mon Profil', icon: User },
        { path: '/settings', label: 'Paramètres', icon: Settings }
      ]
    }
  ];

  // SECTION ADMIN - AJOUTÉE CONDITIONNELLEMENT
  const adminSection = {
    title: 'ADMINISTRATION',
    items: [
      { path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield },
      { path: '/admin/complete-test', label: 'Test Admin', icon: TestTube },
      { path: '/admin/role-permissions', label: 'Permissions', icon: Lock },
      { path: '/admin/users', label: 'Admin Utilisateurs', icon: Crown },
      { path: '/admin/analytics', label: 'Admin Analytics', icon: PieChart },
      { path: '/admin/settings', label: 'Admin Config', icon: Settings }
    ]
  };

  // Fusionner les sections selon les droits
  const allSections = userIsAdmin 
    ? [...navigationSections, adminSection]
    : navigationSections;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR MOBILE SÉPARÉE - AVEC PROTECTION CLICK */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-2xl"
          onClick={(e) => {
            // Empêcher la fermeture quand on clique dans la sidebar
            e.stopPropagation();
          }}
        >
          {/* Header Sidebar Mobile */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-semibold">Synergia</span>
                {userIsAdmin && <span className="text-red-400 text-xs ml-2">ADMIN</span>}
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Utilisateur Mobile */}
          <div className="p-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.displayName || user?.email || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {userIsAdmin ? 'Administrateur' : 'Membre'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Mobile */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {allSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const isAdminItem = section.title === 'ADMINISTRATION';

                    return (
                      <Link
                        key={itemIndex}
                        to={item.path}
                        onClick={() => {
                          console.log('🔴 Lien cliqué:', item.label);
                          setTimeout(() => setSidebarOpen(false), 100);
                        }}
                        className={`
                          group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                          ${active
                            ? isAdminItem
                              ? 'bg-red-900 text-red-100'
                              : 'bg-blue-900 text-blue-100'
                            : isAdminItem
                              ? 'text-red-300 hover:bg-red-900 hover:text-red-100'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }
                        `}
                      >
                        <Icon className={`mr-3 w-5 h-5 flex-shrink-0 ${
                          active
                            ? isAdminItem ? 'text-red-300' : 'text-blue-300'
                            : isAdminItem ? 'text-red-400' : 'text-gray-400'
                        }`} />
                        <span className="truncate">{item.label}</span>
                        {isAdminItem && (
                          <Shield className="w-3 h-3 ml-auto text-red-400 flex-shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Déconnexion Mobile */}
          <div className="flex-shrink-0 w-full p-4 border-t border-gray-700 bg-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
            >
              <LogOut className="mr-3 w-5 h-5 text-gray-400" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR DESKTOP UNIQUEMENT */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900">
        {/* Header Sidebar */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold">Synergia</span>
              {userIsAdmin && <span className="text-red-400 text-xs ml-2">ADMIN</span>}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Utilisateur */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userIsAdmin ? 'Administrateur' : 'Membre'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation avec scroll */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {allSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const isAdminItem = section.title === 'ADMINISTRATION';

                  return (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      onClick={() => {
                        console.log('🔴 Lien cliqué:', item.label);
                        setTimeout(() => setSidebarOpen(false), 100);
                      }}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                        ${active
                          ? isAdminItem
                            ? 'bg-red-900 text-red-100'
                            : 'bg-blue-900 text-blue-100'
                          : isAdminItem
                            ? 'text-red-300 hover:bg-red-900 hover:text-red-100'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`mr-3 w-5 h-5 flex-shrink-0 ${
                        active
                          ? isAdminItem ? 'text-red-300' : 'text-blue-300'
                          : isAdminItem ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <span className="truncate">{item.label}</span>
                      {isAdminItem && (
                        <Shield className="w-3 h-3 ml-auto text-red-400 flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="flex-shrink-0 w-full p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5 text-gray-400" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* OVERLAY MOBILE - DÉLAI POUR ÉVITER FERMETURE IMMÉDIATE */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={(e) => {
            // Éviter la fermeture immédiate
            e.preventDefault();
            e.stopPropagation();
            console.log('🔴 Overlay cliqué, fermeture du menu');
            setSidebarOpen(false);
          }}
          onMouseDown={(e) => {
            // Empêcher la propagation sur mousedown aussi
            e.stopPropagation();
          }}
        />
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile - VISIBLE SEULEMENT SUR MOBILE */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔴 Bouton menu cliqué, état actuel:', sidebarOpen);
              setSidebarOpen(prev => {
                const newValue = !prev;
                console.log('🔴 Changement état:', prev, '→', newValue);
                return newValue;
              });
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Ouvrir le menu"
            type="button"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex items-center">
            Synergia 
            {userIsAdmin && <span className="text-red-500 text-sm ml-2">ADMIN</span>}
          </h1>
          <div className="w-10"></div> {/* Spacer pour centrer le titre */}
        </div>

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
