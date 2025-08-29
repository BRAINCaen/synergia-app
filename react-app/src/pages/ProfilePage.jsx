// ==========================================
// 📁 react-app/src/pages/ProfilePage.jsx
// PAGE PROFIL COMPLÈTE AVEC MENU HAMBURGER IDENTIQUE AU DASHBOARD
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User,
  Edit,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Eye,
  Download,
  Upload,
  Shield,
  Settings,
  Bell,
  Lock,
  Globe,
  Smartphone,
  Briefcase,
  Clock,
  BarChart3
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AU DASHBOARD)
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  doc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { uploadUserAvatar } from '../core/services/storageService.js';

const ProfilePage = () => {
  // 👤 AUTHENTIFICATION
  const { user, updateProfile } = useAuthStore();
  
  // 📊 ÉTATS PROFILE PAGE
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    company: '',
    role: 'member',
    skills: [],
    totalXp: 0,
    level: 1,
    badges: [],
    tasksCompleted: 0,
    projectsCreated: 0,
    completionRate: 0,
    streak: 0,
    joinDate: new Date(),
    lastActivity: new Date(),
    preferences: {
      notifications: true,
      publicProfile: true,
      showEmail: false,
      theme: 'dark'
    }
  });
  
  const [formData, setFormData] = useState({ ...userProfile });
  const [activeTab, setActiveTab] = useState('general');

  // 📊 CHARGEMENT DU PROFIL DEPUIS FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [PROFILE] Chargement du profil utilisateur...');
    setLoading(true);

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const profile = {
          displayName: userData.displayName || user.displayName || '',
          email: userData.email || user.email || '',
          bio: userData.bio || '',
          phone: userData.phone || '',
          location: userData.location || '',
          website: userData.website || '',
          company: userData.company || '',
          role: userData.role || 'member',
          skills: userData.skills || [],
          totalXp: userData.totalXp || 0,
          level: userData.level || 1,
          badges: userData.badges || [],
          tasksCompleted: userData.tasksCompleted || 0,
          projectsCreated: userData.projectsCreated || 0,
          completionRate: userData.completionRate || 0,
          streak: userData.streak || 0,
          joinDate: userData.createdAt?.toDate() || new Date(),
          lastActivity: userData.lastActivity?.toDate() || new Date(),
          preferences: {
            notifications: userData.preferences?.notifications ?? true,
            publicProfile: userData.preferences?.publicProfile ?? true,
            showEmail: userData.preferences?.showEmail ?? false,
            theme: userData.preferences?.theme || 'dark'
          }
        };
        
        setUserProfile(profile);
        setFormData(profile);
        console.log('✅ [PROFILE] Profil chargé');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid, user?.displayName, user?.email]);

  /**
   * 🎯 NOTIFICATION SYSTÈME
   */
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 999999;
      padding: 12px 24px; border-radius: 8px; color: white;
      font-size: 14px; font-weight: 500; opacity: 1;
      transition: opacity 0.3s ease;
    `;
    notification.className = `notification ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  /**
   * 💾 SAUVEGARDE DU PROFIL
   */
  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Mise à jour dans Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        company: formData.company,
        skills: formData.skills,
        preferences: formData.preferences,
        updatedAt: new Date()
      });

      // Mise à jour du store Auth si nécessaire
      if (formData.displayName !== user.displayName) {
        await updateProfile({ displayName: formData.displayName });
      }

      setUserProfile(formData);
      setShowEditModal(false);
      showNotification('Profil mis à jour avec succès !', 'success');
      
    } catch (error) {
      console.error('❌ [PROFILE] Erreur sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
    setLoading(false);
  };

  /**
   * 📷 UPLOAD AVATAR
   */
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploading(true);
    try {
      const photoURL = await uploadUserAvatar(user.uid, file);
      await updateProfile({ photoURL });
      showNotification('Avatar mis à jour !', 'success');
    } catch (error) {
      console.error('❌ [PROFILE] Erreur upload avatar:', error);
      showNotification('Erreur lors de l\'upload', 'error');
    }
    setUploading(false);
  };

  // 📊 CALCULS POUR L'AFFICHAGE
  const level = Math.floor(userProfile.totalXp / 100) + 1;
  const xpForNextLevel = (level * 100) - userProfile.totalXp;
  const progressPercent = ((userProfile.totalXp % 100) / 100) * 100;

  // 📊 STATISTIQUES HEADER
  const headerStats = [
    { 
      label: "XP Total", 
      value: userProfile.totalXp.toLocaleString(), 
      icon: Zap, 
      color: "text-yellow-400" 
    },
    { 
      label: "Niveau", 
      value: level, 
      icon: Trophy, 
      color: "text-purple-400" 
    },
    { 
      label: "Badges", 
      value: userProfile.badges.length, 
      icon: Award, 
      color: "text-blue-400" 
    },
    { 
      label: "Taux de réussite", 
      value: `${userProfile.completionRate}%`, 
      icon: Target, 
      color: "text-green-400" 
    }
  ];

  // 🎯 ACTIONS HEADER
  const headerActions = (
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowEditModal(true)}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <Edit className="w-4 h-4" />
        Modifier le profil
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Exporter
      </motion.button>
    </div>
  );

  if (loading && !userProfile.email) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white text-lg">Chargement de votre profil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 🏆 EN-TÊTE PROFILE PAGE */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <User className="w-8 h-8 text-purple-400" />
                  Mon Profil
                </h1>
                <p className="text-gray-300">
                  Gérez vos informations personnelles et suivez votre progression
                </p>
              </div>
              
              {/* Actions */}
              {headerActions}
            </div>

            {/* 📊 STATISTIQUES PROFIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {headerStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {stat.label}
                      </div>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 👤 CONTENU PRINCIPAL DU PROFIL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Colonne principale - Informations */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Carte Profil Principal */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-6 mb-8">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        userProfile.displayName?.charAt(0)?.toUpperCase() || 
                        userProfile.email?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                    
                    {/* Bouton changement avatar */}
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                        className="hidden" 
                        disabled={uploading}
                      />
                    </label>
                    
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Informations de base */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {userProfile.displayName || 'Nom non défini'}
                    </h2>
                    <p className="text-gray-400 mb-2">{userProfile.email}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      {userProfile.role && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          {userProfile.role}
                        </div>
                      )}
                      {userProfile.company && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {userProfile.company}
                        </div>
                      )}
                      {userProfile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {userProfile.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {userProfile.bio && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-3">À propos</h3>
                    <p className="text-gray-300 leading-relaxed">{userProfile.bio}</p>
                  </div>
                )}

                {/* Progression XP */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">Progression</h3>
                    <span className="text-sm text-gray-400">
                      Niveau {level} • {xpForNextLevel} XP pour le niveau suivant
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {userProfile.totalXp} XP au total
                  </p>
                </div>

                {/* Compétences */}
                {userProfile.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Compétences</h3>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Activité récente */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Activité récente
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Nouveau niveau atteint !</p>
                      <p className="text-gray-400 text-sm">Vous êtes maintenant niveau {level}</p>
                    </div>
                    <span className="text-gray-500 text-xs ml-auto">
                      {userProfile.lastActivity.toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  {userProfile.badges.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Badges obtenus</p>
                        <p className="text-gray-400 text-sm">{userProfile.badges.length} badges collectés</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne latérale - Statistiques */}
            <div className="space-y-6">
              
              {/* Résumé des stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Statistiques
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tâches terminées</span>
                    <span className="text-white font-semibold">{userProfile.tasksCompleted}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Projets créés</span>
                    <span className="text-white font-semibold">{userProfile.projectsCreated}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Série actuelle</span>
                    <span className="text-yellow-400 font-semibold">{userProfile.streak} jours</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Membre depuis</span>
                    <span className="text-white font-semibold">
                      {userProfile.joinDate.toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges récents */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Badges ({userProfile.badges.length})
                </h3>
                
                {userProfile.badges.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {userProfile.badges.slice(0, 6).map((badge, index) => (
                      <div 
                        key={index}
                        className="aspect-square bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      >
                        🏆
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Aucun badge obtenu pour le moment
                  </p>
                )}
              </div>

              {/* Paramètres rapides */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-400" />
                  Paramètres rapides
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">Notifications</span>
                    </div>
                    <button 
                      className={`w-12 h-6 rounded-full transition-colors ${
                        userProfile.preferences.notifications 
                          ? 'bg-purple-600' 
                          : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        userProfile.preferences.notifications 
                          ? 'translate-x-6' 
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">Profil public</span>
                    </div>
                    <button 
                      className={`w-12 h-6 rounded-full transition-colors ${
                        userProfile.preferences.publicProfile 
                          ? 'bg-purple-600' 
                          : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        userProfile.preferences.publicProfile 
                          ? 'translate-x-6' 
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔧 MODAL D'ÉDITION DU PROFIL */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header Modal */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Modifier le profil</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Formulaire */}
                <div className="space-y-6">
                  {/* Informations de base */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom d'affichage
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Parlez-nous de vous..."
                    />
                  </div>

                  {/* Préférences */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Préférences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">Notifications par email</div>
                          <div className="text-sm text-gray-400">Recevoir les notifications importantes</div>
                        </div>
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              notifications: !prev.preferences.notifications
                            }
                          }))}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            formData.preferences.notifications ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">Profil public</div>
                          <div className="text-sm text-gray-400">Rendre votre profil visible aux autres</div>
                        </div>
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              publicProfile: !prev.preferences.publicProfile
                            }
                          }))}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            formData.preferences.publicProfile ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.preferences.publicProfile ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-700 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ProfilePage;
