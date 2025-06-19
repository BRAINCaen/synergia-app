// Enregistrement du service worker
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW enregistré avec succès:', registration.scope);
          
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                if (confirm('Une nouvelle version de l\'application est disponible. Voulez-vous la charger ?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.log('Échec d\'enregistrement du SW:', error);
        });
    });
  }
};

// Gestion de l'installation PWA
export const setupPWAInstall = () => {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Empêche l'affichage automatique
    e.preventDefault();
    deferredPrompt = e;
    
    // Affiche un bouton d'installation personnalisé
    showInstallButton(deferredPrompt);
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA installée avec succès');
    deferredPrompt = null;
  });
};

const showInstallButton = (deferredPrompt) => {
  // Crée un bouton d'installation si ce n'est pas déjà fait
  if (!document.getElementById('install-button')) {
    const installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.textContent = '📱 Installer l\'app';
    installButton.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50';
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Installation ${outcome}`);
        deferredPrompt = null;
        installButton.remove();
      }
    });
    
    document.body.appendChild(installButton);
    
    // Cache le bouton après 10 secondes
    setTimeout(() => {
      if (installButton.parentNode) {
        installButton.style.opacity = '0.7';
      }
    }, 10000);
  }
};
