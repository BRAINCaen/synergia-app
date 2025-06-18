// Navigation dynamique entre les sections principales
document.addEventListener("DOMContentLoaded", function () {
    // Gestion de la navigation (navbar)
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('href').replace('#', '');
            sections.forEach(section => {
                if (section.id === target) section.classList.add('active');
                else section.classList.remove('active');
            });
        });
    });

    // Gestion écran de chargement (loading screen)
    function hideLoadingScreen() {
        const loading = document.getElementById('loadingScreen');
        if (loading) loading.style.display = 'none';
    }
    // À la connexion Firebase, tu peux appeler hideLoadingScreen()
    // Ici on le masque après 1,2s pour démo, remplace par ton callback Firebase après init si besoin
    setTimeout(hideLoadingScreen, 1200);

    // Gestion notifications (info, succès, erreur)
    window.showNotification = function(text, type = "info") {
        const notif = document.createElement('div');
        notif.className = 'notification ' + type;
        notif.innerText = text;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3500);
    };

    // Scroll auto en bas du chat à l'arrivée d'un message (si besoin)
    const messagesArea = document.querySelector('.messages-area');
    if (messagesArea) {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    // Ajoute ici d’autres comportements JS spécifiques à ton app (boutique, analytics, etc.)
});
