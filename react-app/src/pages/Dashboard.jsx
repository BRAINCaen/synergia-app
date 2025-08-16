// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD DEBUG SIMPLE POUR VOIR SI ÇA MARCHE
// ==========================================

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Collecter des infos de debug
    setDebugInfo({
      user: user,
      isAuthenticated,
      loading,
      pathname: window.location.pathname,
      timestamp: new Date().toLocaleTimeString()
    });

    console.log('🏠 Dashboard monté');
    console.log('User:', user);
    console.log('Authenticated:', isAuthenticated);
    console.log('Loading:', loading);
  }, [user, isAuthenticated, loading]);

  // Affichage forcé même en cas de problème
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* Header visible */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          color: '#1f2937', 
          margin: '0 0 10px 0',
          fontSize: '2rem'
        }}>
          🏠 Synergia Dashboard v3.5.3
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Application de gestion collaborative - Mode Debug
        </p>
      </div>

      {/* Status de l'auth */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#1f2937', marginTop: 0 }}>📊 État de l'authentification</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: loading ? '#fef3c7' : (isAuthenticated ? '#d1fae5' : '#fecaca'),
            borderRadius: '6px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Statut</div>
            <div>{loading ? '🔄 Chargement...' : (isAuthenticated ? '✅ Connecté' : '❌ Non connecté')}</div>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Utilisateur</div>
            <div>{user ? `👤 ${user.email || user.displayName || 'Utilisateur'}` : '👻 Aucun'}</div>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Page</div>
            <div>📍 {debugInfo.pathname}</div>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Heure</div>
            <div>⏰ {debugInfo.timestamp}</div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#1f2937', marginTop: 0 }}>🚀 Actions rapides</h2>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.location.href = '/tasks'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            📝 Tâches
          </button>
          
          <button 
            onClick={() => window.location.href = '/projects'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            📁 Projets
          </button>
          
          <button 
            onClick={() => window.location.href = '/team'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            👥 Équipe
          </button>
          
          <button 
            onClick={() => window.location.href = '/gamification'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🎮 Gamification
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Informations système */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#1f2937', marginTop: 0 }}>🔧 Informations système</h2>
        
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '15px',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '14px',
          overflow: 'auto'
        }}>
          <div><strong>URL:</strong> {window.location.href}</div>
          <div><strong>User Agent:</strong> {navigator.userAgent.substring(0, 100)}...</div>
          <div><strong>Local Storage:</strong> {Object.keys(localStorage).length} items</div>
          <div><strong>Session Storage:</strong> {Object.keys(sessionStorage).length} items</div>
          <div><strong>Console Errors:</strong> Vérifiez la console F12</div>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <h3 style={{ marginTop: 0 }}>🧪 Tests disponibles :</h3>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><code>diagnoseArrays()</code> - Diagnostic des arrays</li>
            <li><code>diagnoseAssignRoleServices()</code> - Diagnostic assignRole</li>
            <li><code>unifiedTestAssignment()</code> - Test attribution rôles</li>
            <li><code>forceReload()</code> - Rechargement forcé</li>
            <li><code>emergencyClean()</code> - Nettoyage complet</li>
          </ul>
        </div>
      </div>
      
      {/* Message de bienvenue */}
      {isAuthenticated && user && (
        <div style={{
          backgroundColor: '#dbeafe',
          border: '2px solid #3b82f6',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#1e40af', marginTop: 0 }}>
            🎉 Bienvenue {user.displayName || user.email} !
          </h2>
          <p style={{ color: '#1e40af', margin: '10px 0' }}>
            L'application Synergia est maintenant stabilisée et fonctionnelle.
          </p>
        </div>
      )}
      
      {/* Si pas connecté */}
      {!loading && !isAuthenticated && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>
            🔐 Non connecté
          </h2>
          <p style={{ color: '#dc2626', margin: '10px 0' }}>
            Vous devez vous connecter pour accéder à l'application.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🚀 Se connecter
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
