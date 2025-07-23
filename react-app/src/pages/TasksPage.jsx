// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION UNIQUE IDENTIFIABLE - CORRECTION PAGE BLANCHE
// ==========================================

import React from 'react';

const TasksPage = () => {
  console.log('🚀 [TASKS] VERSION UNIQUE v3.5.3 - IDENTIFIABLE');
  console.log('🆔 [TASKS] ID: ULTRA-SIMPLE-PREMIUM-2024');

  const handleGoBack = () => {
    window.location.href = '/dashboard';
  };

  const tasks = [
    {
      id: 1,
      title: '🎮 Développer système gamification',
      description: 'Créer les composants XP, badges et récompenses',
      status: 'En cours',
      xp: 50,
      priority: 'Haute',
      category: 'Développement'
    },
    {
      id: 2,
      title: '📱 Optimiser interface mobile',
      description: 'Améliorer la responsive et les interactions tactiles',
      status: 'À faire',
      xp: 35,
      priority: 'Moyenne',
      category: 'Design'
    },
    {
      id: 3,
      title: '🔧 Corriger bugs de navigation',
      description: 'Résoudre les problèmes de routage entre pages',
      status: 'À faire',
      xp: 25,
      priority: 'Haute',
      category: 'Bug Fix'
    },
    {
      id: 4,
      title: '📊 Créer tableaux de bord analytics',
      description: 'Développer les graphiques et métriques temps réel',
      status: 'À faire',
      xp: 40,
      priority: 'Basse',
      category: 'Analytics'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terminée': return '#10b981';
      case 'En cours': return '#3b82f6';
      case 'À faire': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Haute': return '#ef4444';
      case 'Moyenne': return '#f59e0b';
      case 'Basse': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 25%, #7c3aed 50%, #581c87 75%, #0f172a 100%)',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Indicateur de version - VISIBLE */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#10b981',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        ✅ VERSION PREMIUM v3.5.3
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Header Premium */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.2)'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #60a5fa, #a855f7, #ec4899)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            ✅ Gestion Premium des Tâches
          </h1>
          <p style={{
            color: '#cbd5e1',
            fontSize: '20px',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            Interface premium avec système XP intégré - Synergia v3.5.3
          </p>
          
          {/* Actions Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <button style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
            }}
            onClick={() => alert('🚀 Création de tâche - Fonctionnalité en développement')}>
              ➕ Créer une nouvelle tâche
            </button>
            
            <button style={{
              background: 'rgba(55, 65, 81, 0.8)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onClick={() => alert('🔍 Filtres avancés - Fonctionnalité en développement')}>
              🔍 Filtres avancés
            </button>
          </div>
        </div>

        {/* Statistiques Premium */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {[
            { label: 'Total des tâches', value: tasks.length, icon: '📊', color: '#8b5cf6' },
            { label: 'Terminées', value: tasks.filter(t => t.status === 'Terminée').length, icon: '✅', color: '#10b981' },
            { label: 'En cours', value: tasks.filter(t => t.status === 'En cours').length, icon: '⏳', color: '#3b82f6' },
            { label: 'À faire', value: tasks.filter(t => t.status === 'À faire').length, icon: '📝', color: '#f59e0b' }
          ].map((stat, index) => (
            <div key={index} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '12px'
              }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: stat.color,
                marginBottom: '8px'
              }}>
                {stat.value}
              </div>
              <div style={{
                color: '#cbd5e1',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Liste des tâches Premium */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #60a5fa, #a855f7)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            📋 Mes Tâches Actives
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {tasks.map((task) => (
              <div key={task.id} style={{
                background: 'rgba(30, 41, 59, 0.8)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.2)';
              }}>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      {task.title}
                    </h3>
                    
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '16px',
                      marginBottom: '16px',
                      lineHeight: '1.5'
                    }}>
                      {task.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        padding: '6px 16px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        background: getStatusColor(task.status)
                      }}>
                        {task.status}
                      </span>
                      
                      <span style={{
                        padding: '6px 16px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        background: getPriorityColor(task.priority)
                      }}>
                        {task.priority}
                      </span>
                      
                      <span style={{
                        color: '#fbbf24',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        ⭐ {task.xp} XP
                      </span>
                      
                      <span style={{
                        color: '#a855f7',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        📂 {task.category}
                      </span>
                    </div>
                  </div>
                  
                  <button style={{
                    background: task.status === 'Terminée' ? 'linear-gradient(90deg, #10b981, #059669)' :
                               task.status === 'En cours' ? 'linear-gradient(90deg, #3b82f6, #2563eb)' :
                               'linear-gradient(90deg, #f59e0b, #d97706)',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    minWidth: '120px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                  onClick={() => alert(`🎯 Action sur: ${task.title}`)}>
                    {task.status === 'Terminée' ? '✅ Terminée' : 
                     task.status === 'En cours' ? '⏳ Continuer' : '▶️ Commencer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions finales */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleGoBack}
            style={{
              background: 'rgba(55, 65, 81, 0.8)',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '12px',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(75, 85, 99, 0.9)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(55, 65, 81, 0.8)';
            }}
          >
            ← Retour au Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;

// Log de confirmation UNIQUE
console.log('🆔 [TASKS] VERSION PREMIUM IDENTIFIABLE v3.5.3');
console.log('✅ [TASKS] Interface premium avec données réalistes');
console.log('🎨 [TASKS] Design glassmorphism + gradients');
console.log('📊 [TASKS] Statistiques dynamiques + interactions');
