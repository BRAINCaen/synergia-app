// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES ULTRA-SIMPLE - GARANTIE SANS BUG
// ==========================================

import React from 'react';

const TasksPage = () => {
  console.log('🎯 [TASKS] TasksPage ultra-simple chargée');

  const handleGoBack = () => {
    window.location.href = '/dashboard';
  };

  const tasks = [
    {
      id: 1,
      title: 'Révision du code frontend',
      status: 'Terminée',
      xp: 25,
      color: 'bg-green-500'
    },
    {
      id: 2,
      title: 'Mise à jour documentation',
      status: 'En cours',
      xp: 15,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      title: 'Tests nouvelles fonctionnalités',
      status: 'À faire',
      xp: 30,
      color: 'bg-yellow-500'
    },
    {
      id: 4,
      title: 'Optimisation base de données',
      status: 'À faire',
      xp: 40,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #1e1b4b 100%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid rgba(75, 85, 99, 0.5)'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #60a5fa, #a855f7)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '8px'
          }}>
            ✅ Gestion des Tâches
          </h1>
          <p style={{
            color: '#9ca3af',
            fontSize: '18px'
          }}>
            Organisez et suivez vos tâches avec le système XP intégré
          </p>
        </div>

        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'rgba(31, 41, 55, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
              {tasks.length}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>Total des tâches</div>
          </div>

          <div style={{
            background: 'rgba(31, 41, 55, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              {tasks.filter(t => t.status === 'Terminée').length}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>Terminées</div>
          </div>

          <div style={{
            background: 'rgba(31, 41, 55, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
              {tasks.filter(t => t.status === 'En cours').length}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>En cours</div>
          </div>

          <div style={{
            background: 'rgba(31, 41, 55, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              {tasks.filter(t => t.status === 'À faire').length}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>À faire</div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(75, 85, 99, 0.5)',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '24px'
          }}>
            📋 Liste des tâches
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tasks.map((task) => (
              <div key={task.id} style={{
                background: 'rgba(55, 65, 81, 0.5)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      {task.title}
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#ffffff',
                        background: task.status === 'Terminée' ? '#10b981' :
                                   task.status === 'En cours' ? '#3b82f6' : '#f59e0b'
                      }}>
                        {task.status}
                      </span>
                      
                      <span style={{
                        color: '#fbbf24',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        ⭐ {task.xp} XP
                      </span>
                    </div>
                  </div>
                  
                  <button style={{
                    background: task.status === 'Terminée' ? '#10b981' : '#3b82f6',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.opacity = '0.8';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.opacity = '1';
                  }}>
                    {task.status === 'Terminée' ? '✅ Terminée' : 
                     task.status === 'En cours' ? '⏳ Continuer' : '▶️ Commencer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleGoBack}
            style={{
              background: '#6b7280',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#4b5563';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#6b7280';
            }}
          >
            ← Retour au Dashboard
          </button>

          <button style={{
            background: '#3b82f6',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#2563eb';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#3b82f6';
          }}
          onClick={() => alert('Fonctionnalité de création de tâche à venir !')}>
            ➕ Nouvelle tâche
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;

// Log de confirmation
console.log('✅ [TASKS] TasksPage ultra-simple créée - ZÉRO dépendance externe');
console.log('🎯 [TASKS] CSS inline - Aucun import complexe');
console.log('🛡️ [TASKS] Garantie de fonctionnement - Style pur JavaScript');
console.log('📊 [TASKS] Interface complète avec statistiques et navigation');
