// ==========================================
// 📁 react-app/src/App.jsx
// 🚨 DIAGNOSTIC EXTRÊME - DÉTECTEUR DE PROBLÈMES ULTIME
// ==========================================

import React, { useEffect, useState, useCallback } from 'react';

console.log('🚨 DIAGNOSTIC EXTRÊME DÉMARRÉ');

// 🔍 DÉTECTEUR D'ERREURS GLOBAL
window.DIAGNOSTIC_ERRORS = [];
window.DIAGNOSTIC_LOGS = [];

const originalConsoleError = console.error;
console.error = (...args) => {
  window.DIAGNOSTIC_ERRORS.push({
    timestamp: new Date().toISOString(),
    message: args.join(' '),
    stack: new Error().stack
  });
  originalConsoleError(...args);
};

// 🔬 FONCTION DE TEST PROGRESSIVE
const DiagnosticApp = () => {
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    {
      name: '1. Test React de base',
      test: () => {
        try {
          const div = React.createElement('div', {}, 'React fonctionne');
          return { success: true, result: 'React OK' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: '2. Test Router import',
      test: async () => {
        try {
          const { BrowserRouter } = await import('react-router-dom');
          return { success: true, result: 'Router importé OK' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: '3. Test AuthStore import',
      test: async () => {
        try {
          const { useAuthStore } = await import('./shared/stores/authStore.js');
          return { success: true, result: 'AuthStore importé OK' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: '4. Test AuthStore hook',
      test: () => {
        try {
          const { useAuthStore } = require('./shared/stores/authStore.js');
          const store = useAuthStore.getState();
          return { success: true, result: `Store accessible: ${Object.keys(store).join(', ')}` };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: '5. Test Firebase',
      test: async () => {
        try {
          const firebase = await import('./core/firebase.js');
          return { success: true, result: 'Firebase module OK' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: '6. Test ProtectedRoute',
      test: async () => {
        try {
          const ProtectedRoute = await import('./routes/ProtectedRoute.jsx');
          return { success: true, result: 'ProtectedRoute OK' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: '7. Test DashboardLayout',
      test: async () => {
        try {
          const DashboardLayout = await import('./layouts/DashboardLayout.jsx');
          return { success: true, result: 'DashboardLayout OK' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: '8. Test Pages',
      test: async () => {
        try {
          const Dashboard = await import('./pages/Dashboard.jsx');
          const Login = await import('./pages/Login.jsx');
          return { success: true, result: 'Pages principales OK' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: '9. Test GameStore',
      test: async () => {
        try {
          const stores = await import('./shared/stores/index.js');
          return { success: true, result: 'Stores index OK' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    },
    {
      name: '10. Test Services',
      test: async () => {
        try {
          const taskService = await import('./core/services/taskService.js');
          const projectService = await import('./core/services/projectService.js');
          return { success: true, result: 'Services principaux OK' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    }
  ];

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (let i = 0; i < tests.length; i++) {
      setCurrentTest(i);
      const test = tests[i];
      
      console.log(`🧪 Test ${i + 1}: ${test.name}`);
      
      try {
        const result = await test.test();
        setTestResults(prev => [...prev, {
          name: test.name,
          ...result
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          success: false,
          error: error.message,
          stack: error.stack
        }]);
      }
      
      // Pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    console.log('🔬 DIAGNOSTIC TERMINÉ');
  }, []);

  useEffect(() => {
    // Auto-start tests après 1 seconde
    const timer = setTimeout(() => {
      runTests();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [runTests]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      color: '#00ff00',
      fontFamily: 'Monaco, monospace',
      padding: '20px',
      fontSize: '14px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          border: '2px solid #00ff00',
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#1a1a1a'
        }}>
          <h1 style={{ 
            margin: 0, 
            textAlign: 'center',
            textShadow: '0 0 10px #00ff00'
          }}>
            🚨 SYNERGIA DIAGNOSTIC EXTRÊME 🚨
          </h1>
          <p style={{ 
            textAlign: 'center', 
            margin: '10px 0 0 0',
            color: '#ffff00'
          }}>
            ANALYSE EN COURS... DÉTECTION DES ANOMALIES...
          </p>
        </div>

        {/* Tests en cours */}
        {isRunning && (
          <div style={{
            border: '1px solid #ffff00',
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#2a2a00'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffff00' }}>
              🔄 TEST EN COURS: {currentTest + 1}/{tests.length}
            </h3>
            <p style={{ margin: 0 }}>
              {tests[currentTest]?.name}
            </p>
            <div style={{
              width: '100%',
              height: '10px',
              backgroundColor: '#333',
              marginTop: '10px'
            }}>
              <div style={{
                width: `${((currentTest + 1) / tests.length) * 100}%`,
                height: '100%',
                backgroundColor: '#00ff00',
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
        )}

        {/* Résultats des tests */}
        <div style={{
          border: '1px solid #00ff00',
          backgroundColor: '#1a1a1a'
        }}>
          <h2 style={{
            margin: 0,
            padding: '15px',
            backgroundColor: '#00ff00',
            color: '#000',
            textAlign: 'center'
          }}>
            📊 RÉSULTATS DU DIAGNOSTIC
          </h2>
          
          <div style={{ padding: '20px' }}>
            {testResults.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#ffff00' }}>
                ⏳ Initialisation des tests...
              </p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} style={{
                  border: `1px solid ${result.success ? '#00ff00' : '#ff0000'}`,
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: result.success ? '#001a00' : '#1a0000'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: result.success ? '#00ff00' : '#ff0000',
                      fontWeight: 'bold'
                    }}>
                      {result.success ? '✅' : '❌'} {result.name}
                    </span>
                    <span style={{
                      color: result.success ? '#00ff00' : '#ff0000'
                    }}>
                      {result.success ? 'SUCCÈS' : 'ÉCHEC'}
                    </span>
                  </div>
                  
                  {result.result && (
                    <p style={{ 
                      margin: '5px 0 0 0', 
                      color: '#cccccc',
                      fontSize: '12px'
                    }}>
                      📋 {result.result}
                    </p>
                  )}
                  
                  {result.error && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ 
                        margin: '0 0 5px 0', 
                        color: '#ff6666',
                        fontWeight: 'bold'
                      }}>
                        🚨 ERREUR DÉTECTÉE:
                      </p>
                      <pre style={{
                        color: '#ff9999',
                        fontSize: '11px',
                        backgroundColor: '#2a0000',
                        padding: '5px',
                        borderRadius: '3px',
                        overflow: 'auto',
                        margin: 0
                      }}>
                        {result.error}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Erreurs globales */}
        {window.DIAGNOSTIC_ERRORS.length > 0 && (
          <div style={{
            border: '2px solid #ff0000',
            backgroundColor: '#1a0000',
            marginTop: '20px'
          }}>
            <h2 style={{
              margin: 0,
              padding: '15px',
              backgroundColor: '#ff0000',
              color: '#fff',
              textAlign: 'center'
            }}>
              🚨 ERREURS INTERCEPTÉES
            </h2>
            <div style={{ padding: '20px' }}>
              {window.DIAGNOSTIC_ERRORS.map((error, index) => (
                <div key={index} style={{
                  border: '1px solid #ff6666',
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: '#2a0000'
                }}>
                  <p style={{ 
                    margin: '0 0 5px 0', 
                    color: '#ff6666',
                    fontSize: '12px'
                  }}>
                    🕐 {error.timestamp}
                  </p>
                  <pre style={{
                    color: '#ff9999',
                    fontSize: '11px',
                    margin: 0,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {error.message}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <button
            onClick={runTests}
            disabled={isRunning}
            style={{
              padding: '15px 30px',
              backgroundColor: isRunning ? '#666' : '#00ff00',
              color: '#000',
              border: 'none',
              fontSize: '16px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {isRunning ? '🔄 DIAGNOSTIC EN COURS...' : '🔬 RELANCER DIAGNOSTIC'}
          </button>
          
          <button
            onClick={() => {
              console.clear();
              window.DIAGNOSTIC_ERRORS = [];
              setTestResults([]);
            }}
            style={{
              padding: '15px 30px',
              backgroundColor: '#ffff00',
              color: '#000',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🧹 NETTOYER CONSOLE
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticApp;
